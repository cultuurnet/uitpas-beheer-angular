'use strict';

describe('Service: counterStatisticsService', function () {

  var counterStatisticsService, $httpBackend,
    today = new Date('2016-01-01'),
    apiUrl = 'http://example.com/',
    statisticsResponse = {
      'statistics' : []
    };

  // load the service's module
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  beforeEach(function() {
    jasmine.clock().install();
    jasmine.clock().mockDate(today);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  beforeEach(inject(function (_$httpBackend_, _counterService_, _counterStatisticsService_) {
    _counterService_.active = {
      id: 2
    };
    $httpBackend = _$httpBackend_;
    counterStatisticsService = _counterStatisticsService_;
  }));

  it('should return a correct default range', function () {


    var moment = window.moment;
    var now = moment().startOf('month');
    var then = moment().endOf('month');

    var dateRange = counterStatisticsService.getDefaultDateRange();
    expect(dateRange).toEqual({
      from: now,
      to: then
    });
  });

  it('formats a statistics date', function () {
    expect(counterStatisticsService.formatStatisticsDate()).toEqual('01/01/2016');
  });

  it('requests statistics', function() {

    var path = 'path',
      params = [
        {
          from: new Date('2016-01-01'),
          to: new Date('2016-01-10')
        },
        {
          from: new Date('2016-02-01'),
          to: new Date('2016-02-10')
        }
      ];

    $httpBackend
      .expectGET(apiUrl + 'counters/' + path + '?balieId=2&from=01%2F01%2F2016&from2=01%2F02%2F2016&to=10%2F01%2F2016&to2=10%2F02%2F2016').respond(statisticsResponse);


    var deferredResponse = counterStatisticsService.getStatistics(params, path);
    var data;
    deferredResponse.then(function(response){
      data = response;
    });

    $httpBackend.flush();

    expect(data).toEqual(statisticsResponse);

  })
});
