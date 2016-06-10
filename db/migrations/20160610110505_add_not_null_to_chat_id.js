
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.raw("ALTER TABLE users ALTER COLUMN chat_id SET NOT NULL")
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.raw("ALTER TABLE users ALTER COLUMN chat_id SET NULL")
  ]);
};
