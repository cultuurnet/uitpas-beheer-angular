'use strict';

/**
 * @ngdoc service
 * @name ubr.passholder.Pass
 * @description
 * # Pass factory
 * Factory in the ubr.passholder module.
 */
angular
  .module('ubr.passholder')
  .factory('Pass', passFactory);

/* @ngInject */
function passFactory(Passholder, moment) {
  /**
   * @class Pass
   * @constructor
   * @param {object}  jsonPass
   */
  var Pass = function (jsonPass) {
    this.parseJson(jsonPass);
  };

  function parseAdditionalPasses(additionalPasses) {
    var processedPasses = [];

    angular.forEach(additionalPasses, function (additionalPass) {
      processedPasses.push(new Pass({uitPas: additionalPass}));
    });

    return processedPasses;
  }

  function kansenstatuutExpired(passholder) {
    /*jshint validthis: true */
    var kansenStatuut = passholder.getKansenstatuutByCardSystemID(this.cardSystem.id);
    return (kansenStatuut && kansenStatuut.status === 'EXPIRED');
  }

  Pass.prototype = {
    parseJson: function (jsonPass) {
      this.number = jsonPass.uitPas.number;
      this.kansenStatuut = jsonPass.uitPas.kansenStatuut;
      this.status = jsonPass.uitPas.status;
      this.type = jsonPass.uitPas.type;

      if (jsonPass.passHolder) {
        this.passholder = new Passholder(jsonPass.passHolder);
        this.passholder.passNumber = this.number;
        if (this.passholder.uitPassen) {
          this.passholder.uitPassen = parseAdditionalPasses(this.passholder.uitPassen);
        }
      }

      if(jsonPass.group) {
        this.group = {
          passNumber: this.number,
          name: jsonPass.group.name,
          availableTickets: jsonPass.group.availableTickets,
          endDate: jsonPass.group.endDate,
        };
      }

      if (jsonPass.uitPas.cardSystem) {
        this.cardSystem = {
          id: jsonPass.uitPas.cardSystem.id,
          name: jsonPass.uitPas.cardSystem.name || 'kaart-systeem'
        };
      }
    },
    isKansenstatuut: function () {
      return this.kansenStatuut ? true : false;
    },
    kansenstatuutExpired: kansenstatuutExpired,
    isBlocked: function() {
      return this.status === 'BLOCKED';
    },
    isExpired: function() {
      if (this.group) {
        return moment(this.group.endDate * 1000).isBefore(moment());
      }
      return true;
    },
    isLocalStock: function() {
      return this.status === 'LOCAL_STOCK';
    }
  };

  return (Pass);
}
