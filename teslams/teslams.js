// By Hans Jespersen
var util = require('util');
var JSONbig = require('json-bigint');

module.exports = function(RED) {
    "use strict";
    var teslams = require('teslams');

	var carNum = 0;

    function TeslaLogin(n) {

        RED.nodes.createNode(this,n);
        var node = this;
        var tesla_email = this.credentials.user;
        var tesla_password = this.credentials.password;
        var tesla_token = this.credentials.token;

		var logindata = "";
		if(tesla_token != "")
		{
			logindata = { email: tesla_email, token: tesla_token };
		}
		else
		{
			logindata = { email: tesla_email, password: tesla_password };
		}

        this.on("input", function(msg) {
            var outmsg = { 
                topic: msg.topic
            };
			carNum = parseInt(msg.payload);
            try{
                teslams.all( logindata, function ( error, response, body ) {
                    var data, vehicle, e;
                    //check we got a valid JSON response from Tesla
                    //util.inspect( 'response is: \n' + response );
                    try { 
                        data = JSONbig.parse(body); 
                    } catch(err) { 
                        console.log('[teslams] Telsa login error: ' + err);
						if(response != undefined)
							console.log('[teslams] Response: ' + response);
                        outmsg.payload = err;
                        node.send(outmsg);
						return; //some error will crash node-red if we don't exit here
                    }
                    //check we got an array of vehicles and get the first one
                    if (!util.isArray(data.response)) {
                        util.inspect( data.response );                        
                        e = new Error('expecting an array from Tesla Motors cloud service');
                        util.log('[teslams] ' + e);
                        outmsg.payload = e;
                        node.send(outmsg);
                    } else {
                        vehicle = data.response[carNum];
                        //check the vehicle has a valid id
                        if (vehicle === undefined || vehicle.id === undefined) {
                            e = new Error('expecting vehicle ID from Tesla Motors cloud service');
                            util.log('[teslams] ' + e );
                            outmsg.payload = e;
                            node.send(outmsg);
                        } else {                     
                            vehicle.id = vehicle.id.toString();
                            vehicle.vehicle_id = vehicle.vehicle_id.toString();
                            outmsg.payload = JSON.stringify(new Array(vehicle) );
                            node.send(outmsg);
                        } 
                    }          
                });
            } catch (e) {
                util.log('[teslams] Telsa login error: ' + e);
                outmsg.payload = e;
                node.send(outmsg);
            }
        });
    }
    RED.nodes.registerType("login",TeslaLogin,{
        credentials: {
            user: {type:"text"},
            password: {type: "password"},
            token: {type: "text"}
        }
    });

    function TeslaCmd(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var commandType = n.command;

        this.on("input", function(msg) {
            var outmsg = {
                topic: msg.topic
            };
            var vid = null;
            //console.log( 'tesla command node called with msg: ' + util.inspect(msg) );
            //console.log( 'tesla command type: ' + commandType );
            //console.log( 'this looks like: ' + util.inspect(this) );
            //console.log( 'n looks like: ' + util.inspect(n) );

            var vehicles = msg.payload;
            //console.log( 'tesla command node called with vehicles: ' + vehicles );
            if ( vehicles instanceof Array) {
                var vehicle = vehicles[0]; //first car in the vehicles array
                //console.log( 'tesla command node called with vehicle: ' + vehicle );
                if(vehicle.id) {
                    vid = vehicle.id; // the three digit vehicle "id"
                }
            } else {
                console.log( 'tesla command node got incorrect vehicle array on input: ' + msg.payload);
                outmsg.payload = msg.payload;
                node.send(outmsg);
            }
            //console.log( 'tesla command node called with vid: ' + vid );

            if (vid) {
                switch(commandType) {
                    case "flash":
                        teslams.flash( vid, function (resp) {
                            outmsg.payload = resp;
                            node.send(outmsg);
                        });
                        break;
                    case "honk":
                        teslams.honk( vid, function (resp) {
                            outmsg.payload = resp;
                            node.send(outmsg);
                        });
                        break;
                    case "get_drive_state":
                        teslams.get_drive_state( vid, function (resp) {
                            outmsg.payload = resp;
                            node.send(outmsg);                       
                        });
                        break;
                    case "get_vehicle_state":
                        teslams.get_vehicle_state( vid, function (resp) {
                            outmsg.payload = resp;
                            node.send(outmsg);                       
                        });
                        break;
                    case "get_climate_state":
                        teslams.get_climate_state( vid, function (resp) {
                            outmsg.payload = resp;
                            node.send(outmsg);                   
                        });
                        break;
                    case "get_charge_state":
                        teslams.get_charge_state( vid, function ( resp ) {
                            outmsg.payload = resp;
                            node.send(outmsg);     
                        });
                        break;
                    case "get_gui_settings":
                        teslams.get_gui_settings( vid, function ( resp ) {
                            outmsg.payload = resp;
                            node.send(outmsg);     
                        });
                        break;
                    case "open_charge_port":
                        teslams.open_charge_port( vid, function ( resp ) {
                            outmsg.payload = resp;
                            node.send(outmsg);     
                        });
                        break;
                    case "wake_up":
                        teslams.wake_up( vid, function ( resp ) {
                            outmsg.payload = resp;
                            node.send(outmsg);     
                        });
                        break;
                    default:
                        console.log('undefined commandType');
                }                        
            } else {
                console.log('undefined vid, skipping calls to tesla');
            }
        });
    }
    RED.nodes.registerType("command",TeslaCmd);

    function TeslaLock(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var state = n.state;

        this.on("input", function(msg) {
            var outmsg = {
                topic: msg.topic
            };
            var vid = null;
            //console.log( 'tesla lock node called with msg: ' + util.inspect(msg) );
            //console.log( 'tesla lock type: ' + commandType );
            //console.log( 'this looks like: ' + util.inspect(this) );
            //console.log( 'n looks like: ' + util.inspect(n) );

            var vehicles = msg.payload;
            //console.log( 'tesla command node called with vehicles: ' + vehicles );
            if ( vehicles instanceof Array) {
                var vehicle = vehicles[0]; //first car in the vehicles array
                //console.log( 'tesla command node called with vehicle: ' + vehicle );
                if(vehicle.id) {
                    vid = vehicle.id; // the three digit vehicle "id"
                }
            } else {
                console.log( 'tesla command node called with unexpected input: ' + msg.payload);
                outmsg.payload = msg.payload;
                node.send(outmsg);
            }
            //console.log( 'tesla command node called with vid: ' + vid );

            if (vid) {
                switch(state) {
                    case "lock":
                        teslams.door_lock( {id: vid, lock: "lock" }, function (resp) {
                            outmsg.payload = resp;
                            node.send(outmsg);
                        });
                        break;
                    case "unlock":
                        teslams.door_lock( {id: vid, lock: "unlock"}, function (resp) {
                            outmsg.payload = resp;
                            node.send(outmsg);
                        });
                        break;
                    default:
                        console.log('undefined lock state');
                }                        
            } else {
                console.log('undefined vid, skipping calls to tesla');
            }
        });
    }
    RED.nodes.registerType("lock",TeslaLock);
  
    function TeslaSunroof(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var state = n.state;

        this.on("input", function(msg) {
            var outmsg = {
                topic: msg.topic
            };
            var vid = null;
            var err = null;

            var vehicles = msg.payload;
            if ( vehicles instanceof Array) {          
                var vehicle = vehicles[0]; //first car in the vehicles array
                if(vehicle.id) {
                    vid = vehicle.id; // the three digit vehicle "id"
                }
            } else {
                console.log( 'tesla sunroof node called with unexpected input: ' + msg.payload);
                outmsg.payload = msg.payload;
                node.send(outmsg);
            }

            if (vid) {
                if (state == "open" || state == "close" || state == "comfort" || state == "vent") {
                    teslams.sun_roof( {id: vid, roof: state }, function (resp) {
                        outmsg.payload = resp;
                        node.send(outmsg);
                    });
                } else {
                    err = new Error("Invalid sun roof state. Specify 'open', 'close', 'comfort' or 'vent'");
                    outmsg.payload = err;
                    node.send(outmsg);         
                }
            } else {
                console.log('undefined vid, skipping calls to tesla');
                err = new Error("undefined vehicle id, input must be properly formated tesla vehicle array with 'id' field of car set");
                outmsg.payload = err;
                node.send(outmsg);  
            }
        });
    }
    RED.nodes.registerType("sunroof",TeslaSunroof);

    function TeslaCharger(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var state = n.state;

        this.on("input", function(msg) {
            var outmsg = {
                topic: msg.topic
            };
            var vid = null;
            var err = null;

            var vehicles = msg.payload;
            if ( vehicles instanceof Array) {          
                var vehicle = vehicles[0]; //first car in the vehicles array
                if(vehicle.id) {
                    vid = vehicle.id; // the three digit vehicle "id"
                }
            } else {
                console.log( 'tesla charger node called with unexpected input: ' + msg.payload);
                outmsg.payload = msg.payload;
                node.send(outmsg);
            }

            if (vid) {
                if (state == "start" || state == "stop" ) {
                    teslams.charge_state( { id: vid, charge: state }, function (resp) {
                        outmsg.payload = resp;
                        node.send(outmsg);
                    });
                } else {
                    err = new Error("Invalid charge state. Use 'start' or 'stop'");
                    outmsg.payload = err;
                    node.send(outmsg);         
                }
            } else {
                console.log('undefined vid, skipping calls to tesla');
                err = new Error("undefined vehicle id, input must be properly formated tesla vehicle array with 'id' field of car set");
                outmsg.payload = err;
                node.send(outmsg);  
            }
        });
    }
    RED.nodes.registerType("charger",TeslaCharger);

    function TeslaAutoConditioning(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var state = n.state;

        this.on("input", function(msg) {
            var outmsg = {
                topic: msg.topic
            };
            var vid = null;
            var err = null;

            var vehicles = msg.payload;
            if ( vehicles instanceof Array) {          
                var vehicle = vehicles[0]; //first car in the vehicles array
                if(vehicle.id) {
                    vid = vehicle.id; // the three digit vehicle "id"
                }
            } else {
                console.log( 'tesla auto conditioning node called with unexpected input: ' + msg.payload);
                outmsg.payload = msg.payload;
                node.send(outmsg);
            }

            if (vid) {
                if (state == "start" || state == "stop" ) {
                    teslams.auto_conditioning( { id: vid, climate: state}, function (resp) {
                        outmsg.payload = resp;
                        node.send(outmsg);
                    });
                } else {
                    err = new Error("Invalid auto conditioning state. Use 'start' or 'stop'");
                    outmsg.payload = err;
                    node.send(outmsg);         
                }
            } else {
                console.log('undefined vid, skipping calls to tesla');
                err = new Error("undefined vehicle id, input must be properly formated tesla vehicle array with 'id' field of car set");
                outmsg.payload = err;
                node.send(outmsg);  
            }
        });
    }
    RED.nodes.registerType("climate",TeslaAutoConditioning);

    function TeslaChargeRange(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var range = n.range;

        this.on("input", function(msg) {
            var outmsg = {
                topic: msg.topic
            };
            var vid = null;
            var err = null;

            var vehicles = msg.payload;
            if ( vehicles instanceof Array) {          
                var vehicle = vehicles[0]; //first car in the vehicles array
                if(vehicle.id) {
                    vid = vehicle.id; // the three digit vehicle "id"
                }
            } else {
                console.log( 'tesla charge range node called with unexpected input: ' + msg.payload);
                outmsg.payload = msg.payload;
                node.send(outmsg);
            }

            if (msg.range >= 50 && msg.range <= 100) range = msg.range;
            if (vid) {
                if ( range >= 50 && range <= 100 ) {
                    teslams.charge_range( { id: vid, range: 'set', percent: range }, function (resp) {
                        outmsg.range = range;
                        outmsg.payload = resp;
                        node.send(outmsg);
                    });
                } else {
                    err = new Error("Invalid charge range. Use a number from between 50-100 percent");
                    outmsg.payload = err;
                    node.send(outmsg);         
                }
            } else {
                console.log('undefined vid, skipping calls to tesla');
                err = new Error("undefined vehicle id, input must be properly formated tesla vehicle array with 'id' field of car set");
                outmsg.payload = err;
                node.send(outmsg);  
            }
        });
    }
    RED.nodes.registerType("charge-range",TeslaChargeRange);

    function TeslaSetTemperature(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var temp = n.temp;

        this.on("input", function(msg) {
            var outmsg = {
                topic: msg.topic
            };
            var vid = null;
            var err = null;

            var vehicles = msg.payload;
            if ( vehicles instanceof Array) {          
                var vehicle = vehicles[0]; //first car in the vehicles array
                if(vehicle.id) {
                    vid = vehicle.id; // the three digit vehicle "id"
                }
            } else {
                console.log( 'tesla temp range node called with unexpected input: ' + msg.payload);
                outmsg.payload = msg.payload;
                node.send(outmsg);
            }

            if (vid) {
                if ( temp >= 17 && temp <= 32 ) {
                    console.log('setting temp to ' + temp);
                    teslams.set_temperature( { id: vid, dtemp: temp}, function (resp) {
                        outmsg.payload = resp;
                        node.send(outmsg);
                    });
                } else {
                    err = new Error("Invalid temp value. Valid range is 17C - 32C");
                    outmsg.payload = err;
                    node.send(outmsg);         
                }
            } else {
                console.log('undefined vid, skipping calls to tesla');
                err = new Error("Invalid temp value. Valid range is 17C - 32C" );
                outmsg.payload = err;
                node.send(outmsg);  
            }
        });
    }
    RED.nodes.registerType("set-temp",TeslaSetTemperature);

};

