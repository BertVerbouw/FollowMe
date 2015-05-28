angular.module('starter.factories', [])

.factory("dbfactory", function ($q, $cordovaSQLite, $timeout) {

    var db;

    // function just for programming, DELETE IT! 	
    var verTablas = function () {
        console.log("ESTADO DE LA BASE DE DATOS: ");
        $cordovaSQLite.execute(db, "SELECT * FROM rooms").then(function (res) {
            if (res.rows.length > 0) {
                for (i = 0; i < res.rows.length; i++) {
                    console.log("Rooms " + i + "> " + res.rows.item(i).roomid + " , " + res.rows.item(i).name + " , " + res.rows.item(i).beacon);
                }
            } else {
                console.log("No rooms");
            }
        }, function (err) {
            console.error(err);
        });

        $cordovaSQLite.execute(db, "SELECT * FROM lights").then(function (res) {
            if (res.rows.length > 0) {
                for (i = 0; i < res.rows.length; i++) {
                    console.log("Lights " + i + "> " + res.rows.item(i).lightid + " , " + res.rows.item(i).name + " , " + res.rows.item(i).room + " , " + res.rows.item(i).state);
                }
            } else {
                console.log("No lights");
            }
        }, function (err) {
            console.error(err);
        });

        $cordovaSQLite.execute(db, "SELECT * FROM audios").then(function (res) {
            if (res.rows.length > 0) {
                for (i = 0; i < res.rows.length; i++) {
                    console.log("Audios " + i + "> " + res.rows.item(i).audioid + " , " + res.rows.item(i).name + " , " + res.rows.item(i).room + " , " + res.rows.item(i).state + " , " + res.rows.item(i).volume);
                }
            } else {
                console.log("No audios");
            }
        }, function (err) {
            console.error(err);
        });

        $cordovaSQLite.execute(db, "SELECT * FROM heatings").then(function (res) {
            if (res.rows.length > 0) {
                for (i = 0; i < res.rows.length; i++) {
                    console.log("Heatings " + i + "> " + res.rows.item(i).heatingid + " , " + res.rows.item(i).name + " , " + res.rows.item(i).room + " , " + res.rows.item(i).state + " , " + res.rows.item(i).temperature);
                }
            } else {
                console.log("No heatings");
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
            console.log("OPENING DB");
        }
    };

    // Create the tables in the database 
    var createTablesBD = function () {

        console.log("CREATING TABLES");

        openDB();
        // creamos la tabla para las habitaciones, las luces, radios...
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS rooms (roomid INTEGER PRIMARY KEY, name TEXT, beacon INTEGER, ip TEXT)").then(function () {
            console.log("CREATE TABLE rooms");
        }, function (err) {
            console.error(err);
        });

        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS lights (lightid INTEGER PRIMARY KEY, name TEXT, room INTEGER, state BOOLEAN, FOREIGN KEY(room) REFERENCES rooms(roomid))").then(function () {
            console.log("CREATE TABLE lights");
        }, function (err) {
            console.error(err);
        })

        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS audios (audioid INTEGER PRIMARY KEY, name TEXT, room INTEGER, state BOOLEAN, volume INTEGER, FOREIGN KEY(room) REFERENCES rooms(roomid))").then(function () {
            console.log("CREATE TABLE audios");
        }, function (err) {
            console.error(err);
        })

        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS heatings (heatingid INTEGER PRIMARY KEY, name TEXT, room INTEGER, state BOOLEAN, temperature INTEGER, FOREIGN KEY(room) REFERENCES rooms(roomid))").then(function () {
            console.log("CREATE TABLE heatings");
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
            deferred.resolve(err);
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
            deferred.resolve(err);
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
                console.log("No heatings");
                deferred.resolve(0);
            }

        }, function (err) {
            console.error(err);
            deferred.resolve(err);
        });

        return deferred.promise;
    };

    // create rooms in the DB
    var createRoomsDB = function (rooms) {
        console.log("createroomsdb: " + JSON.stringify(rooms));
        // creamos las diferentes habitaciones
        for (i = 1; i <= Object.keys(rooms).length; i++) {
            console.log("create room: " + JSON.stringify(rooms[i.toString()]));
            createRoomBD(rooms[i.toString()]);

        }

    };

    // create a room in the DB
    var createRoomBD = function (room) {

        $cordovaSQLite.execute(db, "INSERT OR IGNORE INTO rooms VALUES(?,?,?,?)", [room.id, room.name, room.beacon, room.ip]).then(function () {
            console.log("INSERT room: " + room.name);
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
            console.log("INSERT lights: " + light.name);
        }, function (err) {
            console.error(err);
        });
    };

    // create an audio device in the DB
    var createAudioBD = function (roomid, audio) {

        $cordovaSQLite.execute(db, "INSERT OR IGNORE INTO audios VALUES(?,?,?,?,?)", [audio.id, audio.name, roomid, audio.state, audio.volume]).then(function () {
            console.log("INSERT audios: " + audio.name);
        }, function (err) {
            console.error(err);
        });
    };

    // create a heating device in the DB
    var createHeatingBD = function (roomid, heating) {

        $cordovaSQLite.execute(db, "INSERT OR IGNORE INTO heatings VALUES(?,?,?,?,?)", [heating.id, heating.name, roomid, heating.state, heating.temperature]).then(function () {
            console.log("INSERT heatings: " + heating.name);
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
                var promiseArray = {};
                for (i = 0; i < res.rows.length; i++) {
                    console.log("Rooms> " + res.rows.item(i).roomid + " , " + res.rows.item(i).name + " , " + res.rows.item(i).saveButton + " , " + res.rows.item(i).beacon);
                    promiseArray[i + 1] = getRoomInformation(res.rows.item(i).roomid);
                    console.log("PA: " + JSON.stringify(promiseArray[i + 1]));
                }
                console.log("AQUI promiseArray: " + JSON.stringify(promiseArray));
                $q.all(promiseArray).then(function (res) {
                    console.log("All Returned");
                    console.log("res: " + JSON.stringify(res));
                    deferred.resolve(res);
                }, function (err) {
                    console.error(err);
                    deferred.reject(err);
                });
            } else {
                console.log("No results found");
                deferred.resolve(0);

            }
        }, function (err) {
            console.error(err);
            deferred.reject(err);
        });

        return deferred.promise;
    };


    var getRoomDB = function (roomid) {

        var deferred = $q.defer();

        $cordovaSQLite.execute(db, "SELECT * FROM rooms WHERE roomid=?", [roomid]).then(function (res) {
            if (res.rows.length > 0) {
                console.log("Room> " + res.rows.item(0).roomid + " , " + res.rows.item(0).name + " , " + res.rows.item(0).saveButton + " , " + res.rows.item(0).beacon);
                room = {
                    'id': res.rows.item(0).roomid,
                    'name': res.rows.item(0).name,
                    'beacon': res.rows.item(0).beacon,
                    'ip': res.rows.item(0).ip
                };
                console.log("room q se envia desde getroomdb: " + JSON.stringify(room));
                deferred.resolve(room);
            } else {
                console.log("No results found");
                deferred.resolve(0);
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

        console.log("GETROOMINFORMATION");

        getRoomDB(roomId).then(function (roomData) {

            roomInfo.id = roomId;
            roomInfo.name = roomData.name;
            roomInfo.saveButton = roomData.saveButton;
            roomInfo.beacon = roomData.beacon;
            roomInfo.ip = roomData.ip;

            console.log("roomInfo:" + JSON.stringify(roomInfo));

            return getLightsRoomDB(roomId);

        }).then(function (lightInformationData) {

            roomInfo.lights = lightInformationData;

            console.log("roomInfo:" + JSON.stringify(roomInfo));

            return getAudiosRoomDB(roomId);

        }).then(function (audioInformationData) {

            roomInfo.audio = audioInformationData;

            console.log("roomInfo:" + JSON.stringify(roomInfo));

            return getHeatingsRoomDB(roomId);

        }).then(function (heatingInformationData) {

            roomInfo.heating = heatingInformationData;

            console.log("roomInfo:" + JSON.stringify(roomInfo));

            deferred.resolve(roomInfo);

        }, function (error) {
            deferred.reject(error);
        });

        console.log("AQUI");
        return deferred.promise;
    }

    var getLightsRoomDB = function (roomid) {

        var deferred = $q.defer();

        $cordovaSQLite.execute(db, "SELECT * FROM lights WHERE room=?", [roomid]).then(function (res) {
            if (res.rows.length > 0) {
                var lights = {};
                var promiseArray = {};
                for (i = 0; i < res.rows.length; i++) {
                    promiseArray[i + 1] = getLightDB(res.rows.item(i).lightid);
                }
                $q.all(promiseArray).then(function (res) {
                    deferred.resolve(res);
                })
            } else {
                console.log("No lights in the room");
                deferred.resolve(0);
            }
        }, function (err) {
            console.error(err);
            deferred.reject(err);
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
                    'state': toBool(res.rows.item(0).state)
                };
                deferred.resolve(light);
            } else {
                console.log("No results found");
                deferred.resolve(0);
            }
        }, function (err) {
            console.error(err);
            deffered.reject(err);
        });

        return deferred.promise;
    }

    var toBool = function (string) {
        var bool;
        if (string === "true")
            bool = true;
        else if (string === "false")
            bool = false;
        else
            console.log("ERROR");
        return bool;
    }


    var getAudiosRoomDB = function (roomid) {

        var deferred = $q.defer();

        $cordovaSQLite.execute(db, "SELECT * FROM audios WHERE room=?", [roomid]).then(function (res) {
            if (res.rows.length > 0) {
                var audios = {};
                var promiseArray = {};
                for (i = 0; i < res.rows.length; i++) {
                    promiseArray[i + 1] = getAudioDB(res.rows.item(i).audioid);
                }
                $q.all(promiseArray).then(function (res) {
                    deferred.resolve(res);
                })
            } else {
                console.log("No audios in the room");
                deferred.resolve(0);
            }
        }, function (err) {
            console.error(err);
            deferred.reject(err);
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
                    'state': toBool(res.rows.item(0).state)
                };
                deferred.resolve(audio);
            } else {
                console.log("No results found");
                deferred.resolve(0);
            }
        }, function (err) {
            console.error(err);
            deferred.reject(err);
        });

        return deferred.promise;
    }

    var getHeatingsRoomDB = function (roomid) {

        var deferred = $q.defer();

        $cordovaSQLite.execute(db, "SELECT * FROM heatings WHERE room=?", [roomid]).then(function (res) {
            if (res.rows.length > 0) {
                var heatings = {};
                var promiseArray = {};
                for (i = 0; i < res.rows.length; i++) {
                    promiseArray[i + 1] = getHeatingDB(res.rows.item(i).heatingid);
                }
                $q.all(promiseArray).then(function (res) {
                    deferred.resolve(res);
                })
            } else {
                console.log("No heatings in the room");
                deferred.resolve(0);
            }
        }, function (err) {
            console.error(err);
            deferred.reject(err);
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
                    'state': toBool(res.rows.item(0).state)
                };
                deferred.resolve(heating);
            } else {
                console.log("No results found");
                deferred.resolve(0);
            }
        }, function (err) {
            console.error(err);
            deferred.reject(err);
        });

        return deferred.promise;
    }


    var deleteRoomDB = function (roomid) {
        $cordovaSQLite.execute(db, "DELETE FROM rooms WHERE roomid=?", [roomid]).then(function () {
            console.log("DELETE room");
        }, function (err) {
            console.error(err);
        });
        $cordovaSQLite.execute(db, "DELETE FROM lights WHERE room=?", [roomid]).then(function () {
            console.log("DELETE light")
        }, function (err) {
            console.error(err);
        });
        $cordovaSQLite.execute(db, "DELETE FROM audios WHERE room=?", [roomid]).then(function () {
            console.log("DELETE audio")
        }, function (err) {
            console.error(err);
        });
        $cordovaSQLite.execute(db, "DELETE FROM heatings WHERE room=?", [roomid]).then(function () {
            console.log("DELETE heating")
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
        createRoomBD: createRoomBD,
        getTotalLights: getTotalLights,
        getTotalAudios: getTotalAudios,
        getTotalHeatings: getTotalHeatings,
        getRoomsDB: getRoomsDB,
        deleteRoomDB: deleteRoomDB
    }
})