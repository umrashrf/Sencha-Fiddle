<?php
    error_reporting(0);
    
    header('Cache-Control: no-cache, must-revalidate');
    header('Content-type: application/json');

    require("common/Database.php");
    require("common/config.inc.php");
    
    $db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (!isset($_POST["id"])) {
            $error = array("senchafiddle" => array("error" => "File id is required."));
            echo json_encode($error);
            exit(0);        
        }

        if (!isset($_POST["app_id"])) {
            $error = array("senchafiddle" => array("error" => "App id is required."));
            echo json_encode($error);
            exit(0);        
        }

        if (!isset($_POST["app_state"])) {
            $error = array("senchafiddle" => array("error" => "App state is required."));
            echo json_encode($error);
            exit(0);        
        }

        if (!isset($_POST["name"])) {
            $error = array("senchafiddle" => array("error" => "File name is required."));
            echo json_encode($error);
            exit(0);        
        }

        if (!isset($_POST["type"])) {
            $error = array("senchafiddle" => array("error" => "File type is required."));
            echo json_encode($error);
            exit(0);        
        }

        if (!isset($_POST["content"])) {
            $error = array("senchafiddle" => array("error" => "File content are required."));
            echo json_encode($error);
            exit(0);        
        }

        $id = $_POST["id"];
        $app_id = $_POST["app_id"];
        $app_state = $_POST["app_state"];
        $name = $_POST["name"];        
        $type = $_POST["type"];        
        $content = $_POST["content"];        
		$is_default = 0;
		
		if (isset($_POST["is_default"])) {
			$is_default=  $_POST["is_default"];
        }

        $db->connect();
        $app = $db->query_first("SELECT state FROM apps WHERE id = $app_id");
        if (!$app) {
            $error = array("senchafiddle" => array("error" => "App doesn't exist."));
            echo json_encode($error);
        }
        else {
            $app = $db->query_update("apps", array("state" => $app_state), "id = $app_id");

            $updated = false;
            $file = $db->query_first("SELECT id FROM files WHERE appid = $app_id AND name = '$name'");
            if ($file) {
                $updated = $db->query_update("files", array("name" => $name, "content" => $content, "lastupdate" => 'CURRENT_TIMESTAMP'), "appid = $app_id AND name = '$name'");
            
                if (!$updated) {
                    $error = array("senchafiddle" => array("error" => mysql_errno()));
                    echo json_encode($error);
                }
                else {
                    // show xml response
                    $response = array("senchafiddle" => array("file" => array("updated" => $updated)));
                    echo json_encode($response);    
                }
            }
            else {
                $inserted = $db->query_insert("files", array("appid" => $app_id, "name" => $name, "type" => $type, "content" => $content, "isdefault" => $is_default, "lastupdate" => 'CURRENT_TIMESTAMP'));

                if (!$inserted) {
                    $error = array("senchafiddle" => array("error" => mysql_errno()));
                    echo json_encode($error);
                }
                else {
                    // show xml response
                    $response = array("senchafiddle" => array("file" => array("updated" => true, "id" => $inserted)));
                    echo json_encode($response);    
                }
            }
        }
        $db->close();                
    }
?>
