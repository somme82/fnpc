<?php 
  $fileName = '../uploads/avatar/' . $_GET['username'] . '.jpg';
  //$filename = '../uploads/micha.jpg';
  echo '{ "fileExists":"' . file_exists ( $fileName ) . '" }';
?>