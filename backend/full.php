<?php
$request = $_SERVER['REQUEST_URI'];

if (isset($_GET["app_token"])) {
	$app_token = $_GET["app_token"];
	if (strpos($app_token, '!') === 0) {
		$app_token = substr($app_token, 1);
	}

	$user_token = "";
	if (isset($_GET["user_token"])) {
		$user_token = $_GET["user_token"];
		if (strpos($user_token, '!') === 0) {
			$user_token = substr($user_token, 1);
		}
	}

	$file_path = "";
	if (isset($_GET["path"])) {
		$file_path = $_GET["path"];
	}

	$app_version = "";
	if (isset($_GET["path"])) {
		$file_path = $_GET["path"];
	}

	require ("common/config.inc.php");
	require ("common/Database.php");
	require ("common/utility.php");

	$db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

	if (strlen($app_token) <= 0) {
		echo '<html>';
		echo '<body>';
		echo 'App token is required.';
		echo '</body>';
		echo '</html>';
		exit(0);
	}

	$app = null;
	$app_files = null;

	$db -> connect();
	$tokens = $db -> query_first("SELECT appid FROM app_tokens WHERE token = '$app_token'");

	if ($tokens && isset($tokens["appid"])) {
		$app_id = $tokens["appid"];

		$user_app = $db -> fetch_all_array("SELECT * FROM user_app WHERE privacy = 'private' AND appid = $app_id");
		if ($user_app && count($user_app)) {
			if (!$user_token) {
				// not authorized error
				$error = array("senchafiddle" => array("error" => "Unauthorized access. User token is required."));
				echo json_encode($error);
				$db -> close();
				exit(0);
			}

			//take uid from token
			$user = $db -> query_first("SELECT uid FROM user_tokens WHERE token = '$user_token'");
			if (!$user || !isset($user["uid"])) {
				// not authorized error
				$error = array("senchafiddle" => array("error" => "Unauthorized access. User token is invalid."));
				echo json_encode($error);
				$db -> close();
				exit(0);
			}

			$user_id = $user["uid"];
			// it's a valid user

			$user_app = $app = $db -> fetch_all_array("SELECT * FROM user_app WHERE privacy = 'private' AND appid = $app_id And uid = $user_id");
			if (!$user_app || count($user_app) <= 0) {
				// not authorized error
				$error = array("senchafiddle" => array("error" => "Unauthorized access. User is invalid."));
				echo json_encode($error);
				$db -> close();
				exit(0);
			}
		}

		$app = $db -> query_first("SELECT * FROM apps WHERE id = $app_id");
		if ($app) {
			$app_files = $db -> fetch_all_array("SELECT * FROM files WHERE appid = $app_id");
		}

	}

	if (!$app) {
		echo '<html>';
		echo '<body>';
		echo 'This app is expired.';
		echo '</body>';
		echo '</html>';
		$db -> close();
		exit(0);
	}

	$AppId = $app["id"];

	if ($file_path) {
		$file_paths = explode('/', $file_path);

		$last_pos = count($file_paths) - 1;

		// get the file by it's name and app id from db
		$file_name = $file_paths[$last_pos];
		$file = $db -> query_first("SELECT * FROM files WHERE appid = $AppId AND name = '$file_name'");
		$db -> close();

		$filetype = $file["type"];
		$filecontent = $file["content"];

		switch ($filetype) {
			case 'HTML' :
				header('Content-type: text/html');
				break;

			case 'CSS' :
				header('Content-type: text/css');
				break;

			default :
				header('Content-type: text/javascript');
		}

		echo $filecontent;

		exit(0);
	} else {
		$AppSTVersion = $app["version"];

		$touch_lib = $db -> query_first("SELECT * FROM touch_libs WHERE version = '$AppSTVersion'");
		if (!$touch_lib) {
			$touch_lib = $db -> query_first("SELECT * FROM touch_libs ORDER BY version DESC");
		}

		$db -> close();

		$app_name = $app["name"];
		if (strlen($app_name) > 0) {
			$app_name .= " - @ ";
		}
		$app_name .= 'SenchaFiddle.com - Online Web Based Sencha Touch IDE';

		$style_files = explode(",", $touch_lib['css_files']);
		$code_files = explode(" ", $touch_lib['js_files']);

		$html = '<!DOCTYPE html>' . "\r\n";
		$html .= '<html>' . "\r\n";
		$html .= '<head>' . "\r\n";
		$html .= '<title>' . $app_name . '</title>' . "\r\n\r\n";

		foreach ($style_files as $style_file) {
			$html .= '<link href="' . $style_file . '" rel="stylesheet" type="text/css" />' . "\r\n";
		}

		foreach ($app_files as $app_file) {
			$filetype = $app_file["type"];
			$filename = $app_file["name"];

			if ($filetype == "CSS") {
				$filepath = "resources/css/" . $filename;
				$html .= '<link href="' . $filepath . '" rel="stylesheet" type="text/css" />' . "\r\n";
			}
		}

		$html .= "\r\n";

		foreach ($code_files as $code_file) {
			$html .= '<script src="' . $code_file . '" type="text/javascript"></script>' . "\r\n\r\n";
		}

		foreach ($app_files as $app_file) {
			$filetype = $app_file["type"];
			$filename = $app_file["name"];

			if ($filetype == "App") {
				$filepath = $filename;
				$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
			}
		}

		$html .= "\r\n" . '</head>' . "\r\n";
		$html .= '<body>' . "\r\n\r\n";
		// $html .= '<script type="text/javascript">window.addEventListener("load", function() { console.log("app loaded"); }, false);</script>';
		$html .= '</body>' . "\r\n";
		$html .= '</html>';

		// we need to put cache on some file and not on some files
		//header('Cache-Control: no-cache, must-revalidate');

		header('Content-type: text/html');

		echo $html;
		exit(0);
	}
}

header('Cache-Control: no-cache, must-revalidate');
header('Content-type: application/json');

$error = array("success" => "false", "message" => "Valid token is required.");
echo json_encode($error);
?>
