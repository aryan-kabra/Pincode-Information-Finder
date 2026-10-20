<?php

$host = "sql111.infinityfree.com";
$username = "if0_42500789";
$password = "8cwOODHXBT7InR";
$database = "if0_42500789_lol";

$conn = mysqli_connect($host, $username, $password, $database);

if (!$conn) {
    die("Database Connection Failed: " . mysqli_connect_error());
}

?>