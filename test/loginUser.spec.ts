import { expect } from 'chai';
import { loginUser } from '../src/write/loginUser';
import { nocks } from './nocks';
import { LoginUserOptions } from '../src/types';

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
		expect(sessionData.sessionToken).to.be.a('string');
		expect(sessionData.secureSessionToken).to.be.a('string');
	});

	it('handles exception thrown', async () => {
		nocks.loginApi({ statusCode: 500 });
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

});
