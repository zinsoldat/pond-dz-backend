## Use Cases

### Registration

1. User registers with email and username
  - if the email or username is already in use show an appropriate error message
2. User is shown a message that an email was send to him
   - confirmation key has to be a secure random string otherwise the account could be hijacked
3. User clicks on the link in the email
  - link contains the confirmation key
4. User has to specify a password
   - hash password with bcrypt
5. User is redirected to the login screen
   - Maybe login user directly and forward to home screen?

### Reset Password

# Development

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
