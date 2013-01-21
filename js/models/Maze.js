/**
 * Created with JetBrains PhpStorm.
 * User: pdietrich
 * Date: 19.01.13
 * Time: 14:40
 */

var Maze = Backbone.Model.extend({
	defaults:{
		"rows":3,
		"cols":3,
		"nbOfNeighbours":4,
		"directions":[
			//north, east, south, west
			[-1, 0],
			[0, 1],
			[1, 0],
			[0, -1]
		],
		"startCoords":[0,0]
	},
	events:{
		"change rows cols":"reset"
	},
	initialize:function () {
		this.grid = [];
		this.reset();
		_.bindAll(this,"getCell","getNeighbourOf","applyDirectionOnCoords");
	},
	generate:function () {

	},
	reset:function () {
		console.log("Resetting to ", this.get("rows"), this.get("cols"));
		for (var r = 0; r < this.get("rows"); r++) {
			this.grid[r] = [];
			for (var c = 0; c < this.get("cols"); c++) {
				this.grid[r][c] = new Cell(this, [r, c]);
			}
		}
	},
	/**
	 *
	 * Modify given coordinates by direction index
	 * @param coords
	 * @param direction
	 * @return {Array} coords
	 */
	applyDirectionOnCoords:function (coords, direction) {
		var directions = this.get("directions");
		var d = directions[direction];
		return [coords[0] + d[0], coords[1] + d[1]];
	},
	setStart:function(coords) {
		this.set("startCoords",coords);
		this.getCell(coords).set({"start":true,"visited":true});
	},
	setExit:function(coords) {
		this.set("exitCoords",coords);
		this.getCell(coords).set({"exit":true});
	},
	setVisited: function(coords) {
		this.getCell(coords).set("visited",true);
	},
	validCoords:function(coords) {
		if ((coords[0] < 0) || (coords[1] < 0)) {
			return false;
		}

		if (coords[0] > this.get("rows") - 1) {
			return false;
		}
		if (coords[1] > this.get("cols") - 1) {
			return false;
		}
		return true;
	},
	getCell:function (coords) {
		if (this.validCoords(coords)) {
			return this.grid[coords[0]][coords[1]];
		} else {
			return false;
		}
	},
	getNeighbourOf:function (coords, direction) {
		var newCoords = this.applyDirectionOnCoords(coords, direction);
		return this.getCell(newCoords);
	},
	/**
	 *
	 * Returns all valid neighbours of cell
	 * @param coords
	 * @return {Cells}
	 */
	getNeighboursOf: function(coords) {
		console.error("Obsolete");
		var ns=[];
		for (var d in this.get("directions")) {
			var newCoords = this.applyDirectionOnCoords(coords,d);
			var c=this.getCell(newCoords);
			if (c) {
				ns[d]=c;
			}
		}
		return new Cells(ns);
	},
	getValidDirectionsOf: function(coords) {
		var nb=this.get("nbOfNeighbours");
		var ds=[];
		for (var d=0;d<nb;d++) {
			if (this.validCoords(this.applyDirectionOnCoords(coords,d))) {
				ds.push(d);
			}
		}
		return ds;
	},
	getValidUnvisitedDirectionsOf:function(coords) {
		var ds=this.getValidDirectionsOf(coords);
		var us=[];
		for (var i=0;i<ds.length;i++) {
			var d=ds[i];
			var c=this.getCell(this.applyDirectionOnCoords(coords,d));
			if (c) {
				if (!(c.get("visited"))) {
					us.push(parseInt(d));
				}
			}
		}
		return us;
	},
	getRandomValidUnvisitedDirectionOf:function(coords){
		var v=this.getValidUnvisitedDirectionsOf(coords);
		if (v.length>0) {
			return _.first(_.shuffle(v));
		} else {
			return false;
		}
	},
	oppositeDirection:function(d) {
		var nb=this.get("nbOfNeighbours");
		return (nb/2 + d) % nb;
	},
	MrGorbachevTearDownThisWall:function(coords,direction) {
		var c=this.getCell(coords);
		if (c) {
			c.get("walls")[direction]=false;
		}
		var n=this.getNeighbourOf(coords,direction);
		if (n) {
			n.get("walls")[this.oppositeDirection(direction)]=false;
		}
	},
	digMaze:function(coords) {
		var me=this;
		var c=this.getCell(coords);
		c.set("visited",true);
        this.trigger("cell:changed",coords);
		var d;
		d=this.getRandomValidUnvisitedDirectionOf(coords);
		while (d!==false) {
			this.MrGorbachevTearDownThisWall(coords,d)
			var newCoords=this.applyDirectionOnCoords(coords,d);
			me.digMaze(newCoords);
			d=this.getRandomValidUnvisitedDirectionOf(coords);
		}
        this.trigger("cell:changed",coords);
	}
});
