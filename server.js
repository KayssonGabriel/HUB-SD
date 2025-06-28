require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const hubRoutes = require('./src/routes/hubRoutes');

// --- Adicionar importações do Swagger ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swaggerConfig');
// -----------------------------------------

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao Banco de Dados
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// --- Adicionar a rota da documentação ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
// ----------------------------------------

// Rotas
app.use('/api', hubRoutes);

// Rota raiz
app.get('/', (req, res) => {
    res.send('API do HUB está funcionando! Acesse /api-docs para ver a documentação.');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`HUB Server rodando na porta ${PORT}`);
    console.log(`Documentação da API disponível em http://localhost:${PORT}/api-docs`);
});