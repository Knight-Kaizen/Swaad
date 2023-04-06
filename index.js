const express = require('express');
const path = require('path');
const app = express();
app.listen(8000);

app.set("view engine", "ejs");
app.use(express.static('./public'));

let showRouteButtons = false;
app.get('/', (req, res) => {
    res.render('homepage', { showRoutes: showRouteButtons });
})

app.get('/about', (req, res) => {
    res.render('about', { showRoutes: showRouteButtons });
})

app.get('/recipes', (req, res) => {
    res.render('recipes', { showRoutes: showRouteButtons });
})

app.post('/home', (req, res) => {
    showRouteButtons = !showRouteButtons;
    res.redirect('/');
})
app.post('/recipes', (req, res) => {
    showRouteButtons = !showRouteButtons;
    res.redirect('/recipes');
})
app.post('/about', (req, res) => {
    showRouteButtons = !showRouteButtons;
    res.redirect('/about');
})