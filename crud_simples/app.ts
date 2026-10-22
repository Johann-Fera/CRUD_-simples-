import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { connectdb, disconnectFromMongoDB, findQuery, saveComida, updateComId, deleteQuery, transferirExpirada } from './repository.ts';
import type { QueryFilter } from "mongoose";
import { Comida } from "./interfaces.ts";
import comida from "./models/comida.ts"
import jwt from "jsonwebtoken";

export const app: Express = express();

const secret = Deno.env.get("JWT_secret");

app.use(express.json());

// coloca um return, eles ajuda a para depois de um res.send ou next(), melhor que enche de if()

export const nomeChecker = function (req: Request, res: Response, next: NextFunction) {
  console.log("aqui");
  if (req.method == 'PUT' && !req.body.nome) {
    console.log(!req.body.nome);
    console.log(req.body.nome);
    console.log("aqui2");
    next();
  } else{
    console.log("aqui3");
    if (typeof req.body.nome === "string") {
      console.log("aqui4");
        let semEspaco: string = req.body.nome;
        semEspaco = semEspaco.trim();
        if (semEspaco != "") {
          console.log("aqui5");
          next();
        } else return res.status(400).json({ error: "nome inválido" });
      } else return res.status(400).json({ error: "nome inválido" });
  }
};

export const qtdChecker = function (req: Request, res: Response, next: NextFunction) {
  console.log("aqui");
  if (req.method == 'PUT' && !req.body.quantidade) {
    console.log("aqui2");
    next();
  } else {
    console.log("aqui3");
    if (typeof req.body.quantidade === "number") {
      console.log("aqui4");
      if (req.body.quantidade >= 0) {
        console.log("aqui5");
        next();
      } else res.status(422).json({ error: "quantidade inválida" });
    } else res.status(422).json({ error: "quantidade inválida" });
  }
};

export const auth = function (req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  if (!header.includes("Bearer")) {
    return res.status(401).json({ error: "cade o Bearer" });
  }
  const token = header.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, secret);
    req.auto = payload; 
    return next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido ou expirado" });
  }
}

export const autoADM = function(req: Request, res: Response, next: NextFunction) {
  
    if (!req.auto?.role) {
      return res.status(403).json({ error: "Sem permissão" });
    }
    if (req.auto.role != "admin") {
      return res.status(403).json({ error: "Sem permissão" });
    }
    return next();
}

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

app.post('/comida', auth, nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const novaComida: Comida = req.body;
  const dados = await saveComida(novaComida);
  
  res.json(dados);
});

app.post('/comida/expirou', auth, autoADM, async (req: Request, res: Response) => {

  const dados = await transferirExpirada(req.body);
  res.send(dados);
});

app.put('/comida/:id', auth, autoADM, nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const dados = await updateComId(req.params.id, req.body);
  res.json(dados);
});

app.delete('/comida', auth, autoADM, async (req: Request, res: Response) => {
  const {id, nome, qtd, validade} = req.query;
  const filter : QueryFilter<typeof comida> = {};
  if (id) filter.id = id;
  if (nome) filter.nome = nome;
  if (qtd) filter.quantidade = qtd;
  if (validade) filter.validade = validade;
  const dados = await deleteQuery(filter);
  res.send(dados);
});

app.use((req: Request, res: Response) => {
  res.send("não tem esse metodo para esse endpoint")
});
