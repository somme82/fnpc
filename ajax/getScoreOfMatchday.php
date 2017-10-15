<?php
  header("Access-Control-Allow-Origin: *");
  header("Content-Type: application/json; charset=UTF-8");
  require_once 'dataConnectionUtils.php';
  //include 'queryUtils.php';

  /*$postdata = file_get_contents("php://input");
  $dataObject = json_decode($postdata);*/

  $matchdayId = "%";

  if(isset($_GET['matchdayId'])){
    $matchdayId = $mysqli->real_escape_string($_GET['matchdayId']);
  }

  $columns = array( "USER_NAME", "CHIPCOUNT", "INSERTTIMESTAMP");

  $sql = "SELECT " . implode(",", $columns) . "
          FROM score
          INNER JOIN 
          (
            SELECT user_name, MAX(inserttimestamp) AS inserttimestamp
            FROM score GROUP BY user_name
          ) AS max USING (user_name, inserttimestamp) where matchday_id = " . $matchdayId . "
          GROUP BY user_name 
          ORDER BY CHIPCOUNT DESC";

  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);

  $arr = array();
  if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
      $arr[] = $row;  
    }
  }

  # JSON-encode the response
  echo $json_response = json_encode($arr);


/*
  $outp = "";

  while($rs = $result->fetch_array(MYSQLI_ASSOC)) {
      if ($outp != "") {$outp .= ",";}
      $outp .= '{"username":"'  . $rs["USERNAME"] . '"}'; 
  }

  $outp ='{"records":['.$outp.']}';
  $conn->close();

  echo($outp);
*/
?>