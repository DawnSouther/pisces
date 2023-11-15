/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, Module } from '@nestjs/common';
import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from '@pisces/backend';
import * as bodyParser from 'body-parser';
import { BigIntModule, initStandard } from '@pisces/common';
import { IamBackendModule } from './app/iam.backend.module';

@Module({
  imports: [
    AppModule,
    IamBackendModule,
  ]
})
export class IamModule {}

async function bootstrap() {
  initStandard();
  const app = await NestFactory.create<NestApplication>(IamModule);
  app.use(bodyParser.json({ reviver: BigIntModule }))
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3100;
  await app.listen(port);
  Logger.log(
    `🚀 IamApplication is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
