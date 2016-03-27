// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-05-26 using
// generator-karma 1.0.0

module.exports = function(config) {
  'use strict';

  config.set({
    reporters: ['progress', 'coverage'],

    coverageReporter: {
      type: "lcov",
      dir: "coverage/"
    },

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      "jasmine"
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/modernizr/modernizr.js',
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-auto-focus/angular-auto-focus.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-http-auth/src/http-auth-interceptor.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-spinkit/build/angular-spinkit.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/angular-truncate/src/truncate.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/moment/moment.js',
      'bower_components/moment/locale/nl.js',
      'bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
      'bower_components/ngTouchSpin/src/js/ngTouchSpin.js',
      'bower_components/phoneformat/dist/phone-format-global.js',
      'bower_components/showdown/dist/showdown.js',
      'bower_components/angular-chosen-js/angular-chosen.js',
      'bower_components/chosen/chosen.jquery.min.js',
      'bower_components/lodash/lodash.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower
      "app/scripts/app.js",
      "app/scripts/activity/ubr.activity.module.js",
      "app/scripts/advantage/ubr.advantage.module.js",
      "app/scripts/counter/ubr.counter.module.js",
      "app/scripts/counter/checkin-devices/ubr.checkin-devices.module.js",
      "app/scripts/counter/expense-report/ubr.expense-report.module.js",
      "app/scripts/counter/membership/ubr.counter-membership.module.js",
      "app/scripts/group/ubr.group.module.js",
      "app/scripts/kansenstatuut/ubr.kansenstatuut.module.js",
      "app/scripts/membership/ubr.membership.module.js",
      "app/scripts/passholder/ubr.passholder.module.js",
      "app/scripts/passholder/bulk-actions/ubr.bulk-actions.module.js",
      "app/scripts/passholder/card-upgrade/ubr.card-upgrade.module.js",
      "app/scripts/passholder/search/ubr.search.module.js",
      "app/scripts/help/ubr.help.module.js",
      "app/scripts/feedback/ubr.feedback.module.js",
      "app/scripts/registration/ubr.registration.module.js",
      "app/scripts/utilities/ubr.utilities.module.js",

      "app/scripts/**/*.js",
      "app/scripts/**/*.*.js",
      "app/scripts/**/**/*.js",
      "app/scripts/**/**/*.*.js",

      "app/views/**/*.html",
      //"test/mock/**/*.js",
      "test/spec/**/*.js",
      "test/spec/**/*.*.js",
      "test/spec/**/*.spec.js",
      "test/spec/**/*.*.spec.js",
      "test/spec/**/*/*.spec.js",
      "test/spec/**/*/*.*.spec.js"
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8088,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      "PhantomJS"
    ],

    // Which plugins to enable
    plugins: [
      "karma-coverage",
      "karma-phantomjs-launcher",
      "karma-jasmine",
      "karma-ng-html2js-preprocessor"
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'

    preprocessors: {
      'app/views/**/*.html': 'ng-html2js',
      'app/scripts/*/**/*.js': ['coverage']
    },

    ngHtml2JsPreprocessor: {
      // Views are moved to another path with a grunt task.
      // The cacheId has to be calculated the same way.
      cacheIdFromPath: function(filepath) {
        var viewName = filepath.split('views/').pop();
        return 'views/' + viewName;
      },

      // All views are made available in one module.
      // Include this module in your tests and it will load templates from cache without making http requests.
      moduleName: 'uitpasbeheerAppViews'
    }
  });
};
