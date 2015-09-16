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
    'points': 309,
    'picture': 'picture-in-base64-format'
  };

  function getJsonPassholder() {
    return angular.copy(jsonPassholder);
  }

  it('should correctly parse a passholder with a missing picture', inject(function (Passholder, day) {
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
      points: 309,
      picture: 'data:image/jpeg;base64, ' + 'picture-in-base64-format',
      inszNumber: ''
    };

    var passholder = new Passholder(jsonPassholder);

    expect(passholder).toEqual(expectedPassholder);

  }));

  it('should overwrite existing contact info with defaults when parsing data without a contact property', inject(function (Passholder){
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
  }));
});
