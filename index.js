const express = require('express');
    morgan = require('morgan');
    bodyParser = require('body-parser');
    uuid = require('uuid');

const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect('mongodb://localhost:27017/myFlixDB', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());

app.use(morgan('common'));

//Default text
app.get('/', (req, res) => {
    res.send('Welcome to MyFlix!');
});

//Return a list of all movies to user
app.get('/movies', (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
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
app.get('/genre/:Name', (req, res) => {
    Genres.findOne ({Name: req.params.Name})
        .then((genre) => {
            res.json(genre.Description);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});
  

//Return data about a director by name
app.get('/director/:Name', (req, res) => {
    Directors.findOne({ Name: req.params.Name })
        .then((director) => {
            res.json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

//Allow new users to register
app.post('/users', (req, res) => {
    Users.findOne({ Username: req.body.Username })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.Username + "already exists")
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: req.body.Password,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                .then((user) => {
                    res.status(201).json(user);
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send("Error: " + error);
                });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
        });
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

