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

  it('should send feedback to the api', function(done) {
    // Mock an HTTP response.
    $httpBackend
      .expectPOST(apiUrl + 'feedback')
      .respond(200, JSON.stringify(feedbackParameters));

    // Assertion method.
    var assertResponse = function() {
      done();
    };

    var failed = function(error) {
      expect(error).toBeUndefined();
    };

    // Send feedback data and assert it when its returned.
    feedbackService.sendFeedback(feedbackParameters).then(assertResponse, failed);

    // Deliver the HTTP response so the feedback data is asserted.
    $httpBackend.flush();
  });
});
