import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
    nome: {type: String, index: true, required: true, trim: true, minLength:1},
    quantidade: {type: Number,  required: true, min: 0},
    validade: {type: Boolean, default:true}
});

const comida = mongoose.model('comida',foodSchema);

export default comida;