<?php
  include 'dataConnectionUtils.php';

  $postdata = file_get_contents("php://input");
  $dataObject = json_decode($postdata);
  
  $username = $dataObject->username;
  $date = $dataObject->date;

  $sql = "INSERT INTO matchday (venue, date) VALUES 
                            ('" . $username . "', '" . $date ."')";

  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);

?>