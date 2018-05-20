# MS-APP
This is an express-based Nodejs module which sets up an application with basic functionalities such as form inputs, file uploads, Json Web Token (JWT) authentications and Requests rate limiting.

## Installation
Use the following command to install this package

`npm install --save @phacce/ms-app`

## Usage
```js
const App = require('@phacce/ms-app');

// Credentials
const encryptionKey = 'your_16_char_encryption_key';
const secret = 'your_jwt_secret';

const app = new App({ port: 3000, name: "Sample App" });

app.start(); // to start the app

app.stop(); // to stop the app
```

Setting up routes is still as easy :-)
```js
const Router = require('express').Router();

Router.get('/', (req, res, next) => {
    res.json({ name: 'Welcome to the Phacce MS-APP' });
});

Router.post('/login', (req, res, next) => {
    res.json(req.body);
});

app.setRoutes({
    '/home': Router // this appends '/home' to every endpoint on this router
});
```

Other Express-based modules can also be loaded to the app using the loadModules method
```js
app.loadModules([ any_express_based_module ]);
```

Need a stateless authentication mechanism? We've got you! Here, you can enable JWT with just one line of code (or maybe a bit more), like below
```js
app.enableJWT({
    encryptionKey,
    secret,
    allowed: { entityName: entityModel }
});
```
Here, `entityName`, under `allowed`, refers to anything that is a collection in your Mongo Database; it can be `user`, `page`, etc. And `entityModel` refers to your exported `mongoose model`, which can be used to perform database lookups.

Pass your token in the request header in the `_token` field. To generate a token, use
```js
const { token } = require('@phacce/ms-app');

let myToken = token.generate('your_object_having_an_id_for_your_document_in_the_db', encryptionKey, secret);
```
**NB**: JWT currently supports only MongoDB.

Limiting requests rate is neccessary to avoid server overload. You may do so by using the following
```js
app.enableRateLimiter({
    host: '127.0.0.1',
    port: 6379,
    env: 'development',
    retries: 2, // number of requests before delay starts
    minWait: 10 * 1000, // 10 seconds => minimum amount of time to wait
    maxWait: 20 * 1000, // 20 seconds => maximum amount of time to wait
    lifetime: 60 * 60 // 1 hour => amount of time to remember the request
});
```

========