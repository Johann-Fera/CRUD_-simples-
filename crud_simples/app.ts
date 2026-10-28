import express, { NextFunction, type Express, type Request, type Response } from 'express';
import { findQuery, saveComida, updateComId, deleteQuery, transferirExpirada } from './repository.ts';
import type { QueryFilter } from "mongoose";
import { OpTransfer } from "./interfaces.ts";
import comida from "./models/comida.ts"
import jwt from "jsonwebtoken";
import responser from "responser";
import { rc } from "./rq-ck.ts";
import morgan from "morgan";
import is from "isness";
import throwlhos, { IThrowlhos } from "throwlhos";

export const app: Express = express();

const secret = Deno.env.get("JWT_secret");

app.use((responser).default);
app.use(express.json());
//app.use(morgan("tiny", {immediate: true}));
//app.use(morgan("short"));
app.use(throwlhos.default.middleware);

export const nomeChecker = function (req: Request, _res: Response, next: NextFunction) {
  let nome:string = req.body?.nome;
  if (typeof nome === "undefined") nome = req.query?.nome;
  if (req.method != 'POST'  && typeof nome === "undefined") return next();
  if (!is.string(nome)) throw throwlhos.default.err_unprocessableEntity("nome deve ser string");
  const errors = rc.check({nome});
  if (errors) {
    throw throwlhos.default.err_unprocessableEntity("nome inválido",errors);
  }
  return next();
};

export const qtdChecker = function (req: Request, _res: Response, next: NextFunction) {
  let quantidade:number = req.body?.quantidade;
  if (typeof quantidade === "undefined" ) quantidade = req.query?.quantidade;
  if (req.method != 'POST' && typeof quantidade === "undefined") return next();
  if (!is.number(quantidade)) throw throwlhos.default.err_unprocessableEntity("quantidade deve ser number");
  quantidade = Number(quantidade);
  const errors = rc.check({quantidade});
  if (errors) {
    const erro = throwlhos.default.err_unprocessableEntity("quantidade inválida",errors);
    throw erro;
  }
  return next();
};

export const auth = function (req: Request, _res: Response, next: NextFunction) {
  const header:string = req.headers.authorization;

  const errors = rc.check({header});
  if (errors) {
    throw throwlhos.default.err_unauthorized("autorização inválida",errors);
  }

  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, secret);
    req.auto = payload; 
    return next();
  } catch (_error) {
    throw throwlhos.default.err_unauthorized("Token inválido ou expirado");
  }
}

export const autoADM = function(req: Request, _res: Response, next: NextFunction) {
    if (!req.auto?.role) {
      throw throwlhos.default.err_forbidden("Sem permissão");
    }
    if (req.auto.role != "admin") {
      throw throwlhos.default.err_forbidden("Sem a permissão");
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
  try {
    const dados = await findQuery(filter);
    res.send_ok("comidas retornadas", dados);
  } catch (error) {
    throw error;
  }
});

app.post('/comida', auth, autoADM, nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const novaComida: typeof comida = req.body;
  try {
    const dados = await saveComida(novaComida);
    res.send_created("comida criada", dados);
  } catch (error) {
    throw error;
  }
});

app.post('/comida/expirou', auth, autoADM, qtdChecker, async (req: Request, res: Response) => {
  const transfer: OpTransfer = req.body;
  try {
    const dados = await transferirExpirada(transfer);
    res.send_accepted ("transferencia feita", dados);
  } catch (error) {
    throw error;
  }
});

app.put('/comida/:id', auth, autoADM, nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const comidaAtualizada: typeof comida = req.body;
  const id: string = req.params.id;
  try {
    const dados = await updateComId(id, comidaAtualizada);
    res.send_ok("comidas atualizada", dados);
  } catch (error) {
    throw error;
  };
});

app.delete('/comida', auth, autoADM, nomeChecker, qtdChecker, async (req: Request, res: Response) => {
  const {id, nome, quantidade, validade} = req.query;
  const filter : QueryFilter<typeof comida> = {};
  if (id) filter.id = id;
  if (nome) filter.nome = nome;
  if (quantidade) filter.quantidade = quantidade;
  if (validade) filter.validade = validade;
  if (Object.keys(filter).length == 0) throw throwlhos.default.err_badRequest("filtro vazio em delete");
  try {
    const dados = await deleteQuery(filter);
    res.send_noContent("comidas deletada", dados);
  } catch (error) {
    throw error;
  };
});

app.use((_req:Request, _res: Response) => {
  throw throwlhos.default.err_methodNotAllowed("não tem esse metodo para esse endpoint");
});

app.use((err: IThrowlhos, _req:Request, res:Response, _next:NextFunction) => {
  switch (err.code) {
    case 400:
      res.send_badRequest("Bad Request",err);
      break;
    case 401:
      res.send_unauthorized("Unauthorized",err);
      break;
    case 403:
      res.send_forbidden("Forbidden",err);
      break;
    case 404:
      res.send_notFound("Not Found",err);
      break;
    case 405:
      res.send_methodNotAllowed("Method Not Allowed",err);
      break;
    case 409:
      res.send_conflict("Conflict",err);
      break;
    case 422:
      res.send_unprocessableEntity("Unprocessable Entity",err);
      break;
    case 500:
      res.send_internalServerError("Internal Server Error",err);
      break;
  
    default:
      console.log(err);
      res.send_internalServerError("erro novo",err);
      break;
  };
});