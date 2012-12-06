<?php
require ("common/config.inc.php");
require ("common/Database.php");

$db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

if ($_SERVER["REQUEST_METHOD"] == "POST" || $_SERVER["REQUEST_METHOD"] == "PUT") {
	header('Cache-Control: no-cache, must-revalidate');
	header('Content-type: application/json');

	$required_inputs = array("appid", "name", "type", "content");

	$processedFiles = array();

	function processFiles($inputFiles) {
		global $db, $required_inputs, $processedFiles;

		foreach ($inputFiles as $input) {

			$input = new ArrayObject($input);

			foreach ($required_inputs as $ri) {
				if (!isset($input[$ri])) {
					$error = array("success" => "false", "message" => $ri . " is required", "input" => $input);
					$processedFiles[count($processedFiles)] = $error;
					exit(0);
					break;
				}
			}

			$app_id = $input["appid"];
			$name = $input["name"];
			$old_name = (isset($input["oldname"])) ? $input["oldname"] : $name;
			$type = $input["type"];
			$content = stripcslashes($input["content"]);
			$is_default = 0;

			if (isset($input["isdefault"])) {
				$is_default = $input["isdefault"];
			}

			$app = $db -> query_first("SELECT state FROM apps WHERE id = $app_id");
			if (!$app) {
				$error = array("success" => "false", "message" => "App doesn't exist.", "input" => $input);
				$processedFiles[count($processedFiles)] = $error;
			} else {
				$updated = false;
				$file = $db -> query_first("SELECT id FROM files WHERE appid = $app_id AND name = '$old_name'");
				if ($file) {
					$updated = $db -> query_update("files", array("name" => $name, "content" => $content, "lastupdate" => 'CURRENT_TIMESTAMP'), "appid = $app_id AND name = '$old_name'");

					if (!$updated) {
						$error = array("success" => "false", "message" => mysql_errno(), "input" => $input);
						$processedFiles[count($processedFiles)] = $error;
					} else {
						$response = array("success" => "true", "results" => array(), "input" => $input);
						$processedFiles[count($processedFiles)] = $response;
					}
				} else {
					$inserted = $db -> query_insert("files", array("appid" => $app_id, "name" => $name, "type" => $type, "content" => $content, "isdefault" => $is_default, "lastupdate" => 'CURRENT_TIMESTAMP'));

					if (!$inserted) {
						$error = array("success" => "false", "message" => mysql_errno(), "input" => $input);
						$processedFiles[count($processedFiles)] = $error;
					} else {
						$response = array("success" => "true", "results" => array("id" => $inserted));
						$processedFiles[count($processedFiles)] = $response;
					}
				}
			}
		}

		$overallSuccess = true;

		foreach ($processedFiles as $processedFile) {
			if ($processedFile["success"] == "false") {
				$overallSuccess = false;
			}
		}

		$result = array("success" => $overallSuccess, "result" => $processedFiles);
		echo json_encode($result);
	}

	function processFile($input) {
		global $db, $required_inputs;

		$input = new ArrayObject($input);

		foreach ($required_inputs as $ri) {
			if (!isset($input[$ri])) {
				$error = array("success" => "false", "message" => $ri . " is required");
				echo json_encode($error);
				exit(0);
				break;
			}
		}

		$app_id = $input["appid"];
		$name = $input["name"];
		$old_name = (isset($input["oldname"])) ? $input["oldname"] : $name;
		$type = $input["type"];
		$content = $input["content"];
		$is_default = 0;

		if (isset($input["isdefault"])) {
			$is_default = $input["isdefault"];
		}

		$app = $db -> query_first("SELECT state FROM apps WHERE id = $app_id");
		if (!$app) {
			$error = array("success" => "false", "message" => "App doesn't exist.");
			echo json_encode($error);
		} else {
			$updated = false;
			$file = $db -> query_first("SELECT id FROM files WHERE appid = $app_id AND name = '$old_name'");
			if ($file) {
				$updated = $db -> query_update("files", array("name" => $name, "content" => $content, "lastupdate" => 'CURRENT_TIMESTAMP'), "appid = $app_id AND name = '$old_name'");

				if (!$updated) {
					$error = array("success" => "false", "message" => mysql_errno());
					echo json_encode($error);
				} else {
					$response = array("success" => "true", "results" => array());
					echo json_encode($response);
				}
			} else {
				$inserted = $db -> query_insert("files", array("appid" => $app_id, "name" => $name, "type" => $type, "content" => $content, "isdefault" => $is_default, "lastupdate" => 'CURRENT_TIMESTAMP'));

				if (!$inserted) {
					$error = array("success" => "false", "message" => mysql_errno());
					echo json_encode($error);
				} else {
					$response = array("success" => "true", "results" => array("id" => $inserted));
					echo json_encode($response);
				}
			}
		}

	}

	$request_body = file_get_contents('php://input');
	$_POST = json_decode($request_body, false);

	$db -> connect();

	if (is_array($_POST)) {
		processFiles($_POST);
	} else {
		processFile($_POST);
	}

	$db -> close();

} elseif ($_SERVER["REQUEST_METHOD"] == "DELETE") {
	$request_body = file_get_contents('php://input');
	$_DELETE = json_decode($request_body, true);

	if (!isset($_DELETE["appid"])) {
		$error = array("senchafiddle" => array("error" => "App id is required."));
		echo json_encode($error);
		exit(0);
	}

	if (!isset($_DELETE["name"])) {
		$error = array("senchafiddle" => array("error" => "File name is required."));
		echo json_encode($error);
		exit(0);
	}

	$appid = $_DELETE["appid"];
	$filename = $_DELETE["name"];

	$db -> connect();
	$deleted = $db -> query_delete("files", "name = '" . $db -> escape($filename) . "' AND appid = " . $db -> escape($appid));
	$db -> close();

	$response = array("success" => $deleted);
	echo json_encode($response);

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
			$app_files = $db -> fetch_all_array("SELECT * FROM files WHERE appid = $app_id ORDER BY id");
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
				$file_rv = array("name" => stripcslashes($app_file["name"]), "type" => $app_file["type"], "content" => stripcslashes($app_file["content"]));
				$files_rv[$index] = $file_rv;
			}

			$rv["senchafiddle"]["app"]["files"] = $files_rv;
		}
		
		// show json response
		$response = array("success" => "true", "results" => $files_rv);
		echo json_encode($response);
	}
}
?>
