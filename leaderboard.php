<?php
$pdo = new PDO('sqlite:scores.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// S'assurer que la table existe
$pdo->exec("CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pseudo TEXT NOT NULL,
    score INTEGER NOT NULL
)");

try {
    $result = $pdo->query("SELECT pseudo, score FROM leaderboard ORDER BY score DESC LIMIT 10");
    $leaderboard = $result->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($leaderboard);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
