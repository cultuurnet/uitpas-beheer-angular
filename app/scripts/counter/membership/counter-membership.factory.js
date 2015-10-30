'use strict';

/**
 * @ngdoc service
 * @name ubr.counter.membership.CounterMembership
 * @description
 * # CounterMembership factory
 * Factory in the ubr.counter.membership module.
 */
angular
  .module('ubr.counter.membership')
  .factory('CounterMembership', counterMembershipFactory);

/* @ngInject */
function counterMembershipFactory(Role) {
  /**
   * @class CounterMembership
   * @constructor
   * @param {object} jsonCounterMembership
   */
  var CounterMembership = function (jsonCounterMembership) {
    this.parseJson(jsonCounterMembership);
  };

  function parseJsonRole(roleKey) {
    return Role[roleKey];
  }

  CounterMembership.prototype = {
    parseJson: function (jsonCounterMembership) {
      this.uid = jsonCounterMembership.uid;
      this.nick = jsonCounterMembership.nick;
      this.role = parseJsonRole(jsonCounterMembership.role);
    }
  };

  return (CounterMembership);
}
