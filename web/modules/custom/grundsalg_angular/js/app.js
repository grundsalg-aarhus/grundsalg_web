/**
 * @file
 * Contains the App grundsalg.
 */

/**
 * Setup the app.
 */
angular.module('grundsalg', ['ngRoute', 'ngAnimate']).config(function($sceProvider) {
  // Completely disable SCE.  For demonstration purposes only!
  // We need to allow html to be added from Drupal (See slideshow)
  $sceProvider.enabled(false);
});

