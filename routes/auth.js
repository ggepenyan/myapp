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
        return models.Users.findOne({
            where:{
                username:username,
                password:password
            }
        }).then(user => {
            if (user) {
                user.new_user = false
                done(null, user)
            } else {
                return done(null, false, { 
                    message: 'Incorrect login or password' 
                })
            }
        }).catch(error => {
            done(error)
        })
    }
))

passport.use('facebook', new AuthFacebookStrategy({
        clientID: config.auth.fb.app_id,
        clientSecret: config.auth.fb.secret,
        callbackURL: config.app.url + "/auth/fb/callback",
        profileFields: ["name","displayName","photos", "emails"]
    },
    function (accessToken, refreshToken, profile, done) {

        var userEmail = profile.emails[0].value || 'you have no email'
        return models.Users.findOne({
            where:{
                username: userEmail
            }
        }).then(user => {
            if (user === null) {
                
                return models.Users.create({
                
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    username: userEmail,
                    fbid: profile.id,
                    firstname: profile.name.givenName,
                    lastname: profile.name.familyName,
                    picture: profile.photos[0].value
                
                }).then(user => {
                    
                    user.dataValues.new_user = true
                    return done(null, user)

                })
            } else {
                user.dataValues.new_user = false
                return done(null, user)
            }
        }).catch(error =>{
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


///////////  * * **** * * * * * * * ** *s

router.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/')
        return
    }
})

router.get('/sign-out', function (req, res) {
    req.logout()
    res.redirect('/')
})


router.post('/', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true })
)

router.get('/fb',
    passport.authenticate('facebook', {
        scope: 'email',
        session: true
    })
)

router.get('/fb/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/auth' 
    })
)

module.exports = router