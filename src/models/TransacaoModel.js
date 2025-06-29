const mongoose = require('mongoose');

const TransacaoSchema = new mongoose.Schema({
    sku: { type: String, required: true },
    quantidade: { type: Number, required: true },
    cdOrigem: {
        nome: { type: String, required: true },
        endereco: { type: String, required: true }
    },
    cdDestino: {
        nome: { type: String, required: true },
        endereco: { type: String, required: true }
    },
    valor: { type: Number, required: true },
    valorTotal: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pendente', 'concluida', 'falhada'], 
        default: 'pendente' 
    },
    dataTransacao: { type: Date, default: Date.now },
    observacoes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transacao', TransacaoSchema);
