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
    this.kansenStatuten = [
      {
        status: 'ACTIVE',
        endDate: day('2015-12-06', 'YYYY-MM-DD').toDate(),
        cardSystem: {
          name: 'UiTPAS Regio Aalst',
          id: '1'
        }
      },
      {
        status: 'IN_GRACE_PERIOD',
        endDate: day('2015-10-06', 'YYYY-MM-DD').toDate(),
        cardSystem: {
          name: 'UiTPAS Regio Gent',
          id: '2'
        }
      },
      {
        status: 'EXPIRED',
        endDate: day('2012-12-06', 'YYYY-MM-DD').toDate(),
        cardSystem: {
          name: 'UiTPAS Regio Brugge',
          id: '3'
        }
      }
    ];

    if (jsonPassholder) {
      this.parseJson(jsonPassholder);
    }
  };

  Passholder.prototype = {
    parseJson: function (jsonPassholder) {
      this.name = jsonPassholder.name;
      this.address = jsonPassholder.address;
      this.birth = {
        date: (jsonPassholder.birth.date ? day(jsonPassholder.birth.date, 'YYYY-MM-DD').toDate() : null),
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
    },
    serialize: function () {
      var serializedPassholder = angular.copy(this);

      serializedPassholder.birth.date = (this.birth.date ? moment(this.birth.date).format('YYYY-MM-DD') : null);

      return serializedPassholder;
    }
  };

  return (Passholder);
}
