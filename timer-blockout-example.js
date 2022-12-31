const { bindNodeCallback } = require('rxjs');
const fs = require('fs');

// Création d'un flux de données à partir du fichier
const stream = fs.createReadStream('./convertMemory.js', 'utf8');

// Création d'une fonction de lecture de fichier en utilisant bindNodeCallback
const readFile = bindNodeCallback(fs.readFile);

// Lecture du fichier en utilisant un flux de données
readFile(stream).subscribe(
    data => console.log(data),
    err => console.error(err)
);
