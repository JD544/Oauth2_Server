# An Oauth2.0 Authorization Server

This server is based on the Oauth2.0 architecture, with it you can create a server that will be able to authenticate users and grant them access to resources.

Just like Platforms like Okta, Azure AD, Auth0, etc. You can build your own authorization server with this project.

You can build custom client applications that will be able to authenticate users and request access tokens from this server. Additionally, you can setup mutiple rules of authentication and authorization, Like adding scoped permissions to your users. This is how many other authorization servers work

# Installation
To install this project, you need to have Node.js and npm installed on your machine.
Once you have Node.js and npm installed, you can install this project by running the following command:
```bash
npm install
```

## Features
- Authentication Modes - Local and External Authentication + Firebase (New)
- Scoped Permissions - You can add scopes to your users to grant them access to specific resources
- OAuth2.0 Authorization Server - You can use this server to authenticate users and grant them access tokens
- Customizable - You can customize the server to your needs
- An open source project - You can use this project to build your own authorization server
- Easy to use - It is easy to use and understand
- Compatible with any oauth2.0 client - You can use this server with any oauth2.0 client
- Easy to deploy - You can deploy this server to any platform, like AWS, Azure, etc.
- Easy to extnpend - You can extend this server to your needs, like adding new authentication modes, or adding new scopes
- Easy to test - You can test this server with the demo client, which you can find in the `views/client` folder
- Deep integration with the Oauthify library - You can use the Oauthify library to integrate this server with your client applications, built also by me.

## Authentication Modes
This server supports the following authentication modes:
- Local Authentication - Uses dummy users to authenticate
- External Authentication - Uses an database to authenticate users

Now with the ability to authenticate using a MYSQL database, or local users, you have the ability to use this server in any way you want.

note: Local Authentication is not recommended for production use, is it insecure and is only for testing purposes.

## Demo Client
You can test the authorization server with the demo client. Which you can find in `views/client` folder. 


Here you can see all your client applications, and you can test them by clicking on the the corresponding button.
Here you will be able to test the `Get Token API` and `Get User Info API` which will be used to get the access token and user information respectively, if you are not authenticated. You will get a popup saying so, to authenticate just click on a provider button. By default, you will have 2 clients.

### Authorization Code Flow and Grant Types
Normally when you use a server like Okta, Azure AD, Auth0, etc. You will be redirected to a page where you can authenticate your credentials. It is common to see a `Grant Type` and `State` parameter in the url. In adition to that, you will also be redirected to a `redirect_uri` which will be used to send the access token and user information to the client application.

Let's break down the flow of the authorization code flow.

1. The client application sends a request to the authorization server with the `redirect_uri` and `client_id` parameters.

2. The authorization server will redirect the user to the login page of the provider.

3. The user will authenticate and grant access to the client application.
4. The authorization server will redirect the user to the `redirect_uri` with a `code` parameter.

What is an Redirect URI?

also known as a callback URL. is a URL that the authorization server will redirect the user to after they have authenticated, it is important to the authorization server to know where to redirect the user after they have authenticated. This will also signal to the client application that the user has been authenticated, so the client application can request an access token.

What is a Code?

Think of a code like a two-way handshake. The client application will send a request to the authorization server with a unique code, and the authorization server will recieve that and store it in a database. The client application will then send the code to the authorization server when requesting an access token. 

if the code doesn't match the initial code, the authorization server will reject the request, and you will have to authenticate the user again.

# Changes and Improvements

- [x] Add support for Firebase Authentication
- [x] Add deep integration with the Oauthify library
- [x] Add support for MYSQL database
- [x] Add support for custom scopes
- [x] Add support for custom grant types
- [x] Add support for custom authentication methods
- [x] Add support for custom user info endpoints

Note: All users and client applications is currently just stored in memory. ~~You can add support for a database in your use case. Or it will officialy be added in the future. This is just a working sample for now and is in development!~~ Now it is possible to use a MYSQL database to store users

# Upcoming Features
- [ ] Add the ability to store Oauth applications in a database
- [ ] Add the ability to use different sign in methods, like Google, Facebook, etc. (Firebase Only)

# Environment Variables
| Variable Name | Description | Default Value |
|---------------|-------------|---------------|
| LISTENING_PORT | The port the server will run on | 3000 |
| JWT_SECRET | The secret used to sign the JWT tokens | null |
| AUTHENTICATION_BACKEND | The authentication backend to use | local (local, firebase, external) |
| MYSQL_HOST | The host of the MYSQL database | localhost |
| MYSQL_USER | The user of the MYSQL database | root |
| MYSQL_PASSWORD | The password of the MYSQL database | null |
| MYSQL_DATABASE | The name of the MYSQL database | oauth2_server |
| FIREBASE_API_KEY | The API key of the Firebase project | null |
| FIREBASE_AUTH_DOMAIN | The auth domain of the Firebase project | null |
| FIREBASE_PROJECT_ID | The project ID of the Firebase project | null |
| FIREBASE_STORAGE_BUCKET | The storage bucket of the Firebase project | null |
| FIREBASE_MESSAGING_SENDER_ID | The messaging sender ID of the Firebase project | null |
| FIREBASE_APP_ID | The app ID of the Firebase project | null |


You must set all the environment variables before running the server, as it is dependent on them in order to function properly.

Please Note: <b>You don't need to set the firebase variables if you are not using firebase authentication. or the mysql variables if you are not using a database connection.</b>
# License
This project is licensed under the MIT License, see the LICENSE file for details.

This project is not affiliated with the OAuth 2.0 or OpenID Connect specifications or any of its implementations.

Don't forget to star the project if you like it!
