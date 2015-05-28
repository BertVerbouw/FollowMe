angular.module('starter.factories', [])

.factory("dbfactory", function ($q, $cordovaSQLite, $timeout) {

    var db;

    // function just for programming, DELETE IT! 	
    var verTablas = function () {
        $cordovaSQLite.execute(db, "SELECT * FROM rooms").then(function (res) {
            if (res.rows.length > 0) {
                for (i = 0; i < res.rows.length; i++) {

                }
            } else {

            }
        }, function (err) {
            console.error(err);
        });

        $cordovaSQLite.execute(db, "SELECT * FROM lights").then(function (res) {
            if (res.rows.length > 0) {
                for (i = 0; i < res.rows.length; i++) {

                }
            } else {

            }
        }, function (err) {
            console.error(err);
        });

        $cordovaSQLite.execute(db, "SELECT * FROM audios").then(function (res) {
            if (res.rows.length > 0) {
                for (i = 0; i < res.rows.length; i++) {

                }
            } else {

            }
        }, function (err) {
            console.error(err);
        });

        $cordovaSQLite.execute(db, "SELECT * FROM heatings").then(function (res) {
            if (res.rows.length > 0) {
                for (i = 0; i < res.rows.length; i++) {

                }
            } else {

            }
        }, function (err) {
            console.error(err);
        });
    }

    var openDB = function () {
        if (typeof db === 'undefined') {
            db = null;
            db = $cordovaSQLite.openDB({
                name: "my.db"
            });

        }
    };

    // Create the tables in the database 
    var createTablesBD = function () {


        openDB();
        // creamos la tabla para las habitaciones, las luces, radios...
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS rooms (roomid INTEGER PRIMARY KEY, name TEXT, beacon INTEGER)").then(function () {

        }, function (err) {
            console.error(err);
        });

        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS lights (lightid INTEGER PRIMARY KEY, name TEXT, room INTEGER, state BOOLEAN, FOREIGN KEY(room) REFERENCES rooms(roomid))").then(function () {

        }, function (err) {
            console.error(err);
        })

        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS audios (audioid INTEGER PRIMARY KEY, name TEXT, room INTEGER, state BOOLEAN, volume INTEGER, FOREIGN KEY(room) REFERENCES rooms(roomid))").then(function () {

        }, function (err) {
            console.error(err);
        })

        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS heatings (heatingid INTEGER PRIMARY KEY, name TEXT, room INTEGER, state BOOLEAN, temperature INTEGER, FOREIGN KEY(room) REFERENCES rooms(roomid))").then(function () {

        }, function (err) {
            console.error(err);
        })

        verTablas();
    };

    // get total number of lights in the DB
    var getTotalLights = function () {

        var deferred = $q.defer();

        openDB();

        $cordovaSQLite.execute(db, "SELECT count(*) cont FROM lights").then(function (res) {
            if (res.rows.length > 0) {
                deferred.resolve(res.rows.item(0));
            } else {
                console.log("No lights");
                deferred.resolve(0);
            }

        }, function (err) {
            console.error(err);
            deferred.resolve(0);
        });

        return deferred.promise;
    };

    // get total number of audios in the DB
    var getTotalAudios = function () {

        var deferred = $q.defer();

        openDB();

        $cordovaSQLite.execute(db, "SELECT count(*) cont FROM audios").then(function (res) {
            if (res.rows.length > 0) {
                deferred.resolve(res.rows.item(0));
            } else {
                console.log("No audios");
                deferred.resolve(0);
            }

        }, function (err) {
            console.error(err);
            deferred.resolve(0);
        });

        return deferred.promise;
    };

    // get total number of heatings in the DB
    var getTotalHeatings = function () {

        var deferred = $q.defer();

        openDB();

        $cordovaSQLite.execute(db, "SELECT count(*) cont FROM heatings").then(function (res) {
            if (res.rows.length > 0) {
                deferred.resolve(res.rows.item(0));
            } else {

                deferred.resolve(0);
            }

        }, function (err) {
            console.error(err);
            deferred.resolve(0);
        });

        return deferred.promise;
    };

    // create rooms in the DB
    var createRoomsDB = function (rooms) {

        // creamos las diferentes habitaciones
        for (i = 1; i <= Object.keys(rooms).length; i++) {

            createRoomBD(rooms[i.toString()]);

        }

    };

    // create a room in the DB
    var createRoomBD = function (room) {

        $cordovaSQLite.execute(db, "INSERT OR IGNORE INTO rooms VALUES(?,?,?)", [room.id, room.name, room.beacon]).then(function () {

        }, function (err) {
            console.error(err);
        });

        if (room.lights) {
            for (a = 1; a <= Object.keys(room.lights).length; a++) {
                createLightBD(room.id, room.lights[a.toString()]);
            }
        }

        if (room.audio) {
            for (b = 1; b <= Object.keys(room.audio).length; b++) {
                createAudioBD(room.id, room.audio[b.toString()]);
            }
        }

        if (room.heating) {
            for (c = 1; c <= Object.keys(room.heating).length; c++) {
                createHeatingBD(room.id, room.heating[c.toString()]);
            }
        }

        verTablas();

    };

    // create a light in the DB
    var createLightBD = function (roomid, light) {

        $cordovaSQLite.execute(db, "INSERT OR IGNORE INTO lights VALUES(?,?,?,?)", [light.id, light.name, roomid, light.state]).then(function () {

        }, function (err) {
            console.error(err);
        });
    };

    // create an audio device in the DB
    var createAudioBD = function (roomid, audio) {

        $cordovaSQLite.execute(db, "INSERT OR IGNORE INTO audios VALUES(?,?,?,?,?)", [audio.id, audio.name, roomid, audio.state, audio.volume]).then(function () {

        }, function (err) {
            console.error(err);
        });
    };

    // create a heating device in the DB
    var createHeatingBD = function (roomid, heating) {

        $cordovaSQLite.execute(db, "INSERT OR IGNORE INTO heatings VALUES(?,?,?,?,?)", [heating.id, heating.name, roomid, heating.state, heating.temperature]).then(function () {

        }, function (err) {
            console.error(err);
        });
    };


    var getRoomsDB = function () {

        var deferred = $q.defer();

        openDB();

        $cordovaSQLite.execute(db, "SELECT * FROM rooms").then(function (res) {
            if (res.rows.length > 0) {
                var rooms = {};
                for (i = 0; i < res.rows.length; i++) {

                    getRoomInformation(res.rows.item(i).roomid).then(function (res) {

                        if (res) {
                            rooms[i] = res;
                        } else {
                            console.log("ERR");
                        }

                        deferred.resolve(rooms);
                    });
                }
            } else {

                deferred.reject()

            }
        }, function (err) {
            console.error(err);
            deferred.reject(err)
        });

        return deferred.promise;
    };


    var getRoomDB = function (roomid) {

        var deferred = $q.defer();

        $cordovaSQLite.execute(db, "SELECT * FROM rooms WHERE roomid=?", [roomid]).then(function (res) {
            if (res.rows.length > 0) {

                room = {
                    'id': res.rows.item(0).roomid,
                    'name': res.rows.item(0).name,
                    'saveButton': res.rows.item(0).saveButton,
                    'beacon': res.rows.item(0).beacon,
                };

                deferred.resolve(room);
            } else {

                deferred.reject();
            }
        }, function (err) {
            console.error(err);
            deferred.reject(err);
        });

        return deferred.promise;
    };


    var getRoomInformation = function (roomId) {

        var deferred = $q.defer();

        var roomInfo = {};


        getRoomDB(roomId).then(function (roomData) {

            roomInfo.id = roomId;
            roomInfo.name = roomData.name;
            roomInfo.saveButton = roomData.saveButton;
            roomInfo.beacon = roomData.beacon;

            return getLightsRoomDB(roomId);

        }).then(function (lightInformationData) {

            roomInfo.lights = lightInformationData;

            return getAudiosRoomDB(roomId);

        }).then(function (audioInformationData) {

            roomInfo.audio = audioInformationData;

            return getHeatingsRoomDB(roomId);

        }).then(function (heatingInformationData) {

            roomInfo.heating = heatingInformationData;

            deferred.resolve(roomInfo);

        }, function (error) {
            deferred.reject(roomInfo);
        });

        return deferred.promise;
    }

    var getLightsRoomDB = function (roomid) {

        var deferred = $q.defer();

        $cordovaSQLite.execute(db, "SELECT * FROM lights WHERE room=?", [roomid]).then(function (res) {
            if (res.rows.length > 0) {
                var lights = {};
                for (i = 0; i < res.rows.length; i++) {
                    getLightDB(res.rows.item(i).lightid).then(function (res) {
                        if (res) {
                            lights[i] = res;
                        } else {

                        }
                        deferred.resolve(lights);
                    });
                }
            } else {

            }
        }, function (err) {
            console.error(err);
        });

        return deferred.promise;
    }


    var getLightDB = function (lightid) {

        var deferred = $q.defer();

        $cordovaSQLite.execute(db, "SELECT * FROM lights WHERE lightid=?", [lightid]).then(function (res) {
            if (res.rows.length > 0) {
                light = {
                    'id': res.rows.item(0).lightid,
                    'name': res.rows.item(0).name,
                    'state': res.rows.item(0).state
                };
                deferred.resolve(light);
            } else {

            }
        }, function (err) {
            console.error(err);
        });

        return deferred.promise;
    }

    var getAudiosRoomDB = function (roomid) {

        var deferred = $q.defer();

        $cordovaSQLite.execute(db, "SELECT * FROM audios WHERE room=?", [roomid]).then(function (res) {
            if (res.rows.length > 0) {
                var audios = {};
                for (i = 0; i < res.rows.length; i++) {
                    getAudioDB(res.rows.item(i).audioid).then(function (res) {
                        if (res) {
                            audios[i] = res;
                        } else {
                            console.log("ERR");
                        }
                        deferred.resolve(audios);
                    });
                }
            } else {

            }
        }, function (err) {
            console.error(err);
        });

        return deferred.promise;
    }


    var getAudioDB = function (audioid) {

        var deferred = $q.defer();

        $cordovaSQLite.execute(db, "SELECT * FROM audios WHERE audioid=?", [audioid]).then(function (res) {
            if (res.rows.length > 0) {
                audio = {
                    'id': res.rows.item(0).audioid,
                    'name': res.rows.item(0).name,
                    'state': res.rows.item(0).state
                };
                deferred.resolve(audio);
            } else {

            }
        }, function (err) {
            console.error(err);
        });

        return deferred.promise;
    }

    var getHeatingsRoomDB = function (roomid) {

        $cordovaSQLite.execute(db, "SELECT * FROM heatings WHERE room=?", [roomid]).then(function (res) {
            if (res.rows.length > 0) {
                for (i = 0; i < res.rows.length; i++) {
                    heatings[i] = getHeatingDB(res.rows.item(i).heatingid);
                }
                return heatings;
            } else {

                return {};
            }
        }, function (err) {
            console.error(err);
        });

    }

    var getHeatingsRoomDB = function (roomid) {

        var deferred = $q.defer();

        $cordovaSQLite.execute(db, "SELECT * FROM heatings WHERE room=?", [roomid]).then(function (res) {
            if (res.rows.length > 0) {
                var heatings = {};
                for (i = 0; i < res.rows.length; i++) {
                    getHeatingDB(res.rows.item(i).heatingid).then(function (res) {
                        if (res) {
                            heatings[i] = res;
                        } else {
                            console.log("ERR");
                        }
                        deferred.resolve(heatings);
                    });
                }
            } else {

            }
        }, function (err) {
            console.error(err);
        });

        return deferred.promise;
    }


    var getHeatingDB = function (heatingid) {

        var deferred = $q.defer();

        $cordovaSQLite.execute(db, "SELECT * FROM heatings WHERE heatingid=?", [heatingid]).then(function (res) {
            if (res.rows.length > 0) {
                heating = {
                    'id': res.rows.item(0).heatingid,
                    'name': res.rows.item(0).name,
                    'state': res.rows.item(0).state
                };
                deferred.resolve(heating);
            } else {

            }
        }, function (err) {
            console.error(err);
        });

        return deferred.promise;
    }


    var deleteRoomDB = function (roomid) {
        $cordovaSQLite.execute(db, "DELETE FROM rooms WHERE roomid=?", [roomid]).then(function () {
            console.log("DELETE room");
        }, function (err) {
            console.error(err);
        });
    }

    /*
	var updateRoomDB = function(roomid, room){
		deleteRoomDB(roomid);
		createRoomDB(room);
	}


	var updateLightDB = function(lightid){

	}

	var updateRadioDB = function(radioid){

	}

	var updateHeatingDB = function(heatingDB){

	}
	 */
    return {
        openDB: openDB,
        createTablesBD: createTablesBD,
        createRoomsDB: createRoomsDB,
        getTotalLights: getTotalLights,
        getTotalAudios: getTotalAudios,
        getTotalHeatings: getTotalHeatings,
        getRoomsDB: getRoomsDB,
        deleteRoomDB: deleteRoomDB
    }
})