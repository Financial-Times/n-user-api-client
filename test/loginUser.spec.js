const {expect} = require('chai');
const {loginUser} = require('../dist/write/loginUser');
const nocks = require('./nocks');

describe('loginUser', () => {
	const params = {
		email: 'test@mail.com',
		password: 'password',
		apiKey: 'apiKey',
		apiHost: 'https://api.ft.com'
	};

	it('resolves with new session data when successful', async () => {
		nocks.loginApi();
		const sessionData = await loginUser(params);
		expect(sessionData.sessionToken).to.be.a.string;
		expect(sessionData.secureSessionToken).to.be.a.string;
	});

	it('handles exception thrown', done => {
		nocks.loginApi({ statusCode: 500 });
		loginUser(params)
			.catch(err => {
				expect(err.message).to.equal('Could not log user in');
				done();
			});
	});

	it('throws if no options supplied', done => {
		loginUser()
			.catch(err => {
				expect(err.message).to.equal('Options not supplied');
				done();
			});
	});

	it('throws if invalid options supplied', done => {
		loginUser({notRequired: ''})
			.catch(err => {
				expect(err.message).to.equal('Invalid option(s): email, password, apiHost, apiKey');
				done();
			});
	});
});
