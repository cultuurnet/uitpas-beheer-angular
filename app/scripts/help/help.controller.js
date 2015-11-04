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
function HelpController (helpService, $q, uitid) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.helpLoading = 0;
  controller.helpMarkdown = '';
  controller.userCanEdit = false;
  controller.uitid = uitid;

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
}
