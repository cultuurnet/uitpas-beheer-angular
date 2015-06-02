'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:AppCtrl
 * @description
 * # AppCtrl
 * Controller of the uitpasbeheerApp
 */
angular.module('uitpasbeheerApp')
  .controller('AppCtrl', function ($scope, $location) {
    $scope.$watch(function () {
      if ($location.search().user === '1') {
        return {
          'id': 1231,
          'firstName': 'Bruce',
          'lastName': 'Lee',
          'desks': {
            1234: {
              'id': 1234,
              'name': '30CC',
              'phone': '016 01 60 16',
              'mail': 'info@30cc.be'
            },
            1235: {
              'id': 1235,
              'name': 'Bibliotheek Leuven',
              'phone': '016 01 60 17',
              'mail': 'bib@leuven.be'
            }
          },
          'selectedDesk': null
        };
      }
      else {
        return null;
      }
    }, angular.bind(this, function (user) {
      this.user = user;
    }), true);
  });
