<?php
$host = "localhost";
$db = 'clicker';
$user = 'test';
$pass = 'test123456789';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
} catch (PDOException $e) {
    die(json_encode(['error' => $e->getMessage()]));
}

$pseudo = $_GET['pseudo'] ?? '';

$stmt = $pdo->prepare("SELECT * FROM sauvegardes WHERE pseudo = :pseudo");
$stmt->execute([':pseudo' => $pseudo]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);

if ($result) {
    echo json_encode($result);
} else {
    echo json_encode(null);
}
?>
