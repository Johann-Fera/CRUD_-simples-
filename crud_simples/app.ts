import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { findQuery, saveComida, updateComId, deleteQuery, transferirExpirada } from './repository.ts';
import type { QueryFilter } from "mongoose";
import { Comida } from "./interfaces.ts";
import comida from "./models/comida.ts"
import jwt from "jsonwebtoken";
import responser from "responser";
import requestCheck from "request-check";

export const app: Express = express();

const secret = Deno.env.get("JWT_secret");

app.use((responser as any).default);
app.use(express.json());
const rc = (requestCheck as any).default();

export const nomeChecker = function (req: Request, res: Response, next: NextFunction) {
  const nome = req.body.nome;
  if (req.method == 'PUT' && !nome) return next();
  /*
  rc.addRule('nome', {
    validator: (nome:any) => typeof nome != "string",
    message: 'o nome deve ser String',
  },{
    validator: (nome:string) => nome.trim() == "",
    message: 'o nome não deve ser vazio',
  })
  const errors = rc.check({nome});
  if (errors) {
    //talvez tenha que verifica esses "errors" nos testes
    return res.send_unprocessableEntity("nome inválido",errors);
  }
  return next();
  */
  
  if (typeof nome === "string") {
    let semEspaco: string = nome;
    semEspaco = semEspaco.trim();
    if (semEspaco != "") return next();
  } 
  return res.send_unprocessableEntity("nome inválido");
};

export const qtdChecker = function (req: Request, res: Response, next: NextFunction) {
  if (req.method == 'PUT' && !req.body.quantidade) return next();
  if (typeof req.body.quantidade === "number") {
    if (req.body.quantidade >= 0) return next();
  }
  return res.send_unprocessableEntity("quantidade inválida");
};

export const auth = function (req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return res.send_unauthorized("Token não fornecido");
  }

  if (!header.includes("Bearer")) {
    return res.send_unauthorized("sem Bearer");
  }
  const token = header.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, secret);
    req.auto = payload; 
    return next();
  } catch (err) {
    return res.send_unauthorized("Token inválido ou expirado");
  }
}

export const autoADM = function(req: Request, res: Response, next: NextFunction) {
    if (!req.auto?.role) {
      return res.send_forbidden("Sem permissão");
    }
    if (req.auto.role != "admin") {
      return res.send_forbidden("Sem permissão");
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
  res.send_ok("comidas retornadas", dados);
});

app.post('/comida', auth, nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const novaComida: Comida = req.body;
  const dados = await saveComida(novaComida);
  res.send_created("comidas criada", dados);
});

app.post('/comida/expirou', auth, autoADM, async (req: Request, res: Response) => {
  const dados = await transferirExpirada(req.body);
  res.send_accepted ("transferencia feita", dados);
});

app.put('/comida/:id', auth, autoADM, nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const dados = await updateComId(req.params.id, req.body);
  res.send_ok("comidas atualizada", dados);
});

app.delete('/comida', auth, autoADM, async (req: Request, res: Response) => {
  const {id, nome, qtd, validade} = req.query;
  const filter : QueryFilter<typeof comida> = {};
  if (id) filter.id = id;
  if (nome) filter.nome = nome;
  if (qtd) filter.quantidade = qtd;
  if (validade) filter.validade = validade;
  const dados = await deleteQuery(filter);
  res.send_noContent("comidas deletada", dados);
});

app.use((req: Request, res: Response) => {
  res.send_methodNotAllowed("não tem esse metodo para esse endpoint");
});
