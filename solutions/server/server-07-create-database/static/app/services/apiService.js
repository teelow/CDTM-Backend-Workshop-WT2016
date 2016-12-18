app.factory('ApiService', function ($location, $http, $window) {

    var HOST = $location.host();
    var PORT = $location.port();
    var VERSION = 'N/A';

    restoreAPISettingsLocally()

    function setPort(new_port) {
      if(new_port && new_port != null && new_port != undefined && new_port != '') {
        PORT = new_port;
        storeAPISettingsLocally()
      }
    }

    function getPort() {
      return PORT;
    }

    function getHost() {
      return HOST;
    }

    function hostString() {
      return 'http://' + HOST + ':' + PORT;
    }

    function getApiVersion() {
      return VERSION;
    }

    function loadApiVersion() {
      $http.get(hostString() + '/api/version')
       .then(
           function(response){
             // success callback
             VERSION = response.data.version;
           },
           function(response){
          }
        );
    }

    // private functions
    function storeAPISettingsLocally() {
      $window.localStorage.apiSettings = angular.toJson({
        PORT: PORT,
        HOST: HOST
      });
    }

    function restoreAPISettingsLocally() {
      var settings = angular.fromJson($window.localStorage.apiSettings)
      if (settings && settings.PORT && settings.HOST) {
        HOST = settings.HOST;
        PORT = settings.PORT;
      } else {
        HOST = $location.host();
        PORT = $location.port();
      }
    }

    // return available functions for use in controllers
    return ({
      hostString: hostString,
      setPort: setPort,
      getPort: getPort,
      getHost: getHost,
      getApiVersion: getApiVersion,
      loadApiVersion: loadApiVersion
    });

});
