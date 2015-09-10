'use strict';

describe('Factory: day', function () {

  beforeEach(module('uitpasbeheerApp'));

  it('should convert an ISO 8601 date with only day info to a moment objcet', inject(function (day) {
    var ISOdayString = '1977-02-05';

    var parsedDay = day(ISOdayString);
    expect(parsedDay.isValid()).toBeTruthy();
    expect(parsedDay.year()).toEqual(1977);
    expect(parsedDay.month()).toEqual(1);
    expect(parsedDay.date()).toEqual(5);
  }));

  describe('when converting a D/M/YYYY date string', function () {
    it('should return a moment object when there are no leading zeros', inject(function (day) {
      var dateString = '5/2/1977';

      var parsedDay = day(dateString, 'D/M/YYYY');
      expect(parsedDay.isValid()).toBeTruthy();
      expect(parsedDay.year()).toEqual(1977);
      expect(parsedDay.month()).toEqual(1);
      expect(parsedDay.date()).toEqual(5);
    }));

    it('should return a moment object when there are leading zeros', inject(function (day) {
      var dateString = '05/02/1977';

      var parsedDay = day(dateString, 'D/M/YYYY');
      expect(parsedDay.isValid()).toBeTruthy();
      expect(parsedDay.year()).toEqual(1977);
      expect(parsedDay.month()).toEqual(1);
      expect(parsedDay.date()).toEqual(5);
    }));

    it('should return an invalid date object when months are exceeded', inject(function (day) {
      var dateString = '05/13/1977';

      var parsedDay = day(dateString, 'D/M/YYYY');
      expect(parsedDay.isValid()).toBeFalsy();
    }));

    it('should return an invalid date object when days are exceeded', inject(function (day) {
      var dateString = '32/02/1977';

      var parsedDay = day(dateString, 'D/M/YYYY');
      expect(parsedDay.isValid()).toBeFalsy();
    }));
  });
});
