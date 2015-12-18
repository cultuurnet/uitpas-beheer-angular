'use strict';

describe('Controller: ActivityDetailController', function () {
  var ActivityDetailController, activity, $controller, $uibModalInstance, Activity;

  // load the controller's module
  beforeEach(module('ubr.activity'));
  beforeEach(module('uitpasbeheerApp'));

  beforeEach(inject(function (_$controller_, $rootScope, $injector) {
    $controller = _$controller_;
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['dismiss']);
    Activity = $injector.get('Activity');
    activity = new Activity({
      'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      'title': 'Altijd open',
      'description': '',
      'when': '',
      'age': 10,
      'checkinConstraint': {
        'allowed': true,
        'startDate': new Date(1438584553*1000),
        'endDate': new Date(1438584553*1000),
        'reason': ''
      },
      sales: {
        maximumReached: false,
        differentiation: false,
        base: {
          'Default prijsklasse': 6
        },
        tariffs: {
          kansentariefAvailable: true,
          couponAvailable: true,
          lowestAvailable: 1.5,
          list: [
            {
              name: 'Kansentarief',
              type: 'KANSENTARIEF',
              maximumReached: false,
              prices: [
                {priceClass: 'Default prijsklasse', price: 1.5, type: 'KANSENTARIEF'}
              ]
            }
          ]
        }
      }
    });

    function getController() {
      return $controller('ActivityDetailController', {
        activity: activity,
        $uibModalInstance: $uibModalInstance
      });
    }

    ActivityDetailController = getController();

    it('should display the details of an activity', function () {
      expect(ActivityDetailController.activity).toEqual(activity);
    });

    it('can close the modal', function () {
      ActivityDetailController.cancel();
      expect($uibModalInstance.dismiss).toHaveBeenCalled();
    });
  }));

});
