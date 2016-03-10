'use strict';

/**
 * @ngdoc function
 * @name ubr.counter.checkin-devices.service:CheckInDevicesConnections
 * @description
 * # GroupActivityController
 * Controller of the ubr counter checkin devices module.
 */
angular
  .module('ubr.counter.checkin-devices')
  .controller('CheckInDevicesConnectionsController', CheckInDevicesConnectionsController);

/* @ngInject */
function CheckInDevicesConnectionsController (CheckInDevices, $q, Queue) {
  /*jshint validthis: true */
  var controller = this;

  var devicesAsLoaded = [];

  controller.loadingData = true;
  controller.devices = [];
  controller.activities = [];

  var dataRetrieved = $q.all(
    [
      CheckInDevices.list(),
      CheckInDevices.activities()
    ]
  );

  dataRetrieved.then(
    dataRetrievalSucceeded,
    dataRetrievalFailed
  );

  function dataRetrievalSucceeded(data) {
    devicesAsLoaded = data[0];

    controller.devices = angular.copy(devicesAsLoaded);
    controller.activities = data[1];

    controller.loadingData = false;
  }

  function dataRetrievalFailed() {

  }

  var queue = new Queue(4);

  function clearState(device) {
    device.state = null;
  }

  controller.connectDevicesToActivities = function() {
    angular.forEach(controller.devices, function(device, key) {
      device.state = {
        connecting: true
      };

      queue.enqueue(function () {
        return connectDevice(device, key);
      });
    });

    queue.startProcessingQueue();
  };

  controller.clearState = clearState;


  function connectDevice(device, key) {
    return CheckInDevices.connectDeviceToActivity(device.id, device.activityId)
      .then(function () {
        // Update the activityId in the original list so subsequent form
        // submissions will check against the new activityId.
        devicesAsLoaded[key].activityId = device.activityId;

        device.state = {
          succeeded: true
        };
      },
      function () {
        device.state = {
          failed: true
        };
      });
  }
}
