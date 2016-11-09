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
      'name':$scope.name
    }
    if(!$scope.$$phase) {
      $scope.$apply(function () {

        $scope.messages.push(tempObj);
      });
    }else{
      $scope.messages.push(tempObj);
    }
    socket.emit('msg',tempObj);
    $window.scrollTo(0,document.documentElement.scrollHeight);
  }
  socket.on('notification',function(data){
    $mdToast.show({
      template: '<md-toast class="md-toast">'+data.notification+'</md-toast>',
      hideDelay: 1100,
      position: 'top right'
    });
    console.log(data);
    $scope.$apply(function(){
      if (data.msgArray!=undefined) {
        $scope.messages=data.msgArray;
      }else{
        $scope.messages=[];
      }
    });
    $window.scrollTo(0,document.documentElement.scrollHeight);

  });
  socket.on('msg',function(data){
    console.log(data);
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
