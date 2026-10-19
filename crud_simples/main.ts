import express, { type Express, type Request, type Response } from 'express';
import { main, connectdb } from './repository.ts';

const app: Express = express();
const port = 3000;

connectdb();

app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
  const dados = await main(1);
  //console.log("vezes que pediro uma lista: " + counter1);
  res.json(dados);
});

app.post('/comida', async (req: Request, res: Response) => {
  const dados = await main(2,req.body);
  //console.log("vezes que mandaro algo: " + counter2);
  res.json(dados);
});

app.get('/:id', async (req: Request, res: Response) => {
  const dados = await main(3,req.params.id);
  //console.log("vezes que pediram por id: " + counter3);
  res.json(dados);
});

app.put('/comida/:id', async (req: Request, res: Response) => {
  const dados = await main(4,{id: req.params.id, bodi: req.body});
  //console.log("vezes que atualizaram algo: " + counter4);
  res.json(dados);
});

app.delete('/comida', async (req: Request, res: Response) => {
  const dados = await main(5,{nome: req.query.nome, quantidade: req.query.qtd});
  //console.log("vezes que deletaram coisas: " + counter5);
  res.send("deletado");
});

app.listen(port, () => {
  console.log('rodando local em: http://localhost:3000/');
});