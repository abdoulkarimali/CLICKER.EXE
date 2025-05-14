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

// Récupérer le record actuel du joueur
$stmt = $pdo->prepare("SELECT record_lignes FROM sauvegardes WHERE pseudo = :pseudo");
$stmt->execute([':pseudo' => $data['pseudo']]);
$currentRecord = $stmt->fetchColumn();

// Si le nouveau nombre de lignes est supérieur au record, mettre à jour le record
$newRecord = $data['lignes'];
$updateRecord = ($newRecord > $currentRecord) ? $newRecord : $currentRecord;

$stmt = $pdo->prepare("
    INSERT INTO sauvegardes (pseudo, lignes, record_lignes, lignesParClic, lignesParSec, affPrixAmeliorationParClic, affAmeliorationParClic, ameliorationsAuto)
    VALUES (:pseudo, :lignes, :record_lignes, :lignesParClic, :lignesParSec, :prixClic, :boostClic, :ameliorations)
    ON DUPLICATE KEY UPDATE
        lignes = VALUES(lignes),
        record_lignes = VALUES(record_lignes),
        lignesParClic = VALUES(lignesParClic),
        lignesParSec = VALUES(lignesParSec),
        affPrixAmeliorationParClic = VALUES(affPrixAmeliorationParClic),
        affAmeliorationParClic = VALUES(affAmeliorationParClic),
        ameliorationsAuto = VALUES(ameliorationsAuto)
");

$stmt->execute([
    ':pseudo' => $data['pseudo'],
    ':lignes' => $data['lignes'],
    ':record_lignes' => $updateRecord,
    ':lignesParClic' => $data['lignesParClic'],
    ':lignesParSec' => $data['lignesParSec'],
    ':prixClic' => $data['affPrixAmeliorationParClic'],
    ':boostClic' => $data['affAmeliorationParClic'],
    ':ameliorations' => json_encode($data['ameliorationsAuto'])
]);
?>
