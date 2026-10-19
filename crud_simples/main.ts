import express, { type Express, type Request, type Response } from 'express';
import { main, connectdb } from './repository.ts';

const app: Express = express();
const port = 3000;
let counter1 = 0;
let counter2 = 0;
let counter3 = 0;

connectdb();

app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
  const dados = await main(1);
  counter1++;
  //console.log("vezes que pediro uma lista: " + counter1);
  res.json(dados);
});

app.post('/comida', async (req: Request, res: Response) => {
  const dados = await main(2,req.body);
  counter2++;
  //console.log("vezes que mandaro algo: " + counter2);
  res.json(dados);
});

app.get('/:id', async (req: Request, res: Response) => {
  const dados = await main(3,req.params.id);
  counter3++;
  //console.log("vezes que pediram por id: " + counter3);
  res.json(dados);
});

app.listen(port, () => {
  console.log('rodando local em: http://localhost:3000/');
});

/*
export function handler(req: Request): Response {
  const url = new URL(req.url);

  if (url.pathname === "/comida") {
    return Response.json({
      food: "banana",
    });
  }

  return new Response("nada ó");
  
  if (url.pathname === "/api") {
    return Response.json({
      message: "Hello, world!",
      time: new Date().toISOString(),
    });
  }

  return new Response("<h1>Welcome to Deno!</h1>", {
    headers: { "content-type": "text/html" },
  });
  
}
*/

/*
if (import.meta.main) {
  Deno.serve(handler);
}
*/