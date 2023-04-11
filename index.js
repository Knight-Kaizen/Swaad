const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
const notifier = require('node-notifier');

const url = "mongodb+srv://kaizen:78R5k1MNqv7FVeea@mydatabase.fkdphrh.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('mongo connected'))
    .catch(err => console.log(err));

app.set("view engine", "ejs");
app.use(express.static('./public'));

//------------image upload----------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })

//-----------------------------------------
const recipeSchema = new mongoose.Schema({
    name: String,
    description: String,
    ingredients: String,
    steps: String,
    img:String

})
//Recipe is a class -> it tells what type of schema will be stored in this model.
//Collection creation
const Recipe = new mongoose.model("Recipe", recipeSchema);


let showRouteButtons = false;
let showRecipeForm = false;
app.get('/', (req, res) => {
    // console.log('routing on home page');
    res.render('homepage', { showRoutes: showRouteButtons, showForm: showRecipeForm });
})

app.get('/about', (req, res) => {
    res.render('about', { showRoutes: showRouteButtons });
})


app.get('/recipes', async (req, res) => {
    try {
        const result = await Recipe.find();
        // console.log(result);
        res.render('recipes', { showRoutes: showRouteButtons, recipeObj: result });
    }
    catch (err) {
        console.log('there is some error', err);
    }

})
// let showError = false;
const createNewRecipe = async (obj, objFile) => {
    try {
        const newRecipe = new Recipe({
            name: obj.recipeName,
            description: obj.description,
            ingredients: obj.ingredients,
            steps: obj.steps,
            img:objFile.filename
        })
        const result = await newRecipe.save();
    }
    catch (err) {
        console.log(err);
    }
};

app.post('/validateForm', upload.single('recipeImage'), async (req, res) => {
    try {
        if (req.body.recipeName == '' || req.body.description == '' ||
            req.body.ingredients == '' || req.body.steps == '') {
            notifier.notify('Fill all the feilds.');
            res.render('homepage', { showError: true, showRoutes: showRouteButtons, showForm: true });
        }
        else {
            showRecipeForm = false;

            console.log(req.body, req.file);
            //adding new recipe
            createNewRecipe(req.body, req.file);
            const result = await Recipe.find();
            res.render('recipes', { showRoutes: showRouteButtons, recipeObj: result });
        }
    }
    catch (err) {
        console.log('Error', err);
    }

})
app.post('/home', (req, res) => {
    // console.log(req.query);
    if (req.query.showForm == 'false')
        showRecipeForm = false;
    else if (req.query.showForm == 'true')
        showRecipeForm = true;
    showRouteButtons = !showRouteButtons;
    // console.log(req.body);
    if (req.query.moveTo == 'recipes')
        res.redirect('/recipes');
    else
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
let editId = 0;
app.post('/:id/edit', (req, res) => {
    console.log('in eidt page');
    editId = req.params.id;
    res.redirect('/');
})
app.post('/edit', async (req, res) => {
    //req.body and change info
    try {
        const updatedRecipe = req.body;
        console.log('this is to be updated:', req.body);
        console.log(editId);
        const result = await Recipe.updateOne({ _id: editId }, {
            $set: {
                name: req.body.name,
                ingredients: req.body.ingredients
            }
        });
        res.redirect('/recipes')
    }
    catch (err) {
        console.log("Error", err);
    }


})
app.post('/:id/delete', async (req, res) => {
    try {
        const id = req.params.id;
        console.log('in delete', id);
        const result = await Recipe.deleteOne({ _id: id });
        res.redirect('/recipes');

    }
    catch (err) {
        console.log('error', (err));
    }
})
app.listen(8000, () => {
    console.log('server started');
});