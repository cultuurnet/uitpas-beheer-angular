'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.Pass
 * @description
 * # Pass factory
 * Factory in the passbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .factory('Pass', passFactory);

/* @ngInject */
function passFactory(Passholder) {
  /**
   * @class Pass
   * @constructor
   * @param {object}  jsonPass
   */
  var Pass = function (jsonPass) {
    this.parseJson(jsonPass);
  };

  Pass.prototype = {
    parseJson: function (jsonPass) {
      this.number = jsonPass.uitPas.number;
      this.kansenStatuut = jsonPass.uitPas.kansenStatuut;
      this.status = jsonPass.uitPas.status;
      this.type = jsonPass.uitPas.type;

      if(jsonPass.passHolder) {
        this.passholder = new Passholder(jsonPass.passHolder);
        this.passholder.passNumber = this.number;
      }
    },
    isKansenstatuut: function () {
      return this.kansenStatuut ? true : false;
    }
  };

  return (Pass);
}
