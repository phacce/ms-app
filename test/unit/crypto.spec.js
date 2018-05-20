const {assert} = require('chai');
const Crypto = require('../../lib/utils/crypto');

describe('~/lib/utils/crypto.js', () => {

    describe('#hash()', () => {

        it('should return a hash', (done) => {
            let text = 'Hello buddy';
            Crypto.hash(text, 3)
            .then((hash) => {
                assert.isNotEmpty(hash);
                assert.notEqual(hash, text);
                done();
            })
            .catch(err => {
                assert.isNotOk(err, 'Promise error');
                done();
            });
        });
    });

    describe('#compare()', () => {

        it('should compare a hash to a text', (done) => {
            let text = 'This is some raw text';
            Crypto.hash(text, 3)
            .then((hash) => Crypto.compare(text, hash))
            .then((isMatch) => {
                assert.isTrue(isMatch);
                done();
            })
            .catch(err => {
                assert.isNotOk(err, 'Promise error');
                done();
            });
        });
    });

    describe('#encrypt', () => {

        it('should encrypt a text', () => {
            let data = {
                name: 'Leo',
                country: 'Nigeria'
            };
            let encrypted = Crypto.encrypt('some_key_longer_than_15_characters', data);
            assert.notEqual(encrypted, data);
            assert.isString(encrypted);
        });

        it('should cause an error if key is less than 15 characters', () => {
            let data = 'Hello some text to be encrypted';
            let key = 'helloWorld)3]';

            assert.isAtMost(key.length, 14);

            let encrypted, failed = false;
            try {
                encrypted = Crypto.encrypt(key, data);
            } catch(e) {
                failed = true;
            }
            assert.isTrue(failed);
        });
    });

    describe('#decrypt()', () => {

        it('should decrypt an encrypted data', () => {
            let data = 19384;
            let key = 'some_very_very_long_keeeeeeeyyy!';
            
            let encrypted = Crypto.encrypt(key, data);
            assert.notEqual(encrypted, data);

            let decrypted = Crypto.decrypt(key, encrypted);
            assert.equal(decrypted, data);
            
        });
    });
});