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


// DÉCLARTATION DES FONCTIONS

// Formatage des nombres
function formatNumber(num) {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(1);
}
// Fonction qui met à jour le nombre de lignes de code récupérées
// et met à jour l'image de fond selon le nombre de lignes de code récupérées
function afficheligne() {
    if (lignes >= 10000 && palierFondActuel < 3) {
        document.body.style.backgroundImage = 'url("images/background3.png")';
        palierFondActuel = 3;
    } else if (lignes >= 1000 && palierFondActuel < 2) {
        document.body.style.backgroundImage = 'url("images/background2.png")';
        palierFondActuel = 2;
    }

    document.getElementById("ligne").textContent = formatNumber(lignes);
}



// Fonction gérant l'achat des améliorations de clics automatique
function acheterAmeliorationAuto(index) {
    let am = ameliorationsAuto[index];
    if (lignes >= am.cout) {
        lignes -= am.cout;
        
        // Incrémentation du nombre d’achats
        am.cpt++;

        // Mise à jour des lignes par seconde
        lignesParSec += am.clicAutoAmelioration;
        am.clicAutoAmelioration *= 1.25;
        document.getElementById("ligneParSec").textContent = formatNumber(lignesParSec);
        document.getElementById("boostParSec"+ index).textContent = formatNumber(am.clicAutoAmelioration);
        
        // Augmentation du prix pour le prochain achat
        am.cout = Math.floor(am.cout * Math.pow(1.15, am.cpt));

        // Affichage du prix à jour
        document.getElementById("prixAmeliorationAuto" + index).textContent = formatNumber(am.cout);

        afficheligne(lignes);
        activerBoostAuto();
    }
}



// Fonction pour activer les différentes améliorations de cliques automatique
function activerBoostAuto() {
    if (!intervalBoost) {
        let zoomIn = true;
        intervalBoost = setInterval(() => {
            // Animation
            ordi.style.transition = 'transform 0.001s';
            ordi.style.transform = zoomIn ? 'scale(1.2)' : 'scale(1)';
            zoomIn = !zoomIn;

            // Calcul des gains automatiques
            lignes += lignesParSec;
            afficheligne(lignes);
        }, 1000);
    }
}

/*Fonction qui va mettre a jour notre amelioration de click*/
function fetchlclickboost(image, titre) {
    if (lignes >= affPrixAmeliorationParClic) {
        lignes -= affPrixAmeliorationParClic;

        // Application du boost
        lignesParClic += affAmeliorationParClic;
        document.getElementById("ligneParClic").textContent = formatNumber(lignesParClic);
        afficheligne();

        // Empêche le double clic rapide
        imgAmeliorationParClic.style.pointerEvents = "none";

        setTimeout(() => {
            // Mise à jour des valeurs pour le prochain boost
            affPrixAmeliorationParClic *= 1.35;
            affAmeliorationParClic *= 1.25;

            // Mise à jour de l'affichage
            imgAmeliorationParClic.src = image;
            document.getElementById("prixAmeliorationParClic").textContent = formatNumber(affPrixAmeliorationParClic);
            document.getElementById("boostClic").textContent = formatNumber(affAmeliorationParClic);

            // Mise à jour des textes dans la div contenant l'amélioration
            const item = imgAmeliorationParClic.closest(".item");
            const paragraphs = item.querySelectorAll("p");
            paragraphs[0].childNodes[0].nodeValue = `${titre} coût : `;

            imgAmeliorationParClic.style.pointerEvents = "auto";
        }, 0);
    }
}

// GESTION DES EVENTS 

// Clique sur l'ordinateur pour récupérer des lignes de code 
ordi.addEventListener("click", () => {
    lignes += lignesParClic;
    afficheligne(lignes);
});

// Gestion de l'amélioration du boost par clic
document.getElementById("imgAmeliorationParClic").addEventListener("click", () => {
    fetchlclickboost("images/clavier_mecanique.png","Clavier mécanique"); 
});


// Gestion des achats d'améliorations automatiques
for (let i = 0; i < ameliorationsAuto.length; i++) {
    document.getElementById("imgAmeliorationAuto" + i).addEventListener("click", () => {
        acheterAmeliorationAuto(i);
    });
}