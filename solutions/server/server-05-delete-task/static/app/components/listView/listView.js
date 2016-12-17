app.directive('listView', function() {
    return {
        templateUrl: 'app/components/listView/listView.html',
        controller: 'listViewCtrl',
        restrict: 'E'
    };
});

app.controller('listViewCtrl', function($scope, $http, TaskService) {

  $scope.showCreateListModal = function () {
    $scope.newList = {};
    $('body').append($('#createListModal'));
    $('#createListModal').modal();
    $('#createListModal').modal('open');
  };

  $scope.createList = function () {
    TaskService.addList($scope.newList)
      .then(function() {
        $('#createListModal').modal('close');
        $scope.newList = {};
      })
      .catch(function () {
        $scope.newList = {};
        shake(document.getElementById('createListModal'));
      });
  };

});
