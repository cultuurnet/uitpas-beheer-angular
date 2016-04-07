# Peer review
 All code should be reviewed by a colleague.
 
 Some of the points that should be checked are:

* Code should be written and structured in a way that make it testable.
* Never use abbreviations as names, use a proper IDE that can help you with code completion. Preferably, use names that explain what a certain object is, or what a method will do.
* Don't repeat yourself. Move logic to a service, factory or directive when it is needed in multiple places.
* `$scope` and `$rootScope` should accessed directly. This makes code a lot more difficult to test.
* Use `$rootScope.$emit()`to inform other controllers or services about changes that occured. But use this only when realy needed.
* Use `$rootScope.$on()` to listen for fired events.
* Clean up event listeners.
```javascript
  function handleEventData(event, eventData) {
    controller.data = eventData;
  }

  var cleanupEventListener = $rootScope.$on('eventFired', handleEventData);

  $scope.$on('$destroy', cleanupEventListener);
```