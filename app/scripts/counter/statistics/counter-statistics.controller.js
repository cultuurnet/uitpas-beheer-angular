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
          pluralLabel: 'verkochte kaarten',
          singleLabel: 'verkochte kaart',
          type: {
            buyers: {
              'label': 'Kopers',
              'help': 'Aantal personen dat voor het eerst een UiTPAS verkreeg bij jou.'
            }
          },
          profile: 'Profiel van de koper',
          template: 'views/counter-statistics/statistics-sales.html',
        },
        'counter.statistics.savings': {
          pageTitle: 'Sparen',
          path: 'checkins',
          title: 'Gespaarde punten',
          pluralLabel: 'gespaarde punten',
          singleLabel: 'gespaard punt',
          type: {
            saved: {
              'label': 'Gespaarde punten',
              'help': 'Aantal gespaarde punten op je activiteiten.'
            },
            active: {
              'label': 'Actieve spaarders',
              'help': 'Aantal spaarders op je activiteiten.'
            },
            new: {
              'label': 'Nieuwe spaarders',
              'help': 'Aantal personen dat voor de eerste keer bij jou spaarde.'
            }
          },
          profile: 'Profiel van de actieve spaarder',
          template: 'views/counter-statistics/statistics-savings.html',
        },
        'counter.statistics.exchange': {
          pageTitle: 'Ruilen',
          path: 'exchanges',
          title: 'Omgeruilde voordelen',
          pluralLabel: 'omgeruilde voordelen',
          singleLabel: 'omgeruild voordeel',
          type: {
            active: {
              label: 'Actieve ruilers',
              help: 'Aantal personen dat bij jou punten omruilde.'
            },
            new: {
              label: 'Nieuwe ruilers',
              help: 'Aantal personen dat voor de eerste keer bij jou punten omruilde.'
            },
            transactions: {
              label: 'Omgeruilde voordelen',
              help: 'Aantal omgeruilde voordelen bij jou.'
            }
          },
          profile: 'Profiel van de actieve ruiler',
          extraTable: {
            title: 'aangeboden voordelen',
            firstTableTitleLeft: 'Populairste ruilvoordelen',
            firstTableTitleRight: 'Aantal ruilers'
          },
          template: 'views/counter-statistics/statistics-exchanges.html',
        },
        'counter.statistics.mia': {
          pageTitle: 'MIA\'s',
          path: 'mias',
          title: 'Actieve MIA\'s',
          pluralLabel: 'actieve MIA\'s',
          singleLabel: 'actieve MIA',
          type: {
            active: {
              label: 'Actieve MIA\'s',
              help: 'Aantal mensen in armoede dat je bereikte.'
            },
            saving: {
              label: 'Sparende MIA\'s',
              help: 'Aantal mensen in armoede dat bij je spaarde.'
            },
            exchanging: {
              label: 'Ruilende MIA\'s',
              help: 'Aantal mensen in armoede dat bij je ruilde.'
            }
          },
          profile: 'Profiel van MIA\'s',
          extraTable: {
            title: 'tickets aan kansentarief',
            firstTableTitleLeft: 'Populairste tickets',
            firstTableTitleRight: 'Aantal tickets',
            secondTableTitleLeft: 'Populairste activiteiten',
            secondTableTitleRight: 'Aantal spaarders'
          },
          template: 'views/counter-statistics/statistics-mias.html',
        },
      },
      helpTexts = {
          average: '% berekend op jouw activiteiten.',
          yourBallie: 'Gemiddelde % in je UiTPAS-regio.'
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
  controller.pickingDate = false;
  controller.comparing = controller.selectedComparestate = false;
  controller.titleStr = '';
  controller.profileStr = '';
  controller.tooltip = d3.select('body').append('div').attr('class', 'graph-tooltip').style('opacity', 0);
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
      controller.extraTable = info[$state.current.name].extraTable;

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
        .on("mouseover", function(d) {
          controller.showGraphTooltip(d3.event, d.count, d.date)
        })
        .on("mouseout", function() {
          controller.hideTooltip();
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
          .on("mouseover", function(d) {
            controller.showGraphTooltip(d3.event, d.count2, d.date2)
          })
          .on("mouseout", function() {
            controller.hideTooltip();
          });
    }

    d3.select(window).on('resize', function() {
      controller.renderGraph();
    });
  };

  /**
   * Show a tooltip for a point in the graph.
   */
  controller.showGraphTooltip = function(event, total, date) {
    var label = (total == 1 ? info[$state.current.name].singleLabel : info[$state.current.name].pluralLabel),
      content = "<strong>" + date + "</strong><br/>" + " " + total + " " + label;

    controller.showTooltip(event, content);
  }

  /**
   * Show a help tooltip.
   */
  controller.showHelpTooltip = function(event, key) {
    if (helpTexts[key]) {
      controller.showTooltip(event, helpTexts[key]);
    }
  }

  /**
   * Show a tooltip.
   */
  controller.showTooltip = function(event, content) {
    controller.tooltip.html(content);

    // Tooltip needs to move first, if not getBoundingClientRect returns old info.
    controller.tooltip.style("left", (event.pageX + 5) + "px");

    var elementInfo = controller.tooltip.node().getBoundingClientRect();
    controller.tooltip.style("top", (event.pageY - elementInfo.height) + "px");

    controller.tooltip.transition().duration(100).style("opacity", 1);
  };

  /**
   * Hide the tooltip.
   */
  controller.hideTooltip = function() {
    controller.tooltip.transition().duration(200).style("opacity", 0);
  };

  $scope.$on('$stateChangeSuccess', function() {
    controller.loadStatistics();
  });
}