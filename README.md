# Calculateur RGAA

Le calculateur RGAA permet de calculer la conformité d'une page avec les règles RGAA 3.

Vous pouvez accéder au calculateur directement depuis cette page: [Calculateur RGAA.html](http://sylvainbzh.github.io/Calculateur%20RGAA.html)

Deux modes sont disponibles:
- Le mode "check-list" qui permet de marquer chaque règle comme valide ou invalide.
- Le mode "pourcentage" qui permet de saisir un pourcentage de conformité pour chaque règle.

# Nouveautés de la version 2
Version 2.1:
- Affichage de la description détaillée de la règle en cliquant sur son numéro (colonne id).
- Amélioration de la navigation au clavier (gestion des flèches haut/bas, entrée, barre espace) dans la liste des règles en mode check-list.

Version 2.0:
- 2 modes au choix "check-list" ou "pourcentage"
- Fonctionnalités d'import / export.
- Bouton enregistrer-sous.
- Message concernant le label e-accessible lorsque le score est suffisant.

# Fonctionnement
* Ouvrir la page avec Firefox (doit aussi fonctionner avec Chrome).
* Modifier le titre
* Choisir le niveau (A, AA, AAA)
* Choisir le mode "check-list" (mode par défaut), ou pourcentage disponible à partir du menu (en haut à gauche).
* Cliquer sur une règle pour changer son état ou son pourcentage de conformité. En mode pourcentage, il est également possible de cliquer dans la colonne score pour saisir une valeur pour chaque règle.
* Le score total s'affiche en bas de page.

A noter que le calculateur peut être utilisé à l'aide du clavier (touches classiques).

A tous moments:
 - Vous pouvez changer de mode (passer du mode pourcentage au mode check-list)
 - Enregistrer la page en cours de travail soit à partir du menu, soit depuis votre navigateur (fichier -> enregistrer) pour continuer plus tard.

Vous pouvez également saisir un commentaire libre dans le champ situé en bas de page.

Le bouton reset comme son nom l'indique permet de réinitialiser toutes les modifications apportées.

**Raccourcis:** si vous cliquez sur le titre "Calculateur RGAA" ou le titre d'un chapitre vous atterrissez directement au score. Si vous cliquez sur un chapitre dans la liste des scores, vous atterrissez directement sur les règles correspondantes.

# Import / export
La version 2 introduit des fonctionnalités d'import/export au format JSON (disponible à partir du menu principal).

# Label e-accessible
Lorsque le score est suffisant un message est indiqué à l'utilisateur que la page peut techniquement bénéficier du label e-accessible version x.

# Pourquoi des pourcentages ?
Comme me l'on fait remarquer [villainjp](https://twitter.com/villainjp)  et [goetsu](https://twitter.com/goetsu) sur twitter, la conformité avec un critère ne peut en théorie être que binaire (0 ou 100%). Cela dit, l'idée en utilisant des pourcentages est de pouvoir donner un état plus précis du travail restant à fournir au projet.
Par exemple pour le premier critère : 

"Chaque image a-t-elle une alternative textuelle ?". 

* Si la page contient 50 images sans alternative, le test et KO.
* Si la page contient 50 images, mais une seule ne possède pas d'alternative le résultat est le même, test KO. 
 
L'utilisation de pourcentage permet d'indiquer plus finement le travail restant à fournir. Même si cela reste plus ou moins subjectif (sauf en entrant dans des calculs mathématiques pour établir les pourcentages mais l'idée n'est pas là).
**L'objectif est bien l'obtention d'un score de 100%.**

# Générer le calculateur

Si vous souhaitez générer la page Calculateur RGAA.html:
* cloner le dépot
* lancer la commande `npm install --dev`
* puis `grunt`

La liste des règles au format JSON est obtenue à l'aide de mon autre projet : [rgaa-scrapper](https://github.com/SylvainBzh/rgaa-scraper)
