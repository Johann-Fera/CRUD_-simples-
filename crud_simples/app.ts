import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import { findQuery, saveComida, updateComId, deleteQuery, transferirExpirada } from './repository.ts';
import type { QueryFilter } from "mongoose";
import { OpTransfer } from "./interfaces.ts";
import comida from "./models/comida.ts"
import jwt from "jsonwebtoken";
import responser from "responser";
import requestCheck from "request-check";
import { rc } from "./rq-ck.ts";

export const app: Express = express();

const secret = Deno.env.get("JWT_secret");

app.use((responser as any).default);
app.use(express.json());

export const nomeChecker = function (req: Request, res: Response, next: NextFunction) {
  let nome:string = req.body?.nome;
  if (!nome) nome = req.query?.nome;
  if ((req.method == 'GET' || req.method == 'PUT' || req.method == 'DELETE') && !nome) return next();
  if (typeof nome != "string") return res.send_unprocessableEntity("nome inválido", [ { field: "nome", message: "o nome deve ser string" } ]);
  const errors = rc.check({nome});
  if (errors) {
    return res.send_unprocessableEntity("nome inválido",errors);
  }
  return next();
};

export const qtdChecker = function (req: Request, res: Response, next: NextFunction) {
  let quantidade:number = req.body?.quantidade;
  if (!quantidade) quantidade = req.query?.quantidade;
  if ((req.method == 'GET' || req.method == 'PUT' || req.method == 'DELETE') && !quantidade) return next();
  if (typeof quantidade != "number") return res.send_unprocessableEntity("quantidade inválida", [ { field: "quantidade", message: "a quantidade deve ser number" } ]);
  const errors = rc.check({quantidade});
  if (errors) {
    return res.send_unprocessableEntity("quantidade inválida",errors);
  }
  return next();
};

export const auth = function (req: Request, res: Response, next: NextFunction) {
  const header:string = req.headers.authorization;

  const errors = rc.check({header});
  if (errors) {
    return res.send_unauthorized("autorização inválida",errors);
  }

  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, secret);
    req.auto = payload; 
    return next();
  } catch (err) {
    return res.send_unauthorized("Token inválido ou expirado",err);
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

app.get('/', nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const {_id, nome, quantidade, validade} = req.query;
  const filter : QueryFilter<typeof comida> = {};
  if (_id) filter._id = _id;
  if (nome) filter.nome = nome;
  if (quantidade) filter.quantidade = quantidade;
  if (validade) filter.validade = validade;
  const dados = await findQuery(filter);
  res.send_ok("comidas retornadas", dados);
});

app.post('/comida', auth, autoADM, nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const novaComida: typeof comida = req.body;
  const dados = await saveComida(novaComida);
  res.send_created("comidas criada", dados);
});

app.post('/comida/expirou', auth, qtdChecker, async (req: Request, res: Response) => {
  const transfer: OpTransfer = req.body;
  const dados = await transferirExpirada(transfer);
  res.send_accepted ("transferencia feita", dados);
});

app.put('/comida/:id', auth, autoADM, nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const comidaAtualizada: typeof comida = req.body;
  const id: string = req.params.id;
  const dados = await updateComId(id, comidaAtualizada);
  res.send_ok("comidas atualizada", dados);
});

app.delete('/comida', auth, autoADM, nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const {id, nome, qtd, validade} = req.query;
  const filter : QueryFilter<typeof comida> = {};
  if (id) filter.id = id;
  if (nome) filter.nome = nome;
  if (qtd) filter.quantidade = qtd;
  if (validade) filter.validade = validade;
  const dados = await deleteQuery(filter);
  res.send_noContent("comidas deletada", dados);
});

app.use((_req:Request, res: Response) => {
  res.send_methodNotAllowed("não tem esse metodo para esse endpoint");
});
