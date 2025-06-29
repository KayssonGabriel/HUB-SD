const mongoose = require('mongoose');

const CentroDistribuicaoSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    endereco: { type: String, required: true },
    porta: { type: Number, required: true },
    capacidadeMaxima: { type: Number, default: 1000 },
    status: { type: String, enum: ['ativo', 'inativo', 'offline', 'online', 'descredenciado'], default: 'ativo' },
    ultimaVerificacao: { type: Date },
    dataRegistro: { type: Date, default: Date.now },
    dataDescredenciamento: { type: Date }
}, { timestamps: true });

CentroDistribuicaoSchema.index({ endereco: 1, porta: 1 }, { unique: true });

module.exports = mongoose.model('CentroDistribuicao', CentroDistribuicaoSchema);