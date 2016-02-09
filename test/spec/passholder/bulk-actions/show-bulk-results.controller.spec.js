'use strict';

fdescribe('Controller: ShowBulkResultsController', function () {

  var $controller, $uibModalStack, $scope, $state, controller, passholders, passholderService, Passholder, $q;

  var jsonPassHolder = {
      'uid': 'string',
      'name': {
        'first': 'John',
        'middle': 'Lupus',
        'last': 'Smith'
      },
      'address': {
        'street': 'Steenweg op Aalst 94',
        'postalCode': '9308',
        'city': 'Aalst'
      },
      'birth': {
        'date': '2003-12-26',
        'place': 'Sint-Agatha-Berchem'
      },
      'inszNumber': '93051822361',
      'gender': 'MALE',
      'nationality': 'Belg',
      'picture': 'R0lGODlhDwAPAKECAAAAzMzM/////wAAACwAAAAADwAPAAACIISPeQHsrZ5ModrLlN48CXF8m2iQ3YmmKqVlRtW4MLwWACH+H09wdGltaXplZCBieSBVbGVhZCBTbWFydFNhdmVyIQAAOw==',
      'contact': {
        'email': 'foo@bar.com',
        'telephoneNumber': '016454545',
        'mobileNumber': '+32 498 77 88 99'
      },
      'privacy': {
        'email': true,
        'sms': true
      },
      'points': 40,
      'remarks': 'Dit maakt niet uit.',
      'kansenStatuten': [
        {
          'status': 'ACTIVE',
          'endDate': '2015-12-26',
          'cardSystem': {
            'id': '4a567b89',
            'name': 'UiTPAS Regio Aalst'
          }
        }
      ],
      'uitPassen': [
        {
          'number': '0930000422202',
          'kansenStatuut': true,
          'status': 'LOCAL_STOCK',
          'type': 'CARD',
          'cardSystem': {
            'id': '4a567b89',
            'name': 'UiTPAS Regio Aalst'
          }
        }
      ]
  };

  var getSpyForm = function (formData) {
    var spyForm = {
      $valid: true,
      $setSubmitted: jasmine.createSpy('$setSubmitted'),
      city: {
        $viewValue: 'Brussel'
      },
      zip: {
        $viewValue: '1000'
      },
      street: {
        $viewValue: 'asdfasdfasd'
      }
    };

    if (formData) {
      angular.merge(spyForm, formData);
    }

    return spyForm;
  };

  // load the controller's module
  beforeEach(module('ubr.passholder'));
  beforeEach(module('uitpasbeheerApp', function($provide) {
    passholderService = jasmine.createSpyObj('passholderService', ['update']);
    $provide.provider('passholderService', {
      $get: function () {
        return passholderService;
      }
    });
  }));

  beforeEach(inject(function (_$controller_, $rootScope, $injector, _$state_) {
    $controller = _$controller_;
    $state = _$state_;
    $scope = $rootScope.$new();
    $uibModalStack = jasmine.createSpyObj('$uibModalStack', ['dismissAll']);
    $q = $injector.get('$q');
    Passholder = $injector.get('Passholder');
    var jsonParsePassHolder = new Passholder(jsonPassHolder);

    passholders = [
      jsonParsePassHolder,
      jsonParsePassHolder,
      jsonParsePassHolder,
      jsonParsePassHolder,
      jsonParsePassHolder
    ];

    passholderService.update.and.callFake(function () {
      return $q.resolve(passholders[0]);
    });

    controller = getController();
  }));

  var getController = function () {
    return $controller('ShowBulkResultsController', {
      passholders: passholders,
      bulkAddressForm: getSpyForm(),
      passholderService: passholderService,
      $uibModalStack: $uibModalStack
    });
  };

  it('should initialize', function () {
    expect(controller.passholders).not.toBe(null);
  });

  it('should update all the passholders', function () {
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.address.city).toEqual('Brussel');
      expect(passholder.address.postalCode).toEqual('1000');
      expect(passholder.address.street).toEqual('asdfasdfasd');
      expect(passholder.updated).toBeTruthy();
    });
  });

  it('should fail in updating the passholder because the action is not allowed', function () {
    passholderService.update.and.callFake(function () {
      var apiError = {
        code: 'ACTION_NOT_ALLOWED'
      };
      return $q.reject(apiError);
    });
    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.asyncError.message).toEqual('Actie niet toegestaan.');
      expect(passholder.asyncError.type).toEqual('danger');
      expect(passholder.isChecked).toBeTruthy();
    });
  });

  it('can close all modals', function () {
    controller.cancel();
    expect($uibModalStack.dismissAll).toHaveBeenCalled();
  });
});
