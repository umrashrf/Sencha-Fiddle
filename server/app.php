<?php
    error_reporting(0);

    require("common/Database.php");
    require("common/config.inc.php");
    require("common/utility.php");

    $db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        header('Cache-Control: no-cache, must-revalidate');
        header('Content-type: application/json');

        if (!isset($_POST["state"])) {
            $error = array("senchafiddle" => array("error" => "App state is required."));
            echo json_encode($error);
            exit(0);        
        }

        $name = $_POST["name"];
        $state = $_POST["state"];

        $db->connect();
        $inserted = $db->query_insert("apps", array("name" => $name, "state" => $state));
        
        if (!$inserted) {
            // error mysql_errno()
            $error = array("senchafiddle" => array("error" => "Internal server error occurred."));
            echo json_encode($error);            
        }
        else {
            $token = "";
            do  {
                $token = getRandomCode(5);
                $tokened = $db->query_insert("app_tokens", array("token" => $token, "appid" => $inserted, "lastused" => "CURRENT_TIMESTAMP"));               
            }
            while ((mysql_errno() != 0));

            // show xml response
            $response = array("senchafiddle" => array("app" => array("id" => "$inserted", "token" => $token)));
            echo json_encode($response); 
        }
        
        $db->close();              
    }
    else {
        header('Cache-Control: no-cache, must-revalidate');
        header('Content-type: application/json');

        if (isset($_GET['token'])) {
            $Token = $_GET['token'];

            $app = null;
            $app_files = null;

            $db->connect();
            $tokens = $db->query_first("SELECT appid FROM app_tokens WHERE token = '$Token'");

            if ($tokens) {
                $app = $db->query_first("SELECT * FROM apps WHERE id = " . $tokens["appid"]);
                $app_files = $db->fetch_all_array("SELECT * FROM files WHERE appid = " . $tokens["appid"]);
            }

            $db->close();

            if (!$app) {
                $error = array("senchafiddle" => array("error" => "App doesn't exist."));
                echo json_encode($error);
            }
            else {
                $rv = array("app" => array("id" => $app["id"], "state" => $app["state"]));

                if ($app_files) {
                    $files_rv = array();

                    foreach ($app_files as $index => $app_file) {
                        $file_rv = array(
                        "id" => $app_file["id"], 
                        "name" => stripcslashes($app_file["name"]), 
                        "type" => $app_file["type"], 
                        "content" => stripcslashes($app_file["content"]), 
                        "created" => $app_file["created"], 
                        "lastupdate" => $app_file["lastupdate"]
                        );
                        $files_rv[$index] = $file_rv;   
                    }

                    $rv["app"]["files"] = $files_rv;                       
                }

                echo json_encode($rv);
            }
        }
        elseif (isset($_GET['id'])) {
            header('Cache-Control: no-cache, must-revalidate');
            header('Content-type: text/html');

            $AppId = $_GET['id'];

            if (strlen($AppId) <= 0) {
                echo '<html>';
                echo '<body>';
                echo 'App id is required.';
                echo '</body>';
                echo '</html>';         
                exit(0); 
            }

            $db->connect();
            $app = $db->query_first("SELECT * FROM apps WHERE id = $AppId");

            if (!$app) {
                echo '<html>';
                echo '<body>';
                echo 'This app is expired.';
                echo '</body>';
                echo '</html>';
                $db->close();
                exit(0);    
            }

            $app_files = $db->fetch_all_array("SELECT * FROM files WHERE appid = $AppId");
            $db->close();

            $app_dir = "apps/$AppId/";
            $models_dir = "apps/$AppId/models/";
            $stores_dir = "apps/$AppId/stores/";
            $views_dir = "apps/$AppId/views/";
            $controllers_dir = "apps/$AppId/controllers/";
            $resources_dir = "apps/$AppId/resources/css/";
            
            if (file_exists($app_dir)) {
                deleteDir($app_dir);                       
            }

            mkdir($app_dir);
            mkdir($models_dir);
            mkdir($stores_dir);
            mkdir($views_dir);
            mkdir($controllers_dir);      
            mkdir($resources_dir, 0777, true);      

            $app_name = $app["name"];
            if (strlen($app_name) > 0) {
                $app_name .= " - @ ";                
            }
            $app_name .= 'SenchaFiddle.com - Online Web Based Sencha Touch IDE';

            $html = '<html>' . "\r\n";
            $html .= '<head>' . "\r\n";
            $html .= '<title>' . $app_name . '</title>' . "\r\n\r\n";
            $html .= '<link href="libs/sencha-touch-1.1.0/resources/css/sencha-touch.css" rel="stylesheet" type="text/css" />' . "\r\n";
            
            foreach ($app_files as $app_file) {
                $filetype = $app_file["type"];
                $filename = stripcslashes($app_file["name"]);
                $content = stripcslashes($app_file["content"]);

                if ($filetype == "CSS") {
                    $filepath = $resources_dir . $filename;
                    file_put_contents($filepath, $content);
                    $html .= '<link href="' . $filepath . '" rel="stylesheet" type="text/css" />' . "\r\n";    
                }  
            }
            
            $html .= "\r\n";
            
            $html .= '<script src="../js/SFrame.js" type="text/javascript"></script>' . "\r\n";
            $html .= '<script type="text/javascript">';
            $html .= 'var SF = new SenchaFiddle();';
            $html .= 'SF.init();';
            $html .= '</script>' . "\r\n\r\n";
            
            $html .= '<script src="libs/sencha-touch-1.1.0/sencha-touch-debug.js" type="text/javascript"></script>' . "\r\n\r\n";

            foreach ($app_files as $app_file) {
                $filetype = $app_file["type"];
                $filename = stripcslashes($app_file["name"]);
                $content = stripcslashes($app_file["content"]);

                if ($filetype == "App") {
                    $filepath = $app_dir . $filename;
                    file_put_contents($filepath, $content);
                    $html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";    
                }  
            }

            foreach ($app_files as $app_file) {
                $filetype = $app_file["type"];
                $filename = stripcslashes($app_file["name"]);
                $content = stripcslashes($app_file["content"]);

                if ($filetype == "Model") {
                    $filepath = $app_dir . $filename;
                    file_put_contents($filepath, $content);
                    $html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";    
                }  
            }

            foreach ($app_files as $app_file) {
                $filetype = $app_file["type"];
                $filename = stripcslashes($app_file["name"]);
                $content = stripcslashes($app_file["content"]);

                if ($filetype == "Store") {
                    $filepath = $app_dir . $filename;
                    file_put_contents($filepath, $content);
                    $html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";    
                }  
            }

            foreach ($app_files as $app_file) {
                $filetype = $app_file["type"];
                $filename = stripcslashes($app_file["name"]);
                $content = stripcslashes($app_file["content"]);

                if ($filetype == "Viewport") {
                    $filepath = $app_dir . $filename;
                    file_put_contents($filepath, $content);
                    $html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";    
                }  
            }

            foreach ($app_files as $app_file) {
                $filetype = $app_file["type"];
                $filename = stripcslashes($app_file["name"]);
                $content = stripcslashes($app_file["content"]);

                if ($filetype == "Controller") {
                    $filepath = $app_dir . $filename;
                    file_put_contents($filepath, $content);
                    $html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";    
                }  
            }

            $html .= "\r\n" . '</head>' . "\r\n";
            $html .= '<body>' . "\r\n\r\n";
            $html .= '</body>' . "\r\n";
            $html .= '</html>';

            echo $html;                                         
        }
        else {
            $error = array("senchafiddle" => array("error" => "App 'id' or token is required."));
            echo json_encode($error);
        }
    }
?>
