const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");
const { app } = require("./../server");
const { Todo } = require("./../models/todo");
const { User } = require("./../models/user");
const { todos, populateTodos, users, populateUser } = require("./seed/seed");

beforeEach(populateUser);
beforeEach(populateTodos);

describe("POST /todos", () => {
	it("should create a new todo", done => {
		var text = "Test todo text";
		request(app)
			.post("/todos")
			.send({ text })
			.expect(200)
			.expect(res => {
				expect(res.body.text).toBe(text);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				Todo.find()
					.then(todos => {
						expect(todos.length).toBe(3);
						// expect(todos[0].text).toBe(text);
						done();
					})
					.catch(err => {
						done(err);
					});
			});
	});

	it("should not create todo with invalid body data", done => {
		request(app)
			.post("/todos")
			.send({})
			.expect(400)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.find()
					.then(todos => {
						expect(todos.length).toBe(2);
						done();
					})
					.catch(err => done(err));
			});
	});
});

describe("GET /todos", () => {
	it("should get all todos", done => {
		request(app)
			.get("/todos")
			.expect(200)
			.expect(res => {
				expect(res.body.todos.length).toBe(2);
			})
			.end(done);
	});
});

describe("GET /todos/:id", () => {
	it("should return todo document", done => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect(res => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});

	it("should return 404 if todo not found", done => {
		var hexID = new ObjectID().toHexString();
		request(app)
			.get(`/todos/${hexID}`)
			.expect(404)
			.end(done);
	});

	it("should return 404 for non-object ids", done => {
		request(app)
			.get("/todos/123abc")
			.expect(404)
			.end(done);
	});

	describe("DELETE /todos/:id", () => {
		it("should remove todo document", done => {
			var hexID = todos[1]._id.toHexString();

			request(app)
				.delete(`/todos/${hexID}`)
				.expect(200)
				.expect(res => {
					expect(res.body.todo._id).toBe(hexID);
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					Todo.findById(hexID)
						.then(todo => {
							expect(todo).toNotExist();
							done();
						})
						.catch(err => done(err));
				});
		});

		it("should return 404 if todo not found", done => {
			var hexID = new ObjectID().toHexString();

			request(app)
				.delete(`/todos/${hexID}`)
				.expect(404)
				.end(done);
		});

		it("should return 404 if object is invalid", done => {
			request(app)
				.delete(`/todos/12312`)
				.expect(404)
				.end(done);
		});
	});

	describe("PATCH /todos/:id", () => {
		it("should update todo document", done => {
			var hexId = todos[0]._id.toHexString();
			var text = "This should be new text";

			request(app)
				.patch(`/todos/${hexId}`)
				.send({
					completed: true,
					text
				})
				.expect(200)
				.expect(res => {
					expect(res.body.todo.text).toBe(text);
					expect(res.body.todo.completed).toBeTruthy();
					expect(res.body.todo.completedAt).toBeA("number");
				})
				.end(done);
		});

		it("should clear compeltedAt when todo is not completed", done => {
			var hexId = todos[1]._id.toHexString();
			var text = "This should be new text!!";

			request(app)
				.patch(`/todos/${hexId}`)
				.send({
					completed: false,
					text
				})
				.expect(200)
				.expect(res => {
					expect(res.body.todo.text).toBe(text);
					expect(res.body.todo.completed).toBeFalsy();
					expect(res.body.todo.completedAt).toNotExist();
				})
				.end(done);
		});
	});

	describe("GET /users/me", () => {
		it("should return user if authenticate", done => {
			request(app)
				.get(`/users/me`)
				.set('x-auth', users[0].tokens[0].token)
				.expect(200)
				.expect((res) => {
					expect(res.body._id).toBe(users[0]._id.toHexString());
					expect(res.body.email).toBe(users[0].email);
				})
				.end(done);
		});

		it("should return 401 if not authenticated", (done) => {
			request(app)
				.get('/users/me')
				.expect(401)
				.expect((res) => {
					expect(res.body).toEqual({});
				})
				.end(done);
		});
	});

	describe('POST /users', () => {

		it('should create user', (done) => {
			var email = 'example@example.com';
			var password = '123mb!';

			request(app)
				.post('/users')
				.send({ email, password })
				.expect(200)
				.expect((res) => {
					expect(res.headers['x-auth']).toExist();
					expect(res.body._id).toExist();
					expect(res.body.email).toBe(email);
				})
				.end((err) => {
					if (err) {
						return done(err);
					}

					User.findOne({ email }).then((user) => {
						expect(user).toExist();
						expect(user.password).toNotBe(password);
						done();
					}).catch((e) => done(e));
				});
		});

		it('should return validation errors if request invalid', (done) => {
			request(app)
				.post('/users')
				.send({
					email: 'and',
					password: '123'
				})
				.expect(400)
				.end(done);
		});

		it('should not create user if email in use', (done) => {
			request(app)
				.post('/users')
				.send({
					email: users[0].email,
					password: 'Password123!'
				})
				.expect(400)
				.end(done)
		});
	});

	describe('POST /users/login', () => {
		it('should login user and return auth token', (done) => {
			request(app)
				.post('/users/login')
				.send({
					email: users[1].email,
					password: users[1].password
				})
				.expect(200)
				.expect((res) => {
					expect(res.headers['x-auth']).toExist();
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					User.findById(users[1]._id).then((user) => {
						expect(user.tokens[0]).toInclude({
							access: 'auth',
							token: res.headers['x-auth']
						});

						done();

					}).catch((e) => done(e));
				});
		});

		it('should reject invalid login', (done) => {
			request(app)
				.post('/users/login')
				.send({
					email: users[1].email,
					password: users[1].password + '1'
				})
				.expect(400)
				.expect((res) => {
					expect(res.headers['x-auth']).toNotExist();
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					User.findById(users[1]._id).then((user) => {
						expect(user.tokens.length).toBe(0);
						done();
					}).catch((e) => done(e));
				});
		});
	});

	describe('DELETE /users/me/token', () => {

		it('should delete remove auth token on logout', (done) => {
			request(app)
				.delete('/users/me/token')
				.set('x-auth', users[0].tokens[0].token)
				.expect(400)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					User.findById(users[0]._id).then((user) => {
						expect(user.tokens.length).toBe(0);
						done();
					}).catch((e) => {
						done(e);
					});
				});
		});
	});
});
