(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/**
 * Created by sirmonkey on 4/11/15.
 */
var ClientSessionController = require('./nephelin/ClientSessionController');
var SidePanel = require('./nephelin/SidePanel');

$( document ).ready(function() {
    console.log('ClientSessionController starting!');
    var csc = new ClientSessionController.csc('/NephelinDemo');
    ClientSessionController.addReceiver(SidePanel.sp);
    csc.openConnection();
    csc.buildComponents();
    console.log('ClientSessionController started!');
});

},{"./nephelin/ClientSessionController":4,"./nephelin/SidePanel":9}],2:[function(require,module,exports){
'use strict';
/**
 * @param columnSize
 * @param hexagonSideSize
 * @param mapType
 * @constructor
 */
var Hexagon = require('./Hexagon');
var mapgen = require('./MapGenerators');
var HexagonAlgebra = require('./HexagonAlgebra');
var CanvasHelper = require('./CanvasHelper');
//TODO: getCanvas from SidePanel
var Board;
Board =  function Board(columnSize, hexagonSideSize, mapType) {
    var self = this;
    this.reference_point = new HexagonAlgebra.Axial(350,400);
    this.hexagonSideSize = hexagonSideSize;
    this.columnSize = columnSize;
    this.mapType = mapType;
    this.hexagonQueue = {};
    switch (mapType) {
        case 'oddRowMap':
            this.map = mapgen.oddRowMap(columnSize, hexagonSideSize);
            break;
        default :
            this.map = mapgen.normalMap(columnSize, hexagonSideSize);
            break;
    }
    this.actions = {
        selectHexagon: function selectHexagon(hexagon) {
            if(typeof self.hexagonQueue[hexagon.coordinate] === 'undefined'){
                hexagon.bgImg.src = 'images/selected.png';
                self.hexagonQueue[hexagon.coordinate] = hexagon;
            }
            else{
                hexagon.bgImg.src = 'images/normal.png';
                delete self.hexagonQueue[hexagon.coordinate];
            }
        }
    };
    this.handlers = {
        click: function clickHandler(e) {
            //Todo refactor to be independent of click event
            console.log('click_offset: ' + e.offsetX + '/' + e.offsetY);
            var click_point = new HexagonAlgebra.Axial(e.offsetX, e.offsetY);
            var coordinate = HexagonAlgebra.pixel_to_hex(self.reference_point, click_point, self.hexagonSideSize);
            var hex = self.map[coordinate];
            var canvas =CanvasHelper.getCanvas()
            var ctx = canvas.getContext('2d');
            if (typeof hex !== 'undefined') {
                console.log("It's a hit!");
                self.actions.selectHexagon(hex);
                Hexagon.drawHexagon(ctx,hex);
                console.log(self.map[coordinate]);
            } else {
                console.log("No hit!");
            }
            if (typeof Object.keys(self.hexagonQueue) !== 'undefined') {
                drawMap(canvas, self.hexagonQueue, self.reference_point);
            }
        },
        scroll: function scrollHandler(canvas, movement_vector) {
            self.reference_point.q += movement_vector.q;
            self.reference_point.r += movement_vector.r;
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            drawMap(canvas, self.map, self.reference_point);
            drawMap(canvas, self.hexagonQueue, self.reference_point);
        }
    };
};
module.exports = Board;

function drawHexagonGrid(ctx, map, reference_point) {
    for(var coordinate_hexagon in map) {
        if (map.hasOwnProperty(coordinate_hexagon)) {
            // prop is not inherited
            var hex = map[coordinate_hexagon];
            hex.calcAltPoints(reference_point);
            Hexagon.drawHexagon(ctx, hex);
        }
    }
}

/**
 *  *
 * @param {CanvasRenderingContext2D} canvas - html canvas
 * @param hex
 */
function drawMap(canvas, map, reference_point) {
    var ctx = canvas.getContext('2d');
    reference_point = reference_point || new HexagonAlgebra.Axial(350,400);
    drawHexagonGrid(ctx, map, reference_point);
    // drawForeground(ctx);
}
module.exports.drawMap = drawMap;




// Test key movement (catch arrow key events)
//turnKeys = function() {
//    //TODO Something useful
//    $(document).keydown(function(e) {
//        switch(e.which) {
//            case 37: // left
//                console.log("left");
//                break;
//
//            case 38: // up
//                console.log("up");
//                break;
//
//            case 39: // right
//                console.log("right");
//                break;
//            case 40: // down
//                console.log("down");
//                break;
//
//            default: return; // exit this handler for other keys
//        }
//        e.preventDefault(); // prevent the default action (scroll / move caret)
//    });
//};

},{"./CanvasHelper":3,"./Hexagon":5,"./HexagonAlgebra":6,"./MapGenerators":7}],3:[function(require,module,exports){
/**
 * Created by sirmonkey on 4/18/15.
 */

function getCanvas() {
    if ($("#cv").length) {
        return $("#cv").get(0);
    } else {
        console.log('Error: Canvas not found with selector #cv');
    }
}
module.exports.getCanvas = getCanvas;
},{}],4:[function(require,module,exports){
'use strict';
/**
 * Created by sirmonkey on 4/2/15.
 */
/**
 * Initialize Hub and websocket connection.
 * @constructor
 * @param {string} contextpath - Path for the websocket connection.
 */

var Messages = require('./Messages');
var receivers    = [],
    components   = {};
var ClientSessionController;
ClientSessionController     = function ClientSessionController(contextpath) {
    var self = this;
    var hostname = window.location.hostname;
    this.connection = "ws://" + hostname + ":8080" + contextpath + "/messagechannel";
    this.socket = null;
    this.commands = {
        log: function log(msg) {
            console.log(msg);
        },
        response: function response(msg){
            console.log(msg);
        },
        wait: function wait(msg) {
            console.log(Date.now() + " CMD: Waiting");
            self.send(Messages.newGame);
        },
        relay: function relay(msg) {
            console.log('Begin Relay');
            console.log(msg);
            var receiver = msg.receiver;
            console.log('Relay to: ' + receiver);
            var cmp = components[receiver];
            if (typeof cmp !== 'undefined') {
                cmp.receive(msg);
            } else {
                console.log('Receiver: ' + receiver + ' not found!');
            }
            console.log('End Relay');
        }
    };
};


ClientSessionController.prototype  = {
    send : function (msg) {
    this.socket.send(JSON.stringify(msg));
    },
    receive: function receive(event) {
        console.log(event);
        var msg        = JSON.parse(event.data);
        var command = this.commands[msg.command];
        if (command !== undefined) {
            if(msg.ack === 'true') {
                this.acknowledge(msg);
            }
            command(msg);
        } else {
          console.log("Error: Command not found!") ;
        }
    },
    acknowledge: function acknowledge(msg) {
        this.send(Messages.ack(msg.receiver, msg.sender, msg.command));
    },
    openConnection: function openConnection() {
        if (this.socket === null) {
            this.socket = new WebSocket(this.connection);
            this.socket.onmessage = this.receive.bind(this);
        }
    },
    buildComponents: function buildComponents() {
        console.log("Components found: " + receivers.length);
        for (var index = 0; index < receivers.length; index+=1) {
            var CmpBuilder = receivers[index];
            var cmp        = new CmpBuilder(this.send, this.socket);
            components[cmp.name] = cmp;
        }
        console.log("Components build: " + components.length);
        console.log("----------");
    }
};
module.exports.csc                     = ClientSessionController;
module.exports.addReceiver             = function (receiver) {
    receivers.push(receiver);
};


module.exports.receivers = function () {
    return receivers;
};
},{"./Messages":8}],5:[function(require,module,exports){
'use strict';
/**
 * Created by sirmonkey on 4/2/15.
 */


var HexagonAlgebra = require('./HexagonAlgebra');
/*
 * ##############################################################################################
 * #										Hexagon												#
 * ##############################################################################################
 */

/**
 *
 * @constructor
 * @param {Cube} coordinate triplet (x , y, z)
 * @param {number} hexagonSideSize - Side length from the hexagon.
 */
var Hexagon;
Hexagon = function Hexagon(coordinate, hexagonSideSize) {
    this.coordinate = coordinate;
    this.size = hexagonSideSize;
    this.center     = null;
    this.corners    = null;
    this.calcAltPoints(new HexagonAlgebra.Axial(0,0));

    this.bgImg = new Image();
    this.bgImg.src = "images/normal.png";
    this.foregroundImg = null;
    this.bordersColor = ['black','black','black','black','black','black'];
    this.selected = false;
};
module.exports = Hexagon;

Hexagon.prototype = {
    calcPoints: function calcPoints(reference_point) {
        this.center     = HexagonAlgebra.hex_center(reference_point, this.coordinate, this.size);
        this.corners    = HexagonAlgebra.hex_corners(this.center, this.size);
    },
    calcAltPoints: function calcAltPoints(reference_point) {
        this.center     = HexagonAlgebra.cubetopixel(reference_point, this.coordinate, this.size);
        this.corners    = HexagonAlgebra.hex_corners(this.center, this.size);
    }
};

/**
 * Creates the hexagon path for drawing.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2d context.
 * @param first
 * @param second
 * @param begin
 * @param close
 */
function setHexagonSide(ctx , first, second, begin , close ) {
    //TODO: Refactor
    begin = typeof begin !== 'undefined' ?  begin : true;
    close = typeof close !== 'undefined' ?  close : true;
    if (begin) {
        ctx.beginPath();
        ctx.moveTo(first.q, first.r);
    }
    ctx.lineTo(second.q, second.r);
    if (close) {ctx.closePath();}
}


function drawHexagonSide(ctx , first, second, color) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    setHexagonSide(ctx,first,second);
    ctx.stroke();
}

/**
 * Draws the Hexagon's border.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2d context.
 * @param hex
 */
function drawHexagonSides(ctx, hex) {
    //TODO: Refactor
    ctx.save();
    for (var i = 0; i < hex.bordersColor.length; i+=1) {
        var second = hex.corners[(i+1) % hex.bordersColor.length];
        drawHexagonSide(ctx,hex.corners[i],second, hex.bordersColor[i]);
    }
    ctx.restore();
}
module.exports.drawHexagonSides = drawHexagonSides;

/**
 * Something about clipping
 * @param ctx
 * @param hex
 */
function setHexagonSides(ctx, hex) {
    //TODO: Refactor -- Magic & Unicorns
    setHexagonSide(ctx, hex.corners[0], hex.corners[1], true, false);
    setHexagonSide(ctx, hex.corners[1], hex.corners[2], false, false);
    setHexagonSide(ctx, hex.corners[2], hex.corners[3], false, false);
    setHexagonSide(ctx, hex.corners[3], hex.corners[4], false, false);
    setHexagonSide(ctx, hex.corners[4], hex.corners[5], false, false);
    setHexagonSide(ctx, hex.corners[5], hex.corners[0], false, true);

}

/**
 * Draws the Hexagon Background.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2d context.
 * @param {Hexagon} hex
 */
function drawHexagonBackground(ctx, hex) {
    if (hex.bgImg !== null) {
        ctx.save();
        setHexagonSides(ctx, hex);
        ctx.clip();
        ctx.drawImage(hex.bgImg, 0, 0, hex.bgImg.width, hex.bgImg.height, hex.corners[5].q, hex.corners[0].r, hex.corners[2].q - hex.corners[5].q, hex.corners[3].r - hex.corners[0].r);
        ctx.restore();
    }
}

/**
 * Draws the Hexagon Background.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Hexagon} hex
 */
function drawForeground(ctx, hex) {
    ctx.save();
    ctx.font="12px Consolas";

    var tmp = hex.coordinate.toOffset_OddR();
    ctx.fillStyle = 'Blue';
    ctx.fillText(hex.coordinate.z, hex.corners[0].q - 6, hex.corners[0].r - 12.5);
    ctx.fillStyle = 'DarkSalmon';
    ctx.fillText(hex.coordinate.y, hex.corners[2].q + 7.5, hex.corners[2].r + 7.5);
    ctx.fillStyle = 'LightGreen';
    ctx.fillText(hex.coordinate.x, hex.corners[4].q - 12, hex.corners[2].r + 7.5);
    ctx.fillStyle = 'white';
    ctx.fillText(tmp.r+"/"+tmp.q+"", hex.center.q - 6, hex.center.r + 6);
    //"/"+hex.coordinate.z+"/"+hex.coordinate.x, hex.center.q - 15, hex.center.r + 7.5);
    ctx.restore();
}

/**
 * Draws a 'Grid' on the Hexagons
 * @param ctx
 * @param hex
 */
function drawTestGrid(ctx, hex) {
    ctx.save();
    var color = 'white';
    drawHexagonSide(ctx,hex.corners[0], hex.corners[3], color);
    drawHexagonSide(ctx,hex.corners[1], hex.corners[5], color);
    drawHexagonSide(ctx,hex.corners[2], hex.corners[4], color);
    ctx.restore();
}

/**
 * Draws the Hexagon into the given context.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2d context.
 * @param hex
 */
module.exports.drawHexagon = function drawHexagon(ctx, hex) {
    drawHexagonBackground(ctx, hex);
    drawHexagonSides(ctx, hex);
    //drawTestGrid(ctx, hex);
    drawForeground(ctx, hex);
};
},{"./HexagonAlgebra":6}],6:[function(require,module,exports){
'use strict';
/**
 * Created by sirmonkey on 4/13/15.
 */

/**
 * Maybe useful??
 * @param first
 * @param second
 * @returns {number}
 */

var scalarCrossProduct;
scalarCrossProduct = function (first, second) {
    return (first.q - second.q ) * (first.r - second.r);
};

/**
 * Axial Coordinate Point on cavas
 *
 * @constructor
 * @param q Column (x-axis on convas)
 * @param r Row (y-axis on canvas)
 */
var Axial;
Axial = function Axial(q, r){
    this.q = q;
    this.r = r;
};
module.exports.Axial = Axial;


/**
 * Cube Coordinate aka 3D.
 *
 * @constructor
 * @param x
 * @param y
 * @param z
 */
var Cube;
Cube = function Cube(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};
module.exports.Cube = Cube;

Axial.prototype.toCubefromOffset_OddR = function() {
    var x = this.q - (this.r - (this.r % 2)) / 2;
    var z = this.r;
    var y = -x-z;
    return new Cube(x,y,z);
};

Axial.prototype.toCube = function() {
    var x = this.q;
    var y = this.r;
    var z = -x-y;
    return new Cube(x, y, z);
};



Cube.prototype.toString = function() {
    return "x:" + this.x.toString() + "y:" +
        this.y.toString() + "z:" + this.z.toString();
};
/**
 * Converts cube coordinate into axial coordinate.
 * @returns {Axial}
 */
Cube.prototype.toAxial = function() {
    return new Axial(this.x, this.y);
};

/**
 * Converts cube coordinates to "easy" canvas coordinates.
 * @returns {Axial}
 */
Cube.prototype.toOffset_OddR = function () {
    var q = this.x + (this.z - (this.z % 2)) / 2;
    var r = this.z;
    return new Axial(q, r);
};

/**
 * Rounds a floating point cube into the nearest integer cube.
 * @param cube
 * @returns {Cube}
 */
var cube_round = function cube_round(cube) {
    var rx = Math.round(cube.x);
    var ry = Math.round(cube.y);
    var rz = Math.round(cube.z);

    var x_diff = Math.abs(rx - cube.x);
    var y_diff = Math.abs(ry - cube.y);
    var z_diff = Math.abs(rz - cube.z);

    if (x_diff > y_diff && x_diff > z_diff) {
        rx = -ry-rz;
    }else if (y_diff > z_diff) {
        ry = -rx-rz;
    }
    else {
        rz = -rx-ry;
    }


    return new Cube(rx, ry, rz);
};
module.exports.cube_round = cube_round;

/**
 * Calculates the center of a Hexagon in canvas representation for a Odd Row Map
 *
 * @constructor
 * @param {Cube} coordinate
 * @param {Number} size of the Hexagon.
 * @returns {Axial}
 * @deprecated
 */
var hex_center = function hex_center(reference_point, coordinate, size) {
    //Todo Remove Magic and Unicorns
    var hex = coordinate.toOffset_OddR();
    var height = size  * 2;
    var width = Math.sqrt(3)/ 2 * height ;
    var x = (width / 2) + width*hex.q;
    var y = size + 3/4 * height * hex.r;
    if(hex.r === 0) {
        x = (width / 2) + width*hex.q;
        y = size;
    } else if(hex.r % 2 === 1){
        x = hex.q === 0 ? width:width+width*hex.q;
    }
    return new Axial(x + reference_point.q, y + reference_point.r);
};
module.exports.hex_center = hex_center;

function cubeToPixel(reference_point, coordinate, size) {
    var axial = coordinate.toAxial(),
        x, y;
    x =reference_point.q + size * Math.sqrt(3) * (axial.q + axial.r/2);
    y =reference_point.r + size * 3/2 * axial.r;
    return new Axial(x, y);
}
module.exports.cubetopixel = cubeToPixel;

//TODO: Better ASCII ART
/**
 *    0____1
 *   /      \
 * 5/   C    \2
 *  \       /
 *  4\ ___ /3
 * @param center
 * @param size
 * @param i
 * @param topped Orientation (pointy or flat)
 * @returns {Axial}
 */
var hex_corner  = function hex_corner(center, size, i, topped) {
    topped = typeof topped !== 'undefined' ?  topped : 'flat';
    var adjust = topped !== 'pointy' ? 0 : 90;
    var angle_deg = 60 * i + adjust;
    var angle_rad = Math.PI / 180 * angle_deg;
    return new Axial(center.q + size * Math.cos(angle_rad),
        center.r + size * Math.sin(angle_rad));
};
module.exports.hex_corner = hex_corner;
/**
 *
 * @param center
 * @param size
 * @returns {Array} Containing the Corners
 */
var hex_corners = function hex_corners(center, size) {
    var corners = [];
    for(var i = 0; i < 6; i=i+1) {
        corners.push(hex_corner(center,size, i, 'pointy'));
    }
    return corners;
};
module.exports.hex_corners = hex_corners;

function hex_neighbors(coordinate) {
    return [new Cube(coordinate.x+1, coordinate.y-1, coordinate.z),
        new Cube(coordinate.x+1, coordinate.y, coordinate.z-1),
        new Cube(coordinate.x, coordinate.y+1, coordinate.z-1),
        new Cube(coordinate.x-1, coordinate.y+1, coordinate.z),
        new Cube(coordinate.x-1, coordinate.y, coordinate.z+1),
        new Cube(coordinate.x, coordinate.y-1, coordinate.z+1)];
}
module.exports.hex_neighbors = hex_neighbors;


/**
 * Checks if the given point is inside the polygon.
 * Uses Cross Product (2D)
 * @param {Axial} point to check.
 * @param {Array} vertices
 * @returns {boolean} true if the point is inside and false if not.
 */
var isPointIn = function isPointIn (point, vertices) {
    //Todo Algorithm that detects sides.
    var i, j;
    var found = true;
    for (i = 0, j = vertices.length - 1; i < vertices.length && found; i+=1) {
        var xProduct = (vertices[j].q - vertices[i].q) *
            (point.r - vertices[i].r) - (vertices[j].r - vertices[i].r) *
            (point.q - vertices[i].q);
        if (0 < xProduct && found) {
            found = false;
        }
        j = i;
    }
    return found;
};
module.exports.isPointIn = isPointIn;
module.exports.pixelToCube = function pixelToCube(ref_point, point, size){
    //Todo Remove Magic and Unicorns
    // Magic and Unicorns -- Start
    var height = size  * 2;
    var width = Math.sqrt(3)/ 2 * height ;
    console.log(ref_point);
    var a = point.q - ref_point.q;
    var b = point.r - ref_point.r;
    var q = a/width -1/2;
    var r = (4 * (b - size) ) / (3 * height );
    // Magic and Unicorns -- End
    var floatingPointCube = (new Axial(q,r)).toCubefromOffset_OddR();
    var first_candidate_coord = cube_round(floatingPointCube);
    var neighbors = hex_neighbors(first_candidate_coord);
    var candidates = [first_candidate_coord].concat(neighbors);
    var result = null;
    for (var i = 0; i<candidates.length; i= i+1) {
        var center = hex_center(ref_point, candidates[i], size);
        if (isPointIn(point, hex_corners(center, size))) {
            console.log("Coordinate converted");
            console.log('Candidate Nr: ' + i);
            console.log((candidates[i]));
            result = candidates[i];
            break;
        }
    }
    return result;
};
function pixel_to_hex(ref_point, point, size){
    //Todo Remove Magic and Unicorns
    // Magic and Unicorns -- Start
    var y =  point.r - (ref_point.r);
    var x =  point.q - ( ref_point.q);
    var r = y / ( size * 3/2 );
    var q = x /(size * Math.sqrt(3) ) - r/2;
    var ax = (new Axial(q,r));
    var floatingPointCube = ax.toCube();
    var first_candidate_coord = cube_round(floatingPointCube);
    console.log(first_candidate_coord);
    var neighbors = hex_neighbors(first_candidate_coord);
    var candidates = [first_candidate_coord].concat(neighbors);
    var result = null;
    for (var i = 0; i<candidates.length; i= i+1) {
        var center = cubeToPixel(ref_point, candidates[i], size);
        if (isPointIn(point, hex_corners(center, size))) {
            console.log("Coordinate converted");
            console.log('Candidate Nr: ' + i);
            console.log((candidates[i]));
            result = candidates[i];
            break;
        }
    }
    return result;
}
module.exports.pixel_to_hex = pixel_to_hex;


},{}],7:[function(require,module,exports){
'use strict';
/**
 * Created by sirmonkey on 4/13/15.
 */
var Hexagon = require('./Hexagon');
var HexagonAlgebra = require('./HexagonAlgebra');
module.exports.oddRowMap =  function oddRowMap(columnSize, hexagonSideSize) {
    var map = {};
    var track = 0;
    var hex_count = 0;
    for (var z = 0; z < columnSize; z+=1) {
        var res = z % 2;
        var x_count = columnSize - (res);
        var x = 0;
        if (res === 0 && z > 0) {
            track= track + 1;
            x = x - track;
            x_count = x_count - track;
        }
        if (res === 1) {
            x = 0 - track;
            x_count = x_count - track;
        }
        for (;x < x_count; x+=1) {
            var y  = -x-z;
            var coordinates = new HexagonAlgebra.Cube(x, y, z);
            var stopRandom = false;
            if (Math.floor(Math.random() * 2) === 0 || stopRandom) {
                var hexagon = new Hexagon(coordinates, hexagonSideSize);
                hex_count= hex_count + 1;
                map[coordinates]= hexagon;
            }
        }
    }
    console.log("Hex Count: " + hex_count);
    return map;
};
module.exports.normalMap =  function normalMap(columnSize, hexagonSideSize) {
    var map = {};
    var track = 0;
    var hex_count = 0;
    for (var z = 0; z < columnSize; z+=1) {
        var res = z % 2;
        var x_count = columnSize - (res);
        var x = 0;
        if (res === 0 && z > 0) {
            track= track + 1;
            x = x - track;
            x_count = x_count - track;
        }
        if (res === 1) {
            x = 0 - track;
            x_count = x_count - track;
        }
        for (;x < x_count; x+=1) {
            var y  = -x-z;
            var coordinates = new HexagonAlgebra.Cube(x, y, z);
            var stopRandom = true;
            if (Math.floor(Math.random() * 2) === 0 || stopRandom) {
                var hexagon = new Hexagon(coordinates, hexagonSideSize);
                hexagon.calcAltPoints(new HexagonAlgebra.Axial(0,0));
                hex_count += 1;
                map[coordinates]= hexagon;
            }
        }
    }
    console.log("Hex Count: " + hex_count);
    return map;
};
},{"./Hexagon":5,"./HexagonAlgebra":6}],8:[function(require,module,exports){
'use strict';
/**
 * Created by sirmonkey on 4/13/15.
 */
module.exports.ping = {
    command: 'log',
    receiver: 'SidePanelController',
    action: 'ping'
};

module.exports.ack = function(sender, receiver, payload) {
    var msg;
    msg = {
        command: 'response',
        receiver: receiver,
        sender: sender,
        payload: payload,
        ack: false
    };
    return msg;
};
module.exports.newGame = {
    command: "relay",
    receiver: "GameController",
    action: "newGame"
};
},{}],9:[function(require,module,exports){
'use strict';
/**
 * Created by sirmonkey on 4/3/15.
 */
var Board = require('./Board');
var Messages = require('./Messages');
var HexagonAlgebra = require('./HexagonAlgebra');
var CanvasHelper = require('./CanvasHelper');

function isClick(board, mousedown, mouseup) {
    if (mousedown.offsetX === mouseup.offsetX &&
        mousedown.offsetY === mouseup.offsetY) {
        board.handlers.click(mousedown);
    }
}

var SidePanel;
SidePanel = function SidePanel(sendMessageFunc, socket) {
    console.log(Date.now() + ' Sidepanel started.');
    var self = this;
    this.send = sendMessageFunc;
    this.socket      = socket;
    this.name      = "sidepanel"; // TODO: Besseren namen!
    this.actions = {
        joinGame: function (msg) {
            var response  = {
                "command": "relay", "receiver": "GameController",
                "action": "joinGame",
                "payload": msg.payload
            };

            var disp      = JSON.stringify(msg.payload);
            $('#SidePanel').append('<p>' + disp + '<p>');
            var canvas    = CanvasHelper.getCanvas();
            var board     = new Board(7, 40, 'normalMap');
            //turnKeys();
            var isDown    = false,
                mousedown = null,
                mousemove = null;
            canvas.addEventListener('mousedown', function (e) {
                isDown = true;
                mousedown = e;
                mousemove = e;
            }, false);
            canvas.addEventListener('mousemove', function (e) {
                if (isDown) {
                    var movement_vector = new HexagonAlgebra.Axial(mousemove.offsetX - e.offsetX,
                        mousemove.offsetY - e.offsetY);
                    mousemove = e;
                    board.handlers.scroll(canvas, movement_vector);
                }
            }, false);
            canvas.addEventListener('mouseup', function (e) {
                if (isDown) {
                    isClick(board, mousedown, e);
                    isDown = false;
                }
            }, false);
            Board.drawMap(canvas, board.map);
            self.send(response);
        }
    };
};

SidePanel.prototype = {
    receive: function (msg) {
        console.log("Module: " + this.name + " reached.");
        var action = msg.action;
        switch (action) {
            case "joinGame":
                this.actions.joinGame(msg);
                break;
            default :
                console.log(msg);
                this.send(Messages.ping);
        }
    }

};
module.exports.sp = SidePanel;
},{"./Board":2,"./CanvasHelper":3,"./HexagonAlgebra":6,"./Messages":8}]},{},[1])


//# sourceMappingURL=bundle.js.map