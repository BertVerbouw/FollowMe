document.addEventListener("deviceready", readyFunct, false);

function readyFunct() {
    angular.bootstrap(document, ['starter']);
}

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

.run(function ($ionicPlatform, $cordovaSQLite, $rootScope, $state) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar
        // above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        };
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        };
        $rootScope.$on('$viewContentLoaded', function (event) {
            navigator.splashscreen.hide();
        });
        $rootScope.$state = $state;
    });

})

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

        .state('home', {
        url: "/home",
        views: {
            'menuContent': {
                templateUrl: "templates/home.html",
                controller: 'bluetoothController as bluetooth'
            }
        }
    })

    .state('addRoom', {
        url: "/addroom",
        views: {
            'menuContent': {
                templateUrl: "templates/addRoom.html",
                controller: 'bluetoothController as bluetooth'
            }
        }
    })

    .state('editRoom', {
        url: "/editroom",
        views: {
            'menuContent': {
                templateUrl: "templates/editRoom.html",
                controller: 'editRoomController as room'
            }
        }
    })


    .state('room', {
        url: "/room",
        views: {
            'menuContent': {
                templateUrl: "templates/room.html",
                controller: "roomController as room"
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('home');
});