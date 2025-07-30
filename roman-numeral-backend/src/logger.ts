import { createLogger, transports, format } from 'winston';

/**
 * Initializes and configures a Winston logger instance.
 *
 * - Logs messages of level 'info' and above to both the console and a combined log file.
 * - Logs messages of level 'error' to a separate error log file.
 * - Includes timestamps and error stack traces in formatted output.
 */
export const logger = createLogger({
  level: 'info',

  // Log message formatting configuration
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `${timestamp} ${level}: ${message}\n${stack}`
        : `${timestamp} ${level}: ${message}`;
    })
  ),

  // Output destinations for logs
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

