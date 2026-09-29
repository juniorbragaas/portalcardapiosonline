const router = require('express').Router();
const multer = require('multer');
const controller = require('../controllers/productController');
const { authenticate, adminOnly, userOrAdmin, ownsEmpresa } = require('../middlewares/auth');
const Product = require('../models/Product');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Somente arquivos de imagem são permitidos'));
    }
    cb(null, true);
  }
});

// ── Endpoint público de imagem (sem auth) ────────────────────
router.get('/:id/foto', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { attributes: ['foto_produto'] });
    if (!product?.foto_produto) return res.status(404).end();
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(product.foto_produto);
  } catch { res.status(500).end(); }
});

// Todas as rotas abaixo exigem autenticação
router.use(authenticate);

// GET / e GET /:id — ADMIN vê tudo, USER vê só sua empresa (filtrado no controller)
router.get('/',    userOrAdmin, controller.list);
router.get('/:id', userOrAdmin, ownsEmpresa, controller.getById);

// POST, PUT, DELETE — USER pode operar, mas restrito à sua empresa
router.post('/',    userOrAdmin,              upload.single('foto_produto'), controller.create);
router.put('/:id',  userOrAdmin, ownsEmpresa, upload.single('foto_produto'), controller.update);
router.delete('/:id', userOrAdmin, ownsEmpresa, controller.remove);

// Atualiza documentação Swagger para incluir id_categoria no summary


/**
 * @swagger
 * components:
 *   schemas:
 *     ProdutoSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nome_produto:
 *           type: string
 *         descricao:
 *           type: string
 *         id_empresa:
 *           type: integer
 *         empresa:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nome_completo:
 *               type: string
 *             alias:
 *               type: string
 *         valor:
 *           type: number
 *           format: float
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Produto:
 *       allOf:
 *         - $ref: '#/components/schemas/ProdutoSummary'
 *         - type: object
 *           properties:
 *             foto_produto:
 *               type: string
 *               description: Imagem em base64 (data:image/*;base64,...)
 *               nullable: true
 */

module.exports = router;
