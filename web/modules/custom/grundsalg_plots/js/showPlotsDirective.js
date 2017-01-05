/**
 * @file
 * Contains the show plots component
 */

/**
 * Plots component directive.
 *
 * html parameters:
 */
angular.module('grundsalg').directive('plots', function() {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      plots: '=',
      displayLimit: '='
    },
    link: function(scope) {
      scope.modulepath = drupalSettings.variables.plots_module_dir + "/..";
    },
    templateUrl: drupalSettings.variables.plots_module_dir + '/templates/plots.html'
  };
});
