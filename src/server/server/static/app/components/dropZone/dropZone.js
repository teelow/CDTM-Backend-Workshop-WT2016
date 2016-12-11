app.directive('dropZone', function() {
    return {
        scope: {
          task: '=', //Two-way data binding
          uploadFiles: '&'
        },
        controller: 'fileCtrl',
        restrict: 'E',
        replace: true
    };
});


app.controller('fileCtrl', function($scope, $element) {

  $element.on('dragover', function(e) {
    this.classList.add('over');
    e.preventDefault();
    e.stopPropagation();
  });

  $element.on('dragenter', function(e) {
    this.classList.add('over');
    e.preventDefault();
    e.stopPropagation();
  });

  $element.on('dragleave', function(e) {
      this.classList.remove('over');
      e.preventDefault();
      e.stopPropagation();
    });

  $element.on('drop', function(e) {
    this.classList.remove('over');
    e.preventDefault();
    e.stopPropagation();
    if (e.originalEvent.dataTransfer){
        if (e.originalEvent.dataTransfer.files.length > 0) {
            $scope.uploadFiles({files: e.originalEvent.dataTransfer.files});
        }
    }
    return false;
  });
});
