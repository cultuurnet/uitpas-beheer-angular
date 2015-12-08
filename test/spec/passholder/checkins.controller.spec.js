'use strict';

describe('Controller: CheckinsController', function(){
  var CheckinsController, expectedCheckins, pass, $controller, $uibModalInstance, $scope, passholderService, $q;
  beforeEach(module('ubr.passholder'));
  beforeEach(module('uitpasbeheerApp'));

  beforeEach(inject(function (_$controller_, $rootScope, $injector) {
    $controller = _$controller_;
    $uibModalInstance = jasmine.createSpyObj('$uibModalInstance', ['dismiss']);
    $scope = $rootScope.$new();
    $q = $injector.get('$q');
    passholderService = $injector.get('passholderService');
    expectedCheckins = [
      {
        'creation_date': '2015-10-26',
        'title': 'Evenement 1',
        'points': '+1'
      },
      {
        'creation_date': '2015-10-26',
        'title': 'Voordeel 1',
        'points': '-16'
      },
      {
        'creation_date': '2015-10-23',
        'title': 'Evenement 2',
        'points': '+1'
      },
      {
        'creation_date': '2015-10-23',
        'title': 'Voordeel 2',
        'points': '-15'
      },
      {
        'creation_date': '2015-10-21',
        'title': 'Evenement 3',
        'points': '+1'
      },
      {
        'creation_date': '2015-10-21',
        'title': 'Voordeel 3',
        'points': '-15'
      },
      {
        'creation_date': '2015-10-19',
        'title': 'Evenement 4',
        'points': '+1'
      },
      {
        'creation_date': '2015-10-19',
        'title': 'Voordeel 4',
        'points': '-3'
      },
      {
        'creation_date': '2015-10-16',
        'title': 'Evenement 5',
        'points': '+1'
      },
      {
        'creation_date': '2015-10-16',
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
    return $controller('CheckinsController', {
      pass: pass,
      passholder: pass.passholder,
      $uibModalInstance: $uibModalInstance,
      passholderService: passholderService
    });
  }

  it('should display all checkins and advantages', function () {
    spyOn(passholderService, 'getCheckins').and.returnValue($q.resolve(expectedCheckins));
    CheckinsController = getController();
    $scope.$apply();
    expect(CheckinsController.checkins).toEqual(expectedCheckins);
  });

  it('can close the modal', function () {
    CheckinsController = getController();
    CheckinsController.cancel();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });
});
