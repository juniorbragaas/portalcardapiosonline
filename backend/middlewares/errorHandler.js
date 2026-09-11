const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  logger.error(err.message || 'Erro não tratado', {
    method: req.method,
    url: req.originalUrl
  });

  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Erro interno do servidor' : err.message
  });
};
