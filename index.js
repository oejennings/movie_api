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

mongoose.connect('mongodb://127.0.0.1/myflixDB', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());

app.use(morgan('common'));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

//Default text
app.get('/', (req, res) => {
    res.send('Welcome to MyFlix!');
});

//Return a list of all movies to user
app.get('/movies', passport.authenticate('jwt', {session: false}), async(req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

//Return data about single movie
app.get('/movies/:Title', (req, res) => {
    Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

//Return data about a genre by name
app.get('/movies/genre/:genreName', (req, res) => {
   Movies.findOne({'Genre.Name': req.params.genreName})
   .then((movie) => {
    res.json(movie.Genre);
   })
   .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err)
   });
});
  

//Return data about a director by name
app.get('/movies/director/:directorName', (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.directorName })
        .then((movie) => {
            res.json(movie.Director);
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
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    //condition to check added here
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    //condition ends
   await Users.findOneAndUpdate({ Username: req.params.Username }, { $set: 
    {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday 
    }
},
{ new: true }) //this line makes sure that the updated doc is returned
.then((updatedUser) => {
    res.json(updatedUser);
})
.catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
})
});

//Allows users to add a movie to favoriteMovies
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: {FavoriteMovies: req.params.MovieID}
    }, 
    {new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

//Allows users to delete a movie from favoriteMovies
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: {FavoriteMovies: req.params.MovieID}
    }, 
    {new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

//Allows users to deregister
app.delete('/users/:Username', async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
        if (!user) {
            res.status(400).send(req.params.Username + "was not found");
        } else {
            res.status(200).send(req.params.Username + "was deleted.");
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

app.use(express.static ('Public'));

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error');
});

