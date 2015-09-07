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
function eIdService($window, $q, $rootScope, $interval) {
  /*jshint validthis: true */
  var service = this;
  var eIdFullData = {};

  service.init = function () {
    $window.readEid = function(firstName, lastName, inszNumber, dateOfBirth, placeOfBirth, gender, nationality, street, postalCode, city) {
      if (gender === 'M') {
        gender = 'MALE';
      } else if (gender === 'F') {
        gender = 'FEMALE';
      }

      var eIdData = {
        name: {
          first: firstName,
          last: lastName
        },
        inszNumber: inszNumber,
        birth: {
          date: new Date(dateOfBirth),
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
    var deferredData = $q.defer();
    var dataPromise = deferredData.promise;

    // Return eIdData if we already have it.
    if ((eIdFullData.name || {}).first !== undefined && eIdFullData.picture !== undefined) {
      deferredData.resolve(eIdFullData);
    }
    // Or ask the browser to get the eId data.
    else {
      $window.alert('READEID');

      var waitCycles = 5;
      var waitCyclesDone = 0;
      var waitTimeOut = 1000;

      var waitForIt = $interval(function () {
        if ((eIdFullData.name || {}).first !== undefined && eIdFullData.picture !== undefined) {
          $interval.cancel(waitForIt);
          deferredData.resolve(eIdFullData);
        }
        else if (waitCyclesDone < waitCycles) {
          ++waitCyclesDone;
        }
        else {
          $interval.cancel(waitForIt);
          deferredData.reject('De e-id kon niet gelezen worden. Controleer of de kaart goed in de lezer zit of de lezer correct aangesloten is aan de pc.');
        }
      }, waitTimeOut);

      // Reject the promise if something went wrong getting the eId data.
      $rootScope.$on('eIdErrorReceived', function(message) {
        $interval.cancel(waitForIt);
        deferredData.reject(message);
      });


    }

    return dataPromise;
  };

  $rootScope.$on('eIdDataReceived', function(event, eIdData) {
    angular.merge(eIdFullData, eIdData);
  });

  $rootScope.$on('eIdPhotoReceived', function(event, base64Picture) {
    eIdFullData.picture = base64Picture;
  });
}
