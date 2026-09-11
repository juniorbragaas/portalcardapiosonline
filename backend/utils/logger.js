const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

function write(level, message, meta = {}) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta
  }) + '\n';
  fs.appendFileSync(path.join(logsDir, 'app.log'), line);
  if (level === 'error') console.error(message, meta);
  else console.log(message, meta);
}

module.exports = {
  info: (message, meta) => write('info', message, meta),
  error: (message, meta) => write('error', message, meta)
};
