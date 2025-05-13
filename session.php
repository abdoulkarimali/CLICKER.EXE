<?php
session_start();
header('Content-Type: application/json');

$response = ["success" => false, "message" => ""];

if (isset($_POST['pseudo'])) {
    $_SESSION['pseudo'] = $_POST['pseudo'];
    $response['success'] = true;
    $response['message'] = "Pseudo enregistré : " . $_SESSION['pseudo'];
} else {
    $response['message'] = "Aucun pseudo reçu.";
}

echo json_encode($response);
?>
