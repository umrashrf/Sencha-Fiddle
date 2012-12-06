<?php

require ("common/config.inc.php");
require ("common/Database.php");
require ("common/utility.php");

$db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
	header('Cache-Control: no-cache, must-revalidate');
	header('Content-type: application/json');

	$request_body = file_get_contents('php://input');
	$_POST = json_decode($request_body, true);

	$user_token = null;
	if (isset($_POST['user_token'])) {
		$user_token = $_POST['user_token'];
	}

	$app_privacy = "public";
	if (isset($_POST['privacy'])) {
		$app_privacy = $_POST['privacy'];
	}

	$token = $_POST["token"];
	$name = $_POST["name"];
	$state = $_POST["state"];
	$version = $_POST["version"];

	$db -> connect();

	$app = $db -> query_first("SELECT * FROM app_tokens WHERE token = '$token'");
	if ($app) {
		$db -> query_update("apps", array("state" => $state), "id = " . $app["appid"]);

		$response = array("success" => "true", "results" => array( array("id" => $app["appid"], "token" => $token)));
		echo json_encode($response);

	} else {
		$touch_lib = $db -> query_first("SELECT version FROM touch_libs ORDER BY version DESC");

		$app_id = $db -> query_insert("apps", array("name" => $name, "state" => $state, "version" => $touch_lib['version']));

		if (!$app_id) {
			$error = array("success" => "false", "message" => "Internal server error.");
			echo json_encode($error);
		} else {
			$token = "";
			do {
				$token = getRandomCode(5);
				$tokened = $db -> query_insert("app_tokens", array("token" => $token, "appid" => $app_id, "lastused" => "CURRENT_TIMESTAMP"));
			} while ((mysql_errno() != 0));

			if ($user_token) {
				// add to the user account
				// take uid from token
				$user = $db -> query_first("SELECT uid FROM user_tokens WHERE token = '$user_token'");
				if ($user && isset($user["uid"])) {
					$user_id = $user["uid"];
					$db -> query_insert("user_app", array("uid" => $user_id, "appid" => $app_id, "privacy" => $app_privacy));
				}
			}

			// show json response
			$response = array("success" => "true", "results" => array( array("id" => "$app_id", "token" => $token)));
			echo json_encode($response);
		}
	}

	$db -> close();

} elseif ($_SERVER["REQUEST_METHOD"] == "GET") {
	header('Cache-Control: no-cache, must-revalidate');
	header('Content-type: application/json');
	
	$user_token = null;
	if (isset($_GET['user_token'])) {
		$user_token = $_GET['user_token'];
	}
	
	if (!isset($_GET['app_token'])) {
		$response = array("success" => "false", "message" => "App token is required.");
		echo json_encode($response);
		exit(0);
	}
	
	$app_token = $_GET['app_token'];
	
	$app = null;
	$app_files = null;

	$db -> connect();
	$tokens = $db -> query_first("SELECT appid FROM app_tokens WHERE token = '$app_token'");

	if ($tokens && isset($tokens["appid"])) {
		$app_id = $tokens["appid"];

		$user_app = $app = $db -> query("SELECT COUNT(*) AS total FROM user_app WHERE privacy = 'private' AND appid = $app_id");
		if ($user_app && $user_app["total"]) {
			if (!$user_token) {
				// not authorized error
				$error = array("success" => "false", "message" => "Unauthorized access. User token is required.");
				echo json_encode($error);
				exit(0);
			}

			//take uid from token
			$user = $db -> query_first("SELECT uid FROM user_tokens WHERE token = '$user_token'");
			if (!$user || !isset($user["uid"])) {
				// not authorized error
				$error = array("success" => "false", "message" => "Unauthorized access. User token is invalid.");
				echo json_encode($error);
				exit(0);
			}

			$user_id = $user["uid"];
			
			// it's a valid user
			$user_app = $app = $db -> fetch_all_array("SELECT * FROM user_app WHERE privacy = 'private' AND appid = $app_id And uid = $user_id");
			if (!$user_app || count($user_app) <= 0) {
				// not authorized error
				$error = array("success" => "false", "message" => "Unauthorized access. User is invalid.");
				echo json_encode($error);
				exit(0);
			}
		}

		$app = $db -> query_first("SELECT * FROM apps WHERE id = $app_id");
		if ($app) {
			$app_files = $db -> fetch_all_array("SELECT * FROM files WHERE appid = $app_id");
		}
	}

	$db -> close();

	if (!$app) {
		$error = array("success" => "false", "message" => "App doesn't exist.");
		echo json_encode($error);
	} else {
		$rv = array("senchafiddle" => array("app" => array("id" => $app["id"], "state" => $app["state"], "version" => $app["version"])));

		if ($app_files) {
			$files_rv = array();

			foreach ($app_files as $index => $app_file) {
				$file_rv = array("id" => $app_file["id"], "name" => stripcslashes($app_file["name"]), "type" => $app_file["type"], "content" => stripcslashes($app_file["content"]), "created" => $app_file["created"], "lastupdate" => $app_file["lastupdate"]);
				$files_rv[$index] = $file_rv;
			}

			$rv["senchafiddle"]["app"]["files"] = $files_rv;
		}
		
		// show json response
		$response = array("success" => "true", "results" => array("id" => $app_id, "token" => $app_token));
		echo json_encode($response);
	}
}
?>
