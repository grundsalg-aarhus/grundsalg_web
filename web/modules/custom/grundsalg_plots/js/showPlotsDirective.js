/**
 * @file
 * Contains the show plots component
 */

/**
 * Plots component directive.
 */
angular.module('grundsalg').directive('plots', ['$window',
  function($window) {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        plots: '=',
        displayLimit: '='
      },
      link: function(scope) {
        /**
         * Helper function to find the rigth class base on plot status.
         *
         * @param {string} status
         *   The plots status.
         *
         * @returns {string}
         *   The class that should be used.
         */
        scope.getClass = function getClass(status) {
          var className = 'is-sold';
          switch (status) {
            case 'Fremtidig':
              className = 'is-future';
              break;

            case 'Ledig':
              className = 'is-available';
              break;

            case 'Reserveret':
              className = 'is-reserved';
              break;

            case 'I udbud':
              className = 'is-offering';
              break;
          }

          return className;
        };

        /**
         * Place number separators in a number.
         *
         * @param {int} x
         *   The input number.
         * @returns {string}
         *   The number as a string with separators in place.
         */
        scope.numberWithSeparator = function numberWithSeparator(x) {
          var parts = x.toString().split(".");
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          return parts.join(",");
        };

        /**
         * Expose the Drupal.t() function to angular templates.
         *
         * @param str
         *   The string to translate.
         * @returns string
         *   The translated string.
         */
        scope.Drupal = {
          "t": function (str) {
            return $window.Drupal.t(str);
          }
        };
      },
      templateUrl: drupalSettings.grundsalg_plots.template
    };
  }
]);

