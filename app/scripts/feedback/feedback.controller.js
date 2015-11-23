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
function FeedbackController (feedbackService, moment, uitIdUser, activeCounter) {
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

  controller.submitForm = function () {
    controller.formSubmitBusy = true;

    var feedbackParameters = angular.copy(controller.feedback);
    feedbackParameters.date = moment(new Date()).format('YYYY-MM-DD');

    var showSuccessMessage = function () {
      controller.feedbackStatus = 'SUCCESS';
      controller.formSubmitBusy = false;
    };

    var showErrorMessage = function () {
      controller.feedbackStatus = 'FAILED';
      controller.formSubmitBusy = false;
    };

    feedbackService.sendFeedback(feedbackParameters).then(showSuccessMessage, showErrorMessage);
  };
}
