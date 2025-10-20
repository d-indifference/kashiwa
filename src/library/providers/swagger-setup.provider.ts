import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ApiModule } from '@api/api.module';
import { DebugModule } from '@debug/debug.module';

@Injectable()
export class SwaggerSetupProvider {
  constructor(private readonly config: ConfigService) {}

  public setupDocs(app: NestExpressApplication): OpenAPIObject {
    const swaggerConfig = this.buildConfig();
    return SwaggerModule.createDocument(app, swaggerConfig, { include: [ApiModule, DebugModule] });
  }

  private buildConfig(): Omit<OpenAPIObject, 'paths'> {
    const title = this.config.getOrThrow<string>('application.name');
    const description = this.config.getOrThrow<string>('application.description');

    return new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(process.env.npm_package_version as string)
      .setLicense('GPLv2', 'https://github.com/d-indifference/kashiwa/blob/main/LICENSE')
      .build();
  }
}
