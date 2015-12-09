var Crossfilter = require("crossfilter");

function Filter(){
  this.crossfilter = new Crossfilter();
  this.dimensions = {};
  this.tiles = {};
  this.report = {};
  this.expressions = {};
};

Filter.prototype = {
  addTile: function(tilePoint, collection){
    var tilePointString = tilePoint.zoom + ":" + tilePoint.x + ":" + tilePoint.y;
    if (typeof this.tiles[tilePointString] != 'undefined') return this.getTile(tilePoint);
    this.crossfilter.add(collection.features.map(function(f){
      f.properties.tilePoint = tilePoint.zoom + ":" + tilePoint.x + ":" + tilePoint.y;
      return f;
    }));
    this.tiles[tilePointString] = true;
    return this.getTile(tilePoint);
  },

  removeTile: function(tilePoint){
    var tilePointString = tilePoint.zoom + ":" + tilePoint.x + ":" + tilePoint.y;
    if(!this.dimensions.tiles){
      return;
    }
    this.dimensions.tiles.filter(tilePointString);
    this.crossfilter.remove();
    this.dimensions.tiles.filterAll();
    delete this.tiles[tilePointString];
  },

  getTile: function(tilePoint){
    var tilePointString = tilePoint.zoom + ":" + tilePoint.x + ":" + tilePoint.y;
    if(!this.dimensions.tiles){
      this.dimensions.tiles = this.crossfilter.dimension(function(f){return f.properties.tilePoint});
    }
    var tile = {type: "FeatureCollection", features: null};
    this.dimensions.tiles.filter(tilePointString);
    tile.features = this.dimensions.tiles.top(Infinity);
    this.dimensions.tiles.filterAll();
    return tile;
  },

  filterRange: function(column, range){
    if (!this.dimensions[column]){
      this.dimensions[column] = this.crossfilter.dimension(function(f){return f.properties[column]});
    }
    this.dimensions[column].filter(range);

  },

  filterAccept: function(column, terms){
    if (!this.dimensions[column]){
      this.dimensions[column] = this.crossfilter.dimension(function(f){return f.properties[column]});
    }
    if (!(terms instanceof Array)){
      terms = [terms];
    }
    this.dimensions[column].filter(function(f){
      if (terms.indexOf(f) > -1){
        return true;
      }
    });

  },

  filterReject: function(column, terms){
    if (!this.dimensions[column]){
      this.dimensions[column] = this.crossfilter.dimension(function(f){return f.properties[column]});
    }
    if (!terms.length){
      terms = [terms];
    }
    this.dimensions[column].filter(function(f){
      if (terms.indexOf(f) === -1){
        return true;
      }
    });

  },

  clearFilters: function() {
    for (var column in this.dimensions){
      this.dimensions[column].filterAll();
    }

  },

  clearFilter: function(column) {
    this.dimensions[column].filterAll();

  },

  getValues: function(column) {
    return this.dimensions[column].top(Infinity);
  },

  setBoundingBox: function(north, east, south, west) {
    if (!this.dimensions.bbox){
      this.dimensions.bbox = this.crossfilter.dimension(function(f){ return f.geometry;})
      this.dimensions.bbox.filter(function(g){
        var north = this[0]
        var east = this[1]
        var south = this[2]
        var west = this[3]
        return g.coordinates[1] < north && 
               g.coordinates[0] < east && 
               g.coordinates[1] > south && 
               g.coordinates[0] > west;
      }.bind(arguments))
    }
  }
}

module.exports = Filter;