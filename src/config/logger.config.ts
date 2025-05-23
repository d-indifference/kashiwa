import { Params } from 'nestjs-pino/params';

export const loggerConfig = (): Params => ({
  pinoHttp: {
    autoLogging: false,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'req,res,req.hostname,req.remoteAddress'
      }
    }
  }
});
