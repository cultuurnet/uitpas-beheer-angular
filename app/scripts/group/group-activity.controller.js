'use strict';

/**
 * @ngdoc function
 * @name ubr.group.controller:GroupActivityController
 * @description
 * # GroupActivityController
 * Controller of the ubr group module.
 */
angular
  .module('ubr.group')
  .controller('GroupActivityController', GroupActivityController);

/* @ngInject */
function GroupActivityController (group, activityService) {
  /*jshint validthis: true */
  var controller = this;

  controller.group = group;
  controller.activities = activityService.search(group, {});
}
