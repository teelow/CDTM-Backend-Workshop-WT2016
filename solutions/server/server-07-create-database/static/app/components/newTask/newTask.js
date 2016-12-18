app.directive('newTask', function() {
    return {
        templateUrl: 'app/components/newTask/newTask.html',
        controller: 'newTaskCtrl',
        scope: {
          list: '=' //Two-way data binding
        },
        restrict: 'E'
    };
});

app.controller('newTaskCtrl', function($scope, TaskService) {

  var placeholders = [
    'What needs to be done?',
    'Anything else to do?',
    'Remind me about ...',
    'Don\'t forget about ...',
    'Remind me about ...',
    'What\'s on your agenda?',
  ]


  $scope.placeholder = placeholders[Math.floor(Math.random(1337)*placeholders.length)];
  $scope.newTask = {}

  $scope.addTask = function () {
    if (!$scope.newTask.title) return;
      TaskService.addTask($scope.newTask, $scope.list.id)
        .then(function() {
          $scope.placeholder = placeholders[Math.floor(Math.random(1337)*placeholders.length)];
          $scope.newTask = {};
        })
        .catch(function () {
          shake(document.getElementById('input-card'));
        });
    }
});
