'use strict';

describe('Controller: HelpController', function () {

  beforeEach(module('uitpasbeheerApp'));

  var helpService, $q, helpController, $state, $scope;

  beforeEach(inject(function ($injector, $rootScope){
    var $controller = $injector.get('$controller');
    $scope = $rootScope;
    $q = $injector.get('$q');
    helpService = jasmine.createSpyObj(
      'helpService',
      [
        'getHelpText',
        'checkEditPermission',
        'updateHelpOnServer'
      ]
    );
    $state = jasmine.createSpyObj('$state', ['go']);

    helpService.getHelpText.and.returnValue($q.when('help text'));
    helpService.checkEditPermission.and.returnValue(true);

    helpController = $controller('HelpController', {
      helpService: helpService,
      $q: $q,
      $state: $state
    });
  }));

  it('should initiate with getting the help data', function () {
    $scope.$apply();

    expect(helpService.getHelpText).toHaveBeenCalled();
    expect(helpService.checkEditPermission).toHaveBeenCalled();

    expect(helpController.helpMarkdown).toBe('help text');
    expect(helpController.userCanEdit).toBeTruthy();
  });

  it('redirects on successful form submit', function () {
    helpController.helpMarkdown = 'submit this';
    helpService.updateHelpOnServer.and.returnValue($q.when());

    helpController.submitForm();

    $scope.$apply();

    expect(helpService.updateHelpOnServer).toHaveBeenCalledWith('submit this');
    expect($state.go).toHaveBeenCalled();
  });

  it('sets an error variable with form submit error', function () {
    helpController.helpMarkdown = 'submit this';
    helpService.updateHelpOnServer.and.returnValue($q.reject());

    helpController.submitForm();

    $scope.$apply();

    expect(helpService.updateHelpOnServer).toHaveBeenCalledWith('submit this');
    expect(helpController.showUpdateError).toBeTruthy();
  });
});
