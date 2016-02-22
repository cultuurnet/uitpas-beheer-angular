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
function EditSchoolModalController (passholder, $uibModalInstance, passholderService, $scope, counterService) {
  /*jshint validthis: true */
  var controller = this;

  controller.updatePending = false;
  controller.passholder = passholder;
  controller.asyncError = null;
  controller.school = passholder.school;
  controller.schools = [];
  controller.schoolsLoaded = false;

  controller.loadSchools = function () {
    counterService.getSchools()
      .then(
        function (schools) {
          controller.schools = schools.filter(function (school) {
            return school.id !== passholder.school.id;
          });
          controller.schoolsLoaded = true;
        }
      );
  };
  controller.loadSchools();

  controller.cancelModal = function () {
    $uibModalInstance.dismiss();
  };

  function clearAsyncError (newVal, oldVal) {
    if (oldVal && newVal && newVal !== oldVal) {
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

    if (editForm.editSchool.$valid) {
      controller.updatePending = true;
      var school = controller.school;

      passholderService
        .updateSchool(passholder, school)
        .then(stopEditing, showUpdateErrors)
        .finally(unlockForm);
    }
  };
}
