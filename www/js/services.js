angular.module('starter.services', [])


//Service to share items between controllers.
 .service('sharedBeacon', function() {
    var sharedBeacon = {};
    var setBeacon = function($beacon)
    {
        sharedBeacon = $beacon;
    }
    var getBeacon = function()
    {
        return sharedBeacon;    
    }
    
    return {
        setBeacon: setBeacon,
        getBeacon: getBeacon,
        beacon : function () {
            return sharedBeacon;
        }
    }
  })
.service('sharedRoom', function(){
    var sharedRoom = {};
    var setRoom = function($room)
    {
        sharedRoom = $room;
    }
    var getRoom = function(){
        return sharedRoom;
    }
    return {
        setRoom: setRoom,
        getRoom: getRoom,
        room: function(){
            return sharedRoom;
        }
    }
})