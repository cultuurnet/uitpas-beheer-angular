'use strict';

describe('Service: UiTPAS router', function () {

  var router, rootScope, passholderService, $state, $q;

  beforeEach(module('uitpasbeheerApp', function($provide) {
    passholderService = jasmine.createSpyObj('passholderService', ['findPass']);
    $provide.provider('passholderService', {
      $get: function () {
        return passholderService;
      }
    });

    $state = jasmine.createSpyObj('$state', ['go', 'reload']);
    $state.params = {
      identification: 'something'
    };
    $provide.provider('$state', {
      $get: function () {
        return $state;
      }
    });
  }));

  beforeEach(inject(function(UiTPASRouter, $rootScope, _$q_) {
    router = UiTPASRouter;
    rootScope = $rootScope;
    $q = _$q_;
    UiTPASRouter.redirectOnScanEnabled(true);
  }));

  it('should keep listening when redirectOnScan is called 2nd time', function () {
    $state.current = {
      redirectOnScan: true
    };
    router.redirectOnScanEnabled(true);
    expect(router.redirectOnScanEnabled()).toBeTruthy();

    var number = '123456789';
    spyOn(router, 'go');
    rootScope.$emit('nfcNumberReceived', number);

    rootScope.$digest();
    expect(router.go).toHaveBeenCalledWith(number);
  });

  it('should change route when an UiTPAS is scanned and the active route allows auto redirects', function () {
    $state.current = {
      redirectOnScan: true
    };
    var number = '123456789';
    spyOn(router, 'go');
    rootScope.$emit('nfcNumberReceived', number);

    rootScope.$digest();
    expect(router.go).toHaveBeenCalledWith(number);
  });

  it('should ignore scanned UiTPAS cards when the current route is not configured to redirect', function () {
    var number = '123456789';
    $state.current = {
      me: 'h'
    };
    spyOn(router, 'go');
    rootScope.$emit('nfcNumberReceived', number);

    rootScope.$digest();
    expect(router.go).not.toHaveBeenCalled();
  });

  it('should not redirect when redirects are disabled', function () {
    $state.current = {
      redirectOnScan: true
    };
    var number = '123456789';
    spyOn(router, 'go');

    router.redirectOnScanEnabled(false);
    expect(router.redirectOnScanEnabled()).toEqual(false);

    rootScope.$emit('nfcNumberReceived', number);

    rootScope.$digest();
    expect(router.go).not.toHaveBeenCalledWith(number);
  });

  it('redirects to a passholder detail page with a valid number', function () {
    var expectedStateParameters = {
      pass: {
        passholder: {
          name: 'Dude Man',
          passNumber: 'itsme-123456789'
        },
        number: 'itsme-123456789',
      },
      identification: 'itsme-123456789'
    };
    passholderService.findPass.and.returnValue($q.resolve(expectedStateParameters.pass));
    router.go('valid identification number');

    rootScope.$digest();
    expect($state.go).toHaveBeenCalledWith('counter.main.passholder', expectedStateParameters);
    expect(passholderService.findPass).toHaveBeenCalledWith('valid identification number');
  });

  it('reloads the passholder detail page when the same passholder is requested', function () {
    var expectedStateParameters = {
      pass: {
        passholder: {
          name: 'Dude Man',
          passNumber: 'something'
        },
        number: 'something',
      },
      identification: 'itsme-123456789'
    };
    passholderService.findPass.and.returnValue($q.resolve(expectedStateParameters.pass));
    router.go('something');

    rootScope.$digest();
    expect($state.reload).toHaveBeenCalledWith('counter.main.passholder');
    expect(passholderService.findPass).toHaveBeenCalledWith('something');
  });

  it('should show an error when identification fails', function () {
    var invalidNumberError = {
      code: 'WHATEVER_CODE',
      title: 'A useful title',
      message: 'A useful description'
    };
    passholderService.findPass.and.returnValue($q.reject(invalidNumberError));
    router.go('invalid identification number');

    rootScope.$digest();
    expect($state.go).toHaveBeenCalledWith(
      'counter.main.error',
      {
        title: 'A useful title',
        description: 'A useful description',
        type: 'WHATEVER_CODE'
      },
      {
        reload: true
      }
    );
    expect(passholderService.findPass).toHaveBeenCalledWith('invalid identification number');
    expect(router.getLastIdentification()).toEqual('invalid identification number');
  });

  it('should redirect to the registration page for an empty pass', function () {
    var emptyPass = {
      number: 'itsme-123456789',
      type: 'CARD'
    };
    var expectedRequest = {
      pass: emptyPass,
      identification: emptyPass.number,
      type: emptyPass.type
    };
    passholderService.findPass.and.returnValue($q.resolve(emptyPass));
    router.go('valid identification number');

    rootScope.$digest();
    expect($state.go).toHaveBeenCalledWith('counter.main.register', expectedRequest);
    expect(passholderService.findPass).toHaveBeenCalledWith('valid identification number');
  });

  it('should display a group when a group is identified', function () {
    var groupPass = {
      number: '09014578631',
      type: 'CARD',
      group: {
        name: 'group'
      }
    };
    passholderService.findPass.and.returnValue($q.resolve(groupPass));
    router.go('09014578631');

    rootScope.$digest();
    expect($state.go).toHaveBeenCalledWith('counter.main.group', {identification: '09014578631'});
    expect(passholderService.findPass).toHaveBeenCalledWith('09014578631');
  });
});
