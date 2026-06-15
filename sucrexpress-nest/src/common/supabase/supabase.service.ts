import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);

  // Cliente con RLS activo (para operaciones del usuario)
  private client: SupabaseClient;

  // Cliente admin sin RLS (equivalente a conexión directa SQL)
  private adminClient: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('SUPABASE_URL');
    const anonKey = this.config.get<string>('SUPABASE_ANON_KEY');
    const serviceKey = this.config.get<string>('SUPABASE_SERVICE_KEY');

    if (!url || !anonKey || !serviceKey) {
      throw new Error('Faltan variables de entorno de Supabase (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY)');
    }

    this.client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    this.adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    this.logger.log(`Conexión Supabase establecida → ${url}`);
  }

  // Retorna el cliente normal (con RLS)
  getClient(): SupabaseClient {
    return this.client;
  }

  // Retorna el cliente admin (sin RLS) - el que usamos en el backend
  getAdmin(): SupabaseClient {
    return this.adminClient;
  }
}
