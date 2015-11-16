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
    var jsonCoupon = getJsonCoupon();

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

    var coupon = new Coupon(jsonCoupon);

    expect(coupon).toEqual(expectedCoupon);
  });

  it('can serialize to json', function () {
    var jsonCoupon = getJsonCoupon();
    var coupon = new Coupon(jsonCoupon);

    expect(coupon.serialize()).toEqual(jsonCoupon);
  });

  it('can the remaining period suffix text', function () {
    var jsonCoupon = getJsonCoupon();

    var expectedSuffix = ' dit kwartaal';

    var coupon = new Coupon(jsonCoupon);

    expect(coupon.getRemainingTotalPeriodTypeSuffix()).toEqual(expectedSuffix);
  });
});
