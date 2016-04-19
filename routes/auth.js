var passport = require('passport');
var express = require('express')
var router = express.Router()

var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config/config.json')[env];

var AuthLocalStrategy = require('passport-local').Strategy;
var AuthFacebookStrategy = require('passport-facebook').Strategy;
var AuthVKStrategy = require('passport-vkontakte').Strategy;

var models = require('../models');
var util = require('util')
 //console.log("blogposts db: - " + models.Blogposts);

passport.use('local', new AuthLocalStrategy(
    function (username, password, done) {
        console.log(username, password);
        return models.Users.findOne({
            where:{
                username:username,
                password:password
            }
        }).then(function (user) {
            if (user) {
                console.log('User is found with this username and password!')
                user.new_user = false
                done(null, user);
            }else{
                //console.log('Incorrect login or password!')
                return done(null, false, { 
                    message: 'Incorrect login or password' 
                });
            }
        }).catch(function (error) {
            console.log(error);
            done(error);
        });
    }
));

passport.use('facebook', new AuthFacebookStrategy({
        clientID: config.auth.fb.app_id,
        clientSecret: config.auth.fb.secret,
        callbackURL: config.app.url + "/auth/fb/callback",
        profileFields: ["name","displayName","photos", "emails"]
    },
    function (accessToken, refreshToken, profile, done) {
        // console.log(profile.name);
        var userEmail = profile.emails[0].value || 'you have no email'
        models.Users.findOne({
            where:{
                username: userEmail
            }
        }).then(function (user) {
            console.log(user == null)
            if (user === null) {
                return models.Users.create({
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    username: userEmail,
                    fbid: profile.id,
                    //email: profile.emails[0].value || 'you have no email',
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    picture: profile.photos[0].value
                }).then(function (user){
                    //console.log(user.fbid)
                    user.dataValues.new_user = true;
                    // console.log(user.dataValues)
                    return done(null, user);

                }).catch(function (error) {
                    console.log(error);
                });
            } else {
                user.dataValues.new_user = false;
                // console.log(util.inspect(user, false, null));
                return done(null, user);
            }
        }).catch(function(error){
            console.log(error);
            done(error)
        });
    }
));
 
passport.serializeUser(function (user, done) {
    done(null, JSON.stringify(user));
});
 
passport.deserializeUser(function (data, done) {
    // console.log('deserializeUser')
    // console.log(data)
    try {
        done(null, JSON.parse(data));
    } catch (e) {
        done(err)
    }
});
 

///////////  * * **** * * * * * * * ** *s

router.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/');
        return;
    }
});

router.get('/sign-out', function (req, res) {
    req.logout();
    res.redirect('/');
});


router.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true })
);

router.get('/fb',
    passport.authenticate('facebook', {
        scope: 'email',
        session: true
    })
);

router.get('/fb/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/auth' })
);

module.exports = router