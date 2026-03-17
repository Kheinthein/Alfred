import winston from 'winston';

/**
 * Logger configuré avec Winston
 * Logs structurés en JSON pour production
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'alfred-api' },
  transports: [
    // Fichier pour les erreurs
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Fichier pour tous les logs
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// En développement, log aussi dans la console avec format lisible
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata, null, 2)}`;
          }
          return msg;
        })
      ),
    })
  );
}

export { logger };
