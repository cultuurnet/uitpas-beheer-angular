'use strict';

describe('Controller: PointHistoryController', function(){
  var PointHistoryController, expectedPointHistory, pass, $controller, $uibModalInstance, $scope, passholderService, $q;
  beforeEach(module('ubr.passholder'));
  beforeEach(module('uitpasbeheerApp'));

  beforeEach(inject(function (_$controller_, $rootScope, $injector) {
    $controller = _$controller_;
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['dismiss']);
    $scope = $rootScope.$new();
    $q = $injector.get('$q');
    passholderService = $injector.get('passholderService');
    expectedPointHistory = [
      {
        'id': 12,
        'date': '2015-10-26',
        'title': 'Evenement 1',
        'points': '+1'
      },
      {
        'id': 13,
        'date': '2015-10-26',
        'title': 'Voordeel 1',
        'points': '-16'
      },
      {
        'id': 14,
        'date': '2015-10-23',
        'title': 'Evenement 2',
        'points': '+1'
      },
      {
        'id': 15,
        'date': '2015-10-23',
        'title': 'Voordeel 2',
        'points': '-15'
      },
      {
        'id': 16,
        'date': '2015-10-21',
        'title': 'Evenement 3',
        'points': '+1'
      },
      {
        'id': 17,
        'date': '2015-10-21',
        'title': 'Voordeel 3',
        'points': '-15'
      },
      {
        'id': 18,
        'date': '2015-10-19',
        'title': 'Evenement 4',
        'points': '+1'
      },
      {
        'id': 19,
        'date': '2015-10-19',
        'title': 'Voordeel 4',
        'points': '-3'
      },
      {
        'id': 20,
        'date': '2015-10-16',
        'title': 'Evenement 5',
        'points': '+1'
      },
      {
        'id': 21,
        'date': '2015-10-16',
        'title': 'Voordeel 5',
        'points': '-2'
      }
    ];

    pass = {
      pass: {
        number: '01234567891234',
        passholder: {
          passNumber: '01234567891234',
          points: 123,
          name: {
            first: 'Fred'
          }
        }
      }
    };

  }));

  function getController() {
    return $controller('PointHistoryController', {
      pass: pass,
      passholder: pass.passholder,
      $uibModalInstance: $uibModalInstance,
      passholderService: passholderService
    });
  }

  it('should display the point history', function () {
    spyOn(passholderService, 'getPointHistory').and.returnValue($q.resolve(expectedPointHistory));
    PointHistoryController = getController();
    $scope.$apply();
    expect(PointHistoryController.pointHistory).toEqual(expectedPointHistory);
  });

  it('can close the modal', function () {
    PointHistoryController = getController();
    PointHistoryController.cancel();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });
});
