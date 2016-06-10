
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("users", (table) => {
      table.increments();
      table.integer("telegram_id").notNullable().unique();
      table.string("first_name").notNullable().unique();
      table.string("last_name");
      table.string("username");

      table.timestamp("created_at").defaultTo(knex.raw('now()')).notNullable();
      table.timestamp("updated_at").defaultTo(knex.raw('now()')).notNullable();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable("users")
  ]);
};
