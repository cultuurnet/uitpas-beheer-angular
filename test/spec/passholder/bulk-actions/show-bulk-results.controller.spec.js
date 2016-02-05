'use strict';

describe('Controller: ShowBulkResultsController', function () {

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
      ],
      'asyncError': {
        'message': '',
        'type': ''
      }
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
  beforeEach(module('uitpasbeheerApp'));

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

    passholderService = jasmine.createSpyObj('passholderService', ['update']);

    controller = $controller('ShowBulkResultsController', {
      passholders: passholders,
      bulkAddressForm: getSpyForm(),
      $uibModalStack: $uibModalStack,
      asyncError: jasmine.createSpy('asyncError'),
      $scope: $scope
    });
  }));

  it('should initialize', function () {
    expect(controller.passholders).not.toBe(null);
  });

  it('shoud update all the passholders', function () {
    passholderService.update.and.returnValue($q.resolve(passholders));
    controller.passholderService = passholderService;

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.address.city).toEqual('Brussel');
      expect(passholder.address.postalCode).toEqual('1000');
      expect(passholder.address.street).toEqual('asdfasdfasd');
      expect(passholder.updated).toBeTruthy();
    });
  });

  fit('should fail in updating the passholder because the action is not allowed', function () {
    /*controller.bulkAddressForm = getSpyForm({
      zip: {
        $viewValue: '!@#!#'
      }
    });*/

    var apiError = {
      apiError: {
        code: 'ACTION_NOT_ALLOWED'
      }
    };

    passholderService.update.and.returnValue($q.reject(apiError));
    controller.passholderService = passholderService;

    angular.forEach(controller.passholders, function(passholder) {
      //expect(passholder.asyncError.message).toEqual('Actie niet toegestaan.');
      //expect(passholder.asyncError.type).toEqual('danger');
      expect(passholder.isChecked).toBeTruthy();
    });
    //expect(controller.asyncError.message).toEqual('Actie niet toegestaan.');
    //expect(controller.asyncError.type).toEqual('danger');
  });

  it('can close all modals', function () {
    controller.cancel();
    expect($uibModalStack.dismissAll).toHaveBeenCalled();
  });
});