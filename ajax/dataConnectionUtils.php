<?php

define('DB_HOST', getenv('OPENSHIFT_MYSQL_DB_HOST'));
define('DB_PORT', getenv('OPENSHIFT_MYSQL_DB_PORT'));
define('DB_USER', getenv('OPENSHIFT_MYSQL_DB_USERNAME'));
define('DB_PASS', getenv('OPENSHIFT_MYSQL_DB_PASSWORD'));
define('DB_NAME', getenv('OPENSHIFT_GEAR_NAME'));

$servername = "localhost";
$username = "admin";
$password = "admin";
$dbname = "poker_live";


$sendGrid_Username = getenv('SENDGRID_USERNAME');
$sendGrid_Password = getenv('SENDGRID_PASSWORD');

//$sendGrid_Username = "micha.fnpc";
//$sendGrid_Password = "12Pissnelka";

/*$servername = "127.4.238.2:3306";
$username = "adminr7rXVAl";
$password = "sCPxqAahxhF9";
$dbname = "poker";*/

/*$servername = constant("DB_HOST");
$username = constant("DB_USER");
$password = constant("DB_PASS");
$dbname = constant("DB_NAME");*/

$mysqli = new mysqli($servername, $username, $password, $dbname);

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
} 


$mysqli->set_charset("utf8");

?>