

var bodyparser = require('body-parser');
var express    = require('express');
var oauthsrv   = require('express-oauth-server');


var tokenExpires = new Date();
tokenExpires.setDate(tokenExpires.getDate() + 1);

var tokeno = { accessToken: 'foobar', client: {}, user: {} };

var code = { authorizationCode: 123 };
     
var model = {

        getInternalToke: function()
        {
            return { user: { name: "pippo" }, accessTokenExpiresAt: tokenExpires };
        }
        , 
        getAccessToken: function(tokenin) {
                            console.log("getAccessToken", arguments);

                            if(tokeno.accessToken != tokenin)
                            {
                                return false;
                            }

          return this.getInternalToke();
        },
        getClient: function() {

                            console.log("getClient", arguments);
          return { grants: ['authorization_code'], redirectUris: ['http://example.com'], id : 12345 };
        },
        saveAuthorizationCode: function() {
           
           console.log("saveAuthorizationCode", arguments);
           return code;
        }

        , saveToken: function() {
           console.log("saveToke", arguments);
                  return tokeno;
        }

        , getAuthorizationCode(){
            console.log("getAuthorizationCode", arguments);
            /*
            return 
            {
                    code: code.authorization_code,
                    scope: getClient().grants[0],
                        
                    client: getClient(), // with 'id' property
                    user: getAccessToken()
                    , expiresAt: tokenExpires
            };
            */

            let res = { code : null, client : {id: null}, user : null };

            res.code = arguments["0"];   //code.authorization_code;
            //res.scope = this.getClient().grants[0];
            res.client.id = this.getClient().id;
            res.user = this.getInternalToke().user;
            res.expiresAt = tokenExpires;
            
            console.log("RES", res);

            return res;
        }
        
        , revokeAuthorizationCode(){
            console.log("revokeAuthorizationCode", arguments);
            return true;
        }

      };

var oauth = new oauthsrv({ model: model, continueMiddleware: false});

var app   = express();
var login = express.Router();
var secured = express.Router();
var token = express.Router();
//app.use(bodyparser.json());
//app.use(bodyparser.urlencoded({ extended: false }));
//

let urlencodedParser = bodyparser.urlencoded({ extended: false });
let jsonParser = bodyparser.json();

login.use(urlencodedParser);
token.use(urlencodedParser);

let authenticateHandler = {
  handle: function(req, res)
    {
       //console.log(req.body);
       console.log(req.body.username);
                //res.query.allowed = false;
                //
       if(null != req.body.username)
        return { username: req.body.username };

       return false;
    }
};

login.post('/'        
        , oauth.authorize({ authenticateHandler : authenticateHandler }) 
        );

token.post('/'
        , oauth.token({ requireClientAuthentication: {password: false, authorization_code : false} })
        /*, function(req, res, next)
        {
            console.log("--token--");
        }*/
        );

secured.use(oauth.authenticate());
secured.get('/', function(req, res, next)
        {
            console.log('--secured--');

            let r = { pippo : "pluto" };

            res.send(r);
        });

let port = process.env.PORT || 3444;

app.use('/login', login);
app.use('/token', token);
app.use('/secured', secured);

//app.get('/jj', function(req, res, next){ console.log('--jj--'); res.send('hello'); });

//app.get('/secured', oauth.authenticate(), function(req, res, next){ console.log('--jj--'); res.send('hello\n\n'); });

app.listen(port, function () {
    console.log("app listening on port " + port + "!");
});


