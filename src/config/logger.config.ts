import { Params } from 'nestjs-pino/params';

const isDev = process.env.NODE_ENV !== 'production';

export const loggerConfig = (): Params => ({
  pinoHttp: {
    level: isDev ? 'debug' : 'info',
    autoLogging: false,
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'req,res,req.hostname,req.remoteAddress,form.file.buffer'
          }
        }
      : undefined,
    redact: {
      remove: true,
      paths: ['req', 'res', 'form.file.buffer']
    }
  }
});
