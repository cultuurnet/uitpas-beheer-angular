'use strict';

describe('Controller: FeedbackController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, feedbackService, $q, $scope, $rootScope;

  // Setup mocking data
  var feedbackParameters = {
    date: '2015-12-26',
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
    $rootScope = _$rootScope_;

    controller = $controller('PassholderEditController', {
      feedbackService: feedbackService,
      $rootScope: $rootScope,
      $scope: $scope
    });
  }));

  it('should lock down the form while submitting', function () {
    controller.submitForm(getSpyForm());
    expect(controller.formSubmitBusy).toBeTruthy();
  });

  it('should unlock the form after a submit is rejected', function () {
    var apiError = {
      apiError: {
        code: 'SOME_ERROR'
      }
    };
    spyOn(feedbackService, 'update').and.returnValue($q.reject(apiError));

    controller.submitForm(getSpyForm());
    expect(controller.formSubmitBusy).toBeTruthy();

    $scope.$digest();
    expect(controller.formSubmitBusy).toBeFalsy();
  });

  it('should submit feedback parameters using the feedbackService', function () {
    var feedbackForm = {
      email: {
        $valid: true
      },
      message: {
        $valid: true
      }
    };
    controller.feedback = feedbackParameters;

    controller.sendFeedback(feedbackForm);
    $scope.$digest();

    expect(feedbackService.sendFeedback)
      .toHaveBeenCalledWith(feedbackParameters);
  });
});
