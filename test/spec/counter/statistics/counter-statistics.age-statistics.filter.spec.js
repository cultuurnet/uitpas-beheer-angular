'use strict';

describe('Filter: ageStatisticsFilter', function () {

  beforeEach(module('ubr.counter.statistics'));

  var ageStatisticsFilter;

  beforeEach(inject(function (_ageStatisticsFilter_) {
    ageStatisticsFilter = _ageStatisticsFilter_;
  }));

  it('filters unknow', function () {
    expect(ageStatisticsFilter('unknow')).toEqual('Onbekend');
  });

  it('filters age', function () {
    expect(ageStatisticsFilter(2)).toEqual('2 jaar');
  });

});