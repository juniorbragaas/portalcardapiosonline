const router = require('express').Router();
const controller = require('../controllers/categoryController');
const { authenticate, adminOnly, userOrAdmin } = require('../middlewares/auth');

router.use(authenticate);

// Listagem: ADMIN vê tudo, USER vê só suas categorias (filtrado no controller/service)
router.get('/', userOrAdmin, controller.list);
router.get('/:id', userOrAdmin, controller.getById);

// Criação: ADMIN ou USER (USER cria vinculada à sua empresa)
router.post('/', userOrAdmin, controller.create);
// Atualização/exclusão: ADMIN ou USER (USER só se pertencer à sua empresa)
router.put('/:id', userOrAdmin, controller.update);
router.delete('/:id', userOrAdmin, controller.remove);

module.exports = router;
