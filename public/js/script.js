  var app = angular.module('app', ['ngMaterial','ui.router']);
app.config(function($stateProvider,$urlRouterProvider){
  $urlRouterProvider.otherwise('/home');
  $stateProvider
    .state('home',{
      url:'/home',
      templateUrl:'../views/homePage.html'
    })
    .state('messagePage',{
      url:'/message',
      templateUrl:'../views/messagePage.html'
    })
});
app.controller('Ctrl', function($scope, socket,$state,$mdToast,$window){
  $scope.name="";
  $scope.channel="";
  $scope.message="";
  $scope.opacity={};

  $scope.messages=[];
  $scope.connect=function(name,channel){
    $scope.name=name
    var data={
      'name':name,
      'channel':channel
    };
    socket.emit('connectUser',data);
  }
  $scope.sendMsg = function(msg){
    var tempObj={
      'message':msg,
      'sender':true
    }
    if(!$scope.$$phase) {
      $scope.$apply(function () {
        $scope.messages.push(tempObj);
      });
    }else{
      $scope.messages.push(tempObj);
    }
    socket.emit('msg',msg);
    $window.scrollTo(0,document.documentElement.scrollHeight);
  }
  socket.on('notification',function(data){
    $mdToast.show({
      template: '<md-toast class="md-toast"> Welcome  <h4> '+ data.name +'!!</h4></md-toast>',
      hideDelay: 1100,
      position: 'top right'
    });
    $scope.$apply(function () {
      $scope.messages=data.msgArray;
    });
});
  socket.on('msg',function(data){
    data.sender=false;
    $scope.$apply(function () {
      $scope.messages.push(data);
    });
    $window.scrollTo(0,document.documentElement.scrollHeight);
  });
});
app.factory('socket', ['$rootScope', function($rootScope) {
  var socket = io.connect();
  return {
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
}]);
