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
        'Summary': 'Six guests are anonymously invited to a strange mansion for dinner, but after their host is killed, they must cooperate with the staff to identify the murderer as the bodies pile up.',
        'Genre': {
            'Name': 'Mystery',
            'Description': 'Stories focus on a puzzling crime, situation, or circumstance that needs to be solved'
        },
        'Director': {
            'Name': 'Jonathan Lynn',
            'Birth Year': '1943'
        },
        'ImageURL': 'https://www.imdb.com/title/tt0088930/mediaviewer/rm3160216832/?ref_=tt_ov_i'
    },
    {
        'Title': 'The Avengers',
        'Summary': 'Earths mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.',
        'Genre': {
            'Name': 'Action',
            'Description': 'The protagonist is thrust into a series of events that typically involve violence and physical feats'
        },
        'Director': {
            'Name': 'Joss Whedon',
            'Birth Year': '1964'
        },
        'ImageURL': 'https://www.imdb.com/title/tt0848228/mediaviewer/rm3955117056/?ref_=tt_ov_i'
    },
    {
        'Title': 'Iron Man',
        'Summary': 'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.',
        'Genre': {
            'Name': 'Action',
            'Description': 'The protagonist is thrust into a series of events that typically involve violence and physical feats'
        },
        'Director': {
            'Name': 'Jon Favreau',
            'Birth Year': '1966'
        },
        'ImageURL': 'https://www.imdb.com/title/tt0371746/mediaviewer/rm1544850432/?ref_=tt_ov_i'
    },
    {
        'Title': 'The Greatest Showman',
        'Summary': 'Celebrates the birth of show business and tells of a visionary who rose from nothing to create a spectacle that became a worldwide sensation.',
        'Genre': {
            'Name': 'Musical',
            'Description': 'Songs by the characters are interwoven into the narrative, sometimes accompanied by dancing.'
        },
        'Director': {
            'Name': 'Michael Gracey',
            'Birth Year': 'N/A'
        },
        'ImageURL': 'https://www.imdb.com/title/tt1485796/mediaviewer/rm956976896/?ref_=tt_ov_i'
    },
    {
        'Title': 'Raiders of the Lost Ark',
        'Summary': 'In 1936, archaeologist and adventurer Indiana Jones is hired by the U.S. government to find the Ark of the Covenant before the Nazis can obtain its awesome powers.',
        'Genre': {
            'Name': 'Action',
            'Description': 'The protagonist is thrust into a series of events that typically involve violence and physical feats'
        },
        'Director': {
            'Name': 'Steven Spielberg',
            'Birth Year': '1946'
        },
        'ImageURL': 'https://www.imdb.com/title/tt0082971/mediaviewer/rm2091520257/?ref_=tt_ov_i'
    },
    // {
    //     title: 'Jurassic Park',
    //     director: 'Steven Spielberg'
    //     Genre: Action
    // },
    // {
    //     title: 'Murder on the Orient Express',
    //     director: 'Kenneth Branagh'
    //     Genre: Myster
    // },
    // {
    //     title: 'The Silence of the Lambs',
    //     director: 'Jonathan Demme'
    //     genre: thriller
    //         description:Thriller film, also known as suspense film or suspense thriller, is a broad film genre that involves excitement and suspense in the audience.
    // },
    // {
    //     title: 'Die Hard',
    //     director: 'John McTiernan'
    //     Genre: action
    // },
    // {
    //     title: 'Sherlock Holmes',
    //     director: 'Guy Ritchie'
    //     genre: mystery
    // }
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

//Return data about a genre by name
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = topMovies.find( movie => movie.Genre.Name == genreName).Genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('Genre not Found')
    }
});

//Return data about a director by name
app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = topMovies.find( movie => movie.Director.Name == directorName).Director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('Director not Found')
    }
});

//Allow new users to register
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('Users need Name')
    }
});

//Allows users to update their info
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send("No such user")
    }
});

//Allows users to add a movie to favoriteMovies
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies.push(movieTitle)
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array` );
    } else {
        res.status(400).send("No such user")
    }
});

//Allows users to delete a movie from favoriteMovies
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been deleted from user ${id}'s array` );
    } else {
        res.status(400).send("No such user")
    }
});

//Allows users to deregister
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`User: ${user.id} has been deleted` );
    } else {
        res.status(400).send("No such user")
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