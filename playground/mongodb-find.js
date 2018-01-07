const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {

    if (err) {
        return console.log('Unable to connect MongoDB server.', err);
    }
    console.log('Connected to MongoDB server');
    // db.collection('Todos').find({
    //     _id: new ObjectID('5a51cab9561b602347636f2e')
    // }).toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });


    // db.collection('Todos').find().count().then((docs) => {
    //     console.log('Todos count', docs);
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    db.collection('Users').find({name: 'John Royce'}).toArray().then((docs) => {
        console.log(docs);
    }, (error) => {
        console.log('Unable to fetch user', error);
    });

    // db.close();
});