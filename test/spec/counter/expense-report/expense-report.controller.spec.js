'use strict';

describe('Controller: expenseReportController', function () {

  var $controller, $scope, $httpBackend, $interval, $q, controller, expenseReportService;
  var apiUrl = 'http://tett.en/';
  var deferredPeriods;

  beforeEach(module('ubr.counter.expense-report', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  beforeEach(inject(function ($injector, _$controller_, $rootScope, _$httpBackend_, _$interval_) {
    $q = $injector.get('$q');
    $controller = _$controller_;
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $interval = _$interval_;

    expenseReportService  = jasmine.createSpyObj('expenseReportService', ['getPeriods']);
    deferredPeriods = $q.defer();
    expenseReportService.getPeriods.and.returnValue(deferredPeriods.promise);

    controller = $controller('ExpenseReportController', {
      $scope: $scope,
      expenseReportService: expenseReportService
    });
  }));

  it('should use the right date range when requesting a report', function () {
    controller.reportFrom = new Date('2010-09-09');
    controller.reportTo = new Date('2015-09-09');
    var expectedData = {
      from: '2010-09-09',
      to: '2015-09-09'
    };


    expect(expenseReportService.getPeriods).toHaveBeenCalled();

    $httpBackend
      .expectPOST(apiUrl + 'counters/active/expense-reports', expectedData)
      .respond(200, '');

    controller.generateReport();
    $httpBackend.flush();
  });

  it('should display an error when a request to generate a response fails', function () {
    controller.reportFrom = new Date();
    controller.reportTo = new Date();

    var expectedError = {
      woooo: 'ps'
    };
    $httpBackend
      .when('POST', apiUrl + 'counters/active/expense-reports')
      .respond(400, expectedError);

    controller.generateReport();
    $httpBackend.flush();
    expect(controller.asyncError).toEqual(expectedError);
    expect(controller.requestingReport).toEqual(false);
    expect(controller.generatingReport).toEqual(false);
  });

  it('should download a report when it has finished generating', function () {
    var generationStartedResponse = {
      data: {
        id: 'report-id-123'
      }
    };
    var completedResponseData = {
      completed: true,
      download: 'http://download.me/file-name'
    };

    $httpBackend
      .when('GET', apiUrl + 'counters/active/expense-reports/report-id-123')
      .respond(200, completedResponseData);

    controller.generatingReportStarted(generationStartedResponse);
    expect(controller.generatingReport).toEqual(true);

    $interval.flush(2000);
    $httpBackend.flush();
    expect(controller.reportLocation).toEqual('http://download.me/file-name');
  });

  it('should return a pending state when a report request or a report is generating', function () {
    controller.requestingReport = true;
    controller.generatingReport = false;
    expect(controller.reportPending()).toEqual(true);

    controller.requestingReport = false;
    controller.generatingReport = true;
    expect(controller.reportPending()).toEqual(true);

    controller.requestingReport = false;
    controller.generatingReport = false;
    expect(controller.reportPending()).toEqual(false);
  });
});
