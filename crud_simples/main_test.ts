import { assertArrayIncludes, assertEquals, assertExists, assertObjectMatch, assert } from "@std/assert";
import { request } from "asset:///node/undici/api.d.ts";
import { Comida } from "./interfaces.ts";

// E2E

Deno.test("retorna lista de comida do banco e ve se contém a banana e essa outra comida ae", async () => {
  //seria isso padrão agx? nun tem body,param ou query, mas ainda sim, é um teste para um findAll
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
    headers: {"Content-Type": "application/json"},
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
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "abacate", quantidade: tamanho}), 
  });
  const dado:Comida = await res2.json();
  assertEquals(dado, {_id: id_abacate, nome: "abacate", quantidade: tamanho}, "deu ruim, o abacate não atualizou");
})

Deno.test("deleta a comida que foi criada no teste POST", async () => {
  const res:Response = await fetch(`http://localhost:3000/comida?nome=comida&qtd=1`,{
    method: "DELETE",
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
    headers: {"Content-Type": "application/json"},
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
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({quantidade: 5, msg:"aqui eu"}), 
  });
  const dado:Comida = await res3.json();
  assertEquals(dado, {_id: id_banana, nome: "banana", quantidade: 5, validade: true}, "deu ruim, a banana não atualizou");

  const res4:Response = await fetch(`http://localhost:3000/comida/${id_bananaFV}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({quantidade: 0}), 
  });
  const dado2:Comida = await res4.json();
  assertEquals(dado2, {_id: id_bananaFV, nome: "banana", quantidade: 0, validade: false}, "deu ruim, a banana não atualizou");

})

// integração

Deno.test("métodos no endpoint errado", async () => {
  const res:Response = await fetch(`http://localhost:3000/comida/10`);
  const txt:string = await res.text();
  assertEquals(txt,"não tem esse metodo para esse endpoint", "não era para ter get na /comida/10 ");

  const res2:Response = await fetch(`http://localhost:3000/`,{
    method: "POST",
  });
  const txt2:string = await res2.text();
  assertEquals(txt2,"não tem esse metodo para esse endpoint", "não era para ter POS na / ");

  const res3:Response = await fetch(`http://localhost:3000/`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "comida", quantidade: 10}), 
  });
  const txt3:string = await res3.text();
  assertEquals(txt3,"não tem esse metodo para esse endpoint", "não era para ter put na / ");

  const res4:Response = await fetch(`http://localhost:3000/?nome=comida&qtd=1`,{
    method: "DELETE",
  });
  const txt4:string = await res4.text();
  assertEquals(txt4,"não tem esse metodo para esse endpoint", "não era para ter delete na / ");
})

Deno.test("update com dados invalidos", async () => {
  const id_abacate:string = '6ad64dc419c66bb9a853ebc8';
  const res:Response = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: " ", quantidade: 10}), 
  });
  const txt:string = await res.text();
  assertEquals(txt,"nome inválido", "ta passando nome vazio");

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

  const res4:Response = await fetch(`http://localhost:3000/comida/${id_abacate}`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: 10, quantidade: 10}), 
  });
  const txt4:string = await res4.text();
  assertEquals(txt4,"nome inválido", "ta passando nome sem ser string");
})

Deno.test("post com dados invalidos", async () => {
  const res = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: " ", quantidade: 1}), 
  });
  const txt:string = await res.text();
  assertEquals(txt,"nome inválido", "ta passando nome vazio");

  const res2:Response = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "comida", quantidade: -1}), 
  });
  const txt2:string = await res2.text();
  assertEquals(txt2,"quantidade inválida", "ta pasando quantidade negativa");

  const res3:Response = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "comida", quantidade: "bruh"}), 
  });
  const txt3:string = await res3.text();
  assertEquals(txt3,"quantidade inválida", "ta passando quantidade sem ser numero");

  const res4:Response = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: 10, quantidade: 10}), 
  });
  const txt4:string = await res4.text();
  assertEquals(txt4,"nome inválido", "ta passando nome sem ser string");
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