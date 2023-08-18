module.exports = {
	files: {
		allow: [],
		allowOverrides: []
	},
	strings: {
		deny: [],
		denyOverrides: [
			'test@mail\\.com' // test/loginUser.spec.js
		]
	}
};
