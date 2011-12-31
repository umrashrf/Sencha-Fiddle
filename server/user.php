<?php
    error_reporting(0);

    require("common/Database.php");
    require("common/config.inc.php");
    require("common/utility.php");

    $db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        header('Cache-Control: no-cache, must-revalidate');
        header('Content-type: application/json');

        if (!isset($_GET["action"])) {
            $error = array("senchafiddle" => array("error" => "Action is not specified."));
            echo json_encode($error);
            exit(0);            
        }

        $actions = array("register", "login", "logout");
        $action = $_GET["action"];

        if (!in_array($action, $actions)) {
            $error = array("senchafiddle" => array("error" => "Action is not valid."));
            echo json_encode($error);
            exit(0);            
        }

        if (strtolower($action) == "register") {
            if (!isset($_POST["name"])) {
                $error = array("senchafiddle" => array("error" => "User's name is required."));
                echo json_encode($error);
                exit(0);        
            }

            if (!isset($_POST["email"])) {
                $error = array("senchafiddle" => array("error" => "User's email is required."));
                echo json_encode($error);
                exit(0);        
            }

            if (!isset($_POST["pwd"])) {
                $error = array("senchafiddle" => array("error" => "User's password is required."));
                echo json_encode($error);
                exit(0);        
            }

            $name = $_POST["name"];
            $email = $_POST["email"];
            $pwd = $_POST["pwd"];

            $db->connect();
            $inserted = $db->query_insert("users", 
            array("name" => $name, 
            "email" => $email, 
            "pwd" => $pwd,
            "lastlogin" => "CURRENT_TIMESTAMP"));
            $db->close();

            if (!$inserted) {
                // error mysql_errno()
                $response = array("senchafiddle" => array("user" => array("registered" => false)));
                echo json_encode($response);            
            }
            else {
                // show response
                $response = array("senchafiddle" => array("user" => array("registered" => true)));
                echo json_encode($response); 
            }    
        }
        elseif (strtolower($action) == "login") {
            if (!isset($_POST["email"])) {
                $error = array("senchafiddle" => array("error" => "User's email is required."));
                echo json_encode($error);
                exit(0);        
            }

            if (!isset($_POST["pwd"])) {
                $error = array("senchafiddle" => array("error" => "User's password is required."));
                echo json_encode($error);
                exit(0);        
            }

            $email = $_POST["email"];
            $pwd = $_POST["pwd"];

            $db->connect();
            $user = $db->query_first("SELECT id FROM users WHERE email = '$email' AND pwd = '$pwd'");

            if ($user && isset($user["id"])) {
                $user_id = $user["id"];

                $token = "";
                do {
                    $token = getRandomCode(5);
                    $tokened = $db->query_insert("user_tokens", array("token" => "$token", "uid" => $user_id, "lastused" => "CURRENT_TIMESTAMP"));               
                }
                while ((mysql_errno() != 0));

                $response = array("senchafiddle" => array("user" => array("token" => $token)));
                echo json_encode($response);
            }
            else {
                $response = array("senchafiddle" => array("error" => "Login failed."));
                echo json_encode($response);                
            }

            $db->close();
        }
        elseif (strtolower($action) == "logout") {
            if (!isset($_POST["token"])) {
                $error = array("senchafiddle" => array("error" => "Valid token is required."));
                echo json_encode($error);
                exit(0);        
            }

            $token = $_POST["token"];

            $db->connect();
            $user = $db->query_first("SELECT uid FROM user_tokens WHERE token = '$token'");

            if ($user && isset($user["uid"])) {
                $user_id = $user["uid"];

                $deleted = $db->query_delete("user_tokens", $where = "uid = $user_id AND token = '$token'");
                if ($deleted) {
                    $response = array("senchafiddle" => array("logout" => true));
                    echo json_encode($response);    
                }
                else {
                    $response = array("senchafiddle" => array("error" => "Internal server error."));
                    echo json_encode($response);                        
                }
            }
            else {
                $response = array("senchafiddle" => array("error" => "Token is invalid."));
                echo json_encode($response);                
            }

            $db->close();
        }              
    }
    else {

    }
?>
