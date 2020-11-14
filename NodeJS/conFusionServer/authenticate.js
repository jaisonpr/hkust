var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());