// hub-and-cd/src/config/swaggerConfig.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HUB API - Sistema Distribuído',
      version: '1.0.0',
      description: `
        Documentação da API do HUB, responsável por gerenciar e orquestrar os Centros de Distribuição (CDs).
        
        ## Funcionalidades Principais:
        - **Credenciamento de CDs**: Registro e gerenciamento de Centros de Distribuição
        - **Verificação de Status**: Monitoramento da conectividade dos CDs
        - **Consulta de Produtos**: Busca por produtos disponíveis em CDs ativos
        - **Registro de Transações**: Log de todas as operações entre CDs
        
        ## Fluxo do Sistema:
        1. **Credenciamento**: CD solicita registro no HUB
        2. **Verificação**: HUB confirma ou rejeita o credenciamento
        3. **Solicitação**: CD busca produtos em outros CDs via HUB
        4. **Consulta**: HUB verifica CDs ativos e disponibilidade
        5. **Resposta**: HUB retorna lista de CDs com produto disponível
        6. **Transação**: CD realiza compra direta com outro CD
        7. **Registro**: Transação é registrada no HUB para auditoria
      `,
      contact: {
        name: 'Sistema Distribuído - Trabalho S.D.',
        email: 'suporte@sistema-distribuido.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor Local do HUB',
      },
      {
        url: 'http://192.168.1.10:3000/api',
        description: 'Servidor de Rede do HUB',
      }
    ],
    components: {
      schemas: {
        Endereco: {
          type: 'object',
          properties: {
            ip: {
              type: 'string',
              example: '192.168.1.101',
              description: 'Endereço IP do Centro de Distribuição'
            },
            porta: {
              type: 'number',
              example: 3001,
              description: 'Porta da API do Centro de Distribuição'
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
              description: 'Nome único do Centro de Distribuição'
            },
            endereco: {
              $ref: '#/components/schemas/Endereco',
            },
            status: {
              type: 'string',
              enum: ['ativo', 'inativo'],
              default: 'ativo',
              description: 'Status atual do Centro de Distribuição'
            },
            ultimaVerificacao: {
              type: 'string',
              format: 'date-time',
              description: 'Data e hora da última verificação de status'
            }
          },
          required: ['nome', 'endereco'],
        },
        Transacao: {
          type: 'object',
          properties: {
            sku: {
              type: 'string',
              example: 'PROD-001',
              description: 'Código SKU do produto'
            },
            quantidade: {
              type: 'integer',
              example: 10,
              description: 'Quantidade transferida'
            },
            cdOrigem: {
              type: 'object',
              properties: {
                nome: { type: 'string', example: 'CD-RIO' },
                endereco: { type: 'string', example: '192.168.1.11:3001' }
              },
              description: 'Centro de Distribuição de origem'
            },
            cdDestino: {
              type: 'object',
              properties: {
                nome: { type: 'string', example: 'CD-SP' },
                endereco: { type: 'string', example: '192.168.1.12:3002' }
              },
              description: 'Centro de Distribuição de destino'
            },
            valor: {
              type: 'number',
              format: 'float',
              example: 25.50,
              description: 'Valor unitário do produto'
            },
            valorTotal: {
              type: 'number',
              format: 'float',
              example: 255.00,
              description: 'Valor total da transação'
            },
            status: {
              type: 'string',
              enum: ['pendente', 'concluida', 'falhada'],
              default: 'pendente',
              description: 'Status da transação'
            },
            observacoes: {
              type: 'string',
              example: 'Transação automática via sistema',
              description: 'Observações sobre a transação'
            }
          },
          required: ['sku', 'quantidade', 'cdOrigem', 'cdDestino', 'valor', 'valorTotal']
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensagem de erro'
            },
            error: {
              type: 'string',
              description: 'Detalhes técnicos do erro'
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        BadRequest: {
          description: 'Requisição inválida',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
  },
  // Caminho para os arquivos que contêm as anotações da API
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;