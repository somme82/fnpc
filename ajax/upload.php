<?php
include 'dataConnectionUtils.php';



$target_dir = "../uploads/" . basename($_POST["folder"]) . "/";
$target_file = $target_dir . strtolower(basename($_POST["username"]) . ".jpg");
$target_file_original = $target_dir . "originals/" . strtolower(basename($_POST["username"]) . ".jpg");


$oldPassword = $_POST["oldpassword"];
$newPassword = $_POST["newpassword"];
$repeatedNewPassword = $_POST["repeatednewpassword"];

$username = $_POST["username"];

$uploadOk = 1;
$errorMessage = "";
$imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);
// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
    if($_FILES["fileToUpload"]["tmp_name"] != "" && getimagesize($_FILES["fileToUpload"]["tmp_name"]) !== false) {
        $source_image = imagecreatefromjpeg($_FILES["fileToUpload"]["tmp_name"]);
        $src_w= imagesx($source_image);
        $src_h= imagesy($source_image);
        $dest_image = imagecreatetruecolor($src_w, $src_h); //targeted width and height
        imagecopyresampled($dest_image, $source_image, 0, 0, 0, 0, $src_w, $src_h, $src_w, $src_h);
        imagejpeg($dest_image,$target_file_original,100); 

        if ($_POST["folder"] == "avatar"){
            if ($src_w > $src_h){
                $uploadOk == 0;
                $errorMessage = "Profilbilder sind nur im Hochformat erlaubt";
            }
            $dest_w = 100;
            $dest_h = 133;
        } else{
            if ($src_w > $src_h){
                $dest_w = 250;
                $dest_h = 188;
            }elseif($src_w == $src_h){
                $dest_w = 200;
                $dest_h = 200;
            }
            else{
                $dest_w = 200;
                $dest_h = 266;
            }
        }

        if ($uploadOk == 1){
            $dest_image = imagecreatetruecolor($dest_w, $dest_h); //targeted width and height
            imagecopyresampled($dest_image, $source_image, 0, 0, 0, 0, $dest_w, $dest_h, $src_w, $src_h);
            imagejpeg($dest_image,$target_file,100); 
        }
    } else {
        $uploadOk = 0;
        $errorMessage = "Das Bild ist fehlerhaft.";
    }
}



if ($oldPassword != "" || $newPassword != "" || $repeatedNewPassword != ""){

    $sql = "SELECT USERNAME, PASSWORD, ADMIN FROM user WHERE USERNAME = '" . $username . "'";
    $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);

    $arr = array();
    if($result->num_rows == 1) {
        while($row = $result->fetch_assoc()) {
          if(!password_verify($oldPassword , $row['PASSWORD'])){
            die("invalidpassword");
          } else if ($newPassword != $repeatedNewPassword){
            die("passwordsdoesnotmatch");
          } else {
            $sql = "UPDATE user set PASSWORD = '" . crypt($newPassword) . "' WHERE USERNAME = '" . $username . "'";

            $result = $mysqli->query($sql) or die($mysqli->error.__LINE__);
          }
          $arr[] = $row;  
        }
    } else {
        die("usernotfound");
    }
}
?>