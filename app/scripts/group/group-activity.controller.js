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
function GroupActivityController (groupPass) {
  /*jshint validthis: true */
  var controller = this;

  controller.group = groupPass.group;
}
