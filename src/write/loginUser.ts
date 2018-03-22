import {userLoginApi} from './apis/user-login';
import {LoginUserOptions} from '../types';
import {validateOptions} from '../utils/validate';

export const loginUser = async (opts: LoginUserOptions): Promise<any> => {
	return new Promise(async (resolve, reject) => {
		try {
			validateOptions(opts, null, ['email', 'password', 'apiHost', 'apiKey'])
			const {email, password, apiHost, apiKey} = opts;
			resolve(await userLoginApi({email, password, apiHost, apiKey}));
		} catch (error) {
			reject(error);
		}
	});
};
