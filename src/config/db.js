const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Conectado (HUB)...');
    } catch (err) {
        console.error('Erro ao conectar com MongoDB (HUB):', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;