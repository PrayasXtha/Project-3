const express = require('express');
const hbs = require('express-hbs');
const bodyParser = require('body-parser');

const app = express();

// Define a route for the login page
app.get('/login', function (req, res) {
    res.render('login'); // Render the login view
});

const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/login");
// Uncommented the UserSchema by - prayasHOD
const UserSchema = new mongoose.Schema({
    fullname: String,
    username: String,
    email: String,
    password: String
});

const UserModel = mongoose.model("User", UserSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.engine('hbs', hbs.express4({
    partialDir: __dirname + '/views/partials',
    defaultLayout: __dirname + '/views/layout/main.hbs'
}));

const port = process.env.PORT || 3000;
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/', function (req, res) {
    const form = req.body;
    console.log('Form data:', form);

    if (form.selection === 'Login') {
        if (form.useername !== '' && form.password !== '') {
            console.log("Valid credentials. Rendering welcome page.");

            res.render('welcome',{
                username: form.useername
            });
        } else if (form.useername === '' || form.password === '') {
            console.log("Invalid credentials. Please enter both username and password.");
            res.render('index', {
                message: 'Please enter valid user credentials'
            });
        } else if ((form.username === '' && form.password !== '') || (form.username !== '' && form.password === '')) {
            console.log("Invalid credentials. Please enter both username and password.");
            res.render('index', {
                message: 'Please enter valid user credentials'
            });
        }
    } else if (form.selection === 'Create Profile') {
        console.log("Rendering create profile page.");
        res.render('createprofile');
        
    }
});

// chnage in creating profile- prayasHOD
app.post('/createprofile', async function(req, res){
    const { fullname, username, email, password } = req.body;

    const newUser = new UserModel({ fullname, username, email, password });

    try {
        await newUser.save();
        console.log('User created successfully.');
        res.render('index', {
            message: 'Profile created successfully',
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.render('index', {
            message: 'Error creating user',
        });
    }  
});

// ...



app.listen(port, () => console.log(`Listening on port ${port}!`));
