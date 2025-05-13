<?php
require_once 'config.php';

header('Content-Type: application/json'); 

$response = ["success" => false, "leaderboard" => [], "message" => ""];

$sql = "SELECT pseudo, score, upgrades FROM leaderboard ORDER BY score DESC LIMIT 10";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $row['upgrades'] = json_decode($row['upgrades'], true);
        $response['leaderboard'][] = $row;
    }
    $response['success'] = true;
    $response['message'] = "Leaderboard récupéré avec succès.";
} else {
    $response['message'] = "Aucun score trouvé.";
}

echo json_encode($response);

$conn->close();
?>
