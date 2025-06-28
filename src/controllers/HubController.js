const CentroDistribuicao = require('../models/CentroDistribuicaoModel');
const axios = require('axios');

exports.register = async (req, res) => {
    const { nome, endereco } = req.body;
    if (!nome || !endereco || !endereco.ip || !endereco.porta) {
        return res.status(400).json({ message: 'Dados insuficientes para registro.' });
    }

    try {
        const existingCD = await CentroDistribuicao.findOne({ $or: [{ nome }, { 'endereco.ip': endereco.ip, 'endereco.porta': endereco.porta }] });
        if (existingCD) {
            return res.status(409).json({ message: 'CD já cadastrado com este nome ou endereço.' });
        }

        await axios.get(`http://${endereco.ip}:${endereco.porta}/api/health`, { timeout: 3000 });

        const newCD = new CentroDistribuicao({
            nome,
            endereco,
            ativo: true,
            ultimaVerificacao: new Date()
        });

        await newCD.save();
        console.log(`CD ${nome} registrado com sucesso em ${endereco.ip}:${endereco.porta}`);
        res.status(201).json({ message: 'CD credenciado com sucesso!', cd: newCD });

    } catch (error) {
        console.error(`Erro ao tentar registrar CD ${nome}: ${error.message}`);
        res.status(500).json({ message: 'Não foi possível se comunicar com o CD no endereço fornecido. Verifique o IP, Porta e se a API do CD está no ar.' });
    }
};

exports.consultarEstoqueEmCDs = async (req, res) => {
    const { sku, quantidadeNecessaria, solicitante } = req.body;

    if (!sku || !quantidadeNecessaria || !solicitante) {
        return res.status(400).json({ message: 'SKU, quantidade e endereço do solicitante são obrigatórios.' });
    }
    console.log(`HUB: Recebida consulta do solicitante ${solicitante.ip}:${solicitante.porta} para o SKU ${sku}`);

    try {
        const outrosCDs = await CentroDistribuicao.find({
            $and: [
                { 'endereco.ip': { $ne: solicitante.ip } },
                { ativo: true }
            ]
        });

        const promessasDeConsulta = outrosCDs.map(async (cd) => {
            try {
                const url = `http://${cd.endereco.ip}:${cd.endereco.porta}/api/estoque/${sku}/${quantidadeNecessaria}`;
                console.log(`HUB -> Consultando CD ${cd.nome} na URL: ${url}`);
                const response = await axios.get(url, { timeout: 5000 });

                if (response.data.possuiEstoque) {
                    await CentroDistribuicao.updateOne({ _id: cd._id }, { ativo: true, ultimaVerificacao: new Date() });
                    return {
                        nome: cd.nome,
                        endereco: cd.endereco,
                        valor: response.data.valor,
                        quantidadeDisponivel: response.data.quantidadeEmEstoque
                    };
                }
                return null;
            } catch (error) {
                console.warn(`HUB: CD ${cd.nome} (${cd.endereco.ip}:${cd.endereco.porta}) está inativo ou com erro. Marcando como inativo.`);
                await CentroDistribuicao.updateOne({ _id: cd._id }, { ativo: false, ultimaVerificacao: new Date() });
                return null;
            }
        });

        const resultados = (await Promise.all(promessasDeConsulta)).filter(r => r !== null);
        console.log(`HUB: Encontrados ${resultados.length} fornecedores para o SKU ${sku}. Enviando resposta para ${solicitante.ip}:${solicitante.porta}.`);
        res.status(200).json(resultados);

    } catch (error) {
        console.error("Erro no HUB ao consultar estoque:", error);
        res.status(500).json({ message: 'Erro interno no HUB.' });
    }
};

exports.listarCDs = async (req, res) => {
    try {
        const cds = await CentroDistribuicao.find();
        res.status(200).json(cds);
    } catch (error) {
        res.status(500).json({ message: "Erro ao listar CDs" });
    }
};