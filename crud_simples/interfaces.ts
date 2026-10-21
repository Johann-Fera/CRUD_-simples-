import { ObjectId, Types } from 'mongoose';

export interface Comida {
  _id?: string | ObjectId | Types.ObjectId;
  nome?: string;
  quantidade?: number;
  validade?: boolean;
  __v?: number
}

export interface OpTransfer {
    id_dv: string;
    id_fv: string;
    qtd: number;
}