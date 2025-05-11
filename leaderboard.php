<?php
header('Content-Type: application/json');
$pdo = new PDO('sqlite:scores.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$result = $pdo->query("SELECT pseudo, score FROM leaderboard ORDER BY score DESC LIMIT 10");
$leaderboard = $result->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($leaderboard);
?>
