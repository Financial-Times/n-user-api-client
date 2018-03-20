import {ErrorWithData} from '../../utils/error';

export const userLoginApi = ({email, password, apiHost, apiKey, appName, remoteIp, userAgent, countryCode}) => {
    return new Promise(async (resolve, reject) => {
        const errorMsg = 'Could not log user in';
        const url = `${apiHost}/v1/reauthenticate`;
        try {
            if (!password)
                throw new Error('password not supplied to userLoginApi');
            const body = {
                email,
                password,
                context: {
                    remoteIp: remoteIp,
                    userAgent: userAgent,
                    countryCode: countryCode,
                    platform: `n-user-api-client-${appName}`
                }
            };
            const options = {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': apiKey,
                    'User-Agent': `n-user-api-client-${appName}`
                },
                method: 'POST',
                body: JSON.stringify(body)
            } as RequestInit;

            const response = await fetch(url, options);
            if (response.ok){
                return resolve(response.json());
            }
            reject(new ErrorWithData(errorMsg, {
                url
            }));
        } catch (err) {
            reject(new ErrorWithData(errorMsg, {
                url
            }));
        }
    });
};
