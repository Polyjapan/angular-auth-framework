# Angular client for JI-Auth

## How to

Add to your dependencies

`@japanimpact/angular-auth-framework` (see the latest version in `package.json`)

In a module (usually the main module):

```
    imports: [
        ...
        

        TokensmanagerModule.forRoot({
          authApiKey: <your client id>,
          authApiDomain: <auth url>,
          whitelistedDomains: [<all the domains to which the keys should be sent (api domain is automatic)>]
        }),


        ...
    }
```

This will automatically try to intercept your requests and add in the ACCESS_TOKEN when available. It will refresh the ACCESS_TOKEN when it's expired.

### Provided services

You can use `TokenStorageService` to get the current tokens.

You **MUST** use it to set the AT/RT when the user logs in. You also need to call `logout()` when needed to remove the tokens from storage.

You should not have to use the rest.

## Deploy

`npm run-script deploy` after bumping the version number
