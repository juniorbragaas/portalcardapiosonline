const router = require('express').Router();
const clientRepository = require('../repositories/clientRepository');
const productRepository = require('../repositories/productRepository');
const { serialize: serializeClient } = require('../services/clientService');

/**
 * GET /api/cardapio/:alias
 * Rota pública — sem autenticação.
 * Retorna dados da empresa e seus produtos com fotos em base64.
 */
router.get('/:alias', async (req, res, next) => {
  try {
    const { alias } = req.params;

    const client = await clientRepository.findByAlias(alias);
    if (!client) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    const empresa = serializeClient(client);

    // Busca produtos e serializa foto
    const rawProducts = await productRepository.findAllByEmpresa(client.id);
    const products = await Promise.all(
      rawProducts.map(async p => {
        // findAllByEmpresa retorna sem foto — buscar individualmente para incluir imagem
        const full = await productRepository.findById(p.id);
        const data = full.toJSON();
        data.foto_produto = data.foto_produto
          ? `data:image/*;base64,${Buffer.from(data.foto_produto).toString('base64')}`
          : null;
        data.valor = parseFloat(data.valor);
        return data;
      })
    );

    res.json({ empresa, products });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
