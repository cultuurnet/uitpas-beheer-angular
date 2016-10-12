'use strict';

describe('Controller: CounterStatisticsController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var CounterStatisticsController, $state, counterStatisticsService, $scope, rootScope, $q;
  var dateRange = {
    from: '2016-09-09',
    to: '2016-09-10'
  }

  beforeEach(inject(function ($controller, _$state_, $rootScope, _$q_) {

    $q = _$q_;
    $state = _$state_;
    rootScope = $rootScope;
    $scope = $rootScope.$new();

    counterStatisticsService = jasmine.createSpyObj('counterStatisticsService', ['getDefaultDateRange', 'getStatistics']);
    counterStatisticsService.getDefaultDateRange.and.returnValue(dateRange);

    CounterStatisticsController = $controller('CounterStatisticsController', {
      counterStatisticsService: counterStatisticsService,
      $scope: $scope,
      $state : $state
    });
  }));

  beforeEach(function() {
    $(document.body).append('<div class="counter-statistics-graph" style="width: 800px;"></div>');
    jasmine.clock().install();
  })

  afterEach(function() {
    d3.selectAll('svg').remove();
    jasmine.clock().uninstall();
  });

  /**
   * Flush all transitions.
   */
  function flushTransitions() {
    var now = Date.now;
    Date.now = function() { return Infinity; };
    d3.timer.flush();
    Date.now = now;
  }

  it('loads the default date range', function () {
    expect(CounterStatisticsController.dateRange).toEqual(dateRange);
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

    counterStatisticsService.getStatistics.and.returnValue(getStatisticsPromise);
    CounterStatisticsController.loadStatistics();
    deferredLoad.resolve(statistics);

    getStatisticsPromise.finally(function () {

      expect(CounterStatisticsController.titleStr).toEqual('Verkochte kaarten');
      expect(CounterStatisticsController.profileStr).toEqual('Profiel van de koper');
      expect(CounterStatisticsController.typeStr.buyers.label).toEqual('Kopers');
      expect(CounterStatisticsController.statistics).toEqual(statistics);

      setTimeout(function(){
        expect(renderGraphCalled).toBeTruthy();
      }, 0);

      done();
    });

    $scope.$digest();
  });

  it('loads 2 default dates if comparing', function() {
    var statistics = {
      periods: ''
    };

    $state.current = {
      'name' : 'counter.statistics'
    }

    var deferredLoad = $q.defer(),
      getStatisticsPromise = deferredLoad.promise;

    counterStatisticsService.getStatistics.and.returnValue(getStatisticsPromise);

    CounterStatisticsController.comparing = true;
    var dateRanges = [];
    dateRanges.push(dateRange);
    dateRanges.push(dateRange);

    CounterStatisticsController.loadStatistics();

    expect(counterStatisticsService.getStatistics).toHaveBeenCalledWith(dateRanges, 'cardsales');
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

    counterStatisticsService.getStatistics.and.returnValue(getStatisticsPromise);
    CounterStatisticsController.loadStatistics();
    deferredLoad.reject(statistics);

    getStatisticsPromise.finally(function () {
      expect(CounterStatisticsController.noStatisticsError).toBeTruthy();
      done();
    });

    $scope.$digest();
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

  it('correctly updates the dates', function () {

    CounterStatisticsController.dateRange = 'new date range';
    CounterStatisticsController.compareDateRange = 'new compare date range';

    spyOn(CounterStatisticsController, 'loadStatistics').and.returnValue(true);

    CounterStatisticsController.updateDates();

    expect(CounterStatisticsController.selectedDateRange).toEqual(CounterStatisticsController.dateRange);
    expect(CounterStatisticsController.selectedCompareDateRange).toEqual(CounterStatisticsController.compareDateRange);

  });

  it('correctly resets the dates', function () {

    CounterStatisticsController.selectedDateRange = 'old date range';
    CounterStatisticsController.selectedCompareDateRange = 'old compare date range';

    CounterStatisticsController.dateRange = 'new date range';
    CounterStatisticsController.compareDateRange = 'new compare date range';

    spyOn(CounterStatisticsController, 'loadStatistics').and.returnValue(true);

    CounterStatisticsController.resetDates();

    expect(CounterStatisticsController.selectedDateRange).toEqual(CounterStatisticsController.dateRange);
    expect(CounterStatisticsController.selectedCompareDateRange).toEqual(CounterStatisticsController.compareDateRange);

  });

  it('renders graph in correct size', function () {
    CounterStatisticsController.statistics = {
      "periods": [

        {
          "date": "01-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        },
        {
          "date": "02-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        }
      ]
    };

    CounterStatisticsController.renderGraph();

    var $svg = angular.element(document).find('svg');
    var $g = $svg.find('g');

    expect($svg.width()).toEqual(800);
    expect(angular.element($g[0]).attr('transform')).toEqual('translate(40, 40)');

    expect(angular.element($g[0].querySelectorAll('.x')).attr('transform')).toEqual('translate(0, 250)');
    expect($g[0].querySelectorAll('.y').length).toEqual(1);
  });

  it('correctly renders the required dots', function () {
    CounterStatisticsController.statistics = {
      "periods": [

        {
          "date": "01-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        },
        {
          "date": "02-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        }
      ]
    };

    CounterStatisticsController.renderGraph();

    expect(d3.selectAll('circle').size()).toEqual(2);
    expect(d3.selectAll('path').size()).toEqual(4);
  });

  it('correctly renders the required dots when comparing', function () {
    CounterStatisticsController.statistics = {
      "periods": [

        {
          "date": "01-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        },
        {
          "date": "02-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        }
      ],
      "profiles2": []
    };

    CounterStatisticsController.renderGraph();

    expect(d3.selectAll('circle').size()).toEqual(4);
    expect(d3.selectAll('path').size()).toEqual(5);
  });

  it('correctly hides tooltips on mouseout', function () {
    $state.current = {
      'name' : 'counter.statistics'
    }

    var spy = spyOn(CounterStatisticsController, 'hideTooltip');
    CounterStatisticsController.statistics = {
      "periods": [

        {
          "date": "01-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        },
        {
          "date": "02-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        }
      ]
    };

    CounterStatisticsController.renderGraph();

    var $dots = d3.selectAll('circle');
    var event = document.createEvent('SVGEvents');
    event.initEvent('mouseout',true,true);
    $dots[0][0].dispatchEvent(event);

    expect(spy).toHaveBeenCalled();
  });

  /**
   * Test the given event.
   */
  function testMouseEvent(controllerMethod, event, selector) {
    $state.current = {
      'name' : 'counter.statistics'
    }

    var spy = spyOn(CounterStatisticsController, controllerMethod);

    CounterStatisticsController.renderGraph();

    var $dots = d3.selectAll(selector);
    var domEvent = document.createEvent('SVGEvents');
    domEvent.initEvent(event, true, true);
    $dots[0][0].dispatchEvent(domEvent);

    expect(spy).toHaveBeenCalled();
  }

  it('correctly shows tooltips on mouseover', function () {
    CounterStatisticsController.statistics = {
      "periods": [

        {
          "date": "01-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        },
        {
          "date": "02-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        }
      ]
    };

    testMouseEvent('showTooltip', 'mouseover', 'circle');
  });

  it('correctly shows tooltips on mouseover for compare data', function () {
    CounterStatisticsController.statistics = {
      "periods": [

        {
          "date": "01-07-2016",
          "count": 0,
          "date2": "01-07-2016",
          "count2": 0
        },
        {
          "date": "02-07-2016",
          "count": 0,
          "date2": "02-07-2016",
          "count2": 0
        }
      ],
      "profiles2": []
    };

    testMouseEvent('showTooltip', 'mouseover', '.dot-2');
  });

  it('correctly hides tooltips on mouseover', function () {
    CounterStatisticsController.statistics = {
      "periods": [

        {
          "date": "01-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        },
        {
          "date": "02-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        }
      ]
    };

    testMouseEvent('hideTooltip', 'mouseout', 'circle');
  });

  it('correctly hides tooltips on mouseover for compare data', function () {
    CounterStatisticsController.statistics = {
      "periods": [

        {
          "date": "01-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        },
        {
          "date": "02-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        }
      ],
      "profiles2": []
    };

    testMouseEvent('hideTooltip', 'mouseout', '.dot-2');
  });

  it('correctly shows tooltips', function () {
    var event = {
      'pageX': 10,
      'pageY': 10,
    }

    CounterStatisticsController.tooltip = d3.select(".counter-statistics-graph").append("div").attr("class", "graph-tooltip").style("opacity", 0);
    CounterStatisticsController.showTooltip(event, 'my tekst');

    expect(CounterStatisticsController.tooltip.html()).toEqual('my tekst');

    flushTransitions();

    expect(CounterStatisticsController.tooltip.style('opacity')).toEqual('1');

    CounterStatisticsController.helpTexts.average = 'test tekst';
    CounterStatisticsController.showHelpTooltip(event, 'average');
    expect(CounterStatisticsController.tooltip.html()).toEqual('test tekst');

  });

  it('correctly hides the tooltip', function () {
    CounterStatisticsController.tooltip = d3.select(".counter-statistics-graph").append("div").attr("class", "graph-tooltip").style("opacity", 1);
    CounterStatisticsController.hideTooltip();

    flushTransitions();

    expect(CounterStatisticsController.tooltip.style('opacity')).toEqual('0');
  });

  it('reloads at state change', function () {
    var spy = spyOn(CounterStatisticsController, 'loadStatistics');
    rootScope.$broadcast('$stateChangeSuccess');
    expect(spy).toHaveBeenCalled();
  });

  it('re-renders after resize', function () {
    $state.current = {
      'name' : 'counter.statistics'
    }

    CounterStatisticsController.statistics = {
      "periods": [

        {
          "date": "01-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        },
        {
          "date": "02-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        }
      ]
    };

    CounterStatisticsController.renderGraph();

    var spy = spyOn(CounterStatisticsController, 'renderGraph');
    var event = document.createEvent('Event');
    event.initEvent('resize', true, true);
    window.dispatchEvent(event);

    expect(spy).toHaveBeenCalled();
  });

  it('has fixed width if wrapper is to small', function () {
    $state.current = {
      'name' : 'counter.statistics'
    }

    CounterStatisticsController.statistics = {
      "periods": [

        {
          "date": "01-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        },
        {
          "date": "02-07-2016",
          "count": 0,
          "date2": null,
          "count2": 0
        }
      ]
    };

    d3.select('.counter-statistics-graph').attr('style', "width: 300px");
    CounterStatisticsController.renderGraph();

    var $svg = angular.element(document).find('svg');

    expect($svg.width()).toEqual(600);
  });

});