const express = require('express');
const app = express();

let topMovies = [
    {
        title: 'Clue',
        director: 'Jonathan Lynn'
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
        title: '',
        director: ''
    },
    {
        title: '',
        director: ''
    },
    {
        title: '',
        director: ''
    },
    {
        title: '',
        director: ''
    },
    {
        title: '',
        director: ''
    },
    {
        title: '',
        director: ''
    }
];

app.get('/', (req, res) => {
    res.send('My Favorite Movies')
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use('/documentation.html', express.static ('Public'));

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});