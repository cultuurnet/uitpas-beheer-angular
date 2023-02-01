'use strict';

/**
 * @ngdoc function
 * @name ubr.kansenstatuut.controller:EditKansenstatuutModalController
 * @description
 * # EditKansenstatuutModalController
 * Controller of ubr.kansenstatuut
 */
angular
  .module('ubr.kansenstatuut')
  .controller('EditKansenstatuutModalController', EditKansenstatuutModalController);

/* @ngInject */
function EditKansenstatuutModalController (passholder, cardSystemId, $uibModalInstance, passholderService, $scope) {
  /*jshint validthis: true */
  var controller = this;

  controller.updatePending = false;
  controller.passholder = passholder;
  controller.cardSystemid = cardSystemId;
  controller.kansenstatuut = angular.copy(passholder.getKansenstatuutByCardSystemID(cardSystemId));
  controller.asyncError = null;
  if (controller.kansenstatuut.status === 'EXPIRED') {
    controller.kansenstatuut.endDate = moment('30/04/' + (moment().year() + 1), 'DD/MM/YYYY');
  }

  controller.cancelModal = function () {
    $uibModalInstance.dismiss();
  };

  function clearAsyncError (newVal, oldVal) {
    if (oldVal && oldVal && newVal !== oldVal) {
      controller.asyncError = null;
    }
  }

  $scope.$watch(function () {
    return controller.kansenstatuut ? controller.kansenstatuut.endDate : null;
  }, clearAsyncError);

  controller.updateKansenstatuut = function (editForm) {
    var stopEditing = function() {
      $uibModalInstance.close();
    };

    var showUpdateErrors = function (errorResponse) {
      controller.asyncError = {
        message: errorResponse.data.message
      };
    };

    var unlockForm = function () {
      controller.updatePending = false;
    };

    if (editForm.endDate.$valid) {
      controller.updatePending = true;
      var kansenstatuut = controller.kansenstatuut;
      var endDate = kansenstatuut.endDate;

      passholderService
        .renewKansenstatuut(passholder, kansenstatuut, endDate)
        .then(stopEditing, showUpdateErrors)
        .finally(unlockForm);
    }
  };
}
