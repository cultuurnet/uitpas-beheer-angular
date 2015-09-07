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
   * @param {object}  [jsonPassholder]
   */
  var Passholder = function (jsonPassholder) {
    this.name = {
      first: '',
      last: ''
    };
    this.address = {
      street: '',
      postalCode: '',
      city: ''
    };
    this.birth = {
      date: null,
      place: ''
    };
    this.inszNumber = '';
    this.picture = '';
    this.gender = '';
    this.nationality = '';
    this.privacy = {
      email: false,
      sms: false
    };
    this.contact = {
      email: '',
      telephoneNumber: '',
      mobileNumber: ''
    };
    this.points = 0;

    if (jsonPassholder) {
      this.parseJson(jsonPassholder);
    }
  };

  Passholder.prototype = {
    parseJson: function (jsonPassholder) {
      this.name = jsonPassholder.name;
      this.address = jsonPassholder.address;
      this.birth = {
        date: (jsonPassholder.birth.date ? new Date(jsonPassholder.birth.date) : null),
        place: jsonPassholder.birth.place
      };
      if (jsonPassholder.inszNumber) {
        this.inszNumber = jsonPassholder.inszNumber;
      }
      if (jsonPassholder.picture) {
        this.picture = 'data:image/jpeg;base64, ' + jsonPassholder.picture;
      }
      this.gender = jsonPassholder.gender;
      this.nationality = jsonPassholder.nationality;
      this.privacy = jsonPassholder.privacy;
      if (jsonPassholder.contact) {
        this.contact = {
          email: jsonPassholder.contact.email || '',
          telephoneNumber: jsonPassholder.contact.telephoneNumber || '',
          mobileNumber: jsonPassholder.contact.mobileNumber || ''
        };
      }
      this.points = jsonPassholder.points;
    }
  };

  return (Passholder);
}
