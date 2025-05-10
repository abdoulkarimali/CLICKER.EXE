<?php
session_start();

if (!isset($_SESSION['pseudo'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

try {
    $pdo = new PDO('sqlite:scores.db');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['score']) || !is_numeric($data['score'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid score value']);
        exit;
    }

    $score = intval($data['score']);
    if ($score < 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Score must be positive']);
        exit;
    }

    $pseudo = $_SESSION['pseudo'];

    $stmt = $pdo->prepare("INSERT INTO leaderboard (pseudo, score) VALUES (?, ?)");
    $stmt->execute([$pseudo, $score]);

    echo json_encode(['status' => 'score saved']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
