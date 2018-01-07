const { MongoClient, ObjectID } = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {

    if (err) {
        return console.log('Unable to connect MongoDB server.', err);
    }
    console.log('Connected to MongoDB server');

    // delete many delete reall all

    // db.collection('Todos').deleteMany({ text: 'Eat lunch' }).then((result) => {
    //     console.log(result);
    // });


    // delete one if many only delete the first find

    // db.collection('Todos').deleteOne({ text: 'Something to do' }).then((result) => {
    //     console.log(result);
    // });

    // findOneAndDelete
    // db.collection('Todos').findOneAndDelete({ completed: false }).then((result) => {
    //     console.log(result);
    // });


    // db.collection('Users').deleteMany({ name: 'John Royce' });

    db.collection('Users').findOneAndDelete({ _id: new ObjectID('5a51f9bb7744c6044b717717') })
        .then((result) => {
            console.log(JSON.stringify(result, undefined, 2));
        });

    // db.close();
});