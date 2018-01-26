var mongoose = require('mongoose');

var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true // trim space on text string
    },
    completed: {
        type: Boolean,
        default: false // default value of this 
    },
    completedAt: {
        type: Number,
        default: null
    }
});

module.exports = {Todo};