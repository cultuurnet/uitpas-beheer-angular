'use strict';

describe('Controller: FeedbackController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var controller, feedbackService, $q, $scope, moment, uitIdUser, activeCounter;

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
    uitIdUser = {
      mbox: 'email@email.be',
      displayName: 'email'
    };
    activeCounter = {
      name: 'Counter name'
    };

    controller = $controller('FeedbackController', {
      feedbackService: feedbackService,
      moment: moment,
      uitIdUser: uitIdUser,
      activeCounter: activeCounter
    });
  }));

  it('should set some variables from the uitIdUser and activeCounter', function () {
    expect(controller.feedback.name).toBe(uitIdUser.displayName);
    expect(controller.feedback.email).toBe(uitIdUser.mbox);
    expect(controller.feedback.counter).toBe(activeCounter.name);
  });

  it('should lock down the form while submitting and unlock after a submit is successful', function () {
    spyOn(feedbackService, 'sendFeedback').and.returnValue($q.when());
    controller.submitForm();
    expect(controller.formSubmitBusy).toBeTruthy();

    $scope.$digest();
    expect(controller.formSubmitBusy).toBeFalsy();
    expect(controller.feedbackStatus).toBe('SUCCESS');
  });

  it('should unlock the form after a submit is rejected', function () {
    spyOn(feedbackService, 'sendFeedback').and.returnValue($q.reject());

    controller.submitForm();
    expect(controller.formSubmitBusy).toBeTruthy();

    $scope.$digest();
    expect(controller.formSubmitBusy).toBeFalsy();
    expect(controller.feedbackStatus).toBe('FAILED');
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
