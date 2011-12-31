<?php
    // create, get by token, delete
    require_once '../core/init.php';
    
    if (OAuthRequestVerifier::requestIsSigned())
    {
        try
        {
            $req = new OAuthRequestVerifier();
            $user_id = $req->verify();

            // If we have an user_id, then login as that user (for this request)
            if ($user_id)
            {
                // **** Add your own code here ****
            }
        }
        catch (OAuthException $e)
        {
            // The request was signed, but failed verification
            header('HTTP/1.1 401 Unauthorized');
            header('WWW-Authenticate: OAuth realm=""');
            header('Content-Type: text/plain; charset=utf8');

            echo $e->getMessage();
            exit();
        }
    }
    else {
        echo "Request not signed";
    }
?>
