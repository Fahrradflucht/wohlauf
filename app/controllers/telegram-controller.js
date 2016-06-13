'use strict';
const axios = require('axios');
const express = require('express');
const redis = require('../../redis');
const router = express.Router();

const Subscription = require('../models/subscription');
const User = require('../models/user');

const API_TOKEN = process.env.TELEGRAM_API_TOKEN || '230481064:AAHpjRiRtc90sSufh7Z23ewVk2WLLsSu96E';

router.post(`/${API_TOKEN}`, (req, res, next) => {
  console.log(req.body.update_id);
  if (req.body.update_id) {
    console.log('ifUpdate_id');
    handleUpdates(req, res, (req, res) => {
      res.status(200).json({ ok: true });
    });
  } else {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

const handleUpdates = (req, res, next) => {
  console.log('handleUpdates');
  const { update_id } = req.body;
  redis.get(`update:${update_id}`)
    .then((value) => {
      if (value) {
        next(req, res);
      } else {
        redis.set(`update:${update_id}`, 1)
        redis.ttl(`update:${update_id}`, 60 * 60 * 6)
        handleMessages(req, res, next);
      }
    });
};

const handleMessages = (req, res, next) => {
  if (req.body.message) {
    handleChatTypes(req, res, next);
  } else {
    next(req, res);
  }
};

const handleChatTypes = (req, res, next) => {
  if (req.body.message.chat.type === 'private') {
    handleMessageEntities(req, res, next);
  } else {
    //TODO: Respond with error
    console.log("Wrong chat type");
    next(req, res);
  }
};

const handleMessageEntities = (req, res, next) => {
  const { entities } = req.body.message;
  if (entities) {
    switch (entities[0].type) {
      case 'bot_command':
        handleBotCommands(req, res, next);
        break;
      default:
        next(req, res);
    }
  } else {
    next(req, res);
  }
};

const handleBotCommands = (req, res, next) => {
  const commandHandlers = {
    start: (message, req, res, next) => {
      const user = Object.assign(message.from, { chat_id: message.chat.id });
      User.create(user)
        .then((registered) => {
          if (registered) {
            respondWithMsg(
              "Nice! Du hast dich erfolgreich registriert!",
              req,
              res
            );
          } else {
            next(req, res);
          }
        });
    },
    subscribe: (message, req, res, next) => {
      const subscriber = getEntity(message, 1);
      if (subscriber) {
        Subscription.createWithUsername(message.from, subscriber.substr(1))
          .then(() => {
            const resText = `Yay, ${subscriber} wird jetzt benachrichtigt wenn du nichts von dir hören lässt!`;
            respondWithMsg(resText, req, res);
            User.find({ username: subscriber.substr(1) })
              .then((users) => {
                const notificationText = `Du wurdest zu ${message.from.first_name} Subscribern hinzugefügt.`
                sendMessage(notificationText, users[0].chat_id)
                  .then((res) => { console.log(res) });
              });
          })
          .catch((err) => {
            switch (err) {
              case 'SUBSCRIBER_NOT_FOUND':
                (function() {
                  const text = `Sorry, ${subscriber} ist noch nicht bei mir registriert.`;
                  respondWithMsg(text, req, res);
                })();
                break;
              case 'EXISTS':
                (function() {
                  const text = `Du hast ${subscriber} schon zu deinen Subscribern hinzugefügt.`;
                  respondWithMsg(text, req, res);
                })();
                break;
              default:
                next(req, res);
            }
          })
      } else {
        (function() {
          redis.set(`dialog:${update_id}`, 'subscribe')
          const text = 'Welchen User möchtest du zu deinen Subscribern hinzufügen?';
          respondWithMsg(text, req, res);
        })();
      }
    }
  };

  const message = req.body.message;
  const command = getEntity(message, 0);

  switch (command) {
    case '/start':
      commandHandlers.start(message, req, res, next);
      break;
    case '/subscribe':
      commandHandlers.subscribe(message, req, res, next);
      break;
    default:
      console.log("Unhandled command:", command);
      next(req, res);
  }
};

const respondWithMsg = (text, req, res) => {
  const message = req.body.message;
  res.status(200).json({
    method: 'sendMessage',
    chat_id: message.chat.id,
    reqly_to_message_id: message.message_id,
    text
  });
};

const sendMessage = (text, chat_id) => {
  return axios.post(`https://api.telegram.org/bot${API_TOKEN}/sendMessage`, { chat_id, text });
};

// Helpers
const getEntity = (message, entityIndex) => {
  const entity = message.entities[entityIndex];
  if (entity) {
    const { offset, length } = entity
    return message.text.slice(offset, offset + length);
  } else {
    return null;
  }
}

module.exports = router;
