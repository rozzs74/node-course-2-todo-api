const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/moongose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');



var id = "5a5f37c0f37a8b06a33f7648";


User.findById(id).then((user) => {
    if (!user) {
        return console.log('Unable to find user');
    }
    console.log('User', user);
}).catch((error) => {
    console.log('Error', error);
});




// var id = '5a6b1a97e36a5207a586aeac';

// if(!ObjectID.isValid(id)) {
//     console.log('ID not valid');
// }

// // arrays of documents
// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });

// // single document
// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// });

// looking for document by identifier
// Todo.findById(id).then((todo) => {

//     console.log('Todo by ID', todo);
// }).catch((e) => console.log(e));