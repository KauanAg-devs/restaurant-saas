import 'reflect-metadata';
import express from 'express';
import type { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../backend/src/app.module';

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
