// hub-and-cd/src/config/swaggerConfig.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HUB API - Sistema Distribuído',
      version: '1.0.0',
      description: 'Documentação da API do HUB, responsável por gerenciar e orquestrar os Centros de Distribuição (CDs).',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local',
      },
    ],
    components: {
      schemas: {
        Endereco: {
          type: 'object',
          properties: {
            ip: {
              type: 'string',
              example: '192.168.1.101',
            },
            porta: {
              type: 'number',
              example: 3001,
            },
          },
          required: ['ip', 'porta'],
        },
        CentroDistribuicao: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              example: 'CD-SAO-PAULO',
            },
            endereco: {
              $ref: '#/components/schemas/Endereco',
            },
          },
          required: ['nome', 'endereco'],
        },
      },
    },
  },
  // Caminho para os arquivos que contêm as anotações da API
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;