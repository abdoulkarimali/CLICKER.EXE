// Déclaration variables globales
let palierFondActuel = 1;
let lignes = 0;
let lignesParClic =  1;
let lignesParSec = 0;
let affPrixAmeliorationParClic = 10;
let affAmeliorationParClic = 1;
let intervalBoost = null;
let ameliorationsAuto = [
    { name: 'IDE', cout: 10, clicAutoAmelioration: 1, cpt: 0 },
    { name: 'Moodle', cout: 50, clicAutoAmelioration: 5, cpt: 0 },
    { name: 'Pause Café', cout: 100, clicAutoAmelioration: 10, cpt: 0 },
    { name: 'Maîtrise Algorithmique', cout: 500, clicAutoAmelioration: 20, cpt: 0 },
    { name: 'Ordinateur Quantique', cout: 2000, clicAutoAmelioration: 50, cpt: 0 }
];

// Éléments du DOM utilisés plusieurs fois
let ordi = document.getElementById("ORDI");
let imgAmeliorationParClic = document.getElementById("imgAmeliorationParClic");

// === SAUVEGARDE ET CHARGEMENT ===

// Fonction pour charger la sauvegarde depuis le serveur
function chargerSauvegarde() {
    fetch('get_save.php')
        .then(response => response.json())
        .then(data => {
            if (data && typeof data.score !== 'undefined') {
                lignes = data.score;
                if (data.upgrades && typeof data.upgrades === 'object') {
                    if (data.upgrades.clic !== undefined) lignesParClic = data.upgrades.clic;
                    if (data.upgrades.boostClic !== undefined) affAmeliorationParClic = data.upgrades.boostClic;
                    if (data.upgrades.prixClic !== undefined) affPrixAmeliorationParClic = data.upgrades.prixClic;
                    for (let i = 0; i < ameliorationsAuto.length; i++) {
                        let auto = data.upgrades['auto' + i];
                        if (auto) {
                            ameliorationsAuto[i].cpt = auto.cpt ?? 0;
                            ameliorationsAuto[i].cout = auto.cout ?? ameliorationsAuto[i].cout;
                            ameliorationsAuto[i].clicAutoAmelioration = auto.clicAutoAmelioration ?? ameliorationsAuto[i].clicAutoAmelioration;
                        }

                    }
                }
                recalculerLignesParSec();
                afficheligne();
                updateUpgradesDisplay();
            }
        })
        .catch(err => {
            console.error("Erreur lors du chargement de la sauvegarde", err);
        });
}


// Fonction pour sauvegarder le score et les upgrades sur le serveur
function sauvegarderScore() {
    fetch('save_score.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        // Sauvegarde
body: JSON.stringify({
    score: lignes,
    upgrades: {
        clic: lignesParClic,
        boostClic: affAmeliorationParClic,
        prixClic: affPrixAmeliorationParClic,
        auto0: ameliorationsAuto[0],
        auto1: ameliorationsAuto[1],
        auto2: ameliorationsAuto[2],
        auto3: ameliorationsAuto[3],
        auto4: ameliorationsAuto[4]
    }
})

    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error('Erreur:', data.error);
        }
    })
    .catch(err => console.error('Erreur requête:', err));
}

// Sauvegarde automatique toutes les 30 secondes
function lancerSauvegardeAuto() {
    setInterval(sauvegarderScore, 30000);
}

// === OUTILS ===

// Pour recalculer le boost de base d'une amélioration auto (selon l'index)
function getBaseBoost(i) {
    const base = [1, 5, 10, 20, 50];
    return base[i];
}

// Formatage des nombres (K, M)
function formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(1);
}

// Fonction qui met à jour le nombre de lignes de code récupérées
function afficheligne() {
    document.getElementById("ligne").textContent = formatNumber(lignes);
}

// Met à jour l'affichage des améliorations (prix, boosts, etc.)
function updateUpgradesDisplay() {
    document.getElementById("prixAmeliorationParClic").textContent = formatNumber(affPrixAmeliorationParClic);
    document.getElementById("boostClic").textContent = formatNumber(affAmeliorationParClic);
    for (let i = 0; i < ameliorationsAuto.length; i++) {
        document.getElementById("prixAmeliorationAuto" + i).textContent = formatNumber(ameliorationsAuto[i].cout);
        document.getElementById("boostParSec" + i).textContent = formatNumber(ameliorationsAuto[i].clicAutoAmelioration);
    }
}

// Recalcule le total des lignesParSec selon les améliorations auto
function recalculerLignesParSec() {
    lignesParSec = 0;
    for (let i = 0; i < ameliorationsAuto.length; i++) {
        lignesParSec += ameliorationsAuto[i].cpt * getBaseBoost(i);
    }
    document.getElementById("ligneParSec").textContent = formatNumber(lignesParSec);
    document.getElementById("ligneParClic").textContent = formatNumber(lignesParClic);

}

// Fonction gérant l'achat des améliorations de clics automatique
function acheterAmeliorationAuto(index) {
    let am = ameliorationsAuto[index];
    if (lignes >= am.cout) {
        lignes -= am.cout;
        am.cpt++;
        lignesParSec += getBaseBoost(index);
        am.clicAutoAmelioration *= 1.25;
        document.getElementById("ligneParSec").textContent = formatNumber(lignesParSec);
        document.getElementById("boostParSec" + index).textContent = formatNumber(am.clicAutoAmelioration);
        am.cout = Math.floor(am.cout * Math.pow(1.15, am.cpt));
        document.getElementById("prixAmeliorationAuto" + index).textContent = formatNumber(am.cout);
        afficheligne(lignes);
        activerBoostAuto();
        sauvegarderScore(); // Sauvegarde à chaque achat
    }
}

// Fonction pour activer les différentes améliorations de clics automatique
function activerBoostAuto() {
    if (!intervalBoost) {
        let zoomIn = true;
        intervalBoost = setInterval(() => {
            ordi.style.transition = 'transform 0.001s';
            ordi.style.transform = zoomIn ? 'scale(1.2)' : 'scale(1)';
            zoomIn = !zoomIn;
            lignes += lignesParSec;
            afficheligne(lignes);
        }, 1000);
    }
}

// Fonction qui va mettre à jour notre amélioration de clic
function fetchlclickboost(image, titre) {
    if (lignes >= affPrixAmeliorationParClic) {
        lignes -= affPrixAmeliorationParClic;
        lignesParClic += affAmeliorationParClic;
        document.getElementById("ligneParClic").textContent = formatNumber(lignesParClic);
        afficheligne();
        imgAmeliorationParClic.style.pointerEvents = "none";
        setTimeout(() => {
            affPrixAmeliorationParClic *= 1.35;
            affAmeliorationParClic *= 1.25;
            imgAmeliorationParClic.src = image;
            document.getElementById("prixAmeliorationParClic").textContent = formatNumber(affPrixAmeliorationParClic);
            document.getElementById("boostClic").textContent = formatNumber(affAmeliorationParClic);
            const item = imgAmeliorationParClic.closest(".item");
            const paragraphs = item.querySelectorAll("p");
            paragraphs[0].childNodes[0].nodeValue = `${titre} coût : `;
            imgAmeliorationParClic.style.pointerEvents = "auto";
        }, 0);
        sauvegarderScore(); // Sauvegarde à chaque achat
    }
}

// GESTION DES EVENTS 

ordi.addEventListener("click", () => {
    lignes += lignesParClic;
    afficheligne(lignes);
});

document.getElementById("imgAmeliorationParClic").addEventListener("click", () => {
    
});

const items = document.getElementsByClassName("item");
for (let i = 0; i < items.length; i++) {
    if (i == 0){
        items[i].addEventListener("click", () => {
            fetchlclickboost("images/clavier_mecanique.png", "Clavier mécanique");
        });
    }
    else{
        items[i].addEventListener("click", () => {
            acheterAmeliorationAuto(i-1);
        });
    }

}


// PHP interaction - Session
function startSession(pseudo) {
    fetch('session.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({ pseudo })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'ok') {
            console.log('Session started for', data.pseudo);
        }
    });
}


// Leaderboard
function fetchLeaderboard() {
    fetch('leaderboard.php')
        .then(res => res.json())
        .then(data => {
            const board = document.getElementById('leaderboard');
            if (!Array.isArray(data)) {
                board.innerHTML = "<p>Erreur lors du chargement du leaderboard.</p>";
                console.error("Erreur leaderboard:", data);
                return;
            }
            board.innerHTML = '<h2>Classement</h2><ol>' +
                data.map(player => `
                    <li>
                        <span class="pseudo">${player.pseudo}</span>
                        <span class="score">${player.score}</span>
                    </li>
                `).join('') +
                '</ol>';
        })
        .catch(err => {
            console.error("Erreur réseau:", err);
            document.getElementById('leaderboard').innerHTML = "<p>Erreur réseau.</p>";
        });
}

// Fonction pour activer/désactiver les interactions du jeu (pendant le log screen)
function toggleGameInteractions(active) {
    const etat = active ? "auto" : "none";
    ordi.style.pointerEvents = etat;
    imgAmeliorationParClic.style.pointerEvents = etat;
    for (let i = 0; i < ameliorationsAuto.length; i++) {
        const btn = document.getElementById("imgAmeliorationAuto" + i);
        if (btn) btn.style.pointerEvents = etat;
    }
}

// Initialisation du jeu au démarrage
document.addEventListener('DOMContentLoaded', () => {
    toggleGameInteractions(false);
    const startBtn = document.getElementById("startGameBtn");
    startBtn.addEventListener("click", () => {
        const pseudo = document.getElementById("pseudoInput").value.trim();
        if (pseudo !== "") {
            startSession(pseudo);
            document.getElementById("login-screen").style.display = "none";
            document.getElementById("game").style.display = "block";
            toggleGameInteractions(true);
            chargerSauvegarde();
            fetchLeaderboard();
            lancerSauvegardeAuto(); 
        } else {
            alert("Veuillez entrer un pseudo.");
        }
    });
});
