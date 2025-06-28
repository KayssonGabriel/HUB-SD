const CentroDistribuicao = require('../models/CentroDistribuicaoModel');
const axios = require('axios');

exports.credenciar = async (req, res) => {
  try {
    const { nome, endereco } = req.body;

    const cdExistente = await CentroDistribuicao.findOne({
      'endereco.ip': endereco.ip,
      'endereco.porta': endereco.porta
    });

    if (cdExistente) {
      return res.status(400).json({ message: 'Centro de distribuição já credenciado.' });
    }

    const novoCD = new CentroDistribuicao({ nome, endereco, status: 'ativo' });
    await novoCD.save();
    res.status(201).json({ message: 'Centro de distribuição credenciado com sucesso!', cd: novoCD });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao credenciar centro de distribuição.', error: error.message });
  }
};

exports.listarCentrosAtivos = async (req, res) => {
  try {
    const centros = await CentroDistribuicao.find({ status: 'ativo' });
    res.status(200).json(centros);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar centros de distribuição.', error: error.message });
  }
};

exports.findProdutoEmOutrosCDs = async (req, res) => {
  const { sku, quantidade } = req.query;
  const cdSolicitanteEndereco = req.headers['x-cd-solicitante-endereco'];

  if (!sku || !quantidade || !cdSolicitanteEndereco) {
    return res.status(400).json({ message: 'SKU, quantidade e endereço do solicitante são obrigatórios.' });
  }

  const [ip, porta] = cdSolicitanteEndereco.split(':');
  if (!ip || !porta) {
    return res.status(400).json({ message: 'Endereço do solicitante inválido. Use formato IP:PORTA.' });
  }

  try {
    const outrosCDs = await CentroDistribuicao.find({
      status: 'ativo',
      $and: [
        { 'endereco.ip': { $ne: ip } },
        { 'endereco.porta': { $ne: parseInt(porta, 10) } }
      ]
    });

    const requests = outrosCDs.map(cd => {
      const url = `http://${cd.endereco.ip}:${cd.endereco.porta}/produtos/${sku}`;
      return axios.get(url, { timeout: 5000 }).catch(err => {
        console.error(`Erro ao consultar o CD ${cd.nome}: ${err.message}`);
        return null;
      });
    });

    const responses = await Promise.all(requests);

    const cdsComProdutoDisponivel = responses.map((response, index) => {
      if (
        response &&
        response.data &&
        response.data.quantidadeEmEstoque >= parseInt(quantidade, 10)
      ) {
        const cd = outrosCDs[index];
        return {
          nome: cd.nome,
          endereco: `${cd.endereco.ip}:${cd.endereco.porta}`,
          sku: response.data.sku,
          quantidadeDisponivel: response.data.quantidadeEmEstoque,
          valor: response.data.valor
        };
      }
      return null;
    }).filter(item => item !== null);

    res.status(200).json(cdsComProdutoDisponivel);
  } catch (error) {
    console.error('Erro no HUB ao buscar produtos em outros CDs:', error.message);
    res.status(500).send('Erro interno do servidor ao buscar produtos em outros centros.');
  }
};
