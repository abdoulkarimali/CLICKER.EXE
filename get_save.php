<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['pseudo'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$pdo = new PDO('sqlite:scores.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pseudo = $_SESSION['pseudo'];

$stmt = $pdo->prepare("SELECT score, upgrades FROM leaderboard WHERE pseudo = ?");
$stmt->execute([$pseudo]);
$data = $stmt->fetch(PDO::FETCH_ASSOC);

if ($data) {
    echo json_encode([
        'score' => intval($data['score']),
        'upgrades' => json_decode($data['upgrades'], true)
    ]);
} else {
    echo json_encode(['score' => 0, 'upgrades' => []]);
}
?>
