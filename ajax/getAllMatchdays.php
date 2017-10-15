<?php
  header("Access-Control-Allow-Origin: *");
  header("Content-Type: application/json; charset=UTF-8");
  include 'dataConnectionUtils.php';


  $columns = array( "ID", "DATE", "VENUE", "ACTIVE");

  $sql = "SELECT " . implode(",", $columns) . "
          FROM matchday ORDER BY DATE ASC";

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