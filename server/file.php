<?php
    header('Cache-Control: no-cache, must-revalidate');
    header('Content-type: application/json');

    require("common/config.inc.php");
    require("common/Database.php");
    
    $db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

    if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
        parse_str(file_get_contents('php://input'), $_DELETE);
        
        if (!isset($_DELETE["filename"])) {
            $error = array("senchafiddle" => array("error" => "File name is required."));
            echo json_encode($error); 
            exit(0);     
        }

        if (!isset($_DELETE["appid"])) {
            $error = array("senchafiddle" => array("error" => "App id is required."));
            echo json_encode($error); 
            exit(0);     
        }
        
        $appid = $_DELETE["appid"];
        $filename = $_DELETE["filename"];
        
        $db->connect();
        $deleted = $db->query_delete("files", "name = '" . $db->escape($filename) . "' AND appid = " . $db->escape($appid));
        $db->close();
        
        if ($deleted) {
            $response = array("senchafiddle" => array("deleted" => true));
            echo json_encode($response);    
        }
        else {
            $response = array("senchafiddle" => array("deleted" => false));
            echo json_encode($response);
        }
    }
    elseif ($_SERVER["REQUEST_METHOD"] == "PUT") {
        parse_str(file_get_contents('php://input'), $_PUT);
        
        if (!isset($_PUT["appid"])) {
            $error = array("senchafiddle" => array("error" => "App id is required."));
            echo json_encode($error); 
            exit(0);     
        }
        
        if (!isset($_PUT["oldfilename"])) {
            $error = array("senchafiddle" => array("error" => "Old file name is required."));
            echo json_encode($error); 
            exit(0);     
        }
        
        if (!isset($_PUT["newfilename"])) {
            $error = array("senchafiddle" => array("error" => "New file name is required."));
            echo json_encode($error); 
            exit(0);     
        }
        
        $appid = $_PUT["appid"];
        $oldfilename = $_PUT["oldfilename"];
        $newfilename = $_PUT["newfilename"];
    
        $db->connect();
        $updated = $db->query_update("files", array("name" => $db->escape($newfilename)), "name = '" . $db->escape($oldfilename) . "' AND appid = " . $db->escape($appid));
        $db->close();
        
        if ($updated) {
            $response = array("senchafiddle" => array("updated" => $updated));
            echo json_encode($response);    
        }
        else {
            $response = array("senchafiddle" => array("updated" => $updated));
            echo json_encode($response);
        }
    }
?>
