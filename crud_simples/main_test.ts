import { assertArrayIncludes, assertEquals, assertExists } from "@std/assert";
import { request } from "asset:///node/undici/api.d.ts";

Deno.test("retorna a lista de comida do banco que contém a banana e comida de POST", async () => {
  const res = await fetch(`http://localhost:3000/`);
  const data = await res.json();
  assertArrayIncludes(data, [{nome: "banana", quantidade: 5}, {nome: "comida", quantidade: 1}], "deu ruim, sumiu a banana, ou a lista não veio");
})

Deno.test("adiciona comida e ve se ela ta na collection", async () => {
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