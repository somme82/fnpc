<?php
  include 'dataConnectionUtils.php';

  $postdata = file_get_contents("php://input");
  $dataObject = json_decode($postdata);
  
  $username = $dataObject->username;
  $matchdayId = $dataObject->matchdayId;
  $chipcount = $dataObject->chipcount;
  $isRebuy = $dataObject->isRebuy;

  $sql = "INSERT INTO score (user_name, matchday_id, chipcount, isrebuy) VALUES 
                            ('" . $username . "', " . $matchdayId . ", " . $chipcount . ", " . $isRebuy . ")";

  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);

?>