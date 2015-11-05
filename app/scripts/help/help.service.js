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
  service.canUpdate = null;

  service.apiUrl = apiUrl;

  /**
   * Get the help text in markdown format.
   *
   * @returns {Promise}
   *   The help text markdown string.
   */
  service.getHelpText = function () {
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
   * Checks if the current user is allowed to edit the help markdown.
   *
   * @returns {Promise}
   */
  service.checkEditPermission = function () {
    var deferredPermissionCheck = $q.defer();

    var checkPermission = function () {
      deferredPermissionCheck.resolve(service.canUpdate);
    };

    var rejectWithError = function (error) {
      deferredPermissionCheck.reject(error);
    };

    if (service.canUpdate !== null) {
      checkPermission();
    }
    else {
      service.getHelpFromServer().then(checkPermission, rejectWithError);
    }

    return deferredPermissionCheck.promise;
  };

  /**
   * Gets the help information from the server and stores it in the service.
   *
   * @returns {Promise}
   */
  service.getHelpFromServer = function () {
    var deferredHelpObject = $q.defer();

    var storeResponseDataInService = function (response) {
      service.text = response.text;
      service.canUpdate = response.canUpdate;

      deferredHelpObject.resolve();
    };

    var rejectWithError = function (error) {
      deferredHelpObject.reject(error);
    };

    var helpRequest = $http.get(
      apiUrl + 'help',
      {
        withCredentials: true
      }
    );

    helpRequest.success(storeResponseDataInService);
    helpRequest.error(rejectWithError);

    return deferredHelpObject.promise;
  };

  /**
   * Update the markdown text on the server.
   *
   * @param {string} newMarkdown
   *   The new markdown string to save on the server.
   * @returns {*}
   */
  service.updateHelpOnServer = function (newMarkdown) {
    var deferredUpdate = $q.defer();

    var parameters = {
      text: newMarkdown
    };

    var requestOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    var updateRequest = $http.post(
      apiUrl + 'help',
      parameters,
      requestOptions
    );

    updateRequest.success(deferredUpdate.resolve);
    updateRequest.error(deferredUpdate.reject);

    return deferredUpdate.promise;
  };
}
