'use strict';

/**
 * @ngdoc function
 * @name ubr.feedback.controller:FeedbackController
 * @description
 * # FeedbackController
 * Controller of the ubr.feedback module.
 */
angular
  .module('ubr.feedback')
  .controller('FeedbackController', FeedbackController);

/* @ngInject */
function FeedbackController (feedbackService, uitIdUser, activeCounter) {
  /*jshint validthis: true */
  var controller = this;

  /**
   * @type {Feedback}
   */
  controller.feedback = {
    name: uitIdUser.displayName,
    counter: (activeCounter.name) ? activeCounter.name : '',
    email: uitIdUser.mbox,
    message: ''
  };

  controller.formSubmitBusy = false;
  controller.feedbackStatus = null;

  controller.inputListener = function () {
    if (controller.feedbackStatus === 'FAILED') {
      controller.feedbackStatus = null;
    }
  };

  controller.submitForm = function () {
    controller.formSubmitBusy = true;

    var feedbackParameters = angular.copy(controller.feedback);

    var showSuccessMessage = function () {
      controller.feedbackStatus = 'SUCCESS';
      controller.feedback.message = '';
      controller.feedbackForm.message.$setUntouched();
      controller.feedbackForm.message.$setPristine();
      controller.formSubmitBusy = false;
    };

    var showErrorMessage = function () {
      controller.feedbackStatus = 'FAILED';
      controller.formSubmitBusy = false;
    };

    feedbackService.sendFeedback(feedbackParameters).then(showSuccessMessage, showErrorMessage);
  };
}
