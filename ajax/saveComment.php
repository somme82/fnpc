<?php
  require("../lib/sendgrid-php/sendgrid-php.php");
  include 'dataConnectionUtils.php';

  $postdata = file_get_contents("php://input");
  $dataObject = json_decode($postdata);
  
  $articleText = $dataObject->articleText;
  $username = $dataObject->user;
  $matchdayid = $dataObject->matchdayid;

  $sql = "INSERT INTO comments (comment, user, matchday_id) VALUES 
                          ('" . $articleText . "','" . $username . "'," . $matchdayid . ")";
  
  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);
  

  $subject = $username . " hat Spieltag #" . $matchdayid ." kommentiert!";
  
  $sql = "SELECT * from user where subscribeToComments = 1";
  $user = $mysqli->query($sql) or die($mysqli->error.__LINE__);
  
  if($user->num_rows > 0){


    $sendgrid = new SendGrid($sendGrid_Username, $sendGrid_Password);
    //$sendgrid = new SendGrid("micha.fnpc", "12Pissnelka");
    $email    = new SendGrid\Email();

    if($user->num_rows > 0) {
      while($row = $user->fetch_assoc()) {
        $email->addTo($row['email']);
      }
    }

    echo "sending Mail";
    $email->setFrom("somme82@gmail.com")
          ->setSubject($subject)
          ->setHtml("Hallo,<br/><br/>" . $username . " hat folgenden Kommentar zu Spieltag #" . $matchdayid . " hinterlassen: <div style='border-left:1px solid grey; margin-top:15px; padding: 15px;'>" . $articleText . "</div><br/>Mehr unter <a href='http://poker-fnpc.rhcloud.com'>http://poker-fnpc.rhcloud.com</a>");
   echo "mail sent";

    $sendgrid->send($email);
  }
?>