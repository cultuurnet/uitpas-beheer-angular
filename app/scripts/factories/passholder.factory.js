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
function passholderFactory(moment, day) {

  function parseJsonContact(passholder, jsonContact) {
    if (jsonContact) {
      passholder.contact = {
        email: jsonContact.email || '',
        telephoneNumber: jsonContact.telephoneNumber || '',
        mobileNumber: jsonContact.mobileNumber || ''
      };
    } else {
      passholder.contact = {
        email: '',
        telephoneNumber: '',
        mobileNumber: ''
      };
    }
  }

  function parseJsonKansenStatuten(passholder, jsonKansenStatuten) {
    if (jsonKansenStatuten) {
      angular.forEach(jsonKansenStatuten, function (jsonKansenStatuut) {
        var kansenStatuut = {
          status: jsonKansenStatuut.status,
          endDate: day(jsonKansenStatuut.endDate, 'YYYY-MM-DD').toDate(),
          cardSystem: {
            id: jsonKansenStatuut.cardSystem.id,
            name: jsonKansenStatuut.cardSystem.name
          }
        };
        passholder.kansenStatuten.push(kansenStatuut);
      });
    }
  }

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
    this.kansenStatuten = [];
    this.remarks = '';

    if (jsonPassholder) {
      this.parseJson(jsonPassholder);
    }
  };

  Passholder.prototype = {
    parseJson: function (jsonPassholder) {
      this.name = jsonPassholder.name;
      this.address = jsonPassholder.address;
      if (jsonPassholder.birth) {
        this.birth = {
          date: (jsonPassholder.birth.date ? day(jsonPassholder.birth.date, 'YYYY-MM-DD').toDate() : null),
          place: jsonPassholder.birth.place
        };
      }
      if (jsonPassholder.inszNumber) {
        this.inszNumber = jsonPassholder.inszNumber;
      }
      if (jsonPassholder.picture) {
        this.picture = 'data:image/jpeg;base64, ' + jsonPassholder.picture;
      }
      this.gender = jsonPassholder.gender;
      this.nationality = jsonPassholder.nationality;
      this.privacy = jsonPassholder.privacy;
      parseJsonContact(this, jsonPassholder.contact);
      parseJsonKansenStatuten(this, jsonPassholder.kansenStatuten);
      this.points = jsonPassholder.points;
      this.remarks = jsonPassholder.remarks || 'Some test string to work with';
    },
    serialize: function () {
      var serializedPassholder = angular.copy(this);

      serializedPassholder.birth.date = (this.birth.date ? moment(this.birth.date).format('YYYY-MM-DD') : null);

      return serializedPassholder;
    }
  };

  return (Passholder);
}
