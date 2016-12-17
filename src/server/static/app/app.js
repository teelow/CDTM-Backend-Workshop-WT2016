var app = angular.module('taskApp', ['ngRoute', 'ngResource']);


app.config(function($locationProvider, $routeProvider) {
    // use the HTML5 History API
    $locationProvider.html5Mode(true).hashPrefix('!');

    $routeProvider
    .when('/', {
      templateUrl: 'app/views/main.html',
      controller: 'mainCtrl'
    })

});

app.run(function ($rootScope, $timeout, $location, $route, ApiService, TaskService) {

  ApiService.loadApiVersion()
  TaskService.loadLists(false)
    .then(function(){
      // lists loaded
      // initially load tasks
      TaskService.lists.forEach(function(list) {
        TaskService.loadTasks(false, list.id);
      });
    });

    // ignore files which are not dropped into the dropzone
    $('body').on('drop', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });

    $('body').on('dragover', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });

  $timeout(function(){
    // give it some time (looks better visually)
    document.querySelector('.loading').remove();
  }, 250);

});

app.controller('rootCtrl', function($scope, $timeout, TaskService) {

  $scope.TaskService = TaskService;

  $scope.$watch('$viewContentLoaded', function(){
    $timeout(initMaterializeComponents,0);
  });
});
