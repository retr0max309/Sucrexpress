import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SupabaseModule } from './common/supabase/supabase.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './auth/auth.module';
import { PaquetesModule } from './paquetes/paquetes.module';
import { RepartidoresModule } from './repartidores/repartidores.module';
import { IncidenciasModule } from './incidencias/incidencias.module';
import { RutasModule } from './rutas/rutas.module';
import { ReportesModule } from './reportes/reportes.module';
import { SincronizacionesModule } from './sincronizaciones/sincronizaciones.module';
import { GeocodeModule } from './geocode/geocode.module';
// AppController y AppService del boilerplate de NestJS eliminados — no son necesarios

@Module({
  imports: [
    // Variables de entorno disponibles en toda la app
    ConfigModule.forRoot({ isGlobal: true }),

    // Supabase global (no necesita importarse en cada módulo)
    SupabaseModule,

    // Módulos de negocio
    AuthModule,
    PaquetesModule,
    RepartidoresModule,
    IncidenciasModule,
    RutasModule,
    ReportesModule,
    SincronizacionesModule,
    GeocodeModule,
  ],
  providers: [
    // Guard JWT aplicado globalmente a TODOS los endpoints
    // Para rutas públicas usar el decorador @Public() en el controller
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
