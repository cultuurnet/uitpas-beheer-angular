'use strict';

describe('Controller: PassholderAdvantageDetailController', function () {

  // load the controller's module
  beforeEach(module('uitpasbeheerApp'));

  var advantageDetailController, advantage, $uibModalInstance, Advantage;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $injector) {
    advantage = {
      "id": "welcome--391",
      "title": "Korting op koffie.",
      "points": 50,
      "exchangeable": true,
      "description1": "description 1: Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Donec sed odio dui.",
      "description2": "",
      "validForCities": [],
      "validForCounters": [
        {
          "id": "390",
          "name": "CC De Werf",
          "consumerKey": "31413BDF-DFC7-7A9F-10403618C2816E44",
          "role": "admin",
          "actorId": "31413BDF-DFC7-7A9F-10403618C2816E44",
          "cardSystems": [
            {
              "permissions": [
                "registration"
              ],
              "groups": [
                "Can create passholders for other municipalities"
              ],
              "id": 1,
              "name": "UiTPAS Regio Aalst",
              "distributionKeys": [
                "string"
              ]
            }
          ],
          "permissions": [
            "registration"
          ],
          "groups": [
            "Can create passholders for other municipalities"
          ]
        }
      ],
      "endDate": "2016/09/10"
    };

    $uibModalInstance = {
      close: jasmine.createSpy('$uibModalInstance.close'),
      dismiss: jasmine.createSpy('$uibModalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('$uibModalInstance.result.then')
      }
    };;
    Advantage = $injector.get('Advantage');

    advantageDetailController = $controller('PassholderAdvantageDetailController', {
      advantage: advantage,
      $uibModalInstance: $uibModalInstance,
      Advantage: Advantage
    });
  }));

  it('has an Advantage object when created', function () {
    var expectedAdvantage = new Advantage(advantage);
    expect(advantageDetailController.advantage).toEqual(expectedAdvantage);
  });

  it('can close the modal', function () {
    advantageDetailController.cancelModal();
    expect($uibModalInstance.dismiss).toHaveBeenCalled();
  });
});
