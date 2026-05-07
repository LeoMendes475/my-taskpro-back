import { createLogger, format, transports } from "winston";

const { combine, timestamp, errors, json, colorize, printf } = format;

/* istanbul ignore next */
const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level}] ${stack ?? message}${extras}`;
  })
);

/* istanbul ignore next */
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

/* istanbul ignore next */
const logFormat = process.env.NODE_ENV === "production" ? prodFormat : devFormat;
/* istanbul ignore next */
const logLevel = process.env.LOG_LEVEL ?? "info";

export const logger = createLogger({
  level: logLevel,
  format: logFormat,
  transports: [new transports.Console()],
});
