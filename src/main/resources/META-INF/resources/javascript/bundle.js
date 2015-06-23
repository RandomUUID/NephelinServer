// ##### Messages.js ######

var ping = {
    command: 'log',
    receiver: 'SidePanelController',
    action: 'ping'
};

var ack = function ack(sender, receiver, payload) {
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
var newGame = {
    command: "relay",
    receiver: "GameController",
    action: "newGame"
};

var addMenuItem = function addMenuItem(name){
    msg = {
        command: "relay",
        receiver: "menu",
        action: "addMenuItem",
        payload: name
    };
    return msg;
};

var removeMenuItem= function removeMenuItem(name){
    msg = {
        command: "relay",
        receiver: "menu",
        action: "removeMenuItem",
        payload: name
    };
    return msg;
};

var addDropDownItem = function addDropDownItem(menuItem, name, f){
    var p = {
        menuItem: menuItem,
        name: name,
        f: f
    };
    msg = {
        command: "relay",
        receiver: "menu",
        action: "addDropDownItem",
        payload: p
    };
    return msg;
};

var removeDropDownItem = function removeDropDownItem(menuItem, name){
    var p = {
        menuItem: menuItem,
        name: name
    };

    msg = {
        command: "relay",
        receiver: "menu",
        action: "removeDropDownItem",
        payload: p
    };
    return msg;
};

var showContextMenu = {
    command:"relay",
    receiver: "context",
    action: "showContextMenu"
};

// ###### HexagonAlgebra.js ######
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


function cubeToPixel(reference_point, coordinate, size) {
    var axial = coordinate.toAxial(),
        x, y;
    x =reference_point.q + size * Math.sqrt(3) * (axial.q + axial.r/2);
    y =reference_point.r + size * 3/2 * axial.r;
    return new Axial(x, y);
}


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


function hex_neighbors(coordinate) {
    return [new Cube(coordinate.x+1, coordinate.y-1, coordinate.z),
        new Cube(coordinate.x+1, coordinate.y, coordinate.z-1),
        new Cube(coordinate.x, coordinate.y+1, coordinate.z-1),
        new Cube(coordinate.x-1, coordinate.y+1, coordinate.z),
        new Cube(coordinate.x-1, coordinate.y, coordinate.z+1),
        new Cube(coordinate.x, coordinate.y-1, coordinate.z+1)];
}



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

function pixelToCube(ref_point, point, size){
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
/*
 * ##############################################################################################
 * #                                        Hexagon                                             #
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
    this.calcAltPoints(new Axial(0,0));

    this.bgImg = new Image();
    this.bgImg.src = "images/normal.png";
    this.foregroundImg = null;
    this.bordersColor = ['black','black','black','black','black','black'];
    this.selected = false;
};

Hexagon.prototype = {
    calcPoints: function calcPoints(reference_point) {
        this.center     = hex_center(reference_point, this.coordinate, this.size);
        this.corners    = hex_corners(this.center, this.size);
    },
    calcAltPoints: function calcAltPoints(reference_point) {
        this.center     = cubeToPixel(reference_point, this.coordinate, this.size);
        this.corners    = hex_corners(this.center, this.size);
    }
};

/**
 * Creates the hexagon path for drawing.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2d Context.
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
 * @param {CanvasRenderingContext2D} ctx - Canvas 2d Context.
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
 * @param {CanvasRenderingContext2D} ctx - Canvas 2d Context.
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
 * Draws the Hexagon into the given Context.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2d Context.
 * @param hex
 */
function drawHexagon(ctx, hex) {
    drawHexagonBackground(ctx, hex);
    drawHexagonSides(ctx, hex);
    //drawTestGrid(ctx, hex);
    drawForeground(ctx, hex);
};

// ##### MapGenerator.js

function oddRowMap(columnSize, hexagonSideSize) {
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
            var coordinates = new Cube(x, y, z);
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
function normalMap(columnSize, hexagonSideSize) {
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
            var coordinates = new Cube(x, y, z);
            var stopRandom = true;
            if (Math.floor(Math.random() * 2) === 0 || stopRandom) {
                var hexagon = new Hexagon(coordinates, hexagonSideSize);
                hexagon.calcAltPoints(new Axial(0,0));
                hex_count += 1;
                map[coordinates]= hexagon;
            }
        }
    }
    console.log("Hex Count: " + hex_count);
    return map;
};

// ##### CanvasHelper.js ######
function getCanvas() {
    if ($("#cv").length) {
        return $("#cv").get(0);
    } else {
        console.log('Error: Canvas not found with selector #cv');
    }
}

// ###### board.js ######
var selectImg = 'images/selectedblue.png';

var Board;
Board =  function Board(columnSize, hexagonSideSize, mapType) {
    var self = this;

    this.reference_point = new Axial(350,400);
    this.hexagonSideSize = hexagonSideSize;
    this.columnSize = columnSize;
    this.mapType = mapType;
    this.hexagonQueue = {};
    switch (mapType) {
        case 'oddRowMap':
            this.map = oddRowMap(columnSize, hexagonSideSize);
            break;
        default :
            this.map = normalMap(columnSize, hexagonSideSize);
            break;
    }
    this.actions = {
        selectHexagon: function selectHexagon(hexagon) {
            if(typeof self.hexagonQueue[hexagon.coordinate] === 'undefined'){
                hexagon.bgImg.src = selectImg;
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
            var click_point = new Axial(e.offsetX, e.offsetY);
            var coordinate = pixel_to_hex(self.reference_point, click_point, self.hexagonSideSize);
            var hex = self.map[coordinate];
            var canvas =getCanvas();
            var ctx = canvas.getContext('2d');
            if(e.button === 0){                                             //Leftclick = 0
                if (typeof hex !== 'undefined' && e.button === 0) {
                    console.log("It's a hit!");
                    self.actions.selectHexagon(hex);
                    drawHexagon(ctx,hex);
                    console.log(self.map[coordinate]);

                } else {
                    console.log("No hit!");
                }
                if (typeof Object.keys(self.hexagonQueue) !== 'undefined') {
                    drawMap(canvas, self.hexagonQueue, self.reference_point);
                }
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

function drawHexagonGrid(ctx, map, reference_point) {
    for(var coordinate_hexagon in map) {
        if (map.hasOwnProperty(coordinate_hexagon)) {
            // prop is not inherited
            var hex = map[coordinate_hexagon];
            hex.calcAltPoints(reference_point);
            drawHexagon(ctx, hex);
        }
    }
}

function changeSelect(color) {
    if(color === "red") {
        selectImg = 'images/selected.png';
    }
    if(color === "blue") {
        selectImg = 'images/selectedblue.png';
    }
};

/**
 *  *
 * @param {CanvasRenderingContext2D} canvas - html canvas
 * @param hex
 */
function drawMap(canvas, map, reference_point) {
    var ctx = canvas.getContext('2d');
    reference_point = reference_point || new Axial(350,400);
    drawHexagonGrid(ctx, map, reference_point);
    // drawForeground(ctx);
}

// ###### MenuHelper.js ####

function getMenu() {
    return $(".menu");
}

function getMenuItems() {
    return $(".menuItem");
}

function getMenuItem(name) {
    try {
        var menuItems = getMenuItems();
        for (var i = 0; i < menuItems.length; i += 1) {
            if (menuItems[i].innerText === name) {
                return menuItems[i];
            }
        }
    } catch (e) {
        console.log("menuItem not found: " + name);
    }
}

// #### Context.js ####
var Context;
Context = function Context(sendMessageFunc, socket) {
    console.log("Context Menu initialised");
    this.send = sendMessageFunc;
    this.socket = socket;
    this.name = "context";

    $(document).on('contextmenu', function (e) {
        $('.context-menu').css({
            top: e.pageY,
            left: e.pageX,
            display: 'block'
        });

        $('h1').fadeOut('fast');

        return false;
    });

    $(document).click(function (e) {
        if (e.which === 1) {
            $('.context-menu').hide();
        }
    });

    $(document).keydown(function (e) {
        if (e.which === 27) {
            $('.context-menu').hide();
        }
    });

    this.actions.addContextItem("red", function () {
        console.log("Red selected");
        changeSelect("red");
    });
    this.actions.addContextItem("blue", function () {
        console.log("Blue selected");
        changeSelect("blue");
    });
};

Context.prototype.actions = {};

Context.prototype.actions.addContextItem = function addContextItem(name, f) {
    var item = document.createElement("li");
    var context = document.createElement("ul");
    item.innerHTML = name;
    item.classList.add("context-item");
    item.onclick = f;
    $(".context-menu .list").append(item);
};

Context.prototype.actions.removeContextItem = function removeContextItem(name) {
    var $items = $(".context-item");
    try {
        for (var i = 0; i < $items.length; i += 1) {
            if ($items[i].innerText === name) {
                $items[i].remove();
            }
        }
    }
    catch
        (e) {
        console.log("menuItem not found: " + name);
    }
};

Context.prototype.receive = function receive(msg) {
    console.log("Module: " + this.name + " reached.");
    var action = msg.action;
    switch (action) {
        case "addContextItem":
            this.actions.addContextItem(msg.payload, function () {
                console.log("Clicked" + msg.payload);
            });
            break;
        case "removeContextItem":
            this.actions.removeContextItem(msg.payload);
            break;
        default :
            console.log(msg);
            this.send(ping);
    }
};

// ###### Menu.js #######

var menuItem;
var dropDown;
var dropDownItem;

var Menu;
Menu = function Menu(sendMessageFunc, socket) {
    var self = this;
    console.log("Menu initialised");
    this.send = sendMessageFunc;
    this.socket      = socket;
    this.name      = "menu";
};

Menu.prototype.actions = {};
Menu.prototype.actions.addMenuItem = function addMenuItem(name) {
    var item = document.createElement("li");
    var drop = document.createElement("ul");
    item.innerHTML = name;
    item.classList.add('menuItem');
    drop.classList.add(name);
    drop.classList.add('dropDown');
    item.appendChild(drop);
    getMenu().append(item);
};

Menu.prototype.actions.removeMenutItem =
    function removeMenuItem(name) {
        try {
            getMenuItem(name).remove();
        } catch (e) {
            console.log("Cannot remove " + name);
        }
    };

Menu.prototype.actions.addDropDownItem =
    function addDropDownItem(menuItem, name, f) {
        try {
            var drop = $("." + menuItem);
            var li = document.createElement("li");
            li.classList.add("dropDownItem");
            li.innerHTML = name;
            li.onclick = f;
            drop.append(li);
        } catch (e) {
            console.log("Cannot find " + menuItem);
        }
    };

Menu.prototype.actions.removeDropDownItem =
    function removeDropDownItem(menuItem, name) {
        try {
            var drop = $("." + menuItem + " li");
            console.log(drop);
            for (var i = 0; i < drop.length; i += 1) {
                console.log(drop[i]);
                if (drop[i].innerText === name) {
                    drop[i].remove();
                }
            }
        } catch (e) {
            console.log(e.message);
        }
    };
Menu.prototype.init = function init() {
    console.log("Foobar init");
    this.actions.addMenuItem("Game");
    this.actions.addDropDownItem("Game", "New Game", function(){
        alert("New Game started");
    });
    this.actions.addDropDownItem("Game", "Exit Game", function(){
        console.log("exiting Game now");
    });
    this.actions.addMenuItem("Hexagon");
    this.actions.addDropDownItem("Hexagon", "Select All", function(){
        alert("Selected All");
    });
    this.actions.addDropDownItem("Hexagon", "Deselect All", function(){
        console.log("Deselected All");
    });
};

Menu.prototype.receive =  function receive(msg) {
    console.log("Module: " + this.name + " reached.");
    var action = msg.action;
    var p = msg.payload;
    switch (action) {
        case "addMenuItem":
            this.actions.addMenuItem(msg.payload);
            break;
        case "removeMenuItem":
            this.actions.removeMenuItem(msg.payload);
            break;
        case "addDropDownItem":
            this.actions.addMenuItem(p.menuItem, p.name, p.f);
            break;
        case "removeDropDownItem":
            this.actions.addMenuItem(p.menuItem, p.name);
            break;
        case "init":
            this.init();
            console.log("Menu INIT!");
            console.log("Menu INIT!");
            break;
        default :
            console.log(msg);
            this.send(ping);
    }
};

function isClick(board, mousedown, mouseup) {
    if (mousedown.offsetX === mouseup.offsetX &&
        mousedown.offsetY === mouseup.offsetY) {
        board.handlers.click(mousedown);
    }
}
// ###### mainpanel.js #####
var mainPanel;
mainPanel = function mainPanel(sendMessageFunc, socket) {
    console.log(Date.now() + " main started.");
    var self = this;
    this.send = sendMessageFunc;
    this.socket      = socket;
    this.name      = "mainpanel";
    this.actions = {
        joinGame: function (msg) {
            var response  = {
                "command": "relay", "receiver": "GameController",
                "action": "joinGame",
                "payload": msg.payload
            };

            var disp      = JSON.stringify(msg.payload);
            $('#mainPanel').append('<p>' + disp + '<p>');
            var canvas    = getCanvas();
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
                    var movement_vector = new Axial(mousemove.offsetX - e.offsetX,
                        mousemove.offsetY - e.offsetY);
                    mousemove = e;
                    board.handlers.scroll(canvas, movement_vector);
                    canvas.style.cursor="move";
                }
                else{
                    canvas.style.cursor="default";
                }

            }, false);
            canvas.addEventListener('mouseup', function (e) {
                if (isDown) {
                    isClick(board, mousedown, e);
                    isDown = false;
                }
            }, false);
            drawMap(canvas, board.map);
            self.send(response);
        }
    };
};


mainPanel.prototype = {
    receive: function (msg) {
        console.log("Module: " + this.name + " reached.");
        var action = msg.action;
        switch (action) {
            case "joinGame":
                this.actions.joinGame(msg);
                break;
            default :
                console.log(msg);
                this.send(ping);
        }
    }

};

// ###### ComponentBuilder.js #####
var ComponentBuilder;
ComponentBuilder = function ComponentBuilder(self) {
    this.self = self;
    this.receivers = [];
    this.components = {};
};
ComponentBuilder.prototype.addReceiver             = function (receiver) {
    this.receivers.push(receiver);
};
ComponentBuilder.prototype.build = function build() {
    console.log("Components found: " + this.receivers.length);
    for (var index = 0; index < this.receivers.length; index+=1) {
        var ComponentConstructor = this.receivers[index];
        console.log("Nichts!")
        console.log(this.self.send);
        console.log(this.self.socket);
        var cmp        = new ComponentConstructor(this.self.send, this.self.socket);
        this.components[cmp.name] = cmp;
    }
    console.log("Components build: " + this.components.length);
    console.log("----------");
};

// #### ClientSessionController.js #####

/**
 * Initialize Hub and websocket connection.
 * @constructor
 * @param {string} contextpath - Path for the websocket connection.
 */

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
            self.send(newGame);
        },
        relay: function relay(msg) {
            console.log('Begin Relay');
            console.log(msg);
            var receiver = msg.receiver;
            console.log('Relay to: ' + receiver);
            var cmp = self.ComponentBuilder.components[receiver];
            if (typeof cmp !== 'undefined') {
                cmp.receive(msg);
            } else {
                console.log('Receiver: ' + receiver + ' not found!');
            }
            console.log('End Relay');
        }
    };
    this.ComponentBuilder = new ComponentBuilder(self);
    console.log(this.ComponentBuilder);
};

ClientSessionController.prototype.send =  function send(msg) {
    this.socket.send(JSON.stringify(msg));
};
ClientSessionController.prototype.sendLocal = function sendLocal(msg) {
    self.receive(msg);
};
ClientSessionController.prototype.receive = function receive(event) {
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
};
ClientSessionController.prototype.addReceiver = function addReceiver(receiver) {
    this.ComponentBuilder.addReceiver(receiver);
};
ClientSessionController.prototype.acknowledge = function acknowledge(msg) {
    this.send(ack(msg.receiver, msg.sender, msg.command));
};
ClientSessionController.prototype.openConnection = function openConnection() {
    if (this.socket === null) {
        this.socket = new WebSocket(this.connection);
        this.socket.onmessage = this.receive.bind(this);
    }
};
ClientSessionController.prototype.build = function build() {
    this.ComponentBuilder.build();
};


// ### Entry.js ####

$( document ).ready(function() {
    console.log('ClientSessionController starting!');
    var csc = new ClientSessionController('/NephelinDemo');

    csc.addReceiver(mainPanel);
    csc.addReceiver(Context);
    csc.addReceiver(Menu);
    csc.openConnection();
    csc.build();
    console.log('ClientSessionController started!');
});
