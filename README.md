# n-user-api-client 

A client to access the [User API on the FT Membership Platform](https://developer.ft.com/portal/docs-membership-platform-api)

[![npm version](https://badge.fury.io/js/%40financial-times%2Fn-user-api-client.svg)](https://badge.fury.io/js/%40financial-times%2Fn-user-api-client)

[![CircleCI](https://circleci.com/gh/Financial-Times/n-user-api-client.svg?style=shield)](https://circleci.com/gh/Financial-Times/n-user-api-client)
[![Dependencies](https://david-dm.org/Financial-Times/n-user-api-client.svg)](https://david-dm.org/Financial-Times/n-user-api-client)
[![devDependencies](https://david-dm.org/Financial-Times/n-user-api-client/dev-status.svg)](https://david-dm.org/Financial-Times/n-user-api-client?type=dev)

## Installation

```sh
npm i @financial-times/n-user-api-client --save
```

## Usage example

```js
import {updateUserProfile} from '@financial-times/n-user-api-client';

await updateUserProfile({
    session: 'abc123',
    userId: 'def456',
    apiHost: process.env['MEMBERSHIP_API_HOST_PROD'],
    apiKey: process.env['MEMBERSHIP_API_KEY_PROD'],
    apiClientId: process.env['AUTH_API_CLIENT_ID_PROD'],
    userUpdate: { ... }
})

```

## Public methods

### getUserBySession

#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then the returned user data will be redacted, some fields including address will be null

demographicsLists (object) - optional - lists of demographics data eg positions, industries, responsibilities. If supplied they'll be used to decorate the user object. If the user has a value stored for each then that value will be marked selected in the corresponding list

#### Return value

A 'user object' with profile and subscription sections

### getUserIdAndSessionData

#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then the returned user data will be redacted, some fields including address will be null

apiHost, apiKey - the consumer app should pass these in, based on Vault env vars

#### Return value

A user ID (string)

### getPaymentDetailsBySession

#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then the returned user data will be redacted, some fields including address will be null

#### Return value

A payment method detail Object (varies in form depends on the type of the method - CreditCard|PayPal|DirectDebit), returns `null` if the user hasn't got a payment method yet.

### loginUser
#### Arguments

email (string)

password (string)

remoteIp (string) - the IP of the user

countryCode (string) - the country the user is located in

userAgent (string) - the User-Agent header of the user

apiHost, apiKey - the consumer app should pass these in, based on Vault env vars

appName - the name of the app using `n-user-api-client`


#### Return value

[fresh session data](https://developer.ft.com/portal/docs-membership-platform-api-post-login) will be returned.


### updateUserProfile

#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then a valid authorization API token won't be returned and the overall request will fail

apiHost, apiKey, apiClientId - the consumer app should pass these in, based on Vault env vars

userId (string)

userUpdate - a [user object](https://developer.ft.com/portal/docs-membership-platform-api-user-profile-request-resource). It will be merged into a fresh copy of the user's record retrieved from the database

#### Return value

The updated user object

### changeUserPassword

#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then a valid authorization API token won't be returned and the overall request will fail

apiHost, apiKey, apiClientId - the consumer app should pass these in, based on Vault env vars

userId (string)

passwordData (object) - in [this format](https://developer.ft.com/portal/docs-membership-platform-api-user-api-post-users-userid-credentials-change-password)

appName - the name of the app using `n-user-api-client`

#### Return value

If successful, the user will be reauthenticated and the [fresh session data](https://developer.ft.com/portal/docs-membership-platform-api-post-login) will be returned.

## Classes

### UserConsent

By default, requires the `MEMBERSHIP_API_HOST_PROD` and `MEMBERSHIP_API_KEY_PROD` environment variables, respectively `..._TEST` / `..._MOCK` (see `mode` below). If the optional `options` argument contains an `envPrefix` property, these environment variables used will be `${envPrefix}_HOST_*` and `${envPrefix}_KEY_*`.

```js
import { UserConsent } from '@financial-times/n-user-api-client';

// optional overrides
const options = {
  envPrefix: 'MY_API', // use MY_API_HOST_* and MY_API_KEY_* env vars, defaults to MEMBERSHIP_API
  apiKeyHeader: 'ft-api-key', // override the api key header name, defaults to x-api-key
  path: '/my/path' // override the base path after the host, defaults to /consent/users/
}

const api = new UserConsent(uuid, source[, mode = 'PROD', scope = 'FTPINK', options]);

// e.g const api = new UserConsent('user-id-here', 'signup-app');
```

#### Consent methods

The following methods return and/or accept a `consent unit`, as below:

```js
const consentPayload = {
  status: true,
  fow: "fow-id",
  lbi: false, // optional, defaults to false
  source: "my-source" // optional, will overwrite the instance source
}
```

Methods available:

```js
api.getConsent(category, channel);

api.createConsent(category, channel, consentPayload);

api.updateConsent(category, channel, consentPayload);
```

#### Consent record methods

The following methods return and/or accept a `consent record`, as below:

```js
const consentRecordPayload = {
  categoryName1: {
    channelName1: {
      status: true,
      fow: "fow-id",
      lbi: false, // optional, defaults to false
      source: "my-source"
    },
    channelName2: {
      status: true,
      fow: "fow-id",
      lbi: false, // optional, defaults to false
      source: "my-source"
    }
  },
  categoryName2: { ... }
}
```

Methods available:

```js
api.getConsentRecord();

api.createConsentRecord(consentRecordPayload);
// will error if the user has an existing consent record on the scope

api.updateConsentRecord(consentRecordPayload);
// will perform a deep merge on the existing consent record on the scope
```

All write requests to the Single Consent Store (consent units / records) have payload validation.

## Build

The module is written in typescript - compile to the dist/ folder with:

```sh
make build
```

## Releasing

To release a new version of the client, draft a new release in Github. There's no need to update package.json.
