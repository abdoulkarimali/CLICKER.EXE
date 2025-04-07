let ligne = 0;
let clickpower = 1;
let afprixeau = 10;
let afboosteau = 1;

function afficheligne(val) {
    let m = document.getElementById("ligne");
    m.innerHTML = val;
}

window.addEventListener("load", () => {
    let ordi = document.getElementById("ORDI");
    let prixeau = document.getElementById("prixeau");
    let boosteau = document.getElementById("boosteau");
    let eau = document.getElementById("eaux");
    let EAU = document.getElementById("eau"); 

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
    });
});
