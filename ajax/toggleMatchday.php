<?php
  require("../lib/sendgrid-php/sendgrid-php.php");
  include 'dataConnectionUtils.php';

  $postdata = file_get_contents("php://input");
  $dataObject = json_decode($postdata);
  
  $id = $dataObject->id;
  $active = $dataObject->active;
  $matchdayIndex = $dataObject->matchdayIndex;

  $sql = "UPDATE matchday set active = " . $active . " WHERE ID = " . $id;

  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);


  $sql = "SELECT * from user where subscribeToMail = 1";
  $user = $mysqli->query($sql) or die($mysqli->error.__LINE__);

  if($user->num_rows > 0 && $active == 0){
    $sendgrid = new SendGrid($sendGrid_Username, $sendGrid_Password);
    //$sendgrid = new SendGrid("micha.fnpc", "12Pissnelka");
    $email    = new SendGrid\Email();

    if($user->num_rows > 0) {
      while($row = $user->fetch_assoc()) {
        $email->addTo($row['email']);
      }
    }
    
    $email->setFrom("somme82@gmail.com")
          ->setSubject("Spieltag #" . $matchdayIndex . " beendet")
          ->setHtml("Hallo,<br/><br/>Spieltag #" . $matchdayIndex . " wurde abgeschlossen. <a href='http://poker-fnpc.rhcloud.com'>Hier</a> geht´s zum Ergebnis.");

    $sendgrid->send($email);
  }

?>