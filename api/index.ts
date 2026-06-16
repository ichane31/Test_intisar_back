import { createConfiguredApp } from '../src/app.factory';
import type { IncomingMessage, ServerResponse } from 'http';

let cachedApp: any = null;

async function getApp() {
  if (cachedApp) return cachedApp;

  const app = await createConfiguredApp();
  await app.init();

  cachedApp = app.getHttpAdapter().getInstance();
  return cachedApp;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();
  app(req, res);
}