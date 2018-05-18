module.exports = {
	test: {
		uuid: 'test-uuid',
		source: 'testSource',
		scope: 'TEST',
		category: 'marketing',
		channel: 'byEmail'
	},

	testEnv: {
		MEMBERSHIP_API_HOST_MOCK: 'http://mock-api-host.ft.com',
		MEMBERSHIP_API_KEY_MOCK: 'mock-api-key'
	},

	responses: {
		userIdBySessionSuccess: {
			uuid: 'user-456',
			creationTime: Date.now() - 1000 * 60 * 29
		},
		userIdBySessionInvalid: {},
		userIdBySessionStale: {
			uuid: 'user-456',
			creationTime: Date.now() - 1000 * 60 * 31
		},
		genericError: {
			errors: [
				{
					message: 'Error message'
				}
			]
		},
		noSubscription: require('./responses/graphql-no-subscription.json'),
		subscribed: require('./responses/graphql-subscribed.json'),
		unsubscribed: require('./responses/graphql-subscribed.json'),
		trialActive: require('./responses/graphql-trial-active.json'),
		trialCancelled: require('./responses/graphql-trial-cancelled.json'),
		loginSuccess: require('./responses/login-api.json'),
		formOfWords: {
			reconsentB2C: require('./responses/form-of-words-api-reconsent'),
			profiling: require('./responses/form-of-words-api-profiling')
		},
		consentProxy: {
			reconsentB2C: require('./responses/consent-proxy-api-reconsent-b2c.json'),
			profiling: require('./responses/consent-proxy-api-profiling.json'),
			manageCookies: require('./responses/consent-proxy-api-manage-cookies.json')
		}
	}
};
