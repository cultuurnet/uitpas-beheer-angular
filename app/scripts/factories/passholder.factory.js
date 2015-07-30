'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.Passholder
 * @description
 * # Passholder factory
 * Factory in the uitpasbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .factory('Passholder', passholderFactory);

/* @ngInject */
function passholderFactory() {
  /**
   * @class Passholder
   * @constructor
   * @param {object}  jsonPassholder
   */
  var Passholder = function (jsonPassholder) {
    this.parseJson(jsonPassholder);
  };

  Passholder.prototype = {
    parseJson: function (jsonPassholder) {
      this.name = jsonPassholder.name;
      this.address = jsonPassholder.address;
      this.birth = {
        date: new Date(jsonPassholder.birth.date),
        place: jsonPassholder.birth.date
      };
      this.inszNumber = jsonPassholder.inszNumber;
      this.picture = 'data:image/jpeg;base64, ' + jsonPassholder.picture;
      this.gender = jsonPassholder.gender;
      this.nationality = jsonPassholder.nationality;
      this.privacy = jsonPassholder.privacy;
      this.contact = jsonPassholder.contact;
      this.points = jsonPassholder.points;
    }
  };

  return (Passholder);
}
