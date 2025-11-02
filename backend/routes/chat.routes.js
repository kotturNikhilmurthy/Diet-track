const express = require('express');
const { body, oneOf } = require('express-validator');
const { createChatCompletion } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  oneOf(
    [body('prompt').isString().trim().notEmpty(), body('messages').isArray({ min: 1 })],
    'Provide either a prompt string or a messages array.'
  ),
  body('messages.*.role').optional().isIn(['user', 'assistant']),
  body('messages.*.content').optional().isString().trim().isLength({ min: 1, max: 1000 }),
  body('systemPrompt').optional().isString().trim().isLength({ max: 1000 }),
  createChatCompletion
);

module.exports = router;
