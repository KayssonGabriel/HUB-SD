const express = require('express');
const router = express.Router();
const HubController = require('../controllers/HubController');

/**
 * @swagger
 * components:
 *   schemas:
 *     CentroDistribuicao:
 *       type: object
 *       required:
 *         - nome
 *         - endereco
 *       properties:
 *         id:
 *           type: string
 *           description: ID do CD.
 *         nome:
 *           type: string
 *           description: Nome do CD.
 *         endereco:
 *           type: object
 *           properties:
 *             ip:
 *               type: string
 *               example: "192.168.1.10"
 *             porta:
 *               type: integer
 *               example: 3001
 *         status:
 *           type: string
 *           enum: [ativo, inativo]
 *           default: ativo
 */

/**
 * @swagger
 * /credenciar:
 *   post:
 *     summary: Credencia um novo Centro de Distribuição no HUB.
 *     tags: [HUB]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CentroDistribuicao'
 *           example:
 *             nome: "CD Rio de Janeiro"
 *             endereco:
 *               ip: "192.168.1.11"
 *               porta: 3002
 *     responses:
 *       201:
 *         description: CD credenciado com sucesso.
 *       400:
 *         description: CD já credenciado.
 */
router.post('/credenciar', HubController.credenciar);

/**
 * @swagger
 * /centros:
 *   get:
 *     summary: Lista todos os Centros de Distribuição ativos.
 *     tags: [HUB]
 *     responses:
 *       200:
 *         description: Lista de CDs ativos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CentroDistribuicao'
 *       500:
 *         description: Erro ao buscar CDs.
 */
router.get('/centros', HubController.listarCentrosAtivos);

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Verifica quais CDs possuem um produto com quantidade necessária.
 *     tags: [HUB]
 *     parameters:
 *       - in: query
 *         name: sku
 *         required: true
 *         schema:
 *           type: string
 *         description: SKU do produto.
 *       - in: query
 *         name: quantidade
 *         required: true
 *         schema:
 *           type: integer
 *         description: Quantidade necessária do produto.
 *       - in: header
 *         name: x-cd-solicitante-endereco
 *         required: true
 *         schema:
 *           type: string
 *         description: Endereço IP:PORTA do CD solicitante.
 *     responses:
 *       200:
 *         description: Lista de CDs que possuem o produto.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nome:
 *                     type: string
 *                   endereco:
 *                     type: string
 *                   sku:
 *                     type: string
 *                   quantidadeDisponivel:
 *                     type: integer
 *                   valor:
 *                     type: number
 *       400:
 *         description: Requisição inválida.
 *       500:
 *         description: Erro interno no servidor.
 */
router.get('/produtos', HubController.findProdutoEmOutrosCDs);

module.exports = router;
