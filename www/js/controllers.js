angular.module('starter.controllers', [])


//Controller to handle the main page of the app and all the bluetooth connenction functions. 
.controller('bluetoothController', ['$scope', '$ionicPopover', '$timeout', '$state', '$ionicSideMenuDelegate', 'sharedBeacon', 'sharedRoomData', 'sharedClose', function ($scope, $ionicPopover, $timeout, $state, $ionicSideMenuDelegate, sharedBeacon, sharedRoomData, sharedClose) {
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

    this.closest = sharedClose.getClosest();

    this.prevClosest = {
        'name': '',
        'ip': ''
    };

    var bt = this;

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

    this.btModal = function () {
        ble.enable(
            function () {
                bt.btcheck();
            },
            function () {
                bt.btModal();
            }
        );
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
                bt.btModal();
            }
        );
    };

    /*
    Stops scanning and clears the list of beacons.
    */
    this.stop = function () {
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
    };

    /*
    Ble plugin functions
    */
    $scope.scanIBeacons = function () {
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
                }
            }
        delegate.didExitRegion = function ($pluginResult) //Called when the user exits the region
            {
                var uuid = $pluginResult.region.uuid;
                console.log('deleted:' +
                    uuid);
                bt.beacons[uuid] = undefined;
                $scope.checkClosest();
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
        var ip = 0;
        var name;
        var proxNear = [];
        for (var i in bt.beacons) {
            if (bt.beacons[i]) {
                if (bt.beacons[i].proximity === "ProximityNear" || bt.beacons[i].proximity === "ProximityImmediate") {
                    proxNear.push(bt.beacons[i]);
                }
            } else {
                name = "No Beacons close";
                var socket = io.connect('http://' + bt.prevClosest.ip + ':3000');
                socket.emit('location', {
                    turn: 'off'
                });
                bt.prevClosest = {
                    'name': '',
                    'ip': ''
                };
            }
        }
        if (proxNear) {
            var power = -100;
            for (var i in proxNear) {
                if (proxNear[i].rssi > power) {
                    power = proxNear[i].rssi;
                    name = proxNear[i].uuid;
                    $scope.sendRPi(name);
                }
            }
        }
        sharedClose.setClosest(name);
    };

    $scope.sendRPi = function ($name) {
        for (var i in bt.rooms) {
            if (bt.rooms[i].beacon === $name && $name !== bt.prevClosest.name) {
                var socket = io.connect('http://' + bt.rooms[i].ip + ':3000');
                socket.emit('location', {
                    turn: 'on'
                });
                var socket = io.connect('http://' + bt.prevClosest.ip + ':3000');
                socket.emit('location', {
                    turn: 'off'
                });
                bt.prevClosest.name = $name;
                bt.prevClosest.ip = bt.rooms[i].ip;
            }
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

    $scope.$on('closeUpdated', function () {
        bt.closest = sharedClose.getClosest();
    });

    $scope.$on('valuesUpdated', function () {
        bt.rooms = sharedRoomData.getRooms();
        bt.beacons = sharedBeacon.getBeacon();
    });

}])

.controller("roomController", function ($scope, $state, $cordovaSQLite, $timeout, sharedRoomData, dbfactory) {
    ionic.material.ink.displayEffect();

    var rm = this;
    this.ip;
    this.newroom = {};
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
        var amountLights = sharedRoomData.getTotalLights();
        for (var i = 1; i <= rm.numberOfLights; i++) {
            lights[i] = {
                'name': '',
                'state': '',
                'id': amountLights + i
            };
        }
        rm.newroom.lights = lights;
    }

    rm.numberOfAudio = 0;
    this.initAudio = function () {
        var audio = {};
        var amountAudios = sharedRoomData.getTotalAudios();
        for (var i = 1; i <= rm.numberOfAudio; i++) {
            audio[i] = {
                'name': '',
                'state': '',
                'id': amountAudios + i
            };
        }
        rm.newroom.audio = audio;
    }

    rm.numberOfHeating = 0;
    this.initHeating = function () {
        var heat = {};
        var amountHeatings = sharedRoomData.getTotalHeatings();
        for (var i = 1; i <= rm.numberOfHeating; i++) {
            heat[i] = {
                'name': '',
                'state': '',
                'id': amountHeatings + i
            };
        }
        rm.newroom.heating = heat;
    }

    this.saveRoom = function () {
        if (rm.newroom.name && rm.newroom.beacon && rm.ip) {
            var amount = Object.keys(rm.rooms).length;
            rm.newroom.id = amount + 1;
            rm.newroom.ip = rm.ip;
            rm.rooms[amount + 1] = rm.newroom;
            sharedRoomData.setRooms(rm.rooms);
            var socket = io.connect('http://' + rm.ip + ':3000');
            socket.emit('room data', {
                save: rm.newroom
            });
            $state.go('home');
        } else {
            alert('please enter a name and a beacon for the room as well as an ip address for the Raspberry Pi');
        }
    }

    this.send = function ($data) {
        var socket = io.connect('http://' + rm.room.ip + ':3000');
        socket.emit('room change', {
            change: $data
        });
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
        var amountLights = sharedRoomData.getTotalLights();
        for (var i = 1; i <= er.numberOfLights; i++) {
            lights[i] = {
                'name': '',
                'state': '',
                'id': amountLights + i
            };
            sharedRoomData.addTotalLights();
        }
        er.room.lights = lights;
    }

    this.initAudio = function () {
        var audio = {};
        var amountAudios = sharedRoomData.getTotalAudios();
        for (var i = 1; i <= er.numberOfAudio; i++) {
            audio[i] = {
                'name': '',
                'state': '',
                'id': amountAudios + i
            };
            sharedRoomData.addTotalAudios();
        }
        er.room.audio = audio;
    }

    this.initHeating = function () {
        var heat = {};
        var amountHeatings = sharedRoomData.getTotalHeatings();
        for (var i = 1; i <= er.numberOfHeating; i++) {
            heat[i] = {
                'name': '',
                'state': '',
                'id': amountHeatings + i
            };
            sharedRoomData.addTotalHeatings();
        }
        er.room.heating = heat;
    }

    this.saveRoom = function () {
        var newrooms = sharedRoomData.getRooms();
        newrooms[er.room.id] = er.room;
        sharedRoomData.setRooms(newrooms);
        var socket = io.connect('http://' + er.room.ip + ':3000');
        socket.emit('room edit', {
            edit: er.room
        });
        $state.go('home');
    }

    $scope.$on('roomUpdated', function () {
        er.room = sharedRoomData.getRoom();
    });


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