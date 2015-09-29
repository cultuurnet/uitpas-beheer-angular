'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.Counter
 * @description
 * # Pass factory
 * Factory in the passbeheerApp.
 */
angular.module('uitpasbeheerApp')
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
    isRegistrationCounter: function (cardSystemId) {
      var registrationCounter = false;
      if (cardSystemId && this.cardSystems[cardSystemId]) {
        // Check if the card system is allowed to register at the active counter.
        if (this.cardSystems[cardSystemId].permissions.indexOf('registratie') !== -1) {
          registrationCounter = true;
        }
      }
      return registrationCounter;
    },
    isAuthorisedRegistrationCounter: function (cardSystemId) {
      var authorisedCounter = false;
      if (cardSystemId && this.cardSystems[cardSystemId]) {
        // Check if the card system is allowed to register at the active counter.
        if (this.cardSystems[cardSystemId].permissions.indexOf('kansenstatuut toekennen') !== -1) {
          authorisedCounter = true;
        }
      }
      return authorisedCounter;
    },
    isAllowedToLeaveInszNumberEmpty: function (cardSystemId) {
      return this.isAuthorisedRegistrationCounter(cardSystemId);
    }
  };

  return (Counter);
}
