'use strict';

describe('Controller: CounterStatisticsController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var CounterStatisticsController, $state, counterService, $scope, rootScope, $q, $timeout;

  beforeEach(inject(function ($controller, _$state_, $rootScope, _$q_, _$timeout_) {

    $q = _$q_;
    $state = _$state_;
    rootScope = $rootScope;
    $scope = $rootScope.$new();
    $timeout = _$timeout_;

    counterService = jasmine.createSpyObj('counterService', ['getDefaultDateRange', 'getStatistics']);
    CounterStatisticsController = $controller('CounterStatisticsController', {
      counterService: counterService,
      $element: angular.element('<div></div>'),
      $scope: $scope,
      $state : $state
    });
  }));

  it('loads the default date range', function () {

    var dateRange = 'date';
    counterService.getDefaultDateRange.and.returnValue(dateRange);
    var arraySpy = spyOn(CounterStatisticsController.dateRanges, 'push');

    CounterStatisticsController.loadDefaultDateRange();

    expect(arraySpy).toHaveBeenCalledWith('date');


  });

  it('returns a correct date', function () {

    var dateString = "September 9, 2016 11:13:00";
    var expectDate = new Date(dateString);

    var date = CounterStatisticsController.makeDate(dateString);

    expect(expectDate).toEqual(date);
  });

  it('loads the statistics', function() {

    var deferredLoad = $q.defer(),
      getStatisticsPromise = deferredLoad.promise;

    var statistics = {
      periods: ''
    };

    $state.current = {
      'name' : 'counter.statistics'
    }

    var renderGraphCalled = false;
    CounterStatisticsController.renderGraph = function() {
      renderGraphCalled = true;
    }

    counterService.getStatistics.and.returnValue(getStatisticsPromise);
    CounterStatisticsController.loadStatistics();
    deferredLoad.resolve(statistics);

    getStatisticsPromise.finally(function () {

      expect(CounterStatisticsController.titleStr).toEqual('Verkochte kaarten');
      expect(CounterStatisticsController.profileStr).toEqual('Profiel van de koper');
      expect(CounterStatisticsController.typeStr).toEqual('Kopers');
      expect(CounterStatisticsController.statistics).toEqual(statistics);

      setTimeout(function(){
        expect(renderGraphCalled).toBeTruthy();
      }, 0);

      done();
    });

    $scope.$digest();

  });

  it('shows error when failed to load the statistics', function() {

    var deferredLoad = $q.defer(),
      getStatisticsPromise = deferredLoad.promise;

    var statistics = {
      periods: ''
    };

    $state.current = {
      'name' : 'counter.statistics'
    }

    expect(CounterStatisticsController.noStatisticsError).toBeFalsy();

    counterService.getStatistics.and.returnValue(getStatisticsPromise);
    CounterStatisticsController.loadStatistics();
    deferredLoad.reject(statistics);

    getStatisticsPromise.finally(function () {
      expect(CounterStatisticsController.noStatisticsError).toBeTruthy();
      done();
    });

    $scope.$digest();

  });

  it('correctly returns the is comparing value when comparing', function () {
    expect(CounterStatisticsController.isComparing()).toBeFalsy();
  });

  it('correctly returns the is comparing value when comparing', function () {

    var dateRange = {
      from: '2016-09-09',
      to: '2016-09-10'
    }
    CounterStatisticsController.comparing = true;
    CounterStatisticsController.dateRanges.push(dateRange);
    expect(CounterStatisticsController.isComparing()).toBeTruthy();

  });

  it('correctly indicates that comparing data is available', function () {

    CounterStatisticsController.statistics = {
      profiles2 : true
    }

    expect(CounterStatisticsController.hasCompareData()).toBeTruthy();
  });

  it('correctly indicates that comparing data is not available', function () {
    expect(CounterStatisticsController.hasCompareData()).toBeFalsy();
  });

  it('reloads at state change', function () {

    var spy = spyOn(CounterStatisticsController, 'loadStatistics');
    rootScope.$broadcast('$stateChangeSuccess');
    expect(spy).toHaveBeenCalled();

  });
});