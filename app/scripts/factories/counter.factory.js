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
    isAllowed: function (permission, cardSystemId) {
      return cardSystemId &&
        this.cardSystems[cardSystemId] &&
        this.cardSystems[cardSystemId].permissions.indexOf(permission) !== -1;
    },
    isRegistrationCounter: function (cardSystemId) {
      return this.isAllowed('registratie', cardSystemId);
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
