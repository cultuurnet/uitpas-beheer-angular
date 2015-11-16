'use strict';

describe('Controller: FeedbackController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, feedbackService, $q, $scope, moment;

  // Setup mocking data
  var feedbackParameters = {
    name: 'John Doe',
    counter: 'cc De Werf',
    email: 'mail@info.com',
    message: 'This is a fake feedback message.'
  };

  var getSpyForm = function (formData) {
    var spyForm = {
      $valid: true,
      $setSubmitted: jasmine.createSpy('$setSubmitted')
    };

    if (formData) {
      angular.merge(spyForm, formData);
    }

    return spyForm;
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector, _$rootScope_) {

    feedbackService = $injector.get('feedbackService');
    $q = $injector.get('$q');
    $scope = _$rootScope_.$new();
    moment = $injector.get('moment');

    controller = $controller('FeedbackController', {
      feedbackService: feedbackService
    });
  }));

  it('should lock down the form while submitting', function () {
    controller.submitForm();
    expect(controller.formSubmitBusy).toBeTruthy();
  });

  it('should unlock the form after a submit is rejected', function () {
    var apiError = {
      apiError: {
        code: 'SOME_ERROR'
      }
    };
    spyOn(feedbackService, 'sendFeedback').and.returnValue($q.reject(apiError));

    controller.submitForm();
    expect(controller.formSubmitBusy).toBeTruthy();

    $scope.$digest();
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should submit feedback parameters using the feedbackService', function () {
    spyOn(feedbackService, 'sendFeedback').and.returnValue($q.when());

    controller.feedback = feedbackParameters;
    controller.feedback.date = moment(new Date()).format('YYYY-MM-DD');

    controller.submitForm();
    $scope.$digest();

    expect(feedbackService.sendFeedback)
      .toHaveBeenCalledWith(feedbackParameters);
  });
});
