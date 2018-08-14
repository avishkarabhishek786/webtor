const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');
const session = require('express-session');
//const flash =  require('connect-flash');
const validator = require('express-validator');

const routes = require('./routes');

const port = process.env.PORT || 3007;

const app = express();

app.set('view engine', 'ejs');

const middleware = [
  express.static(path.join(__dirname, 'public')),
  bodyParser.urlencoded({extended:true}),
  cookieParser(),
  session({
    secret: 'super-secret-key',
    key: 'super-secret-cookie',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
  }),
  validator(),
  //flash()
]

app.use(middleware);

app.use('/', routes);

app.use((req, res,next)=>{
  res.status(404).send("Page Not Found");
});

app.use((err, req, res, next)=>{
  console.log(err);
  res.status(500).send("Page Broke!");
});

app.listen(port, ()=>{
  console.log("Webtor app running on port "+port);
});
