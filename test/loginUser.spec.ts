import { expect } from 'chai';
import { loginUser } from '../src/write/loginUser';
import { loginApi } from './nocks';

describe('loginUser', () => {
	const params = {
		email: 'test@ft.com',
		password: 'password',
        remoteIp: '127.0.0.1',
        countryCode: 'IRE',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
		'(KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36.',
		apiKey: 'apiKey',
		apiHost: 'https://api.ft.com',
		appName: 'login-form'
	};

	it('resolves with new session data when successful', async () => {
		loginApi();
		const sessionData = await loginUser(params);
		expect(sessionData.sessionToken).to.be.a('string');
		expect(sessionData.secureSessionToken).to.be.a('string');
	});

	it('handles exception thrown', async () => {
		loginApi({ statusCode: 500 });
		try {
			await loginUser(params);
		} catch (err) {
			expect(err.message).to.equal('Could not log user in');
		}
	});

	it('throws if no options supplied', async () => {
		try {
			await loginUser(undefined);
		} catch (err) {
			expect(err.message).to.equal('Options not supplied');
		}
	});

	it('throws if invalid options supplied', async () => {
		try {
			await loginUser(Object.assign({}, params, { email: false }));
		} catch (err) {
			expect(err.message).to.equal('Invalid option(s): email');
		}
	});
});
