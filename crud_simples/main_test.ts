import { assertArrayIncludes, assertEquals, assert, assertExists, assertThrows } from "@std/assert";
import { connectdb, disconnectFromMongoDB } from "./repository.ts";
import { app, auth, nomeChecker, qtdChecker, autoADM, valChecker } from "./app.ts";
import { Response } from 'express';
import responser from "responser";
import { IThrowlhos } from "throwlhos";

const token = Deno.env.get("API_token");
//const token2 = Deno.env.get("noRole_token");
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
    {_id: '6ae0aa2a35d1b95dc4f299b3', nome: "comida", quantidade: 0, validade: true}
  ], "deu ruim, sumiu a comida, ou a lista não veio");
  assertEquals(dados.code, 200, "não ta retornando o código correto");
})

Deno.test("adiciona comida e ve se ela ta na collection pelo id depois apaga e ve denovo", async () => {
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

  const res3:Response = await fetch(`http://localhost:3000/comida?_id=${dados.data}&nome=comida&quantidade=1&validade=true`,{
    method: "DELETE",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
  });
  assertEquals(res3.status, 204, "não ta retornando o código correto");

  const res4:Response = await fetch(`http://localhost:3000/`);
  const dados4 = await res4.json();
  assert(!dados4.data.includes({nome: "comida", quantidade: 1}), "a comida não foi deletada");
  assertEquals(dados4.code, 200, "não ta retornando o código correto");
});

Deno.test("atualiza a quantidade de abacates para a quantidade de comidas na collection", async () => {
  const id_abacate:string = '6ae0ab01cf1a525cc411e8b4';
  const res:Response = await fetch(`http://localhost:3000/`);
  const dados = await res.json();
  const tamanho:number = dados.data.length;

  const res2:Response = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({nome: "abacate", quantidade: tamanho}), 
  });
  const dados2 = await res2.json();
  assertEquals(dados2.data, {_id: id_abacate, nome: "abacate", quantidade: tamanho, validade: true}, "deu ruim, o abacate não atualizou");
  assertEquals(dados2.code, 200, "não ta retornando o código correto");
})

Deno.test("transferir quantidade de banana para banana fora da validade", async () => {
  const id_banana:string = '6ae0ab4278df6bcd4ed97b17';
  const id_bananaFV:string = '6ae0ab4fc07ff03bcc5edf7e';

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

Deno.test("GET usando todo o filtro", async () => {
  const res:Response = await fetch(`http://localhost:3000/?nome=comida&quantidade=0&validade=true&_id=6ae0aa2a35d1b95dc4f299b3`);
  const dados = await res.json();
  assertArrayIncludes(dados.data, [
    {_id: '6ae0aa2a35d1b95dc4f299b3', nome: "comida", quantidade: 0, validade: true}
  ], "deu ruim, filtro cheio ta dando errado");
  assertEquals(dados.code, 200, "não ta retornando o código correto");
})

Deno.test("métodos no endpoint errado", async () => {
  const res:Response = await fetch(`http://localhost:3000/comida`);
  const dados = await res.json();
  assertEquals(dados.errors.message,"não tem esse metodo para esse endpoint", "não era para ter get na /comida ");
  assertEquals(dados.code, 405, "não ta retornando o código correto");
})

Deno.test("erros de transferência", async () => {
  const id_banana:string = '6ae0ab4278df6bcd4ed97b17';
  const id_bananaFV:string = '6ae0ab4fc07ff03bcc5edf7e';
  //transferir mais do que o valido tem, para o expirado
  const res:Response = await fetch(`http://localhost:3000/comida/expirou`,{
    method: "POST",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({id_dv:id_banana, id_fv:id_bananaFV, quantidade:200}), 
  });
  const dados = await res.json();
  assertEquals(dados.errors.message,"não é possivel transferir mais do que tem", "transferindo mais do que o valido tem");
  assertEquals(dados.code, 409, "não ta retornando o código correto");
  //transferencia "sem" id_dv
  const res2:Response = await fetch(`http://localhost:3000/comida/expirou`,{
    method: "POST",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({id_dv:'6ae0ab4278df6bcd4ed97b18', id_fv:id_bananaFV, quantidade:2}), 
  });
  const dados2 = await res2.json();
  assertEquals(dados2.errors.message,"não encontrou comida dentro da validade com esse id", "transferindo sem id_dv");
  assertEquals(dados2.code, 404, "não ta retornando o código correto");
  //transferencia "sem" id_fv
  const res3:Response = await fetch(`http://localhost:3000/comida/expirou`,{
    method: "POST",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({id_dv:id_banana, id_fv:'6ae0ab4fc07ff03bcc5edf7f', quantidade:2}), 
  });
  const dados3 = await res3.json();
  assertEquals(dados3.errors.message,"não encontrou comida fora da validade com esse id", "transferindo sem id_fv");
  assertEquals(dados3.code, 404, "não ta retornando o código correto");
  //transferencia com ids validos mais de comidas diferentes
  const res4:Response = await fetch(`http://localhost:3000/comida/expirou`,{
    method: "POST",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({id_dv:"6ae0ab01cf1a525cc411e8b4", id_fv:id_bananaFV, quantidade:2}), 
  });
  const dados4 = await res4.json();
  assertEquals(dados4.errors.message,"os nomes devem ser iguais", "transferindo em comidas diferentes");
  assertEquals(dados4.code, 422, "não ta retornando o código correto");
})

Deno.test("DELETE de filtro vazio", async () => {
  const res:Response = await fetch(`http://localhost:3000/comida`,{
    method: "DELETE",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
  });
  const dados = await res.json();
  assertEquals(dados.errors.message,"filtro vazio em delete", "erro pelo motivo errado");
  assertEquals(dados.code, 400, "não ta retornando o código correto");
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

  (responser).default( req_proResponser, res, next_proResponser );
  return res;
}
const resResponser = mockRes();

Deno.test("dados invalidos no nomeChecker", () => {
  console.log("unitarios");
  nextCalled = false;
  const req = {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: {nome: "  ", quantidade: 10}, 
  };
  const err = assertThrows(() => nomeChecker(req, resResponser, next), "ta passando nome vazio") as IThrowlhos;
  assertEquals(err.message, "nome inválido", "mensagem errada");
  assertArrayIncludes(err.errors, [ { field: "nome", message: "o nome não deve ser vazio", } ], "não passou pelo motivo errado");
  assertEquals(err.code, 422, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");

  const req2 = {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: {nome: 10, quantidade: 10}, 
  };
  const err2 = assertThrows(() => nomeChecker(req2, resResponser, next), "ta passando nome sem ser string") as IThrowlhos;
  assertEquals(err2.message, "nome deve ser string", "mensagem errada");
  assertEquals(err2.code, 422, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");
})

Deno.test("dados invalidos no qtdChecker", () => {
  nextCalled = false;
  const req = {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: {nome: "abacate ruim", quantidade: -1}, 
  };
  const err = assertThrows(() => qtdChecker(req, resResponser, next), "ta pasando quantidade negativa") as IThrowlhos;
  assertEquals(err.message, "quantidade inválida", "mensagem errada");
  assertArrayIncludes(err.errors, [ { field: "quantidade", message: "a quantidade não deve ser negativa" } ], "não passou pelo motivo errado");
  assertEquals(err.code, 422, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");

  const req2 = {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: {nome: "abacate ruim", quantidade: "bruh"}, 
  };
  const err2 = assertThrows(() => qtdChecker(req2, resResponser, next), "ta passando quantidade sem ser numero") as IThrowlhos;
  assertEquals(err2.message, "quantidade deve ser number", "mensagem errada");
  assertEquals(err2.code, 422, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");
})

Deno.test("testes de autenticação e token", () => {
  nextCalled = false;
  const req = { headers: {} };
  const err = assertThrows(() => auth(req, resResponser, next), "passou header vazio") as IThrowlhos;
  assertEquals(err.message, "autorização inválida", "mensagem errada");
  assertArrayIncludes(err.errors, [ { field: "header", message: "header não fornecido" } ], "não passou pelo motivo errado");
  assertEquals(err.code, 401, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");
  
  const req2 = { headers: { authorization: `${token}` } };
  const err2 = assertThrows(() => auth(req2, resResponser, next), "passou token sem Bearer") as IThrowlhos;
  assertEquals(err2.message, "autorização inválida", "mensagem errada");
  assertArrayIncludes(err2.errors, [ { field: "header", message: "header deve incluir o Bearer" } ], "não passou pelo motivo errado");
  assertEquals(err2.code, 401, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");

  const req3 = { headers: { authorization: "Bearer abc" } };
  const err3 = assertThrows(() => auth(req3, resResponser, next), "passou token nada ave") as IThrowlhos;
  assertEquals(err3.message, "Token inválido ou expirado", "mensagem errada")
  assertEquals(err3.code, 401, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");
})

Deno.test("testes de autorização", () => {
  nextCalled = false;
  const req = { auto: {} };
  const err = assertThrows(() => autoADM(req, resResponser, next), "passou header com auto vazio") as IThrowlhos;
  assertEquals(err.message, "Sem permissão", "mensagem errada");
  assertEquals(err.code, 403, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");

  const req2 = { auto: { role: "no one"} };
  const err2 = assertThrows(() => autoADM(req2, resResponser, next), "passou sem ter role ADM") as IThrowlhos;
  assertEquals(err2.message, "Sem a permissão", "mensagem errada");
  assertEquals(err2.code, 403, "não ta retornando o código correto");
  assertEquals(nextCalled, false, "next foi chamado");
})

Deno.test("testes de validade", () => {
  nextCalled = false;
  const req = {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: {validade: "brah"}, 
  };
  const err = assertThrows(() => valChecker(req, resResponser, next), "passou validade não boolean") as IThrowlhos;
  assertEquals(err.message, "validade deve ser boolean", "mensagem errada");
  assertEquals(err.code, 422, "não ta retornando o código correto");
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
- testes para erros em metodos do mongoose - int
- testar erros do error handler - int
- teste que passa pela auth mas é barrado na auto - int
*/

/* TESTES AGX
- teste sempre co controller envolvido
- usando um request (body,params,request) ver retorno
- pelo menos 1 teste para cada rota
*/