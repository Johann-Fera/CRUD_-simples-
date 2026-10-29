import mongoose, { QueryFilter } from 'mongoose';
import comida from './models/comida.ts';
import { OpTransfer } from "./interfaces.ts";
import throwlhos from "throwlhos";

export async function connectdb() {
    const dburl = Deno.env.get("DB_URL");
    await mongoose.connect(`${dburl}`);
    console.log(`✅ Conectado com sucesso ao banco: ${mongoose.connection.name}`);
}

export async function findQuery(query: QueryFilter<typeof comida>) {
    try {
        const lista = await comida.find(query).select({__v:0}).lean();
        return lista;
    } catch (error) {
        console.dir(error);
        throw error;
    }
}

export async function saveComida(body: typeof comida) {
    try {
        const comidaNova = new comida(body);
        const comidaSalva = await comidaNova.save();
        return comidaSalva._id;
    } catch (error) {
        console.dir(error);
        throw error;
    }
}

export async function updateComId(id: string, body: typeof comida) {
    try {
        const comidaAtualizada = await comida
        .findByIdAndUpdate(id, body, {returnDocument: 'after', runValidators: true})
        .select({__v:0})
        .lean();
        return comidaAtualizada;
    } catch (error) {
        console.dir(error);
        throw error;
    }
}

export async function deleteQuery(query: QueryFilter<typeof comida>) {
    try {
        await comida.deleteMany(query)
    } catch (error) {
        console.dir(error);
        throw error;
    }
}

export async function transferirExpirada(transfer: OpTransfer) {
    try {
    //magina se vem mais de dois itens, ai ferro, nem tem como testar isso (naturalmente)
    const [comidaDV,comidaFV] = await comida.find({_id: { $in: [transfer.id_dv, transfer.id_fv]}}).sort({validade: -1});
    if (comidaDV?.validade != true) throw throwlhos.default.err_notFound("não encontrou comida dentro da validade com esse id");
    if (comidaFV?.validade != false) throw throwlhos.default.err_notFound("não encontrou comida fora da validade com esse id");
    if (comidaDV.nome !== comidaFV.nome) throw throwlhos.default.err_unprocessableEntity("os nomes devem ser iguais");
    if (comidaDV.quantidade < transfer.quantidade) throw throwlhos.default.err_conflict("não é possivel transferir mais do que tem");
    comidaDV.quantidade = comidaDV.quantidade - transfer.quantidade;
    comidaFV.quantidade = comidaFV.quantidade + transfer.quantidade;
    
        await mongoose.connection.transaction(async (session) => {
            await comidaDV.save({ session });
            await comidaFV.save({ session });
        });
        return "transação feita";
    } catch (error) {
        throw error;
    }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
    console.log('desconectado');
  await mongoose.connection.close();
}