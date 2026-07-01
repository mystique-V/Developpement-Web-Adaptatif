// =========================================================
//  TP02.5 — Filtrage des événements SIEM (JavaScript)
//  Rôle : filtrer le tableau par IP source et par criticité,
//         UNIQUEMENT au clic sur le bouton "Appliquer les filtres".
// =========================================================


// --- 1. Récupération des éléments dans le DOM ---
// Le DOM est la représentation de la page que le JS peut manipuler.
// querySelector renvoie le PREMIER élément correspondant au sélecteur CSS.
// querySelectorAll renvoie TOUS les éléments correspondants (une liste).

const form      = document.querySelector('.filter-form');          // le formulaire entier
const ipInput   = document.getElementById('ip');                   // le champ texte (par son id)
const severity  = document.getElementById('severity');             // le menu déroulant (par son id)
const rows      = document.querySelectorAll('.events-table tbody tr'); // toutes les lignes du tableau
const tableWrap = document.querySelector('.table-wrap');           // le conteneur du tableau


// --- 2. Création dynamique des éléments d'information ---
// On fabrique ici, en JS, deux éléments qui n'existent pas dans le HTML :
// un compteur de résultats et un message "aucun résultat".

// a) Le compteur "X / Y événements", inséré JUSTE AVANT le tableau.
const counter = document.createElement('p');   // on crée une balise <p>
counter.className = 'filter-count';            // on lui donne une classe (pour le CSS)
tableWrap.before(counter);                      // on l'insère avant le tableau

// b) Le message d'absence de résultat, inséré JUSTE APRÈS le tableau.
const emptyMsg = document.createElement('p');
emptyMsg.className = 'filter-empty';
emptyMsg.textContent = 'Aucun événement ne correspond aux filtres.';
emptyMsg.hidden = true;                          // caché tant qu'il y a des résultats
tableWrap.after(emptyMsg);


// --- 3. Fonction principale de filtrage ---
// On regroupe toute la logique dans une fonction, qu'on appellera au bon moment.
function applyFilters() {

  // Valeur tapée dans le champ IP : trim() enlève les espaces au début/fin,
  // toLowerCase() met en minuscules (pour comparer sans souci de casse).
  const ipQuery  = ipInput.value.trim().toLowerCase();

  // Valeur choisie dans le menu : "all", "critique", "warning" ou "info".
  const sevValue = severity.value;

  let visible = 0;   // compteur de lignes affichées (on l'incrémente au fur et à mesure)

  // forEach parcourt chaque ligne <tr> une par une.
  rows.forEach(function (row) {

    // On récupère le texte de la cellule "IP Source" de CETTE ligne.
    // (On la cible grâce à son attribut data-label, déjà présent dans le HTML.)
    const rowIp = row
      .querySelector('[data-label="IP Source"]')
      .textContent
      .toLowerCase();

    // Correspondance IP : includes() renvoie true si l'IP de la ligne
    // CONTIENT le texte tapé. Recherche partielle : "185" trouve "185.220.101.5".
    // (Si le champ est vide, ipQuery = "" et includes("") est toujours vrai.)
    const matchIp = rowIp.includes(ipQuery);

    // Correspondance criticité :
    //  - si "Tous les niveaux" (all) est choisi -> tout passe ;
    //  - sinon, on vérifie que la ligne possède la classe sev-row-XXX correspondante.
    const matchSev = sevValue === 'all'
      || row.classList.contains('sev-row-' + sevValue);

    // La ligne s'affiche seulement si les DEUX conditions sont vraies (&& = ET).
    const show = matchIp && matchSev;

    // On affiche/masque via un style "inline" appliqué directement sur l'élément.
    //  - '' (chaîne vide) = on laisse le CSS décider (table-row en bureau, block en mobile) ;
    //  - 'none' = la ligne disparaît.
    // On utilise le style inline (et pas l'attribut hidden) car il reste TOUJOURS
    // prioritaire sur le CSS, y compris quand la ligne est en display:block sur mobile.
    row.style.display = show ? '' : 'none';

    if (show) visible++;   // on compte les lignes visibles
  });

  // Mise à jour du compteur ("3 / 7 événements").
  counter.textContent = visible + ' / ' + rows.length + ' événements';

  // Affiche le message uniquement si AUCUNE ligne n'est visible (visible === 0).
  emptyMsg.hidden = visible !== 0;
}


// --- 4. Branchement de l'événement ---
// addEventListener("submit", ...) exécute la fonction quand le formulaire est soumis,
// c'est-à-dire au clic sur "Appliquer les filtres" OU avec la touche Entrée dans le champ.
form.addEventListener('submit', function (event) {
  event.preventDefault();  // empêche le rechargement classique de la page (comportement par défaut)
  applyFilters();          // on lance le filtrage
});


// --- 5. Initialisation ---
// Au chargement, on appelle applyFilters() une fois : cela n'a rien filtré
// (champ vide + "Tous les niveaux"), mais ça affiche le compteur "7 / 7 événements".
applyFilters();
