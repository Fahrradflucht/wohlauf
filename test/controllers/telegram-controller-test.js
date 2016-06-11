"use strict";
const app = require('../../app');
const knex = require('../../db');
const request = require('supertest-as-promised')(app);
const should = require('should');

const webhook = '/203383619:AAHVwE_kbaBRNM8AxyiE5_DxlaPZ-yHpNnI';

const stubs = {
  commands: {
    start: {
      "update_id": 141822734,
      "message": {
        "message_id": 16,
        "from": {
          "id": 97633461,
          "first_name": "Mathis",
          "username": "Mathis_Fahrradflucht"
        },
        "chat": {
          "id": 97633461,
          "first_name": "Mathis",
          "username": "Mathis_Fahrradflucht",
          "type": "private"
        },
        "date": 1465556802,
        "text": "/start",
        "entities": [{
          "type": "bot_command",
          "offset": 0,
          "length": 6
        }]
      }
    },
    subscribe: {
      "update_id": 807061712,
      "message": {
        "message_id": 3,
        "from": {
          "id": 97633461,
          "first_name": "Mathis",
          "username": "Mathis_Fahrradflucht"
        },
        "chat": {
          "id": 97633461,
          "first_name": "Mathis",
          "username": "Mathis_Fahrradflucht",
          "type": "private"
        },
        "date": 1465591070,
        "text": "/subscribe @homer",
        "entities": [{
            "type": "bot_command",
            "offset": 0,
            "length": 10
          },
          {
            "type": "mention",
            "offset": 11,
            "length": 6
          }
        ]
      }
    }
  }
}

describe("Telegram controller", () => {
  describe("general", () => {
    it('returns 200 ok if there is no message', () => {
      return request
        .post(webhook)
        .set('Accept', 'application/json')
        .expect(200)
        .then((res) => {
          res.body.ok.should.be.true;
        })
    });
  });
  describe("commands", () => {
    describe("/start", () => {
      const payload = stubs.commands.start;
      context("if user doesn't exist", () => {
        afterEach(() => {
          return knex('users').del();
        });
        it("creates the user", () => {
          return request
            .post(webhook)
            .send(payload)
            .then(() => {
              return knex('users')
                .where({
                  telegram_id: payload.message.from.id
                }).should.finally.have.length(1);
            })
        });
        it("responds with welcome message", () => {
          return request
            .post(webhook)
            .send(payload)
            .then((res) => {
              res.body.method.should.eql('sendMessage');
              res.body.chat_id.should.eql(payload.message.chat.id);
              res.body.text.should.eql('Nice! Du hast dich erfolgreich registriert!');
            })
        });
      });
      context("if user already exists", () => {
        before(() => {
          const { message } = payload;
          return knex('users').insert([{
            telegram_id: message.from.id,
            chat_id: message.chat.id,
            first_name: message.from.first_name,
            last_name: message.from.last_name,
            username: message.from.username
          }]);
        });
        it("doesn't create a new user", () => {
          return request
            .post(webhook)
            .send(payload)
            .then(() => {
              return knex('users')
                .where({
                  telegram_id: payload.message.from.id
                }).should.finally.have.length(1);
            })
        });
        it("doesn't send welcome message", () => {
          return request
            .post(webhook)
            .send(payload)
            .then((res) => {
              should.not.exist(res.body.method);
            })
        });
      })
    });
    describe("/subscribe", () => {
      const payload = stubs.commands.subscribe;
      context("@user argument is present", () => {
        context("user is not registered", () => {
          it("responds with error message")
        });
        context("user is registered", () => {
          context("user isn't already subscribed", () => {
            it("adds user to subscribers");
            it("notifies user that she/he got added to subscribers");
            it("responds with success message");
          });
          context("user is already subscribed", () => {
            it("responds with error message");
          });
        })
      });
      context("@user argument is missing", () => {
        it('handles that case');
      });
    });
  });
});
