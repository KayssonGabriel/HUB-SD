const CentroDistribuicao = require('../models/CentroDistribuicaoModel');
const Transacao = require('../models/TransacaoModel');
const axios = require('axios');

class HubController {
    // Registrar um novo Centro de Distribuição
    static async registrarCD(req, res) {
        try {
            let { nome, endereco, porta, capacidadeMaxima } = req.body;
            
            // Compatibilidade: se endereco vier como objeto, extrair ip e porta
            if (typeof endereco === 'object' && endereco.ip && endereco.porta) {
                porta = endereco.porta;
                endereco = endereco.ip;
            }
            
            if (!nome || !endereco || !porta) {
                return res.status(400).json({ 
                    erro: 'Nome, endereço e porta são obrigatórios' 
                });
            }

            // Verificar se já existe um CD com o mesmo nome
            const cdExistente = await CentroDistribuicao.findOne({ nome });
            if (cdExistente) {
                return res.status(200).json({
                    mensagem: 'Centro de Distribuição já cadastrado',
                    cd: cdExistente
                });
            }

            const novoCD = new CentroDistribuicao({
                nome,
                endereco,
                porta,
                capacidadeMaxima: capacidadeMaxima || 1000,
                status: 'ativo',
                dataRegistro: new Date()
            });

            await novoCD.save();
            
            console.log(`CD registrado: ${nome} em ${endereco}:${porta}`);
            
            res.status(201).json({
                mensagem: 'Centro de Distribuição registrado com sucesso',
                cd: novoCD
            });
        } catch (error) {
            console.error('Erro ao registrar CD:', error);
            res.status(500).json({ 
                erro: 'Erro interno do servidor',
                detalhes: error.message 
            });
        }
    }

    // Listar todos os Centros de Distribuição
    static async listarCDs(req, res) {
        try {
            const cds = await CentroDistribuicao.find();
            res.json({
                total: cds.length,
                centros: cds
            });
        } catch (error) {
            console.error('Erro ao listar CDs:', error);
            res.status(500).json({ 
                erro: 'Erro interno do servidor',
                detalhes: error.message 
            });
        }
    }

    // Verificar status de todos os CDs
    static async verificarStatusTodos(req, res) {
        try {
            const cds = await CentroDistribuicao.find();
            const statusCDs = [];

            for (const cd of cds) {
                let statusOnline = 'offline';
                try {
                    const response = await axios.get(`http://${cd.endereco}:${cd.porta}/`, {
                        timeout: 3000
                    });
                    if (response.status === 200) {
                        statusOnline = 'online';
                    }
                } catch (error) {
                    console.log(`CD ${cd.nome} está offline`);
                }

                // Atualizar apenas a verificação, mantendo status ativo
                cd.ultimaVerificacao = new Date();
                // Não alterar o status 'ativo' para 'online'/'offline'
                await cd.save();

                statusCDs.push({
                    id: cd._id,
                    nome: cd.nome,
                    endereco: cd.endereco,
                    porta: cd.porta,
                    status: statusOnline, // status online/offline para resposta
                    statusCD: cd.status, // status original do CD (ativo/inativo/descredenciado)
                    ultimaVerificacao: cd.ultimaVerificacao
                });
            }

            res.json({
                total: statusCDs.length,
                cdsAtivos: statusCDs.filter(cd => cd.statusCD === 'ativo').length,
                cdsInativos: statusCDs.filter(cd => cd.statusCD !== 'ativo').length,
                online: statusCDs.filter(cd => cd.status === 'online').length,
                offline: statusCDs.filter(cd => cd.status === 'offline').length,
                centros: statusCDs
            });
        } catch (error) {
            console.error('Erro ao verificar status dos CDs:', error);
            res.status(500).json({ 
                erro: 'Erro interno do servidor',
                detalhes: error.message 
            });
        }
    }

    // Buscar produtos nos CDs ativos
    static async buscarProdutos(req, res) {
        try {
            const { sku, quantidade } = req.query;
            const cdSolicitante = req.headers['x-cd-solicitante-endereco'];

            if (!sku || !quantidade) {
                return res.status(400).json({ 
                    erro: 'SKU e quantidade são obrigatórios' 
                });
            }

            // Buscar CDs ativos ou online
            const cdsAtivos = await CentroDistribuicao.find({ 
                status: { $in: ['ativo', 'online'] } 
            });
            const cdsComProduto = [];

            for (const cd of cdsAtivos) {
                // Não buscar no próprio CD solicitante
                const enderecoCD = `${cd.endereco}:${cd.porta}`;
                if (enderecoCD === cdSolicitante) {
                    continue;
                }

                try {
                    // Verificar se o CD está online
                    await axios.get(`http://${cd.endereco}:${cd.porta}/`, { timeout: 3000 });

                    // Buscar o produto específico no CD
                    const response = await axios.get(
                        `http://${cd.endereco}:${cd.porta}/api/produtos`,
                        { timeout: 5000 }
                    );

                    const produtos = response.data;
                    const produto = produtos.find(p => 
                        p.sku === sku && p.quantidadeEmEstoque >= parseInt(quantidade)
                    );

                    if (produto) {
                        cdsComProduto.push({
                            nome: cd.nome,
                            endereco: enderecoCD,
                            sku: produto.sku,
                            nome_produto: produto.nome,
                            descricao: produto.descricao,
                            valor: produto.valor,
                            quantidadeDisponivel: produto.quantidadeEmEstoque
                        });
                    }
                } catch (error) {
                    console.log(`CD ${cd.nome} não está acessível ou não tem o produto`);
                }
            }

            res.json(cdsComProduto);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).json({ 
                erro: 'Erro interno do servidor',
                detalhes: error.message 
            });
        }
    }

    // Registrar uma nova transação
    static async registrarTransacao(req, res) {
        try {
            const transacao = new Transacao(req.body);
            await transacao.save();
            res.status(201).json({ 
                mensagem: 'Transação registrada com sucesso!', 
                transacao 
            });
        } catch (error) {
            console.error('Erro ao registrar transação:', error);
            res.status(500).json({ 
                erro: 'Erro ao registrar transação.',
                detalhes: error.message 
            });
        }
    }

    // Listar histórico de transações
    static async listarTransacoes(req, res) {
        try {
            const { limite = 50, pagina = 1, status } = req.query;
            
            const filtro = {};
            if (status) {
                filtro.status = status;
            }

            const transacoes = await Transacao.find(filtro)
                .sort({ dataInicio: -1 })
                .limit(parseInt(limite))
                .skip((parseInt(pagina) - 1) * parseInt(limite));

            const total = await Transacao.countDocuments(filtro);

            res.json({
                total,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                transacoes
            });
        } catch (error) {
            console.error('Erro ao listar transações:', error);
            res.status(500).json({ 
                erro: 'Erro interno do servidor',
                detalhes: error.message 
            });
        }
    }

    // Descredenciar CD
    static async descredenciarCD(req, res) {
        try {
            const { id } = req.params;
            
            const cd = await CentroDistribuicao.findById(id);
            if (!cd) {
                return res.status(404).json({ erro: 'Centro de Distribuição não encontrado' });
            }

            cd.status = 'descredenciado';
            cd.dataDescredenciamento = new Date();
            await cd.save();

            console.log(`CD descredenciado: ${cd.nome}`);

            res.json({
                mensagem: 'Centro de Distribuição descredenciado com sucesso',
                cd: {
                    id: cd._id,
                    nome: cd.nome,
                    status: cd.status,
                    dataDescredenciamento: cd.dataDescredenciamento
                }
            });
        } catch (error) {
            console.error('Erro ao descredenciar CD:', error);
            res.status(500).json({ 
                erro: 'Erro interno do servidor',
                detalhes: error.message 
            });
        }
    }

    // Endpoint raiz para verificação de saúde
    static async health(req, res) {
        res.json({
            status: 'online',
            servico: 'HUB - Sistema de Gestão de Centros de Distribuição',
            timestamp: new Date().toISOString(),
            versao: '1.0.0'
        });
    }
}

module.exports = HubController;
