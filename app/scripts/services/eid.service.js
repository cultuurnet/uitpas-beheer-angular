'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.eIdService
 * @description
 * # eIdService
 * Service in the uitpasbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .service('eIdService', eIdService);

/* @ngInject */
function eIdService($window, $rootScope, moment) {
  /*jshint validthis: true */
  var service = this;

  service.init = function () {
    $window.readEid = function(firstName, lastName, inszNumber, dateOfBirth, placeOfBirth, gender, nationality, street, postalCode, city) {
      var dateOfBirthAsDate = moment(dateOfBirth + " 00:00", 'DD/MM/YYYY HH:mm', true).toDate();
      var d = new Date();

      street = street + ' ' + dateOfBirthAsDate.toUTCString() +
        ' (offset ' + dateOfBirthAsDate.getTimezoneOffset() + ', new date: ' + d.toString() + " " + d.getTimezoneOffset() + ')';

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

  service.getDataFromEId = function() {
    $window.alert('READEID');
  };
}
