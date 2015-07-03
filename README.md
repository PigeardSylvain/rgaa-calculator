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
