<?php
   
  require 'conexion.php';

  @session_start(); 

  if (!$_SESSION) {
		header("location:index.php");
		exit(); 
  } else { 
    //sino, calculamos el tiempo transcurrido 
    $fechaGuardada = $_SESSION["ultimoAcceso"]; 
    $ahora = date("Y-m-d H:i:s");
    $tiempo_transcurrido = (strtotime($ahora) - strtotime($fechaGuardada)); 
    if($tiempo_transcurrido >=3600) { 
      session_destroy(); // destruyo la sesión 
      header("Location: index.php"); //envío al usuario a la pag. de autenticación 
    }else { 
	  $_SESSION["ultimoAcceso"] = $ahora; 
   } 
} 

// Incluir funciones de impresión centralizadas
require_once 'funciones_impresion.php';

// AJAX Endpoint para obtener tarjetas disponibles
if (isset($_GET['action']) && $_GET['action'] === 'get_available_cards') {
    header('Content-Type: application/json');
    
    try {
        $sql = "SELECT Codigo, CodigoX FROM tarjetas WHERE Perdida='0' AND Estado='0' AND Tipo='LIBRE' ORDER BY Codigo ASC";
        $resultado = $mysqli->query($sql);
        
        $cards = [];
        if ($resultado && $resultado->num_rows > 0) {
            while ($row = $resultado->fetch_assoc()) {
                $cards[] = [
                    'Codigo' => $row['Codigo'],
                    'CodigoX' => $row['CodigoX']
                ];
            }
        }
        
        echo json_encode(['success' => true, 'data' => $cards]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// AJAX Endpoint para registrar ingreso
if (isset($_POST['action']) && $_POST['action'] === 'register_entry') {
    header('Content-Type: application/json');
    ob_clean();
    
    try {
        $codigo = $_POST['tarjeta'] ?? '';
        $tipoa = $_POST['tipo'] ?? '';
        $imprimirTicket = isset($_POST['imprimir_ticket']) && $_POST['imprimir_ticket'] === 'true';
        
        if (empty($codigo) || empty($tipoa)) {
            echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
            exit;
        }
        
        $hoyfecha = date("Y-m-d H:i:s");
        $hoyvacio = "1900-01-01 00:00:00";
        
        // Consultar tarjeta
        $sql = "SELECT * FROM tarjetas WHERE Codigo='$codigo' OR CodigoX='$codigo'";
        $resultado = $mysqli->query($sql);
        
        if (!$resultado) {
            echo json_encode(['success' => false, 'error' => 'Error en consulta de base de datos']);
            exit;
        }
        
        $row = $resultado->fetch_assoc();
        if ($row == NULL) {
            echo json_encode(['success' => false, 'error' => 'TARJETA NO ENCONTRADA']);
            exit;
        }
        
        $estadotarjeta = $row['Estado'];
        $estadoperdida = $row['Perdida'];
        $tipotarjeta = trim($row['Tipo']);
        $codtarjeta = $row['CodTarjeta'];
        $codigotarjeta = !empty($row['Codigo']) ? $row['Codigo'] : $row['CodigoX'];
        
        // Verificar si la tarjeta está perdida
        if ($estadoperdida == '1') {
            echo json_encode(['success' => false, 'error' => 'TARJETA INACTIVA']);
            exit;
        }
        
        // Verificar último registro para ver si está pagado
        $sql_ultimo = "SELECT * FROM codigos WHERE CodTarjeta='$codtarjeta' ORDER BY CodBarra DESC LIMIT 1";
        $resultado_ultimo = $mysqli->query($sql_ultimo);
        
        if ($resultado_ultimo && $resultado_ultimo->num_rows > 0) {
            $ultimo_reg = $resultado_ultimo->fetch_assoc();
            if ($ultimo_reg['Estado'] == '0') {
                echo json_encode(['success' => false, 'error' => 'TARJETA NO PAGADA']);
                exit;
            }
        }
        
        if ($tipotarjeta != 'LIBRE') {
            echo json_encode(['success' => false, 'error' => 'TARJETA NO PAGADA']);
            exit;
        }
        
        // Registrar ingreso
        $sql = "INSERT INTO codigos (CodTarjeta, Tipo, Codigo, HoraEntrada, HoraSalida, Estado, LogUsuario) VALUES ('$codtarjeta','$tipoa','$codigo','$hoyfecha','$hoyvacio','0','".$_SESSION["usuario"]."')";
        $resultado_insert = $mysqli->query($sql);
        
        if (!$resultado_insert) {
            echo json_encode(['success' => false, 'error' => 'Error al registrar en base de datos']);
            exit;
        }
        
        // Actualizar estado de tarjeta
        $ultimahora = date("Y-m-d H:i:s");
        $sql_update = "UPDATE tarjetas SET Estado='1', UltimaActualizacion='$ultimahora', Tipo='$tipoa' WHERE Codigo='$codigo' OR CodigoX='$codigo'";
        $resultado_update = $mysqli->query($sql_update);
        
        // Obtener datos del registro recién creado para respuesta
        $sql_new = "SELECT * FROM codigos WHERE 1 ORDER BY CodBarra DESC LIMIT 1";
        $resultado_new = $mysqli->query($sql_new);
        $new_record = $resultado_new->fetch_assoc();
        
        $response_data = [
            'success' => true,
            'message' => 'REGISTRO EXITOSO',
            'registro' => [
                'tarjeta' => $codigotarjeta,
                'tipo' => $tipoa,
                'hora_entrada' => date('H:i:s', strtotime($hoyfecha)),
                'estado' => 'Ingresado'
            ]
        ];
        
        // Imprimir ticket si está solicitado
        if ($imprimirTicket) {
            $datos = [
                "tipo" => "ENTRADA",
                "datos" => [
                    "fecha" => date("d.m.Y"),
                    "hora" => date("H:i:s"),
                    "numero" => $codigotarjeta
                ]
            ];
            
            $impresionExitosa = enviarASocket($datos);
            $response_data['impresion_exitosa'] = $impresionExitosa;
            
            if (!$impresionExitosa) {
                error_log("Fallo al imprimir ticket para tarjeta: " . $codigotarjeta);
            }
        }
        
        echo json_encode($response_data);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        error_log("Excepción al registrar ingreso: " . $e->getMessage());
    }
    exit;
}

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MiParkingSoft - Ingreso</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome 6 -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet">
    <!-- DataTables -->
    <link href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    <!-- SweetAlert2 -->
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11.10.1/dist/sweetalert2.min.css" rel="stylesheet">
    <!-- Fuentes del proyecto -->
    <link rel="stylesheet" href="css/fuentes.css">
    <link rel="stylesheet" href="fonts/style.css">
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="assets/favicon1.png">
    
    <style>
        /* Fuentes Oswald para el proyecto */
        @font-face {
            font-family: 'OswaldL';
            src: url('fonts/Oswald-Light.woff') format('woff'),
                 url('fonts/Oswald-Light.ttf') format('truetype');
            font-weight: 300;
            font-style: normal;
        }
        
        @font-face {
            font-family: 'Oswald-Medium';
            src: url('fonts/Oswald-Medium.woff') format('woff'),
                 url('fonts/Oswald-Medium.ttf') format('truetype');
            font-weight: 500;
            font-style: normal;
        }
        
        @font-face {
            font-family: 'Exo2-Light';
            src: url('fonts/Exo2-Light.woff') format('woff'),
                 url('fonts/Exo2-Light.ttf') format('truetype');
            font-weight: 300;
            font-style: normal;
        }
        
        @font-face {
            font-family: 'Exo2-Regular';
            src: url('fonts/Exo2-Regular.woff') format('woff'),
                 url('fonts/Exo2-Regular.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
        }
        
        @font-face {
            font-family: 'Oswald-Regular';
            src: url('fonts/Oswald-Regular.woff') format('woff'),
                 url('fonts/Oswald-Regular.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
        }

        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --accent-color: #e74c3c;
            --success-color: #27ae60;
            --warning-color: #f39c12;
            --light-bg: #f8f9fa;
            --dark-text: #2c3e50;
            --light-text: #6c757d;
            --border-color: #dee2e6;
            --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        body {
            font-family: 'OswaldL', sans-serif;
            font-weight: 300;
            background-color: var(--light-bg);
            color: var(--dark-text);
        }

        /* Navbar */
        .navbar-custom {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            padding: 1rem 0;
            box-shadow: var(--card-shadow);
        }

        .navbar-brand {
            font-family: 'Oswald-Medium', sans-serif;
            font-weight: 500;
            font-size: 1.5rem;
            color: white !important;
            letter-spacing: 1px;
        }

        .user-info {
            color: white;
            font-family: 'OswaldL', sans-serif;
            font-weight: 300;
            letter-spacing: 0.5px;
        }

        /* Main Content */
        .main-container {
            padding: 2rem 0;
            min-height: calc(100vh - 76px);
        }

        .page-title {
            font-family: 'Oswald-Medium', sans-serif;
            font-weight: 500;
            font-size: 2rem;
            color: var(--primary-color);
            text-align: center;
            margin-bottom: 2rem;
            letter-spacing: 1px;
        }

        /* Card Styling */
        .card-custom {
            border: none;
            border-radius: 15px;
            box-shadow: var(--card-shadow);
            margin-bottom: 2rem;
            background: white;
        }

        .card-header-custom {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border-radius: 15px 15px 0 0 !important;
            padding: 1rem 1.5rem;
            border: none;
        }

        .card-header-custom h5 {
            font-family: 'Oswald-Regular', sans-serif;
            font-weight: 400;
            margin: 0;
            letter-spacing: 1px;
            font-size: 1.1rem;
        }

        /* Form Styling */
        .form-control-custom {
            border: 2px solid var(--border-color);
            border-radius: 10px;
            padding: 12px 15px;
            font-family: 'OswaldL', sans-serif;
            font-weight: 300;
            font-size: 1.1rem;
            transition: all 0.3s ease;
        }

        .form-control-custom:focus {
            border-color: var(--secondary-color);
            box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
        }

        /* Select specific styling */
        select.form-control-custom {
            cursor: pointer;
            position: relative;
            z-index: 1000;
        }

        select.form-control-custom option {
            padding: 10px;
            background-color: white;
            color: #333;
        }

        select.form-control-custom:focus {
            z-index: 1001;
        }

        /* Error and success message styling */
        .alert-danger {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            border: none;
            color: white;
            border-radius: 8px;
            font-family: 'OswaldM', sans-serif;
            animation: slideDown 0.3s ease-out;
        }

        .alert-success {
            background: linear-gradient(135deg, #27ae60, #229954);
            border: none;
            color: white;
            border-radius: 8px;
            font-family: 'OswaldM', sans-serif;
            animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .form-control-custom.is-invalid {
            border-color: #e74c3c;
            animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        .input-group-text-custom {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            border-radius: 10px 0 0 10px;
        }

        /* Estilo específico para el botón de selección de tarjetas - esquinas redondeadas solo en la derecha */
        #cardSelectorBtn {
            border-radius: 0 10px 10px 0 !important;
        }

        /* Button Styling */
        .btn-register {
            background: linear-gradient(135deg, var(--success-color), #2ecc71);
            border: none;
            border-radius: 10px;
            padding: 12px 30px;
            font-family: 'Oswald-Medium', sans-serif;
            font-weight: 500;
            font-size: 1.1rem;
            color: white;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            width: 100%;
        }

        .btn-register:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 15px rgba(46, 204, 113, 0.3);
            color: white;
        }

        /* Alert Styling */
        .alert-custom {
            border: none;
            border-radius: 10px;
            font-family: 'OswaldL', sans-serif;
            font-weight: 300;
            letter-spacing: 0.5px;
        }

        .alert-error {
            background-color: #fee;
            color: var(--accent-color);
            border-left: 4px solid var(--accent-color);
        }

        .alert-success {
            background-color: #edf7ed;
            color: var(--success-color);
            border-left: 4px solid var(--success-color);
        }

        /* Table Styling */
        .table-custom {
            border-radius: 10px;
            overflow: hidden;
            box-shadow: var(--card-shadow);
        }

        .table-custom thead th {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            font-family: 'Oswald-Medium', sans-serif;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: none;
            padding: 1rem;
        }

        .table-custom tbody td {
            font-family: 'OswaldL', sans-serif;
            font-weight: 300;
            padding: 1rem;
            vertical-align: middle;
            border-color: var(--border-color);
        }

        /* Status badges */
        .status-badge {
            font-family: 'Oswald-Medium', sans-serif;
            font-weight: 500;
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-ingresado {
            background-color: #fff3cd;
            color: #856404;
        }

        .status-pagado {
            background-color: #d4edda;
            color: #155724;
        }

        /* Clock Widget - Idéntico a inicio.php */
        .clock-widget {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .clock-widget::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            transform: rotate(45deg);
        }
        
        .days-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-family: 'OswaldL', sans-serif;
            font-size: 0.75rem;
            letter-spacing: 1px;
            font-weight: 300;
        }
        
        .day-cell {
            font-family: 'OswaldL', sans-serif;
            font-weight: 300;
            letter-spacing: 1px;
            flex: 1;
            padding: 5px 2px;
            background: rgba(255,255,255,0.1);
            margin: 0 1px;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        .day-cell.active {
            background: rgba(255,255,255,0.3);
            transform: scale(1.1);
        }
        
        .time-container {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
            position: relative;
            z-index: 2;
        }
        
        .clock-icon {
            font-size: 1.5rem;
            margin-right: 15px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .time-display {
            font-family: 'OswaldL', sans-serif;
            font-size: 3rem;
            font-weight: 300;
            letter-spacing: 2px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .time-separator {
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
        }
        
        .seconds-ampm {
            display: flex;
            flex-direction: column;
            margin-left: 10px;
            align-items: center;
        }
        
        .ampm-display {
            font-family: 'OswaldL', sans-serif;
            font-size: 0.8rem;
            font-weight: 300;
            letter-spacing: 1px;
        }
        
        .seconds-display {
            font-family: 'OswaldR', sans-serif;
            font-size: 0.9rem;
            margin-top: 2px;
        }

        .date-display {
            font-family: 'OswaldL', sans-serif;
            font-size: 1rem;
            font-weight: 300;
            letter-spacing: 1px;
            opacity: 0.95;
            background: rgba(255,255,255,0.1);
            padding: 8px 15px;
            border-radius: 20px;
            position: relative;
            z-index: 2;
        }

        /* Checkbox styling */
        .form-check-custom {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1rem;
        }

        .form-check-input-custom {
            width: 1.2em;
            height: 1.2em;
        }

        .form-check-label-custom {
            font-family: 'OswaldL', sans-serif;
            font-weight: 300;
            color: var(--dark-text);
        }

        /* Mobile card view for table */
        .mobile-card-view {
            display: none;
        }
        
        .mobile-info-view {
            display: none;
        }
        
        .card-info {
            background: white;
            border-radius: 12px;
            padding: 1rem;
            box-shadow: var(--card-shadow);
            border-left: 4px solid var(--secondary-color);
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.4rem 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-family: 'Oswald-Regular', sans-serif;
            font-weight: 400;
            color: var(--dark-text);
            font-size: 0.9rem;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            font-family: 'OswaldL', sans-serif;
            font-weight: 300;
            color: var(--primary-color);
            font-size: 1rem;
            text-align: right;
            max-width: 60%;
        }
        
        .info-value.status {
            padding: 0.25rem 0.75rem;
            border-radius: 15px;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value.status.ingresado {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .info-value.status.pagado {
            background-color: #d4edda;
            color: #155724;
        }
        
        .no-data-mobile {
            text-align: center;
            padding: 2rem;
            color: var(--light-text);
        }
        
        .no-data-mobile i {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .main-container {
                padding: 1rem 0;
            }
            
            .page-title {
                font-size: 1.5rem;
            }
            
            .clock-display {
                font-size: 2rem;
            }
            
            .card-custom {
                margin-bottom: 1rem;
            }
            
            /* Ocultar vista desktop y mostrar vista móvil */
            .parking-info-desktop {
                display: none !important;
            }
            
            .mobile-info-view {
                display: block !important;
            }
        }

        /* Sidebar Styles */
        .sidebar {
            position: fixed;
            top: 0;
            left: -300px;
            width: 300px;
            height: 100vh;
            background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
            transition: left 0.3s ease;
            z-index: 1050;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
        }

        .sidebar.active {
            left: 0;
        }

        .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 1040;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .sidebar-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .sidebar-header {
            padding: 20px;
            color: white;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }

        .sidebar-header h5 {
            margin: 0;
            font-family: 'Oswald-Medium', 'OswaldM', sans-serif;
            font-weight: 500;
            letter-spacing: 1px;
        }

        .sidebar-close {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .sidebar-menu {
            padding: 0;
            margin: 0;
            list-style: none;
        }

        .sidebar-menu-item {
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .sidebar-menu-link {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            color: white;
            text-decoration: none;
            transition: all 0.3s ease;
            font-family: 'OswaldL', sans-serif;
            font-weight: 300;
            letter-spacing: 0.5px;
        }

        .sidebar-menu-link:hover {
            background: rgba(255,255,255,0.1);
            color: white;
        }

        .sidebar-menu-link i {
            margin-right: 15px;
            width: 20px;
            text-align: center;
        }

        .sidebar-submenu {
            list-style: none;
            padding: 0;
            margin: 0;
            background: rgba(0,0,0,0.2);
        }

        .sidebar-submenu-link {
            display: block;
            padding: 10px 20px 10px 55px;
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            font-family: 'OswaldL', sans-serif;
            font-weight: 300;
            letter-spacing: 0.5px;
        }

        .sidebar-submenu-link:hover {
            background: rgba(255,255,255,0.1);
            color: white;
        }

        .menu-toggle {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
        }

        /* Floating Action Button */
        .fab-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            border: none;
            border-radius: 50%;
            color: white;
            font-family: 'Oswald-Medium', sans-serif;
            font-weight: 500;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 8px 20px rgba(231, 76, 60, 0.4);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
        }

        .fab-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 25px rgba(231, 76, 60, 0.6);
            background: linear-gradient(135deg, #c0392b, #a93226);
            color: white;
            text-decoration: none;
        }

        .fab-button:active {
            transform: translateY(-1px);
            box-shadow: 0 6px 15px rgba(231, 76, 60, 0.5);
        }

        .fab-button i {
            font-size: 1.5rem;
            margin-bottom: 2px;
        }

        /* Animación de pulso para llamar la atención */
        .fab-button::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 50%;
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            z-index: -1;
            animation: pulse-ring 2s infinite;
            opacity: 0;
        }

        @keyframes pulse-ring {
            0% {
                transform: scale(1);
                opacity: 0.6;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.3;
            }
            100% {
                transform: scale(1.2);
                opacity: 0;
            }
        }

        /* Ajustes responsivos para el FAB */
        @media (max-width: 768px) {
            .fab-button {
                width: 60px;
                height: 60px;
                bottom: 20px;
                right: 20px;
                font-size: 0.8rem;
            }
            
            .fab-button i {
                font-size: 1.3rem;
            }
        }

        @media (max-width: 480px) {
            .fab-button {
                bottom: 15px;
                right: 15px;
            }
        }

        /* Modal de Tarjetas */
        .card-selector-modal .modal-dialog {
            max-width: 90vw;
            margin: 1rem auto;
        }

        .card-selector-modal .modal-content {
            border-radius: 15px;
            border: none;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .card-selector-modal .modal-header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border-radius: 15px 15px 0 0;
            padding: 1rem 1.5rem;
        }

        .card-selector-modal .modal-title {
            font-family: 'Oswald-Medium', sans-serif;
            font-weight: 500;
            letter-spacing: 1px;
        }

        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 15px;
            padding: 20px;
            max-height: 60vh;
            overflow-y: auto;
        }

        .card-option {
            background: white url('assets/bg_card1.jpg') center/cover no-repeat;
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'OswaldL', sans-serif;
            font-weight: 300;
            position: relative;
            min-height: 80px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            overflow: hidden;
        }

        .card-option::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            transition: all 0.3s ease;
        }

        .card-option:hover {
            transform: translateY(-3px);
            border-color: var(--secondary-color);
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
        }

        .card-option:hover::before {
            background: rgba(52, 152, 219, 0.2);
        }

        .card-option.selected {
            background: url('assets/bg_card1.jpg') center/cover no-repeat;
            color: white;
            border-color: var(--secondary-color);
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
        }

        .card-option.selected::before {
            background: rgba(52, 152, 219, 0.4);
        }

        .card-option-icon {
            font-size: 1.5rem;
            margin-bottom: 5px;
            color: white;
            position: relative;
            z-index: 2;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }

        .card-option.selected .card-option-icon {
            color: white;
        }

        .card-option-code {
            font-size: 0.9rem;
            font-weight: 400;
            word-break: break-all;
            position: relative;
            z-index: 2;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            font-weight: 500;
        }

        .loading-cards {
            text-align: center;
            padding: 40px;
            color: var(--light-text);
        }

        .loading-cards i {
            font-size: 2rem;
            margin-bottom: 10px;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .no-cards-available {
            text-align: center;
            padding: 40px;
            color: var(--light-text);
        }

        .no-cards-available i {
            font-size: 3rem;
            margin-bottom: 15px;
            opacity: 0.5;
        }

        /* Responsive para modal */
        @media (max-width: 768px) {
            .cards-grid {
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 10px;
                padding: 15px;
            }

            .card-option {
                padding: 10px;
                min-height: 70px;
            }

            .card-option-icon {
                font-size: 1.2rem;
            }

            .card-option-code {
                font-size: 0.8rem;
            }
        }
    </style>
</head>
<body>
<?php

    // Incluir funciones de impresión centralizadas
    require_once 'funciones_impresion.php';

	function numticket($numero,$n) {
	  return str_pad((int) $numero,$n,'0',STR_PAD_LEFT);
	}

/***Tipo de vehiculos***/
	$sql = "SELECT Tipovehiculo, Prioridad FROM parametros";
	$resultadotipo = $mysqli->query($sql);
/***Registro Correcto de Tarjeta***/
    $where = "";
    $sql = "";
    $resultado="";
    $estadodt = 0;

	if(!empty($_POST))
	{
		$valor = $_POST['tarjeta'];
		if(!empty($valor)){
			//$where = "WHERE CodBarra LIKE '%$valor'";
			$where = "WHERE 1 ORDER BY CodBarra DESC LIMIT 1";
			$sql = "SELECT * FROM codigos $where";
	        $resultado = $mysqli->query($sql);
	        $rowdt = $resultado->fetch_assoc();
			if($rowdt == NULL) {
			        $estadodt = 0; 
			} else {	
			    	$estadodt = 1;
			}    	
		} else {
			$where = "WHERE 1 ORDER BY CodBarra DESC LIMIT 1";
			$sql = "SELECT * FROM codigos $where";
	        $resultado = $mysqli->query($sql);
		}
	} else {
		$where = "WHERE 1 ORDER BY CodBarra DESC LIMIT 1";
		$sql = "SELECT * FROM codigos $where";
	    $resultado = $mysqli->query($sql);
		$rowdt = $resultado->fetch_assoc();
		if($rowdt == NULL) {
			        $estadodt = 0; 
		} else {	
			    	$estadodt = 1;
		} 
	}
$bandera = 0;
$mensaje = "";

if  ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['tarjeta']) && !empty($_POST['tarjeta']))
{
    //date_default_timezone_set('America/Lima');
	$fecha = date("d.m.Y");
	$hora =  date("H:i:s");
	$tipoa = $_POST['tipo'];
	$codigo = $_POST['tarjeta'];
	$hoyfecha = date("Y-m-d H:i:s");
	$hoyvacio = "1900-01-01 00:00:00";
    // Consultar tarjeta
    $sql = "SELECT * FROM tarjetas WHERE Codigo='$codigo' OR CodigoX='$codigo'";
    $resultado = $mysqli->query($sql);
    
    if($resultado) {
        $row = $resultado->fetch_assoc();
        if($row == NULL) {
            $mensaje = "TARJETA NO ENCONTRADA";
            $bandera = 2;
            $estadodt = 0; 
        } else {	
            $estadotarjeta = $row['Estado'];
            $estadoperdida = $row['Perdida'];
            $tipotarjeta = trim($row['Tipo']);
            $codtarjeta = $row['CodTarjeta'];
            
            // Usar Codigo si existe, sino usar CodigoX para impresión
            $codigotarjeta = !empty($row['Codigo']) ? $row['Codigo'] : $row['CodigoX'];
            
            // Verificar si la tarjeta está perdida
            if($estadoperdida == '1') {
               $mensaje = "TARJETA INACTIVA";
               $bandera = 2;
               $estadodt = 0;
            } else {
                // Verificar SOLO el último registro para ver si está pagado
                $sql_ultimo = "SELECT * FROM codigos WHERE CodTarjeta='$codtarjeta' ORDER BY CodBarra DESC LIMIT 1";
                $resultado_ultimo = $mysqli->query($sql_ultimo);
                
                if($resultado_ultimo && $resultado_ultimo->num_rows > 0) {
                    $ultimo_reg = $resultado_ultimo->fetch_assoc();
                    if($ultimo_reg['Estado'] == '0') {
                        $mensaje = "TARJETA NO PAGADA";
                        $bandera = 2;
                        $estadodt = 0;
                    } else {
                        // Continuar con validación de tipo si no hubo errores en pagos pendientes
                        if($bandera != 2) {
                            if ($tipotarjeta != 'LIBRE') {
                                $mensaje = "TARJETA NO PAGADA";
                                $bandera = 2;
                                $estadodt = 0;
                            } else {
                                $bandera = 1;
                                $sql = "INSERT INTO codigos (CodTarjeta, Tipo, Codigo, HoraEntrada, HoraSalida, Estado, LogUsuario) VALUES ('$codtarjeta','$tipoa','$codigo','$hoyfecha','$hoyvacio','0','".$_SESSION["usuario"]."')";
                                $resultado = $mysqli->query($sql);
                                
                                if($resultado) {
                                    $ultimahora = date("Y-m-d H:i:s");
                                    $sql_update = "UPDATE tarjetas SET Estado='1', UltimaActualizacion='$ultimahora', Tipo='$tipoa' WHERE Codigo='$codigo' OR CodigoX='$codigo'";
                                    $resultado_update = $mysqli->query($sql_update);
                                }
                                $where = "WHERE 1 ORDER BY CodBarra DESC LIMIT 1";
                                $sql = "SELECT * FROM codigos $where";
                                $resultado = $mysqli->query($sql);
                                
                                $mensaje = "*REGISTRO EXITOSO";
                            }
                        }
                    }
                } else {
                    // No hay registros previos, proceder normalmente
                    if($tipotarjeta != 'LIBRE') {
                        $mensaje = "TARJETA NO PAGADA";
                        $bandera = 2;
                        $estadodt = 0;
                    } else {
                        $bandera = 1;
                        $sql = "INSERT INTO codigos (CodTarjeta, Tipo, Codigo, HoraEntrada, HoraSalida, Estado, LogUsuario) VALUES ('$codtarjeta','$tipoa','$codigo','$hoyfecha','$hoyvacio','0','".$_SESSION["usuario"]."')";
                        $resultado = $mysqli->query($sql);
                        
                        if($resultado) {
                            $ultimahora = date("Y-m-d H:i:s");
                            $sql_update = "UPDATE tarjetas SET Estado='1', UltimaActualizacion='$ultimahora', Tipo='$tipoa' WHERE Codigo='$codigo' OR CodigoX='$codigo'";
                            $resultado_update = $mysqli->query($sql_update);
                        }
                        $where = "WHERE 1 ORDER BY CodBarra DESC LIMIT 1";
                        $sql = "SELECT * FROM codigos $where";
                        $resultado = $mysqli->query($sql);
                        
                        $mensaje = "*REGISTRO EXITOSO";
                    }
                }
            }
        }
    }
}

// Manejar valor preservado para autorefresh
$preserved_card_value = '';
if (isset($_GET['preserve_card']) && !empty($_GET['preserve_card'])) {
    $preserved_card_value = htmlspecialchars($_GET['preserve_card']);
}
?>

    <!-- Sidebar Overlay -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <h5><i class="fas fa-bars me-2"></i>Menú Principal</h5>
            <button class="sidebar-close" id="sidebarClose">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <ul class="sidebar-menu">
            <li class="sidebar-menu-item">
                <a href="inicio.php" class="sidebar-menu-link">
                    <i class="fas fa-home"></i>
                    <span>Inicio</span>
                </a>
            </li>
            
            <li class="sidebar-menu-item">
                <a href="ingreso.php" class="sidebar-menu-link">
                    <i class="fas fa-car-side"></i>
                    <span>Ingreso de Vehículos</span>
                </a>
            </li>
            
            <li class="sidebar-menu-item">
                <a href="pago.php" class="sidebar-menu-link">
                    <i class="fas fa-credit-card"></i>
                    <span>Pago y Salida</span>
                </a>
            </li>
            
            <li class="sidebar-menu-item">
                <a href="#" class="sidebar-menu-link" onclick="toggleSubmenu('consultasSubmenu')">
                    <i class="fas fa-search"></i>
                    <span>Consultas</span>
                    <i class="fas fa-chevron-down ms-auto"></i>
                </a>
                <ul class="sidebar-submenu" id="consultasSubmenu" style="display: none;">
                    <li><a href="tarjetas.php" class="sidebar-submenu-link">Tarjetas Emitidas</a></li>
                    <?php if ($_SESSION["permisos"] == "administrador") { ?>
                    <li><a href="valores.php" class="sidebar-submenu-link">Costos Registrados</a></li>
                    <?php } ?>
                </ul>
            </li>
            
            <?php if ($_SESSION["permisos"] == "administrador") { ?>
            <li class="sidebar-menu-item">
                <a href="#" class="sidebar-menu-link" onclick="toggleSubmenu('adminSubmenu')">
                    <i class="fas fa-cogs"></i>
                    <span>Administración</span>
                    <i class="fas fa-chevron-down ms-auto"></i>
                </a>
                <ul class="sidebar-submenu" id="adminSubmenu" style="display: none;">
                    <li><a href="tarjetasadm.php" class="sidebar-submenu-link">Gestión de Tarjetas</a></li>
                    <li><a href="usuarios.php" class="sidebar-submenu-link">Gestión de Usuarios</a></li>
                </ul>
            </li>
            <?php } ?>
        </ul>
    </div>

    <!-- Navbar -->
    <nav class="navbar navbar-custom">
        <div class="container-fluid">
            <div class="d-flex align-items-center">
                <button class="menu-toggle me-3" id="menuToggle">
                    <i class="fas fa-bars"></i>
                </button>
                <a href="inicio.php">
                    <img src="assets/selloindexmain.png" alt="Logo" height="45" class="me-3">
                </a>
            </div>
            <div class="d-flex align-items-center">
                <span class="user-info me-3">
                    <i class="fas fa-user-circle me-2"></i>
                    <?php echo $_SESSION["nombre"]; ?>
                </span>
            </div>
        </div>
    </nav>

    <div class="container-fluid main-container">
        <div class="row">
            <!-- Entry Form -->
            <div class="col-lg-7 col-xl-8">
                <form id="entryForm" method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">
                    <div class="card card-custom">
                        <div class="card-header card-header-custom">
                            <h5><i class="fas fa-qrcode me-2"></i>Registro de Ingreso</h5>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                <!-- Card Input -->
                                <div class="col-md-6">
                                    <label class="form-label">Código de Tarjeta</label>
                                    <div class="input-group">
                                        <span class="input-group-text input-group-text-custom">
                                            <i class="fas fa-barcode"></i>
                                        </span>
                                        <input type="text" 
                                               name="tarjeta" 
                                               id="tarjetaInput"
                                               class="form-control form-control-custom" 
                                               placeholder="Escanee o ingrese código"
                                               autocomplete="off"
                                               autofocus
                                               onkeyup="this.value=this.value.toUpperCase();"
                                               value="<?php echo $preserved_card_value; ?>"
                                               required>
                                        <span class="input-group-text input-group-text-custom" 
                                              id="cardSelectorBtn" 
                                              style="cursor: pointer;" 
                                              title="Seleccionar tarjeta de la lista">
                                            <i class="fas fa-credit-card"></i>
                                        </span>
                                    </div>
                                </div>

                                <!-- Vehicle Type -->
                                <div class="col-md-6">
                                    <label class="form-label">Tipo de Vehículo</label>
                                    <div class="input-group">
                                        <span class="input-group-text input-group-text-custom">
                                            <i class="fas fa-car"></i>
                                        </span>
                                        <select name="tipo" class="form-select form-control-custom" required>
                                            <?php 
                                                $resultadotipo->data_seek(0); // Reset pointer
                                                $option_count = 0;
                                                while ($rowtipo = mysqli_fetch_array($resultadotipo)) {
                                                    $selected = ($rowtipo['Prioridad'] == 'selected') ? 'selected' : '';
                                                    echo "<option value='".$rowtipo['Tipovehiculo']."' ".$selected.">".$rowtipo['Tipovehiculo']."</option>";
                                                    $option_count++;
                                                }
                                                
                                                // Debug: Si no hay opciones, agregar una por defecto
                                                if ($option_count == 0) {
                                                    echo "<option value='AUTOMOVIL' selected>AUTOMOVIL</option>";
                                                    echo "<option value='MOTOCICLETA'>MOTOCICLETA</option>";
                                                }
                                            ?>
                                        </select>
                                    </div>
                                </div>

                                <!-- Print Ticket Checkbox -->
                                <div class="col-12">
                                    <div class="form-check form-check-custom">
                                        <input type="checkbox" 
                                               id="ticketCheckbox" 
                                               name="ticketCheckbox" 
                                               class="form-check-input form-check-input-custom" 
                                               checked>
                                        <label class="form-check-label form-check-label-custom" for="ticketCheckbox">
                                            <i class="fas fa-print me-2"></i>
                                            Imprimir ticket de ingreso
                                        </label>
                                    </div>
                                </div>

                                <!-- Register Button -->
                                <div class="col-12">
                                    <button type="submit" name="registrar" class="btn btn-register">
                                        <i class="fas fa-plus-circle me-2"></i>
                                        Registrar Ingreso
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Advanced Clock Widget - Idéntico a inicio.php -->
            <div class="col-lg-5 col-xl-4">
                <div class="clock-widget">
                    <div class="days-header" id="days-header">
                        <div class="day-cell" id="day-lun">LUN</div>
                        <div class="day-cell" id="day-mar">MAR</div>
                        <div class="day-cell" id="day-mie">MIE</div>
                        <div class="day-cell" id="day-jue">JUE</div>
                        <div class="day-cell" id="day-vie">VIE</div>
                        <div class="day-cell" id="day-sab">SAB</div>
                        <div class="day-cell" id="day-dom">DOM</div>
                    </div>
                    
                    <div class="time-container">
                        <div class="clock-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="time-display">
                            <span id="hours">00</span>
                            <span class="time-separator">:</span>
                            <span id="minutes">00</span>
                        </div>
                        <div class="seconds-ampm">
                            <div class="ampm-display" id="ampm">AM</div>
                            <div class="seconds-display" id="seconds">00</div>
                        </div>
                    </div>
                    
                    <div class="date-display" id="current-date">Cargando fecha...</div>
                </div>
            </div>
        </div> 

        <!-- Card Information Table -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card card-custom">
                    <div class="card-header card-header-custom">
                        <h5><i class="fas fa-list me-2"></i>Información de Tarjeta Procesada</h5>
                    </div>
                    <div class="card-body">
                        <!-- Vista Desktop -->
                        <div class="parking-info-desktop">
                            <?php 
                            if ($estadodt==1) {
                                $where = "WHERE 1 ORDER BY CodBarra DESC LIMIT 1";
                                $sql = "SELECT * FROM codigos $where";
                                $resultado = $mysqli->query($sql);
                                $row = mysqli_fetch_array($resultado);
                                if($row) {
                                    $codigoX = $row['Codigo'];
                                    $sql1 = "SELECT * FROM tarjetas WHERE CodigoX='".$codigoX."'";
                                    $resultado1 = $mysqli->query($sql1);
                                    $row1 = $resultado1->fetch_assoc();
                                    ?>
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Tarjeta</label>
                                    <div class="input-group">
                                        <span class="input-group-text input-group-text-custom">
                                            <i class="fas fa-credit-card"></i>
                                        </span>
                                        <input type="text" 
                                               class="form-control form-control-custom" 
                                               value="<?php echo $row1['Codigo']; ?>" 
                                               readonly>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Hora Entrada</label>
                                    <div class="input-group">
                                        <span class="input-group-text input-group-text-custom">
                                            <i class="fas fa-sign-in-alt"></i>
                                        </span>
                                        <input type="text" 
                                               class="form-control form-control-custom" 
                                               value="<?php echo date('H:i:s', strtotime($row['HoraEntrada'])); ?>" 
                                               readonly>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Tipo Vehículo</label>
                                    <div class="input-group">
                                        <span class="input-group-text input-group-text-custom">
                                            <i class="fas fa-car"></i>
                                        </span>
                                        <input type="text" 
                                               class="form-control form-control-custom" 
                                               value="<?php echo $row['Tipo']; ?>" 
                                               readonly>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Estado</label>
                                    <div class="input-group">
                                        <span class="input-group-text input-group-text-custom">
                                            <i class="fas fa-info-circle"></i>
                                        </span>
                                        <input type="text" 
                                               class="form-control form-control-custom" 
                                               value="<?php echo ($row['Estado'] == 1) ? 'Pagado' : 'Ingresado'; ?>" 
                                               readonly>
                                    </div>
                                </div>
                            </div>
                            <?php 
                                } 
                            } else { ?>
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Tarjeta</label>
                                    <div class="input-group">
                                        <span class="input-group-text input-group-text-custom">
                                            <i class="fas fa-credit-card"></i>
                                        </span>
                                        <input type="text" 
                                               class="form-control form-control-custom" 
                                               value="Código de Tarjeta" 
                                               readonly>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Hora Entrada</label>
                                    <div class="input-group">
                                        <span class="input-group-text input-group-text-custom">
                                            <i class="fas fa-sign-in-alt"></i>
                                        </span>
                                        <input type="text" 
                                               class="form-control form-control-custom" 
                                               value="Hora de Entrada" 
                                               readonly>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Tipo Vehículo</label>
                                    <div class="input-group">
                                        <span class="input-group-text input-group-text-custom">
                                            <i class="fas fa-car"></i>
                                        </span>
                                        <input type="text" 
                                               class="form-control form-control-custom" 
                                               value="Tipo de Vehículo" 
                                               readonly>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Estado</label>
                                    <div class="input-group">
                                        <span class="input-group-text input-group-text-custom">
                                            <i class="fas fa-info-circle"></i>
                                        </span>
                                        <input type="text" 
                                               class="form-control form-control-custom" 
                                               value="Estado del Ticket" 
                                               readonly>
                                    </div>
                                </div>
                            </div>
                            <?php } ?>	
                        </div>
                        
                        <!-- Vista móvil optimizada -->
                        <div class="mobile-info-view">
                            <?php 
                            if ($estadodt==1) {
                                $where = "WHERE 1 ORDER BY CodBarra DESC LIMIT 1";
                                $sql = "SELECT * FROM codigos $where";
                                $resultado = $mysqli->query($sql);
                                while($row = mysqli_fetch_array($resultado)) { 
                                    $codigoX = $row['Codigo'];
                                    $sql1 = "SELECT * FROM tarjetas WHERE CodigoX='".$codigoX."'";
                                    $resultado1 = $mysqli->query($sql1);
                                    $row1 = $resultado1->fetch_assoc();?>
                                <div class="card-info">
                                    <div class="info-row">
                                        <span class="info-label"><i class="fas fa-credit-card me-2"></i>Tarjeta:</span>
                                        <span class="info-value"><strong><?php echo $row1['Codigo']; ?></strong></span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label"><i class="fas fa-sign-in-alt me-2"></i>Hora Entrada:</span>
                                        <span class="info-value"><?php echo date('H:i:s', strtotime($row['HoraEntrada'])); ?></span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label"><i class="fas fa-car me-2"></i>Tipo Vehículo:</span>
                                        <span class="info-value"><?php echo $row['Tipo']; ?></span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label"><i class="fas fa-info-circle me-2"></i>Estado:</span>
                                        <span class="info-value status <?php echo ($row['Estado'] == 1) ? 'pagado' : 'ingresado'; ?>">
                                            <?php echo ($row['Estado'] == 1) ? 'Pagado' : 'Ingresado'; ?>
                                        </span>
                                    </div>
                                </div>
                            <?php 
                                }
                            } else { ?>
                                <div class="no-data-mobile">
                                    <i class="fas fa-inbox"></i>
                                    <div><strong>No hay registros disponibles</strong></div>
                                    <small>Ingrese una tarjeta para ver la información</small>
                                </div>
                            <?php } ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Selección de Tarjetas -->
    <div class="modal fade card-selector-modal" id="cardSelectorModal" tabindex="-1" aria-labelledby="cardSelectorModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="cardSelectorModalLabel">
                        <i class="fas fa-credit-card me-2"></i>
                        Seleccionar Tarjeta Disponible
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-0">
                    <div id="cardsContainer">
                        <div class="loading-cards">
                            <i class="fas fa-spinner"></i>
                            <div><strong>Cargando tarjetas disponibles...</strong></div>
                            <small>Por favor espere un momento</small>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="fas fa-times me-1"></i>
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" id="confirmCardSelection" disabled>
                        <i class="fas fa-check me-1"></i>
                        Seleccionar Tarjeta
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Floating Action Button -->
    <a href="pago.php" class="fab-button" title="Ir a Pagar Ticket">
        <i class="fas fa-credit-card"></i>
    </a>

    <!-- Scripts -->
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
    <!-- Bootstrap 5 JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- SweetAlert2 JS -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.10.1/dist/sweetalert2.all.min.js"></script>
    <!-- DataTables -->
    <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>

    <script>
        // Variables globales
        let selectedCardCode = null;
        let isProcessing = false;
        
        // Configuración de SweetAlert2 Toast
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
        
        $(document).ready(function() {
            // Reloj avanzado en tiempo real - Idéntico a inicio.php
            function updateAdvancedClock() {
                const now = new Date();
                
                // Obtener componentes de tiempo
                let hours = now.getHours();
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();
                const dayOfWeek = now.getDay();
                
                // Formato 12 horas
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; // 0 se convierte en 12
                
                // Agregar ceros a la izquierda
                const hoursStr = hours.toString().padStart(2, '0');
                const minutesStr = minutes.toString().padStart(2, '0');
                const secondsStr = seconds.toString().padStart(2, '0');
                
                // Actualizar tiempo
                document.getElementById('hours').textContent = hoursStr;
                document.getElementById('minutes').textContent = minutesStr;
                document.getElementById('seconds').textContent = secondsStr;
                document.getElementById('ampm').textContent = ampm;
                
                // Actualizar día activo
                const days = ['day-dom', 'day-lun', 'day-mar', 'day-mie', 'day-jue', 'day-vie', 'day-sab'];
                days.forEach((day, index) => {
                    const element = document.getElementById(day);
                    if (element) {
                        if (index === dayOfWeek) {
                            element.classList.add('active');
                        } else {
                            element.classList.remove('active');
                        }
                    }
                });
                
                // Formato de fecha completa
                const dateOptions = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                };
                
                const dateElement = document.getElementById('current-date');
                if (dateElement) {
                    dateElement.textContent = now.toLocaleDateString('es-ES', dateOptions).toUpperCase();
                }
            }

            // Actualizar cada segundo
            updateAdvancedClock();
            setInterval(updateAdvancedClock, 1000);

            // Focus solo cuando sea necesario
            function focusCardInput() {
                $('input[name="tarjeta"]').focus();
            }
            
            // Focus inicial y posicionamiento del cursor
            $(document).ready(function() {
                const cardInput = $('input[name="tarjeta"]');
                if (cardInput.val()) {
                    // Si hay valor (de autorefresh), posicionar cursor al final
                    cardInput.focus();
                    const inputLength = cardInput.val().length;
                    cardInput[0].setSelectionRange(inputLength, inputLength);
                } else {
                    // Si no hay valor, focus normal
                    focusCardInput();
                }
            });

            // ==== MANEJO MODERNO DEL FORMULARIO CON AJAX ====
            $('form').on('submit', function(e) {
                e.preventDefault();
                
                if (isProcessing) return;
                
                const cardInput = $('input[name="tarjeta"]');
                const typeSelect = $('select[name="tipo"]');
                const ticketCheckbox = $('#ticketCheckbox');
                
                // Validaciones básicas
                if (!cardInput.val().trim()) {
                    cardInput.addClass('is-invalid');
                    cardInput.focus();
                    Toast.fire({
                        icon: 'warning',
                        title: 'Por favor ingrese el código de tarjeta'
                    });
                    return false;
                }
                
                if (!typeSelect.val()) {
                    typeSelect.addClass('is-invalid');
                    Toast.fire({
                        icon: 'warning',
                        title: 'Por favor seleccione el tipo de vehículo'
                    });
                    return false;
                }
                
                // Registrar ingreso vía AJAX
                registrarIngreso(cardInput.val(), typeSelect.val(), ticketCheckbox.is(':checked'));
            });

            // Remove validation classes on input
            $('input, select').on('input change', function() {
                $(this).removeClass('is-invalid');
            });
            
            // ==== FUNCIÓN PARA REGISTRAR INGRESO ====
            function registrarIngreso(codigo, tipo, imprimirTicket) {
                if (isProcessing) return;
                
                isProcessing = true;
                const submitBtn = $('button[type="submit"]');
                
                // Estado de carga
                submitBtn.prop('disabled', true);
                submitBtn.html('<i class="fas fa-spinner fa-spin me-2"></i>Procesando...');
                
                $.ajax({
                    url: window.location.pathname,
                    method: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'register_entry',
                        tarjeta: codigo,
                        tipo: tipo,
                        imprimir_ticket: imprimirTicket ? 'true' : 'false'
                    },
                    success: function(response) {
                        if (response.success) {
                            // Éxito - mostrar notificación
                            Toast.fire({
                                icon: 'success',
                                title: response.message || 'Registro exitoso'
                            });
                            
                            // Limpiar formulario y enfocar para siguiente tarjeta
                            $('input[name="tarjeta"]').val('');
                            resetTipoVehiculoDefault();
                            
                            // Actualizar información del último registro
                            if (response.registro) {
                                actualizarUltimoRegistro(response.registro);
                            }
                            
                            // Notificar sobre impresión si corresponde
                            if (imprimirTicket) {
                                if (response.impresion_exitosa) {
                                    Toast.fire({
                                        icon: 'info',
                                        title: 'Ticket enviado a impresora'
                                    });
                                } else {
                                    Toast.fire({
                                        icon: 'warning',
                                        title: 'Registro exitoso - Error al imprimir'
                                    });
                                }
                            }
                            
                            // Enfocar campo para siguiente tarjeta
                            setTimeout(() => {
                                focusCardInput();
                            }, 500);
                            
                        } else {
                            // Error - mostrar mensaje
                            Toast.fire({
                                icon: 'error',
                                title: response.error || 'Error al procesar'
                            });
                            
                            // Reproducir sonido de error si está disponible
                            try {
                                const audio = new Audio('sounds/error.wav');
                                audio.play().catch(e => console.log('No se pudo reproducir sonido'));
                            } catch(e) {
                                console.log('Error al reproducir sonido:', e);
                            }
                            
                            // Limpiar campo y enfocar
                            $('input[name="tarjeta"]').val('').addClass('is-invalid');
                            setTimeout(() => {
                                $('input[name="tarjeta"]').removeClass('is-invalid');
                                focusCardInput();
                            }, 1000);
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Error AJAX:', error);
                        Toast.fire({
                            icon: 'error',
                            title: 'Error de comunicación con el servidor'
                        });
                    },
                    complete: function() {
                        isProcessing = false;
                        submitBtn.prop('disabled', false);
                        submitBtn.html('<i class="fas fa-plus-circle me-2"></i>Registrar Ingreso');
                    }
                });
            }
            
            // ==== FUNCIÓN PARA RESTABLECER TIPO DE VEHÍCULO POR DEFECTO ====
            function resetTipoVehiculoDefault() {
                const selectTipo = $('select[name="tipo"]');
                const optionDefault = selectTipo.find('option[selected]');
                
                if (optionDefault.length > 0) {
                    // Si hay una opción marcada como selected en el HTML, usarla
                    selectTipo.val(optionDefault.val());
                } else {
                    // Fallback: usar el primer elemento
                    selectTipo.prop('selectedIndex', 0);
                }
            }
            
            // ==== FUNCIÓN PARA ACTUALIZAR ÚLTIMO REGISTRO ====
            function actualizarUltimoRegistro(registro) {
                // Actualizar vista desktop
                $('.parking-info-desktop input').eq(0).val(registro.tarjeta);
                $('.parking-info-desktop input').eq(1).val(registro.hora_entrada);
                $('.parking-info-desktop input').eq(2).val(registro.tipo);
                $('.parking-info-desktop input').eq(3).val(registro.estado);
                
                // Actualizar vista móvil
                const mobileView = $('.mobile-info-view');
                mobileView.html(`
                    <div class="card-info">
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-credit-card me-2"></i>Tarjeta:</span>
                            <span class="info-value"><strong>${registro.tarjeta}</strong></span>
                        </div>
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-sign-in-alt me-2"></i>Hora Entrada:</span>
                            <span class="info-value">${registro.hora_entrada}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-car me-2"></i>Tipo Vehículo:</span>
                            <span class="info-value">${registro.tipo}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label"><i class="fas fa-info-circle me-2"></i>Estado:</span>
                            <span class="info-value status ingresado">${registro.estado}</span>
                        </div>
                    </div>
                `);
            }
            
            // Función para mostrar las tarjetas en la cuadrícula
            function displayCards(cards) {
                if (!cards || cards.length === 0) {
                    showNoCardsAvailable();
                    return;
                }

                let cardsHtml = '<div class="cards-grid">';
                cards.forEach(function(card) {
                    cardsHtml += `
                        <div class="card-option" data-code="${card.CodigoX}" data-internal-code="${card.Codigo}">
                            <div class="card-option-icon">
                                <i class="fas fa-credit-card"></i>
                            </div>
                            <div class="card-option-code">${card.Codigo}</div>
                        </div>
                    `;
                });
                cardsHtml += '</div>';
                $('#cardsContainer').html(cardsHtml);

                // Manejar selección de tarjetas
                $('.card-option').on('click', function() {
                    $('.card-option').removeClass('selected');
                    $(this).addClass('selected');
                    selectedCardCode = $(this).data('code');
                    $('#confirmCardSelection').prop('disabled', false);
                });
            }

            // Mostrar mensaje cuando no hay tarjetas disponibles
            function showNoCardsAvailable() {
                $('#cardsContainer').html(`
                    <div class="no-cards-available">
                        <i class="fas fa-inbox"></i>
                        <div><strong>No hay tarjetas disponibles</strong></div>
                        <small>Todas las tarjetas están ocupadas o no hay tarjetas en el sistema</small>
                    </div>
                `);
            }

            // Confirmar selección de tarjeta
            $('#confirmCardSelection').on('click', function() {
                if (selectedCardCode) {
                    $('#tarjetaInput').val(String(selectedCardCode).toUpperCase());
                    $('#cardSelectorModal').modal('hide');
                    // Enfocar el siguiente campo (tipo de vehículo)
                    setTimeout(function() {
                        $('select[name="tipo"]').focus();
                    }, 300);
                }
            });

            // Limpiar selección cuando se cierra el modal
            $('#cardSelectorModal').on('hidden.bs.modal', function() {
                selectedCardCode = null;
                $('#confirmCardSelection').prop('disabled', true);
                $('.card-option').removeClass('selected');
            });

            // ==== FUNCIONALIDAD DEL BOTÓN DE SELECCIÓN DE TARJETAS ====
            $('#cardSelectorBtn').on('click', function() {
                console.log('Clic en botón de selección de tarjetas disponibles');
                loadAvailableCards();
                $('#cardSelectorModal').modal('show');
            });

            // Función para cargar tarjetas disponibles via AJAX
            function loadAvailableCards() {
                console.log('Iniciando carga de tarjetas disponibles');
                $('#cardsContainer').html(`
                    <div class="loading-cards">
                        <i class="fas fa-spinner fa-spin"></i>
                        <div><strong>Cargando tarjetas disponibles...</strong></div>
                        <small>Por favor espere un momento</small>
                    </div>
                `);

                // Llamada AJAX para obtener tarjetas disponibles
                $.ajax({
                    url: '?action=get_available_cards',
                    method: 'GET',
                    dataType: 'json',
                    success: function(response) {
                        console.log('=== DEBUG TARJETAS DISPONIBLES RECIBIDAS ===');
                        console.log('Response completo:', response);
                        
                        if (response.success && response.data) {
                            console.log('Total tarjetas disponibles:', response.data.length);
                            displayCards(response.data);
                        } else {
                            console.log('No hay tarjetas disponibles o error en respuesta');
                            showNoCardsAvailable();
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Error al cargar tarjetas disponibles:', error);
                        showNoCardsAvailable();
                    }
                });
            }

            // Permitir uso normal de todos los campos sin interferencias
            $('select[name="tipo"], input, button').on('focus', function() {
                // Permitir foco normal en cualquier elemento del formulario
            });
            
            // Auto-refresh inteligente para mantener el foco y actualizar datos
            let refreshTimer;
            let lastActivity = Date.now();
            
            // Reiniciar timer cuando hay actividad del usuario
            function resetRefreshTimer() {
                lastActivity = Date.now();
                if (refreshTimer) {
                    clearTimeout(refreshTimer);
                }
                
                refreshTimer = setTimeout(function() {
                    // Solo refrescar si no hay actividad reciente y no hay modales abiertos
                    const timeSinceActivity = Date.now() - lastActivity;
                    const hasOpenModals = $('.modal.show').length > 0;
                    const hasActiveInputs = $('input:focus, select:focus').length > 0;
                    const cardFieldHasFocus = $('input[name="tarjeta"]').is(':focus') || $('#tarjetaInput').is(':focus');
                    
                    // NO hacer refresh si:
                    // - Ha habido actividad reciente
                    // - Hay modales abiertos  
                    // - El campo de código de tarjeta tiene foco
                    // - Se está procesando un registro
                    if (timeSinceActivity >= 50000 && !hasOpenModals && !cardFieldHasFocus && !isProcessing) {
                        // Hacer refresh usando GET para evitar reenvío de datos POST
                        window.location.href = window.location.pathname;
                    } else {
                        // Si hay actividad reciente o el campo tiene foco, programar otro intento
                        resetRefreshTimer();
                    }
                }, 60000); // 60 segundos
            }
            
            // Detectar actividad del usuario
            $(document).on('mousedown keydown input change click', function() {
                resetRefreshTimer();
            });
            
            // Iniciar el timer de refresh
            resetRefreshTimer();

            // ==== FUNCIONALIDAD DEL MENÚ HAMBURGUESA ====
            const sidebar = document.getElementById('sidebar');
            const sidebarOverlay = document.getElementById('sidebarOverlay');
            const menuToggle = document.getElementById('menuToggle');
            const sidebarClose = document.getElementById('sidebarClose');

            function openSidebar() {
                // Calcular el ancho de la barra de scroll para evitar el salto
                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                
                // Aplicar padding-right al body para compensar la barra de scroll
                document.body.style.paddingRight = scrollbarWidth + 'px';
                document.body.style.overflow = 'hidden';
                
                sidebar.classList.add('active');
                sidebarOverlay.classList.add('active');
            }

            function closeSidebar() {
                // Remover el padding y restaurar el overflow
                document.body.style.paddingRight = '';
                document.body.style.overflow = '';
                
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }

            function toggleSubmenu(submenuId) {
                const submenu = document.getElementById(submenuId);
                if (submenu.style.display === 'none' || submenu.style.display === '') {
                    submenu.style.display = 'block';
                } else {
                    submenu.style.display = 'none';
                }
            }

            // Event listeners para el sidebar
            menuToggle.addEventListener('click', openSidebar);
            sidebarClose.addEventListener('click', closeSidebar);
            sidebarOverlay.addEventListener('click', closeSidebar);

            // Cerrar sidebar con tecla Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeSidebar();
                }
            });

            // Hacer disponible globalmente
            window.toggleSubmenu = toggleSubmenu;
        });
    </script>
</body>
</html>