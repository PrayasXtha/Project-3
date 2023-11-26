const express = require('express');
const hbs = require('express-hbs');
const bodyParser = require('body-parser');

const app = express();

// Define a route for the login page
app.get('/login', function (req, res) {
    res.render('login'); // Render the login view
});

const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/manga", { useNewUrlParser: true, useUnifiedTopology: true });

// Create a book schema
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    quantity: { type: Number, default: 5 }, // Default quantity is 5
});

const Book = mongoose.model('Book', bookSchema);

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.engine('hbs', hbs.express4({
    partialDir: __dirname + '/views/partials',
    defaultLayout: __dirname + '/views/layout/main.hbs'
}));

const port = process.env.PORT || 3000;
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

// Route to handle adding a book
app.post('/addBook', (req, res) => {
    const { title, author } = req.body;

    if (title && author) {
        const newBook = new Book({ title, author });

        newBook.save()
            .then(result => {
                res.status(201).json({ message: 'Book added successfully', book: result });
            })
            .catch(error => {
                res.status(500).json({ error: 'Error adding book', details: error });
            });
    } else {
        res.status(400).json({ error: 'Please provide both title and author for the book.' });
    }
});

// Route to handle searching for books
app.post('/searchBook', (req, res) => {
    const { title } = req.body;

    if (title) {
        Book.find({ title })
            .then(books => {
                res.status(200).json({ message: 'Books found successfully', books });
            })
            .catch(error => {
                res.status(500).json({ error: 'Error searching for books', details: error });
            });
    } else {
        res.status(400).json({ error: 'Please provide a title for searching.' });
    }
});

// Route to handle buying a book
app.post('/buyBook', (req, res) => {
    const { title } = req.body;

    if (title) {
        Book.findOneAndUpdate({ title }, { $inc: { quantity: -1 } }, { new: true })
            .then(book => {
                if (book) {
                    res.status(200).json({ message: 'Book bought successfully', book });
                } else {
                    res.status(404).json({ error: 'Book not found' });
                }
            })
            .catch(error => {
                res.status(500).json({ error: 'Error buying the book', details: error });
            });
    } else {
        res.status(400).json({ error: 'Please provide a title for buying.' });
    }
});

// Route to handle deleting a book
app.post('/deleteBook', (req, res) => {
    const { title } = req.body;

    if (title) {
        Book.findOneAndDelete({ title })
            .then(book => {
                if (book) {
                    res.status(200).json({ message: 'Book deleted successfully', book });
                } else {
                    res.status(404).json({ error: 'Book not found' });
                }
            })
            .catch(error => {
                res.status(500).json({ error: 'Error deleting the book', details: error });
            });
    } else {
        res.status(400).json({ error: 'Please provide a title for deleting.' });
    }
});

app.get('/', function (req, res) {
    res.render('login');
});

app.post('/', function (req, res) {
    const form = req.body;
    console.log('Form data:', form);

    if (form.selection === 'Login') {
        if (form.useername !== '' && form.password !== '') {
            console.log("Valid credentials. Rendering welcome page.");

            res.render('index', {
                username: form.useername
            });
        } else if (form.useername === '' || form.password === '') {
            console.log("Invalid credentials. Please enter both username and password.");
            res.render('login', {
                message: 'Please enter valid user credentials'
            });
        } else if ((form.username === '' && form.password !== '') || (form.username !== '' && form.password === '')) {
            console.log("Invalid credentials. Please enter both username and password.");
            res.render('login', {
                message: 'Please enter valid user credentials'
            });
        }
    } else if (form.selection === 'Create Profile') {
        console.log("Rendering create profile page.");
        res.render('createprofile');

    }
});

app.get('/createprofile', function (req, res) {
    res.redirect('/');
});
app.post('/createprofile', function (req, res) {
    res.redirect('/');
});
app.get('/welcome', function (req, res) {
    res.render('welcome');
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
