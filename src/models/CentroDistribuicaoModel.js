const mongoose = require('mongoose');

const CentroDistribuicaoSchema = new mongoose.Schema({
    nome: { type: String, required: true, unique: true },
    endereco: {
        ip: { type: String, required: true },
        porta: { type: Number, required: true },
    },
    ativo: { type: Boolean, default: false },
    ultimaVerificacao: { type: Date }
}, { timestamps: true });

CentroDistribuicaoSchema.index({ 'endereco.ip': 1, 'endereco.porta': 1 }, { unique: true });

module.exports = mongoose.model('CentroDistribuicao', CentroDistribuicaoSchema);