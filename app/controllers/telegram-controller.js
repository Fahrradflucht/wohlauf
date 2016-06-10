'use strict';

const axios = require('axios');
const express = require('express');
const knex = require('../../db');
const router = express.Router();

router.post('/203383619:AAHVwE_kbaBRNM8AxyiE5_DxlaPZ-yHpNnI', (req, res) => {
  // console.log(JSON.stringify(req.body, null, 2));
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
        createUser(message.from, message.chat.id)
          .then((registered) => {
            if (registered) {
              respondWithWelcomeMsg(req, res);
            } else {
              next(req, res);
            }
          });
        break;
      default:
        console.log("Unhandled command:", command);
        next(req, res);
    }
  });
};

const respondWithWelcomeMsg = (req, res) => {
  const message = req.body.message;
  res.status(200).json({
    method: "sendMessage",
    chat_id: message.chat.id,
    reqly_to_message_id: message.message_id,
    text: "Nice! Du hast dich erfolgreich registriert!"
  });
}

const createUser = (user, chat_id) => {
  return knex('users')
    .where({telegram_id: user.id})
    .then((users) => {
      if(users.length === 0) {
        return knex('users')
          .insert([{
            'telegram_id': user['id'],
            'chat_id': chat_id,
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'username': user['username']
          }], 'id')
          .then((id) => {
            return true;
          })
      } else {
        return false;
      }
    });
}

module.exports = router;
