A client to access the [User API on the FT Membership Platform](https://developer.ft.com/portal/docs-membership-platform-api)

## Installation

```
npm i @financial-times/n-user-api-client --save
```

## Usage example

```
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

### getUserIdBySession
#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then the returned user data will be redacted, some fields including address will be null

#### Return value

A user ID (string)

### updateUserProfile
#### Arguments

session (string) - a valid user session ID. If stale (> 30 minutes old) then a valid authorization API token won't be returned and the overall request will fail

apiHost, apiKey, apiClientId - the consumer app should pass these in, based on Vault env vars

userId (string)

userUpdate - a [user object](https://developer.ft.com/portal/docs-membership-platform-api-user-profile-request-resource). It will be merged into a fresh copy of the user's record retrieved from the database

### changeUserPassword

session (string) - a valid user session ID. If stale (> 30 minutes old) then a valid authorization API token won't be returned and the overall request will fail

apiHost, apiKey, apiClientId - the consumer app should pass these in, based on Vault env vars

userId (string)

passwordData (object) - in [this format](https://developer.ft.com/portal/docs-membership-platform-api-user-api-post-users-userid-credentials-change-password)

## Build

The module is written in typescript - compile to the dist/ folder with: 

```
make build
```