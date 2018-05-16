# n-user-api-client

A client to access the [User API on the FT Membership Platform](https://developer.ft.com/portal/docs-membership-platform-api)

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

### loginUser
#### Arguments

email (string)

password (string)

apiHost, apiKey - the consumer app should pass these in, based on Vault env vars


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

#### Return value

If successful, the user will be reauthenticated and the [fresh session data](https://developer.ft.com/portal/docs-membership-platform-api-post-login) will be returned.

## Classes

### UserConsent

By default, requires the `MEMBERSHIP_API_HOST_PROD` and `MEMBERSHIP_API_KEY_PROD` environment variables, respectively `..._TEST` / `..._MOCK` (see `mode` below). If the `envVarPrefix` argument is set, these environment variables used will be `${envVarPrefix}_HOST_*` and `${envVarPrefix}_KEY_*`.

```js
import { UserConsent } from '@financial-times/n-user-api-client';
const api = new UserConsent(uuid, source[, mode = 'PROD', scope = 'FTPINK', envVarPrefix = 'CONSENT_API']);

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
