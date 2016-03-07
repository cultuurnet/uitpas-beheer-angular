'use strict';

/**
 * @ngdoc service
 * @name ubr.utilities.Queue
 * @description
 * # Queue factory
 * Factory in the ubr.utilities module.
 */
angular
  .module('ubr.utilities')
  .factory('Queue', queueFactory);

/* @ngInject */
function queueFactory() {
  /*jshint validthis: true */
  var service = this;
  /**
   * @class Queue
   * @constructor
   * @param {number}  maxSimultaneousRequests
   */
  var Queue = function (maxSimultaneousRequests, autoStartProcessing) {
    service.maxSimultaneousRequests = maxSimultaneousRequests || 4;
    service.autoStartProcessing = autoStartProcessing || false;
  };

  var _queue = [],
      currentSimultaneousRequests = 0;

  function finishJob() {
    currentSimultaneousRequests--;
    processQueue();
  }
  function processQueue() {
    var job;
    // Start up to maxSimultaneousRequests items from the queue.
    while (_queue.length > 0 && currentSimultaneousRequests < service.maxSimultaneousRequests) {
      currentSimultaneousRequests++;
      job = _queue.shift();
      job().finally(finishJob);
    }
  }

  Queue.prototype = {
    /**
     * Enqueue a job
     *
     * @param {function} [callback] function to execute which must return a promise
     */
    enqueue: function (callback) {
      _queue.push(callback);
      if (service.autoStartProcessing) {
        processQueue();
      }
    },
    /**
     * Start processing the queue
     *
     */
    startProcessingQueue: function() {
      processQueue();
    }
  };

  return (Queue);
}
