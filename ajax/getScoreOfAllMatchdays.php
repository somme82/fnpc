  <?php
  header("Access-Control-Allow-Origin: *");
  header("Content-Type: application/json; charset=UTF-8");
  require_once 'dataConnectionUtils.php';

  if(isset($_GET['matchdayId'])){
    $matchdayId = $mysqli->real_escape_string($_GET['matchdayId']);
  }

  $columns = array( "score.USER_NAME", "score.CHIPCOUNT", "score.INSERTTIMESTAMP", "score.MATCHDAY_ID", "score.ISREBUY", "score.ID", "penalty.NUMBER");

  $sql = "SELECT " . implode(",", $columns) . "
          FROM score LEFT JOIN penalty ON score.matchday_id = penalty.matchday_id and score.user_name = penalty.user_name ORDER BY INSERTTIMESTAMP DESC";

  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);

  $arr = array();
  if($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
      $arr[] = $row;  
    }
  }

  echo $json_response = json_encode($arr);
?>