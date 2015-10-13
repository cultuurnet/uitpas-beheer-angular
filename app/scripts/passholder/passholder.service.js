'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.passholder
 * @description
 * # passholder
 * Service in the uitpasbeheerApp.
 */
angular
  .module('uitpasbeheerApp')
  .service('passholderService', passholderService);

/* @ngInject */
function passholderService($q, $http, $cacheFactory, appConfig, Pass, $rootScope) {
  var apiUrl = appConfig.apiUrl;
  var passholderIdCache = $cacheFactory('passholderIdCache');
  var passholderCache = $cacheFactory('passholderCache');

  /*jshint validthis: true */
  var service = this;

  /**
   * @param {string} identification
   *   The identification number. This can be either an UiTPAS number, chip-number, INSZ-number, or INSZ-barcode.
   *
   * @returns {Promise}
   *   A passholder promise.
   */
  service.findPass = function(identification) {
    var deferredPassholder = $q.defer();

    var passholderId = passholderIdCache.get(identification);

    if (passholderId) {
      deferredPassholder.resolve(passholderCache.get(passholderId));
    } else {
      var passholderRequest = $http.get(apiUrl + 'identities/' + identification,
        {
          withCredentials: true
        });

      var cacheAndResolvePassHolder = function (passData) {
        var pass = new Pass(passData);
        passholderIdCache.put(identification, pass.number);
        passholderCache.put(pass.number, pass);
        deferredPassholder.resolve(pass);
      };

      var rejectPassHolder = function () {
        deferredPassholder.reject(
          {
            code: 'PASSHOLDER_NOT_FOUND',
            title: 'Not found',
            message: 'Passholder not found for identification number: ' + identification
          }
        );
      };

      passholderRequest.success(cacheAndResolvePassHolder);
      passholderRequest.error(rejectPassHolder);
    }

    return deferredPassholder.promise;
  };

  /**
   * @param {string} passNumber
   * @returns {Promise}
   */
  service.blockPass = function(passNumber) {
    var deferred = $q.defer();

    var returnAsErrorCode = function(error) {
      deferred.reject(error.code);
    };

    var returnPass = function(pass) {
      passholderCache.remove(pass.number);
      passholderIdCache.remove(pass.number);
      deferred.resolve(pass);
    };

    $http
      .delete(
        apiUrl + 'uitpas/' + passNumber,
        {
          withCredentials: true
        }
      )
      .success(returnPass)
      .error(returnAsErrorCode);

    return deferred.promise;
  };

  service.findPassholder = function(identification) {
    var deferredPassholder = $q.defer();
    var passholderPromise = deferredPassholder.promise;

    service.findPass(identification).then(
      function(pass) {
        deferredPassholder.resolve(pass.passholder);
      },
      function(error) {
        deferredPassholder.reject(error);
      }
    );

    return passholderPromise;
  };

  /**
   * Update the information of a passholder by persisting it on the server and caching it locally
   *
   * @param {object} passholder
   * @param {string} identification
   * @return {Function|promise}
   */
  service.update = function(passholder, identification) {
    var deferred = $q.defer();

    var successUpdatingPassholderOnServer = function(passholderData) {
      service.findPass(identification).then(function (cachedPass) {
        cachedPass.passholder.parseJson(passholderData);
        passholderCache.put(cachedPass.number, cachedPass);
        deferred.resolve(cachedPass.passholder);
      });
    };

    var errorUpdatingPassholderOnServer = function(e) {
      var message = 'The passholder could not be updated on the server';
      if (!angular.isUndefined(e) && e.code) {
        message += ': ' + e.code;
      }
      else {
        message += '.';
      }

      deferred.reject({
        code: 'PASSHOLDER_NOT_UPDATED_ON_SERVER',
        title: 'Passholder not updated on server',
        message: message,
        apiError: e
      });
    };

    var config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    $http
      .post(apiUrl + 'passholders/' + identification, passholder.serialize(), config)
      .success(successUpdatingPassholderOnServer)
      .error(errorUpdatingPassholderOnServer);

    return deferred.promise;
  };

  service.updatePoints = function(event, exchangedAdvantage, passNumber) {
    service.findPassholder(passNumber).then(function (cachedPassholder) {
      var newPointCount = cachedPassholder.points - exchangedAdvantage.points;

      if (newPointCount < 0) {
        newPointCount = 0;
      }

      cachedPassholder.points = newPointCount;
    });
  };

  service.newPass = function(pass, passholderUid, reason, kansenStatuutEndDate, voucherNumber) {
    var deferredPass = $q.defer();
    var parameters = {
      passholderUid: passholderUid,
      reason: reason
    };

    var requestOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (voucherNumber !== null) {
      parameters.voucherNumber = voucherNumber;
    }

    if (kansenStatuutEndDate !== null) {
      parameters.kansenStatuut = {
        endDate: moment(kansenStatuutEndDate).format('YYYY-MM-DD')
      };
    }

    var resolveNewPass = function (newPassResponse) {
      // TODO: Clean up this cache mess...
      passholderIdCache.remove(newPassResponse.data.number);
      passholderCache.remove(newPassResponse.data.number);

      deferredPass.resolve(newPassResponse.data);
    };

    var reportError =function (errorResponse) {
      deferredPass.reject(errorResponse.data);
    };

    $http
      .put(apiUrl + 'uitpas/' + pass.number, parameters, requestOptions)
      .then(resolveNewPass, reportError);

    return deferredPass.promise;
  };

  $rootScope.$on('advantageExchanged', service.updatePoints);

  service.register = function(pass, passholder, voucherNumber, kansenstatuutInfo){
    var registration = {
          passHolder: passholder.serialize()
        },
        deferredPassholder = $q.defer();

    if (voucherNumber) {
      registration.voucherNumber = voucherNumber;
    }

    if (pass.isKansenstatuut()) {

      if (!kansenstatuutInfo) {
        throw new Error('Registration for a pass with kansenstatuut should provide additional info.');
      }

      registration.kansenStatuut = {
        endDate: moment(kansenstatuutInfo.endDate).format('YYYY-MM-DD')
      };

      if (kansenstatuutInfo.includeRemarks) {
        registration.kansenStatuut.remarks = kansenstatuutInfo.remarks;
      }
    }

    var requestOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    var resolveRegisteredPassholder = function (registrationResponse) {
      // TODO: Clean up this cache mess...
      passholderIdCache.remove(pass.number);
      passholderCache.remove(pass.number);

      deferredPassholder.resolve(registrationResponse.data);
    };

    var reportError = function (errorResponse) {
      deferredPassholder.reject(errorResponse.data);
    };

    $http
      .put(apiUrl + 'passholders/' + pass.number, registration, requestOptions)
      .then(resolveRegisteredPassholder, reportError);

    return deferredPassholder.promise;
  };

  /**
   * Renew the kansenstatuut of a passholder with a new end date.
   *
   * @param {Passholder} passholder
   * @param {object} kansenstatuut
   * @param {Date} endDate
   */
  service.renewKansenstatuut = function (passholder, kansenstatuut, endDate) {
    var cardSystemId = kansenstatuut.cardSystem.id;
    var passholderId = passholder.passNumber;
    var kansenstatuutData = {
      endDate: moment(endDate).format('YYYY-MM-DD')
    };
    var requestOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    var deferredRenew = $q.defer();

    function updateLocalKansenstatuut () {
      var cachedKansenstatuut = passholder.getKansenstatuutByCardSystemID(kansenstatuut.cardSystem.id);
      cachedKansenstatuut.endDate = endDate;
      cachedKansenstatuut.status = 'ACTIVE';
      deferredRenew.resolve();

      $rootScope.$emit('kansenStatuutRenewed', cachedKansenstatuut);
    }

    $http
      .post(
        apiUrl + 'passholders/' + passholderId + '/kansenstatuten/' + cardSystemId,
        kansenstatuutData,
        requestOptions
      )
      .then(updateLocalKansenstatuut, deferredRenew.reject);

    return deferredRenew.promise;
  };

  /**
   * Update the remarks for a passholder.
   *
   * @param {Passholder} passholder
   * @param {string} remarks
   */
  service.updateRemarks = function (passholder, remarks) {
    var passholderId = passholder.passNumber;
    var passholderPath = apiUrl + 'passholders/' + passholderId;
    var passholderData = passholder.serialize();
    passholderData.remarks = remarks;
    var requestOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    var deferredUpdate = $q.defer();

    function updateLocalPassholder(updateResponse) {
      service
        .updateCachedPassholder(passholderId, updateResponse.data)
        .then(function () {
          deferredUpdate.resolve();

          $rootScope.$emit('remarksUpdated');
        });
    }

    $http
      .post(passholderPath, passholderData, requestOptions)
      .then(updateLocalPassholder, deferredUpdate.reject);

    return deferredUpdate.promise;
  };

  /**
   * @param {string} passholderId
   * @param {object} passholderData
   */
   service.updateCachedPassholder = function(passholderId, passholderData) {
     var deferredUpdate = $q.defer();

     function updateCachedPass(cachedPass) {
       cachedPass.passholder.parseJson(passholderData);
       passholderCache.put(cachedPass.number, cachedPass);
       deferredUpdate.resolve(cachedPass.passholder);
     }

    service
      .findPass(passholderId)
      .then(updateCachedPass);

    return deferredUpdate.promise;
  };

  function updateAvailableTickets(event, ticketSale) {
    var passholderId = ticketSale.passholder.passNumber;
    var ticketsSold = ticketSale.ticketCount;

    function updateGroupTicketCount(pass) {
      var group = pass.group;

      if (group) {
        var newTicketCount = group.availableTickets - ticketsSold;

        if (newTicketCount < 0) {
          newTicketCount = 0;
        }

        group.availableTickets = newTicketCount;
        passholderCache.put(passholderId, pass);
      }
    }

    service
      .findPass(passholderId)
      .then(updateGroupTicketCount);
  }

  $rootScope.$on('ticketsSold', updateAvailableTickets);
}
