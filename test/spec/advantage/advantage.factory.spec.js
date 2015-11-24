'use strict';

describe('Factory: Advantage', function () {

  beforeEach(module('ubr.advantage'));

  var Advantage, day, Counter;

  beforeEach(inject(function($injector) {
    Advantage = $injector.get('Advantage');
    Counter = $injector.get('Counter');
    day = $injector.get('day');
  }));

  function getJsonAdvantage(){
    var jsonAdvantage = {
      'id': 'welcome--390',
      'title': 'Korting op theaterticket.',
      'points': 5,
      'exchangeable': true,
      'description1': 'description 1: Nulla vitae elit libero, a pharetra augue. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Vestibulum id ligula porta felis euismod semper.',
      'description2': 'description 2: Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla vitae elit libero, a pharetra augue.',
      'validForCities': [
        'Leuven',
        'Aalst',
        'Mechelen',
        'Gent'
      ],
      'validForCounters': [],
      'endDate': '2016-09-10'
    };

    return jsonAdvantage;
  }

  it('should correctly parse an advantage with counters', function () {
    var jsonAdvantage = getJsonAdvantage();
    jsonAdvantage.validForCounters = [
      {
        'id': '392',
        'name': 'CC De Werf',
        'consumerKey': '31413BDF-DFC7-7A9F-10403618C2816E44',
        'role': 'admin',
        'actorId': '31413BDF-DFC7-7A9F-10403618C2816E44',
        'cardSystems': [
          {
            'permissions': [
              'registration'
            ],
            'groups': [
              'Can create passholders for other municipalities'
            ],
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': [
              'string'
            ]
          }
        ],
        'permissions': [
          'registration'
        ],
        'groups': [
          'Can create passholders for other municipalities'
        ]
      },
      {
        'id': '391',
        'name': 'WW De Cerf',
        'consumerKey': '31413BDF-DFC7-7A9F-10403618C2816E44',
        'role': 'admin',
        'actorId': '31413BDF-DFC7-7A9F-10403618C2816E44',
        'cardSystems': [
          {
            'permissions': [
              'registration'
            ],
            'groups': [
              'Can create passholders for other municipalities'
            ],
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': [
              'string'
            ]
          }
        ],
        'permissions': [
          'registration'
        ],
        'groups': [
          'Can create passholders for other municipalities'
        ]
      },
      {
        'id': '390',
        'name': 'DD We Cerf',
        'consumerKey': '31413BDF-DFC7-7A9F-10403618C2816E44',
        'role': 'admin',
        'actorId': '31413BDF-DFC7-7A9F-10403618C2816E44',
        'cardSystems': [
          {
            'permissions': [
              'registration'
            ],
            'groups': [
              'Can create passholders for other municipalities'
            ],
            'id': 1,
            'name': 'UiTPAS Regio Aalst',
            'distributionKeys': [
              'string'
            ]
          }
        ],
        'permissions': [
          'registration'
        ],
        'groups': [
          'Can create passholders for other municipalities'
        ]
      }
    ];

    var expectedAdvantage = angular.copy(jsonAdvantage);
    angular.forEach(expectedAdvantage.validForCounters, function (jsonCounter, key) {
      expectedAdvantage.validForCounters[key] = new Counter(jsonCounter);
    });
    expectedAdvantage.endDate = day('2016/09/10', 'YYYY-MM-DD').toDate();

    var advantage = new Advantage(jsonAdvantage);
    expect(advantage).toEqual(expectedAdvantage);
  });

  it('can serialize the advantage', function () {
    var jsonAdvantage = getJsonAdvantage();
    jsonAdvantage.points = false;

    var advantage = new Advantage(jsonAdvantage);

    var serializedAdvantage = advantage.serialize();
    expect(serializedAdvantage.validForCounters).toEqual(jsonAdvantage.validForCounters);
  });
});
