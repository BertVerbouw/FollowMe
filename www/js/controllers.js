angular.module('starter.controllers', [])


//Controller to handle the main page of the app and all the bluetooth connenction functions. 
.controller('bluetoothController', ['$scope', '$ionicModal', 'sharedBeacon','sharedRoom', function ($scope, $ionicModal, sharedBeacon, sharedRoom) {

    $ionicModal.fromTemplateUrl('templates/detail.html', {
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
    });
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
    this.beacons = {};
    //TimeStamp
    this.timeStart = Date.now();

    var bt = this;

    this.set = false;
    this.setRooms = 0;
    this.maxRooms = 0;

    this.scanStatus = "Scan";

    this.numberOfRooms = 0;

    this.numberOfLights = 0;

    this.numberOfAudio = 0;

    this.numberOfHeating = 0;

    this.rooms = {};
    
    this.goToRoom = function($id){
        
    }
    
    this.log = function(){
        console.log(bt.rooms);
    }

    this.saveRoom = function ($id) {
        if (bt.rooms[$id].saveButton === 'Save Room') {
            if (bt.rooms[$id].saved == false) {
                bt.setRooms++;
            }
            bt.rooms[$id].saveButton = 'Edit Room'
        } else {
            bt.rooms[$id].saveButton = 'Save Room'
        }
    };
    
    this.saveAllRooms = function(){
        bt.set=true;
        var amountofrooms = Object.keys(bt.rooms).length;
        for(var i=0; i<amountofrooms; i++)
        {
            if(bt.rooms[i].name === '')
            {
                delete bt.rooms[i];
                bt.numberOfRooms--;
            }
        }
    };

    this.initRooms = function () {
        if (bt.numberOfRooms < 0) {} else {
            if (bt.numberOfRooms > bt.maxRooms) {
                bt.maxRooms = bt.numberOfRooms;
            } else {
                for (var i = bt.numberOfRooms; i < bt.maxRooms; i++) {
                    delete bt.rooms[i];
                    if (i < bt.setRooms) {
                        bt.setRooms--;
                    }
                }
            }
            for (var i = (0 + bt.setRooms); i < bt.numberOfRooms; i++) {
                bt.rooms[i] = {
                    'id': i,
                    'name': '',
                    'lights': {},
                    'audio': {},
                    'heating': {}, 
                    'saved': false,
                    'saveButton': 'Save Room',
                    'beacon':''
                };
            }
        }
    };

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
                $scope.addFake();
            },
            function () {
                alert("please enable Bluetooth.");
            }
        );
    };

    $scope.addFake = function () {
        $scope.setBeacons('sqmlskjdf', {
            'type': 'test',
            'major': '3',
            'minor': '205',
            'id': '3',
            'uuid':'mjsqfdifjmh' 
        });
    }

    this.stop = function () {
        this.scanStatus = "Scan"
        for (var i in this.regions) {
            var uuid = this.regions[i].uuid;
            var identifier = i + '1';
            var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
                identifier, uuid);
            cordova.plugins.locationManager.stopMonitoringForRegion(
                    beaconRegion) //stop monitoring and ranging
                .fail(console.error)
                .done(console.log("stopped monitoring: id=" + identifier));
        }
    };

    this.clear = function () {
        this.beacons = {};
    };
    $scope.beacons = {};


    $scope.setBeacons = function (key, beacon) {
        this.beacons[key] = beacon;
        bt.beacons = this.beacons;
        $scope.$apply();
    };

    $scope.scanIBeacons = function () {
        this.scanStatus = "Scanning...";

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
                console.log("state changed: " + JSON.stringify($pluginResult));
            }
        delegate.didEnterRegion = function ($pluginResult) //Called when the user enters the region
            {
                console.log("entered region: " + JSON.stringify($pluginResult));
            }
        delegate.didExitRegion = function ($pluginResult) //Called when the user exits the region
            {
                console.log("left region: " + JSON.stringify($pluginResult));
            }
        cordova.plugins.locationManager.setDelegate(delegate); //Set the delegate to be used
        cordova.plugins.locationManager.requestAlwaysAuthorization(); //Ask for permission (iOS8)

        for (var i in this.regions) //For every region defined, start monitoring and ranging
        {

            var beaconRegion = new cordova.plugins.locationManager.BeaconRegion( //make a new BeaconRegion
                i + 1, //identifier
                this.regions[i].uuid); //uuid
            cordova.plugins.locationManager.startMonitoringForRegion(
                    beaconRegion) //start Monitoring for region
                .fail(console.error)
                .done(console.log("started monitoring for: id=" + (i + 1) + ": uuid=" + this.regions[i].uuid));

            cordova.plugins.locationManager.startRangingBeaconsInRegion(
                    beaconRegion) //start Ranging for region
                .fail(console.error)
                .done(console.log("started ranging for: id=" + (i + 1) + ": uuid=" + this.regions[i].uuid));
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

//Controller that holds all information to load the detailed page. All database calls and socket.io functions will be done here.
.controller('detailController', ['$scope', '$state', '$location', 'sharedBeacon', function ($scope, $state, $location, sharedBeacon) {
    this.beacon = function () {
        return sharedBeacon.beacon();
    };
    this.goToRoom = function () {
        var beacon = sharedBeacon.beacon();
        console.log("id:" + beacon.id);
        $state.go('room');
    };
    //Send necessary info to the raspberry Pi
    this.sendToRPi = function () {
        var beacon = sharedBeacon.beacon();
        console.log(beacon.type);
        var desiredTemp = 22; //get from database!

        if (beacon.minor != desiredTemp) {
            console.log("request temperature change: desired temperature: " + desiredTemp + " | current temperature: " + beacon.minor);
        } else {
            console.log('temperature OK')
        }

        var socket = io('http://localhost');
        socket.on('news', function (data) {
            console.log(data);
            socket.emit('my other event', {
                my: 'data'
            });
        });
    };


}])

.controller("roomController", function ($scope, $cordovaSQLite, $timeout, sharedRoom) {

    this.room = function(){
        return sharedRoom.room();
    }

    function getState() {
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

    };
})