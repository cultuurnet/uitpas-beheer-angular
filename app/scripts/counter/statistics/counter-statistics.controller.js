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
function CounterStatisticsController(counterStatisticsService, $state, $scope) {
  /*jshint validthis: true */
  var controller = this,
      info = {
    'counter.statistics': {
      pageTitle: 'Verkoop',
      path: 'cardsales',
      title: 'Verkochte kaarten',
      plural_label: 'verkochte kaarten',
      single_label: 'verkochte kaart',
      type: 'Kopers',
      profile: 'Profiel van de koper',
      template: 'views/counter-statistics/statistics-sales.html'
    },
    'counter.statistics.savings': {
      pageTitle: 'Sparen',
      path: 'checkins',
      title: 'Gespaarde punten',
      plural_label: 'gespaarde punten',
      single_label: 'gespaard punt',
      type: {
        saved: 'Gespaarde punten',
        active: 'Actieve spaarders',
        new: 'Nieuwe spaarders'
      },
      profile: 'Profiel van de actieve spaarder',
      template: 'views/counter-statistics/statistics-savings.html'
    },
    'counter.statistics.exchange': {
      pageTitle: 'Ruilen',
      path: 'exchanges',
      title: 'Omgeruilde voordelen',
      plural_label: 'omgeruilde voordelen',
      single_label: 'omgeruild voordeel',
      type: {
        active: 'Actieve ruilers',
        new: 'Nieuwe ruilers',
        transactions: 'Omgeruilde voordelen'
      },
      profile: 'Profiel van de actieve ruiler',
      template: 'views/counter-statistics/statistics-exchanges.html'
    },
    'counter.statistics.mia': {
      pageTitle: 'MIA\'s',
      path: 'mias',
      title: 'Actieve MIA\'s',
      plural_label: 'actieve MIA\'s',
      single_label: 'actieve MIA',
      type: {
        active: 'Actieve MIA\'s',
        saving: 'Sparende MIA\'s',
        exchanging: 'Ruilende MIA\'s'
      },
      profile: 'Profiel van MIA\'s',
      template: 'views/counter-statistics/statistics-mias.html'
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
  controller.typeTemplate = '';

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
        func.apply(context, args);
      }, wait);
    };
  }

  controller.loadDefaultDateRange = function() {
    var dateRange = counterStatisticsService.getDefaultDateRange(),
        dateRange2 = counterStatisticsService.getDefaultDateRange(),
        rangeObj = {from: moment(dateRange.from), to: moment(dateRange.to)};
    controller.dateRanges.push(rangeObj, dateRange2);
    controller.formatDates();
  };

  // Update handler for the first range field.
  controller.updateFirstRange = function () {
    var val = controller.formattedDates[0].split(' - ');

    controller.dateRanges[0].from = moment(val[0], 'DD/MM/YYYY');
    controller.dateRanges[0].to = moment(val[1], 'DD/MM/YYYY');
    controller.pickingDate = false;
    controller.loadStatistics();
    controller.updateCompareWithRange();
  };

  // Update handler for the second field.
  controller.updateSecondRange = function () {
    var val = controller.formattedDates[1].split(' - ');
    if (val && val.length) {
      controller.dateRanges[1].from = moment(val[0], 'DD/MM/YYYY');
      controller.dateRanges[1].to = moment(val[1], 'DD/MM/YYYY');
    }
    else {
      controller.comparing = false;
    }

    controller.pickingDate = false;
    controller.loadStatistics();
  };

  // Updates the ranges and value on the second field.
  /* istanbul ignore next */
  controller.updateCompareWithRange = function () {
    var range = controller.dateRanges[0],
        from = range.from,
        to = range.to,
        diff = moment.duration(to.diff(from)).asDays() || 1,
        opts = window.jQuery.extend(controller.defOpts, {}),
        prev = [moment(from).subtract(diff, 'days'), moment(to).subtract(diff, 'days')];
    opts.ranges = {
      'Vorige periode': prev,
      'Vorig jaar': [moment(from).subtract(1, 'year'), moment(to).subtract(1, 'year')]
    };
    opts.startDate = prev[0];
    opts.endDate = prev[1];
    controller.dateRanges[1].from = prev[0];
    controller.dateRanges[1].to = prev[1];
    if (controller.$input2) {
      controller.$input2.daterangepicker(opts, controller.secondRangeChangeHandler);
    }
    controller.formatDates();
  };

  // Handler fox fixing custom date range in second field.
  controller.secondRangeChangeHandler = function (start) {
    var range = controller.dateRanges[0],
        from = range.from,
        to = range.to,
        diff = moment.duration(to.diff(from)).asDays() || 1;
    this.endDate = moment(start).add(diff, 'days');
  };

  // Store formatted date ranges.
  controller.formatDates = function() {
    controller.formattedDates = [
      controller.dateRanges[0].from.format('DD/MM/YYYY') + ' - ' + controller.dateRanges[0].to.format('DD/MM/YYYY'),
      controller.dateRanges[1].from.format('DD/MM/YYYY') + ' - ' + controller.dateRanges[1].to.format('DD/MM/YYYY')
    ];
  };

  // Is the user comparing.
  controller.isComparing = function () {
    return controller.comparing &&
           controller.dateRanges[1] &&
           controller.dateRanges[1].from &&
           controller.dateRanges[1].to;
  };

  // Does the controller has comparing data.
  controller.hasCompareData = function() {
    return !!(controller.statistics && controller.statistics.profiles2);
  };

  // Load statistics, debounced cause both inputs trigger this onload.
  controller.loadStatistics = function () {
    var currentRanges = [];
    var showStatistics = function (statistics) {
      controller.statistics = statistics;
      controller.loadingStatistics = false;
      controller.noStatisticsError = false;
      controller.titleStr = info[$state.current.name].title;
      controller.profileStr = info[$state.current.name].profile;
      controller.typeStr = info[$state.current.name].type;
      controller.pageTitle = info[$state.current.name].pageTitle;
      controller.typeTemplate = info[$state.current.name].template
      controller.which = $state.current.name.split('.');
      controller.which = controller.which[controller.which.length - 1];
      // Using settimeout to avoid waiting an extra cycle.
      setTimeout(function(){
        controller.renderGraph(controller.statistics);
      }, 0);
    };

    var noStatisticsFound = function () {
      controller.loadingStatistics = false;
      controller.noStatisticsError = true;
    };

    currentRanges.push(controller.dateRanges[0]);

    if (controller.isComparing()) {
      currentRanges.push(controller.dateRanges[1]);
    }

    controller.loadingStatistics = true;
    counterStatisticsService
      .getStatistics(currentRanges, info[$state.current.name].path)
      .then(showStatistics, noStatisticsFound);
  };

  /* istanbul ignore next */
  controller.addDatePicker = function () {
    // Using setTimeout instead of $timeout to save a cycle.
    setTimeout(function() {
      // Coupled to DOM :(
      var $wrap = angular.element(document.querySelectorAll('.period-chooser')),
          $row = $wrap.find('.row'),
          $inputs = $row.find('input[type="text"]'),
          $input1 = $inputs.eq(0),
          $input2 = $inputs.eq(1),
          jQuery = window.jQuery,
          def3 = new Date(),
          def4 = new Date(),
          defOpts;
      controller.ranges = {
        'Gisteren': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Afgelopen week': [moment().startOf('week'), moment().endOf('week')],
        'Lopende maand': [moment().startOf('month'), moment().endOf('month')],
        'Afgelopen complete maand': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
        'Afgelopen 7 dagen': [moment().subtract(8, 'days'), moment().subtract(1, 'day')],
        'Afgelopen 30 dagen': [moment().subtract(31, 'days'), moment().subtract(1, 'day')]
      };
      defOpts = {
        locale: {
          format: 'DD/MM/YYYY',
          customRangeLabel: 'Aangepast',
          applyLabel: 'OK',
          cancelLabel: 'Annuleren',
          fromLabel: 'Van',
          toLabel: 'Tot'
        },
        opens: 'left',
        ranges: controller.ranges
      };
      // If we have a second range, use that as default.
      if (controller.dateRanges[1]) {
        if (controller.dateRanges[1].from) {
          def3 = controller.dateRanges[1].from._d;
        }
        if (controller.dateRanges[1].to) {
          def4 = controller.dateRanges[1].to._d;
        }
      }
      controller.$input1 = $input1;
      controller.$input2 = $input2;
      controller.defOpts = defOpts;
      // Attach daterangepickers
      $input1.daterangepicker(jQuery.extend(defOpts, {
        fromDate: controller.dateRanges[0].from._d,
        toDate: controller.dateRanges[0].to._d
      }));
      $input2.daterangepicker(jQuery.extend(defOpts, {
        fromDate: def3,
        toDate: def4
      }));
    }, 0);
  };

  // Helper function for drawing the actual graph.
  controller.renderGraph = function () {
    // Grab placeholder.
    var $graphWrap = angular.element(document.querySelectorAll('.counter-statistics-graph'));

    var maxWidth = $graphWrap.width();

    if (maxWidth < 600) {
      maxWidth = 600;
    }

    // The data to be used.
    var stats = controller.statistics,
        // Global d3 reference.
        d3 = window.d3,
        format = d3.time.format('%d-%m-%Y'),
        // Hardcoded margin.
        margin = 40,
        // Grab width - margins.
        width = maxWidth - (margin * 2),
        height = 250,
        // Scaling functions.
        xScale = d3.time.scale().range([0, width]),
        yScale = d3.scale.linear().range([height, 0]),
        // Axis handlers.
        xAxis = d3.svg.axis().scale(xScale).orient('bottom').ticks(5).tickFormat(d3.time.format('%d/%m')),
        yAxis = d3.svg.axis().scale(yScale).orient('left').ticks(3),
        compare = this.hasCompareData(),
        line,
        line2,
        area,
        graph;

    if (compare) {
      line2 = d3.svg.line()
              .x(function (d) { return xScale(format.parse(d.date)); })
              .y(function (d) { return yScale(parseInt(d.count2, 10)); });
    }

    // Make sure it's cleared.
    $graphWrap.empty();
    var tooltip = d3.select('.counter-statistics-graph').append('div').attr('class', 'graph-tooltip').style('opacity', 0);
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
        .attr('transform', 'translate(0, ' + height + ')')
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
        })
        .on('mouseover', function(d) {
          controller.showTooltip(d3.event, tooltip, d.count, d.date);
        })
        .on('mouseout', function() {
          controller.hideTooltip(d3.event, tooltip);
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
          })
          .on('mouseover', function(d) {
            controller.showTooltip(d3.event, tooltip, d.count2, d.date2);
          })
          .on('mouseout', function() {
            controller.hideTooltip(d3.event, tooltip);
          });

    }

    d3.select(window).on('resize', function() {
      controller.renderGraph();
    });

  };

  controller.compareChange = function() {
    if (controller.comparing) {
      controller.updateCompareWithRange();
    }
  };


  /**
   * Show the tooltip for a point on the graph.
   */
  controller.showTooltip = function(event, tooltip, total, date) {
    var label = (total == 1 ? info[$state.current.name].single_label : info[$state.current.name].plural_label);

    tooltip.html("<strong>" + date + "</strong><br/>" + " " + total + " " + label);

    // Tooltip needs to move first, if not getBoundingClientRect returns old info.
    tooltip.style("left", (event.pageX + 5) + "px");

    var elementInfo = tooltip.node().getBoundingClientRect();
    tooltip.style("top", (event.pageY - elementInfo.height) + "px");

    tooltip.transition().duration(100).style("opacity", 1);
  };

  /**
   * Hide the tooltip.
   */
  controller.hideTooltip = function(event, tooltip) {
    tooltip.transition().duration(200).style("opacity", 0);
  };

  controller.loadDefaultDateRange();
  $scope.$on('$stateChangeSuccess', function() {
    controller.loadStatistics();
  });
}