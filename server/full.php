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
		$file = $db->query_first("SELECT * FROM files WHERE appid = $AppId AND name = '$file_name'");
		echo stripcslashes($file["content"]);
		
		/*
		if ($last_pos == 0) {
					// get the file by it's name and app id from db	
					$file_name = $file_paths[$last_pos];
					$file = $db->query_first("SELECT * FROM files WHERE appid = $AppId AND name = '$file_name'");
					echo $file["content"];
				}
				else if ($last_pos > 0) {
					// get file name and type first
					$second_last_pos = $last_pos - 1;
					$file_name = $file_paths[$last_pos];
					$file_type = $file_paths[$second_last_pos];
					$file = $db->query_first("SELECT * FROM files WHERE appid = $AppId AND name = '$file_name' AND type = '$file_type'");
					echo $file["content"];
				}*/
		
		
		$db -> close();
		
		exit(0);
	} else {
		$db -> close();
					
		$AppSTVersion = $app["version"];
		
		$app_name = $app["name"];
		if (strlen($app_name) > 0) {
			$app_name .= " - @ ";
		}
		$app_name .= 'SenchaFiddle.com - Online Web Based Sencha Touch IDE';
		
		if ($AppSTVersion > 1.1) {
			//$app_dir = "/";
			$models_dir = "app/model/";
			$stores_dir = "app/store/";
			$views_dir = "app/view/";
			$controllers_dir = "app/controller/";
			$resources_dir = "resources/css/";
			
			$style_file = "../../server/libs/sencha-touch-2-b1/resources/css-debug/sencha-touch.css";
			$code_file = "../../server/libs/sencha-touch-2-b1/sencha-touch-all-debug.js";
		
			$html = '<!DOCTYPE html>' . "\r\n";
			$html .= '<html>' . "\r\n";
			$html .= '<head>' . "\r\n";
			$html .= '<title>' . $app_name . '</title>' . "\r\n\r\n";
			$html .= '<link href="' . $style_file . '" rel="stylesheet" type="text/css" />' . "\r\n";
		
			foreach ($app_files as $app_file) {
				$filetype = $app_file["type"];
				$filename = stripcslashes($app_file["name"]);
				
				if ($filetype == "CSS") {
					$filepath = $resources_dir . $filename;
					$html .= '<link href="' . $filepath . '" rel="stylesheet" type="text/css" />' . "\r\n";
				}
			}
		
			$html .= "\r\n";
		
			$html .= '<script src="../../js/SFrame.js" type="text/javascript"></script>' . "\r\n";
			$html .= '<script type="text/javascript">';
			$html .= 'var SF = new SenchaFiddle();';
			$html .= 'SF.init();';
			$html .= '</script>' . "\r\n\r\n";
		
			$html .= '<script src="' . $code_file . '" type="text/javascript"></script>' . "\r\n\r\n";
		
			foreach ($app_files as $app_file) {
				$filetype = $app_file["type"];
				$filename = stripcslashes($app_file["name"]);
				
				if ($filetype == "App") {
					$filepath = $filename;
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
			$models_dir = "app/model/";
			$stores_dir = "app/store/";
			$views_dir = "app/view/";
			$controllers_dir = "app/controller/";
			$resources_dir = "app/resources/css/";
		
			$style_file = "../../server/libs/sencha-touch-1.1.0/resources/css/sencha-touch.css";
			$code_file = "../../server/libs/sencha-touch-1.1.0/sencha-touch-debug.js";
		
			$html = '<!DOCTYPE html>' . "\r\n";
			$html .= '<html>' . "\r\n";
			$html .= '<head>' . "\r\n";
			$html .= '<title>' . $app_name . '</title>' . "\r\n\r\n";
			$html .= '<link href="' . $style_file . '" rel="stylesheet" type="text/css" />' . "\r\n";
		
			foreach ($app_files as $app_file) {
				$filetype = $app_file["type"];
				$filename = stripcslashes($app_file["name"]);
				
				if ($filetype == "CSS") {
					$filepath = $resources_dir . $filename;
					$html .= '<link href="' . $filepath . '" rel="stylesheet" type="text/css" />' . "\r\n";
				}
			}
		
			$html .= "\r\n";
		
			$html .= '<script src="../../js/SFrame.js" type="text/javascript"></script>' . "\r\n";
			$html .= '<script type="text/javascript">';
			$html .= 'var SF = new SenchaFiddle();';
			$html .= 'SF.init();';
			$html .= '</script>' . "\r\n\r\n";
		
			$html .= '<script src="' . $code_file . '" type="text/javascript"></script>' . "\r\n\r\n";
		
			foreach ($app_files as $app_file) {
				$filetype = $app_file["type"];
				$filename = stripcslashes($app_file["name"]);
				
				if ($filetype == "App") {
					$filepath = $filename;
					$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
				}
			}
		
			foreach ($app_files as $app_file) {
				$filetype = $app_file["type"];
				$filename = stripcslashes($app_file["name"]);
				
				if ($filetype == "Model") {
					$filepath = $models_dir . $filename;
					$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
				}
			}
	
			foreach ($app_files as $app_file) {
				$filetype = $app_file["type"];
				$filename = stripcslashes($app_file["name"]);
				
				if ($filetype == "Store") {
					$filepath = $stores_dir . $filename;
					$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
				}
			}
	
			foreach ($app_files as $app_file) {
				$filetype = $app_file["type"];
				$filename = stripcslashes($app_file["name"]);
				
				if ($filetype == "Viewport") {
					$filepath = $views_dir . $filename;
					$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
				}
			}
	
			foreach ($app_files as $app_file) {
				$filetype = $app_file["type"];
				$content = stripcslashes($app_file["content"]);
	
				if ($filetype == "Controller") {
					$filepath = $controllers_dir . $filename;
					$html .= '<script src="' . $filepath . '" type="text/javascript"></script>' . "\r\n";
				}
			}
		
			$html .= "\r\n" . '</head>' . "\r\n";
			$html .= '<body>' . "\r\n\r\n";
			$html .= '<script type="text/javascript">SF.informLoad();</script>';
			$html .= '</body>' . "\r\n";
			$html .= '</html>';
		}
		
		header('Cache-Control: no-cache, must-revalidate');
		header('Content-type: text/html');
	
		echo $html;
		exit(0);	
	}
}

header('Cache-Control: no-cache, must-revalidate');
header('Content-type: application/json');

$error = array("senchafiddle" => array("error" => "Valid token is required."));
echo json_encode($error);
?>
