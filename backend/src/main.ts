import 'reflect-metadata';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(){
  const app=await NestFactory.create(AppModule,{cors:false});
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({whitelist:true,transform:true}));
  const origins=(process.env.CORS_ORIGINS||'http://localhost:3000').split(',').map(v=>v.trim()).filter(Boolean);
  app.enableCors({origin:origins,credentials:false,allowedHeaders:['content-type','authorization'],exposedHeaders:['x-request-id','retry-after']});
  app.setGlobalPrefix('api');
  await app.listen(Number(process.env.PORT||3001),'0.0.0.0');
}
bootstrap();
