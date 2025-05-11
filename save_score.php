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

$pdo->exec("CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY,
    pseudo TEXT UNIQUE,
    score INTEGER,
    upgrades TEXT
)");

$data = json_decode(file_get_contents('php://input'), true);
$pseudo = $_SESSION['pseudo'];
$score = intval($data['score'] ?? 0);
$upgrades = json_encode($data['upgrades'] ?? []);

$stmt = $pdo->prepare("
    INSERT INTO leaderboard (pseudo, score, upgrades)
    VALUES (:pseudo, :score, :upgrades)
    ON CONFLICT(pseudo)
    DO UPDATE SET
        score = MAX(score, excluded.score),
        upgrades = excluded.upgrades
");

$stmt->execute([
    ':pseudo' => $pseudo,
    ':score' => $score,
    ':upgrades' => $upgrades
]);

echo json_encode(['status' => 'score saved']);
?>
