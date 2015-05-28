angular.module('starter.services', [])

//Service to share items between controllers.
.service('sharedBeacon', function ($rootScope) {
    var sharedBeacon = {};
    var status = "Scan";
    var setBeacon = function ($beacon) {
        sharedBeacon = $beacon;
        $rootScope.$broadcast("valuesUpdated");
    }
    var getBeacon = function () {
        return sharedBeacon;
    }
    var getStatus = function () {
        return status;
    }
    var setTemp = function ($temp) {
        temp = $temp;
    }
    var getTemp = function () {
        return temp;
    }

    return {
        setBeacon: setBeacon,
        setTemp: setTemp,
        getTemp: getTemp,
        getBeacon: getBeacon,
        getStatus: getStatus,
        beacon: function () {
            return sharedBeacon;
        },
        status: function () {
            return status;
        }
    }
})

.service('sharedRoomData', function ($rootScope, dbfactory, $timeout, $q) {

    var sharedRoomsData = {};
    // ELENA: COMPLETADA LA PARTE DE DB
    var setRooms = function ($rooms) {
        dbfactory.createRoomsDB($rooms); // ADD BY ELENA
        sharedRoomsData = $rooms;
        console.log("sharedroomsdata: " + JSON.stringify(sharedRoomsData));
        $rootScope.$broadcast("valuesUpdated");
    }

    var getRooms = function () {
        return sharedRoomsData;
    }


    var getRoomsFromDB = function () {

        var deferred = $q.defer();

        dbfactory.getRoomsDB().then(function (res) {
            if (res) {
                deferred.resolve(res);
            } else {
                deferred.reject('no data');
            }
        }, function (error) {
            deferred.reject('Error: ' + error);
        });

        return deferred.promise;
    }


    var sharedRoomData = {};
    var setRoom = function ($room) {
        sharedRoomData = $room;
        $rootScope.$broadcast("roomUpdated");
    }
    var getRoom = function () {
        return sharedRoomData;
    }

    var totalLights;

    var getTotalLights = function () {

        dbfactory.getTotalLights().then(function (res) {
            if (res.cont) {
                totalLights = res.cont;
            } else {
                totalLights = 0;
            }
        });

        return totalLights;
    }

    // control number audios
    var totalAudios;

    var getTotalAudios = function () {

        dbfactory.getTotalAudios().then(function (res) {
            if (res.cont) {
                totalAudios = res.cont;
            } else {
                totalAudios = 0;
            }
        });

        return totalAudios;
    }

    // control number heatings
    var totalHeatings;

    var getTotalHeatings = function () {

        dbfactory.getTotalHeatings().then(function (res) {
            if (res.cont) {
                totalHeatings = res.cont;
            } else {
                totalHeatings = 0;
            }
        });

        return totalHeatings;
    }

    return {
        setRooms: setRooms,
        setRoom: setRoom,
        getRooms: getRooms,
        getRoom: getRoom,
        roomsData: function () {
            return sharedRoomsData;
        },
        roomData: function () {
            return sharedRoomData;
        },
        getTotalLights: getTotalLights,
        getTotalAudios: getTotalAudios,
        getTotalHeatings: getTotalHeatings,
        getRoomsFromDB: getRoomsFromDB

    }
})

.service('sharedClose', function ($rootScope) {
    var name;
    var ip;
    var setClosest = function ($closest, $ip) {
        name = $closest;
        ip = $ip;
        $rootScope.$broadcast("closeUpdated");
    }
    var getClosest = function () {
        return name;
    }
    var getIp = function () {
        return ip;
    }
    return {
        setClosest: setClosest,
        getClosest: getClosest,
        getIp: getIp
    }
})