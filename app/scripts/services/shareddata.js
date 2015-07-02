'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.sharedData
 * @description
 * # sharedData
 * Service in the uitpasbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .service('sharedDataService', sharedDataService);

/* @ngInject */
function sharedDataService() {
  /*jshint validthis: true */
  var service = this;
  service.data = {};
}
