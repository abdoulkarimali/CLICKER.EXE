<?php
$servername = "192.168.1.128";
$username = "test";
$dbname = "clicker";
$password = "test123456789";
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
