const jwt = require('jsonwebtoken');
const Crypto = require('./crypto');

/**
 * Generates an encrypted JWT
 * @param {Any} data - the data with which the token is to be generated
 * @param {String} encryptionKey - the encryption key.. used for decryption too
 * @param {String} secret - the JWT secret used for signing the token
 * @returns {Object}
 */

module.exports.generateToken = (data, encryptionKey, secret) => {

    if (typeof(data) !== "object") data = { data };
            
    let token = jwt.sign(data, secret);
    token = Crypto.encrypt(encryptionKey, token);
    return Object.assign({}, data._doc, { token: token });
};