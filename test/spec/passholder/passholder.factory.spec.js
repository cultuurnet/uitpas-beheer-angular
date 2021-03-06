'use strict';

describe('Factory: Passholder', function () {

  beforeEach(module('uitpasbeheerApp'));

  var jsonPassholder = {
    'name': {
      'first': 'Victor',
      'last': 'DHooghe',
      'middle': 'Vikky'
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
    'picture': 'picture-in-base64-format',
    'remarks': 'remarks',
    'school': null,
    'uid': 'e1e2b335-e756-4e72-bb0f-3d163a583b35',
    'cardSystems': [
      {
        name: 'UiTPAS Regio Aalst',
        id: '1'
      },
      {
        name: 'UiTPAS Regio Gent',
        id: '2'
      }
    ]
  };

  var Passholder, day;

  beforeEach(inject(function (_Passholder_, _day_) {
    Passholder = _Passholder_;
    day = _day_;
  }));

  function getJsonPassholder() {
    return angular.copy(jsonPassholder);
  }

  it('should correctly parse a passholder with a missing picture', function () {
    var jsonPassholder = getJsonPassholder();
    delete jsonPassholder.cardSystems;

    var expectedPassholder = {
      name: {
        first: 'Victor',
        last: 'DHooghe',
        middle: 'Vikky'
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
      kansenStatuten: [{
        status: 'ACTIVE',
        endDate: day('2015-12-06', 'YYYY-MM-DD').toDate(),
        cardSystem: {
          name: 'UiTPAS Regio Aalst',
          id: '1'
        }
      }],
      points: 309,
      picture: 'picture-in-base64-format',
      inszNumber: '',
      remarks: 'remarks',
      school: null,
      uid: 'e1e2b335-e756-4e72-bb0f-3d163a583b35',
      uitPassen: [],
      cardSystems: [],
      optInPreferences: {
        'serviceMails': false,
        'milestoneMails': false,
        'infoMails': false,
        'sms': false,
        'post': false
      }
    };

    var passholder = new Passholder(jsonPassholder);

    expect(passholder).toEqual(expectedPassholder);
  });

  it('should overwrite existing contact info with defaults when parsing data without a contact property', function() {
    var existingPassholder = new Passholder(getJsonPassholder());
    var expectedContactInfo = {
      email: '',
      telephoneNumber: '',
      mobileNumber: ''
    };
    var newPassholderData = getJsonPassholder();
    delete newPassholderData.contact;

    expect(existingPassholder.contact.email).toEqual('email@email.com');
    expect(newPassholderData.contact).not.toBeDefined();

    existingPassholder.parseJson(newPassholderData);
    expect(existingPassholder.contact).toEqual(expectedContactInfo);
  });

  it('should return a kansenstatuut for a given card system ID', function () {
    var expectedKansenstatuut = {
      status: 'ACTIVE',
      endDate: day('2015-12-06', 'YYYY-MM-DD').toDate(),
      cardSystem: {
        name: 'UiTPAS Regio Aalst',
        id: '1'
      }
    };
    var passholder = new Passholder(getJsonPassholder());

    var kansenstatuut = passholder.getKansenstatuutByCardSystemID('1');

    expect(kansenstatuut).toEqual(expectedKansenstatuut);
  });

  it('should return the status of an Uitpas for a given card system ID', function () {
    var passholder = new Passholder(getJsonPassholder());
    passholder.uitPassen = [
      {
        number: '0930000422202',
        kansenStatuut: true,
        status: 'ACTIVE',
        type: 'CARD',
        cardSystem: {
          id: '1',
          name: 'UiTPAS Regio Aalst'
        }
      }
    ];
    var status = passholder.getUitpasStatusInCardSystemID('1');

    expect(status).toEqual('ACTIVE');
  });

  it('should not create duplicate kansenstatuten when parsing new kansenstatuut data', function () {
    var originalPassholderData = getJsonPassholder();
    var passholder = new Passholder(originalPassholderData);
    var expectedKansenstatuten = angular.copy(passholder.kansenStatuten);
    var updatedPassholderData = getJsonPassholder();

    passholder.parseJson(updatedPassholderData);
    expect(passholder.kansenStatuten).toEqual(expectedKansenstatuten);
  });

  it('should correctly parse a passholder with uitPassen', function () {
    var school = {
      'name': 'De Zonnewijzer',
      'id': '550e8400-e29b-41d4-a716-446655440000'
    };
    var jsonPassholder = getJsonPassholder();
    jsonPassholder.uitpassen = [
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
    ];
    jsonPassholder.inszNumber = 'insz';
    jsonPassholder.school = school;

    var expectedPassholder = {
      name: {
        first: 'Victor',
        last: 'DHooghe',
        middle: 'Vikky'
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
      kansenStatuten: [{
        status: 'ACTIVE',
        endDate: day('2015-12-06', 'YYYY-MM-DD').toDate(),
        cardSystem: {
          name: 'UiTPAS Regio Aalst',
          id: '1'
        }
      }],
      points: 309,
      picture: 'picture-in-base64-format',
      inszNumber: 'insz',
      remarks: 'remarks',
      school: school,
      uid: 'e1e2b335-e756-4e72-bb0f-3d163a583b35',
      uitPassen: [
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
      ],
      cardSystems: [
        {
          name: 'UiTPAS Regio Aalst',
          id: '1'
        },
        {
          name: 'UiTPAS Regio Gent',
          id: '2'
        }
      ],
      optInPreferences: {
        'serviceMails': false,
        'milestoneMails': false,
        'infoMails': false,
        'sms': false,
        'post': false
      }
    };

    var passholder = new Passholder(jsonPassholder);

    expect(passholder).toEqual(expectedPassholder);
  });

  it('has a helper function to return the full name', function () {
    var expectedFullName = 'Victor Vikky DHooghe';
    var passholder = new Passholder(getJsonPassholder());

    expect(passholder.getFullName()).toEqual(expectedFullName);
  });

  it('has a helper function to return the names', function () {
    var expectedNames = 'Victor Vikky';
    var passholder = new Passholder(getJsonPassholder());

    expect(passholder.getNames()).toEqual(expectedNames);
  });

  it('has a helper function to return the picture source', function () {
    var expectedPictureSrc = 'data:image/jpeg;base64, ' + 'picture-in-base64-format';
    var passholder = new Passholder(getJsonPassholder());

    expect(passholder.getPictureSrc()).toEqual(expectedPictureSrc);
  });

  it('has a helper function to serialize the passholder', function () {
    var expectedSerializedData = {
      name: {
        first: 'Victor',
        last: 'DHooghe',
        middle: 'Vikky'
      },
      address: {
        street: 'Baanweg 60',
        postalCode: '9308',
        city: 'Aalst'
      },
      birth: {
        date: '2007-11-15',
        place: 'Aalst'
      },
      inszNumber: '',
      picture: 'picture-in-base64-format',
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
          endDate: '2015-12-06',
          cardSystem: {
            id: '1',
            name: 'UiTPAS Regio Aalst'
          }
        }
      ],
      remarks: 'remarks',
      school: null,
      uid: 'e1e2b335-e756-4e72-bb0f-3d163a583b35',
      cardSystems: [
        {
          name: 'UiTPAS Regio Aalst',
          id: '1'
        },
        {
          name: 'UiTPAS Regio Gent',
          id: '2'
        }
      ],
      optInPreferences: {
        'serviceMails': false,
        'milestoneMails': false,
        'infoMails': false,
        'sms': false,
        'post': false
      }
    };
    var passholder = new Passholder(getJsonPassholder());

    expect(passholder.serialize()).toEqual(expectedSerializedData);
  });

  it('has a helper function to check if a passholder has an uitpas in a given card system', function () {
    var cardSystemToCheckTruthy = {
      id: 1
    };
    var cardSystemToCheckFalsy = {
      id: 5
    };

    var jsonPassholder = getJsonPassholder();
    jsonPassholder.uitpassen = [
      {
        cardSystem: {
          id: 1,
          name: 'UiTPAS Leuven'
        }
      },
      {
        cardSystem: {
          id: 3,
          name: 'UiTPAS Aalst'
        }
      }
    ];

    var passholder = new Passholder(jsonPassholder);

    expect(passholder.hasUitPasInCardSystem(cardSystemToCheckTruthy)).toBeTruthy();
    expect(passholder.hasUitPasInCardSystem(cardSystemToCheckFalsy)).toBeFalsy();
  });

  it('has a helper function to check if a passholder his registered in a given card system', function () {
    var cardSystemToCheckTruthy = {
      id: 1
    };
    var cardSystemToCheckFalsy = {
      id: 5
    };

    var jsonPassholder = getJsonPassholder();
    jsonPassholder.cardSystems = [
       {
        id: 1,
        name: 'UiTPAS Leuven'
      },
      {
        id: 3,
        name: 'UiTPAS Aalst'
      }
    ];

    var passholder = new Passholder(jsonPassholder);

    expect(passholder.isRegisteredInCardSystem(cardSystemToCheckTruthy)).toBeTruthy();
    expect(passholder.isRegisteredInCardSystem(cardSystemToCheckFalsy)).toBeFalsy();
  });
});
