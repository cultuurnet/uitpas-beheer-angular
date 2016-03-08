# Configuration
The `config.dist.json` file at the root of the project holds the default config. You can make your own adjustments and write them to `config.json`. `config.dist.json` will be ignored when `config.json` is present.
 
Current configuration options:
### apiUrl
 The location of the API. This option is required as it will be used to prefix all API calls.

### basePath
 When left empty the base path is assumed to be the root from which the application is served. If the app is located in a sub-directory for example: *public/app/* you add the path to the directory with a leading slash as the basePath property. This will take care of correctly serving all the assets and generating URLs while routing.
```json
{
  "apiUrl": "http://culpas-silex.dev/",
  "basePath": "/public/app/"
}
```

### contacts
The contact information is shown on two locations.
* On the counter selection page when the user is not assigned to a counter
* In the sidebar of the help page

```json
"contacts": [
    {
      "name": "Dender",
      "email": "aalst@uitpas.be"
    },
    {
      "name": "Paspartoe",
      "email": "paspartoe@vgc.be"
    },
    {
      "name": "Gent",
      "email": "uitpas@gent.be"
    },
    {
      "name": "Oostende",
      "email": "uitpas@oostende.be"
    },
    {
      "name": "Zuidwest",
      "email": "uitpas@zuidwest.be",
      "telephone": "0499116726"
    }
  ]
  ```
  
  ### buildNumber
 This number is shown in the footer of the app. This parameter is set during build on test servers and production server.
