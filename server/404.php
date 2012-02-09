<?php
require ("common/config.inc.php");

$request = $_SERVER['REQUEST_URI'];
$matches = array();

// example URI: http://domain.com/full/[user_token]/[app_token]/[file|folder]...
if (preg_match("#" . BASE_URL . "full/([a-zA-Z\d]+)/([a-zA-Z\d]+)#", $request, $matches) || preg_match("#" . BASE_URL . "full/([a-zA-Z\d]+)#", $request, $matches)) {
	if (count($matches) >= 2) {
		$app_token = $matches[1];

		$user_token = "";
		if (isset($matches[2])) {
			$user_token = $matches[2];
		}

		$newplace = "http://" . $_SERVER['HTTP_HOST'] . BASE_URL . "server/full?app_token=" . $app_token . "&user_token=" . $user_token;

		header("HTTP/1.0 301 Moved Permanently");
		//header("Title: $newplace");
		header("Location: $newplace");
		header("Connection: close");
		exit();
	}
}

header("HTTP/1.0 404 Not Found");
?>