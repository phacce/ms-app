const jwt = require('jsonwebtoken');
const Crypto = require('./crypto');

/**
 * Handles operations relating to the JWYT middleware
 * @param {Object} jwtObj an object containing data to be used by the middleware - ex 
 *      { encryptionKey: 'snfjhuoen38nvuir',  secret: 'auh4h9h43n', allowed:{ mongoose.model}}
 */
module.exports = ({encryptionKey, secret, allowed}) => {

    function send401(response, message) {
        return response.status(401).json({ error: message });
    }

    return {

        /**
         * Middleware that decrypts the token in the request header and 
         * adds a decrypted token to the request header
         */
        decryptToken: (req, res, next) => {
            if (! req.headers._token || ! encryptionKey) return send401(res, "Token is required");

            try{
                let decryptedToken = Crypto.decrypt(encryptionKey, req.headers._token);
                if (! decryptedToken) return send401(res, "Invalid token");
                
                req.decryptedTempToken = decryptedToken;
                next();
            } catch(e) {
                return send401(res, "Error decrypting token");
            }
        },

        /**
         * Middleware that verifys that the decrypted token is authentic
         */
        verifyToken: (req, res, next) => {
            if (! req.decryptedTempToken || ! secret) return send401(res, "Token is required");
            
            try{
                let entity = jwt.verify(req.decryptedTempToken, secret);
                delete req.decryptedTempToken;
                if (typeof(entity) === "object" && entity !== null) {
                    if ('id' in entity) {
                        req.auth = entity;
                        next();
                    } else {
                        return send401(res, "Invalid entity object");
                    }
                } else {
                    return send401(res, "Invalid entity");
                }
            } catch(e) {
                return send401(res, "Error verifying token");
            }
        },

        /**
         * Middleware that verifies that the User actually exists
         */
        verifyEntity: (req, res, next) => {
            if (! allowed) return send401(res, "No allowed types specified");

            if(! Object.keys(allowed).includes(req.auth.typeOf)) {
                return res.status(403).json({ error: 'You are not authorized to use this route' });
            }
            
            let entityType = req.auth.typeOf;
            let id = req.auth.id;
            delete req.auth;

            allowed[entityType].findOne({ _id: id })
            .then((entity) => {
                if (typeof(entity) === "object" && entity !== null) {
                    if ('_id' in entity) {
                        req[`${entityType}`] = entity;
                        next();
                    } else {
                        return send401(res, `Invalid ${entityType} object`);
                    }
                } else {
                    return send401(res, `Invalid ${entityType}`);
                }
            })
            .catch((err) => send401(res, `An error occurred while verifying ${entityType}`));
        },
    };
};