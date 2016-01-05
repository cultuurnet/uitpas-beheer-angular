'use strict';

/**
 * @ngdoc function
 * @name ubr.passholder.bulk-actions.controller:AddressBulkController
 * @description
 * # AddressBulkController
 * Controller of the ubr.passholder.bulkActions module.
 */
angular
  .module('ubr.passholder.bulkActions')
  .controller('AddressBulkController', AddressBulkController);

/* @ngInject */
function AddressBulkController ($uibModalInstance) {
  var controller = this;

  this.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };
}