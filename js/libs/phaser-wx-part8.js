import PIXI from './pixi-wx.js';
import Phaser from './phaser-wx-main.js';
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A TilemapLayer is a Phaser.Image/Sprite that renders a specific TileLayer of a Tilemap.
*
* Since a TilemapLayer is a Sprite it can be moved around the display, added to other groups or display objects, etc.
*
* By default TilemapLayers have fixedToCamera set to `true`. Changing this will break Camera follow and scrolling behavior.
*
* @class Phaser.TilemapLayer
* @extends Phaser.Sprite
* @constructor
* @param {Phaser.Game} game - Game reference to the currently running game.
* @param {Phaser.Tilemap} tilemap - The tilemap to which this layer belongs.
* @param {integer} index - The index of the TileLayer to render within the Tilemap.
* @param {integer} width - Width of the renderable area of the layer (in pixels).
* @param {integer} height - Height of the renderable area of the layer (in pixels).
*/
Phaser.TilemapLayer = function (game, tilemap, index, width, height) {

    width |= 0;
    height |= 0;

    Phaser.Sprite.call(this, game, 0, 0);

    /**
    * The Tilemap to which this layer is bound.
    * @property {Phaser.Tilemap} map
    * @protected
    * @readonly
    */
    this.map = tilemap;

    /**
    * The index of this layer within the Tilemap.
    * @property {number} index
    * @protected
    * @readonly
    */
    this.index = index;

    /**
    * The layer object within the Tilemap that this layer represents.
    * @property {object} layer
    * @protected
    * @readonly
    */
    this.layer = tilemap.layers[index];

    /**
    * The canvas to which this TilemapLayer draws.
    * @property {HTMLCanvasElement} canvas
    * @protected
    */
    this.canvas = PIXI.CanvasPool.create(this, width, height);

    /**
    * The 2d context of the canvas.
    * @property {CanvasRenderingContext2D} context
    * @private
    */
    this.context = this.canvas.getContext('2d');

    this.setTexture(new PIXI.Texture(new PIXI.BaseTexture(this.canvas)));

    /**
    * The const type of this object.
    * @property {number} type
    * @readonly
    * @protected
    * @default Phaser.TILEMAPLAYER
    */
    this.type = Phaser.TILEMAPLAYER;

    /**
    * @property {number} physicsType - The const physics body type of this object.
    * @readonly
    */
    this.physicsType = Phaser.TILEMAPLAYER;

    /**
    * Settings that control standard (non-diagnostic) rendering.
    *
    * @property {boolean} [enableScrollDelta=true] - Delta scroll rendering only draws tiles/edges as they come into view.
    *     This can greatly improve scrolling rendering performance, especially when there are many small tiles.
    *     It should only be disabled in rare cases.
    *
    * @property {?DOMCanvasElement} [copyCanvas=(auto)] - [Internal] If set, force using a separate (shared) copy canvas.
    *     Using a canvas bitblt/copy when the source and destinations region overlap produces unexpected behavior
    *     in some browsers, notably Safari. 
    *
    * @default
    */
    this.renderSettings = {
        enableScrollDelta: false,
        overdrawRatio: 0.20,
        copyCanvas: null
    };

    /**
    * Enable an additional "debug rendering" pass to display collision information.
    *
    * @property {boolean} debug
    * @default
    */
    this.debug = false;

    /**
    * @property {boolean} exists - Controls if the core game loop and physics update this game object or not.
    */
    this.exists = true;

    /**
    * Settings used for debugging and diagnostics.
    *
    * @property {?string} missingImageFill - A tile is rendered as a rectangle using the following fill if a valid tileset/image cannot be found. A value of `null` prevents additional rendering for tiles without a valid tileset image. _This takes effect even when debug rendering for the layer is not enabled._
    *
    * @property {?string} debuggedTileOverfill - If a Tile has `Tile#debug` true then, after normal tile image rendering, a rectangle with the following fill is drawn above/over it. _This takes effect even when debug rendering for the layer is not enabled._
    *
    * @property {boolean} forceFullRedraw - When debug rendering (`debug` is true), and this option is enabled, the a full redraw is forced and rendering optimization is suppressed.
    *
    * @property {number} debugAlpha - When debug rendering (`debug` is true), the tileset is initially rendered with this alpha level. This can make the tile edges clearer.
    *
    * @property {?string} facingEdgeStroke - When debug rendering (`debug` is true), this color/stroke is used to draw "face" edges. A value of `null` disables coloring facing edges.
    *
    * @property {?string} collidingTileOverfill - When debug rendering (`debug` is true), this fill is used for tiles that are collidable. A value of `null` disables applying the additional overfill.
    *
    */
    this.debugSettings = {

        missingImageFill: 'rgb(255,255,255)',
        debuggedTileOverfill: 'rgba(0,255,0,0.4)',

        forceFullRedraw: true,

        debugAlpha: 0.5,
        facingEdgeStroke: 'rgba(0,255,0,1)',
        collidingTileOverfill: 'rgba(0,255,0,0.2)'

    };

    /**
    * Speed at which this layer scrolls horizontally, relative to the camera (e.g. scrollFactorX of 0.5 scrolls half as quickly as the 'normal' camera-locked layers do).
    * @property {number} scrollFactorX
    * @public
    * @default
    */
    this.scrollFactorX = 1;

    /**
    * Speed at which this layer scrolls vertically, relative to the camera (e.g. scrollFactorY of 0.5 scrolls half as quickly as the 'normal' camera-locked layers do)
    * @property {number} scrollFactorY
    * @public
    * @default
    */
    this.scrollFactorY = 1;

    /**
    * If true tiles will be force rendered, even if such is not believed to be required.
    * @property {boolean} dirty
    * @protected
    */
    this.dirty = true;

    /**
    * When ray-casting against tiles this is the number of steps it will jump. For larger tile sizes you can increase this to improve performance.
    * @property {integer} rayStepRate
    * @default
    */
    this.rayStepRate = 4;

    /**
    * Flag controlling if the layer tiles wrap at the edges.
    * @property {boolean} _wrap
    * @private
    */
    this._wrap = false;

    /**
    * Local map data and calculation cache.
    * @property {object} _mc
    * @private
    */
    this._mc = {

        // Used to bypass rendering without reliance on `dirty` and detect changes.
        scrollX: 0,
        scrollY: 0,
        renderWidth: 0,
        renderHeight: 0,

        tileWidth: tilemap.tileWidth,
        tileHeight: tilemap.tileHeight,

        // Collision width/height (pixels)
        // What purpose do these have? Most things use tile width/height directly.
        // This also only extends collisions right and down.       
        cw: tilemap.tileWidth,
        ch: tilemap.tileHeight,

        // Cached tilesets from index -> Tileset
        tilesets: []

    };

    /**
    * The current canvas left after scroll is applied.
    * @property {number} _scrollX
    * @private
    */
    this._scrollX = 0;

    /**
    * The current canvas top after scroll is applied.
    * @propety {number} _scrollY
    * @private
    */
    this._scrollY = 0;

    /**
    * Used for caching the tiles / array of tiles.
    * @property {Phaser.Tile[]} _results
    * @private
    */
    this._results = [];

    if (!game.device.canvasBitBltShift)
    {
        this.renderSettings.copyCanvas = Phaser.TilemapLayer.ensureSharedCopyCanvas();
    }

    this.fixedToCamera = true;

};

Phaser.TilemapLayer.prototype = Object.create(Phaser.Sprite.prototype);
Phaser.TilemapLayer.prototype.constructor = Phaser.TilemapLayer;

Phaser.TilemapLayer.prototype.preUpdateCore = Phaser.Component.Core.preUpdate;

/**
* The shared double-copy canvas, created as needed.
*
* @private
* @static
*/
Phaser.TilemapLayer.sharedCopyCanvas = null;

/**
* Create if needed (and return) a shared copy canvas that is shared across all TilemapLayers.
*
* Code that uses the canvas is responsible to ensure the dimensions and save/restore state as appropriate.
*
* @method Phaser.TilemapLayer#ensureSharedCopyCanvas
* @protected
* @static
*/
Phaser.TilemapLayer.ensureSharedCopyCanvas = function () {

    if (!this.sharedCopyCanvas)
    {
        this.sharedCopyCanvas = PIXI.CanvasPool.create(this, 2, 2);
    }

    return this.sharedCopyCanvas;

};

/**
* Automatically called by World.preUpdate.
*
* @method Phaser.TilemapLayer#preUpdate
*/
Phaser.TilemapLayer.prototype.preUpdate = function() {

    return this.preUpdateCore();

};

/**
* Automatically called by World.postUpdate. Handles cache updates.
*
* @method Phaser.TilemapLayer#postUpdate
* @protected
*/
Phaser.TilemapLayer.prototype.postUpdate = function () {

    if (this.fixedToCamera)
    {
        this.position.x = (this.game.camera.view.x + this.cameraOffset.x) / this.game.camera.scale.x;
        this.position.y = (this.game.camera.view.y + this.cameraOffset.y) / this.game.camera.scale.y;
    }

    this._scrollX = this.game.camera.view.x * this.scrollFactorX / this.scale.x;
    this._scrollY = this.game.camera.view.y * this.scrollFactorY / this.scale.y;

};

/**
* Automatically called by the Canvas Renderer.
* Overrides the Sprite._renderCanvas function.
*
* @method Phaser.TilemapLayer#_renderCanvas
* @private
*/
Phaser.TilemapLayer.prototype._renderCanvas = function (renderSession) {

    if (this.fixedToCamera)
    {
        this.position.x = (this.game.camera.view.x + this.cameraOffset.x) / this.game.camera.scale.x;
        this.position.y = (this.game.camera.view.y + this.cameraOffset.y) / this.game.camera.scale.y;
    }

    this._scrollX = this.game.camera.view.x * this.scrollFactorX / this.scale.x;
    this._scrollY = this.game.camera.view.y * this.scrollFactorY / this.scale.y;

    this.render();

    PIXI.Sprite.prototype._renderCanvas.call(this, renderSession);

};

/**
* Automatically called by the Canvas Renderer.
* Overrides the Sprite._renderWebGL function.
*
* @method Phaser.TilemapLayer#_renderWebGL
* @private
*/
Phaser.TilemapLayer.prototype._renderWebGL = function (renderSession) {

    if (this.fixedToCamera)
    {
        this.position.x = (this.game.camera.view.x + this.cameraOffset.x) / this.game.camera.scale.x;
        this.position.y = (this.game.camera.view.y + this.cameraOffset.y) / this.game.camera.scale.y;
    }
    
    this._scrollX = this.game.camera.view.x * this.scrollFactorX / this.scale.x;
    this._scrollY = this.game.camera.view.y * this.scrollFactorY / this.scale.y;

    this.render();

    PIXI.Sprite.prototype._renderWebGL.call(this, renderSession);

};

/**
* Destroys this TilemapLayer.
*
* @method Phaser.TilemapLayer#destroy
*/
Phaser.TilemapLayer.prototype.destroy = function() {

    PIXI.CanvasPool.remove(this);

    Phaser.Component.Destroy.prototype.destroy.call(this);

};

/**
* Resizes the internal canvas and texture frame used by this TilemapLayer.
*
* This is an expensive call, so don't bind it to a window resize event! But instead call it at carefully
* selected times.
*
* Be aware that no validation of the new sizes takes place and the current map scroll coordinates are not
* modified either. You will have to handle both of these things from your game code if required.
* 
* @method Phaser.TilemapLayer#resize
* @param {number} width - The new width of the TilemapLayer
* @param {number} height - The new height of the TilemapLayer
*/
Phaser.TilemapLayer.prototype.resize = function (width, height) {

    this.canvas.width = width;
    this.canvas.height = height;

    this.texture.frame.resize(width, height);

    this.texture.width = width;
    this.texture.height = height;

    this.texture.crop.width = width;
    this.texture.crop.height = height;

    this.texture.baseTexture.width = width;
    this.texture.baseTexture.height = height;

    this.texture.baseTexture.dirty();
    this.texture.requiresUpdate = true;

    this.texture._updateUvs();

    this.dirty = true;

};

/**
* Sets the world size to match the size of this layer.
*
* @method Phaser.TilemapLayer#resizeWorld
* @public
*/
Phaser.TilemapLayer.prototype.resizeWorld = function () {

    this.game.world.setBounds(0, 0, this.layer.widthInPixels * this.scale.x, this.layer.heightInPixels * this.scale.y);

};

/**
* Take an x coordinate that doesn't account for scrollFactorX and 'fix' it into a scrolled local space.
*
* @method Phaser.TilemapLayer#_fixX
* @private
* @param {number} x - x coordinate in camera space
* @return {number} x coordinate in scrollFactor-adjusted dimensions
*/
Phaser.TilemapLayer.prototype._fixX = function (x) {

    if (this.scrollFactorX === 1 || (this.scrollFactorX === 0 && this.position.x === 0))
    {
        return x;
    }
    
    //  This executes if the scrollFactorX is 0 and the x position of the tilemap is off from standard.
    if (this.scrollFactorX === 0 && this.position.x !== 0)
    {
        return x - this.position.x;
    }

    return this._scrollX + (x - (this._scrollX / this.scrollFactorX));

};

/**
* Take an x coordinate that _does_ account for scrollFactorX and 'unfix' it back to camera space.
*
* @method Phaser.TilemapLayer#_unfixX
* @private
* @param {number} x - x coordinate in scrollFactor-adjusted dimensions
* @return {number} x coordinate in camera space
*/
Phaser.TilemapLayer.prototype._unfixX = function (x) {

    if (this.scrollFactorX === 1)
    {
        return x;
    }

    return (this._scrollX / this.scrollFactorX) + (x - this._scrollX);

};

/**
* Take a y coordinate that doesn't account for scrollFactorY and 'fix' it into a scrolled local space.
*
* @method Phaser.TilemapLayer#_fixY
* @private
* @param {number} y - y coordinate in camera space
* @return {number} y coordinate in scrollFactor-adjusted dimensions
*/
Phaser.TilemapLayer.prototype._fixY = function (y) {

    if (this.scrollFactorY === 1 || (this.scrollFactorY === 0 && this.position.y === 0))
    {
        return y;
    }
    
    //  This executes if the scrollFactorY is 0 and the y position of the tilemap is off from standard.
    if (this.scrollFactorY === 0 && this.position.y !== 0)
    {
        return y - this.position.y;
    }
    
    return this._scrollY + (y - (this._scrollY / this.scrollFactorY));

};

/**
* Take a y coordinate that _does_ account for scrollFactorY and 'unfix' it back to camera space.
*
* @method Phaser.TilemapLayer#_unfixY
* @private
* @param {number} y - y coordinate in scrollFactor-adjusted dimensions
* @return {number} y coordinate in camera space
*/
Phaser.TilemapLayer.prototype._unfixY = function (y) {

    if (this.scrollFactorY === 1)
    {
        return y;
    }

    return (this._scrollY / this.scrollFactorY) + (y - this._scrollY);

};

/**
* Convert a pixel value to a tile coordinate.
*
* @method Phaser.TilemapLayer#getTileX
* @public
* @param {number} x - X position of the point in target tile (in pixels).
* @return {integer} The X map location of the tile.
*/
Phaser.TilemapLayer.prototype.getTileX = function (x) {

    // var tileWidth = this.tileWidth * this.scale.x;
    return Math.floor(this._fixX(x) / this._mc.tileWidth);

};

/**
* Convert a pixel value to a tile coordinate.
*
* @method Phaser.TilemapLayer#getTileY
* @public
* @param {number} y - Y position of the point in target tile (in pixels).
* @return {integer} The Y map location of the tile.
*/
Phaser.TilemapLayer.prototype.getTileY = function (y) {

    // var tileHeight = this.tileHeight * this.scale.y;
    return Math.floor(this._fixY(y) / this._mc.tileHeight);

};

/**
* Convert a pixel coordinate to a tile coordinate.
*
* @method Phaser.TilemapLayer#getTileXY
* @public
* @param {number} x - X position of the point in target tile (in pixels).
* @param {number} y - Y position of the point in target tile (in pixels).
* @param {(Phaser.Point|object)} point - The Point/object to update.
* @return {(Phaser.Point|object)} A Point/object with its `x` and `y` properties set.
*/
Phaser.TilemapLayer.prototype.getTileXY = function (x, y, point) {

    point.x = this.getTileX(x);
    point.y = this.getTileY(y);

    return point;

};

/**
* Gets all tiles that intersect with the given line.
*
* @method Phaser.TilemapLayer#getRayCastTiles
* @public
* @param {Phaser.Line} line - The line used to determine which tiles to return.
* @param {integer} [stepRate=(rayStepRate)] - How many steps through the ray will we check? Defaults to `rayStepRate`.
* @param {boolean} [collides=false] - If true, _only_ return tiles that collide on one or more faces.
* @param {boolean} [interestingFace=false] - If true, _only_ return tiles that have interesting faces.
* @return {Phaser.Tile[]} An array of Phaser.Tiles.
*/
Phaser.TilemapLayer.prototype.getRayCastTiles = function (line, stepRate, collides, interestingFace) {

    if (!stepRate) { stepRate = this.rayStepRate; }
    if (collides === undefined) { collides = false; }
    if (interestingFace === undefined) { interestingFace = false; }

    //  First get all tiles that touch the bounds of the line
    var tiles = this.getTiles(line.x, line.y, line.width, line.height, collides, interestingFace);

    if (tiles.length === 0)
    {
        return [];
    }

    //  Now we only want the tiles that intersect with the points on this line
    var coords = line.coordinatesOnLine(stepRate);
    var results = [];

    for (var i = 0; i < tiles.length; i++)
    {
        for (var t = 0; t < coords.length; t++)
        {
            var tile = tiles[i];
            var coord = coords[t];
            if (tile.containsPoint(coord[0], coord[1]))
            {
                results.push(tile);
                break;
            }
        }
    }

    return results;

};

/**
* Get all tiles that exist within the given area, defined by the top-left corner, width and height. Values given are in pixels, not tiles.
*
* @method Phaser.TilemapLayer#getTiles
* @public
* @param {number} x - X position of the top left corner (in pixels).
* @param {number} y - Y position of the top left corner (in pixels).
* @param {number} width - Width of the area to get (in pixels).
* @param {number} height - Height of the area to get (in pixels).
* @param {boolean} [collides=false] - If true, _only_ return tiles that collide on one or more faces.
* @param {boolean} [interestingFace=false] - If true, _only_ return tiles that have interesting faces.
* @return {array<Phaser.Tile>} An array of Tiles.
*/
Phaser.TilemapLayer.prototype.getTiles = function (x, y, width, height, collides, interestingFace) {

    //  Should we only get tiles that have at least one of their collision flags set? (true = yes, false = no just get them all)
    if (collides === undefined) { collides = false; }
    if (interestingFace === undefined) { interestingFace = false; }

    var fetchAll = !(collides || interestingFace);

    //  Adjust the x,y coordinates for scrollFactor
    x = this._fixX(x);
    y = this._fixY(y);

    //  Convert the pixel values into tile coordinates
    var tx = Math.floor(x / (this._mc.cw * this.scale.x));
    var ty = Math.floor(y / (this._mc.ch * this.scale.y));
    //  Don't just use ceil(width/cw) to allow account for x/y diff within cell
    var tw = Math.ceil((x + width) / (this._mc.cw * this.scale.x)) - tx;
    var th = Math.ceil((y + height) / (this._mc.ch * this.scale.y)) - ty;

    while (this._results.length)
    {
        this._results.pop();
    }

    for (var wy = ty; wy < ty + th; wy++)
    {
        for (var wx = tx; wx < tx + tw; wx++)
        {
            var row = this.layer.data[wy];

            if (row && row[wx])
            {
                if (fetchAll || row[wx].isInteresting(collides, interestingFace))
                {
                    this._results.push(row[wx]);
                }
            }
        }
    }

    return this._results.slice();

};

/**
* Returns the appropriate tileset for the index, updating the internal cache as required.
* This should only be called if `tilesets[index]` evaluates to undefined.
*
* @method Phaser.TilemapLayer#resolveTileset
* @private
* @param {integer} Tile index
* @return {Phaser.Tileset|null} Returns the associated tileset or null if there is no such mapping.
*/
Phaser.TilemapLayer.prototype.resolveTileset = function (tileIndex) {

    var tilesets = this._mc.tilesets;

    //  Try for dense array if reasonable
    if (tileIndex < 2000)
    {
        while (tilesets.length < tileIndex)
        {
            tilesets.push(undefined);
        }
    }

    var setIndex = this.map.tiles[tileIndex] && this.map.tiles[tileIndex][2];

    if (setIndex !== null)
    {
        var tileset = this.map.tilesets[setIndex];

        if (tileset && tileset.containsTileIndex(tileIndex))
        {
            return (tilesets[tileIndex] = tileset);
        }
    }

    return (tilesets[tileIndex] = null);

};

/**
* The TilemapLayer caches tileset look-ups.
*
* Call this method of clear the cache if tilesets have been added or updated after the layer has been rendered.
*
* @method Phaser.TilemapLayer#resetTilesetCache
* @public
*/
Phaser.TilemapLayer.prototype.resetTilesetCache = function () {

    var tilesets = this._mc.tilesets;

    while (tilesets.length)
    {
        tilesets.pop();
    }

};

/**
 * This method will set the scale of the tilemap as well as update the underlying block data of this layer.
 * 
 * @method Phaser.TilemapLayer#setScale
 * @param {number} [xScale=1] - The scale factor along the X-plane 
 * @param {number} [yScale] - The scale factor along the Y-plane
 */
Phaser.TilemapLayer.prototype.setScale = function (xScale, yScale) {

    xScale = xScale || 1;
    yScale = yScale || xScale;

    for (var y = 0; y < this.layer.data.length; y++)
    {
        var row = this.layer.data[y];

        for (var x = 0; x < row.length; x++)
        {
            var tile = row[x];

            tile.width = this.map.tileWidth * xScale;
            tile.height = this.map.tileHeight * yScale;

            tile.worldX = tile.x * tile.width;
            tile.worldY = tile.y * tile.height;
        }
    }

    this.scale.setTo(xScale, yScale);

};

/**
* Shifts the contents of the canvas - does extra math so that different browsers agree on the result.
*
* The specified (x/y) will be shifted to (0,0) after the copy and the newly exposed canvas area will need to be filled in.
*
* @method Phaser.TilemapLayer#shiftCanvas
* @private
* @param {CanvasRenderingContext2D} context - The context to shift
* @param {integer} x
* @param {integer} y
*/
Phaser.TilemapLayer.prototype.shiftCanvas = function (context, x, y) {

    var canvas = context.canvas;
    var copyW = canvas.width - Math.abs(x);
    var copyH = canvas.height - Math.abs(y);

    //  When x/y non-negative
    var dx = 0;
    var dy = 0;
    var sx = x;
    var sy = y;

    if (x < 0)
    {
        dx = -x;
        sx = 0;
    }

    if (y < 0)
    {
        dy = -y;
        sy = 0;
    }

    var copyCanvas = this.renderSettings.copyCanvas;

    if (copyCanvas)
    {
        // Use a second copy buffer, without slice support, for Safari .. again.
        // Ensure copy canvas is large enough
        if (copyCanvas.width < copyW || copyCanvas.height < copyH)
        {
            copyCanvas.width = copyW;
            copyCanvas.height = copyH;
        }

        var copyContext = copyCanvas.getContext('2d');
        copyContext.clearRect(0, 0, copyW, copyH);
        copyContext.drawImage(canvas, dx, dy, copyW, copyH, 0, 0, copyW, copyH);
        // clear allows default 'source-over' semantics
        context.clearRect(sx, sy, copyW, copyH);
        context.drawImage(copyCanvas, 0, 0, copyW, copyH, sx, sy, copyW, copyH);
    }
    else
    {
        // Avoids a second copy but flickers in Safari / Safari Mobile
        // Ref. https://github.com/photonstorm/phaser/issues/1439
        context.save();
        context.globalCompositeOperation = 'copy';
        context.drawImage(canvas, dx, dy, copyW, copyH, sx, sy, copyW, copyH);
        context.restore();
    }
    
};

/**
* Render tiles in the given area given by the virtual tile coordinates biased by the given scroll factor.
* This will constrain the tile coordinates based on wrapping but not physical coordinates.
*
* @method Phaser.TilemapLayer#renderRegion
* @private
* @param {integer} scrollX - Render x offset/scroll.
* @param {integer} scrollY - Render y offset/scroll.
* @param {integer} left - Leftmost column to render.
* @param {integer} top - Topmost row to render.
* @param {integer} right - Rightmost column to render.
* @param {integer} bottom - Bottommost row to render.
*/
Phaser.TilemapLayer.prototype.renderRegion = function (scrollX, scrollY, left, top, right, bottom) {

    var context = this.context;

    var width = this.layer.width;
    var height = this.layer.height;
    var tw = this._mc.tileWidth;
    var th = this._mc.tileHeight;

    var tilesets = this._mc.tilesets;
    var lastAlpha = NaN;

    if (!this._wrap)
    {
        if (left <= right) // Only adjust if going to render
        {
            left = Math.max(0, left);
            right = Math.min(width - 1, right);
        }
        if (top <= bottom)
        {
            top = Math.max(0, top);
            bottom = Math.min(height - 1, bottom);
        }
    }
   
    // top-left pixel of top-left cell
    var baseX = (left * tw) - scrollX;
    var baseY = (top * th) - scrollY;

    // Fix normStartX/normStartY such it is normalized [0..width/height). This allows a simple conditional and decrement to always keep in range [0..width/height) during the loop. The major offset bias is to take care of negative values.
    var normStartX = (left + ((1 << 20) * width)) % width;
    var normStartY = (top + ((1 << 20) * height)) % height;

    // tx/ty - are pixel coordinates where tile is drawn
    // x/y - is cell location, normalized [0..width/height) in loop
    // xmax/ymax - remaining cells to render on column/row
    var tx, ty, x, y, xmax, ymax;

    for (y = normStartY, ymax = bottom - top, ty = baseY; ymax >= 0; y++, ymax--, ty += th)
    {
        if (y >= height)
        {
            y -= height;
        }

        var row = this.layer.data[y];

        for (x = normStartX, xmax = right - left, tx = baseX; xmax >= 0; x++, xmax--, tx += tw)
        {
            if (x >= width)
            {
                x -= width;
            }

            var tile = row[x];

            if (!tile || tile.index < 0)
            {
                continue;
            }

            var index = tile.index;

            var set = tilesets[index];

            if (set === undefined)
            {
                set = this.resolveTileset(index);
            }

            //  Setting the globalAlpha is "surprisingly expensive" in Chrome (38)
            if (tile.alpha !== lastAlpha && !this.debug)
            {
                context.globalAlpha = tile.alpha;
                lastAlpha = tile.alpha;
            }

            if (set)
            {
                if (tile.rotation || tile.flipped)
                {
                    context.save();
                    context.translate(tx + tile.centerX, ty + tile.centerY);
                    context.rotate(tile.rotation);

                    if (tile.flipped)
                    {
                        context.scale(-1, 1);
                    }

                    set.draw(context, -tile.centerX, -tile.centerY, index);
                    context.restore();
                }
                else
                {
                    set.draw(context, tx, ty, index);
                }
            }
            else if (this.debugSettings.missingImageFill)
            {
                context.fillStyle = this.debugSettings.missingImageFill;
                context.fillRect(tx, ty, tw, th);
            }

            if (tile.debug && this.debugSettings.debuggedTileOverfill)
            {
                context.fillStyle = this.debugSettings.debuggedTileOverfill;
                context.fillRect(tx, ty, tw, th);
            }
           
        }

    }

};

/**
* Shifts the canvas and render damaged edge tiles.
*
* @method Phaser.TilemapLayer#renderDeltaScroll
* @private
*/
Phaser.TilemapLayer.prototype.renderDeltaScroll = function (shiftX, shiftY) {

    var scrollX = this._mc.scrollX;
    var scrollY = this._mc.scrollY;

    var renderW = this.canvas.width;
    var renderH = this.canvas.height;

    var tw = this._mc.tileWidth;
    var th = this._mc.tileHeight;

    // Only cells with coordinates in the "plus" formed by `left <= x <= right` OR `top <= y <= bottom` are drawn. These coordinates may be outside the layer bounds.

    // Start in pixels
    var left = 0;
    var right = -tw;
    var top = 0;
    var bottom = -th;

    if (shiftX < 0) // layer moving left, damage right
    {
        left = renderW + shiftX; // shiftX neg.
        right = renderW - 1;
    }
    else if (shiftX > 0)
    {
        // left -> 0
        right = shiftX;
    }

    if (shiftY < 0) // layer moving down, damage top
    {
        top = renderH + shiftY; // shiftY neg.
        bottom = renderH - 1;
    }
    else if (shiftY > 0)
    {
        // top -> 0
        bottom = shiftY;
    }

    this.shiftCanvas(this.context, shiftX, shiftY);

    // Transform into tile-space
    left = Math.floor((left + scrollX) / tw);
    right = Math.floor((right + scrollX) / tw);
    top = Math.floor((top + scrollY) / th);
    bottom = Math.floor((bottom + scrollY) / th);

    if (left <= right)
    {
        // Clear left or right edge
        this.context.clearRect(((left * tw) - scrollX), 0, (right - left + 1) * tw, renderH);

        var trueTop = Math.floor((0 + scrollY) / th);
        var trueBottom = Math.floor((renderH - 1 + scrollY) / th);
        this.renderRegion(scrollX, scrollY, left, trueTop, right, trueBottom);
    }

    if (top <= bottom)
    {
        // Clear top or bottom edge
        this.context.clearRect(0, ((top * th) - scrollY), renderW, (bottom - top + 1) * th);

        var trueLeft = Math.floor((0 + scrollX) / tw);
        var trueRight = Math.floor((renderW - 1 + scrollX) / tw);
        this.renderRegion(scrollX, scrollY, trueLeft, top, trueRight, bottom);
    }

};

/**
* Clear and render the entire canvas.
*
* @method Phaser.TilemapLayer#renderFull
* @private
*/
Phaser.TilemapLayer.prototype.renderFull = function () {
    
    var scrollX = this._mc.scrollX;
    var scrollY = this._mc.scrollY;

    var renderW = this.canvas.width;
    var renderH = this.canvas.height;

    var tw = this._mc.tileWidth;
    var th = this._mc.tileHeight;

    var left = Math.floor(scrollX / tw);
    var right = Math.floor((renderW - 1 + scrollX) / tw);
    var top = Math.floor(scrollY / th);
    var bottom = Math.floor((renderH - 1 + scrollY) / th);

    this.context.clearRect(0, 0, renderW, renderH);

    this.renderRegion(scrollX, scrollY, left, top, right, bottom);

};

/**
* Renders the tiles to the layer canvas and pushes to the display.
*
* @method Phaser.TilemapLayer#render
* @protected
*/
Phaser.TilemapLayer.prototype.render = function () {

    var redrawAll = false;

    if (!this.visible)
    {
        return;
    }

    if (this.dirty || this.layer.dirty)
    {
        this.layer.dirty = false;
        redrawAll = true;
    }

    var renderWidth = this.canvas.width; // Use Sprite.width/height?
    var renderHeight = this.canvas.height;

    //  Scrolling bias; whole pixels only
    var scrollX = this._scrollX | 0;
    var scrollY = this._scrollY | 0;

    var mc = this._mc;
    var shiftX = mc.scrollX - scrollX; // Negative when scrolling right/down
    var shiftY = mc.scrollY - scrollY;

    if (!redrawAll &&
        shiftX === 0 && shiftY === 0 &&
        mc.renderWidth === renderWidth && mc.renderHeight === renderHeight)
    {
        //  No reason to redraw map, looking at same thing and not invalidated.
        return;
    }

    this.context.save();
    
    mc.scrollX = scrollX;
    mc.scrollY = scrollY;

    if (mc.renderWidth !== renderWidth || mc.renderHeight !== renderHeight)
    {
        //  Could support automatic canvas resizing
        mc.renderWidth = renderWidth;
        mc.renderHeight = renderHeight;
    }

    if (this.debug)
    {
        this.context.globalAlpha = this.debugSettings.debugAlpha;

        if (this.debugSettings.forceFullRedraw)
        {
            redrawAll = true;
        }
    }

    if (!redrawAll &&
        this.renderSettings.enableScrollDelta &&
        (Math.abs(shiftX) + Math.abs(shiftY)) < Math.min(renderWidth, renderHeight))
    {
        this.renderDeltaScroll(shiftX, shiftY);
    }
    else
    {
        // Too much change or otherwise requires full render
        this.renderFull();
    }

    if (this.debug)
    {
        this.context.globalAlpha = 1;
        this.renderDebug();
    }

    this.texture.baseTexture.dirty();

    this.dirty = false;

    this.context.restore();

    return true;

};

/**
* Renders a debug overlay on-top of the canvas. Called automatically by render when `debug` is true.
*
* See `debugSettings` for assorted configuration options.
*
* @method Phaser.TilemapLayer#renderDebug
* @private
*/
Phaser.TilemapLayer.prototype.renderDebug = function () {

    var scrollX = this._mc.scrollX;
    var scrollY = this._mc.scrollY;

    var context = this.context;
    var renderW = this.canvas.width;
    var renderH = this.canvas.height;

    var width = this.layer.width;
    var height = this.layer.height;
    var tw = this._mc.tileWidth;
    var th = this._mc.tileHeight;

    var left = Math.floor(scrollX / tw);
    var right = Math.floor((renderW - 1 + scrollX) / tw);
    var top = Math.floor(scrollY / th);
    var bottom = Math.floor((renderH - 1 + scrollY) / th);

    var baseX = (left * tw) - scrollX;
    var baseY = (top * th) - scrollY;

    var normStartX = (left + ((1 << 20) * width)) % width;
    var normStartY = (top + ((1 << 20) * height)) % height;

    var tx, ty, x, y, xmax, ymax;

    context.strokeStyle = this.debugSettings.facingEdgeStroke;

    for (y = normStartY, ymax = bottom - top, ty = baseY; ymax >= 0; y++, ymax--, ty += th)
    {
        if (y >= height)
        {
            y -= height;
        }

        var row = this.layer.data[y];

        for (x = normStartX, xmax = right - left, tx = baseX; xmax >= 0; x++, xmax--, tx += tw)
        {
            if (x >= width)
            {
                x -= width;
            }

            var tile = row[x];
            if (!tile || tile.index < 0 || !tile.collides)
            {
                continue;
            }

            if (this.debugSettings.collidingTileOverfill)
            {
                context.fillStyle = this.debugSettings.collidingTileOverfill;
                context.fillRect(tx, ty, this._mc.cw, this._mc.ch);
            }

            if (this.debugSettings.facingEdgeStroke)
            {
                context.beginPath();

                if (tile.faceTop)
                {
                    context.moveTo(tx, ty);
                    context.lineTo(tx + this._mc.cw, ty);
                }

                if (tile.faceBottom)
                {
                    context.moveTo(tx, ty + this._mc.ch);
                    context.lineTo(tx + this._mc.cw, ty + this._mc.ch);
                }

                if (tile.faceLeft)
                {
                    context.moveTo(tx, ty);
                    context.lineTo(tx, ty + this._mc.ch);
                }

                if (tile.faceRight)
                {
                    context.moveTo(tx + this._mc.cw, ty);
                    context.lineTo(tx + this._mc.cw, ty + this._mc.ch);
                }

                context.closePath();

                context.stroke();
            }
           
        }

    }

};

/**
* Flag controlling if the layer tiles wrap at the edges. Only works if the World size matches the Map size.
*
* @property {boolean} wrap
* @memberof Phaser.TilemapLayer
* @public
* @default false
*/
Object.defineProperty(Phaser.TilemapLayer.prototype, "wrap", {

    get: function () {
        return this._wrap;
    },

    set: function (value) {
        this._wrap = value;
        this.dirty = true;
    }

});

/**
* Scrolls the map horizontally or returns the current x position.
*
* @property {number} scrollX
* @memberof Phaser.TilemapLayer
* @public
*/
Object.defineProperty(Phaser.TilemapLayer.prototype, "scrollX", {

    get: function () {
        return this._scrollX;
    },

    set: function (value) {
        this._scrollX = value;
    }

});

/**
* Scrolls the map vertically or returns the current y position.
*
* @property {number} scrollY
* @memberof Phaser.TilemapLayer
* @public
*/
Object.defineProperty(Phaser.TilemapLayer.prototype, "scrollY", {

    get: function () {
        return this._scrollY;
    },

    set: function (value) {
        this._scrollY = value;
    }

});

/**
* The width of the collision tiles (in pixels).
*
* @property {integer} collisionWidth
* @memberof Phaser.TilemapLayer
* @public
*/
Object.defineProperty(Phaser.TilemapLayer.prototype, "collisionWidth", {

    get: function () {
        return this._mc.cw;
    },

    set: function (value) {
        this._mc.cw = value | 0;
        this.dirty = true;
    }

});

/**
* The height of the collision tiles (in pixels).
*
* @property {integer} collisionHeight
* @memberof Phaser.TilemapLayer
* @public
*/
Object.defineProperty(Phaser.TilemapLayer.prototype, "collisionHeight", {

    get: function () {
        return this._mc.ch;
    },

    set: function (value) {
        this._mc.ch = value | 0;
        this.dirty = true;
    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Phaser.TilemapParser parses data objects from Phaser.Loader that need more preparation before they can be inserted into a Tilemap.
*
* @class Phaser.TilemapParser
* @static
*/
Phaser.TilemapParser = {

    /**
     * When scanning the Tiled map data the TilemapParser can either insert a null value (true) or
     * a Phaser.Tile instance with an index of -1 (false, the default). Depending on your game type
     * depends how this should be configured. If you've a large sparsely populated map and the tile
     * data doesn't need to change then setting this value to `true` will help with memory consumption.
     * However if your map is small, or you need to update the tiles (perhaps the map dynamically changes
     * during the game) then leave the default value set.
     *
     * @constant
     * @type {boolean}
     */
    INSERT_NULL: false,

    /**
    * Parse tilemap data from the cache and creates data for a Tilemap object.
    *
    * @method Phaser.TilemapParser.parse
    * @param {Phaser.Game} game - Game reference to the currently running game.
    * @param {string} key - The key of the tilemap in the Cache.
    * @param {number} [tileWidth=32] - The pixel width of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
    * @param {number} [tileHeight=32] - The pixel height of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
    * @param {number} [width=10] - The width of the map in tiles. If this map is created from Tiled or CSV data you don't need to specify this.
    * @param {number} [height=10] - The height of the map in tiles. If this map is created from Tiled or CSV data you don't need to specify this.
    * @return {object} The parsed map object.
    */
    parse: function (game, key, tileWidth, tileHeight, width, height) {

        if (tileWidth === undefined) { tileWidth = 32; }
        if (tileHeight === undefined) { tileHeight = 32; }
        if (width === undefined) { width = 10; }
        if (height === undefined) { height = 10; }

        if (key === undefined)
        {
            return this.getEmptyData();
        }

        if (key === null)
        {
            return this.getEmptyData(tileWidth, tileHeight, width, height);
        }

        var map = game.cache.getTilemapData(key);

        if (map)
        {
            if (map.format === Phaser.Tilemap.CSV)
            {
                return this.parseCSV(key, map.data, tileWidth, tileHeight);
            }
            else if (!map.format || map.format === Phaser.Tilemap.TILED_JSON)
            {
                return this.parseTiledJSON(map.data);
            }
        }
        else
        {
            console.warn('Phaser.TilemapParser.parse - No map data found for key ' + key);
        }

    },

    /**
    * Parses a CSV file into valid map data.
    *
    * @method Phaser.TilemapParser.parseCSV
    * @param {string} key - The name you want to give the map data.
    * @param {string} data - The CSV file data.
    * @param {number} [tileWidth=32] - The pixel width of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
    * @param {number} [tileHeight=32] - The pixel height of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
    * @return {object} Generated map data.
    */
    parseCSV: function (key, data, tileWidth, tileHeight) {

        var map = this.getEmptyData();

        //  Trim any rogue whitespace from the data
        data = data.trim();

        var output = [];
        var rows = data.split("\n");
        var height = rows.length;
        var width = 0;

        for (var y = 0; y < rows.length; y++)
        {
            output[y] = [];

            var column = rows[y].split(",");

            for (var x = 0; x < column.length; x++)
            {
                output[y][x] = new Phaser.Tile(map.layers[0], parseInt(column[x], 10), x, y, tileWidth, tileHeight);
            }

            if (width === 0)
            {
                width = column.length;
            }
        }

        map.format = Phaser.Tilemap.CSV;
        map.name = key;
        map.width = width;
        map.height = height;
        map.tileWidth = tileWidth;
        map.tileHeight = tileHeight;
        map.widthInPixels = width * tileWidth;
        map.heightInPixels = height * tileHeight;

        map.layers[0].width = width;
        map.layers[0].height = height;
        map.layers[0].widthInPixels = map.widthInPixels;
        map.layers[0].heightInPixels = map.heightInPixels;
        map.layers[0].data = output;

        return map;

    },

    /**
    * Returns an empty map data object.
    *
    * @method Phaser.TilemapParser.getEmptyData
    * @return {object} Generated map data.
    */
    getEmptyData: function (tileWidth, tileHeight, width, height) {

        return {
            width: (width !== undefined && width !== null) ? width : 0,
            height: (height !== undefined && height !== null) ? height : 0,
            tileWidth: (tileWidth !== undefined && tileWidth !== null) ? tileWidth : 0,
            tileHeight: (tileHeight !== undefined && tileHeight !== null) ? tileHeight : 0,
            orientation: 'orthogonal',
            version: '1',
            properties: {},
            widthInPixels: 0,
            heightInPixels: 0,
            layers: [
                {
                    name: 'layer',
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    widthInPixels: 0,
                    heightInPixels: 0,
                    alpha: 1,
                    visible: true,
                    properties: {},
                    indexes: [],
                    callbacks: [],
                    bodies: [],
                    data: []
                }
            ],
            images: [],
            objects: {},
            collision: {},
            tilesets: [],
            tiles: []
        };

    },

    /**
    * Parses a Tiled JSON file into valid map data.
    * @method Phaser.TilemapParser.parseJSON
    * @param {object} json - The JSON map data.
    * @return {object} Generated and parsed map data.
    */
    parseTiledJSON: function (json) {

        if (json.orientation !== 'orthogonal')
        {
            console.warn('TilemapParser.parseTiledJSON - Only orthogonal map types are supported in this version of Phaser');
            return null;
        }

        //  Map data will consist of: layers, objects, images, tilesets, sizes
        var map = {
            width: json.width,
            height: json.height,
            tileWidth: json.tilewidth,
            tileHeight: json.tileheight,
            orientation: json.orientation,
            format: Phaser.Tilemap.TILED_JSON,
            version: json.version,
            properties: json.properties,
            widthInPixels: json.width * json.tilewidth,
            heightInPixels: json.height * json.tileheight
        };

        //  Tile Layers
        var layers = [];

        for (var i = 0; i < json.layers.length; i++)
        {
            if (json.layers[i].type !== 'tilelayer')
            {
                continue;
            }

            var curl = json.layers[i];

            // Base64 decode data if necessary
            // NOTE: uncompressed base64 only.

            if (!curl.compression && curl.encoding && curl.encoding === 'base64')
            {
                var binaryString = window.atob(curl.data);
                var len = binaryString.length;
                var bytes = new Array(len);

                // Interpret binaryString as an array of bytes representing
                // little-endian encoded uint32 values.
                for (var j = 0; j < len; j+=4)
                {
                    bytes[j / 4] = (
                        binaryString.charCodeAt(j) |
                        binaryString.charCodeAt(j + 1) << 8 |
                        binaryString.charCodeAt(j + 2) << 16 |
                        binaryString.charCodeAt(j + 3) << 24
                    ) >>> 0;
                }

                curl.data = bytes;

                delete curl.encoding;
            }
            else if (curl.compression)
            {
                console.warn('TilemapParser.parseTiledJSON - Layer compression is unsupported, skipping layer \'' + curl.name + '\'');
                continue;
            }

            var layer = {

                name: curl.name,
                x: curl.x,
                y: curl.y,
                width: curl.width,
                height: curl.height,
                widthInPixels: curl.width * json.tilewidth,
                heightInPixels: curl.height * json.tileheight,
                alpha: curl.opacity,
                visible: curl.visible,
                properties: {},
                indexes: [],
                callbacks: [],
                bodies: []

            };

            if (curl.properties)
            {
                layer.properties = curl.properties;
            }

            var x = 0;
            var row = [];
            var output = [];
            var rotation, flipped, flippedVal, gid;

            //  Loop through the data field in the JSON.

            //  This is an array containing the tile indexes, one after the other. -1 = no tile, everything else = the tile index (starting at 1 for Tiled, 0 for CSV)
            //  If the map contains multiple tilesets then the indexes are relative to that which the set starts from.
            //  Need to set which tileset in the cache = which tileset in the JSON, if you do this manually it means you can use the same map data but a new tileset.

            for (var t = 0, len = curl.data.length; t < len; t++)
            {
                rotation = 0;
                flipped = false;
                gid = curl.data[t];
                flippedVal = 0;

                //  If true the current tile is flipped or rotated (Tiled TMX format)
                if (gid > 0x20000000)
                {
                    // FlippedX
                    if (gid > 0x80000000)
                    {
                        gid -= 0x80000000;
                        flippedVal += 4;
                    }

                    // FlippedY
                    if (gid > 0x40000000)
                    {
                        gid -= 0x40000000;
                        flippedVal += 2;
                    }

                    // FlippedAD (anti-diagonal = top-right is swapped with bottom-left corners)
                    if (gid > 0x20000000)
                    {
                        gid -= 0x20000000;
                        flippedVal += 1;
                    }

                    switch (flippedVal)
                    {
                        case 5:
                            rotation = Math.PI / 2;
                            break;

                        case 6:
                            rotation = Math.PI;
                            break;

                        case 3:
                            rotation = 3 * Math.PI / 2;
                            break;

                        case 4:
                            rotation = 0;
                            flipped = true;
                            break;

                        case 7:
                            rotation = Math.PI / 2;
                            flipped = true;
                            break;

                        case 2:
                            rotation = Math.PI;
                            flipped = true;
                            break;

                        case 1:
                            rotation = 3 * Math.PI / 2;
                            flipped = true;
                            break;
                    }
                }

                //  index, x, y, width, height
                if (gid > 0)
                {
                    var tile = new Phaser.Tile(layer, gid, x, output.length, json.tilewidth, json.tileheight);

                    tile.rotation = rotation;
                    tile.flipped = flipped;

                    if (flippedVal !== 0)
                    {
                        //  The WebGL renderer uses this to flip UV coordinates before drawing
                        tile.flippedVal = flippedVal;
                    }

                    row.push(tile);
                }
                else
                {
                    if (Phaser.TilemapParser.INSERT_NULL)
                    {
                        row.push(null);
                    }
                    else
                    {
                        row.push(new Phaser.Tile(layer, -1, x, output.length, json.tilewidth, json.tileheight));
                    }
                }

                x++;

                if (x === curl.width)
                {
                    output.push(row);
                    x = 0;
                    row = [];
                }
            }

            layer.data = output;

            layers.push(layer);
        }

        map.layers = layers;

        //  Images
        var images = [];

        for (var i = 0; i < json.layers.length; i++)
        {
            if (json.layers[i].type !== 'imagelayer')
            {
                continue;
            }

            var curi = json.layers[i];

            var image = {

                name: curi.name,
                image: curi.image,
                x: curi.x,
                y: curi.y,
                alpha: curi.opacity,
                visible: curi.visible,
                properties: {}

            };

            if (curi.properties)
            {
                image.properties = curi.properties;
            }

            images.push(image);

        }

        map.images = images;

        //  Tilesets & Image Collections
        var tilesets = [];
        var imagecollections = [];
        var lastSet = null;

        for (var i = 0; i < json.tilesets.length; i++)
        {
            //  name, firstgid, width, height, margin, spacing, properties
            var set = json.tilesets[i];

            if (set.image)
            {
                var newSet = new Phaser.Tileset(set.name, set.firstgid, set.tilewidth, set.tileheight, set.margin, set.spacing, set.properties);

                if (set.tileproperties)
                {
                    newSet.tileProperties = set.tileproperties;
                }

                // For a normal sliced tileset the row/count/size information is computed when updated.
                // This is done (again) after the image is set.
                newSet.updateTileData(set.imagewidth, set.imageheight);

                tilesets.push(newSet);
            }
            else
            {
                var newCollection = new Phaser.ImageCollection(set.name, set.firstgid, set.tilewidth, set.tileheight, set.margin, set.spacing, set.properties);

                for (var ti in set.tiles)
                {
                    var image = set.tiles[ti].image;
                    var gid = set.firstgid + parseInt(ti, 10);
                    newCollection.addImage(gid, image);
                }

                imagecollections.push(newCollection);
            }

            //  We've got a new Tileset, so set the lastgid into the previous one
            if (lastSet)
            {
                lastSet.lastgid = set.firstgid - 1;
            }
            
            lastSet = set;
        }

        map.tilesets = tilesets;
        map.imagecollections = imagecollections;

        //  Objects & Collision Data (polylines, etc)
        var objects = {};
        var collision = {};

        function slice (obj, fields) {

            var sliced = {};

            for (var k in fields)
            {
                var key = fields[k];

                if (typeof obj[key] !== 'undefined')
                {
                    sliced[key] = obj[key];
                }
            }

            return sliced;
        }

        for (var i = 0; i < json.layers.length; i++)
        {
            if (json.layers[i].type !== 'objectgroup')
            {
                continue;
            }

            var curo = json.layers[i];

            objects[curo.name] = [];
            collision[curo.name] = [];

            for (var v = 0, len = curo.objects.length; v < len; v++)
            {
                //  Object Tiles
                if (curo.objects[v].gid)
                {
                    var object = {

                        gid: curo.objects[v].gid,
                        name: curo.objects[v].name,
                        type: curo.objects[v].hasOwnProperty("type") ? curo.objects[v].type : "",
                        x: curo.objects[v].x,
                        y: curo.objects[v].y,
                        visible: curo.objects[v].visible,
                        properties: curo.objects[v].properties

                    };

                    if (curo.objects[v].rotation)
                    {
                        object.rotation = curo.objects[v].rotation;
                    }

                    objects[curo.name].push(object);
                }
                else if (curo.objects[v].polyline)
                {
                    var object = {

                        name: curo.objects[v].name,
                        type: curo.objects[v].type,
                        x: curo.objects[v].x,
                        y: curo.objects[v].y,
                        width: curo.objects[v].width,
                        height: curo.objects[v].height,
                        visible: curo.objects[v].visible,
                        properties: curo.objects[v].properties

                    };

                    if (curo.objects[v].rotation)
                    {
                        object.rotation = curo.objects[v].rotation;
                    }

                    object.polyline = [];

                    //  Parse the polyline into an array
                    for (var p = 0; p < curo.objects[v].polyline.length; p++)
                    {
                        object.polyline.push([ curo.objects[v].polyline[p].x, curo.objects[v].polyline[p].y ]);
                    }

                    collision[curo.name].push(object);
                    objects[curo.name].push(object);
                }
                // polygon
                else if (curo.objects[v].polygon)
                {
                    var object = slice(curo.objects[v], ['name', 'type', 'x', 'y', 'visible', 'rotation', 'properties']);

                    //  Parse the polygon into an array
                    object.polygon = [];

                    for (var p = 0; p < curo.objects[v].polygon.length; p++)
                    {
                        object.polygon.push([curo.objects[v].polygon[p].x, curo.objects[v].polygon[p].y]);
                    }

                    objects[curo.name].push(object);

                }
                // ellipse
                else if (curo.objects[v].ellipse)
                {
                    var object = slice(curo.objects[v], ['name', 'type', 'ellipse', 'x', 'y', 'width', 'height', 'visible', 'rotation', 'properties']);
                    objects[curo.name].push(object);
                }
                // otherwise it's a rectangle
                else
                {
                    var object = slice(curo.objects[v], ['name', 'type', 'x', 'y', 'width', 'height', 'visible', 'rotation', 'properties']);
                    object.rectangle = true;
                    objects[curo.name].push(object);
                }
            }
        }

        map.objects = objects;
        map.collision = collision;

        map.tiles = [];

        //  Finally lets build our super tileset index
        for (var i = 0; i < map.tilesets.length; i++)
        {
            var set = map.tilesets[i];

            var x = set.tileMargin;
            var y = set.tileMargin;

            var count = 0;
            var countX = 0;
            var countY = 0;

            for (var t = set.firstgid; t < set.firstgid + set.total; t++)
            {
                //  Can add extra properties here as needed
                map.tiles[t] = [x, y, i];

                x += set.tileWidth + set.tileSpacing;

                count++;

                if (count === set.total)
                {
                    break;
                }

                countX++;

                if (countX === set.columns)
                {
                    x = set.tileMargin;
                    y += set.tileHeight + set.tileSpacing;

                    countX = 0;
                    countY++;

                    if (countY === set.rows)
                    {
                        break;
                    }
                }
            }

        }

        // assign tile properties

        var layer;
        var tile;
        var sid;
        var set;

        // go through each of the map data layers
        for (var i = 0; i < map.layers.length; i++)
        {
            layer = map.layers[i];

            set = null;

            // rows of tiles
            for (var j = 0; j < layer.data.length; j++)
            {
                row = layer.data[j];

                // individual tiles
                for (var k = 0; k < row.length; k++)
                {
                    tile = row[k];

                    if (tile === null || tile.index < 0)
                    {
                        continue;
                    }

                    // find the relevant tileset

                    sid = map.tiles[tile.index][2];
                    set = map.tilesets[sid];


                    // if that tile type has any properties, add them to the tile object

                    if (set.tileProperties && set.tileProperties[tile.index - set.firstgid])
                    {
                        tile.properties = Phaser.Utils.mixin(set.tileProperties[tile.index - set.firstgid], tile.properties);
                    }

                }
            }
        }

        return map;

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Tile set is a combination of an image containing the tiles and collision data per tile.
*
* Tilesets are normally created automatically when Tiled data is loaded.
*
* @class Phaser.Tileset
* @constructor
* @param {string} name - The name of the tileset in the map data.
* @param {integer} firstgid - The first tile index this tileset contains.
* @param {integer} [width=32] - Width of each tile (in pixels).
* @param {integer} [height=32] - Height of each tile (in pixels).
* @param {integer} [margin=0] - The margin around all tiles in the sheet (in pixels).
* @param {integer} [spacing=0] - The spacing between each tile in the sheet (in pixels).
* @param {object} [properties={}] - Custom Tileset properties.
*/
Phaser.Tileset = function (name, firstgid, width, height, margin, spacing, properties) {

    if (width === undefined || width <= 0) { width = 32; }
    if (height === undefined || height <= 0) { height = 32; }
    if (margin === undefined) { margin = 0; }
    if (spacing === undefined) { spacing = 0; }

    /**
    * The name of the Tileset.
    * @property {string} name
    */
    this.name = name;

    /**
    * The Tiled firstgid value.
    * This is the starting index of the first tile index this Tileset contains.
    * @property {integer} firstgid
    */
    this.firstgid = firstgid | 0;

    /**
    * The width of each tile (in pixels).
    * @property {integer} tileWidth
    * @readonly
    */
    this.tileWidth = width | 0;

    /**
    * The height of each tile (in pixels).
    * @property {integer} tileHeight
    * @readonly
    */
    this.tileHeight = height | 0;

    /**
    * The margin around the tiles in the sheet (in pixels).
    * Use `setSpacing` to change.
    * @property {integer} tileMarge
    * @readonly
    */
    // Modified internally
    this.tileMargin = margin | 0;

    /**
    * The spacing between each tile in the sheet (in pixels).
    * Use `setSpacing` to change.
    * @property {integer} tileSpacing
    * @readonly
    */
    this.tileSpacing = spacing | 0;

    /**
    * Tileset-specific properties that are typically defined in the Tiled editor.
    * @property {object} properties
    */
    this.properties = properties || {};

    /**
    * The cached image that contains the individual tiles. Use {@link Phaser.Tileset.setImage setImage} to set.
    * @property {?object} image
    * @readonly
    */
    // Modified internally
    this.image = null;

    /**
    * The number of tile rows in the the tileset.
    * @property {integer}
    * @readonly
    */
    // Modified internally
    this.rows = 0;

    /**
    * The number of tile columns in the tileset.
    * @property {integer} columns
    * @readonly
    */
    // Modified internally
    this.columns = 0;

    /**
    * The total number of tiles in the tileset.
    * @property {integer} total
    * @readonly
    */
    // Modified internally
    this.total = 0;

    /**
    * The look-up table to specific tile image offsets.
    * The coordinates are interlaced such that it is [x0, y0, x1, y1 .. xN, yN] and the tile with the index of firstgid is found at indices 0/1.
    * @property {integer[]} drawCoords
    * @private
    */
    this.drawCoords = [];

};

Phaser.Tileset.prototype = {

    /**
    * Draws a tile from this Tileset at the given coordinates on the context.
    *
    * @method Phaser.Tileset#draw
    * @public
    * @param {CanvasRenderingContext2D} context - The context to draw the tile onto.
    * @param {number} x - The x coordinate to draw to.
    * @param {number} y - The y coordinate to draw to.
    * @param {integer} index - The index of the tile within the set to draw.
    */
    draw: function (context, x, y, index) {

        //  Correct the tile index for the set and bias for interlacing
        var coordIndex = (index - this.firstgid) << 1;

        if (coordIndex >= 0 && (coordIndex + 1) < this.drawCoords.length)
        {
            context.drawImage(
                this.image,
                this.drawCoords[coordIndex],
                this.drawCoords[coordIndex + 1],
                this.tileWidth,
                this.tileHeight,
                x,
                y,
                this.tileWidth,
                this.tileHeight
            );
        }

    },

    /**
    * Returns true if and only if this tileset contains the given tile index.
    *
    * @method Phaser.Tileset#containsTileIndex
    * @public
    * @return {boolean} True if this tileset contains the given index.
    */
    containsTileIndex: function (tileIndex) {

        return (
            tileIndex >= this.firstgid &&
            tileIndex < (this.firstgid + this.total)
        );

    },

    /**
    * Set the image associated with this Tileset and update the tile data.
    *
    * @method Phaser.Tileset#setImage
    * @public
    * @param {Image} image - The image that contains the tiles.
    */
    setImage: function (image) {

        this.image = image;
        this.updateTileData(image.width, image.height);
       
    },

    /**
    * Sets tile spacing and margins.
    *
    * @method Phaser.Tileset#setSpacing
    * @public
    * @param {integer} [margin=0] - The margin around the tiles in the sheet (in pixels).
    * @param {integer} [spacing=0] - The spacing between the tiles in the sheet (in pixels).
    */
    setSpacing: function (margin, spacing) {

        this.tileMargin = margin | 0;
        this.tileSpacing = spacing | 0;

        if (this.image)
        {
            this.updateTileData(this.image.width, this.image.height);
        }

    },

    /**
    * Updates tile coordinates and tileset data.
    *
    * @method Phaser.Tileset#updateTileData
    * @private
    * @param {integer} imageWidth - The (expected) width of the image to slice.
    * @param {integer} imageHeight - The (expected) height of the image to slice.
    */
    updateTileData: function (imageWidth, imageHeight) {

        // May be fractional values
        var rowCount = (imageHeight - this.tileMargin * 2 + this.tileSpacing) / (this.tileHeight + this.tileSpacing);
        var colCount = (imageWidth - this.tileMargin * 2 + this.tileSpacing) / (this.tileWidth + this.tileSpacing);

        if (rowCount % 1 !== 0 || colCount % 1 !== 0)
        {
            console.warn("Phaser.Tileset - " + this.name + " image tile area is not an even multiple of tile size");
        }

        // In Tiled a tileset image that is not an even multiple of the tile dimensions
        // is truncated - hence the floor when calculating the rows/columns.
        rowCount = Math.floor(rowCount);
        colCount = Math.floor(colCount);

        if ((this.rows && this.rows !== rowCount) || (this.columns && this.columns !== colCount))
        {
            console.warn("Phaser.Tileset - actual and expected number of tile rows and columns differ");
        }

        this.rows = rowCount;
        this.columns = colCount;
        this.total = rowCount * colCount;

        this.drawCoords.length = 0;

        var tx = this.tileMargin;
        var ty = this.tileMargin;

        for (var y = 0; y < this.rows; y++)
        {
            for (var x = 0; x < this.columns; x++)
            {
                this.drawCoords.push(tx);
                this.drawCoords.push(ty);
                tx += this.tileWidth + this.tileSpacing;
            }

            tx = this.tileMargin;
            ty += this.tileHeight + this.tileSpacing;
        }

    }

};

Phaser.Tileset.prototype.constructor = Phaser.Tileset;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Create a new `Particle` object. Particles are extended Sprites that are emitted by a particle emitter such as Phaser.Particles.Arcade.Emitter.
* 
* @class Phaser.Particle
* @constructor
* @extends Phaser.Sprite
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} x - The x coordinate (in world space) to position the Particle at.
* @param {number} y - The y coordinate (in world space) to position the Particle at.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Particle during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
* @param {string|number} frame - If this Particle is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
*/
Phaser.Particle = function (game, x, y, key, frame) {

    Phaser.Sprite.call(this, game, x, y, key, frame);

    /**
    * @property {boolean} autoScale - If this Particle automatically scales this is set to true by Particle.setScaleData.
    * @protected
    */
    this.autoScale = false;

    /**
    * @property {array} scaleData - A reference to the scaleData array owned by the Emitter that emitted this Particle.
    * @protected
    */
    this.scaleData = null;

    /**
    * @property {number} _s - Internal cache var for tracking auto scale.
    * @private
    */
    this._s = 0;

    /**
    * @property {boolean} autoAlpha - If this Particle automatically changes alpha this is set to true by Particle.setAlphaData.
    * @protected
    */
    this.autoAlpha = false;

    /**
    * @property {array} alphaData - A reference to the alphaData array owned by the Emitter that emitted this Particle.
    * @protected
    */
    this.alphaData = null;

    /**
    * @property {number} _a - Internal cache var for tracking auto alpha.
    * @private
    */
    this._a = 0;

};

Phaser.Particle.prototype = Object.create(Phaser.Sprite.prototype);
Phaser.Particle.prototype.constructor = Phaser.Particle;

/**
* Updates the Particle scale or alpha if autoScale and autoAlpha are set.
*
* @method Phaser.Particle#update
* @memberof Phaser.Particle
*/
Phaser.Particle.prototype.update = function() {

    if (this.autoScale)
    {
        this._s--;

        if (this._s)
        {
            this.scale.set(this.scaleData[this._s].x, this.scaleData[this._s].y);
        }
        else
        {
            this.autoScale = false;
        }
    }

    if (this.autoAlpha)
    {
        this._a--;

        if (this._a)
        {
            this.alpha = this.alphaData[this._a].v;
        }
        else
        {
            this.autoAlpha = false;
        }
    }

};

/**
* Called by the Emitter when this particle is emitted. Left empty for you to over-ride as required.
*
* @method Phaser.Particle#onEmit
* @memberof Phaser.Particle
*/
Phaser.Particle.prototype.onEmit = function() {
};

/**
* Called by the Emitter if autoAlpha has been enabled. Passes over the alpha ease data and resets the alpha counter.
*
* @method Phaser.Particle#setAlphaData
* @memberof Phaser.Particle
*/
Phaser.Particle.prototype.setAlphaData = function(data) {

    this.alphaData = data;
    this._a = data.length - 1;
    this.alpha = this.alphaData[this._a].v;
    this.autoAlpha = true;

};

/**
* Called by the Emitter if autoScale has been enabled. Passes over the scale ease data and resets the scale counter.
*
* @method Phaser.Particle#setScaleData
* @memberof Phaser.Particle
*/
Phaser.Particle.prototype.setScaleData = function(data) {

    this.scaleData = data;
    this._s = data.length - 1;
    this.scale.set(this.scaleData[this._s].x, this.scaleData[this._s].y);
    this.autoScale = true;

};

/**
* Resets the Particle. This places the Particle at the given x/y world coordinates and then
* sets alive, exists, visible and renderable all to true. Also resets the outOfBounds state and health values.
* If the Particle has a physics body that too is reset.
*
* @method Phaser.Particle#reset
* @memberof Phaser.Particle
* @param {number} x - The x coordinate (in world space) to position the Particle at.
* @param {number} y - The y coordinate (in world space) to position the Particle at.
* @param {number} [health=1] - The health to give the Particle.
* @return {Phaser.Particle} This instance.
*/
Phaser.Particle.prototype.reset = function(x, y, health) {

    Phaser.Component.Reset.prototype.reset.call(this, x, y, health);

    this.alpha = 1;
    this.scale.set(1);

    this.autoScale = false;
    this.autoAlpha = false;

    return this;

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Phaser.Particles is the Particle Manager for the game. It is called during the game update loop and in turn updates any Emitters attached to it.
*
* @class Phaser.Particles
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.Particles = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;

    /**
    * @property {object} emitters - Internal emitters store.
    */
    this.emitters = {};

    /**
    * @property {number} ID -
    * @default
    */
    this.ID = 0;

};

Phaser.Particles.prototype = {

    /**
    * Adds a new Particle Emitter to the Particle Manager.
    * @method Phaser.Particles#add
    * @param {Phaser.Emitter} emitter - The emitter to be added to the particle manager.
    * @return {Phaser.Emitter} The emitter that was added.
    */
    add: function (emitter) {

        this.emitters[emitter.name] = emitter;

        return emitter;

    },

    /**
    * Removes an existing Particle Emitter from the Particle Manager.
    * @method Phaser.Particles#remove
    * @param {Phaser.Emitter} emitter - The emitter to remove.
    */
    remove: function (emitter) {

        delete this.emitters[emitter.name];

    },

    /**
    * Called by the core game loop. Updates all Emitters who have their exists value set to true.
    * @method Phaser.Particles#update
    * @protected
    */
    update: function () {

        for (var key in this.emitters)
        {
            if (this.emitters[key].exists)
            {
                this.emitters[key].update();
            }
        }

    }

};

Phaser.Particles.prototype.constructor = Phaser.Particles;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Arcade Particles is a Particle System integrated with Arcade Physics.
*
* @class Phaser.Particles.Arcade
*/
Phaser.Particles.Arcade = {};
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Emitter is a lightweight particle emitter that uses Arcade Physics.
* It can be used for one-time explosions or for continuous effects like rain and fire.
* All it really does is launch Particle objects out at set intervals, and fixes their positions and velocities accordingly.
* 
* @class Phaser.Particles.Arcade.Emitter
* @constructor
* @extends Phaser.Group
* @param {Phaser.Game} game - Current game instance.
* @param {number} [x=0] - The x coordinate within the Emitter that the particles are emitted from.
* @param {number} [y=0] - The y coordinate within the Emitter that the particles are emitted from.
* @param {number} [maxParticles=50] - The total number of particles in this emitter.
*/
Phaser.Particles.Arcade.Emitter = function (game, x, y, maxParticles) {

    /**
    * @property {number} maxParticles - The total number of particles in this emitter.
    * @default
    */
    this.maxParticles = maxParticles || 50;

    Phaser.Group.call(this, game);

    /**
    * @property {string} name - A handy string name for this emitter. Can be set to anything.
    */
    this.name = 'emitter' + this.game.particles.ID++;

    /**
    * @property {number} type - Internal Phaser Type value.
    * @protected
    */
    this.type = Phaser.EMITTER;

    /**
    * @property {number} physicsType - The const physics body type of this object.
    * @readonly
    */
    this.physicsType = Phaser.GROUP;

    /**
    * @property {Phaser.Rectangle} area - The area of the emitter. Particles can be randomly generated from anywhere within this rectangle.
    * @default
    */
    this.area = new Phaser.Rectangle(x, y, 1, 1);

    /**
    * @property {Phaser.Point} minParticleSpeed - The minimum possible velocity of a particle.
    * @default
    */
    this.minParticleSpeed = new Phaser.Point(-100, -100);

    /**
    * @property {Phaser.Point} maxParticleSpeed - The maximum possible velocity of a particle.
    * @default
    */
    this.maxParticleSpeed = new Phaser.Point(100, 100);

    /**
    * @property {number} minParticleScale - The minimum possible scale of a particle. This is applied to the X and Y axis. If you need to control each axis see minParticleScaleX.
    * @default
    */
    this.minParticleScale = 1;

    /**
    * @property {number} maxParticleScale - The maximum possible scale of a particle. This is applied to the X and Y axis. If you need to control each axis see maxParticleScaleX.
    * @default
    */
    this.maxParticleScale = 1;

    /**
    * @property {array} scaleData - An array of the calculated scale easing data applied to particles with scaleRates > 0.
    */
    this.scaleData = null;

    /**
    * @property {number} minRotation - The minimum possible angular velocity of a particle.
    * @default
    */
    this.minRotation = -360;

    /**
    * @property {number} maxRotation - The maximum possible angular velocity of a particle.
    * @default
    */
    this.maxRotation = 360;

    /**
    * @property {number} minParticleAlpha - The minimum possible alpha value of a particle.
    * @default
    */
    this.minParticleAlpha = 1;

    /**
    * @property {number} maxParticleAlpha - The maximum possible alpha value of a particle.
    * @default
    */
    this.maxParticleAlpha = 1;

    /**
    * @property {array} alphaData - An array of the calculated alpha easing data applied to particles with alphaRates > 0.
    */
    this.alphaData = null;

    /**
    * @property {number} gravity - Sets the `body.gravity.y` of each particle sprite to this value on launch.
    * @default
    */
    this.gravity = 100;

    /**
    * @property {any} particleClass - For emitting your own particle class types. They must extend Phaser.Particle.
    * @default
    */
    this.particleClass = Phaser.Particle;

    /**
    * @property {Phaser.Point} particleDrag - The X and Y drag component of particles launched from the emitter.
    */
    this.particleDrag = new Phaser.Point();

    /**
    * @property {number} angularDrag - The angular drag component of particles launched from the emitter if they are rotating.
    * @default
    */
    this.angularDrag = 0;

    /**
    * @property {number} frequency - How often a particle is emitted in ms (if emitter is started with Explode === false).
    * @default
    */
    this.frequency = 100;

    /**
    * @property {number} lifespan - How long each particle lives once it is emitted in ms. Default is 2 seconds. Set lifespan to 'zero' for particles to live forever.
    * @default
    */
    this.lifespan = 2000;

    /**
    * @property {Phaser.Point} bounce - How much each particle should bounce on each axis. 1 = full bounce, 0 = no bounce.
    */
    this.bounce = new Phaser.Point();

    /**
    * @property {boolean} on - Determines whether the emitter is currently emitting particles. It is totally safe to directly toggle this.
    * @default
    */
    this.on = false;

    /**
    * @property {Phaser.Point} particleAnchor - When a particle is created its anchor will be set to match this Point object (defaults to x/y: 0.5 to aid in rotation)
    * @default
    */
    this.particleAnchor = new Phaser.Point(0.5, 0.5);

    /**
    * @property {number} blendMode - The blendMode as set on the particle when emitted from the Emitter. Defaults to NORMAL. Needs browser capable of supporting canvas blend-modes (most not available in WebGL)
    * @default
    */
    this.blendMode = Phaser.blendModes.NORMAL;

    /**
    * The point the particles are emitted from.
    * Emitter.x and Emitter.y control the containers location, which updates all current particles
    * Emitter.emitX and Emitter.emitY control the emission location relative to the x/y position.
    * @property {number} emitX
    */
    this.emitX = x;

    /**
    * The point the particles are emitted from.
    * Emitter.x and Emitter.y control the containers location, which updates all current particles
    * Emitter.emitX and Emitter.emitY control the emission location relative to the x/y position.
    * @property {number} emitY
    */
    this.emitY = y;

    /**
    * @property {boolean} autoScale - When a new Particle is emitted this controls if it will automatically scale in size. Use Emitter.setScale to configure.
    */
    this.autoScale = false;

    /**
    * @property {boolean} autoAlpha - When a new Particle is emitted this controls if it will automatically change alpha. Use Emitter.setAlpha to configure.
    */
    this.autoAlpha = false;

    /**
    * @property {boolean} particleBringToTop - If this is `true` then when the Particle is emitted it will be bought to the top of the Emitters display list.
    * @default
    */
    this.particleBringToTop = false;

    /**
    * @property {boolean} particleSendToBack - If this is `true` then when the Particle is emitted it will be sent to the back of the Emitters display list.
    * @default
    */
    this.particleSendToBack = false;

    /**
    * @property {Phaser.Point} _minParticleScale - Internal particle scale var.
    * @private
    */
    this._minParticleScale = new Phaser.Point(1, 1);

    /**
    * @property {Phaser.Point} _maxParticleScale - Internal particle scale var.
    * @private
    */
    this._maxParticleScale = new Phaser.Point(1, 1);

    /**
    * @property {number} _quantity - Internal helper for deciding how many particles to launch.
    * @private
    */
    this._quantity = 0;

    /**
    * @property {number} _timer - Internal helper for deciding when to launch particles or kill them.
    * @private
    */
    this._timer = 0;

    /**
    * @property {number} _counter - Internal counter for figuring out how many particles to launch.
    * @private
    */
    this._counter = 0;

    /**
    * @property {number} _flowQuantity - Internal counter for figuring out how many particles to launch per flow update.
    * @private
    */
    this._flowQuantity = 0;

    /**
    * @property {number} _flowTotal - Internal counter for figuring out how many particles to launch in total.
    * @private
    */
    this._flowTotal = 0;

    /**
    * @property {boolean} _explode - Internal helper for the style of particle emission (all at once, or one at a time).
    * @private
    */
    this._explode = true;

    /**
    * @property {any} _frames - Internal helper for the particle frame.
    * @private
    */
    this._frames = null;

};

Phaser.Particles.Arcade.Emitter.prototype = Object.create(Phaser.Group.prototype);
Phaser.Particles.Arcade.Emitter.prototype.constructor = Phaser.Particles.Arcade.Emitter;

/**
* Called automatically by the game loop, decides when to launch particles and when to "die".
* 
* @method Phaser.Particles.Arcade.Emitter#update
*/
Phaser.Particles.Arcade.Emitter.prototype.update = function () {

    if (this.on && this.game.time.time >= this._timer)
    {
        this._timer = this.game.time.time + this.frequency * this.game.time.slowMotion;

        if (this._flowTotal !== 0)
        {
            if (this._flowQuantity > 0)
            {
                for (var i = 0; i < this._flowQuantity; i++)
                {
                    if (this.emitParticle())
                    {
                        this._counter++;

                        if (this._flowTotal !== -1 && this._counter >= this._flowTotal)
                        {
                            this.on = false;
                            break;
                        }
                    }
                }
            }
            else
            {
                if (this.emitParticle())
                {
                    this._counter++;

                    if (this._flowTotal !== -1 && this._counter >= this._flowTotal)
                    {
                        this.on = false;
                    }
                }
            }
        }
        else
        {
            if (this.emitParticle())
            {
                this._counter++;

                if (this._quantity > 0 && this._counter >= this._quantity)
                {
                    this.on = false;
                }
            }
        }

    }

    var i = this.children.length;

    while (i--)
    {
        if (this.children[i].exists)
        {
            this.children[i].update();
        }
    }

};

/**
* This function generates a new set of particles for use by this emitter.
* The particles are stored internally waiting to be emitted via Emitter.start.
*
* @method Phaser.Particles.Arcade.Emitter#makeParticles
* @param {array|string} keys - A string or an array of strings that the particle sprites will use as their texture. If an array one is picked at random.
* @param {array|number} [frames=0] - A frame number, or array of frames that the sprite will use. If an array one is picked at random.
* @param {number} [quantity] - The number of particles to generate. If not given it will use the value of Emitter.maxParticles. If the value is greater than Emitter.maxParticles it will use Emitter.maxParticles as the quantity.
* @param {boolean} [collide=false] - If you want the particles to be able to collide with other Arcade Physics bodies then set this to true.
* @param {boolean} [collideWorldBounds=false] - A particle can be set to collide against the World bounds automatically and rebound back into the World if this is set to true. Otherwise it will leave the World.
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.makeParticles = function (keys, frames, quantity, collide, collideWorldBounds) {

    if (frames === undefined) { frames = 0; }
    if (quantity === undefined) { quantity = this.maxParticles; }
    if (collide === undefined) { collide = false; }
    if (collideWorldBounds === undefined) { collideWorldBounds = false; }

    var particle;
    var i = 0;
    var rndKey = keys;
    var rndFrame = frames;
    this._frames = frames;

    if (quantity > this.maxParticles)
    {
        this.maxParticles = quantity;
    }

    while (i < quantity)
    {
        if (Array.isArray(keys))
        {
            rndKey = this.game.rnd.pick(keys);
        }

        if (Array.isArray(frames))
        {
            rndFrame = this.game.rnd.pick(frames);
        }

        particle = new this.particleClass(this.game, 0, 0, rndKey, rndFrame);

        this.game.physics.arcade.enable(particle, false);

        if (collide)
        {
            particle.body.checkCollision.any = true;
            particle.body.checkCollision.none = false;
        }
        else
        {
            particle.body.checkCollision.none = true;
        }

        particle.body.collideWorldBounds = collideWorldBounds;
        particle.body.skipQuadTree = true;

        particle.exists = false;
        particle.visible = false;
        particle.anchor.copyFrom(this.particleAnchor);

        this.add(particle);

        i++;
    }

    return this;

};

/**
* Call this function to turn off all the particles and the emitter.
*
* @method Phaser.Particles.Arcade.Emitter#kill
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.kill = function () {

    this.on = false;
    this.alive = false;
    this.exists = false;

    return this;

};

/**
* Handy for bringing game objects "back to life". Just sets alive and exists back to true.
*
* @method Phaser.Particles.Arcade.Emitter#revive
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.revive = function () {

    this.alive = true;
    this.exists = true;

    return this;

};

/**
* Call this function to emit the given quantity of particles at all once (an explosion)
* 
* @method Phaser.Particles.Arcade.Emitter#explode
* @param {number} [lifespan=0] - How long each particle lives once emitted in ms. 0 = forever.
* @param {number} [quantity=0] - How many particles to launch.
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.explode = function (lifespan, quantity) {

    this._flowTotal = 0;

    this.start(true, lifespan, 0, quantity, false);

    return this;

};

/**
* Call this function to start emitting a flow of particles at the given frequency.
* It will carry on going until the total given is reached.
* Each time the flow is run the quantity number of particles will be emitted together.
* If you set the total to be 20 and quantity to be 5 then flow will emit 4 times in total (4 x 5 = 20 total)
* If you set the total to be -1 then no quantity cap is used and it will keep emitting.
* 
* @method Phaser.Particles.Arcade.Emitter#flow
* @param {number} [lifespan=0] - How long each particle lives once emitted in ms. 0 = forever.
* @param {number} [frequency=250] - Frequency is how often to emit the particles, given in ms.
* @param {number} [quantity=1] - How many particles to launch each time the frequency is met. Can never be > Emitter.maxParticles.
* @param {number} [total=-1] - How many particles to launch in total. If -1 it will carry on indefinitely.
* @param {boolean} [immediate=true] - Should the flow start immediately (true) or wait until the first frequency event? (false)
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.flow = function (lifespan, frequency, quantity, total, immediate) {

    if (quantity === undefined || quantity === 0) { quantity = 1; }
    if (total === undefined) { total = -1; }
    if (immediate === undefined) { immediate = true; }

    if (quantity > this.maxParticles)
    {
        quantity = this.maxParticles;
    }

    this._counter = 0;
    this._flowQuantity = quantity;
    this._flowTotal = total;

    if (immediate)
    {
        this.start(true, lifespan, frequency, quantity);

        this._counter += quantity;
        this.on = true;
        this._timer = this.game.time.time + frequency * this.game.time.slowMotion;
    }
    else
    {
        this.start(false, lifespan, frequency, quantity);
    }

    return this;

};

/**
* Call this function to start emitting particles.
* 
* @method Phaser.Particles.Arcade.Emitter#start
* @param {boolean} [explode=true] - Whether the particles should all burst out at once (true) or at the frequency given (false).
* @param {number} [lifespan=0] - How long each particle lives once emitted in ms. 0 = forever.
* @param {number} [frequency=250] - Ignored if Explode is set to true. Frequency is how often to emit 1 particle. Value given in ms.
* @param {number} [quantity=0] - How many particles to launch. 0 = "all of the particles" which will keep emitting until Emitter.maxParticles is reached.
* @param {number} [forceQuantity=false] - If `true` and creating a particle flow, the quantity emitted will be forced to the be quantity given in this call. This can never exceed Emitter.maxParticles.
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.start = function (explode, lifespan, frequency, quantity, forceQuantity) {

    if (explode === undefined) { explode = true; }
    if (lifespan === undefined) { lifespan = 0; }
    if (frequency === undefined || frequency === null) { frequency = 250; }
    if (quantity === undefined) { quantity = 0; }
    if (forceQuantity === undefined) { forceQuantity = false; }

    if (quantity > this.maxParticles)
    {
        quantity = this.maxParticles;
    }

    this.revive();

    this.visible = true;

    this.lifespan = lifespan;
    this.frequency = frequency;

    if (explode || forceQuantity)
    {
        for (var i = 0; i < quantity; i++)
        {
            this.emitParticle();
        }
    }
    else
    {
        this.on = true;
        this._quantity = quantity;
        this._counter = 0;
        this._timer = this.game.time.time + frequency * this.game.time.slowMotion;
    }

    return this;

};

/**
* This function is used internally to emit the next particle in the queue.
*
* However it can also be called externally to emit a particle.
*
* When called externally you can use the arguments to override any defaults the Emitter has set.
*
* @method Phaser.Particles.Arcade.Emitter#emitParticle
* @param {number} [x] - The x coordinate to emit the particle from. If `null` or `undefined` it will use `Emitter.emitX` or if the Emitter has a width > 1 a random value between `Emitter.left` and `Emitter.right`.
* @param {number} [y] - The y coordinate to emit the particle from. If `null` or `undefined` it will use `Emitter.emitY` or if the Emitter has a height > 1 a random value between `Emitter.top` and `Emitter.bottom`.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} [key] - This is the image or texture used by the Particle during rendering. It can be a string which is a reference to the Cache Image entry, or an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
* @param {string|number} [frame] - If this Particle is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
* @return {boolean} True if a particle was emitted, otherwise false.
*/
Phaser.Particles.Arcade.Emitter.prototype.emitParticle = function (x, y, key, frame) {

    if (x === undefined) { x = null; }
    if (y === undefined) { y = null; }

    var particle = this.getFirstExists(false);

    if (particle === null)
    {
        return false;
    }

    var rnd = this.game.rnd;

    if (key !== undefined && frame !== undefined)
    {
        particle.loadTexture(key, frame);
    }
    else if (key !== undefined)
    {
        particle.loadTexture(key);
    }

    var emitX = this.emitX;
    var emitY = this.emitY;

    if (x !== null)
    {
        emitX = x;
    }
    else if (this.width > 1)
    {
        emitX = rnd.between(this.left, this.right);
    }

    if (y !== null)
    {
        emitY = y;
    }
    else if (this.height > 1)
    {
        emitY = rnd.between(this.top, this.bottom);
    }

    particle.reset(emitX, emitY);

    particle.angle = 0;
    particle.lifespan = this.lifespan;

    if (this.particleBringToTop)
    {
        this.bringToTop(particle);
    }
    else if (this.particleSendToBack)
    {
        this.sendToBack(particle);
    }

    if (this.autoScale)
    {
        particle.setScaleData(this.scaleData);
    }
    else if (this.minParticleScale !== 1 || this.maxParticleScale !== 1)
    {
        particle.scale.set(rnd.realInRange(this.minParticleScale, this.maxParticleScale));
    }
    else if ((this._minParticleScale.x !== this._maxParticleScale.x) || (this._minParticleScale.y !== this._maxParticleScale.y))
    {
        particle.scale.set(rnd.realInRange(this._minParticleScale.x, this._maxParticleScale.x), rnd.realInRange(this._minParticleScale.y, this._maxParticleScale.y));
    }

    if (frame === undefined)
    {
        if (Array.isArray(this._frames))
        {
            particle.frame = this.game.rnd.pick(this._frames);
        }
        else
        {
            particle.frame = this._frames;
        }
    }

    if (this.autoAlpha)
    {
        particle.setAlphaData(this.alphaData);
    }
    else
    {
        particle.alpha = rnd.realInRange(this.minParticleAlpha, this.maxParticleAlpha);
    }

    particle.blendMode = this.blendMode;

    var body = particle.body;

    body.updateBounds();

    body.bounce.copyFrom(this.bounce);
    body.drag.copyFrom(this.particleDrag);

    body.velocity.x = rnd.between(this.minParticleSpeed.x, this.maxParticleSpeed.x);
    body.velocity.y = rnd.between(this.minParticleSpeed.y, this.maxParticleSpeed.y);
    body.angularVelocity = rnd.between(this.minRotation, this.maxRotation);

    body.gravity.y = this.gravity;
    body.angularDrag = this.angularDrag;

    particle.onEmit();

    return true;

};

/**
* Destroys this Emitter, all associated child Particles and then removes itself from the Particle Manager.
* 
* @method Phaser.Particles.Arcade.Emitter#destroy
*/
Phaser.Particles.Arcade.Emitter.prototype.destroy = function () {

    this.game.particles.remove(this);

    Phaser.Group.prototype.destroy.call(this, true, false);

};

/**
* A more compact way of setting the width and height of the emitter.
* 
* @method Phaser.Particles.Arcade.Emitter#setSize
* @param {number} width - The desired width of the emitter (particles are spawned randomly within these dimensions).
* @param {number} height - The desired height of the emitter.
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.setSize = function (width, height) {

    this.area.width = width;
    this.area.height = height;

    return this;

};

/**
* A more compact way of setting the X velocity range of the emitter.
* @method Phaser.Particles.Arcade.Emitter#setXSpeed
* @param {number} [min=0] - The minimum value for this range.
* @param {number} [max=0] - The maximum value for this range.
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.setXSpeed = function (min, max) {

    min = min || 0;
    max = max || 0;

    this.minParticleSpeed.x = min;
    this.maxParticleSpeed.x = max;

    return this;

};

/**
* A more compact way of setting the Y velocity range of the emitter.
* @method Phaser.Particles.Arcade.Emitter#setYSpeed
* @param {number} [min=0] - The minimum value for this range.
* @param {number} [max=0] - The maximum value for this range.
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.setYSpeed = function (min, max) {

    min = min || 0;
    max = max || 0;

    this.minParticleSpeed.y = min;
    this.maxParticleSpeed.y = max;

    return this;

};

/**
* A more compact way of setting the angular velocity constraints of the particles.
*
* @method Phaser.Particles.Arcade.Emitter#setRotation
* @param {number} [min=0] - The minimum value for this range.
* @param {number} [max=0] - The maximum value for this range.
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.setRotation = function (min, max) {

    min = min || 0;
    max = max || 0;

    this.minRotation = min;
    this.maxRotation = max;

    return this;

};

/**
* A more compact way of setting the alpha constraints of the particles.
* The rate parameter, if set to a value above zero, lets you set the speed at which the Particle change in alpha from min to max.
* If rate is zero, which is the default, the particle won't change alpha - instead it will pick a random alpha between min and max on emit.
*
* @method Phaser.Particles.Arcade.Emitter#setAlpha
* @param {number} [min=1] - The minimum value for this range.
* @param {number} [max=1] - The maximum value for this range.
* @param {number} [rate=0] - The rate (in ms) at which the particles will change in alpha from min to max, or set to zero to pick a random alpha between the two.
* @param {function} [ease=Phaser.Easing.Linear.None] - If you've set a rate > 0 this is the easing formula applied between the min and max values.
* @param {boolean} [yoyo=false] - If you've set a rate > 0 you can set if the ease will yoyo or not (i.e. ease back to its original values)
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.setAlpha = function (min, max, rate, ease, yoyo) {

    if (min === undefined) { min = 1; }
    if (max === undefined) { max = 1; }
    if (rate === undefined) { rate = 0; }
    if (ease === undefined) { ease = Phaser.Easing.Linear.None; }
    if (yoyo === undefined) { yoyo = false; }

    this.minParticleAlpha = min;
    this.maxParticleAlpha = max;
    this.autoAlpha = false;

    if (rate > 0 && min !== max)
    {
        var tweenData = { v: min };
        var tween = this.game.make.tween(tweenData).to( { v: max }, rate, ease);
        tween.yoyo(yoyo);

        this.alphaData = tween.generateData(60);

        //  Inverse it so we don't have to do array length look-ups in Particle update loops
        this.alphaData.reverse();
        this.autoAlpha = true;
    }

    return this;

};

/**
* A more compact way of setting the scale constraints of the particles.
* The rate parameter, if set to a value above zero, lets you set the speed and ease which the Particle uses to change in scale from min to max across both axis.
* If rate is zero, which is the default, the particle won't change scale during update, instead it will pick a random scale between min and max on emit.
*
* @method Phaser.Particles.Arcade.Emitter#setScale
* @param {number} [minX=1] - The minimum value of Particle.scale.x.
* @param {number} [maxX=1] - The maximum value of Particle.scale.x.
* @param {number} [minY=1] - The minimum value of Particle.scale.y.
* @param {number} [maxY=1] - The maximum value of Particle.scale.y.
* @param {number} [rate=0] - The rate (in ms) at which the particles will change in scale from min to max, or set to zero to pick a random size between the two.
* @param {function} [ease=Phaser.Easing.Linear.None] - If you've set a rate > 0 this is the easing formula applied between the min and max values.
* @param {boolean} [yoyo=false] - If you've set a rate > 0 you can set if the ease will yoyo or not (i.e. ease back to its original values)
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.setScale = function (minX, maxX, minY, maxY, rate, ease, yoyo) {

    if (minX === undefined) { minX = 1; }
    if (maxX === undefined) { maxX = 1; }
    if (minY === undefined) { minY = 1; }
    if (maxY === undefined) { maxY = 1; }
    if (rate === undefined) { rate = 0; }
    if (ease === undefined) { ease = Phaser.Easing.Linear.None; }
    if (yoyo === undefined) { yoyo = false; }

    //  Reset these
    this.minParticleScale = 1;
    this.maxParticleScale = 1;

    this._minParticleScale.set(minX, minY);
    this._maxParticleScale.set(maxX, maxY);

    this.autoScale = false;

    if (rate > 0 && ((minX !== maxX) || (minY !== maxY)))
    {
        var tweenData = { x: minX, y: minY };
        var tween = this.game.make.tween(tweenData).to( { x: maxX, y: maxY }, rate, ease);
        tween.yoyo(yoyo);

        this.scaleData = tween.generateData(60);

        //  Inverse it so we don't have to do array length look-ups in Particle update loops
        this.scaleData.reverse();
        this.autoScale = true;
    }

    return this;

};

/**
* Change the emitters center to match the center of any object with a `center` property, such as a Sprite.
* If the object doesn't have a center property it will be set to object.x + object.width / 2
*
* @method Phaser.Particles.Arcade.Emitter#at
* @param {object|Phaser.Sprite|Phaser.Image|Phaser.TileSprite|Phaser.Text|PIXI.DisplayObject} object - The object that you wish to match the center with.
* @return {Phaser.Particles.Arcade.Emitter} This Emitter instance.
*/
Phaser.Particles.Arcade.Emitter.prototype.at = function (object) {

    if (object.center)
    {
        this.emitX = object.center.x;
        this.emitY = object.center.y;
    }
    else
    {
        this.emitX = object.world.x + (object.anchor.x * object.width);
        this.emitY = object.world.y + (object.anchor.y * object.height);
    }

    return this;

};

/**
* @name Phaser.Particles.Arcade.Emitter#width
* @property {number} width - Gets or sets the width of the Emitter. This is the region in which a particle can be emitted.
*/
Object.defineProperty(Phaser.Particles.Arcade.Emitter.prototype, "width", {

    get: function () {
        return this.area.width;
    },

    set: function (value) {
        this.area.width = value;
    }

});

/**
* @name Phaser.Particles.Arcade.Emitter#height
* @property {number} height - Gets or sets the height of the Emitter. This is the region in which a particle can be emitted.
*/
Object.defineProperty(Phaser.Particles.Arcade.Emitter.prototype, "height", {

    get: function () {
        return this.area.height;
    },

    set: function (value) {
        this.area.height = value;
    }

});

/**
* @name Phaser.Particles.Arcade.Emitter#x
* @property {number} x - Gets or sets the x position of the Emitter.
*/
Object.defineProperty(Phaser.Particles.Arcade.Emitter.prototype, "x", {

    get: function () {
        return this.emitX;
    },

    set: function (value) {
        this.emitX = value;
    }

});

/**
* @name Phaser.Particles.Arcade.Emitter#y
* @property {number} y - Gets or sets the y position of the Emitter.
*/
Object.defineProperty(Phaser.Particles.Arcade.Emitter.prototype, "y", {

    get: function () {
        return this.emitY;
    },

    set: function (value) {
        this.emitY = value;
    }

});

/**
* @name Phaser.Particles.Arcade.Emitter#left
* @property {number} left - Gets the left position of the Emitter.
* @readonly
*/
Object.defineProperty(Phaser.Particles.Arcade.Emitter.prototype, "left", {

    get: function () {
        return Math.floor(this.x - (this.area.width / 2));
    }

});

/**
* @name Phaser.Particles.Arcade.Emitter#right
* @property {number} right - Gets the right position of the Emitter.
* @readonly
*/
Object.defineProperty(Phaser.Particles.Arcade.Emitter.prototype, "right", {

    get: function () {
        return Math.floor(this.x + (this.area.width / 2));
    }

});

/**
* @name Phaser.Particles.Arcade.Emitter#top
* @property {number} top - Gets the top position of the Emitter.
* @readonly
*/
Object.defineProperty(Phaser.Particles.Arcade.Emitter.prototype, "top", {

    get: function () {
        return Math.floor(this.y - (this.area.height / 2));
    }

});

/**
* @name Phaser.Particles.Arcade.Emitter#bottom
* @property {number} bottom - Gets the bottom position of the Emitter.
* @readonly
*/
Object.defineProperty(Phaser.Particles.Arcade.Emitter.prototype, "bottom", {

    get: function () {
        return Math.floor(this.y + (this.area.height / 2));
    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Weapon Plugin provides the ability to easily create a bullet pool and manager.
*
* Weapons fire Phaser.Bullet objects, which are essentially Sprites with a few extra properties.
* The Bullets are enabled for Arcade Physics. They do not currently work with P2 Physics.
*
* The Bullets are created inside of `Weapon.bullets`, which is a Phaser.Group instance. Anything you
* can usually do with a Group, such as move it around the display list, iterate it, etc can be done
* to the bullets Group too.
*
* Bullets can have textures and even animations. You can control the speed at which they are fired,
* the firing rate, the firing angle, and even set things like gravity for them.
*
* A small example, assumed to be running from within a Phaser.State create method.
*
* `var weapon = this.add.weapon(10, 'bullet');`
* `weapon.fireFrom.set(300, 300);`
* `this.input.onDown.add(weapon.fire, this);`
*
* @class Phaser.Weapon
* @constructor
* @param {Phaser.Game} game - A reference to the current Phaser.Game instance.
* @param {Phaser.PluginManager} parent - The Phaser Plugin Manager which looks after this plugin.
*/
Phaser.Weapon = function (game, parent) {

    Phaser.Plugin.call(this, game, parent);

    /**
     * This is the Phaser.Group that contains all of the bullets managed by this plugin.
     * @type {Phaser.Group}
     */
    this.bullets = null;

    /**
     * Should the bullet pool run out of bullets (i.e. they are all in flight) then this
     * boolean controls if the Group will create a brand new bullet object or not.
     * @type {boolean}
     */
    this.autoExpandBulletsGroup = false;

    /**
     * Will this weapon auto fire? If set to true then a new bullet will be fired
     * based on the `fireRate` value.
     * @type {boolean}
     */
    this.autofire = false;

    /**
     * The total number of bullets this Weapon has fired so far.
     * You can limit the number of shots allowed (via `fireLimit`), and reset
     * this total via `Weapon.resetShots`.
     * @type {number}
     */
    this.shots = 0;

    /**
     * The maximum number of shots that this Weapon is allowed to fire before it stops.
     * When the limit is his the `Weapon.onFireLimit` Signal is dispatched.
     * You can reset the shot counter via `Weapon.resetShots`.
     * @type {number}
     */
    this.fireLimit = 0;

    /**
     * The rate at which this Weapon can fire. The value is given in milliseconds.
     * @type {number}
     */
    this.fireRate = 100;

    /**
     * This is a modifier that is added to the `fireRate` each update to add variety
     * to the firing rate of the Weapon. The value is given in milliseconds.
     * If you've a `fireRate` of 200 and a `fireRateVariance` of 50 then the actual
     * firing rate of the Weapon will be between 150 and 250.
     * @type {number}
     */
    this.fireRateVariance = 0;

    /**
     * This is a Rectangle from within which the bullets are fired. By default it's a 1x1
     * rectangle, the equivalent of a Point. But you can change the width and height, and if
     * larger than 1x1 it'll pick a random point within the rectangle to launch the bullet from.
     * @type {Phaser.Rectangle}
     */
    this.fireFrom = new Phaser.Rectangle(0, 0, 1, 1);

    /**
     * The angle at which the bullets are fired. This can be a const such as Phaser.ANGLE_UP
     * or it can be any number from 0 to 360 inclusive, where 0 degrees is to the right.
     * @type {integer}
     */
    this.fireAngle = Phaser.ANGLE_UP;

    /**
     * When a Bullet is fired it can optionally inherit the velocity of the `trackedSprite` if set.
     * @type {boolean}
     */
    this.bulletInheritSpriteSpeed = false;

    /**
     * The string based name of the animation that the Bullet will be given on launch.
     * This is set via `Weapon.addBulletAnimation`.
     * @type {string}
     */
    this.bulletAnimation = '';

    /**
     * If you've added a set of frames via `Weapon.setBulletFrames` then you can optionally
     * chose for each Bullet fired to pick a random frame from the set.
     * @type {boolean}
     */
    this.bulletFrameRandom = false;

    /**
     * If you've added a set of frames via `Weapon.setBulletFrames` then you can optionally
     * chose for each Bullet fired to use the next frame in the set. The frame index is then
     * advanced one frame until it reaches the end of the set, then it starts from the start
     * again. Cycling frames like this allows you to create varied bullet effects via
     * sprite sheets.
     * @type {boolean}
     */
    this.bulletFrameCycle = false;

    /**
     * Should the Bullets wrap around the world bounds? This automatically calls
     * `World.wrap` on the Bullet each frame. See the docs for that method for details.
     * @type {boolean}
     */
    this.bulletWorldWrap = false;

    /**
     * If `bulletWorldWrap` is true then you can provide an optional padding value with this
     * property. It's added to the calculations determining when the Bullet should wrap around
     * the world or not. The value is given in pixels.
     * @type {integer}
     */
    this.bulletWorldWrapPadding = 0;

    /**
     * An optional angle offset applied to the Bullets when they are launched.
     * This is useful if for example your bullet sprites have been drawn facing up, instead of
     * to the right, and you want to fire them at an angle. In which case you can set the
     * angle offset to be 90 and they'll be properly rotated when fired.
     * @type {number}
     */
    this.bulletAngleOffset = 0;

    /**
     * This is a variance added to the angle of Bullets when they are fired.
     * If you fire from an angle of 90 and have a `bulletAngleVariance` of 20 then the actual
     * angle of the Bullets will be between 70 and 110 degrees. This is a quick way to add a
     * great 'spread' effect to a Weapon.
     * @type {number}
     */
    this.bulletAngleVariance = 0;

    /**
     * The speed at which the bullets are fired. This value is given in pixels per second, and
     * is used to set the starting velocity of the bullets.
     * @type {number}
     */
    this.bulletSpeed = 200;

    /**
     * This is a variance added to the speed of Bullets when they are fired.
     * If bullets have a `bulletSpeed` value of 200, and a `bulletSpeedVariance` of 50
     * then the actual speed of the Bullets will be between 150 and 250 pixels per second.
     * @type {number}
     */
    this.bulletSpeedVariance = 0;

    /**
     * If you've set `bulletKillType` to `Phaser.Weapon.KILL_LIFESPAN` this controls the amount
     * of lifespan the Bullets have set on launch. The value is given in milliseconds.
     * When a Bullet hits its lifespan limit it will be automatically killed.
     * @type {number}
     */
    this.bulletLifespan = 0;

    /**
     * If you've set `bulletKillType` to `Phaser.Weapon.KILL_DISTANCE` this controls the distance
     * the Bullet can travel before it is automatically killed. The distance is given in pixels.
     * @type {number}
     */
    this.bulletKillDistance = 0;

    /**
     * This is the amount of gravity added to the Bullets physics body when fired.
     * Gravity is expressed in pixels / second / second.
     * @type {Phaser.Point}
     */
    this.bulletGravity = new Phaser.Point(0, 0);

    /**
     * Bullets can optionally adjust their rotation in-flight to match their velocity.
     * This can create the effect of a bullet 'pointing' to the path it is following, for example
     * an arrow being fired from a bow, and works especially well when added to `bulletGravity`.
     * @type {boolean}
     */
    this.bulletRotateToVelocity = false;

    /**
     * The Texture Key that the Bullets use when rendering.
     * Changing this has no effect on bullets in-flight, only on newly spawned bullets.
     * @type {string}
     */
    this.bulletKey = '';

    /**
     * The Texture Frame that the Bullets use when rendering.
     * Changing this has no effect on bullets in-flight, only on newly spawned bullets.
     * @type {string|integer}
     */
    this.bulletFrame = '';

    /**
     * Private var that holds the public `bulletClass` property.
     * @type {object}
     * @private
     */
    this._bulletClass = Phaser.Bullet;

    /**
     * Private var that holds the public `bulletCollideWorldBounds` property.
     * @type {boolean}
     * @private
     */
    this._bulletCollideWorldBounds = false;

    /**
     * Private var that holds the public `bulletKillType` property.
     * @type {integer}
     * @private
     */
    this._bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;

    /**
     * Holds internal data about custom bullet body sizes.
     *
     * @type {Object}
     * @private
     */
    this._data = {
        customBody: false,
        width: 0,
        height: 0,
        offsetX: 0,
        offsetY: 0
    };

    /**
     * This Rectangle defines the bounds that are used when determining if a Bullet should be killed or not.
     * It's used in combination with `Weapon.bulletKillType` when that is set to either `Phaser.Weapon.KILL_WEAPON_BOUNDS`
     * or `Phaser.Weapon.KILL_STATIC_BOUNDS`. If you are not using either of these kill types then the bounds are ignored.
     * If you are tracking a Sprite or Point then the bounds are centered on that object every frame.
     *
     * @type {Phaser.Rectangle}
     */
    this.bounds = new Phaser.Rectangle();

    /**
     * The Rectangle used to calculate the bullet bounds from.
     *
     * @type {Phaser.Rectangle}
     * @private
     */
    this.bulletBounds = game.world.bounds;

    /**
     * This array stores the frames added via `Weapon.setBulletFrames`.
     *
     * @type {Array}
     * @protected
     */
    this.bulletFrames = [];

    /**
     * The index of the frame within `Weapon.bulletFrames` that is currently being used.
     * This value is only used if `Weapon.bulletFrameCycle` is set to `true`.
     * @type {number}
     * @private
     */
    this.bulletFrameIndex = 0;

    /**
     * An internal object that stores the animation data added via `Weapon.addBulletAnimation`.
     * @type {Object}
     * @private
     */
    this.anims = {};

    /**
     * The onFire Signal is dispatched each time `Weapon.fire` is called, and a Bullet is
     * _successfully_ launched. The callback is set two arguments: a reference to the bullet sprite itself,
     * and a reference to the Weapon that fired the bullet.
     *
     * @type {Phaser.Signal}
     */
    this.onFire = new Phaser.Signal();

    /**
     * The onKill Signal is dispatched each time a Bullet that is in-flight is killed. This can be the result
     * of leaving the Weapon bounds, an expiring lifespan, or exceeding a specified distance.
     * The callback is sent one argument: A reference to the bullet sprite itself.
     *
     * @type {Phaser.Signal}
     */
    this.onKill = new Phaser.Signal();

    /**
     * The onFireLimit Signal is dispatched if `Weapon.fireLimit` is > 0, and a bullet launch takes the number
     * of shots fired to equal the fire limit.
     * The callback is sent two arguments: A reference to the Weapon that hit the limit, and the value of
     * `Weapon.fireLimit`.
     *
     * @type {Phaser.Signal}
     */
    this.onFireLimit = new Phaser.Signal();

    /**
     * The Sprite currently being tracked by the Weapon, if any.
     * This is set via the `Weapon.trackSprite` method.
     *
     * @type {Phaser.Sprite|Object}
     */
    this.trackedSprite = null;

    /**
     * The Pointer currently being tracked by the Weapon, if any.
     * This is set via the `Weapon.trackPointer` method.
     *
     * @type {Phaser.Pointer}
     */
    this.trackedPointer = null;

    /**
     * If the Weapon is tracking a Sprite, should it also track the Sprites rotation?
     * This is useful for a game such as Asteroids, where you want the weapon to fire based
     * on the sprites rotation.
     *
     * @type {boolean}
     */
    this.trackRotation = false;

    /**
     * The Track Offset is a Point object that allows you to specify a pixel offset that bullets use
     * when launching from a tracked Sprite or Pointer. For example if you've got a bullet that is 2x2 pixels
     * in size, but you're tracking a Sprite that is 32x32, then you can set `trackOffset.x = 16` to have
     * the bullet launched from the center of the Sprite.
     *
     * @type {Phaser.Point}
     */
    this.trackOffset = new Phaser.Point();

    /**
     * Internal firing rate time tracking variable.
     *
     * @type {number}
     * @private
     */
    this._nextFire = 0;

    /**
     * Internal firing rotation tracking point.
     *
     * @type {Phaser.Point}
     * @private
     */
    this._rotatedPoint = new Phaser.Point();

};

Phaser.Weapon.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Weapon.prototype.constructor = Phaser.Weapon;

/**
* A `bulletKillType` constant that stops the bullets from ever being destroyed automatically.
* @constant
* @type {integer}
*/
Phaser.Weapon.KILL_NEVER = 0;

/**
* A `bulletKillType` constant that automatically kills the bullets when their `bulletLifespan` expires.
* @constant
* @type {integer}
*/
Phaser.Weapon.KILL_LIFESPAN = 1;

/**
* A `bulletKillType` constant that automatically kills the bullets after they
* exceed the `bulletDistance` from their original firing position.
* @constant
* @type {integer}
*/
Phaser.Weapon.KILL_DISTANCE = 2;

/**
* A `bulletKillType` constant that automatically kills the bullets when they leave the `Weapon.bounds` rectangle.
* @constant
* @type {integer}
*/
Phaser.Weapon.KILL_WEAPON_BOUNDS = 3;

/**
* A `bulletKillType` constant that automatically kills the bullets when they leave the `Camera.bounds` rectangle.
* @constant
* @type {integer}
*/
Phaser.Weapon.KILL_CAMERA_BOUNDS = 4;

/**
* A `bulletKillType` constant that automatically kills the bullets when they leave the `World.bounds` rectangle.
* @constant
* @type {integer}
*/
Phaser.Weapon.KILL_WORLD_BOUNDS = 5;

/**
* A `bulletKillType` constant that automatically kills the bullets when they leave the `Weapon.bounds` rectangle.
* @constant
* @type {integer}
*/
Phaser.Weapon.KILL_STATIC_BOUNDS = 6;

/**
* This method performs two actions: First it will check to see if the `Weapon.bullets` Group exists or not,
* and if not it creates it, adding it the `group` given as the 4th argument.
*
* Then it will seed the bullet pool with the `quantity` number of Bullets, using the texture key and frame
* provided (if any).
*
* If for example you set the quantity to be 10, then this Weapon will only ever be able to have 10 bullets
* in-flight simultaneously. If you try to fire an 11th bullet then nothing will happen until one, or more, of
* the in-flight bullets have been killed, freeing them up for use by the Weapon again.
*
* If you do not wish to have a limit set, then pass in -1 as the quantity. In this instance the Weapon will
* keep increasing the size of the bullet pool as needed. It will never reduce the size of the pool however,
* so be careful it doesn't grow too large.
*
* You can either set the texture key and frame here, or via the `Weapon.bulletKey` and `Weapon.bulletFrame`
* properties. You can also animate bullets, or set them to use random frames. All Bullets belonging to a
* single Weapon instance must share the same texture key however.
*
* @method Phaser.Weapon#createBullets
* @param {integer} [quantity=1] - The quantity of bullets to seed the Weapon with. If -1 it will set the pool to automatically expand.
* @param {string} [key] - The Game.cache key of the image that this Sprite will use.
* @param {integer|string} [frame] - If the Sprite image contains multiple frames you can specify which one to use here.
* @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
* @return {Phaser.Weapon} This Weapon instance.
*/
Phaser.Weapon.prototype.createBullets = function (quantity, key, frame, group) {

    if (quantity === undefined) { quantity = 1; }
    if (group === undefined) { group = this.game.world; }

    if (!this.bullets)
    {
        this.bullets = this.game.add.physicsGroup(Phaser.Physics.ARCADE, group);
        this.bullets.classType = this._bulletClass;
    }

    if (quantity !== 0)
    {
        if (quantity === -1)
        {
            this.autoExpandBulletsGroup = true;
            quantity = 1;
        }

        this.bullets.createMultiple(quantity, key, frame);

        this.bullets.setAll('data.bulletManager', this);

        this.bulletKey = key;
        this.bulletFrame = frame;
    }

    return this;

};

/**
* Call a function on each in-flight bullet in this Weapon.
*
* See {@link Phaser.Group#forEachExists forEachExists} for more details.
*
* @method Phaser.Weapon#forEach
* @param {function} callback - The function that will be called for each applicable child. The child will be passed as the first argument.
* @param {object} callbackContext - The context in which the function should be called (usually 'this').
* @param {...any} [args=(none)] - Additional arguments to pass to the callback function, after the child item.
* @return {Phaser.Weapon} This Weapon instance.
*/
Phaser.Weapon.prototype.forEach = function (callback, callbackContext) {

    this.bullets.forEachExists(callback, callbackContext, arguments);

    return this;

};

/**
* Sets `Body.enable` to `false` on each bullet in this Weapon.
* This has the effect of stopping them in-flight should they be moving.
* It also stops them being able to be checked for collision.
*
* @method Phaser.Weapon#pauseAll
* @return {Phaser.Weapon} This Weapon instance.
*/
Phaser.Weapon.prototype.pauseAll = function () {

    this.bullets.setAll('body.enable', false);

    return this;

};

/**
* Sets `Body.enable` to `true` on each bullet in this Weapon.
* This has the effect of resuming their motion should they be in-flight.
* It also enables them for collision checks again.
*
* @method Phaser.Weapon#resumeAll
* @return {Phaser.Weapon} This Weapon instance.
*/
Phaser.Weapon.prototype.resumeAll = function () {

    this.bullets.setAll('body.enable', true);

    return this;

};

/**
* Calls `Bullet.kill` on every in-flight bullet in this Weapon.
* Also re-enables their physics bodies, should they have been disabled via `pauseAll`.
*
* @method Phaser.Weapon#killAll
* @return {Phaser.Weapon} This Weapon instance.
*/
Phaser.Weapon.prototype.killAll = function () {

    this.bullets.callAllExists('kill', true);

    this.bullets.setAll('body.enable', true);

    return this;

};

/**
* Resets the `Weapon.shots` counter back to zero. This is used when you've set
* `Weapon.fireLimit`, and have hit (or just wish to reset) your limit.
*
* @method Phaser.Weapon#resetShots
* @param {integer} [newLimit] - Optionally set a new `Weapon.fireLimit`.
* @return {Phaser.Weapon} This Weapon instance.
*/
Phaser.Weapon.prototype.resetShots = function (newLimit) {

    this.shots = 0;

    if (newLimit !== undefined)
    {
        this.fireLimit = newLimit;
    }

    return this;

};

/**
* Destroys this Weapon. It removes itself from the PluginManager, destroys
* the bullets Group, and nulls internal references.
*
* @method Phaser.Weapon#destroy
*/
Phaser.Weapon.prototype.destroy = function () {

    this.parent.remove(this, false);

    this.bullets.destroy();

    this.game = null;
    this.parent = null;
    this.active = false;
    this.visible = false;

};

/**
* Internal update method, called by the PluginManager.
*
* @method Phaser.Weapon#update
* @protected
*/
Phaser.Weapon.prototype.update = function () {

    if (this._bulletKillType === Phaser.Weapon.KILL_WEAPON_BOUNDS)
    {
        if (this.trackedSprite)
        {
            this.trackedSprite.updateTransform();
            this.bounds.centerOn(this.trackedSprite.worldPosition.x, this.trackedSprite.worldPosition.y);
        }
        else if (this.trackedPointer)
        {
            this.bounds.centerOn(this.trackedPointer.worldX, this.trackedPointer.worldY);
        }
    }

    if (this.autofire)
    {
        this.fire();
    }

};

/**
* Sets this Weapon to track the given Sprite, or any Object with a public `world` Point object.
* When a Weapon tracks a Sprite it will automatically update its `fireFrom` value to match the Sprites
* position within the Game World, adjusting the coordinates based on the offset arguments.
*
* This allows you to lock a Weapon to a Sprite, so that bullets are always launched from its location.
*
* Calling `trackSprite` will reset `Weapon.trackedPointer` to null, should it have been set, as you can
* only track _either_ a Sprite, or a Pointer, at once, but not both.
*
* @method Phaser.Weapon#trackSprite
* @param {Phaser.Sprite|Object} sprite - The Sprite to track the position of.
* @param {integer} [offsetX=0] - The horizontal offset from the Sprites position to be applied to the Weapon.
* @param {integer} [offsetY=0] - The vertical offset from the Sprites position to be applied to the Weapon.
* @param {boolean} [trackRotation=false] - Should the Weapon also track the Sprites rotation?
* @return {Phaser.Weapon} This Weapon instance.
*/
Phaser.Weapon.prototype.trackSprite = function (sprite, offsetX, offsetY, trackRotation) {

    if (offsetX === undefined) { offsetX = 0; }
    if (offsetY === undefined) { offsetY = 0; }
    if (trackRotation === undefined) { trackRotation = false; }

    this.trackedPointer = null;
    this.trackedSprite = sprite;
    this.trackRotation = trackRotation;

    this.trackOffset.set(offsetX, offsetY);

    return this;

};

/**
* Sets this Weapon to track the given Pointer.
* When a Weapon tracks a Pointer it will automatically update its `fireFrom` value to match the Pointers
* position within the Game World, adjusting the coordinates based on the offset arguments.
*
* This allows you to lock a Weapon to a Pointer, so that bullets are always launched from its location.
*
* Calling `trackPointer` will reset `Weapon.trackedSprite` to null, should it have been set, as you can
* only track _either_ a Pointer, or a Sprite, at once, but not both.
*
* @method Phaser.Weapon#trackPointer
* @param {Phaser.Pointer} [pointer] - The Pointer to track the position of. Defaults to `Input.activePointer` if not specified.
* @param {integer} [offsetX=0] - The horizontal offset from the Pointers position to be applied to the Weapon.
* @param {integer} [offsetY=0] - The vertical offset from the Pointers position to be applied to the Weapon.
* @return {Phaser.Weapon} This Weapon instance.
*/
Phaser.Weapon.prototype.trackPointer = function (pointer, offsetX, offsetY) {

    if (pointer === undefined) { pointer = this.game.input.activePointer; }
    if (offsetX === undefined) { offsetX = 0; }
    if (offsetY === undefined) { offsetY = 0; }

    this.trackedPointer = pointer;
    this.trackedSprite = null;
    this.trackRotation = false;

    this.trackOffset.set(offsetX, offsetY);

    return this;

};

/**
* Attempts to fire a single Bullet. If there are no more bullets available in the pool, and the pool cannot be extended,
* then this method returns `false`. It will also return false if not enough time has expired since the last time
* the Weapon was fired, as defined in the `Weapon.fireRate` property.
*
* Otherwise the first available bullet is selected and launched.
*
* The arguments are all optional, but allow you to control both where the bullet is launched from, and aimed at.
*
* If you don't provide any of the arguments then it uses those set via properties such as `Weapon.trackedSprite`,
* `Weapon.bulletAngle` and so on.
*
* When the bullet is launched it has its texture and frame updated, as required. The velocity of the bullet is
* calculated based on Weapon properties like `bulletSpeed`.
*
* @method Phaser.Weapon#fire
* @param {Phaser.Sprite|Phaser.Point|Object} [from] - Optionally fires the bullet **from** the `x` and `y` properties of this object. If set this overrides `Weapon.trackedSprite` or `trackedPointer`. Pass `null` to ignore it.
* @param {number} [x] - The x coordinate, in world space, to fire the bullet **towards**. If left as `undefined` the bullet direction is based on its angle.
* @param {number} [y] - The y coordinate, in world space, to fire the bullet **towards**. If left as `undefined` the bullet direction is based on its angle.
* @return {Phaser.Bullet} The fired bullet if successful, null otherwise.
*/
Phaser.Weapon.prototype.fire = function (from, x, y) {

    if (this.game.time.now < this._nextFire || (this.fireLimit > 0 && this.shots === this.fireLimit))
    {
        return false;
    }

    var speed = this.bulletSpeed;

    //  Apply +- speed variance
    if (this.bulletSpeedVariance !== 0)
    {
        speed += Phaser.Math.between(-this.bulletSpeedVariance, this.bulletSpeedVariance);
    }

    if (from)
    {
        if (this.fireFrom.width > 1)
        {
            this.fireFrom.centerOn(from.x, from.y);
        }
        else
        {
            this.fireFrom.x = from.x;
            this.fireFrom.y = from.y;
        }
    }
    else if (this.trackedSprite)
    {
        if (this.trackRotation)
        {
            this._rotatedPoint.set(this.trackedSprite.world.x + this.trackOffset.x, this.trackedSprite.world.y + this.trackOffset.y);
            this._rotatedPoint.rotate(this.trackedSprite.world.x, this.trackedSprite.world.y, this.trackedSprite.rotation);

            if (this.fireFrom.width > 1)
            {
                this.fireFrom.centerOn(this._rotatedPoint.x, this._rotatedPoint.y);
            }
            else
            {
                this.fireFrom.x = this._rotatedPoint.x;
                this.fireFrom.y = this._rotatedPoint.y;
            }
        }
        else
        {
            if (this.fireFrom.width > 1)
            {
                this.fireFrom.centerOn(this.trackedSprite.world.x + this.trackOffset.x, this.trackedSprite.world.y + this.trackOffset.y);
            }
            else
            {
                this.fireFrom.x = this.trackedSprite.world.x + this.trackOffset.x;
                this.fireFrom.y = this.trackedSprite.world.y + this.trackOffset.y;
            }
        }

        if (this.bulletInheritSpriteSpeed)
        {
            speed += this.trackedSprite.body.speed;
        }
    }
    else if (this.trackedPointer)
    {
        if (this.fireFrom.width > 1)
        {
            this.fireFrom.centerOn(this.trackedPointer.world.x + this.trackOffset.x, this.trackedPointer.world.y + this.trackOffset.y);
        }
        else
        {
            this.fireFrom.x = this.trackedPointer.world.x + this.trackOffset.x;
            this.fireFrom.y = this.trackedPointer.world.y + this.trackOffset.y;
        }
    }

    var fromX = (this.fireFrom.width > 1) ? this.fireFrom.randomX : this.fireFrom.x;
    var fromY = (this.fireFrom.height > 1) ? this.fireFrom.randomY : this.fireFrom.y;

    var angle = (this.trackRotation) ? this.trackedSprite.angle : this.fireAngle;

    //  The position (in world space) to fire the bullet towards, if set
    if (x !== undefined && y !== undefined)
    {
        angle = this.game.math.radToDeg(Math.atan2(y - fromY, x - fromX));
    }

    //  Apply +- angle variance
    if (this.bulletAngleVariance !== 0)
    {
        angle += Phaser.Math.between(-this.bulletAngleVariance, this.bulletAngleVariance);
    }

    var moveX = 0;
    var moveY = 0;

    //  Avoid sin/cos for right-angled shots
    if (angle === 0 || angle === 180)
    {
        moveX = Math.cos(this.game.math.degToRad(angle)) * speed;
    }
    else if (angle === 90 || angle === 270)
    {
        moveY = Math.sin(this.game.math.degToRad(angle)) * speed;
    }
    else
    {
        moveX = Math.cos(this.game.math.degToRad(angle)) * speed;
        moveY = Math.sin(this.game.math.degToRad(angle)) * speed;
    }

    var bullet = null;

    if (this.autoExpandBulletsGroup)
    {
        bullet = this.bullets.getFirstExists(false, true, fromX, fromY, this.bulletKey, this.bulletFrame);

        bullet.data.bulletManager = this;
    }
    else
    {
        bullet = this.bullets.getFirstExists(false);
    }

    if (bullet)
    {
        bullet.reset(fromX, fromY);

        bullet.data.fromX = fromX;
        bullet.data.fromY = fromY;
        bullet.data.killType = this.bulletKillType;
        bullet.data.killDistance = this.bulletKillDistance;
        bullet.data.rotateToVelocity = this.bulletRotateToVelocity;

        if (this.bulletKillType === Phaser.Weapon.KILL_LIFESPAN)
        {
            bullet.lifespan = this.bulletLifespan;
        }

        bullet.angle = angle + this.bulletAngleOffset;

        //  Frames and Animations
        if (this.bulletAnimation !== '')
        {
            if (bullet.animations.getAnimation(this.bulletAnimation) === null)
            {
                var anim = this.anims[this.bulletAnimation];

                bullet.animations.add(anim.name, anim.frames, anim.frameRate, anim.loop, anim.useNumericIndex);
            }

            bullet.animations.play(this.bulletAnimation);
        }
        else
        {
            if (this.bulletFrameCycle)
            {
                bullet.frame = this.bulletFrames[this.bulletFrameIndex];

                this.bulletFrameIndex++;

                if (this.bulletFrameIndex >= this.bulletFrames.length)
                {
                    this.bulletFrameIndex = 0;
                }
            }
            else if (this.bulletFrameRandom)
            {
                bullet.frame = this.bulletFrames[Math.floor(Math.random() * this.bulletFrames.length)];
            }
        }

        if (bullet.data.bodyDirty)
        {
            if (this._data.customBody)
            {
                bullet.body.setSize(this._data.width, this._data.height, this._data.offsetX, this._data.offsetY);
            }

            bullet.body.collideWorldBounds = this.bulletCollideWorldBounds;

            bullet.data.bodyDirty = false;
        }

        bullet.body.velocity.set(moveX, moveY);
        bullet.body.gravity.set(this.bulletGravity.x, this.bulletGravity.y);

        if (this.bulletSpeedVariance !== 0)
        {
            var rate = this.fireRate;

            rate += Phaser.Math.between(-this.fireRateVariance, this.fireRateVariance);

            if (rate < 0)
            {
                rate = 0;
            }

            this._nextFire = this.game.time.now + rate;
        }
        else
        {
            this._nextFire = this.game.time.now + this.fireRate;
        }

        this.shots++;

        this.onFire.dispatch(bullet, this, speed);

        if (this.fireLimit > 0 && this.shots === this.fireLimit)
        {
            this.onFireLimit.dispatch(this, this.fireLimit);
        }
    }
    return bullet;
};

/**
* Fires a bullet **at** the given Pointer. The bullet will be launched from the `Weapon.fireFrom` position,
* or from a Tracked Sprite or Pointer, if you have one set.
*
* @method Phaser.Weapon#fireAtPointer
* @param {Phaser.Pointer} [pointer] - The Pointer to fire the bullet towards.
* @return {Phaser.Bullet} The fired bullet if successful, null otherwise.
*/
Phaser.Weapon.prototype.fireAtPointer = function (pointer) {

    if (pointer === undefined) { pointer = this.game.input.activePointer; }

    return this.fire(null, pointer.worldX, pointer.worldY);

};

/**
* Fires a bullet **at** the given Sprite. The bullet will be launched from the `Weapon.fireFrom` position,
* or from a Tracked Sprite or Pointer, if you have one set.
*
* @method Phaser.Weapon#fireAtSprite
* @param {Phaser.Sprite} [sprite] - The Sprite to fire the bullet towards.
* @return {Phaser.Bullet} The fired bullet if successful, null otherwise.
*/
Phaser.Weapon.prototype.fireAtSprite = function (sprite) {

    return this.fire(null, sprite.world.x, sprite.world.y);

};

/**
* Fires a bullet **at** the given coordinates. The bullet will be launched from the `Weapon.fireFrom` position,
* or from a Tracked Sprite or Pointer, if you have one set.
*
* @method Phaser.Weapon#fireAtXY
* @param {number} [x] - The x coordinate, in world space, to fire the bullet towards.
* @param {number} [y] - The y coordinate, in world space, to fire the bullet towards.
* @return {Phaser.Bullet} The fired bullet if successful, null otherwise.
*/
Phaser.Weapon.prototype.fireAtXY = function (x, y) {

    return this.fire(null, x, y);

};

/**
* You can modify the size of the physics Body the Bullets use to be any dimension you need.
* This allows you to make it smaller, or larger, than the parent Sprite.
* You can also control the x and y offset of the Body. This is the position of the
* Body relative to the top-left of the Sprite _texture_.
*
* For example: If you have a Sprite with a texture that is 80x100 in size,
* and you want the physics body to be 32x32 pixels in the middle of the texture, you would do:
*
* `setSize(32, 32, 24, 34)`
*
* Where the first two parameters is the new Body size (32x32 pixels).
* 24 is the horizontal offset of the Body from the top-left of the Sprites texture, and 34
* is the vertical offset.
*
* @method Phaser.Weapon#setBulletBodyOffset
* @param {number} width - The width of the Body.
* @param {number} height - The height of the Body.
* @param {number} [offsetX] - The X offset of the Body from the top-left of the Sprites texture.
* @param {number} [offsetY] - The Y offset of the Body from the top-left of the Sprites texture.
* @return {Phaser.Weapon} The Weapon Plugin.
*/
Phaser.Weapon.prototype.setBulletBodyOffset = function (width, height, offsetX, offsetY) {

    if (offsetX === undefined) { offsetX = 0; }
    if (offsetY === undefined) { offsetY = 0; }

    this._data.customBody = true;
    this._data.width = width;
    this._data.height = height;
    this._data.offsetX = offsetX;
    this._data.offsetY = offsetY;

    //  Update all bullets in the pool
    this.bullets.callAll('body.setSize', 'body', width, height, offsetX, offsetY);
    this.bullets.setAll('data.bodyDirty', false);

    return this;

};

/**
* Sets the texture frames that the bullets can use when being launched.
*
* This is intended for use when you've got numeric based frames, such as those loaded via a Sprite Sheet.
*
* It works by calling `Phaser.ArrayUtils.numberArray` internally, using the min and max values
* provided. Then it sets the frame index to be zero.
*
* You can optionally set the cycle and random booleans, to allow bullets to cycle through the frames
* when they're fired, or pick one at random.
*
* @method Phaser.Weapon#setBulletFrames
* @param {integer} min - The minimum value the frame can be. Usually zero.
* @param {integer} max - The maximum value the frame can be.
* @param {boolean} [cycle=true] - Should the bullet frames cycle as they are fired?
* @param {boolean} [random=false] - Should the bullet frames be picked at random as they are fired?
* @return {Phaser.Weapon} The Weapon Plugin.
*/
Phaser.Weapon.prototype.setBulletFrames = function (min, max, cycle, random) {

    if (cycle === undefined) { cycle = true; }
    if (random === undefined) { random = false; }

    this.bulletFrames = Phaser.ArrayUtils.numberArray(min, max);

    this.bulletFrameIndex = 0;

    this.bulletFrameCycle = cycle;
    this.bulletFrameRandom = random;

    return this;

};

/**
* Adds a new animation under the given key. Optionally set the frames, frame rate and loop.
* The arguments are all the same as for `Animation.add`, and work in the same way.
*
* `Weapon.bulletAnimation` will be set to this animation after it's created. From that point on, all
* bullets fired will play using this animation. You can swap between animations by calling this method
* several times, and then just changing the `Weapon.bulletAnimation` property to the name of the animation
* you wish to play for the next launched bullet.
*
* If you wish to stop using animations at all, set `Weapon.bulletAnimation` to '' (an empty string).
*
* @method Phaser.Weapon#addBulletAnimation
* @param {string} name - The unique (within the Weapon instance) name for the animation, i.e. "fire", "blast".
* @param {Array} [frames=null] - An array of numbers/strings that correspond to the frames to add to this animation and in which order. e.g. [1, 2, 3] or ['run0', 'run1', run2]). If null then all frames will be used.
* @param {number} [frameRate=60] - The speed at which the animation should play. The speed is given in frames per second.
* @param {boolean} [loop=false] - Whether or not the animation is looped or just plays once.
* @param {boolean} [useNumericIndex=true] - Are the given frames using numeric indexes (default) or strings?
* @return {Phaser.Weapon} The Weapon Plugin.
*/
Phaser.Weapon.prototype.addBulletAnimation = function (name, frames, frameRate, loop, useNumericIndex) {

    this.anims[name] = {
        name: name,
        frames: frames,
        frameRate: frameRate,
        loop: loop,
        useNumericIndex: useNumericIndex
    };

    //  Add the animation to any existing bullets in the pool
    this.bullets.callAll('animations.add', 'animations', name, frames, frameRate, loop, useNumericIndex);

    this.bulletAnimation = name;

    return this;

};

/**
* Uses `Game.Debug` to draw some useful information about this Weapon, including the number of bullets
* both in-flight, and available. And optionally the physics debug bodies of the bullets.
*
* @method Phaser.Weapon#debug
* @param {integer} [x=16] - The coordinate, in screen space, at which to draw the Weapon debug data.
* @param {integer} [y=32] - The coordinate, in screen space, at which to draw the Weapon debug data.
* @param {boolean} [debugBodies=false] - Optionally draw the physics body of every bullet in-flight.
*/
Phaser.Weapon.prototype.debug = function (x, y, debugBodies) {

    if (x === undefined) { x = 16; }
    if (y === undefined) { y = 32; }
    if (debugBodies === undefined) { debugBodies = false; }

    this.game.debug.text("Weapon Plugin", x, y);
    this.game.debug.text("Bullets Alive: " + this.bullets.total + " - Total: " + this.bullets.length, x, y + 24);

    if (debugBodies)
    {
        this.bullets.forEachExists(this.game.debug.body, this.game.debug, 'rgba(255, 0, 255, 0.8)');
    }

};

/**
* The Class of the bullets that are launched by this Weapon. Defaults `Phaser.Bullet`, but can be
* overridden before calling `createBullets` and set to your own class type.
*
* @name Phaser.Weapon#bulletClass
* @property {Object} bulletClass
*/
Object.defineProperty(Phaser.Weapon.prototype, "bulletClass", {

    get: function () {

        return this._bulletClass;

    },

    set: function (classType) {

        this._bulletClass = classType;

        this.bullets.classType = this._bulletClass;

    }

});

/**
* This controls how the bullets will be killed. The default is `Phaser.Weapon.KILL_WORLD_BOUNDS`.
*
* There are 7 different "kill types" available:
*
* * `Phaser.Weapon.KILL_NEVER`
* The bullets are never destroyed by the Weapon. It's up to you to destroy them via your own code.
*
* * `Phaser.Weapon.KILL_LIFESPAN`
* The bullets are automatically killed when their `bulletLifespan` amount expires.
*
* * `Phaser.Weapon.KILL_DISTANCE`
* The bullets are automatically killed when they exceed `bulletDistance` pixels away from their original launch position.
*
* * `Phaser.Weapon.KILL_WEAPON_BOUNDS`
* The bullets are automatically killed when they no longer intersect with the `Weapon.bounds` rectangle.
*
* * `Phaser.Weapon.KILL_CAMERA_BOUNDS`
* The bullets are automatically killed when they no longer intersect with the `Camera.bounds` rectangle.
*
* * `Phaser.Weapon.KILL_WORLD_BOUNDS`
* The bullets are automatically killed when they no longer intersect with the `World.bounds` rectangle.
*
* * `Phaser.Weapon.KILL_STATIC_BOUNDS`
* The bullets are automatically killed when they no longer intersect with the `Weapon.bounds` rectangle.
* The difference between static bounds and weapon bounds, is that a static bounds will never be adjusted to
* match the position of a tracked sprite or pointer.
*
* @name Phaser.Weapon#bulletKillType
* @property {integer} bulletKillType
*/
Object.defineProperty(Phaser.Weapon.prototype, "bulletKillType", {

    get: function () {

        return this._bulletKillType;

    },

    set: function (type) {

        switch (type)
        {
            case Phaser.Weapon.KILL_STATIC_BOUNDS:
            case Phaser.Weapon.KILL_WEAPON_BOUNDS:
                this.bulletBounds = this.bounds;
                break;

            case Phaser.Weapon.KILL_CAMERA_BOUNDS:
                this.bulletBounds = this.game.camera.view;
                break;

            case Phaser.Weapon.KILL_WORLD_BOUNDS:
                this.bulletBounds = this.game.world.bounds;
                break;
        }

        this._bulletKillType = type;

    }

});

/**
* Should bullets collide with the World bounds or not?
*
* @name Phaser.Weapon#bulletCollideWorldBounds
* @property {boolean} bulletCollideWorldBounds
*/
Object.defineProperty(Phaser.Weapon.prototype, "bulletCollideWorldBounds", {

    get: function () {

        return this._bulletCollideWorldBounds;

    },

    set: function (value) {

        this._bulletCollideWorldBounds = value;

        this.bullets.setAll('body.collideWorldBounds', value);
        this.bullets.setAll('data.bodyDirty', false);

    }

});

/**
* The x coordinate from which bullets are fired. This is the same as `Weapon.fireFrom.x`, and
* can be overridden by the `Weapon.fire` arguments.
*
* @name Phaser.Weapon#x
* @property {number} x
*/
Object.defineProperty(Phaser.Weapon.prototype, "x", {

    get: function () {

        return this.fireFrom.x;

    },

    set: function (value) {

        this.fireFrom.x = value;
    }

});

/**
* The y coordinate from which bullets are fired. This is the same as `Weapon.fireFrom.y`, and
* can be overridden by the `Weapon.fire` arguments.
*
* @name Phaser.Weapon#y
* @property {number} y
*/
Object.defineProperty(Phaser.Weapon.prototype, "y", {

    get: function () {

        return this.fireFrom.y;

    },

    set: function (value) {

        this.fireFrom.y = value;
    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Create a new `Bullet` object. Bullets are used by the `Phaser.Weapon` class, and are normal Sprites,
* with a few extra properties in the data object to handle Weapon specific features.
* 
* @class Phaser.Bullet
* @constructor
* @extends Phaser.Sprite
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} x - The x coordinate (in world space) to position the Particle at.
* @param {number} y - The y coordinate (in world space) to position the Particle at.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Particle during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
* @param {string|number} frame - If this Particle is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
*/
Phaser.Bullet = function (game, x, y, key, frame) {

    Phaser.Sprite.call(this, game, x, y, key, frame);

    this.anchor.set(0.5);

    this.data = {
        bulletManager: null,
        fromX: 0,
        fromY: 0,
        bodyDirty: true,
        rotateToVelocity: false,
        killType: 0,
        killDistance: 0
    };

};

Phaser.Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Phaser.Bullet.prototype.constructor = Phaser.Bullet;

/**
* Kills the Bullet, freeing it up for re-use by the Weapon bullet pool.
* Also dispatches the `Weapon.onKill` signal.
*
* @method Phaser.Bullet#kill
* @memberof Phaser.Bullet
*/
Phaser.Bullet.prototype.kill = function () {

    this.alive = false;
    this.exists = false;
    this.visible = false;

    this.data.bulletManager.onKill.dispatch(this);

    return this;

};

/**
* Updates the Bullet, killing as required.
*
* @method Phaser.Bullet#kill
* @memberof Phaser.Bullet
*/
Phaser.Bullet.prototype.update = function () {

    if (!this.exists)
    {
        return;
    }

    if (this.data.killType > Phaser.Weapon.KILL_LIFESPAN)
    {
        if (this.data.killType === Phaser.Weapon.KILL_DISTANCE)
        {
            if (this.game.physics.arcade.distanceToXY(this, this.data.fromX, this.data.fromY, true) > this.data.killDistance)
            {
                this.kill();
            }
        }
        else
        {
            if (!this.data.bulletManager.bulletBounds.intersects(this))
            {
                this.kill();
            }
        }
    }
    
    if (this.data.rotateToVelocity)
    {
        this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
    }

    if (this.data.bulletManager.bulletWorldWrap)
    {
        this.game.world.wrap(this, this.data.bulletManager.bulletWorldWrapPadding);
    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Video object that takes a previously loaded Video from the Phaser Cache and handles playback of it.
*
* Alternatively it takes a getUserMedia feed from an active webcam and streams the contents of that to
* the Video instead (see `startMediaStream` method)
*
* The video can then be applied to a Sprite as a texture. If multiple Sprites share the same Video texture and playback
* changes (i.e. you pause the video, or seek to a new time) then this change will be seen across all Sprites simultaneously.
*
* Due to a bug in IE11 you cannot play a video texture to a Sprite in WebGL. For IE11 force Canvas mode.
*
* If you need each Sprite to be able to play a video fully independently then you will need one Video object per Sprite.
* Please understand the obvious performance implications of doing this, and the memory required to hold videos in RAM.
*
* On some mobile browsers such as iOS Safari, you cannot play a video until the user has explicitly touched the screen.
* This works in the same way as audio unlocking. Phaser will handle the touch unlocking for you, however unlike with audio
* it's worth noting that every single Video needs to be touch unlocked, not just the first one. You can use the `changeSource`
* method to try and work around this limitation, but see the method help for details.
*
* Small screen devices, especially iPod and iPhone will launch the video in its own native video player,
* outside of the Safari browser. There is no way to avoid this, it's a device imposed limitation.
*
* Note: On iOS if you need to detect when the user presses the 'Done' button (before the video ends)
* then you need to add your own event listener
*
* @class Phaser.Video
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {string|null} [key=null] - The key of the video file in the Phaser.Cache that this Video object will play. Set to `null` or leave undefined if you wish to use a webcam as the source. See `startMediaStream` to start webcam capture.
* @param {string|null} [url=null] - If the video hasn't been loaded then you can provide a full URL to the file here (make sure to set key to null)
*/
Phaser.Video = function (game, key, url) {

    if (key === undefined) { key = null; }
    if (url === undefined) { url = null; }

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * @property {string} key - The key of the Video in the Cache, if stored there. Will be `null` if this Video is using the webcam instead.
    * @default null
    */
    this.key = key;

    /**
    * @property {number} width - The width of the video in pixels.
    * @default
    */
    this.width = 0;

    /**
    * @property {number} height - The height of the video in pixels.
    * @default
    */
    this.height = 0;

    /**
    * @property {number} type - The const type of this object.
    * @default
    */
    this.type = Phaser.VIDEO;

    /**
    * @property {boolean} disableTextureUpload - If true this video will never send its image data to the GPU when its dirty flag is true. This only applies in WebGL.
    */
    this.disableTextureUpload = false;

    /**
    * @property {boolean} touchLocked - true if this video is currently locked awaiting a touch event. This happens on some mobile devices, such as iOS.
    * @default
    */
    this.touchLocked = false;

    /**
    * @property {Phaser.Signal} onPlay - This signal is dispatched when the Video starts to play. It sends 3 parameters: a reference to the Video object, if the video is set to loop or not and the playback rate.
    */
    this.onPlay = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onChangeSource - This signal is dispatched if the Video source is changed. It sends 3 parameters: a reference to the Video object and the new width and height of the new video source.
    */
    this.onChangeSource = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onComplete - This signal is dispatched when the Video completes playback, i.e. enters an 'ended' state. On iOS specifically it also fires if the user hits the 'Done' button at any point during playback. Videos set to loop will never dispatch this signal.
    */
    this.onComplete = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onAccess - This signal is dispatched if the user allows access to their webcam.
    */
    this.onAccess = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onError - This signal is dispatched if an error occurs either getting permission to use the webcam (for a Video Stream) or when trying to play back a video file.
    */
    this.onError = new Phaser.Signal();

    /**
    * This signal is dispatched if when asking for permission to use the webcam no response is given within a the Video.timeout limit.
    * This may be because the user has picked `Not now` in the permissions window, or there is a delay in establishing the LocalMediaStream.
    * @property {Phaser.Signal} onTimeout
    */
    this.onTimeout = new Phaser.Signal();

    /**
    * @property {integer} timeout - The amount of ms allowed to elapsed before the Video.onTimeout signal is dispatched while waiting for webcam access.
    * @default
    */
    this.timeout = 15000;

    /**
    * @property {integer} _timeOutID - setTimeout ID.
    * @private
    */
    this._timeOutID = null;

    /**
    * @property {HTMLVideoElement} video - The HTML Video Element that is added to the document.
    */
    this.video = null;

    /**
    * @property {MediaStream} videoStream - The Video Stream data. Only set if this Video is streaming from the webcam via `startMediaStream`.
    */
    this.videoStream = null;

    /**
    * @property {boolean} isStreaming - Is there a streaming video source? I.e. from a webcam.
    */
    this.isStreaming = false;

    /**
    * When starting playback of a video Phaser will monitor its readyState using a setTimeout call.
    * The setTimeout happens once every `Video.retryInterval` ms. It will carry on monitoring the video
    * state in this manner until the `retryLimit` is reached and then abort.
    * @property {integer} retryLimit
    * @default
    */
    this.retryLimit = 20;

    /**
    * @property {integer} retry - The current retry attempt.
    * @default
    */
    this.retry = 0;

    /**
    * @property {integer} retryInterval - The number of ms between each retry at monitoring the status of a downloading video.
    * @default
    */
    this.retryInterval = 500;

    /**
    * @property {integer} _retryID - The callback ID of the retry setTimeout.
    * @private
    */
    this._retryID = null;

    /**
    * @property {boolean} _codeMuted - Internal mute tracking var.
    * @private
    * @default
    */
    this._codeMuted = false;

    /**
    * @property {boolean} _muted - Internal mute tracking var.
    * @private
    * @default
    */
    this._muted = false;

    /**
    * @property {boolean} _codePaused - Internal paused tracking var.
    * @private
    * @default
    */
    this._codePaused = false;

    /**
    * @property {boolean} _paused - Internal paused tracking var.
    * @private
    * @default
    */
    this._paused = false;

    /**
    * @property {boolean} _pending - Internal var tracking play pending.
    * @private
    * @default
    */
    this._pending = false;

    /**
    * @property {boolean} _autoplay - Internal var tracking autoplay when changing source.
    * @private
    * @default
    */
    this._autoplay = false;

    /**
    * @property {function} _endCallback - The addEventListener ended function.
    * @private
    */
    this._endCallback = null;

    /**
    * @property {function} _playCallback - The addEventListener playing function.
    * @private
    */
    this._playCallback = null;

    if (key && this.game.cache.checkVideoKey(key))
    {
        var _video = this.game.cache.getVideo(key);

        if (_video.isBlob)
        {
            this.createVideoFromBlob(_video.data);
        }
        else
        {
            this.video = _video.data;
        }

        this.width = this.video.videoWidth;
        this.height = this.video.videoHeight;
    }
    else if (url)
    {
        this.createVideoFromURL(url, false);
    }

    /**
    * @property {PIXI.BaseTexture} baseTexture - The PIXI.BaseTexture.
    * @default
    */
    if (this.video && !url)
    {
        this.baseTexture = new PIXI.BaseTexture(this.video);
        this.baseTexture.forceLoaded(this.width, this.height);
    }
    else
    {
        this.baseTexture = new PIXI.BaseTexture(Phaser.Cache.DEFAULT.baseTexture.source);
        this.baseTexture.forceLoaded(this.width, this.height);
    }

    /**
    * @property {PIXI.Texture} texture - The PIXI.Texture.
    * @default
    */
    this.texture = new PIXI.Texture(this.baseTexture);

    /**
    * @property {Phaser.Frame} textureFrame - The Frame this video uses for rendering.
    * @default
    */
    this.textureFrame = new Phaser.Frame(0, 0, 0, this.width, this.height, 'video');

    this.texture.setFrame(this.textureFrame);

    this.texture.valid = false;

    if (key !== null && this.video)
    {
        this.texture.valid = this.video.canplay;
    }

    /**
    * A snapshot grabbed from the video. This is initially black. Populate it by calling Video.grab().
    * When called the BitmapData is updated with a grab taken from the current video playing or active video stream.
    * If Phaser has been compiled without BitmapData support this property will always be `null`.
    *
    * @property {Phaser.BitmapData} snapshot
    * @readOnly
    */
    this.snapshot = null;

    if (Phaser.BitmapData)
    {
        this.snapshot = new Phaser.BitmapData(this.game, '', this.width, this.height);
    }

    if (!this.game.device.cocoonJS && (this.game.device.iOS || this.game.device.android) || (window['PhaserGlobal'] && window['PhaserGlobal'].fakeiOSTouchLock))
    {
        this.setTouchLock();
    }
    else
    {
        if (_video)
        {
            _video.locked = false;
        }
    }

};

Phaser.Video.prototype = {

    /**
     * Connects to an external media stream for the webcam, rather than using a local one.
     *
     * @method Phaser.Video#connectToMediaStream
     * @param {HTMLVideoElement} video - The HTML Video Element that the stream uses.
     * @param {MediaStream} stream - The Video Stream data.
     * @return {Phaser.Video} This Video object for method chaining.
     */
    connectToMediaStream: function (video, stream) {

        if (video && stream)
        {
            this.video = video;
            this.videoStream = stream;

            this.isStreaming = true;
            this.baseTexture.source = this.video;
            this.updateTexture(null, this.video.videoWidth, this.video.videoHeight);

            this.onAccess.dispatch(this);
        }

        return this;

    },

    /**
     * Instead of playing a video file this method allows you to stream video data from an attached webcam.
     *
     * As soon as this method is called the user will be prompted by their browser to "Allow" access to the webcam.
     * If they allow it the webcam feed is directed to this Video. Call `Video.play` to start the stream.
     *
     * If they block the webcam the onError signal will be dispatched containing the NavigatorUserMediaError
     * or MediaStreamError event.
     *
     * You can optionally set a width and height for the stream. If set the input will be cropped to these dimensions.
     * If not given then as soon as the stream has enough data the video dimensions will be changed to match the webcam device.
     * You can listen for this with the onChangeSource signal.
     *
     * @method Phaser.Video#startMediaStream
     * @param {boolean} [captureAudio=false] - Controls if audio should be captured along with video in the video stream.
     * @param {integer} [width] - The width is used to create the video stream. If not provided the video width will be set to the width of the webcam input source.
     * @param {integer} [height] - The height is used to create the video stream. If not provided the video height will be set to the height of the webcam input source.
     * @return {Phaser.Video} This Video object for method chaining or false if the device doesn't support getUserMedia.
     */
    startMediaStream: function (captureAudio, width, height) {

        if (captureAudio === undefined) { captureAudio = false; }
        if (width === undefined) { width = null; }
        if (height === undefined) { height = null; }

        if (!this.game.device.getUserMedia)
        {
            this.onError.dispatch(this, 'No getUserMedia');
            return false;
        }

        if (this.videoStream !== null)
        {
            if (this.videoStream['active'])
            {
                this.videoStream.active = false;
            }
            else
            {
                this.videoStream.stop();
            }
        }

        this.removeVideoElement();

        this.video = document.createElement("video");
        this.video.setAttribute('autoplay', 'autoplay');

        if (width !== null)
        {
            this.video.width = width;
        }

        if (height !== null)
        {
            this.video.height = height;
        }

        //  Request access to the webcam

        this._timeOutID = window.setTimeout(this.getUserMediaTimeout.bind(this), this.timeout);

        try {
            navigator.getUserMedia(
                { "audio": captureAudio, "video": true },
                this.getUserMediaSuccess.bind(this),
                this.getUserMediaError.bind(this)
            );
        }
        catch (error)
        {
            this.getUserMediaError(error);
        }

        return this;

    },

    /**
     * @method Phaser.Video#getUserMediaTimeout
     * @private
     */
    getUserMediaTimeout: function () {

        clearTimeout(this._timeOutID);

        this.onTimeout.dispatch(this);

    },

    /**
     * @method Phaser.Video#getUserMediaError
     * @private
     */
    getUserMediaError: function (event) {

        clearTimeout(this._timeOutID);

        this.onError.dispatch(this, event);

    },

    /**
     * @method Phaser.Video#getUserMediaSuccess
     * @private
     */
    getUserMediaSuccess: function (stream) {

        clearTimeout(this._timeOutID);

        // Attach the stream to the video
        this.videoStream = stream;

        // Set the source of the video element with the stream from the camera
        if (this.video.mozSrcObject !== undefined)
        {
            this.video.mozSrcObject = stream;
        }
        else
        {
            this.video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
        }

        var self = this;

        this.video.onloadeddata = function () {

            var retry = 10;

            function checkStream () {

                if (retry > 0)
                {
                    if (self.video.videoWidth > 0)
                    {
                        // Patch for Firefox bug where the height can't be read from the video
                        var width = self.video.videoWidth;
                        var height = self.video.videoHeight;

                        if (isNaN(self.video.videoHeight))
                        {
                            height = width / (4/3);
                        }

                        self.video.play();

                        self.isStreaming = true;
                        self.baseTexture.source = self.video;
                        self.updateTexture(null, width, height);
                        self.onAccess.dispatch(self);
                    }
                    else
                    {
                        window.setTimeout(checkStream, 500);
                    }
                }
                else
                {
                    console.warn('Unable to connect to video stream. Webcam error?');
                }

                retry--;
            }

            checkStream();

        };

    },

    /**
     * Creates a new Video element from the given Blob. The Blob must contain the video data in the correct encoded format.
     * This method is typically called by the Phaser.Loader and Phaser.Cache for you, but is exposed publicly for convenience.
     *
     * @method Phaser.Video#createVideoFromBlob
     * @param {Blob} blob - The Blob containing the video data: `Blob([new Uint8Array(data)])`
     * @return {Phaser.Video} This Video object for method chaining.
     */
    createVideoFromBlob: function (blob) {

        var _this = this;

        this.video = document.createElement("video");
        this.video.controls = false;
        this.video.setAttribute('autoplay', 'autoplay');
        this.video.addEventListener('loadeddata', function (event) { _this.updateTexture(event); }, true);
        this.video.src = window.URL.createObjectURL(blob);
        this.video.canplay = true;

        return this;

    },

    /**
     * Creates a new Video element from the given URL.
     *
     * @method Phaser.Video#createVideoFromURL
     * @param {string} url - The URL of the video.
     * @param {boolean} [autoplay=false] - Automatically start the video?
     * @return {Phaser.Video} This Video object for method chaining.
     */
    createVideoFromURL: function (url, autoplay) {

        if (autoplay === undefined) { autoplay = false; }

        //  Invalidate the texture while we wait for the new one to load (crashes IE11 otherwise)
        if (this.texture)
        {
            this.texture.valid = false;
        }

        this.video = document.createElement("video");
        this.video.controls = false;

        if (autoplay)
        {
            this.video.setAttribute('autoplay', 'autoplay');
        }

        this.video.src = url;

        this.video.canplay = true;

        this.video.load();

        this.retry = this.retryLimit;

        this._retryID = window.setTimeout(this.checkVideoProgress.bind(this), this.retryInterval);

        this.key = url;

        return this;

    },

    /**
     * Called automatically if the video source changes and updates the internal texture dimensions.
     * Then dispatches the onChangeSource signal.
     *
     * @method Phaser.Video#updateTexture
     * @param {object} [event] - The event which triggered the texture update.
     * @param {integer} [width] - The new width of the video. If undefined `video.videoWidth` is used.
     * @param {integer} [height] - The new height of the video. If undefined `video.videoHeight` is used.
     */
    updateTexture: function (event, width, height) {

        var change = false;

        if (width === undefined || width === null) { width = this.video.videoWidth; change = true; }
        if (height === undefined || height === null) { height = this.video.videoHeight; }

        this.width = width;
        this.height = height;

        if (this.baseTexture.source !== this.video)
        {
            this.baseTexture.source = this.video;
        }

        this.baseTexture.forceLoaded(width, height);

        this.texture.frame.resize(width, height);

        this.texture.width = width;
        this.texture.height = height;

        this.texture.valid = true;

        if (this.snapshot)
        {
            this.snapshot.resize(width, height);
        }

        if (change && this.key !== null)
        {
            this.onChangeSource.dispatch(this, width, height);

            if (this._autoplay)
            {
                this.video.play();
                this.onPlay.dispatch(this, this.loop, this.playbackRate);
            }
        }

    },

    /**
     * Called when the video completes playback (reaches and ended state).
     * Dispatches the Video.onComplete signal.
     *
     * @method Phaser.Video#complete
     */
    complete: function () {

        this.onComplete.dispatch(this);

    },

    /**
     * Starts this video playing if it's not already doing so.
     *
     * @method Phaser.Video#play
     * @param {boolean} [loop=false] - Should the video loop automatically when it reaches the end? Please note that at present some browsers (i.e. Chrome) do not support *seamless* video looping.
     * @param {number} [playbackRate=1] - The playback rate of the video. 1 is normal speed, 2 is x2 speed, and so on. You cannot set a negative playback rate.
     * @return {Phaser.Video} This Video object for method chaining.
     */
    play: function (loop, playbackRate) {

        if (loop === undefined) { loop = false; }
        if (playbackRate === undefined) { playbackRate = 1; }

        if (this.game.sound.onMute)
        {
            this.game.sound.onMute.add(this.setMute, this);
            this.game.sound.onUnMute.add(this.unsetMute, this);

            if (this.game.sound.mute)
            {
                this.setMute();
            }
        }

        this.game.onPause.add(this.setPause, this);
        this.game.onResume.add(this.setResume, this);

        this._endCallback = this.complete.bind(this);

        this.video.addEventListener('ended', this._endCallback, true);
        this.video.addEventListener('webkitendfullscreen', this._endCallback, true);

        if (loop)
        {
            this.video.loop = 'loop';
        }
        else
        {
            this.video.loop = '';
        }

        this.video.playbackRate = playbackRate;

        if (this.touchLocked)
        {
            this._pending = true;
        }
        else
        {
            this._pending = false;

            if (this.key !== null)
            {
                if (this.video.readyState !== 4)
                {
                    this.retry = this.retryLimit;
                    this._retryID = window.setTimeout(this.checkVideoProgress.bind(this), this.retryInterval);
                }
                else
                {
                    this._playCallback = this.playHandler.bind(this);
                    this.video.addEventListener('playing', this._playCallback, true);
                }
            }

            this.video.play();

            this.onPlay.dispatch(this, loop, playbackRate);
        }

        return this;

    },

    /**
     * Called when the video starts to play. Updates the texture.
     *
     * @method Phaser.Video#playHandler
     * @private
     */
    playHandler: function () {

        this.video.removeEventListener('playing', this._playCallback, true);

        this.updateTexture();

    },

    /**
     * Stops the video playing.
     *
     * This removes all locally set signals.
     *
     * If you only wish to pause playback of the video, to resume at a later time, use `Video.paused = true` instead.
     * If the video hasn't finished downloading calling `Video.stop` will not abort the download. To do that you need to
     * call `Video.destroy` instead.
     *
     * If you are using a video stream from a webcam then calling Stop will disconnect the MediaStream session and disable the webcam.
     *
     * @method Phaser.Video#stop
     * @return {Phaser.Video} This Video object for method chaining.
     */
    stop: function () {

        if (this.game.sound.onMute)
        {
            this.game.sound.onMute.remove(this.setMute, this);
            this.game.sound.onUnMute.remove(this.unsetMute, this);
        }

        this.game.onPause.remove(this.setPause, this);
        this.game.onResume.remove(this.setResume, this);

        //  Stream or file?

        if (this.isStreaming)
        {
            if (this.video.mozSrcObject)
            {
                this.video.mozSrcObject.stop();
                this.video.src = null;
            }
            else
            {
                this.video.src = "";

                if (this.videoStream['active'])
                {
                    this.videoStream.active = false;
                }
                else
                {
                    if (this.videoStream.getTracks)
                    {
                        this.videoStream.getTracks().forEach(function (track) {
                            track.stop();
                        });
                    }
                    else
                    {
                        this.videoStream.stop();
                    }

                }
            }

            this.videoStream = null;
            this.isStreaming = false;
        }
        else
        {
            this.video.removeEventListener('ended', this._endCallback, true);
            this.video.removeEventListener('webkitendfullscreen', this._endCallback, true);
            this.video.removeEventListener('playing', this._playCallback, true);

            if (this.touchLocked)
            {
                this._pending = false;
            }
            else
            {
                this.video.pause();
            }
        }

        return this;

    },

    /**
    * Updates the given Display Objects so they use this Video as their texture.
    * This will replace any texture they will currently have set.
    *
    * @method Phaser.Video#add
    * @param {Phaser.Sprite|Phaser.Sprite[]|Phaser.Image|Phaser.Image[]} object - Either a single Sprite/Image or an Array of Sprites/Images.
    * @return {Phaser.Video} This Video object for method chaining.
    */
    add: function (object) {

        if (Array.isArray(object))
        {
            for (var i = 0; i < object.length; i++)
            {
                if (object[i]['loadTexture'])
                {
                    object[i].loadTexture(this);
                }
            }
        }
        else
        {
            object.loadTexture(this);
        }

        return this;

    },

    /**
    * Creates a new Phaser.Image object, assigns this Video to be its texture, adds it to the world then returns it.
    *
    * @method Phaser.Video#addToWorld
    * @param {number} [x=0] - The x coordinate to place the Image at.
    * @param {number} [y=0] - The y coordinate to place the Image at.
    * @param {number} [anchorX=0] - Set the x anchor point of the Image. A value between 0 and 1, where 0 is the top-left and 1 is bottom-right.
    * @param {number} [anchorY=0] - Set the y anchor point of the Image. A value between 0 and 1, where 0 is the top-left and 1 is bottom-right.
    * @param {number} [scaleX=1] - The horizontal scale factor of the Image. A value of 1 means no scaling. 2 would be twice the size, and so on.
    * @param {number} [scaleY=1] - The vertical scale factor of the Image. A value of 1 means no scaling. 2 would be twice the size, and so on.
    * @return {Phaser.Image} The newly added Image object.
    */
    addToWorld: function (x, y, anchorX, anchorY, scaleX, scaleY) {

        scaleX = scaleX || 1;
        scaleY = scaleY || 1;

        var image = this.game.add.image(x, y, this);

        image.anchor.set(anchorX, anchorY);
        image.scale.set(scaleX, scaleY);

        return image;

    },

    /**
    * If the game is running in WebGL this will push the texture up to the GPU if it's dirty.
    * This is called automatically if the Video is being used by a Sprite, otherwise you need to remember to call it in your render function.
    * If you wish to suppress this functionality set Video.disableTextureUpload to `true`.
    *
    * @method Phaser.Video#render
    */
    render: function () {

        if (!this.disableTextureUpload && this.playing)
        {
            this.baseTexture.dirty();
        }

    },

    /**
    * Internal handler called automatically by the Video.mute setter.
    *
    * @method Phaser.Video#setMute
    * @private
    */
    setMute: function () {

        if (this._muted)
        {
            return;
        }

        this._muted = true;

        this.video.muted = true;

    },

    /**
    * Internal handler called automatically by the Video.mute setter.
    *
    * @method Phaser.Video#unsetMute
    * @private
    */
    unsetMute: function () {

        if (!this._muted || this._codeMuted)
        {
            return;
        }

        this._muted = false;

        this.video.muted = false;

    },

    /**
    * Internal handler called automatically by the Video.paused setter.
    *
    * @method Phaser.Video#setPause
    * @private
    */
    setPause: function () {

        if (this._paused || this.touchLocked)
        {
            return;
        }

        this._paused = true;

        this.video.pause();

    },

    /**
    * Internal handler called automatically by the Video.paused setter.
    *
    * @method Phaser.Video#setResume
    * @private
    */
    setResume: function () {

        if (!this._paused || this._codePaused || this.touchLocked)
        {
            return;
        }

        this._paused = false;

        if (!this.video.ended)
        {
            this.video.play();
        }

    },

    /**
     * On some mobile browsers you cannot play a video until the user has explicitly touched the video to allow it.
     * Phaser handles this via the `setTouchLock` method. However if you have 3 different videos, maybe an "Intro", "Start" and "Game Over"
     * split into three different Video objects, then you will need the user to touch-unlock every single one of them.
     *
     * You can avoid this by using just one Video object and simply changing the video source. Once a Video element is unlocked it remains
     * unlocked, even if the source changes. So you can use this to your benefit to avoid forcing the user to 'touch' the video yet again.
     *
     * As you'd expect there are limitations. So far we've found that the videos need to be in the same encoding format and bitrate.
     * This method will automatically handle a change in video dimensions, but if you try swapping to a different bitrate we've found it
     * cannot render the new video on iOS (desktop browsers cope better).
     *
     * When the video source is changed the video file is requested over the network. Listen for the `onChangeSource` signal to know
     * when the new video has downloaded enough content to be able to be played. Previous settings such as the volume and loop state
     * are adopted automatically by the new video.
     *
     * @method Phaser.Video#changeSource
     * @param {string} src - The new URL to change the video.src to.
     * @param {boolean} [autoplay=true] - Should the video play automatically after the source has been updated?
     * @return {Phaser.Video} This Video object for method chaining.
     */
    changeSource: function (src, autoplay) {

        if (autoplay === undefined) { autoplay = true; }

        //  Invalidate the texture while we wait for the new one to load (crashes IE11 otherwise)
        this.texture.valid = false;

        this.video.pause();

        this.retry = this.retryLimit;

        this._retryID = window.setTimeout(this.checkVideoProgress.bind(this), this.retryInterval);

        this.video.src = src;

        this.video.load();

        this._autoplay = autoplay;

        if (!autoplay)
        {
            this.paused = true;
        }

        return this;

    },

    /**
    * Internal callback that monitors the download progress of a video after changing its source.
    *
    * @method Phaser.Video#checkVideoProgress
    * @private
    */
    checkVideoProgress: function () {

        // if (this.video.readyState === 2 || this.video.readyState === 4)
        if (this.video.readyState === 4)
        {
            //  We've got enough data to update the texture for playback
            this.updateTexture();
        }
        else
        {
            this.retry--;

            if (this.retry > 0)
            {
                this._retryID = window.setTimeout(this.checkVideoProgress.bind(this), this.retryInterval);
            }
            else
            {
                console.warn('Phaser.Video: Unable to start downloading video in time', this.isStreaming);
            }
        }

    },

    /**
    * Sets the Input Manager touch callback to be Video.unlock.
    * Required for mobile video unlocking. Mostly just used internally.
    *
    * @method Phaser.Video#setTouchLock
    */
    setTouchLock: function () {

        this.game.input.touch.addTouchLockCallback(this.unlock, this);
        this.touchLocked = true;

    },

    /**
    * Enables the video on mobile devices, usually after the first touch.
    * If the SoundManager hasn't been unlocked then this will automatically unlock that as well.
    * Only one video can be pending unlock at any one time.
    *
    * @method Phaser.Video#unlock
    */
    unlock: function () {

        this.touchLocked = false;

        this.video.play();

        this.onPlay.dispatch(this, this.loop, this.playbackRate);

        if (this.key)
        {
            var _video = this.game.cache.getVideo(this.key);

            if (_video && !_video.isBlob)
            {
                _video.locked = false;
            }
        }

        return true;

    },

    /**
     * Grabs the current frame from the Video or Video Stream and renders it to the Video.snapshot BitmapData.
     *
     * You can optionally set if the BitmapData should be cleared or not, the alpha and the blend mode of the draw.
     *
     * If you need more advanced control over the grabbing them call `Video.snapshot.copy` directly with the same parameters as BitmapData.copy.
     *
     * @method Phaser.Video#grab
     * @param {boolean} [clear=false] - Should the BitmapData be cleared before the Video is grabbed? Unless you are using alpha or a blend mode you can usually leave this set to false.
     * @param {number} [alpha=1] - The alpha that will be set on the video before drawing. A value between 0 (fully transparent) and 1, opaque.
     * @param {string} [blendMode=null] - The composite blend mode that will be used when drawing. The default is no blend mode at all. This is a Canvas globalCompositeOperation value such as 'lighter' or 'xor'.
     * @return {Phaser.BitmapData} A reference to the Video.snapshot BitmapData object for further method chaining.
     */
    grab: function (clear, alpha, blendMode) {

        if (clear === undefined) { clear = false; }
        if (alpha === undefined) { alpha = 1; }
        if (blendMode === undefined) { blendMode = null; }

        if (this.snapshot === null)
        {
            console.warn('Video.grab cannot run because Phaser.BitmapData is unavailable');
            return;
        }

        if (clear)
        {
            this.snapshot.cls();
        }

        this.snapshot.copy(this.video, 0, 0, this.width, this.height, 0, 0, this.width, this.height, 0, 0, 0, 1, 1, alpha, blendMode);

        return this.snapshot;

    },

    /**
     * Removes the Video element from the DOM by calling parentNode.removeChild on itself.
     * Also removes the autoplay and src attributes and nulls the reference.
     *
     * @method Phaser.Video#removeVideoElement
     */
    removeVideoElement: function () {

        if (!this.video)
        {
            return;
        }

        if (this.video.parentNode)
        {
            this.video.parentNode.removeChild(this.video);
        }

        while (this.video.hasChildNodes())
        {
            this.video.removeChild(this.video.firstChild);
        }

        this.video.removeAttribute('autoplay');
        this.video.removeAttribute('src');

        this.video = null;

    },

    /**
     * Destroys the Video object. This calls `Video.stop` and then `Video.removeVideoElement`.
     * If any Sprites are using this Video as their texture it is up to you to manage those.
     *
     * @method Phaser.Video#destroy
     */
    destroy: function () {

        this.stop();

        this.removeVideoElement();

        if (this.touchLocked)
        {
            this.game.input.touch.removeTouchLockCallback(this.unlock, this);
        }

        if (this._retryID)
        {
            window.clearTimeout(this._retryID);
        }

    }

};

/**
* @name Phaser.Video#currentTime
* @property {number} currentTime - The current time of the video in seconds. If set the video will attempt to seek to that point in time.
*/
Object.defineProperty(Phaser.Video.prototype, "currentTime", {

    get: function () {

        return (this.video) ? this.video.currentTime : 0;

    },

    set: function (value) {

        this.video.currentTime = value;

    }

});

/**
* @name Phaser.Video#duration
* @property {number} duration - The duration of the video in seconds.
* @readOnly
*/
Object.defineProperty(Phaser.Video.prototype, "duration", {

    get: function () {

        return (this.video) ? this.video.duration : 0;

    }

});

/**
* @name Phaser.Video#progress
* @property {number} progress - The progress of this video. This is a value between 0 and 1, where 0 is the start and 1 is the end of the video.
* @readOnly
*/
Object.defineProperty(Phaser.Video.prototype, "progress", {

    get: function () {

        return (this.video) ? (this.video.currentTime / this.video.duration) : 0;

    }

});

/**
* @name Phaser.Video#mute
* @property {boolean} mute - Gets or sets the muted state of the Video.
*/
Object.defineProperty(Phaser.Video.prototype, "mute", {

    get: function () {

        return this._muted;

    },

    set: function (value) {

        value = value || null;

        if (value)
        {
            if (this._muted)
            {
                return;
            }

            this._codeMuted = true;
            this.setMute();
        }
        else
        {
            if (!this._muted)
            {
                return;
            }

            this._codeMuted = false;
            this.unsetMute();
        }
    }

});

/**
* Gets or sets the paused state of the Video.
* If the video is still touch locked (such as on iOS devices) this call has no effect.
*
* @name Phaser.Video#paused
* @property {boolean} paused
*/
Object.defineProperty(Phaser.Video.prototype, "paused", {

    get: function () {

        return this._paused;

    },

    set: function (value) {

        value = value || null;

        if (this.touchLocked)
        {
            return;
        }

        if (value)
        {
            if (this._paused)
            {
                return;
            }

            this._codePaused = true;
            this.setPause();
        }
        else
        {
            if (!this._paused)
            {
                return;
            }

            this._codePaused = false;
            this.setResume();
        }
    }

});

/**
* @name Phaser.Video#volume
* @property {number} volume - Gets or sets the volume of the Video, a value between 0 and 1. The value given is clamped to the range 0 to 1.
*/
Object.defineProperty(Phaser.Video.prototype, "volume", {

    get: function () {

        return (this.video) ? this.video.volume : 1;

    },

    set: function (value) {

        if (value < 0)
        {
            value = 0;
        }
        else if (value > 1)
        {
            value = 1;
        }

        if (this.video)
        {
            this.video.volume = value;
        }

    }

});

/**
* @name Phaser.Video#playbackRate
* @property {number} playbackRate - Gets or sets the playback rate of the Video. This is the speed at which the video is playing.
*/
Object.defineProperty(Phaser.Video.prototype, "playbackRate", {

    get: function () {

        return (this.video) ? this.video.playbackRate : 1;

    },

    set: function (value) {

        if (this.video)
        {
            this.video.playbackRate = value;
        }

    }

});

/**
* Gets or sets if the Video is set to loop.
* Please note that at present some browsers (i.e. Chrome) do not support *seamless* video looping.
* If the video isn't yet set this will always return false.
*
* @name Phaser.Video#loop
* @property {boolean} loop
*/
Object.defineProperty(Phaser.Video.prototype, "loop", {

    get: function () {

        return (this.video) ? this.video.loop : false;

    },

    set: function (value) {

        if (value && this.video)
        {
            this.video.loop = 'loop';
        }
        else if (this.video)
        {
            this.video.loop = '';
        }

    }

});

/**
* @name Phaser.Video#playing
* @property {boolean} playing - True if the video is currently playing (and not paused or ended), otherwise false.
* @readOnly
*/
Object.defineProperty(Phaser.Video.prototype, "playing", {

    get: function () {

        return !(this.video.paused && this.video.ended);

    }

});

Phaser.Video.prototype.constructor = Phaser.Video;

/* global Phaser:true */
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

//  Pixi expects these globals to exist

if (PIXI.blendModes === undefined)
{
    PIXI.blendModes = Phaser.blendModes;
}

if (PIXI.scaleModes === undefined)
{
    PIXI.scaleModes = Phaser.scaleModes;
}

if (PIXI.Texture.emptyTexture === undefined)
{
    PIXI.Texture.emptyTexture = new PIXI.Texture(new PIXI.BaseTexture());
}

if (PIXI.DisplayObject._tempMatrix === undefined)
{
    PIXI.DisplayObject._tempMatrix = new PIXI.Matrix();
}

if (PIXI.RenderTexture.tempMatrix === undefined)
{
    PIXI.RenderTexture.tempMatrix = new PIXI.Matrix();
}

if (PIXI.Graphics && PIXI.Graphics.POLY === undefined)
{
    PIXI.Graphics.POLY = Phaser.POLYGON;
    PIXI.Graphics.RECT = Phaser.RECTANGLE;
    PIXI.Graphics.CIRC = Phaser.CIRCLE;
    PIXI.Graphics.ELIP = Phaser.ELLIPSE;
    PIXI.Graphics.RREC = Phaser.ROUNDEDRECTANGLE;
}

PIXI.TextureSilentFail = true;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

    // if (typeof exports !== 'undefined') {
    //     if (typeof module !== 'undefined' && module.exports) {
    //         exports = module.exports = Phaser;
    //     }
    //     exports.Phaser = Phaser;
    // } else if (typeof define !== 'undefined' && define.amd) {
    //     define('Phaser', (function() { return root.Phaser = Phaser; })() );
    // } else {
    //     root.Phaser = Phaser;
    // }

//     return Phaser;
// }).call(this);


/*
* "What matters in this life is not what we do but what we do for others, the legacy we leave and the imprint we make." - Eric Meyer
*/
