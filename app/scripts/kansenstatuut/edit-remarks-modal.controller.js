'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:EditRemarksModalController
 * @description
 * # EditRemarksModalController
 * Controller of the ubr.kansenstatuut
 */
angular
  .module('ubr.kansenstatuut')
  .controller('EditRemarksModalController', EditRemarksModalController);

/* @ngInject */
function EditRemarksModalController (passholder, $uibModalInstance, passholderService, $scope) {
  /*jshint validthis: true */
  var controller = this;

  controller.updatePending = false;
  controller.passholder = passholder;
  controller.asyncError = null;
  controller.remarks = passholder.remarks;

  controller.cancelModal = function () {
    $uibModalInstance.dismiss();
  };

  function clearAsyncError (newVal, oldVal) {
    if (oldVal && oldVal && newVal !== oldVal) {
      controller.asyncError = null;
    }
  }

  $scope.$watch(function () {
    return controller.remarks || null;
  }, clearAsyncError);

  controller.updateRemarks = function (editForm) {
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

    if (editForm.remarks.$valid) {
      controller.updatePending = true;
      var remarks = controller.remarks;

      passholderService
        .updateRemarks(passholder, remarks)
        .then(stopEditing, showUpdateErrors)
        .finally(unlockForm);
    }
  };
}
