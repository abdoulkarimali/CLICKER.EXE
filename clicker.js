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



// Pour recalculer le boost de base d'une amélioration auto (selon l'index)
function getBaseBoost(i) {
    const base = [1, 5, 10, 20, 50];
    return base[i];
}

// Formatage des nombres (K, M, B, T)
function formatNumber(num) {
    if (num >= 1000000000000) return `${(num / 1000000000000).toFixed(1)}T`;
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
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
        majprixboost(1000 * lignesParSec + 300);
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
    afficheligne(lignes);
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

boost.addEventListener("click", () => {
        const coutBoost = 1000 * lignesParSec + 300;
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

            intervalBoost2 = setInterval(function() {
                tempsRestant--;
                spanDelaiBoost.textContent = tempsRestant + "s";
                if (tempsRestant <= 0) {
                    clearInterval(intervalBoost2);  
                    lignesParClic /= 3; 
                    afficheligne();
                    refreshligne();
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
    });
}

let currentPseudo = "";

function chargerSauvegarde(pseudo) {
    fetch(`CLICKER.EXE/load.php?pseudo=${encodeURIComponent(pseudo)}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                lignes = parseInt(data.lignes);
                lignesParClic = parseInt(data.lignesParClic);
                lignesParSec = parseInt(data.lignesParSec);
                affPrixAmeliorationParClic = parseFloat(data.affPrixAmeliorationParClic);
                affAmeliorationParClic = parseFloat(data.affAmeliorationParClic);
                ameliorationsAuto = JSON.parse(data.ameliorationsAuto);
                majprixboost(1000 * lignesParSec + 300);
                afficheligne();
                refreshligne();
                updateUpgradesDisplay();
                recalculerLignesParSec();
                activerBoostAuto();
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

setInterval(chargerLeaderboard, 10000);
setInterval(() => {
    if (currentPseudo !== "") {
        sauvegarderScore();
    }
}, 10000);



// Initialisation du jeu au démarrage
let startBtn = document.getElementById("startGameBtn");
startBtn.addEventListener("click", () => {
    const pseudo = document.getElementById("pseudoInput").value.trim();
    if (pseudo !== "") {
        currentPseudo = pseudo;
        chargerLeaderboard();
        chargerSauvegarde(pseudo);
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("game").style.display = "block";
        toggleGameInteractions(true);
    } else {
        alert("Veuillez entrer un pseudo.");
    }
});
