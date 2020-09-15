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
  var Pass = function (jsonPass, identification) {
    this.parseJson(jsonPass, identification);
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
    parseJson: function (jsonPass, identification) {
      var uitPas =
        (identification &&
          jsonPass.passHolder &&
          jsonPass.passHolder.uitpassen &&
          jsonPass.passHolder.uitpassen.find(function(up) {
            return up.number === identification;
          })) ||
        jsonPass.uitPas;
      this.number = uitPas.number;
      this.kansenStatuut = uitPas.kansenStatuut;
      this.status = uitPas.status;
      this.type = uitPas.type;

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

      if (uitPas.cardSystem) {
        this.cardSystem = {
          id: uitPas.cardSystem.id,
          name: uitPas.cardSystem.name || 'kaart-systeem'
        };
      }
    },
    isKansenstatuut: function () {
      return this.kansenStatuut ? true : false;
    },
    kansenstatuutExpired: kansenstatuutExpired,
    isBlocked: function(identification) {
      if (identification && this.passholder && this.passholder.uitPassen && this.passholder.uitPassen.length > 1) {
        var selectedPass = this.passholder.uitPassen.find(
          function (p) {
            return p.number === identification;
          }
        );
        if (selectedPass) {
          return selectedPass.status === 'BLOCKED';
        }
      }
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
