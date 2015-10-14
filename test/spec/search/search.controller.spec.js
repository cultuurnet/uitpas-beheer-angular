'use strict';

describe('Controller: searchController', function () {

  var $controller, UiTPASRouter;

  beforeEach(module('uitpasbeheerApp', function($provide) {
    UiTPASRouter = jasmine.createSpyObj('UiTPASRouter', ['go', 'getLastIdentification']);
    $provide.provider('UiTPASRouter', {
      $get: function () {
        return UiTPASRouter;
      }
    });
  }));

  beforeEach(inject(function (_$controller_) {
    $controller = _$controller_;
  }));

  function getSearchController() {
    var searchController = $controller(
      'PassholderSearchController', {
        UiTPASRouter: UiTPASRouter
      }
    );

    return searchController;
  }

  it('should show the last search identity when no identity was found', function () {
    UiTPASRouter.getLastIdentification.and.returnValue('unknown identification');
    var searchController = getSearchController();
    expect(searchController.passholderIdentification).toEqual('unknown identification');
  });

  it('should try to identify a passholder when an identification is provided', function () {
    var searchController = getSearchController();

    // Try searching for an empty identification and don't expect a change.
    searchController.passholderIdentification = '';
    searchController.findPassholder();
    expect(UiTPASRouter.go).not.toHaveBeenCalled();

    // Make sure and actual search is initiated when an identity is provided.
    searchController.passholderIdentification = 'identity-123';
    searchController.findPassholder();
    expect(UiTPASRouter.go).toHaveBeenCalledWith('identity-123');
  });
});
