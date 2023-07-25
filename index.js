const express = require('express');
    morgan = require('morgan');
    bodyParser = require('body-parser');
    uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

let users = [
    {
        id: 1,
        name: "Olivia",
        favoriteMovies: ["Clue"]
    },
    {
        id: 2,
        name: "Sebastian",
        favoriteMovies: []
    }
]

let topMovies = [
    {
        'Title': 'Clue',
        'Summary': '',
        'Genre': {
            'Name': 'Mystery',
            'Description': ''
        },
        'Director': {
            'Name': 'Jonathan Lynn',
            'Birth year': '',
            'Death year': ''
        },
        'ImageURL': '',
        'Featured': ''
    },
    {
        title: 'Avengers',
        director: 'Joss Whedon' 
    },
    {
        title: 'Iron Man',
        director: 'Jon Favreau'
    },
    {
        title: 'The Greatest Showman',
        director: 'Michael Gracey'
    },
    {
        title: 'Indiana Jones',
        director: 'Steven Spielberg'
    },
    {
        title: 'Jurassic Park',
        director: 'Steven Spielberg'
    },
    {
        title: 'Murder on the Orient Express',
        director: 'Kenneth Branagh'
    },
    {
        title: 'The Silence of the Lambs',
        director: 'Jonathan Demme'
    },
    {
        title: 'Die Hard',
        director: 'John McTiernan'
    },
    {
        title: 'Sherlock Holmes',
        director: 'Guy Ritchie'
    }
];

app.use(morgan('common'));

app.get('/', (req, res) => {
    res.send('My Favorite Movies!');
});

//Return a list of all movies to user
app.get('/movies', (req, res) => {
    res.status(200).json(topMovies);
});

//Return data about single movie
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = topMovies.find( movie => movie.Title == title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('Movie not Found')
    }
});

//Return data about a genre by name/title
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = topMovies.find( movie => movie.Genre.Name == genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('Movie not Found')
    }
});

app.use(express.static ('Public'));

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error');
});