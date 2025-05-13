<?php

$host = 'localhost';
$db = 'clicker';
$user = 'test';
$pass = 'test123456789';

header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur connexion DB: ' . $e->getMessage()]);
    exit;
}

try {
    $stmt = $pdo->query("SELECT pseudo, lignes FROM sauvegardes ORDER BY lignes DESC LIMIT 10");
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur SQL: ' . $e->getMessage()]);
}
?>
