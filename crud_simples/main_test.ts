import { assertArrayIncludes, assertEquals, assertExists, assertObjectMatch, assert } from "@std/assert";
import { Comida } from "./interfaces.ts";
import { connectdb, disconnectFromMongoDB } from "./repository.ts";
import { app, auth, nomeChecker, qtdChecker } from "./app.ts";
import { NextFunction, Request, Response } from 'express';

const token = Deno.env.get("API_token");
let server : ReturnType<typeof app.listen>;

Deno.test.beforeAll(async () => {
  server = app.listen(3000);
  connectdb();
});

Deno.test.afterAll(async () => {
  server.close();
  disconnectFromMongoDB();
});

// testes (0,8,0)

// integração

Deno.test("retorna lista de comida do banco e ve se contém a banana e essa outra comida ae", async () => {
  //seria isso padrão agx? nun tem body,param ou query, mas ainda sim, é um teste para um "findAll"
  const res:Response = await fetch(`http://localhost:3000/`);
  const dados:Comida[] = await res.json();
  assertArrayIncludes(dados, [
    {_id: '6ad24d308a63f62d336c6c5c', nome: "banana", quantidade: 5, validade: true}, 
    {_id: '6ad90bebda33e814679b68f2', nome: "comida", quantidade: 0, validade: true}
  ], "deu ruim, sumiu a banana, ou sumiu a comida, ou a lista não veio");
})

Deno.test("adiciona comida e ve se ela ta na collection pelo id", async () => {
  const res:Response = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({nome: "comida", quantidade: 1}), 
  });
  const dado:string = await res.json();
  assertExists(dado, "deu ruim, não veio _id");
  const res2:Response = await fetch(`http://localhost:3000/?_id=${dado}`);
  const dados:Comida[] = await res2.json();
  assertEquals(dados, [{_id:dado, nome: "comida", quantidade: 1, validade: true}], "deu ruim, não tem a comida que coloquei");
});

Deno.test("atualiza a quantidade de abacates para a quantidade de comidas na collection", async () => {
  const res:Response = await fetch(`http://localhost:3000/`);
  const data:Comida[] = await res.json();
  const tamanho:number = data.length;
  const id_abacate:string = '6ad64dc419c66bb9a853ebc8';
  const res2:Response = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({nome: "abacate", quantidade: tamanho}), 
  });
  const dado:Comida = await res2.json();
  assertEquals(dado, {_id: id_abacate, nome: "abacate", quantidade: tamanho}, "deu ruim, o abacate não atualizou");
})

Deno.test("deleta a comida que foi criada no teste POST", async () => {
  const res:Response = await fetch(`http://localhost:3000/comida?nome=comida&qtd=1`,{
    method: "DELETE",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
  });
  const dado:JSON = await res.json();
  assertObjectMatch(dado, {acknowledged: true}, "o mongo ou o server não respondeu");
  const res2:Response = await fetch(`http://localhost:3000/`);
  const dados:Comida[] = await res2.json();
  assert(!dados.includes({nome: "comida", quantidade: 1}), "a comida não foi deletada");
})


Deno.test("transferir quantidade de banana para banana fora da validade", async () => {
  const id_banana:string = '6ad24d308a63f62d336c6c5c';
  const id_bananaFV:string = '6ad8bacaf600cfb744a03c2e';

  const res:Response = await fetch(`http://localhost:3000/comida/expirou`,{
    method: "POST",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({id_dv:id_banana, id_fv:id_bananaFV, qtd:2}), 
  });
  const txt:string = await res.text();
  assertEquals(txt,"transação feita", "a transação não ocorreu");

  const res2:Response = await fetch(`http://localhost:3000/?nome=banana`);
  const dados:Comida[] = await res2.json();
  assertArrayIncludes(dados, [
    {_id: id_banana, nome: "banana", quantidade: 3, validade: true}, 
    {_id: id_bananaFV, nome: "banana", quantidade: 2, validade: false}
  ], "deu ruim, as bananas não vieram ou a transação não foi feita corretamente");

  const res3:Response = await fetch(`http://localhost:3000/comida/${id_banana}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({quantidade: 5, msg:"aqui eu"}), 
  });
  const dado:Comida = await res3.json();
  assertEquals(dado, {_id: id_banana, nome: "banana", quantidade: 5, validade: true}, "deu ruim, a banana não atualizou");

  const res4:Response = await fetch(`http://localhost:3000/comida/${id_bananaFV}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({quantidade: 0}), 
  });
  const dado2:Comida = await res4.json();
  assertEquals(dado2, {_id: id_bananaFV, nome: "banana", quantidade: 0, validade: false}, "deu ruim, a banana não atualizou");

})

Deno.test("métodos no endpoint errado", async () => {
  const res:Response = await fetch(`http://localhost:3000/comida/10`);
  const txt:string = await res.text();
  assertEquals(txt,"não tem esse metodo para esse endpoint", "não era para ter get na /comida/10 ");

  const res2:Response = await fetch(`http://localhost:3000/`,{
    method: "POST",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
  });
  const txt2:string = await res2.text();
  assertEquals(txt2,"não tem esse metodo para esse endpoint", "não era para ter POS na / ");

  const res3:Response = await fetch(`http://localhost:3000/`,{
    method: "PUT",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
    body: JSON.stringify({nome: "comida", quantidade: 10}), 
  });
  const txt3:string = await res3.text();
  assertEquals(txt3,"não tem esse metodo para esse endpoint", "não era para ter put na / ");

  const res4:Response = await fetch(`http://localhost:3000/?nome=comida&qtd=1`,{
    method: "DELETE",
    headers: {"Content-Type": "application/json", "authorization": `Bearer ${token}`},
  });
  const txt4:string = await res4.text();
  assertEquals(txt4,"não tem esse metodo para esse endpoint", "não era para ter delete na / ");
})

// transformar esses em unitarios

let res: any = {
  statusCode: 0,
  body: null,
  status(code: number) { this.statusCode = code; return this; },
  json(body: any) { this.body = body; return this; },
};
let nextCalled = false;
const next = () => { nextCalled = true; };

Deno.test("dados invalidos no nomeChecker", async () => {

  const req: any = {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: " ", quantidade: 10}), 
  };
  nomeChecker(req, res, next);
  console.log(res.statusCode);
  assertEquals(res.body, { error: "nome inválido" }, "ta passando nome vazio");
  assertEquals(res.statusCode, 422);

  const req2: any = {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: 10, quantidade: 10}), 
  };
  nomeChecker(req2, res, next);
  assertEquals(res.body, { error: "nome inválido" }, "ta passando nome sem ser string");
  assertEquals(res.statusCode, 422);
  
})
/*
const res2:Response = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "abacate ruim", quantidade: -1}), 
  });
  const txt2:string = await res2.text();
  assertEquals(txt2,"quantidade inválida", "ta pasando quantidade negativa");

  const res3:Response = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "abacate ruim", quantidade: "bruh"}), 
  });
  const txt3:string = await res3.text();
  assertEquals(txt3,"quantidade inválida", "ta passando quantidade sem ser numero");
*/
Deno.test("autenticação sem token", async () => {
  const req: any = { headers: {} };

  auth(req, res, next);

  assertEquals(res.statusCode, 401)
  assertEquals(res.body, { error: "Token não fornecido" })
})

Deno.test("autenticação com token, porém sem bearer", async () => {
  const req: any = { headers: { authorization: `${token}` } };

  auth(req, res, next);

  assertEquals(res.statusCode, 401)
  assertEquals(res.body, { error: "cade o Bearer" })
})

Deno.test("autenticação com token errado", async () => {
  const req: any = { headers: { authorization: "Bearer abc" } };

  auth(req, res, next);

  assertEquals(res.statusCode, 403)
  assertEquals(res.body, { error: "Token inválido ou expirado" })
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
*/

/* TESTES AGX
- teste sempre co controller envolvido
- usando um request (body,params,request) ver retorno
- pelo menos 1 teste para cada rota
*/