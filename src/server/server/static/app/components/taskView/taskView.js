app.directive('taskView', function() {
  return {
      scope: {
          list: '=' //Two-way data binding
      },
      controller: 'taskViewCtrl',
      templateUrl: 'app/components/taskView/taskView.html'
  };
});

app.controller('taskViewCtrl', function($scope, TaskService) {

  $scope.urlForListIcon = function() {
    if ($scope.list) return TaskService.urlForListIcon($scope.list);
  }

  $scope.loadTasksForList = function() {
    TaskService.loadTasks(true, $scope.list.id);
  }

  //init
  if ($scope.list && $scope.list.id) {
    $scope.loadTasksForList();
  }
});
