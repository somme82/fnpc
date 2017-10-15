<?php
  include 'dataConnectionUtils.php';

  $postdata = file_get_contents("php://input");
  $dataObject = json_decode($postdata);
  
  $username = $dataObject->username;

  $sql = "INSERT INTO user (username) VALUES 
                            ('" . $username . "')";

  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);

?>