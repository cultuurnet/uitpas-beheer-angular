'use strict';

/**
 * A ticket sale object.
 * @typedef {Object} PointHistory
 * @property {string}   id                    - The ID of the pont history item, eg: 30819.
 * @property {string}   date                  - The date when the item occurred, eg: 2012-12-30.
 * @property {int}      points                - The number of point that got added or removed.
 * @property {string}   title                 - The title of the action that changed the points.
 *
 * Some additional properties used to track removal
 * @property {boolean}  [pointHistoryLoading] - Flag set when the sale is being removed.
 */

/**
 * @ngdoc function
 * @name ubr.passholder.controller:PointHistoryController
 * @name cac
 * @description
 * # PointHistoryController
 * Controller of the ubr.passholder module.
 */
angular
  .module('ubr.passholder')
  .controller('PointHistoryController', PointHistoryController);

/**
 * @ngInject
 * @param {passholderService} passholderService
 * @param {Pass} pass
 * @param {Passholder} passholder
 * @param $uibModalInstance
 * @constructor
 */
function PointHistoryController (pass, passholder, $uibModalInstance, passholderService) {
  /*jshint validthis: true */
  var controller = this;
  controller.passholder = passholder;
  controller.pointHistoryLoading = true;
  /**
   * All the tickets sold to the given passholder.
   * @type {PointHistory[]}
   */
  controller.pointHistory = [];

  /**
   * @param {PointHistory[]} pointHistory
   */
  var displayPointHistory = function(pointHistory) {
    controller.pointHistory = pointHistory;
    controller.pointHistoryLoading = false;
  };

  var loadPointHistory = function() {
    controller.pointHistoryLoading = true;
    passholderService
      .getPointHistory(pass.number)
      .then(displayPointHistory);
  };

  loadPointHistory();

  controller.cancel = function () {
    $uibModalInstance.dismiss('canceled');
  };
}
