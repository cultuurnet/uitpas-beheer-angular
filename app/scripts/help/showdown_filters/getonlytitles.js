'use strict';

(function(){

  var getSafeTitleString = function (string) {
    var spacesToDashes = string.replace(/ /g, '-');
    return spacesToDashes.replace(/[!\"#$%&'\(\)\*\+,\.\/:;<=>\?\@\[\\\]\^`\{\|\}~]/g, '');
  };

  var getOnlyTitles = function() {
    return [
      {
        type: 'output',
        filter: function (source) {
          var regex = /<h1[a-zA-Z\d\=\"\" ]+>(.+)<\/h1>/gm;

          var matches, markup = '';
          while (!!(matches = regex.exec(source))) {
            markup += '<li><a href="#' + getSafeTitleString(matches[1]) + '">' + matches[1] + '</a></li>';
          }

          if (markup) {
            return '<ul>' + markup + '</ul>';
          }
        }
      }
    ];
  };

  // Client-side export
  if (typeof window !== 'undefined' && window.showdown && window.showdown.extension) {
    window.showdown.extension('getonlytitles', getOnlyTitles);
  }
  // Server-side export
  if (typeof module !== 'undefined') {
    module.exports = getOnlyTitles;
  }

}());
