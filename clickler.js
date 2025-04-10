let ligne = 0;
let clickpower = 1;
let afprixeau = 10;
let afboosteau = 1;
let afprixauto1 = 5;
let boost1 = false;
let refreshIntervalIdBoost1;

function afficheligne(val) {
    let m = document.getElementById("ligne");
    m.innerHTML = val;
}

let intervalBoost = null;

function boostauto1() {
    let ordi = document.getElementById("ORDI");

    if (!intervalBoost) {
        let zoomIn = true;
        intervalBoost = setInterval(() => {
            ordi.style.transition = 'transform 0.001s';
            ordi.style.transform = zoomIn ? 'scale(1.2)' : 'scale(1)';
            zoomIn = !zoomIn;
        }, 500);
    }

    ligne += 1;
    afficheligne(ligne);
}


window.addEventListener("load", () => {
    let ordi = document.getElementById("ORDI");
    let prixeau = document.getElementById("prixeau");
    let boosteau = document.getElementById("boosteau");
    let eau = document.getElementById("eaux");
    let EAU = document.getElementById("eau"); 
    let prixauto1 = document.getElementById("prixauto1");
    let img_clique_auto1 = document.getElementById("auto1");

    ordi.addEventListener("click", () => {
        ligne += clickpower;
        afficheligne(ligne);
    });

    eau.addEventListener("click", () => {
        if (ligne >= afprixeau) {
            ligne -= afprixeau;
            clickpower += afboosteau;

            afficheligne(ligne);
            
            afprixeau = Math.floor(afprixeau * 1.5);
            prixeau.innerHTML = afprixeau;

        }
    })
    img_clique_auto1.addEventListener("click", () => {
        if (ligne >= afprixauto1) {
            ligne -= afprixauto1;
            boost1 = true;
            clearInterval(refreshIntervalIdBoost1);
            refreshIntervalIdBoost1 = setInterval(boostauto1, 1000);
            afprixauto1 = Math.floor(afprixauto1 * 5);
            prixauto1.innerHTML = afprixauto1;
            afficheligne(ligne);
        }
    });
});
