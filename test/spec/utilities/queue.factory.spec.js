'use strict';

describe('Factory: Queue', function () {

  beforeEach(module('uitpasbeheerApp'));

  var Queue, passholderService, $q, queue, $scope;

  beforeEach(module('uitpasbeheerApp', function($provide) {
    passholderService = jasmine.createSpyObj('passholderService', ['update']);
    $provide.provider('passholderService', {
      $get: function () {
        return passholderService;
      }
    });
  }));

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

  var spyUpdatePassholder = function() {
    return passholderService.update(jsonPassHolder, jsonPassHolder.inszNumber);
  };

  beforeEach(inject(function ($injector) {
    $q = $injector.get('$q');
    $scope = $injector.get('$rootScope');

    Queue = $injector.get('Queue');
    queue = new Queue(4);
    spyOn(queue, 'enqueue').and.callThrough();
  }));

  it('should correctly add more jobs to the queue and start manually executing them', function () {
    passholderService.update.and.callFake(function() {
      return $q.resolve('asdfasdf');
    });

    for(var i = 0; i < 6; i++) {
      queue.enqueue(spyUpdatePassholder);
    }

    expect(queue.enqueue.calls.count()).toBe(6);
    expect(passholderService.update.calls.count()).toBe(0);

    queue.startProcessingQueue();
    expect(passholderService.update.calls.count()).toBe(4);

    $scope.$digest();
    expect(passholderService.update.calls.count()).toBe(6);
  });

  it('should fail when callbacks does not return promises', function () {
    for(var i = 0; i < 6; i++) {
      queue.enqueue(spyUpdatePassholder);
    }

    expect(queue.enqueue.calls.count()).toBe(6);
    expect(passholderService.update.calls.count()).toBe(0);
  });

  it('should correctly add more jobs to the queue and automatically start executing them', function () {
    queue = new Queue(4, true);
    spyOn(queue, 'enqueue').and.callThrough();

    passholderService.update.and.callFake(function() {
      return $q.resolve('asdfasdf');
    });

    for(var i = 0; i < 6; i++) {
      queue.enqueue(spyUpdatePassholder);
    }

    expect(queue.enqueue.calls.count()).toBe(6);
    expect(passholderService.update.calls.count()).toBe(4);

    $scope.$digest();
    expect(passholderService.update.calls.count()).toBe(6);

  });
});
