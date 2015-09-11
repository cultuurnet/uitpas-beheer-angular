'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.eIdService
 * @description
 * # eIDService
 * Service in the uitpasbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .service('eIDService', eIDService);

/* @ngInject */
function eIDService($window, $rootScope, day) {
  /*jshint validthis: true */
  var service = this;

  service.init = function () {
    $window.readEid = function(firstName, lastName, inszNumber, dateOfBirth, placeOfBirth, gender, nationality, street, postalCode, city) {

      var dateOfBirthAsDate = day(dateOfBirth, 'D/M/YYYY').toDate();

      if (gender === 'M') {
        gender = 'MALE';
      } else if (gender === 'F' || gender === 'V') {
        gender = 'FEMALE';
      }

      var eIdData = {
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
      $rootScope.$emit('eIdDataReceived', eIdData);
    };

    $window.readEidPhoto = function(base64Picture) {
      $rootScope.$emit('eIdPhotoReceived', base64Picture);
    };

    $window.readEidError = function(message) {
      $rootScope.$emit('eIdErrorReceived', message);
    };
  };

  service.getDataFromEID = function() {
    $window.alert('READEID');
  };
}
