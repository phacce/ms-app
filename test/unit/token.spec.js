const {assert} = require('chai');
const token = require('../../lib/utils/token');

describe('~/lib/utils/token.js', () => {

    it('should generate an encrypted JWT from an object', () => {

        let data = {
            id: 1,
            name: 'Leo kay',
            'lives on': 'Earth'
        };

        let encryptionKey = 'here_goes_another_15_character_key';
        let secret = 'this_doesnt_need_to_be_long';

        let encryptedJwt = token.generate(data, encryptionKey, secret);
        assert.isNotNull(encryptedJwt);
        assert.notEqual(data);
    });

    it('should generate an encrypted JWT from a non-object', () => {

        let data = 'John & Jane Does';

        let encryptionKey = 'here_goes_another_15_character_key';
        let secret = 'this_doesnt_need_to_be_long';

        let encryptedJwt = token.generate(data, encryptionKey, secret);
        assert.isNotNull(encryptedJwt);
        assert.notEqual(data);
    });
});