'use strict';

const knex = require('../../db');
class Subscription {
  createWithUsername(broadcaster, username) {
    return knex('users')
      .where({ username: username })
      .then((users) => {
        if (users.length !== 0) {
          return knex('subscriptions')
            .where({
              broadcaster: broadcaster['id'],
              subscriber: users[0].telegram_id
            })
            .then((subscriptions) => {
              if (subscriptions.length === 0) {
                return knex('subscriptions')
                  .insert([{
                    broadcaster: broadcaster['id'],
                    subscriber: users[0].telegram_id
                  }])
              } else {
                throw ('EXISTS')
              }
            })
        } else  {
          throw ('SUBSCRIBER_NOT_FOUND')
        }
      });
  }
}

module.exports = new Subscription;
