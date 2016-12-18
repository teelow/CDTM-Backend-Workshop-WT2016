app.directive('devBar', function() {
    return {
        templateUrl: 'app/components/devBar/devBar.html',
        controller: 'devBarCtrl',
        restrict: 'E'
    };
});

app.controller('devBarCtrl', function($scope, $route, ApiService) {

  $scope.appVersion = 7.0;
  $scope.show = DEBUG;

  $scope.changePort = function(e) {
    ApiService.setPort(e.originalEvent.target.value);
    $route.reload();
  };

  $scope.getPort = function() {
    return ApiService.getPort();
  }

  $scope.getHost = function() {
    return ApiService.getHost();
  }

  $scope.getApiVersion = function() {
    return ApiService.getApiVersion();
  }

});
