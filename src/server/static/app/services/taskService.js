app.factory('TaskService', function($q, $http, ApiService) {

// TODO: Refactor this monster service

    lists = [];
    selectedList = lists[0];
    todayList = {
      id: -1,
      title: 'Today',
      tasks: []
    };
    weekList = {
      id: -2,
      title: 'Week',
      tasks: []
    };
    loading = false;

    // MARK: List endpoints
    function loadLists(reload) {
      var deferred = $q.defer();

      $http.get(ApiService.hostString() + '/api/lists')
       .then(
           function(response){
             response.data.lists.forEach(function(newList) {
               if (newList.tasks == null || newList.tasks == undefined) {
                 newList.tasks = [];
               }
               var originalList = getListById(newList.id);
               if (originalList == null) {
                 lists.push(newList);
               } else if (originalList.revision < newList.revision) {
                 // replace in place
                 replaceList(originalList, newList)
               }
               // select inbox on pageload
               if(!(reload)) {
                 if (newList.inbox) selectList(newList);
               }
             });
             if (!(selectedList) && lists.length > 0) selectList(lists[0]);
             deferred.resolve();
           },
           function(response){
             handleErrorResponse(response);
             lists = [];
             deferred.reject();
           }
        );
      return deferred.promise;
    }

    function selectList(newList) {
      if (newList == null || newList == undefined) return selectedList;
      // first check whether list exists then (re)set all properties
      if (selectedList) selectedList.selected = false;
      selectedList = newList;
      newList.selected = true;
      return selectedList;
    }

    function urlForListIcon(list) {
      if (list.inbox) {
        return '/assets/icons/inbox.svg#icon-1';
      } else if (list.collaborators && list.collaborators.length > 0) {
        return '/assets/icons/group.svg#icon-1';
      } else if (list === todayList) {
        return '/assets/icons/calendar.svg#icon-1';
      } else if (list === weekList) {
        return '/assets/icons/calendar-week.svg#icon-1';
      }
      return '/assets/icons/list.svg#icon-1';
    }


    function addList(list) {
      var deferred = $q.defer();

      if (!list || !list.title) {
        deferred.reject();
        return deferred.promise;
      }

      $http.post(ApiService.hostString() + '/api/lists/', JSON.stringify(list))
       .then(
           function(response){
             // success callback
             var list = response.data;
             list.tasks = [];
             lists.push(list);
             deferred.resolve();
           },
           function(response){
             // failure callback
             handleErrorResponse(response);
             deferred.reject();
           }
        );
        return deferred.promise;
    }

    function removeList(list) {
      var deferred = $q.defer();

      $http.delete(ApiService.hostString() + '/api/lists/' + list.id)
       .then(
           function(response){
             // success callback
             if (lists.indexOf(list) != -1) {
               list.tasks.forEach(function(task) {
                 removeFromDynamicLists(task);
               });
               lists.splice(lists.indexOf(list),1);

               if (selectedList === list) selectInbox();
             }
             deferred.resolve();
           },
           function(response){
             // failure callback
             handleErrorResponse(response);
             deferred.reject();
           }
        );
      return deferred.promise;
    }

    function getUser(id) {
      var deferred = $q.defer();
      $http.get(ApiService.hostString() + '/api/users/' + id)
       .then(
           function(response){
             deferred.resolve(response.data);
           },
           function(response){
             // failure callback
             handleErrorResponse(response);
             deferred.reject();
           }
        );
      return deferred.promise;
    }

    // MARK: Task Endpoints
    function loadTasks(shouldShowLoading, list_id) {
        var deferred = $q.defer();

        var list = getListById(list_id)
        if (list == null) {
          deferred.reject();
          return deferred.promise;
        }
        loading = shouldShowLoading;
        $http.get(ApiService.hostString() + '/api/lists/' + list.id + '/tasks')
         .then(
             function(response) {
               // success callback
               var newTasks = response.data.tasks;

               // delete old tasks
               list.tasks.forEach(function(oldTask) {
                 var remove = true;
                 newTasks.some(function(newTask) {
                   if (oldTask.id === newTask.id) {
                     remove = false;
                     return
                   }
                 });
                 if (remove && !oldTask.isEditing) {
                   list.tasks.splice(list.tasks.indexOf(oldTask),1)
                 };
               });

               // add new tasks or update old ones
               newTasks.forEach(function(newTask) {
                 // set date
                 newTask.overdue = newTask.due != null && newTask.due != '' && new Date(newTask.due) < new Date();
                 // only replace task if server side version is newer
                 var originalTask = taskForId(list, newTask.id);
                 if (originalTask == null) {
                   list.tasks.push(newTask);
                   updateDynamicLists(newTask);
                 } else if (originalTask.revision < newTask.revision) {
                   // replace in place
                   replaceTask(originalTask, newTask);
                   updateDynamicLists(originalTask);
                 }
              });
               loading = false;
               deferred.resolve();
             },
             function(response){
               // failure callback
               handleErrorResponse(response);
               loading = false;
               deferred.reject();
             }
          );
        return deferred.promise;
    };

    function addTask(task, list_id) {
      var deferred = $q.defer();

      // for dynamic lists (today/week) set list_id to inbox
      updateDateFlag = null;
      if (list_id < 0) {
        updateDateFlag = list_id;
        lists.some(function(list){
          if (list.inbox) {
            list_id = list.id;
            return;
          }
        })
      }

      var list = getListById(list_id)
      if (list == null) {
        deferred.reject();
        return deferred.promise;
      }

      $http.post(ApiService.hostString() + '/api/lists/' + list.id + '/tasks', JSON.stringify(task))
       .then(
           function(response){
             // success callback
             var task = response.data;
             list.tasks.unshift(task);
             if (updateDateFlag) {
               if (updateDateFlag == -1) task.due = new Date();
               if (updateDateFlag == -2) task.due = endOfWeek();
               updateTask(task, task.list)
                .then(function(response) {
                  deferred.resolve();
              })
              .then(function(response) {
                deferred.reject();
              });
             } else {
               deferred.resolve();
             }
           },
           function(response){
             // failure callback
             handleErrorResponse(response);
             deferred.reject();
           }
        );
      return deferred.promise;
    }

    function updateTask(task, list_id) {
      var deferred = $q.defer();

      var list = getListById(list_id)
      if (list == null) {
        deferred.reject();
        return deferred.promise;
      }

      $http.put(ApiService.hostString() + '/api/lists/' + list.id + '/tasks/' + task.id, JSON.stringify(task))
       .then(
           function(response){
             // success callback
             replaceTask(task, response.data);
             updateDynamicLists(task);
             deferred.resolve();
           },
           function(response){
             // failure callback
             handleErrorResponse(response);
             deferred.reject();
           }
        );
      return deferred.promise;
    }

    function removeTask(task, list_id) {
      var deferred = $q.defer();

      var list = getListById(list_id)
      if (list == null) {
        deferred.reject();
        return deferred.promise;
      }

      $http.delete(ApiService.hostString() + '/api/lists/' + list.id + '/tasks/' + task.id)
       .then(
           function(response){
             // success callback
             list.tasks.splice(list.tasks.indexOf(task),1);
             removeFromDynamicLists(task);
             deferred.resolve();
           },
           function(response){
             // failure callback
             handleErrorResponse(response);
             deferred.reject();
           }
        );
      return deferred.promise;
    }

    function uploadFiles(task, list_id, files) {
      var deferred = $q.defer();

      var list = getListById(list_id)
      if (list == null) {
        deferred.reject();
        return deferred.promise;
      }

      // took some time to figure out how to properly use append
      var formData = new FormData();
      for (var i = 0; i < files.length; i++) {
        formData.append('files[]', files[i]);
      }

      for (var i = 0; i < files.length; i++) {
          file = files[i].name;
          file.loading = true; // Doesn't work, since a string is a primitive type in JS
          var index = task.files.indexOf(file);
          if (index > -1) {
             task.files.splice(index, 1);
          }
          task.files.unshift(file);
      }

      loading = true;
      $http({
          method: 'POST',
          data: formData,
          url: ApiService.hostString() + '/api/lists/' + list.id + '/tasks/' + task.id + '/files',
          transformRequest: angular.identity, // needed to work
          headers: {
              'Content-Type': undefined // needed to work
          }
      }).success(function(response) {
        task.files = response.files;
        loading = false;
        deferred.resolve();
      }).error(function(response) {
          loading = false;
          handleErrorResponse(response);
          deferred.reject();
      });
      return deferred.promise;
    }

    function removeFile(task, list_id, file) {
      var deferred = $q.defer();

      var list = getListById(list_id)
      if (list == null) {
        deferred.reject();
        return deferred.promise;
      }

      $http.delete(ApiService.hostString() + '/api/lists/' + list.id + '/tasks/' + task.id + '/files/' + file)
       .then(
           function(response){
             // success callback
             if (response.data.result == true) {
               var index = task.files.indexOf(file);
               if (index > -1) {
                  task.files.splice(index, 1);
              }
             }
             deferred.resolve();
           },
           function(response){
             handleErrorResponse(response);
             deferred.reject();
           }
        );
        return deferred.promise;
    }

    function fileLocation(task, list_id, file) {
      var list = getListById(list_id)
      if (list == null) {
        handleErrorResponse({
          data: {
            result: false,
            error: {
              status: 404,
              text: 'File not found'
            }
          }
        });
        return null;
      }

      return ApiService.hostString() + '/api/lists/' + list.id + '/tasks/' + task.id + '/files/' + file;
    }

    // MARK: Collaborators Endpoints
    function addCollaborator(list_id, email) {
      var deferred = $q.defer();

      var list = getListById(list_id)
      if (list == null) {
        deferred.reject();
        return deferred.promise;
      }

      $http.post(ApiService.hostString() + '/api/lists/' + list.id + '/collaborators/' + email)
       .then(
           function(response){
             // success callback
             debug(response.data);
             replaceList(list, response.data);
             deferred.resolve();
           },
           function(response){
             // failure callback
             deferred.reject();
           }
        );
      return deferred.promise;
    }

    function removeCollaborator(list_id, id) {
      var deferred = $q.defer();

      var list = getListById(list_id)
      if (list == null) {
        deferred.reject();
        return deferred.promise;
      }

      $http.delete(ApiService.hostString() + '/api/lists/' + list.id + '/collaborators/' + id)
       .then(
           function(response){
             // success callback
             if (response.data.result == true) {
               var index = list.collaborators.indexOf(id);
               if (index > -1) {
                  list.collaborators.splice(index, 1);
              }
             }
             deferred.resolve();
           },
           function(response){
             handleErrorResponse(response);
             deferred.reject();
           }
        );
        return deferred.promise;
    }

    function leaveList(list_id, id) {
      var deferred = $q.defer();

      var list = getListById(list_id)
      if (list == null) {
        deferred.reject();
        return deferred.promise;
      }

      $http.delete(ApiService.hostString() + '/api/lists/' + list.id + '/collaborators/' + id)
       .then(
           function(response){
             // success callback
             if (lists.indexOf(list) != -1) {
               list.tasks.forEach(function(task) {
                 removeFromDynamicLists(task);
               });
               lists.splice(lists.indexOf(list),1);

               if (selectedList === list) selectInbox();
            }
            deferred.resolve();
           },
           function(response){
             handleErrorResponse(response);
             deferred.reject();
           }
        );
        return deferred.promise;
    }

    // MARK: Private functions
    function getListById(list_id) {
        var ret = null;
        lists.some(function(list) {
          if (list.id === list_id) {
            ret = list;
            return;
            }
        });
        return ret;
    }

    function taskForId(list, id) {
      var ret = null;
      if (list.tasks != null && list.tasks != undefined) {
        list.tasks.some(function(task) {
          if (task.id === id) {
            ret = task;
            return;
          }
        });
      }
      return ret;
    }

    function selectInbox() {
      lists.some(function(list) {
        if (list.inbox) return selectList(list);
      });
    }

    function updateDynamicLists(task) {
      if (task.status == 'completed' || task.due == null) return;

      var due = new Date(task.due);
      var today = new Date();

      if (due <= today) {
        addTaskToTodayList(task);
      }
      if (due <= endOfWeek()) {
        addTaskToWeekList(task);
      }
    }

    function addTaskToTodayList(task) {
      if (todayList.tasks.indexOf(task) == -1)
        todayList.tasks.push(task);
    }

    function addTaskToWeekList(task) {
      if (weekList.tasks.indexOf(task) == -1)
        weekList.tasks.push(task);
    }

    function removeFromDynamicLists(task) {
      var t = todayList.tasks.indexOf(task);
      if (t > -1) todayList.tasks.splice(t,1);

      var w = weekList.tasks.indexOf(task);
      if (w > -1) weekList.tasks.splice(w,1);
    }

    function replaceTask(task, newTask) {
      // replaces all properties of task with newTask
      // task.id = newTask.id;
      // task.list = newTask.list;
      task.title = newTask.title;
      task.due = newTask.due;
      task.status = newTask.status;
      task.description = newTask.description;
      task.due = newTask.due;
      task.overdue = newTask.due != null && newTask.due != '' && new Date(newTask.due) < new Date();
      task.revision = newTask.revision;
      task.starred = newTask.starred;
      task.files = newTask.files;
    }

    function replaceList(list, newList) {
      // replaces all properties of list with newList
      // list.id = newList.id;
      // list.owner = newList.owner
      list.title = newList.title;
      list.collaborators = newList.collaborators;
      list.revision = newList.revision;
      list.inbox = newList.inbox;
    }

    function handleErrorResponse(response){
      if (response && response.data && response.data.result == false && response.data.error) {
        debug(response.data.error);
        if (DEBUG) {
          var toastContent =$(`
          <div>
            <h5>Error</h5>
            <div>
              <strong>Status: </strong>` + response.data.error.status + `
            </div>
            <div>
              <strong>Text: </strong>` + response.data.error.text + `
            </div>
          </div>`);
          Materialize.toast(toastContent, 5000)
        }
      }
    }

    // return available functions for use in controllers
    return ({
      lists: lists,
      selectedList: selectedList,
      todayList: todayList,
      weekList: weekList,
      loading: loading,
      selectList: selectList,
      urlForListIcon: urlForListIcon,
      loadLists: loadLists,
      addList: addList,
      removeList: removeList,
      getUser: getUser,
      // tasks
      loadTasks: loadTasks,
      addTask: addTask,
      updateTask: updateTask,
      removeTask: removeTask,
      uploadFiles: uploadFiles,
      removeFile: removeFile,
      fileLocation: fileLocation,
      // collaborators
      addCollaborator: addCollaborator,
      removeCollaborator: removeCollaborator,
      leaveList: leaveList
    });
});
