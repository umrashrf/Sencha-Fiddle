<?php
    /*
    app.php
    method: POST
    get params: [action (add, load, print), user_token, privacy (public, private)] 
    post params: according to get "action" param: [state], [app_token], [app_token]
    */

    require("common/config.inc.php");
    require("common/Database.php");
    $db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (!isset($_GET["action"])) {
            $error = array("senchafiddle" => array("error" => "Action is not specified."));
            echo json_encode($error);
            exit(0);            
        }

        $actions = array("create");
        $action = $_GET["action"];

        if (!in_array($action, $actions)) {
            $error = array("senchafiddle" => array("error" => "Action is not valid."));
            echo json_encode($error);
            exit(0);            
        }

        if (strtolower($action) == "create") {
            header('Cache-Control: no-cache, must-revalidate');
            header('Content-type: application/json');

            if (!isset($_POST["comments"])) {
                $error = array("senchafiddle" => array("error" => "Comments are required."));
                echo json_encode($error);
                exit(0);        
            }

            $comments = $_POST["comments"];
            
            $db->connect();
            $inerted = $db->query_insert("feedbacks", array("comments" => $comments));

            if (!$inerted) {
                // error mysql_errno()
                $response = array("senchafiddle" => array("feedback" => array("created" => false)));
                echo json_encode($error);            
            }
            else {
                // show xml response
                $response = array("senchafiddle" => array("feedback" => array("created" => true)));
                echo json_encode($response); 
            }

            $db->close();    
        }
	}
?>
