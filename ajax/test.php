<?php

// Erzeugung von Passwort-Hash
$password = "micha";

$hash = password_hash($password, PASSWORD_DEFAULT);
$crypt = crypt($password);

echo "password_hash: " . $hash;
echo "<br/>";
echo "crypt: " . $crypt;

?>