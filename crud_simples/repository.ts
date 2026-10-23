import mongoose, { QueryFilter } from 'mongoose';
import comida from './models/comida.ts';
import { Comida, OpTransfer } from "./interfaces.ts";


export async function connectdb() {
    const dburl = Deno.env.get("DB_URL");
    await mongoose.connect(`${dburl}`);
    console.log(`✅ Conectado com sucesso ao banco: ${mongoose.connection.name}`);
}

export async function findQuery(query: QueryFilter<typeof comida>) {
    try {
        const lista:Comida[] = await comida.find(query).select({__v:0}).lean();
        return lista;
    } catch (error) {
        console.dir(error);
    }
}

export async function saveComida(body: Comida) {
    try {
        const comidaNova = new comida(body);
        const comidaSalva:Comida = await comidaNova.save();
        return comidaSalva._id;
    } catch (error) {
        console.dir(error);
    }
}

export async function updateComId(id: string, body: Comida) {
    try {
        const comidaAtualizada:Comida | null = await comida
        .findByIdAndUpdate(id, body, {returnDocument: 'after', runValidators: true})
        .select({__v:0})
        .lean();
        return comidaAtualizada;
    } catch (error) {
        console.dir(error);
    }
}

export async function deleteQuery(query: QueryFilter<typeof comida>) {
    try {
        const deletou = await comida.deleteMany(query);
        return deletou;
    } catch (error) {
        console.dir(error);
    }
}

export async function transferirExpirada(transfer: OpTransfer) {
    try {
        const comidaDV = await comida.findById(transfer.id_dv);
        const comidaFV = await comida.findById(transfer.id_fv);
        // sera que dava para fazer isso no app.ts? e request-check?
        if (!comidaDV) throw new Error("não encontrou comida dentro da validade com esse id");
        if (!comidaFV) throw new Error("não encontrou comida fora da validade com esse id");
        if (comidaDV.quantidade < transfer.qtd) throw new Error("não é possivel transferir mais do que tem");
        comidaDV.quantidade = comidaDV.quantidade - transfer.qtd;
        comidaFV.quantidade = comidaFV.quantidade + transfer.qtd;
        await mongoose.connection.transaction(async (session) => {
            await comidaDV.save({ session });
            await comidaFV.save({ session });
        });
        return "transação feita";
    } catch (error) {
        return "deu errado" + error;
    }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
    console.log('desconectado');
  await mongoose.connection.close();
}