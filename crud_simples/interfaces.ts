import { ObjectId, Types } from 'mongoose';

export interface OpTransfer {
    id_dv: string;
    id_fv: string;
    quantidade: number;
}