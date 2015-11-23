'use strict';

describe('Service: FeedbackService', function () {

  var apiUrl = 'http://example.com/';

  // Load the service's module.
  beforeEach(module('uitpasbeheerApp', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  // Instantiate service.
  var feedbackService, $httpBackend, $q, $scope;

  // Setup mocking data
  var feedbackParameters = {
    date: '2015-12-26',
    name: 'John Doe',
    counter: 'cc De Werf',
    email: 'mail@info.com',
    message: 'This is a fake feedback message.'
  };

  beforeEach(inject(function ($injector, $rootScope) {
    $httpBackend = $injector.get('$httpBackend');
    feedbackService = $injector.get('feedbackService');
    $q = $injector.get('$q');
    $scope = $rootScope;
  }));

  it('should return and resolve a promise when sending feedback', function(done) {
    // Mock an HTTP response.
    $httpBackend
      .expectPOST(apiUrl + 'feedback')
      .respond(200, JSON.stringify(feedbackParameters));

    // Send feedback data and assert it when its returned.
    feedbackService.sendFeedback(feedbackParameters).then(done);

    // Deliver the HTTP response so the feedback data is asserted.
    $httpBackend.flush();
  });

  it('should return an error when failing to send feedback', function(done) {
    var expectedError = {
      code: 'FEEDBACK_NOT_SENT',
      title: 'Feedback could not be sent',
      message: 'The feedback could not be updated on the server: ERROR_CODE'
    };
    var errorResponse = JSON.stringify(expectedError);

    // Mock an HTTP response.
    $httpBackend
      .expectPOST(apiUrl + 'feedback')
      .respond(400, errorResponse);

    // Assertion method.
    var assertResponse = function(error) {
      expect(error).toEqual(expectedError);
      done();
    };

    // Send feedback data and assert it when its returned.
    feedbackService.sendFeedback(feedbackParameters).catch(assertResponse);

    // Deliver the HTTP response so the feedback data is asserted.
    $httpBackend.flush();
  });
});
