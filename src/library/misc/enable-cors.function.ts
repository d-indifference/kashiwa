import { NestExpressApplication } from '@nestjs/platform-express';
import { SiteContextProvider } from '@library/providers';

type StaticOrigin = boolean | string | RegExp | (string | RegExp)[];

const corsOrigin = (
  origin: string,
  callback: (err: Error | null, origin?: StaticOrigin) => void,
  allowedOrigins: string[] | undefined
): void => {
  if (!origin || (allowedOrigins ?? []).includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

/**
 * Enables CORS (Cross-Origin Resource Sharing) for a NestExpressApplication
 * using a dynamic list of allowed origins provided by the SiteContextProvider.
 *
 * This function sets up the CORS middleware for the application, allowing
 * requests only from origins returned by `siteContext.getCorsAllowedOrigins()`.
 * It also allows credentials (cookies, authorization headers) to be sent
 * in cross-origin requests.
 *
 * The CORS policy is dynamic: whenever a request arrives, the current allowed
 * origins are fetched from the SiteContextProvider, so updating the list
 * in SiteContextProvider will automatically affect subsequent requests
 * without restarting the server.
 *
 * @param app - The Nest.js Express application instance on which to enable CORS.
 * @param siteContext - Provider that supplies the list of allowed origins dynamically via `getCorsAllowedOrigins()`.
 */
export const enableCors = (app: NestExpressApplication, siteContext: SiteContextProvider) => {
  app.enableCors({
    origin: (origin, callback) => {
      corsOrigin(origin, callback, siteContext.getCorsAllowedOrigins());
    },
    credentials: true
  });
};
