<?php
require_once 'config.php';

header('Content-Type: application/json');
$response = ["success" => false, "message" => ""];

if (isset($_POST['pseudo']) && isset($_POST['score']) && isset($_POST['upgrades'])) {
    $pseudo = $conn->real_escape_string($_POST['pseudo']);
    $score = intval($_POST['score']);
    $upgrades = $conn->real_escape_string($_POST['upgrades']);

    $sql = "INSERT INTO leaderboard (pseudo, score, upgrades) VALUES ('$pseudo', $score, '$upgrades')";

    if ($conn->query($sql) === TRUE) {
        $response["success"] = true;
        $response["message"] = "Score et améliorations enregistrés.";
    } else {
        $response["message"] = "Erreur SQL : " . $conn->error;
    }
} else {
    $response["message"] = "Données manquantes (pseudo, score, upgrades).";
}

echo json_encode($response);

$conn->close();
?>
