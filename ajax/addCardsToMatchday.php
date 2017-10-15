<?php
  include 'dataConnectionUtils.php';

  $postdata = file_get_contents("php://input");
  $dataObject = json_decode($postdata);
  
  $username = $dataObject->username;
  $matchdayId = $dataObject->matchdayId;
  $cards = $dataObject->cards;



  $sql = "SELECT *
          FROM penalty
          WHERE matchday_id = " .  $matchdayId . " AND user_name = '" . $username . "'" ;
  
  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);
  
  $arr = array();
  if($result->num_rows > 0) {
    $sql = "UPDATE penalty set number = " . $cards . "
            WHERE user_name = '" . $username . "' AND matchday_id = " . $matchdayId;
  } else{
    $sql = "INSERT INTO penalty (user_name, matchday_id, number) VALUES 
                            ('" . $username . "', " . $matchdayId . ", " . $cards . ")";
  }

  
  echo $sql;
  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);

?>