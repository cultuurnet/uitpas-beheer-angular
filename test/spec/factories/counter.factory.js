'use strict';

describe('Factory: Counter', function () {

  beforeEach(module('uitpasbeheerApp'));

  var Counter;

  beforeEach(inject(function($injector) {
    Counter = $injector.get('Counter');
  }));

  function getJsonCounter(){
    var jsonCounter = {
      'id': '452',
      'consumerKey': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'name': 'Vierdewereldgroep Mensen voor Mensen',
      'role': 'admin',
      'actorId': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'cardSystems': {
        '1': {
          'permissions': ['registratie', 'kansenstatuut toekennen'],
          'groups': ['Geauthorizeerde registratie balies'],
          'id': 1,
          'name': 'UiTPAS Regio Aalst',
          'distributionKeys': []
        }
      },
      'permissions': ['registratie', 'kansenstatuut toekennen'],
      'groups': ['Geauthorizeerde registratie balies']
    };

    return jsonCounter;
  }

  it('should correctly parse a counter', function () {
    var jsonCounter = getJsonCounter();

    var expectedCounter = {
      'id': '452',
      'consumerKey': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'name': 'Vierdewereldgroep Mensen voor Mensen',
      'role': 'admin',
      'actorId': 'b95d1bcf-533d-45ac-afcd-e015cfe86c84',
      'cardSystems': {
        '1': {
          'permissions': ['registratie', 'kansenstatuut toekennen'],
          'groups': ['Geauthorizeerde registratie balies'],
          'id': 1,
          'name': 'UiTPAS Regio Aalst',
          'distributionKeys': []
        }
      },
      'permissions': ['registratie', 'kansenstatuut toekennen'],
      'groups': ['Geauthorizeerde registratie balies']
    };

    var counter = new Counter(jsonCounter);
    expect(counter).toEqual(expectedCounter);
    expect(counter.isRegistrationCounter).toBeDefined();
    expect(counter.isAuthorisedRegistrationCounter).toBeDefined();
  });

  it('should tell if a counter can register a passholder', function () {
    var counter = new Counter(getJsonCounter());
    var pass = {
      cardSystem: {
        id: 1
      }
    };

    expect(counter.isRegistrationCounter(pass)).toBeTruthy();
    expect(counter.isAuthorisedRegistrationCounter(pass)).toBeTruthy();

    counter.cardSystems[1].permissions = ['registratie'];
    expect(counter.isAuthorisedRegistrationCounter(pass)).toBeFalsy();

    counter.cardSystems[1].permissions = [];
    expect(counter.isRegistrationCounter(pass)).toBeFalsy();

    pass.cardSystem.id = 2;
    expect(counter.isRegistrationCounter(pass)).toBeFalsy();
  });
});
