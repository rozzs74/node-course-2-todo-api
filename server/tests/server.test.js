const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'First test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';
        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(3);
                    // expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => done(err));
            })

    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});


describe('GET /todos/:id', () => {
    it('should return todo document', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var hexID = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexID}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123abc')
            .expect(404)
            .end(done);
    });

    describe('DELETE /todos/:id', () => {
        it('should remove todo document', (done) => {
            var hexID = todos[1]._id.toHexString();

            request(app)
                .delete(`/todos/${hexID}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo._id).toBe(hexID);
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    Todo.findById(hexID).then((todo) => {
                        expect(todo).toNotExist();
                        done();
                    }).catch((err) => done(err));
                });
        });

        it('should return 404 if todo not found', (done) => {
            var hexID = new ObjectID().toHexString();

            request(app)
                .delete(`/todos/${hexID}`)
                .expect(404)
                .end(done);
        });

        it('should return 404 if object is invalid', (done) => {
            request(app)
                .delete(`/todos/12312`)
                .expect(404)
                .end(done);
        });
    });

    describe('PATCH /todos/:id', () => {
        it('should update todo document', (done) => {
            var hexId = todos[0]._id.toHexString();
            var text = 'This should be new text';

            request(app)
                .patch(`/todos/${hexId}`)
                .send({
                    completed: true,
                    text
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(text);
                    expect(res.body.todo.completed).toBeTruthy();
                    expect(res.body.todo.completedAt).toBeA('number');
                })
                .end(done)
        });

        it('should clear compeltedAt when todo is not completed', (done) => {
            var hexId = todos[1]._id.toHexString();
            var text = 'This should be new text!!';

            request(app)
                .patch(`/todos/${hexId}`)
                .send({
                    completed: false,
                    text
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe(text);
                    expect(res.body.todo.completed).toBeFalsy();
                    expect(res.body.todo.completedAt).toNotExist();
                })
                .end(done)
        });
    });
});
