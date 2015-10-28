/**
 * Created by stijnswaanen on 28/10/15.
 */
'use strict';

describe('Filter: passNumberFilter', function () {

  // load the controller's module
  beforeEach(module('ubr.passholder'));
  beforeEach(module('uitpasbeheerApp'));

  describe('passNumberFilter', function() {

    it('should convert a string into a formatted passnumber format',
      inject(function(passNumberFilter) {
        expect(passNumberFilter('0930000800118')).toBe('09300 00800 118');
      }));
  });
});