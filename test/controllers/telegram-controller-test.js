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
    }
  }
}

describe('Telegram controller', () => {
  describe('general', () => {
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
  describe('commands', () => {
    describe('/start', () => {
      const payload = stubs.commands.start;
      describe("if user doesn't exist", () => {
        afterEach(() => {
          return knex('users').del();
        });
        it('creates the user', () => {
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
        it('responds with welcome message', () => {
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
      describe("if user already exists", () => {
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
  });
});
