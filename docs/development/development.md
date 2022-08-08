# Development

[Grunt](http://gruntjs.com) is used to build and serve the app.

`grunt serve`
* Serves the app on http://localhost:9999
* Livereload is added to reload the browser after file changes.

`grunt build`
* Builds the app to the `dist` folder.
* This process resembles the process for production the most.


You don't need to run the Silex back-end locally. Instead, you can connect the Angular front-end to the deployed test environment:

1. In config.json: Change the `apiUrl` to `https://balie-test.uitpas.be/`
2. The browser will open on http://localhost:9999
3. Click login, you will be redirected to the Auth0 login on Test
4. Login with your credentials, you will be redirected **to the test environment**
5. **Important!** Because of security policy changes in Chrome, cookies are not sent cross domain anymore. Here's a workaround:
6. When logged in on `https://balie-test.uitpas.be/`, open your DevTools, tab "Application". Go to "Cookies" and find the "PHPSESSID" cookie.
7. For the "PHPSESSID" cookie: Check "Secure" checkbox, and set "SameSite" to `None`
8. Open http://localhost:9999
9. You should be logged in!
