import { Params } from 'nestjs-pino/params';
import { Request, Response } from 'express';

const isDev = process.env.NODE_ENV !== 'production';

export const loggerConfig = (): Params => ({
  pinoHttp: {
    level: 'info',
    autoLogging: true,
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
          }
        }
      : undefined,
    customProps
  }
});

type CustomPropsType = {
  reqId: ReqId;
  method: string;
  url: string;
  statusCode: number;
  ips?: string[];
  userAgent?: string;
  referer?: string;
};

type ReqId = number | string | object;

const customProps = (req: Request, res: Response): CustomPropsType => {
  return isDev
    ? {
        reqId: req.id,
        method: req.method,
        url: req.url,
        ips: req.ips,
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'],
        statusCode: res.statusCode
      }
    : {
        reqId: req.id,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode
      };
};
