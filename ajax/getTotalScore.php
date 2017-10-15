<?php
  header("Access-Control-Allow-Origin: *");
  header("Content-Type: application/json; charset=UTF-8");
  require_once 'dataConnectionUtils.php';

  $matchdayId = '%';
  if(isset($_GET['matchdayId'])){
    $matchdayId = $mysqli->real_escape_string($_GET['matchdayId']);
  }

  $columns = array( "USER_NAME", "SUM(CHIPCOUNT) as CHIPCOUNT");

  $sql = "SELECT " . implode(",", $columns) . "
                FROM matchdayresult 
                GROUP BY USER_NAME ORDER BY CHIPCOUNT DESC";

  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);



  $arr = array();
  if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
      $arr[] = $row;  
    }
  }
  echo $json_response = json_encode($arr);
?>