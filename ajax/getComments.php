<?php
  header("Access-Control-Allow-Origin: *");
  header("Content-Type: application/json; charset=UTF-8");
  include 'dataConnectionUtils.php';

  $matchdayId = "";

  if(isset($_GET['matchdayId'])){
    $matchdayId = $mysqli->real_escape_string($_GET['matchdayId']);
  }
  
  $where = "";

  if ($matchdayId != ""){
    $where = "WHERE MATCHDAY_ID = ". $matchdayId;
  }


  $sql = "SELECT USER, COMMENT, INSERTTIMESTAMP
          FROM comments
          " . $where . "
          ORDER BY INSERTTIMESTAMP DESC ";

  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);

  $arr = array();
  if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
      $arr[] = $row;  
    }
  }

  # JSON-encode the response
  echo $json_response = json_encode($arr);
?>