const router = require('express').Router();
const multer = require('multer');
const controller = require('../controllers/productController');
const { authenticate, adminOnly } = require('../middlewares/auth');

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

router.use(authenticate, adminOnly);

/**
 * @swagger
 * tags:
 *   name: Produtos
 *   description: Gerenciamento de produtos (somente ADMIN)
 */

/**
 * @swagger
 * /api/produtos:
 *   get:
 *     summary: Lista todos os produtos (sem foto para performance)
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_empresa
 *         schema:
 *           type: integer
 *         description: Filtra produtos por empresa
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProdutoSummary'
 */
router.get('/', controller.list);

/**
 * @swagger
 * /api/produtos/{id}:
 *   get:
 *     summary: Busca produto por ID (com foto em base64)
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/produtos:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nome_produto
 *               - id_empresa
 *               - valor
 *             properties:
 *               nome_produto:
 *                 type: string
 *                 example: Produto X
 *               descricao:
 *                 type: string
 *                 example: Descrição detalhada do produto.
 *               id_empresa:
 *                 type: integer
 *                 example: 1
 *               valor:
 *                 type: number
 *                 format: float
 *                 example: 99.90
 *               foto_produto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Produto criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Empresa não encontrada
 */
router.post('/', upload.single('foto_produto'), controller.create);

/**
 * @swagger
 * /api/produtos/{id}:
 *   put:
 *     summary: Atualiza um produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome_produto:
 *                 type: string
 *               descricao:
 *                 type: string
 *               id_empresa:
 *                 type: integer
 *               valor:
 *                 type: number
 *                 format: float
 *               foto_produto:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Produto atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Produto'
 *       404:
 *         description: Produto não encontrado
 */
router.put('/:id', upload.single('foto_produto'), controller.update);

/**
 * @swagger
 * /api/produtos/{id}:
 *   delete:
 *     summary: Remove um produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto excluído
 *       404:
 *         description: Produto não encontrado
 */
router.delete('/:id', controller.remove);

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
