const express = require("express");
const Joi = require("joi");

const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(422).send(error.details[0].message);
  } else {
    next();
  }
};

const mrvSignupSchema = Joi.object().keys({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const mrvSignInSchema = Joi.object().keys({
  email: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

const emailVerificationSchema = Joi.object().keys({
  emailVerificationCode: Joi.string().required(),
});

module.exports = {
  validateRequest,
  mrvSignupSchema,
  mrvSignInSchema,
  emailVerificationSchema,
};
