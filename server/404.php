<?php
    error_reporting(0);
    
    // example URI: http://domain.com/full/ahGNs
    $request = $_SERVER['REQUEST_URI'];

    $matches = array();
    if (preg_match("#/full/([a-zA-Z\d]+)#", $request, $matches)) {
        file_put_contents("404.txt", $request);
    
        if (count($matches) >= 2) {
            $token = $matches[1];

            $newplace = "http://" . $_SERVER['HTTP_HOST'] . "/server/full.php?token=" . $token; 

            header("HTTP/1.0 301 Moved Permanently"); 
            //header("Title: $newplace"); 
            header("Location: $newplace"); 
            header("Connection: close"); 
            exit();   
        }                       
    }

    header("HTTP/1.0 404 Not Found");
?>