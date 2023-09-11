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

// mongoose.connect('mongodb://127.0.0.1/myflixDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());

app.use(morgan('common'));

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

const {check, validationResult} = require('express-validator');

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){ //if a specific origin isn't found on the list of allowed origins
            let message = 'The CORS policy for this application does not allow access from origin' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

//Default text
app.get('/', (req, res) => {
    res.send('Welcome to MyFlix!');
});

//Return a list of all movies to user
app.get('/movies', async(req, res) => {
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
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), async(req, res) => {
    await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

//Return data about a genre by name
app.get('/movies/genre/:genreName', passport.authenticate('jwt', {session: false}), async(req, res) => {
   await Movies.findOne({'Genre.Name': req.params.genreName})
   .then((movie) => {
    res.json(movie.Genre);
   })
   .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err)
   });
});
  
//Return data about a director by name
app.get('/movies/director/:directorName', passport.authenticate('jwt', {session: false}), async(req, res) => {
    await Movies.findOne({ 'Director.Name': req.params.directorName })
        .then((movie) => {
            res.json(movie.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

//Allow new users to register
app.post('/users',
    [
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], async (req, res) => {
        //check the validation object for errors
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) //Search to see if a user with the requested username already exists
        .then((user) => {
            if (user) { //if user if found, send a response it already exists
                return res.status(400).send(req.body.Username + 'already exists')
            } else {
                Users.create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                .then((user) => {
                    res.status(201).json(user);
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
        });
});

//Allows users to update their info
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), 
[
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
    //check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
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
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
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
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), async (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
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
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), async (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
        if (!user) {
            res.status(400).send(req.params.Username + " was not found");
        } else {
            res.status(200).send(req.params.Username + " was deleted.");
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

app.use(express.static ('Public'));

// app.listen(8080, () => {
//     console.log('Your app is listening on port 8080.');
// });
const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error');
});

