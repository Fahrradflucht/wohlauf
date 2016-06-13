'use strict';

const knex = require('../../db');

class User {
  create(user) {
    return knex('users')
      .where({ telegram_id: user.id })
      .then((users) => {
        if (users.length === 0) {
          return knex('users')
            .insert([{
              'telegram_id': user['id'],
              'chat_id': user.chat_id,
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

  find(where) {
    return knex('users')
      .where(where);
  }
}

module.exports = new User;
