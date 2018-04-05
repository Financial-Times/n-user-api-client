import { expect } from 'chai';
import { updateUserProfile, changeUserPassword } from '../src/write/updateUser';
import { authApi, graphQlUserBySession, userIdBySession, userPasswordApi, loginApi, userApi } from './nocks';
import { UpdateUserOptions } from '../src/types';

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
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi();
			userPasswordApi({ userId: params.userId });
			loginApi();
			const sessionData = await changeUserPassword(params);
			expect(sessionData.sessionToken).to.be.a('string');
			expect(sessionData.secureSessionToken).to.be.a('string');
		});

		it('sends new password to login service when successful', async () => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi();
			userPasswordApi({ userId: params.userId });
			const loginApiNock = loginApi();
			await changeUserPassword(params);
			expect(loginApiNock.requestBody.password).to.equal(params.passwordData.newPassword);
		});

		it('should send client id and response type to auth API', async () => {
			graphQlUserBySession({ responseType: 'subscribed' });
			const authApiNock = authApi();
			userPasswordApi({ userId: params.userId });
			loginApi();
			await changeUserPassword(params);
			expect(authApiNock.request.path).to.include('client_id=my-client-id');
			expect(authApiNock.request.path).to.include('response_type=token');
		});

		it('doesn\'t call password service when getUserBySession fails', done => {
			graphQlUserBySession({ responseType, statusCode: 500 });
			authApi();
			const passwordApiNock = userPasswordApi({ userId: params.userId });
			changeUserPassword(params)
				.catch(() => {
					expect(passwordApiNock.isDone()).to.be.false;
					done();
				});
		});

		it('doesn\'t call password service when getAuthToken fails', done => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi({ statusCode: 500 });
			const passwordApiNock = userPasswordApi({ userId: params.userId });
			changeUserPassword(params)
				.catch(() => {
					expect(passwordApiNock.isDone()).to.be.false;
					done();
				});
		});

		it('doesn\'t call login service when password isn\'t saved successfully', done => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi();
			const loginApiNock = loginApi();
			userPasswordApi({ statusCode: 500 });
			changeUserPassword(params)
				.catch(() => {
					expect(loginApiNock.isDone()).to.be.false;
					done();
				});
		});

		it('handles exception thrown within getUserBySession', done => {
			graphQlUserBySession({ responseType, statusCode: 500 });
			authApi();
			userApi({ userId: params.userId });
			changeUserPassword(params)
				.catch(err => {
					expect(err.message).to.equal('Unable to retrieve user');
					done();
				});
		});

		it('handles exception thrown within getAuthToken', done => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi({ statusCode: 500 });
			userApi();
			changeUserPassword(params)
				.catch(err => {
					expect(err.message).to.equal('getAuthToken - Auth service - Bad response');
					done();
				});
		});

		it('handles exception thrown within updateUserPasswordApi', done => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi();
			userPasswordApi({ statusCode: 500 });
			changeUserPassword(params)
				.catch(err => {
					expect(err.message).to.equal('Could not change user password');
					done();
				});
		});

		it('handles exception thrown within userLoginApi', done => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi();
			loginApi({ statusCode: 500 });
			userPasswordApi({ userId: params.userId });
			changeUserPassword(params)
				.catch(err => {
					expect(err.message).to.equal('Could not log user in');
					done();
				});
		});

		it('handles error if session is expired', done => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi({ expiredSession: true });
			userApi();
			changeUserPassword(params)
				.catch(err => {
					expect(err.message).to.equal('getAuthToken - Auth service - No access_token in Location header');
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
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi();
			userApi({ userId: params.userId });
			const response = await updateUserProfile(params);
			expect(response.user.firstName).to.equal('Jane');
		});

		it('doesn\'t call user service when getUserBySession fails', done => {
			graphQlUserBySession({ responseType, statusCode: 500 });
			authApi();
			const userApiNock = userApi({ userId: params.userId });
			updateUserProfile(params)
				.catch(() => {
					expect(userApiNock.isDone()).to.be.false;
					done();
				});
		});

		it('doesn\'t call user service when getAuthToken fails', done => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi({ statusCode: 500 });
			const userApiNock = userApi({ userId: params.userId });
			updateUserProfile(params)
				.catch(() => {
					expect(userApiNock.isDone()).to.be.false;
					done();
				});
		});

		it('handles exception thrown within getUserBySession', done => {
			graphQlUserBySession({ responseType, statusCode: 500 });
			authApi();
			userApi({ userId: params.userId });
			updateUserProfile(params)
				.catch(err => {
					expect(err.message).to.equal('Unable to retrieve user');
					done();
				});
		});

		it('handles exception thrown within getAuthToken', done => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi({ statusCode: 500 });
			userApi();
			updateUserProfile(params)
				.catch(err => {
					expect(err.message).to.equal('getAuthToken - Auth service - Bad response');
					done();
				});
		});

		it('handles error if session is expired', done => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi({ expiredSession: true });
			userApi();
			updateUserProfile(params)
				.catch(err => {
					expect(err.message).to.equal('getAuthToken - Auth service - No access_token in Location header');
					done();
				});
		});

		it('handles exception thrown within mergeUserUpdateWithFetchedUser', done => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi();
			userApi();
			updateUserProfile({
				...baseParams, userUpdate: {}
			})
				.catch(err => {
					expect(err.message).to.equal('mergeUserUpdateWithFetchedUser not supplied with valid user object or update');
					done();
				});
		});

		it('handles exception thrown within updateUserProfileApi', done => {
			graphQlUserBySession({ responseType: 'subscribed' });
			authApi();
			userApi({statusCode: 500});
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
