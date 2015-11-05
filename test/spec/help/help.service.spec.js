'use strict';

describe('Service: service', function (){

  beforeEach(module('uitpasbeheerApp'));

  var apiUrl = 'http://example.com/';

  // load the service's module
  beforeEach(module('ubr.help', function($provide) {
    $provide.constant('appConfig', {
      apiUrl: apiUrl
    });
  }));

  var $q, $httpBackend, service, $scope;

  var helpResponse = {
    text: '# Aanmelden\r## Ik kan niet aanmelden?\rHeb je de juiste gegevens gebruikt om je aan te melden? Je kan enkel aanmelden met je UiTID. Ga naar ‘Ik ben mijn paswoord vergeten’ om een nieuw paswoord aan te vragen.',
    canUpdate: true
  };

  beforeEach(inject(function ($injector, helpService, $rootScope) {
    $q = $injector.get('$q');
    $httpBackend = $injector.get('$httpBackend');
    service = helpService;
    $scope = $rootScope.$new();
  }));

  it('can get the help data from the server', function (done) {
    $httpBackend
      .expectGET(apiUrl + 'help')
      .respond(200, JSON.stringify(helpResponse));

    function assertHelpData() {
      expect(service.text).toEqual(helpResponse.text);
      expect(service.canUpdate).toBeTruthy();
      done();
    }

    service
      .getHelpFromServer()
      .then(assertHelpData);

    $httpBackend.flush();
  });

  it('rejects when it can not get help from the server', function (done) {
    $httpBackend
      .expectGET(apiUrl + 'help')
      .respond(400);

    function assertErrorResponse() {
      expect(service.text).toBeNull();
      expect(service.canUpdate).toBeNull();
      done();
    }

    service
      .getHelpFromServer()
      .catch(assertErrorResponse);

    $httpBackend.flush();
  });

  it('can clear the help data from the service', function () {
    service.text = helpResponse.text;
    service.canUpdate = true;

    expect(service.text).toEqual(helpResponse.text);
    expect(service.canUpdate).toBeTruthy();

    service.clearHelpData();

    expect(service.text).toBeNull();
    expect(service.canUpdate).toBeNull();
  });

  it('can update the help text on the server', function (done) {
    service.text = 'initial text';
    service.canUpdate = true;

    expect(service.text).toEqual('initial text');
    expect(service.canUpdate).toBeTruthy();

    $httpBackend
      .expectPOST(apiUrl + 'help', {text: 'new help text'})
      .respond(200);

    function assertUpdateActions() {
      expect(service.text).toBeNull();
      expect(service.canUpdate).toBeNull();
      done();
    }

    service
      .updateHelpOnServer('new help text')
      .then(assertUpdateActions);

    $httpBackend.flush();
  });

  it('can check the edit permission with no known help data', function (done) {
    spyOn(service, 'getHelpFromServer').and.returnValue($q.when({text: 'fred', canUpdate: true}));
    function assertAllowed (response) {
      expect(response).toBeNull();
      expect(service.getHelpFromServer).toHaveBeenCalled();
      done();
    }
    service
      .checkEditPermission()
      .then(assertAllowed);

    $scope.$apply();
  });

  it('rejects when no permission are available', function (done) {
    spyOn(service, 'getHelpFromServer').and.returnValue($q.reject());
    function rejectNoData (response) {
      expect(response).toBeUndefined();
      expect(service.getHelpFromServer).toHaveBeenCalled();
      done();
    }
    service
      .checkEditPermission()
      .catch(rejectNoData);

    $scope.$apply();
  });

  it('can check the edit permission with known help data', function (done) {
    service.canUpdate = true;

    spyOn(service, 'getHelpFromServer').and.returnValue($q.when({text: 'fred', canUpdate: true}));
    function assertAllowed (response) {
      expect(response).toBeTruthy();
      expect(service.getHelpFromServer).not.toHaveBeenCalled();
      done();
    }
    service
      .checkEditPermission()
      .then(assertAllowed);

    $scope.$apply();
  });

  it('can get the help text with no known help data', function (done) {
    spyOn(service, 'getHelpFromServer').and.returnValue($q.when({text: 'fred', canUpdate: true}));
    function assertText (response) {
      expect(response).toBeNull();
      expect(service.getHelpFromServer).toHaveBeenCalled();
      done();
    }
    service
      .getHelpText()
      .then(assertText);

    $scope.$apply();
  });

  it('rejects when no help text is available', function (done) {
    spyOn(service, 'getHelpFromServer').and.returnValue($q.reject('there is no help text'));
    function assertTextNotFound (notFoundMessage) {
      expect(notFoundMessage).toEqual('there is no help text');
      expect(service.getHelpFromServer).toHaveBeenCalled();
      done();
    }
    service
      .getHelpText()
      .catch(assertTextNotFound);

    $scope.$apply();
  });

  it('can get the help text with known help data', function (done) {
    service.text = 'green';

    spyOn(service, 'getHelpFromServer').and.returnValue($q.resolve({text: 'fred', canUpdate: true}));
    function assertAllowed (helpText) {
      expect(helpText).toEqual('green');
      expect(service.getHelpFromServer).not.toHaveBeenCalled();
      done();
    }
    service
      .getHelpText()
      .then(assertAllowed);

    $scope.$apply();
  });
});
