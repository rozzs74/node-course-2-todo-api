const { ObjectID } = require('mongodb');
const { mongoose } = require('./../server/db/moongose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');


// Todo.remove({}).then((result) => { // delete all todo doc

// });


//Todo.findOneAndRemove // find one of any then emove
//Todo.findByIdAndRemove // remove doc by id

//These two queries are similar the findone has property of _id

Todo.findOneAndRemove({ _id: "5a6c456a5491076f951c7b42" }).then((todo) => {
    console.log('TODOS', todo);
}).catch((error) => {
    console.log('Errors', error);
});


// Todo.findByIdAndRemove('5a6bda6009742e0d06ef7fe3').then((todo) => {
//     console.log('Todo', todo);
// }).catch((error) => {
//     console.log('EEE', error);
// });