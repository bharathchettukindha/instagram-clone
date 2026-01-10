const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const indexRouter = require('./routes/index');

const app = express();
mongoose.connect('mongodb://localhost:27017/Instagram');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'insta-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
