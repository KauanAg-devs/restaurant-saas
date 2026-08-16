require('reflect-metadata');
const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { AppModule } = require('../backend/dist/app.module.js');

const server = express();
let init = null;

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

module.exports = async function handler(req, res) {
  await ensureNest();
  return server(req, res);
};
