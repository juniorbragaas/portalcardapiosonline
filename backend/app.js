const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cardapioRoutes = require('./routes/cardapioRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.use((req, res, next) => {
  logger.info('HTTP request', { method: req.method, url: req.originalUrl });
  next();
});

app.get('/', (req, res) => res.json({
  message: 'API React Admin Clientes funcionando',
  version: '2.0'
}));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/clientes', clientRoutes);
app.use('/api/produtos', productRoutes);
app.use('/api/categorias', categoryRoutes);
app.use('/api/cardapio', cardapioRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

module.exports = app;
