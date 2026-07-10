const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function configuredLevel() {
  return LEVELS[process.env.LOG_LEVEL || 'info'] || LEVELS.info;
}

function emit(level, message, context = {}) {
  if ((LEVELS[level] || LEVELS.info) < configuredLevel()) return;

  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    app: process.env.APP_NAME || 'ServicePro',
    version: process.env.APP_VERSION || 'dev',
    ...context
  };

  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else console.log(line);
}

const logger = {
  debug(message, context) { emit('debug', message, context); },
  info(message, context) { emit('info', message, context); },
  warn(message, context) { emit('warn', message, context); },
  error(message, context) { emit('error', message, context); }
};

module.exports = { logger, emit };
