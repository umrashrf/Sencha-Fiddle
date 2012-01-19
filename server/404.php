<?php
error_reporting(0);

// example URI: http://domain.com/full/ahGNs

$local_base = "/local/v10/";
$server_base = "/";

$base = $local_base;

$request = $_SERVER['REQUEST_URI'];

$matches = array();
if (preg_match("#" . $base . "full/([a-zA-Z\d]+)/([a-zA-Z\d]+)#", $request, $matches) || preg_match("#" . $base . "full/([a-zA-Z\d]+)#", $request, $matches)) {
	if (count($matches) >= 2) {
		$app_token = $matches[1];

		$user_token = "";
		if (isset($matches[2])) {
			$user_token = $matches[2];
		}

		$newplace = "http://" . $_SERVER['HTTP_HOST'] . $base . "server/full?app_token=" . $app_token . "&user_token=" . $user_token;

		header("HTTP/1.0 301 Moved Permanently");
		//header("Title: $newplace");
		header("Location: $newplace");
		header("Connection: close");
		exit();
	}
}

header("HTTP/1.0 404 Not Found");
?>