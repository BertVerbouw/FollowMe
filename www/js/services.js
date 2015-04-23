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