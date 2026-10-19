import mongoose, { connect } from 'mongoose';

const foodSchema = new mongoose.Schema({
    nome: String,
    quantidade: Number
});

const comida = mongoose.model('comida',foodSchema);

export default comida;