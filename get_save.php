<?php
require_once 'config.php';

header('Content-Type: application/json');
$response = ["success" => false, "save" => null, "message" => ""];

if (isset($_GET['pseudo'])) {
    $pseudo = $conn->real_escape_string($_GET['pseudo']);

    // On récupère la dernière sauvegarde du joueur
    $sql = "SELECT score, upgrades FROM leaderboard WHERE pseudo = '$pseudo' ORDER BY id DESC LIMIT 1";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();

        $response['success'] = true;
        $response['save'] = [
            "score" => intval($row['score']),
            "upgrades" => json_decode($row['upgrades'], true)
        ];
        $response['message'] = "Sauvegarde trouvée pour $pseudo.";
    } else {
        // Si aucune sauvegarde trouvée, renvoyer une sauvegarde vide par défaut
        $response['success'] = true;
        $response['save'] = [
            "score" => 0,
            "upgrades" => [
                "name" => 1,
                "cout" => 10,
                "clicBoost" => 1,
                "cpt" => [0, 0, 0, 0, 0]
            ]
        ];
        $response['message'] = "Aucune sauvegarde trouvée pour $pseudo, valeurs par défaut chargées.";
    }
} else {
    $response['message'] = "Erreur : pseudo manquant dans la requête.";
}

echo json_encode($response);

$conn->close();
?>
