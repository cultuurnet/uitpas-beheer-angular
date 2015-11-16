'use strict';

/**
 * @ngdoc directive
 * @name ubr.utilities.directive:ubrShowdownMarkdownToHtml
 * @description
 * # Converts Markdown code to html using the Showdown library.
 */
angular
  .module('ubr.utilities')
  .directive('ubrShowdownMarkdownToHtml', showdownMarkdownToHtml);

/* @ngInject */
function showdownMarkdownToHtml () {
  var directive = {
    restrict: 'A',
    link: link
  };
  return directive;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
        func.apply(context, args);
      }, wait);
    };
  }

  function link(scope, element, attrs) {
    element.addClass('ng-binding-markdown').data('$bindingMarkdown', attrs.ubrShowdownMarkdownToHtml);
    var converterOptions = {extensions: []};
    if (attrs.mdFilters) {
      converterOptions.extensions.push(attrs.mdFilters);
    }

    var converter = new showdown.Converter(converterOptions);
    scope.$watch(attrs.ubrShowdownMarkdownToHtml, debounce(function bindMarkdownWatchAction(value) {
      var markdown = value || '';
      var htmlText = converter.makeHtml(markdown);
      element.html(htmlText);
    }, 50));
  }
}
