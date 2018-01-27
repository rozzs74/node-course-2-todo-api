const express = require('express');
const bodyParser = require('body-parser')
const { mongoose } = require('./db/moongose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { ObjectID } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json()); // Tell express use the body parser.

// Create new todo via API

app.post('/todos', (req, res) => {
    console.log('Request:', req.body);
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({ todos });
    }, (err) => {
        console.log('ERR', err);
    });
});

app.get('/todos/:id', (req, res) => {

    var todoId = req.params.id;
    if (!ObjectID.isValid(todoId)) {
        return res.status(404).send();
    }

    Todo.findById(todoId).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.status(200).send({todo});
    }).catch((error) => {
        console.log('Error', error);
        res.status(404);
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = { app };