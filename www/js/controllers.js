angular.module('starter.controllers', [])


//Controller to handle the main page of the app and all the bluetooth connenction functions. 
.controller('bluetoothController', ['$scope', '$timeout', '$state', '$ionicSideMenuDelegate', 'sharedBeacon', 'sharedRoomData', function ($scope, $timeout, $state, $ionicSideMenuDelegate, sharedBeacon, sharedRoomData) {

    /*$ionicModal.fromTemplateUrl('templates/detail.html', {
        scope: $scope,
        animation: 'slide-in-left'
    })

    .then(function (modal) {
        $scope.modal = modal;
    });
    this.openModal = function ($beacon) {
        $scope.modal.show();
        sharedBeacon.setBeacon($beacon);
    };
    this.closeModal = function () {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });*/

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
        uuid: '11122334-4556-6778-899A-ABBCCDDEEFF1'
 }];
    //Object in which all detected beacons will be stored.
    this.beacons = sharedBeacon.getBeacon();
    //TimeStamp
    this.timeStart = Date.now();

    var bt = this;

    this.set = true;
    this.setRooms = 0;
    this.maxRooms = 0;

    this.numberOfLights = 0;

    this.numberOfAudio = 0;

    this.numberOfHeating = 0;

    this.rooms = sharedRoomData.getRooms();

    this.numberOfRooms = Object.keys(bt.rooms).length;

    this.setRoom = function ($id) {
        sharedRoomData.setRoom(bt.rooms[$id]);
    }

    this.saveRoom = function ($id) {
        if (bt.rooms[$id].saveButton === 'Save Room') {
            bt.rooms[$id].saveButton = 'Edit Room'
        } else {
            bt.rooms[$id].saveButton = 'Save Room'
        }
    };

    this.saveAllRooms = function () {
        bt.set = true;
        for (var i = 1; i < Object.keys(bt.rooms).length + 1; i++) {
            bt.saveRoom(i);
            if (bt.rooms[i].name === '' || bt.rooms[i].beacon === '') {
                delete bt.rooms[i];
                bt.numberOfRooms--;
            }
        }
        sharedRoomData.setRooms(bt.rooms);
        $state.go('home');
    };

    this.initRooms = function () {
        var length = Object.keys(bt.rooms).length;
        if (bt.numberOfRooms < length) {
            delete bt.rooms[length];
        } else if (bt.numberOfRooms > length) {
            bt.rooms[length + 1] = {
                'id': length + 1,
                'name': '',
                'lights': {},
                'audio': {},
                'heating': {},
                'saveButton': 'Save Room',
                'beacon': 'mdsqfuih'
            };
        }
        if (bt.numberOfRooms !== Object.keys(bt.rooms).length) {
            bt.initRooms();
            console.log("not equal!");
        }

    }

    this.initLights = function ($id) {
        var lights = {};
        for (var i = 0; i < bt.numberOfLights; i++) {
            lights[i] = {
                'name': '',
                'state': ''
            };
        }
        bt.rooms[$id].lights = lights;
    }
    this.initAudio = function ($id) {
        var audio = {};
        for (var i = 0; i < bt.numberOfAudio; i++) {
            audio[i] = {
                'name': '',
                'state': ''
            };
        }
        bt.rooms[$id].audio = audio;
    }
    this.initHeating = function ($id) {
        var heat = {};
        for (var i = 0; i < bt.numberOfHeating; i++) {
            heat[i] = {
                'name': '',
                'state': ''
            };
        }
        bt.rooms[$id].heating = heat;
    }

    this.startup = function () {
        ble.isEnabled(
            function () {
                $scope.scanIBeacons();
            },
            function () {
                alert("please enable Bluetooth.");
            }
        );
    };

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
        }, 500);
        $timeout(function () {
            $scope.clear()
        }, 500);
    };

    $scope.clear = function () {
        sharedBeacon.setBeacon({});
        bt.beacons = sharedBeacon.getBeacon();
    };

    $scope.setBeacons = function (key, beacon) {
        var tempbeacons = sharedBeacon.getBeacon();
        tempbeacons[key] = beacon;
        sharedBeacon.setBeacon(tempbeacons);
        $scope.$apply();
    };

    $scope.scanIBeacons = function () {
        sharedBeacon.changeStatus();
        var delegate = new cordova.plugins.locationManager.Delegate(); //This object holds the iBeacon callback functions.
        delegate.didRangeBeaconsInRegion = function ($pluginResult) //Continuously called when ranging
            {
                for (var i in $pluginResult.beacons) {
                    //Insert beacon into table of found beacons.
                    var beacon = $pluginResult.beacons[i];
                    beacon.timeStamp = Date.now();
                    beacon.type = $scope.checkType(beacon.major).type;
                    beacon.id = $scope.checkType(beacon.major).id;
                    var key = beacon.uuid;
                    $scope.setBeacons(key, beacon);
                }
            }
        delegate.didStartMonitoringForRegion = function ($pluginResult) //Called when starting to monitor a region
            {
                console.log("monitoring:" + JSON.stringify($pluginResult));
            }
        delegate.didDetermineStateForRegion = function ($pluginResult) //Called when the state of a region changes during monitoring
            {
                for (var i in $pluginResult.beacons) {
                    //Insert beacon into table of found beacons.
                    var beacon = $pluginResult.beacons[i];
                    beacon.timeStamp = Date.now();
                    beacon.type = $scope.checkType(beacon.major).type;
                    beacon.id = $scope.checkType(beacon.major).id;
                    var key = beacon.uuid;
                    $scope.setBeacons(key, beacon);
                }
            }
        delegate.didEnterRegion = function ($pluginResult) //Called when the user enters the region
            {
                for (var i in $pluginResult.beacons) {
                    //Insert beacon into table of found beacons.
                    var beacon = $pluginResult.beacons[i];
                    beacon.timeStamp = Date.now();
                    beacon.type = $scope.checkType(beacon.major).type;
                    beacon.id = $scope.checkType(beacon.major).id;
                    var key = beacon.uuid;
                    $scope.setBeacons(key, beacon);
                }
            }
        delegate.didExitRegion = function ($pluginResult) //Called when the user exits the region
            {
                console.log("left region: " + JSON.stringify($pluginResult));
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
                .done(console.log("started monitoring for: id=" + (i + 1) + ": uuid=" + bt.regions[i].uuid));

            cordova.plugins.locationManager.startRangingBeaconsInRegion(
                    beaconRegion) //start Ranging for region
                .fail(console.error)
                .done(console.log("started ranging for: id=" + (i + 1) + ": uuid=" + bt.regions[i].uuid));
        }
    };

    $scope.checkType = function ($major) {
        var type;
        switch ($major.charAt(0)) {
        case "2":
            type = {
                'type': 'nordic beacon',
                'id': '2'
            };
            break;
        case "1":
            type = {
                'type': 'blue beacon',
                'id': '1'
            };
            break;
        default:
            type = {
                'type': 'not recognised',
                'id': '3'
            };
        }
        return type;
    };
}])

.controller("roomController", function ($scope, $cordovaSQLite, $timeout, sharedRoomData) {

        this.getData = function () {
                this.room = sharedRoomData.getRoom();
                console.log(this.room);
            }
            /*function getState() {
                console.log("GETSTATE FUNCTION");
                $cordovaSQLite.execute(db, "SELECT state FROM elements WHERE elemid=1 AND room=1 AND type=1").then(function (res) {
                    if (res.rows.length > 0) {
                        console.log("SELECTED STATE LIGHT ROOM 1> " + res.rows.item(0).state);

                        $timeout(function () {
                            if (res.rows.item(0).state === "true") {
                                $scope.checkboxModel.value1 = true;
                            } else {
                                $scope.checkboxModel.value1 = false;
                            }
                        }, 10);
                    } else {
                        console.log("No results found");
                        $timeout(function () {
                            $scope.checkboxModel.value1 = 'false';
                        }, 10);
                    }
                }, function (err) {

                    console.error(err);
                });

            };

            $scope.$on('$ionicView.beforeEnter', function () {

                console.log("SCOPE.ON ");
                getState();
            });


            $scope.changeState = function () {
                console.log("CHANGESTATE " + $scope.checkboxModel.value1);

                if ($scope.checkboxModel.value1 == true) {
                    $scope.value3 = "on";
                    $cordovaSQLite.execute(db, "UPDATE elements SET state='true' WHERE elemid=1").then(function () {
                        console.log("UPDATE elements");
                    }, function (err) {
                        console.error(err);
                    });
                } else if ($scope.checkboxModel.value1 == false) {
                    $scope.value3 = "off";
                    $cordovaSQLite.execute(db, "UPDATE elements SET state='false' WHERE elemid=1").then(function () {
                        console.log("UPDATE elements");
                    }, function (err) {
                        console.error(err);
                    });
                } else {
                    console.log("NO CHANGE ");

                }

            };*/
    })
    .controller("homeController", function ($scope, sharedBeacon, sharedRoomData) {

        var home = this;
        this.rooms = sharedRoomData.getRooms();
        this.beacons = sharedBeacon.getBeacon();
        this.status = sharedBeacon.getStatus();

        $scope.$on('valuesUpdated', function () {
            home.rooms = sharedRoomData.getRooms();
            home.beacons = sharedBeacon.getBeacon();
        });
    
        $scope.$on('statusUpdated', function () {
            home.status = sharedBeacon.getStatus();
            if(home.status === "Scanning...")
               {
            $scope.$apply();
        }
        });
    })