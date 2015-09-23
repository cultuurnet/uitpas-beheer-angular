'use strict';

/**
 * @ngdoc function
 * @name ubr.group.controller:GroupDetailController
 * @description
 * # GroupDetailController
 * Controller of the ubr group module.
 */
angular
  .module('ubr.group')
  .controller('GroupDetailController', GroupDetailController);

/* @ngInject */
function GroupDetailController (groupPass) {
  /*jshint validthis: true */
  var controller = this;

  controller.group = groupPass.group;
}
