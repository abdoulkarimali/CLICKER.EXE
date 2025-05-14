// Déclaration variables globales
let lignes = 0;
let record_lignes = 0;
let lignesParClic =  1;
let lignesParSec = 0;
let affPrixAmeliorationParClic = 50;
let affAmeliorationParClic = 1.5;
let intervalBoost = null;
let ameliorationsAuto = [
    { name: 'IDE', cout: 200, clicAutoAmelioration: 5, cpt: 0 },
    { name: 'Moodle', cout: 1000, clicAutoAmelioration: 30, cpt: 0 },
    { name: 'Pause Café', cout: 5000, clicAutoAmelioration: 120, cpt: 0 },
    { name: 'Maîtrise Algorithmique', cout: 25000, clicAutoAmelioration: 500, cpt: 0 },
    { name: 'Ordinateur Quantique', cout: 100000, clicAutoAmelioration: 2000, cpt: 0 }
];

let coutBoost = 2000;
let boostActif = false;
let cooldownBoost = 600000;  
let intervalBoost2 = null;
let intervalCooldown = null;

// Éléments du DOM utilisés plusieurs fois
let ordi = document.getElementById("ORDI");
let imgAmeliorationParClic = document.getElementById("imgAmeliorationParClic");
let boost = document.getElementById("boost");
let spanPrixBoost = document.getElementById("prixboost");
let spanDelaiBoost = document.getElementById("delaiboost");

// Fonction pour afficher le nombre de lignes

// Formatage des nombres (K, M, B, T, P, E)
function formatNumber(num) {
    if (num >= 1000000000000000000) return `${(num / 1000000000000000000).toFixed(1)}E`;
    if (num >= 1000000000000000) return `${(num / 1000000000000000).toFixed(1)}P`;
    if (num >= 1000000000000) return `${(num / 1000000000000).toFixed(1)}T`;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(1);
}
// Fonction qui met à jour les affichages de la page
function updateAffichage() {
    document.getElementById("ligne").textContent = formatNumber(lignes);
    document.getElementById("ligneParClic").textContent = formatNumber(lignesParClic);
    document.getElementById("ligneParSec").textContent = formatNumber(lignesParSec);
    document.getElementById("prixAmeliorationParClic").textContent = formatNumber(affPrixAmeliorationParClic);
    document.getElementById("boostClic").textContent = formatNumber(affAmeliorationParClic);
    for (let i = 0; i < ameliorationsAuto.length; i++) {
        document.getElementById("prixAmeliorationAuto" + i).textContent = formatNumber(ameliorationsAuto[i].cout);
        document.getElementById("boostParSec" + i).textContent = formatNumber(ameliorationsAuto[i].clicAutoAmelioration);
    }
}

// Pour recalculer le boost de base d'une amélioration auto (selon l'index)
function getBaseBoost(i) {
    const base = [5, 30, 120, 500, 2000];
    return base[i];
}
// Fonction gérant l'achat des améliorations de clics automatique
function acheterAmeliorationAuto(index) {
    let am = ameliorationsAuto[index];
    if (lignes >= am.cout) {
        lignes -= am.cout;
        am.cpt++;
        lignesParSec += am.clicAutoAmelioration;
        am.cout = Math.floor(am.cout * (1.15 + 0.001 * am.cpt));
        am.clicAutoAmelioration = getBaseBoost(index) * (1 + 0.10 * am.cpt);
        document.getElementById("boostParSec" + index).textContent = formatNumber(am.clicAutoAmelioration);
        document.getElementById("prixAmeliorationAuto" + index).textContent = formatNumber(am.cout);
        updateAffichage();
        coutBoost = 75 * lignesParSec + 300;
        majprixboost(formatNumber(coutBoost));
        activerBoostAuto();
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
            updateAffichage();
        }, 1000);
    }
}

// Fonction qui va mettre à jour notre amélioration de clic
function fetchlclickboost(image, titre) {
    if (lignes >= affPrixAmeliorationParClic) {
        
        lignes -= affPrixAmeliorationParClic;
        lignesParClic += affAmeliorationParClic;        
        document.getElementById("ligneParClic").textContent = formatNumber(lignesParClic);
        updateAffichage();
        
        
        imgAmeliorationParClic.style.pointerEvents = "none";
        setTimeout(() => {
            affPrixAmeliorationParClic *= 1.30;
            affAmeliorationParClic *= 1.1;

            imgAmeliorationParClic.src = image;
            document.getElementById("prixAmeliorationParClic").textContent = formatNumber(affPrixAmeliorationParClic);
            document.getElementById("boostClic").textContent = formatNumber(affAmeliorationParClic);

            const item = imgAmeliorationParClic.closest(".item");
            const paragraphs = item.querySelectorAll("p");
            paragraphs[0].childNodes[0].nodeValue = `${titre} coût : `;

            imgAmeliorationParClic.style.pointerEvents = "auto";
        }, 0);
    }
}

// Gestion du boost de clic x3

function majprixboost(coutBoost) {
    spanPrixBoost.textContent = coutBoost;
}

function startCooldown() { 
    if (intervalCooldown) {
        clearInterval(intervalCooldown);
    }

    let remainingCooldown = cooldownBoost / 1000;
    intervalCooldown = setInterval(function() {
    spanDelaiBoost.textContent = "attendre " + remainingCooldown + "s";
    remainingCooldown--;
    if (remainingCooldown <= 0) {
        clearInterval(intervalCooldown);
        boostActif = false;
        spanDelaiBoost.textContent = "Boost disponible";
    }
    }, 1000);

}






// GESTION DES EVENTS PRINCIPAUX

ordi.addEventListener("click", () => {
    lignes += lignesParClic;
    updateAffichage();
});

const items = document.getElementsByClassName("item");
for (let i = 0; i < items.length; i++) {
    if (i == 0){
        items[i].addEventListener("click", () => {
            fetchlclickboost("CLICKER.EXE/images/clavier_mecanique.png", "Clavier mécanique,");
        });
    }
    else{
        items[i].addEventListener("click", () => {
            acheterAmeliorationAuto(i-1);
        });
    }
}

boost.addEventListener("click", () => {
        const dureeBoost = 30; 
        coutBoost = 75 * lignesParSec + 300;
        if (boostActif) return; 

        if (lignes >= coutBoost) {
            majprixboost(formatNumber(coutBoost));
            lignes -= coutBoost;
            updateAffichage();

            boostActif = true;  
            lignesParClic *= 3;  

            
            if (intervalBoost2) {
                clearInterval(intervalBoost2);
            }

            
            let tempsRestant = dureeBoost;
            spanDelaiBoost.textContent = tempsRestant + "s";

            intervalBoost2 = setInterval(function() {
                tempsRestant--;
                spanDelaiBoost.textContent = tempsRestant + "s";
                if (tempsRestant <= 0) {
                    clearInterval(intervalBoost2);  
                    lignesParClic /= 3; 
                    updateAffichage();
                    spanDelaiBoost.textContent = "non disponible"; 
                    startCooldown();
                }
            }, 1000);
        }
});



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


// Gestion de la sauvegarde
function sauvegarderScore() {
    const data = {
        pseudo: currentPseudo,
        lignes: lignes,
        record_lignes: record_lignes,
        lignesParClic: lignesParClic,
        lignesParSec: lignesParSec,
        affPrixAmeliorationParClic: affPrixAmeliorationParClic,
        affAmeliorationParClic: affAmeliorationParClic,
        ameliorationsAuto: ameliorationsAuto
    };

    fetch('CLICKER.EXE/save.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            console.error("Erreur de sauvegarde : ", response.statusText);
        }
    })
    .catch(err => {
        console.error("Erreur réseau lors de la sauvegarde : ", err);
    });
}

let currentPseudo = "";

function chargerSauvegarde(pseudo) {
    fetch(`CLICKER.EXE/load.php?pseudo=${encodeURIComponent(pseudo)}&t=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                lignes = parseInt(data.lignes);
                lignesParClic = parseInt(data.lignesParClic);
                lignesParSec = parseInt(data.lignesParSec);
                affPrixAmeliorationParClic = parseFloat(data.affPrixAmeliorationParClic);
                affAmeliorationParClic = parseFloat(data.affAmeliorationParClic);
                ameliorationsAuto = JSON.parse(data.ameliorationsAuto);
                record_lignes = parseInt(data.record_lignes);
                majprixboost(formatNumber(coutBoost));
                updateAffichage();
                const hasAutoUpgrade = ameliorationsAuto.some(am => am.cpt > 0);
                if (hasAutoUpgrade) {
                    activerBoostAuto();
                }
            }
        });
}

function chargerLeaderboard() {
    fetch('CLICKER.EXE/leaderboard.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau ou serveur : ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Leaderboard data:', data);

            const leaderboardDiv = document.getElementById('leaderboard');

            if (Array.isArray(data)) {
                let html = '<h2>Classement : Top 10</h2><ol>';
                data.forEach(player => {
                    html += `<li><span class="pseudo">${player.pseudo}</span><span class="score">${formatNumber(player.lignes)}</span></li>`;
                });
                html += '</ol>';
                leaderboardDiv.innerHTML = html;
            } else if (data && data.error) {
                console.error('Erreur SQL/PHP côté serveur :', data.error);
                leaderboardDiv.innerHTML = '<p>Erreur de chargement du classement.</p>';
            } else {
                console.error('Erreur leaderboard: réponse inattendue', data);
                leaderboardDiv.innerHTML = '<p>Aucune donnée reçue.</p>';
            }
        })
        .catch(err => {
            console.error('Erreur fetch leaderboard:', err);
            const leaderboardDiv = document.getElementById('leaderboard');
            leaderboardDiv.innerHTML = '<p>Erreur de connexion au classement.</p>';
        });
}


// Sauvegardes automatiques

setInterval(chargerLeaderboard, 1000);
setInterval(() => {
    if (currentPseudo !== "") {
        sauvegarderScore();
    }
}, 1000);

window.addEventListener("beforeunload", () => {
    if (currentPseudo !== "") {
        sauvegarderScore();
    }
});


// Initialisation du jeu au démarrage
let startBtn = document.getElementById("startGameBtn");
startBtn.addEventListener("click", () => {
    const pseudo = document.getElementById("pseudoInput").value.trim();
    if (pseudo !== "") {
        currentPseudo = pseudo;
        chargerSauvegarde(pseudo);
        chargerLeaderboard();
        document.getElementById("joueurPseudo").textContent = `${currentPseudo} Industry`;
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("game").style.display = "block";
        toggleGameInteractions(true);
    } else {
        alert("Veuillez entrer un pseudo.");
    }
});

document.getElementById("pseudoInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        document.getElementById("startGameBtn").click();
    }
});

