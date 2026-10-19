import { assertArrayIncludes, assertEquals, assertExists } from "@std/assert";
import { request } from "asset:///node/undici/api.d.ts";

Deno.test("retorna a lista de comida do banco que e ve se contém a banana e essa outra comida ae", async () => {
  const res = await fetch(`http://localhost:3000/`);
  const data = await res.json();
  assertArrayIncludes(data, [
    {_id: '6ad24d308a63f62d336c6c5c', nome: "banana", quantidade: 5}, 
    {_id: '6ad64eab19c66bb9a853ebca', nome: "comida", quantidade: 0}
  ], "deu ruim, sumiu a banana, ou a lista não veio");
})

Deno.test("adiciona comida e ve se ela ta na collection pelo id", async () => {
  const res = await fetch(`http://localhost:3000/comida`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nome: "comida", quantidade: 1}), 
  });
  const data = await res.json();
  assertExists(data, "deu ruim, não veio _id");
  const res2 = await fetch(`http://localhost:3000/${data}`);
  const data2 = await res2.json();
  assertEquals(data2, {_id:data, nome: "comida", quantidade: 1}, "deu ruim, não tem a comida que coloquei");
});

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
  const res = await fetch(`http://localhost:3000/`);
  const data = await res.json();
  const tamanho = data.length;
  const res2 = await fetch(`http://localhost:3000/comida?nome=comida&qtd=1`,{
    method: "DELETE",
  });
  const data2 = await res2.text();
  assertEquals(data2, "deletado");
  const res3 = await fetch(`http://localhost:3000/`);
  const data3 = await res3.json();
  const tamanhodnv = data3.length;
  assertEquals(tamanhodnv, tamanho - 1);
})