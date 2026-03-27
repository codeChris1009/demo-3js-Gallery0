/**
 * @typedef {Object} Artwork
 * @property {number} id
 * @property {string} image
 * @property {string} title
 * @property {string} artist
 * @property {number} StartYear
 * @property {number} EndYear
 * @property {string} description
 * @property {string} url
 */

/** @type {Artwork[]} */
const artworks = [
    {
        id: 1,
        image: 'Forest-Landscape-in-the-Moonlight.png',
        title: 'Forest Landscape in the Moonlight',
        artist: 'Georg Eduard Otto Saal',
        StartYear: 1861,
        EndYear: 1861,
        description: 'Boslandschap bij maanlicht. Twee herten staan bij de oever van een meertje.',
        url: 'https://www.rijksmuseum.nl/en/collection/object/Forest-Landscape-in-the-Moonlight--f20a4913dbb122bad9efa767afb90d7f',
    },
    {
        id: 2,
        image: 'Seascape-from-the-Zeeland-Waters-near-the-Island-of-Schouwen.png',
        title: 'Seascape from the Zeeland Waters near the Island of Schouwen',
        artist: 'Petrus Johannes Schotel',
        StartYear: 1825,
        EndYear: 1827,
        description: 'Zeegezicht van de Zeeuwse wateren bij Schouwen, op het water vier schepen waarvan de rechter met een sloep.',
        url: 'https://www.rijksmuseum.nl/en/collection/object/Seascape-from-the-Zeeland-Waters-near-the-Island-of-Schouwen--06d68e18485dc82d3f8dd85b0589c195',
    },
    {
        id: 3,
        image: 'Shepherdess-with-a-Flock-of-Sheep.png',
        title: 'Shepherdess with a Flock of Sheep',
        artist: 'Anton Mauve',
        StartYear: 1870,
        EndYear: 1888,
        description: 'Herderin met een kudde schapen in een boomgaard. De herderin staat rechts met een staf in de handen, bij haar staat een hond.',
        url: 'https://www.rijksmuseum.nl/en/collection/object/Shepherdess-with-a-Flock-of-Sheep--72a24b9ac085254f512848f358cb180a',
    },
    {
        id: 4,
        image: 'The-Holy-Family-at-Night.png',
        title: 'The Holy Family at Night',
        artist: 'workshop of Rembrandt van Rijn',
        StartYear: 1642,
        EndYear: 1648,
        description: 'De schaduw van zijn grootmoeder torent uit boven het vredig slapende kindje Jezus. Zijn moeder leest rustig ene boek. Het intieme huiselijke tafereel wordt slechts door een enkele lichtbron belicht.<BR />Dit thema werd in de jaren 1640 vaker uitgebeeld in Rembrandts atelier. Het sterke licht-donkercontrast is typerend voor de meester. Toch is dit schilderij niet van zijn hand. Het werd waarschijnlijk door een van zijn leerlingen geschilderd.',
        url: 'https://www.rijksmuseum.nl/en/collection/object/The-Holy-Family-at-Night--5d713140afa6974e6923caa545ae8eb8',
    },
    {
        id: 5,
        image: 'Venus-and-Adonis.png',
        title: 'Venus and Adonis',
        artist: 'Ferdinand Bol',
        StartYear: 1658,
        EndYear: 1658,
        description: 'Bol here painted a scene from Ovid’s Metamorphoses. The goddess of love, Venus, and young Amor, try to deter Adonis from going on a boar hunt. Venus fears for his life. Bol – a pupil of Rembrandt – displays a smooth and bright manner of painting very different from his master’s darker, coarser style. Bol used it to conjure an idealized image of reality.',
        url: 'https://www.rijksmuseum.nl/en/collection/object/Venus-and-Adonis--0c276f3257f5c9fe73db1bb820005aa8',
    },
    {
        id: 6,
        image: 'Young-Italian-Woman-with-Puck-the-Dog.png',
        title: 'Young Italian Woman with Puck the Dog',
        artist: 'Thérèse Schwartze',
        StartYear: 1885,
        EndYear: 1886,
        description: 'Known as Fortunata, this woman was one of the many professional Italian models working in Paris in the late 19th century. Schwartze started this painting while sojourning there in 1884 and exhibited it a year later in Amsterdam, having added the dog in the meanwhile. For a young female artist at the time, studying in Paris was as unconventional as pursuing a career as an artist. However, Schwartze pressed on and became a highly successful portraitist.',
        url: 'https://www.rijksmuseum.nl/en/collection/object/Young-Italian-Woman-with-Puck-the-Dog--861c5e902527fe73ede8706c30a89738',
    },
];

export { artworks };
