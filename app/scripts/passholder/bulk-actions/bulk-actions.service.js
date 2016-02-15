'use strict';

/**
 * @ngdoc service
 * @name ubr.passholder.bulkActions.bulkActionsService
 * @description
 * # bulk actions service
 * Service in the ubr.passholder.bulkActions module.
 */
angular
  .module('ubr.passholder.bulkActions')
  .service('bulkActionsService', bulkActionsService);

/* @ngInject */
function bulkActionsService(appConfig, $window, $httpParamSerializer) {
  var passholderExportUrl = appConfig.apiUrl + 'passholders.xls';

  /*jshint validthis: true */
  var service = this;

  /**
   *
   * @param {BulkSelection} exportSelection
   */
  service.exportPassholders = function (exportSelection) {
    $window.location = passholderExportUrl + '?' + $httpParamSerializer(exportSelection.toQueryParameters());
  };
}
