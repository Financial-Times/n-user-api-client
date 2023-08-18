import { Logger, transforms } from '@dotcom-reliability-kit/logger';
export const logger = new Logger({
	transforms: [
		transforms.legacyMask({
			denyList: ['email', 'password']
		})
	]
});
