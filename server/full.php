<?php
error_reporting(0);

$request = $_SERVER['REQUEST_URI'];

if (isset($_GET["app_token"])) {
	$app_token = $_GET["app_token"];

	$user_token = "";
	if (isset($_GET["user_token"])) {
		$user_token = $_GET["user_token"];
	}

	require ("common/Database.php");
	require ("common/config.inc.php");
	require ("common/utility.php");

	$db = new Database(DB_SERVER, DB_USER, DB_PASS, DB_DATABASE);

	header('Cache-Control: no-cache, must-revalidate');
	header('Content-type: text/html');

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

	$db -> close();

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
	$AppSTVersion = $app["version"];

	$app_name = $app["name"];
	if (strlen($app_name) > 0) {
		$app_name .= " - @ ";
	}
	$app_name .= 'SenchaFiddle.com - Online Web Based Sencha Touch IDE';
	
	if ($AppSTVersion > 1.1) {
		$app_dir = "apps/$AppId/";
		$models_dir = "apps/$AppId/app/model/";
		$stores_dir = "apps/$AppId/app/store/";
		$views_dir = "apps/$AppId/app/view/";
		$controllers_dir = "apps/$AppId/app/controller/";
		$resources_dir = "apps/$AppId/resources/css/";
		
		$style_file = "libs/sencha-touch-2.0.0-pr4/resources/css-debug/sencha-touch.css";
		$code_file = "libs/sencha-touch-2.0.0-pr4/sencha-touch-all-debug.js";
	
		if (file_exists($app_dir)) {
			deleteDir($app_dir);
		}
	
		mkdir($app_dir);
		mkdir($models_dir, 0777, true);
		mkdir($stores_dir, 0777, true);
		mkdir($views_dir, 0777, true);
		mkdir($controllers_dir, 0777, true);
		mkdir($resources_dir, 0777, true);
	
		$html = '<html>' . "\r\n";
		$html .= '<head>' . "\r\n";
		$html .= '<title>' . $app_name . '</title>' . "\r\n\r\n";
		$html .= '<link href="' . $style_file . '" rel="stylesheet" type="text/css" />' . "\r\n";
	
		foreach ($app_files as $app_file) {
			$filetype = $app_file["type"];
			$filename = stripcslashes($app_file["name"]);
			$content = stripcslashes($app_file["content"]);
	
			if ($filetype == "CSS") {
				$filepath = $resources_dir . $filename;
				file_put_contents($filepath, $content);
				$html .= '<link href="' . $filepath . '" rel="stylesheet" type="text/css" />' . "\r\n";
			}
		}
	
		$html .= "\r\n";
	
		$html .= '<script src="../js/SFrame.js" type="text/javascript"></script>' . "\r\n";
		$html .= '<script type="text/javascript">';
		$html .= 'var SF = new SenchaFiddle();';
		$html .= 'SF.init();';
		$html .= '</script>' . "\r\n\r\n";
	
		$html .= '<script src="' . $code_file . '" type="text/javascript"></script>' . "\r\n\r\n";
	
		foreach ($app_files as $app_file) {
			$filetype = $app_file["type"];
			$filename = stripcslashes($app_file["name"]);
			$content = stripcslashes($app_file["content"]);
	
			if ($filetype == "App") {
				$filepath = $app_dir . $filename;
				file_put_contents($filepath, $content);
				$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
			}
		}
	
		$html .= "\r\n" . '</head>' . "\r\n";
		$html .= '<body>' . "\r\n\r\n";
		$html .= '<script type="text/javascript">SF.informLoad();</script>';
		$html .= '</body>' . "\r\n";
		$html .= '</html>';
	}
	else {
		$app_dir = "apps/$AppId/";
		$models_dir = "apps/$AppId/models/";
		$stores_dir = "apps/$AppId/stores/";
		$views_dir = "apps/$AppId/views/";
		$controllers_dir = "apps/$AppId/controllers/";
		$resources_dir = "apps/$AppId/resources/css/";
	
		$style_file = "libs/sencha-touch-1.1.0/resources/css/sencha-touch.css";
		$code_file = "libs/sencha-touch-1.1.0/sencha-touch-debug.js";
	
		if (file_exists($app_dir)) {
			deleteDir($app_dir);
		}
	
		mkdir($app_dir);
		mkdir($models_dir);
		mkdir($stores_dir);
		mkdir($views_dir);
		mkdir($controllers_dir);
		mkdir($resources_dir, 0777, true);
	
		$html = '<html>' . "\r\n";
		$html .= '<head>' . "\r\n";
		$html .= '<title>' . $app_name . '</title>' . "\r\n\r\n";
		$html .= '<link href="' . $style_file . '" rel="stylesheet" type="text/css" />' . "\r\n";
	
		foreach ($app_files as $app_file) {
			$filetype = $app_file["type"];
			$filename = stripcslashes($app_file["name"]);
			$content = stripcslashes($app_file["content"]);
	
			if ($filetype == "CSS") {
				$filepath = $resources_dir . $filename;
				file_put_contents($filepath, $content);
				$html .= '<link href="' . $filepath . '" rel="stylesheet" type="text/css" />' . "\r\n";
			}
		}
	
		$html .= "\r\n";
	
		$html .= '<script src="../js/SFrame.js" type="text/javascript"></script>' . "\r\n";
		$html .= '<script type="text/javascript">';
		$html .= 'var SF = new SenchaFiddle();';
		$html .= 'SF.init();';
		$html .= '</script>' . "\r\n\r\n";
	
		$html .= '<script src="' . $code_file . '" type="text/javascript"></script>' . "\r\n\r\n";
	
		foreach ($app_files as $app_file) {
			$filetype = $app_file["type"];
			$filename = stripcslashes($app_file["name"]);
			$content = stripcslashes($app_file["content"]);
	
			if ($filetype == "App") {
				$filepath = $app_dir . $filename;
				file_put_contents($filepath, $content);
				$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
			}
		}
	
		foreach ($app_files as $app_file) {
			$filetype = $app_file["type"];
			$filename = stripcslashes($app_file["name"]);
			$content = stripcslashes($app_file["content"]);

			if ($filetype == "Model") {
				$filepath = $app_dir . $filename;
				file_put_contents($filepath, $content);
				$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
			}
		}

		foreach ($app_files as $app_file) {
			$filetype = $app_file["type"];
			$filename = stripcslashes($app_file["name"]);
			$content = stripcslashes($app_file["content"]);

			if ($filetype == "Store") {
				$filepath = $app_dir . $filename;
				file_put_contents($filepath, $content);
				$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
			}
		}

		foreach ($app_files as $app_file) {
			$filetype = $app_file["type"];
			$filename = stripcslashes($app_file["name"]);
			$content = stripcslashes($app_file["content"]);

			if ($filetype == "Viewport") {
				$filepath = $app_dir . $filename;
				file_put_contents($filepath, $content);
				$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
			}
		}

		foreach ($app_files as $app_file) {
			$filetype = $app_file["type"];
			$filename = stripcslashes($app_file["name"]);
			$content = stripcslashes($app_file["content"]);

			if ($filetype == "Controller") {
				$filepath = $app_dir . $filename;
				file_put_contents($filepath, $content);
				$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
			}
		}
	
		$html .= "\r\n" . '</head>' . "\r\n";
		$html .= '<body>' . "\r\n\r\n";
		$html .= '<script type="text/javascript">SF.informLoad();</script>';
		$html .= '</body>' . "\r\n";
		$html .= '</html>';
	}

	echo $html;
	exit(0);
}

header('Cache-Control: no-cache, must-revalidate');
header('Content-type: application/json');

$error = array("senchafiddle" => array("error" => "Valid token is required."));
echo json_encode($error);
?>
