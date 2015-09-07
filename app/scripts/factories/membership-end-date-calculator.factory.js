'use strict';

/**
 * @ngdoc service
 * @name uitpasbeheerApp.Pass
 * @description
 * # MembershipEndDateCalculator factory
 * Factory in the passbeheerApp.
 */
angular.module('uitpasbeheerApp')
  .factory('MembershipEndDateCalculator', membershipEndDateCalculatorFactory);

/* @ngInject */
function membershipEndDateCalculatorFactory(moment) {
  /**
   * @class MembershipEndDateCalculator
   * @constructor
   * @param {object} association
   */
  var MembershipEndDateCalculator = function (association) {
    this.association = association;
  };

  MembershipEndDateCalculator.prototype = {

    membershipEndDate: function (passholder) {
      var date;

      switch (this.association.enddateCalculation) {
        case 'BASED_ON_DATE_OF_BIRTH':
          date = moment.unix(passholder.dateOfBirth)
            .add(this.association.enddateCalculationValidityTime, 'years')
            .toDate();

          return {
            date: date,
            fixed: true
          };

        case 'BASED_ON_REGISTRATION_DATE':
          date = moment()
            .add(this.association.enddateCalculationValidityTime, 'years')
            .toDate();

          return {
            date: date,
            fixed: true
          };

        case 'FREE':

          if (this.association.enddateCalculationFreeDate) {
            date = moment.unix(this.association.enddateCalculationFreeDate)
              .toDate();
          }

          return {
            date: date,
            fixed: false
          };

        default:
      }
    }
  };

  return (MembershipEndDateCalculator);
}
