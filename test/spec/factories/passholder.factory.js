'use strict';

describe('Factory: Passholder', function () {

  beforeEach(module('uitpasbeheerApp'));

  var jsonPassholder = {
    'name': {
      'first': 'Victor',
      'last': 'D\'Hooghe'
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
    'remarks': 'remarks'
  };

  var Passholder, day;

  beforeEach(inject(function (_Passholder_, _day_) {
    Passholder = _Passholder_;
    day = _day_
  }));

  function getJsonPassholder() {
    return angular.copy(jsonPassholder);
  }

  it('should correctly parse a passholder with a missing picture', function () {
    var jsonPassholder = getJsonPassholder();

    var expectedPassholder = {
      name: {
        first: 'Victor',
        last: 'D\'Hooghe'
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
      picture: 'data:image/jpeg;base64, ' + 'picture-in-base64-format',
      inszNumber: '',
      remarks: 'remarks'
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

  it('should not create duplicate kansenstatuten when parsing new kansenstatuut data', function () {
    var originalPassholderData = getJsonPassholder();
    var passholder = new Passholder(originalPassholderData);
    var expectedKansenstatuten = angular.copy(passholder.kansenStatuten);
    var updatedPassholderData = getJsonPassholder();

    passholder.parseJson(updatedPassholderData);
    expect(passholder.kansenStatuten).toEqual(expectedKansenstatuten);
  });
});
