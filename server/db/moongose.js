const mongoose = require('mongoose');

mongoose.Promise = global.Promise; // Tell mongoose to use Promise.

mongoose.connect('mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};