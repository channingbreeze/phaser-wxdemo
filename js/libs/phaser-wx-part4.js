import PIXI from './pixi-wx.js';
import Phaser from './phaser-wx-main.js';
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A BitmapData object contains a Canvas element to which you can draw anything you like via normal Canvas context operations.
* A single BitmapData can be used as the texture for one or many Images / Sprites. 
* So if you need to dynamically create a Sprite texture then they are a good choice.
*
* Important note: Every BitmapData creates its own Canvas element. Because BitmapData's are now Game Objects themselves, and don't
* live on the display list, they are NOT automatically cleared when you change State. Therefore you _must_ call BitmapData.destroy
* in your State's shutdown method if you wish to free-up the resources the BitmapData used, it will not happen for you.
*
* @class Phaser.BitmapData
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {string} key - Internal Phaser reference key for the BitmapData.
* @param {number} [width=256] - The width of the BitmapData in pixels. If undefined or zero it's set to a default value.
* @param {number} [height=256] - The height of the BitmapData in pixels. If undefined or zero it's set to a default value.
* @param {boolean} [skipPool=false] - When this BitmapData generates its internal canvas to use for rendering, it will get the canvas from the CanvasPool if false, or create its own if true.
*/
Phaser.BitmapData = function (game, key, width, height, skipPool) {

    if (width === undefined || width === 0) { width = 256; }
    if (height === undefined || height === 0) { height = 256; }
    if (skipPool === undefined) { skipPool = false; }

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * @property {string} key - The key of the BitmapData in the Cache, if stored there.
    */
    this.key = key;

    /**
    * @property {number} width - The width of the BitmapData in pixels.
    */
    this.width = width;

    /**
    * @property {number} height - The height of the BitmapData in pixels.
    */
    this.height = height;

    /**
    * @property {HTMLCanvasElement} canvas - The canvas to which this BitmapData draws.
    * @default
    */
    this.canvas = Phaser.Canvas.create(this, width, height, null, skipPool);

    /**
    * @property {CanvasRenderingContext2D} context - The 2d context of the canvas.
    * @default
    */
    this.context = this.canvas.getContext('2d', { alpha: true });

    /**
    * @property {CanvasRenderingContext2D} ctx - A reference to BitmapData.context.
    */
    this.ctx = this.context;

    /**
    * @property {string} smoothProperty - The context property needed for smoothing this Canvas.
    */
    this.smoothProperty = (game.renderType === Phaser.CANVAS) ? game.renderer.renderSession.smoothProperty : Phaser.Canvas.getSmoothingPrefix(this.context);

    /**
    * @property {ImageData} imageData - The context image data.
    * Please note that a call to BitmapData.draw() or BitmapData.copy() does not update immediately this property for performance reason. Use BitmapData.update() to do so.
    * This property is updated automatically after the first game loop, according to the dirty flag property.
    */
    this.imageData = this.context.getImageData(0, 0, width, height);

    /**
    * A Uint8ClampedArray view into BitmapData.buffer.
    * Note that this is unavailable in some browsers (such as Epic Browser due to its security restrictions)
    * @property {Uint8ClampedArray} data
    */
    this.data = null;

    if (this.imageData)
    {
        this.data = this.imageData.data;
    }

    /**
    * @property {Uint32Array} pixels - An Uint32Array view into BitmapData.buffer.
    */
    this.pixels = null;

    /**
    * @property {ArrayBuffer} buffer - An ArrayBuffer the same size as the context ImageData.
    */
    if (this.data)
    {
        if (this.imageData.data.buffer)
        {
            this.buffer = this.imageData.data.buffer;
            this.pixels = new Uint32Array(this.buffer);
        }
        else
        {
            if (window['ArrayBuffer'])
            {
                this.buffer = new ArrayBuffer(this.imageData.data.length);
                this.pixels = new Uint32Array(this.buffer);
            }
            else
            {
                this.pixels = this.imageData.data;
            }
        }
    }

    /**
    * @property {PIXI.BaseTexture} baseTexture - The PIXI.BaseTexture.
    * @default
    */
    this.baseTexture = new PIXI.BaseTexture(this.canvas);

    /**
    * @property {PIXI.Texture} texture - The PIXI.Texture.
    * @default
    */
    this.texture = new PIXI.Texture(this.baseTexture);

    /**
    * @property {Phaser.FrameData} frameData - The FrameData container this BitmapData uses for rendering.
    */
    this.frameData = new Phaser.FrameData();

    /**
    * @property {Phaser.Frame} textureFrame - The Frame this BitmapData uses for rendering.
    * @default
    */
    this.textureFrame = this.frameData.addFrame(new Phaser.Frame(0, 0, 0, width, height, 'bitmapData'));

    this.texture.frame = this.textureFrame;

    /**
    * @property {number} type - The const type of this object.
    * @default
    */
    this.type = Phaser.BITMAPDATA;

    /**
    * @property {boolean} disableTextureUpload - If disableTextureUpload is true this BitmapData will never send its image data to the GPU when its dirty flag is true.
    */
    this.disableTextureUpload = false;

    /**
    * @property {boolean} dirty - If dirty this BitmapData will be re-rendered.
    */
    this.dirty = false;

    //  Aliases
    this.cls = this.clear;

    /**
    * @property {number} _image - Internal cache var.
    * @private
    */
    this._image = null;

    /**
    * @property {Phaser.Point} _pos - Internal cache var.
    * @private
    */
    this._pos = new Phaser.Point();

    /**
    * @property {Phaser.Point} _size - Internal cache var.
    * @private
    */
    this._size = new Phaser.Point();

    /**
    * @property {Phaser.Point} _scale - Internal cache var.
    * @private
    */
    this._scale = new Phaser.Point();

    /**
    * @property {number} _rotate - Internal cache var.
    * @private
    */
    this._rotate = 0;

    /**
    * @property {object} _alpha - Internal cache var.
    * @private
    */
    this._alpha = { prev: 1, current: 1 };

    /**
    * @property {Phaser.Point} _anchor - Internal cache var.
    * @private
    */
    this._anchor = new Phaser.Point();

    /**
    * @property {number} _tempR - Internal cache var.
    * @private
    */
    this._tempR = 0;

    /**
    * @property {number} _tempG - Internal cache var.
    * @private
    */
    this._tempG = 0;

    /**
    * @property {number} _tempB - Internal cache var.
    * @private
    */
    this._tempB = 0;

    /**
    * @property {Phaser.Circle} _circle - Internal cache var.
    * @private
    */
    this._circle = new Phaser.Circle();

    /**
    * @property {HTMLCanvasElement} _swapCanvas - A swap canvas. Used by moveH and moveV, created in those methods.
    * @private
    */
    this._swapCanvas = undefined;

};

Phaser.BitmapData.prototype = {

    /**
    * Shifts the contents of this BitmapData by the distances given.
    * 
    * The image will wrap-around the edges on all sides if the wrap argument is true (the default).
    *
    * @method Phaser.BitmapData#move
    * @param {integer} x - The amount of pixels to horizontally shift the canvas by. Use a negative value to shift to the left, positive to the right.
    * @param {integer} y - The amount of pixels to vertically shift the canvas by. Use a negative value to shift up, positive to shift down.
    * @param {boolean} [wrap=true] - Wrap the content of the BitmapData.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    move: function (x, y, wrap) {

        if (x !== 0)
        {
            this.moveH(x, wrap);
        }

        if (y !== 0)
        {
            this.moveV(y, wrap);
        }

        return this;

    },

    /**
    * Shifts the contents of this BitmapData horizontally.
    * 
    * The image will wrap-around the sides if the wrap argument is true (the default).
    *
    * @method Phaser.BitmapData#moveH
    * @param {integer} distance - The amount of pixels to horizontally shift the canvas by. Use a negative value to shift to the left, positive to the right.
    * @param {boolean} [wrap=true] - Wrap the content of the BitmapData.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    moveH: function (distance, wrap) {

        if (wrap === undefined) { wrap = true; }

        if (this._swapCanvas === undefined)
        {
            this._swapCanvas = PIXI.CanvasPool.create(this, this.width, this.height);
        }

        var c = this._swapCanvas;
        var ctx = c.getContext('2d');
        var h = this.height;
        var src = this.canvas;

        ctx.clearRect(0, 0, this.width, this.height);

        if (distance < 0)
        {
            distance = Math.abs(distance);

            //  Moving to the left
            var w = this.width - distance;

            //  Left-hand chunk
            if (wrap)
            {
                ctx.drawImage(src, 0, 0, distance, h, w, 0, distance, h);
            }

            //  Rest of the image
            ctx.drawImage(src, distance, 0, w, h, 0, 0, w, h);
        }
        else
        {
            //  Moving to the right
            var w = this.width - distance;

            //  Right-hand chunk
            if (wrap)
            {
                ctx.drawImage(src, w, 0, distance, h, 0, 0, distance, h);
            }

            //  Rest of the image
            ctx.drawImage(src, 0, 0, w, h, distance, 0, w, h);
        }

        this.clear();

        return this.copy(this._swapCanvas);

    },

    /**
    * Shifts the contents of this BitmapData vertically.
    * 
    * The image will wrap-around the sides if the wrap argument is true (the default).
    *
    * @method Phaser.BitmapData#moveV
    * @param {integer} distance - The amount of pixels to vertically shift the canvas by. Use a negative value to shift up, positive to shift down.
    * @param {boolean} [wrap=true] - Wrap the content of the BitmapData.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    moveV: function (distance, wrap) {

        if (wrap === undefined) { wrap = true; }

        if (this._swapCanvas === undefined)
        {
            this._swapCanvas = PIXI.CanvasPool.create(this, this.width, this.height);
        }

        var c = this._swapCanvas;
        var ctx = c.getContext('2d');
        var w = this.width;
        var src = this.canvas;

        ctx.clearRect(0, 0, this.width, this.height);

        if (distance < 0)
        {
            distance = Math.abs(distance);

            //  Moving up
            var h = this.height - distance;

            //  Top chunk
            if (wrap)
            {
                ctx.drawImage(src, 0, 0, w, distance, 0, h, w, distance);
            }

            //  Rest of the image
            ctx.drawImage(src, 0, distance, w, h, 0, 0, w, h);
        }
        else
        {
            //  Moving down
            var h = this.height - distance;

            //  Bottom chunk
            if (wrap)
            {
                ctx.drawImage(src, 0, h, w, distance, 0, 0, w, distance);
            }

            //  Rest of the image
            ctx.drawImage(src, 0, 0, w, h, 0, distance, w, h);
        }

        this.clear();

        return this.copy(this._swapCanvas);

    },

    /**
    * Updates the given objects so that they use this BitmapData as their texture.
    * This will replace any texture they will currently have set.
    *
    * @method Phaser.BitmapData#add
    * @param {Phaser.Sprite|Phaser.Sprite[]|Phaser.Image|Phaser.Image[]} object - Either a single Sprite/Image or an Array of Sprites/Images.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
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
    * Takes the given Game Object, resizes this BitmapData to match it and then draws it into this BitmapDatas canvas, ready for further processing.
    * The source game object is not modified by this operation.
    * If the source object uses a texture as part of a Texture Atlas or Sprite Sheet, only the current frame will be used for sizing.
    * If a string is given it will assume it's a cache key and look in Phaser.Cache for an image key matching the string.
    *
    * @method Phaser.BitmapData#load
    * @param {Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapData|Image|HTMLCanvasElement|string} source - The object that will be used to populate this BitmapData. If you give a string it will try and find the Image in the Game.Cache first.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    load: function (source) {

        if (typeof source === 'string')
        {
            source = this.game.cache.getImage(source);
        }

        if (source)
        {
            this.resize(source.width, source.height);
            this.cls();
        }
        else
        {
            return;
        }

        this.draw(source);

        this.update();

        return this;

    },

    /**
    * Clears the BitmapData context using a clearRect.
    *
    * @method Phaser.BitmapData#cls
    */

    /**
    * Clears the BitmapData context using a clearRect.
    *
    * You can optionally define the area to clear.
    * If the arguments are left empty it will clear the entire canvas.
    *
    * You may need to call BitmapData.update after this in order to clear out the pixel data, 
    * but Phaser will not do this automatically for you.
    *
    * @method Phaser.BitmapData#clear
    * @param {number} [x=0] - The x coordinate of the top-left of the area to clear.
    * @param {number} [y=0] - The y coordinate of the top-left of the area to clear.
    * @param {number} [width] - The width of the area to clear. If undefined it will use BitmapData.width.
    * @param {number} [height] - The height of the area to clear. If undefined it will use BitmapData.height.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    clear: function (x, y, width, height) {

        if (x === undefined) { x = 0; }
        if (y === undefined) { y = 0; }
        if (width === undefined) { width = this.width; }
        if (height === undefined) { height = this.height; }

        this.context.clearRect(x, y, width, height);

        this.dirty = true;

        return this;

    },

    /**
    * Fills the BitmapData with the given color.
    *
    * @method Phaser.BitmapData#fill
    * @param {number} r - The red color value, between 0 and 0xFF (255).
    * @param {number} g - The green color value, between 0 and 0xFF (255).
    * @param {number} b - The blue color value, between 0 and 0xFF (255).
    * @param {number} [a=1] - The alpha color value, between 0 and 1.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    fill: function (r, g, b, a) {

        if (a === undefined) { a = 1; }

        this.context.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        this.context.fillRect(0, 0, this.width, this.height);
        this.dirty = true;

        return this;

    },

    /**
    * Creates a new Image element by converting this BitmapDatas canvas into a dataURL.
    *
    * The image is then stored in the image Cache using the key given.
    *
    * Finally a PIXI.Texture is created based on the image and returned.
    *
    * You can apply the texture to a sprite or any other supporting object by using either the
    * key or the texture. First call generateTexture:
    *
    * `var texture = bitmapdata.generateTexture('ball');`
    *
    * Then you can either apply the texture to a sprite:
    * 
    * `game.add.sprite(0, 0, texture);`
    *
    * or by using the string based key:
    *
    * `game.add.sprite(0, 0, 'ball');`
    *
    * @method Phaser.BitmapData#generateTexture
    * @param {string} key - The key which will be used to store the image in the Cache.
    * @return {PIXI.Texture} The newly generated texture.
    */
    generateTexture: function (key) {

        var image = new Image();

        image.src = this.canvas.toDataURL("image/png");

        var obj = this.game.cache.addImage(key, '', image);

        return new PIXI.Texture(obj.base);

    },

    /**
    * Resizes the BitmapData. This changes the size of the underlying canvas and refreshes the buffer.
    *
    * @method Phaser.BitmapData#resize
    * @param {integer} width - The new width of the BitmapData.
    * @param {integer} height - The new height of the BitmapData.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    resize: function (width, height) {

        if (width !== this.width || height !== this.height)
        {
            this.width = width;
            this.height = height;

            this.canvas.width = width;
            this.canvas.height = height;

            if (this._swapCanvas !== undefined)
            {
                this._swapCanvas.width = width;
                this._swapCanvas.height = height;
            }

            this.baseTexture.width = width;
            this.baseTexture.height = height;

            this.textureFrame.width = width;
            this.textureFrame.height = height;

            this.texture.width = width;
            this.texture.height = height;

            this.texture.crop.width = width;
            this.texture.crop.height = height;

            this.update();
            this.dirty = true;
        }

        return this;

    },

    /**
    * This re-creates the BitmapData.imageData from the current context.
    * It then re-builds the ArrayBuffer, the data Uint8ClampedArray reference and the pixels Int32Array.
    * If not given the dimensions defaults to the full size of the context.
    *
    * Warning: This is a very expensive operation, so use it sparingly.
    *
    * @method Phaser.BitmapData#update
    * @param {number} [x=0] - The x coordinate of the top-left of the image data area to grab from.
    * @param {number} [y=0] - The y coordinate of the top-left of the image data area to grab from.
    * @param {number} [width=1] - The width of the image data area.
    * @param {number} [height=1] - The height of the image data area.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    update: function (x, y, width, height) {

        if (x === undefined) { x = 0; }
        if (y === undefined) { y = 0; }
        if (width === undefined) { width = Math.max(1, this.width); }
        if (height === undefined) { height = Math.max(1, this.height); }

        this.imageData = this.context.getImageData(x, y, width, height);
        this.data = this.imageData.data;

        if (this.imageData.data.buffer)
        {
            this.buffer = this.imageData.data.buffer;
            this.pixels = new Uint32Array(this.buffer);
        }
        else
        {
            if (window['ArrayBuffer'])
            {
                this.buffer = new ArrayBuffer(this.imageData.data.length);
                this.pixels = new Uint32Array(this.buffer);
            }
            else
            {
                this.pixels = this.imageData.data;
            }
        }

        return this;

    },

    /**
    * Scans through the area specified in this BitmapData and sends a color object for every pixel to the given callback.
    * The callback will be sent a color object with 6 properties: `{ r: number, g: number, b: number, a: number, color: number, rgba: string }`.
    * Where r, g, b and a are integers between 0 and 255 representing the color component values for red, green, blue and alpha.
    * The `color` property is an Int32 of the full color. Note the endianess of this will change per system.
    * The `rgba` property is a CSS style rgba() string which can be used with context.fillStyle calls, among others.
    * The callback will also be sent the pixels x and y coordinates respectively.
    * The callback must return either `false`, in which case no change will be made to the pixel, or a new color object.
    * If a new color object is returned the pixel will be set to the r, g, b and a color values given within it.
    *
    * @method Phaser.BitmapData#processPixelRGB
    * @param {function} callback - The callback that will be sent each pixel color object to be processed.
    * @param {object} callbackContext - The context under which the callback will be called.
    * @param {number} [x=0] - The x coordinate of the top-left of the region to process from.
    * @param {number} [y=0] - The y coordinate of the top-left of the region to process from.
    * @param {number} [width] - The width of the region to process.
    * @param {number} [height] - The height of the region to process.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    processPixelRGB: function (callback, callbackContext, x, y, width, height) {

        if (x === undefined) { x = 0; }
        if (y === undefined) { y = 0; }
        if (width === undefined) { width = this.width; }
        if (height === undefined) { height = this.height; }

        var w = x + width;
        var h = y + height;
        var pixel = Phaser.Color.createColor();
        var result = { r: 0, g: 0, b: 0, a: 0 };
        var dirty = false;

        for (var ty = y; ty < h; ty++)
        {
            for (var tx = x; tx < w; tx++)
            {
                Phaser.Color.unpackPixel(this.getPixel32(tx, ty), pixel);

                result = callback.call(callbackContext, pixel, tx, ty);

                if (result !== false && result !== null && result !== undefined)
                {
                    this.setPixel32(tx, ty, result.r, result.g, result.b, result.a, false);
                    dirty = true;
                }
            }
        }

        if (dirty)
        {
            this.context.putImageData(this.imageData, 0, 0);
            this.dirty = true;
        }

        return this;

    },

    /**
    * Scans through the area specified in this BitmapData and sends the color for every pixel to the given callback along with its x and y coordinates.
    * Whatever value the callback returns is set as the new color for that pixel, unless it returns the same color, in which case it's skipped.
    * Note that the format of the color received will be different depending on if the system is big or little endian.
    * It is expected that your callback will deal with endianess. If you'd rather Phaser did it then use processPixelRGB instead.
    * The callback will also be sent the pixels x and y coordinates respectively.
    *
    * @method Phaser.BitmapData#processPixel
    * @param {function} callback - The callback that will be sent each pixel color to be processed.
    * @param {object} callbackContext - The context under which the callback will be called.
    * @param {number} [x=0] - The x coordinate of the top-left of the region to process from.
    * @param {number} [y=0] - The y coordinate of the top-left of the region to process from.
    * @param {number} [width] - The width of the region to process.
    * @param {number} [height] - The height of the region to process.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    processPixel: function (callback, callbackContext, x, y, width, height) {

        if (x === undefined) { x = 0; }
        if (y === undefined) { y = 0; }
        if (width === undefined) { width = this.width; }
        if (height === undefined) { height = this.height; }

        var w = x + width;
        var h = y + height;
        var pixel = 0;
        var result = 0;
        var dirty = false;

        for (var ty = y; ty < h; ty++)
        {
            for (var tx = x; tx < w; tx++)
            {
                pixel = this.getPixel32(tx, ty);
                result = callback.call(callbackContext, pixel, tx, ty);

                if (result !== pixel)
                {
                    this.pixels[ty * this.width + tx] = result;
                    dirty = true;
                }
            }
        }

        if (dirty)
        {
            this.context.putImageData(this.imageData, 0, 0);
            this.dirty = true;
        }

        return this;

    },

    /**
    * Replaces all pixels matching one color with another. The color values are given as two sets of RGBA values.
    * An optional region parameter controls if the replacement happens in just a specific area of the BitmapData or the entire thing. 
    *
    * @method Phaser.BitmapData#replaceRGB
    * @param {number} r1 - The red color value to be replaced. Between 0 and 255.
    * @param {number} g1 - The green color value to be replaced. Between 0 and 255.
    * @param {number} b1 - The blue color value to be replaced. Between 0 and 255.
    * @param {number} a1 - The alpha color value to be replaced. Between 0 and 255.
    * @param {number} r2 - The red color value that is the replacement color. Between 0 and 255.
    * @param {number} g2 - The green color value that is the replacement color. Between 0 and 255.
    * @param {number} b2 - The blue color value that is the replacement color. Between 0 and 255.
    * @param {number} a2 - The alpha color value that is the replacement color. Between 0 and 255.
    * @param {Phaser.Rectangle} [region] - The area to perform the search over. If not given it will replace over the whole BitmapData.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    replaceRGB: function (r1, g1, b1, a1, r2, g2, b2, a2, region) {

        var sx = 0;
        var sy = 0;
        var w = this.width;
        var h = this.height;
        var source = Phaser.Color.packPixel(r1, g1, b1, a1);

        if (region !== undefined && region instanceof Phaser.Rectangle)
        {
            sx = region.x;
            sy = region.y;
            w = region.width;
            h = region.height;
        }

        for (var y = 0; y < h; y++)
        {
            for (var x = 0; x < w; x++)
            {
                if (this.getPixel32(sx + x, sy + y) === source)
                {
                    this.setPixel32(sx + x, sy + y, r2, g2, b2, a2, false);
                }
            }
        }

        this.context.putImageData(this.imageData, 0, 0);
        this.dirty = true;

        return this;

    },

    /**
    * Sets the hue, saturation and lightness values on every pixel in the given region, or the whole BitmapData if no region was specified.
    *
    * @method Phaser.BitmapData#setHSL
    * @param {number} [h=null] - The hue, in the range 0 - 1.
    * @param {number} [s=null] - The saturation, in the range 0 - 1.
    * @param {number} [l=null] - The lightness, in the range 0 - 1.
    * @param {Phaser.Rectangle} [region] - The area to perform the operation on. If not given it will run over the whole BitmapData.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    setHSL: function (h, s, l, region) {
        
        var bHaveH = h || h === 0;
        var bHaveS = s || s === 0;
        var bHaveL = l || l === 0;

        if (!bHaveH && !bHaveS && !bHaveL)
        {
            return;
        }

        if (region === undefined)
        {
            region = new Phaser.Rectangle(0, 0, this.width, this.height);
        }

        var pixel = Phaser.Color.createColor();

        for (var y = region.y; y < region.bottom; y++)
        {
            for (var x = region.x; x < region.right; x++)
            {
                Phaser.Color.unpackPixel(this.getPixel32(x, y), pixel, true);

                if (bHaveH)
                {
                    pixel.h = h;
                }

                if (bHaveS)
                {
                    pixel.s = s;
                }

                if (bHaveL)
                {
                    pixel.l = l;
                }

                Phaser.Color.HSLtoRGB(pixel.h, pixel.s, pixel.l, pixel);
                this.setPixel32(x, y, pixel.r, pixel.g, pixel.b, pixel.a, false);
            }
        }

        this.context.putImageData(this.imageData, 0, 0);
        this.dirty = true;

        return this;

    },

    /**
    * Shifts any or all of the hue, saturation and lightness values on every pixel in the given region, or the whole BitmapData if no region was specified.
    * Shifting will add the given value onto the current h, s and l values, not replace them.
    * The hue is wrapped to keep it within the range 0 to 1. Saturation and lightness are clamped to not exceed 1.
    *
    * @method Phaser.BitmapData#shiftHSL
    * @param {number} [h=null] - The amount to shift the hue by.
    * @param {number} [s=null] - The amount to shift the saturation by.
    * @param {number} [l=null] - The amount to shift the lightness by.
    * @param {Phaser.Rectangle} [region] - The area to perform the operation on. If not given it will run over the whole BitmapData.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    shiftHSL: function (h, s, l, region) {

        if (h === undefined || h === null) { h = false; }
        if (s === undefined || s === null) { s = false; }
        if (l === undefined || l === null) { l = false; }

        if (!h && !s && !l)
        {
            return;
        }

        if (region === undefined)
        {
            region = new Phaser.Rectangle(0, 0, this.width, this.height);
        }

        var pixel = Phaser.Color.createColor();

        for (var y = region.y; y < region.bottom; y++)
        {
            for (var x = region.x; x < region.right; x++)
            {
                Phaser.Color.unpackPixel(this.getPixel32(x, y), pixel, true);

                if (h)
                {
                    pixel.h = this.game.math.wrap(pixel.h + h, 0, 1);
                }

                if (s)
                {
                    pixel.s = this.game.math.clamp(pixel.s + s, 0, 1);
                }

                if (l)
                {
                    pixel.l = this.game.math.clamp(pixel.l + l, 0, 1);
                }

                Phaser.Color.HSLtoRGB(pixel.h, pixel.s, pixel.l, pixel);
                this.setPixel32(x, y, pixel.r, pixel.g, pixel.b, pixel.a, false);
            }
        }

        this.context.putImageData(this.imageData, 0, 0);
        this.dirty = true;

        return this;

    },

    /**
    * Sets the color of the given pixel to the specified red, green, blue and alpha values.
    *
    * @method Phaser.BitmapData#setPixel32
    * @param {number} x - The x coordinate of the pixel to be set. Must lay within the dimensions of this BitmapData.
    * @param {number} y - The y coordinate of the pixel to be set. Must lay within the dimensions of this BitmapData.
    * @param {number} red - The red color value, between 0 and 0xFF (255).
    * @param {number} green - The green color value, between 0 and 0xFF (255).
    * @param {number} blue - The blue color value, between 0 and 0xFF (255).
    * @param {number} alpha - The alpha color value, between 0 and 0xFF (255).
    * @param {boolean} [immediate=true] - If `true` the context.putImageData will be called and the dirty flag set.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    setPixel32: function (x, y, red, green, blue, alpha, immediate) {

        if (immediate === undefined) { immediate = true; }

        if (x >= 0 && x <= this.width && y >= 0 && y <= this.height)
        {
            if (Phaser.Device.LITTLE_ENDIAN)
            {
                this.pixels[y * this.width + x] = (alpha << 24) | (blue << 16) | (green << 8) | red;
            }
            else
            {
                this.pixels[y * this.width + x] = (red << 24) | (green << 16) | (blue << 8) | alpha;
            }

            if (immediate)
            {
                this.context.putImageData(this.imageData, 0, 0);
                this.dirty = true;
            }
        }

        return this;

    },

    /**
    * Sets the color of the given pixel to the specified red, green and blue values.
    *
    * @method Phaser.BitmapData#setPixel
    * @param {number} x - The x coordinate of the pixel to be set. Must lay within the dimensions of this BitmapData.
    * @param {number} y - The y coordinate of the pixel to be set. Must lay within the dimensions of this BitmapData.
    * @param {number} red - The red color value, between 0 and 0xFF (255).
    * @param {number} green - The green color value, between 0 and 0xFF (255).
    * @param {number} blue - The blue color value, between 0 and 0xFF (255).
    * @param {boolean} [immediate=true] - If `true` the context.putImageData will be called and the dirty flag set.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    setPixel: function (x, y, red, green, blue, immediate) {

        return this.setPixel32(x, y, red, green, blue, 255, immediate);

    },

    /**
    * Get the color of a specific pixel in the context into a color object.
    * If you have drawn anything to the BitmapData since it was created you must call BitmapData.update to refresh the array buffer,
    * otherwise this may return out of date color values, or worse - throw a run-time error as it tries to access an array element that doesn't exist.
    *
    * @method Phaser.BitmapData#getPixel
    * @param {number} x - The x coordinate of the pixel to be set. Must lay within the dimensions of this BitmapData.
    * @param {number} y - The y coordinate of the pixel to be set. Must lay within the dimensions of this BitmapData.
    * @param {object} [out] - An object into which 4 properties will be created: r, g, b and a. If not provided a new object will be created.
    * @return {object} An object with the red, green, blue and alpha values set in the r, g, b and a properties.
    */
    getPixel: function (x, y, out) {

        if (!out)
        {
            out = Phaser.Color.createColor();
        }

        var index = ~~(x + (y * this.width));

        index *= 4;

        out.r = this.data[index];
        out.g = this.data[++index];
        out.b = this.data[++index];
        out.a = this.data[++index];

        return out;

    },

    /**
    * Get the color of a specific pixel including its alpha value.
    * If you have drawn anything to the BitmapData since it was created you must call BitmapData.update to refresh the array buffer,
    * otherwise this may return out of date color values, or worse - throw a run-time error as it tries to access an array element that doesn't exist.
    * Note that on little-endian systems the format is 0xAABBGGRR and on big-endian the format is 0xRRGGBBAA.
    *
    * @method Phaser.BitmapData#getPixel32
    * @param {number} x - The x coordinate of the pixel to be set. Must lay within the dimensions of this BitmapData.
    * @param {number} y - The y coordinate of the pixel to be set. Must lay within the dimensions of this BitmapData.
    * @return {number} A native color value integer (format: 0xAARRGGBB)
    */
    getPixel32: function (x, y) {

        if (x >= 0 && x <= this.width && y >= 0 && y <= this.height)
        {
            return this.pixels[y * this.width + x];
        }

    },

    /**
    * Get the color of a specific pixel including its alpha value as a color object containing r,g,b,a and rgba properties.
    * If you have drawn anything to the BitmapData since it was created you must call BitmapData.update to refresh the array buffer,
    * otherwise this may return out of date color values, or worse - throw a run-time error as it tries to access an array element that doesn't exist.
    *
    * @method Phaser.BitmapData#getPixelRGB
    * @param {number} x - The x coordinate of the pixel to be set. Must lay within the dimensions of this BitmapData.
    * @param {number} y - The y coordinate of the pixel to be set. Must lay within the dimensions of this BitmapData.
    * @param {object} [out] - An object into which 3 properties will be created: r, g and b. If not provided a new object will be created.
    * @param {boolean} [hsl=false] - Also convert the rgb values into hsl?
    * @param {boolean} [hsv=false] - Also convert the rgb values into hsv?
    * @return {object} An object with the red, green and blue values set in the r, g and b properties.
    */
    getPixelRGB: function (x, y, out, hsl, hsv) {

        return Phaser.Color.unpackPixel(this.getPixel32(x, y), out, hsl, hsv);

    },

    /**
    * Gets all the pixels from the region specified by the given Rectangle object.
    *
    * @method Phaser.BitmapData#getPixels
    * @param {Phaser.Rectangle} rect - The Rectangle region to get.
    * @return {ImageData} Returns a ImageData object containing a Uint8ClampedArray data property.
    */
    getPixels: function (rect) {

        return this.context.getImageData(rect.x, rect.y, rect.width, rect.height);

    },

    /**
    * Scans the BitmapData, pixel by pixel, until it encounters a pixel that isn't transparent (i.e. has an alpha value > 0).
    * It then stops scanning and returns an object containing the color of the pixel in r, g and b properties and the location in the x and y properties.
    * 
    * The direction parameter controls from which direction it should start the scan:
    * 
    * 0 = top to bottom
    * 1 = bottom to top
    * 2 = left to right
    * 3 = right to left
    *
    * @method Phaser.BitmapData#getFirstPixel
    * @param {number} [direction=0] - The direction in which to scan for the first pixel. 0 = top to bottom, 1 = bottom to top, 2 = left to right and 3 = right to left.
    * @return {object} Returns an object containing the color of the pixel in the `r`, `g` and `b` properties and the location in the `x` and `y` properties.
    */
    getFirstPixel: function (direction) {

        if (direction === undefined) { direction = 0; }

        var pixel = Phaser.Color.createColor();

        var x = 0;
        var y = 0;
        var v = 1;
        var scan = false;

        if (direction === 1)
        {
            v = -1;
            y = this.height;
        }
        else if (direction === 3)
        {
            v = -1;
            x = this.width;
        }

        do {

            Phaser.Color.unpackPixel(this.getPixel32(x, y), pixel);

            if (direction === 0 || direction === 1)
            {
                //  Top to Bottom / Bottom to Top
                x++;

                if (x === this.width)
                {
                    x = 0;
                    y += v;

                    if (y >= this.height || y <= 0)
                    {
                        scan = true;
                    }
                }
            }
            else if (direction === 2 || direction === 3)
            {
                //  Left to Right / Right to Left
                y++;

                if (y === this.height)
                {
                    y = 0;
                    x += v;

                    if (x >= this.width || x <= 0)
                    {
                        scan = true;
                    }
                }
            }
        }
        while (pixel.a === 0 && !scan);

        pixel.x = x;
        pixel.y = y;

        return pixel;

    },

    /**
    * Scans the BitmapData and calculates the bounds. This is a rectangle that defines the extent of all non-transparent pixels.
    * The rectangle returned will extend from the top-left of the image to the bottom-right, excluding transparent pixels.
    *
    * @method Phaser.BitmapData#getBounds
    * @param {Phaser.Rectangle} [rect] - If provided this Rectangle object will be populated with the bounds, otherwise a new object will be created.
    * @return {Phaser.Rectangle} A Rectangle whose dimensions encompass the full extent of non-transparent pixels in this BitmapData.
    */
    getBounds: function (rect) {

        if (rect === undefined) { rect = new Phaser.Rectangle(); }

        rect.x = this.getFirstPixel(2).x;

        //  If we hit this, there's no point scanning any more, the image is empty
        if (rect.x === this.width)
        {
            return rect.setTo(0, 0, 0, 0);
        }

        rect.y = this.getFirstPixel(0).y;
        rect.width = (this.getFirstPixel(3).x - rect.x) + 1;
        rect.height = (this.getFirstPixel(1).y - rect.y) + 1;

        return rect;

    },

    /**
    * Creates a new Phaser.Image object, assigns this BitmapData to be its texture, adds it to the world then returns it.
    *
    * @method Phaser.BitmapData#addToWorld
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
     * Copies a rectangular area from the source object to this BitmapData. If you give `null` as the source it will copy from itself.
     * 
     * You can optionally resize, translate, rotate, scale, alpha or blend as it's drawn.
     * 
     * All rotation, scaling and drawing takes place around the regions center point by default, but can be changed with the anchor parameters.
     * 
     * Note that the source image can also be this BitmapData, which can create some interesting effects.
     * 
     * This method has a lot of parameters for maximum control.
     * You can use the more friendly methods like `copyRect` and `draw` to avoid having to remember them all.
     * 
     * You may prefer to use `copyTransform` if you're simply trying to draw a Sprite to this BitmapData,
     * and don't wish to translate, scale or rotate it from its original values.
     *
     * @method Phaser.BitmapData#copy
     * @param {Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapData|Phaser.RenderTexture|Image|HTMLCanvasElement|string} [source] - The source to copy from. If you give a string it will try and find the Image in the Game.Cache first. This is quite expensive so try to provide the image itself.
     * @param {number} [x=0] - The x coordinate representing the top-left of the region to copy from the source image.
     * @param {number} [y=0] - The y coordinate representing the top-left of the region to copy from the source image.
     * @param {number} [width] - The width of the region to copy from the source image. If not specified it will use the full source image width.
     * @param {number} [height] - The height of the region to copy from the source image. If not specified it will use the full source image height.
     * @param {number} [tx] - The x coordinate to translate to before drawing. If not specified it will default to the `x` parameter. If `null` and `source` is a Display Object, it will default to `source.x`.
     * @param {number} [ty] - The y coordinate to translate to before drawing. If not specified it will default to the `y` parameter. If `null` and `source` is a Display Object, it will default to `source.y`.
     * @param {number} [newWidth] - The new width of the block being copied. If not specified it will default to the `width` parameter.
     * @param {number} [newHeight] - The new height of the block being copied. If not specified it will default to the `height` parameter.
     * @param {number} [rotate=0] - The angle in radians to rotate the block to before drawing. Rotation takes place around the center by default, but can be changed with the `anchor` parameters.
     * @param {number} [anchorX=0] - The anchor point around which the block is rotated and scaled. A value between 0 and 1, where 0 is the top-left and 1 is bottom-right.
     * @param {number} [anchorY=0] - The anchor point around which the block is rotated and scaled. A value between 0 and 1, where 0 is the top-left and 1 is bottom-right.
     * @param {number} [scaleX=1] - The horizontal scale factor of the block. A value of 1 means no scaling. 2 would be twice the size, and so on.
     * @param {number} [scaleY=1] - The vertical scale factor of the block. A value of 1 means no scaling. 2 would be twice the size, and so on.
     * @param {number} [alpha=1] - The alpha that will be set on the context before drawing. A value between 0 (fully transparent) and 1, opaque.
     * @param {string} [blendMode=null] - The composite blend mode that will be used when drawing. The default is no blend mode at all. This is a Canvas globalCompositeOperation value such as 'lighter' or 'xor'.
     * @param {boolean} [roundPx=false] - Should the x and y values be rounded to integers before drawing? This prevents anti-aliasing in some instances.
     * @return {Phaser.BitmapData} This BitmapData object for method chaining.
     */
    copy: function (source, x, y, width, height, tx, ty, newWidth, newHeight, rotate, anchorX, anchorY, scaleX, scaleY, alpha, blendMode, roundPx) {

        if (source === undefined || source === null) { source = this; }

        if (source instanceof Phaser.RenderTexture || source instanceof PIXI.RenderTexture)
        {
            source = source.getCanvas();
        }

        this._image = source;

        if (source instanceof Phaser.Sprite || source instanceof Phaser.Image || source instanceof Phaser.Text || source instanceof PIXI.Sprite)
        {
            //  Copy over sprite values
            this._pos.set(source.texture.crop.x, source.texture.crop.y);
            this._size.set(source.texture.crop.width, source.texture.crop.height);
            this._scale.set(source.scale.x, source.scale.y);
            this._anchor.set(source.anchor.x, source.anchor.y);
            this._rotate = source.rotation;
            this._alpha.current = source.alpha;

            if (source.texture instanceof Phaser.RenderTexture || source.texture instanceof PIXI.RenderTexture)
            {
                this._image = source.texture.getCanvas();
            }
            else
            {
                this._image = source.texture.baseTexture.source;
            }

            if (tx === undefined || tx === null) { tx = source.x; }
            if (ty === undefined || ty === null) { ty = source.y; }

            if (source.texture.trim)
            {
                //  Offset the translation coordinates by the trim amount
                tx += source.texture.trim.x - source.anchor.x * source.texture.trim.width;
                ty += source.texture.trim.y - source.anchor.y * source.texture.trim.height;
            }

            if (source.tint !== 0xFFFFFF)
            {
                if (source.cachedTint !== source.tint)
                {
                    source.cachedTint = source.tint;
                    source.tintedTexture = PIXI.CanvasTinter.getTintedTexture(source, source.tint);
                }

                this._image = source.tintedTexture;
                this._pos.set(0);
            }
        }
        else
        {
            //  Reset
            this._pos.set(0);
            this._scale.set(1);
            this._anchor.set(0);
            this._rotate = 0;
            this._alpha.current = 1;

            if (source instanceof Phaser.BitmapData)
            {
                this._image = source.canvas;
            }
            else if (typeof source === 'string')
            {
                source = this.game.cache.getImage(source);

                if (source === null)
                {
                    return;
                }
                else
                {
                    this._image = source;
                }
            }

            this._size.set(this._image.width, this._image.height);
        }

        //  The source region to copy from
        if (x === undefined || x === null) { x = 0; }
        if (y === undefined || y === null) { y = 0; }

        //  If they set a width/height then we override the frame values with them
        if (width)
        {
            this._size.x = width;
        }

        if (height)
        {
            this._size.y = height;
        }

        //  The destination region to copy to
        if (tx === undefined || tx === null) { tx = x; }
        if (ty === undefined || ty === null) { ty = y; }
        if (newWidth === undefined || newWidth === null) { newWidth = this._size.x; }
        if (newHeight === undefined || newHeight === null) { newHeight = this._size.y; }

        //  Rotation - if set this will override any potential Sprite value
        if (typeof rotate === 'number')
        {
            this._rotate = rotate;
        }

        //  Anchor - if set this will override any potential Sprite value
        if (typeof anchorX === 'number')
        {
            this._anchor.x = anchorX;
        }

        if (typeof anchorY === 'number')
        {
            this._anchor.y = anchorY;
        }

        //  Scaling - if set this will override any potential Sprite value
        if (typeof scaleX === 'number')
        {
            this._scale.x = scaleX;
        }

        if (typeof scaleY === 'number')
        {
            this._scale.y = scaleY;
        }

        //  Effects
        if (typeof alpha === 'number')
        {
            this._alpha.current = alpha;
        }

        if (blendMode === undefined) { blendMode = null; }
        if (roundPx === undefined) { roundPx = false; }

        if (this._alpha.current <= 0 || this._scale.x === 0 || this._scale.y === 0 || this._size.x === 0 || this._size.y === 0)
        {
            //  Why bother wasting CPU cycles drawing something you can't see?
            return;
        }

        var ctx = this.context;

        this._alpha.prev = ctx.globalAlpha;

        ctx.save();

        ctx.globalAlpha = this._alpha.current;

        if (blendMode)
        {
            this.op = blendMode;
        }

        if (roundPx)
        {
            tx |= 0;
            ty |= 0;
        }

        //  Doesn't work fully with children, or nested scale + rotation transforms (see copyTransform)
        ctx.translate(tx, ty);

        ctx.scale(this._scale.x, this._scale.y);

        ctx.rotate(this._rotate);

        ctx.drawImage(this._image, this._pos.x + x, this._pos.y + y, this._size.x, this._size.y, -newWidth * this._anchor.x, -newHeight * this._anchor.y, newWidth, newHeight);

        //  Carry on ...

        ctx.restore();

        ctx.globalAlpha = this._alpha.prev;

        this.dirty = true;

        return this;

    },

    /**
    * Draws the given `source` Game Object to this BitmapData, using its `worldTransform` property to set the
    * position, scale and rotation of where it is drawn. This function is used internally by `drawGroup`.
    * It takes the objects tint and scale mode into consideration before drawing.
    *
    * You can optionally specify Blend Mode and Round Pixels arguments.
    * 
    * @method Phaser.BitmapData#copyTransform
    * @param {Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapData|Phaser.BitmapText} [source] - The Game Object to draw.
    * @param {string} [blendMode=null] - The composite blend mode that will be used when drawing. The default is no blend mode at all. This is a Canvas globalCompositeOperation value such as 'lighter' or 'xor'.
    * @param {boolean} [roundPx=false] - Should the x and y values be rounded to integers before drawing? This prevents anti-aliasing in some instances.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    copyTransform: function (source, blendMode, roundPx) {

        if (blendMode === undefined) { blendMode = null; }
        if (roundPx === undefined) { roundPx = false; }

        if (!source.hasOwnProperty('worldTransform') || !source.worldVisible || source.worldAlpha === 0)
        {
            return this;
        }

        var wt = source.worldTransform;

        this._pos.set(source.texture.crop.x, source.texture.crop.y);
        this._size.set(source.texture.crop.width, source.texture.crop.height);

        if (wt.a === 0 || wt.d === 0 || this._size.x === 0 || this._size.y === 0)
        {
             // Why bother wasting CPU cycles drawing something you can't see?
            return this;
        }

        if (source.texture instanceof Phaser.RenderTexture || source.texture instanceof PIXI.RenderTexture)
        {
            this._image = source.texture.getCanvas();
        }
        else
        {
            this._image = source.texture.baseTexture.source;
        }

        var tx = wt.tx;
        var ty = wt.ty;

        if (source.texture.trim)
        {
            //  Offset the translation coordinates by the trim amount
            tx += source.texture.trim.x - source.anchor.x * source.texture.trim.width;
            ty += source.texture.trim.y - source.anchor.y * source.texture.trim.height;
        }

        if (source.tint !== 0xFFFFFF)
        {
            if (source.cachedTint !== source.tint)
            {
                source.cachedTint = source.tint;
                source.tintedTexture = PIXI.CanvasTinter.getTintedTexture(source, source.tint);
            }

            this._image = source.tintedTexture;
            this._pos.set(0);
        }

        if (roundPx)
        {
            tx |= 0;
            ty |= 0;
        }

        var ctx = this.context;

        this._alpha.prev = ctx.globalAlpha;

        ctx.save();

        ctx.globalAlpha = this._alpha.current;

        if (blendMode)
        {
            this.op = blendMode;
        }

        ctx[this.smoothProperty] = (source.texture.baseTexture.scaleMode === PIXI.scaleModes.LINEAR);

        ctx.setTransform(wt.a, wt.b, wt.c, wt.d, tx, ty);

        ctx.drawImage(this._image,
            this._pos.x,
            this._pos.y,
            this._size.x,
            this._size.y,
            -this._size.x * source.anchor.x,
            -this._size.y * source.anchor.y,
            this._size.x,
            this._size.y);

        ctx.restore();

        ctx.globalAlpha = this._alpha.prev;

        this.dirty = true;

        return this;

    },

    /**
    * Copies the area defined by the Rectangle parameter from the source image to this BitmapData at the given location.
    *
    * @method Phaser.BitmapData#copyRect
    * @param {Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapData|Phaser.RenderTexture|Image|string} source - The Image to copy from. If you give a string it will try and find the Image in the Game.Cache.
    * @param {Phaser.Rectangle} area - The Rectangle region to copy from the source image.
    * @param {number} x - The destination x coordinate to copy the image to.
    * @param {number} y - The destination y coordinate to copy the image to.
    * @param {number} [alpha=1] - The alpha that will be set on the context before drawing. A value between 0 (fully transparent) and 1, opaque.
    * @param {string} [blendMode=null] - The composite blend mode that will be used when drawing. The default is no blend mode at all. This is a Canvas globalCompositeOperation value such as 'lighter' or 'xor'.
    * @param {boolean} [roundPx=false] - Should the x and y values be rounded to integers before drawing? This prevents anti-aliasing in some instances.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    copyRect: function (source, area, x, y, alpha, blendMode, roundPx) {

        return this.copy(source, area.x, area.y, area.width, area.height, x, y, area.width, area.height, 0, 0, 0, 1, 1, alpha, blendMode, roundPx);

    },

    /**
    * Draws the given Phaser.Sprite, Phaser.Image or Phaser.Text to this BitmapData at the coordinates specified.
    * You can use the optional width and height values to 'stretch' the sprite as it is drawn. This uses drawImage stretching, not scaling.
    * 
    * The children will be drawn at their `x` and `y` world space coordinates. If this is outside the bounds of the BitmapData they won't be visible.
    * When drawing it will take into account the rotation, scale, scaleMode, alpha and tint values.
    * 
    * Note: You should ensure that at least 1 full update has taken place before calling this, 
    * otherwise the objects are likely to render incorrectly, if at all.
    * You can trigger an update yourself by calling `stage.updateTransform()` before calling `draw`.
    *
    * @method Phaser.BitmapData#draw
    * @param {Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.RenderTexture} source - The Sprite, Image or Text object to draw onto this BitmapData.
    * @param {number} [x=0] - The x coordinate to translate to before drawing. If not specified it will default to `source.x`.
    * @param {number} [y=0] - The y coordinate to translate to before drawing. If not specified it will default to `source.y`.
    * @param {number} [width] - The new width of the Sprite being copied. If not specified it will default to `source.width`.
    * @param {number} [height] - The new height of the Sprite being copied. If not specified it will default to `source.height`.
    * @param {string} [blendMode=null] - The composite blend mode that will be used when drawing. The default is no blend mode at all. This is a Canvas globalCompositeOperation value such as 'lighter' or 'xor'.
    * @param {boolean} [roundPx=false] - Should the x and y values be rounded to integers before drawing? This prevents anti-aliasing in some instances.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    draw: function (source, x, y, width, height, blendMode, roundPx) {

        //  By specifying null for most parameters it will tell `copy` to use the Sprite values instead, which is what we want here
        return this.copy(source, null, null, null, null, x, y, width, height, null, null, null, null, null, null, blendMode, roundPx);

    },

    /**
    * Draws the immediate children of a Phaser.Group to this BitmapData.
    * 
    * It's perfectly valid to pass in `game.world` as the Group, and it will iterate through the entire display list.
    * 
    * Children are drawn _only_ if they have their `exists` property set to `true`, and have image, or RenderTexture, based Textures.
    * 
    * The children will be drawn at their `x` and `y` world space coordinates. If this is outside the bounds of the BitmapData they won't be visible.
    * When drawing it will take into account the rotation, scale, scaleMode, alpha and tint values.
    * 
    * Note: You should ensure that at least 1 full update has taken place before calling this, 
    * otherwise the objects are likely to render incorrectly, if at all.
    * You can trigger an update yourself by calling `stage.updateTransform()` before calling `drawGroup`.
    *
    * @method Phaser.BitmapData#drawGroup
    * @param {Phaser.Group} group - The Group to draw onto this BitmapData. Can also be Phaser.World.
    * @param {string} [blendMode=null] - The composite blend mode that will be used when drawing. The default is no blend mode at all. This is a Canvas globalCompositeOperation value such as 'lighter' or 'xor'.
    * @param {boolean} [roundPx=false] - Should the x and y values be rounded to integers before drawing? This prevents anti-aliasing in some instances.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    drawGroup: function (group, blendMode, roundPx) {

        if (group.total > 0)
        {
            group.forEachExists(this.drawGroupProxy, this, blendMode, roundPx);
        }

        return this;

    },

    /**
    * A proxy for drawGroup that handles child iteration for more complex Game Objects.
    * 
    * @method Phaser.BitmapData#drawGroupProxy
    * @private
    * @param {Phaser.Sprite|Phaser.Image|Phaser.BitmapText} child - The child to draw.
    * @param {string} [blendMode=null] - The composite blend mode that will be used when drawing. The default is no blend mode at all. This is a Canvas globalCompositeOperation value such as 'lighter' or 'xor'.
    * @param {boolean} [roundPx=false] - Should the x and y values be rounded to integers before drawing? This prevents anti-aliasing in some instances.
    */
    drawGroupProxy: function (child, blendMode, roundPx) {

        if (child.hasOwnProperty('texture'))
        {
            this.copyTransform(child, blendMode, roundPx);
        }

        if (child.type === Phaser.GROUP && child.exists)
        {
            this.drawGroup(child, blendMode, roundPx);
        }
        else
        {
            if (child.hasOwnProperty('children') && child.children.length > 0)
            {
                for (var i = 0; i < child.children.length; i++)
                {
                    if (child.children[i].exists)
                    {
                        this.copyTransform(child.children[i], blendMode, roundPx);
                    }
                }
            }
        }

    },

    /**
    * Draws the Game Object or Group to this BitmapData and then recursively iterates through all of its children.
    * 
    * If a child has an `exists` property then it (and its children) will be only be drawn if exists is `true`.
    * 
    * The children will be drawn at their `x` and `y` world space coordinates. If this is outside the bounds of the BitmapData 
    * they won't be drawn. Depending on your requirements you may need to resize the BitmapData in advance to match the 
    * bounds of the top-level Game Object.
    * 
    * When drawing it will take into account the child's world rotation, scale and alpha values.
    *
    * It's perfectly valid to pass in `game.world` as the parent object, and it will iterate through the entire display list.
    * 
    * Note: If you are trying to grab your entire game at the start of a State then you should ensure that at least 1 full update
    * has taken place before doing so, otherwise all of the objects will render with incorrect positions and scales. You can 
    * trigger an update yourself by calling `stage.updateTransform()` before calling `drawFull`.
    *
    * @method Phaser.BitmapData#drawFull
    * @param {Phaser.World|Phaser.Group|Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapText} parent - The Game Object to draw onto this BitmapData and then recursively draw all of its children.
    * @param {string} [blendMode=null] - The composite blend mode that will be used when drawing. The default is no blend mode at all. This is a Canvas globalCompositeOperation value such as 'lighter' or 'xor'.
    * @param {boolean} [roundPx=false] - Should the x and y values be rounded to integers before drawing? This prevents anti-aliasing in some instances.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    drawFull: function (parent, blendMode, roundPx) {

        if (parent.worldVisible === false || parent.worldAlpha === 0 || (parent.hasOwnProperty('exists') && parent.exists === false))
        {
            return this;
        }

        if (parent.type !== Phaser.GROUP && parent.type !== Phaser.EMITTER && parent.type !== Phaser.BITMAPTEXT)
        {
            if (parent.type === Phaser.GRAPHICS)
            {
                var bounds = parent.getBounds();
                this.ctx.save();
                this.ctx.translate(bounds.x, bounds.y);
                PIXI.CanvasGraphics.renderGraphics(parent, this.ctx);
                this.ctx.restore();
            }
            else
            {
                this.copy(parent, null, null, null, null, parent.worldPosition.x, parent.worldPosition.y, null, null, parent.worldRotation, null, null, parent.worldScale.x, parent.worldScale.y, parent.worldAlpha, blendMode, roundPx);
            }
        }

        if (parent.children)
        {
            for (var i = 0; i < parent.children.length; i++)
            {
                this.drawFull(parent.children[i], blendMode, roundPx);
            }
        }

        return this;

    },

    /**
    * Sets the shadow properties of this BitmapDatas context which will affect all draw operations made to it.
    * You can cancel an existing shadow by calling this method and passing no parameters.
    * Note: At the time of writing (October 2014) Chrome still doesn't support shadowBlur used with drawImage.
    *
    * @method Phaser.BitmapData#shadow
    * @param {string} color - The color of the shadow, given in a CSS format, i.e. `#000000` or `rgba(0,0,0,1)`. If `null` or `undefined` the shadow will be reset.
    * @param {number} [blur=5] - The amount the shadow will be blurred by. Low values = a crisp shadow, high values = a softer shadow.
    * @param {number} [x=10] - The horizontal offset of the shadow in pixels.
    * @param {number} [y=10] - The vertical offset of the shadow in pixels.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    shadow: function (color, blur, x, y) {

        var ctx = this.context;

        if (color === undefined || color === null)
        {
            ctx.shadowColor = 'rgba(0,0,0,0)';
        }
        else
        {
            ctx.shadowColor = color;
            ctx.shadowBlur = blur || 5;
            ctx.shadowOffsetX = x || 10;
            ctx.shadowOffsetY = y || 10;
        }
        
        return this;

    },

    /**
    * Draws the image onto this BitmapData using an image as an alpha mask.
    *
    * @method Phaser.BitmapData#alphaMask
    * @param {Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapData|Image|HTMLCanvasElement|string} source - The source to copy from. If you give a string it will try and find the Image in the Game.Cache first. This is quite expensive so try to provide the image itself.
    * @param {Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapData|Image|HTMLCanvasElement|string} [mask] - The object to be used as the mask. If you give a string it will try and find the Image in the Game.Cache first. This is quite expensive so try to provide the image itself. If you don't provide a mask it will use this BitmapData as the mask.
    * @param {Phaser.Rectangle} [sourceRect] - A Rectangle where x/y define the coordinates to draw the Source image to and width/height define the size.
    * @param {Phaser.Rectangle} [maskRect] - A Rectangle where x/y define the coordinates to draw the Mask image to and width/height define the size.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    alphaMask: function (source, mask, sourceRect, maskRect) {

        if (maskRect === undefined || maskRect === null)
        {
            this.draw(mask).blendSourceAtop();
        }
        else
        {
            this.draw(mask, maskRect.x, maskRect.y, maskRect.width, maskRect.height).blendSourceAtop();
        }

        if (sourceRect === undefined || sourceRect === null)
        {
            this.draw(source).blendReset();
        }
        else
        {
            this.draw(source, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height).blendReset();
        }

        return this;

    },

    /**
    * Scans this BitmapData for all pixels matching the given r,g,b values and then draws them into the given destination BitmapData.
    * The original BitmapData remains unchanged.
    * The destination BitmapData must be large enough to receive all of the pixels that are scanned unless the 'resize' parameter is true.
    * Although the destination BitmapData is returned from this method, it's actually modified directly in place, meaning this call is perfectly valid:
    * `picture.extract(mask, r, g, b)`
    * You can specify optional r2, g2, b2 color values. If given the pixel written to the destination bitmap will be of the r2, g2, b2 color.
    * If not given it will be written as the same color it was extracted. You can provide one or more alternative colors, allowing you to tint
    * the color during extraction.
    *
    * @method Phaser.BitmapData#extract
    * @param {Phaser.BitmapData} destination - The BitmapData that the extracted pixels will be drawn to.
    * @param {number} r - The red color component, in the range 0 - 255.
    * @param {number} g - The green color component, in the range 0 - 255.
    * @param {number} b - The blue color component, in the range 0 - 255.
    * @param {number} [a=255] - The alpha color component, in the range 0 - 255 that the new pixel will be drawn at.
    * @param {boolean} [resize=false] - Should the destination BitmapData be resized to match this one before the pixels are copied?
    * @param {number} [r2] - An alternative red color component to be written to the destination, in the range 0 - 255.
    * @param {number} [g2] - An alternative green color component to be written to the destination, in the range 0 - 255.
    * @param {number} [b2] - An alternative blue color component to be written to the destination, in the range 0 - 255.
    * @returns {Phaser.BitmapData} The BitmapData that the extract pixels were drawn on.
    */
    extract: function (destination, r, g, b, a, resize, r2, g2, b2) {

        if (a === undefined) { a = 255; }
        if (resize === undefined) { resize = false; }
        if (r2 === undefined) { r2 = r; }
        if (g2 === undefined) { g2 = g; }
        if (b2 === undefined) { b2 = b; }

        if (resize)
        {
            destination.resize(this.width, this.height);
        }

        this.processPixelRGB(
            function (pixel, x, y)
            {
                if (pixel.r === r && pixel.g === g && pixel.b === b)
                {
                    destination.setPixel32(x, y, r2, g2, b2, a, false);
                }
                return false;
            },
            this);

        destination.context.putImageData(destination.imageData, 0, 0);
        destination.dirty = true;

        return destination;

    },

    /**
    * Draws a filled Rectangle to the BitmapData at the given x, y coordinates and width / height in size.
    *
    * @method Phaser.BitmapData#rect
    * @param {number} x - The x coordinate of the top-left of the Rectangle.
    * @param {number} y - The y coordinate of the top-left of the Rectangle.
    * @param {number} width - The width of the Rectangle.
    * @param {number} height - The height of the Rectangle.
    * @param {string} [fillStyle] - If set the context fillStyle will be set to this value before the rect is drawn.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    rect: function (x, y, width, height, fillStyle) {

        if (typeof fillStyle !== 'undefined')
        {
            this.context.fillStyle = fillStyle;
        }

        this.context.fillRect(x, y, width, height);

        return this;

    },

    /**
    * Draws text to the BitmapData in the given font and color.
    * The default font is 14px Courier, so useful for quickly drawing debug text.
    * If you need to do a lot of font work to this BitmapData we'd recommend implementing your own text draw method.
    *
    * @method Phaser.BitmapData#text
    * @param {string} text - The text to write to the BitmapData.
    * @param {number} x - The x coordinate of the top-left of the text string.
    * @param {number} y - The y coordinate of the top-left of the text string.
    * @param {string} [font='14px Courier'] - The font. This is passed directly to Context.font, so anything that can support, this can.
    * @param {string} [color='rgb(255,255,255)'] - The color the text will be drawn in.
    * @param {boolean} [shadow=true] - Draw a single pixel black shadow below the text (offset by text.x/y + 1)
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    text: function (text, x, y, font, color, shadow) {

        if (x === undefined) { x = 0; }
        if (y === undefined) { y = 0; }
        if (font === undefined) { font = '14px Courier'; }
        if (color === undefined) { color = 'rgb(255,255,255)'; }
        if (shadow === undefined) { shadow = true; }

        var ctx = this.context;
        var prevFont = ctx.font;

        ctx.font = font;

        if (shadow)
        {
            ctx.fillStyle = 'rgb(0,0,0)';
            ctx.fillText(text, x + 1, y + 1);
        }
        
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);

        ctx.font = prevFont;
        
        return this;

    },

    /**
    * Draws a filled Circle to the BitmapData at the given x, y coordinates and radius in size.
    *
    * @method Phaser.BitmapData#circle
    * @param {number} x - The x coordinate to draw the Circle at. This is the center of the circle.
    * @param {number} y - The y coordinate to draw the Circle at. This is the center of the circle.
    * @param {number} radius - The radius of the Circle in pixels. The radius is half the diameter.
    * @param {string} [fillStyle] - If set the context fillStyle will be set to this value before the circle is drawn.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    circle: function (x, y, radius, fillStyle) {

        var ctx = this.context;

        if (fillStyle !== undefined)
        {
            ctx.fillStyle = fillStyle;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.closePath();

        ctx.fill();

        return this;

    },

    /**
    * Draws a line between the coordinates given in the color and thickness specified.
    *
    * @method Phaser.BitmapData#line
    * @param {number} x1 - The x coordinate to start the line from.
    * @param {number} y1 - The y coordinate to start the line from.
    * @param {number} x2 - The x coordinate to draw the line to.
    * @param {number} y2 - The y coordinate to draw the line to.
    * @param {string} [color='#fff'] - The stroke color that the line will be drawn in.
    * @param {number} [width=1] - The line thickness.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    line: function (x1, y1, x2, y2, color, width) {

        if (color === undefined) { color = '#fff'; }
        if (width === undefined) { width = 1; }

        var ctx = this.context;

        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.stroke();

        ctx.closePath();

        return this;

    },

    /**
    * Takes the given Line object and image and renders it to this BitmapData as a repeating texture line.
    *
    * @method Phaser.BitmapData#textureLine
    * @param {Phaser.Line} line - A Phaser.Line object that will be used to plot the start and end of the line.
    * @param {string|Image} image - The key of an image in the Phaser.Cache to use as the texture for this line, or an actual Image.
    * @param {string} [repeat='repeat-x'] - The pattern repeat mode to use when drawing the line. Either `repeat`, `repeat-x` or `no-repeat`.
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    textureLine: function (line, image, repeat) {

        if (repeat === undefined) { repeat = 'repeat-x'; }

        if (typeof image === 'string')
        {
            image = this.game.cache.getImage(image);

            if (!image)
            {
                return;
            }
        }

        var width = line.length;

        if (repeat === 'no-repeat' && width > image.width)
        {
            width = image.width;
        }

        var ctx = this.context;

        ctx.fillStyle = ctx.createPattern(image, repeat);

        this._circle = new Phaser.Circle(line.start.x, line.start.y, image.height);

        this._circle.circumferencePoint(line.angle - 1.5707963267948966, false, this._pos);

        ctx.save();
        ctx.translate(this._pos.x, this._pos.y);
        ctx.rotate(line.angle);
        ctx.fillRect(0, 0, width, image.height);
        ctx.restore();

        this.dirty = true;

        return this;

    },

    /**
    * If the game is running in WebGL this will push the texture up to the GPU if it's dirty.
    * This is called automatically if the BitmapData is being used by a Sprite, otherwise you need to remember to call it in your render function.
    * If you wish to suppress this functionality set BitmapData.disableTextureUpload to `true`.
    *
    * @method Phaser.BitmapData#render
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    render: function () {

        if (!this.disableTextureUpload && this.dirty)
        {
            this.baseTexture.dirty();
            this.dirty = false;
        }

        return this;

    },

    /**
    * Destroys this BitmapData and puts the canvas it was using back into the canvas pool for re-use.
    *
    * @method Phaser.BitmapData#destroy
    */
    destroy: function () {

        this.frameData.destroy();

        this.texture.destroy(true);

        PIXI.CanvasPool.remove(this);

    },

    /**
    * Resets the blend mode (effectively sets it to 'source-over')
    *
    * @method Phaser.BitmapData#blendReset
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendReset: function () {

        this.op = 'source-over';
        return this;

    },

    /**
    * Sets the blend mode to 'source-over'
    *
    * @method Phaser.BitmapData#blendSourceOver
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendSourceOver: function () {

        this.op = 'source-over';
        return this;

    },

    /**
    * Sets the blend mode to 'source-in'
    *
    * @method Phaser.BitmapData#blendSourceIn
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendSourceIn: function () {

        this.op = 'source-in';
        return this;

    },

    /**
    * Sets the blend mode to 'source-out'
    *
    * @method Phaser.BitmapData#blendSourceOut
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendSourceOut: function () {

        this.op = 'source-out';
        return this;

    },

    /**
    * Sets the blend mode to 'source-atop'
    *
    * @method Phaser.BitmapData#blendSourceAtop
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendSourceAtop: function () {

        this.op = 'source-atop';
        return this;

    },

    /**
    * Sets the blend mode to 'destination-over'
    *
    * @method Phaser.BitmapData#blendDestinationOver
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendDestinationOver: function () {

        this.op = 'destination-over';
        return this;

    },

    /**
    * Sets the blend mode to 'destination-in'
    *
    * @method Phaser.BitmapData#blendDestinationIn
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendDestinationIn: function () {

        this.op = 'destination-in';
        return this;

    },

    /**
    * Sets the blend mode to 'destination-out'
    *
    * @method Phaser.BitmapData#blendDestinationOut
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendDestinationOut: function () {

        this.op = 'destination-out';
        return this;

    },

    /**
    * Sets the blend mode to 'destination-atop'
    *
    * @method Phaser.BitmapData#blendDestinationAtop
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendDestinationAtop: function () {

        this.op = 'destination-atop';
        return this;

    },

    /**
    * Sets the blend mode to 'xor'
    *
    * @method Phaser.BitmapData#blendXor
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendXor: function () {

        this.op = 'xor';
        return this;

    },

    /**
    * Sets the blend mode to 'lighter'
    *
    * @method Phaser.BitmapData#blendAdd
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendAdd: function () {

        this.op = 'lighter';
        return this;

    },

    /**
    * Sets the blend mode to 'multiply'
    *
    * @method Phaser.BitmapData#blendMultiply
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendMultiply: function () {

        this.op = 'multiply';
        return this;

    },

    /**
    * Sets the blend mode to 'screen'
    *
    * @method Phaser.BitmapData#blendScreen
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendScreen: function () {

        this.op = 'screen';
        return this;

    },

    /**
    * Sets the blend mode to 'overlay'
    *
    * @method Phaser.BitmapData#blendOverlay
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendOverlay: function () {

        this.op = 'overlay';
        return this;

    },

    /**
    * Sets the blend mode to 'darken'
    *
    * @method Phaser.BitmapData#blendDarken
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendDarken: function () {

        this.op = 'darken';
        return this;

    },

    /**
    * Sets the blend mode to 'lighten'
    *
    * @method Phaser.BitmapData#blendLighten
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendLighten: function () {

        this.op = 'lighten';
        return this;

    },

    /**
    * Sets the blend mode to 'color-dodge'
    *
    * @method Phaser.BitmapData#blendColorDodge
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendColorDodge: function () {

        this.op = 'color-dodge';
        return this;

    },

    /**
    * Sets the blend mode to 'color-burn'
    *
    * @method Phaser.BitmapData#blendColorBurn
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendColorBurn: function () {

        this.op = 'color-burn';
        return this;

    },

    /**
    * Sets the blend mode to 'hard-light'
    *
    * @method Phaser.BitmapData#blendHardLight
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendHardLight: function () {

        this.op = 'hard-light';
        return this;

    },

    /**
    * Sets the blend mode to 'soft-light'
    *
    * @method Phaser.BitmapData#blendSoftLight
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendSoftLight: function () {

        this.op = 'soft-light';
        return this;

    },

    /**
    * Sets the blend mode to 'difference'
    *
    * @method Phaser.BitmapData#blendDifference
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendDifference: function () {

        this.op = 'difference';
        return this;

    },

    /**
    * Sets the blend mode to 'exclusion'
    *
    * @method Phaser.BitmapData#blendExclusion
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendExclusion: function () {

        this.op = 'exclusion';
        return this;

    },

    /**
    * Sets the blend mode to 'hue'
    *
    * @method Phaser.BitmapData#blendHue
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendHue: function () {

        this.op = 'hue';
        return this;

    },

    /**
    * Sets the blend mode to 'saturation'
    *
    * @method Phaser.BitmapData#blendSaturation
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendSaturation: function () {

        this.op = 'saturation';
        return this;

    },

    /**
    * Sets the blend mode to 'color'
    *
    * @method Phaser.BitmapData#blendColor
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendColor: function () {

        this.op = 'color';
        return this;

    },

    /**
    * Sets the blend mode to 'luminosity'
    *
    * @method Phaser.BitmapData#blendLuminosity
    * @return {Phaser.BitmapData} This BitmapData object for method chaining.
    */
    blendLuminosity: function () {

        this.op = 'luminosity';
        return this;

    }

};

/**
* @memberof Phaser.BitmapData
* @property {boolean} smoothed - Gets or sets this BitmapData.contexts smoothing enabled value.
*/
Object.defineProperty(Phaser.BitmapData.prototype, "smoothed", {

    get: function () {

        Phaser.Canvas.getSmoothingEnabled(this.context);

    },

    set: function (value) {

        Phaser.Canvas.setSmoothingEnabled(this.context, value);

    }

});

/**
* @memberof Phaser.BitmapData
* @property {string} op - A short-hand code to get or set the global composite operation of the BitmapDatas canvas.
*/
Object.defineProperty(Phaser.BitmapData.prototype, "op", {

    get: function () {

        return this.context.globalCompositeOperation;

    },

    set: function (value) {

        this.context.globalCompositeOperation = value;

    }

});

/**
 * Gets a JavaScript object that has 6 properties set that are used by BitmapData in a transform.
 *
 * @method Phaser.BitmapData.getTransform
 * @param {number} translateX - The x translate value.
 * @param {number} translateY - The y translate value.
 * @param {number} scaleX - The scale x value.
 * @param {number} scaleY - The scale y value.
 * @param {number} skewX - The skew x value.
 * @param {number} skewY - The skew y value.
 * @return {object} A JavaScript object containing all of the properties BitmapData needs for transforms.
 */
Phaser.BitmapData.getTransform = function (translateX, translateY, scaleX, scaleY, skewX, skewY) {

    if (typeof translateX !== 'number') { translateX = 0; }
    if (typeof translateY !== 'number') { translateY = 0; }
    if (typeof scaleX !== 'number') { scaleX = 1; }
    if (typeof scaleY !== 'number') { scaleY = 1; }
    if (typeof skewX !== 'number') { skewX = 0; }
    if (typeof skewY !== 'number') { skewY = 0; }

    return { sx: scaleX, sy: scaleY, scaleX: scaleX, scaleY: scaleY, skewX: skewX, skewY: skewY, translateX: translateX, translateY: translateY, tx: translateX, ty: translateY };

};

Phaser.BitmapData.prototype.constructor = Phaser.BitmapData;

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and rectangles to the display, and color and fill them.
 * 
 * @class Graphics
 * @extends DisplayObjectContainer
 * @constructor
 */
PIXI.Graphics = function()
{
    PIXI.DisplayObjectContainer.call(this);

    this.renderable = true;

    /**
     * The alpha value used when filling the Graphics object.
     *
     * @property fillAlpha
     * @type Number
     */
    this.fillAlpha = 1;

    /**
     * The width (thickness) of any lines drawn.
     *
     * @property lineWidth
     * @type Number
     */
    this.lineWidth = 0;

    /**
     * The color of any lines drawn.
     *
     * @property lineColor
     * @type String
     * @default 0
     */
    this.lineColor = 0;

    /**
     * Graphics data
     *
     * @property graphicsData
     * @type Array
     * @private
     */
    this.graphicsData = [];

    /**
     * The tint applied to the graphic shape. This is a hex value. Apply a value of 0xFFFFFF to reset the tint.
     *
     * @property tint
     * @type Number
     * @default 0xFFFFFF
     */
    this.tint = 0xFFFFFF;

    /**
     * The blend mode to be applied to the graphic shape. Apply a value of PIXI.blendModes.NORMAL to reset the blend mode.
     *
     * @property blendMode
     * @type Number
     * @default PIXI.blendModes.NORMAL;
     */
    this.blendMode = PIXI.blendModes.NORMAL;
    
    /**
     * Current path
     *
     * @property currentPath
     * @type Object
     * @private
     */
    this.currentPath = null;
    
    /**
     * Array containing some WebGL-related properties used by the WebGL renderer.
     *
     * @property _webGL
     * @type Array
     * @private
     */
    this._webGL = [];

    /**
     * Whether this shape is being used as a mask.
     *
     * @property isMask
     * @type Boolean
     */
    this.isMask = false;

    /**
     * The bounds' padding used for bounds calculation.
     *
     * @property boundsPadding
     * @type Number
     */
    this.boundsPadding = 0;

    this._localBounds = new PIXI.Rectangle(0,0,1,1);

    /**
     * Used to detect if the graphics object has changed. If this is set to true then the graphics object will be recalculated.
     * 
     * @property dirty
     * @type Boolean
     * @private
     */
    this.dirty = true;

    /**
     * Used to detect if the bounds have been invalidated, by this Graphics being cleared or drawn to.
     * If this is set to true then the updateLocalBounds is called once in the postUpdate method.
     * 
     * @property _boundsDirty
     * @type Boolean
     * @private
     */
    this._boundsDirty = false;

    /**
     * Used to detect if the webgl graphics object has changed. If this is set to true then the graphics object will be recalculated.
     * 
     * @property webGLDirty
     * @type Boolean
     * @private
     */
    this.webGLDirty = false;

    /**
     * Used to detect if the cached sprite object needs to be updated.
     * 
     * @property cachedSpriteDirty
     * @type Boolean
     * @private
     */
    this.cachedSpriteDirty = false;

};

// constructor
PIXI.Graphics.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );
PIXI.Graphics.prototype.constructor = PIXI.Graphics;

/**
 * Specifies the line style used for subsequent calls to Graphics methods such as the lineTo() method or the drawCircle() method.
 *
 * @method lineStyle
 * @param lineWidth {Number} width of the line to draw, will update the objects stored style
 * @param color {Number} color of the line to draw, will update the objects stored style
 * @param alpha {Number} alpha of the line to draw, will update the objects stored style
 * @return {Graphics}
 */
PIXI.Graphics.prototype.lineStyle = function(lineWidth, color, alpha)
{
    this.lineWidth = lineWidth || 0;
    this.lineColor = color || 0;
    this.lineAlpha = (alpha === undefined) ? 1 : alpha;

    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length)
        {
            // halfway through a line? start a new one!
            this.drawShape(new PIXI.Polygon(this.currentPath.shape.points.slice(-2)));
        }
        else
        {
            // otherwise its empty so lets just set the line properties
            this.currentPath.lineWidth = this.lineWidth;
            this.currentPath.lineColor = this.lineColor;
            this.currentPath.lineAlpha = this.lineAlpha;
        }
    }

    return this;
};

/**
 * Moves the current drawing position to x, y.
 *
 * @method moveTo
 * @param x {Number} the X coordinate to move to
 * @param y {Number} the Y coordinate to move to
 * @return {Graphics}
  */
PIXI.Graphics.prototype.moveTo = function(x, y)
{
    this.drawShape(new PIXI.Polygon([x, y]));

    return this;
};

/**
 * Draws a line using the current line style from the current drawing position to (x, y);
 * The current drawing position is then set to (x, y).
 *
 * @method lineTo
 * @param x {Number} the X coordinate to draw to
 * @param y {Number} the Y coordinate to draw to
 * @return {Graphics}
 */
PIXI.Graphics.prototype.lineTo = function(x, y)
{
    if (!this.currentPath)
    {
        this.moveTo(0, 0);
    }

    this.currentPath.shape.points.push(x, y);
    this.dirty = true;
    this._boundsDirty = true;

    return this;
};

/**
 * Calculate the points for a quadratic bezier curve and then draws it.
 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
 *
 * @method quadraticCurveTo
 * @param cpX {Number} Control point x
 * @param cpY {Number} Control point y
 * @param toX {Number} Destination point x
 * @param toY {Number} Destination point y
 * @return {Graphics}
 */
PIXI.Graphics.prototype.quadraticCurveTo = function(cpX, cpY, toX, toY)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points = [0, 0];
        }
    }
    else
    {
        this.moveTo(0,0);
    }

    var xa,
        ya,
        n = 20,
        points = this.currentPath.shape.points;

    if (points.length === 0)
    {
        this.moveTo(0, 0);
    }

    var fromX = points[points.length - 2];
    var fromY = points[points.length - 1];
    var j = 0;
    for (var i = 1; i <= n; ++i)
    {
        j = i / n;

        xa = fromX + ( (cpX - fromX) * j );
        ya = fromY + ( (cpY - fromY) * j );

        points.push( xa + ( ((cpX + ( (toX - cpX) * j )) - xa) * j ),
                     ya + ( ((cpY + ( (toY - cpY) * j )) - ya) * j ) );
    }

    this.dirty = true;
    this._boundsDirty = true;

    return this;
};

/**
 * Calculate the points for a bezier curve and then draws it.
 *
 * @method bezierCurveTo
 * @param cpX {Number} Control point x
 * @param cpY {Number} Control point y
 * @param cpX2 {Number} Second Control point x
 * @param cpY2 {Number} Second Control point y
 * @param toX {Number} Destination point x
 * @param toY {Number} Destination point y
 * @return {Graphics}
 */
PIXI.Graphics.prototype.bezierCurveTo = function(cpX, cpY, cpX2, cpY2, toX, toY)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points = [0, 0];
        }
    }
    else
    {
        this.moveTo(0,0);
    }

    var n = 20,
        dt,
        dt2,
        dt3,
        t2,
        t3,
        points = this.currentPath.shape.points;

    var fromX = points[points.length-2];
    var fromY = points[points.length-1];
    var j = 0;

    for (var i = 1; i <= n; ++i)
    {
        j = i / n;

        dt = (1 - j);
        dt2 = dt * dt;
        dt3 = dt2 * dt;

        t2 = j * j;
        t3 = t2 * j;
        
        points.push( dt3 * fromX + 3 * dt2 * j * cpX + 3 * dt * t2 * cpX2 + t3 * toX,
                     dt3 * fromY + 3 * dt2 * j * cpY + 3 * dt * t2 * cpY2 + t3 * toY);
    }
    
    this.dirty = true;
    this._boundsDirty = true;

    return this;
};

/*
 * The arcTo() method creates an arc/curve between two tangents on the canvas.
 * 
 * "borrowed" from https://code.google.com/p/fxcanvas/ - thanks google!
 *
 * @method arcTo
 * @param x1 {Number} The x-coordinate of the beginning of the arc
 * @param y1 {Number} The y-coordinate of the beginning of the arc
 * @param x2 {Number} The x-coordinate of the end of the arc
 * @param y2 {Number} The y-coordinate of the end of the arc
 * @param radius {Number} The radius of the arc
 * @return {Graphics}
 */
PIXI.Graphics.prototype.arcTo = function(x1, y1, x2, y2, radius)
{
    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length === 0)
        {
            this.currentPath.shape.points.push(x1, y1);
        }
    }
    else
    {
        this.moveTo(x1, y1);
    }

    var points = this.currentPath.shape.points,
        fromX = points[points.length-2],
        fromY = points[points.length-1],
        a1 = fromY - y1,
        b1 = fromX - x1,
        a2 = y2   - y1,
        b2 = x2   - x1,
        mm = Math.abs(a1 * b2 - b1 * a2);

    if (mm < 1.0e-8 || radius === 0)
    {
        if (points[points.length-2] !== x1 || points[points.length-1] !== y1)
        {
            points.push(x1, y1);
        }
    }
    else
    {
        var dd = a1 * a1 + b1 * b1,
            cc = a2 * a2 + b2 * b2,
            tt = a1 * a2 + b1 * b2,
            k1 = radius * Math.sqrt(dd) / mm,
            k2 = radius * Math.sqrt(cc) / mm,
            j1 = k1 * tt / dd,
            j2 = k2 * tt / cc,
            cx = k1 * b2 + k2 * b1,
            cy = k1 * a2 + k2 * a1,
            px = b1 * (k2 + j1),
            py = a1 * (k2 + j1),
            qx = b2 * (k1 + j2),
            qy = a2 * (k1 + j2),
            startAngle = Math.atan2(py - cy, px - cx),
            endAngle   = Math.atan2(qy - cy, qx - cx);

        this.arc(cx + x1, cy + y1, radius, startAngle, endAngle, b1 * a2 > b2 * a1);
    }

    this.dirty = true;
    this._boundsDirty = true;

    return this;
};

/**
 * The arc method creates an arc/curve (used to create circles, or parts of circles).
 *
 * @method arc
 * @param cx {Number} The x-coordinate of the center of the circle
 * @param cy {Number} The y-coordinate of the center of the circle
 * @param radius {Number} The radius of the circle
 * @param startAngle {Number} The starting angle, in radians (0 is at the 3 o'clock position of the arc's circle)
 * @param endAngle {Number} The ending angle, in radians
 * @param anticlockwise {Boolean} Optional. Specifies whether the drawing should be counterclockwise or clockwise. False is default, and indicates clockwise, while true indicates counter-clockwise.
 * @param segments {Number} Optional. The number of segments to use when calculating the arc. The default is 40. If you need more fidelity use a higher number.
 * @return {Graphics}
 */
PIXI.Graphics.prototype.arc = function(cx, cy, radius, startAngle, endAngle, anticlockwise, segments)
{
    //  If we do this we can never draw a full circle
    if (startAngle === endAngle)
    {
        return this;
    }

    if (anticlockwise === undefined) { anticlockwise = false; }
    if (segments === undefined) { segments = 40; }

    if (!anticlockwise && endAngle <= startAngle)
    {
        endAngle += Math.PI * 2;
    }
    else if (anticlockwise && startAngle <= endAngle)
    {
        startAngle += Math.PI * 2;
    }

    var sweep = anticlockwise ? (startAngle - endAngle) * -1 : (endAngle - startAngle);
    var segs =  Math.ceil(Math.abs(sweep) / (Math.PI * 2)) * segments;

    //  Sweep check - moved here because we don't want to do the moveTo below if the arc fails
    if (sweep === 0)
    {
        return this;
    }

    var startX = cx + Math.cos(startAngle) * radius;
    var startY = cy + Math.sin(startAngle) * radius;

    if (anticlockwise && this.filling)
    {
        this.moveTo(cx, cy);
    }
    else
    {
        this.moveTo(startX, startY);
    }

    //  currentPath will always exist after calling a moveTo
    var points = this.currentPath.shape.points;

    var theta = sweep / (segs * 2);
    var theta2 = theta * 2;

    var cTheta = Math.cos(theta);
    var sTheta = Math.sin(theta);
    
    var segMinus = segs - 1;

    var remainder = (segMinus % 1) / segMinus;

    for (var i = 0; i <= segMinus; i++)
    {
        var real =  i + remainder * i;
    
        var angle = ((theta) + startAngle + (theta2 * real));

        var c = Math.cos(angle);
        var s = -Math.sin(angle);

        points.push(( (cTheta *  c) + (sTheta * s) ) * radius + cx,
                    ( (cTheta * -s) + (sTheta * c) ) * radius + cy);
    }

    this.dirty = true;
    this._boundsDirty = true;

    return this;
};

/**
 * Specifies a simple one-color fill that subsequent calls to other Graphics methods
 * (such as lineTo() or drawCircle()) use when drawing.
 *
 * @method beginFill
 * @param color {Number} the color of the fill
 * @param alpha {Number} the alpha of the fill
 * @return {Graphics}
 */
PIXI.Graphics.prototype.beginFill = function(color, alpha)
{
    this.filling = true;
    this.fillColor = color || 0;
    this.fillAlpha = (alpha === undefined) ? 1 : alpha;

    if (this.currentPath)
    {
        if (this.currentPath.shape.points.length <= 2)
        {
            this.currentPath.fill = this.filling;
            this.currentPath.fillColor = this.fillColor;
            this.currentPath.fillAlpha = this.fillAlpha;
        }
    }

    return this;
};

/**
 * Applies a fill to the lines and shapes that were added since the last call to the beginFill() method.
 *
 * @method endFill
 * @return {Graphics}
 */
PIXI.Graphics.prototype.endFill = function()
{
    this.filling = false;
    this.fillColor = null;
    this.fillAlpha = 1;

    return this;
};

/**
 * @method drawRect
 *
 * @param x {Number} The X coord of the top-left of the rectangle
 * @param y {Number} The Y coord of the top-left of the rectangle
 * @param width {Number} The width of the rectangle
 * @param height {Number} The height of the rectangle
 * @return {Graphics}
 */
PIXI.Graphics.prototype.drawRect = function(x, y, width, height)
{
    this.drawShape(new PIXI.Rectangle(x, y, width, height));

    return this;
};

/**
 * @method drawRoundedRect
 * @param x {Number} The X coord of the top-left of the rectangle
 * @param y {Number} The Y coord of the top-left of the rectangle
 * @param width {Number} The width of the rectangle
 * @param height {Number} The height of the rectangle
 * @param radius {Number} Radius of the rectangle corners. In WebGL this must be a value between 0 and 9.
 */
PIXI.Graphics.prototype.drawRoundedRect = function(x, y, width, height, radius)
{
    this.drawShape(new PIXI.RoundedRectangle(x, y, width, height, radius));

    return this;
};

/**
 * Draws a circle.
 *
 * @method drawCircle
 * @param x {Number} The X coordinate of the center of the circle
 * @param y {Number} The Y coordinate of the center of the circle
 * @param diameter {Number} The diameter of the circle
 * @return {Graphics}
 */
PIXI.Graphics.prototype.drawCircle = function(x, y, diameter)
{
    this.drawShape(new PIXI.Circle(x, y, diameter));

    return this;
};

/**
 * Draws an ellipse.
 *
 * @method drawEllipse
 * @param x {Number} The X coordinate of the center of the ellipse
 * @param y {Number} The Y coordinate of the center of the ellipse
 * @param width {Number} The half width of the ellipse
 * @param height {Number} The half height of the ellipse
 * @return {Graphics}
 */
PIXI.Graphics.prototype.drawEllipse = function(x, y, width, height)
{
    this.drawShape(new PIXI.Ellipse(x, y, width, height));

    return this;
};

/**
 * Draws a polygon using the given path.
 *
 * @method drawPolygon
 * @param path {Array|Phaser.Polygon} The path data used to construct the polygon. Can either be an array of points or a Phaser.Polygon object.
 * @return {Graphics}
 */
PIXI.Graphics.prototype.drawPolygon = function(path)
{
    if (path instanceof Phaser.Polygon || path instanceof PIXI.Polygon)
    {
        path = path.points;
    }

    // prevents an argument assignment deopt
    // see section 3.1: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    var points = path;

    if (!Array.isArray(points))
    {
        // prevents an argument leak deopt
        // see section 3.2: https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
        points = new Array(arguments.length);

        for (var i = 0; i < points.length; ++i)
        {
            points[i] = arguments[i];
        }
    }

    this.drawShape(new Phaser.Polygon(points));

    return this;
};

/**
 * Clears the graphics that were drawn to this Graphics object, and resets fill and line style settings.
 *
 * @method clear
 * @return {Graphics}
 */
PIXI.Graphics.prototype.clear = function()
{
    this.lineWidth = 0;
    this.filling = false;

    this.dirty = true;
    this._boundsDirty = true;
    this.clearDirty = true;
    this.graphicsData = [];

    this.updateLocalBounds();

    return this;
};

/**
 * Useful function that returns a texture of the graphics object that can then be used to create sprites
 * This can be quite useful if your geometry is complicated and needs to be reused multiple times.
 *
 * @method generateTexture
 * @param [resolution=1] {Number} The resolution of the texture being generated
 * @param [scaleMode=0] {Number} Should be one of the PIXI.scaleMode consts
 * @param [padding=0] {Number} Add optional extra padding to the generated texture (default 0)
 * @return {Texture} a texture of the graphics object
 */
PIXI.Graphics.prototype.generateTexture = function(resolution, scaleMode, padding)
{
    if (resolution === undefined) { resolution = 1; }
    if (scaleMode === undefined) { scaleMode = PIXI.scaleModes.DEFAULT; }
    if (padding === undefined) { padding = 0; }

    var bounds = this.getBounds();

    bounds.width += padding;
    bounds.height += padding;
   
    var canvasBuffer = new PIXI.CanvasBuffer(bounds.width * resolution, bounds.height * resolution);
    
    var texture = PIXI.Texture.fromCanvas(canvasBuffer.canvas, scaleMode);

    texture.baseTexture.resolution = resolution;

    canvasBuffer.context.scale(resolution, resolution);

    canvasBuffer.context.translate(-bounds.x, -bounds.y);

    PIXI.CanvasGraphics.renderGraphics(this, canvasBuffer.context);

    return texture;
};

/**
* Renders the object using the WebGL renderer
*
* @method _renderWebGL
* @param renderSession {RenderSession} 
* @private
*/
PIXI.Graphics.prototype._renderWebGL = function(renderSession)
{
    // if the sprite is not visible or the alpha is 0 then no need to render this element
    if (this.visible === false || this.alpha === 0 || this.isMask === true) return;

    if (this._cacheAsBitmap)
    {
        if (this.dirty || this.cachedSpriteDirty)
        {
            this._generateCachedSprite();
   
            // we will also need to update the texture on the gpu too!
            this.updateCachedSpriteTexture();

            this.cachedSpriteDirty = false;
            this.dirty = false;
        }

        this._cachedSprite.worldAlpha = this.worldAlpha;

        PIXI.Sprite.prototype._renderWebGL.call(this._cachedSprite, renderSession);

        return;
    }
    else
    {
        renderSession.spriteBatch.stop();
        renderSession.blendModeManager.setBlendMode(this.blendMode);

        if (this._mask) renderSession.maskManager.pushMask(this._mask, renderSession);
        if (this._filters) renderSession.filterManager.pushFilter(this._filterBlock);
      
        // check blend mode
        if (this.blendMode !== renderSession.spriteBatch.currentBlendMode)
        {
            renderSession.spriteBatch.currentBlendMode = this.blendMode;
            var blendModeWebGL = PIXI.blendModesWebGL[renderSession.spriteBatch.currentBlendMode];
            renderSession.spriteBatch.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);
        }
        
        // check if the webgl graphic needs to be updated
        if (this.webGLDirty)
        {
            this.dirty = true;
            this.webGLDirty = false;
        }
        
        PIXI.WebGLGraphics.renderGraphics(this, renderSession);
        
        // only render if it has children!
        if (this.children.length)
        {
            renderSession.spriteBatch.start();

            // simple render children!
            for (var i = 0; i < this.children.length; i++)
            {
                this.children[i]._renderWebGL(renderSession);
            }

            renderSession.spriteBatch.stop();
        }

        if (this._filters) renderSession.filterManager.popFilter();
        if (this._mask) renderSession.maskManager.popMask(this.mask, renderSession);
          
        renderSession.drawCount++;

        renderSession.spriteBatch.start();
    }
};

/**
* Renders the object using the Canvas renderer
*
* @method _renderCanvas
* @param renderSession {RenderSession} 
* @private
*/
PIXI.Graphics.prototype._renderCanvas = function(renderSession)
{
    // if the sprite is not visible or the alpha is 0 then no need to render this element
    if (this.visible === false || this.alpha === 0 || this.isMask === true) return;

    // if the tint has changed, set the graphics object to dirty.
    if (this._prevTint !== this.tint) {
        this.dirty = true;
        this._prevTint = this.tint;
    }

    if (this._cacheAsBitmap)
    {
        if (this.dirty || this.cachedSpriteDirty)
        {
            this._generateCachedSprite();
   
            // we will also need to update the texture
            this.updateCachedSpriteTexture();

            this.cachedSpriteDirty = false;
            this.dirty = false;
        }

        this._cachedSprite.alpha = this.alpha;

        PIXI.Sprite.prototype._renderCanvas.call(this._cachedSprite, renderSession);

        return;
    }
    else
    {
        var context = renderSession.context;
        var transform = this.worldTransform;
        
        if (this.blendMode !== renderSession.currentBlendMode)
        {
            renderSession.currentBlendMode = this.blendMode;
            context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode];
        }

        if (this._mask)
        {
            renderSession.maskManager.pushMask(this._mask, renderSession);
        }

        var resolution = renderSession.resolution;
        var tx = (transform.tx * renderSession.resolution) + renderSession.shakeX;
        var ty = (transform.ty * renderSession.resolution) + renderSession.shakeY;

        context.setTransform(transform.a * resolution,
                             transform.b * resolution,
                             transform.c * resolution,
                             transform.d * resolution,
                             tx,
                             ty);

        PIXI.CanvasGraphics.renderGraphics(this, context);

         // simple render children!
        for (var i = 0; i < this.children.length; i++)
        {
            this.children[i]._renderCanvas(renderSession);
        }

        if (this._mask)
        {
            renderSession.maskManager.popMask(renderSession);
        }
    }
};

/**
 * Retrieves the bounds of the graphic shape as a rectangle object
 *
 * @method getBounds
 * @return {Rectangle} the rectangular bounding area
 */
PIXI.Graphics.prototype.getBounds = function(matrix)
{
    if (!this._currentBounds)
    {
        //  Return an empty object if the item is a mask!
        if (!this.renderable)
        {
            return PIXI.EmptyRectangle;
        }

        if (this.dirty)
        {
            this.updateLocalBounds();
            this.webGLDirty = true;
            this.cachedSpriteDirty = true;
            this.dirty = false;
        }

        var bounds = this._localBounds;

        var w0 = bounds.x;
        var w1 = bounds.width + bounds.x;

        var h0 = bounds.y;
        var h1 = bounds.height + bounds.y;

        var worldTransform = matrix || this.worldTransform;

        var a = worldTransform.a;
        var b = worldTransform.b;
        var c = worldTransform.c;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;

        var x1 = a * w1 + c * h1 + tx;
        var y1 = d * h1 + b * w1 + ty;

        var x2 = a * w0 + c * h1 + tx;
        var y2 = d * h1 + b * w0 + ty;

        var x3 = a * w0 + c * h0 + tx;
        var y3 = d * h0 + b * w0 + ty;

        var x4 =  a * w1 + c * h0 + tx;
        var y4 =  d * h0 + b * w1 + ty;

        var maxX = x1;
        var maxY = y1;

        var minX = x1;
        var minY = y1;

        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;

        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;

        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;

        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;

        this._bounds.x = minX;
        this._bounds.width = maxX - minX;

        this._bounds.y = minY;
        this._bounds.height = maxY - minY;

        this._currentBounds = this._bounds;
    }

    return this._currentBounds;

};

/**
 * Retrieves the non-global local bounds of the graphic shape as a rectangle. The calculation takes all visible children into consideration.
 *
 * @method getLocalBounds
 * @return {Rectangle} The rectangular bounding area
 */
PIXI.Graphics.prototype.getLocalBounds = function () {
    var matrixCache = this.worldTransform;

    this.worldTransform = PIXI.identityMatrix;

    for (var i = 0; i < this.children.length; i++) {
        this.children[i].updateTransform();
    }

    var bounds = this.getBounds();

    this.worldTransform = matrixCache;

    for (i = 0; i < this.children.length; i++) {
        this.children[i].updateTransform();
    }

    return bounds;
};

/**
* Tests if a point is inside this graphics object
*
* @param point {Point} the point to test
* @return {boolean} the result of the test
*/
PIXI.Graphics.prototype.containsPoint = function( point )
{
    this.worldTransform.applyInverse(point,  tempPoint);

    var graphicsData = this.graphicsData;

    for (var i = 0; i < graphicsData.length; i++)
    {
        var data = graphicsData[i];

        if (!data.fill)
        {
            continue;
        }

        // only deal with fills..
        if (data.shape)
        {
            if (data.shape.contains(tempPoint.x, tempPoint.y))
            {
                return true;
            }
        }
    }

    return false;

};

/**
 * Update the bounds of the object
 *
 * @method updateLocalBounds
 */
PIXI.Graphics.prototype.updateLocalBounds = function()
{
    var minX = Infinity;
    var maxX = -Infinity;

    var minY = Infinity;
    var maxY = -Infinity;

    if (this.graphicsData.length)
    {
        var shape, points, x, y, w, h;

        for (var i = 0; i < this.graphicsData.length; i++)
        {
            var data = this.graphicsData[i];
            var type = data.type;
            var lineWidth = data.lineWidth;
            shape = data.shape;

            if (type === PIXI.Graphics.RECT || type === PIXI.Graphics.RREC)
            {
                x = shape.x - lineWidth / 2;
                y = shape.y - lineWidth / 2;
                w = shape.width + lineWidth;
                h = shape.height + lineWidth;

                minX = x < minX ? x : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y < minY ? y : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else if (type === PIXI.Graphics.CIRC)
            {
                x = shape.x;
                y = shape.y;
                w = shape.radius + lineWidth / 2;
                h = shape.radius + lineWidth / 2;

                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else if (type === PIXI.Graphics.ELIP)
            {
                x = shape.x;
                y = shape.y;
                w = shape.width + lineWidth / 2;
                h = shape.height + lineWidth / 2;

                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;

                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
            }
            else
            {
                // POLY - assumes points are sequential, not Point objects
                points = shape.points;

                for (var j = 0; j < points.length; j++)
                {
                    if (points[j] instanceof Phaser.Point)
                    {
                        x = points[j].x;
                        y = points[j].y;
                    }
                    else
                    {
                        x = points[j];
                        y = points[j + 1];

                        if (j < points.length - 1)
                        {
                            j++;
                        }
                    }

                    minX = x - lineWidth < minX ? x - lineWidth : minX;
                    maxX = x + lineWidth > maxX ? x + lineWidth : maxX;

                    minY = y - lineWidth < minY ? y - lineWidth : minY;
                    maxY = y + lineWidth > maxY ? y + lineWidth : maxY;
                }
            }
        }
    }
    else
    {
        minX = 0;
        maxX = 0;
        minY = 0;
        maxY = 0;
    }

    var padding = this.boundsPadding;
    
    this._localBounds.x = minX - padding;
    this._localBounds.width = (maxX - minX) + padding * 2;

    this._localBounds.y = minY - padding;
    this._localBounds.height = (maxY - minY) + padding * 2;
};

/**
 * Generates the cached sprite when the sprite has cacheAsBitmap = true
 *
 * @method _generateCachedSprite
 * @private
 */
PIXI.Graphics.prototype._generateCachedSprite = function()
{
    var bounds = this.getLocalBounds();

    if (!this._cachedSprite)
    {
        var canvasBuffer = new PIXI.CanvasBuffer(bounds.width, bounds.height);
        var texture = PIXI.Texture.fromCanvas(canvasBuffer.canvas);
        
        this._cachedSprite = new PIXI.Sprite(texture);
        this._cachedSprite.buffer = canvasBuffer;

        this._cachedSprite.worldTransform = this.worldTransform;
    }
    else
    {
        this._cachedSprite.buffer.resize(bounds.width, bounds.height);
    }

    // leverage the anchor to account for the offset of the element
    this._cachedSprite.anchor.x = -(bounds.x / bounds.width);
    this._cachedSprite.anchor.y = -(bounds.y / bounds.height);

    // this._cachedSprite.buffer.context.save();
    this._cachedSprite.buffer.context.translate(-bounds.x, -bounds.y);
    
    // make sure we set the alpha of the graphics to 1 for the render.. 
    this.worldAlpha = 1;

    // now render the graphic..
    PIXI.CanvasGraphics.renderGraphics(this, this._cachedSprite.buffer.context);
    this._cachedSprite.alpha = this.alpha;
};

/**
 * Updates texture size based on canvas size
 *
 * @method updateCachedSpriteTexture
 * @private
 */
PIXI.Graphics.prototype.updateCachedSpriteTexture = function()
{
    var cachedSprite = this._cachedSprite;
    var texture = cachedSprite.texture;
    var canvas = cachedSprite.buffer.canvas;

    texture.baseTexture.width = canvas.width;
    texture.baseTexture.height = canvas.height;
    texture.crop.width = texture.frame.width = canvas.width;
    texture.crop.height = texture.frame.height = canvas.height;

    cachedSprite._width = canvas.width;
    cachedSprite._height = canvas.height;

    // update the dirty base textures
    texture.baseTexture.dirty();
};

/**
 * Destroys a previous cached sprite.
 *
 * @method destroyCachedSprite
 */
PIXI.Graphics.prototype.destroyCachedSprite = function()
{
    this._cachedSprite.texture.destroy(true);
    this._cachedSprite = null;
};

/**
 * Draws the given shape to this Graphics object. Can be any of Circle, Rectangle, Ellipse, Line or Polygon.
 *
 * @method drawShape
 * @param {Circle|Rectangle|Ellipse|Line|Polygon} shape The Shape object to draw.
 * @return {GraphicsData} The generated GraphicsData object.
 */
PIXI.Graphics.prototype.drawShape = function(shape)
{
    if (this.currentPath)
    {
        // check current path!
        if (this.currentPath.shape.points.length <= 2)
        {
            this.graphicsData.pop();
        }
    }

    this.currentPath = null;

    //  Handle mixed-type polygons
    if (shape instanceof Phaser.Polygon)
    {
        shape = shape.clone();
        shape.flatten();
    }

    var data = new PIXI.GraphicsData(this.lineWidth, this.lineColor, this.lineAlpha, this.fillColor, this.fillAlpha, this.filling, shape);
    
    this.graphicsData.push(data);

    if (data.type === PIXI.Graphics.POLY)
    {
        data.shape.closed = this.filling;
        this.currentPath = data;
    }

    this.dirty = true;
    this._boundsDirty = true;

    return data;

};

/**
 * When cacheAsBitmap is set to true the graphics object will be rendered as if it was a sprite.
 * This is useful if your graphics element does not change often, as it will speed up the rendering of the object in exchange for taking up texture memory.
 * It is also useful if you need the graphics object to be anti-aliased, because it will be rendered using canvas.
 * This is not recommended if you are constantly redrawing the graphics element.
 *
 * @property cacheAsBitmap
 * @type Boolean
 * @default false
 * @private
 */
Object.defineProperty(PIXI.Graphics.prototype, "cacheAsBitmap", {

    get: function() {
        return  this._cacheAsBitmap;
    },

    set: function(value) {

        this._cacheAsBitmap = value;

        if (this._cacheAsBitmap)
        {
            this._generateCachedSprite();
        }
        else
        {
            this.destroyCachedSprite();
        }

        this.dirty = true;
        this.webGLDirty = true;

    }
});

/**
 * A GraphicsData object.
 * 
 * @class GraphicsData
 * @constructor
PIXI.GraphicsData = function(lineWidth, lineColor, lineAlpha, fillColor, fillAlpha, fill, shape)
{
    this.lineWidth = lineWidth;
    this.lineColor = lineColor;
    this.lineAlpha = lineAlpha;
    this._lineTint = lineColor;

    this.fillColor = fillColor;
    this.fillAlpha = fillAlpha;
    this._fillTint = fillColor;
    this.fill = fill;

    this.shape = shape;
    this.type = shape.type;
};
 */

/**
 * A GraphicsData object.
 *
 * @class
 * @memberof PIXI
 * @param lineWidth {number} the width of the line to draw
 * @param lineColor {number} the color of the line to draw
 * @param lineAlpha {number} the alpha of the line to draw
 * @param fillColor {number} the color of the fill
 * @param fillAlpha {number} the alpha of the fill
 * @param fill      {boolean} whether or not the shape is filled with a colour
 * @param shape     {Circle|Rectangle|Ellipse|Line|Polygon} The shape object to draw.
 */

PIXI.GraphicsData = function(lineWidth, lineColor, lineAlpha, fillColor, fillAlpha, fill, shape) {

    /*
     * @member {number} the width of the line to draw
     */
    this.lineWidth = lineWidth;

    /*
     * @member {number} the color of the line to draw
     */
    this.lineColor = lineColor;

    /*
     * @member {number} the alpha of the line to draw
     */
    this.lineAlpha = lineAlpha;

    /*
     * @member {number} cached tint of the line to draw
     */
    this._lineTint = lineColor;

    /*
     * @member {number} the color of the fill
     */
    this.fillColor = fillColor;

    /*
     * @member {number} the alpha of the fill
     */
    this.fillAlpha = fillAlpha;

    /*
     * @member {number} cached tint of the fill
     */
    this._fillTint = fillColor;

    /*
     * @member {boolean} whether or not the shape is filled with a color
     */
    this.fill = fill;

    /*
     * @member {Circle|Rectangle|Ellipse|Line|Polygon} The shape object to draw.
     */
    this.shape = shape;

    /*
     * @member {number} The type of the shape, see the Const.Shapes file for all the existing types,
     */
    this.type = shape.type;

};

PIXI.GraphicsData.prototype.constructor = PIXI.GraphicsData;

/**
 * Creates a new GraphicsData object with the same values as this one.
 *
 * @return {GraphicsData}
 */
PIXI.GraphicsData.prototype.clone = function() {

    return new GraphicsData(
        this.lineWidth,
        this.lineColor,
        this.lineAlpha,
        this.fillColor,
        this.fillAlpha,
        this.fill,
        this.shape
    );

};
/*
Copyright (c) 2016, Mapbox

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
*/

/**
* @class EarCut
*/
PIXI.EarCut = {};

PIXI.EarCut.Triangulate = function (data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = PIXI.EarCut.linkedList(data, 0, outerLen, dim, true),
        triangles = [];

    if (!outerNode) return triangles;

    var minX, minY, maxX, maxY, x, y, size;

    if (hasHoles) outerNode = PIXI.EarCut.eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and size are later used to transform coords into integers for z-order calculation
        size = Math.max(maxX - minX, maxY - minY);
    }

    PIXI.EarCut.earcutLinked(outerNode, triangles, dim, minX, minY, size);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order

PIXI.EarCut.linkedList = function (data, start, end, dim, clockwise) {
    var sum = 0,
        i, j, last;

    // calculate original winding order of a polygon ring
    for (i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }

    // link points into circular doubly-linked list in the specified winding order
    if (clockwise === (sum > 0)) {
        for (i = start; i < end; i += dim) last = PIXI.EarCut.insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = PIXI.EarCut.insertNode(i, data[i], data[i + 1], last);
    }

    return last;
}

// eliminate colinear or duplicate points

PIXI.EarCut.filterPoints = function (start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (PIXI.EarCut.equals(p, p.next) || PIXI.EarCut.area(p.prev, p, p.next) === 0)) {
            PIXI.EarCut.removeNode(p);
            p = end = p.prev;
            if (p === p.next) return null;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)

PIXI.EarCut.earcutLinked = function (ear, triangles, dim, minX, minY, size, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && size) PIXI.EarCut.indexCurve(ear, minX, minY, size);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (size ? PIXI.EarCut.isEarHashed(ear, minX, minY, size) : PIXI.EarCut.isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);

            PIXI.EarCut.removeNode(ear);

            // skipping the next vertice leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                PIXI.EarCut.earcutLinked(PIXI.EarCut.filterPoints(ear), triangles, dim, minX, minY, size, 1);

                // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = PIXI.EarCut.cureLocalIntersections(ear, triangles, dim);
                PIXI.EarCut.earcutLinked(ear, triangles, dim, minX, minY, size, 2);

                // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                PIXI.EarCut.splitEarcut(ear, triangles, dim, minX, minY, size);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes

PIXI.EarCut.isEar = function (ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (PIXI.EarCut.area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next;

    while (p !== ear.prev) {
        if (PIXI.EarCut.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            PIXI.EarCut.area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

PIXI.EarCut.isEarHashed = function (ear, minX, minY, size) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (PIXI.EarCut.area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x),
        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y),
        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x),
        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

    // z-order range for the current triangle bbox;
    var minZ = PIXI.EarCut.zOrder(minTX, minTY, minX, minY, size),
        maxZ = PIXI.EarCut.zOrder(maxTX, maxTY, minX, minY, size);

    // first look for points inside the triangle in increasing z-order
    var p = ear.nextZ;

    while (p && p.z <= maxZ) {
        if (p !== ear.prev && p !== ear.next &&
            PIXI.EarCut.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            PIXI.EarCut.area(p.prev, p, p.next) >= 0) return false;
        p = p.nextZ;
    }

    // then look for points in decreasing z-order
    p = ear.prevZ;

    while (p && p.z >= minZ) {
        if (p !== ear.prev && p !== ear.next &&
            PIXI.EarCut.pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            PIXI.EarCut.area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections

PIXI.EarCut.cureLocalIntersections = function (start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        // a self-intersection where edge (v[i-1],v[i]) intersects (v[i+1],v[i+2])
        if (PIXI.EarCut.intersects(a, p, p.next, b) && PIXI.EarCut.locallyInside(a, b) && PIXI.EarCut.locallyInside(b, a)) {

            triangles.push(a.i / dim);
            triangles.push(p.i / dim);
            triangles.push(b.i / dim);

            // remove two nodes involved
            PIXI.EarCut.removeNode(p);
            PIXI.EarCut.removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return p;
}

// try splitting polygon into two and triangulate them independently

PIXI.EarCut.splitEarcut = function (start, triangles, dim, minX, minY, size) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && PIXI.EarCut.isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = PIXI.EarCut.splitPolygon(a, b);

                // filter colinear points around the cuts
                a = PIXI.EarCut.filterPoints(a, a.next);
                c = PIXI.EarCut.filterPoints(c, c.next);

                // run earcut on each half
                PIXI.EarCut.earcutLinked(a, triangles, dim, minX, minY, size);
                PIXI.EarCut.earcutLinked(c, triangles, dim, minX, minY, size);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes

PIXI.EarCut.eliminateHoles = function (data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = PIXI.EarCut.linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(PIXI.EarCut.getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        PIXI.EarCut.eliminateHole(queue[i], outerNode);
        outerNode = PIXI.EarCut.filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
}

PIXI.EarCut.compareX = function (a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it

PIXI.EarCut.eliminateHole = function (hole, outerNode) {
    outerNode = PIXI.EarCut.findHoleBridge(hole, outerNode);
    if (outerNode) {
        var b = PIXI.EarCut.splitPolygon(outerNode, hole);
        PIXI.EarCut.filterPoints(b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon

PIXI.EarCut.findHoleBridge = function (hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                m = p.x < p.next.x ? p : p.next;
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    if (hole.x === m.x) return m.prev; // hole touches outer segment; pick lower endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        tanMin = Infinity,
        tan;

    p = m.next;

    while (p !== stop) {
        if (hx >= p.x && p.x >= m.x &&
            PIXI.EarCut.pointInTriangle(hy < m.y ? hx : qx, hy, m.x, m.y, hy < m.y ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if ((tan < tanMin || (tan === tanMin && p.x > m.x)) && PIXI.EarCut.locallyInside(p, hole)) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    }

    return m;
}

// interlink polygon nodes in z-order

PIXI.EarCut.indexCurve = function (start, minX, minY, size) {
    var p = start;
    do {
        if (p.z === null) p.z = PIXI.EarCut.zOrder(p.x, p.y, minX, minY, size);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    PIXI.EarCut.sortLinked(p);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html

PIXI.EarCut.sortLinked = function (list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }

            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize === 0) {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                } else if (qSize === 0 || !q) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else if (p.z <= q.z) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and size of the data bounding box

PIXI.EarCut.zOrder = function (x, y, minX, minY, size) {
    // coords are transformed into non-negative 15-bit integer range
    x = 32767 * (x - minX) / size;
    y = 32767 * (y - minY) / size;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring

PIXI.EarCut.getLeftmost = function (start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle

PIXI.EarCut.pointInTriangle = function (ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
        (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
        (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)

PIXI.EarCut.isValidDiagonal = function (a, b) {
    return PIXI.EarCut.equals(a, b) || a.next.i !== b.i && a.prev.i !== b.i && !PIXI.EarCut.intersectsPolygon(a, b) &&
        PIXI.EarCut.locallyInside(a, b) && PIXI.EarCut.locallyInside(b, a) && PIXI.EarCut.middleInside(a, b);
}

// signed area of a triangle

PIXI.EarCut.area = function (p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal

PIXI.EarCut.equals = function (p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect

PIXI.EarCut.intersects = function (p1, q1, p2, q2) {
    return PIXI.EarCut.area(p1, q1, p2) > 0 !== PIXI.EarCut.area(p1, q1, q2) > 0 &&
        PIXI.EarCut.area(p2, q2, p1) > 0 !== PIXI.EarCut.area(p2, q2, q1) > 0;
}

// check if a polygon diagonal intersects any polygon segments

PIXI.EarCut.intersectsPolygon = function (a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
            PIXI.EarCut.intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon

PIXI.EarCut.locallyInside = function (a, b) {
    return PIXI.EarCut.area(a.prev, a, a.next) < 0 ?
        PIXI.EarCut.area(a, b, a.next) >= 0 && PIXI.EarCut.area(a, a.prev, b) >= 0 :
        PIXI.EarCut.area(a, b, a.prev) < 0 || PIXI.EarCut.area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon

PIXI.EarCut.middleInside = function (a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring

PIXI.EarCut.splitPolygon = function (a, b) {
    var a2 = new PIXI.EarCut.Node(a.i, a.x, a.y),
        b2 = new PIXI.EarCut.Node(b.i, b.x, b.y),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)

PIXI.EarCut.insertNode = function (i, x, y, last) {
    var p = new PIXI.EarCut.Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

PIXI.EarCut.removeNode = function (p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

PIXI.EarCut.Node = function (i, x, y) {
    // vertice index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertice nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A set of functions used by the webGL renderer to draw the primitive graphics data
 *
 * @class WebGLGraphics
 * @private
 * @static
 */
PIXI.WebGLGraphics = function()
{
};

/**
 * The number of points beyond which Pixi swaps to using the Stencil Buffer to render the Graphics.
 *
 * @type {number}
 */
PIXI.WebGLGraphics.stencilBufferLimit = 6;

/**
 * Renders the graphics object
 *
 * @static
 * @private
 * @method renderGraphics
 * @param graphics {Graphics}
 * @param renderSession {Object}
 */
PIXI.WebGLGraphics.renderGraphics = function(graphics, renderSession)//projection, offset)
{
    var gl = renderSession.gl;
    var projection = renderSession.projection,
        offset = renderSession.offset,
        shader = renderSession.shaderManager.primitiveShader,
        webGLData;

    if(graphics.dirty)
    {
        PIXI.WebGLGraphics.updateGraphics(graphics, gl);
    }

    var webGL = graphics._webGL[gl.id];

    // This  could be speeded up for sure!

    for (var i = 0; i < webGL.data.length; i++)
    {
        if(webGL.data[i].mode === 1)
        {
            webGLData = webGL.data[i];

            renderSession.stencilManager.pushStencil(graphics, webGLData, renderSession);

            // render quad..
            gl.drawElements(gl.TRIANGLE_FAN, 4, gl.UNSIGNED_SHORT, ( webGLData.indices.length - 4 ) * 2 );
            
            renderSession.stencilManager.popStencil(graphics, webGLData, renderSession);
        }
        else
        {
            webGLData = webGL.data[i];
           

            renderSession.shaderManager.setShader( shader );//activatePrimitiveShader();
            shader = renderSession.shaderManager.primitiveShader;
            gl.uniformMatrix3fv(shader.translationMatrix, false, graphics.worldTransform.toArray(true));
            
            gl.uniform1f(shader.flipY, 1);
            
            gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
            gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);

            gl.uniform3fv(shader.tintColor, PIXI.hex2rgb(graphics.tint));

            gl.uniform1f(shader.alpha, graphics.worldAlpha);
            

            gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);

            gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
            gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false,4 * 6, 2 * 4);

            // set the index buffer!
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
            gl.drawElements(gl.TRIANGLE_STRIP,  webGLData.indices.length, gl.UNSIGNED_SHORT, 0 );
        }
    }
};

/**
 * Updates the graphics object
 *
 * @static
 * @private
 * @method updateGraphics
 * @param graphicsData {Graphics} The graphics object to update
 * @param gl {WebGLContext} the current WebGL drawing context
 */
PIXI.WebGLGraphics.updateGraphics = function(graphics, gl)
{
    // get the contexts graphics object
    var webGL = graphics._webGL[gl.id];
    // if the graphics object does not exist in the webGL context time to create it!
    if(!webGL)webGL = graphics._webGL[gl.id] = {lastIndex:0, data:[], gl:gl};

    // flag the graphics as not dirty as we are about to update it...
    graphics.dirty = false;

    var i;

    // if the user cleared the graphics object we will need to clear every object
    if(graphics.clearDirty)
    {
        graphics.clearDirty = false;

        // lop through and return all the webGLDatas to the object pool so than can be reused later on
        for (i = 0; i < webGL.data.length; i++)
        {
            var graphicsData = webGL.data[i];
            graphicsData.reset();
            PIXI.WebGLGraphics.graphicsDataPool.push( graphicsData );
        }

        // clear the array and reset the index.. 
        webGL.data = [];
        webGL.lastIndex = 0;
    }
    
    var webGLData;
    
    // loop through the graphics datas and construct each one..
    // if the object is a complex fill then the new stencil buffer technique will be used
    // other wise graphics objects will be pushed into a batch..
    for (i = webGL.lastIndex; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];

        if(data.type === PIXI.Graphics.POLY)
        {
            // need to add the points the the graphics object..
            data.points = data.shape.points.slice();
            if(data.shape.closed)
            {
                // close the poly if the value is true!
                if(data.points[0] !== data.points[data.points.length-2] || data.points[1] !== data.points[data.points.length-1])
                {
                    data.points.push(data.points[0], data.points[1]);
                }
            }

            // MAKE SURE WE HAVE THE CORRECT TYPE..
            if(data.fill)
            {
                if(data.points.length >= PIXI.WebGLGraphics.stencilBufferLimit)
                {
                    if(data.points.length < PIXI.WebGLGraphics.stencilBufferLimit * 2)
                    {
                        webGLData = PIXI.WebGLGraphics.switchMode(webGL, 0);
                        
                        var canDrawUsingSimple = PIXI.WebGLGraphics.buildPoly(data, webGLData);
                   //     console.log(canDrawUsingSimple);

                        if(!canDrawUsingSimple)
                        {
                        //    console.log("<>>>")
                            webGLData = PIXI.WebGLGraphics.switchMode(webGL, 1);
                            PIXI.WebGLGraphics.buildComplexPoly(data, webGLData);
                        }
                        
                    }
                    else
                    {
                        webGLData = PIXI.WebGLGraphics.switchMode(webGL, 1);
                        PIXI.WebGLGraphics.buildComplexPoly(data, webGLData);
                    }
                }
            }

            if(data.lineWidth > 0)
            {
                webGLData = PIXI.WebGLGraphics.switchMode(webGL, 0);
                PIXI.WebGLGraphics.buildLine(data, webGLData);

            }
        }
        else
        {
            webGLData = PIXI.WebGLGraphics.switchMode(webGL, 0);
            
            if(data.type === PIXI.Graphics.RECT)
            {
                PIXI.WebGLGraphics.buildRectangle(data, webGLData);
            }
            else if(data.type === PIXI.Graphics.CIRC || data.type === PIXI.Graphics.ELIP)
            {
                PIXI.WebGLGraphics.buildCircle(data, webGLData);
            }
            else if(data.type === PIXI.Graphics.RREC)
            {
                PIXI.WebGLGraphics.buildRoundedRectangle(data, webGLData);
            }
        }

        webGL.lastIndex++;
    }

    // upload all the dirty data...
    for (i = 0; i < webGL.data.length; i++)
    {
        webGLData = webGL.data[i];
        if(webGLData.dirty)webGLData.upload();
    }
};

/**
 * @static
 * @private
 * @method switchMode
 * @param webGL {WebGLContext}
 * @param type {Number}
 */
PIXI.WebGLGraphics.switchMode = function(webGL, type)
{
    var webGLData;

    if(!webGL.data.length)
    {
        webGLData = PIXI.WebGLGraphics.graphicsDataPool.pop() || new PIXI.WebGLGraphicsData(webGL.gl);
        webGLData.mode = type;
        webGL.data.push(webGLData);
    }
    else
    {
        webGLData = webGL.data[webGL.data.length-1];

        if(webGLData.mode !== type || type === 1)
        {
            webGLData = PIXI.WebGLGraphics.graphicsDataPool.pop() || new PIXI.WebGLGraphicsData(webGL.gl);
            webGLData.mode = type;
            webGL.data.push(webGLData);
        }
    }

    webGLData.dirty = true;

    return webGLData;
};

/**
 * Builds a rectangle to draw
 *
 * @static
 * @private
 * @method buildRectangle
 * @param graphicsData {Graphics} The graphics object containing all the necessary properties
 * @param webGLData {Object}
 */
PIXI.WebGLGraphics.buildRectangle = function(graphicsData, webGLData)
{
    // --- //
    // need to convert points to a nice regular data
    //
    var rectData = graphicsData.shape;
    var x = rectData.x;
    var y = rectData.y;
    var width = rectData.width;
    var height = rectData.height;

    if(graphicsData.fill)
    {
        var color = PIXI.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;

        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;

        var verts = webGLData.points;
        var indices = webGLData.indices;

        var vertPos = verts.length / 6;

        // start
        verts.push(x, y);
        verts.push(r, g, b, alpha);

        verts.push(x + width, y);
        verts.push(r, g, b, alpha);

        verts.push(x , y + height);
        verts.push(r, g, b, alpha);

        verts.push(x + width, y + height);
        verts.push(r, g, b, alpha);

        // insert 2 dead triangles..
        indices.push(vertPos, vertPos, vertPos + 1, vertPos + 2, vertPos + 3, vertPos + 3);
    }

    if (graphicsData.lineWidth)
    {
        var tempPoints = graphicsData.points;

        graphicsData.points = [x, y,
                  x + width, y,
                  x + width, y + height,
                  x, y + height,
                  x, y];


        PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);

        graphicsData.points = tempPoints;
    }
};

/**
 * Builds a rounded rectangle to draw
 *
 * @static
 * @private
 * @method buildRoundedRectangle
 * @param graphicsData {Graphics} The graphics object containing all the necessary properties
 * @param webGLData {Object}
 */
PIXI.WebGLGraphics.buildRoundedRectangle = function(graphicsData, webGLData)
{
    var rrectData = graphicsData.shape;
    var x = rrectData.x;
    var y = rrectData.y;
    var width = rrectData.width;
    var height = rrectData.height;

    var radius = rrectData.radius;

    var recPoints = [];
    recPoints.push(x, y + radius);
    recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x, y + height - radius, x, y + height, x + radius, y + height));
    recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x + width - radius, y + height, x + width, y + height, x + width, y + height - radius));
    recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x + width, y + radius, x + width, y, x + width - radius, y));
    recPoints = recPoints.concat(PIXI.WebGLGraphics.quadraticBezierCurve(x + radius, y, x, y, x, y + radius));

    if (graphicsData.fill) {
        var color = PIXI.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;

        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;

        var verts = webGLData.points;
        var indices = webGLData.indices;

        var vecPos = verts.length / 6;

        var triangles = PIXI.EarCut.Triangulate(recPoints, null, 2);

        var i = 0;

        for (i = 0; i < triangles.length; i+=3)
        {
            indices.push(triangles[i] + vecPos);
            indices.push(triangles[i] + vecPos);
            indices.push(triangles[i+1] + vecPos);
            indices.push(triangles[i+2] + vecPos);
            indices.push(triangles[i+2] + vecPos);
        }


        for (i = 0; i < recPoints.length; i++)
        {
            verts.push(recPoints[i], recPoints[++i], r, g, b, alpha);
        }
    }

    if (graphicsData.lineWidth) {
        var tempPoints = graphicsData.points;

        graphicsData.points = recPoints;

        PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);

        graphicsData.points = tempPoints;
    }
};

/**
 * Calculate the points for a quadratic bezier curve. (helper function..)
 * Based on: https://stackoverflow.com/questions/785097/how-do-i-implement-a-bezier-curve-in-c
 *
 * @static
 * @private
 * @method quadraticBezierCurve
 * @param fromX {Number} Origin point x
 * @param fromY {Number} Origin point x
 * @param cpX {Number} Control point x
 * @param cpY {Number} Control point y
 * @param toX {Number} Destination point x
 * @param toY {Number} Destination point y
 * @return {Array(Number)}
 */
PIXI.WebGLGraphics.quadraticBezierCurve = function(fromX, fromY, cpX, cpY, toX, toY) {

    var xa,
        ya,
        xb,
        yb,
        x,
        y,
        n = 20,
        points = [];

    function getPt(n1 , n2, perc) {
        var diff = n2 - n1;

        return n1 + ( diff * perc );
    }

    var j = 0;
    for (var i = 0; i <= n; i++ )
    {
        j = i / n;

        // The Green Line
        xa = getPt( fromX , cpX , j );
        ya = getPt( fromY , cpY , j );
        xb = getPt( cpX , toX , j );
        yb = getPt( cpY , toY , j );

        // The Black Dot
        x = getPt( xa , xb , j );
        y = getPt( ya , yb , j );

        points.push(x, y);
    }
    return points;
};

/**
 * Builds a circle to draw
 *
 * @static
 * @private
 * @method buildCircle
 * @param graphicsData {Graphics} The graphics object to draw
 * @param webGLData {Object}
 */
PIXI.WebGLGraphics.buildCircle = function(graphicsData, webGLData)
{
    // need to convert points to a nice regular data
    var circleData = graphicsData.shape;
    var x = circleData.x;
    var y = circleData.y;
    var width;
    var height;
    
    // TODO - bit hacky??
    if(graphicsData.type === PIXI.Graphics.CIRC)
    {
        width = circleData.radius;
        height = circleData.radius;
    }
    else
    {
        width = circleData.width;
        height = circleData.height;
    }

    var totalSegs = 40;
    var seg = (Math.PI * 2) / totalSegs ;

    var i = 0;

    if(graphicsData.fill)
    {
        var color = PIXI.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;

        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;

        var verts = webGLData.points;
        var indices = webGLData.indices;

        var vecPos = verts.length / 6;

        indices.push(vecPos);

        for (i = 0; i < totalSegs + 1 ; i++)
        {
            verts.push(x,y, r, g, b, alpha);

            verts.push(x + Math.sin(seg * i) * width,
                       y + Math.cos(seg * i) * height,
                       r, g, b, alpha);

            indices.push(vecPos++, vecPos++);
        }

        indices.push(vecPos-1);
    }

    if(graphicsData.lineWidth)
    {
        var tempPoints = graphicsData.points;

        graphicsData.points = [];

        for (i = 0; i < totalSegs + 1; i++)
        {
            graphicsData.points.push(x + Math.sin(seg * i) * width,
                                     y + Math.cos(seg * i) * height);
        }

        PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);

        graphicsData.points = tempPoints;
    }
};

/**
 * Builds a line to draw
 *
 * @static
 * @private
 * @method buildLine
 * @param graphicsData {Graphics} The graphics object containing all the necessary properties
 * @param webGLData {Object}
 */
PIXI.WebGLGraphics.buildLine = function(graphicsData, webGLData)
{
    // TODO OPTIMISE!
    var i = 0;
    var points = graphicsData.points;
    if(points.length === 0)return;

    // if the line width is an odd number add 0.5 to align to a whole pixel
    if(graphicsData.lineWidth%2)
    {
        for (i = 0; i < points.length; i++) {
            points[i] += 0.5;
        }
    }

    // get first and last point.. figure out the middle!
    var firstPoint = new PIXI.Point( points[0], points[1] );
    var lastPoint = new PIXI.Point( points[points.length - 2], points[points.length - 1] );

    // if the first point is the last point - gonna have issues :)
    if(firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y)
    {
        // need to clone as we are going to slightly modify the shape..
        points = points.slice();

        points.pop();
        points.pop();

        lastPoint = new PIXI.Point( points[points.length - 2], points[points.length - 1] );

        var midPointX = lastPoint.x + (firstPoint.x - lastPoint.x) *0.5;
        var midPointY = lastPoint.y + (firstPoint.y - lastPoint.y) *0.5;

        points.unshift(midPointX, midPointY);
        points.push(midPointX, midPointY);
    }

    var verts = webGLData.points;
    var indices = webGLData.indices;
    var length = points.length / 2;
    var indexCount = points.length;
    var indexStart = verts.length/6;

    // DRAW the Line
    var width = graphicsData.lineWidth / 2;

    // sort color
    var color = PIXI.hex2rgb(graphicsData.lineColor);
    var alpha = graphicsData.lineAlpha;
    var r = color[0] * alpha;
    var g = color[1] * alpha;
    var b = color[2] * alpha;

    var px, py, p1x, p1y, p2x, p2y, p3x, p3y;
    var perpx, perpy, perp2x, perp2y, perp3x, perp3y;
    var a1, b1, c1, a2, b2, c2;
    var denom, pdist, dist;

    p1x = points[0];
    p1y = points[1];

    p2x = points[2];
    p2y = points[3];

    perpx = -(p1y - p2y);
    perpy =  p1x - p2x;

    dist = Math.sqrt(perpx*perpx + perpy*perpy);

    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;

    // start
    verts.push(p1x - perpx , p1y - perpy,
                r, g, b, alpha);

    verts.push(p1x + perpx , p1y + perpy,
                r, g, b, alpha);

    for (i = 1; i < length-1; i++)
    {
        p1x = points[(i-1)*2];
        p1y = points[(i-1)*2 + 1];

        p2x = points[(i)*2];
        p2y = points[(i)*2 + 1];

        p3x = points[(i+1)*2];
        p3y = points[(i+1)*2 + 1];

        perpx = -(p1y - p2y);
        perpy = p1x - p2x;

        dist = Math.sqrt(perpx*perpx + perpy*perpy);
        perpx /= dist;
        perpy /= dist;
        perpx *= width;
        perpy *= width;

        perp2x = -(p2y - p3y);
        perp2y = p2x - p3x;

        dist = Math.sqrt(perp2x*perp2x + perp2y*perp2y);
        perp2x /= dist;
        perp2y /= dist;
        perp2x *= width;
        perp2y *= width;

        a1 = (-perpy + p1y) - (-perpy + p2y);
        b1 = (-perpx + p2x) - (-perpx + p1x);
        c1 = (-perpx + p1x) * (-perpy + p2y) - (-perpx + p2x) * (-perpy + p1y);
        a2 = (-perp2y + p3y) - (-perp2y + p2y);
        b2 = (-perp2x + p2x) - (-perp2x + p3x);
        c2 = (-perp2x + p3x) * (-perp2y + p2y) - (-perp2x + p2x) * (-perp2y + p3y);

        denom = a1*b2 - a2*b1;

        if(Math.abs(denom) < 0.1 )
        {

            denom+=10.1;
            verts.push(p2x - perpx , p2y - perpy,
                r, g, b, alpha);

            verts.push(p2x + perpx , p2y + perpy,
                r, g, b, alpha);

            continue;
        }

        px = (b1*c2 - b2*c1)/denom;
        py = (a2*c1 - a1*c2)/denom;


        pdist = (px -p2x) * (px -p2x) + (py -p2y) + (py -p2y);


        if(pdist > 140 * 140)
        {
            perp3x = perpx - perp2x;
            perp3y = perpy - perp2y;

            dist = Math.sqrt(perp3x*perp3x + perp3y*perp3y);
            perp3x /= dist;
            perp3y /= dist;
            perp3x *= width;
            perp3y *= width;

            verts.push(p2x - perp3x, p2y -perp3y);
            verts.push(r, g, b, alpha);

            verts.push(p2x + perp3x, p2y +perp3y);
            verts.push(r, g, b, alpha);

            verts.push(p2x - perp3x, p2y -perp3y);
            verts.push(r, g, b, alpha);

            indexCount++;
        }
        else
        {

            verts.push(px , py);
            verts.push(r, g, b, alpha);

            verts.push(p2x - (px-p2x), p2y - (py - p2y));
            verts.push(r, g, b, alpha);
        }
    }

    p1x = points[(length-2)*2];
    p1y = points[(length-2)*2 + 1];

    p2x = points[(length-1)*2];
    p2y = points[(length-1)*2 + 1];

    perpx = -(p1y - p2y);
    perpy = p1x - p2x;

    dist = Math.sqrt(perpx*perpx + perpy*perpy);
    perpx /= dist;
    perpy /= dist;
    perpx *= width;
    perpy *= width;

    verts.push(p2x - perpx , p2y - perpy);
    verts.push(r, g, b, alpha);

    verts.push(p2x + perpx , p2y + perpy);
    verts.push(r, g, b, alpha);

    indices.push(indexStart);

    for (i = 0; i < indexCount; i++)
    {
        indices.push(indexStart++);
    }

    indices.push(indexStart-1);
};

/**
 * Builds a complex polygon to draw
 *
 * @static
 * @private
 * @method buildComplexPoly
 * @param graphicsData {Graphics} The graphics object containing all the necessary properties
 * @param webGLData {Object}
 */
PIXI.WebGLGraphics.buildComplexPoly = function(graphicsData, webGLData)
{
    //TODO - no need to copy this as it gets turned into a FLoat32Array anyways..
    var points = graphicsData.points.slice();
    if(points.length < 6)return;

    // get first and last point.. figure out the middle!
    var indices = webGLData.indices;
    webGLData.points = points;
    webGLData.alpha = graphicsData.fillAlpha;
    webGLData.color = PIXI.hex2rgb(graphicsData.fillColor);

    /*
        calclate the bounds..
    */
    var minX = Infinity;
    var maxX = -Infinity;

    var minY = Infinity;
    var maxY = -Infinity;

    var x,y;

    // get size..
    for (var i = 0; i < points.length; i+=2)
    {
        x = points[i];
        y = points[i+1];

        minX = x < minX ? x : minX;
        maxX = x > maxX ? x : maxX;

        minY = y < minY ? y : minY;
        maxY = y > maxY ? y : maxY;
    }

    // add a quad to the end cos there is no point making another buffer!
    points.push(minX, minY,
                maxX, minY,
                maxX, maxY,
                minX, maxY);

    // push a quad onto the end.. 
    
    //TODO - this aint needed!
    var length = points.length / 2;
    for (i = 0; i < length; i++)
    {
        indices.push( i );
    }

};

/**
 * Builds a polygon to draw
 *
 * @static
 * @private
 * @method buildPoly
 * @param graphicsData {Graphics} The graphics object containing all the necessary properties
 * @param webGLData {Object}
 */
PIXI.WebGLGraphics.buildPoly = function(graphicsData, webGLData)
{
    var points = graphicsData.points;

    if(points.length < 6)return;
    // get first and last point.. figure out the middle!
    var verts = webGLData.points;
    var indices = webGLData.indices;

    var length = points.length / 2;

    // sort color
    var color = PIXI.hex2rgb(graphicsData.fillColor);
    var alpha = graphicsData.fillAlpha;
    var r = color[0] * alpha;
    var g = color[1] * alpha;
    var b = color[2] * alpha;

    var triangles = PIXI.EarCut.Triangulate(points, null, 2);

    if(!triangles)return false;

    var vertPos = verts.length / 6;

    var i = 0;

    for (i = 0; i < triangles.length; i+=3)
    {
        indices.push(triangles[i] + vertPos);
        indices.push(triangles[i] + vertPos);
        indices.push(triangles[i+1] + vertPos);
        indices.push(triangles[i+2] +vertPos);
        indices.push(triangles[i+2] + vertPos);
    }

    for (i = 0; i < length; i++)
    {
        verts.push(points[i * 2], points[i * 2 + 1],
                   r, g, b, alpha);
    }

    return true;
};

PIXI.WebGLGraphics.graphicsDataPool = [];

/**
 * @class WebGLGraphicsData
 * @private
 * @static
 */
PIXI.WebGLGraphicsData = function(gl)
{
    this.gl = gl;

    //TODO does this need to be split before uploding??
    this.color = [0,0,0]; // color split!
    this.points = [];
    this.indices = [];
    this.buffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();
    this.mode = 1;
    this.alpha = 1;
    this.dirty = true;
};

/**
 * @method reset
 */
PIXI.WebGLGraphicsData.prototype.reset = function()
{
    this.points = [];
    this.indices = [];
};

/**
 * @method upload
 */
PIXI.WebGLGraphicsData.prototype.upload = function()
{
    var gl = this.gl;

//    this.lastIndex = graphics.graphicsData.length;
    this.glPoints = new PIXI.Float32Array(this.points);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.glPoints, gl.STATIC_DRAW);

    this.glIndicies = new PIXI.Uint16Array(this.indices);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.glIndicies, gl.STATIC_DRAW);

    this.dirty = false;
};

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


/**
 * A set of functions used by the canvas renderer to draw the primitive graphics data.
 *
 * @class CanvasGraphics
 * @static
 */
PIXI.CanvasGraphics = function()
{
};

/*
 * Renders a PIXI.Graphics object to a canvas.
 *
 * @method renderGraphics
 * @static
 * @param graphics {Graphics} the actual graphics object to render
 * @param context {CanvasRenderingContext2D} the 2d drawing method of the canvas
 */
PIXI.CanvasGraphics.renderGraphics = function(graphics, context)
{
    var worldAlpha = graphics.worldAlpha;

    if (graphics.dirty)
    {
        this.updateGraphicsTint(graphics);
        graphics.dirty = false;
    }

    for (var i = 0; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];
        var shape = data.shape;

        var fillColor = data._fillTint;
        var lineColor = data._lineTint;

        context.lineWidth = data.lineWidth;

        if (data.type === PIXI.Graphics.POLY)
        {
            context.beginPath();

            var points = shape.points;

            context.moveTo(points[0], points[1]);

            for (var j=1; j < points.length/2; j++)
            {
                context.lineTo(points[j * 2], points[j * 2 + 1]);
            }

            if (shape.closed)
            {
                context.lineTo(points[0], points[1]);
            }

            // if the first and last point are the same close the path - much neater :)
            if (points[0] === points[points.length-2] && points[1] === points[points.length-1])
            {
                context.closePath();
            }

            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }

            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === PIXI.Graphics.RECT)
        {
            if (data.fillColor || data.fillColor === 0)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fillRect(shape.x, shape.y, shape.width, shape.height);
            }

            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.strokeRect(shape.x, shape.y, shape.width, shape.height);
            }
        }
        else if (data.type === PIXI.Graphics.CIRC)
        {
            // TODO - need to be Undefined!
            context.beginPath();
            context.arc(shape.x, shape.y, shape.radius,0,2*Math.PI);
            context.closePath();

            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }

            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === PIXI.Graphics.ELIP)
        {
            // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

            var w = shape.width * 2;
            var h = shape.height * 2;

            var x = shape.x - w/2;
            var y = shape.y - h/2;

            context.beginPath();

            var kappa = 0.5522848,
                ox = (w / 2) * kappa, // control point offset horizontal
                oy = (h / 2) * kappa, // control point offset vertical
                xe = x + w,           // x-end
                ye = y + h,           // y-end
                xm = x + w / 2,       // x-middle
                ym = y + h / 2;       // y-middle

            context.moveTo(x, ym);
            context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

            context.closePath();

            if (data.fill)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }

            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
        else if (data.type === PIXI.Graphics.RREC)
        {
            var rx = shape.x;
            var ry = shape.y;
            var width = shape.width;
            var height = shape.height;
            var radius = shape.radius;

            var maxRadius = Math.min(width, height) / 2 | 0;
            radius = radius > maxRadius ? maxRadius : radius;

            context.beginPath();
            context.moveTo(rx, ry + radius);
            context.lineTo(rx, ry + height - radius);
            context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
            context.lineTo(rx + width - radius, ry + height);
            context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
            context.lineTo(rx + width, ry + radius);
            context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
            context.lineTo(rx + radius, ry);
            context.quadraticCurveTo(rx, ry, rx, ry + radius);
            context.closePath();

            if (data.fillColor || data.fillColor === 0)
            {
                context.globalAlpha = data.fillAlpha * worldAlpha;
                context.fillStyle = '#' + ('00000' + ( fillColor | 0).toString(16)).substr(-6);
                context.fill();
            }

            if (data.lineWidth)
            {
                context.globalAlpha = data.lineAlpha * worldAlpha;
                context.strokeStyle = '#' + ('00000' + ( lineColor | 0).toString(16)).substr(-6);
                context.stroke();
            }
        }
    }

};

/*
 * Renders a graphics mask
 *
 * @static
 * @private
 * @method renderGraphicsMask
 * @param graphics {Graphics} the graphics which will be used as a mask
 * @param context {CanvasRenderingContext2D} the context 2d method of the canvas
 */
PIXI.CanvasGraphics.renderGraphicsMask = function(graphics, context)
{
    var len = graphics.graphicsData.length;

    if (len === 0)
    {
        return;
    }

    context.beginPath();

    for (var i = 0; i < len; i++)
    {
        var data = graphics.graphicsData[i];
        var shape = data.shape;

        if (data.type === PIXI.Graphics.POLY)
        {

            var points = shape.points;
        
            context.moveTo(points[0], points[1]);

            for (var j=1; j < points.length/2; j++)
            {
                context.lineTo(points[j * 2], points[j * 2 + 1]);
            }

            // if the first and last point are the same close the path - much neater :)
            if (points[0] === points[points.length-2] && points[1] === points[points.length-1])
            {
                context.closePath();
            }

        }
        else if (data.type === PIXI.Graphics.RECT)
        {
            context.rect(shape.x, shape.y, shape.width, shape.height);
            context.closePath();
        }
        else if (data.type === PIXI.Graphics.CIRC)
        {
            // TODO - need to be Undefined!
            context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
            context.closePath();
        }
        else if (data.type === PIXI.Graphics.ELIP)
        {

            // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

            var w = shape.width * 2;
            var h = shape.height * 2;

            var x = shape.x - w/2;
            var y = shape.y - h/2;

            var kappa = 0.5522848,
                ox = (w / 2) * kappa, // control point offset horizontal
                oy = (h / 2) * kappa, // control point offset vertical
                xe = x + w,           // x-end
                ye = y + h,           // y-end
                xm = x + w / 2,       // x-middle
                ym = y + h / 2;       // y-middle

            context.moveTo(x, ym);
            context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
            context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
            context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            context.closePath();
        }
        else if (data.type === PIXI.Graphics.RREC)
        {

            var rx = shape.x;
            var ry = shape.y;
            var width = shape.width;
            var height = shape.height;
            var radius = shape.radius;

            var maxRadius = Math.min(width, height) / 2 | 0;
            radius = radius > maxRadius ? maxRadius : radius;

            context.moveTo(rx, ry + radius);
            context.lineTo(rx, ry + height - radius);
            context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
            context.lineTo(rx + width - radius, ry + height);
            context.quadraticCurveTo(rx + width, ry + height, rx + width, ry + height - radius);
            context.lineTo(rx + width, ry + radius);
            context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
            context.lineTo(rx + radius, ry);
            context.quadraticCurveTo(rx, ry, rx, ry + radius);
            context.closePath();
        }
    }
};

PIXI.CanvasGraphics.updateGraphicsTint = function(graphics)
{
    if (graphics.tint === 0xFFFFFF)
    {
        return;
    }

    var tintR = (graphics.tint >> 16 & 0xFF) / 255;
    var tintG = (graphics.tint >> 8 & 0xFF) / 255;
    var tintB = (graphics.tint & 0xFF)/ 255;

    for (var i = 0; i < graphics.graphicsData.length; i++)
    {
        var data = graphics.graphicsData[i];

        var fillColor = data.fillColor | 0;
        var lineColor = data.lineColor | 0;

        data._fillTint = (((fillColor >> 16 & 0xFF) / 255 * tintR*255 << 16) + ((fillColor >> 8 & 0xFF) / 255 * tintG*255 << 8) +  (fillColor & 0xFF) / 255 * tintB*255);
        data._lineTint = (((lineColor >> 16 & 0xFF) / 255 * tintR*255 << 16) + ((lineColor >> 8 & 0xFF) / 255 * tintG*255 << 8) +  (lineColor & 0xFF) / 255 * tintB*255);

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Graphics object is a way to draw primitives to your game. Primitives include forms of geometry, such as Rectangles,
* Circles and Polygons. They also include lines, arcs and curves. When you initially create a Graphics object it will
* be empty. To 'draw' to it you first specify a lineStyle or fillStyle (or both), and then draw a shape. For example:
*
* ```
* graphics.beginFill(0xff0000);
* graphics.drawCircle(50, 50, 100);
* graphics.endFill();
* ```
* 
* This will draw a circle shape to the Graphics object, with a diameter of 100, located at x: 50, y: 50.
*
* When a Graphics object is rendered it will render differently based on if the game is running under Canvas or
* WebGL. Under Canvas it will use the HTML Canvas context drawing operations to draw the path. Under WebGL the
* graphics data is decomposed into polygons. Both of these are expensive processes, especially with complex shapes.
* 
* If your Graphics object doesn't change much (or at all) once you've drawn your shape to it, then you will help
* performance by calling `Graphics.generateTexture`. This will 'bake' the Graphics object into a Texture, and return it.
* You can then use this Texture for Sprites or other display objects. If your Graphics object updates frequently then
* you should avoid doing this, as it will constantly generate new textures, which will consume memory.
*
* As you can tell, Graphics objects are a bit of a trade-off. While they are extremely useful, you need to be careful
* in their complexity and quantity of them in your game.
*
* @class Phaser.Graphics
* @constructor
* @extends PIXI.Graphics
* @extends Phaser.Component.Core
* @extends Phaser.Component.Angle
* @extends Phaser.Component.AutoCull
* @extends Phaser.Component.Bounds
* @extends Phaser.Component.Destroy
* @extends Phaser.Component.FixedToCamera
* @extends Phaser.Component.InputEnabled
* @extends Phaser.Component.InWorld
* @extends Phaser.Component.LifeSpan
* @extends Phaser.Component.PhysicsBody
* @extends Phaser.Component.Reset
* @param {Phaser.Game} game - Current game instance.
* @param {number} [x=0] - X position of the new graphics object.
* @param {number} [y=0] - Y position of the new graphics object.
*/
Phaser.Graphics = function (game, x, y) {

    if (x === undefined) { x = 0; }
    if (y === undefined) { y = 0; }

    /**
    * @property {number} type - The const type of this object.
    * @default
    */
    this.type = Phaser.GRAPHICS;

    /**
    * @property {number} physicsType - The const physics body type of this object.
    * @readonly
    */
    this.physicsType = Phaser.SPRITE;

    /**
    * @property {Phaser.Point} anchor - Required for a Graphics shape to work as a Physics body, do not modify this value.
    * @private
    */
    this.anchor = new Phaser.Point();

    PIXI.Graphics.call(this);

    Phaser.Component.Core.init.call(this, game, x, y, '', null);

};

Phaser.Graphics.prototype = Object.create(PIXI.Graphics.prototype);
Phaser.Graphics.prototype.constructor = Phaser.Graphics;

Phaser.Component.Core.install.call(Phaser.Graphics.prototype, [
    'Angle',
    'AutoCull',
    'Bounds',
    'Destroy',
    'FixedToCamera',
    'InputEnabled',
    'InWorld',
    'LifeSpan',
    'PhysicsBody',
    'Reset'
]);

Phaser.Graphics.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate;
Phaser.Graphics.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate;
Phaser.Graphics.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate;
Phaser.Graphics.prototype.preUpdateCore = Phaser.Component.Core.preUpdate;

/**
* Automatically called by World.preUpdate.
* 
* @method
* @memberof Phaser.Graphics
*/
Phaser.Graphics.prototype.preUpdate = function () {

    if (!this.preUpdatePhysics() || !this.preUpdateLifeSpan() || !this.preUpdateInWorld())
    {
        return false;
    }

    return this.preUpdateCore();

};

/**
* Automatically called by World
* @method Phaser.Graphics.prototype.postUpdate
*/
Phaser.Graphics.prototype.postUpdate = function () {

    Phaser.Component.PhysicsBody.postUpdate.call(this);
    Phaser.Component.FixedToCamera.postUpdate.call(this);

    if (this._boundsDirty)
    {
        this.updateLocalBounds();
        this._boundsDirty = false;
    }

    for (var i = 0; i < this.children.length; i++)
    {
        this.children[i].postUpdate();
    }

};

/**
* Destroy this Graphics instance.
*
* @method Phaser.Graphics.prototype.destroy
* @param {boolean} [destroyChildren=true] - Should every child of this object have its destroy method called?
*/
Phaser.Graphics.prototype.destroy = function(destroyChildren) {

    this.clear();

    Phaser.Component.Destroy.prototype.destroy.call(this, destroyChildren);

};

/*
* Draws a single {Phaser.Polygon} triangle from a {Phaser.Point} array
*
* @method Phaser.Graphics.prototype.drawTriangle
* @param {Array<Phaser.Point>} points - An array of Phaser.Points that make up the three vertices of this triangle
* @param {boolean} [cull=false] - Should we check if the triangle is back-facing
*/
Phaser.Graphics.prototype.drawTriangle = function(points, cull) {

    if (cull === undefined) { cull = false; }

    var triangle = new Phaser.Polygon(points);

    if (cull)
    {
        var cameraToFace = new Phaser.Point(this.game.camera.x - points[0].x, this.game.camera.y - points[0].y);
        var ab = new Phaser.Point(points[1].x - points[0].x, points[1].y - points[0].y);
        var cb = new Phaser.Point(points[1].x - points[2].x, points[1].y - points[2].y);
        var faceNormal = cb.cross(ab);

        if (cameraToFace.dot(faceNormal) > 0)
        {
            this.drawPolygon(triangle);
        }
    }
    else
    {
        this.drawPolygon(triangle);
    }

};

/*
* Draws {Phaser.Polygon} triangles 
*
* @method Phaser.Graphics.prototype.drawTriangles
* @param {Array<Phaser.Point>|Array<number>} vertices - An array of Phaser.Points or numbers that make up the vertices of the triangles
* @param {Array<number>} {indices=null} - An array of numbers that describe what order to draw the vertices in
* @param {boolean} [cull=false] - Should we check if the triangle is back-facing
*/
Phaser.Graphics.prototype.drawTriangles = function(vertices, indices, cull) {

    if (cull === undefined) { cull = false; }

    var point1 = new Phaser.Point();
    var point2 = new Phaser.Point();
    var point3 = new Phaser.Point();
    var points = [];
    var i;

    if (!indices)
    {
        if (vertices[0] instanceof Phaser.Point)
        {
            for (i = 0; i < vertices.length / 3; i++)
            {
                this.drawTriangle([vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]], cull);
            }
        }
        else
        {
            for (i = 0; i < vertices.length / 6; i++)
            {
                point1.x = vertices[i * 6 + 0];
                point1.y = vertices[i * 6 + 1];
                point2.x = vertices[i * 6 + 2];
                point2.y = vertices[i * 6 + 3];
                point3.x = vertices[i * 6 + 4];
                point3.y = vertices[i * 6 + 5];
                this.drawTriangle([point1, point2, point3], cull);
            }
        }
    }
    else
    {
        if (vertices[0] instanceof Phaser.Point)
        {
            for (i = 0; i < indices.length /3; i++)
            {
                points.push(vertices[indices[i * 3 ]]);
                points.push(vertices[indices[i * 3 + 1]]);
                points.push(vertices[indices[i * 3 + 2]]);

                if (points.length === 3)
                {
                    this.drawTriangle(points, cull);
                    points = [];
                }
            }
        }
        else
        {
            for (i = 0; i < indices.length; i++)
            {
                point1.x = vertices[indices[i] * 2];
                point1.y = vertices[indices[i] * 2 + 1];
                points.push(point1.copyTo({}));

                if (points.length === 3)
                {
                    this.drawTriangle(points, cull);
                    points = [];
                }
            }
        }
    }
};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A RenderTexture is a special texture that allows any displayObject to be rendered to it. It allows you to take many complex objects and
* render them down into a single quad (on WebGL) which can then be used to texture other display objects with. A way of generating textures at run-time.
* 
* @class Phaser.RenderTexture
* @constructor
* @extends PIXI.RenderTexture
* @param {Phaser.Game} game - Current game instance.
* @param {number} [width=100] - The width of the render texture.
* @param {number} [height=100] - The height of the render texture.
* @param {string} [key=''] - The key of the RenderTexture in the Cache, if stored there.
* @param {number} [scaleMode=Phaser.scaleModes.DEFAULT] - One of the Phaser.scaleModes consts.
* @param {number} [resolution=1] - The resolution of the texture being generated.
*/
Phaser.RenderTexture = function (game, width, height, key, scaleMode, resolution) {

    if (key === undefined) { key = ''; }
    if (scaleMode === undefined) { scaleMode = Phaser.scaleModes.DEFAULT; }
    if (resolution === undefined) { resolution = 1; }

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * @property {string} key - The key of the RenderTexture in the Cache, if stored there.
    */
    this.key = key;

    /**
    * @property {number} type - Base Phaser object type.
    */
    this.type = Phaser.RENDERTEXTURE;

    /**
    * @property {PIXI.Matrix} _tempMatrix - The matrix that is applied when display objects are rendered to this RenderTexture.
    * @private
    */
    this._tempMatrix = new PIXI.Matrix();

    PIXI.RenderTexture.call(this, width, height, this.game.renderer, scaleMode, resolution);

    this.render = Phaser.RenderTexture.prototype.render;

};

Phaser.RenderTexture.prototype = Object.create(PIXI.RenderTexture.prototype);
Phaser.RenderTexture.prototype.constructor = Phaser.RenderTexture;

/**
* This function will draw the display object to the RenderTexture at the given coordinates.
*
* When the display object is drawn it takes into account scale and rotation.
*
* If you don't want those then use RenderTexture.renderRawXY instead.
*
* @method Phaser.RenderTexture.prototype.renderXY
* @param {Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapText|Phaser.Group} displayObject - The display object to render to this texture.
* @param {number} x - The x position to render the object at.
* @param {number} y - The y position to render the object at.
* @param {boolean} [clear=false] - If true the texture will be cleared before the display object is drawn.
*/
Phaser.RenderTexture.prototype.renderXY = function (displayObject, x, y, clear) {

    displayObject.updateTransform();

    this._tempMatrix.copyFrom(displayObject.worldTransform);
    this._tempMatrix.tx = x;
    this._tempMatrix.ty = y;

    if (this.renderer.type === PIXI.WEBGL_RENDERER)
    {
        this.renderWebGL(displayObject, this._tempMatrix, clear);
    }
    else
    {
        this.renderCanvas(displayObject, this._tempMatrix, clear);
    }

};

/**
* This function will draw the display object to the RenderTexture at the given coordinates.
*
* When the display object is drawn it doesn't take into account scale, rotation or translation.
*
* If you need those then use RenderTexture.renderXY instead.
*
* @method Phaser.RenderTexture.prototype.renderRawXY
* @param {Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapText|Phaser.Group} displayObject - The display object to render to this texture.
* @param {number} x - The x position to render the object at.
* @param {number} y - The y position to render the object at.
* @param {boolean} [clear=false] - If true the texture will be cleared before the display object is drawn.
*/
Phaser.RenderTexture.prototype.renderRawXY = function (displayObject, x, y, clear) {

    this._tempMatrix.identity().translate(x, y);

    if (this.renderer.type === PIXI.WEBGL_RENDERER)
    {
        this.renderWebGL(displayObject, this._tempMatrix, clear);
    }
    else
    {
        this.renderCanvas(displayObject, this._tempMatrix, clear);
    }

};

/**
* This function will draw the display object to the RenderTexture.
*
* In versions of Phaser prior to 2.4.0 the second parameter was a Phaser.Point object. 
* This is now a Matrix allowing you much more control over how the Display Object is rendered.
* If you need to replicate the earlier behavior please use Phaser.RenderTexture.renderXY instead.
*
* If you wish for the displayObject to be rendered taking its current scale, rotation and translation into account then either
* pass `null`, leave it undefined or pass `displayObject.worldTransform` as the matrix value.
*
* @method Phaser.RenderTexture.prototype.render
* @param {Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapText|Phaser.Group} displayObject - The display object to render to this texture.
* @param {Phaser.Matrix} [matrix] - Optional matrix to apply to the display object before rendering. If null or undefined it will use the worldTransform matrix of the given display object.
* @param {boolean} [clear=false] - If true the texture will be cleared before the display object is drawn.
*/
Phaser.RenderTexture.prototype.render = function (displayObject, matrix, clear) {

    if (matrix === undefined || matrix === null)
    {
        this._tempMatrix.copyFrom(displayObject.worldTransform);
    }
    else
    {
        this._tempMatrix.copyFrom(matrix);
    }

    if (this.renderer.type === PIXI.WEBGL_RENDERER)
    {
        this.renderWebGL(displayObject, this._tempMatrix, clear);
    }
    else
    {
        this.renderCanvas(displayObject, this._tempMatrix, clear);
    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Create a new game object for displaying Text.
*
* This uses a local hidden Canvas object and renders the type into it. It then makes a texture from this for rendering to the view.
* Because of this you can only display fonts that are currently loaded and available to the browser: fonts must be pre-loaded.
*
* See {@link http://www.jordanm.co.uk/tinytype this compatibility table} for the available default fonts across mobile browsers.
*
* @class Phaser.Text
* @extends Phaser.Sprite
* @constructor
* @param {Phaser.Game} game - Current game instance.
* @param {number} x - X position of the new text object.
* @param {number} y - Y position of the new text object.
* @param {string} text - The actual text that will be written.
* @param {object} [style] - The style properties to be set on the Text.
* @param {string} [style.font='bold 20pt Arial'] - The style and size of the font.
* @param {string} [style.fontStyle=(from font)] - The style of the font (eg. 'italic'): overrides the value in `style.font`.
* @param {string} [style.fontVariant=(from font)] - The variant of the font (eg. 'small-caps'): overrides the value in `style.font`.
* @param {string} [style.fontWeight=(from font)] - The weight of the font (eg. 'bold'): overrides the value in `style.font`.
* @param {string|number} [style.fontSize=(from font)] - The size of the font (eg. 32 or '32px'): overrides the value in `style.font`.
* @param {string} [style.backgroundColor=null] - A canvas fillstyle that will be used as the background for the whole Text object. Set to `null` to disable.
* @param {string} [style.fill='black'] - A canvas fillstyle that will be used on the text eg 'red', '#00FF00'.
* @param {string} [style.align='left'] - Horizontal alignment of each line in multiline text. Can be: 'left', 'center' or 'right'. Does not affect single lines of text (see `textBounds` and `boundsAlignH` for that).
* @param {string} [style.boundsAlignH='left'] - Horizontal alignment of the text within the `textBounds`. Can be: 'left', 'center' or 'right'.
* @param {string} [style.boundsAlignV='top'] - Vertical alignment of the text within the `textBounds`. Can be: 'top', 'middle' or 'bottom'.
* @param {string} [style.stroke='black'] - A canvas stroke style that will be used on the text stroke eg 'blue', '#FCFF00'.
* @param {number} [style.strokeThickness=0] - A number that represents the thickness of the stroke. Default is 0 (no stroke).
* @param {boolean} [style.wordWrap=false] - Indicates if word wrap should be used.
* @param {number} [style.wordWrapWidth=100] - The width in pixels at which text will wrap.
* @param {number} [style.maxLines=0] - The maximum number of lines to be shown for wrapped text.
* @param {number} [style.tabs=0] - The size (in pixels) of the tabs, for when text includes tab characters. 0 disables. Can be an array of varying tab sizes, one per tab stop.
*/
Phaser.Text = function (game, x, y, text, style) {

    x = x || 0;
    y = y || 0;

    if (text === undefined || text === null)
    {
        text = '';
    }
    else
    {
        text = text.toString();
    }

    style = Phaser.Utils.extend({}, style);

    /**
    * @property {number} type - The const type of this object.
    * @default
    */
    this.type = Phaser.TEXT;

    /**
    * @property {number} physicsType - The const physics body type of this object.
    * @readonly
    */
    this.physicsType = Phaser.SPRITE;

    /**
    * Specify a padding value which is added to the line width and height when calculating the Text size.
    * ALlows you to add extra spacing if Phaser is unable to accurately determine the true font dimensions.
    * @property {Phaser.Point} padding
    */
    this.padding = new Phaser.Point();

    /**
    * The textBounds property allows you to specify a rectangular region upon which text alignment is based.
    * See `Text.setTextBounds` for more details.
    * @property {Phaser.Rectangle} textBounds
    * @readOnly
    */
    this.textBounds = null;

    /**
     * @property {HTMLCanvasElement} canvas - The canvas element that the text is rendered.
     */
    this.canvas = PIXI.CanvasPool.create(this);

    /**
     * @property {HTMLCanvasElement} context - The context of the canvas element that the text is rendered to.
     */
    this.context = this.canvas.getContext('2d');

    /**
    * @property {array} colors - An array of the color values as specified by {@link Phaser.Text#addColor addColor}.
    */
    this.colors = [];

    /**
    * @property {array} strokeColors - An array of the stroke color values as specified by {@link Phaser.Text#addStrokeColor addStrokeColor}.
    */
    this.strokeColors = [];

    /**
    * @property {array} fontStyles - An array of the font styles values as specified by {@link Phaser.Text#addFontStyle addFontStyle}.
    */
    this.fontStyles = [];

    /**
    * @property {array} fontWeights - An array of the font weights values as specified by {@link Phaser.Text#addFontWeight addFontWeight}.
    */
    this.fontWeights = [];

    /**
    * Should the linePositionX and Y values be automatically rounded before rendering the Text?
    * You may wish to enable this if you want to remove the effect of sub-pixel aliasing from text.
    * @property {boolean} autoRound
    * @default
    */
    this.autoRound = false;

    /**
    * Will this Text object use Basic or Advanced Word Wrapping?
    * 
    * Advanced wrapping breaks long words if they are the first of a line, and repeats the process as necessary.
    * White space is condensed (e.g., consecutive spaces are replaced with one).
    * Lines are trimmed of white space before processing.
    * 
    * It throws an error if wordWrapWidth is less than a single character.
    * @property {boolean} useAdvancedWrap
    * @default
    */
    this.useAdvancedWrap = false;

    /**
     * @property {number} _res - Internal canvas resolution var.
     * @private
     */
    this._res = game.renderer.resolution;

    /**
    * @property {string} _text - Internal cache var.
    * @private
    */
    this._text = text;

    /**
    * @property {object} _fontComponents - The font, broken down into components, set in `setStyle`.
    * @private
    */
    this._fontComponents = null;

    /**
    * @property {number} lineSpacing - Additional spacing (in pixels) between each line of text if multi-line.
    * @private
    */
    this._lineSpacing = 0;

    /**
    * @property {number} _charCount - Internal character counter used by the text coloring.
    * @private
    */
    this._charCount = 0;

    /**
    * @property {number} _width - Internal width var.
    * @private
    */
    this._width = 0;

    /**
    * @property {number} _height - Internal height var.
    * @private
    */
    this._height = 0;

    Phaser.Sprite.call(this, game, x, y, PIXI.Texture.fromCanvas(this.canvas));

    this.setStyle(style);

    if (text !== '')
    {
        this.updateText();
    }

};

Phaser.Text.prototype = Object.create(Phaser.Sprite.prototype);
Phaser.Text.prototype.constructor = Phaser.Text;

/**
* Automatically called by World.preUpdate.
* 
* @method Phaser.Text#preUpdate
* @protected
*/
Phaser.Text.prototype.preUpdate = function () {

    if (!this.preUpdatePhysics() || !this.preUpdateLifeSpan() || !this.preUpdateInWorld())
    {
        return false;
    }

    return this.preUpdateCore();

};

/**
* Override this function to handle any special update requirements.
*
* @method Phaser.Text#update
* @protected
*/
Phaser.Text.prototype.update = function() {

};

/**
* Destroy this Text object, removing it from the group it belongs to.
*
* @method Phaser.Text#destroy
* @param {boolean} [destroyChildren=true] - Should every child of this object have its destroy method called?
*/
Phaser.Text.prototype.destroy = function (destroyChildren) {

    this.texture.destroy(true);

    Phaser.Component.Destroy.prototype.destroy.call(this, destroyChildren);

};

/**
* Sets a drop shadow effect on the Text. You can specify the horizontal and vertical distance of the drop shadow with the `x` and `y` parameters.
* The color controls the shade of the shadow (default is black) and can be either an `rgba` or `hex` value.
* The blur is the strength of the shadow. A value of zero means a hard shadow, a value of 10 means a very soft shadow.
* To remove a shadow already in place you can call this method with no parameters set.
* 
* @method Phaser.Text#setShadow
* @param {number} [x=0] - The shadowOffsetX value in pixels. This is how far offset horizontally the shadow effect will be.
* @param {number} [y=0] - The shadowOffsetY value in pixels. This is how far offset vertically the shadow effect will be.
* @param {string} [color='rgba(0,0,0,1)'] - The color of the shadow, as given in CSS rgba or hex format. Set the alpha component to 0 to disable the shadow.
* @param {number} [blur=0] - The shadowBlur value. Make the shadow softer by applying a Gaussian blur to it. A number from 0 (no blur) up to approx. 10 (depending on scene).
* @param {boolean} [shadowStroke=true] - Apply the drop shadow to the Text stroke (if set).
* @param {boolean} [shadowFill=true] - Apply the drop shadow to the Text fill (if set).
* @return {Phaser.Text} This Text instance.
*/
Phaser.Text.prototype.setShadow = function (x, y, color, blur, shadowStroke, shadowFill) {

    if (x === undefined) { x = 0; }
    if (y === undefined) { y = 0; }
    if (color === undefined) { color = 'rgba(0, 0, 0, 1)'; }
    if (blur === undefined) { blur = 0; }
    if (shadowStroke === undefined) { shadowStroke = true; }
    if (shadowFill === undefined) { shadowFill = true; }

    this.style.shadowOffsetX = x;
    this.style.shadowOffsetY = y;
    this.style.shadowColor = color;
    this.style.shadowBlur = blur;
    this.style.shadowStroke = shadowStroke;
    this.style.shadowFill = shadowFill;
    this.dirty = true;

    return this;

};

/**
* Set the style of the text by passing a single style object to it.
*
* @method Phaser.Text#setStyle
* @param {object} [style] - The style properties to be set on the Text.
* @param {string} [style.font='bold 20pt Arial'] - The style and size of the font.
* @param {string} [style.fontStyle=(from font)] - The style of the font (eg. 'italic'): overrides the value in `style.font`.
* @param {string} [style.fontVariant=(from font)] - The variant of the font (eg. 'small-caps'): overrides the value in `style.font`.
* @param {string} [style.fontWeight=(from font)] - The weight of the font (eg. 'bold'): overrides the value in `style.font`.
* @param {string|number} [style.fontSize=(from font)] - The size of the font (eg. 32 or '32px'): overrides the value in `style.font`.
* @param {string} [style.backgroundColor=null] - A canvas fillstyle that will be used as the background for the whole Text object. Set to `null` to disable.
* @param {string} [style.fill='black'] - A canvas fillstyle that will be used on the text eg 'red', '#00FF00'.
* @param {string} [style.align='left'] - Horizontal alignment of each line in multiline text. Can be: 'left', 'center' or 'right'. Does not affect single lines of text (see `textBounds` and `boundsAlignH` for that).
* @param {string} [style.boundsAlignH='left'] - Horizontal alignment of the text within the `textBounds`. Can be: 'left', 'center' or 'right'.
* @param {string} [style.boundsAlignV='top'] - Vertical alignment of the text within the `textBounds`. Can be: 'top', 'middle' or 'bottom'.
* @param {string} [style.stroke='black'] - A canvas stroke style that will be used on the text stroke eg 'blue', '#FCFF00'.
* @param {number} [style.strokeThickness=0] - A number that represents the thickness of the stroke. Default is 0 (no stroke).
* @param {boolean} [style.wordWrap=false] - Indicates if word wrap should be used.
* @param {number} [style.wordWrapWidth=100] - The width in pixels at which text will wrap.
* @param {number} [style.maxLines=0] - The maximum number of lines to be shown for wrapped text.
* @param {number|array} [style.tabs=0] - The size (in pixels) of the tabs, for when text includes tab characters. 0 disables. Can be an array of varying tab sizes, one per tab stop.
* @param {boolean} [update=false] - Immediately update the Text object after setting the new style? Or wait for the next frame.
* @return {Phaser.Text} This Text instance.
*/
Phaser.Text.prototype.setStyle = function (style, update) {

    if (update === undefined) { update = false; }

    style = style || {};
    style.font = style.font || 'bold 20pt Arial';
    style.backgroundColor = style.backgroundColor || null;
    style.fill = style.fill || 'black';
    style.align = style.align || 'left';
    style.boundsAlignH = style.boundsAlignH || 'left';
    style.boundsAlignV = style.boundsAlignV || 'top';
    style.stroke = style.stroke || 'black'; //provide a default, see: https://github.com/GoodBoyDigital/pixi.js/issues/136
    style.strokeThickness = style.strokeThickness || 0;
    style.wordWrap = style.wordWrap || false;
    style.wordWrapWidth = style.wordWrapWidth || 100;
    style.maxLines = style.maxLines || 0;
    style.shadowOffsetX = style.shadowOffsetX || 0;
    style.shadowOffsetY = style.shadowOffsetY || 0;
    style.shadowColor = style.shadowColor || 'rgba(0,0,0,0)';
    style.shadowBlur = style.shadowBlur || 0;
    style.tabs = style.tabs || 0;

    var components = this.fontToComponents(style.font);

    if (style.fontStyle)
    {
        components.fontStyle = style.fontStyle;
    }

    if (style.fontVariant)
    {
        components.fontVariant = style.fontVariant;
    }

    if (style.fontWeight)
    {
        components.fontWeight = style.fontWeight;
    }

    if (style.fontSize)
    {
        if (typeof style.fontSize === 'number')
        {
            style.fontSize = style.fontSize + 'px';
        }

        components.fontSize = style.fontSize;
    }

    this._fontComponents = components;

    style.font = this.componentsToFont(this._fontComponents);

    this.style = style;
    this.dirty = true;

    if (update)
    {
        this.updateText();
    }

    return this;

};

/**
* Renders text. This replaces the Pixi.Text.updateText function as we need a few extra bits in here.
*
* @method Phaser.Text#updateText
* @private
*/
Phaser.Text.prototype.updateText = function () {

    this.texture.baseTexture.resolution = this._res;

    this.context.font = this.style.font;

    var outputText = this.text;

    if (this.style.wordWrap)
    {
        outputText = this.runWordWrap(this.text);
    }

    //  Split text into lines
    var lines = outputText.split(/(?:\r\n|\r|\n)/);

    //  Calculate text width
    var tabs = this.style.tabs;
    var lineWidths = [];
    var maxLineWidth = 0;
    var fontProperties = this.determineFontProperties(this.style.font);

    var drawnLines = lines.length;
    
    if (this.style.maxLines > 0 && this.style.maxLines < lines.length)
    {
        drawnLines = this.style.maxLines;
    }

    this._charCount = 0;

    for (var i = 0; i < drawnLines; i++)
    {
        if (tabs === 0)
        {
            //  Simple layout (no tabs)
            var lineWidth =  this.style.strokeThickness + this.padding.x;

            if (this.colors.length > 0 || this.strokeColors.length > 0 || this.fontWeights.length > 0 || this.fontStyles.length > 0)
            {
                lineWidth += this.measureLine(lines[i]);
            }
            else
            {
                lineWidth += this.context.measureText(lines[i]).width;
            }

            // Adjust for wrapped text
            if (this.style.wordWrap)
            {
                lineWidth -= this.context.measureText(' ').width;
            }
        }
        else
        {
            //  Complex layout (tabs)
            var line = lines[i].split(/(?:\t)/);
            var lineWidth = this.padding.x + this.style.strokeThickness;

            if (Array.isArray(tabs))
            {
                var tab = 0;

                for (var c = 0; c < line.length; c++)
                {
                    var section = 0;

                    if (this.colors.length > 0 || this.strokeColors.length > 0 || this.fontWeights.length > 0 || this.fontStyles.length > 0)
                    {
                        section = this.measureLine(line[c]);
                    }
                    else
                    {
                        section = Math.ceil(this.context.measureText(line[c]).width);
                    }

                    if (c > 0)
                    {
                        tab += tabs[c - 1];
                    }

                    lineWidth = tab + section;
                }
            }
            else
            {
                for (var c = 0; c < line.length; c++)
                {
                    //  How far to the next tab?
                    if (this.colors.length > 0 || this.strokeColors.length > 0 || this.fontWeights.length > 0 || this.fontStyles.length > 0)
                    {
                        lineWidth += this.measureLine(line[c]);
                    }
                    else
                    {
                        lineWidth += Math.ceil(this.context.measureText(line[c]).width);
                    }

                    var diff = this.game.math.snapToCeil(lineWidth, tabs) - lineWidth;

                    lineWidth += diff;
                }
            }
        }

        lineWidths[i] = Math.ceil(lineWidth);
        maxLineWidth = Math.max(maxLineWidth, lineWidths[i]);
    }

    this.canvas.width = maxLineWidth * this._res;
    
    //  Calculate text height
    var lineHeight = fontProperties.fontSize + this.style.strokeThickness + this.padding.y;
    var height = lineHeight * drawnLines;
    var lineSpacing = this._lineSpacing;

    if (lineSpacing < 0 && Math.abs(lineSpacing) > lineHeight)
    {
        lineSpacing = -lineHeight;
    }

    //  Adjust for line spacing
    if (lineSpacing !== 0)
    {
        height += (lineSpacing > 0) ? lineSpacing * lines.length : lineSpacing * (lines.length - 1);
    }

    this.canvas.height = height * this._res;

    this.context.scale(this._res, this._res);

    if (navigator.isCocoonJS)
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.style.backgroundColor)
    {
        this.context.fillStyle = this.style.backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.context.fillStyle = this.style.fill;
    this.context.font = this.style.font;
    this.context.strokeStyle = this.style.stroke;
    this.context.textBaseline = 'alphabetic';

    this.context.lineWidth = this.style.strokeThickness;
    this.context.lineCap = 'round';
    this.context.lineJoin = 'round';

    var linePositionX;
    var linePositionY;

    this._charCount = 0;

    //  Draw text line by line
    for (i = 0; i < drawnLines; i++)
    {
        //  Split the line by

        linePositionX = this.style.strokeThickness / 2;
        linePositionY = (this.style.strokeThickness / 2 + i * lineHeight) + fontProperties.ascent;

        if (i > 0)
        {
            linePositionY += (lineSpacing * i);
        }

        if (this.style.align === 'right')
        {
            linePositionX += maxLineWidth - lineWidths[i];
        }
        else if (this.style.align === 'center')
        {
            linePositionX += (maxLineWidth - lineWidths[i]) / 2;
        }

        if (this.autoRound)
        {
            linePositionX = Math.round(linePositionX);
            linePositionY = Math.round(linePositionY);
        }

        if (this.colors.length > 0 || this.strokeColors.length > 0 || this.fontWeights.length > 0 || this.fontStyles.length > 0)
        {
            this.updateLine(lines[i], linePositionX, linePositionY);
        }
        else
        {
            if (this.style.stroke && this.style.strokeThickness)
            {
                this.updateShadow(this.style.shadowStroke);

                if (tabs === 0)
                {
                    this.context.strokeText(lines[i], linePositionX, linePositionY);
                }
                else
                {
                    this.renderTabLine(lines[i], linePositionX, linePositionY, false);
                }
            }

            if (this.style.fill)
            {
                this.updateShadow(this.style.shadowFill);

                if (tabs === 0)
                {
                    this.context.fillText(lines[i], linePositionX, linePositionY);
                }
                else
                {
                    this.renderTabLine(lines[i], linePositionX, linePositionY, true);
                }
            }
        }
    }

    this.updateTexture();

    this.dirty = false;

};

/**
* Renders a line of text that contains tab characters if Text.tab > 0.
* Called automatically by updateText.
*
* @method Phaser.Text#renderTabLine
* @private
* @param {string} line - The line of text to render.
* @param {integer} x - The x position to start rendering from.
* @param {integer} y - The y position to start rendering from.
* @param {boolean} fill - If true uses fillText, if false uses strokeText.
*/
Phaser.Text.prototype.renderTabLine = function (line, x, y, fill) {

    var text = line.split(/(?:\t)/);
    var tabs = this.style.tabs;
    var snap = 0;

    if (Array.isArray(tabs))
    {
        var tab = 0;

        for (var c = 0; c < text.length; c++)
        {
            if (c > 0)
            {
                tab += tabs[c - 1];
            }

            snap = x + tab;

            if (fill)
            {
                this.context.fillText(text[c], snap, y);
            }
            else
            {
                this.context.strokeText(text[c], snap, y);
            }
        }
    }
    else
    {
        for (var c = 0; c < text.length; c++)
        {
            var section = Math.ceil(this.context.measureText(text[c]).width);

            //  How far to the next tab?
            snap = this.game.math.snapToCeil(x, tabs);

            if (fill)
            {
                this.context.fillText(text[c], snap, y);
            }
            else
            {
                this.context.strokeText(text[c], snap, y);
            }

            x = snap + section;
        }
    }

};

/**
* Sets the Shadow on the Text.context based on the Style settings, or disables it if not enabled.
* This is called automatically by Text.updateText.
*
* @method Phaser.Text#updateShadow
* @param {boolean} state - If true the shadow will be set to the Style values, otherwise it will be set to zero.
*/
Phaser.Text.prototype.updateShadow = function (state) {

    if (state)
    {
        this.context.shadowOffsetX = this.style.shadowOffsetX;
        this.context.shadowOffsetY = this.style.shadowOffsetY;
        this.context.shadowColor = this.style.shadowColor;
        this.context.shadowBlur = this.style.shadowBlur;
    }
    else
    {
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.shadowColor = 0;
        this.context.shadowBlur = 0;
    }

};

/**
* Measures a line of text character by character taking into the account the specified character styles.
*
* @method Phaser.Text#measureLine
* @private
* @param {string} line - The line of text to measure.
* @return {integer} length of the line.
*/
Phaser.Text.prototype.measureLine = function (line) {

    var lineLength = 0;

    for (var i = 0; i < line.length; i++)
    {
        var letter = line[i];

        if (this.fontWeights.length > 0 || this.fontStyles.length > 0)
        {
            var components = this.fontToComponents(this.context.font);

            if (this.fontStyles[this._charCount])
            {
                components.fontStyle = this.fontStyles[this._charCount];
            }

            if (this.fontWeights[this._charCount])
            {
                components.fontWeight = this.fontWeights[this._charCount];
            }

            this.context.font = this.componentsToFont(components);
        }

        if (this.style.stroke && this.style.strokeThickness)
        {
            if (this.strokeColors[this._charCount])
            {
                this.context.strokeStyle = this.strokeColors[this._charCount];
            }

            this.updateShadow(this.style.shadowStroke);
        }

        if (this.style.fill)
        {
            if (this.colors[this._charCount])
            {
                this.context.fillStyle = this.colors[this._charCount];
            }

            this.updateShadow(this.style.shadowFill);
        }

        lineLength += this.context.measureText(letter).width;

        this._charCount++;
    }

    return Math.ceil(lineLength);
};

/**
* Updates a line of text, applying fill and stroke per-character colors or style and weight per-character font if applicable.
*
* @method Phaser.Text#updateLine
* @private
*/
Phaser.Text.prototype.updateLine = function (line, x, y) {

    for (var i = 0; i < line.length; i++)
    {
        var letter = line[i];

        if (this.fontWeights.length > 0 || this.fontStyles.length > 0)
        {
            var components = this.fontToComponents(this.context.font);

            if (this.fontStyles[this._charCount])
            {
                components.fontStyle = this.fontStyles[this._charCount];
            }
        
            if (this.fontWeights[this._charCount])
            {
                components.fontWeight = this.fontWeights[this._charCount];
            }
      
            this.context.font = this.componentsToFont(components);
        }

        if (this.style.stroke && this.style.strokeThickness)
        {
            if (this.strokeColors[this._charCount])
            {
                this.context.strokeStyle = this.strokeColors[this._charCount];
            }

            this.updateShadow(this.style.shadowStroke);
            this.context.strokeText(letter, x, y);
        }

        if (this.style.fill)
        {
            if (this.colors[this._charCount])
            {
                this.context.fillStyle = this.colors[this._charCount];
            }

            this.updateShadow(this.style.shadowFill);
            this.context.fillText(letter, x, y);
        }

        x += this.context.measureText(letter).width;

        this._charCount++;
    }

};

/**
* Clears any text fill or stroke colors that were set by `addColor` or `addStrokeColor`.
*
* @method Phaser.Text#clearColors
* @return {Phaser.Text} This Text instance.
*/
Phaser.Text.prototype.clearColors = function () {

    this.colors = [];
    this.strokeColors = [];
    this.dirty = true;

    return this;

};

/**
* Clears any text styles or weights font that were set by `addFontStyle` or `addFontWeight`.
*
* @method Phaser.Text#clearFontValues
* @return {Phaser.Text} This Text instance.
*/
Phaser.Text.prototype.clearFontValues = function () {

    this.fontStyles = [];
    this.fontWeights = [];
    this.dirty = true;

    return this;

};

/**
* Set specific colors for certain characters within the Text.
*
* It works by taking a color value, which is a typical HTML string such as `#ff0000` or `rgb(255,0,0)` and a position.
* The position value is the index of the character in the Text string to start applying this color to.
* Once set the color remains in use until either another color or the end of the string is encountered.
* For example if the Text was `Photon Storm` and you did `Text.addColor('#ffff00', 6)` it would color in the word `Storm` in yellow.
*
* If you wish to change the stroke color see addStrokeColor instead.
*
* @method Phaser.Text#addColor
* @param {string} color - A canvas fillstyle that will be used on the text eg `red`, `#00FF00`, `rgba()`.
* @param {number} position - The index of the character in the string to start applying this color value from.
* @return {Phaser.Text} This Text instance.
*/
Phaser.Text.prototype.addColor = function (color, position) {

    this.colors[position] = color;
    this.dirty = true;

    return this;

};

/**
* Set specific stroke colors for certain characters within the Text.
*
* It works by taking a color value, which is a typical HTML string such as `#ff0000` or `rgb(255,0,0)` and a position.
* The position value is the index of the character in the Text string to start applying this color to.
* Once set the color remains in use until either another color or the end of the string is encountered.
* For example if the Text was `Photon Storm` and you did `Text.addColor('#ffff00', 6)` it would color in the word `Storm` in yellow.
*
* This has no effect if stroke is disabled or has a thickness of 0.
*
* If you wish to change the text fill color see addColor instead.
*
* @method Phaser.Text#addStrokeColor
* @param {string} color - A canvas fillstyle that will be used on the text stroke eg `red`, `#00FF00`, `rgba()`.
* @param {number} position - The index of the character in the string to start applying this color value from.
* @return {Phaser.Text} This Text instance.
*/
Phaser.Text.prototype.addStrokeColor = function (color, position) {

    this.strokeColors[position] = color;
    this.dirty = true;

    return this;

};

/**
* Set specific font styles for certain characters within the Text.
*
* It works by taking a font style value, which is a typical string such as `normal`, `italic` or `oblique`.
* The position value is the index of the character in the Text string to start applying this font style to.
* Once set the font style remains in use until either another font style or the end of the string is encountered.
* For example if the Text was `Photon Storm` and you did `Text.addFontStyle('italic', 6)` it would font style in the word `Storm` in italic.
*
* If you wish to change the text font weight see addFontWeight instead.
*
* @method Phaser.Text#addFontStyle
* @param {string} style - A canvas font-style that will be used on the text style eg `normal`, `italic`, `oblique`.
* @param {number} position - The index of the character in the string to start applying this font style value from.
* @return {Phaser.Text} This Text instance.
*/
Phaser.Text.prototype.addFontStyle = function (style, position) {

    this.fontStyles[position] = style;
    this.dirty = true;

    return this;

};

/**
* Set specific font weights for certain characters within the Text.
*
* It works by taking a font weight value, which is a typical string such as `normal`, `bold`, `bolder`, etc.
* The position value is the index of the character in the Text string to start applying this font weight to.
* Once set the font weight remains in use until either another font weight or the end of the string is encountered.
* For example if the Text was `Photon Storm` and you did `Text.addFontWeight('bold', 6)` it would font weight in the word `Storm` in bold.
*
* If you wish to change the text font style see addFontStyle instead.
*
* @method Phaser.Text#addFontWeight
* @param {string} style - A canvas font-weight that will be used on the text weight eg `normal`, `bold`, `bolder`, `lighter`, etc.
* @param {number} position - The index of the character in the string to start applying this font weight value from.
* @return {Phaser.Text} This Text instance.
*/
Phaser.Text.prototype.addFontWeight = function (weight, position) {

    this.fontWeights[position] = weight;
    this.dirty = true;

    return this;

};

/**
* Runs the given text through the Text.runWordWrap function and returns
* the results as an array, where each element of the array corresponds to a wrapped
* line of text.
*
* Useful if you wish to control pagination on long pieces of content.
*
* @method Phaser.Text#precalculateWordWrap
* @param {string} text - The text for which the wrapping will be calculated.
* @return {array} An array of strings with the pieces of wrapped text.
*/
Phaser.Text.prototype.precalculateWordWrap = function (text) {

    this.texture.baseTexture.resolution = this._res;
    this.context.font = this.style.font;

    var wrappedLines = this.runWordWrap(text);

    return wrappedLines.split(/(?:\r\n|\r|\n)/);

};

/**
* Greedy wrapping algorithm that will wrap words as the line grows longer than its horizontal bounds.
*
* @method Phaser.Text#runWordWrap
* @param {string} text - The text to perform word wrap detection against.
* @private
*/
Phaser.Text.prototype.runWordWrap = function (text) {

    if (this.useAdvancedWrap)
    {
        return this.advancedWordWrap(text);
    }
    else
    {
        return this.basicWordWrap(text);
    }

};

/**
* Advanced wrapping algorithm that will wrap words as the line grows longer than its horizontal bounds.
* White space is condensed (e.g., consecutive spaces are replaced with one).
* Lines are trimmed of white space before processing.
* Throws an error if the user was smart enough to specify a wordWrapWidth less than a single character.
*
* @method Phaser.Text#advancedWordWrap
* @param {string} text - The text to perform word wrap detection against.
* @private
*/
Phaser.Text.prototype.advancedWordWrap = function (text) {

    var context = this.context;
    var wordWrapWidth = this.style.wordWrapWidth;

    var output = '';

    // (1) condense whitespace
    // (2) split into lines
    var lines = text
        .replace(/ +/gi, ' ')
        .split(/\r?\n/gi);

    var linesCount = lines.length;

    for (var i = 0; i < linesCount; i++)
    {
        var line = lines[i];
        var out = '';

        // trim whitespace
        line = line.replace(/^ *|\s*$/gi, '');

        // if entire line is less than wordWrapWidth
        // append the entire line and exit early
        var lineWidth = context.measureText(line).width;

        if (lineWidth < wordWrapWidth)
        {
            output += line + '\n';
            continue;
        }

        // otherwise, calculate new lines
        var currentLineWidth = wordWrapWidth;

        // split into words
        var words = line.split(' ');

        for (var j = 0; j < words.length; j++)
        {
            var word = words[j];
            var wordWithSpace = word + ' ';
            var wordWidth = context.measureText(wordWithSpace).width;

            if (wordWidth > currentLineWidth)
            {
                // break word
                if (j === 0)
                {
                    // shave off letters from word until it's small enough
                    var newWord = wordWithSpace;

                    while (newWord.length)
                    {
                        newWord = newWord.slice(0, -1);
                        wordWidth = context.measureText(newWord).width;

                        if (wordWidth <= currentLineWidth)
                        {
                            break;
                        }
                    }

                    // if wordWrapWidth is too small for even a single
                    // letter, shame user failure with a fatal error
                    if (!newWord.length)
                    {
                        throw new Error('This text\'s wordWrapWidth setting is less than a single character!');
                    }

                    // replace current word in array with remainder
                    var secondPart = word.substr(newWord.length);

                    words[j] = secondPart;

                    // append first piece to output
                    out += newWord;
                }

                // if existing word length is 0, don't include it
                var offset = (words[j].length) ? j : j + 1;

                // collapse rest of sentence
                var remainder = words.slice(offset).join(' ')
                // remove any trailing white space
                .replace(/[ \n]*$/gi, '');

                // prepend remainder to next line
                lines[i + 1] = remainder + ' ' + (lines[i + 1] || '');
                linesCount = lines.length;

                break; // processing on this line

                // append word with space to output
            }
            else
            {
                out += wordWithSpace;
                currentLineWidth -= wordWidth;
            }
        }

        // append processed line to output
        output += out.replace(/[ \n]*$/gi, '') + '\n';
    }

    // trim the end of the string
    output = output.replace(/[\s|\n]*$/gi, '');

    return output;

};

/**
* Greedy wrapping algorithm that will wrap words as the line grows longer than its horizontal bounds.
*
* @method Phaser.Text#basicWordWrap
* @param {string} text - The text to perform word wrap detection against.
* @private
*/
Phaser.Text.prototype.basicWordWrap = function (text) {

    var result = '';
    var lines = text.split('\n');

    for (var i = 0; i < lines.length; i++)
    {
        var spaceLeft = this.style.wordWrapWidth;
        var words = lines[i].split(' ');

        for (var j = 0; j < words.length; j++)
        {
            var wordWidth = this.context.measureText(words[j]).width;
            var wordWidthWithSpace = wordWidth + this.context.measureText(' ').width;

            if (wordWidthWithSpace > spaceLeft)
            {
                // Skip printing the newline if it's the first word of the line that is greater than the word wrap width.
                if (j > 0)
                {
                    result += '\n';
                }
                result += words[j] + ' ';
                spaceLeft = this.style.wordWrapWidth - wordWidth;
            }
            else
            {
                spaceLeft -= wordWidthWithSpace;
                result += words[j] + ' ';
            }
        }

        if (i < lines.length-1)
        {
            result += '\n';
        }
    }

    return result;

};

/**
* Updates the internal `style.font` if it now differs according to generation from components.
*
* @method Phaser.Text#updateFont
* @private
* @param {object} components - Font components.
*/
Phaser.Text.prototype.updateFont = function (components) {

    var font = this.componentsToFont(components);

    if (this.style.font !== font)
    {
        this.style.font = font;
        this.dirty = true;

        if (this.parent)
        {
            this.updateTransform();
        }
    }

};

/**
* Converting a short CSS-font string into the relevant components.
*
* @method Phaser.Text#fontToComponents
* @private
* @param {string} font - a CSS font string
*/
Phaser.Text.prototype.fontToComponents = function (font) {

    // The format is specified in http://www.w3.org/TR/CSS2/fonts.html#font-shorthand:
    // style - normal | italic | oblique | inherit
    // variant - normal | small-caps | inherit
    // weight - normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | inherit
    // size - xx-small | x-small | small | medium | large | x-large | xx-large,
    //        larger | smaller
    //        {number} (em | ex | ch | rem | vh | vw | vmin | vmax | px | mm | cm | in | pt | pc | %)
    // font-family - rest (but identifiers or quoted with comma separation)
    var m = font.match(/^\s*(?:\b(normal|italic|oblique|inherit)?\b)\s*(?:\b(normal|small-caps|inherit)?\b)\s*(?:\b(normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit)?\b)\s*(?:\b(xx-small|x-small|small|medium|large|x-large|xx-large|larger|smaller|0|\d*(?:[.]\d*)?(?:%|[a-z]{2,5}))?\b)\s*(.*)\s*$/);

    if (m)
    {
        var family = m[5].trim();

        // If it looks like the value should be quoted, but isn't, then quote it.
        if (!/^(?:inherit|serif|sans-serif|cursive|fantasy|monospace)$/.exec(family) && !/['",]/.exec(family))
        {
            family = "'" + family + "'";
        }

        return {
            font: font,
            fontStyle: m[1] || 'normal',
            fontVariant: m[2] || 'normal',
            fontWeight: m[3] || 'normal',
            fontSize: m[4] || 'medium',
            fontFamily: family
        };
    }
    else
    {
        console.warn("Phaser.Text - unparsable CSS font: " + font);

        return {
            font: font
        };
    }

};

/**
* Converts individual font components (see `fontToComponents`) to a short CSS font string.
*
* @method Phaser.Text#componentsToFont
* @private
* @param {object} components - Font components.
*/
Phaser.Text.prototype.componentsToFont = function (components) {

    var parts = [];
    var v;

    v = components.fontStyle;
    if (v && v !== 'normal') { parts.push(v); }

    v = components.fontVariant;
    if (v && v !== 'normal') { parts.push(v); }

    v = components.fontWeight;
    if (v && v !== 'normal') { parts.push(v); }

    v = components.fontSize;
    if (v && v !== 'medium') { parts.push(v); }

    v = components.fontFamily;
    if (v) { parts.push(v); }

    if (!parts.length)
    {
        // Fallback to whatever value the 'font' was
        parts.push(components.font);
    }

    return parts.join(" ");

};

/**
* The text to be displayed by this Text object.
* Use a \n to insert a carriage return and split the text.
* The text will be rendered with any style currently set.
*
* Use the optional `immediate` argument if you need the Text display to update immediately.
* 
* If not it will re-create the texture of this Text object during the next time the render
* loop is called.
*
* @method Phaser.Text#setText
* @param {string} [text] - The text to be displayed. Set to an empty string to clear text that is already present.
* @param {boolean} [immediate=false] - Update the texture used by this Text object immediately (true) or automatically during the next render loop (false).
* @return {Phaser.Text} This Text instance.
*/
Phaser.Text.prototype.setText = function (text, immediate) {

    if (immediate === undefined) { immediate = false; }

    this.text = text.toString() || '';

    if (immediate)
    {
        this.updateText();
    }
    else
    {
        this.dirty = true;
    }

    return this;

};

/**
 * Converts the given array into a tab delimited string and then updates this Text object.
 * This is mostly used when you want to display external data using tab stops.
 *
 * The array can be either single or multi dimensional depending on the result you need:
 *
 * `[ 'a', 'b', 'c' ]` would convert in to `"a\tb\tc"`.
 *
 * Where as:
 *
 * `[
 *      [ 'a', 'b', 'c' ],
 *      [ 'd', 'e', 'f']
 * ]`
 *
 * would convert in to: `"a\tb\tc\nd\te\tf"`
 *
 * @method Phaser.Text#parseList
 * @param {array} list - The array of data to convert into a string.
 * @return {Phaser.Text} This Text instance.
 */
Phaser.Text.prototype.parseList = function (list) {

    if (!Array.isArray(list))
    {
        return this;
    }
    else
    {
        var s = "";

        for (var i = 0; i < list.length; i++)
        {
            if (Array.isArray(list[i]))
            {
                s += list[i].join("\t");

                if (i < list.length - 1)
                {
                    s += "\n";
                }
            }
            else
            {
                s += list[i];

                if (i < list.length - 1)
                {
                    s += "\t";
                }
            }
        }
    }

    this.text = s;
    this.dirty = true;

    return this;

};

/**
 * The Text Bounds is a rectangular region that you control the dimensions of into which the Text object itself is positioned,
 * regardless of the number of lines in the text, the font size or any other attribute.
 *
 * Alignment is controlled via the properties `boundsAlignH` and `boundsAlignV` within the Text.style object, or can be directly
 * set through the setters `Text.boundsAlignH` and `Text.boundsAlignV`. Bounds alignment is independent of text alignment.
 *
 * For example: If your game is 800x600 in size and you set the text bounds to be 0,0,800,600 then by setting boundsAlignH to
 * 'center' and boundsAlignV to 'bottom' the text will render in the center and at the bottom of your game window, regardless of
 * how many lines of text there may be. Even if you adjust the text content or change the style it will remain at the bottom center
 * of the text bounds.
 *
 * This is especially powerful when you need to align text against specific coordinates in your game, but the actual text dimensions
 * may vary based on font (say for multi-lingual games).
 *
 * If `Text.wordWrapWidth` is greater than the width of the text bounds it is clamped to match the bounds width.
 *
 * Call this method with no arguments given to reset an existing textBounds.
 * 
 * It works by calculating the final position based on the Text.canvas size, which is modified as the text is updated. Some fonts
 * have additional padding around them which you can mitigate by tweaking the Text.padding property. It then adjusts the `pivot`
 * property based on the given bounds and canvas size. This means if you need to set the pivot property directly in your game then
 * you either cannot use `setTextBounds` or you must place the Text object inside another DisplayObject on which you set the pivot.
 *
 * @method Phaser.Text#setTextBounds
 * @param {number} [x] - The x coordinate of the Text Bounds region.
 * @param {number} [y] - The y coordinate of the Text Bounds region.
 * @param {number} [width] - The width of the Text Bounds region.
 * @param {number} [height] - The height of the Text Bounds region.
 * @return {Phaser.Text} This Text instance.
 */
Phaser.Text.prototype.setTextBounds = function (x, y, width, height) {

    if (x === undefined)
    {
        this.textBounds = null;
    }
    else
    {
        if (!this.textBounds)
        {
            this.textBounds = new Phaser.Rectangle(x, y, width, height);
        }
        else
        {
            this.textBounds.setTo(x, y, width, height);
        }

        if (this.style.wordWrapWidth > width)
        {
            this.style.wordWrapWidth = width;
        }
    }

    this.updateTexture();
    
    return this;

};

/**
 * Updates the texture based on the canvas dimensions.
 *
 * @method Phaser.Text#updateTexture
 * @private
 */
Phaser.Text.prototype.updateTexture = function () {

    var base = this.texture.baseTexture;
    var crop = this.texture.crop;
    var frame = this.texture.frame;

    var w = this.canvas.width;
    var h = this.canvas.height;

    base.width = w;
    base.height = h;

    crop.width = w;
    crop.height = h;

    frame.width = w;
    frame.height = h;

    this.texture.width = w;
    this.texture.height = h;

    this._width = w;
    this._height = h;

    if (this.textBounds)
    {
        var x = this.textBounds.x;
        var y = this.textBounds.y;

        //  Align the canvas based on the bounds
        if (this.style.boundsAlignH === 'right')
        {
            x += this.textBounds.width - this.canvas.width / this.resolution;
        }
        else if (this.style.boundsAlignH === 'center')
        {
            x += this.textBounds.halfWidth - (this.canvas.width / this.resolution / 2);
        }

        if (this.style.boundsAlignV === 'bottom')
        {
            y += this.textBounds.height - this.canvas.height / this.resolution;
        }
        else if (this.style.boundsAlignV === 'middle')
        {
            y += this.textBounds.halfHeight - (this.canvas.height / this.resolution / 2);
        }

        this.pivot.x = -x;
        this.pivot.y = -y;
    }

    //  Can't render something with a zero sized dimension
    this.renderable = (w !== 0 && h !== 0);

    this.texture.requiresReTint = true;

    this.texture.baseTexture.dirty();

};

/**
* Renders the object using the WebGL renderer
*
* @method Phaser.Text#_renderWebGL
* @private
* @param {RenderSession} renderSession - The Render Session to render the Text on.
*/
Phaser.Text.prototype._renderWebGL = function (renderSession) {

    if (this.dirty)
    {
        this.updateText();
        this.dirty = false;
    }

    PIXI.Sprite.prototype._renderWebGL.call(this, renderSession);

};

/**
* Renders the object using the Canvas renderer.
*
* @method Phaser.Text#_renderCanvas
* @private
* @param {RenderSession} renderSession - The Render Session to render the Text on.
*/
Phaser.Text.prototype._renderCanvas = function (renderSession) {

    if (this.dirty)
    {
        this.updateText();
        this.dirty = false;
    }
     
    PIXI.Sprite.prototype._renderCanvas.call(this, renderSession);

};

/**
* Calculates the ascent, descent and fontSize of a given font style.
*
* @method Phaser.Text#determineFontProperties
* @private
* @param {object} fontStyle 
*/
Phaser.Text.prototype.determineFontProperties = function (fontStyle) {

    var properties = Phaser.Text.fontPropertiesCache[fontStyle];

    if (!properties)
    {
        properties = {};
        
        var canvas = Phaser.Text.fontPropertiesCanvas;
        var context = Phaser.Text.fontPropertiesContext;

        context.font = fontStyle;

        var width = Math.ceil(context.measureText('|MÉq').width);
        var baseline = Math.ceil(context.measureText('|MÉq').width);
        var height = 2 * baseline;

        baseline = baseline * 1.4 | 0;

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = '#f00';
        context.fillRect(0, 0, width, height);

        context.font = fontStyle;

        context.textBaseline = 'alphabetic';
        context.fillStyle = '#000';
        context.fillText('|MÉq', 0, baseline);

        if (!context.getImageData(0, 0, width, height))
        {
            properties.ascent = baseline;
            properties.descent = baseline + 6;
            properties.fontSize = properties.ascent + properties.descent;

            Phaser.Text.fontPropertiesCache[fontStyle] = properties;

            return properties;
        }

        var imagedata = context.getImageData(0, 0, width, height).data;
        var pixels = imagedata.length;
        var line = width * 4;

        var i, j;

        var idx = 0;
        var stop = false;

        // ascent. scan from top to bottom until we find a non red pixel
        for (i = 0; i < baseline; i++)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }

            if (!stop)
            {
                idx += line;
            }
            else
            {
                break;
            }
        }

        properties.ascent = baseline - i;

        idx = pixels - line;
        stop = false;

        // descent. scan from bottom to top until we find a non red pixel
        for (i = height; i > baseline; i--)
        {
            for (j = 0; j < line; j += 4)
            {
                if (imagedata[idx + j] !== 255)
                {
                    stop = true;
                    break;
                }
            }

            if (!stop)
            {
                idx -= line;
            }
            else
            {
                break;
            }
        }

        properties.descent = i - baseline;
        //TODO might need a tweak. kind of a temp fix!
        properties.descent += 6;
        properties.fontSize = properties.ascent + properties.descent;

        Phaser.Text.fontPropertiesCache[fontStyle] = properties;
    }

    return properties;

};

/**
* Returns the bounds of the Text as a rectangle.
* The bounds calculation takes the worldTransform into account.
*
* @method Phaser.Text#getBounds
* @param {Phaser.Matrix} matrix - The transformation matrix of the Text.
* @return {Phaser.Rectangle} The framing rectangle
*/
Phaser.Text.prototype.getBounds = function (matrix) {

    if (this.dirty)
    {
        this.updateText();
        this.dirty = false;
    }

    return PIXI.Sprite.prototype.getBounds.call(this, matrix);

};

/**
* The text to be displayed by this Text object.
* Use a \n to insert a carriage return and split the text.
* The text will be rendered with any style currently set.
*
* @name Phaser.Text#text
* @property {string} text
*/
Object.defineProperty(Phaser.Text.prototype, 'text', {

    get: function() {
        return this._text;
    },

    set: function(value) {

        if (value !== this._text)
        {
            this._text = value.toString() || '';
            this.dirty = true;

            if (this.parent)
            {
                this.updateTransform();
            }
        }

    }

});

/**
* Change the font used.
*
* This is equivalent of the `font` property specified to {@link Phaser.Text#setStyle setStyle}, except
* that unlike using `setStyle` this will not change any current font fill/color settings.
*
* The CSS font string can also be individually altered with the `font`, `fontSize`, `fontWeight`, `fontStyle`, and `fontVariant` properties.
*
* @name Phaser.Text#cssFont
* @property {string} cssFont
*/
Object.defineProperty(Phaser.Text.prototype, 'cssFont', {

    get: function() {
        return this.componentsToFont(this._fontComponents);
    },

    set: function (value)
    {
        value = value || 'bold 20pt Arial';
        this._fontComponents = this.fontToComponents(value);
        this.updateFont(this._fontComponents);
    }

});

/**
* Change the font family that the text will be rendered in, such as 'Arial'.
*
* Multiple CSS font families and generic fallbacks can be specified as long as
* {@link http://www.w3.org/TR/CSS2/fonts.html#propdef-font-family CSS font-family rules} are followed.
*
* To change the entire font string use {@link Phaser.Text#cssFont cssFont} instead: eg. `text.cssFont = 'bold 20pt Arial'`.
*
* @name Phaser.Text#font
* @property {string} font
*/
Object.defineProperty(Phaser.Text.prototype, 'font', {

    get: function() {
        return this._fontComponents.fontFamily;
    },

    set: function(value) {

        value = value || 'Arial';
        value = value.trim();

        // If it looks like the value should be quoted, but isn't, then quote it.
        if (!/^(?:inherit|serif|sans-serif|cursive|fantasy|monospace)$/.exec(value) && !/['",]/.exec(value))
        {
            value = "'" + value + "'";
        }

        this._fontComponents.fontFamily = value;
        this.updateFont(this._fontComponents);

    }

});

/**
* The size of the font.
*
* If the font size is specified in pixels (eg. `32` or `'32px`') then a number (ie. `32`) representing
* the font size in pixels is returned; otherwise the value with CSS unit is returned as a string (eg. `'12pt'`).
*
* @name Phaser.Text#fontSize
* @property {number|string} fontSize
*/
Object.defineProperty(Phaser.Text.prototype, 'fontSize', {

    get: function() {

        var size = this._fontComponents.fontSize;

        if (size && /(?:^0$|px$)/.exec(size))
        {
            return parseInt(size, 10);
        }
        else
        {
            return size;
        }

    },

    set: function(value) {

        value = value || '0';
        
        if (typeof value === 'number')
        {
            value = value + 'px';
        }

        this._fontComponents.fontSize = value;
        this.updateFont(this._fontComponents);

    }

});

/**
* The weight of the font: 'normal', 'bold', or {@link http://www.w3.org/TR/CSS2/fonts.html#propdef-font-weight a valid CSS font weight}.
* @name Phaser.Text#fontWeight
* @property {string} fontWeight
*/
Object.defineProperty(Phaser.Text.prototype, 'fontWeight', {

    get: function() {
        return this._fontComponents.fontWeight || 'normal';
    },

    set: function(value) {

        value = value || 'normal';
        this._fontComponents.fontWeight = value;
        this.updateFont(this._fontComponents);

    }

});

/**
* The style of the font: 'normal', 'italic', 'oblique'
* @name Phaser.Text#fontStyle
* @property {string} fontStyle
*/
Object.defineProperty(Phaser.Text.prototype, 'fontStyle', {

    get: function() {
        return this._fontComponents.fontStyle || 'normal';
    },

    set: function(value) {

        value = value || 'normal';
        this._fontComponents.fontStyle = value;
        this.updateFont(this._fontComponents);

    }

});

/**
* The variant the font: 'normal', 'small-caps'
* @name Phaser.Text#fontVariant
* @property {string} fontVariant
*/
Object.defineProperty(Phaser.Text.prototype, 'fontVariant', {

    get: function() {
        return this._fontComponents.fontVariant || 'normal';
    },

    set: function(value) {

        value = value || 'normal';
        this._fontComponents.fontVariant = value;
        this.updateFont(this._fontComponents);

    }

});

/**
* @name Phaser.Text#fill
* @property {object} fill - A canvas fillstyle that will be used on the text eg 'red', '#00FF00'.
*/
Object.defineProperty(Phaser.Text.prototype, 'fill', {

    get: function() {
        return this.style.fill;
    },

    set: function(value) {

        if (value !== this.style.fill)
        {
            this.style.fill = value;
            this.dirty = true;
        }

    }

});

/**
* Controls the horizontal alignment for multiline text.
* Can be: 'left', 'center' or 'right'.
* Does not affect single lines of text. For that please see `setTextBounds`.
* @name Phaser.Text#align
* @property {string} align
*/
Object.defineProperty(Phaser.Text.prototype, 'align', {

    get: function() {
        return this.style.align;
    },

    set: function(value) {

        if (value !== this.style.align)
        {
            this.style.align = value;
            this.dirty = true;
        }

    }

});

/**
* The resolution of the canvas the text is rendered to.
* This defaults to match the resolution of the renderer, but can be changed on a per Text object basis.
* @name Phaser.Text#resolution
* @property {integer} resolution
*/
Object.defineProperty(Phaser.Text.prototype, 'resolution', {

    get: function() {
        return this._res;
    },

    set: function(value) {

        if (value !== this._res)
        {
            this._res = value;
            this.dirty = true;
        }

    }

});

/**
* The size (in pixels) of the tabs, for when text includes tab characters. 0 disables. 
* Can be an integer or an array of varying tab sizes, one tab per element.
* For example if you set tabs to 100 then when Text encounters a tab it will jump ahead 100 pixels.
* If you set tabs to be `[100,200]` then it will set the first tab at 100px and the second at 200px.
* 
* @name Phaser.Text#tabs
* @property {integer|array} tabs
*/
Object.defineProperty(Phaser.Text.prototype, 'tabs', {

    get: function() {
        return this.style.tabs;
    },

    set: function(value) {

        if (value !== this.style.tabs)
        {
            this.style.tabs = value;
            this.dirty = true;
        }

    }

});

/**
* Horizontal alignment of the text within the `textBounds`. Can be: 'left', 'center' or 'right'.
* @name Phaser.Text#boundsAlignH
* @property {string} boundsAlignH
*/
Object.defineProperty(Phaser.Text.prototype, 'boundsAlignH', {

    get: function() {
        return this.style.boundsAlignH;
    },

    set: function(value) {

        if (value !== this.style.boundsAlignH)
        {
            this.style.boundsAlignH = value;
            this.dirty = true;
        }

    }

});

/**
* Vertical alignment of the text within the `textBounds`. Can be: 'top', 'middle' or 'bottom'.
* @name Phaser.Text#boundsAlignV
* @property {string} boundsAlignV
*/
Object.defineProperty(Phaser.Text.prototype, 'boundsAlignV', {

    get: function() {
        return this.style.boundsAlignV;
    },

    set: function(value) {

        if (value !== this.style.boundsAlignV)
        {
            this.style.boundsAlignV = value;
            this.dirty = true;
        }

    }

});

/**
* @name Phaser.Text#stroke
* @property {string} stroke - A canvas fillstyle that will be used on the text stroke eg 'blue', '#FCFF00'.
*/
Object.defineProperty(Phaser.Text.prototype, 'stroke', {

    get: function() {
        return this.style.stroke;
    },

    set: function(value) {

        if (value !== this.style.stroke)
        {
            this.style.stroke = value;
            this.dirty = true;
        }

    }

});

/**
* @name Phaser.Text#strokeThickness
* @property {number} strokeThickness - A number that represents the thickness of the stroke. Default is 0 (no stroke)
*/
Object.defineProperty(Phaser.Text.prototype, 'strokeThickness', {

    get: function() {
        return this.style.strokeThickness;
    },

    set: function(value) {

        if (value !== this.style.strokeThickness)
        {
            this.style.strokeThickness = value;
            this.dirty = true;
        }

    }

});

/**
* @name Phaser.Text#wordWrap
* @property {boolean} wordWrap - Indicates if word wrap should be used.
*/
Object.defineProperty(Phaser.Text.prototype, 'wordWrap', {

    get: function() {
        return this.style.wordWrap;
    },

    set: function(value) {

        if (value !== this.style.wordWrap)
        {
            this.style.wordWrap = value;
            this.dirty = true;
        }

    }

});

/**
* @name Phaser.Text#wordWrapWidth
* @property {number} wordWrapWidth - The width at which text will wrap.
*/
Object.defineProperty(Phaser.Text.prototype, 'wordWrapWidth', {

    get: function() {
        return this.style.wordWrapWidth;
    },

    set: function(value) {

        if (value !== this.style.wordWrapWidth)
        {
            this.style.wordWrapWidth = value;
            this.dirty = true;
        }

    }

});

/**
* @name Phaser.Text#lineSpacing
* @property {number} lineSpacing - Additional spacing (in pixels) between each line of text if multi-line.
*/
Object.defineProperty(Phaser.Text.prototype, 'lineSpacing', {

    get: function() {
        return this._lineSpacing;
    },

    set: function(value) {

        if (value !== this._lineSpacing)
        {
            this._lineSpacing = parseFloat(value);
            this.dirty = true;

            if (this.parent)
            {
                this.updateTransform();
            }
        }

    }

});

/**
* @name Phaser.Text#shadowOffsetX
* @property {number} shadowOffsetX - The shadowOffsetX value in pixels. This is how far offset horizontally the shadow effect will be.
*/
Object.defineProperty(Phaser.Text.prototype, 'shadowOffsetX', {

    get: function() {
        return this.style.shadowOffsetX;
    },

    set: function(value) {

        if (value !== this.style.shadowOffsetX)
        {
            this.style.shadowOffsetX = value;
            this.dirty = true;
        }

    }

});

/**
* @name Phaser.Text#shadowOffsetY
* @property {number} shadowOffsetY - The shadowOffsetY value in pixels. This is how far offset vertically the shadow effect will be.
*/
Object.defineProperty(Phaser.Text.prototype, 'shadowOffsetY', {

    get: function() {
        return this.style.shadowOffsetY;
    },

    set: function(value) {

        if (value !== this.style.shadowOffsetY)
        {
            this.style.shadowOffsetY = value;
            this.dirty = true;
        }

    }

});

/**
* @name Phaser.Text#shadowColor
* @property {string} shadowColor - The color of the shadow, as given in CSS rgba format. Set the alpha component to 0 to disable the shadow.
*/
Object.defineProperty(Phaser.Text.prototype, 'shadowColor', {

    get: function() {
        return this.style.shadowColor;
    },

    set: function(value) {

        if (value !== this.style.shadowColor)
        {
            this.style.shadowColor = value;
            this.dirty = true;
        }

    }

});

/**
* @name Phaser.Text#shadowBlur
* @property {number} shadowBlur - The shadowBlur value. Make the shadow softer by applying a Gaussian blur to it. A number from 0 (no blur) up to approx. 10 (depending on scene).
*/
Object.defineProperty(Phaser.Text.prototype, 'shadowBlur', {

    get: function() {
        return this.style.shadowBlur;
    },

    set: function(value) {

        if (value !== this.style.shadowBlur)
        {
            this.style.shadowBlur = value;
            this.dirty = true;
        }

    }

});

/**
* @name Phaser.Text#shadowStroke
* @property {boolean} shadowStroke - Sets if the drop shadow is applied to the Text stroke.
*/
Object.defineProperty(Phaser.Text.prototype, 'shadowStroke', {

    get: function() {
        return this.style.shadowStroke;
    },

    set: function(value) {

        if (value !== this.style.shadowStroke)
        {
            this.style.shadowStroke = value;
            this.dirty = true;
        }

    }

});

/**
* @name Phaser.Text#shadowFill
* @property {boolean} shadowFill - Sets if the drop shadow is applied to the Text fill.
*/
Object.defineProperty(Phaser.Text.prototype, 'shadowFill', {

    get: function() {
        return this.style.shadowFill;
    },

    set: function(value) {

        if (value !== this.style.shadowFill)
        {
            this.style.shadowFill = value;
            this.dirty = true;
        }

    }

});

/**
* @name Phaser.Text#width
* @property {number} width - The width of the Text. Setting this will modify the scale to achieve the value requested.
*/
Object.defineProperty(Phaser.Text.prototype, 'width', {

    get: function() {

        if (this.dirty)
        {
            this.updateText();
            this.dirty = false;
        }

        return this.scale.x * this.texture.frame.width;
    },

    set: function(value) {

        this.scale.x = value / this.texture.frame.width;
        this._width = value;
    }

});

/**
* @name Phaser.Text#height
* @property {number} height - The height of the Text. Setting this will modify the scale to achieve the value requested.
*/
Object.defineProperty(Phaser.Text.prototype, 'height', {

    get: function() {

        if (this.dirty)
        {
            this.updateText();
            this.dirty = false;
        }

        return this.scale.y * this.texture.frame.height;
    },

    set: function(value) {

        this.scale.y = value / this.texture.frame.height;
        this._height = value;
    }

});

Phaser.Text.fontPropertiesCache = {};

Phaser.Text.fontPropertiesCanvas = document.createElement('canvas');
Phaser.Text.fontPropertiesContext = Phaser.Text.fontPropertiesCanvas.getContext('2d');

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* BitmapText objects work by taking a texture file and an XML or JSON file that describes the font structure.
* It then generates a new Sprite object for each letter of the text, proportionally spaced out and aligned to 
* match the font structure.
* 
* BitmapText objects are less flexible than Text objects, in that they have less features such as shadows, fills and the ability 
* to use Web Fonts, however you trade this flexibility for rendering speed. You can also create visually compelling BitmapTexts by
* processing the font texture in an image editor, applying fills and any other effects required.
*
* To create multi-line text insert \r, \n or \r\n escape codes into the text string.
*
* If you are having performance issues due to the volume of sprites being rendered, and do not require the text to be constantly
* updating, you can use BitmapText.generateTexture to create a static texture from this BitmapText.
*
* To create a BitmapText data files you can use:
*
* BMFont (Windows, free): http://www.angelcode.com/products/bmfont/
* Glyph Designer (OS X, commercial): http://www.71squared.com/en/glyphdesigner
* Littera (Web-based, free): http://kvazars.com/littera/
*
* For most use cases it is recommended to use XML. If you wish to use JSON, the formatting should be equal to the result of
* converting a valid XML file through the popular X2JS library. An online tool for conversion can be found here: http://codebeautify.org/xmltojson
*
* If you were using an older version of Phaser (< 2.4) and using the DOMish parser hack, please remove this. It isn't required any longer.
*
* @class Phaser.BitmapText
* @constructor
* @extends PIXI.DisplayObjectContainer
* @extends Phaser.Component.Core
* @extends Phaser.Component.Angle
* @extends Phaser.Component.AutoCull
* @extends Phaser.Component.Bounds
* @extends Phaser.Component.Destroy
* @extends Phaser.Component.FixedToCamera
* @extends Phaser.Component.InputEnabled
* @extends Phaser.Component.InWorld
* @extends Phaser.Component.LifeSpan
* @extends Phaser.Component.PhysicsBody
* @extends Phaser.Component.Reset
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} x - X coordinate to display the BitmapText object at.
* @param {number} y - Y coordinate to display the BitmapText object at.
* @param {string} font - The key of the BitmapText as stored in Phaser.Cache.
* @param {string} [text=''] - The text that will be rendered. This can also be set later via BitmapText.text.
* @param {number} [size=32] - The size the font will be rendered at in pixels.
* @param {string} [align='left'] - The alignment of multi-line text. Has no effect if there is only one line of text.
*/
Phaser.BitmapText = function (game, x, y, font, text, size, align) {

    x = x || 0;
    y = y || 0;
    font = font || '';
    text = text || '';
    size = size || 32;
    align = align || 'left';

    PIXI.DisplayObjectContainer.call(this);

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.BITMAPTEXT;

    /**
    * @property {number} physicsType - The const physics body type of this object.
    * @readonly
    */
    this.physicsType = Phaser.SPRITE;

    /**
    * @property {number} textWidth - The width in pixels of the overall text area, taking into consideration multi-line text.
    * @readOnly
    */
    this.textWidth = 0;

    /**
    * @property {number} textHeight - The height in pixels of the overall text area, taking into consideration multi-line text.
    * @readOnly
    */
    this.textHeight = 0;

    /**
    * @property {Phaser.Point} anchor - The anchor value of this BitmapText.
    */
    this.anchor = new Phaser.Point();

    /**
    * @property {Phaser.Point} _prevAnchor - The previous anchor value.
    * @private
    */
    this._prevAnchor = new Phaser.Point();

    /**
    * @property {array} _glyphs - Private tracker for the letter sprite pool.
    * @private
    */
    this._glyphs = [];

    /**
    * @property {number} _maxWidth - Internal cache var.
    * @private
    */
    this._maxWidth = 0;

    /**
    * @property {string} _text - Internal cache var.
    * @private
    */
    this._text = text.toString() || '';

    /**
    * @property {string} _data - Internal cache var.
    * @private
    */
    this._data = game.cache.getBitmapFont(font);

    /**
    * @property {string} _font - Internal cache var.
    * @private
    */
    this._font = font;

    /**
    * @property {number} _fontSize - Internal cache var.
    * @private
    */
    this._fontSize = size;

    /**
    * @property {string} _align - Internal cache var.
    * @private
    */
    this._align = align;

    /**
    * @property {number} _tint - Internal cache var.
    * @private
    */
    this._tint = 0xFFFFFF;

    this.updateText();

    /**
    * @property {boolean} dirty - The dirty state of this object.
    */
    this.dirty = false;

    Phaser.Component.Core.init.call(this, game, x, y, '', null);

};

Phaser.BitmapText.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Phaser.BitmapText.prototype.constructor = Phaser.BitmapText;

Phaser.Component.Core.install.call(Phaser.BitmapText.prototype, [
    'Angle',
    'AutoCull',
    'Bounds',
    'Destroy',
    'FixedToCamera',
    'InputEnabled',
    'InWorld',
    'LifeSpan',
    'PhysicsBody',
    'Reset'
]);

Phaser.BitmapText.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate;
Phaser.BitmapText.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate;
Phaser.BitmapText.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate;
Phaser.BitmapText.prototype.preUpdateCore = Phaser.Component.Core.preUpdate;

/**
* Automatically called by World.preUpdate.
*
* @method
* @memberof Phaser.BitmapText
* @return {boolean} True if the BitmapText was rendered, otherwise false.
*/
Phaser.BitmapText.prototype.preUpdate = function () {

    if (!this.preUpdatePhysics() || !this.preUpdateLifeSpan() || !this.preUpdateInWorld())
    {
        return false;
    }

    return this.preUpdateCore();

};

/**
* Automatically called by World.preUpdate.
* @method Phaser.BitmapText.prototype.postUpdate
*/
Phaser.BitmapText.prototype.postUpdate = function () {

    Phaser.Component.PhysicsBody.postUpdate.call(this);
    Phaser.Component.FixedToCamera.postUpdate.call(this);

    if (this.body && this.body.type === Phaser.Physics.ARCADE)
    {
        if ((this.textWidth !== this.body.sourceWidth) || (this.textHeight !== this.body.sourceHeight))
        {
            this.body.setSize(this.textWidth, this.textHeight);
        }
    }

};

/**
* The text to be displayed by this BitmapText object.
* 
* It's faster to use `BitmapText.text = string`, but this is kept for backwards compatibility.
*
* @method Phaser.BitmapText.prototype.setText
* @param {string} text - The text to be displayed by this BitmapText object.
*/
Phaser.BitmapText.prototype.setText = function (text) {

    this.text = text;

};

/**
* Given the input text this will scan the characters until either a newline is encountered, 
* or the line exceeds maxWidth, taking into account kerning, character widths and scaling.
* 
* @method Phaser.BitmapText.prototype.scanLine
* @private
* @param {object} data - A reference to the font object in the Phaser.Cache.
* @param {float} scale - The scale of the font in relation to the texture.
* @param {string} text - The text to parse.
* @return {object} An object containing the parsed characters, total pixel width and x offsets.
*/
Phaser.BitmapText.prototype.scanLine = function (data, scale, text) {

    var x = 0;
    var w = 0;
    var lastSpace = -1;
    var wrappedWidth = 0;
    var prevCharCode = null;
    var maxWidth = (this._maxWidth > 0) ? this._maxWidth : null;
    var chars = [];

    //  Let's scan the text and work out if any of the lines are > maxWidth
    for (var i = 0; i < text.length; i++)
    {
        var end = (i === text.length - 1) ? true : false;

        if (/(?:\r\n|\r|\n)/.test(text.charAt(i)))
        {
            return { width: w, text: text.substr(0, i), end: end, chars: chars };
        }
        else
        {
            var charCode = text.charCodeAt(i);
            var charData = data.chars[charCode];

            var c = 0;

            //  If the character data isn't found in the data array 
            //  then we replace it with a blank space
            if (charData === undefined)
            {
                charCode = 32;
                charData = data.chars[charCode];
            }

            //  Adjust for kerning from previous character to this one
            var kerning = (prevCharCode && charData.kerning[prevCharCode]) ? charData.kerning[prevCharCode] : 0;

            //  Record the last space in the string and the current width
            if (/(\s)/.test(text.charAt(i)))
            {
                lastSpace = i;
                wrappedWidth = w;
            }
            
            //  What will the line width be if we add this character to it?
            c = (kerning + charData.texture.width + charData.xOffset) * scale;

            //  Do we need to line-wrap?
            if (maxWidth && ((w + c) >= maxWidth) && lastSpace > -1)
            {
                //  The last space was at "lastSpace" which was "i - lastSpace" characters ago
                return { width: wrappedWidth || w, text: text.substr(0, i - (i - lastSpace)), end: end, chars: chars };
            }
            else
            {
                w += (charData.xAdvance + kerning) * scale;

                chars.push(x + (charData.xOffset + kerning) * scale);

                x += (charData.xAdvance + kerning) * scale;

                prevCharCode = charCode;
            }
        }
    }

    return { width: w, text: text, end: end, chars: chars };

};

/**
* Given a text string this will scan each character in the string to ensure it exists
* in the BitmapText font data. If it doesn't the character is removed, or replaced with the `replace` argument.
*
* If no font data has been loaded at all this returns an empty string, as nothing can be rendered.
* 
* @method Phaser.BitmapText.prototype.cleanText
* @param {string} text - The text to parse.
* @param {string} [replace=''] - The replacement string for any missing characters.
* @return {string} The cleaned text string.
*/
Phaser.BitmapText.prototype.cleanText = function (text, replace) {

    if (replace === undefined)
    {
        replace = '';
    }

    var data = this._data.font;

    if (!data)
    {
        return '';
    }

    var re = /\r\n|\n\r|\n|\r/g;
    var lines = text.replace(re, "\n").split("\n");

    for (var i = 0; i < lines.length; i++)
    {
        var output = '';
        var line = lines[i];

        for (var c = 0; c < line.length; c++)
        {
            if (data.chars[line.charCodeAt(c)])
            {
                output = output.concat(line[c]);
            }
            else
            {
                output = output.concat(replace);
            }
        }

        lines[i] = output;
    }

    return lines.join("\n");

};

/**
* Renders text and updates it when needed.
*
* @method Phaser.BitmapText.prototype.updateText
* @private
*/
Phaser.BitmapText.prototype.updateText = function () {

    var data = this._data.font;

    if (!data)
    {
        return;
    }

    var text = this.text;
    var scale = this._fontSize / data.size;
    var lines = [];

    var y = 0;

    this.textWidth = 0;

    do
    {
        var line = this.scanLine(data, scale, text);

        line.y = y;

        lines.push(line);

        if (line.width > this.textWidth)
        {
            this.textWidth = line.width;
        }

        y += (data.lineHeight * scale);

        text = text.substr(line.text.length + 1);
        
    } while (line.end === false);

    this.textHeight = y;

    var t = 0;
    var align = 0;
    var ax = this.textWidth * this.anchor.x;
    var ay = this.textHeight * this.anchor.y;

    for (var i = 0; i < lines.length; i++)
    {
        var line = lines[i];

        if (this._align === 'right')
        {
            align = this.textWidth - line.width;
        }
        else if (this._align === 'center')
        {
            align = (this.textWidth - line.width) / 2;
        }

        for (var c = 0; c < line.text.length; c++)
        {
            var charCode = line.text.charCodeAt(c);
            var charData = data.chars[charCode];

            if (charData === undefined)
            {
                charCode = 32;
                charData = data.chars[charCode];
            }

            var g = this._glyphs[t];

            if (g)
            {
                //  Sprite already exists in the glyphs pool, so we'll reuse it for this letter
                g.texture = charData.texture;
            }
            else
            {
                //  We need a new sprite as the pool is empty or exhausted
                g = new PIXI.Sprite(charData.texture);
                g.name = line.text[c];
                this._glyphs.push(g);
            }

            g.position.x = (line.chars[c] + align) - ax;
            g.position.y = (line.y + (charData.yOffset * scale)) - ay;

            g.scale.set(scale);
            g.tint = this.tint;
            g.texture.requiresReTint = true;

            if (!g.parent)
            {
                this.addChild(g);
            }

            t++;
        }
    }

    //  Remove unnecessary children
    //  This moves them from the display list (children array) but retains them in the _glyphs pool
    for (i = t; i < this._glyphs.length; i++)
    {
        this.removeChild(this._glyphs[i]);
    }

};

/**
* If a BitmapText changes from having a large number of characters to having very few characters it will cause lots of
* Sprites to be retained in the BitmapText._glyphs array. Although they are not attached to the display list they
* still take up memory while sat in the glyphs pool waiting to be re-used in the future.
*
* If you know that the BitmapText will not grow any larger then you can purge out the excess glyphs from the pool 
* by calling this method.
*
* Calling this doesn't prevent you from increasing the length of the text again in the future.
*
* @method Phaser.BitmapText.prototype.purgeGlyphs
* @return {integer} The amount of glyphs removed from the pool.
*/
Phaser.BitmapText.prototype.purgeGlyphs = function () {

    var len = this._glyphs.length;
    var kept = [];

    for (var i = 0; i < this._glyphs.length; i++)
    {
        if (this._glyphs[i].parent !== this)
        {
            this._glyphs[i].destroy();
        }
        else
        {
            kept.push(this._glyphs[i]);
        }
    }

    this._glyphs = [];
    this._glyphs = kept;

    this.updateText();

    return len - kept.length;

};

/**
* Updates the transform of this object.
*
* @method Phaser.BitmapText.prototype.updateTransform
* @private
*/
Phaser.BitmapText.prototype.updateTransform = function () {

    if (this.dirty || !this.anchor.equals(this._prevAnchor))
    {
        this.updateText();
        this.dirty = false;
        this._prevAnchor.copyFrom(this.anchor);
    }

    PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);

};

/**
* @name Phaser.BitmapText#align
* @property {string} align - Alignment for multi-line text ('left', 'center' or 'right'), does not affect single lines of text.
*/
Object.defineProperty(Phaser.BitmapText.prototype, 'align', {

    get: function() {
        return this._align;
    },

    set: function(value) {

        if (value !== this._align && (value === 'left' || value === 'center' || value === 'right'))
        {
            this._align = value;
            this.updateText();
        }

    }

});

/**
* @name Phaser.BitmapText#tint
* @property {number} tint - The tint applied to the BitmapText. This is a hex value. Set to white to disable (0xFFFFFF)
*/
Object.defineProperty(Phaser.BitmapText.prototype, 'tint', {

    get: function() {
        return this._tint;
    },

    set: function(value) {

        if (value !== this._tint)
        {
            this._tint = value;
            this.updateText();
        }

    }

});

/**
* @name Phaser.BitmapText#font
* @property {string} font - The font the text will be rendered in, i.e. 'Arial'. Must be loaded in the browser before use.
*/
Object.defineProperty(Phaser.BitmapText.prototype, 'font', {

    get: function() {
        return this._font;
    },

    set: function(value) {

        if (value !== this._font)
        {
            this._font = value.trim();
            this._data = this.game.cache.getBitmapFont(this._font);
            this.updateText();
        }

    }

});

/**
* @name Phaser.BitmapText#fontSize
* @property {number} fontSize - The size of the font in pixels.
*/
Object.defineProperty(Phaser.BitmapText.prototype, 'fontSize', {

    get: function() {
        return this._fontSize;
    },

    set: function(value) {

        value = parseInt(value, 10);

        if (value !== this._fontSize && value > 0)
        {
            this._fontSize = value;
            this.updateText();
        }

    }

});

/**
* @name Phaser.BitmapText#text
* @property {string} text - The text to be displayed by this BitmapText object.
*/
Object.defineProperty(Phaser.BitmapText.prototype, 'text', {

    get: function() {
        return this._text;
    },

    set: function(value) {

        if (value !== this._text)
        {
            this._text = value.toString() || '';
            this.updateText();
        }

    }

});

/**
* The maximum display width of this BitmapText in pixels.
* 
* If BitmapText.text is longer than maxWidth then the lines will be automatically wrapped 
* based on the last whitespace character found in the line.
* 
* If no whitespace was found then no wrapping will take place and consequently the maxWidth value will not be honored.
* 
* Disable maxWidth by setting the value to 0.
* 
* @name Phaser.BitmapText#maxWidth
* @property {number} maxWidth - The maximum width of this BitmapText in pixels.
*/
Object.defineProperty(Phaser.BitmapText.prototype, 'maxWidth', {

    get: function() {

        return this._maxWidth;

    },

    set: function(value) {

        if (value !== this._maxWidth)
        {
            this._maxWidth = value;
            this.updateText();
        }

    }

});

/**
* Enable or disable texture smoothing for this BitmapText.
*
* The smoothing is applied to the BaseTexture of this font, which all letters of the text reference.
* 
* Smoothing is enabled by default.
* 
* @name Phaser.BitmapText#smoothed
* @property {boolean} smoothed
*/
Object.defineProperty(Phaser.BitmapText.prototype, 'smoothed', {

    get: function() {

        return !this._data.base.scaleMode;

    },

    set: function(value) {

        if (value)
        {
            this._data.base.scaleMode = 0;
        }
        else
        {
            this._data.base.scaleMode = 1;
        }

    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Retro Font is similar to a BitmapFont, in that it uses a texture to render the text. However unlike a BitmapFont every character in a RetroFont
* is the same size. This makes it similar to a sprite sheet. You typically find font sheets like this from old 8/16-bit games and demos.
* 
* @class Phaser.RetroFont
* @extends Phaser.RenderTexture
* @constructor
* @param {Phaser.Game} game - Current game instance.
* @param {string} key - The font set graphic set as stored in the Game.Cache.
* @param {number} characterWidth - The width of each character in the font set.
* @param {number} characterHeight - The height of each character in the font set.
* @param {string} chars - The characters used in the font set, in display order. You can use the TEXT_SET consts for common font set arrangements.
* @param {number} [charsPerRow] - The number of characters per row in the font set. If not given charsPerRow will be the image width / characterWidth.
* @param {number} [xSpacing=0] - If the characters in the font set have horizontal spacing between them set the required amount here.
* @param {number} [ySpacing=0] - If the characters in the font set have vertical spacing between them set the required amount here.
* @param {number} [xOffset=0] - If the font set doesn't start at the top left of the given image, specify the X coordinate offset here.
* @param {number} [yOffset=0] - If the font set doesn't start at the top left of the given image, specify the Y coordinate offset here.
*/
Phaser.RetroFont = function (game, key, characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset) {

    if (!game.cache.checkImageKey(key))
    {
        return false;
    }

    if (charsPerRow === undefined || charsPerRow === null)
    {
        charsPerRow = game.cache.getImage(key).width / characterWidth;
    }

    /**
    * @property {number} characterWidth - The width of each character in the font set.
    */
    this.characterWidth = characterWidth;

    /**
    * @property {number} characterHeight - The height of each character in the font set.
    */
    this.characterHeight = characterHeight;

    /**
    * @property {number} characterSpacingX - If the characters in the font set have horizontal spacing between them set the required amount here.
    */
    this.characterSpacingX = xSpacing || 0;

    /**
    * @property {number} characterSpacingY - If the characters in the font set have vertical spacing between them set the required amount here.
    */
    this.characterSpacingY = ySpacing || 0;

    /**
    * @property {number} characterPerRow - The number of characters per row in the font set.
    */
    this.characterPerRow = charsPerRow;

    /**
    * @property {number} offsetX - If the font set doesn't start at the top left of the given image, specify the X coordinate offset here.
    * @readonly
    */
    this.offsetX = xOffset || 0;

    /**
    * @property {number} offsetY - If the font set doesn't start at the top left of the given image, specify the Y coordinate offset here.
    * @readonly
    */
    this.offsetY = yOffset || 0;

    /**
    * @property {string} align - Alignment of the text when multiLine = true or a fixedWidth is set. Set to RetroFont.ALIGN_LEFT (default), RetroFont.ALIGN_RIGHT or RetroFont.ALIGN_CENTER.
    */
    this.align = "left";

    /**
    * @property {boolean} multiLine - If set to true all carriage-returns in text will form new lines (see align). If false the font will only contain one single line of text (the default)
    * @default
    */
    this.multiLine = false;

    /**
    * @property {boolean} autoUpperCase - Automatically convert any text to upper case. Lots of old bitmap fonts only contain upper-case characters, so the default is true.
    * @default
    */
    this.autoUpperCase = true;

    /**
    * @property {number} customSpacingX - Adds horizontal spacing between each character of the font, in pixels.
    * @default
    */
    this.customSpacingX = 0;

    /**
    * @property {number} customSpacingY - Adds vertical spacing between each line of multi-line text, set in pixels.
    * @default
    */
    this.customSpacingY = 0;

    /**
    * If you need this RetroFont image to have a fixed width you can set the width in this value.
    * If text is wider than the width specified it will be cropped off.
    * @property {number} fixedWidth
    */
    this.fixedWidth = 0;

    /**
    * @property {Image} fontSet - A reference to the image stored in the Game.Cache that contains the font.
    */
    this.fontSet = game.cache.getImage(key);

    /**
    * @property {string} _text - The text of the font image.
    * @private
    */
    this._text = '';

    /**
    * @property {array} grabData - An array of rects for faster character pasting.
    * @private
    */
    this.grabData = [];

    /**
    * @property {Phaser.FrameData} frameData - The FrameData representing this Retro Font.
    */
    this.frameData = new Phaser.FrameData();

    //  Now generate our rects for faster copying later on
    var currentX = this.offsetX;
    var currentY = this.offsetY;
    var r = 0;

    for (var c = 0; c < chars.length; c++)
    {
        var frame = this.frameData.addFrame(new Phaser.Frame(c, currentX, currentY, this.characterWidth, this.characterHeight));

        this.grabData[chars.charCodeAt(c)] = frame.index;

        r++;

        if (r === this.characterPerRow)
        {
            r = 0;
            currentX = this.offsetX;
            currentY += this.characterHeight + this.characterSpacingY;
        }
        else
        {
            currentX += this.characterWidth + this.characterSpacingX;
        }
    }

    game.cache.updateFrameData(key, this.frameData);

    /**
    * @property {Phaser.Image} stamp - The image that is stamped to the RenderTexture for each character in the font.
    * @readonly
    */
    this.stamp = new Phaser.Image(game, 0, 0, key, 0);

    Phaser.RenderTexture.call(this, game, 100, 100, '', Phaser.scaleModes.NEAREST);

    /**
    * @property {number} type - Base Phaser object type.
    */
    this.type = Phaser.RETROFONT;

};

Phaser.RetroFont.prototype = Object.create(Phaser.RenderTexture.prototype);
Phaser.RetroFont.prototype.constructor = Phaser.RetroFont;

/**
* Align each line of multi-line text to the left.
* @constant
* @type {string}
*/
Phaser.RetroFont.ALIGN_LEFT = "left";

/**
* Align each line of multi-line text to the right.
* @constant
* @type {string}
*/
Phaser.RetroFont.ALIGN_RIGHT = "right";

/**
* Align each line of multi-line text in the center.
* @constant
* @type {string}
*/
Phaser.RetroFont.ALIGN_CENTER = "center";

/**
* Text Set 1 =  !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~
* @constant
* @type {string}
*/
Phaser.RetroFont.TEXT_SET1 = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

/**
* Text Set 2 =  !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ
* @constant
* @type {string}
*/
Phaser.RetroFont.TEXT_SET2 = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
* Text Set 3 = ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 
* @constant
* @type {string}
*/
Phaser.RetroFont.TEXT_SET3 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";

/**
* Text Set 4 = ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
* @constant
* @type {string}
*/
Phaser.RetroFont.TEXT_SET4 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789";

/**
* Text Set 5 = ABCDEFGHIJKLMNOPQRSTUVWXYZ.,/() '!?-*:0123456789
* @constant
* @type {string}
*/
Phaser.RetroFont.TEXT_SET5 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ.,/() '!?-*:0123456789";

/**
* Text Set 6 = ABCDEFGHIJKLMNOPQRSTUVWXYZ!?:;0123456789"(),-.' 
* @constant
* @type {string}
*/
Phaser.RetroFont.TEXT_SET6 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!?:;0123456789\"(),-.' ";

/**
* Text Set 7 = AGMSY+:4BHNTZ!;5CIOU.?06DJPV,(17EKQW")28FLRX-'39
* @constant
* @type {string}
*/
Phaser.RetroFont.TEXT_SET7 = "AGMSY+:4BHNTZ!;5CIOU.?06DJPV,(17EKQW\")28FLRX-'39";

/**
* Text Set 8 = 0123456789 .ABCDEFGHIJKLMNOPQRSTUVWXYZ
* @constant
* @type {string}
*/
Phaser.RetroFont.TEXT_SET8 = "0123456789 .ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
* Text Set 9 = ABCDEFGHIJKLMNOPQRSTUVWXYZ()-0123456789.:,'"?!
* @constant
* @type {string}
*/
Phaser.RetroFont.TEXT_SET9 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ()-0123456789.:,'\"?!";

/**
* Text Set 10 = ABCDEFGHIJKLMNOPQRSTUVWXYZ
* @constant
* @type {string}
*/
Phaser.RetroFont.TEXT_SET10 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
* Text Set 11 = ABCDEFGHIJKLMNOPQRSTUVWXYZ.,"-+!?()':;0123456789
* @constant
* @type {string}
*/
Phaser.RetroFont.TEXT_SET11 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ.,\"-+!?()':;0123456789";

/**
* If you need this RetroFont to have a fixed width and custom alignment you can set the width here.
* If text is wider than the width specified it will be cropped off.
*
* @method Phaser.RetroFont#setFixedWidth
* @memberof Phaser.RetroFont
* @param {number} width - Width in pixels of this RetroFont. Set to zero to disable and re-enable automatic resizing.
* @param {string} [lineAlignment='left'] - Align the text within this width. Set to RetroFont.ALIGN_LEFT (default), RetroFont.ALIGN_RIGHT or RetroFont.ALIGN_CENTER.
*/
Phaser.RetroFont.prototype.setFixedWidth = function (width, lineAlignment) {

    if (lineAlignment === undefined) { lineAlignment = 'left'; }

    this.fixedWidth = width;
    this.align = lineAlignment;

};

/**
* A helper function that quickly sets lots of variables at once, and then updates the text.
*
* @method Phaser.RetroFont#setText
* @memberof Phaser.RetroFont
* @param {string} content - The text of this sprite.
* @param {boolean} [multiLine=false] - Set to true if you want to support carriage-returns in the text and create a multi-line sprite instead of a single line.
* @param {number} [characterSpacing=0] - To add horizontal spacing between each character specify the amount in pixels.
* @param {number} [lineSpacing=0] - To add vertical spacing between each line of text, set the amount in pixels.
* @param {string} [lineAlignment='left'] - Align each line of multi-line text. Set to RetroFont.ALIGN_LEFT, RetroFont.ALIGN_RIGHT or RetroFont.ALIGN_CENTER.
* @param {boolean} [allowLowerCase=false] - Lots of bitmap font sets only include upper-case characters, if yours needs to support lower case then set this to true.
*/
Phaser.RetroFont.prototype.setText = function (content, multiLine, characterSpacing, lineSpacing, lineAlignment, allowLowerCase) {

    this.multiLine = multiLine || false;
    this.customSpacingX = characterSpacing || 0;
    this.customSpacingY = lineSpacing || 0;
    this.align = lineAlignment || 'left';

    if (allowLowerCase)
    {
        this.autoUpperCase = false;
    }
    else
    {
        this.autoUpperCase = true;
    }

    if (content.length > 0)
    {
        this.text = content;
    }

};

/**
* Updates the texture with the new text.
*
* @method Phaser.RetroFont#buildRetroFontText
* @memberof Phaser.RetroFont
*/
Phaser.RetroFont.prototype.buildRetroFontText = function () {

    var cx = 0;
    var cy = 0;

    //  Clears the textureBuffer
    this.clear();

    if (this.multiLine)
    {
        var lines = this._text.split("\n");

        if (this.fixedWidth > 0)
        {
            this.resize(this.fixedWidth, (lines.length * (this.characterHeight + this.customSpacingY)) - this.customSpacingY, true);
        }
        else
        {
            this.resize(this.getLongestLine() * (this.characterWidth + this.customSpacingX), (lines.length * (this.characterHeight + this.customSpacingY)) - this.customSpacingY, true);
        }

        //  Loop through each line of text
        for (var i = 0; i < lines.length; i++)
        {
            //  Phaser.RetroFont.ALIGN_LEFT
            cx = 0;

            //  This line of text is held in lines[i] - need to work out the alignment
            if (this.align === Phaser.RetroFont.ALIGN_RIGHT)
            {
                cx = this.width - (lines[i].length * (this.characterWidth + this.customSpacingX));
            }
            else if (this.align === Phaser.RetroFont.ALIGN_CENTER)
            {
                cx = (this.width / 2) - ((lines[i].length * (this.characterWidth + this.customSpacingX)) / 2);
                cx += this.customSpacingX / 2;
            }

            //  Sanity checks
            if (cx < 0)
            {
                cx = 0;
            }

            this.pasteLine(lines[i], cx, cy, this.customSpacingX);

            cy += this.characterHeight + this.customSpacingY;
        }
    }
    else
    {
        if (this.fixedWidth > 0)
        {
            this.resize(this.fixedWidth, this.characterHeight, true);
        }
        else
        {
            this.resize(this._text.length * (this.characterWidth + this.customSpacingX), this.characterHeight, true);
        }

        //  Phaser.RetroFont.ALIGN_LEFT
        cx = 0;

        if (this.align === Phaser.RetroFont.ALIGN_RIGHT)
        {
            cx = this.width - (this._text.length * (this.characterWidth + this.customSpacingX));
        }
        else if (this.align === Phaser.RetroFont.ALIGN_CENTER)
        {
            cx = (this.width / 2) - ((this._text.length * (this.characterWidth + this.customSpacingX)) / 2);
            cx += this.customSpacingX / 2;
        }

        //  Sanity checks
        if (cx < 0)
        {
            cx = 0;
        }

        this.pasteLine(this._text, cx, 0, this.customSpacingX);
    }

    this.requiresReTint = true;

};

/**
* Internal function that takes a single line of text (2nd parameter) and pastes it into the BitmapData at the given coordinates.
* Used by getLine and getMultiLine
*
* @method Phaser.RetroFont#pasteLine
* @memberof Phaser.RetroFont
* @param {string} line - The single line of text to paste.
* @param {number} x - The x coordinate.
* @param {number} y - The y coordinate.
* @param {number} customSpacingX - Custom X spacing.
*/
Phaser.RetroFont.prototype.pasteLine = function (line, x, y, customSpacingX) {

    for (var c = 0; c < line.length; c++)
    {
        //  If it's a space then there is no point copying, so leave a blank space
        if (line.charAt(c) === " ")
        {
            x += this.characterWidth + customSpacingX;
        }
        else
        {
            //  If the character doesn't exist in the font then we don't want a blank space, we just want to skip it
            if (this.grabData[line.charCodeAt(c)] >= 0)
            {
                this.stamp.frame = this.grabData[line.charCodeAt(c)];
                this.renderXY(this.stamp, x, y, false);

                x += this.characterWidth + customSpacingX;

                if (x > this.width)
                {
                    break;
                }
            }
        }
    }
};

/**
* Works out the longest line of text in _text and returns its length
*
* @method Phaser.RetroFont#getLongestLine
* @memberof Phaser.RetroFont
* @return {number} The length of the longest line of text.
*/
Phaser.RetroFont.prototype.getLongestLine = function () {

    var longestLine = 0;

    if (this._text.length > 0)
    {
        var lines = this._text.split("\n");

        for (var i = 0; i < lines.length; i++)
        {
            if (lines[i].length > longestLine)
            {
                longestLine = lines[i].length;
            }
        }
    }

    return longestLine;
};

/**
* Internal helper function that removes all unsupported characters from the _text String, leaving only characters contained in the font set.
*
* @method Phaser.RetroFont#removeUnsupportedCharacters
* @memberof Phaser.RetroFont
* @protected
* @param {boolean} [stripCR=true] - Should it strip carriage returns as well?
* @return {string}  A clean version of the string.
*/
Phaser.RetroFont.prototype.removeUnsupportedCharacters = function (stripCR) {

    var newString = "";

    for (var c = 0; c < this._text.length; c++)
    {
        var aChar = this._text[c];
        var code = aChar.charCodeAt(0);

        if (this.grabData[code] >= 0 || (!stripCR && aChar === "\n"))
        {
            newString = newString.concat(aChar);
        }
    }

    return newString;

};

/**
* Updates the x and/or y offset that the font is rendered from. This updates all of the texture frames, so be careful how often it is called.
* Note that the values given for the x and y properties are either ADDED to or SUBTRACTED from (if negative) the existing offsetX/Y values of the characters.
* So if the current offsetY is 8 and you want it to start rendering from y16 you would call updateOffset(0, 8) to add 8 to the current y offset.
*
* @method Phaser.RetroFont#updateOffset
* @memberof Phaser.RetroFont
* @param {number} [xOffset=0] - If the font set doesn't start at the top left of the given image, specify the X coordinate offset here.
* @param {number} [yOffset=0] - If the font set doesn't start at the top left of the given image, specify the Y coordinate offset here.
*/
Phaser.RetroFont.prototype.updateOffset = function (x, y) {

    if (this.offsetX === x && this.offsetY === y)
    {
        return;
    }

    var diffX = x - this.offsetX;
    var diffY = y - this.offsetY;

    var frames = this.game.cache.getFrameData(this.stamp.key).getFrames();
    var i = frames.length;

    while (i--)
    {
        frames[i].x += diffX;
        frames[i].y += diffY;
    }

    this.buildRetroFontText();

};

/**
* @name Phaser.RetroFont#text
* @property {string} text - Set this value to update the text in this sprite. Carriage returns are automatically stripped out if multiLine is false. Text is converted to upper case if autoUpperCase is true.
*/
Object.defineProperty(Phaser.RetroFont.prototype, "text", {

    get: function () {

        return this._text;

    },

    set: function (value) {

        var newText;

        if (this.autoUpperCase)
        {
            newText = value.toUpperCase();
        }
        else
        {
            newText = value;
        }

        if (newText !== this._text)
        {
            this._text = newText;

            this.removeUnsupportedCharacters(this.multiLine);

            this.buildRetroFontText();
        }

    }

});

/**
* @name Phaser.RetroFont#smoothed
* @property {boolean} smoothed - Sets if the stamp is smoothed or not.
*/
Object.defineProperty(Phaser.RetroFont.prototype, "smoothed", {

    get: function () {

        return this.stamp.smoothed;

    },

    set: function (value) {

        this.stamp.smoothed = value;
        this.buildRetroFontText();

    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd, Richard Davey
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Rope is a Sprite that has a repeating texture.
* 
* The texture will automatically wrap on the edges as it moves.
* 
* Please note that Ropes cannot have an input handler.
*
* @class Phaser.Rope
* @constructor
* @extends PIXI.Rope
* @extends Phaser.Component.Core
* @extends Phaser.Component.Angle
* @extends Phaser.Component.Animation
* @extends Phaser.Component.AutoCull
* @extends Phaser.Component.Bounds
* @extends Phaser.Component.BringToTop
* @extends Phaser.Component.Crop
* @extends Phaser.Component.Delta
* @extends Phaser.Component.Destroy
* @extends Phaser.Component.FixedToCamera
* @extends Phaser.Component.InWorld
* @extends Phaser.Component.LifeSpan
* @extends Phaser.Component.LoadTexture
* @extends Phaser.Component.Overlap
* @extends Phaser.Component.PhysicsBody
* @extends Phaser.Component.Reset
* @extends Phaser.Component.ScaleMinMax
* @extends Phaser.Component.Smoothed
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} x - The x coordinate (in world space) to position the Rope at.
* @param {number} y - The y coordinate (in world space) to position the Rope at.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Rope during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
* @param {string|number} frame - If this Rope is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
* @param {Array} points - An array of {Phaser.Point}.
*/
Phaser.Rope = function (game, x, y, key, frame, points) {

    this.points = [];
    this.points = points;
    this._hasUpdateAnimation = false;
    this._updateAnimationCallback = null;
    x = x || 0;
    y = y || 0;
    key = key || null;
    frame = frame || null;

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.ROPE;

    PIXI.Rope.call(this, Phaser.Cache.DEFAULT, this.points);

    Phaser.Component.Core.init.call(this, game, x, y, key, frame);

};

Phaser.Rope.prototype = Object.create(PIXI.Rope.prototype);
Phaser.Rope.prototype.constructor = Phaser.Rope;

Phaser.Component.Core.install.call(Phaser.Rope.prototype, [
    'Angle',
    'Animation',
    'AutoCull',
    'Bounds',
    'BringToTop',
    'Crop',
    'Delta',
    'Destroy',
    'FixedToCamera',
    'InWorld',
    'LifeSpan',
    'LoadTexture',
    'Overlap',
    'PhysicsBody',
    'Reset',
    'ScaleMinMax',
    'Smoothed'
]);

Phaser.Rope.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate;
Phaser.Rope.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate;
Phaser.Rope.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate;
Phaser.Rope.prototype.preUpdateCore = Phaser.Component.Core.preUpdate;

/**
* Automatically called by World.preUpdate.
*
* @method Phaser.Rope#preUpdate
* @memberof Phaser.Rope
*/
Phaser.Rope.prototype.preUpdate = function() {

    if (!this.preUpdatePhysics() || !this.preUpdateLifeSpan() || !this.preUpdateInWorld())
    {
        return false;
    }

    return this.preUpdateCore();

};

/**
* Override and use this function in your own custom objects to handle any update requirements you may have.
*
* @method Phaser.Rope#update
* @memberof Phaser.Rope
*/
Phaser.Rope.prototype.update = function() {

    if (this._hasUpdateAnimation)
    {
        this.updateAnimation.call(this);
    }

};

/**
* Resets the Rope. This places the Rope at the given x/y world coordinates and then
* sets alive, exists, visible and renderable all to true. Also resets the outOfBounds state.
* If the Rope has a physics body that too is reset.
*
* @method Phaser.Rope#reset
* @memberof Phaser.Rope
* @param {number} x - The x coordinate (in world space) to position the Sprite at.
* @param {number} y - The y coordinate (in world space) to position the Sprite at.
* @return {Phaser.Rope} This instance.
*/
Phaser.Rope.prototype.reset = function(x, y) {

    Phaser.Component.Reset.prototype.reset.call(this, x, y);

    return this;

};

/**
* A Rope will call its updateAnimation function on each update loop if it has one.
*
* @name Phaser.Rope#updateAnimation
* @property {function} updateAnimation - Set to a function if you'd like the rope to animate during the update phase. Set to false or null to remove it.
*/
Object.defineProperty(Phaser.Rope.prototype, "updateAnimation", {

    get: function () {

        return this._updateAnimation;

    },

    set: function (value) {

        if (value && typeof value === 'function')
        {
            this._hasUpdateAnimation = true;
            this._updateAnimation = value;
        }
        else
        {
            this._hasUpdateAnimation = false;
            this._updateAnimation = null;
        }

    }

});

/**
* The segments that make up the rope body as an array of Phaser.Rectangles
*
* @name Phaser.Rope#segments
* @property {Phaser.Rectangles[]} updateAnimation - Returns an array of Phaser.Rectangles that represent the segments of the given rope
*/
Object.defineProperty(Phaser.Rope.prototype, "segments", {

    get: function() {

        var segments = [];
        var index, x1, y1, x2, y2, width, height, rect;

        for (var i = 0; i < this.points.length; i++)
        {
            index = i * 4;

            x1 = this.vertices[index] * this.scale.x;
            y1 = this.vertices[index + 1] * this.scale.y;
            x2 = this.vertices[index + 4] * this.scale.x;
            y2 = this.vertices[index + 3] * this.scale.y;

            width = Phaser.Math.difference(x1, x2);
            height = Phaser.Math.difference(y1, y2);

            x1 += this.world.x;
            y1 += this.world.y;
            rect = new Phaser.Rectangle(x1, y1, width, height);
            segments.push(rect);
        }

        return segments;
    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A TileSprite is a Sprite that has a repeating texture. The texture can be scrolled and scaled independently of the TileSprite itself.
* Textures will automatically wrap and are designed so that you can create game backdrops using seamless textures as a source.
* 
* TileSprites have no input handler or physics bodies by default, both need enabling in the same way as for normal Sprites.
*
* You shouldn't ever create a TileSprite any larger than your actual screen size. If you want to create a large repeating background
* that scrolls across the whole map of your game, then you create a TileSprite that fits the screen size and then use the `tilePosition`
* property to scroll the texture as the player moves. If you create a TileSprite that is thousands of pixels in size then it will 
* consume huge amounts of memory and cause performance issues. Remember: use `tilePosition` to scroll your texture and `tileScale` to
* adjust the scale of the texture - don't resize the sprite itself or make it larger than it needs.
*
* An important note about texture dimensions:
*
* When running under Canvas a TileSprite can use any texture size without issue. When running under WebGL the texture should ideally be
* a power of two in size (i.e. 4, 8, 16, 32, 64, 128, 256, 512, etc pixels width by height). If the texture isn't a power of two
* it will be rendered to a blank canvas that is the correct size, which means you may have 'blank' areas appearing to the right and
* bottom of your frame. To avoid this ensure your textures are perfect powers of two.
* 
* TileSprites support animations in the same way that Sprites do. You add and play animations using the AnimationManager. However
* if your game is running under WebGL please note that each frame of the animation must be a power of two in size, or it will receive
* additional padding to enforce it to be so.
*
* @class Phaser.TileSprite
* @constructor
* @extends PIXI.TilingSprite
* @extends Phaser.Component.Core
* @extends Phaser.Component.Angle
* @extends Phaser.Component.Animation
* @extends Phaser.Component.AutoCull
* @extends Phaser.Component.Bounds
* @extends Phaser.Component.BringToTop
* @extends Phaser.Component.Destroy
* @extends Phaser.Component.FixedToCamera
* @extends Phaser.Component.Health
* @extends Phaser.Component.InCamera
* @extends Phaser.Component.InputEnabled
* @extends Phaser.Component.InWorld
* @extends Phaser.Component.LifeSpan
* @extends Phaser.Component.LoadTexture
* @extends Phaser.Component.Overlap
* @extends Phaser.Component.PhysicsBody
* @extends Phaser.Component.Reset
* @extends Phaser.Component.Smoothed
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} x - The x coordinate (in world space) to position the TileSprite at.
* @param {number} y - The y coordinate (in world space) to position the TileSprite at.
* @param {number} width - The width of the TileSprite.
* @param {number} height - The height of the TileSprite.
* @param {string|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the TileSprite during rendering. It can be a string which is a reference to the Phaser Image Cache entry, or an instance of a PIXI.Texture or BitmapData.
* @param {string|number} frame - If this TileSprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
*/
Phaser.TileSprite = function (game, x, y, width, height, key, frame) {

    x = x || 0;
    y = y || 0;
    width = width || 256;
    height = height || 256;
    key = key || null;
    frame = frame || null;

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.TILESPRITE;

    /**
    * @property {number} physicsType - The const physics body type of this object.
    * @readonly
    */
    this.physicsType = Phaser.SPRITE;

    /**
    * @property {Phaser.Point} _scroll - Internal cache var.
    * @private
    */
    this._scroll = new Phaser.Point();

    var def = game.cache.getImage('__default', true);

    PIXI.TilingSprite.call(this, new PIXI.Texture(def.base), width, height);

    Phaser.Component.Core.init.call(this, game, x, y, key, frame);

};

Phaser.TileSprite.prototype = Object.create(PIXI.TilingSprite.prototype);
Phaser.TileSprite.prototype.constructor = Phaser.TileSprite;

Phaser.Component.Core.install.call(Phaser.TileSprite.prototype, [
    'Angle',
    'Animation',
    'AutoCull',
    'Bounds',
    'BringToTop',
    'Destroy',
    'FixedToCamera',
    'Health',
    'InCamera',
    'InputEnabled',
    'InWorld',
    'LifeSpan',
    'LoadTexture',
    'Overlap',
    'PhysicsBody',
    'Reset',
    'Smoothed'
]);

Phaser.TileSprite.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate;
Phaser.TileSprite.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate;
Phaser.TileSprite.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate;
Phaser.TileSprite.prototype.preUpdateCore = Phaser.Component.Core.preUpdate;

/**
* Automatically called by World.preUpdate.
*
* @method Phaser.TileSprite#preUpdate
* @memberof Phaser.TileSprite
*/
Phaser.TileSprite.prototype.preUpdate = function() {

    if (this._scroll.x !== 0)
    {
        this.tilePosition.x += this._scroll.x * this.game.time.physicsElapsed;
    }

    if (this._scroll.y !== 0)
    {
        this.tilePosition.y += this._scroll.y * this.game.time.physicsElapsed;
    }

    if (!this.preUpdatePhysics() || !this.preUpdateLifeSpan() || !this.preUpdateInWorld())
    {
        return false;
    }

    return this.preUpdateCore();

};

/**
* Sets this TileSprite to automatically scroll in the given direction until stopped via TileSprite.stopScroll().
* The scroll speed is specified in pixels per second.
* A negative x value will scroll to the left. A positive x value will scroll to the right.
* A negative y value will scroll up. A positive y value will scroll down.
*
* @method Phaser.TileSprite#autoScroll
* @memberof Phaser.TileSprite
* @param {number} x - Horizontal scroll speed in pixels per second.
* @param {number} y - Vertical scroll speed in pixels per second.
*/
Phaser.TileSprite.prototype.autoScroll = function(x, y) {

    this._scroll.set(x, y);

};

/**
* Stops an automatically scrolling TileSprite.
*
* @method Phaser.TileSprite#stopScroll
* @memberof Phaser.TileSprite
*/
Phaser.TileSprite.prototype.stopScroll = function() {

    this._scroll.set(0, 0);

};

/**
* Destroys the TileSprite. This removes it from its parent group, destroys the event and animation handlers if present
* and nulls its reference to game, freeing it up for garbage collection.
*
* @method Phaser.TileSprite#destroy
* @memberof Phaser.TileSprite
* @param {boolean} [destroyChildren=true] - Should every child of this object have its destroy method called?
*/
Phaser.TileSprite.prototype.destroy = function(destroyChildren) {

    Phaser.Component.Destroy.prototype.destroy.call(this, destroyChildren);

    PIXI.TilingSprite.prototype.destroy.call(this);

};

/**
* Resets the TileSprite. This places the TileSprite at the given x/y world coordinates, resets the tilePosition and then
* sets alive, exists, visible and renderable all to true. Also resets the outOfBounds state.
* If the TileSprite has a physics body that too is reset.
*
* @method Phaser.TileSprite#reset
* @memberof Phaser.TileSprite
* @param {number} x - The x coordinate (in world space) to position the Sprite at.
* @param {number} y - The y coordinate (in world space) to position the Sprite at.
* @return {Phaser.TileSprite} This instance.
*/
Phaser.TileSprite.prototype.reset = function(x, y) {

    Phaser.Component.Reset.prototype.reset.call(this, x, y);

    this.tilePosition.x = 0;
    this.tilePosition.y = 0;

    return this;

};
