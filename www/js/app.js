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
        
        $rootScope.$state = $state;
        
        db = $cordovaSQLite.openDB({
            name: "my.db"
        });
        $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS rooms").then(function () {
            console.log("DROP rooms");
        }, function (err) {
            console.error(err);
        });
        $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS elements").then(function () {
            console.log("DROP elements");
        }, function (err) {
            console.error(err);
        });
        $cordovaSQLite.execute(db, "CREATE TABLE rooms (roomid INTEGER PRIMARY KEY, name TEXT)").then(function () {
            console.log("CREATE rooms");
        }, function (err) {
            console.error(err);
        });
        $cordovaSQLite.execute(db,
                "CREATE TABLE elements (elemid INTEGER PRIMARY KEY, room INTEGER, type INTEGER, state BOOLEAN,  FOREIGN KEY(room) REFERENCES                                     rooms(roomid))")
            .then(function () {
                console.log("CREATE elements");
            }, function (err) {
                console.error(err);
            });
        $cordovaSQLite.execute(db, "INSERT INTO rooms VALUES(1,'room1')").then(function () {
            console.log("INSERT 1 rooms");
        }, function (err) {
            console.error(err);
        });
        $cordovaSQLite.execute(db, "INSERT INTO rooms VALUES(2,'room2')").then(function () {
            console.log("INSERT 2 rooms");
        }, function (err) {
            console.error(err);
        });
        $cordovaSQLite.execute(db, "INSERT INTO elements VALUES(1,1,1,'false')").then(function () {
            console.log("INSERT 1 elements");
        }, function (err) {
            console.error(err);
        });
        $cordovaSQLite.execute(db, "INSERT INTO elements VALUES(2,1,1,'false')").then(function () {
            console.log("INSERT 2 elements");
        }, function (err) {
            console.error(err);
        });
        $cordovaSQLite.execute(db, "INSERT INTO elements VALUES(3,2,1,'false')").then(function () {
            console.log("INSERT 3 elements-> ");
        }, function (err) {
            console.error(err);
        });
        $cordovaSQLite.execute(db, "INSERT INTO elements VALUES(4,2,2,'false')").then(function () {
            console.log("INSERT 4 elements -> ");
        }, function (err) {
            console.error(err);
        });
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

   
    .state('room', {
            url: "/room",
            views: {
                'menuContent': {
                    templateUrl: "templates/room.html",
                    controller: "roomController as room"
                }
            }
        })
    .state('detail', {
            url: "/detail",
            views: {
                'menuContent': {
                    templateUrl: "templates/detail.html",
                    controller: 'detailController as detail'
                }
            }
        });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('home');
});