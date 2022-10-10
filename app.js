const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');

const app = express();

const { sequelize } = require('./models/index'); // import the instance of sequelize that was instantiated in models/index.js

(async () => {
  try {
    //asynchronously connect to the database and log out a message indicating that a connection has/hasn’t been established
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    //sync all models with the database
    await sequelize.sync();
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books', booksRouter)

// Add static middleware
app.use('/static', express.static('public'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, 'Sorry, but it looks like that location does not exsit'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
