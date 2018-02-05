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

app.post("/todos", authenticate, async (req, res) => {
	try {
		const todo = await new Todo({ text: req.body.text, _creator: req.user._id });
		const doc = await todo.save();
		await res.send(doc);
	} catch (e) {
		res.status(400).send(e);
	}
});

app.get("/todos", authenticate, async (req, res) => {
	try {
		const todos = await Todo.find({ _creator: req.user._id });
		await res.send({ todos });
	} catch (erreor) {
		res.status(404).send(e);
	}
});

app.get("/todos/:id", authenticate, async (req, res) => {
	try {
		const todoId = req.params.id;
		if (!ObjectID.isValid(todoId)) {
			return res.status(404).send();
		}
		const todo = await Todo.findOne({ _id: todoId, _creator: req.user._id });
		if (!todo) {
			return res.status(404).send();
		}
		res.status(200).send({ todo });
	} catch (e) {
		res.status(404).send(e);
	}
});

app.delete("/todos/:id", authenticate, async (req, res) => {

	try {
		const todoId = req.params.id;
		if (!ObjectID.isValid(todoId)) {
			return res.status(404).send();
		}
		const todo = await Todo.findOneAndRemove({
			_id: todoId,
			_creator: req.user._id
		});
		if (!todo) {
			return res.status(404).send();
		}
		res.status(200).send({ todo });
	} catch (e) {
		res.status(400).send(e);
	}
});

app.patch("/todos/:id", authenticate, async (req, res) => {
	var todoId = req.params.id;
	var body = pick(req.body, ["text", "completed"]);



	try {
		var todoId = req.params.id;
		const body = await pick(req.body, ["text", "completed"]);
		if (!ObjectID.isValid(todoId)) {
			return res.status(404).send();
		}

		if (isBoolean(body.completed) && body.completed) {
			body.completedAt = new Date().getTime();
		} else {
			body.completed = false;
			body.completedAt = null;
		}

		const todo = await Todo.findOneAndUpdate({ _id: todoId, _creator: req.user._id }, { $set: body }, { new: true });

		if (!todo) {
			return res.status(404).send();
		}

		res.send({ todo });

	} catch (e) {
		res.status(400).send();
	}
});

app.post("/users", async (req, res) => {
	try {
		const body = await pick(req.body, ["email", "password"]);
		const user = await new User(body);
		const token = await user.generateAuthToken();
		await res.header("x-auth", token).send(user);
	} catch (error) {
		res.status(400).send(error);
	}
});

// private route eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YTZjNzlhODg4Y2M4ZDI0YTFlMmQ4ZDIiLCJhY2Nlc3MiOiJhdXRoIiwiaWF0IjoxNTE3MDU4NDcyfQ.AeGFp9GG0xYkb-X4KEGdr2LuY7c7Zhanhhal4m2jIg4
app.get("/users/me", authenticate, (req, res) => {
	res.send(req.user);
});

// POST /users/login {email, password}
app.post("/users/login", async (req, res) => {
	try {
		const body = await pick(req.body, ["email", "password"]);
		const user = await User.findByCredentials(body.email, body.password);
		const token = await user.generateAuthToken();
		await res.header('x-auth', token).send(user);
	} catch (e) {
		res.status(400).send(e);
	}
});

app.delete('/users/me/token', authenticate, async (req, res) => {
	try {
		const res = await req.user.removeToken(req.token);
		await res.status(200).send();
	} catch (e) {
		res.status(400).send();
	}
});

app.listen(port, () => {
	console.log(`Started on port ${port}`);
});

module.exports = { app };