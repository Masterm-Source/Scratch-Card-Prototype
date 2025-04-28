const fs = require('fs');
const path = require('path');

const cardsDir = path.join(__dirname, '../cards');
const outputFile = path.join(__dirname, '../public/card-links.json');

function getCardLinks() {
    const cardFolders = fs.readdirSync(cardsDir).filter(file => {
        const fullPath = path.join(cardsDir, file);
        return fs.statSync(fullPath).isDirectory();
    });

    const cardLinks = cardFolders.map(folder => ({
        name: folder,
        url: `/cards/${folder}/`
    }));

    fs.writeFileSync(outputFile, JSON.stringify(cardLinks, null, 2));
    console.log('Card links generated:', cardLinks);
}

getCardLinks();
