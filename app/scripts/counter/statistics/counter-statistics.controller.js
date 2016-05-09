'use strict';

/**
 * @ngdoc function
 * @name ubr.counter.statistics.controller:CounterStatisticsController
 * @description
 * # CounterStatisticsController
 * Controller of the ubr counter statistics module.
 */
angular
  .module('ubr.counter.statistics')
  .controller('CounterStatisticsController', CounterStatisticsController);

/* @ngInject */
function CounterStatisticsController(counterService, $element, $state, $scope) {
  /*jshint validthis: true */
  var controller = this,
      info = {
    'counter.statistics': {
      path: 'cardsales',
      title: 'Verkochte kaarten',
      type: 'Kopers',
      profile: 'Profiel van de koper'
    },
    'counter.statistics.savings': {
      path: 'checkins',
      title: 'Gespaarde punten',
      type: 'Actieve spaarders',
      profile: 'Profiel van de actieve spaarder'
    },
    'counter.statistics.exchange': {
      path: 'exchanges',
      title: 'Omgeruilde voordelen',
      type: 'Omgeruilde voordelen',
      profile: 'Profiel van de actieve ruiler'
    },
    'counter.statistics.mia': {
      path: 'mias',
      title: 'Actieve MIA\'s',
      type: 'Actieve MIA\'s',
      profile: 'Profiel van MIA\'s'
    }
  };

  controller.loadingStatistics = true;
  controller.statistics = {};
  controller.noStatisticsError = false;
  controller.dateRanges = [];
  controller.formattedDates = [];
  controller.pickingDate = false;
  controller.comparing = false;
  controller.titleStr = '';
  controller.profileStr = '';

  controller.loadDefaultDateRange = function() {
    var dateRange = counterService.getDefaultDateRange();
    controller.dateRanges.push(dateRange);
  };

  controller.makeDate = function (dateStr) {
    return new Date(dateStr);
  };

  controller.updateDates = function ($event) {
    var $el = angular.element($event.target),
        $wrap = $el.closest('.period'),
        $rows = $wrap.children('.row'),
        $row = $rows.eq(0),
        $inputs = $row.find('input'),
        $row2, $inputs2, val1, val2;
    controller.dateRanges[0].from = moment($inputs.eq(0).val(), 'DD/MM/YYYY');
    controller.dateRanges[0].to = moment($inputs.eq(1).val(), 'DD/MM/YYYY');
    if (controller.comparing) {
      controller.dateRanges[1] = controller.dateRanges[1] || {};
      $row2 = $rows.eq(1);
      $inputs2 = $row2.find('input[type="text"]');
      val1 = $inputs2.eq(0).val();
      val2 = $inputs2.eq(1).val();
      if (val1 && val2) {
        controller.dateRanges[1].from = moment(val1, 'DD/MM/YYYY');
        controller.dateRanges[1].to = moment(val2, 'DD/MM/YYYY');
      }
      else {
        controller.comparing = false;
      }
    }
    controller.pickingDate = false;
  };

  controller.resetDates = function ($event) {
    var $el = angular.element($event.target),
        $wrap = $el.closest('.period'),
        $rows = $wrap.children('.row'),
        $row = $rows.eq(0),
        $inputs = $row.find('input'),
        $row2, $inputs2;
    $inputs.eq(0).val(controller.dateRanges[0].from.format('DD/MM/YYYY'));
    $inputs.eq(1).val(controller.dateRanges[0].to.format('DD/MM/YYYY'));
    if (controller.dateRanges[1] && controller.dateRanges[1].from && controller.dateRanges[1].to) {
      $row2 = $rows.eq(1);
      $inputs2 = $row2.find('input[type="text"]');
      $inputs2.eq(0).val(controller.dateRanges[1].from.format('DD/MM/YYYY'));
      $inputs2.eq(1).val(controller.dateRanges[1].to.format('DD/MM/YYYY'));
    }
    this.updateDates($event);
  };

  // Checker for the date picker popout.
  controller.showCompare = function () {
    return controller.comparing &&
           controller.dateRanges[1] &&
           controller.dateRanges[1].from &&
           controller.dateRanges[1].to;
  };

  // Checker for compare table.
  controller.compareTable = function() {
    return !!(controller.statistics && controller.statistics.profiles2);
  };

  controller.loadStatistics = function () {
    var showStatistics = function (statistics) {
      controller.statistics = statistics;
      controller.loadingStatistics = false;
      controller.noStatisticsError = false;
      controller.titleStr = info[$state.current.name].title;
      controller.profileStr = info[$state.current.name].profile;
      // Using settimeout to avoid waiting an extra cycle.
      setTimeout(function(){
        controller.renderGraph();
      }, 0);
    };

    var noStatisticsFound = function () {
      controller.loadingStatistics = false;
      controller.noStatisticsError = true;
    };

    controller.loadingStatistics = true;
    counterService
      .getStatistics(controller.dateRanges, info[$state.current.name].path)
      .then(showStatistics, noStatisticsFound);
  };

  controller.addDatePicker = function () {
    // Using setTimeout instead of $timeout to save a cycle.
    setTimeout(function() {
      // Coupled to DOM :(
      var $wrap = $element.find('.period'),
          $rows = $wrap.find('.row'),
          $row1 = $rows.eq(0),
          $row2 = $rows.eq(1),
          $inputs = $row1.find('input[type="text"]'),
          $inputs2 = $row2.find('input[type="text"]'),
          defOpts = {format: 'DD/MM/YYYY'},
          jQuery = window.jQuery,
          def3 = new Date(),
          def4 = new Date();
      // If we have a second range, use that as default.
      if (controller.dateRanges[1]) {
        if (controller.dateRanges[1].from) {
          def3 = controller.dateRanges[1].from._d;
        }
        if (controller.dateRanges[1].to) {
          def4 = controller.dateRanges[1].to._d;
        }
      }
      // Attach datetimepickers
      $inputs.eq(0).datetimepicker(jQuery.extend(defOpts, {defaultDate: controller.dateRanges[0].from._d}));
      $inputs.eq(1).datetimepicker(jQuery.extend(defOpts, {defaultDate: controller.dateRanges[0].to._d}));
      $inputs2.eq(0).datetimepicker(jQuery.extend(defOpts, {defaultDate: def3}));
      $inputs2.eq(1).datetimepicker(jQuery.extend(defOpts, {defaultDate: def4}));
    }, 0);
  };

  // Helper function for drawing the actual graph.
  controller.renderGraph = function () {
    // Grab placeholder.
    var $graphWrap = $element.find('.counter-statistics-graph'),
        // The data to be used.
        stats = this.statistics,
        // Global d3 reference.
        d3 = window.d3,
        format = d3.time.format('%d-%m-%Y'),
        // Hardcoded margin.
        margin = 40,
        // Grab width - margins.
        width = $graphWrap.width() - (margin * 2),
        height = 250,
        // Scaling functions.
        xScale = d3.time.scale().range([0, width]),
        yScale = d3.scale.linear().range([height, 0]),
        // Axis handlers.
        xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(5).tickFormat(d3.time.format('%d/%m')),
        yAxis = d3.svg.axis().scale(yScale).orient('left').ticks(3),
        compare = this.compareTable(),
        line,
        line2,
        area,
        graph;

    if (compare) {
      xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(5).tickFormat('');
      line2 = d3.svg.line()
              .x(function (d) { return xScale(format.parse(d.date)); })
              .y(function (d) { return yScale(parseInt(d.count2, 10)); });
    }

    // Make sure it's cleared.
    $graphWrap.empty();
    // Line handler.
    line = d3.svg.line()
          .x(function(d) { return xScale(format.parse(d.date)); })
          .y(function(d) { return yScale(parseInt(d.count, 10)); });
    // Area handler.
    area = d3.svg.area()
          .x(function(d) { return xScale(format.parse(d.date)); })
          .y0(height)
          .y1(function(d) { return yScale(d.count); });
    // Group to add the margins.
    graph = d3.select($graphWrap[0]).append('svg')
      .attr('width', width + (margin * 2))
      .attr('height', height + (margin * 2))
      .append('g')
      .attr('transform', 'translate(' + margin + ', ' + margin + ')');
    // Set total size.
    xScale.domain(d3.extent(stats.periods, function (d) { return format.parse(d.date); }));
    // Same for Y dimension.
    yScale.domain([0, d3.max(stats.periods, function (d) {
        var max;
        // TODO: handler comparison graphs.
        if (compare) {
          max = Math.max(parseInt(d.count, 10), parseInt(d.count2, 10));
        }
        else {
          max = parseInt(d.count, 10);
        }
        return max;
      })]);

    // Make an area path per period.
    graph.append('path')
        .datum(stats.periods)
        .attr('class', 'area')
        .attr('d', area);
    // Make a line path per period.
    graph.append('path')
        .datum(stats.periods)
        .attr('class', 'line')
        .attr('d', line);
    if (compare) {
      // Make a line path per period.
      graph.append('path')
          .datum(stats.periods)
          .attr('class', 'line line-2')
          .attr('d', line2);
    }
    // Add the X Axis.
    graph.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
    // Add the Y Axis.
    graph.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
    // Add a circle per data point.
    graph.selectAll('dot')
        .data(stats.periods)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('cx', function(d) {
          return xScale(format.parse(d.date));
        })
        .attr('cy', function(d) {
          return yScale(parseInt(d.count, 10));
        });
    if (compare) {
      // Add a circle per data point.
      graph.selectAll('dot-2')
          .data(stats.periods)
          .enter()
          .append('circle')
          .attr('class', 'dot dot-2')
          .attr('r', 5)
          .attr('cx', function(d) {
            return xScale(format.parse(d.date));
          })
          .attr('cy', function(d) {
            return yScale(parseInt(d.count2, 10));
          });
    }
  };

  controller.loadDefaultDateRange();
  $scope.$on('$stateChangeSuccess', function() {
    controller.loadStatistics();
  });
}