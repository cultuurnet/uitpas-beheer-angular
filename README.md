# Introduction

[![Build Status](https://travis-ci.org/cultuurnet/uitpas-beheer-angular.svg?branch=master)](https://travis-ci.org/cultuurnet/uitpas-beheer-angular) [![Coverage Status](https://coveralls.io/repos/cultuurnet/uitpas-beheer-angular/badge.svg)](https://coveralls.io/r/cultuurnet/uitpas-beheer-angular)

# UiTPAS beheer
 
 Prerequisites to run the project locally:

 * Ruby installation version 2.5.x
 * Node installation version 10.24.x (with nvm: `nvm use`)
 * Npm installation version 6.4.x

 Commands to run the project:

 * `bundle install` (enter your password to install the gems globally)
 * `npm install`
 * `bower install`
 * `grunt serve`
 
 The absolute minimum to read before starting development are
 
 * [Development](docs/development/development.md)
 * [Configuration](docs/development/configuration.md)
 * [Unit tests](docs/development/unit_tests.md)

But please, take the time read the whole documentation, it will save everyone a lot of time.

---

## Building the frontend to use in combination with uitpas-beheer-silex

The `uitpas-beheer-silex` backend also runs on port 9999.
If you want to work on the backend while also running the frontend (for example for integration testing), you can do a production build of the frontend and use it in the backend.

### 1. Config

Copy the `config.dist.json` file to `config.json`, and change the following keys:

```
"apiUrl": "http://localhost:9999/",
"basePath": "/app/",
"dist": "../uitpas-beheer-silex/web/app", # Assuming you have uitpas-beheer-silex checked out in the same folder as uitpas-beheer-angular
```

### 2. Building

Run `grunt build` to create a production build of the app inside the `uitpas-beheer-backed` app.
If you have run this command before you might need to run `grunt build --force` to overwrite the previous build, because it is outside of the current working directory.
You can also manually delete the previous build first.

### 3. Accessing the frontend

Assuming you have the backend running in Docker on the default port (see `uitpas-beheer-silex` README), you should be able to access the frontend on `http://localhost:9999/app`.

When you login, you will be redirected to `https://balie-test.uitpas.be` (or acc, depending on your backend config). This will result in an error because the test/acc backend was not expecting the login from UiTID v2. To fix this, manually change the URL to `http://localhost:9999/...` while keeping the same path.

### 4. Making changes

If you need to make changes to the frontend, you need to rebuild the frontend manually using the build instructions in step 2. (This approach is mostly meant for working on the backend with a working frontend.)
