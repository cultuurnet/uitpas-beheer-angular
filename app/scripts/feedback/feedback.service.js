'use strict';

/**
 * User feedback
 * @typedef {Object} Feedback
 * @property {string} name      - The name of the user.
 * @property {string} counter   - A counter name.
 * @property {string} email     - The email address where we can contact the reporting user.
 * @property {string} message   - The actual message containing the feedback.
 */

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
   * @param {Feedback} feedbackParameters
   *
   * @returns {Promise}
   *   A feedback promise.
   */
  service.sendFeedback = function(feedbackParameters) {
    var deferredFeedback = $q.defer();

    var config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    $http
      .post(apiUrl + 'feedback', feedbackParameters, config)
      .success(deferredFeedback.resolve)
      .error(deferredFeedback.reject);

    return deferredFeedback.promise;
  };
}
