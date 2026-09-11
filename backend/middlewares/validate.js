function required(fields) {
  return (req, res, next) => {
    const missing = fields.filter(field =>
      req.body[field] === undefined ||
      req.body[field] === null ||
      String(req.body[field]).trim() === ''
    );

    if (missing.length) {
      return res.status(400).json({
        message: `Campos obrigatórios: ${missing.join(', ')}`
      });
    }
    next();
  };
}

module.exports = { required };
