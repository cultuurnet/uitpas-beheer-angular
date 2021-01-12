'use strict';

/**
 * @ngdoc service
 * @name ubr.utilities.eIDService
 * @description
 * # eIDService
 * Service in the ubr.utilities module.
 */
angular
  .module('ubr.utilities')
  .service('eIDService', eIDService);

/* @ngInject */
function eIDService($window, $rootScope, day) {
  /*jshint validthis: true */
  var service = this;

  service.init = function () {
    $window.readEid = function(firstName, lastName, inszNumber, dateOfBirth, placeOfBirth, gender, nationality, street, postalCode, city, base64Picture) {

      var dateOfBirthAsDate = day(dateOfBirth, 'D/M/YYYY').toDate();

      if (gender === 'M') {
        gender = 'MALE';
      } else if (gender === 'F' || gender === 'V') {
        gender = 'FEMALE';
      }

      var eIDData = {
        name: {
          first: firstName,
          last: lastName
        },
        inszNumber: inszNumber,
        birth: {
          date: dateOfBirthAsDate,
          place: placeOfBirth
        },
        gender: gender,
        nationality: nationality,
        address: {
          street: street,
          postalCode: postalCode,
          city: city
        }
      };
      $rootScope.$emit('eIDDataReceived', eIDData, base64Picture);
    };

    $window.readEidPhoto = function(base64Picture) {
      $rootScope.$emit('eIDPhotoReceived', base64Picture);
    };

    $window.readEidError = function(message) {
      $rootScope.$emit('eIDErrorReceived', message);
    };
  };

  service.getDataFromEID = function() {
    $window.alert('READEID');
  };
}
