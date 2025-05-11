<?php
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['pseudo'])) {
    $_SESSION['pseudo'] = htmlspecialchars($_POST['pseudo']);
    echo json_encode(['status' => 'ok', 'pseudo' => $_SESSION['pseudo']]);
} else {
    echo json_encode(['pseudo' => $_SESSION['pseudo'] ?? null]);
}
?>
