<?php
  require("../lib/sendgrid-php/sendgrid-php.php");
  include 'dataConnectionUtils.php';

  $postdata = file_get_contents("php://input");
  $dataObject = json_decode($postdata);
  
  $articleText = $dataObject->articleText;
  $user = $dataObject->user;
  $matchdayid = $dataObject->matchdayid;
  $matchdayIndex = $dataObject->matchdayIndex;

  $sql = "SELECT * from articles where matchday_id = " . $matchdayid;
  $check = $mysqli->query($sql) or die($mysqli->error.__LINE__);
  $subject = "";
  if($check->num_rows > 0){
    echo "update";
    $sql = "UPDATE articles set text = '" . $articleText . "' where matchday_id = " . $matchdayid;
    $subject = "Spielbericht #" . $matchdayIndex ." geänert!";
  } else{
    echo "insert";
    $sql = "INSERT INTO articles (text, user_name, matchday_id) VALUES 
                            ('" . $articleText . "','" . $user . "'," . $matchdayid . ")";
    $subject = "Spielbericht #" . $matchdayIndex ." online!";
  }
  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);
  
  $sql = "SELECT * from user where subscribeToMail = 1";
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


    $articleText_imageClean = str_replace ("../uploads/articlePictures/" , "http://poker-fnpc.rhcloud.com/uploads/articlePictures/", $articleText);

    $email->setFrom("somme82@gmail.com")
          ->setSubject($subject)
          ->setHtml("Hallo,<br/><br/>der Bericht zu Spieltag #" . $matchdayIndex . " wurde bearbeitet:<div style='border-left:1px solid grey; margin-top:15px; padding: 15px;'>" . $articleText_imageClean . "</div><br/>Mehr unter <a href='http://poker-fnpc.rhcloud.com'>http://poker-fnpc.rhcloud.com</a>");

    $sendgrid->send($email);
  }
?>