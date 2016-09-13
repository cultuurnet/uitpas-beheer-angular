'use strict';

describe('Factory: Coupon', function () {

  beforeEach(module('uitpasbeheerApp'));

  var Coupon, day;

  beforeEach(inject(function (_Coupon_, _day_) {
    Coupon = _Coupon_;
    day = _day_;
  }));


  var jsonCouponBase = {
    'id': '1',
    'name': 'Cultuurbon',
    'description': 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
    'expirationDate': '2015-12-26',
    'remainingTotal': {
      'period': 'QUARTER',
      'volume': 3
    }
  };

  function getJsonCoupon() {
    return angular.copy(jsonCouponBase);
  }

  it('should correctly parse a coupon', function () {
    var coupon = new Coupon(getJsonCoupon());
    var expectedCoupon = {
      id: '1',
      name: 'Cultuurbon',
      description: 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
      remainingTotal: {
        'period': 'QUARTER',
        'volume': 3
      },
      expirationDate: day('2015-12-26', 'YYYY-MM-DD').toDate()
    };

    expect(coupon).toEqual(expectedCoupon);
  });

  it('should include all properties when serializing a coupon as JSON', function () {
    var coupon = new Coupon(getJsonCoupon());
    var expectedCoupon = {
      'id': '1',
      'name': 'Cultuurbon',
      'description': 'Dit aanbod is geldig voor elke pashouder met een Paspartoe aan reductieprijs.',
      'expirationDate': '2015-12-26',
      'remainingTotal': {
        'period': 'QUARTER',
        'volume': 3
      }
    };

    expect(coupon.serialize()).toEqual(expectedCoupon);
  });

  it('should return a readable period when the remaining total is set', function () {
    var coupon = new Coupon(getJsonCoupon());
    var expectedSuffix = 'dit kwartaal';

    expect(coupon.getReadablePeriod()).toEqual(expectedSuffix);
  });
});
