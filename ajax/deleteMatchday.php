<?php
  include 'dataConnectionUtils.php';

  $postdata = file_get_contents("php://input");
  $dataObject = json_decode($postdata);
  
  $id = $dataObject->id;

  $sql = "DELETE FROM matchday WHERE ID = " . $id;

  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);

?>