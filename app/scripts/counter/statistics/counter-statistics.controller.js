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
  var controller = this;
  controller.info = {
    'counter.statistics': {
      pageTitle: 'UiTPASverkoop',
      path: 'sale',
      graphProp: 'sale_count',
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
      template: 'views/counter-statistics/statistics-sales.html'
    },
    'counter.statistics.savings': {
      pageTitle: 'Punten sparen',
      path: 'save',
      graphProp: 'save_count',
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
      template: 'views/counter-statistics/statistics-savings.html'
    },
    'counter.statistics.exchange': {
      pageTitle: 'Voordelen omruilen',
      path: 'trade',
      graphProp: 'trade_count',
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
      template: 'views/counter-statistics/statistics-exchanges.html'
    },
    'counter.statistics.mia': {
      pageTitle: 'Tickets aan kansentarief',
      path: 'ticket',
      graphProp: 'ticket_count',
      title: 'Actieve MIA\'s',
      pluralLabel: 'actieve MIA\'s',
      singleLabel: 'actieve MIA',
      mia: true,
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
      template: 'views/counter-statistics/statistics-mias.html'
    }
  };

  controller.helpTexts = {
    average: 'Gemiddelde % in je UiTPAS-regio.',
    yourBalie: '% berekend op jouw activiteiten.',
  };

  controller.ranges = {
    'Gisteren': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Afgelopen week': [moment().startOf('week').subtract(1, 'days').startOf('week'), moment().startOf('week').subtract(1, 'days').endOf('week')],
    'Deze maand': [moment().startOf('month'), moment().endOf('month')],
    'Vorige maand': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    'Afgelopen 7 dagen': [moment().subtract(8, 'days'), moment().subtract(1, 'day')],
    'Afgelopen 30 dagen': [moment().subtract(31, 'days'), moment().subtract(1, 'day')]
  };

  controller.defOpts = {
    locale: {
      format: 'DD/MM/YYYY',
      customRangeLabel: 'Aangepast',
      applyLabel: 'Bevestigen',
      cancelLabel: 'Annuleren',
      fromLabel: 'Van',
      toLabel: 'Tot'
    },
    opens: 'left',
    ranges: controller.ranges
  };

  controller.loadingStatistics = false;
  controller.statistics = [];
  controller.mia = false;
  controller.noStatisticsError = false;
  controller.dateRanges = [];
  controller.formattedDates = [];
  controller.pickingDate = false;
  controller.comparing = false;
  controller.titleStr = '';
  controller.profileStr = '';
  controller.tooltip = d3.select('body').append('div').attr('class', 'graph-tooltip').style('opacity', 0);
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
        diff = moment.duration(to.diff(from)).asDays() || 0,
        opts = window.jQuery.extend(controller.defOpts, {}),
        prev;

    diff++;
    prev = [moment(from).subtract(diff, 'days'), moment(from).subtract(1, 'days')];
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
    return !!(controller.statistics && controller.statistics.length > 1);
  };

  // Load statistics, debounced cause both inputs trigger this onload.
  controller.loadStatistics = function () {
    if (controller.loadingStatistics) return;


    var noStatisticsFound = function () {
      controller.loadingStatistics = false;
      controller.noStatisticsError = true;
      controller.statistics = []
    };

    var currentRanges = [];
    var showStatistics = function (response) {
      var statistics = response[0];
      var error = response[1];

      if (error && (error[0] || error[1])) {
        noStatisticsFound();
        return;
      }
      // var graphProp = controller.info[$state.current.name].graphProp;

      controller.statistics = statistics;
      for (var i = 0; i< statistics.length; i++) {
        if (statistics.hasOwnProperty(i)) {
          controller.statistics[i].daily = statistics[i].daily.sort(function(a,b) {
            return new Date(a.day) - new Date(b.day);
          });
        }
        console.log(controller.statistics);
      }

      // if (controller.statistics.length > 1) {
      //   var otherStats = controller.statistics[1];
      //   for (var j = 0; j < controller.statistics[0].daily.length; j++) {
      //     controller.statistics[0].daily[j][graphProp + 'Compare'] = otherStats.daily[j] ? otherStats.daily[j][graphProp] : undefined;
      //     controller.statistics[0].daily[j].dayCompare = otherStats.daily[j] ? otherStats.daily[j].day : undefined;
      //   }
      // }

      controller.loadingStatistics = false;
      controller.noStatisticsError = false;
      controller.titleStr = controller.info[$state.current.name].title;
      controller.profileStr = controller.info[$state.current.name].profile;
      controller.typeStr = controller.info[$state.current.name].type;
      controller.pageTitle = controller.info[$state.current.name].pageTitle;
      controller.typeTemplate = controller.info[$state.current.name].template;
      controller.showMia = !controller.info[$state.current.name].mia;
      controller.which = $state.current.name.split('.');
      controller.which = controller.which[controller.which.length - 1];
      // Using settimeout to avoid waiting an extra cycle.
      setTimeout(function(){
        controller.renderGraph(controller.statistics);
      }, 0);
    };

    currentRanges.push(controller.dateRanges[0]);

    if (controller.isComparing()) {
      currentRanges.push(controller.dateRanges[1]);
    }

    controller.loadingStatistics = true;
    counterStatisticsService
      .getStatistics(
        currentRanges,
        controller.info[$state.current.name].path,
        controller.info[$state.current.name].mia || controller.mia
      )
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
      controller.$input1 = $input1;
      controller.$input2 = $input2;
      // Attach daterangepickers
      $input1.daterangepicker(jQuery.extend(controller.defOpts, {
        fromDate: controller.dateRanges[0].from._d,
        toDate: controller.dateRanges[0].to._d
      }));
      $input2.daterangepicker(jQuery.extend(controller.defOpts, {
        fromDate: def3,
        toDate: def4
      }));
    }, 0);
  };

  // Helper function for drawing the actual graph.
  controller.renderGraph = function () {
    var graphProp = controller.info[$state.current.name].graphProp;
    // Grab placeholder.
    var $graphWrap = angular.element(document.querySelectorAll('.counter-statistics-graph'));

    var maxWidth = $graphWrap.width();

    if (maxWidth < 600) {
      maxWidth = 600;
    }

    // The data to be used.
    var stats = controller.statistics[0];
    var statsCompare;

    if (!stats) return;

    if (controller.statistics.length > 1) {
      statsCompare = controller.statistics[1];
    }

        // Global d3 reference.
    var d3 = window.d3,
        parseDate = d3.time.format('%Y-%m-%d').parse,
        formatDate = d3.time.format('%d/%m/%Y'),
        format = d3.time.format('%Y-%m-%d'),
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
        area2,
        graph;

    if (compare) {
      var yearMonth = d3.time.format('%Y-%m')(parseDate(stats.start_date));

      for (var i = 0; i < statsCompare.daily.length; i++){
        var item = statsCompare.daily[i];
        var day = d3.time.format('%d')(parseDate(item.day));
        // To show the comparison graph behind the main graph, we need to map the comparison dates to the displayed dates
        item.mappedDay = yearMonth + '-' + day;
      }

      if (statsCompare.daily.length > 1) {
        // when the period starts on the last day of the month before
        if (parseInt(d3.time.format('%d')(parseDate(statsCompare.daily[0].day))) > parseInt(d3.time.format('%d')(parseDate(statsCompare.daily[1].day)))){
          statsCompare.daily = statsCompare.daily.slice(1);
        }
        // when the period ends on the first day of the month after
        else if (parseInt(d3.time.format('%d')(parseDate(statsCompare.daily[statsCompare.daily.length - 1].day))) < parseInt(d3.time.format('%d')(parseDate(statsCompare.daily[statsCompare.daily.length - 2].day)))){
          statsCompare.daily = statsCompare.daily.slice(1, statsCompare.daily.length - 1);
        }
      }
    }

    if (compare) {
      line2 = d3.svg.line()
              .x(function (d) { return xScale(format.parse(d.mappedDay)); })
              .y(function (d) { return yScale(parseInt(d[graphProp], 10)); });
      area2 = d3.svg.area()
              .x(function(d) { return xScale(format.parse(d.mappedDay)); })
              .y0(height)
              .y1(function(d) { return yScale(d[graphProp]); });
    }

    // Make sure it's cleared.
    $graphWrap.empty();

    // Line handler.
    line = d3.svg.line()
          .x(function(d) { return xScale(format.parse(d.day)); })
          .y(function(d) { return yScale(parseInt(d[graphProp], 10)); });
    // Area handler.
    area = d3.svg.area()
          .x(function(d) { return xScale(format.parse(d.day)); })
          .y0(height)
          .y1(function(d) { return yScale(d[graphProp]); });
    // Group to add the margins.
    graph = d3.select($graphWrap[0]).append('svg')
      .attr('width', width + (margin * 2))
      .attr('height', height + (margin * 2))
      .append('g')
      .attr('transform', 'translate(' + margin + ', ' + margin + ')');
    // Set total size.
    xScale.domain(d3.extent(stats.daily, function (d) { return format.parse(d.day); }));
    // Same for Y dimension.
    var allStats = [].concat(stats.daily, compare ? statsCompare.daily : []);
    yScale.domain([0, d3.max(allStats, function (d) {
      return parseInt(d[graphProp], 10);
    })]);

    // Make an area path per period.
    graph.append('path')
        .datum(stats.daily)
        .attr('class', 'area')
        .attr('d', area);
    if (compare) {
      // Make an area path per period.
      graph.append('path')
          .datum(statsCompare.daily)
          .attr('class', 'area area-2')
          .attr('d', area2);
    }
    // Make a line path per period.
    graph.append('path')
        .datum(stats.daily)
        .attr('class', 'line')
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
        .data(stats.daily)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('cx', function(d) {
          return xScale(parseDate(d.day));
        })
        .attr('cy', function(d) {
          return yScale(parseInt(d[graphProp], 10));
        })
        .on("mouseover", function(d) {
          controller.showGraphTooltip(d3.event, d[graphProp], formatDate(parseDate(d.day)));
        })
        .on("mouseout", function() {
          controller.hideTooltip();
        });

    if (compare) {
      // Make a line path per period.
      graph.append('path')
          .datum(statsCompare.daily)
          .attr('class', 'line line-2')
          .attr('d', line2);
      // Add a circle per data point.
      graph.selectAll('dot-2')
          .data(statsCompare.daily)
          .enter()
          .append('circle')
          .attr('class', 'dot dot-2')
          .attr('r', 5)
          .attr('cx', function(d) {
            return xScale(format.parse(d.mappedDay));
          })
          .attr('cy', function(d) {
            return yScale(parseInt(d[graphProp], 10));
          })
          .on("mouseover", function(d) {
            controller.showGraphTooltip(d3.event, d[graphProp], formatDate(parseDate(d.day)));
          })
          .on("mouseout", function() {
            controller.hideTooltip();
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
    controller.loadStatistics();
  };

  /**
   * Show a tooltip for a point in the graph.
   */
  controller.showGraphTooltip = function(event, total, date) {
    var label = (total == 1 ? controller.info[$state.current.name].singleLabel : controller.info[$state.current.name].pluralLabel),
      content = "<strong>" + date + "</strong><br/>" + " " + total + " " + label;

    controller.showTooltip(event, content);
  };

  /**
   * Show a help tooltip.
   */
  controller.showHelpTooltip = function(event, key) {
    if (controller.helpTexts[key]) {
      controller.showTooltip(event, controller.helpTexts[key]);
    }
  };

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
    controller.tooltip.transition().duration(200).style('opacity', 0);
    controller.tooltip.style('top', 0);
    controller.tooltip.style('left', 0);
  };

  controller.getCompareStatsData = function(name, aggProp, nameProp, valueProp) {
    if (!controller.hasCompareData()) {
      return;
    }

    var found = null;

    for (var i = 0; i < controller.statistics[1].agg[aggProp].length; i++) {
      var ev = controller.statistics[1].agg[aggProp][i];
      if (ev[nameProp] === name) {
        found = ev;
      }
    }

    if (found) {
      return found[valueProp];
    }
  };

  controller.loadDefaultDateRange();
  $scope.$on('$stateChangeSuccess', function() {
    controller.loadStatistics();
  });
}
