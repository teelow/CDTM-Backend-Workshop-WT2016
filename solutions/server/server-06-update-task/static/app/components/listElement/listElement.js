app.directive('listElement', function() {
    return {
        scope: {
            list: '=' //Two-way data binding
        },
        templateUrl: 'app/components/listElement/listElement.html',
        controller: 'listElementCtrl',
        restrict: 'E'
    };
});

app.controller('listElementCtrl', function($scope, $http, $location, $window, $timeout, ApiService, TaskService) {

  var loadingIcon = '<img src="assets/icons/loading2.svg"></img>';
  var verifiedIcon = '<img src="assets/icons/check.svg"></img>';
  var failIcon = '<img src="assets/icons/fail.svg"></img>';

  var doubleClick = false;

  $scope.errorMsg = '';
  init();

  function init() {
    $scope.collaborators = [];
    if($scope.list.collaborators) {
      reloadCollaborators()
    }
  }

  function reloadCollaborators() {
    $scope.collaborators = [];
    $scope.list.collaborators.forEach(function(collaborator) {
      TaskService.getUser(collaborator)
        .then(function (user) {
          user.verified = true;
          addCollaborator(user);
        });
    });
  }

  function addCollaborator(user) {
    var icon = user.verified ? verifiedIcon : loadingIcon;
    user.tag = icon + user.email;
    var originalCollaborator = getCollaboratorByEmail(user.email);
    if (originalCollaborator) {
      // ignore
    } else {
      $scope.collaborators.push(user);
    }
    updateChips();
  }

  function getCollaboratorById(id) {
    if (!id) return null;
    var ret = null;
    $scope.collaborators.some(function(col){
      if (col.id == id) {
        ret = col;
        return;
      }
    });
    return ret
  }

  function getCollaboratorByEmail(email) {
    if (!email) return null;
    var ret = null;
    $scope.collaborators.some(function(col){
      if (col.email == email) {
        ret = col;
        return;
      }
    });
    return ret
  }

  function removeChip(email) {
    var collaborator = getCollaboratorByEmail(email);
    index = $scope.collaborators.indexOf(collaborator);
    if (index > -1) {
      $scope.collaborators.splice(index, 1);
    }
    updateChips();
  }

  function updateChips(withUserInput) {
    $('.chips').material_chip({
        placeholder: 'add collaborator',
        secondaryPlaceholder: 'add collaborator',
        'data': $scope.collaborators
    });
  }

  $scope.selectList = function() {
    doubleClick = false;
    TaskService.selectList($scope.list);
    $location.path('/');
    if ($window.innerWidth < 993) {
      $timeout(function() {
        if (!doubleClick) {
          $('.button-collapse').sideNav('hide');
        }
      }, 200)
    }
  }

  $scope.urlForListIcon = function() {
    return TaskService.urlForListIcon($scope.list)
  }

  $scope.numberOfUnfinishedTasks = function() {
    var n = 0
    $scope.list.tasks.forEach(function(t) {
      if (t.status == 'normal') {
        n = n + 1;
      }
    });
    return n;
  }

  $scope.showDetails = function() {
    doubleClick = true;
    if ($scope.list.inbox || TaskService.lists.indexOf($scope.list) == -1)
      return;
    $('body').append($('#listModal' + $scope.list.id));
    $('#listModal' + $scope.list.id).modal({
      ready: function() {
        $scope.list.isEditing = true;
      },
      complete: function() {
        $scope.list.isEditing = false;
      }
    });
    $('#listModal' + $scope.list.id).modal('open')

    // init chips
    $('.chips').material_chip({
      placeholder: 'add collaborator',
      secondaryPlaceholder: 'add collaborator'
    });
    updateChips();

    // register event listener
    $('.chips').on('chip.add', function(e, chip){
      if (getCollaboratorByEmail(chip.tag)) updateChips();
      var user = {
        id: null,
        tag: chip.tag,
        email: chip.tag,
        verified: false
      }
      addCollaborator(user);

      TaskService.addCollaborator($scope.list.id, user.email)
        .then(function() {
          user.verified = true,
          user.tag = verifiedIcon + user.email;
          $scope.errorMsg = '';
          updateChips();
        },
        function() {
          user.verified = false,
          user.tag = failIcon + user.email;
          $scope.errorMsg = 'Could not add user <' + user.email + '>';
          updateChips();
          $timeout(function() {
            removeChip(user.email);
          }, 2500);
        }
      );

    });

    $('.chips').on('chip.delete', function(e, chip) {
      if (chip.verified) {
        TaskService.removeCollaborator($scope.list.id, chip.id)
          .then(function() {
            removeChip(chip.email);
          },function() {
            reloadCollaborators();
          });
      } else {
        removeChip(chip.email);
      }
    });
  };

  $scope.isEditable = function() {
    return $scope.list && !$scope.list.inbox && $scope.list.id >= 0
  }

  $scope.updateList = function () {
    $('#listModal' + $scope.list.id).modal('close');
    $http.put(ApiService.hostString() + '/api/lists/' + $scope.list.id, $scope.list);
  };

  $scope.deleteList = function () {
    TaskService.removeList($scope.list)
      .then(function() {
        $('#listModal' + $scope.list.id).modal('close');;
      })
      .catch(function () {
        shake(document.getElementById('listModal' + $scope.list.id));
      });
  };

});
