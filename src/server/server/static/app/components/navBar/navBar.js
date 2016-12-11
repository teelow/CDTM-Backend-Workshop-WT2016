app.directive('navBar', function() {
    return {
        templateUrl: 'app/components/navBar/navBar.html',
        controller: 'navBarCtrl',
        scope: {
          sidenav: '=',
          topnav: '='
        },
        restrict: 'E',
    };
});

app.controller('navBarCtrl', function($scope, $timeout, TaskService) {

  $scope.TaskService = TaskService;

  $scope.$watch('$viewContentLoaded', function(){
    $timeout(function(){
      // only call once
      $('.button-collapse').sideNav({
          menuWidth: 300, // Default is 240
          edge: 'left', // Choose the horizontal origin
          closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
          draggable: true // Choose whether you can drag to open on touch screens
      });
    },0);
  });

});
