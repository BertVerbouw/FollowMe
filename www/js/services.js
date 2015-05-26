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

    return {
        setBeacon: setBeacon,
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

    var sharedRoomData = {};
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

.service('sharedClose', function ($rootScope) {
    var name;
    var setClosest = function ($closest) {
        name = $closest;
        $rootScope.$broadcast("closeUpdated");
    }
    var getClosest = function () {
        return name;
    }
    return {
        setClosest: setClosest,
        getClosest: getClosest,
    }
})