/**
 * Script para crear el primer usuario superadmin
 * Ejecuta este archivo con: node scripts/create-superadmin.js
 */

const bcrypt = require('bcryptjs');

async function generateAdminUser() {
  const password = 'Admin123!'; // Cambia esta contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('\n=== CREAR USUARIO SUPERADMIN ===\n');
  console.log('Ejecuta este SQL en Supabase SQL Editor:\n');
  console.log(`
INSERT INTO administradores_sistema (
  usuario,
  password,
  nombre,
  email,
  rol,
  estado,
  fecha_creacion,
  fecha_actualizacion
) VALUES (
  'superadmin',
  '${hashedPassword}',
  'Administrador Principal',
  'admin@mptickets.com',
  'superadmin',
  '1',
  NOW(),
  NOW()
);
  `);
  
  console.log('\n=== CREDENCIALES DE ACCESO ===\n');
  console.log('URL:      http://localhost:3000/admin/login');
  console.log('Usuario:  superadmin');
  console.log('Password: Admin123!');
  console.log('\n⚠️  CAMBIA LA CONTRASEÑA después del primer acceso\n');
}

generateAdminUser().catch(console.error);
