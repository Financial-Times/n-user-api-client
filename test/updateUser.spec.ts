import { expect } from 'chai';
import { updateUserProfile, changeUserPassword } from '../src/write/updateUser';
import { nocks } from './nocks';
import { UpdateUserOptions } from '../src/types/index';

describe('updateUser', () => {
	const baseParams = {
		session: '123',
		apiHost: 'https://api.ft.com',
		apiKey: 'apiKey',
		apiClientId: 'my-client-id',
		userId: 'userId'
	};

	describe('changeUserPassword', () => {
		const params = {
			...baseParams,
			passwordData: { newPassword: 'new-password', oldPassword: 'old-password' }
		};
		let responseType;

		it('resolves with new session data when successful', async () => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi();
			nocks.userPasswordApi({ userId: params.userId });
			nocks.loginApi();
			const sessionData = await changeUserPassword(params);
			expect(sessionData.sessionToken).to.be.a('string');
			expect(sessionData.secureSessionToken).to.be.a('string');
		});

		it('sends new password to login service when successful', async () => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi();
			nocks.userPasswordApi({ userId: params.userId });
			const loginApiNock = nocks.loginApi();
			await changeUserPassword(params);
			expect(loginApiNock.requestBody.password).to.equal(params.passwordData.newPassword);
		});

		it('should send client id and response type to auth API', async () => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			const authApiNock = nocks.authApi();
			nocks.userPasswordApi({ userId: params.userId });
			nocks.loginApi();
			await changeUserPassword(params);
			expect(authApiNock.request.path).to.include('client_id=my-client-id');
			expect(authApiNock.request.path).to.include('response_type=token');
		});

		it('doesn\'t call password service when getUserBySession fails', done => {
			nocks.graphQlUserBySession({ responseType, statusCode: 500 });
			nocks.authApi();
			const passwordApiNock = nocks.userPasswordApi({ userId: params.userId });
			changeUserPassword(params)
				.catch(() => {
					expect(passwordApiNock.isDone()).to.be.false;
					done();
				});
		});

		it('doesn\'t call password service when getAuthToken fails', done => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi({ statusCode: 500 });
			const passwordApiNock = nocks.userPasswordApi({ userId: params.userId });
			changeUserPassword(params)
				.catch(() => {
					expect(passwordApiNock.isDone()).to.be.false;
					done();
				});
		});

		it('doesn\'t call login service when password isn\'t saved successfully', done => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi();
			const loginApiNock = nocks.loginApi();
			nocks.userPasswordApi({ statusCode: 500 });
			changeUserPassword(params)
				.catch(() => {
					expect(loginApiNock.isDone()).to.be.false;
					done();
				});
		});

		it('handles exception thrown within getUserBySession', done => {
			nocks.graphQlUserBySession({ responseType, statusCode: 500 });
			nocks.authApi();
			nocks.userApi({ userId: params.userId });
			changeUserPassword(params)
				.catch(err => {
					expect(err.message).to.equal('Unable to retrieve user');
					done();
				});
		});

		it('handles exception thrown within getAuthToken', done => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi({ statusCode: 500 });
			nocks.userApi();
			changeUserPassword(params)
				.catch(err => {
					expect(err.message).to.equal('Auth service - Bad response status=500');
					done();
				});
		});

		it('handles exception thrown within updateUserPasswordApi', done => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi();
			nocks.userPasswordApi({ statusCode: 500 });
			changeUserPassword(params)
				.catch(err => {
					expect(err.message).to.equal('Could not change user password');
					done();
				});
		});

		it('handles exception thrown within userLoginApi', done => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi();
			nocks.loginApi({ statusCode: 500 });
			nocks.userPasswordApi({ userId: params.userId });
			changeUserPassword(params)
				.catch(err => {
					expect(err.message).to.equal('Could not log user in');
					done();
				});
		});

		it('handles error if session is expired', done => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi({ expiredSession: true });
			nocks.userApi();
			changeUserPassword(params)
				.catch(err => {
					expect(err.message).to.equal('Auth service - No access_token in Location header');
					done();
				});
		});

		it('throws if no options supplied', done => {
			changeUserPassword(undefined)
				.catch(err => {
					expect(err.message).to.equal('Options not supplied');
					done();
				});
		});

		it('throws if invalid options supplied', done => {
			changeUserPassword({ apiKey: '' } as UpdateUserOptions)
				.catch(err => {
					expect(err.message).to.equal('Invalid option(s): session, apiHost, apiClientId, userId, passwordData');
					done();
				});
		});
	});

	describe('updateUserProfile', () => {
		const params = {
			...baseParams,
			userUpdate: {
				profile: {
					firstName: 'Jane'
				}
			}
		};
		let responseType;

		it('merges update with existing user record when successful', async () => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi();
			nocks.userApi({ userId: params.userId });
			const response = await updateUserProfile(params);
			expect(response.user.firstName).to.equal('Jane');
		});

		it('doesn\'t call user service when getUserBySession fails', done => {
			nocks.graphQlUserBySession({ responseType, statusCode: 500 });
			nocks.authApi();
			const userApiNock = nocks.userApi({ userId: params.userId });
			updateUserProfile(params)
				.catch(() => {
					expect(userApiNock.isDone()).to.be.false;
					done();
				});
		});

		it('doesn\'t call user service when getAuthToken fails', done => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi({ statusCode: 500 });
			const userApiNock = nocks.userApi({ userId: params.userId });
			updateUserProfile(params)
				.catch(() => {
					expect(userApiNock.isDone()).to.be.false;
					done();
				});
		});

		it('handles exception thrown within getUserBySession', done => {
			nocks.graphQlUserBySession({ responseType, statusCode: 500 });
			nocks.authApi();
			nocks.userApi({ userId: params.userId });
			updateUserProfile(params)
				.catch(err => {
					expect(err.message).to.equal('Unable to retrieve user');
					done();
				});
		});

		it('handles exception thrown within getAuthToken', done => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi({ statusCode: 500 });
			nocks.userApi();
			updateUserProfile(params)
				.catch(err => {
					expect(err.message).to.equal('Auth service - Bad response status=500');
					done();
				});
		});

		it('handles error if session is expired', done => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi({ expiredSession: true });
			nocks.userApi();
			updateUserProfile(params)
				.catch(err => {
					expect(err.message).to.equal('Auth service - No access_token in Location header');
					done();
				});
		});

		it('handles exception thrown within mergeUserUpdateWithFetchedUser', done => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi();
			nocks.userApi();
			updateUserProfile({
				...baseParams, userUpdate: {}
			})
				.catch(err => {
					expect(err.message).to.equal('mergeUserUpdateWithFetchedUser not supplied with valid user object or update');
					done();
				});
		});

		it('handles exception thrown within updateUserProfileApi', done => {
			nocks.graphQlUserBySession({ responseType: 'subscribed' });
			nocks.authApi();
			nocks.userApi({statusCode: 500});
			updateUserProfile(params)
				.catch(err => {
					expect(err.message).to.equal('Could not update user');
					done();
				});
		});

		it('throws if no options supplied', done => {
			updateUserProfile(undefined)
				.catch(err => {
					expect(err.message).to.equal('Options not supplied');
					done();
				});
		});

		it('throws if invalid options supplied', done => {
			updateUserProfile({ userUpdate: '' } as UpdateUserOptions)
				.catch(err => {
					expect(err.message).to.equal('Invalid option(s): session, apiHost, apiKey, apiClientId, userId, userUpdate');
					done();
				});
		});
	});
});
