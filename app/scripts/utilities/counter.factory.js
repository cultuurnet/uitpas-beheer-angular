'use strict';

/**
 * @ngdoc service
 * @name ubr.utilities.Counter
 * @description
 * # Pass factory
 * Factory in the ubr.utilities module.
 */
angular
  .module('ubr.utilities')
  .factory('Counter', counterFactory);

/* @ngInject */
function counterFactory() {
  /**
   * @class Counter
   * @constructor
   * @param {object}  jsonCounter
   */
  var Counter = function (jsonCounter) {
    this.parseJson(jsonCounter);
  };

  function parseJsonCardSystems(jsonCardSystems) {
    var returnObject = {};
    angular.forEach(jsonCardSystems, function (jsonCardSystem, key) {
      returnObject[key] = {
        distributionKeys: jsonCardSystem.distributionKeys,
        groups: jsonCardSystem.groups,
        name: jsonCardSystem.name,
        permissions: jsonCardSystem.permissions,
        id: jsonCardSystem.id
      };
    });
    return returnObject;
  }

  Counter.prototype = {
    parseJson: function (jsonCounter) {
      this.actorId = jsonCounter.actorId;
      this.consumerKey = jsonCounter.consumerKey;
      this.id = jsonCounter.id;
      this.name = jsonCounter.name;
      this.role = jsonCounter.role;
      this.groups = jsonCounter.groups;
      this.permissions = jsonCounter.permissions;

      if(jsonCounter.cardSystems) {
        this.cardSystems = parseJsonCardSystems(jsonCounter.cardSystems);
      }
    },
    isAllowed: function (permission, cardSystemId) {
      return cardSystemId &&
        this.cardSystems[cardSystemId] &&
        this.cardSystems[cardSystemId].permissions.indexOf(permission) !== -1;
    },
    /**
     * Check if the active counter has the registration permission for any or a specific card-system.
     *
     * @param {string} [cardSystemId]
     * @return {boolean}
     */
    isRegistrationCounter: function (cardSystemId) {
      var canRegister = false;
      var counter = this;

      // If no system is specified, check if the active counter has the registration permission for any of it's card-systems.
      // Else check registration permission by system ID.
      if (typeof cardSystemId === 'undefined') {
        angular.forEach(counter.cardSystems, function (cardSystem, id) {
          if (counter.isRegistrationCounter(id)) {
            canRegister = true;
          }
        });
      } else {
        canRegister = this.isAllowed('registratie', cardSystemId);
      }

      return canRegister;
    },
    isAuthorisedRegistrationCounter: function (cardSystemId) {
      return this.isRegistrationCounter(cardSystemId) &&
        this.isAllowed('kansenstatuut toekennen', cardSystemId);
    },
    isAllowedToLeaveInszNumberEmpty: function (cardSystemId) {
      return this.isAuthorisedRegistrationCounter(cardSystemId);
    }
  };

  return (Counter);
}
