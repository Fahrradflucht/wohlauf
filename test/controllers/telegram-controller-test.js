"use strict";
const _ = require('underscore');
const app = require('../../app');
const knex = require('../../db');
const Mitm = require('mitm');
const redis = require('../../redis');
const request = require('supertest-as-promised')(app);
const should = require('should');

const stubs = require('../helpers/stubs/telegram-api-stubs.js');
const webhook = '/230481064:AAHpjRiRtc90sSufh7Z23ewVk2WLLsSu96E';

describe("Telegram controller", () => {
  afterEach(() => {
    redis.send('flushdb');
  });
  describe("general", () => {
    before(() => {
      const { message } = stubs.commands.subscribe.withArg;
      return knex('users').insert([{
            telegram_id: message.from.id,
            chat_id: message.chat.id,
            first_name: message.from.first_name,
            last_name: message.from.last_name,
            username: message.from.username
          },
          {
            telegram_id: 230481064,
            chat_id: 230481064,
            first_name: 'Homer',
            last_name: 'Simpson',
            username: 'homer'
          }
        ])
        .then(() => {
          return knex('subscriptions')
            .insert([{
              broadcaster: message.from.id,
              subscriber: '230481064'
            }]);
        });
    });
    after(() => {
      return knex('subscriptions')
        .del()
        .then(() => {
          return knex('users').del();
        })
    });
    it('returns 404 ok if there is no message', () => {
      return request
        .post(webhook)
        .set('Accept', 'application/json')
        .expect(404)
    });
    it('does not react to already received updates', () => {
      return request
        .post(webhook)
        .send(stubs.commands.subscribe.withArg)
        .expect(200)
        .then(() => {
          return request
            .post(webhook)
            .send(stubs.commands.subscribe.withArg)
            .then((res) => {
              return new Promise((resolve, reject) => {
                resolve(res.body);
              });
            })
            .should.finally.not.have.property('method');
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
        after(() => {
          return knex('users').del();
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
      before(() => {
        const { message } = stubs.commands.subscribe.withArg;
        return knex('users').insert([{
          telegram_id: message.from.id,
          chat_id: message.chat.id,
          first_name: message.from.first_name,
          last_name: message.from.last_name,
          username: message.from.username
        }]);
      });
      after(() => {
        return knex('subscriptions')
          .del()
          .then(() => {
            return knex('users').del();
          })
      });
      context("@user argument is present", () => {
        const payload = stubs.commands.subscribe.withArg;
        context("user is not registered", () => {
          it("responds with error message", () => {
            return request
              .post(webhook)
              .send(payload)
              .then((res) => {
                res.body.method.should.eql('sendMessage');
                res.body.chat_id.should.eql(payload.message.chat.id);
                res.body.text.should.eql('Sorry, @homer ist noch nicht bei mir registriert.');
              })
          })
        });
        context("user is registered", () => {
          before(() => {
            const { message } = payload;
            return knex('users').insert([{
              telegram_id: 230481064,
              chat_id: 230481064,
              first_name: 'Homer',
              last_name: 'Simpson',
              username: 'homer'
            }]);
          });
          afterEach(() => {
            return knex('subscriptions').del();
          });
          context("user isn't already subscribed", () => {
            const outboundReqs = [];
            beforeEach(function() {
              this.mitm = Mitm()
              this.mitm.on("connect", function(socket, opts) {
                if (opts.host == "127.0.0.1") {
                  socket.bypass()
                };
              });
              this.mitm.on("request", (req, res) => {
                outboundReqs.push(req);
              });
            })
            afterEach(function() { this.mitm.disable() })
            it("create the subscription", () => {
              return request
                .post(webhook)
                .send(payload)
                .then(() => {
                  return knex('subscriptions')
                    .where({
                      broadcaster: payload.message.from.id,
                      subscriber: '230481064'
                    }).should.finally.have.length(1);
                })
            });
            it("notifies user that she/he got added to subscribers", (next) => {
              return request
                .post(webhook)
                .send(payload)
                .then(() => {
                  const req = _.last(outboundReqs)
                  if (req) {
                    req.setEncoding("utf8")
                    req.on("data", (body) => {
                      JSON.parse(body).chat_id.should.eql(230481064);
                      next();
                    });
                  } else {
                    next(new Error('Request not present.'));
                  }
                })
            });
            it("responds with success message", () => {
              return request
                .post(webhook)
                .send(payload)
                .then((res) => {
                  res.body.method.should.eql('sendMessage');
                  res.body.chat_id.should.eql(payload.message.chat.id);
                  res.body.text.should.eql('Yay, @homer wird jetzt benachrichtigt wenn du nichts von dir hören lässt!');
                })
            });
          });
          context("user is already subscribed", () => {
            beforeEach(() => {
              return knex('subscriptions')
                .insert([{
                  broadcaster: payload.message.from.id,
                  subscriber: '230481064'
                }]);
            });
            it("responds with error message", () => {
              return request
                .post(webhook)
                .send(payload)
                .then((res) => {
                  res.body.method.should.eql('sendMessage');
                  res.body.chat_id.should.eql(payload.message.chat.id);
                  res.body.text.should.eql('Du hast @homer schon zu deinen Subscribern hinzugefügt.');
                })
            });
          });
        })
      });
      context("@user argument is missing", () => {
        it('asks for the username', () => {
          const payload = stubs.commands.subscribe.withoutArg;
          return request
            .post(webhook)
            .send(payload)
            .then((res) => {
              res.body.method.should.eql('sendMessage');
              res.body.chat_id.should.eql(payload.message.chat.id);
              res.body.text.should.eql('Welchen User möchtest du zu deinen Subscribern hinzufügen?');
            })
        });
        context('answers', () => {
          context("answer is a @mention", () => {
            const payload = stubs.dialogs.subscribe.mention;
            it('subscribes a valid user', () => {
              return request
                .post(webhook)
                .send(payload)
                .then(() => {
                  return knex('subscriptions')
                    .where({
                      broadcaster: payload.message.from.id,
                      subscriber: '230481064'
                    }).should.finally.have.length(1);
                })
            })
          });
          context("answer is a plain username", () => {
            const payload = stubs.dialogs.subscribe.plainName;
            it('handles it like a /subscribe')
          });

        })
      });
    });
  });
});
