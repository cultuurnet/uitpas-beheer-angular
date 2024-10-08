'use strict';

/**
 * @ngdoc function
 * @name ubr.help.controller:HelpController
 * @description
 * # HelpController
 * Controller of the ubr.help module.
 */
angular
  .module('ubr.help')
  .controller('HelpController', HelpController);

/* @ngInject */
function HelpController (helpService, $q, $state, appConfig, isJavaFXBrowser) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.helpMarkdown = '';
  controller.userCanEdit = false;
  controller.formSubmitBusy = false;
  controller.showUpdateError = false;

  function init () {
    $q.all([
      helpService.getHelpText(),
      helpService.checkEditPermission()
    ]).then(function (data) {
      controller.helpMarkdown = data[0];
      controller.userCanEdit = data[1];
    });
  }

  init();

  controller.isFormDirty = function (form) {
    if (form.$dirty) {
      return true;
    }
    else {
      return false;
    }
  };

  controller.submitForm = function (form) {
    form.$setPristine();
    controller.formSubmitBusy = true;

    var updateHelpOnPage = function () {
      $state.go('counter.main.help');
    };

    var setErrorMessage = function () {
      controller.showUpdateError = true;
    };

    helpService
      .updateHelpOnServer(controller.helpMarkdown)
      .then(updateHelpOnPage, setErrorMessage);

    controller.formSubmitBusy = false;
  };

  controller.contacts = appConfig.contacts || [];

  controller.goTo = function (e, url) {
    if (isJavaFXBrowser) {
      e.preventDefault();
      alert('EXTERNAL:' + url);
    }
  };
  
}
