'use strict';

/**
 * @ngdoc service
 * @name ubr.feedback.feedbackService
 * @description
 * # feedback
 * Service in the ubr.feedback module.
 */
angular
  .module('ubr.feedback')
  .service('feedbackService', feedbackService);

/* @ngInject */
function feedbackService($q, $http, appConfig) {
  var apiUrl = appConfig.apiUrl;

  /*jshint validthis: true */
  var service = this;

  /**
   * @param {feedbackParameters} feedbackParameters
   *
   * @returns {Promise}
   *   A feedback promise.
   */
  service.sendFeedback = function(feedbackParameters) {
    var deferredFeedback = $q.defer();


    var errorSendingFeedback = function(apiError) {
      var errorObject = {
        code: 'FEEDBACK_NOT_SENT',
        title: 'Feedback could not be sent'
      };
      var message = 'The feedback could not be updated on the server';
      if (!angular.isUndefined(apiError)) {
        errorObject.apiError = apiError;

        if (apiError.code) {
          message += ': ' + apiError.code;
        }
      }
      else {
        message += '.';
      }
      errorObject.message = message;

      deferredFeedback.reject(errorObject);
    };

    var config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    $http
      .post(apiUrl + 'feedback', feedbackParameters, config)
      .success(deferredFeedback.resolve)
      .error(errorSendingFeedback);

    return deferredFeedback.promise;
  };
}
