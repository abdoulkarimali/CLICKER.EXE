<?php
$host = "localhost";
$db = 'clicker';
$user = 'test';
$pass = 'test123456789';

header('Content-Type: application/json');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur connexion DB: ' . $e->getMessage()]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['pseudo'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Pseudo manquant']);
    exit;
}

// Récupérer le score actuel en base
$stmt = $pdo->prepare("SELECT lignes FROM sauvegardes WHERE pseudo = :pseudo");
$stmt->execute([':pseudo' => $data['pseudo']]);
$current = $stmt->fetch(PDO::FETCH_ASSOC);

$shouldUpdate = false;

// Si pas d'entrée → nouveau joueur → on insère
if (!$current) {
    $shouldUpdate = true;
} else if ($data['lignes'] > $current['lignes']) {
    $shouldUpdate = true; // Nouveau score > ancien
}

if ($shouldUpdate) {
    $stmt = $pdo->prepare("
        INSERT INTO sauvegardes (pseudo, lignes, lignesParClic, lignesParSec, affPrixAmeliorationParClic, affAmeliorationParClic, ameliorationsAuto, nbAchatsClic)
        VALUES (:pseudo, :lignes, :lignesParClic, :lignesParSec, :prixClic, :boostClic, :ameliorationsn ;nbAchatsClic)
        ON DUPLICATE KEY UPDATE
            lignes = VALUES(lignes),
            lignesParClic = VALUES(lignesParClic),
            lignesParSec = VALUES(lignesParSec),
            affPrixAmeliorationParClic = VALUES(affPrixAmeliorationParClic),
            affAmeliorationParClic = VALUES(affAmeliorationParClic),
            ameliorationsAuto = VALUES(ameliorationsAuto),
            nbAchatsClic = VALUES(nbAchatsClic)
        ");
    
    $stmt->execute([
        ':pseudo' => $data['pseudo'],
        ':lignes' => $data['lignes'],
        ':lignesParClic' => $data['lignesParClic'],
        ':lignesParSec' => $data['lignesParSec'],
        ':prixClic' => $data['affPrixAmeliorationParClic'],
        ':boostClic' => $data['affAmeliorationParClic'],
        ':ameliorations' => json_encode($data['ameliorationsAuto']),
        ':nbAchatsClic' => $data['nbAchatsClic']
    ]);

    echo json_encode(['success' => true, 'message' => 'Score mis à jour']);
} else {
    echo json_encode(['success' => false, 'message' => 'Score non mis à jour (inférieur ou égal)']);
}
?>