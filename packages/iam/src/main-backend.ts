import { INestApplication, Logger } from "@nestjs/common";
import { appInit } from "./main.app-init";

async function bootstrap(app: INestApplication) {
  const port = process.env.PORT || 3100;
  await app.listen(port);
  Logger.log(
    `🚀 IamApplication is running on: http://localhost:${port}`
  );
}

appInit().then(app => bootstrap(app)) ;

