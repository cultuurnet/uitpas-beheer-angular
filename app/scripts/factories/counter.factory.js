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
    isRegistrationCounter: function (pass) {
      var registrationCounter = false;
      if (this.cardSystems[pass.cardSystem.id]) {
        // Check if the card system is allowed to register at the active counter.
        if (this.cardSystems[pass.cardSystem.id].permissions.indexOf('registratie') !== -1) {
          registrationCounter = true;
        }
      }
      return registrationCounter;
    },
    isAuthorisedRegistrationCounter: function (pass) {
      var authorisedCounter = false;
      if (this.cardSystems[pass.cardSystem.id]) {
        // Check if the card system is allowed to register at the active counter.
        if (this.cardSystems[pass.cardSystem.id].permissions.indexOf('kansenstatuut toekennen') !== -1) {
          authorisedCounter = true;
        }
      }
      return authorisedCounter;
    }
  };

  return (Counter);
}
