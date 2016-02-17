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
function HelpController (helpService, $q, $state) {
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
    console.log(form);
    if (form.$dirty) {
      console.log('dirty');
      return true;
    }
    else {
      console.log('niet dirty');
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
}
