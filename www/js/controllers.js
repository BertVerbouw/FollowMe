angular.module('starter.controllers', [])


//Controller to handle the main page of the app and all the bluetooth connenction functions. 
.controller('bluetoothController', ['$scope', '$ionicPopover', '$timeout', '$state', '$ionicSideMenuDelegate', 'sharedBeacon', 'sharedRoomData', function ($scope, $ionicPopover, $timeout, $state, $ionicSideMenuDelegate, sharedBeacon, sharedRoomData) {
    ionic.material.ink.displayEffect();

    this.ionicSideMenuDelegate = $ionicSideMenuDelegate;

    //These are the regions the app will look for.
    this.regions = [{
        uuid: 'EE5EE5F1-DFFB-48D2-B060-D0F5A71096E0'
 }, {
        uuid: '5A4BCFCE-174E-4BAC-A814-092E77F6B7E5'
 }, {
        uuid: 'EE5EE5F0-4556-6778-899A-ABBCCDDEEFF0'
 }, {
        uuid: '89EC7CA1-6407-4C96-E2D1-3EFC4CD91848'
 }, {
        uuid: '01122334-4556-6778-899A-ABBCCDDEEFF0'
 }];

    this.beacons = sharedBeacon.getBeacon();

    this.timeStart = Date.now();

    this.closest;

    var bt = this;

    this.set = true;

    this.rooms = sharedRoomData.getRooms();

    this.numberOfRooms = Object.keys(bt.rooms).length;

    //Send data of room with id=$id to the service and go to the room view.
    this.goToRoom = function ($id) {
        sharedRoomData.setRoom(bt.rooms[$id]);
        $state.go('room');
    }

    this.goToEdit = function ($id) {
        sharedRoomData.setRoom(bt.rooms[$id]);
        $state.go('editRoom');
    }

    this.startup = function () {
        angular.element(document).ready(function () {
            bt.btcheck();
        });
    }

    /*
    To be called at the start of the app. 
    Checks if bluetooth is on. If on, the app starts scanning.
    */
    this.btcheck = function () {
        ble.isEnabled(
            function () {
                $scope.scanIBeacons();
            },
            function () {
                alert("Please enable Bluetooth.");
            }
        );
    };

    /*
    Stops scanning and clears the list of beacons.
    */
    this.stop = function () {
        sharedBeacon.changeStatus();
        for (var i in bt.regions) {
            var uuid = bt.regions[i].uuid;
            var identifier = i + '1';
            var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
                identifier, uuid);
            cordova.plugins.locationManager.stopMonitoringForRegion(
                    beaconRegion) //stop monitoring and ranging
                .fail(console.error)
                .done(console.log("stopped monitoring: id=" + identifier));
        }
        $scope.clear();
        $timeout(function () {
            $scope.clear()
        }, 100);
    };

    /*Clear beacons object*/
    $scope.clear = function () {
        sharedBeacon.setBeacon({});
        bt.beacons = sharedBeacon.getBeacon();
    };

    /*
    Send the found beacons to the service and apply it to the view.
    */
    $scope.setBeacons = function (key, beacon) {
        var tempbeacons = sharedBeacon.getBeacon();
        tempbeacons[key] = beacon;
        sharedBeacon.setBeacon(tempbeacons);
        $scope.$apply();
    };

    /*
    Ble plugin functions
    */
    $scope.scanIBeacons = function () {
        sharedBeacon.changeStatus();
        var delegate = new cordova.plugins.locationManager.Delegate(); //This object holds the iBeacon callback functions.
        delegate.didRangeBeaconsInRegion = function ($pluginResult) //Continuously called when ranging
            {
                for (var i in $pluginResult.beacons) {
                    //Insert beacon into table of found beacons.
                    var beacon = $pluginResult.beacons[i];
                    beacon.timeStamp = Date.now();
                    beacon.type = $scope.checkType(beacon.major, beacon.minor).type;
                    beacon.temp = $scope.checkType(beacon.major, beacon.minor).temp;
                    beacon.id = $scope.checkType(beacon.major, beacon.minor).id;
                    var key = beacon.uuid;
                    $scope.setBeacons(key, beacon);
                    $scope.checkClosest();
                    $scope.$apply();
                    console.log(JSON.stringify(bt.beacons));
                }
            }
        delegate.didStartMonitoringForRegion = function ($pluginResult) //Called when starting to monitor a region
            {}
        delegate.didDetermineStateForRegion = function ($pluginResult) //Called when the state of a region changes during monitoring
            {}
        delegate.didEnterRegion = function ($pluginResult) //Called when the user enters the region
            {}
        delegate.didExitRegion = function ($pluginResult) //Called when the user exits the region
            {
                var uuid = $pluginResult.region.uuid;
                console.log('deleted:' +
                    uuid);
                bt.beacons[uuid] = undefined;
                console.log(JSON.stringify(bt.beacons));
                sharedBeacon.setBeacon(bt.beacons);
            }
        cordova.plugins.locationManager.setDelegate(delegate); //Set the delegate to be used
        cordova.plugins.locationManager.requestAlwaysAuthorization(); //Ask for permission (iOS8)

        for (var i in bt.regions) //For every region defined, start monitoring and ranging
        {
            var beaconRegion = new cordova.plugins.locationManager.BeaconRegion( //make a new BeaconRegion
                i + 1, //identifier
                bt.regions[i].uuid); //uuid
            cordova.plugins.locationManager.startMonitoringForRegion(
                    beaconRegion) //start Monitoring for region
                .fail(console.error)
                .done();

            cordova.plugins.locationManager.startRangingBeaconsInRegion(
                    beaconRegion) //start Ranging for region
                .fail(console.error)
                .done();
        }

    };

    /*
    check which type the detected beacon is.
    */
    $scope.checkType = function ($major, $minor) {
        var type;
        switch ($major.charAt(0)) {
        case "2":
            type = {
                'type': 'nordic beacon',
                'id': '2',
                'temp': $minor
            };
            break;
        case "1":
            type = {
                'type': 'blue beacon',
                'id': '1',
                'temp': 'unknown'
            };
            break;
        default:
            type = {
                'type': 'not recognised',
                'id': '3',
                'temp': 'unknown'
            };
        }
        return type;
    };

    $scope.checkClosest = function () {
        if (bt.beacons[0]) {
            var beacon = bt.beacons[0];
            for (var i = 0; i < Object.keys(bt.beacons).lenght; i++) {
                if (bt.beacons[i].power > beacon.power) {
                    beacon = bt.beacons[i];
                }
            }
            bt.closest = beacon.uuid;
        }
    }

    this.openPopover = function ($event) {
        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
            $scope.popover.show($event);
        });
    };

    $scope.$on('valuesUpdated', function () {
        bt.rooms = sharedRoomData.getRooms();
        bt.beacons = sharedBeacon.getBeacon();
    });
}])

.controller("roomController", function ($scope, $state, $cordovaSQLite, $timeout, sharedRoomData) {
    ionic.material.ink.displayEffect();

    var rm = this;
    this.newroom = {
        'beacon': 'dsdf'
    };
    this.rooms = sharedRoomData.getRooms();
    this.room = sharedRoomData.getRoom();

    $scope.$on('valuesUpdated', function () {
        rm.rooms = sharedRoomData.getRooms();
    });
    /*
    When 'roomUpdated' is broadcasted by the service, update the room object.
    */
    $scope.$on('roomUpdated', function () {
        rm.room = sharedRoomData.getRoom();
    });

    this.goToEdit = function ($id) {
        sharedRoomData.setRoom(rm.rooms[$id]);
        $state.go('editRoom');
    }

    /*
    Initialize the lights/audio/heating object and add it to the room with id=$id
    */
    rm.numberOfLights = 0;
    this.initLights = function () {
        var lights = {};
        for (var i = 0; i < rm.numberOfLights; i++) {
            lights[i] = {
                'name': '',
                'state': ''
            };
        }
        rm.newroom.lights = lights;
    }
    rm.numberOfAudio = 0;
    this.initAudio = function () {
        var audio = {};
        for (var i = 0; i < rm.numberOfAudio; i++) {
            audio[i] = {
                'name': '',
                'state': ''
            };
        }
        rm.newroom.audio = audio;
    }
    rm.numberOfHeating = 0;
    this.initHeating = function () {
        var heat = {};
        for (var i = 0; i < rm.numberOfHeating; i++) {
            heat[i] = {
                'name': '',
                'state': ''
            };
        }
        rm.newroom.heating = heat;
    }

    this.saveRoom = function () {
        if (rm.newroom.name && rm.newroom.beacon) {
            var amount = Object.keys(rm.rooms).length;
            rm.newroom.id = amount + 1;
            rm.rooms[amount + 1] = rm.newroom;
            sharedRoomData.setRooms(rm.rooms);
            $state.go('home');
            rm.newroom = {};
        } else {
            alert('please enter a name and a beacon for the room');
        }
    }

    this.remove = function ($id) {
        delete rm.rooms[$id];
        sharedRoomData.setRooms(rm.rooms);
        $state.go('home');
    }
})

.controller("editRoomController", function ($scope, $state, $cordovaSQLite, $timeout, sharedRoomData) {
    ionic.material.ink.displayEffect();

    var er = this;

    this.room = sharedRoomData.getRoom();
    this.numberOfLights;
    this.numberOfHeating;
    this.numberOfAudio;

    if (er.room.lights) {
        this.numberOfLights = Object.keys(er.room.lights).length;
    } else {
        er.numberOfLights = 0;
    }
    if (er.room.heating) {
        this.numberOfHeating = Object.keys(er.room.heating).length;
    } else {
        er.numberOfHeating = 0;
    }
    if (er.room.audio) {
        this.numberOfAudio = Object.keys(er.room.audio).length;
    } else {
        er.numberOfAudio = 0;
    }



    this.initLights = function () {
        var lights = {};
        for (var i = 0; i < er.numberOfLights; i++) {
            lights[i] = {
                'name': '',
                'state': ''
            };
        }
        er.room.lights = lights;
    }
    this.initAudio = function () {
        var audio = {};
        for (var i = 0; i < er.numberOfAudio; i++) {
            audio[i] = {
                'name': '',
                'state': ''
            };
        }
        er.room.audio = audio;
    }
    this.initHeating = function () {
        var heat = {};
        for (var i = 0; i < er.numberOfHeating; i++) {
            heat[i] = {
                'name': '',
                'state': ''
            };
        }
        er.room.heating = heat;
    }

    this.saveRoom = function () {
        var newrooms = sharedRoomData.getRooms();
        newrooms[er.room.id] = er.room;
        sharedRoomData.setRooms(newrooms);
        console.log(newrooms);
        $state.go('home');
    }

})

.controller("homeController", function ($scope, sharedBeacon, sharedRoomData) {
    ionic.material.ink.displayEffect();

    var home = this;
    this.rooms = sharedRoomData.getRooms();
    this.beacons = sharedBeacon.getBeacon();
    this.status = sharedBeacon.getStatus();

    /*
    When 'valuesUpdated' is broadcasted by the service, update the beacon and rooms objects
    */
    $scope.$on('valuesUpdated', function () {
        home.rooms = sharedRoomData.getRooms();
        home.beacons = sharedBeacon.getBeacon();
        $scope.$apply();
    });

})