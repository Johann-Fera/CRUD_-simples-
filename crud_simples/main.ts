import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { connectdb, disconnectFromMongoDB, findQuery, saveComida, updateComId, deleteQuery, transferirExpirada } from './repository.ts';
import type { QueryFilter } from "mongoose";
import { Comida } from "./interfaces.ts";
import comida from "./models/comida.ts"

const app: Express = express();
const port = 3000;

connectdb();

app.use(express.json());

const nomeChecker = function (req: Request, res: Response, next: NextFunction) {
  if (req.method == 'PUT' && !req.body.nome) {
    next();
  } else{
    if (typeof req.body.nome === "string") {
        let semEspaco: string = req.body.nome;
        semEspaco = semEspaco.trim();
        if (semEspaco != "") {
          next();
        } else res.send("nome inválido");
      } else res.send("nome inválido");
  }
};

const qtdChecker = function (req: Request, res: Response, next: NextFunction) {
  if (req.method == 'PUT' && !req.body.quantidade) {
    next();
  } else {
    if (typeof req.body.quantidade === "number") {
      if (req.body.quantidade >= 0) {
        next();
      } else res.send("quantidade inválida");
    } else res.send("quantidade inválida");
  }
};

app.get('/', async (req: Request, res: Response) => {
  const {_id, nome, quantidade, validade} = req.query;
  const filter : QueryFilter<typeof comida> = {};
  if (_id) filter._id = _id;
  if (nome) filter.nome = nome;
  if (quantidade) filter.quantidade = quantidade;
  if (validade) filter.validade = validade;
  const dados = await findQuery(filter);
  res.send(dados);
});

app.post('/comida', nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const novaComida: Comida = req.body;
  const dados = await saveComida(novaComida);
  console.log("dados:" + dados);
  
  res.json(dados);
});

app.post('/comida/expirou', async (req: Request, res: Response) => {

  const dados = await transferirExpirada(req.body);
  res.send(dados);
});

app.put('/comida/:id', nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const dados = await updateComId(req.params.id, req.body);
  res.json(dados);
});

app.delete('/comida', async (req: Request, res: Response) => {
  const {id, nome, qtd, validade} = req.query;
  const filter : QueryFilter<typeof comida> = {};
  if (id) filter.id = id;
  if (nome) filter.nome = nome;
  if (qtd) filter.quantidade = qtd;
  if (validade) filter.validade = validade;
  const dados = await deleteQuery(filter);
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