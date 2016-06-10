'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const logger = require('morgan');
const path = require('path');

const telegramController = require('./app/controllers/telegram-controller');

const app = express();

app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'app/assets')));

app.use(logger('dev'));

app.use(bodyParser.json());

app.use('/', telegramController);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('_error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('_error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
