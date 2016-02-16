'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:EditSchoolModalController
 * @description
 * # EditSchoolModalController
 * Controller of the ubr.kansenstatuut
 */
angular
  .module('ubr.kansenstatuut')
  .controller('EditSchoolModalController', EditSchoolModalController);

/* @ngInject */
function EditSchoolModalController (passholder, $uibModalInstance, passholderService, $scope, schools) {
  /*jshint validthis: true */
  var controller = this;

  controller.updatePending = false;
  controller.passholder = passholder;
  controller.asyncError = null;
  controller.school = passholder.school;
  controller.schools = schools;

  controller.cancelModal = function () {
    $uibModalInstance.dismiss();
  };

  function clearAsyncError (newVal, oldVal) {
    if (oldVal && oldVal && newVal !== oldVal) {
      controller.asyncError = null;
    }
  }

  $scope.$watch(function () {
    return controller.school || null;
  }, clearAsyncError);

  controller.updateSchool = function (editForm) {
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

    if (editForm.school.$valid) {
      controller.updatePending = true;
      var school = controller.school;

      passholderService
        .updateSchool(passholder, school)
        .then(stopEditing, showUpdateErrors)
        .finally(unlockForm);
    }
  };
}
