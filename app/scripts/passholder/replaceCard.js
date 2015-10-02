'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderReplaceCardController
 * @description
 * # PassholdereditController
 * Controller of the uitpasbeheerApp
 */
angular.module('uitpasbeheerApp')
  .controller('PassholderReplaceCardController', PassholderReplaceCardController);

/* @ngInject */
function PassholderReplaceCardController (passholder, identification, $modalInstance, passholderService, eIDService, isJavaFXBrowser) {
  /*jshint validthis: true */
  var controller = this;

  // Set default parameters.
  controller.passholder = angular.copy(passholder);
  controller.formSubmitBusy = false;
  controller.isJavaFXBrowser = isJavaFXBrowser;

  // check if passholder has kansenStatuut
  controller.hasKansenStatuut = passholder.kansenStatuten.length > 0;
  // @TODO: is dit genoeg, of moet ook de status gecontrolleerd worden?
  // maw elke kansenStatuut controlleren of status=='ACTIVE'
  if (controller.hasKansenStatuut){
    controller.hasKansenStatuut = passholder.kansenStatuten.filter(function(kansenStatuut){
      return kansenStatuut.status === 'ACTIVE';
    }).length > 0;
  }

  // voor ubr-datepicker
  controller.kansenstatuut = {endDate: null};

  controller.cancelModal = function() {
    $modalInstance.dismiss();
  };

  controller.submitForm = function(passholderNewCard) { // jshint ignore:line
    controller.formSubmitBusy = true;
  };
}
