# An Oauth2.0 Authorization Server

This server is based on the Oauth2.0 architecture, with it you can create a server that will be able to authenticate users and grant them access to resources.

Just like Platforms like Okta, Azure AD, Auth0, etc. You can build your own authorization server with this project.

You can build custom client applications that will be able to authenticate users and request access tokens from this server. Additionally, you can setup mutiple rules of authentication and authorization, Like adding scoped permissions to your users. This is how many other authorization servers work


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

if the code doesn't match the initial code, the authorization server will reject the request, and you will have to  authenticate the user again.

# Changes and Improvements

- [x] Add support for custom scopes
- [x] Add support for custom grant types
- [x] Add support for custom authentication methods
- [x] Add support for custom user info endpoints

Note: All users and client applications is currently just stored in memory. You can add support for a database in your use case. Or it will officialy be added in the future. This is just a working sample for now and is in development!.