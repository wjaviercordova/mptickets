/**
 * Funciones de Autenticación para Administradores MPTickets
 * Sistema de login separado para superadmins
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase/admin-client';
import type { AdminUser } from '@/types/admin';

// Secret key para JWT (debe estar en .env.local)
const JWT_SECRET = process.env.JWT_SECRET || 'mptickets-admin-secret-change-in-production';
const JWT_EXPIRES_IN = '8h'; // 8 horas

console.log('🔑 [AUTH] JWT_SECRET configurado:', JWT_SECRET ? '✅ (longitud: ' + JWT_SECRET.length + ')' : '❌ NO DEFINIDO');

export interface LoginResult {
  success: boolean;
  user?: Omit<AdminUser, 'password'>;
  token?: string;
  error?: string;
}

/**
 * Autentica un administrador
 * @param usuario - Nombre de usuario (ej: superadmin)
 * @param password - Contraseña sin hashear
 * @returns Resultado con user y token si es exitoso
 */
export async function loginAdmin(
  usuario: string,
  password: string
): Promise<LoginResult> {
  try {
    // 1. Buscar usuario admin en la tabla administradores_sistema
    const { data: adminUser, error } = await supabaseAdmin
      .from('administradores_sistema')
      .select('*')
      .eq('usuario', usuario)
      .eq('estado', '1') // Solo usuarios activos
      .single();

    if (error || !adminUser) {
      console.error('Usuario no encontrado:', error);
      return {
        success: false,
        error: 'Usuario o contraseña incorrectos'
      };
    }

    // 2. Verificar contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(password, adminUser.password);

    if (!passwordMatch) {
      console.error('Contraseña incorrecta');
      return {
        success: false,
        error: 'Usuario o contraseña incorrectos'
      };
    }

    // 3. Actualizar último acceso
    const { error: updateError } = await supabaseAdmin
      .from('administradores_sistema')
      .update({
        ultimo_acceso: new Date().toISOString(),
        // ip_ultimo_acceso se actualizará desde el API route
      })
      .eq('id', adminUser.id);

    if (updateError) {
      console.error('Error actualizando último acceso:', updateError);
    }

    // 4. Generar token JWT
    console.log('🔑 [AUTH] Generando token JWT...');
    const token = jwt.sign(
      {
        id: adminUser.id,
        usuario: adminUser.usuario,
        rol: adminUser.rol,
        email: adminUser.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    console.log('🔑 [AUTH] Token generado exitosamente:', token ? '✅ (longitud: ' + token.length + ')' : '❌ FALLÓ');
    console.log('🔑 [AUTH] Token preview:', token.substring(0, 50) + '...');

    // 5. Retornar usuario sin password
    const userWithoutPassword: Omit<AdminUser, 'password'> = {
      id: adminUser.id,
      usuario: adminUser.usuario,
      nombre: adminUser.nombre,
      email: adminUser.email,
      rol: adminUser.rol,
      estado: adminUser.estado,
      ultimo_acceso: adminUser.ultimo_acceso,
      ip_ultimo_acceso: adminUser.ip_ultimo_acceso,
      fecha_creacion: adminUser.fecha_creacion,
      fecha_actualizacion: adminUser.fecha_actualizacion
    };

    console.log('🔑 [AUTH] Retornando resultado del login...');
    
    return {
      success: true,
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Error en loginAdmin:', error);
    return {
      success: false,
      error: 'Error al autenticar. Intente nuevamente.'
    };
  }
}

interface JwtPayload {
  id: number;
  usuario: string;
  rol: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Verifica un token JWT
 * @param token - Token JWT a verificar
 * @returns true si el token es válido y el usuario está activo
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Verificar que el usuario aún esté activo en la base de datos
    const { data: user, error } = await supabaseAdmin
      .from('administradores_sistema')
      .select('estado')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return false;
    }

    return user.estado === '1';
  } catch (error) {
    // Token expirado o inválido
    console.error('Error verificando token:', error);
    return false;
  }
}

/**
 * Obtiene datos del usuario desde el token
 * @param token - Token JWT
 * @returns Datos del usuario sin contraseña, o null si el token es inválido
 */
export async function getAdminFromToken(
  token: string
): Promise<Omit<AdminUser, 'password'> | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const { data: user, error } = await supabaseAdmin
      .from('administradores_sistema')
      .select('id, usuario, nombre, email, rol, estado, ultimo_acceso, fecha_creacion, fecha_actualizacion, ip_ultimo_acceso')
      .eq('id', decoded.id)
      .eq('estado', '1')
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error obteniendo admin desde token:', error);
    return null;
  }
}

/**
 * Genera un hash de contraseña con bcrypt
 * @param password - Contraseña en texto plano
 * @returns Hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compara una contraseña con su hash
 * @param password - Contraseña en texto plano
 * @param hash - Hash almacenado
 * @returns true si coinciden
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Valida la fortaleza de una contraseña
 * @param password - Contraseña a validar
 * @returns true si cumple los requisitos
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Debe contener al menos una minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Debe contener al menos un carácter especial');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
