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
function HelpController (helpService, $q, uitid, $state) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.helpMarkdown = '';
  controller.userCanEdit = false;
  controller.uitid = uitid;
  controller.formSubmitBusy = false;
  controller.showUpdateError = false;

  function init () {
    $q.all([
      helpService.getHelpText(),
      helpService.checkEditPermissionCurrentUser(controller.uitid.id)
    ]).then(function (data) {
      controller.helpMarkdown = data[0];
      controller.userCanEdit = data[1];
    });
  }

  init();

  controller.submitForm = function () {
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
