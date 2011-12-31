<?php
    error_reporting(0);
    
    header('Cache-Control: no-cache, must-revalidate');
    header('Content-type: application/json');

    require("common/Database.php");
    require("common/config.inc.php");
    
    $db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

    if ($_SERVER["REQUEST_METHOD"] == "POST") { 
        if (!isset($_POST["app_id"])) {
            $error = array("senchafiddle" => array("error" => "App id is required."));
            echo json_encode($error);
            exit(0);        
        }
    }
?>
