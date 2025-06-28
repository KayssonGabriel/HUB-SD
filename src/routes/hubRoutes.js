const express = require('express');
const router = express.Router();
const HubController = require('../controllers/HubController');

/**
 * @openapi
 * /api/register:
 * post:
 * tags:
 * - Centro de Distribuição
 * summary: Credencia um novo CD no HUB
 * description: Rota para um novo Centro de Distribuição se registrar no sistema. O HUB verifica a disponibilidade e atividade do CD antes de confirmar o registro.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/CentroDistribuicao'
 * responses:
 * '201':
 * description: CD credenciado com sucesso.
 * '400':
 * description: Dados insuficientes para registro (nome, ip ou porta faltando).
 * '409':
 * description: Conflito. Um CD com o mesmo nome ou endereço já existe.
 * '500':
 * description: Erro interno no servidor, possivelmente falha ao se comunicar com a API do CD.
 */
router.post('/register', HubController.register);

/**
 * @openapi
 * /api/consulta-estoque:
 * post:
 * tags:
 * - Estoque
 * summary: Consulta CDs com estoque de um produto
 * description: Rota utilizada por um CD (solicitante) para pedir ao HUB uma lista de outros CDs que possuem um determinado produto em quantidade suficiente.
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * sku:
 * type: string
 * example: "PN-007"
 * quantidadeNecessaria:
 * type: integer
 * example: 100
 * solicitante:
 * $ref: '#/components/schemas/Endereco'
 * responses:
 * '200':
 * description: Uma lista de CDs fornecedores que atendem aos critérios. A lista pode estar vazia.
 * '400':
 * description: Parâmetros obrigatórios (sku, quantidadeNecessaria, solicitante) não foram fornecidos.
 * '500':
 * description: Erro interno no HUB.
 */
router.post('/consulta-estoque', HubController.consultarEstoqueEmCDs);

/**
 * @openapi
 * /api/cds:
 * get:
 * tags:
 * - Centro de Distribuição
 * summary: Lista todos os CDs cadastrados
 * description: Retorna uma lista de todos os Centros de Distribuição que já se registraram no HUB, incluindo seu status de atividade.
 * responses:
 * '200':
 * description: Lista de CDs retornada com sucesso.
 * '500':
 * description: Erro interno no servidor.
 */
router.get('/cds', HubController.listarCDs);

module.exports = router;