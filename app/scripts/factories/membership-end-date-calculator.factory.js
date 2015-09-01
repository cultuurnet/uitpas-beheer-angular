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
      switch (this.association.enddateCalculation) {
        case 'BASED_ON_DATE_OF_BIRTH':
          var date = moment.unix(passholder.dateOfBirth)
            .add(this.association.enddateCalculationValidityTime, 'years')
            .toDate();

          return {
            date: date,
            fixed: true
          };
          break;

        case 'BASED_ON_REGISTRATION_DATE':
          var date = moment()
            .add(this.association.enddateCalculationValidityTime, 'years')
            .toDate();

          return {
            date: date,
            fixed: true
          }
          break;

        case 'FREE':

          var date;

          if (this.association.enddateCalculationFreeDate) {
            date = moment.unix(this.association.enddateCalculationFreeDate)
              .toDate();
          }

          return {
            date: date,
            fixed: false
          }
          break;

        default:
      }
    }
  };

  return (MembershipEndDateCalculator);
}
