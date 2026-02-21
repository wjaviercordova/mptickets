<?php
require 'conexion.php';

@session_start(); 

if (!$_SESSION) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit();
}

header('Content-Type: application/json');

try {
    // CONDICIONES ÚNICAS REQUERIDAS:
    // 1. Perdida != '1' (tarjeta activa)
    // 2. Estado = '0' (tarjeta disponible) 
    // 3. Tipo = 'LIBRE' (tarjeta libre)
    
    error_log("=== CONSULTA SIMPLIFICADA DE TARJETAS DISPONIBLES ===");
    
    $sql = "SELECT CodigoX, Codigo, CodTarjeta, Estado, Tipo, Perdida 
            FROM tarjetas 
            WHERE Perdida != '1' 
            AND Estado = '0' 
            AND Tipo = 'LIBRE'
            AND CodigoX IS NOT NULL 
            AND CodigoX != ''
            ORDER BY CodigoX ASC";
    
    error_log("SQL ejecutada: " . $sql);
    
    $resultado = $mysqli->query($sql);
    $available_cards = [];
    
    if ($resultado && $resultado->num_rows > 0) {
        while ($row = $resultado->fetch_assoc()) {
            // Verificar si tiene registros pendientes de pago
            $codTarjeta = $row['CodTarjeta'];
            $sql_pending = "SELECT Estado FROM codigos 
                           WHERE CodTarjeta = '$codTarjeta' 
                           ORDER BY CodBarra DESC LIMIT 1";
            
            $resultado_pending = $mysqli->query($sql_pending);
            $can_use = true;
            
            if ($resultado_pending && $resultado_pending->num_rows > 0) {
                $ultimo_registro = $resultado_pending->fetch_assoc();
                if ($ultimo_registro['Estado'] == '0') {
                    // Tiene un registro sin pagar, no puede usarse
                    $can_use = false;
                    error_log("Tarjeta " . $row['CodigoX'] . " tiene pago pendiente - EXCLUIDA");
                }
            }
            
            if ($can_use) {
                $available_cards[] = [
                    'CodigoX' => trim($row['CodigoX']),  // Para procesar funcionalmente
                    'Codigo' => trim($row['Codigo'])     // Para mostrar visualmente
                ];
                error_log("Tarjeta INCLUIDA: CodigoX=" . $row['CodigoX'] . ", Codigo=" . $row['Codigo']);
            }
        }
    }
    
    error_log("=== RESULTADO FINAL ===");
    error_log("Total tarjetas disponibles: " . count($available_cards));
    error_log("Lista completa: " . json_encode($available_cards));
    
    // Debug específico para la tarjeta '13' si existe
    $sql_debug = "SELECT * FROM tarjetas WHERE CodigoX = '13' OR Codigo = '13'";
    $resultado_debug = $mysqli->query($sql_debug);
    
    if ($resultado_debug && $resultado_debug->num_rows > 0) {
        $tarjeta_debug = $resultado_debug->fetch_assoc();
        error_log("=== DEBUG TARJETA '13' ===");
        error_log("CodigoX: '" . $tarjeta_debug['CodigoX'] . "'");
        error_log("Codigo: '" . $tarjeta_debug['Codigo'] . "'");
        error_log("Estado: '" . $tarjeta_debug['Estado'] . "'");
        error_log("Tipo: '" . $tarjeta_debug['Tipo'] . "'");
        error_log("Perdida: '" . $tarjeta_debug['Perdida'] . "'");
        error_log("CodTarjeta: '" . $tarjeta_debug['CodTarjeta'] . "'");
        
        // Verificar condiciones
        $cumple_perdida = ($tarjeta_debug['Perdida'] != '1');
        $cumple_estado = ($tarjeta_debug['Estado'] == '0');
        $cumple_tipo = ($tarjeta_debug['Tipo'] == 'LIBRE');
        
        error_log("Cumple Perdida != '1': " . ($cumple_perdida ? "SÍ" : "NO"));
        error_log("Cumple Estado = '0': " . ($cumple_estado ? "SÍ" : "NO"));
        error_log("Cumple Tipo = 'LIBRE': " . ($cumple_tipo ? "SÍ" : "NO"));
        
        if ($cumple_perdida && $cumple_estado && $cumple_tipo) {
            error_log("La tarjeta '13' CUMPLE todas las condiciones básicas");
        } else {
            error_log("La tarjeta '13' NO CUMPLE las condiciones básicas");
        }
    }
    
    echo json_encode($available_cards);
    
} catch (Exception $e) {
    error_log("ERROR en get_available_cards.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor: ' . $e->getMessage()]);
}
?>