const mongoose = require('mongoose');

const CentroDistribuicaoSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    endereco: {
        ip: { type: String, required: true },
        porta: { type: Number, required: true },
    },
    status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' },
    ultimaVerificacao: { type: Date }
}, { timestamps: true });

CentroDistribuicaoSchema.index({ 'endereco.ip': 1, 'endereco.porta': 1 }, { unique: true });

module.exports = mongoose.model('CentroDistribuicao', CentroDistribuicaoSchema);