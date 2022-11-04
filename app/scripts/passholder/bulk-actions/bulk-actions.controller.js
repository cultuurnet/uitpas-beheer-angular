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
function BulkActionsController (bulkSelection, passholders, action, $uibModalInstance, $state, moment) {
  var controller = this;

  controller.submitBusy = false;
  controller.isSubmitted = false;
  controller.bulkSelection = bulkSelection;
  controller.action = action;
  controller.kansenstatuutData = {
    kansenstatuutEndDate: moment().month() < 4 ?
      moment('30/04/' + moment().year(), 'DD/MM/YYYY') :
      moment('30/04/' + (moment().year() + 1), 'DD/MM/YYYY'),
  };
  controller.passholders = passholders;

  console.log({pass:passholders, bulkSelection})

  if(action === 'address' || action === 'kansenstatuut' || action === 'block') {
    controller.passholders = bulkSelection.getPassholderNumbers();
  }

  controller.togglePassBulkSelection = function(passholder) {
    if (controller.bulkSelection.numberInSelection(passholder.passNumber)) {
      controller.bulkSelection.removeUitpasNumberFromSelection(passholder.passNumber);
    }
    else {
      controller.bulkSelection.addUitpasNumberToSelection(passholder.passNumber);
    }
  };

  controller.submitForm = function(passholders, bulkForm) {
    controller.isSubmitted = true;
    if(bulkForm.$valid) {
      if (!controller.submitBusy) {
        controller.submitBusy = true;
        $state.go('counter.main.advancedSearch.showBulkResults', { passholders: controller.passholders, bulkForm: bulkForm, bulkSelection: controller.bulkSelection, action: controller.action });
        controller.submitBusy = false;
      }
    }
  };

  controller.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };
}
