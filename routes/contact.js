const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { sendContact } = require('../controllers/Ccontact');

const rules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required'),
];

router.post('/', rules, validate, sendContact);

module.exports = router;
