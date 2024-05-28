const express = require("express");
const Joi = require("joi");

const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(422).json({ error: true, message: error.details[0].message });
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

const registerSchema = Joi.object().keys({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object().keys({
  email: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  validateRequest,
  mrvSignupSchema,
  mrvSignInSchema,
  emailVerificationSchema,
  registerSchema,
  loginSchema,
};
