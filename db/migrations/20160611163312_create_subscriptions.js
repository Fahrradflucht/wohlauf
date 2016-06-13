
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("subscriptions", (table) => {
      table.increments();
      table.integer("subscriber")
        .references('telegram_id').inTable('users')
        .notNullable();
      table.integer("broadcaster")
        .references('telegram_id').inTable('users')
        .notNullable()
        .index();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable("subscriptions")
  ]);
};
