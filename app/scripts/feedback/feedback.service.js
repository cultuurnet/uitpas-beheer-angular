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
    var deferred = $q.defer();

    var successSendingFeedback = function() {
    };

    var errorSendingFeedback = function(e) {
      var message = 'The feedback could not be updated on the server';
      if (!angular.isUndefined(e) && e.code) {
        message += ': ' + e.code;
      }
      else {
        message += '.';
      }
      deferred.reject({
        code: 'FEEDBACK_NOT_SENT',
        title: 'feedback couldn\'t be sent.',
        message: message,
        apiError: e
      });
    };

    var config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    $http
      .post(apiUrl + 'feedback', feedbackParameters, config)
      .success(successSendingFeedback)
      .error(errorSendingFeedback);

    return deferred.promise;
  };
}
