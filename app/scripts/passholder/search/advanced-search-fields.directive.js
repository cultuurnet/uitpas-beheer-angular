'use strict';

/**
 * @ngdoc directive
 * @name ubr.passholder.search.directive:ubrPassholderAdvancedSearchFields
 * @description
 * # Provide a form with advanced search fields and validation.
 */
angular
  .module('ubr.passholder.search')
  .directive('ubrPassholderAdvancedSearchFields', ubrPassholderAdvancedSearchFields);

/* @ngInject */
function ubrPassholderAdvancedSearchFields () {
  return {
    restrict: 'E',
    templateUrl: 'views/passholder/search/advanced-search-fields.html',
    link: link
  };

  function link (scope, element, attrs) {
    console.log(scope, element, attrs);
  }
}
