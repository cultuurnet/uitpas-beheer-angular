'use strict';

/**
 * @ngdoc service
 * @name ubr.help.helpService
 * @description
 * # Help service
 * Service in the ubr.help module.
 */
angular
  .module('ubr.help')
  .service('helpService', helpService);

/* @ngInject */
function helpService($q, $http, appConfig) {
  var apiUrl = appConfig.apiUrl;

  /*jshint validthis: true */
  var service = this;
  service.text = null;
  service.editors = null;

  service.apiUrl = apiUrl;

  /**
   * Search for a list of activities based on a list of query parameters for a given passholder
   *
   * @returns {Promise}
   *   The help text markdown string.
   */
  service.getHelpText = function() {
    var deferredHelpText = $q.defer();

    var returnHelpText = function () {
      deferredHelpText.resolve(service.text);
    };

    var rejectWithError = function (error) {
      deferredHelpText.reject(error);
    };

    if (service.text !== null) {
      returnHelpText();
    }
    else {
      service.getHelpFromServer().then(returnHelpText, rejectWithError);
    }

    return deferredHelpText.promise;
  };

  /**
   *
   * @param {string} userUitidId
   * @returns {Promise}
   */
  service.checkEditPermissionCurrentUser = function(userUitidId) {
    var deferredPermissionCheck = $q.defer();

    var checkPermission = function () {
      if (service.editors.indexOf(userUitidId) > -1) {
        deferredPermissionCheck.resolve(true);
      }
      else {
        deferredPermissionCheck.resolve(false);
      }
    };

    var rejectWithError = function (error) {
      deferredPermissionCheck.reject(error);
    };

    if (service.editors !== null) {
      checkPermission();
    }
    else {
      service.getHelpFromServer().then(checkPermission, rejectWithError);
    }

    return deferredPermissionCheck.promise;
  };

  /**
   *
   * @returns {Promise}
   */
  service.getHelpFromServer = function() {
    var deferredHelpObject = $q.defer();

    var storeResponseDataInService = function (response) {
      service.text = response.text;
      service.editors = response.editors;

      deferredHelpObject.resolve();
    };

    var rejectWithError = function (error) {
      deferredHelpObject.reject(error);
    };

    /*
    var helpRequest = $http.get(
      apiUrl + 'help',
      {
        withCredentials: true
      }
    );//*/

    var helpRequest = $http.get('scripts/help/fakedata.json');

    helpRequest.success(storeResponseDataInService);
    helpRequest.error(rejectWithError);

    return deferredHelpObject.promise;
  };
}
