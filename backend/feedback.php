<?php

require ("common/config.inc.php");
require ("common/Database.php");

$db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
	header('Cache-Control: no-cache, must-revalidate');
    header('Content-type: application/json');
	
	$request_body = file_get_contents('php://input');
	$_POST = json_decode($request_body, true);

    if (!isset($_POST["comments"])) {
        $error = array("success" => "false", "message" => "Comments are required.");
        echo json_encode($error);
        exit(0);        
    }
	
    $comments = $_POST["comments"];
    
    $db->connect();
    $inerted = $db->query_insert("feedbacks", array("comments" => $comments));

    if (!$inerted) {
        // error mysql_errno()
        $response = array("success" => "false");
        echo json_encode($error);            
    }
    else {
        // show xml response
        $response = array("success" => "true");
        echo json_encode($response); 
    }

    $db->close();    
}
?>
