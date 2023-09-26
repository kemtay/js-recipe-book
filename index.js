const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql2/promise')
require('dotenv').config();  // read in the .env file

const app = express();

app.use(express.urlencoded({
    extended: false
  })); // enable forms

console.log(process.env)
// initialise/setup the database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    //connectTimeout: 99999,
    queueLimit: 0    // 0 means inifinte queue
});

app.set("view engine", "ejs");

app.get("/", function(req,res){
	res.render("home.ejs");
});

// get all the recipes (ROUTES must be added before starting server)
app.get('/recipes', async function(req,res){
    try {
 // the returned value of pool.query is an array, uses array destructuring
    // element 1 of the array is all the rows
    // element 2 is metadata
    const [results] = await pool.query('SELECT * FROM recipes');
    //res.json(results);  //res.json will format the argument as JS object string
    //res.send("Recipes");     // debugging
    res.render("recipes", { recipes: results });   //formatting the view instead of JS object string
    } catch (e) {
        console.log(e);
    }
   
})

// one route to display the form for adding a new recipe
app.get('/recipes/add', function(req, res){
    res.render("newRecipe");
});

// one route to process the "add" form 
app.post('/recipes', async function(req, res){
    const { name, ingredients, instructions } = req.body;
    await pool.query('INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)', [name, ingredients, instructions]);
    res.redirect('/recipes');    // inform the browser to go to the specified url
});

// one route to display the form for editing a recipe
app.get('/recipes/:id/edit', async function(req, res){
    const { id } = req.params;
    const [results] = await pool.query('SELECT * FROM recipes WHERE id = ?', [id]);
    res.render("editRecipe", { recipe: results[0] });
});

// one route to process the "edit" form 
app.post('/recipes/:id', async function(req, res){
    const { id } = req.params;    //params is from the url route
    const { name, ingredients, instructions } = req.body;    //from body-form
    await pool.query('UPDATE recipes SET name = ?, ingredients = ?, instructions = ? WHERE id = ?', [name, ingredients, instructions, id]);
    res.redirect('/recipes');
});

// one route to display the form for deleting a recipe
app.get('/recipes/:id/delete', async function(req, res){
    const { id } = req.params;
    await pool.query('DELETE FROM recipes WHERE id = ?', [id]);
    res.redirect('/recipes');
});

// start server
app.listen(8080, function(){
    console.log("Express server has started");
})