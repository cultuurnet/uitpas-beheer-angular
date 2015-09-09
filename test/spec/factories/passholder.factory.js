'use strict';

describe('Factory: Passholder', function () {

  beforeEach(module('uitpasbeheerApp'));

  it('should correctly parse a passholder with a missing picture', inject(function (Passholder) {
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
        date: moment('2007-11-15'),
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
});
