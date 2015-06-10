'use strict';

describe('Service: redirect', function () {

  // Load the service's module.
  beforeEach(module('uitpasbeheerApp'));

  // Instantiate service.
  var $location, $q, redirect, uitid;

  beforeEach(inject(function ($injector, _redirect_, _uitid_) {
    $location = $injector.get('$location');
    $q = $injector.get('$q');
    redirect = _redirect_;
    uitid = _uitid_;
  }));

  var getLoggedinPromise = function() {
    return getStatusPromise(true);
  };

  var getAnonymousPromise = function() {
    return getStatusPromise(false);
  };

  var getStatusPromise = function(status) {
    var deferred = $q.defer();
    deferred.resolve(status);
    return deferred.promise;
  };

  it('redirects if logged in', function() {
    var destination = 'example';

    // Keep track of the calls to the path method on $location.
    spyOn($location, 'path');

    // Make sure uitid.getLoginStatus() returns a promise that's resolved
    // with status being false.
    spyOn(uitid, 'getLoginStatus')
      .and.returnValue(getAnonymousPromise());

    // Call the redirect service.
    redirect.ifLoggedIn(destination).then(
      function() {
        // Make sure we have not been redirected.
        expect($location.path.callCount).toEqual(0);
      },
      function() {
        // The redirect promise should have been resolved, as resolved
        // means that the current path we're on is fine and no redirect is
        // necessary.
        throw new Error('Redirect promise should not have been rejected.');
      }
    );

    // Make sure uitid.getLoginStatus() returns a promise that's resolved
    // with status being true.
    uitid.getLoginStatus.and.returnValue(getLoggedinPromise());

    // Call the redirect service again.
    redirect.ifLoggedIn(destination).then(
      function() {
        // The redirect promise should have been rejected, as we're supposed
        // to be redirect so the current path we're on is not "resolved".
        throw new Error('Redirect promise should not have been resolved.');
      },
      function() {
        // Make sure we're being redirected.
        expect($location.path).toHaveBeenCalledWith(destination);
      }
    );
  });

  it('redirects if not logged in', function() {
    var destination = 'example';

    // Keep track of the calls to the path method on $location.
    spyOn($location, 'path');

    // Make sure uitid.getLoginStatus() returns a promise that's resolved
    // with status being true.
    spyOn(uitid, 'getLoginStatus')
      .and.returnValue(getLoggedinPromise());

    // Call the redirect service.
    redirect.ifAnonymous(destination).then(
      function() {
        // Make sure we have not been redirected.
        expect($location.path.callCount).toEqual(0);
      },
      function() {
        // The redirect promise should have been resolved, as resolved
        // means that the current path we're on is fine and no redirect is
        // necessary.
        throw new Error('Redirect promise should not have been rejected.');
      }
    );

    // Make sure uitid.getLoginStatus() returns a promise that's resolved
    // with status being false.
    uitid.getLoginStatus.and.returnValue(getAnonymousPromise());

    // Call the redirect service again.
    redirect.ifAnonymous(destination).then(
      function() {
        // The redirect promise should have been rejected, as we're supposed
        // to be redirect so the current path we're on is not "resolved".
        throw new Error('Redirect promise should not have been resolved.');
      },
      function() {
        // Make sure we're being redirected.
        expect($location.path).toHaveBeenCalledWith(destination);
      }
    );
  });

});
