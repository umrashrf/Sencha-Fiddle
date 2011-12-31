<?PHP

    $header = null;
    $valid_url_regex = '/.*/';

    // ############################################################################

    if (!isset($_GET['url'])) {
        // Passed url not specified.
        $contents = 'ERROR: url not specified';
        $status = array('http_code' => 'ERROR');

    } elseif (!preg_match($valid_url_regex, $_GET['url'])) {
        // Passed url doesn't match $valid_url_regex.
        $contents = 'ERROR: invalid url';
        $status = array('http_code' => 'ERROR');

    } else {
        $url = $_GET['url'];

        $ch = curl_init($url);

        if (strtolower($_SERVER['REQUEST_METHOD']) == 'post') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $_POST);
        }

        if (isset($_GET['send_cookies'])) {
            $cookie = array();
            foreach ($_COOKIE as $key => $value) {
                $cookie[] = $key . '=' . $value;
            }
            if (isset($_GET['send_session'])) {
                $cookie[] = SID;
            }
            $cookie = implode('; ', $cookie);

            curl_setopt($ch, CURLOPT_COOKIE, $cookie);
        }

        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        curl_setopt($ch, CURLOPT_USERAGENT, isset($_GET['user_agent']) ? $_GET['user_agent'] : $_SERVER['HTTP_USER_AGENT']);

        list($header, $contents) = preg_split('/([\r\n][\r\n])\\1/', curl_exec($ch), 2);

        $status = curl_getinfo($ch);

        curl_close($ch);
    }

    // Split header text into an array.
    $header_text = preg_split('/[\r\n]+/', $header); 

    // Propagate headers to response.
    foreach ($header_text as $header) {
        if (preg_match('/^(?:Content-Type|Content-Language|Set-Cookie):/i', $header)) {
            header($header);
        }
    }

    print $contents;
?>