/**
 * Created by stijnswaanen on 29/10/15.
 */

'use strict';

describe('Filter: phoneNumberFilter', function () {

  // load the controller's module
  beforeEach(module('ubr.passholder'));
  beforeEach(module('uitpasbeheerApp'));

  describe('phoneNumberFilter', function() {

    it('should convert a valid phone number into a formatted phone number format',
      inject(function(phoneNumberFilter) {
        expect(phoneNumberFilter('0930000800118')).toBe('0930000800118');
        expect(phoneNumberFilter('0479234567')).toBe('0479 23 45 67');
        expect(phoneNumberFilter('+32479234567')).toBe('0479 23 45 67');
        expect(phoneNumberFilter('014928404')).toBe('014 92 84 04');
        expect(phoneNumberFilter('+3214928404')).toBe('014 92 84 04');
      }));
  });
});