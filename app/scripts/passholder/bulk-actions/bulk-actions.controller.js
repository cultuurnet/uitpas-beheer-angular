'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.bulk-actions.controller:BulkActionsController
 * @description
 * # BulkActionsController
 * Controller of the ubr.passholder.bulkActions module.
 */
angular
  .module('ubr.passholder.bulkActions')
  .controller('BulkActionsController', BulkActionsController);

/* @ngInject */
function BulkActionsController (bulkSelection, action, $uibModalInstance, $state, moment) {
  var controller = this;
  controller.submitBusy = false;
  controller.isSubmitted = false;
  controller.bulkSelection = bulkSelection;
  controller.action = action;
  controller.kansenstatuutData = {
    kansenstatuutEndDate: moment().endOf('year').toDate()
  };
  bulkSelection.getPassholderNumbers()
    .then(function(response){
      controller.passholders = response;
    });
  console.log(controller.passholders);

  controller.submitForm = function(passholders, bulkForm, bulkSelection) {
    controller.isSubmitted = true;
    if(bulkForm.$valid) {
      if (!controller.submitBusy) {
        controller.submitBusy = true;
        $state.go('counter.main.advancedSearch.showBulkResults', { passholders: passholders, bulkForm: bulkForm, bulkSelection: bulkSelection, action: controller.action });
        controller.submitBusy = false;
      }
    }
  };

  controller.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };
}
