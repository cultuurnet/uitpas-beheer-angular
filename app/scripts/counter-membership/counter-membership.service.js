'use strict';

/**
 * @ngdoc service
 * @name ubr.counter-membership.CounterMembershipService
 * @description
 * # CounterMembershipService
 * Service in  counter membership module.
 */
angular
  .module('ubr.counter-membership')
  .service('CounterMembershipService', CounterMembershipService);

/* @ngInject */
function CounterMembershipService($q, $timeout, appConfig) {
  var apiUrl = appConfig.apiUrl + 'counters/active/members';

  /*jshint validthis: true */
  var service = this;

  service.getMemberships = function () {
    var members = [{
      uid: 'some-made-up-id',
      nick: 'Dirk Dirkington',
      role: 'ubermeister'
    }];

    return $timeout(function () {
      console.log(apiUrl);
      return members;
    }, 1000);
  };
}
