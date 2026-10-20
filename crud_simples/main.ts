import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { main, connectdb, disconnectFromMongoDB } from './repository.ts';
import type { QueryFilter } from "npm:mongoose";

const app: Express = express();
const port = 3000;

connectdb();

interface Comida {
  _id: string;
  nome: string;
  quantidade: number;
}

app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
  console.log(req.query);
  const {_id, nome, quantidade} = req.query;
  const filter : QueryFilter<Comida> = {};
  if (_id) filter._id = _id;
  if (nome) filter.nome = nome;
  if (quantidade) filter.quantidade = quantidade;
  const dados = await main(1,filter);
  console.log(dados);
  res.send(dados);
});

app.post('/comida', 
  (req: Request, res: Response, next: NextFunction) => {
    if (typeof req.body.nome === "string") {
      let semEspaco: string = req.body.nome;
      semEspaco = semEspaco.trim();
      if (semEspaco != "") {
        next();
      } else res.send("nome inválido");
    } else res.send("nome inválido");
  },
  (req: Request, res: Response, next: NextFunction) => {
    if (typeof req.body.quantidade === "number") {
      if (req.body.quantidade >= 0) {
        next('route');
      } else res.send("quantidade inválida");
    } else res.send("quantidade inválida");
    
  },
);

app.post('/comida', async (req: Request, res: Response) => {
  const dados = await main(2,req.body);
  res.json(dados);
});

app.put('/comida/:id', 
  (req: Request, res: Response, next: NextFunction) => {
    if (typeof req.body.nome === "string") {
      let semEspaco: string = req.body.nome;
      semEspaco = semEspaco.trim();
      if (semEspaco != "") {
        next();
      } else res.send("nome inválido");
    } else res.send("nome inválido");
  },
  (req: Request, res: Response, next: NextFunction) => {
    if (typeof req.body.quantidade === "number") {
      if (req.body.quantidade >= 0) {
        next('route');
      } else res.send("quantidade inválida");
    } else res.send("quantidade inválida");
    
  }
);

app.put('/comida/:id', async (req: Request, res: Response) => {
  const dados = await main(3,{id: req.params.id, bodi: req.body});
  res.json(dados);
});

app.delete('/comida', async (req: Request, res: Response) => {
  const dados = await main(4,{nome: req.query.nome, quantidade: req.query.qtd});
  res.send(dados);
});


//só para eu desconectar do banco
app.get('/d', async (req: Request, res: Response) => {
  await disconnectFromMongoDB();
  res.send("desconectado")
});

app.use((req: Request, res: Response) => {
  res.send("não tem esse metodo para esse endpoint")
});

app.listen(port, () => {
  console.log('rodando local em: http://localhost:3000/');
});