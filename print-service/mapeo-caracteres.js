/**
 * MÓDULO DE MAPEO DE CARACTERES PARA IMPRESORAS TÉRMICAS
 * 
 * Este módulo convierte caracteres especiales del español a códigos CP437
 * que funcionan correctamente en la mayoría de impresoras térmicas chinas.
 */

// Tabla de mapeo CP437 para caracteres especiales del español
const MAPA_CP437 = {
  // Vocales con tilde minúsculas
  'á': 0xA0,
  'é': 0x82,
  'í': 0xA1,
  'ó': 0xA2,
  'ú': 0xA3,
  
  // Vocales con tilde mayúsculas
  'Á': 0xB5,
  'É': 0x90,
  'Í': 0xD6,
  'Ó': 0xE0,
  'Ú': 0xE9,
  
  // Eñe
  'ñ': 0xA4,
  'Ñ': 0xA5,
  
  // U con diéresis
  'ü': 0x81,
  'Ü': 0x9A,
  
  // Símbolos de interrogación y exclamación
  '¿': 0xA8,
  '¡': 0xAD,
  
  // Otros símbolos comunes
  '°': 0xF8,  // Grado
  '¢': 0x9B,  // Centavo
  '£': 0x9C,  // Libra
  'ª': 0xA6,  // Ordinal femenino
  'º': 0xA7   // Ordinal masculino
};

/**
 * Convierte texto con caracteres especiales a Buffer usando mapeo CP437
 * @param {string} texto - Texto con tildes, ñ y caracteres especiales
 * @returns {Buffer} Buffer con los códigos correctos para impresoras térmicas
 */
function convertirTextoCP437(texto) {
  if (!texto) return Buffer.from('');
  
  const buffer = [];
  for (let i = 0; i < texto.length; i++) {
    const char = texto[i];
    
    // Si el carácter está en el mapa, usar su código
    if (MAPA_CP437[char] !== undefined) {
      buffer.push(MAPA_CP437[char]);
    } else {
      // Si es un carácter normal, usar su código ASCII
      buffer.push(texto.charCodeAt(i));
    }
  }
  
  return Buffer.from(buffer);
}

/**
 * Convierte múltiples líneas de texto
 * @param {string[]} lineas - Array de líneas de texto
 * @returns {Buffer} Buffer concatenado con todas las líneas
 */
function convertirLineasCP437(lineas) {
  return Buffer.concat(lineas.map(linea => convertirTextoCP437(linea + '\n')));
}

module.exports = {
  MAPA_CP437,
  convertirTextoCP437,
  convertirLineasCP437
};
