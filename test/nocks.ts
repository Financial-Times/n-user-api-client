import * as nock from 'nock';
import { test, testEnv, responses } from './constants';

const getResponse = (statusCode, responseType) => {
	let response;
	if (statusCode === 200) {
		response = responses[responseType];
		if (!response)
			throw new Error(
				`The specified Nock response '${responseType}' doesn't exist`
			);
	}
	return response;
};

const getUserIdAndSessionDataResponse = ({
	statusCode,
	isStale,
	isValidUserId
}) => {
	if (statusCode !== 200) return responses.genericError;
	if (isStale) return responses.userIdBySessionStale;
	if (!isValidUserId) return responses.userIdBySessionInvalid;
	return responses.userIdBySessionSuccess;
};

export const nocks = {
	userIdBySession: ({
		statusCode = 200,
		session,
		isStale = false,
		isValidUserId = true
	} = {} as any) => {
		if (!session)
			throw new Error('userIdBySession nock requires a session argument');
		const response = getUserIdAndSessionDataResponse({
			statusCode,
			isStale,
			isValidUserId
		});
		return nock('https://api.ft.com')
			.get(`/sessions/s/${session}`)
			.query(true)
			.reply(statusCode, response);
	},

	consentApi: (path: string, method: string, statusCode: number, response?: any): nock.Scope => {
		return nock(testEnv.MEMBERSHIP_API_HOST_MOCK)
			[method](`/users/${test.uuid}/${test.scope}${path}`)
			.reply(statusCode, response);
	},

	platformApi: (method: string, statusCode: number, response?: any): nock.Scope => {
		return nock(testEnv.MEMBERSHIP_API_HOST_MOCK)
			[method]('/')
			.reply(statusCode, response);
	},

	graphQlUserBySession: ({ responseType, statusCode = 200 }): nock.Scope => {
		const response = getResponse(statusCode, responseType);
		return nock('https://api.ft.com')
			.get('/memb-query/api/mma-user-by-session')
			.query(true)
			.reply(statusCode, response);
	},

	authApi: ({ statusCode = 302, expiredSession = false } = {} as any): any => {
		const result = expiredSession
			? '#error=invalid_scope&error_description=Cannot%20acquire%20valid%20scope.'
			: 'access_token=a1b2c3';
		let authApiNock: any = nock('https://api.ft.com')
			.defaultReplyHeaders({
				Location: `https://www.ft.com/preferences#${result}`
			})
			.get('/idm/v1/authorize')
			.query(true)
			.reply(statusCode, function () {
				authApiNock.request = this.req;
			});
		return authApiNock;
	},

	userApi: ({ statusCode = 200, userId } = {} as any): nock.Scope => {
		return nock('https://api.ft.com')
			.put(`/idm/v1/users/${userId}/profile`)
			.reply(statusCode, (uri, requestBody) => requestBody);
	},

	userPasswordApi: ({ statusCode = 200, userId } = {} as any): nock.Scope => {
		const response = statusCode === 200 ? {} : responses.genericError;
		return nock('https://api.ft.com')
			.post(`/idm/v1/users/${userId}/credentials/change-password`)
			.reply(statusCode, response);
	},

	loginApi: ({ statusCode = 200 } = {} as any): any => {
		let requestBody;
		const response =
			statusCode === 200 ? responses.loginSuccess : responses.genericError;
		let loginApiNock: any = nock('https://api.ft.com')
			.post('/idm/v1/reauthenticate', body => (loginApiNock.requestBody = body))
			.reply(statusCode, response);
		return loginApiNock;
	}
};

const { MEMBERSHIP_API_HOST_MOCK, MEMBERSHIP_API_KEY_MOCK } = process.env;

beforeEach(() => {
	Object.assign(process.env, testEnv);
});

afterEach(() => {
	nock.cleanAll();
	Object.assign(process.env, {
		MEMBERSHIP_API_HOST_MOCK,
		MEMBERSHIP_API_KEY_MOCK
	});
});
