import 'reflect-metadata';
import express from 'express';
import type { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
// Load the backend compiled as CommonJS during the root build. Using the emitted
// artifact avoids Node ESM extension resolution issues inside Vercel Functions.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { AppModule } = require('../backend/dist/app.module.js');

const server = express();
let init: Promise<void> | null = null;

async function ensureNest() {
  if (!init) {
    init = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
        logger: ['error', 'warn', 'log'],
      });
      app.setGlobalPrefix('api');
      app.enableCors({ origin: true, credentials: true });
      await app.init();
    })();
  }
  await init;
}

export default async function handler(req: Request, res: Response) {
  await ensureNest();
  return server(req, res);
}
