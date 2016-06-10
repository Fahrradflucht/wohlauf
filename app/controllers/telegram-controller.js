'use strict';

const express = require('express');
const knex = require('../../db');
const router = express.Router();

router.post('/203383619:AAHVwE_kbaBRNM8AxyiE5_DxlaPZ-yHpNnI', (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  handleMessages(req, res, (req, res) => {
    res.status(200).json({ ok: true });
  });
});

const handleMessages = (req, res, next) => {
  if (req.body.message) {
    handleChatTypes(req, res, next);
  } else {
    next(req, res);
  }
}

const handleChatTypes = (req, res, next) => {
  if (req.body.message.chat.type === 'private') {
    handleMessageEntities(req, res, next);
  } else {
    //TODO: Respond with error
    console.log("Wrong chat type");
    next(req, res);
  }
}

const handleMessageEntities = (req, res, next) => {
  if (req.body.message.entities) {
    handleBotCommands(req, res, next);
  } else {
    next(req, res);
  }
}

const handleBotCommands = (req, res, next) => {
  const message = req.body.message;
  message.entities.filter((element) => {
    return element.type === "bot_command";
  }).map((element) => {
    const command = message.text.slice(element.offset, element.offset + element.length);
    switch (command) {
      case '/start':
        createUser(message.from, message.chat.id);
        break;
      default:
        console.log("Unhandled command:", command);
    }
  });
  next(req, res);
};

const createUser = (user, chat_id) => {
  knex('users')
    .where({telegram_id: user.id})
    .then((users) => {
      if(users.length === 0) {
        knex('users')
          .insert([{
            'telegram_id': user['id'],
            'chat_id': chat_id,
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'username': user['username']
          }], 'id')
          .then((id) => {
            return
          })
      }
    });
}

module.exports = router;

