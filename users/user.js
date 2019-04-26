const mongoose = require("mongoose");
const Joi = require("joi");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

// ----------------------   CONFIG  --------------------------------
const collectionName = "User";

// ----------------------   SCHEMA DEFINITION --------------------------------
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50,
      required: true
    },
    email: {
      type: String,
      required: false,
      minlength: 5,
      maxlength: 255,
      required: true
    },
    lastAuth: {
      id: {
        type: mongoose.Schema.Types.ObjectId
      },
      authType: {
        type: String
      }
    }
  },
  {
    timestamps: true
  }
);

// ----------------------   STATICS --------------------------------

// Crud operations

userSchema.statics.dbGetAll = async function() {
  return this.find()
    .sort("name")
    .exec();
};

userSchema.statics.dbGetById = async function(id) {
  return this.findById(id).exec();
};

userSchema.statics.dbGetByOAuthId = async function(strategyKeyId, profileId) {
  // onsole.log(strategyKeyId, profileId);
  return this.findOne({ [strategyKeyId]: profileId }).exec();
};

userSchema.statics.dbGetByEmail = async function(email) {
  return this.findOne({ email: email }).exec();
};

userSchema.statics.dbCreate = async function(user) {
  const document = new this(_.pick(user, ["name", "email"]));
  return document.save();
};

userSchema.statics.comparePassword = async function(candidatePassword, hash) {
  return bcrypt.compare(candidatePassword, hash);
};

// ----------------------  METHODS -----------------------------

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id
      //isAdmin: this.isAdmin
    },
    config.get("JWT_SECRET_KEY")
  );
  return token;
};

userSchema.methods.dbSetAuthToken = async function(token) {
  if (!token) {
    throw new Error("Token missing");
  } else {
    this.authToken = token;
  }
  return this.save();
};

// ----------------------   MODEL CREATION --------------------------------
const User = mongoose.model(collectionName, userSchema);

// ----------------------   VALIDATION --------------------------------
function validate(user) {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(50)
      .required(),
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .min(5)
      .max(255)
      .required(),
    password: Joi.string()
      .min(5)
      .max(255)
      // .regex(//)
      .required(),
    passwordConfirmation: Joi.string()
      .equal(Joi.ref("password"))
      // .regex(//)
      .required()
  };

  return Joi.validate(user, schema);
}

exports.model = User;
exports.validate = validate;
