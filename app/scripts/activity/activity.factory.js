'use strict';

/**
 * @ngdoc service
 * @name ubr.activity.Activity
 * @description
 * # Activity factory
 * Factory in the ubr.activity module.
 */
angular
  .module('ubr.activity')
  .factory('Activity', activityFactory);

/* @ngInject */
function activityFactory(CheckinState) {
  /**
   * @class Activity
   * @constructor
   * @param {object}  jsonActivity
   */
  var Activity = function (jsonActivity) {
    this.parseJson(jsonActivity);
  };

  function parseJsonCheckinConstraint (jsonConstraint) {
    return {
      allowed: jsonConstraint.allowed,
      endDate: new Date(jsonConstraint.endDate),
      reason: jsonConstraint.reason,
      startDate: new Date(jsonConstraint.startDate)
    };
  }

  function parseJsonSales (jsonSales) {
    return {
      differentiation: jsonSales.differentiation,
      maximumReached: jsonSales.maximumReached,
      base: jsonSales.base,
      tariffs: parseJsonSalesTariffs(jsonSales.tariffs)
    };
  }

  function parseJsonSalesTariffs (jsonSalesTariffs) {
    return {
      kansentariefAvailable: jsonSalesTariffs.kansentariefAvailable,
      couponAvailable: jsonSalesTariffs.couponAvailable,
      lowestAvailable: jsonSalesTariffs.lowestAvailable,
      list: parseJsonSalesTariffsList(jsonSalesTariffs.list)
    };
  }

  function parseJsonSalesTariffsList (jsonSalesTariffsList) {
    var list = [];
    angular.forEach(jsonSalesTariffsList, function(listItem) {
      var newListItem = {
        name: listItem.name,
        type: listItem.type,
        maximumReached: listItem.maximumReached,
        prices: []
      };

      if (!angular.isUndefined(listItem.id)) {
        newListItem.id = listItem.id;
      }

      for(var priceClass in listItem.prices) {
        var priceInfo = {
          type: listItem.type,
          price: listItem.prices[priceClass],
          priceClass: priceClass,
        };
        if (listItem.id) {
          priceInfo.couponId = listItem.id;
        }
        newListItem.prices.push(priceInfo);
      }

      list.push(newListItem);
    });
    return list;
  }

  Activity.prototype = {
    parseJson: function (jsonActivity) {
      this.id = jsonActivity.id;
      this.description = jsonActivity.description;
      this.title = jsonActivity.title;
      this.when = jsonActivity.when;
      this.points = jsonActivity.points || 0;
      this.free = jsonActivity.free;
      this.checkinConstraint = parseJsonCheckinConstraint(jsonActivity.checkinConstraint);
      if (!angular.isUndefined(jsonActivity.sales)) {
        this.sales = parseJsonSales(jsonActivity.sales);
      }
    },
    getCheckinState: function () {
      var state;

      if (this.checkinConstraint.allowed) {
        state = CheckinState.AVAILABLE;
      }

      if (this.checkinConstraint.reason === 'MAXIMUM_REACHED') {
        state = CheckinState.ALREADY_CHECKED_IN;
      }

      if (this.checkinConstraint.reason === 'INVALID_DATE_TIME') {
        var now = new Date();
        if (this.checkinConstraint.endDate < now) {
          state = CheckinState.EXPIRED;
        }
        if (this.checkinConstraint.startDate > now) {
          state = CheckinState.NOT_YET_AVAILABLE;
        }
      }

      return state;
    },
    /**
     * Get the most suitable tariff based on the sales info of the activity.
     *
     * @return {string}
     */
    getTariff: function () {
      var tariff = null,
          activity = this;

      if (activity.free) {
        tariff = 'free';
      }
      else if (activity.sales && activity.sales.maximumReached) {
        tariff = 'maximumReached';
      }
      else if (activity.sales && activity.sales.differentiation) {
        tariff = 'priceDifferentiation';
      }
      else if (activity.sales && activity.sales.tariffs && activity.sales.tariffs.kansentariefAvailable) {
        tariff = 'kansenTariff';
      }
      else if (activity.sales && activity.sales.tariffs && activity.sales.tariffs.couponAvailable) {
        tariff = 'coupon';
      }

      return tariff;
    },
    getRedeemableCoupons: function () {
      var tariffs = this.sales.tariffs.list;

      var isRedeemableCoupon = function (tariff) {
        return tariff.type === 'COUPON' && !tariff.maximumReached;
      };

      var coupons = tariffs.filter(isRedeemableCoupon, tariffs);

      return coupons;
    }
  };


  return (Activity);
}
