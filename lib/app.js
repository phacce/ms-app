const http = require('http');

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const Logger = require('@phacce/app-logga');

const jwt = require('./utils/jwt');
const rateLimiter = require('./utils/rate_limiter');

module.exports = class App {

	/**
	* Initializes the port and app name
	* @param {Object} obj - { port : Number, name : String }
	*/
	constructor({port, name}) {
		this.app = express();
		this.port = port;
		this.name = name;
		this.logger = new Logger();
		this.httpServer =  http.createServer(this.app);
		this.setupApp();
	}

	/**
	 * Initializes basic app middlewares
	 */
	setupApp() {
		this.app.use(helmet());
		this.app.use(compression());
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: true }));
	}

	/**
	 * Load custom modules/middlewares in the app context
	 * @param {Array} modules - middlewares to load for the app
	 */
	loadModules(...modules){
		modules.forEach(mod => this.app.use(mod));
	}

	/**
	 * Enables Json Web Token for this app
	 * @param {Object} jwtObj - the JWT config params
	 */
	enableJWT({encryptionKey, secret, allowed}) {
		this.app.use(jwt({ encryptionKey }).decryptToken);
		this.app.use(jwt({ secret }).verifyToken);
		this.app.use(jwt({ allowed }).verifyEntity);
	}

	/**
	 * Enables rate limiter on the number of requests from a client within
	 * a specified time interval, for this app
	 * @param {Object} limiterObj - the rate limiter config obj
	 */
	enableRateLimiter({host, port, env, retries, minWait, maxWait, lifetime}) {
		let limiter = rateLimiter({
			host, port, env, retries, minWait, maxWait, lifetime
		});
		this.app.use(limiter.prevent);
	}

	/**
	* Sets the app routes with middlewares
	* @param {Object} routes a route object => { '' : middleware, 'route' : routeMiddleware }
	*/
	setRoutes(routes) {
		for (let e in routes) {
			this.app.use(`/${e}`, routes[e]);
		}
	}

	/**
	* @return the service port
	*/
	get port() {
		return this._port;
	}

	/**
	* Sets the service port
	* @param port the service port
	*/
	set port(port){
		this.app.set('port', process.env.PORT || port);
		this._port = port;
	}

	/**
	* Starts the Service on the specified port and then invokes the callback
	* if successful. Else, if the port is taken, it recursively increments until
	* it finds a free port
	* @param {Function} callback the method to invoke
	*/
	start(callback){
		this.catch404();
		this.handleServerErrors();

		this.server = this.httpServer.listen(this.port, () => {
			this.logger.debug(`${this.name} app started on port ${this.port}`);
			if (typeof callback === 'function') return callback();
		}).on('error', () => {
			this.logger.error(`Port ${this.port} is already in use`);
			this.port += 1;
			this.start(callback);
		});
	}

	/**
	 * Handle 404 errors
	 */
	catch404() {
		this.app.use((req, res, next) => {
			res.status(404).json({error: `cannot ${req.method} ${req.originalUrl}`});
		});
	}

	/**
	 * Handle server errors ie 5xx
	 */
	handleServerErrors() {
		this.app.use((err, req, res, next) => {
			this.logger.error(err.stack);
			res.status(500).json({error: 'An error occurred while processing the request'});
		});
	}

	/**
	* Stops the Service instance
	* @return promise
	*/
	stop(){
		this.server.close(() => {
			this.logger.warn(`${this.name} app stopped`);
		});
	}
};