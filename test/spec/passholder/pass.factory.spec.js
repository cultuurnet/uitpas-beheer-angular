'use strict';

describe('Factory: Pass', function () {

  beforeEach(module('uitpasbeheerApp'));

  var Pass, Passholder, day;

  beforeEach(inject(function (_Pass_, _day_) {
    Pass = _Pass_;
    day = _day_;
    Passholder = jasmine.createSpyObj('Passholder', ['parseJson', 'getKansenstatuutByCardSystemID']);
  }));

  var identityData = {
    'uitPas': {
      'number': '0930000422202',
      'kansenStatuut': false,
      'status': 'ACTIVE',
      'type': 'CARD',
      cardSystem: {
        name: 'UiTPAS Regio Aalst',
        id: '1'
      }
    },
    'passHolder': {
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
      'uid': 'e1e2b335-e756-4e72-bb0f-3d163a583b35',
      'uitPassen': [
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
    }
  };

  function getJsonPass() {
    return angular.copy(identityData);
  }

  it('should correctly parse a pass', function () {
    var jsonPass = getJsonPass();

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
        uitPassen: [],
        remarks: 'remarks',
        uid: 'e1e2b335-e756-4e72-bb0f-3d163a583b35',
        passNumber: '0930000422202'
      },
      cardSystem: {
        id: '1',
        name: 'UiTPAS Regio Aalst'
      }
    };

    var pass = new Pass(jsonPass);

    expect(pass).toEqual(expectedPass);

  });
});
