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
      'points': 309
    };

    var expectedPassholder = {
      name: {
        first: 'Victor',
        last: 'D\'Hooghe'
      },
      address: {
        postalCode: '9308',
        city: 'Aalst'
      },
      birth: {
        date: new Date('2007-11-15'),
        place: 'Aalst'
      },
      gender: 'MALE',
      nationality: 'belg',
      privacy: {
        email: false,
        sms: false
      },
      points: 309
    };

    var passholder = new Passholder(jsonPassholder);

    expect(passholder).toEqual(expectedPassholder);

  }));
});