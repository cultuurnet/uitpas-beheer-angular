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
      template: 'views/counter-statistics/statistics-sales.html',
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
      template: 'views/counter-statistics/statistics-savings.html',
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
      template: 'views/counter-statistics/statistics-exchanges.html',
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
      template: 'views/counter-statistics/statistics-mias.html',
    }
  };

  controller.loadingStatistics = true;
  controller.statistics = {};
  controller.noStatisticsError = false;
  controller.dateFrom = '';
  controller.dateTill = '';
  controller.compareDateTill = '';
  controller.compareDateFrom = '';
  controller.datePickerOpts = {
    locale: { format: 'DD/MM/YYYY'},
    opens: 'left',
    ranges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
  };
  controller.dateRange = controller.selectedDateRange = counterStatisticsService.getDefaultDateRange();
  controller.compareDateRange = controller.selectedCompareDateRange = counterStatisticsService.getDefaultDateRange();
  controller.formattedDates = [];
  controller.pickingDate = false;
  controller.comparing = controller.selectedComparestate = false;
  controller.titleStr = '';
  controller.profileStr = '';
  controller.typeTemplate = '';

  controller.updateDates = function () {
    controller.selectedDateRange = controller.dateRange;
    controller.selectedCompareDateRange = controller.compareDateRange;
    controller.selectedComparestate = controller.compare;
    controller.pickingDate = false;
    controller.loadStatistics();
  };

  controller.resetDates = function ($event) {
    controller.pickingDate = false;
    controller.dateRange = controller.selectedDateRange;
    controller.compareDateRange = controller.selectedCompareDateRange;
    controller.comparing = controller.selectedComparestate;
  };

  // Does the controller has comparing data.
  controller.hasCompareData = function() {
    return !!(controller.statistics && controller.statistics.profiles2);
  };

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
      controller.typeTemplate = info[$state.current.name].template;
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


    currentRanges.push(controller.selectedDateRange);

    if (controller.comparing) {
      currentRanges.push(controller.selectedCompareDateRange);
    }

    controller.loadingStatistics = true;
    counterStatisticsService
      .getStatistics(currentRanges, info[$state.current.name].path)
      .then(showStatistics, noStatisticsFound);
  };

  // Helper function for drawing the actual graph.
  controller.renderGraph = function () {
    // Grab placeholder.
    var $graphWrap = angular.element(document.querySelectorAll('.counter-statistics-graph'));

    // If graph would be more then 600px, force fixed width.
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
        .attr('class', 'line line-1')
        .attr('d', line);

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
        .attr('class', 'dot dot-1')
        .attr('r', 5)
        .attr('cx', function(d) {
          return xScale(format.parse(d.date));
        })
        .attr('cy', function(d) {
          return yScale(parseInt(d.count, 10));
        })
        .on('mouseover', function(d) {
          controller.showTooltip(d3.event, tooltip, d.count, d.date)
        })
        .on('mouseout', function() {
          controller.hideTooltip(d3.event, tooltip);
        });

    if (compare) {
      // Make a line path per period.
      graph.append('path')
        .datum(stats.periods)
        .attr('class', 'line line-2')
        .attr('d', line2);

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

  $scope.$on('$stateChangeSuccess', function() {
    controller.loadStatistics();
  });
}