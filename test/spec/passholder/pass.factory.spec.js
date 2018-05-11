'use strict';

describe('Factory: Pass', function () {

  beforeEach(module('uitpasbeheerApp'));

  var Pass, Passholder, day;

  beforeEach(inject(function (_Pass_, _day_, _Passholder_) {
    Pass = _Pass_;
    day = _day_;
    Passholder = _Passholder_;
  }));


  var jsonUitpasBase = {
    'number': '0930000422202',
    'kansenStatuut': false,
    'status': 'ACTIVE',
    'type': 'CARD',
    cardSystem: {
      name: 'UiTPAS Regio Aalst',
      id: '1'
    }
  };

  var jsonPassholderBase = {
    'name': {
      'first': 'Victor',
      'last': 'DHooghe'
    },
    'address': {
      'street': 'Baanweg 60',
      'postalCode': '9308',
      'city': 'Aalst'
    },
    'birth': {
      'date': '2007-11-15',
      'place': 'Aalst'
    },
    'gender': 'MALE',
    'nationality': 'belg',
    'privacy': {
      'email': false,
      'sms': false
    },
    'contact': {
      'email': 'email@email.com'
    },
    kansenStatuten: [{
      status: 'ACTIVE',
      endDate: '2015-12-06',
      cardSystem: {
        name: 'UiTPAS Regio Aalst',
        id: '1'
      }
    }],
    'points': 309,
    'remarks': 'remarks',
    'school': null,
    'uid': 'e1e2b335-e756-4e72-bb0f-3d163a583b35',
    'uitpassen': [
      {
        'number': '0930000422202',
        'kansenStatuut': false,
        'status': 'ACTIVE',
        'type': 'CARD',
        'cardSystem': {
          name: 'UiTPAS Regio Aalst',
          id: '1'
        }
      }
    ]
  };

  var jsonGroupBase = {
    name: 'Wij hebben een groupje',
    availableTickets: 25
  };

  function getJsonPassWithPassholder() {
    return {
      'uitPas': angular.copy(jsonUitpasBase),
      'passHolder': angular.copy(jsonPassholderBase)
    };
  }

  function getJsonPassWithGroup() {
    return {
      'uitPas': angular.copy(jsonUitpasBase),
      'group': angular.copy(jsonGroupBase)
    };
  }

  it('should correctly parse a pass with a passholder', function () {
    var jsonPass = getJsonPassWithPassholder();

    var expectedPass = {
      number: '0930000422202',
      kansenStatuut: false,
      status: 'ACTIVE',
      type: 'CARD',
      passholder: {
        name: {
          first: 'Victor',
          last: 'DHooghe'
        },
        address: {
          street: 'Baanweg 60',
          postalCode: '9308',
          city: 'Aalst'
        },
        birth: {
          date: day('2007-11-15', 'YYYY-MM-DD').toDate(),
          place: 'Aalst'
        },
        inszNumber: '',
        picture: '',
        gender: 'MALE',
        nationality: 'belg',
        privacy: {
          email: false,
          sms: false
        },
        contact: {
          email: 'email@email.com',
          telephoneNumber: '',
          mobileNumber: ''
        },
        points: 309,
        kansenStatuten: [
          {
            status: 'ACTIVE',
            endDate: day('2015-12-06', 'YYYY-MM-DD').toDate(),
            cardSystem: {
              id: '1',
              name: 'UiTPAS Regio Aalst'
            }
          }
        ],
        uitPassen: [
          {
            number: '0930000422202',
            kansenStatuut: false,
            status: 'ACTIVE',
            type: 'CARD',
            cardSystem: {
              id: '1',
              name: 'UiTPAS Regio Aalst'
            }
          }
        ],
        remarks: 'remarks',
        school: null,
        uid: 'e1e2b335-e756-4e72-bb0f-3d163a583b35',
        passNumber: '0930000422202',
        cardSystems: [],
        optInPreferences: {
          'serviceMails': false,
          'milestoneMails': false,
          'infoMails': false,
          'sms': false,
          'post': false
        }
      },
      cardSystem: {
        id: '1',
        name: 'UiTPAS Regio Aalst'
      }
    };

    var pass = new Pass(jsonPass);

    expect(pass).toEqual(expectedPass);
  });

  it('should correctly parse a pass with a group', function () {
    var jsonPass = getJsonPassWithGroup();

    var expectedPass = {
      number: '0930000422202',
      kansenStatuut: false,
      status: 'ACTIVE',
      type: 'CARD',
      group: {
        passNumber: '0930000422202',
        name: 'Wij hebben een groupje',
        availableTickets: 25
      },
      cardSystem: {
        id: '1',
        name: 'UiTPAS Regio Aalst'
      }
    };

    var pass = new Pass(jsonPass);

    expect(pass).toEqual(expectedPass);
  });

  it('should correctly parse an empty pass', function () {
    var jsonPass = {
      uitPas: angular.copy(jsonUitpasBase)
    };

    jsonPass.uitPas.kansenStatuut = true;
    jsonPass.uitPas.status = 'LOCAL_STOCK';

    var expectedPass = {
      number: '0930000422202',
      kansenStatuut: true,
      status: 'LOCAL_STOCK',
      type: 'CARD',
      cardSystem: {
        id: '1',
        name: 'UiTPAS Regio Aalst'
      }
    };

    var pass = new Pass(jsonPass);

    expect(pass).toEqual(expectedPass);
    expect(pass.isKansenstatuut()).toBeTruthy();
    expect(pass.isLocalStock()).toBeTruthy();
  });

  it('has helper functions to get information about the pass', function () {
    var jsonPass = getJsonPassWithPassholder();

    var pass = new Pass(jsonPass);

    expect(pass.isKansenstatuut()).toBeFalsy();
    expect(pass.isBlocked()).toBeFalsy();
    expect(pass.isLocalStock()).toBeFalsy();
  });

  it('has a helper function to check if a kansenstatuut is expired', function () {
    var jsonPass = getJsonPassWithPassholder();

    var pass = new Pass(jsonPass);

    expect(pass.kansenstatuutExpired(pass.passholder)).toBeFalsy();

    jsonPass.passHolder.kansenStatuten[0].status = 'EXPIRED';
    var expiredPass = new Pass(jsonPass);

    expect(expiredPass.kansenstatuutExpired(expiredPass.passholder)).toBeTruthy();
  });
});
