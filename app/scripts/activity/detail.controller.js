'use strict';

/**
 * @ngdoc function
 * @name ubr.activity.detail.controller:ActivityDetailController
 * @description
 * # ActivityDetailController
 * Controller of the ubr.activity module.
 */
angular
  .module('ubr.activity')
  .controller('ActivityDetailController', ActivityDetailController);

/* @ngInject */
function ActivityDetailController (activity, $uibModalInstance) {
  this.details = activity;

  this.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };
}
