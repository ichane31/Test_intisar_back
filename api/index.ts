import serverlessExpress from '@codegenie/serverless-express';
import { createConfiguredApp } from '../src/app.factory';

type VercelHandler = (
  req: unknown,
  res: unknown,
  next?: (err?: unknown) => void,
) => Promise<void> | void;

let cachedHandler: VercelHandler | null = null;

async function getHandler(): Promise<VercelHandler> {
  if (cachedHandler) {
    return cachedHandler;
  }

  const app = await createConfiguredApp();
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  cachedHandler = serverlessExpress({
    app: expressApp,
  }) as VercelHandler;

  return cachedHandler;
}

export default async function handler(req: unknown, res: unknown) {
  const serverHandler = await getHandler();
  return serverHandler(req, res, (err: unknown) => {
    if (err) throw err;
  });
}
