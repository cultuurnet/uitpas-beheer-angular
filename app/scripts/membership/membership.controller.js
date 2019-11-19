'use strict';

/**
 * @ngdoc function
 * @name ubr.membership.controller:PassholderMembershipController
 * @description
 * # PassholderMembershipController
 * Controller of the ubr.membership module.
 */
angular
  .module('ubr.membership')
  .controller('PassholderMembershipController', PassholderMembershipController);

/* @ngInject */
function PassholderMembershipController (passholder, moment, $rootScope, $scope, MembershipEndDateCalculator, membershipService, $filter, $sce, $uibModal, $uibModalInstance) {
  var cardNumber = passholder.passNumber;
  var legacyPassholder;

  $scope.membershipStatusSummary = function (membership) {
    var endDate = moment.unix(membership.endDate);
    var formattedDate = $filter('date')(endDate.toDate(), 'dd/MM/yyyy');
    if (moment().isAfter(endDate)) {
      return $sce.trustAsHtml('<strong>Vervallen op</strong> ' + formattedDate);
    } else {
      return $sce.trustAsHtml('<strong>Vervalt op</strong> ' + formattedDate);
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

    return association.permissionRegister;
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
      return 'De pashouder is te oud';
    }

    return undefined;
  };

  var allAssociations = {};

  var loadMemberships = function() {
    $scope.loadingMemberships = true;
    $scope.memberships = [];
    $scope.associations = [];

    var listRetrieved = function (data) {
      $scope.loadingMemberships = false;

      legacyPassholder = data.passholder;
      legacyPassholder.passNumber = passholder.passNumber;

      $scope.memberships = data.passholder.memberships;

      $scope.associations = data.otherAssociations;

      $scope.atLeastOneKansenstatuutExpired = data.atLeastOneKansenstatuutExpired;

      allAssociations = data.allAssociations;
    };

    membershipService.list(cardNumber).then(listRetrieved);
  };

  loadMemberships();

  var getAssociation = function(id) {
    return allAssociations[id];
  };

  $scope.openMembershipRegistrationModal = function (association, recentlyExpired) {
    var modalInstance = $uibModal.open({
      templateUrl: 'views/membership/modal-passholder-membership-registration.html',
      controller: 'PassholderMembershipRegisterController',
      size: 'sm',
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
      $rootScope.$emit('membershipModified', membership);
    });
  };

  $scope.openMembershipRenewalModal = function (membership) {
    var modalInstance = $uibModal.open({
      templateUrl: 'views/membership/modal-passholder-membership-renew.html',
      controller: 'PassholderMembershipRenewController',
      size: 'sm',
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
      $rootScope.$emit('membershipModified', membership);
    });
  };

  $scope.openMembershipStopModal = function (membership) {
    var modalInstance = $uibModal.open({
      templateUrl: 'views/membership/modal-passholder-membership-stop.html',
      controller: 'PassholderMembershipStopController',
      size: 'sm',
      resolve: {
        membership: function() {
          return membership;
        },
        passholder: function () {
          return legacyPassholder;
        }
      }
    });

    modalInstance.result.then(function (membership) {
      $rootScope.$emit('membershipModified', membership);
    });
  };

  $scope.closeModal = function() {
    $uibModalInstance.dismiss();
  };

  $rootScope.$on('membershipModified', loadMemberships);
}
