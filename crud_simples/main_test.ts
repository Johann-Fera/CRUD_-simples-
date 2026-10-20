import { assertArrayIncludes, assertEquals, assertExists, assertObjectMatch, assert } from "@std/assert";
import { request } from "asset:///node/undici/api.d.ts";

// E2E

Deno.test("retorna lista de comida do banco e ve se contém a banana e essa outra comida ae", async () => {
  //seria isso padrão agx? nun tem body,param ou query, mas ainda sim, é um teste para um findAll
  const res = await fetch(`http://localhost:3000/`);
  const data = await res.json();
  assertArrayIncludes(data, [
    {_id: '6ad24d308a63f62d336c6c5c', nome: "banana", quantidade: 5}, 
    {_id: '6ad64eab19c66bb9a853ebca', nome: "comida", quantidade: 0}
  ], "deu ruim, sumiu a banana, ou sumiu a comida, ou a lista não veio");
})

Deno.test("adiciona comida e ve se ela ta na collection pelo id", async () => {
  const res = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "comida", quantidade: 1}), 
  });
  const data = await res.json();
  assertExists(data, "deu ruim, não veio _id");
  const res2 = await fetch(`http://localhost:3000/?_id=${data}`);
  const data2 = await res2.json();
  assertEquals(data2, [{_id:data, nome: "comida", quantidade: 1}], "deu ruim, não tem a comida que coloquei");
});

Deno.test("retorna uma lista com apenas comidas com nome comida", async () => {
  const res = await fetch(`http://localhost:3000/?nome=comida`);
  const data = await res.json();
  assertArrayIncludes(data, [
    {_id: '6ad64eab19c66bb9a853ebca', nome: "comida", quantidade: 0}
  ], "deu ruim, sumiu a comida, ou a lista não veio");
})

Deno.test("atualiza a quantidade de abacates para a quantidade de comidas na collection", async () => {
  const res = await fetch(`http://localhost:3000/`);
  const data = await res.json();
  const tamanho = data.length;
  const id_abacate = '6ad64dc419c66bb9a853ebc8';
  const res2 = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "abacate", quantidade: tamanho}), 
  });
  const data2 = await res2.json();
  assertEquals(data2, {_id: id_abacate, nome: "abacate", quantidade: tamanho}, "deu ruim, o abacate não atualizou");
})

Deno.test("deleta a comida que foi criada no teste POST", async () => {
  const res = await fetch(`http://localhost:3000/comida?nome=comida&qtd=1`,{
    method: "DELETE",
  });
  const data = await res.json();
  assertObjectMatch(data, {acknowledged: true}, "o mongo ou o server não respondeu");
  const res2 = await fetch(`http://localhost:3000/`);
  const data2 = await res2.json();
  assert(!data2.includes({nome: "comida", quantidade: 1}), "a comida não foi deletada");
})

// integração

Deno.test("métodos no endpoint errado", async () => {
  const res = await fetch(`http://localhost:3000/comida/10`);
  const data = await res.text();
  assertEquals(data,"não tem esse metodo para esse endpoint", "não era para ter get na /comida/10 ");

  const res2 = await fetch(`http://localhost:3000/`,{
    method: "POST",
  });
  const data2 = await res2.text();
  assertEquals(data2,"não tem esse metodo para esse endpoint", "não era para ter POS na / ");

  const res3 = await fetch(`http://localhost:3000/`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "comida", quantidade: 10}), 
  });
  const data3 = await res3.text();
  assertEquals(data3,"não tem esse metodo para esse endpoint", "não era para ter put na / ");

  const res4 = await fetch(`http://localhost:3000/?nome=comida&qtd=1`,{
    method: "DELETE",
  });
  const data4 = await res4.text();
  assertEquals(data4,"não tem esse metodo para esse endpoint", "não era para ter delete na / ");
})

Deno.test("update com dados invalidos", async () => {
  const id_abacate = '6ad64dc419c66bb9a853ebc8';
  const res = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: " ", quantidade: 10}), 
  });
  const data = await res.text();
  assertEquals(data,"nome inválido", "ta passando nome vazio");

  const res2 = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "abacate ruim", quantidade: -1}), 
  });
  const data2 = await res2.text();
  assertEquals(data2,"quantidade inválida", "ta pasando quantidade negativa");

  const res3 = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "abacate ruim", quantidade: "bruh"}), 
  });
  const data3 = await res3.text();
  assertEquals(data3,"quantidade inválida", "ta passando quantidade sem ser numero");

  const res4 = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: 10, quantidade: 10}), 
  });
  const data4 = await res4.text();
  assertEquals(data4,"nome inválido", "ta passando nome sem ser string");
})

Deno.test("post com dados invalidos", async () => {
  const res = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: " ", quantidade: 1}), 
  });
  const data = await res.text();
  assertEquals(data,"nome inválido", "ta passando nome vazio");

  const res2 = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "comida", quantidade: -1}), 
  });
  const data2 = await res2.text();
  assertEquals(data2,"quantidade inválida", "ta pasando quantidade negativa");

  const res3 = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "comida", quantidade: "bruh"}), 
  });
  const data3 = await res3.text();
  assertEquals(data3,"quantidade inválida", "ta passando quantidade sem ser numero");

  const res4 = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: 10, quantidade: 10}), 
  });
  const data4 = await res4.text();
  assertEquals(data4,"nome inválido", "ta passando nome sem ser string");
})



/*
- deletar o que não tem - e2e
- update o que não tem - e2e
- get o que não tem - e2e (precisa de teste pra isso ?)
- get com campo a mais - int
- post com campo a mais - int
- put com campo a mais no update - int
- put com campo a mais no filter - int
- delete com campo a mais - int 
- post com campo a menos - int
- put com campo a menos no update - int
- put com campo a menos no filter - int
- colocar id no body do post e do update - int
*/

// meta de testes atual e2e, int, uni = (4,4,0)

// nun da para fazer teste unitario não, não pelo menos enquanto o controller é obrigatório
// o controller serve pra request, se eu usar ele vira integração

/* TESTES AGX
- teste sempre co controller envolvido
- usando um request (body,params,request) ver retorno
- pelo menos 1 teste para cada rota
*/