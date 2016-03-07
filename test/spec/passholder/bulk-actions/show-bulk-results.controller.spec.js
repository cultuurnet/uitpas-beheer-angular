'use strict';

describe('Controller: ShowBulkResultsController', function () {

  var $controller, $uibModalStack, $scope, $state, controller, passholders, passholderService, Passholder, $q,
    Counter, activeCounter, activityService, action, bulkForm, day, activity, Activity;

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
            'id': '1',
            'name': 'UiTPAS Dender'
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
            'id': '1',
            'name': 'UiTPAS Dender'
          }
        }
      ]
  };

  var activeCounterJson = {
    'id': '452',
    'consumerKey': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
    'name': 'CC de Werf',
    'role': 'admin',
    'actorId': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
    'cardSystems': {
      '1': {
        'permissions': ['kansenstatuut toekennen'],
        'groups': ['Geauthorizeerde registratie balies'],
        'id': 1,
        'name': 'UiTPAS Dender',
        'distributionKeys': []
      }
    },
    'permissions': ['kansenstatuut toekennen'],
    'groups': ['Geauthorizeerde registratie balies']
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

  var getSpyDateForm = function (formData) {
    var spyForm = {
      $valid: true,
      $setSubmitted: jasmine.createSpy('$setSubmitted'),
      endDate: {
        $viewValue: '2016-12-31'
      }
    };

    if (formData) {
      angular.merge(spyForm, formData);
    }

    return spyForm;
  };

  function getJsonActivity() {
    var jsonActivity = {
      'id': 'e71f3381-21aa-4f73-a860-17cf3e31f013',
      'title': 'Altijd open',
      'description': '',
      'when': '',
      'age': 10,
      'points': 182,
      'checkinConstraint': {
        'allowed': true,
        'startDate': '2015-09-01T00:00:00+00:00',
        'endDate': '2015-09-01T23:59:59+00:00',
        'reason': ''
      },
      free: true,
      sales: {
        maximumReached: false,
        differentiation: false,
        base: {
          'Default prijsklasse': 6
        },
        tariffs: {
          kansentariefAvailable: true,
          couponAvailable: false,
          lowestAvailable: 1.5,
          list: [
            {
              name: 'Kansentarief',
              type: 'KANSENTARIEF',
              maximumReached: false,
              prices: {
                'Default prijsklasse': 1.5
              }
            }
          ]
        }
      }
    };

    return angular.copy(jsonActivity);
  }

  // load the controller's module
  beforeEach(module('ubr.passholder'));
  beforeEach(module('uitpasbeheerApp', function($provide) {
    passholderService = jasmine.createSpyObj('passholderService', ['update', 'renewKansenstatuut']);
    $provide.provider('passholderService', {
      $get: function () {
        return passholderService;
      }
    });
    activityService = jasmine.createSpyObj('activityService', ['checkin']);
    $provide.provider('activityService', {
      $get: function () {
        return activityService;
      }
    });
  }));

  beforeEach(inject(function (_$controller_, $rootScope, $injector, _$state_, _day_) {
    $controller = _$controller_;
    $state = _$state_;
    $scope = $rootScope.$new();
    day = _day_;
    $uibModalStack = jasmine.createSpyObj('$uibModalStack', ['dismissAll']);
    $q = $injector.get('$q');
    Passholder = $injector.get('Passholder');
    Activity = $injector.get('Activity');
    var jsonParsePassHolder = new Passholder(jsonPassHolder);
    Counter = $injector.get('Counter');
    activeCounter = new Counter(angular.copy(activeCounterJson));
    activity = new Activity(getJsonActivity());

    passholders = [
      jsonParsePassHolder,
      jsonParsePassHolder,
      jsonParsePassHolder,
      jsonParsePassHolder,
      jsonParsePassHolder
    ];

    bulkForm = getSpyForm();
    action = 'address';

    passholderService.update.and.callFake(function () {
      return $q.resolve(passholders[0]);
    });

    controller = getController();
  }));

  var getController = function () {
    return $controller('ShowBulkResultsController', {
      passholders: passholders,
      bulkForm: bulkForm,
      action: action,
      passholderService: passholderService,
      activityService: activityService,
      $uibModalStack: $uibModalStack,
      activeCounter: activeCounter,
      activity: activity
    });
  };

  it('should initialize', function () {
    expect(controller.passholders).not.toBe(null);
  });

  it('can close all modals', function () {
    controller.cancel();
    expect($uibModalStack.dismissAll).toHaveBeenCalledWith('bulkResultsClosed');
  });

  it('should update all the passholders address', function () {
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.address.city).toEqual('Brussel');
      expect(passholder.address.postalCode).toEqual('1000');
      expect(passholder.address.street).toEqual('asdfasdfasd');
      expect(passholder.updated).toBeTruthy();
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.beingProcessed).toBeFalsy();
    });
  });

  it('should fail in updating the passholder address because the action is not allowed', function () {
    passholderService.update.and.callFake(function () {
      var apiError = {
        code: 'ACTION_NOT_ALLOWED'
      };
      return $q.reject(apiError);
    });
    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.failed).toBeTruthy();
      expect(passholder.beingProcessed).toBeFalsy();
      expect(passholder.asyncError.message).toEqual('Actie niet toegestaan.');
      expect(passholder.asyncError.type).toEqual('danger');
    });
  });

  it('should fail in updating the passholder address because the passholder could not be updated', function () {
    passholderService.update.and.callFake(function () {
      var apiError = {
        code: 'PASSHOLDER_NOT_UPDATED_ON_SERVER'
      };
      return $q.reject(apiError);
    });
    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.failed).toBeTruthy();
      expect(passholder.beingProcessed).toBeFalsy();
      expect(passholder.asyncError.message).toEqual('Pashouder werd niet geüpdatet op de server.');
      expect(passholder.asyncError.type).toEqual('danger');
    });
  });

  it('should fail in updating the passholder address because something unknown went wrong', function () {
    passholderService.update.and.callFake(function () {
      var apiError = {
        code: 'SOMETHING_ELSE_WENT_WRONG'
      };
      return $q.reject(apiError);
    });
    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.failed).toBeTruthy();
      expect(passholder.beingProcessed).toBeFalsy();
      expect(passholder.asyncError.message).toEqual('Pashouder werd niet geüpdatet op de server.');
      expect(passholder.asyncError.type).toEqual('danger');
    });
  });

  it('should renew the passholders kansenstatuut', function() {
    action = 'kansenstatuut';
    bulkForm = getSpyDateForm();
    passholderService.renewKansenstatuut.and.callFake(function () {
      return $q.resolve(passholders[0]);
    });

    controller = getController();

    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.kansenStatuten[0].endDate).toEqual(day('2015-12-26', 'YYYY-MM-DD').toDate());
      expect(passholder.updated).toBeTruthy();
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.beingProcessed).toBeFalsy();
    });
  });

  it('should fail in renewing the passholder his kansenstatuut because the date is invalid', function () {
    action = 'kansenstatuut';
    bulkForm = getSpyDateForm();
    passholderService.renewKansenstatuut.and.callFake(function () {
      var apiError = {
        data: {
          code: 'KANSENSTATUUT_END_DATE_INVALID'
        }
      };
      return $q.reject(apiError);
    });

    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.asyncError.message).toEqual('Geen geldige einddatum voor kansenstatuut');
      expect(passholder.asyncError.type).toEqual('danger');
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.beingProcessed).toBeFalsy();
    });
  });

  it('should fail in renewing the passholder his kansenstatuut because the date constraint is invalid', function () {
    action = 'kansenstatuut';
    bulkForm = getSpyDateForm();
    passholderService.renewKansenstatuut.and.callFake(function () {
      var apiError = {
        data: {
          code: 'INVALID_DATE_CONSTRAINTS'
        }
      };
      return $q.reject(apiError);
    });

    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.asyncError.message).toEqual('Geen geldige datum voor kansenstatuut');
      expect(passholder.asyncError.type).toEqual('danger');
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.beingProcessed).toBeFalsy();
    });
  });

  it('should fail in renewing the passholder his kansenstatuut because it was not updated on the server', function () {
    action = 'kansenstatuut';
    bulkForm = getSpyDateForm();
    passholderService.renewKansenstatuut.and.callFake(function () {
      var apiError = {
        data: {
          code: 'SOMETHING_ELSE_WENT_WRONG'
        }
      };
      return $q.reject(apiError);
    });

    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.asyncError.message).toEqual('Kansenstatuut werd niet geüpdatet op de server.');
      expect(passholder.asyncError.type).toEqual('danger');
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.beingProcessed).toBeFalsy();
    });
  });

  it('should fail in renewing the passholder his kansenstatuut because the passholder has no kansenstatuut', function () {
    action = 'kansenstatuut';
    bulkForm = getSpyDateForm();
    jsonPassHolder.kansenStatuten = [];
    var jsonParsePassHolder = new Passholder(jsonPassHolder);
    passholders = [
      jsonParsePassHolder
    ];

    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.asyncError.message).toEqual('Pashouder heeft geen kansenstatuut.');
      expect(passholder.asyncError.type).toEqual('danger');
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.beingProcessed).toBeFalsy();
    });
  });

  it('should fail in updating the passholder address because a wrong postalcode was given', function () {
    passholderService.update.and.callFake(function () {
      var error = {
        code: 'PASSHOLDER_NOT_UPDATED_ON_SERVER',
        apiError: {
          code: 'PARSE_INVALID_POSTAL_CODE'
        }
      };
      return $q.reject(error);
    });
    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.failed).toBeTruthy();
      expect(passholder.beingProcessed).toBeFalsy();
      expect(passholder.asyncError.message).toEqual('Geen geldige postcode voor het adres.');
      expect(passholder.asyncError.type).toEqual('danger');
    });
  });

  it('shoud checkin the passholder on the activity', function() {
    action = 'points';
    activityService.checkin.and.callFake(function () {
      return $q.resolve(activity);
    });

    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.updated).toBeTruthy();
      expect(passholder.isChecked).toBeTruthy();
    });
  });

  it('should fail in checking the passholders in on the given activity because of invalid card', function() {
    action = 'points';
    activityService.checkin.and.callFake(function () {
      var apiError = {
        code: 'INVALID_CARD_STATUS'
      };
      return $q.reject(apiError);
    });

    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.asyncError.message).toEqual('Punt sparen niet gelukt kaart geblokkeerd.');
      expect(passholder.asyncError.type).toEqual('danger');
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.failed).toBeTruthy();
    });
  });

  it('should fail in checking the passholders in on the given activity because of an expired kansenstatuut', function() {
    action = 'points';
    activityService.checkin.and.callFake(function () {
      var apiError = {
        code: 'KANSENSTATUUT_EXPIRED'
      };
      return $q.reject(apiError);
    });

    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.asyncError.message).toEqual('Punt sparen niet gelukt kansenstatuut vervallen.');
      expect(passholder.asyncError.type).toEqual('danger');
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.failed).toBeTruthy();
    });
  });

  it('should fail in checking the passholders in on the given activity because of maximum reached', function() {
    action = 'points';
    activityService.checkin.and.callFake(function () {
      var apiError = {
        code: 'MAXIMUM_REACHED'
      };
      return $q.reject(apiError);
    });

    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.asyncError.message).toEqual('Punt al gespaard.');
      expect(passholder.asyncError.type).toEqual('danger');
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.failed).toBeTruthy();
    });
  });

  it('should fail in checking the passholders in on the given activity because something else went wrong', function() {
    action = 'points';
    activityService.checkin.and.callFake(function () {
      var apiError = {
        code: 'SOMETHING_ELSE_WENT_WRONG'
      };
      return $q.reject(apiError);
    });

    controller = getController();
    $scope.$digest();

    angular.forEach(controller.passholders, function(passholder) {
      expect(passholder.asyncError.message).toEqual('Punt sparen niet gelukt.');
      expect(passholder.asyncError.type).toEqual('danger');
      expect(passholder.isChecked).toBeTruthy();
      expect(passholder.failed).toBeTruthy();
    });
  });
});
