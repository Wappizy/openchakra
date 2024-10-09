const jwt = require('jsonwebtoken')
const passport = require('passport')
const CookieStrategy = require('passport-cookie').Strategy
const AnonymousStrategy = require('passport-anonymous').Strategy
const BasicStrategy = require('passport-http').BasicStrategy
const SamlStrategy = require('passport-saml').Strategy
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const fs=require('fs')

// Requires connection
const cookieStrategy=new CookieStrategy(
  (token, done) => {
    const user=jwt.decode(token)
    User.findById(user.id)
      .then(user => {
        if (user) {
          return done(null, user)
        }
        return done(null, false, {message: 'Vous devez être connecté'})
      })
      .catch(err => console.error(err))
  },
)
passport.use(cookieStrategy)

// Allows non-connected (i.e. for unconnected search)
passport.use(new AnonymousStrategy())

const sendCookie = (user, res) => {
  const token=jwt.sign({id: user.id}, 'secret')
  return res.cookie('token', token, {
    httpOnly: false,
    secure: true,
    sameSite: true,
  })
}

passport.use(new BasicStrategy(
  (username, password, done) => {
    User.findOne({email: username})
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          return done(null, user)
        }
        return done(null, false, {message: 'Vous devez être connecté'})
      })
      .catch(err => console.error(err))
    }
))

console.log('SSO entry point', process.env.SSO_ENTRYPOINT)
console.log('SSO issuer', process.env.SSO_ISSUER)
console.log('SSO callback', process.env.SSO_CALLBACK_URL)

const SSOStrategy = new SamlStrategy(
  {
    entryPoint: process.env.SSO_ENTRYPOINT,
    issuer: process.env.SSO_ISSUER,
    path: process.env.SSO_CALLBACK_URL,
    cert: fs.readFileSync(`${process.env.HOME}/.ssh/fullchain.pem`),
  },
  (profile, done) => done(null, profile),
);

passport.use(SSOStrategy)

passport.serializeUser(function(user, done) {
  done(null, user._id);
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
})


module.exports={sendCookie}
