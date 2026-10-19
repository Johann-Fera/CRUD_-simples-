import mongoose, { connect } from 'mongoose';
import comida from './models/comida.ts';
import { log } from "node:console";


export async function connectdb() {
    const dburl = Deno.env.get("DB_URL");
    console.log("url ai -> " + dburl);
    await mongoose.connect(`${dburl}`);
    console.log(`✅ Conectado com sucesso ao banco: ${mongoose.connection.name}`);
}

export async function main(op: number, body?: any) {
    try {
        switch (op) {
            case 1:
                const lista = await comida.find().select({__v:0}).lean();
                //console.log("puxaro a lista");
                return lista;

            case 2:
                const comidaNova = new comida(body);
                const comidaSalva = await comidaNova.save();
                //console.log("colocaro comida nova");
                return comidaSalva._id;

            case 3:
                const comidaPedida = await comida.findById(body).select({__v:0}).lean();
                //console.log("puxaro comida");
                return comidaPedida;

            case 4:
                const comidaAtualizada = await comida.findByIdAndUpdate(body.id, body.bodi, {returnDocument: 'after'}).select({__v:0}).lean();
                //console.log("mudaro comida");
                return comidaAtualizada;

            case 5:
                const deletou = await comida.deleteMany(body)
                //console.log("deletaram comidas");
                return deletou;
        
            default:
                console.log("fez caca");
                return
        }
    } catch (err) {
        console.dir(err);
    }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
    console.log('desconectado');
  await mongoose.connection.close();
}