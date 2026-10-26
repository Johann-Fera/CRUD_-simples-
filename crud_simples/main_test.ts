import { assertArrayIncludes, assertEquals, assertExists, assertObjectMatch, assert } from "@std/assert";
import { connectdb, disconnectFromMongoDB } from "./repository.ts";
import { app, auth, nomeChecker, qtdChecker } from "./app.ts";
import { Response } from 'express';
import responser from "responser";

const token = Deno.env.get("API_token");
let server : ReturnType<typeof app.listen>;

Deno.test.beforeAll(() => {
  server = app.listen(3000);
  connectdb();
});

Deno.test.afterAll(() => {
  server.close();
  disconnectFromMongoDB();
});

// testes (0,6,3)

// integração

Deno.test("retorna lista de comida do banco e ve se contém essa comida ae", async () => {
  //seria isso padrão agx? nun tem body,param ou query, mas ainda sim, é um teste para um "findAll"
  const res:Response = await fetch(`http://localhost:3000/`);
  const dados = await res.json();
  assertArrayIncludes(dados.data, [
    {_id: '6ad90bebda33e814679b68f2', nome: "comida", quantidade: 0, validade: true}
  ], "deu ruim, sumiu a comida, ou a lista não veio");
  assertEquals(dados.code, 200, "não ta retornando o código correto");
})


Deno.test("adiciona comida e ve se ela ta na collection pelo id", async () => {
  const res:Response = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({nome: "comida", quantidade: 1}), 
  });
  const dados = await res.json();
  assertExists(dados.data, "deu ruim, não veio _id");
  assertEquals(dados.code, 201, "não ta retornando o código correto");

  const res2:Response = await fetch(`http://localhost:3000/?_id=${dados.data}`);
  const dados2 = await res2.json();
  assertEquals(dados2.data, [{_id:dados.data, nome: "comida", quantidade: 1, validade: true}], "deu ruim, não tem a comida que coloquei");
  assertEquals(dados2.code, 200, "não ta retornando o código correto");
});

Deno.test("atualiza a quantidade de abacates para a quantidade de comidas na collection", async () => {
  const id_abacate:string = '6ad64dc419c66bb9a853ebc8';
  const res:Response = await fetch(`http://localhost:3000/`);
  const dados = await res.json();
  const tamanho:number = dados.data.length;

  const res2:Response = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({nome: "abacate", quantidade: tamanho}), 
  });
  const dados2 = await res2.json();
  assertEquals(dados2.data, {_id: id_abacate, nome: "abacate", quantidade: tamanho}, "deu ruim, o abacate não atualizou");
  assertEquals(dados2.code, 200, "não ta retornando o código correto");
})

Deno.test("deleta a comida que foi criada no teste POST", async () => {
  const res:Response = await fetch(`http://localhost:3000/comida?nome=comida&qtd=1`,{
    method: "DELETE",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
  });
  assertEquals(res.status, 204, "não ta retornando o código correto");

  const res2:Response = await fetch(`http://localhost:3000/`);
  const dados2 = await res2.json();
  assert(!dados2.data.includes({nome: "comida", quantidade: 1}), "a comida não foi deletada");
  assertEquals(dados2.code, 200, "não ta retornando o código correto");
})

Deno.test("transferir quantidade de banana para banana fora da validade", async () => {
  const id_banana:string = '6ad24d308a63f62d336c6c5c';
  const id_bananaFV:string = '6ad8bacaf600cfb744a03c2e';

  const _prep:Response = await fetch(`http://localhost:3000/comida/${id_banana}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({quantidade: 5}), 
  });

  const _prep2:Response = await fetch(`http://localhost:3000/comida/${id_bananaFV}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({quantidade: 0}), 
  });

  const res:Response = await fetch(`http://localhost:3000/comida/expirou`,{
    method: "POST",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({id_dv:id_banana, id_fv:id_bananaFV, quantidade:2}), 
  });
  const dados = await res.json();
  assertEquals(dados.message,"transferencia feita", "a transação não ocorreu");
  assertEquals(dados.code, 202, "não ta retornando o código correto");

  const res2:Response = await fetch(`http://localhost:3000/?nome=banana`);
  const dados2 = await res2.json();
  assertArrayIncludes(dados2.data, [
    {_id: id_banana, nome: "banana", quantidade: 3, validade: true}, 
    {_id: id_bananaFV, nome: "banana", quantidade: 2, validade: false}
  ], "deu ruim, as bananas não vieram ou a transação não foi feita corretamente");
  assertEquals(dados2.code, 200, "não ta retornando o código correto");

})

Deno.test("métodos no endpoint errado", async () => {
  const res:Response = await fetch(`http://localhost:3000/comida`);
  const dados = await res.json();
  assertEquals(dados.message,"não tem esse metodo para esse endpoint", "não era para ter get na /comida ");
  assertEquals(dados.code, 405, "não ta retornando o código correto");

  const res2:Response = await fetch(`http://localhost:3000/`,{
    method: "POST",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
  });
  const dados2 = await res2.json();
  assertEquals(dados2.message,"não tem esse metodo para esse endpoint", "não era para ter POS na / ");
  assertEquals(dados2.code, 405, "não ta retornando o código correto");

  const res3:Response = await fetch(`http://localhost:3000/`,{
    method: "PUT",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({nome: "comida", quantidade: 10}), 
  });
  const dados3 = await res3.json();
  assertEquals(dados3.message,"não tem esse metodo para esse endpoint", "não era para ter put na / ");
  assertEquals(dados3.code, 405, "não ta retornando o código correto");

  const res4:Response = await fetch(`http://localhost:3000/?nome=comida&qtd=1`,{
    method: "DELETE",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
  });
  const dados4 = await res4.json();
  assertEquals(dados4.message,"não tem esse metodo para esse endpoint", "não era para ter delete na / ");
  assertEquals(dados4.code, 405, "não ta retornando o código correto");
})

// unitario

let nextCalled = false;
const next = () => { nextCalled = true; };

const req_proResponser = {};
const next_proResponser = () => {} ;
function mockRes() {
  const res: any = {
    statusCode: 0,
    body: null,
    status(code: number) { this.statusCode = code; return this; },
    json(body: any) { this.body = body; return this; },
  };

  (responser as any).default( req_proResponser, res, next_proResponser );
  return res;
}
const resResponser = mockRes();

Deno.test("dados invalidos no nomeChecker", () => {
  nextCalled = false;
  const req = {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: {nome: " ", quantidade: 10}, 
  };
  nomeChecker(req, resResponser, next);
  assertEquals(resResponser.body.message, "nome inválido", "ta passando nome vazio");
  assertEquals(resResponser.body.code, 422, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");

  const req2 = {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: {nome: 10, quantidade: 10}, 
  };
  nomeChecker(req2, resResponser, next);
  assertEquals(resResponser.body.message, "nome inválido", "ta passando nome sem ser string");
  assertEquals(resResponser.body.code, 422, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");
})

Deno.test("dados invalidos no qtdChecker", () => {
  nextCalled = false;
  const req = {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: {nome: "abacate ruim", quantidade: -1}, 
  };
  qtdChecker(req, resResponser, next);
  assertEquals(resResponser.body.message, "quantidade inválida", "ta pasando quantidade negativa");
  assertEquals(resResponser.body.code, 422, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");

  const req2 = {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: {nome: "abacate ruim", quantidade: "bruh"}, 
  };
  qtdChecker(req2, resResponser, next);
  assertEquals(resResponser.body.message, "quantidade inválida", "ta passando quantidade sem ser numero");
  assertEquals(resResponser.body.code, 422, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");
})

Deno.test("testes de autenticação e token", () => {
  nextCalled = false;
  const req = { headers: {} };
  auth(req, resResponser, next);
  assertEquals(resResponser.body.message, "autorização inválida", "passou header vazio");
  assertArrayIncludes(resResponser.body.errors, [ { field: "header", message: "header não fornecido" } ], "não passou pelo motivo errado");
  assertEquals(resResponser.body.code, 401, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");

  const req2 = { headers: { authorization: `${token}` } };
  auth(req2, resResponser, next);
  assertEquals(resResponser.body.message, "autorização inválida", "passou token sem Bearer");
  assertArrayIncludes(resResponser.body.errors, [ { field: "header", message: "header deve incluir o Bearer" } ], "não passou pelo motivo errado");
  assertEquals(resResponser.body.code, 401, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");

  const req3 = { headers: { authorization: "Bearer abc" } };
  auth(req3, resResponser, next);
  assertEquals(resResponser.body.message, "Token inválido ou expirado", "passou token nada ave")
  assertEquals(resResponser.body.code, 401, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");
})


/*
- deletar o que não tem - int
- update o que não tem - int
- get o que não tem - int (precisa de teste pra isso ?)
- get com campo a mais - uni
- post com campo a mais - uni
- put com campo a mais no update - uni
- put com campo a mais no filter - uni
- delete com campo a mais - uni
- post com campo a menos - uni
- put com campo a menos no update - uni
- put com campo a menos no filter - uni
- colocar id no body do post e do update - uni
- query vazio pra delete - uni
- id de o que não tem na transferencia (ambos os lados) - int
- quantidade tranferencia maior que qtd normal - int
*/

/* TESTES AGX
- teste sempre co controller envolvido
- usando um request (body,params,request) ver retorno
- pelo menos 1 teste para cada rota
*/