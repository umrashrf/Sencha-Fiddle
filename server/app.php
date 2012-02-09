<?php
/*
 app.php
 method: POST
 get params: [action (add, load, print), user_token, privacy (public, private)]
 post params: according to get "action" param: [state], [app_token], [app_token]
 */

require ("common/config.inc.php");
require ("common/Database.php");
require ("common/utility.php");

$db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
	if (!isset($_GET["action"])) {
		$error = array("senchafiddle" => array("error" => "Action is not specified."));
		echo json_encode($error);
		exit(0);
	}

	$actions = array("add", "load");
	$action = $_GET["action"];

	if (!in_array($action, $actions)) {
		$error = array("senchafiddle" => array("error" => "Action is not valid."));
		echo json_encode($error);
		exit(0);
	}

	$user_token = null;
	if (isset($_POST['user_token'])) {
		$user_token = $_POST['user_token'];
	}

	$app_privacy = "public";
	if (isset($_POST['privacy'])) {
		$app_privacy = $_POST['privacy'];
	}

	if (strtolower($action) == "add") {
		header('Cache-Control: no-cache, must-revalidate');
		header('Content-type: application/json');

		if (!isset($_POST["state"])) {
			$error = array("senchafiddle" => array("error" => "App state is required."));
			echo json_encode($error);
			exit(0);
		}

		$name = $_POST["name"];
		$state = $_POST["state"];
		$version = 1.1;

		if (isset($_POST["version"])) {
			$version = $_POST["version"];
		}

		$db -> connect();
		$app_id = $db -> query_insert("apps", array("name" => $name, "state" => $state, "version" => $version));

		if (!$app_id) {
			// error mysql_errno()
			$error = array("senchafiddle" => array("error" => "Internal server error."));
			echo json_encode($error);
		} else {
			$token = "";
			do {
				$token = getRandomCode(5);
				$tokened = $db -> query_insert("app_tokens", array("token" => $token, "appid" => $app_id, "lastused" => "CURRENT_TIMESTAMP"));
			} while ((mysql_errno() != 0));

			if ($user_token) {
				// add to the user account
				//take uid from token
				$user = $db -> query_first("SELECT uid FROM user_tokens WHERE token = '$user_token'");
				if ($user && isset($user["uid"])) {
					$user_id = $user["uid"];
					$db -> query_insert("user_app", array("uid" => $user_id, "appid" => $app_id, "privacy" => $app_privacy));
				}
			}

			// show xml response
			$response = array("senchafiddle" => array("app" => array("id" => "$app_id", "token" => $token)));
			echo json_encode($response);
		}

		$db -> close();
	} elseif (strtolower($action) == "load") {
		header('Cache-Control: no-cache, must-revalidate');
		header('Content-type: application/json');

		if (!isset($_POST['app_token'])) {
			$error = array("senchafiddle" => array("error" => "App token is required."));
			echo json_encode($error);
			exit(0);
		}

		$app_token = $_POST['app_token'];

		$app = null;
		$app_files = null;

		$db -> connect();
		$tokens = $db -> query_first("SELECT appid FROM app_tokens WHERE token = '$app_token'");

		if ($tokens && isset($tokens["appid"])) {
			$app_id = $tokens["appid"];

			$user_app = $app = $db -> fetch_all_array("SELECT * FROM user_app WHERE privacy = 'private' AND appid = $app_id");
			if ($user_app && count($user_app)) {
				if (!$user_token) {
					// not authorized error
					$error = array("senchafiddle" => array("error" => "Unauthorized access. User token is required."));
					echo json_encode($error);
					exit(0);
				}

				//take uid from token
				$user = $db -> query_first("SELECT uid FROM user_tokens WHERE token = '$user_token'");
				if (!$user || !isset($user["uid"])) {
					// not authorized error
					$error = array("senchafiddle" => array("error" => "Unauthorized access. User token is invalid."));
					echo json_encode($error);
					exit(0);
				}

				$user_id = $user["uid"];
				// it's a valid user

				$user_app = $app = $db -> fetch_all_array("SELECT * FROM user_app WHERE privacy = 'private' AND appid = $app_id And uid = $user_id");
				if (!$user_app || count($user_app) <= 0) {
					// not authorized error
					$error = array("senchafiddle" => array("error" => "Unauthorized access. User is invalid."));
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
			$error = array("senchafiddle" => array("error" => "App doesn't exist."));
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
			echo json_encode($rv);
		}
	}
}
?>
