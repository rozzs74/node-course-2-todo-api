require("./config/config.js");

const pick = require("lodash/pick");
const isBoolean = require("lodash/isBoolean");
const express = require("express");
const bodyParser = require("body-parser");
const { mongoose } = require("./db/moongose");
const { Todo } = require("./models/todo");
const { User } = require("./models/user");
const { ObjectID } = require("mongodb");
const { authenticate } = require("./middleware/authenticate");
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json()); // Tell express use the body parser.
//https://thawing-temple-24183.herokuapp.com/
// Create new todo via API

app.post("/todos", authenticate, (req, res) => {
	console.log("Request:", req.body);
	var todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	todo.save().then(
		doc => {
			res.send(doc);
		},
		err => {
			res.status(400).send(err);
		}
	);
});

app.get("/todos", authenticate, (req, res) => {
	Todo.find({ _creator: req.user._id }).then(
		todos => {
			res.send({ todos });
		},
		err => {
			console.log("ERR", err);
		}
	);
});

app.get("/todos/:id", authenticate, (req, res) => {
	var todoId = req.params.id;

	if (!ObjectID.isValid(todoId)) {
		return res.status(404).send();
	}

	Todo.findOne({
		_id: todoId,
		_creator: req.user._id
	}).then(todo => {
		if (!todo) {
			return res.status(404).send();
		}
		res.status(200).send({ todo });
	})
		.catch(error => {
			console.log("Error", error);
			res.status(404);
		});
});

app.delete("/todos/:id", authenticate, (req, res) => {
	var todoId = req.params.id;

	if (!ObjectID.isValid(todoId)) {
		return res.status(404).send();
	}

	Todo.findOneAndRemove({
		_id: todoId,
		_creator: req.user._id
	}).then(todo => {
		if (!todo) {
			return res.status(404).send();
		}
		res.status(200).send({ todo });
	})
		.catch(error => {
			// empty body
			res.status(400).send();
		});
});

app.patch("/todos/:id", authenticate, (req, res) => {
	var todoId = req.params.id;
	var body = pick(req.body, ["text", "completed"]);

	if (!ObjectID.isValid(todoId)) {
		return res.status(404).send();
	}

	if (isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}

	Todo.findOneAndUpdate({_id: todoId, _creator: req.user._id}, { $set: body }, { new: true }).then(todo => {
		if (!todo) {
			return res.status(404).send();
		}
		res.send({ todo });
	}).catch(error => {
		res.status(400).send();
	});
});

app.post("/users", (req, res) => {
	var body = pick(req.body, ["email", "password"]);
	var user = new User(body);

	user
		.save()
		.then(() => {
			return user.generateAuthToken();
		})
		.then(token => {
			res.header("x-auth", token).send(user);
		})
		.catch(error => {
			res.status(400).send(error);
		});
});

// private route eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YTZjNzlhODg4Y2M4ZDI0YTFlMmQ4ZDIiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTE3MDU4NDcyfQ.AeGFp9GG0xYkb-X4KEGdr2LuY7c7Zhanhhal4m2jIg4
app.get("/users/me", authenticate, (req, res) => {
	res.send(req.user);
});

// POST /users/login {email, password}
app.post("/users/login", (req, res) => {
	var body = pick(req.body, ["email", "password"]);

	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		res.status(400).send(e);
	});
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then((res) => {
		res.status(200).send();
	}).catch((e) => {
		res.status(400).send();
	});
});

app.listen(port, () => {
	console.log(`Started on port ${port}`);
});

module.exports = { app };