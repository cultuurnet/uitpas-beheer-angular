'use strict';

/**
 * @ngdoc service
 * @name ubr.passholder.Coupon
 * @description
 * # Coupon factory
 * Factory in the ubr.coupon module.
 */
angular
  .module('ubr.coupon')
  .factory('Coupon', couponFactory);

/* @ngInject */
function couponFactory(moment, day, PeriodType) {
  /**
   * @class Coupon
   * @constructor
   * @param {object}  jsonCoupon
   */
  var Coupon = function (jsonCoupon) {
    this.parseJson(jsonCoupon);
  };

  Coupon.prototype = {
    parseJson: function (jsonCoupon) {
      this.id = jsonCoupon.id;
      this.name = jsonCoupon.name;
      this.description = jsonCoupon.description;
      this.remainingTotal = jsonCoupon.remainingTotal;
      this.expirationDate = (jsonCoupon.expirationDate ? day(jsonCoupon.expirationDate, 'YYYY-MM-DD').toDate() : null);
    },
    serialize: function () {
      var serializedCoupon = angular.copy(this);

      serializedCoupon.expirationDate = (this.expirationDate ? moment(this.expirationDate).format('YYYY-MM-DD') : null);

      return serializedCoupon;
    },
    getReadablePeriod: function () {
      return this.remainingTotal ? PeriodType[this.remainingTotal.period].remainingSuffix : '';
    }
  };

  return (Coupon);
}
