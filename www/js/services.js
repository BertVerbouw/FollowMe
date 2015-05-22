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

.service('mySocket', function ($rootScope) {
    var ip;
    var setIp = function ($ip, $room) {
        ip = $ip;
        var socket = io.connect('http://' + ip + ':3000');
        console.log(socket);
        socket.emit('roomData', $room);
    }
    var getIp = function () {
        return ip;
    }
    return {
        setIp: setIp,
        getIp: getIp,
    }

    var testsocket = io.connect('http://192.168.0.109:3000');
    testsocket.on('news', function (data) {
        console.log(data);
        testsocket.emit('my other event', {
            my: 'FollowMe'
        });
    });
})