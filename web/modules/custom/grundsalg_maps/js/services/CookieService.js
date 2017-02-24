/**
 * @file
 * Service to access cookies.
 */

angular.module('grundsalg').service('cookieService',
  function () {
    'use strict';

    /**
     * Get cookie value.
     *
     * @param {string} name
     *   The name of the cookie.
     *
     * @returns {undefined}
     *   The contents of the cookie.
     */
    this.get = function get(name) {
      var regexp = new RegExp("(?:^" + name + "|\s*" + name + ")=(.*?)(?:;|$)", "g");
      var result = regexp.exec(document.cookie);

      return (result === null) ? undefined : result[1];
    };

    /**
     * Set value in a cookie.
     *
     * @param {string} name
     *   The name of the cookie.
     * @param {string} value
     *   The value to set.
     * @param {string} expire
     *   The expire date as an UTCString.
     */
    this.set = function set(name, value, expire) {
      var cookie = name + '=' + escape(value) + ';';

      // Default expire to one year.
      if (expire === undefined) {
        expire = new Date();
        expire.setTime(expire.getTime() + (365*24*60*60*1000));
      }
      cookie += 'expires=' + expire.toUTCString() + ';';

      cookie += 'path=/;';
      cookie += 'domain=' + document.domain + ';';

      document.cookie = cookie;
    };

    /**
     * Remove cookie.
     *
     * @param {string} name
     *   The name of the cookie to remove.
     */
    this.remove = function remove(name) {
      this.set(name, '', 'Thu, 01 Jan 1970 00:00:00 GMT');
    };
  }
);
