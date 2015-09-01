'use strict';

/**
 * @ngdoc function
 * @name uitpasbeheerApp.controller:PassholderMembershipController
 * @description
 * # PassholderMembershipController
 * Controller of the uitpasbeheerApp
 */
angular
  .module('uitpasbeheerApp')
  .controller('PassholderMembershipController', PassholderMembershipController);

/* @ngInject */
function PassholderMembershipController (appConfig, passholder, moment, $rootScope, $scope, $http, MembershipEndDateCalculator, $filter, $sce, $modal) {
  var apiUrl = appConfig.apiUrl;
  var cardNumber = passholder.passNumber;
  var legacyPassholder;

  $scope.membershipStatusSummary = function (membership) {
    var endDate = moment.unix(membership.endDate);
    var formattedDate = $filter('date')(endDate.toDate(), 'dd/MM/yyyy');
    var now = new Date();
    if (moment().isAfter(endDate)) {
      return $sce.trustAsHtml('<strong>vervallen op</strong> ' + formattedDate);
    } else {
      return $sce.trustAsHtml('<strong>vervalt op</strong> ' + formattedDate);
    }
  };

  $scope.expired = function(membership) {
    var endDate = moment.unix(membership.endDate);
    return moment().isAfter(endDate);
  };

  $scope.canRenew = function(membership) {
    var association = getAssociation(membership.association.id);

    return membership.renewable && association.permissionRegister;
  };

  $scope.canStop = function (membership) {
    var association = getAssociation(membership.association.id);

    return !$scope.expired(membership) && association.permissionRegister;
  };

  $scope.canApplyFor = function(partialAssociation) {
    var association = getAssociation(partialAssociation.id);

    if (!association.permissionRegister) {
      return false;
    }

    var calculator = new MembershipEndDateCalculator(association);
    var endDate = calculator.membershipEndDate(legacyPassholder);

    var now = moment();

    // Membership can be only applied for when
    // - the end date is not fixed
    // - OR a fixed end date is in the future.
    return false === endDate.fixed || moment(endDate.date).isAfter(now);
  };

  $scope.registerTitle = function(partialAssociation) {
    var association = getAssociation(partialAssociation.id);

    if (!association.permissionRegister) {
      return 'U heeft niet de juiste permissies om dit lidmaatschap te registreren';
    }

    var calculator = new MembershipEndDateCalculator(association);
    var endDate = calculator.membershipEndDate(legacyPassholder);

    var now = moment();

    if (endDate.fixed && moment(endDate.date).isBefore(now)) {
      return 'Pashouder is te oud';
    }

    return undefined;
  };

  var allAssociations = {};

  var loadMemberships = function() {
    $scope.loadingMemberships = true;
    $scope.memberships = [];
    $scope.associations = [];

    $http.get(apiUrl + 'uitpas/' + cardNumber + '/profile').success(function (data) {
      $scope.loadingMemberships = false;

      legacyPassholder = data.passholder;
      legacyPassholder.passNumber = passholder.passNumber;

      $scope.memberships = data.passholder.memberships;

      $scope.associations = data.otherAssociations;

      $scope.atLeastOneKansenstatuutExpired = data.atLeastOneKansenstatuutExpired;

      allAssociations = data.allAssociations;
    });
  };

  loadMemberships();

  var getAssociation = function(id) {
    return allAssociations[id];
  };

  $scope.openMembershipRegistrationModal = function (association, recentlyExpired) {
    var modalInstance = $modal.open({
      templateUrl: 'views/modal-passholder-membership-registration.html',
      controller: 'PassholderMembershipRegisterController',
      resolve: {
        association: function () {
          return getAssociation(association.id);
        },
        passholder: function () {
          return legacyPassholder;
        },
        recentlyExpired: function () {
          return recentlyExpired;
        }
      }
    });

    modalInstance.result.then(function (membership) {
      // Reload memberships.
      loadMemberships();
    });
  };

  $scope.openMembershipRenewalModal = function (membership) {
    var modalInstance = $modal.open({
      templateUrl: 'views/modal-passholder-membership-renew.html',
      controller: 'PassholderMembershipRenewController',
      resolve: {
        membership: function() {
          return membership;
        },
        association: function () {
          return getAssociation(membership.association.id);
        },
        passholder: function () {
          return legacyPassholder;
        }
      }
    });

    modalInstance.result.then(function (membership) {
      // Reload memberships.
      loadMemberships();
    })
  };

  $scope.openMembershipStopModal = function (membership) {
    var modalInstance = $modal.open({
      templateUrl: 'views/modal-passholder-membership-stop.html',
      controller: 'PassholderMembershipStopController',
      resolve: {
        membership: function() {
          return membership;
        },
        passholder: function () {
          return legacyPassholder;
        }
      }
    });

    modalInstance.result.then(function () {
      // Reload memberships.
      loadMemberships();
    })
  };
}
