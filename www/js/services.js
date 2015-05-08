angular.module('starter.services', [])

//Service to share items between controllers.
.service('sharedBeacon', function ($rootScope) {
        var sharedBeacon = {};
        var status = "Scan";
        var setBeacon = function ($beacon) {
            sharedBeacon = $beacon;
            $rootScope.$broadcast("valuesUpdated");
        }
        var changeStatus = function () {
            if (status === "Scan") {
                status = "Scanning...";
            } else {
                status = "Scan";
            }
            $rootScope.$broadcast("statusUpdated");
        }
        var getBeacon = function () {
            return sharedBeacon;
        }
        var getStatus = function () {
            return status;
        }

        return {
            setBeacon: setBeacon,
            changeStatus: changeStatus,
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
    .service('sharedRoomData', function ($rootScope) {
        var sharedRoomsData = {};
        var setRooms = function ($rooms) {
            sharedRoomsData = $rooms;
            $rootScope.$broadcast("valuesUpdated");
        }
        var getRooms = function () {
            return sharedRoomsData;
        }

        var sharedRoomData = {
            'beacon': 'sdf'
        };
        var setRoom = function ($room) {
            sharedRoomData = $room;
            $rootScope.$broadcast("roomUpdated");
        }
        var getRoom = function () {
            return sharedRoomData;
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
            }
        }
    })