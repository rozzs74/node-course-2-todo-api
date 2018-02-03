var mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const pick = require('lodash/pick');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

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

// instance methods
UserSchema.methods.generateAuthToken = function () {
	var user = this;
	var access = 'auth';
	var token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();
	user.tokens.push({
		access,
		token
	});
	return user.save().then(() => {
		return token;
	});
};

UserSchema.statics.findByToken = function (token) {
	var User = this;
	var decoded;

	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch (e) {
		return Promise.reject();
	}

	return User.findOne({
		_id: decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
};

// Middleware
UserSchema.pre('save', function (next) {

	var user = this;

	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next(); // call this to complete middleware event
			});
		});
	} else {
		next(); // call this to complete middleware event
	}
});

UserSchema.methods.removeToken = function (token) {
	//$pull operatort pull data on array

	var user = this;

	return user.update({
		$pull: {
			tokens: { token }
		}
	});
};

// statics are model  methods
UserSchema.statics.findByCredentials = function (email, password) {
	var User = this;

	return User.findOne({ email }).then((user) => {
		if (!user) {
			return Promise.reject();
		}

		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, res) => {
				if (res) {
					resolve(user);
				} else {
					reject();
				}
			});
		});
	});
};

var User = mongoose.model('User', UserSchema);

module.exports = { User };