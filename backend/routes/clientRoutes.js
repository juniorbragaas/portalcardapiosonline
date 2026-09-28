const router = require('express').Router();
const multer = require('multer');
const controller = require('../controllers/clientController');
const { authenticate, adminOnly, userOrAdmin } = require('../middlewares/auth');
const Client = require('../models/Client');
const clientService = require('../services/clientService');

// ── Endpoints públicos de imagem (sem auth) ──────────────────
// Servem o BLOB diretamente para poder usar em <img src="...">
router.get('/:id/logo', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, { attributes: ['logo'] });
    if (!client?.logo) return res.status(404).end();
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(client.logo);
  } catch { res.status(500).end(); }
});

router.get('/:id/banner', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, { attributes: ['banner'] });
    if (!client?.banner) return res.status(404).end();
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(client.banner);
  } catch { res.status(500).end(); }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB por arquivo
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Somente arquivos de imagem são permitidos'));
    }
    cb(null, true);
  }
});

const uploadFields = upload.fields([
  { name: 'logo',   maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// ── Rota acessível para USER: retorna dados da empresa vinculada ao token ──
router.get('/minha-empresa', authenticate, userOrAdmin, async (req, res, next) => {
  try {
    const id = req.user?.id_empresa;
    if (!id) return res.status(403).json({ message: 'Nenhuma empresa vinculada ao seu usuário' });
    const empresa = await clientService.getById(id);
    res.json(empresa);
  } catch (err) { next(err); }
});

router.use(authenticate, adminOnly);

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gerenciamento de clientes (somente ADMIN)
 */

/**
 * @swagger
 * /api/clientes/dashboard:
 *   get:
 *     summary: Retorna totais para o dashboard
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Totais do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: integer
 *                 clientes:
 *                   type: integer
 *                 clientesAtivos:
 *                   type: integer
 */
router.get('/dashboard', controller.dashboard);

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Lista todos os clientes (sem imagens para performance)
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClienteSummary'
 */
router.get('/', controller.list);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Busca cliente por ID (com logo e banner em base64)
 *     tags: [Clientes]
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
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Cria um novo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nome_completo
 *             properties:
 *               nome_completo:
 *                 type: string
 *                 example: Empresa ABC Ltda
 *               alias:
 *                 type: string
 *                 example: ABC
 *               endereco:
 *                 type: string
 *                 example: Rua das Flores, 123
 *               email:
 *                 type: string
 *                 format: email
 *                 example: contato@abc.com
 *               celular:
 *                 type: string
 *                 example: "(11) 99999-9999"
 *               descricao:
 *                 type: string
 *                 example: Empresa especializada em soluções tecnológicas.
 *               status:
 *                 type: boolean
 *                 default: true
 *               logo:
 *                 type: string
 *                 format: binary
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Cliente criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Dados inválidos
 */
router.post('/', uploadFields, controller.create);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Atualiza um cliente
 *     tags: [Clientes]
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
 *               nome_completo:
 *                 type: string
 *               alias:
 *                 type: string
 *               endereco:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               celular:
 *                 type: string
 *               descricao:
 *                 type: string
 *               status:
 *                 type: boolean
 *               logo:
 *                 type: string
 *                 format: binary
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cliente atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado
 */
router.put('/:id', uploadFields, controller.update);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Remove um cliente
 *     tags: [Clientes]
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
 *         description: Cliente excluído
 *       404:
 *         description: Cliente não encontrado
 */
router.delete('/:id', controller.remove);

/**
 * @swagger
 * components:
 *   schemas:
 *     ClienteSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nome_completo:
 *           type: string
 *         alias:
 *           type: string
 *         endereco:
 *           type: string
 *         email:
 *           type: string
 *         celular:
 *           type: string
 *         descricao:
 *           type: string
 *         status:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Cliente:
 *       allOf:
 *         - $ref: '#/components/schemas/ClienteSummary'
 *         - type: object
 *           properties:
 *             logo:
 *               type: string
 *               description: Imagem em base64 (data:image/*;base64,...)
 *               nullable: true
 *             banner:
 *               type: string
 *               description: Imagem em base64 (data:image/*;base64,...)
 *               nullable: true
 */

module.exports = router;
