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
router.post('/credenciar', HubController.registrarCD);

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
router.get('/centros', HubController.listarCDs);

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
 *                     description: Nome do Centro de Distribuição
 *                   endereco:
 *                     type: string
 *                     description: Endereço IP:PORTA do CD
 *                   sku:
 *                     type: string
 *                     description: SKU do produto
 *                   nome_produto:
 *                     type: string
 *                     description: Nome do produto
 *                   descricao:
 *                     type: string
 *                     description: Descrição do produto
 *                   quantidadeDisponivel:
 *                     type: integer
 *                     description: Quantidade disponível em estoque
 *                   valor:
 *                     type: number
 *                     format: float
 *                     description: Valor unitário do produto
 *               example:
 *                 - nome: "CD-RIO-DE-JANEIRO"
 *                   endereco: "localhost:3002"
 *                   sku: "PROD-001"
 *                   nome_produto: "Notebook Dell"
 *                   descricao: "Notebook Dell Inspiron 15"
 *                   quantidadeDisponivel: 5
 *                   valor: 2450.00
 *             description: |
 *               **Retorna array vazio []** nos seguintes casos:
 *               - Produto não existe em nenhum CD
 *               - Quantidade solicitada maior que disponível
 *               - Produto só existe no próprio CD solicitante
 *       400:
 *         description: Parâmetros obrigatórios ausentes (SKU ou quantidade).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 erro:
 *                   type: string
 *                   example: "SKU e quantidade são obrigatórios"
 *       500:
 *         description: Erro interno no servidor.
 */
router.get('/produtos', HubController.buscarProdutos);

// Rotas adicionais
router.get('/', HubController.health);
router.get('/status', HubController.verificarStatusTodos);
router.get('/transacoes', HubController.listarTransacoes);
router.post('/transacoes', HubController.registrarTransacao);
router.delete('/descredenciar/:id', HubController.descredenciarCD);

module.exports = router;
