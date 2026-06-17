import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug'], // muestra todos los logs incluyendo debug
  });

  // CORS
  app.enableCors({
    origin: function (origin, callback) {
      // Permitir cualquier origen en pre-producción/desarrollo
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Prefijo global /api
  app.setGlobalPrefix('api');

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Sucrexpress API')
    .setDescription(
      `## Sistema de Logística y Entrega de Paquetería

### Cómo autenticarse en Swagger:
1. Ejecuta **POST /api/auth/login** con tu email y contraseña
2. Copia el valor del campo \`data.token\` de la respuesta
3. Haz clic en el botón **🔓 Authorize** (arriba a la derecha)
4. Pega el token en el campo **Value** y haz clic en **Authorize**
5. ¡Listo! Todos los endpoints protegidos funcionarán automáticamente`,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa el token JWT obtenido en POST /api/auth/login',
      },
      'JWT', // ← nombre del esquema, debe coincidir con @ApiBearerAuth('JWT')
    )
    .build();

  // El Swagger vive en /docs (fuera del prefijo /api para no confundir)
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // el token persiste al refrescar la página
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(` Sucrexpress API corriendo en: http://localhost:${port}/api`);
  console.log(` Swagger UI en:                http://localhost:${port}/docs`);
}

bootstrap();
