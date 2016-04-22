<<<<<<< HEAD
var passport = require('passport'),
    express = require('express'),
    router = express.Router(),

    env       = process.env.NODE_ENV || "development",
    config    = require(__dirname + '/../config/config.json')[env],

    AuthLocalStrategy = require('passport-local').Strategy,
    AuthFacebookStrategy = require('passport-facebook').Strategy,
    AuthVKStrategy = require('passport-vkontakte').Strategy,

    models = require('../models'),
    util = require('util');

passport.use('local', new AuthLocalStrategy(
    function (username, password, done) {
        console.log(username, password)
=======
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
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676
        return models.Users.findOne({
            where:{
                username:username,
                password:password
            }
        }).then(function (user) {
            if (user) {
                console.log('User is found with this username and password!')
                user.new_user = false
<<<<<<< HEAD
                done(null, user)
            }else{
                return done(null, false, { 
                    message: 'Incorrect login or password' 
                })
            }
        }).catch(function (error) {
            console.log(error)
            done(error)
        })
    }
))
=======
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
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676

passport.use('facebook', new AuthFacebookStrategy({
        clientID: config.auth.fb.app_id,
        clientSecret: config.auth.fb.secret,
        callbackURL: config.app.url + "/auth/fb/callback",
        profileFields: ["name","displayName","photos", "emails"]
    },
    function (accessToken, refreshToken, profile, done) {
<<<<<<< HEAD

=======
        // console.log(profile.name);
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676
        var userEmail = profile.emails[0].value || 'you have no email'
        models.Users.findOne({
            where:{
                username: userEmail
            }
        }).then(function (user) {
            console.log(user == null)
            if (user === null) {
<<<<<<< HEAD
                
                return models.Users.create({
                    
=======
                return models.Users.create({
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    username: userEmail,
                    fbid: profile.id,
<<<<<<< HEAD
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    picture: profile.photos[0].value
                
                }).then(function (user){
                    
                    user.dataValues.new_user = true;
                    return done(null, user)

                }).catch(function (error) {
                    console.log(error)
                })

            } else {
                user.dataValues.new_user = false;
                return done(null, user)
            }
        }).catch(function(error){
            console.log(error)
            done(error)
        })
    }
))
 
passport.serializeUser(function (user, done) {
    done(null, JSON.stringify(user))
})
 
passport.deserializeUser(function (data, done) {

    try {
        done(null, JSON.parse(data))
    } catch (e) {
        done(err)
    }
})
=======
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
>>>>>>> 39ce89294490c4df85f44d2cb43411ace1ffd676
 

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