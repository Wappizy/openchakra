const { getWithingsConfig } = require('../../../config/config');
const express = require('express')
const Withings=require('withings-lib')

const router = express.Router()

const wConfig=getWithingsConfig()

router.get('/', (req, res) => {
  // Create an API client and start authentication via OAuth
  console.log(`Getting /')'`)
  var options = {
    consumerKey: wConfig.clientId,
    consumerSecret: wConfig.clientSecret,
    callbackUrl: 'https://dekuple.my-alfred.io/myAlfred/api/withings/oauth-callback',
  };
  var client = new Withings(options);

  client.getRequestToken(function(err, token, tokenSecret) {
    if (err) {
      console.error(err)
      // Throw error
      return;
    }

    req.session.oauth = {
      requestToken: token,
      requestTokenSecret: tokenSecret
    };

    console.log(`Session set to ${JSON.stringify(req.session.oauth)}`)
    const url = client.authorizeUrl(token, tokenSecret)
    console.log(`Redirecting to ${url}`)
    res.redirect(url);
  });
});

// On return from the authorization
router.get('/oauth-callback', function (req, res) {
    var verifier = req.query.oauth_verifier
    var oauthSettings = req.session.oauth
    console.log(`Session getting ${JSON.stringify(oauthSettings)}`)
    if (!oauthSettings) {
      return res.sendStatus(200)
    }
    var options = {
        consumerKey: wConfig.clientId,
        consumerSecret: wConfig.clientSecret,
        callbackUrl: 'https://dekuple.my-alfred.io/myAlfred/api/withings/oauth-callback',
        userID: req.query.userid
    };
    var client = new Withings(options);

    // Request an access token
    client.getAccessToken(oauthSettings.requestToken, oauthSettings.requestTokenSecret, verifier,
        function (err, token, secret) {
            if (err) {
                // Throw error
                console.error(`Error in callback:${err}`)
                return;
            }

            oauthSettings.accessToken = token;
            oauthSettings.accessTokenSecret = secret;

            res.redirect('https://dekuple.my-alfred.io');
        }
    );
});
module.exports = router
