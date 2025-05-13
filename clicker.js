// Déclaration variables globales
let palierFondActuel = 1;
let lignes = 0;
let lignesParClic =  1;
let lignesParSec = 0;
let affPrixAmeliorationParClic = 100;
let affAmeliorationParClic = 0.1;    
let intervalBoost = null;
let ameliorationsAuto = [
    { name: 'IDE', cout: 200, clicAutoAmelioration: 5, cpt: 0 },            
    { name: 'Moodle', cout: 1000, clicAutoAmelioration: 30, cpt: 0 },
    { name: 'Pause Café', cout: 5000, clicAutoAmelioration: 120, cpt: 0 },
    { name: 'Maîtrise Algorithmique', cout: 25000, clicAutoAmelioration: 500, cpt: 0 },
    { name: 'Ordinateur Quantique', cout: 100000, clicAutoAmelioration: 2000, cpt: 0 }
];                 

// Éléments du DOM utilisés plusieurs fois
let ordi = document.getElementById("ORDI");
let imgAmeliorationParClic = document.getElementById("imgAmeliorationParClic");


// === SAUVEGARDE ET CHARGEMENT ===

// Fonction pour charger la sauvegarde depuis le serveur
function sauvegarderScore() {
    const pseudo = document.getElementById("pseudoInput").value.trim();
    if (!pseudo) {
        console.warn("Pseudo manquant, pas de sauvegarde.");
        return;
    }

    const upgrades = {
        name: ameliorationsAuto.map(auto => auto.name),
        cout: ameliorationsAuto.map(auto => auto.cout),
        clicBoost: ameliorationsAuto.map(auto => auto.clicAutoAmelioration),
        cpt: ameliorationsAuto.map(auto => auto.cpt)
    };

    fetch('save_score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            pseudo: pseudo,
            score: lignes,
            upgrades: JSON.stringify(upgrades)
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log(data.message);
        } else {
            console.error("Erreur sauvegarde:", data.message);
        }
    })
    .catch(err => console.error("Erreur réseau save_score:", err));
}



// Fonction pour sauvegarder le score et les upgrades sur le serveur
function chargerSauvegarde() {
    const pseudo = document.getElementById("pseudoInput").value.trim();
    if (!pseudo) return;

    fetch(`get_save.php?pseudo=${encodeURIComponent(pseudo)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.save) {
                const sauvegarde = data.save;
                lignes = sauvegarde.score;

                if (sauvegarde.upgrades) {
                    lignesParClic = sauvegarde.upgrades.clic || lignesParClic;
                    affAmeliorationParClic = sauvegarde.upgrades.clicBoost || affAmeliorationParClic;
                    affPrixAmeliorationParClic = sauvegarde.upgrades.prixClic || affPrixAmeliorationParClic;

                    if (Array.isArray(sauvegarde.upgrades.autoBoosts)) {
                        sauvegarde.upgrades.autoBoosts.forEach((cpt, index) => {
                            ameliorationsAuto[index].cpt = cpt;
                        });
                    }
                }

                recalculerLignesParSec();
                afficheligne();
                updateUpgradesDisplay();
            } else {
                console.error("Erreur chargement sauvegarde:", data.message);
            }
        })
        .catch(err => console.error("Erreur réseau get_save:", err));
}

// Sauvegarde automatique toutes les 30 secondes
function lancerSauvegardeAuto() {
    setInterval(sauvegarderScore, 30000);
}

// === OUTILS ===

// Pour recalculer le boost de base d'une amélioration auto (selon l'index)
function getBaseBoost(i) {
    const base = [5, 30, 120, 500, 2000];
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

function refreshligne(){
    document.getElementById("ligneParSec").textContent = formatNumber(lignesParSec);
    document.getElementById("ligneParClic").textContent = formatNumber(lignesParClic);
}

// Recalcule le total des lignesParSec selon les améliorations auto
function recalculerLignesParSec() {
    lignesParSec = 0;
    for (let i = 0; i < ameliorationsAuto.length; i++) {
        lignesParSec += ameliorationsAuto[i].cpt * getBaseBoost(i);
    }
    refreshligne();

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
        majprixboost(1000* lignesParSec + 300);
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
            affPrixAmeliorationParClic *= 2;
            affAmeliorationParClic *= 1.1;
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
            fetchlclickboost("CLICKER.EXE/images/clavier_mecanique.png", "Clavier mécanique");
        });
    }
    else{
        items[i].addEventListener("click", () => {
            acheterAmeliorationAuto(i-1);
        });
    }

}

let boost = document.getElementById("boost");
let spanPrixBoost = document.getElementById("prixboost");
let spanDelaiBoost = document.getElementById("délaiboost");

let boostActif = false;
let cooldownBoost = 6000;  
let intervalBoost2 = null;
let intervalCooldown = null;


function majprixboost(coutBoost) {
    spanPrixBoost.textContent = coutBoost;
}


document.addEventListener('DOMContentLoaded', () => {
    boost.addEventListener("click", () => {
       const coutBoost = 1500 * (lignesParClic + lignesParSec) + 500; 
        const dureeBoost = 30; 

        if (boostActif) return; 
       
        majprixboost(coutBoost);

        if (lignes >= coutBoost) {
            lignes -= coutBoost;
            afficheligne();

            boostActif = true;  
            lignesParClic *= 3;  
            refreshligne();

            
            if (intervalBoost2) {
                clearInterval(intervalBoost2);
            }

            
            let tempsRestant = dureeBoost;
            spanDelaiBoost.textContent = tempsRestant + "s";

            intervalBoost = setInterval(function() {
                tempsRestant--;
                spanDelaiBoost.textContent = tempsRestant + "s";
                if (tempsRestant <= 0) {
                    clearInterval(intervalBoost);  
                    lignesParClic /= 3; 
                    afficheligne();
                    refreshligne();
                    spanDelaiBoost.textContent = "non disponible"; 
                    startCooldown();
                }
            }, 1000);
        }
    });
});

function startCooldown() { 

    
    if (intervalCooldown) {
        clearInterval(intervalCooldown);
    }

    intervalCooldown = setInterval(function() {
        const remainingCooldown = Math.floor(cooldownBoost / 1000);  
        spanDelaiBoost.textContent = "attendre " + remainingCooldown + "s";
        cooldownBoost -= 1000;
        if (cooldownBoost <= 0) {
            clearInterval(intervalCooldown);  
            boostActif = false;  
            spanDelaiBoost.textContent = "Boost disponible";  
        }
    }, 1000);
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
            if (data.success && Array.isArray(data.leaderboard)) {
                const board = document.getElementById('leaderboard');
                board.innerHTML = '<h2>Classement</h2><ol>' +
                    data.leaderboard.map(player => `
                        <li>
                            <span class="pseudo">${player.pseudo}</span>
                            <span class="score">${player.score}</span>
                        </li>
                    `).join('') +
                    '</ol>';
            } else {
                console.error("Erreur leaderboard:", data.message);
                document.getElementById('leaderboard').innerHTML = "<p>Erreur lors du chargement du leaderboard.</p>";
            }
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

