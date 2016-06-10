module.exports = {
  test: {
    client: 'pg',
    connection: {
      user: 'wohlauf',
      password: 'mysecretpassword',
      database: 'wohlauf_test',
      host: 'localhost',
      port: '65432'
    },
    migrations: {
      directory: __dirname+"/migrations"
    },
    seeds: {
      directory: __dirname+"/seeds"
    }
  },

  development: {
    client: 'pg',
    connection: {
      user: 'wohlauf',
      password: 'mysecretpassword',
      database: 'wohlauf_dev',
      host: 'localhost',
      port: '65432'
    },
    migrations: {
      directory: __dirname+"/migrations"
    },
    seeds: {
      directory: __dirname+"/seeds"
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname+"/migrations"
    },
    seeds: {
      directory: __dirname+"/seeds"
    }
  }
};
