/**
 * Created by stijnswaanen on 29/10/15.
 */
'use strict';

/**
 * @ngdoc constant
 * @name ubr.counter.membership.Role
 * @description
 * # Role
 * Role of a specific member of a counter.
 */
angular
  .module('ubr.counter.membership')
  .constant('Role',
  /**
   * Enum for role
   * @readonly
   * @enum {string}
   */
  {
    ADMIN: {
      name: 'Admin',
      human: 'Beheerder'
    },
    MEMBER: {
      name: 'Member',
      human: 'Medewerker'
    }
  });