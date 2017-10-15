<?php
  include 'dataConnectionUtils.php';

  $postdata = file_get_contents("php://input");
  $dataObject = json_decode($postdata);
  
  $username = $dataObject->username;
  $password = $dataObject->password;

  $sql = "SELECT USERNAME, PASSWORD, ADMIN FROM user WHERE USERNAME = '".$username."'";
  $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);

  $arr = array();
  if($result->num_rows == 1) {
    while($row = $result->fetch_assoc()) {
      if(!password_verify($password , $row['PASSWORD'])){
        die("invalidpassword");
      }
      $arr[] = $row;  
    }
  } else {
    die("usernotfound");
  }

  # JSON-encode the response
  echo $json_response = json_encode($arr);
?>