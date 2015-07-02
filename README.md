# Calculateur RGAA

Le calculateur RGAA permet de mesurer le pourcentage de conformité d'une page avec les règles RGAA 3.

Vous pouvez accéder au calculateur directement depuis cette page: [Calculateur RGAA.html](http://sylvainbzh.github.io/Calculateur%20RGAA.html)


# Comment ça fonctionne ?
* Ouvrir la page avec Firefox (doit aussi fonctionner avec Chrome).
* Modifier le titre
* Choisir le niveau (A, AA, AAA)
* Saisir un pourcentage pour chaque règle. Soit en cliquant directement sur le nom de la règle soit en cliquant dans la colonne score.
* Le score total s'affiche en bas de page.

A tout moment vous pouvez enregistrer la page en local (fichier -> enregistrer sous) pour continuer plus tard.
Vous pouvez également saisir un commentaire dans le champ situé en bas de page.
Le bouton reset en bas de la page permet comme son nom l'indique de réinitiliser toutes les modifications apportées.

Raccourcis: si vous cliquez sur le titre "Calculateur RGAA" ou le titre d'un chapitre vous attérissez directement au score. Si vous cliquez sur un chapitre dans la liste des scores, vous attérissez directement sur les règles correspondantes.

# Générer le calculateur

Si vous souhaitez générer la page Calculateur RGAA.html:
* cloner le dépot
* lancer la commande `npm install --dev`
* puis `grunt`

La liste des règles au format JSON est obtenue à l'aide de mon autre projet : [rgaa-scrapper](https://github.com/SylvainBzh/rgaa-scraper)
