var mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const pick = require('lodash/pick');

// store schema for user
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true,
        trim: true,
        minlength: 1,
        unique: true, //this field must not be equal that is why unique
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
}, {
        usePushEach: true
    });

// Instance methods
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return pick(userObject, ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();
    user.tokens.push({
        access,
        token
    });
    return user.save().then(() => {
        return token;
    });
};

var User = mongoose.model('User', UserSchema);

module.exports = { User };