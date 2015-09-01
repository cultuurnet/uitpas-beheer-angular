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
function eIdService($window, $q, $rootScope) {
  /*jshint validthis: true */
  var service = this;
  var eIdFullData = {};

  service.getDataFromEId = function() {
    var deferredData = $q.defer();
    var dataPromise = deferredData.promise;

    $window.alert('READEID');

    // wait until the functions readEid & readEidPhoto are called and emitted
    $rootScope.$on('eIdDataReceived', function(event, eIdData) {
      console.log(eIdData);
      angular.merge(eIdFullData, eIdData);
    });

    $rootScope.$on('eIdPhotoReceived', function(base64Picture) {
      console.log(base64Picture);
      eIdFullData.base64Picture = base64Picture;
    });

    // resolve promise with eid data

    return dataPromise;
  };

  $window.readId = function(firstName, lastName, inszNumber, dateOfBirth, placeOfBirth, gender, nationality, street, postalCode, city) {
    var eIdData = {
      name: {
        first: firstName,
        last: lastName
      },
      inszNumber: inszNumber,
      birth: {
        date: dateOfBirth,
        place: placeOfBirth
      },
      gender: gender,
      nationality: nationality,
      contact: {
        street: street,
        postalCode: postalCode,
        city: city
      }
    };
    console.log(eIdData);
    $rootScope.$emit('eIdDataReceived', eIdData);
  };

  $window.readIdPhoto = function(base64Picture) {
    console.log(base64Picture);
    $rootScope.$emit('eIdPhotoReceived', base64Picture);
  };

}
