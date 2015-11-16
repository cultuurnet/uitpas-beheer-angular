'use strict';

describe('Controller: TicketSalesController', function(){
  var TicketSalesController, expectedTicketSales, pass, $controller, $modalInstance, $scope, passholderService, $q;
  beforeEach(module('ubr.passholder'));
  beforeEach(module('uitpasbeheerApp'));

  beforeEach(inject(function (_$controller_, $rootScope, $injector) {
    $controller = _$controller_;
    $modalInstance = jasmine.createSpyObj('$modalInstance', ['dismiss']);
    $scope = $rootScope.$new();
    $q = $injector.get('$q');
    passholderService = $injector.get('passholderService');
    expectedTicketSales = [
      {
        id: '30788',
        creationDate: '2014-07-14',
        eventTitle: 'Tentoonstelling: Aalst in de Middeleeuwen',
        tariff: 15
      },
      {
        id: '30789',
        creationDate: '2013-12-06',
        eventTitle: 'Eddy Wally in Concert',
        tariff: 7.5
      },
      {
        id: '30790',
        creationDate: '2012-05-11',
        eventTitle: 'Gratis zwembeurt',
        tariff: 0,
        coupon: {
          id: '1',
          name: 'Cultuurwaardebon',
          description: 'dit is de description van Cultuurwaardebon',
          expirationDate: '2015-12-26',
          remainingTotal: 1
        }
      },
      {
        id: '30791',
        creationDate: '2015-05-09',
        eventTitle: 'Cursus foto\'s maken met je smartphone',
        tariff: 7.5
      },
      {
        id: '30792',
        creationDate: '2010-06-09',
        eventTitle: 'Nacht van de poëzie',
        tariff: 5
      }
    ];

    pass = {
      pass: {
        number: '01234567891234',
        passholder: {
          passNumber: '01234567891234',
          points: 123,
          name: {
            first: 'Fred'
          }
        }
      }
    };

  }));

  function getController() {
    return $controller('TicketSalesController', {
      pass: pass,
      passholder: pass.passholder,
      $modalInstance: $modalInstance,
      passholderService: passholderService
    });
  }

  it('should display all ticketsales', function () {
    spyOn(passholderService, 'getTicketSales').and.returnValue($q.resolve(expectedTicketSales));
    TicketSalesController = getController();
    $scope.$apply();
    expect(TicketSalesController.ticketSales).toEqual(expectedTicketSales);
  });

  it('can close the modal', function () {
    TicketSalesController = getController();
    TicketSalesController.cancel();
    expect($modalInstance.dismiss).toHaveBeenCalled();
  });
});
