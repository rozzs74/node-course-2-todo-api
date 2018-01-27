require('./config/config.js');

const pick = require('lodash/pick');
const isBoolean = require('lodash/isBoolean');
const express = require('express');
const bodyParser = require('body-parser')
const { mongoose } = require('./db/moongose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { ObjectID } = require('mongodb');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json()); // Tell express use the body parser.
//https://thawing-temple-24183.herokuapp.com/
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
        res.status(200).send({ todo });
    }).catch((error) => {
        console.log('Error', error);
        res.status(404);
    });
});

app.delete('/todos/:id', (req, res) => {

    var todoId = req.params.id;

    if (!ObjectID.isValid(todoId)) {
        return res.status(404).send();
    }

    Todo.findByIdAndRemove(todoId).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.status(200).send({ todo });
    }).catch((error) => {
        // empty body
        res.status(400).send();
    });
});

app.patch('/todos/:id', (req, res) => {
    var todoId = req.params.id;
    var body = pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(todoId)) {
        return res.status(404).send();
    }

    if (isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(todoId, {
        $set: body
    }, { new: true }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({ todo });
    }).catch((error) => {
        res.status(400).send();
    })
});

app.post('/users', (req, res) => {
    var body = pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((error) => {
        res.status(400).send(error);
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = { app };