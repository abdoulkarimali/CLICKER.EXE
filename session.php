<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['pseudo']) && !empty($_POST['pseudo'])) {
    $_SESSION['pseudo'] = htmlspecialchars(trim($_POST['pseudo']));
    echo json_encode(['status' => 'ok', 'pseudo' => $_SESSION['pseudo']]);
} else {
    echo json_encode(['pseudo' => $_SESSION['pseudo'] ?? null]);
}
?>
