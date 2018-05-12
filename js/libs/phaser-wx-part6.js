import PIXI from './pixi-wx.js';
import Phaser from './phaser-wx-main.js';
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Phaser has one single cache in which it stores all assets.
*
* The cache is split up into sections, such as images, sounds, video, json, etc. All assets are stored using
* a unique string-based key as their identifier. Assets stored in different areas of the cache can have the
* same key, for example 'playerWalking' could be used as the key for both a sprite sheet and an audio file,
* because they are unique data types.
*
* The cache is automatically populated by the Phaser.Loader. When you use the loader to pull in external assets
* such as images they are automatically placed into their respective cache. Most common Game Objects, such as
* Sprites and Videos automatically query the cache to extract the assets they need on instantiation.
*
* You can access the cache from within a State via `this.cache`. From here you can call any public method it has,
* including adding new entries to it, deleting them or querying them.
*
* Understand that almost without exception when you get an item from the cache it will return a reference to the
* item stored in the cache, not a copy of it. Therefore if you retrieve an item and then modify it, the original
* object in the cache will also be updated, even if you don't put it back into the cache again.
*
* By default when you change State the cache is _not_ cleared, although there is an option to clear it should
* your game require it. In a typical game set-up the cache is populated once after the main game has loaded and
* then used as an asset store.
*
* @class Phaser.Cache
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.Cache = function (game) {

    /**
    * @property {Phaser.Game} game - Local reference to game.
    */
    this.game = game;

    /**
    * Automatically resolve resource URLs to absolute paths for use with the Cache.getURL method.
    * @property {boolean} autoResolveURL
    */
    this.autoResolveURL = false;

    /**
    * The main cache object into which all resources are placed.
    * @property {object} _cache
    * @private
    */
    this._cache = {
        canvas: {},
        image: {},
        texture: {},
        sound: {},
        video: {},
        text: {},
        json: {},
        xml: {},
        physics: {},
        tilemap: {},
        binary: {},
        bitmapData: {},
        bitmapFont: {},
        shader: {},
        renderTexture: {}
    };

    /**
    * @property {object} _urlMap - Maps URLs to resources.
    * @private
    */
    this._urlMap = {};

    /**
    * @property {Image} _urlResolver - Used to resolve URLs to the absolute path.
    * @private
    */
    this._urlResolver = new Image();

    /**
    * @property {string} _urlTemp - Temporary variable to hold a resolved url.
    * @private
    */
    this._urlTemp = null;

    /**
    * @property {Phaser.Signal} onSoundUnlock - This event is dispatched when the sound system is unlocked via a touch event on cellular devices.
    */
    this.onSoundUnlock = new Phaser.Signal();

    /**
    * @property {array} _cacheMap - Const to cache object look-up array.
    * @private
    */
    this._cacheMap = [];

    this._cacheMap[Phaser.Cache.CANVAS] = this._cache.canvas;
    this._cacheMap[Phaser.Cache.IMAGE] = this._cache.image;
    this._cacheMap[Phaser.Cache.TEXTURE] = this._cache.texture;
    this._cacheMap[Phaser.Cache.SOUND] = this._cache.sound;
    this._cacheMap[Phaser.Cache.TEXT] = this._cache.text;
    this._cacheMap[Phaser.Cache.PHYSICS] = this._cache.physics;
    this._cacheMap[Phaser.Cache.TILEMAP] = this._cache.tilemap;
    this._cacheMap[Phaser.Cache.BINARY] = this._cache.binary;
    this._cacheMap[Phaser.Cache.BITMAPDATA] = this._cache.bitmapData;
    this._cacheMap[Phaser.Cache.BITMAPFONT] = this._cache.bitmapFont;
    this._cacheMap[Phaser.Cache.JSON] = this._cache.json;
    this._cacheMap[Phaser.Cache.XML] = this._cache.xml;
    this._cacheMap[Phaser.Cache.VIDEO] = this._cache.video;
    this._cacheMap[Phaser.Cache.SHADER] = this._cache.shader;
    this._cacheMap[Phaser.Cache.RENDER_TEXTURE] = this._cache.renderTexture;

    this.addDefaultImage();
    this.addMissingImage();

};

/**
* @constant
* @type {number}
*/
Phaser.Cache.CANVAS = 1;

/**
* @constant
* @type {number}
*/
Phaser.Cache.IMAGE = 2;

/**
* @constant
* @type {number}
*/
Phaser.Cache.TEXTURE = 3;

/**
* @constant
* @type {number}
*/
Phaser.Cache.SOUND = 4;

/**
* @constant
* @type {number}
*/
Phaser.Cache.TEXT = 5;

/**
* @constant
* @type {number}
*/
Phaser.Cache.PHYSICS = 6;

/**
* @constant
* @type {number}
*/
Phaser.Cache.TILEMAP = 7;

/**
* @constant
* @type {number}
*/
Phaser.Cache.BINARY = 8;

/**
* @constant
* @type {number}
*/
Phaser.Cache.BITMAPDATA = 9;

/**
* @constant
* @type {number}
*/
Phaser.Cache.BITMAPFONT = 10;

/**
* @constant
* @type {number}
*/
Phaser.Cache.JSON = 11;

/**
* @constant
* @type {number}
*/
Phaser.Cache.XML = 12;

/**
* @constant
* @type {number}
*/
Phaser.Cache.VIDEO = 13;

/**
* @constant
* @type {number}
*/
Phaser.Cache.SHADER = 14;

/**
* @constant
* @type {number}
*/
Phaser.Cache.RENDER_TEXTURE = 15;

/**
* The default image used for a texture when no other is specified.
* @constant
* @type {PIXI.Texture}
*/
Phaser.Cache.DEFAULT = null;

/**
* The default image used for a texture when the source image is missing.
* @constant
* @type {PIXI.Texture}
*/
Phaser.Cache.MISSING = null;

Phaser.Cache.prototype = {

    //////////////////
    //  Add Methods //
    //////////////////

    /**
    * Add a new canvas object in to the cache.
    *
    * @method Phaser.Cache#addCanvas
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {HTMLCanvasElement} canvas - The Canvas DOM element.
    * @param {CanvasRenderingContext2D} [context] - The context of the canvas element. If not specified it will default go `getContext('2d')`.
    */
    addCanvas: function (key, canvas, context) {

        if (context === undefined) { context = canvas.getContext('2d'); }

        this._cache.canvas[key] = { canvas: canvas, context: context };

    },

    /**
    * Adds an Image file into the Cache. The file must have already been loaded, typically via Phaser.Loader, but can also have been loaded into the DOM.
    * If an image already exists in the cache with the same key then it is removed and destroyed, and the new image inserted in its place.
    *
    * @method Phaser.Cache#addImage
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} data - Extra image data.
    * @return {object} The full image object that was added to the cache.
    */
    addImage: function (key, url, data) {

        if (this.checkImageKey(key))
        {
            this.removeImage(key);
        }

        var img = {
            key: key,
            url: url,
            data: data,
            base: new PIXI.BaseTexture(data),
            frame: new Phaser.Frame(0, 0, 0, data.width, data.height, key),
            frameData: new Phaser.FrameData()
        };

        img.frameData.addFrame(new Phaser.Frame(0, 0, 0, data.width, data.height, url));

        this._cache.image[key] = img;

        this._resolveURL(url, img);

        if (key === '__default')
        {
            Phaser.Cache.DEFAULT = new PIXI.Texture(img.base);
        }
        else if (key === '__missing')
        {
            Phaser.Cache.MISSING = new PIXI.Texture(img.base);
        }

        return img;

    },

    /**
    * Adds a default image to be used in special cases such as WebGL Filters.
    * It uses the special reserved key of `__default`.
    * This method is called automatically when the Cache is created.
    * This image is skipped when `Cache.destroy` is called due to its internal requirements.
    *
    * @method Phaser.Cache#addDefaultImage
    * @protected
    */
    addDefaultImage: function () {

        var img = new Image();

        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAABVJREFUeF7NwIEAAAAAgKD9qdeocAMAoAABm3DkcAAAAABJRU5ErkJggg==";

        var obj = this.addImage('__default', null, img);

        //  Because we don't want to invalidate the sprite batch for an invisible texture
        obj.base.skipRender = true;

        //  Make it easily available within the rest of Phaser / Pixi
        Phaser.Cache.DEFAULT = new PIXI.Texture(obj.base);

    },

    /**
    * Adds an image to be used when a key is wrong / missing.
    * It uses the special reserved key of `__missing`.
    * This method is called automatically when the Cache is created.
    * This image is skipped when `Cache.destroy` is called due to its internal requirements.
    *
    * @method Phaser.Cache#addMissingImage
    * @protected
    */
    addMissingImage: function () {

        var img = new Image();

        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJ9JREFUeNq01ssOwyAMRFG46v//Mt1ESmgh+DFmE2GPOBARKb2NVjo+17PXLD8a1+pl5+A+wSgFygymWYHBb0FtsKhJDdZlncG2IzJ4ayoMDv20wTmSMzClEgbWYNTAkQ0Z+OJ+A/eWnAaR9+oxCF4Os0H8htsMUp+pwcgBBiMNnAwF8GqIgL2hAzaGFFgZauDPKABmowZ4GL369/0rwACp2yA/ttmvsQAAAABJRU5ErkJggg==";

        var obj = this.addImage('__missing', null, img);

        //  Make it easily available within the rest of Phaser / Pixi
        Phaser.Cache.MISSING = new PIXI.Texture(obj.base);

    },

    /**
    * Adds a Sound file into the Cache. The file must have already been loaded, typically via Phaser.Loader.
    *
    * @method Phaser.Cache#addSound
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} data - Extra sound data.
    * @param {boolean} webAudio - True if the file is using web audio.
    * @param {boolean} audioTag - True if the file is using legacy HTML audio.
    */
    addSound: function (key, url, data, webAudio, audioTag) {

        if (webAudio === undefined) { webAudio = true; audioTag = false; }
        if (audioTag === undefined) { webAudio = false; audioTag = true; }

        var decoded = false;

        if (audioTag)
        {
            decoded = true;
        }

        this._cache.sound[key] = {
            url: url,
            data: data,
            isDecoding: false,
            decoded: decoded,
            webAudio: webAudio,
            audioTag: audioTag,
            locked: this.game.sound.touchLocked
        };

        this._resolveURL(url, this._cache.sound[key]);

    },

    /**
    * Add a new text data.
    *
    * @method Phaser.Cache#addText
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} data - Extra text data.
    */
    addText: function (key, url, data) {

        this._cache.text[key] = { url: url, data: data };

        this._resolveURL(url, this._cache.text[key]);

    },

    /**
    * Add a new physics data object to the Cache.
    *
    * @method Phaser.Cache#addPhysicsData
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} JSONData - The physics data object (a JSON file).
    * @param {number} format - The format of the physics data.
    */
    addPhysicsData: function (key, url, JSONData, format) {

        this._cache.physics[key] = { url: url, data: JSONData, format: format };

        this._resolveURL(url, this._cache.physics[key]);

    },

    /**
    * Add a new tilemap to the Cache.
    *
    * @method Phaser.Cache#addTilemap
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} mapData - The tilemap data object (either a CSV or JSON file).
    * @param {number} format - The format of the tilemap data.
    */
    addTilemap: function (key, url, mapData, format) {

        this._cache.tilemap[key] = { url: url, data: mapData, format: format };

        this._resolveURL(url, this._cache.tilemap[key]);

    },

    /**
    * Add a binary object in to the cache.
    *
    * @method Phaser.Cache#addBinary
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {object} binaryData - The binary object to be added to the cache.
    */
    addBinary: function (key, binaryData) {

        this._cache.binary[key] = binaryData;

    },

    /**
    * Add a BitmapData object to the cache.
    *
    * @method Phaser.Cache#addBitmapData
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {Phaser.BitmapData} bitmapData - The BitmapData object to be addded to the cache.
    * @param {Phaser.FrameData|null} [frameData=(auto create)] - Optional FrameData set associated with the given BitmapData. If not specified (or `undefined`) a new FrameData object is created containing the Bitmap's Frame. If `null` is supplied then no FrameData will be created.
    * @return {Phaser.BitmapData} The BitmapData object to be addded to the cache.
    */
    addBitmapData: function (key, bitmapData, frameData) {

        bitmapData.key = key;

        if (frameData === undefined)
        {
            frameData = new Phaser.FrameData();
            frameData.addFrame(bitmapData.textureFrame);
        }

        this._cache.bitmapData[key] = { data: bitmapData, frameData: frameData };

        return bitmapData;

    },

    /**
    * Add a new Bitmap Font to the Cache.
    *
    * @method Phaser.Cache#addBitmapFont
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} data - Extra font data.
    * @param {object} atlasData - Texture atlas frames data.
    * @param {string} [atlasType='xml'] - The format of the texture atlas ( 'json' or 'xml' ).
    * @param {number} [xSpacing=0] - If you'd like to add additional horizontal spacing between the characters then set the pixel value here.
    * @param {number} [ySpacing=0] - If you'd like to add additional vertical spacing between the lines then set the pixel value here.
    */
    addBitmapFont: function (key, url, data, atlasData, atlasType, xSpacing, ySpacing) {

        var obj = {
            url: url,
            data: data,
            font: null,
            base: new PIXI.BaseTexture(data)
        };

        if (xSpacing === undefined) { xSpacing = 0; }
        if (ySpacing === undefined) { ySpacing = 0; }

        if (atlasType === 'json')
        {
            obj.font = Phaser.LoaderParser.jsonBitmapFont(atlasData, obj.base, xSpacing, ySpacing);
        }
        else
        {
            obj.font = Phaser.LoaderParser.xmlBitmapFont(atlasData, obj.base, xSpacing, ySpacing);
        }

        this._cache.bitmapFont[key] = obj;

        this._resolveURL(url, obj);

    },

    /**
    * Add a new json object into the cache.
    *
    * @method Phaser.Cache#addJSON
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} data - Extra json data.
    */
    addJSON: function (key, url, data) {

        this._cache.json[key] = { url: url, data: data };

        this._resolveURL(url, this._cache.json[key]);

    },

    /**
    * Add a new xml object into the cache.
    *
    * @method Phaser.Cache#addXML
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} data - Extra text data.
    */
    addXML: function (key, url, data) {

        this._cache.xml[key] = { url: url, data: data };

        this._resolveURL(url, this._cache.xml[key]);

    },

    /**
    * Adds a Video file into the Cache. The file must have already been loaded, typically via Phaser.Loader.
    *
    * @method Phaser.Cache#addVideo
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} data - Extra video data.
    * @param {boolean} isBlob - True if the file was preloaded via xhr and the data parameter is a Blob. false if a Video tag was created instead.
    */
    addVideo: function (key, url, data, isBlob) {

        this._cache.video[key] = { url: url, data: data, isBlob: isBlob, locked: true };

        this._resolveURL(url, this._cache.video[key]);

    },

    /**
    * Adds a Fragment Shader in to the Cache. The file must have already been loaded, typically via Phaser.Loader.
    *
    * @method Phaser.Cache#addShader
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} data - Extra shader data.
    */
    addShader: function (key, url, data) {

        this._cache.shader[key] = { url: url, data: data };

        this._resolveURL(url, this._cache.shader[key]);

    },

    /**
    * Add a new Phaser.RenderTexture in to the cache.
    *
    * @method Phaser.Cache#addRenderTexture
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {Phaser.RenderTexture} texture - The texture to use as the base of the RenderTexture.
    */
    addRenderTexture: function (key, texture) {

        this._cache.renderTexture[key] = { texture: texture, frame: new Phaser.Frame(0, 0, 0, texture.width, texture.height, '', '') };

    },

    /**
    * Add a new sprite sheet in to the cache.
    *
    * @method Phaser.Cache#addSpriteSheet
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} data - Extra sprite sheet data.
    * @param {number} frameWidth - Width of the sprite sheet.
    * @param {number} frameHeight - Height of the sprite sheet.
    * @param {number} [frameMax=-1] - How many frames stored in the sprite sheet. If -1 then it divides the whole sheet evenly.
    * @param {number} [margin=0] - If the frames have been drawn with a margin, specify the amount here.
    * @param {number} [spacing=0] - If the frames have been drawn with spacing between them, specify the amount here.
    */
    addSpriteSheet: function (key, url, data, frameWidth, frameHeight, frameMax, margin, spacing) {

        if (frameMax === undefined) { frameMax = -1; }
        if (margin === undefined) { margin = 0; }
        if (spacing === undefined) { spacing = 0; }

        var obj = {
            key: key,
            url: url,
            data: data,
            frameWidth: frameWidth,
            frameHeight: frameHeight,
            margin: margin,
            spacing: spacing,
            base: new PIXI.BaseTexture(data),
            frameData: Phaser.AnimationParser.spriteSheet(this.game, data, frameWidth, frameHeight, frameMax, margin, spacing)
        };

        this._cache.image[key] = obj;

        this._resolveURL(url, obj);

    },

    /**
    * Add a new texture atlas to the Cache.
    *
    * @method Phaser.Cache#addTextureAtlas
    * @param {string} key - The key that this asset will be stored in the cache under. This should be unique within this cache.
    * @param {string} url - The URL the asset was loaded from. If the asset was not loaded externally set to `null`.
    * @param {object} data - Extra texture atlas data.
    * @param {object} atlasData  - Texture atlas frames data.
    * @param {number} format - The format of the texture atlas.
    */
    addTextureAtlas: function (key, url, data, atlasData, format) {

        var obj = {
            key: key,
            url: url,
            data: data,
            base: new PIXI.BaseTexture(data)
        };

        if (format === Phaser.Loader.TEXTURE_ATLAS_XML_STARLING)
        {
            obj.frameData = Phaser.AnimationParser.XMLData(this.game, atlasData, key);
        }
        else if (format === Phaser.Loader.TEXTURE_ATLAS_JSON_PYXEL)
        {
            obj.frameData = Phaser.AnimationParser.JSONDataPyxel(this.game, atlasData, key);
        }
        else
        {
            //  Let's just work it out from the frames array
            if (Array.isArray(atlasData.frames))
            {
                obj.frameData = Phaser.AnimationParser.JSONData(this.game, atlasData, key);
            }
            else
            {
                obj.frameData = Phaser.AnimationParser.JSONDataHash(this.game, atlasData, key);
            }
        }

        this._cache.image[key] = obj;

        this._resolveURL(url, obj);

    },

    ////////////////////////////
    //  Sound Related Methods //
    ////////////////////////////

    /**
    * Reload a Sound file from the server.
    *
    * @method Phaser.Cache#reloadSound
    * @param {string} key - The key of the asset within the cache.
    */
    reloadSound: function (key) {

        var _this = this;

        var sound = this.getSound(key);

        if (sound)
        {
            sound.data.src = sound.url;

            sound.data.addEventListener('canplaythrough', function () {
                return _this.reloadSoundComplete(key);
            }, false);

            sound.data.load();
        }

    },

    /**
    * Fires the onSoundUnlock event when the sound has completed reloading.
    *
    * @method Phaser.Cache#reloadSoundComplete
    * @param {string} key - The key of the asset within the cache.
    */
    reloadSoundComplete: function (key) {

        var sound = this.getSound(key);

        if (sound)
        {
            sound.locked = false;
            this.onSoundUnlock.dispatch(key);
        }

    },

    /**
    * Updates the sound object in the cache.
    *
    * @method Phaser.Cache#updateSound
    * @param {string} key - The key of the asset within the cache.
    */
    updateSound: function (key, property, value) {

        var sound = this.getSound(key);

        if (sound)
        {
            sound[property] = value;
        }

    },

    /**
    * Add a new decoded sound.
    *
    * @method Phaser.Cache#decodedSound
    * @param {string} key - The key of the asset within the cache.
    * @param {object} data - Extra sound data.
    */
    decodedSound: function (key, data) {

        var sound = this.getSound(key);

        sound.data = data;
        sound.decoded = true;
        sound.isDecoding = false;

    },

    /**
    * Check if the given sound has finished decoding.
    *
    * @method Phaser.Cache#isSoundDecoded
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} The decoded state of the Sound object.
    */
    isSoundDecoded: function (key) {

        var sound = this.getItem(key, Phaser.Cache.SOUND, 'isSoundDecoded');

        if (sound)
        {
            return sound.decoded;
        }

    },

    /**
    * Check if the given sound is ready for playback.
    * A sound is considered ready when it has finished decoding and the device is no longer touch locked.
    *
    * @method Phaser.Cache#isSoundReady
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the sound is decoded and the device is not touch locked.
    */
    isSoundReady: function (key) {

        var sound = this.getItem(key, Phaser.Cache.SOUND, 'isSoundDecoded');

        if (sound)
        {
            return (sound.decoded && !this.game.sound.touchLocked);
        }

    },

    ////////////////////////
    //  Check Key Methods //
    ////////////////////////

    /**
    * Checks if a key for the given cache object type exists.
    *
    * @method Phaser.Cache#checkKey
    * @param {integer} cache - The cache to search. One of the Cache consts such as `Phaser.Cache.IMAGE` or `Phaser.Cache.SOUND`.
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists, otherwise false.
    */
    checkKey: function (cache, key) {

        if (this._cacheMap[cache][key])
        {
            return true;
        }

        return false;

    },

    /**
    * Checks if the given URL has been loaded into the Cache.
    * This method will only work if Cache.autoResolveURL was set to `true` before any preloading took place.
    * The method will make a DOM src call to the URL given, so please be aware of this for certain file types, such as Sound files on Firefox
    * which may cause double-load instances.
    *
    * @method Phaser.Cache#checkURL
    * @param {string} url - The url to check for in the cache.
    * @return {boolean} True if the url exists, otherwise false.
    */
    checkURL: function (url) {

        if (this._urlMap[this._resolveURL(url)])
        {
            return true;
        }

        return false;

    },

    /**
    * Checks if the given key exists in the Canvas Cache.
    *
    * @method Phaser.Cache#checkCanvasKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkCanvasKey: function (key) {

        return this.checkKey(Phaser.Cache.CANVAS, key);

    },

    /**
    * Checks if the given key exists in the Image Cache. Note that this also includes Texture Atlases, Sprite Sheets and Retro Fonts.
    *
    * @method Phaser.Cache#checkImageKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkImageKey: function (key) {

        return this.checkKey(Phaser.Cache.IMAGE, key);

    },

    /**
    * Checks if the given key exists in the Texture Cache.
    *
    * @method Phaser.Cache#checkTextureKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkTextureKey: function (key) {

        return this.checkKey(Phaser.Cache.TEXTURE, key);

    },

    /**
    * Checks if the given key exists in the Sound Cache.
    *
    * @method Phaser.Cache#checkSoundKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkSoundKey: function (key) {

        return this.checkKey(Phaser.Cache.SOUND, key);

    },

    /**
    * Checks if the given key exists in the Text Cache.
    *
    * @method Phaser.Cache#checkTextKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkTextKey: function (key) {

        return this.checkKey(Phaser.Cache.TEXT, key);

    },

    /**
    * Checks if the given key exists in the Physics Cache.
    *
    * @method Phaser.Cache#checkPhysicsKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkPhysicsKey: function (key) {

        return this.checkKey(Phaser.Cache.PHYSICS, key);

    },

    /**
    * Checks if the given key exists in the Tilemap Cache.
    *
    * @method Phaser.Cache#checkTilemapKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkTilemapKey: function (key) {

        return this.checkKey(Phaser.Cache.TILEMAP, key);

    },

    /**
    * Checks if the given key exists in the Binary Cache.
    *
    * @method Phaser.Cache#checkBinaryKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkBinaryKey: function (key) {

        return this.checkKey(Phaser.Cache.BINARY, key);

    },

    /**
    * Checks if the given key exists in the BitmapData Cache.
    *
    * @method Phaser.Cache#checkBitmapDataKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkBitmapDataKey: function (key) {

        return this.checkKey(Phaser.Cache.BITMAPDATA, key);

    },

    /**
    * Checks if the given key exists in the BitmapFont Cache.
    *
    * @method Phaser.Cache#checkBitmapFontKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkBitmapFontKey: function (key) {

        return this.checkKey(Phaser.Cache.BITMAPFONT, key);

    },

    /**
    * Checks if the given key exists in the JSON Cache.
    *
    * @method Phaser.Cache#checkJSONKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkJSONKey: function (key) {

        return this.checkKey(Phaser.Cache.JSON, key);

    },

    /**
    * Checks if the given key exists in the XML Cache.
    *
    * @method Phaser.Cache#checkXMLKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkXMLKey: function (key) {

        return this.checkKey(Phaser.Cache.XML, key);

    },

    /**
    * Checks if the given key exists in the Video Cache.
    *
    * @method Phaser.Cache#checkVideoKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkVideoKey: function (key) {

        return this.checkKey(Phaser.Cache.VIDEO, key);

    },

    /**
    * Checks if the given key exists in the Fragment Shader Cache.
    *
    * @method Phaser.Cache#checkShaderKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkShaderKey: function (key) {

        return this.checkKey(Phaser.Cache.SHADER, key);

    },

    /**
    * Checks if the given key exists in the Render Texture Cache.
    *
    * @method Phaser.Cache#checkRenderTextureKey
    * @param {string} key - The key of the asset within the cache.
    * @return {boolean} True if the key exists in the cache, otherwise false.
    */
    checkRenderTextureKey: function (key) {

        return this.checkKey(Phaser.Cache.RENDER_TEXTURE, key);

    },

    ////////////////
    //  Get Items //
    ////////////////

    /**
    * Get an item from a cache based on the given key and property.
    *
    * This method is mostly used internally by other Cache methods such as `getImage` but is exposed
    * publicly for your own use as well.
    *
    * @method Phaser.Cache#getItem
    * @param {string} key - The key of the asset within the cache.
    * @param {integer} cache - The cache to search. One of the Cache consts such as `Phaser.Cache.IMAGE` or `Phaser.Cache.SOUND`.
    * @param {string} [method] - The string name of the method calling getItem. Can be empty, in which case no console warning is output.
    * @param {string} [property] - If you require a specific property from the cache item, specify it here.
    * @return {object} The cached item if found, otherwise `null`. If the key is invalid and `method` is set then a console.warn is output.
    */
    getItem: function (key, cache, method, property) {

        if (!this.checkKey(cache, key))
        {
            if (method)
            {
                console.warn('Phaser.Cache.' + method + ': Key "' + key + '" not found in Cache.');
            }
        }
        else
        {
            if (property === undefined)
            {
                return this._cacheMap[cache][key];
            }
            else
            {
                return this._cacheMap[cache][key][property];
            }
        }

        return null;

    },

    /**
    * Gets a Canvas object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getCanvas
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {object} The canvas object or `null` if no item could be found matching the given key.
    */
    getCanvas: function (key) {

        return this.getItem(key, Phaser.Cache.CANVAS, 'getCanvas', 'canvas');

    },

    /**
    * Gets a Image object from the cache. This returns a DOM Image object, not a Phaser.Image object.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * Only the Image cache is searched, which covers images loaded via Loader.image, Sprite Sheets and Texture Atlases.
    *
    * If you need the image used by a bitmap font or similar then please use those respective 'get' methods.
    *
    * @method Phaser.Cache#getImage
    * @param {string} [key] - The key of the asset to retrieve from the cache. If not given or null it will return a default image. If given but not found in the cache it will throw a warning and return the missing image.
    * @param {boolean} [full=false] - If true the full image object will be returned, if false just the HTML Image object is returned.
    * @return {Image} The Image object if found in the Cache, otherwise `null`. If `full` was true then a JavaScript object is returned.
    */
    getImage: function (key, full) {

        if (key === undefined || key === null)
        {
            key = '__default';
        }

        if (full === undefined) { full = false; }

        var img = this.getItem(key, Phaser.Cache.IMAGE, 'getImage');

        if (img === null)
        {
            img = this.getItem('__missing', Phaser.Cache.IMAGE, 'getImage');
        }

        if (full)
        {
            return img;
        }
        else
        {
            return img.data;
        }

    },

    /**
    * Get a single texture frame by key.
    *
    * You'd only do this to get the default Frame created for a non-atlas / spritesheet image.
    *
    * @method Phaser.Cache#getTextureFrame
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {Phaser.Frame} The frame data.
    */
    getTextureFrame: function (key) {

        return this.getItem(key, Phaser.Cache.TEXTURE, 'getTextureFrame', 'frame');

    },

    /**
    * Gets a Phaser.Sound object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getSound
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {Phaser.Sound} The sound object.
    */
    getSound: function (key) {

        return this.getItem(key, Phaser.Cache.SOUND, 'getSound');

    },

    /**
    * Gets a raw Sound data object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getSoundData
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {object} The sound data.
    */
    getSoundData: function (key) {

        return this.getItem(key, Phaser.Cache.SOUND, 'getSoundData', 'data');

    },

    /**
    * Gets a Text object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getText
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {object} The text data.
    */
    getText: function (key) {

        return this.getItem(key, Phaser.Cache.TEXT, 'getText', 'data');

    },

    /**
    * Gets a Physics Data object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * You can get either the entire data set, a single object or a single fixture of an object from it.
    *
    * @method Phaser.Cache#getPhysicsData
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @param {string} [object=null] - If specified it will return just the physics object that is part of the given key, if null it will return them all.
    * @param {string} fixtureKey - Fixture key of fixture inside an object. This key can be set per fixture with the Phaser Exporter.
    * @return {object} The requested physics object data if found.
    */
    getPhysicsData: function (key, object, fixtureKey) {

        var data = this.getItem(key, Phaser.Cache.PHYSICS, 'getPhysicsData', 'data');

        if (data === null || object === undefined || object === null)
        {
            return data;
        }
        else
        {
            if (data[object])
            {
                var fixtures = data[object];

                //  Try to find a fixture by its fixture key if given
                if (fixtures && fixtureKey)
                {
                    for (var fixture in fixtures)
                    {
                        //  This contains the fixture data of a polygon or a circle
                        fixture = fixtures[fixture];

                        //  Test the key
                        if (fixture.fixtureKey === fixtureKey)
                        {
                            return fixture;
                        }
                    }

                    //  We did not find the requested fixture
                    console.warn('Phaser.Cache.getPhysicsData: Could not find given fixtureKey: "' + fixtureKey + ' in ' + key + '"');
                }
                else
                {
                    return fixtures;
                }
            }
            else
            {
                console.warn('Phaser.Cache.getPhysicsData: Invalid key/object: "' + key + ' / ' + object + '"');
            }
        }

        return null;

    },

    /**
    * Gets a raw Tilemap data object from the cache. This will be in either CSV or JSON format.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getTilemapData
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {object} The raw tilemap data in CSV or JSON format.
    */
    getTilemapData: function (key) {

        return this.getItem(key, Phaser.Cache.TILEMAP, 'getTilemapData');

    },

    /**
    * Gets a binary object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getBinary
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {object} The binary data object.
    */
    getBinary: function (key) {

        return this.getItem(key, Phaser.Cache.BINARY, 'getBinary');

    },

    /**
    * Gets a BitmapData object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getBitmapData
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {Phaser.BitmapData} The requested BitmapData object if found, or null if not.
    */
    getBitmapData: function (key) {

        return this.getItem(key, Phaser.Cache.BITMAPDATA, 'getBitmapData', 'data');

    },

    /**
    * Gets a Bitmap Font object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getBitmapFont
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {Phaser.BitmapFont} The requested BitmapFont object if found, or null if not.
    */
    getBitmapFont: function (key) {

        return this.getItem(key, Phaser.Cache.BITMAPFONT, 'getBitmapFont');

    },

    /**
    * Gets a JSON object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * You can either return the object by reference (the default), or return a clone
    * of it by setting the `clone` argument to `true`.
    *
    * @method Phaser.Cache#getJSON
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @param {boolean} [clone=false] - Return a clone of the original object (true) or a reference to it? (false)
    * @return {object} The JSON object, or an Array if the key points to an Array property. If the property wasn't found, it returns null.
    */
    getJSON: function (key, clone) {

        var data = this.getItem(key, Phaser.Cache.JSON, 'getJSON', 'data');

        if (data)
        {
            if (clone)
            {
                return Phaser.Utils.extend(true, Array.isArray(data) ? [] : {}, data);
            }
            else
            {
                return data;
            }
        }
        else
        {
            return null;
        }

    },

    /**
    * Gets an XML object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getXML
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {object} The XML object.
    */
    getXML: function (key) {

        return this.getItem(key, Phaser.Cache.XML, 'getXML', 'data');

    },

    /**
    * Gets a Phaser.Video object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getVideo
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {Phaser.Video} The video object.
    */
    getVideo: function (key) {

        return this.getItem(key, Phaser.Cache.VIDEO, 'getVideo');

    },

    /**
    * Gets a fragment shader object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getShader
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {string} The shader object.
    */
    getShader: function (key) {

        return this.getItem(key, Phaser.Cache.SHADER, 'getShader', 'data');

    },

    /**
    * Gets a RenderTexture object from the cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getRenderTexture
    * @param {string} key - The key of the asset to retrieve from the cache.
    * @return {Object} The object with Phaser.RenderTexture and Phaser.Frame.
    */
    getRenderTexture: function (key) {

        return this.getItem(key, Phaser.Cache.RENDER_TEXTURE, 'getRenderTexture');

    },

    ////////////////////////////
    //  Frame Related Methods //
    ////////////////////////////

    /**
    * Gets a PIXI.BaseTexture by key from the given Cache.
    *
    * @method Phaser.Cache#getBaseTexture
    * @param {string} key - Asset key of the image for which you want the BaseTexture for.
    * @param {integer} [cache=Phaser.Cache.IMAGE] - The cache to search for the item in.
    * @return {PIXI.BaseTexture} The BaseTexture object.
    */
    getBaseTexture: function (key, cache) {

        if (cache === undefined) { cache = Phaser.Cache.IMAGE; }

        return this.getItem(key, cache, 'getBaseTexture', 'base');

    },

    /**
    * Get a single frame by key. You'd only do this to get the default Frame created for a non-atlas/spritesheet image.
    *
    * @method Phaser.Cache#getFrame
    * @param {string} key - Asset key of the frame data to retrieve from the Cache.
    * @param {integer} [cache=Phaser.Cache.IMAGE] - The cache to search for the item in.
    * @return {Phaser.Frame} The frame data.
    */
    getFrame: function (key, cache) {

        if (cache === undefined) { cache = Phaser.Cache.IMAGE; }

        return this.getItem(key, cache, 'getFrame', 'frame');

    },

    /**
    * Get the total number of frames contained in the FrameData object specified by the given key.
    *
    * @method Phaser.Cache#getFrameCount
    * @param {string} key - Asset key of the FrameData you want.
    * @param {integer} [cache=Phaser.Cache.IMAGE] - The cache to search for the item in.
    * @return {number} Then number of frames. 0 if the image is not found.
    */
    getFrameCount: function (key, cache) {

        var data = this.getFrameData(key, cache);

        if (data)
        {
            return data.total;
        }
        else
        {
            return 0;
        }

    },

    /**
    * Gets a Phaser.FrameData object from the Image Cache.
    *
    * The object is looked-up based on the key given.
    *
    * Note: If the object cannot be found a `console.warn` message is displayed.
    *
    * @method Phaser.Cache#getFrameData
    * @param {string} key - Asset key of the frame data to retrieve from the Cache.
    * @param {integer} [cache=Phaser.Cache.IMAGE] - The cache to search for the item in.
    * @return {Phaser.FrameData} The frame data.
    */
    getFrameData: function (key, cache) {

        if (cache === undefined) { cache = Phaser.Cache.IMAGE; }

        return this.getItem(key, cache, 'getFrameData', 'frameData');

    },

    /**
    * Check if the FrameData for the given key exists in the Image Cache.
    *
    * @method Phaser.Cache#hasFrameData
    * @param {string} key - Asset key of the frame data to retrieve from the Cache.
    * @param {integer} [cache=Phaser.Cache.IMAGE] - The cache to search for the item in.
    * @return {boolean} True if the given key has frameData in the cache, otherwise false.
    */
    hasFrameData: function (key, cache) {

        if (cache === undefined) { cache = Phaser.Cache.IMAGE; }

        return (this.getItem(key, cache, '', 'frameData') !== null);

    },

    /**
    * Replaces a set of frameData with a new Phaser.FrameData object.
    *
    * @method Phaser.Cache#updateFrameData
    * @param {string} key - The unique key by which you will reference this object.
    * @param {number} frameData - The new FrameData.
    * @param {integer} [cache=Phaser.Cache.IMAGE] - The cache to search. One of the Cache consts such as `Phaser.Cache.IMAGE` or `Phaser.Cache.SOUND`.
    */
    updateFrameData: function (key, frameData, cache) {

        if (cache === undefined) { cache = Phaser.Cache.IMAGE; }

        if (this._cacheMap[cache][key])
        {
            this._cacheMap[cache][key].frameData = frameData;
        }

    },

    /**
    * Get a single frame out of a frameData set by key.
    *
    * @method Phaser.Cache#getFrameByIndex
    * @param {string} key - Asset key of the frame data to retrieve from the Cache.
    * @param {number} index - The index of the frame you want to get.
    * @param {integer} [cache=Phaser.Cache.IMAGE] - The cache to search. One of the Cache consts such as `Phaser.Cache.IMAGE` or `Phaser.Cache.SOUND`.
    * @return {Phaser.Frame} The frame object.
    */
    getFrameByIndex: function (key, index, cache) {

        var data = this.getFrameData(key, cache);

        if (data)
        {
            return data.getFrame(index);
        }
        else
        {
            return null;
        }

    },

    /**
    * Get a single frame out of a frameData set by key.
    *
    * @method Phaser.Cache#getFrameByName
    * @param {string} key - Asset key of the frame data to retrieve from the Cache.
    * @param {string} name - The name of the frame you want to get.
    * @param {integer} [cache=Phaser.Cache.IMAGE] - The cache to search. One of the Cache consts such as `Phaser.Cache.IMAGE` or `Phaser.Cache.SOUND`.
    * @return {Phaser.Frame} The frame object.
    */
    getFrameByName: function (key, name, cache) {

        var data = this.getFrameData(key, cache);

        if (data)
        {
            return data.getFrameByName(name);
        }
        else
        {
            return null;
        }

    },

    /**
    * Get a cached object by the URL.
    * This only returns a value if you set Cache.autoResolveURL to `true` *before* starting the preload of any assets.
    * Be aware that every call to this function makes a DOM src query, so use carefully and double-check for implications in your target browsers/devices.
    *
    * @method Phaser.Cache#getURL
    * @param {string} url - The url for the object loaded to get from the cache.
    * @return {object} The cached object.
    */
    getURL: function (url) {

        var url = this._resolveURL(url);

        if (url)
        {
            return this._urlMap[url];
        }
        else
        {
            console.warn('Phaser.Cache.getUrl: Invalid url: "' + url  + '" or Cache.autoResolveURL was false');
            return null;
        }

    },

    /**
    * Gets all keys used in the requested Cache.
    *
    * @method Phaser.Cache#getKeys
    * @param {integer} [cache=Phaser.Cache.IMAGE] - The Cache you wish to get the keys from. Can be any of the Cache consts such as `Phaser.Cache.IMAGE`, `Phaser.Cache.SOUND` etc.
    * @return {Array} The array of keys in the requested cache.
    */
    getKeys: function (cache) {

        if (cache === undefined) { cache = Phaser.Cache.IMAGE; }

        var out = [];

        if (this._cacheMap[cache])
        {
            for (var key in this._cacheMap[cache])
            {
                if (key !== '__default' && key !== '__missing')
                {
                    out.push(key);
                }
            }
        }

        return out;

    },

    /////////////////////
    //  Remove Methods //
    /////////////////////

    /**
    * Removes a canvas from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeCanvas
    * @param {string} key - Key of the asset you want to remove.
    */
    removeCanvas: function (key) {

        delete this._cache.canvas[key];

    },

    /**
    * Removes an image from the cache.
    *
    * You can optionally elect to destroy it as well. This calls BaseTexture.destroy on it.
    *
    * Note that this only removes it from the Phaser Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeImage
    * @param {string} key - Key of the asset you want to remove.
    * @param {boolean} [destroyBaseTexture=true] - Should the BaseTexture behind this image also be destroyed?
    */
    removeImage: function (key, destroyBaseTexture) {

        if (destroyBaseTexture === undefined) { destroyBaseTexture = true; }

        var img = this.getImage(key, true);

        if (destroyBaseTexture && img.base)
        {
            img.base.destroy();
        }

        delete this._cache.image[key];

    },

    /**
    * Removes a sound from the cache.
    *
    * If any `Phaser.Sound` objects use the audio file in the cache that you remove with this method, they will
    * _automatically_ destroy themselves. If you wish to have full control over when Sounds are destroyed then
    * you must finish your house-keeping and destroy them all yourself first, before calling this method.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeSound
    * @param {string} key - Key of the asset you want to remove.
    */
    removeSound: function (key) {

        delete this._cache.sound[key];

    },

    /**
    * Removes a text file from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeText
    * @param {string} key - Key of the asset you want to remove.
    */
    removeText: function (key) {

        delete this._cache.text[key];

    },

    /**
    * Removes a physics data file from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removePhysics
    * @param {string} key - Key of the asset you want to remove.
    */
    removePhysics: function (key) {

        delete this._cache.physics[key];

    },

    /**
    * Removes a tilemap from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeTilemap
    * @param {string} key - Key of the asset you want to remove.
    */
    removeTilemap: function (key) {

        delete this._cache.tilemap[key];

    },

    /**
    * Removes a binary file from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeBinary
    * @param {string} key - Key of the asset you want to remove.
    */
    removeBinary: function (key) {

        delete this._cache.binary[key];

    },

    /**
    * Removes a bitmap data from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeBitmapData
    * @param {string} key - Key of the asset you want to remove.
    */
    removeBitmapData: function (key) {

        delete this._cache.bitmapData[key];

    },

    /**
    * Removes a bitmap font from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeBitmapFont
    * @param {string} key - Key of the asset you want to remove.
    */
    removeBitmapFont: function (key) {

        delete this._cache.bitmapFont[key];

    },

    /**
    * Removes a json object from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeJSON
    * @param {string} key - Key of the asset you want to remove.
    */
    removeJSON: function (key) {

        delete this._cache.json[key];

    },

    /**
    * Removes a xml object from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeXML
    * @param {string} key - Key of the asset you want to remove.
    */
    removeXML: function (key) {

        delete this._cache.xml[key];

    },

    /**
    * Removes a video from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeVideo
    * @param {string} key - Key of the asset you want to remove.
    */
    removeVideo: function (key) {

        delete this._cache.video[key];

    },

    /**
    * Removes a shader from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeShader
    * @param {string} key - Key of the asset you want to remove.
    */
    removeShader: function (key) {

        delete this._cache.shader[key];

    },

    /**
    * Removes a Render Texture from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeRenderTexture
    * @param {string} key - Key of the asset you want to remove.
    */
    removeRenderTexture: function (key) {

        delete this._cache.renderTexture[key];

    },

    /**
    * Removes a Sprite Sheet from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeSpriteSheet
    * @param {string} key - Key of the asset you want to remove.
    */
    removeSpriteSheet: function (key) {

        delete this._cache.spriteSheet[key];

    },

    /**
    * Removes a Texture Atlas from the cache.
    *
    * Note that this only removes it from the Phaser.Cache. If you still have references to the data elsewhere
    * then it will persist in memory.
    *
    * @method Phaser.Cache#removeTextureAtlas
    * @param {string} key - Key of the asset you want to remove.
    */
    removeTextureAtlas: function (key) {

        delete this._cache.atlas[key];

    },

    /**
    * Empties out all of the GL Textures from Images stored in the cache.
    * This is called automatically when the WebGL context is lost and then restored.
    *
    * @method Phaser.Cache#clearGLTextures
    * @protected
    */
    clearGLTextures: function () {

        for (var key in this._cache.image)
        {
            this._cache.image[key].base._glTextures = [];
        }

    },

    /**
    * Resolves a URL to its absolute form and stores it in Cache._urlMap as long as Cache.autoResolveURL is set to `true`.
    * This is then looked-up by the Cache.getURL and Cache.checkURL calls.
    *
    * @method Phaser.Cache#_resolveURL
    * @private
    * @param {string} url - The URL to resolve. This is appended to Loader.baseURL.
    * @param {object} [data] - The data associated with the URL to be stored to the URL Map.
    * @return {string} The resolved URL.
    */
    _resolveURL: function (url, data) {

        if (!this.autoResolveURL)
        {
            return null;
        }

        this._urlResolver.src = this.game.load.baseURL + url;

        this._urlTemp = this._urlResolver.src;

        //  Ensure no request is actually made
        this._urlResolver.src = '';

        //  Record the URL to the map
        if (data)
        {
            this._urlMap[this._urlTemp] = data;
        }

        return this._urlTemp;

    },

    /**
    * Clears the cache. Removes every local cache object reference.
    * If an object in the cache has a `destroy` method it will also be called.
    *
    * @method Phaser.Cache#destroy
    */
    destroy: function () {

        for (var i = 0; i < this._cacheMap.length; i++)
        {
            var cache = this._cacheMap[i];

            for (var key in cache)
            {
                if (key !== '__default' && key !== '__missing')
                {
                    if (cache[key]['destroy'])
                    {
                        cache[key].destroy();
                    }

                    delete cache[key];
                }
            }
        }

        this._urlMap = null;
        this._urlResolver = null;
        this._urlTemp = null;

    }

};

Phaser.Cache.prototype.constructor = Phaser.Cache;

/* jshint wsh:true */
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Loader handles loading all external content such as Images, Sounds, Texture Atlases and data files.
*
* The loader uses a combination of tag loading (eg. Image elements) and XHR and provides progress and completion callbacks.
*
* Parallel loading (see {@link #enableParallel}) is supported and enabled by default.
* Load-before behavior of parallel resources is controlled by synchronization points as discussed in {@link #withSyncPoint}.
*
* Texture Atlases can be created with tools such as [Texture Packer](https://www.codeandweb.com/texturepacker/phaser) and
* [Shoebox](http://renderhjs.net/shoebox/)
*
* @class Phaser.Loader
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.Loader = function (game) {

    /**
    * Local reference to game.
    * @property {Phaser.Game} game
    * @protected
    */
    this.game = game;

    /**
    * Local reference to the Phaser.Cache.
    * @property {Phaser.Cache} cache
    * @protected
    */
    this.cache = game.cache;

    /**
    * If true all calls to Loader.reset will be ignored. Useful if you need to create a load queue before swapping to a preloader state.
    * @property {boolean} resetLocked
    * @default
    */
    this.resetLocked = false;

    /**
    * True if the Loader is in the process of loading the queue.
    * @property {boolean} isLoading
    * @default
    */
    this.isLoading = false;

    /**
    * True if all assets in the queue have finished loading.
    * @property {boolean} hasLoaded
    * @default
    */
    this.hasLoaded = false;

    /**
    * You can optionally link a progress sprite with {@link Phaser.Loader#setPreloadSprite setPreloadSprite}.
    *
    * This property is an object containing: sprite, rect, direction, width and height
    *
    * @property {?object} preloadSprite
    * @protected
    */
    this.preloadSprite = null;

    /**
    * The crossOrigin value applied to loaded images. Very often this needs to be set to 'anonymous'.
    * @property {boolean|string} crossOrigin
    * @default
    */
    this.crossOrigin = false;

    /**
    * If you want to append a URL before the path of any asset you can set this here.
    * Useful if allowing the asset base url to be configured outside of the game code.
    * The string _must_ end with a "/".
    *
    * @property {string} baseURL
    */
    this.baseURL = '';

    /**
    * The value of `path`, if set, is placed before any _relative_ file path given. For example:
    *
    * `load.path = "images/sprites/";
    * load.image("ball", "ball.png");
    * load.image("tree", "level1/oaktree.png");
    * load.image("boom", "http://server.com/explode.png");`
    *
    * Would load the `ball` file from `images/sprites/ball.png` and the tree from
    * `images/sprites/level1/oaktree.png` but the file `boom` would load from the URL
    * given as it's an absolute URL.
    *
    * Please note that the path is added before the filename but *after* the baseURL (if set.)
    *
    * The string _must_ end with a "/".
    *
    * @property {string} path
    */
    this.path = '';

    /**
    * Used to map the application mime-types to to the Accept header in XHR requests.
    * If you don't require these mappings, or they cause problems on your server, then
    * remove them from the headers object and the XHR request will not try to use them.
    *
    * This object can also be used to set the `X-Requested-With` header to 
    * `XMLHttpRequest` (or any other value you need). To enable this do:
    *
    * `this.load.headers.requestedWith = 'XMLHttpRequest'`
    *
    * before adding anything to the Loader. The XHR loader will then call:
    *
    * `setRequestHeader('X-Requested-With', this.headers['requestedWith'])`
    * 
    * @property {object} headers
    * @default
    */
    this.headers = {
        "requestedWith": false,
        "json": "application/json",
        "xml": "application/xml"
    };

    /**
     * This event is dispatched when the loading process starts: before the first file has been requested,
    * but after all the initial packs have been loaded.
    *
    * @property {Phaser.Signal} onLoadStart
    */
    this.onLoadStart = new Phaser.Signal();

    /**
    * This event is dispatched when the final file in the load queue has either loaded or failed.
    *
    * @property {Phaser.Signal} onLoadComplete
    */
    this.onLoadComplete = new Phaser.Signal();

    /**
    * This event is dispatched when an asset pack has either loaded or failed to load.
    *
    * This is called when the asset pack manifest file has loaded and successfully added its contents to the loader queue.
    *
    * Params: `(pack key, success?, total packs loaded, total packs)`
    *
    * @property {Phaser.Signal} onPackComplete
    */
    this.onPackComplete = new Phaser.Signal();

    /**
    * This event is dispatched immediately before a file starts loading.
    * It's possible the file may fail (eg. download error, invalid format) after this event is sent.
    *
    * Params: `(progress, file key, file url)`
    *
    * @property {Phaser.Signal} onFileStart
    */
    this.onFileStart = new Phaser.Signal();

    /**
    * This event is dispatched when a file has either loaded or failed to load.
    *
    * Any function bound to this will receive the following parameters:
    *
    * progress, file key, success?, total loaded files, total files
    *
    * Where progress is a number between 1 and 100 (inclusive) representing the percentage of the load.
    *
    * @property {Phaser.Signal} onFileComplete
    */
    this.onFileComplete = new Phaser.Signal();

    /**
    * This event is dispatched when a file (or pack) errors as a result of the load request.
    *
    * For files it will be triggered before `onFileComplete`. For packs it will be triggered before `onPackComplete`.
    *
    * Params: `(file key, file)`
    *
    * @property {Phaser.Signal} onFileError
    */
    this.onFileError = new Phaser.Signal();

    /**
    * If true and if the browser supports XDomainRequest, it will be used in preference for XHR.
    *
    * This is only relevant for IE 9 and should _only_ be enabled for IE 9 clients when required by the server/CDN.
    *
    * @property {boolean} useXDomainRequest
    * @deprecated This is only relevant for IE 9.
    */
    this.useXDomainRequest = false;

    /**
    * @private
    * @property {boolean} _warnedAboutXDomainRequest - Control number of warnings for using XDR outside of IE 9.
    */
    this._warnedAboutXDomainRequest = false;

    /**
    * If true (the default) then parallel downloading will be enabled.
    *
    * To disable all parallel downloads this must be set to false prior to any resource being loaded.
    *
    * @property {boolean} enableParallel
    */
    this.enableParallel = true;

    /**
    * The number of concurrent / parallel resources to try and fetch at once.
    *
    * Many current browsers limit 6 requests per domain; this is slightly conservative.
    *
    * @property {integer} maxParallelDownloads
    * @protected
    */
    this.maxParallelDownloads = 4;

    /**
    * A counter: if more than zero, files will be automatically added as a synchronization point.
    * @property {integer} _withSyncPointDepth;
    */
    this._withSyncPointDepth = 0;

    /**
    * Contains all the information for asset files (including packs) to load.
    *
    * File/assets are only removed from the list after all loading completes.
    *
    * @property {file[]} _fileList
    * @private
    */
    this._fileList = [];

    /**
    * Inflight files (or packs) that are being fetched/processed.
    *
    * This means that if there are any files in the flight queue there should still be processing
    * going on; it should only be empty before or after loading.
    *
    * The files in the queue may have additional properties added to them,
    * including `requestObject` which is normally the associated XHR.
    *
    * @property {file[]} _flightQueue
    * @private
    */
    this._flightQueue = [];

    /**
    * The offset into the fileList past all the complete (loaded or error) entries.
    *
    * @property {integer} _processingHead
    * @private
    */
    this._processingHead = 0;

    /**
    * True when the first file (not pack) has loading started.
    * This used to to control dispatching `onLoadStart` which happens after any initial packs are loaded.
    *
    * @property {boolean} _initialPacksLoaded
    * @private
    */
    this._fileLoadStarted = false;

    /**
    * Total packs seen - adjusted when a pack is added.
    * @property {integer} _totalPackCount
    * @private
    */
    this._totalPackCount = 0;

    /**
    * Total files seen - adjusted when a file is added.
    * @property {integer} _totalFileCount
    * @private
    */
    this._totalFileCount = 0;

    /**
    * Total packs loaded - adjusted just prior to `onPackComplete`.
    * @property {integer} _loadedPackCount
    * @private
    */
    this._loadedPackCount = 0;

    /**
    * Total files loaded - adjusted just prior to `onFileComplete`.
    * @property {integer} _loadedFileCount
    * @private
    */
    this._loadedFileCount = 0;

};

/**
* @constant
* @type {number}
*/
Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY = 0;

/**
* @constant
* @type {number}
*/
Phaser.Loader.TEXTURE_ATLAS_JSON_HASH = 1;

/**
* @constant
* @type {number}
*/
Phaser.Loader.TEXTURE_ATLAS_XML_STARLING = 2;

/**
* @constant
* @type {number}
*/
Phaser.Loader.PHYSICS_LIME_CORONA_JSON = 3;

/**
* @constant
* @type {number}
*/
Phaser.Loader.PHYSICS_PHASER_JSON = 4;

/**
* @constant
* @type {number}
*/
Phaser.Loader.TEXTURE_ATLAS_JSON_PYXEL = 5;

Phaser.Loader.prototype = {

    /**
    * Set a Sprite to be a "preload" sprite by passing it to this method.
    *
    * A "preload" sprite will have its width or height crop adjusted based on the percentage of the loader in real-time.
    * This allows you to easily make loading bars for games.
    *
    * The sprite will automatically be made visible when calling this.
    *
    * @method Phaser.Loader#setPreloadSprite
    * @param {Phaser.Sprite|Phaser.Image} sprite - The sprite or image that will be cropped during the load.
    * @param {number} [direction=0] - A value of zero means the sprite will be cropped horizontally, a value of 1 means its will be cropped vertically.
    */
    setPreloadSprite: function (sprite, direction) {

        direction = direction || 0;

        this.preloadSprite = { sprite: sprite, direction: direction, width: sprite.width, height: sprite.height, rect: null };

        if (direction === 0)
        {
            //  Horizontal rect
            this.preloadSprite.rect = new Phaser.Rectangle(0, 0, 1, sprite.height);
        }
        else
        {
            //  Vertical rect
            this.preloadSprite.rect = new Phaser.Rectangle(0, 0, sprite.width, 1);
        }

        sprite.crop(this.preloadSprite.rect);

        sprite.visible = true;

    },

    /**
    * Called automatically by ScaleManager when the game resizes in RESIZE scalemode.
    *
    * This can be used to adjust the preloading sprite size, eg.
    *
    * @method Phaser.Loader#resize
    * @protected
    */
    resize: function () {

        if (this.preloadSprite && this.preloadSprite.height !== this.preloadSprite.sprite.height)
        {
            this.preloadSprite.rect.height = this.preloadSprite.sprite.height;
        }

    },

    /**
    * Check whether a file/asset with a specific key is queued to be loaded.
    *
    * To access a loaded asset use Phaser.Cache, eg. {@link Phaser.Cache#checkImageKey}
    *
    * @method Phaser.Loader#checkKeyExists
    * @param {string} type - The type asset you want to check.
    * @param {string} key - Key of the asset you want to check.
    * @return {boolean} Return true if exists, otherwise return false.
    */
    checkKeyExists: function (type, key) {

        return this.getAssetIndex(type, key) > -1;

    },

    /**
    * Get the queue-index of the file/asset with a specific key.
    *
    * Only assets in the download file queue will be found.
    *
    * @method Phaser.Loader#getAssetIndex
    * @param {string} type - The type asset you want to check.
    * @param {string} key - Key of the asset you want to check.
    * @return {number} The index of this key in the filelist, or -1 if not found.
    *     The index may change and should only be used immediately following this call
    */
    getAssetIndex: function (type, key) {

        var bestFound = -1;

        for (var i = 0; i < this._fileList.length; i++)
        {
            var file = this._fileList[i];

            if (file.type === type && file.key === key)
            {
                bestFound = i;

                // An already loaded/loading file may be superceded.
                if (!file.loaded && !file.loading)
                {
                    break;
                }
            }
        }

        return bestFound;

    },

    /**
    * Find a file/asset with a specific key.
    *
    * Only assets in the download file queue will be found.
    *
    * @method Phaser.Loader#getAsset
    * @param {string} type - The type asset you want to check.
    * @param {string} key - Key of the asset you want to check.
    * @return {any} Returns an object if found that has 2 properties: `index` and `file`; otherwise a non-true value is returned.
    *     The index may change and should only be used immediately following this call.
    */
    getAsset: function (type, key) {

        var fileIndex = this.getAssetIndex(type, key);

        if (fileIndex > -1)
        {
            return { index: fileIndex, file: this._fileList[fileIndex] };
        }

        return false;

    },

    /**
    * Reset the loader and clear any queued assets. If `Loader.resetLocked` is true this operation will abort.
    *
    * This will abort any loading and clear any queued assets.
    *
    * Optionally you can clear any associated events.
    *
    * @method Phaser.Loader#reset
    * @protected
    * @param {boolean} [hard=false] - If true then the preload sprite and other artifacts may also be cleared.
    * @param {boolean} [clearEvents=false] - If true then the all Loader signals will have removeAll called on them.
    */
    reset: function (hard, clearEvents) {

        if (clearEvents === undefined) { clearEvents = false; }

        if (this.resetLocked)
        {
            return;
        }

        if (hard)
        {
            this.preloadSprite = null;
        }

        this.isLoading = false;

        this._processingHead = 0;
        this._fileList.length = 0;
        this._flightQueue.length = 0;

        this._fileLoadStarted = false;
        this._totalFileCount = 0;
        this._totalPackCount = 0;
        this._loadedPackCount = 0;
        this._loadedFileCount = 0;

        if (clearEvents)
        {
            this.onLoadStart.removeAll();
            this.onLoadComplete.removeAll();
            this.onPackComplete.removeAll();
            this.onFileStart.removeAll();
            this.onFileComplete.removeAll();
            this.onFileError.removeAll();
        }

    },

    /**
    * Internal function that adds a new entry to the file list. Do not call directly.
    *
    * @method Phaser.Loader#addToFileList
    * @protected
    * @param {string} type - The type of resource to add to the list (image, audio, xml, etc).
    * @param {string} key - The unique Cache ID key of this resource.
    * @param {string} [url] - The URL the asset will be loaded from.
    * @param {object} [properties=(none)] - Any additional properties needed to load the file. These are added directly to the added file object and overwrite any defaults.
    * @param {boolean} [overwrite=false] - If true then this will overwrite a file asset of the same type/key. Otherwise it will only add a new asset. If overwrite is true, and the asset is already being loaded (or has been loaded), then it is appended instead.
    * @param {string} [extension] - If no URL is given the Loader will sometimes auto-generate the URL based on the key, using this as the extension.
    * @return {Phaser.Loader} This instance of the Phaser Loader.
    */
    addToFileList: function (type, key, url, properties, overwrite, extension) {

        if (overwrite === undefined) { overwrite = false; }

        if (key === undefined || key === '')
        {
            console.warn("Phaser.Loader: Invalid or no key given of type " + type);
            return this;
        }

        if (url === undefined || url === null)
        {
            if (extension)
            {
                url = key + extension;
            }
            else
            {
                console.warn("Phaser.Loader: No URL given for file type: " + type + " key: " + key);
                return this;
            }
        }

        var file = {
            type: type,
            key: key,
            path: this.path,
            url: url,
            syncPoint: this._withSyncPointDepth > 0,
            data: null,
            loading: false,
            loaded: false,
            error: false
        };

        if (properties)
        {
            for (var prop in properties)
            {
                file[prop] = properties[prop];
            }
        }

        var fileIndex = this.getAssetIndex(type, key);

        if (overwrite && fileIndex > -1)
        {
            var currentFile = this._fileList[fileIndex];

            if (!currentFile.loading && !currentFile.loaded)
            {
                this._fileList[fileIndex] = file;
            }
            else
            {
                this._fileList.push(file);
                this._totalFileCount++;
            }
        }
        else if (fileIndex === -1)
        {
            this._fileList.push(file);
            this._totalFileCount++;
        }

        return this;

    },

    /**
    * Internal function that replaces an existing entry in the file list with a new one. Do not call directly.
    *
    * @method Phaser.Loader#replaceInFileList
    * @protected
    * @param {string} type - The type of resource to add to the list (image, audio, xml, etc).
    * @param {string} key - The unique Cache ID key of this resource.
    * @param {string} url - The URL the asset will be loaded from.
    * @param {object} properties - Any additional properties needed to load the file.
    */
    replaceInFileList: function (type, key, url, properties) {

        return this.addToFileList(type, key, url, properties, true);

    },

    /**
    * Add a JSON resource pack ('packfile') to the Loader.
    *
    * A packfile is a JSON file that contains a list of assets to the be loaded.
    * Please see the example 'loader/asset pack' in the Phaser Examples repository.
    *
    * Packs are always put before the first non-pack file that is not loaded / loading.
    *
    * This means that all packs added before any loading has started are added to the front
    * of the file queue, in the order added.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * The URL of the packfile can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * @method Phaser.Loader#pack
    * @param {string} key - Unique asset key of this resource pack.
    * @param {string} [url] - URL of the Asset Pack JSON file. If you wish to pass a json object instead set this to null and pass the object as the data parameter.
    * @param {object} [data] - The Asset Pack JSON data. Use this to pass in a json data object rather than loading it from a URL. TODO
    * @param {object} [callbackContext=(loader)] - Some Loader operations, like Binary and Script require a context for their callbacks. Pass the context here.
    * @return {Phaser.Loader} This Loader instance.
    */
    pack: function (key, url, data, callbackContext) {

        if (url === undefined) { url = null; }
        if (data === undefined) { data = null; }
        if (callbackContext === undefined) { callbackContext = null; }

        if (!url && !data)
        {
            console.warn('Phaser.Loader.pack - Both url and data are null. One must be set.');

            return this;
        }

        var pack = {
            type: 'packfile',
            key: key,
            url: url,
            path: this.path,
            syncPoint: true,
            data: null,
            loading: false,
            loaded: false,
            error: false,
            callbackContext: callbackContext
        };

        //  A data object has been given
        if (data)
        {
            if (typeof data === 'string')
            {
                data = JSON.parse(data);
            }

            pack.data = data || {};

            //  Already consider 'loaded'
            pack.loaded = true;
        }

        // Add before first non-pack/no-loaded ~ last pack from start prior to loading
        // (Read one past for splice-to-end)
        for (var i = 0; i < this._fileList.length + 1; i++)
        {
            var file = this._fileList[i];

            if (!file || (!file.loaded && !file.loading && file.type !== 'packfile'))
            {
                this._fileList.splice(i, 0, pack);
                this._totalPackCount++;
                break;
            }
        }

        return this;

    },

    /**
    * Adds an Image to the current load queue.
    *
    * The file is **not** loaded immediately after calling this method. The file is added to the queue ready to be loaded when the loader starts.
    *
    * Phaser can load all common image types: png, jpg, gif and any other format the browser can natively handle.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the image via `Cache.getImage(key)`
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the URL isn't specified the Loader will take the key and create a filename from that. For example if the key is "alien"
    * and no URL is given then the Loader will set the URL to be "alien.png". It will always add `.png` as the extension.
    * If you do not desire this action then provide a URL.
    *
    * @method Phaser.Loader#image
    * @param {string} key - Unique asset key of this image file.
    * @param {string} [url] - URL of an image file. If undefined or `null` the url will be set to `<key>.png`, i.e. if `key` was "alien" then the URL will be "alien.png".
    * @param {boolean} [overwrite=false] - If an unloaded file with a matching key already exists in the queue, this entry will overwrite it.
    * @return {Phaser.Loader} This Loader instance.
    */
    image: function (key, url, overwrite) {

        return this.addToFileList('image', key, url, undefined, overwrite, '.png');

    },

    /**
    * Adds an array of images to the current load queue.
    *
    * It works by passing each element of the array to the Loader.image method.
    *
    * The files are **not** loaded immediately after calling this method. The files are added to the queue ready to be loaded when the loader starts.
    *
    * Phaser can load all common image types: png, jpg, gif and any other format the browser can natively handle.
    *
    * The keys must be unique Strings. They are used to add the files to the Phaser.Cache upon successful load.
    *
    * Retrieve the images via `Cache.getImage(key)`
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the URL isn't specified the Loader will take the key and create a filename from that. For example if the key is "alien"
    * and no URL is given then the Loader will set the URL to be "alien.png". It will always add `.png` as the extension.
    * If you do not desire this action then provide a URL.
    *
    * @method Phaser.Loader#images
    * @param {array} keys - An array of unique asset keys of the image files.
    * @param {array} [urls] - Optional array of URLs. If undefined or `null` the url will be set to `<key>.png`, i.e. if `key` was "alien" then the URL will be "alien.png". If provided the URLs array length must match the keys array length.
    * @return {Phaser.Loader} This Loader instance.
     */
    images: function (keys, urls) {

        if (Array.isArray(urls))
        {
            for (var i = 0; i < keys.length; i++)
            {
                this.image(keys[i], urls[i]);
            }
        }
        else
        {
            for (var i = 0; i < keys.length; i++)
            {
                this.image(keys[i]);
            }
        }

        return this;

    },

    /**
    * Adds a Text file to the current load queue.
    *
    * The file is **not** loaded immediately after calling this method. The file is added to the queue ready to be loaded when the loader starts.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getText(key)`
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the URL isn't specified the Loader will take the key and create a filename from that. For example if the key is "alien"
    * and no URL is given then the Loader will set the URL to be "alien.txt". It will always add `.txt` as the extension.
    * If you do not desire this action then provide a URL.
    *
    * @method Phaser.Loader#text
    * @param {string} key - Unique asset key of the text file.
    * @param {string} [url] - URL of the text file. If undefined or `null` the url will be set to `<key>.txt`, i.e. if `key` was "alien" then the URL will be "alien.txt".
    * @param {boolean} [overwrite=false] - If an unloaded file with a matching key already exists in the queue, this entry will overwrite it.
    * @return {Phaser.Loader} This Loader instance.
    */
    text: function (key, url, overwrite) {

        return this.addToFileList('text', key, url, undefined, overwrite, '.txt');

    },

    /**
    * Adds a JSON file to the current load queue.
    *
    * The file is **not** loaded immediately after calling this method. The file is added to the queue ready to be loaded when the loader starts.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getJSON(key)`. JSON files are automatically parsed upon load.
    * If you need to control when the JSON is parsed then use `Loader.text` instead and parse the text file as needed.
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the URL isn't specified the Loader will take the key and create a filename from that. For example if the key is "alien"
    * and no URL is given then the Loader will set the URL to be "alien.json". It will always add `.json` as the extension.
    * If you do not desire this action then provide a URL.
    *
    * @method Phaser.Loader#json
    * @param {string} key - Unique asset key of the json file.
    * @param {string} [url] - URL of the JSON file. If undefined or `null` the url will be set to `<key>.json`, i.e. if `key` was "alien" then the URL will be "alien.json".
    * @param {boolean} [overwrite=false] - If an unloaded file with a matching key already exists in the queue, this entry will overwrite it.
    * @return {Phaser.Loader} This Loader instance.
    */
    json: function (key, url, overwrite) {

        return this.addToFileList('json', key, url, undefined, overwrite, '.json');

    },

    /**
    * Adds a fragment shader file to the current load queue.
    *
    * The file is **not** loaded immediately after calling this method. The file is added to the queue ready to be loaded when the loader starts.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getShader(key)`.
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the URL isn't specified the Loader will take the key and create a filename from that. For example if the key is "blur"
    * and no URL is given then the Loader will set the URL to be "blur.frag". It will always add `.frag` as the extension.
    * If you do not desire this action then provide a URL.
    *
    * @method Phaser.Loader#shader
    * @param {string} key - Unique asset key of the fragment file.
    * @param {string} [url] - URL of the fragment file. If undefined or `null` the url will be set to `<key>.frag`, i.e. if `key` was "blur" then the URL will be "blur.frag".
    * @param {boolean} [overwrite=false] - If an unloaded file with a matching key already exists in the queue, this entry will overwrite it.
    * @return {Phaser.Loader} This Loader instance.
    */
    shader: function (key, url, overwrite) {

        return this.addToFileList('shader', key, url, undefined, overwrite, '.frag');

    },

    /**
    * Adds an XML file to the current load queue.
    *
    * The file is **not** loaded immediately after calling this method. The file is added to the queue ready to be loaded when the loader starts.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getXML(key)`.
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the URL isn't specified the Loader will take the key and create a filename from that. For example if the key is "alien"
    * and no URL is given then the Loader will set the URL to be "alien.xml". It will always add `.xml` as the extension.
    * If you do not desire this action then provide a URL.
    *
    * @method Phaser.Loader#xml
    * @param {string} key - Unique asset key of the xml file.
    * @param {string} [url] - URL of the XML file. If undefined or `null` the url will be set to `<key>.xml`, i.e. if `key` was "alien" then the URL will be "alien.xml".
    * @param {boolean} [overwrite=false] - If an unloaded file with a matching key already exists in the queue, this entry will overwrite it.
    * @return {Phaser.Loader} This Loader instance.
    */
    xml: function (key, url, overwrite) {

        return this.addToFileList('xml', key, url, undefined, overwrite, '.xml');

    },

    /**
    * Adds a JavaScript file to the current load queue.
    *
    * The file is **not** loaded immediately after calling this method. The file is added to the queue ready to be loaded when the loader starts.
    *
    * The key must be a unique String.
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the URL isn't specified the Loader will take the key and create a filename from that. For example if the key is "alien"
    * and no URL is given then the Loader will set the URL to be "alien.js". It will always add `.js` as the extension.
    * If you do not desire this action then provide a URL.
    *
    * Upon successful load the JavaScript is automatically turned into a script tag and executed, so be careful what you load!
    *
    * A callback, which will be invoked as the script tag has been created, can also be specified.
    * The callback must return relevant `data`.
    *
    * @method Phaser.Loader#script
    * @param {string} key - Unique asset key of the script file.
    * @param {string} [url] - URL of the JavaScript file. If undefined or `null` the url will be set to `<key>.js`, i.e. if `key` was "alien" then the URL will be "alien.js".
    * @param {function} [callback=(none)] - Optional callback that will be called after the script tag has loaded, so you can perform additional processing.
    * @param {object} [callbackContext=(loader)] - The context under which the callback will be applied. If not specified it will use the Phaser Loader as the context.
    * @return {Phaser.Loader} This Loader instance.
    */
    script: function (key, url, callback, callbackContext) {

        if (callback === undefined) { callback = false; }

        if (callback !== false && callbackContext === undefined) { callbackContext = this; }

        return this.addToFileList('script', key, url, { syncPoint: true, callback: callback, callbackContext: callbackContext }, false, '.js');

    },

    /**
    * Adds a binary file to the current load queue.
    *
    * The file is **not** loaded immediately after calling this method. The file is added to the queue ready to be loaded when the loader starts.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getBinary(key)`.
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the URL isn't specified the Loader will take the key and create a filename from that. For example if the key is "alien"
    * and no URL is given then the Loader will set the URL to be "alien.bin". It will always add `.bin` as the extension.
    * If you do not desire this action then provide a URL.
    *
    * It will be loaded via xhr with a responseType of "arraybuffer". You can specify an optional callback to process the file after load.
    * When the callback is called it will be passed 2 parameters: the key of the file and the file data.
    *
    * WARNING: If a callback is specified the data will be set to whatever it returns. Always return the data object, even if you didn't modify it.
    *
    * @method Phaser.Loader#binary
    * @param {string} key - Unique asset key of the binary file.
    * @param {string} [url] - URL of the binary file. If undefined or `null` the url will be set to `<key>.bin`, i.e. if `key` was "alien" then the URL will be "alien.bin".
    * @param {function} [callback=(none)] - Optional callback that will be passed the file after loading, so you can perform additional processing on it.
    * @param {object} [callbackContext] - The context under which the callback will be applied. If not specified it will use the callback itself as the context.
    * @return {Phaser.Loader} This Loader instance.
    */
    binary: function (key, url, callback, callbackContext) {

        if (callback === undefined) { callback = false; }

        // Why is the default callback context the ..callback?
        if (callback !== false && callbackContext === undefined) { callbackContext = callback; }

        return this.addToFileList('binary', key, url, { callback: callback, callbackContext: callbackContext }, false, '.bin');

    },

    /**
    * Adds a Sprite Sheet to the current load queue.
    *
    * The file is **not** loaded immediately after calling this method. The file is added to the queue ready to be loaded when the loader starts.
    *
    * To clarify the terminology that Phaser uses: A Sprite Sheet is an image containing frames, usually of an animation, that are all equal
    * dimensions and often in sequence. For example if the frame size is 32x32 then every frame in the sprite sheet will be that size.
    * Sometimes (outside of Phaser) the term "sprite sheet" is used to refer to a texture atlas.
    * A Texture Atlas works by packing together images as best it can, using whatever frame sizes it likes, often with cropping and trimming
    * the frames in the process. Software such as Texture Packer, Flash CC or Shoebox all generate texture atlases, not sprite sheets.
    * If you've got an atlas then use `Loader.atlas` instead.
    *
    * The key must be a unique String. It is used to add the image to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getImage(key)`. Sprite sheets, being image based, live in the same Cache as all other Images.
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the URL isn't specified the Loader will take the key and create a filename from that. For example if the key is "alien"
    * and no URL is given then the Loader will set the URL to be "alien.png". It will always add `.png` as the extension.
    * If you do not desire this action then provide a URL.
    *
    * @method Phaser.Loader#spritesheet
    * @param {string} key - Unique asset key of the sheet file.
    * @param {string} url - URL of the sprite sheet file. If undefined or `null` the url will be set to `<key>.png`, i.e. if `key` was "alien" then the URL will be "alien.png".
    * @param {number} frameWidth - Width in pixels of a single frame in the sprite sheet.
    * @param {number} frameHeight - Height in pixels of a single frame in the sprite sheet.
    * @param {number} [frameMax=-1] - How many frames in this sprite sheet. If not specified it will divide the whole image into frames.
    * @param {number} [margin=0] - If the frames have been drawn with a margin, specify the amount here.
    * @param {number} [spacing=0] - If the frames have been drawn with spacing between them, specify the amount here.
    * @return {Phaser.Loader} This Loader instance.
    */
    spritesheet: function (key, url, frameWidth, frameHeight, frameMax, margin, spacing) {

        if (frameMax === undefined) { frameMax = -1; }
        if (margin === undefined) { margin = 0; }
        if (spacing === undefined) { spacing = 0; }

        return this.addToFileList('spritesheet', key, url, { frameWidth: frameWidth, frameHeight: frameHeight, frameMax: frameMax, margin: margin, spacing: spacing }, false, '.png');

    },

    /**
    * Adds an audio file to the current load queue.
    *
    * The file is **not** loaded immediately after calling this method. The file is added to the queue ready to be loaded when the loader starts.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getSound(key)`.
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * Mobile warning: There are some mobile devices (certain iPad 2 and iPad Mini revisions) that cannot play 48000 Hz audio.
    * When they try to play the audio becomes extremely distorted and buzzes, eventually crashing the sound system.
    * The solution is to use a lower encoding rate such as 44100 Hz.
    *
    * @method Phaser.Loader#audio
    * @param {string} key - Unique asset key of the audio file.
    * @param {string|string[]|object[]} urls - Either a single string or an array of URIs or pairs of `{uri: .., type: ..}`.
    *    If an array is specified then the first URI (or URI + mime pair) that is device-compatible will be selected.
    *    For example: `"jump.mp3"`, `['jump.mp3', 'jump.ogg', 'jump.m4a']`, or `[{uri: "data:<opus_resource>", type: 'opus'}, 'fallback.mp3']`.
    *    BLOB and DATA URIs can be used but only support automatic detection when used in the pair form; otherwise the format must be manually checked before adding the resource.
    * @param {boolean} [autoDecode=true] - When using Web Audio the audio files can either be decoded at load time or run-time.
    *    Audio files can't be played until they are decoded and, if specified, this enables immediate decoding. Decoding is a non-blocking async process, however it consumes huge amounts of CPU time on mobiles especially.
    * @return {Phaser.Loader} This Loader instance.
    */
    audio: function (key, urls, autoDecode) {

        if (this.game.sound.noAudio)
        {
            return this;
        }

        if (autoDecode === undefined) { autoDecode = true; }

        if (typeof urls === 'string')
        {
            urls = [urls];
        }

        return this.addToFileList('audio', key, urls, { buffer: null, autoDecode: autoDecode });

    },

    /**
    * Adds an audio sprite file to the current load queue.
    *
    * The file is **not** loaded immediately after calling this method. The file is added to the queue ready to be loaded when the loader starts.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Audio Sprites are a combination of audio files and a JSON configuration.
    *
    * The JSON follows the format of that created by https://github.com/tonistiigi/audiosprite
    *
    * Retrieve the file via `Cache.getSoundData(key)`.
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * @method Phaser.Loader#audioSprite
    * @param {string} key - Unique asset key of the audio file.
    * @param {Array|string} urls - An array containing the URLs of the audio files, i.e.: [ 'audiosprite.mp3', 'audiosprite.ogg', 'audiosprite.m4a' ] or a single string containing just one URL.
    * @param {string} [jsonURL=null] - The URL of the audiosprite configuration JSON object. If you wish to pass the data directly set this parameter to null.
    * @param {string|object} [jsonData=null] - A JSON object or string containing the audiosprite configuration data. This is ignored if jsonURL is not null.
    * @param {boolean} [autoDecode=true] - When using Web Audio the audio files can either be decoded at load time or run-time.
    *    Audio files can't be played until they are decoded and, if specified, this enables immediate decoding. Decoding is a non-blocking async process, however it consumes huge amounts of CPU time on mobiles especially.
    * @return {Phaser.Loader} This Loader instance.
    */
    audioSprite: function (key, urls, jsonURL, jsonData, autoDecode) {

        if (this.game.sound.noAudio)
        {
            return this;
        }

        if (jsonURL === undefined) { jsonURL = null; }
        if (jsonData === undefined) { jsonData = null; }
        if (autoDecode === undefined) { autoDecode = true; }

        this.audio(key, urls, autoDecode);

        if (jsonURL)
        {
            this.json(key + '-audioatlas', jsonURL);
        }
        else if (jsonData)
        {
            if (typeof jsonData === 'string')
            {
                jsonData = JSON.parse(jsonData);
            }

            this.cache.addJSON(key + '-audioatlas', '', jsonData);
        }
        else
        {
            console.warn('Phaser.Loader.audiosprite - You must specify either a jsonURL or provide a jsonData object');
        }

        return this;

    },

    /**
    * A legacy alias for Loader.audioSprite. Please see that method for documentation.
    *
    * @method Phaser.Loader#audiosprite
    * @param {string} key - Unique asset key of the audio file.
    * @param {Array|string} urls - An array containing the URLs of the audio files, i.e.: [ 'audiosprite.mp3', 'audiosprite.ogg', 'audiosprite.m4a' ] or a single string containing just one URL.
    * @param {string} [jsonURL=null] - The URL of the audiosprite configuration JSON object. If you wish to pass the data directly set this parameter to null.
    * @param {string|object} [jsonData=null] - A JSON object or string containing the audiosprite configuration data. This is ignored if jsonURL is not null.
    * @param {boolean} [autoDecode=true] - When using Web Audio the audio files can either be decoded at load time or run-time.
    *    Audio files can't be played until they are decoded and, if specified, this enables immediate decoding. Decoding is a non-blocking async process, however it consumes huge amounts of CPU time on mobiles especially.
    * @return {Phaser.Loader} This Loader instance.
    */
    audiosprite: function (key, urls, jsonURL, jsonData, autoDecode) {

        return this.audioSprite(key, urls, jsonURL, jsonData, autoDecode);

    },

    /**
    * Adds a video file to the current load queue.
    *
    * The file is **not** loaded immediately after calling this method. The file is added to the queue ready to be loaded when the loader starts.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getVideo(key)`.
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * You don't need to preload a video in order to play it in your game. See `Video.createVideoFromURL` for details.
    *
    * @method Phaser.Loader#video
    * @param {string} key - Unique asset key of the video file.
    * @param {string|string[]|object[]} urls - Either a single string or an array of URIs or pairs of `{uri: .., type: ..}`.
    *    If an array is specified then the first URI (or URI + mime pair) that is device-compatible will be selected.
    *    For example: `"boom.mp4"`, `['boom.mp4', 'boom.ogg', 'boom.webm']`, or `[{uri: "data:<opus_resource>", type: 'opus'}, 'fallback.mp4']`.
    *    BLOB and DATA URIs can be used but only support automatic detection when used in the pair form; otherwise the format must be manually checked before adding the resource.
    * @param {string} [loadEvent='canplaythrough'] - This sets the Video source event to listen for before the load is considered complete.
    *    'canplaythrough' implies the video has downloaded enough, and bandwidth is high enough that it can be played to completion.
    *    'canplay' implies the video has downloaded enough to start playing, but not necessarily to finish.
    *    'loadeddata' just makes sure that the video meta data and first frame have downloaded. Phaser uses this value automatically if the
    *    browser is detected as being Firefox and no `loadEvent` is given, otherwise it defaults to `canplaythrough`.
    * @param {boolean} [asBlob=false] - Video files can either be loaded via the creation of a video element which has its src property set.
    *    Or they can be loaded via xhr, stored as binary data in memory and then converted to a Blob. This isn't supported in IE9 or Android 2.
    *    If you need to have the same video playing at different times across multiple Sprites then you need to load it as a Blob.
    * @return {Phaser.Loader} This Loader instance.
    */
    video: function (key, urls, loadEvent, asBlob) {

        if (loadEvent === undefined)
        {
            if (this.game.device.firefox)
            {
                loadEvent = 'loadeddata';
            }
            else
            {
                loadEvent = 'canplaythrough';
            }
        }

        if (asBlob === undefined) { asBlob = false; }

        if (typeof urls === 'string')
        {
            urls = [urls];
        }

        return this.addToFileList('video', key, urls, { buffer: null, asBlob: asBlob, loadEvent: loadEvent });

    },

    /**
    * Adds a Tile Map data file to the current load queue.
    *
    * Phaser can load data in two different formats: CSV and Tiled JSON.
    * 
    * Tiled is a free software package, specifically for creating tilemaps, and is available from http://www.mapeditor.org
    *
    * You can choose to either load the data externally, by providing a URL to a json file.
    * Or you can pass in a JSON object or String via the `data` parameter.
    * If you pass a String the data is automatically run through `JSON.parse` and then immediately added to the Phaser.Cache.
    *
    * If a URL is provided the file is **not** loaded immediately after calling this method, but is added to the load queue.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getTilemapData(key)`. JSON files are automatically parsed upon load.
    * If you need to control when the JSON is parsed then use `Loader.text` instead and parse the text file as needed.
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the URL isn't specified and no data is given then the Loader will take the key and create a filename from that.
    * For example if the key is "level1" and no URL or data is given then the Loader will set the URL to be "level1.json".
    * If you set the format to be Tilemap.CSV it will set the URL to be "level1.csv" instead.
    *
    * If you do not desire this action then provide a URL or data object.
    *
    * @method Phaser.Loader#tilemap
    * @param {string} key - Unique asset key of the tilemap data.
    * @param {string} [url] - URL of the tile map file. If undefined or `null` and no data is given the url will be set to `<key>.json`, i.e. if `key` was "level1" then the URL will be "level1.json".
    * @param {object|string} [data] - An optional JSON data object. If given then the url is ignored and this JSON object is used for map data instead.
    * @param {number} [format=Phaser.Tilemap.CSV] - The format of the map data. Either Phaser.Tilemap.CSV or Phaser.Tilemap.TILED_JSON.
    * @return {Phaser.Loader} This Loader instance.
    */
    tilemap: function (key, url, data, format) {

        if (url === undefined) { url = null; }
        if (data === undefined) { data = null; }
        if (format === undefined) { format = Phaser.Tilemap.CSV; }

        if (!url && !data)
        {
            if (format === Phaser.Tilemap.CSV)
            {
                url = key + '.csv';
            }
            else
            {
                url = key + '.json';
            }
        }

        //  A map data object has been given
        if (data)
        {
            switch (format)
            {
                //  A csv string or object has been given
                case Phaser.Tilemap.CSV:
                    break;

                //  A json string or object has been given
                case Phaser.Tilemap.TILED_JSON:

                    if (typeof data === 'string')
                    {
                        data = JSON.parse(data);
                    }
                    break;
            }

            this.cache.addTilemap(key, null, data, format);
        }
        else
        {
            this.addToFileList('tilemap', key, url, { format: format });
        }

        return this;

    },

    /**
    * Adds a physics data file to the current load queue.
    *
    * The data must be in `Lime + Corona` JSON format. [Physics Editor](https://www.codeandweb.com) by code'n'web exports in this format natively.
    *
    * You can choose to either load the data externally, by providing a URL to a json file.
    * Or you can pass in a JSON object or String via the `data` parameter.
    * If you pass a String the data is automatically run through `JSON.parse` and then immediately added to the Phaser.Cache.
    *
    * If a URL is provided the file is **not** loaded immediately after calling this method, but is added to the load queue.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getJSON(key)`. JSON files are automatically parsed upon load.
    * If you need to control when the JSON is parsed then use `Loader.text` instead and parse the text file as needed.
    *
    * The URL can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the URL isn't specified and no data is given then the Loader will take the key and create a filename from that.
    * For example if the key is "alien" and no URL or data is given then the Loader will set the URL to be "alien.json".
    * It will always use `.json` as the extension.
    *
    * If you do not desire this action then provide a URL or data object.
    *
    * @method Phaser.Loader#physics
    * @param {string} key - Unique asset key of the physics json data.
    * @param {string} [url] - URL of the physics data file. If undefined or `null` and no data is given the url will be set to `<key>.json`, i.e. if `key` was "alien" then the URL will be "alien.json".
    * @param {object|string} [data] - An optional JSON data object. If given then the url is ignored and this JSON object is used for physics data instead.
    * @param {string} [format=Phaser.Physics.LIME_CORONA_JSON] - The format of the physics data.
    * @return {Phaser.Loader} This Loader instance.
    */
    physics: function (key, url, data, format) {

        if (url === undefined) { url = null; }
        if (data === undefined) { data = null; }
        if (format === undefined) { format = Phaser.Physics.LIME_CORONA_JSON; }

        if (!url && !data)
        {
            url = key + '.json';
        }

        //  A map data object has been given
        if (data)
        {
            if (typeof data === 'string')
            {
                data = JSON.parse(data);
            }

            this.cache.addPhysicsData(key, null, data, format);
        }
        else
        {
            this.addToFileList('physics', key, url, { format: format });
        }

        return this;

    },

    /**
    * Adds Bitmap Font files to the current load queue.
    *
    * To create the Bitmap Font files you can use:
    *
    * BMFont (Windows, free): http://www.angelcode.com/products/bmfont/
    * Glyph Designer (OS X, commercial): http://www.71squared.com/en/glyphdesigner
    * Littera (Web-based, free): http://kvazars.com/littera/
    *
    * You can choose to either load the data externally, by providing a URL to an xml file.
    * Or you can pass in an XML object or String via the `xmlData` parameter.
    * If you pass a String the data is automatically run through `Loader.parseXML` and then immediately added to the Phaser.Cache.
    *
    * If URLs are provided the files are **not** loaded immediately after calling this method, but are added to the load queue.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getBitmapFont(key)`. XML files are automatically parsed upon load.
    * If you need to control when the XML is parsed then use `Loader.text` instead and parse the XML file as needed.
    *
    * The URLs can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the textureURL isn't specified then the Loader will take the key and create a filename from that.
    * For example if the key is "megaFont" and textureURL is null then the Loader will set the URL to be "megaFont.png".
    * The same is true for the atlasURL. If atlasURL isn't specified and no atlasData has been provided then the Loader will
    * set the atlasURL to be the key. For example if the key is "megaFont" the atlasURL will be set to "megaFont.xml".
    *
    * If you do not desire this action then provide URLs and / or a data object.
    *
    * @method Phaser.Loader#bitmapFont
    * @param {string} key - Unique asset key of the bitmap font.
    * @param {string} textureURL -  URL of the Bitmap Font texture file. If undefined or `null` the url will be set to `<key>.png`, i.e. if `key` was "megaFont" then the URL will be "megaFont.png".
    * @param {string} atlasURL - URL of the Bitmap Font atlas file (xml/json). If undefined or `null` AND `atlasData` is null, the url will be set to `<key>.xml`, i.e. if `key` was "megaFont" then the URL will be "megaFont.xml".
    * @param {object} atlasData - An optional Bitmap Font atlas in string form (stringified xml/json).
    * @param {number} [xSpacing=0] - If you'd like to add additional horizontal spacing between the characters then set the pixel value here.
    * @param {number} [ySpacing=0] - If you'd like to add additional vertical spacing between the lines then set the pixel value here.
    * @return {Phaser.Loader} This Loader instance.
    */
    bitmapFont: function (key, textureURL, atlasURL, atlasData, xSpacing, ySpacing) {

        if (textureURL === undefined || textureURL === null)
        {
            textureURL = key + '.png';
        }

        if (atlasURL === undefined) { atlasURL = null; }
        if (atlasData === undefined) { atlasData = null; }

        if (atlasURL === null && atlasData === null)
        {
            atlasURL = key + '.xml';
        }

        if (xSpacing === undefined) { xSpacing = 0; }
        if (ySpacing === undefined) { ySpacing = 0; }

        //  A URL to a json/xml atlas has been given
        if (atlasURL)
        {
            this.addToFileList('bitmapfont', key, textureURL, { atlasURL: atlasURL, xSpacing: xSpacing, ySpacing: ySpacing });
        }
        else
        {
            //  A stringified xml/json atlas has been given
            if (typeof atlasData === 'string')
            {
                var json, xml;

                try
                {
                    json = JSON.parse(atlasData);
                }
                catch ( e )
                {
                    xml = this.parseXml(atlasData);
                }

                if (!xml && !json)
                {
                    throw new Error("Phaser.Loader. Invalid Bitmap Font atlas given");
                }

                this.addToFileList('bitmapfont', key, textureURL, { atlasURL: null, atlasData: json || xml,
                    atlasType: (!!json ? 'json' : 'xml'), xSpacing: xSpacing, ySpacing: ySpacing });
            }
        }

        return this;

    },

    /**
    * Adds a Texture Atlas file to the current load queue.
    *
    * Unlike `Loader.atlasJSONHash` this call expects the atlas data to be in a JSON Array format.
    *
    * To create the Texture Atlas you can use tools such as:
    *
    * [Texture Packer](https://www.codeandweb.com/texturepacker/phaser)
    * [Shoebox](http://renderhjs.net/shoebox/)
    *
    * If using Texture Packer we recommend you enable "Trim sprite names".
    * If your atlas software has an option to "rotate" the resulting frames, you must disable it.
    *
    * You can choose to either load the data externally, by providing a URL to a json file.
    * Or you can pass in a JSON object or String via the `atlasData` parameter.
    * If you pass a String the data is automatically run through `JSON.parse` and then immediately added to the Phaser.Cache.
    *
    * If URLs are provided the files are **not** loaded immediately after calling this method, but are added to the load queue.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getImage(key)`. JSON files are automatically parsed upon load.
    * If you need to control when the JSON is parsed then use `Loader.text` instead and parse the JSON file as needed.
    *
    * The URLs can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the textureURL isn't specified then the Loader will take the key and create a filename from that.
    * For example if the key is "player" and textureURL is null then the Loader will set the URL to be "player.png".
    * The same is true for the atlasURL. If atlasURL isn't specified and no atlasData has been provided then the Loader will
    * set the atlasURL to be the key. For example if the key is "player" the atlasURL will be set to "player.json".
    *
    * If you do not desire this action then provide URLs and / or a data object.
    *
    * @method Phaser.Loader#atlasJSONArray
    * @param {string} key - Unique asset key of the texture atlas file.
    * @param {string} [textureURL] - URL of the texture atlas image file. If undefined or `null` the url will be set to `<key>.png`, i.e. if `key` was "alien" then the URL will be "alien.png".
    * @param {string} [atlasURL] - URL of the texture atlas data file. If undefined or `null` and no atlasData is given, the url will be set to `<key>.json`, i.e. if `key` was "alien" then the URL will be "alien.json".
    * @param {object} [atlasData] - A JSON data object. You don't need this if the data is being loaded from a URL.
    * @return {Phaser.Loader} This Loader instance.
    */
    atlasJSONArray: function (key, textureURL, atlasURL, atlasData) {

        return this.atlas(key, textureURL, atlasURL, atlasData, Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY);

    },

    /**
    * Adds a Texture Atlas file to the current load queue.
    *
    * Unlike `Loader.atlas` this call expects the atlas data to be in a JSON Hash format.
    *
    * To create the Texture Atlas you can use tools such as:
    *
    * [Texture Packer](https://www.codeandweb.com/texturepacker/phaser)
    * [Shoebox](http://renderhjs.net/shoebox/)
    *
    * If using Texture Packer we recommend you enable "Trim sprite names".
    * If your atlas software has an option to "rotate" the resulting frames, you must disable it.
    *
    * You can choose to either load the data externally, by providing a URL to a json file.
    * Or you can pass in a JSON object or String via the `atlasData` parameter.
    * If you pass a String the data is automatically run through `JSON.parse` and then immediately added to the Phaser.Cache.
    *
    * If URLs are provided the files are **not** loaded immediately after calling this method, but are added to the load queue.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getImage(key)`. JSON files are automatically parsed upon load.
    * If you need to control when the JSON is parsed then use `Loader.text` instead and parse the JSON file as needed.
    *
    * The URLs can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the textureURL isn't specified then the Loader will take the key and create a filename from that.
    * For example if the key is "player" and textureURL is null then the Loader will set the URL to be "player.png".
    * The same is true for the atlasURL. If atlasURL isn't specified and no atlasData has been provided then the Loader will
    * set the atlasURL to be the key. For example if the key is "player" the atlasURL will be set to "player.json".
    *
    * If you do not desire this action then provide URLs and / or a data object.
    *
    * @method Phaser.Loader#atlasJSONHash
    * @param {string} key - Unique asset key of the texture atlas file.
    * @param {string} [textureURL] - URL of the texture atlas image file. If undefined or `null` the url will be set to `<key>.png`, i.e. if `key` was "alien" then the URL will be "alien.png".
    * @param {string} [atlasURL] - URL of the texture atlas data file. If undefined or `null` and no atlasData is given, the url will be set to `<key>.json`, i.e. if `key` was "alien" then the URL will be "alien.json".
    * @param {object} [atlasData] - A JSON data object. You don't need this if the data is being loaded from a URL.
    * @return {Phaser.Loader} This Loader instance.
    */
    atlasJSONHash: function (key, textureURL, atlasURL, atlasData) {

        return this.atlas(key, textureURL, atlasURL, atlasData, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

    },

    /**
    * Adds a Texture Atlas file to the current load queue.
    *
    * This call expects the atlas data to be in the Starling XML data format.
    *
    * To create the Texture Atlas you can use tools such as:
    *
    * [Texture Packer](https://www.codeandweb.com/texturepacker/phaser)
    * [Shoebox](http://renderhjs.net/shoebox/)
    *
    * If using Texture Packer we recommend you enable "Trim sprite names".
    * If your atlas software has an option to "rotate" the resulting frames, you must disable it.
    *
    * You can choose to either load the data externally, by providing a URL to an xml file.
    * Or you can pass in an XML object or String via the `atlasData` parameter.
    * If you pass a String the data is automatically run through `Loader.parseXML` and then immediately added to the Phaser.Cache.
    *
    * If URLs are provided the files are **not** loaded immediately after calling this method, but are added to the load queue.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getImage(key)`. XML files are automatically parsed upon load.
    * If you need to control when the XML is parsed then use `Loader.text` instead and parse the XML file as needed.
    *
    * The URLs can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the textureURL isn't specified then the Loader will take the key and create a filename from that.
    * For example if the key is "player" and textureURL is null then the Loader will set the URL to be "player.png".
    * The same is true for the atlasURL. If atlasURL isn't specified and no atlasData has been provided then the Loader will
    * set the atlasURL to be the key. For example if the key is "player" the atlasURL will be set to "player.xml".
    *
    * If you do not desire this action then provide URLs and / or a data object.
    *
    * @method Phaser.Loader#atlasXML
    * @param {string} key - Unique asset key of the texture atlas file.
    * @param {string} [textureURL] - URL of the texture atlas image file. If undefined or `null` the url will be set to `<key>.png`, i.e. if `key` was "alien" then the URL will be "alien.png".
    * @param {string} [atlasURL] - URL of the texture atlas data file. If undefined or `null` and no atlasData is given, the url will be set to `<key>.json`, i.e. if `key` was "alien" then the URL will be "alien.xml".
    * @param {object} [atlasData] - An XML data object. You don't need this if the data is being loaded from a URL.
    * @return {Phaser.Loader} This Loader instance.
    */
    atlasXML: function (key, textureURL, atlasURL, atlasData) {

        if (atlasURL === undefined) { atlasURL = null; }
        if (atlasData === undefined) { atlasData = null; }

        if (!atlasURL && !atlasData)
        {
            atlasURL = key + '.xml';
        }

        return this.atlas(key, textureURL, atlasURL, atlasData, Phaser.Loader.TEXTURE_ATLAS_XML_STARLING);

    },

    /**
    * Adds a Texture Atlas file to the current load queue.
    *
    * To create the Texture Atlas you can use tools such as:
    *
    * [Texture Packer](https://www.codeandweb.com/texturepacker/phaser)
    * [Shoebox](http://renderhjs.net/shoebox/)
    *
    * If using Texture Packer we recommend you enable "Trim sprite names".
    * If your atlas software has an option to "rotate" the resulting frames, you must disable it.
    *
    * You can choose to either load the data externally, by providing a URL to a json file.
    * Or you can pass in a JSON object or String via the `atlasData` parameter.
    * If you pass a String the data is automatically run through `JSON.parse` and then immediately added to the Phaser.Cache.
    *
    * If URLs are provided the files are **not** loaded immediately after calling this method, but are added to the load queue.
    *
    * The key must be a unique String. It is used to add the file to the Phaser.Cache upon successful load.
    *
    * Retrieve the file via `Cache.getImage(key)`. JSON files are automatically parsed upon load.
    * If you need to control when the JSON is parsed then use `Loader.text` instead and parse the JSON file as needed.
    *
    * The URLs can be relative or absolute. If the URL is relative the `Loader.baseURL` and `Loader.path` values will be prepended to it.
    *
    * If the textureURL isn't specified then the Loader will take the key and create a filename from that.
    * For example if the key is "player" and textureURL is null then the Loader will set the URL to be "player.png".
    * The same is true for the atlasURL. If atlasURL isn't specified and no atlasData has been provided then the Loader will
    * set the atlasURL to be the key. For example if the key is "player" the atlasURL will be set to "player.json".
    *
    * If you do not desire this action then provide URLs and / or a data object.
    *
    * @method Phaser.Loader#atlas
    * @param {string} key - Unique asset key of the texture atlas file.
    * @param {string} [textureURL] - URL of the texture atlas image file. If undefined or `null` the url will be set to `<key>.png`, i.e. if `key` was "alien" then the URL will be "alien.png".
    * @param {string} [atlasURL] - URL of the texture atlas data file. If undefined or `null` and no atlasData is given, the url will be set to `<key>.json`, i.e. if `key` was "alien" then the URL will be "alien.json".
    * @param {object} [atlasData] - A JSON or XML data object. You don't need this if the data is being loaded from a URL.
    * @param {number} [format] - The format of the data. Can be Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY (the default), Phaser.Loader.TEXTURE_ATLAS_JSON_HASH or Phaser.Loader.TEXTURE_ATLAS_XML_STARLING.
    * @return {Phaser.Loader} This Loader instance.
    */
    atlas: function (key, textureURL, atlasURL, atlasData, format) {

        if (textureURL === undefined || textureURL === null)
        {
            textureURL = key + '.png';
        }

        if (atlasURL === undefined) { atlasURL = null; }
        if (atlasData === undefined) { atlasData = null; }
        if (format === undefined) { format = Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY; }

        if (!atlasURL && !atlasData)
        {
            if (format === Phaser.Loader.TEXTURE_ATLAS_XML_STARLING)
            {
                atlasURL = key + '.xml';
            }
            else
            {
                atlasURL = key + '.json';
            }
        }

        //  A URL to a json/xml file has been given
        if (atlasURL)
        {
            this.addToFileList('textureatlas', key, textureURL, { atlasURL: atlasURL, format: format });
        }
        else
        {
            switch (format)
            {
                //  A json string or object has been given
                case Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY:

                    if (typeof atlasData === 'string')
                    {
                        atlasData = JSON.parse(atlasData);
                    }
                    break;

                //  An xml string or object has been given
                case Phaser.Loader.TEXTURE_ATLAS_XML_STARLING:

                    if (typeof atlasData === 'string')
                    {
                        var xml = this.parseXml(atlasData);

                        if (!xml)
                        {
                            throw new Error("Phaser.Loader. Invalid Texture Atlas XML given");
                        }

                        atlasData = xml;
                    }
                    break;
            }

            this.addToFileList('textureatlas', key, textureURL, { atlasURL: null, atlasData: atlasData, format: format });

        }

        return this;

    },

    /**
    * Add a synchronization point to the assets/files added within the supplied callback.
    *
    * A synchronization point denotes that an asset _must_ be completely loaded before
    * subsequent assets can be loaded. An asset marked as a sync-point does not need to wait
    * for previous assets to load (unless they are sync-points). Resources, such as packs, may still
    * be downloaded around sync-points, as long as they do not finalize loading.
    *
    * @method Phaser.Loader#withSyncPoints
    * @param {function} callback - The callback is invoked and is supplied with a single argument: the loader.
    * @param {object} [callbackContext=(loader)] - Context for the callback.
    * @return {Phaser.Loader} This Loader instance.
    */
    withSyncPoint: function (callback, callbackContext) {

        this._withSyncPointDepth++;

        try {
            callback.call(callbackContext || this, this);
        } finally {
            this._withSyncPointDepth--;
        }

        return this;
    },

    /**
    * Add a synchronization point to a specific file/asset in the load queue.
    *
    * This has no effect on already loaded assets.
    *
    * @method Phaser.Loader#addSyncPoint
    * @param {string} type - The type of resource to turn into a sync point (image, audio, xml, etc).
    * @param {string} key - Key of the file you want to turn into a sync point.
    * @return {Phaser.Loader} This Loader instance.
    * @see {@link Phaser.Loader#withSyncPoint withSyncPoint}
    */
    addSyncPoint: function (type, key) {

        var asset = this.getAsset(type, key);

        if (asset)
        {
            asset.file.syncPoint = true;
        }

        return this;
    },

    /**
    * Remove a file/asset from the loading queue.
    *
    * A file that is loaded or has started loading cannot be removed.
    *
    * @method Phaser.Loader#removeFile
    * @protected
    * @param {string} type - The type of resource to add to the list (image, audio, xml, etc).
    * @param {string} key - Key of the file you want to remove.
    */
    removeFile: function (type, key) {

        var asset = this.getAsset(type, key);

        if (asset)
        {
            if (!asset.loaded && !asset.loading)
            {
                this._fileList.splice(asset.index, 1);
            }
        }

    },

    /**
    * Remove all file loading requests - this is _insufficient_ to stop current loading. Use `reset` instead.
    *
    * @method Phaser.Loader#removeAll
    * @protected
    */
    removeAll: function () {

        this._fileList.length = 0;
        this._flightQueue.length = 0;

    },

    /**
    * Start loading the assets. Normally you don't need to call this yourself as the StateManager will do so.
    *
    * @method Phaser.Loader#start
    */
    start: function () {

        if (this.isLoading)
        {
            return;
        }

        this.hasLoaded = false;
        this.isLoading = true;

        this.updateProgress();

        this.processLoadQueue();

    },

    /**
    * Process the next item(s) in the file/asset queue.
    *
    * Process the queue and start loading enough items to fill up the inflight queue.
    *
    * If a sync-file is encountered then subsequent asset processing is delayed until it completes.
    * The exception to this rule is that packfiles can be downloaded (but not processed) even if
    * there appear other sync files (ie. packs) - this enables multiple packfiles to be fetched in parallel.
    * such as during the start phaser.
    *
    * @method Phaser.Loader#processLoadQueue
    * @private
    */
    processLoadQueue: function () {

        if (!this.isLoading)
        {
            console.warn('Phaser.Loader - active loading canceled / reset');
            this.finishedLoading(true);
            return;
        }

        // Empty the flight queue as applicable
        for (var i = 0; i < this._flightQueue.length; i++)
        {
            var file = this._flightQueue[i];

            if (file.loaded || file.error)
            {
                this._flightQueue.splice(i, 1);
                i--;

                file.loading = false;
                file.requestUrl = null;
                file.requestObject = null;

                if (file.error)
                {
                    this.onFileError.dispatch(file.key, file);
                }

                if (file.type !== 'packfile')
                {
                    this._loadedFileCount++;
                    this.onFileComplete.dispatch(this.progress, file.key, !file.error, this._loadedFileCount, this._totalFileCount);
                }
                else if (file.type === 'packfile' && file.error)
                {
                    // Non-error pack files are handled when processing the file queue
                    this._loadedPackCount++;
                    this.onPackComplete.dispatch(file.key, !file.error, this._loadedPackCount, this._totalPackCount);
                }

            }
        }

        // When true further non-pack file downloads are suppressed
        var syncblock = false;

        var inflightLimit = this.enableParallel ? Phaser.Math.clamp(this.maxParallelDownloads, 1, 12) : 1;

        for (var i = this._processingHead; i < this._fileList.length; i++)
        {
            var file = this._fileList[i];

            // Pack is fetched (ie. has data) and is currently at the start of the process queue.
            if (file.type === 'packfile' && !file.error && file.loaded && i === this._processingHead)
            {
                // Processing the pack / adds more files
                this.processPack(file);

                this._loadedPackCount++;
                this.onPackComplete.dispatch(file.key, !file.error, this._loadedPackCount, this._totalPackCount);
            }

            if (file.loaded || file.error)
            {
                // Item at the start of file list finished, can skip it in future
                if (i === this._processingHead)
                {
                    this._processingHead = i + 1;
                }
            }
            else if (!file.loading && this._flightQueue.length < inflightLimit)
            {
                // -> not loaded/failed, not loading
                if (file.type === 'packfile' && !file.data)
                {
                    // Fetches the pack data: the pack is processed above as it reaches queue-start.
                    // (Packs do not trigger onLoadStart or onFileStart.)
                    this._flightQueue.push(file);
                    file.loading = true;

                    this.loadFile(file);
                }
                else if (!syncblock)
                {
                    if (!this._fileLoadStarted)
                    {
                        this._fileLoadStarted = true;
                        this.onLoadStart.dispatch();
                    }

                    this._flightQueue.push(file);
                    file.loading = true;
                    this.onFileStart.dispatch(this.progress, file.key, file.url);

                    this.loadFile(file);
                }
            }

            if (!file.loaded && file.syncPoint)
            {
                syncblock = true;
            }

            // Stop looking if queue full - or if syncblocked and there are no more packs.
            // (As only packs can be loaded around a syncblock)
            if (this._flightQueue.length >= inflightLimit ||
                (syncblock && this._loadedPackCount === this._totalPackCount))
            {
                break;
            }
        }

        this.updateProgress();

        // True when all items in the queue have been advanced over
        // (There should be no inflight items as they are complete - loaded/error.)
        if (this._processingHead >= this._fileList.length)
        {
            this.finishedLoading();
        }
        else if (!this._flightQueue.length)
        {
            // Flight queue is empty but file list is not done being processed.
            // This indicates a critical internal error with no known recovery.
            console.warn("Phaser.Loader - aborting: processing queue empty, loading may have stalled");

            var _this = this;

            setTimeout(function () {
                _this.finishedLoading(true);
            }, 2000);
        }

    },

    /**
    * The loading is all finished.
    *
    * @method Phaser.Loader#finishedLoading
    * @private
    * @param {boolean} [abnormal=true] - True if the loading finished abnormally.
    */
    finishedLoading: function (abnormal) {

        if (this.hasLoaded)
        {
            return;
        }

        this.hasLoaded = true;
        this.isLoading = false;

        // If there were no files make sure to trigger the event anyway, for consistency
        if (!abnormal && !this._fileLoadStarted)
        {
            this._fileLoadStarted = true;
            this.onLoadStart.dispatch();
        }

        this.onLoadComplete.dispatch();

        this.game.state.loadComplete();

        this.reset();

    },

    /**
    * Informs the loader that the given file resource has been fetched and processed;
    * or such a request has failed.
    *
    * @method Phaser.Loader#asyncComplete
    * @private
    * @param {object} file
    * @param {string} [error=''] - The error message, if any. No message implies no error.
    */
    asyncComplete: function (file, errorMessage) {

        if (errorMessage === undefined) { errorMessage = ''; }

        file.loaded = true;
        file.error = !!errorMessage;

        if (errorMessage)
        {
            file.errorMessage = errorMessage;

            console.warn('Phaser.Loader - ' + file.type + '[' + file.key + ']' + ': ' + errorMessage);
            // debugger;
        }

        this.processLoadQueue();

    },

    /**
    * Process pack data. This will usually modify the file list.
    *
    * @method Phaser.Loader#processPack
    * @private
    * @param {object} pack
    */
    processPack: function (pack) {

        var packData = pack.data[pack.key];

        if (!packData)
        {
            console.warn('Phaser.Loader - ' + pack.key + ': pack has data, but not for pack key');
            return;
        }

        for (var i = 0; i < packData.length; i++)
        {
            var file = packData[i];

            switch (file.type)
            {
                case "image":
                    this.image(file.key, file.url, file.overwrite);
                    break;

                case "text":
                    this.text(file.key, file.url, file.overwrite);
                    break;

                case "json":
                    this.json(file.key, file.url, file.overwrite);
                    break;

                case "xml":
                    this.xml(file.key, file.url, file.overwrite);
                    break;

                case "script":
                    this.script(file.key, file.url, file.callback, pack.callbackContext || this);
                    break;

                case "binary":
                    this.binary(file.key, file.url, file.callback, pack.callbackContext || this);
                    break;

                case "spritesheet":
                    this.spritesheet(file.key, file.url, file.frameWidth, file.frameHeight, file.frameMax, file.margin, file.spacing);
                    break;

                case "video":
                    this.video(file.key, file.urls);
                    break;

                case "audio":
                    this.audio(file.key, file.urls, file.autoDecode);
                    break;

                case "audiosprite":
                    this.audiosprite(file.key, file.urls, file.jsonURL, file.jsonData, file.autoDecode);
                    break;

                case "tilemap":
                    this.tilemap(file.key, file.url, file.data, Phaser.Tilemap[file.format]);
                    break;

                case "physics":
                    this.physics(file.key, file.url, file.data, Phaser.Loader[file.format]);
                    break;

                case "bitmapFont":
                    this.bitmapFont(file.key, file.textureURL, file.atlasURL, file.atlasData, file.xSpacing, file.ySpacing);
                    break;

                case "atlasJSONArray":
                    this.atlasJSONArray(file.key, file.textureURL, file.atlasURL, file.atlasData);
                    break;

                case "atlasJSONHash":
                    this.atlasJSONHash(file.key, file.textureURL, file.atlasURL, file.atlasData);
                    break;

                case "atlasXML":
                    this.atlasXML(file.key, file.textureURL, file.atlasURL, file.atlasData);
                    break;

                case "atlas":
                    this.atlas(file.key, file.textureURL, file.atlasURL, file.atlasData, Phaser.Loader[file.format]);
                    break;

                case "shader":
                    this.shader(file.key, file.url, file.overwrite);
                    break;
            }
        }

    },

    /**
    * Transforms the asset URL.
    *
    * The default implementation prepends the baseURL if the url doesn't begin with http or //
    *
    * @method Phaser.Loader#transformUrl
    * @protected
    * @param {string} url - The url to transform.
    * @param {object} file - The file object being transformed.
    * @return {string} The transformed url. In rare cases where the url isn't specified it will return false instead.
    */
    transformUrl: function (url, file) {

        if (!url)
        {
            return false;
        }

        if (url.match(/^(?:blob:|data:|http:\/\/|https:\/\/|\/\/)/))
        {
            return url;
        }
        else
        {
            return this.baseURL + file.path + url;
        }

    },

    /**
    * Start fetching a resource.
    *
    * All code paths, async or otherwise, from this function must return to `asyncComplete`.
    *
    * @method Phaser.Loader#loadFile
    * @private
    * @param {object} file
    */
    loadFile: function (file) {

        //  Image or Data?
        switch (file.type)
        {
            case 'packfile':
                this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.fileComplete);
                break;

            case 'image':
            case 'spritesheet':
            case 'textureatlas':
            case 'bitmapfont':
                this.loadImageTag(file);
                break;

            case 'audio':
                file.url = this.getAudioURL(file.url);

                if (file.url)
                {
                    //  WebAudio or Audio Tag?
                    if (this.game.sound.usingWebAudio)
                    {
                        this.xhrLoad(file, this.transformUrl(file.url, file), 'arraybuffer', this.fileComplete);
                    }
                    else if (this.game.sound.usingAudioTag)
                    {
                        this.loadAudioTag(file);
                    }
                }
                else
                {
                    this.fileError(file, null, 'No supported audio URL specified or device does not have audio playback support');
                }
                break;

            case 'video':
                file.url = this.getVideoURL(file.url);

                if (file.url)
                {
                    if (file.asBlob)
                    {
                        this.xhrLoad(file, this.transformUrl(file.url, file), 'blob', this.fileComplete);
                    }
                    else
                    {
                        this.loadVideoTag(file);
                    }
                }
                else
                {
                    this.fileError(file, null, 'No supported video URL specified or device does not have video playback support');
                }
                break;

            case 'json':

                this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.jsonLoadComplete);
                break;

            case 'xml':

                this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.xmlLoadComplete);
                break;

            case 'tilemap':

                if (file.format === Phaser.Tilemap.TILED_JSON)
                {
                    this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.jsonLoadComplete);
                }
                else if (file.format === Phaser.Tilemap.CSV)
                {
                    this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.csvLoadComplete);
                }
                else
                {
                    this.asyncComplete(file, "invalid Tilemap format: " + file.format);
                }
                break;

            case 'text':
            case 'script':
            case 'shader':
            case 'physics':
                this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.fileComplete);
                break;

            case 'binary':
                this.xhrLoad(file, this.transformUrl(file.url, file), 'arraybuffer', this.fileComplete);
                break;
        }

    },

    /**
    * Continue async loading through an Image tag.
    * @private
    */
    loadImageTag: function (file) {

        var _this = this;

        file.data = new Image();
        file.data.name = file.key;

        if (this.crossOrigin)
        {
            file.data.crossOrigin = this.crossOrigin;
        }

        file.data.onload = function () {
            if (file.data.onload)
            {
                file.data.onload = null;
                file.data.onerror = null;
                _this.fileComplete(file);
            }
        };

        file.data.onerror = function () {
            if (file.data.onload)
            {
                file.data.onload = null;
                file.data.onerror = null;
                _this.fileError(file);
            }
        };

        file.data.src = this.transformUrl(file.url, file);

        // Image is immediately-available/cached
        if (file.data.complete && file.data.width && file.data.height)
        {
            file.data.onload = null;
            file.data.onerror = null;
            this.fileComplete(file);
        }

    },

    /**
    * Continue async loading through a Video tag.
    * @private
    */
    loadVideoTag: function (file) {

        var _this = this;

        file.data = document.createElement("video");
        file.data.name = file.key;
        file.data.controls = false;
        file.data.autoplay = false;

        var videoLoadEvent = function () {

            file.data.removeEventListener(file.loadEvent, videoLoadEvent, false);
            file.data.onerror = null;
            file.data.canplay = true;
            Phaser.GAMES[_this.game.id].load.fileComplete(file);

        };

        file.data.onerror = function () {
            file.data.removeEventListener(file.loadEvent, videoLoadEvent, false);
            file.data.onerror = null;
            file.data.canplay = false;
            _this.fileError(file);
        };

        file.data.addEventListener(file.loadEvent, videoLoadEvent, false);

        file.data.src = this.transformUrl(file.url, file);
        file.data.load();

    },

    /**
    * Continue async loading through an Audio tag.
    * @private
    */
    loadAudioTag: function (file) {

        var _this = this;

        if (this.game.sound.touchLocked)
        {
            //  If audio is locked we can't do this yet, so need to queue this load request. Bum.
            file.data = new Audio();
            file.data.name = file.key;
            file.data.preload = 'auto';
            file.data.src = this.transformUrl(file.url, file);

            this.fileComplete(file);
        }
        else
        {
            file.data = new Audio();
            file.data.name = file.key;

            var playThroughEvent = function () {
                file.data.removeEventListener('canplaythrough', playThroughEvent, false);
                file.data.onerror = null;
                _this.fileComplete(file);
            };

            file.data.onerror = function () {
                file.data.removeEventListener('canplaythrough', playThroughEvent, false);
                file.data.onerror = null;
                _this.fileError(file);
            };

            file.data.preload = 'auto';
            file.data.src = this.transformUrl(file.url, file);
            file.data.addEventListener('canplaythrough', playThroughEvent, false);
            file.data.load();
        }

    },

    /**
    * Starts the xhr loader.
    *
    * This is designed specifically to use with asset file processing.
    *
    * @method Phaser.Loader#xhrLoad
    * @private
    * @param {object} file - The file/pack to load.
    * @param {string} url - The URL of the file.
    * @param {string} type - The xhr responseType.
    * @param {function} onload - The function to call on success. Invoked in `this` context and supplied with `(file, xhr)` arguments.
    * @param {function} [onerror=fileError]  The function to call on error. Invoked in `this` context and supplied with `(file, xhr)` arguments.
    */
    xhrLoad: function (file, url, type, onload, onerror) {

        if (this.useXDomainRequest && window.XDomainRequest)
        {
            this.xhrLoadWithXDR(file, url, type, onload, onerror);
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = type;

        if (this.headers['requestedWith'] !== false)
        {
            xhr.setRequestHeader('X-Requested-With', this.headers['requestedWith']);
        }

        if (this.headers[file.type])
        {
            xhr.setRequestHeader('Accept', this.headers[file.type]);
        }

        onerror = onerror || this.fileError;

        var _this = this;

        xhr.onload = function () {

            try {
                if (xhr.readyState === 4 && xhr.status >= 400 && xhr.status <= 599) { // Handle HTTP status codes of 4xx and 5xx as errors, even if xhr.onerror was not called.
                    return onerror.call(_this, file, xhr);
                }
                else {
                    return onload.call(_this, file, xhr);
                }
            } catch (e) {

                //  If this was the last file in the queue and an error is thrown in the create method
                //  then it's caught here, so be sure we don't carry on processing it

                if (!_this.hasLoaded)
                {
                    _this.asyncComplete(file, e.message || 'Exception');
                }
                else
                {
                    if (window['console'])
                    {
                        console.error(e);
                    }
                }
            }
        };

        xhr.onerror = function () {

            try {

                return onerror.call(_this, file, xhr);

            } catch (e) {

                if (!_this.hasLoaded)
                {
                    _this.asyncComplete(file, e.message || 'Exception');
                }
                else
                {
                    if (window['console'])
                    {
                        console.error(e);
                    }
                }

            }
        };

        file.requestObject = xhr;
        file.requestUrl = url;

        xhr.send();

    },

    /**
    * Starts the xhr loader - using XDomainRequest.
    * This should _only_ be used with IE 9. Phaser does not support IE 8 and XDR is deprecated in IE 10.
    *
    * This is designed specifically to use with asset file processing.
    *
    * @method Phaser.Loader#xhrLoad
    * @private
    * @param {object} file - The file/pack to load.
    * @param {string} url - The URL of the file.
    * @param {string} type - The xhr responseType.
    * @param {function} onload - The function to call on success. Invoked in `this` context and supplied with `(file, xhr)` arguments.
    * @param {function} [onerror=fileError]  The function to call on error. Invoked in `this` context and supplied with `(file, xhr)` arguments.
    * @deprecated This is only relevant for IE 9.
    */
    xhrLoadWithXDR: function (file, url, type, onload, onerror) {

        // Special IE9 magic .. only
        if (!this._warnedAboutXDomainRequest &&
            (!this.game.device.ie || this.game.device.ieVersion >= 10))
        {
            this._warnedAboutXDomainRequest = true;
            console.warn("Phaser.Loader - using XDomainRequest outside of IE 9");
        }

        // Ref: http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
        var xhr = new window.XDomainRequest();
        xhr.open('GET', url, true);
        xhr.responseType = type;

        // XDomainRequest has a few quirks. Occasionally it will abort requests
        // A way to avoid this is to make sure ALL callbacks are set even if not used
        // More info here: http://stackoverflow.com/questions/15786966/xdomainrequest-aborts-post-on-ie-9
        xhr.timeout = 3000;

        onerror = onerror || this.fileError;

        var _this = this;

        xhr.onerror = function () {
            try {
                return onerror.call(_this, file, xhr);
            } catch (e) {
                _this.asyncComplete(file, e.message || 'Exception');
            }
        };

        xhr.ontimeout = function () {
            try {
                return onerror.call(_this, file, xhr);
            } catch (e) {
                _this.asyncComplete(file, e.message || 'Exception');
            }
        };

        xhr.onprogress = function() {};

        xhr.onload = function () {
            try {
                if (xhr.readyState === 4 && xhr.status >= 400 && xhr.status <= 599) { // Handle HTTP status codes of 4xx and 5xx as errors, even if xhr.onerror was not called.
                    return onerror.call(_this, file, xhr);
                }
                else {
                    return onload.call(_this, file, xhr);
                }
                return onload.call(_this, file, xhr);
            } catch (e) {
                _this.asyncComplete(file, e.message || 'Exception');
            }
        };

        file.requestObject = xhr;
        file.requestUrl = url;

        //  Note: The xdr.send() call is wrapped in a timeout to prevent an issue with the interface where some requests are lost
        //  if multiple XDomainRequests are being sent at the same time.
        setTimeout(function () {
            xhr.send();
        }, 0);

    },

    /**
    * Give a bunch of URLs, return the first URL that has an extension this device thinks it can play.
    *
    * It is assumed that the device can play "blob:" or "data:" URIs - There is no mime-type checking on data URIs.
    *
    * @method Phaser.Loader#getVideoURL
    * @private
    * @param {object[]|string[]} urls - See {@link #video} for format.
    * @return {string} The URL to try and fetch; or null.
    */
    getVideoURL: function (urls) {

        for (var i = 0; i < urls.length; i++)
        {
            var url = urls[i];
            var videoType;

            if (url.uri) // {uri: .., type: ..} pair
            {
                videoType = url.type;
                url = url.uri;

                if (this.game.device.canPlayVideo(videoType))
                {
                    return url;
                }
            }
            else
            {
                // Assume direct-data URI can be played if not in a paired form; select immediately
                if (url.indexOf("blob:") === 0 || url.indexOf("data:") === 0)
                {
                    return url;
                }

                if (url.indexOf("?") >= 0) // Remove query from URL
                {
                    url = url.substr(0, url.indexOf("?"));
                }

                var extension = url.substr((Math.max(0, url.lastIndexOf(".")) || Infinity) + 1);

                videoType = extension.toLowerCase();

                if (this.game.device.canPlayVideo(videoType))
                {
                    return urls[i];
                }
            }
        }

        return null;

    },

    /**
    * Give a bunch of URLs, return the first URL that has an extension this device thinks it can play.
    *
    * It is assumed that the device can play "blob:" or "data:" URIs - There is no mime-type checking on data URIs.
    *
    * @method Phaser.Loader#getAudioURL
    * @private
    * @param {object[]|string[]} urls - See {@link #audio} for format.
    * @return {string} The URL to try and fetch; or null.
    */
    getAudioURL: function (urls) {

        if (this.game.sound.noAudio)
        {
            return null;
        }

        for (var i = 0; i < urls.length; i++)
        {
            var url = urls[i];
            var audioType;

            if (url.uri) // {uri: .., type: ..} pair
            {
                audioType = url.type;
                url = url.uri;

                if (this.game.device.canPlayAudio(audioType))
                {
                    return url;
                }
            }
            else
            {
                // Assume direct-data URI can be played if not in a paired form; select immediately
                if (url.indexOf("blob:") === 0 || url.indexOf("data:") === 0)
                {
                    return url;
                }

                if (url.indexOf("?") >= 0) // Remove query from URL
                {
                    url = url.substr(0, url.indexOf("?"));
                }

                var extension = url.substr((Math.max(0, url.lastIndexOf(".")) || Infinity) + 1);

                audioType = extension.toLowerCase();

                if (this.game.device.canPlayAudio(audioType))
                {
                    return urls[i];
                }
            }
        }

        return null;

    },

    /**
    * Error occurred when loading a file.
    *
    * @method Phaser.Loader#fileError
    * @private
    * @param {object} file
    * @param {?XMLHttpRequest} xhr - XHR request, unspecified if loaded via other means (eg. tags)
    * @param {string} reason
    */
    fileError: function (file, xhr, reason) {

        var url = file.requestUrl || this.transformUrl(file.url, file);
        var message = 'error loading asset from URL ' + url;

        if (!reason && xhr)
        {
            reason = xhr.status;
        }

        if (reason)
        {
            message = message + ' (' + reason + ')';
        }

        this.asyncComplete(file, message);

    },

    /**
    * Called when a file/resources had been downloaded and needs to be processed further.
    *
    * @method Phaser.Loader#fileComplete
    * @private
    * @param {object} file - File loaded
    * @param {?XMLHttpRequest} xhr - XHR request, unspecified if loaded via other means (eg. tags)
    */
    fileComplete: function (file, xhr) {

        var loadNext = true;

        switch (file.type)
        {
            case 'packfile':

                // Pack data must never be false-ish after it is fetched without error
                var data = JSON.parse(xhr.responseText);
                file.data = data || {};
                break;

            case 'image':

                this.cache.addImage(file.key, file.url, file.data);
                break;

            case 'spritesheet':

                this.cache.addSpriteSheet(file.key, file.url, file.data, file.frameWidth, file.frameHeight, file.frameMax, file.margin, file.spacing);
                break;

            case 'textureatlas':

                if (file.atlasURL == null)
                {
                    this.cache.addTextureAtlas(file.key, file.url, file.data, file.atlasData, file.format);
                }
                else
                {
                    //  Load the JSON or XML before carrying on with the next file
                    loadNext = false;

                    if (file.format === Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY || file.format === Phaser.Loader.TEXTURE_ATLAS_JSON_HASH || file.format === Phaser.Loader.TEXTURE_ATLAS_JSON_PYXEL)
                    {
                        this.xhrLoad(file, this.transformUrl(file.atlasURL, file), 'text', this.jsonLoadComplete);
                    }
                    else if (file.format === Phaser.Loader.TEXTURE_ATLAS_XML_STARLING)
                    {
                        this.xhrLoad(file, this.transformUrl(file.atlasURL, file), 'text', this.xmlLoadComplete);
                    }
                    else
                    {
                        throw new Error("Phaser.Loader. Invalid Texture Atlas format: " + file.format);
                    }
                }
                break;

            case 'bitmapfont':

                if (!file.atlasURL)
                {
                    this.cache.addBitmapFont(file.key, file.url, file.data, file.atlasData, file.atlasType, file.xSpacing, file.ySpacing);
                }
                else
                {
                    //  Load the XML before carrying on with the next file
                    loadNext = false;
                    this.xhrLoad(file, this.transformUrl(file.atlasURL, file), 'text', function (file, xhr) {
                        var json;

                        try
                        {
                            // Try to parse as JSON, if it fails, then it's hopefully XML
                            json = JSON.parse(xhr.responseText);
                        }
                        catch (e) {}

                        if (!!json)
                        {
                            file.atlasType = 'json';
                            this.jsonLoadComplete(file, xhr);
                        }
                        else
                        {
                            file.atlasType = 'xml';
                            this.xmlLoadComplete(file, xhr);
                        }
                    });
                }
                break;

            case 'video':

                if (file.asBlob)
                {
                    try
                    {
                        file.data = xhr.response;
                    }
                    catch (e)
                    {
                        throw new Error("Phaser.Loader. Unable to parse video file as Blob: " + file.key);
                    }
                }

                this.cache.addVideo(file.key, file.url, file.data, file.asBlob);
                break;

            case 'audio':

                if (this.game.sound.usingWebAudio)
                {
                    file.data = xhr.response;

                    this.cache.addSound(file.key, file.url, file.data, true, false);

                    if (file.autoDecode)
                    {
                        this.game.sound.decode(file.key);
                    }
                }
                else
                {
                    this.cache.addSound(file.key, file.url, file.data, false, true);
                }
                break;

            case 'text':
                file.data = xhr.responseText;
                this.cache.addText(file.key, file.url, file.data);
                break;

            case 'shader':
                file.data = xhr.responseText;
                this.cache.addShader(file.key, file.url, file.data);
                break;

            case 'physics':
                var data = JSON.parse(xhr.responseText);
                this.cache.addPhysicsData(file.key, file.url, data, file.format);
                break;

            case 'script':
                file.data = document.createElement('script');
                file.data.language = 'javascript';
                file.data.type = 'text/javascript';
                file.data.defer = false;
                file.data.text = xhr.responseText;
                document.head.appendChild(file.data);
                if (file.callback)
                {
                    file.data = file.callback.call(file.callbackContext, file.key, xhr.responseText);
                }
                break;

            case 'binary':
                if (file.callback)
                {
                    file.data = file.callback.call(file.callbackContext, file.key, xhr.response);
                }
                else
                {
                    file.data = xhr.response;
                }

                this.cache.addBinary(file.key, file.data);

                break;
        }

        if (loadNext)
        {
            this.asyncComplete(file);
        }

    },

    /**
    * Successfully loaded a JSON file - only used for certain types.
    *
    * @method Phaser.Loader#jsonLoadComplete
    * @private
    * @param {object} file - File associated with this request
    * @param {XMLHttpRequest} xhr
    */
    jsonLoadComplete: function (file, xhr) {

        var data = JSON.parse(xhr.responseText);

        if (file.type === 'tilemap')
        {
            this.cache.addTilemap(file.key, file.url, data, file.format);
        }
        else if (file.type === 'bitmapfont')
        {
            this.cache.addBitmapFont(file.key, file.url, file.data, data, file.atlasType, file.xSpacing, file.ySpacing);
        }
        else if (file.type === 'json')
        {
            this.cache.addJSON(file.key, file.url, data);
        }
        else
        {
            this.cache.addTextureAtlas(file.key, file.url, file.data, data, file.format);
        }

        this.asyncComplete(file);
    },

    /**
    * Successfully loaded a CSV file - only used for certain types.
    *
    * @method Phaser.Loader#csvLoadComplete
    * @private
    * @param {object} file - File associated with this request
    * @param {XMLHttpRequest} xhr
    */
    csvLoadComplete: function (file, xhr) {

        var data = xhr.responseText;

        this.cache.addTilemap(file.key, file.url, data, file.format);

        this.asyncComplete(file);

    },

    /**
    * Successfully loaded an XML file - only used for certain types.
    *
    * @method Phaser.Loader#xmlLoadComplete
    * @private
    * @param {object} file - File associated with this request
    * @param {XMLHttpRequest} xhr
    */
    xmlLoadComplete: function (file, xhr) {

        // Always try parsing the content as XML, regardless of actually response type
        var data = xhr.responseText;
        var xml = this.parseXml(data);

        if (!xml)
        {
            var responseType = xhr.responseType || xhr.contentType; // contentType for MS-XDomainRequest
            console.warn('Phaser.Loader - ' + file.key + ': invalid XML (' + responseType + ')');
            this.asyncComplete(file, "invalid XML");
            return;
        }

        if (file.type === 'bitmapfont')
        {
            this.cache.addBitmapFont(file.key, file.url, file.data, xml, file.atlasType, file.xSpacing, file.ySpacing);
        }
        else if (file.type === 'textureatlas')
        {
            this.cache.addTextureAtlas(file.key, file.url, file.data, xml, file.format);
        }
        else if (file.type === 'xml')
        {
            this.cache.addXML(file.key, file.url, xml);
        }

        this.asyncComplete(file);

    },

    /**
    * Parses string data as XML.
    *
    * @method Phaser.Loader#parseXml
    * @private
    * @param {string} data - The XML text to parse
    * @return {?XMLDocument} Returns the xml document, or null if such could not parsed to a valid document.
    */
    parseXml: function (data) {

        var xml;

        try
        {
            if (window['DOMParser'])
            {
                var domparser = new DOMParser();
                xml = domparser.parseFromString(data, "text/xml");
            }
            else
            {
                xml = new ActiveXObject("Microsoft.XMLDOM");
                // Why is this 'false'?
                xml.async = 'false';
                xml.loadXML(data);
            }
        }
        catch (e)
        {
            xml = null;
        }

        if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length)
        {
            return null;
        }
        else
        {
            return xml;
        }

    },

    /**
    * Update the loading sprite progress.
    *
    * @method Phaser.Loader#nextFile
    * @private
    * @param {object} previousFile
    * @param {boolean} success - Whether the previous asset loaded successfully or not.
    */
    updateProgress: function () {

        if (this.preloadSprite)
        {
            if (this.preloadSprite.direction === 0)
            {
                this.preloadSprite.rect.width = Math.floor((this.preloadSprite.width / 100) * this.progress);
            }
            else
            {
                this.preloadSprite.rect.height = Math.floor((this.preloadSprite.height / 100) * this.progress);
            }

            if (this.preloadSprite.sprite)
            {
                this.preloadSprite.sprite.updateCrop();
            }
            else
            {
                //  We seem to have lost our sprite - maybe it was destroyed?
                this.preloadSprite = null;
            }
        }

    },

    /**
    * Returns the number of files that have already been loaded, even if they errored.
    *
    * @method Phaser.Loader#totalLoadedFiles
    * @protected
    * @return {number} The number of files that have already been loaded (even if they errored)
    */
    totalLoadedFiles: function () {

        return this._loadedFileCount;

    },

    /**
    * Returns the number of files still waiting to be processed in the load queue. This value decreases as each file in the queue is loaded.
    *
    * @method Phaser.Loader#totalQueuedFiles
    * @protected
    * @return {number} The number of files that still remain in the load queue.
    */
    totalQueuedFiles: function () {

        return this._totalFileCount - this._loadedFileCount;

    },

    /**
    * Returns the number of asset packs that have already been loaded, even if they errored.
    *
    * @method Phaser.Loader#totalLoadedPacks
    * @protected
    * @return {number} The number of asset packs that have already been loaded (even if they errored)
    */
    totalLoadedPacks: function () {

        return this._totalPackCount;

    },

    /**
    * Returns the number of asset packs still waiting to be processed in the load queue. This value decreases as each pack in the queue is loaded.
    *
    * @method Phaser.Loader#totalQueuedPacks
    * @protected
    * @return {number} The number of asset packs that still remain in the load queue.
    */
    totalQueuedPacks: function () {

        return this._totalPackCount - this._loadedPackCount;

    }

};

/**
* The non-rounded load progress value (from 0.0 to 100.0).
*
* A general indicator of the progress.
* It is possible for the progress to decrease, after `onLoadStart`, if more files are dynamically added.
*
* @name Phaser.Loader#progressFloat
* @property {number}
*/
Object.defineProperty(Phaser.Loader.prototype, "progressFloat", {

    get: function () {
        var progress = (this._loadedFileCount / this._totalFileCount) * 100;
        return Phaser.Math.clamp(progress || 0, 0, 100);
    }

});

/**
* The rounded load progress percentage value (from 0 to 100). See {@link Phaser.Loader#progressFloat}.
*
* @name Phaser.Loader#progress
* @property {integer}
*/
Object.defineProperty(Phaser.Loader.prototype, "progress", {

    get: function () {
        return Math.round(this.progressFloat);
    }

});

Phaser.Loader.prototype.constructor = Phaser.Loader;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Phaser.LoaderParser parses data objects from Phaser.Loader that need more preparation before they can be inserted into the Cache.
*
* @class Phaser.LoaderParser
*/
Phaser.LoaderParser = {

    /**
    * Alias for xmlBitmapFont, for backwards compatibility.
    * 
    * @method Phaser.LoaderParser.bitmapFont
    * @param {object} xml - XML data you want to parse.
    * @param {PIXI.BaseTexture} baseTexture - The BaseTexture this font uses.
    * @param {number} [xSpacing=0] - Additional horizontal spacing between the characters.
    * @param {number} [ySpacing=0] - Additional vertical spacing between the characters.
    * @return {object} The parsed Bitmap Font data.
    */
    bitmapFont: function (xml, baseTexture, xSpacing, ySpacing) {

        return this.xmlBitmapFont(xml, baseTexture, xSpacing, ySpacing);

    },

    /**
    * Parse a Bitmap Font from an XML file.
    *
    * @method Phaser.LoaderParser.xmlBitmapFont
    * @param {object} xml - XML data you want to parse.
    * @param {PIXI.BaseTexture} baseTexture - The BaseTexture this font uses.
    * @param {number} [xSpacing=0] - Additional horizontal spacing between the characters.
    * @param {number} [ySpacing=0] - Additional vertical spacing between the characters.
    * @return {object} The parsed Bitmap Font data.
    */
    xmlBitmapFont: function (xml, baseTexture, xSpacing, ySpacing) {

        var data = {};
        var info = xml.getElementsByTagName('info')[0];
        var common = xml.getElementsByTagName('common')[0];

        data.font = info.getAttribute('face');
        data.size = parseInt(info.getAttribute('size'), 10);
        data.lineHeight = parseInt(common.getAttribute('lineHeight'), 10) + ySpacing;
        data.chars = {};

        var letters = xml.getElementsByTagName('char');

        for (var i = 0; i < letters.length; i++)
        {
            var charCode = parseInt(letters[i].getAttribute('id'), 10);

            data.chars[charCode] = {
                x: parseInt(letters[i].getAttribute('x'), 10),
                y: parseInt(letters[i].getAttribute('y'), 10),
                width: parseInt(letters[i].getAttribute('width'), 10),
                height: parseInt(letters[i].getAttribute('height'), 10),
                xOffset: parseInt(letters[i].getAttribute('xoffset'), 10),
                yOffset: parseInt(letters[i].getAttribute('yoffset'), 10),
                xAdvance: parseInt(letters[i].getAttribute('xadvance'), 10) + xSpacing,
                kerning: {}
            };
        }

        var kernings = xml.getElementsByTagName('kerning');

        for (i = 0; i < kernings.length; i++)
        {
            var first = parseInt(kernings[i].getAttribute('first'), 10);
            var second = parseInt(kernings[i].getAttribute('second'), 10);
            var amount = parseInt(kernings[i].getAttribute('amount'), 10);

            data.chars[second].kerning[first] = amount;
        }

        return this.finalizeBitmapFont(baseTexture, data);

    },

    /**
    * Parse a Bitmap Font from a JSON file.
    *
    * @method Phaser.LoaderParser.jsonBitmapFont
    * @param {object} json - JSON data you want to parse.
    * @param {PIXI.BaseTexture} baseTexture - The BaseTexture this font uses.
    * @param {number} [xSpacing=0] - Additional horizontal spacing between the characters.
    * @param {number} [ySpacing=0] - Additional vertical spacing between the characters.
    * @return {object} The parsed Bitmap Font data.
    */
    jsonBitmapFont: function (json, baseTexture, xSpacing, ySpacing) {

        var data = {
            font: json.font.info._face,
            size: parseInt(json.font.info._size, 10),
            lineHeight: parseInt(json.font.common._lineHeight, 10) + ySpacing,
            chars: {}
        };

        json.font.chars["char"].forEach(

            function parseChar(letter) {

                var charCode = parseInt(letter._id, 10);

                data.chars[charCode] = {
                    x: parseInt(letter._x, 10),
                    y: parseInt(letter._y, 10),
                    width: parseInt(letter._width, 10),
                    height: parseInt(letter._height, 10),
                    xOffset: parseInt(letter._xoffset, 10),
                    yOffset: parseInt(letter._yoffset, 10),
                    xAdvance: parseInt(letter._xadvance, 10) + xSpacing,
                    kerning: {}
                };
            }

        );

        if (json.font.kernings && json.font.kernings.kerning) {

            json.font.kernings.kerning.forEach(

                function parseKerning(kerning) {

                    data.chars[kerning._second].kerning[kerning._first] = parseInt(kerning._amount, 10);

                }

            );

        }

        return this.finalizeBitmapFont(baseTexture, data);

    },

    /**
    * Finalize Bitmap Font parsing.
    *
    * @method Phaser.LoaderParser.finalizeBitmapFont
    * @private
    * @param {PIXI.BaseTexture} baseTexture - The BaseTexture this font uses.
    * @param {object} bitmapFontData - Pre-parsed bitmap font data.
    * @return {object} The parsed Bitmap Font data.
    */
    finalizeBitmapFont: function (baseTexture, bitmapFontData) {

        Object.keys(bitmapFontData.chars).forEach(

            function addTexture(charCode) {

                var letter = bitmapFontData.chars[charCode];

                letter.texture = new PIXI.Texture(baseTexture, new Phaser.Rectangle(letter.x, letter.y, letter.width, letter.height));

            }

        );

        return bitmapFontData;

    }
};

/**
 * @author       Jeremy Dowell <jeremy@codevinsky.com>
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2016 Photon Storm Ltd.
 * @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */

/**
 * Audio Sprites are a combination of audio files and a JSON configuration.
 * The JSON follows the format of that created by https://github.com/tonistiigi/audiosprite
 *
 * @class Phaser.AudioSprite
 * @constructor
 * @param {Phaser.Game} game - Reference to the current game instance.
 * @param {string} key - Asset key for the sound.
 */
Phaser.AudioSprite = function (game, key) {

    /**
    * A reference to the currently running Game.
    * @property {Phaser.Game} game
    */
    this.game = game;

    /**
     * Asset key for the Audio Sprite.
     * @property {string} key
     */
    this.key = key;

    /**
     * JSON audio atlas object.
     * @property {object} config
     */
    this.config = this.game.cache.getJSON(key + '-audioatlas');

    /**
     * If a sound is set to auto play, this holds the marker key of it.
     * @property {string} autoplayKey
     */
    this.autoplayKey = null;

    /**
     * Is a sound set to autoplay or not?
     * @property {boolean} autoplay
     * @default
     */
    this.autoplay = false;

    /**
     * An object containing the Phaser.Sound objects for the Audio Sprite.
     * @property {object} sounds
     */
    this.sounds = {};

    for (var k in this.config.spritemap)
    {
        var marker = this.config.spritemap[k];
        var sound = this.game.add.sound(this.key);
        
        sound.addMarker(k, marker.start, (marker.end - marker.start), null, marker.loop);
        
        this.sounds[k] = sound;
    }

    if (this.config.autoplay)
    {
        this.autoplayKey = this.config.autoplay;
        this.play(this.autoplayKey);
        this.autoplay = this.sounds[this.autoplayKey];
    }

};

Phaser.AudioSprite.prototype = {

    /**
     * Play a sound with the given name.
     * 
     * @method Phaser.AudioSprite#play
     * @param {string} [marker] - The name of sound to play
     * @param {number} [volume=1] - Volume of the sound you want to play. If none is given it will use the volume given to the Sound when it was created (which defaults to 1 if none was specified).
     * @return {Phaser.Sound} This sound instance.
     */
    play: function (marker, volume) {

        if (volume === undefined) { volume = 1; }

        return this.sounds[marker].play(marker, null, volume);

    },

    /**
     * Stop a sound with the given name.
     * 
     * @method Phaser.AudioSprite#stop
     * @param {string} [marker=''] - The name of sound to stop. If none is given it will stop all sounds in the audio sprite.
     */
    stop: function (marker) {

        if (!marker)
        {
            for (var key in this.sounds)
            {
                this.sounds[key].stop();
            }
        }
        else
        {
            this.sounds[marker].stop();
        }

    },

    /**
     * Get a sound with the given name.
     * 
     * @method Phaser.AudioSprite#get
     * @param {string} marker - The name of sound to get.
     * @return {Phaser.Sound} The sound instance.
     */
    get: function(marker) {

        return this.sounds[marker];

    }

};

Phaser.AudioSprite.prototype.constructor = Phaser.AudioSprite;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Sound class constructor.
*
* @class Phaser.Sound
* @constructor
* @param {Phaser.Game} game - Reference to the current game instance.
* @param {string} key - Asset key for the sound.
* @param {number} [volume=1] - Default value for the volume, between 0 and 1.
* @param {boolean} [loop=false] - Whether or not the sound will loop.
*/
Phaser.Sound = function (game, key, volume, loop, connect) {

    if (volume === undefined) { volume = 1; }
    if (loop === undefined) { loop = false; }
    if (connect === undefined) { connect = game.sound.connectToMaster; }

    /**
    * A reference to the currently running Game.
    * @property {Phaser.Game} game
    */
    this.game = game;

    /**
    * @property {string} name - Name of the sound.
    */
    this.name = key;

    /**
    * @property {string} key - Asset key for the sound.
    */
    this.key = key;

    /**
    * @property {boolean} loop - Whether or not the sound or current sound marker will loop.
    */
    this.loop = loop;

    /**
    * @property {object} markers - The sound markers.
    */
    this.markers = {};

    /**
    * @property {AudioContext} context - Reference to the AudioContext instance.
    */
    this.context = null;

    /**
    * @property {boolean} autoplay - Boolean indicating whether the sound should start automatically.
    */
    this.autoplay = false;

    /**
    * @property {number} totalDuration - The total duration of the sound in seconds.
    */
    this.totalDuration = 0;

    /**
    * @property {number} startTime - The time the Sound starts at (typically 0 unless starting from a marker)
    * @default
    */
    this.startTime = 0;

    /**
    * @property {number} currentTime - The current time the sound is at.
    */
    this.currentTime = 0;

    /**
    * @property {number} duration - The duration of the current sound marker in seconds.
    */
    this.duration = 0;

    /**
    * @property {number} durationMS - The duration of the current sound marker in ms.
    */
    this.durationMS = 0;

    /**
    * @property {number} position - The position of the current sound marker.
    */
    this.position = 0;

    /**
    * @property {number} stopTime - The time the sound stopped.
    */
    this.stopTime = 0;

    /**
    * @property {boolean} paused - true if the sound is paused, otherwise false.
    * @default
    */
    this.paused = false;

    /**
    * @property {number} pausedPosition - The position the sound had reached when it was paused.
    */
    this.pausedPosition = 0;

    /**
    * @property {number} pausedTime - The game time at which the sound was paused.
    */
    this.pausedTime = 0;

    /**
    * @property {boolean} isPlaying - true if the sound is currently playing, otherwise false.
    * @default
    */
    this.isPlaying = false;

    /**
    * @property {string} currentMarker - The string ID of the currently playing marker, if any.
    * @default
    */
    this.currentMarker = '';

    /**
    * @property {Phaser.Tween} fadeTween - The tween that fades the audio, set via Sound.fadeIn and Sound.fadeOut.
    */
    this.fadeTween = null;

    /**
    * @property {boolean} pendingPlayback - true if the sound file is pending playback
    * @readonly
    */
    this.pendingPlayback = false;

    /**
    * @property {boolean} override - if true when you play this sound it will always start from the beginning.
    * @default
    */
    this.override = false;

    /**
    * @property {boolean} allowMultiple - This will allow you to have multiple instances of this Sound playing at once. This is only useful when running under Web Audio, and we recommend you implement a local pooling system to not flood the sound channels.
    * @default
    */
    this.allowMultiple = false;

    /**
    * @property {boolean} usingWebAudio - true if this sound is being played with Web Audio.
    * @readonly
    */
    this.usingWebAudio = this.game.sound.usingWebAudio;

    /**
    * @property {boolean} usingAudioTag - true if the sound is being played via the Audio tag.
    */
    this.usingAudioTag = this.game.sound.usingAudioTag;

    /**
    * @property {object} externalNode - If defined this Sound won't connect to the SoundManager master gain node, but will instead connect to externalNode.
    */
    this.externalNode = null;

    /**
    * @property {object} masterGainNode - The master gain node in a Web Audio system.
    */
    this.masterGainNode = null;

    /**
    * @property {object} gainNode - The gain node in a Web Audio system.
    */
    this.gainNode = null;

    /**
    * @property {object} _sound - Internal var.
    * @private
    */
    this._sound = null;

    if (this.usingWebAudio)
    {
        this.context = this.game.sound.context;
        this.masterGainNode = this.game.sound.masterGain;

        if (this.context.createGain === undefined)
        {
            this.gainNode = this.context.createGainNode();
        }
        else
        {
            this.gainNode = this.context.createGain();
        }

        this.gainNode.gain.value = volume * this.game.sound.volume;

        if (connect)
        {
            this.gainNode.connect(this.masterGainNode);
        }
    }
    else if (this.usingAudioTag)
    {
        if (this.game.cache.getSound(key) && this.game.cache.isSoundReady(key))
        {
            this._sound = this.game.cache.getSoundData(key);
            this.totalDuration = 0;

            if (this._sound.duration)
            {
                this.totalDuration = this._sound.duration;
            }
            else
            {
                if(typeof(loop) === "object") {
                    this.totalDuration = loop.totalDuration;
                }
            }
        }
        else
        {
            this.game.cache.onSoundUnlock.add(this.soundHasUnlocked, this);
        }
    }

    /**
    * @property {Phaser.Signal} onDecoded - The onDecoded event is dispatched when the sound has finished decoding (typically for mp3 files)
    */
    this.onDecoded = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onPlay - The onPlay event is dispatched each time this sound is played.
    */
    this.onPlay = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onPause - The onPause event is dispatched when this sound is paused.
    */
    this.onPause = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onResume - The onResume event is dispatched when this sound is resumed from a paused state.
    */
    this.onResume = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onLoop - The onLoop event is dispatched when this sound loops during playback.
    */
    this.onLoop = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onStop - The onStop event is dispatched when this sound stops playback.
    */
    this.onStop = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onMute - The onMute event is dispatched when this sound is muted.
    */
    this.onMute = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onMarkerComplete - The onMarkerComplete event is dispatched when a marker within this sound completes playback.
    */
    this.onMarkerComplete = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onFadeComplete - The onFadeComplete event is dispatched when this sound finishes fading either in or out.
    */
    this.onFadeComplete = new Phaser.Signal();

    /**
    * @property {number} _volume - The global audio volume. A value between 0 (silence) and 1 (full volume).
    * @private
    */
    this._volume = volume;

    /**
    * @property {any} _buffer - Decoded data buffer / Audio tag.
    * @private
    */
    this._buffer = null;

    /**
    * @property {boolean} _muted - Boolean indicating whether the sound is muted or not.
    * @private
    */
    this._muted = false;

    /**
    * @property {number} _tempMarker - Internal marker var.
    * @private
    */
    this._tempMarker = 0;

    /**
    * @property {number} _tempPosition - Internal marker var.
    * @private
    */
    this._tempPosition = 0;

    /**
    * @property {number} _tempVolume - Internal marker var.
    * @private
    */
    this._tempVolume = 0;

    /**
    * @property {number} _tempPause - Internal marker var.
    * @private
    */
    this._tempPause = 0;

    /**
    * @property {number} _muteVolume - Internal cache var.
    * @private
    */
    this._muteVolume = 0;

    /**
    * @property {boolean} _tempLoop - Internal cache var.
    * @private
    */
    this._tempLoop = 0;

    /**
    * @property {boolean} _paused - Was this sound paused via code or a game event?
    * @private
    */
    this._paused = false;

    /**
    * @property {boolean} _onDecodedEventDispatched - Was the onDecoded event dispatched?
    * @private
    */
    this._onDecodedEventDispatched = false;

};

Phaser.Sound.prototype = {

    /**
    * Called automatically when this sound is unlocked.
    * @method Phaser.Sound#soundHasUnlocked
    * @param {string} key - The Phaser.Cache key of the sound file to check for decoding.
    * @protected
    */
    soundHasUnlocked: function (key) {

        if (key === this.key)
        {
            this._sound = this.game.cache.getSoundData(this.key);
            this.totalDuration = this._sound.duration;
        }

    },

    /**
    * Adds a marker into the current Sound. A marker is represented by a unique key and a start time and duration.
    * This allows you to bundle multiple sounds together into a single audio file and use markers to jump between them for playback.
    *
    * @method Phaser.Sound#addMarker
    * @param {string} name - A unique name for this marker, i.e. 'explosion', 'gunshot', etc.
    * @param {number} start - The start point of this marker in the audio file, given in seconds. 2.5 = 2500ms, 0.5 = 500ms, etc.
    * @param {number} [duration=1] - The duration of the marker in seconds. 2.5 = 2500ms, 0.5 = 500ms, etc.
    * @param {number} [volume=1] - The volume the sound will play back at, between 0 (silent) and 1 (full volume).
    * @param {boolean} [loop=false] - Sets if the sound will loop or not.
    */
    addMarker: function (name, start, duration, volume, loop) {

        if (duration === undefined || duration === null) { duration = 1; }
        if (volume === undefined || volume === null) { volume = 1; }
        if (loop === undefined) { loop = false; }

        this.markers[name] = {
            name: name,
            start: start,
            stop: start + duration,
            volume: volume,
            duration: duration,
            durationMS: duration * 1000,
            loop: loop
        };

    },

    /**
    * Removes a marker from the sound.
    * @method Phaser.Sound#removeMarker
    * @param {string} name - The key of the marker to remove.
    */
    removeMarker: function (name) {

        delete this.markers[name];

    },

    /**
    * Called automatically by the AudioContext when the sound stops playing.
    * Doesn't get called if the sound is set to loop or is a section of an Audio Sprite.
    * 
    * @method Phaser.Sound#onEndedHandler
    * @protected
    */
    onEndedHandler: function () {

        this._sound.onended = null;
        this.isPlaying = false;
        this.currentTime = this.durationMS;
        this.stop();

    },

    /**
    * Called automatically by Phaser.SoundManager.
    * @method Phaser.Sound#update
    * @protected
    */
    update: function () {

        if (!this.game.cache.checkSoundKey(this.key))
        {
            this.destroy();
            return;
        }

        if (this.isDecoded && !this._onDecodedEventDispatched)
        {
            this.onDecoded.dispatch(this);
            this._onDecodedEventDispatched = true;
        }

        if (this.pendingPlayback && this.game.cache.isSoundReady(this.key))
        {
            this.pendingPlayback = false;
            this.play(this._tempMarker, this._tempPosition, this._tempVolume, this._tempLoop);
        }

        if (this.isPlaying)
        {
            this.currentTime = this.game.time.time - this.startTime;

            if (this.currentTime >= this.durationMS)
            {
                if (this.usingWebAudio)
                {
                    if (this.loop)
                    {
                        //  won't work with markers, needs to reset the position
                        this.onLoop.dispatch(this);

                        //  Gets reset by the play function
                        this.isPlaying = false;

                        if (this.currentMarker === '')
                        {
                            this.currentTime = 0;
                            this.startTime = this.game.time.time;
                            this.isPlaying = true; // play not called again in this case
                        }
                        else
                        {
                            this.onMarkerComplete.dispatch(this.currentMarker, this);
                            this.play(this.currentMarker, 0, this.volume, true, true);
                        }
                    }
                    else
                    {
                        //  Stop if we're using an audio marker, otherwise we let onended handle it
                        if (this.currentMarker !== '')
                        {
                            this.stop();
                        }
                    }
                }
                else
                {
                    if (this.loop)
                    {
                        this.onLoop.dispatch(this);

                        if (this.currentMarker === '')
                        {
                            this.currentTime = 0;
                            this.startTime = this.game.time.time;
                        }

                        //  Gets reset by the play function
                        this.isPlaying = false;

                        this.play(this.currentMarker, 0, this.volume, true, true);
                    }
                    else
                    {
                        this.stop();
                    }
                }
            }
        }
    },

    /**
     * Loops this entire sound. If you need to loop a section of it then use Sound.play and the marker and loop parameters.
     *
     * @method Phaser.Sound#loopFull
     * @param {number} [volume=1] - Volume of the sound you want to play. If none is given it will use the volume given to the Sound when it was created (which defaults to 1 if none was specified).
     * @return {Phaser.Sound} This sound instance.
     */
    loopFull: function (volume) {

        return this.play(null, 0, volume, true);

    },

    /**
    * Play this sound, or a marked section of it.
    * 
    * @method Phaser.Sound#play
    * @param {string} [marker=''] - If you want to play a marker then give the key here, otherwise leave blank to play the full sound.
    * @param {number} [position=0] - The starting position to play the sound from - this is ignored if you provide a marker.
    * @param {number} [volume=1] - Volume of the sound you want to play. If none is given it will use the volume given to the Sound when it was created (which defaults to 1 if none was specified).
    * @param {boolean} [loop=false] - Loop when finished playing? If not using a marker / audio sprite the looping will be done via the WebAudio loop property, otherwise it's time based.
    * @param {boolean} [forceRestart=true] - If the sound is already playing you can set forceRestart to restart it from the beginning.
    * @return {Phaser.Sound} This sound instance.
    */
    play: function (marker, position, volume, loop, forceRestart) {

        if (marker === undefined || marker === false || marker === null) { marker = ''; }
        if (forceRestart === undefined) { forceRestart = true; }

        if (this.isPlaying && !this.allowMultiple && !forceRestart && !this.override)
        {
            //  Use Restart instead
            return this;
        }

        if (this._sound && this.isPlaying && !this.allowMultiple && (this.override || forceRestart))
        {
            if (this.usingWebAudio)
            {
                if (this._sound.stop === undefined)
                {
                    this._sound.noteOff(0);
                }
                else
                {
                    try {
                        this._sound.stop(0);
                    }
                    catch (e) {
                    }
                }

                if (this.externalNode)
                {
                    this._sound.disconnect(this.externalNode);
                }
                else if (this.gainNode)
                {
                    this._sound.disconnect(this.gainNode);
                }
            }
            else if (this.usingAudioTag)
            {
                this._sound.pause();
                this._sound.currentTime = 0;
            }

            this.isPlaying = false;
        }

        if (marker === '' && Object.keys(this.markers).length > 0)
        {
            //  If they didn't specify a marker but this is an audio sprite, 
            //  we should never play the entire thing
            return this;
        }

        if (marker !== '')
        {
            if (this.markers[marker])
            {
                this.currentMarker = marker;

                //  Playing a marker? Then we default to the marker values
                this.position = this.markers[marker].start;
                this.volume = this.markers[marker].volume;
                this.loop = this.markers[marker].loop;
                this.duration = this.markers[marker].duration;
                this.durationMS = this.markers[marker].durationMS;

                if (typeof volume !== 'undefined')
                {
                    this.volume = volume;
                }

                if (typeof loop !== 'undefined')
                {
                    this.loop = loop;
                }

                this._tempMarker = marker;
                this._tempPosition = this.position;
                this._tempVolume = this.volume;
                this._tempLoop = this.loop;
            }
            else
            {
                console.warn("Phaser.Sound.play: audio marker " + marker + " doesn't exist");
                return this;
            }
        }
        else
        {
            position = position || 0;

            if (volume === undefined) { volume = this._volume; }
            if (loop === undefined) { loop = this.loop; }

            this.position = Math.max(0, position);
            this.volume = volume;
            this.loop = loop;
            this.duration = 0;
            this.durationMS = 0;

            this._tempMarker = marker;
            this._tempPosition = position;
            this._tempVolume = volume;
            this._tempLoop = loop;
        }

        if (this.usingWebAudio)
        {
            //  Does the sound need decoding?
            if (this.game.cache.isSoundDecoded(this.key))
            {
                this._sound = this.context.createBufferSource();

                if (this.externalNode)
                {
                    this._sound.connect(this.externalNode);
                }
                else
                {
                    this._sound.connect(this.gainNode);
                }

                this._buffer = this.game.cache.getSoundData(this.key);
                this._sound.buffer = this._buffer;

                if (this.loop && marker === '')
                {
                    this._sound.loop = true;
                }

                if (!this.loop && marker === '')
                {
                    this._sound.onended = this.onEndedHandler.bind(this);
                }

                this.totalDuration = this._sound.buffer.duration;

                if (this.duration === 0)
                {
                    this.duration = this.totalDuration;
                    this.durationMS = Math.ceil(this.totalDuration * 1000);
                }

                //  Useful to cache this somewhere perhaps?
                if (this._sound.start === undefined)
                {
                    this._sound.noteGrainOn(0, this.position, this.duration);
                }
                else
                {
                    if (this.loop && marker === '')
                    {
                        this._sound.start(0, 0);
                    }
                    else
                    {
                        this._sound.start(0, this.position, this.duration);
                    }
                }

                this.isPlaying = true;
                this.startTime = this.game.time.time;
                this.currentTime = 0;
                this.stopTime = this.startTime + this.durationMS;
                this.onPlay.dispatch(this);
            }
            else
            {
                this.pendingPlayback = true;

                if (this.game.cache.getSound(this.key) && this.game.cache.getSound(this.key).isDecoding === false)
                {
                    this.game.sound.decode(this.key, this);
                }
            }
        }
        else
        {
            if (this.game.cache.getSound(this.key) && this.game.cache.getSound(this.key).locked)
            {
                // this.game.cache.reloadSound(this.key);

                this.game.cache.getSound(this.key).locked = false;
                this.game.cache.onSoundUnlock.dispatch(key);

                this.pendingPlayback = true;
            }
            // else
            {
                if (this._sound && !this.paused)
                {
                    this._sound.play();
                    //  This doesn't become available until you call play(), wonderful ...
                    this.totalDuration = this._sound.duration || this.totalDuration || undefined;

                    if (this.duration === 0)
                    {
                        this.duration = this.totalDuration;
                        this.durationMS = this.totalDuration * 1000;
                    }

                    this._sound.currentTime = this.position;
                    this._sound.muted = this._muted;

                    if (this._muted || this.game.sound.mute)
                    {
                        this._sound.volume = 0;
                    }
                    else
                    {
                        this._sound.volume = this._volume;
                    }

                    this.isPlaying = true;
                    this.startTime = this.game.time.time;
                    this.currentTime = 0;
                    this.stopTime = this.startTime + this.durationMS;

                    this.onPlay.dispatch(this);
                }
                else
                {
                    this.pendingPlayback = true;
                }
            }
        }

        return this;

    },

    /**
    * Restart the sound, or a marked section of it.
    *
    * @method Phaser.Sound#restart
    * @param {string} [marker=''] - If you want to play a marker then give the key here, otherwise leave blank to play the full sound.
    * @param {number} [position=0] - The starting position to play the sound from - this is ignored if you provide a marker.
    * @param {number} [volume=1] - Volume of the sound you want to play.
    * @param {boolean} [loop=false] - Loop when it finished playing?
    */
    restart: function (marker, position, volume, loop) {

        marker = marker || '';
        position = position || 0;
        volume = volume || 1;
        if (loop === undefined) { loop = false; }

        this.play(marker, position, volume, loop, true);

    },

    /**
    * Pauses the sound.
    *
    * @method Phaser.Sound#pause
    */
    pause: function () {

        if (this.isPlaying && this._sound)
        {
            this.paused = true;
            this.pausedPosition = this.currentTime;
            this.pausedTime = this.game.time.time;
            this._tempPause = this._sound.currentTime;
            this.onPause.dispatch(this);
            this.stop();
        }

    },

    /**
    * Resumes the sound.
    *
    * @method Phaser.Sound#resume
    */
    resume: function () {

        if (this.paused && this._sound)
        {
            if (this.usingWebAudio)
            {
                var p = Math.max(0, this.position + (this.pausedPosition / 1000));

                this._sound = this.context.createBufferSource();
                this._sound.buffer = this._buffer;

                if (this.externalNode)
                {
                    this._sound.connect(this.externalNode);
                }
                else
                {
                    this._sound.connect(this.gainNode);
                }

                if (this.loop)
                {
                    this._sound.loop = true;
                }

                if (!this.loop && this.currentMarker === '')
                {
                    this._sound.onended = this.onEndedHandler.bind(this);
                }

                var duration = this.duration - (this.pausedPosition / 1000);

                if (this._sound.start === undefined)
                {
                    this._sound.noteGrainOn(0, p, duration);
                    //this._sound.noteOn(0); // the zero is vitally important, crashes iOS6 without it
                }
                else
                {
                    if (this.loop && this.game.device.chrome)
                    {
                        //  Handle chrome bug: https://code.google.com/p/chromium/issues/detail?id=457099
                        if (this.game.device.chromeVersion === 42)
                        {
                            this._sound.start(0);
                        }
                        else
                        {
                            this._sound.start(0, p);
                        }
                    }
                    else
                    {
                        this._sound.start(0, p, duration);
                    }
                }
            }
            else
            {
                this._sound.currentTime = this._tempPause;
                this._sound.play();
            }

            this.isPlaying = true;
            this.paused = false;
            this.startTime += (this.game.time.time - this.pausedTime);
            this.onResume.dispatch(this);
        }

    },

    /**
    * Stop playing this sound.
    *
    * @method Phaser.Sound#stop
    */
    stop: function () {

        if (this.isPlaying && this._sound)
        {
            if (this.usingWebAudio)
            {
                if (this._sound.stop === undefined)
                {
                    this._sound.noteOff(0);
                }
                else
                {
                    try {
                        this._sound.stop(0);
                    }
                    catch (e)
                    {
                        //  Thanks Android 4.4
                    }
                }

                if (this.externalNode)
                {
                    this._sound.disconnect(this.externalNode);
                }
                else if (this.gainNode)
                {
                    this._sound.disconnect(this.gainNode);
                }
            }
            else if (this.usingAudioTag)
            {
                this._sound.pause();
                this._sound.currentTime = 0;
            }
        }

        this.pendingPlayback = false;
        this.isPlaying = false;

        if (!this.paused)
        {
            var prevMarker = this.currentMarker;

            if (this.currentMarker !== '')
            {
                this.onMarkerComplete.dispatch(this.currentMarker, this);
            }

            this.currentMarker = '';

            if (this.fadeTween !== null)
            {
                this.fadeTween.stop();
            }

            this.onStop.dispatch(this, prevMarker);
        }

    },

    /**
    * Starts this sound playing (or restarts it if already doing so) and sets the volume to zero.
    * Then increases the volume from 0 to 1 over the duration specified.
    *
    * At the end of the fade Sound.onFadeComplete is dispatched with this Sound object as the first parameter,
    * and the final volume (1) as the second parameter.
    *
    * @method Phaser.Sound#fadeIn
    * @param {number} [duration=1000] - The time in milliseconds over which the Sound should fade in.
    * @param {boolean} [loop=false] - Should the Sound be set to loop? Note that this doesn't cause the fade to repeat.
    * @param {string} [marker=(current marker)] - The marker to start at; defaults to the current (last played) marker. To start playing from the beginning specify specify a marker of `''`.
    */
    fadeIn: function (duration, loop, marker) {

        if (loop === undefined) { loop = false; }
        if (marker === undefined) { marker = this.currentMarker; }

        if (this.paused)
        {
            return;
        }

        this.play(marker, 0, 0, loop);

        this.fadeTo(duration, 1);

    },
    
    /**
    * Decreases the volume of this Sound from its current value to 0 over the duration specified.
    * At the end of the fade Sound.onFadeComplete is dispatched with this Sound object as the first parameter,
    * and the final volume (0) as the second parameter.
    *
    * @method Phaser.Sound#fadeOut
    * @param {number} [duration=1000] - The time in milliseconds over which the Sound should fade out.
    */
    fadeOut: function (duration) {

        this.fadeTo(duration, 0);

    },

    /**
    * Fades the volume of this Sound from its current value to the given volume over the duration specified.
    * At the end of the fade Sound.onFadeComplete is dispatched with this Sound object as the first parameter, 
    * and the final volume (volume) as the second parameter.
    *
    * @method Phaser.Sound#fadeTo
    * @param {number} [duration=1000] - The time in milliseconds during which the Sound should fade out.
    * @param {number} [volume] - The volume which the Sound should fade to. This is a value between 0 and 1.
    */
    fadeTo: function (duration, volume) {

        if (!this.isPlaying || this.paused || volume === this.volume)
        {
            return;
        }

        if (duration === undefined) { duration = 1000; }

        if (volume === undefined)
        {
            console.warn("Phaser.Sound.fadeTo: No Volume Specified.");
            return;
        }

        this.fadeTween = this.game.add.tween(this).to( { volume: volume }, duration, Phaser.Easing.Linear.None, true);

        this.fadeTween.onComplete.add(this.fadeComplete, this);

    },

    /**
    * Internal handler for Sound.fadeIn, Sound.fadeOut and Sound.fadeTo.
    *
    * @method Phaser.Sound#fadeComplete
    * @private
    */
    fadeComplete: function () {

        this.onFadeComplete.dispatch(this, this.volume);

        if (this.volume === 0)
        {
            this.stop();
        }

    },

    /**
    * Called automatically by SoundManager.volume.
    *
    * Sets the volume of AudioTag Sounds as a percentage of the Global Volume.
    *
    * You should not normally call this directly.
    *
    * @method Phaser.Sound#updateGlobalVolume
    * @protected
    * @param {float} globalVolume - The global SoundManager volume.
    */
    updateGlobalVolume: function (globalVolume) {

        //  this._volume is the % of the global volume this sound should be played at

        if (this.usingAudioTag && this._sound)
        {
            this._sound.volume = globalVolume * this._volume;
        }

    },

    /**
    * Destroys this sound and all associated events and removes it from the SoundManager.
    *
    * @method Phaser.Sound#destroy
    * @param {boolean} [remove=true] - If true this Sound is automatically removed from the SoundManager.
    */
    destroy: function (remove) {

        if (remove === undefined) { remove = true; }

        this.stop();

        if (remove)
        {
            this.game.sound.remove(this);
        }
        else
        {
            this.markers = {};
            this.context = null;
            this._buffer = null;
            this.externalNode = null;

            this.onDecoded.dispose();
            this.onPlay.dispose();
            this.onPause.dispose();
            this.onResume.dispose();
            this.onLoop.dispose();
            this.onStop.dispose();
            this.onMute.dispose();
            this.onMarkerComplete.dispose();
        }

    }

};

Phaser.Sound.prototype.constructor = Phaser.Sound;

/**
* @name Phaser.Sound#isDecoding
* @property {boolean} isDecoding - Returns true if the sound file is still decoding.
* @readonly
*/
Object.defineProperty(Phaser.Sound.prototype, "isDecoding", {

    get: function () {
        return this.game.cache.getSound(this.key).isDecoding;
    }

});

/**
* @name Phaser.Sound#isDecoded
* @property {boolean} isDecoded - Returns true if the sound file has decoded.
* @readonly
*/
Object.defineProperty(Phaser.Sound.prototype, "isDecoded", {

    get: function () {
        return this.game.cache.isSoundDecoded(this.key);
    }

});

/**
* @name Phaser.Sound#mute
* @property {boolean} mute - Gets or sets the muted state of this sound.
*/
Object.defineProperty(Phaser.Sound.prototype, "mute", {

    get: function () {

        return (this._muted || this.game.sound.mute);

    },

    set: function (value) {

        value = value || false;

        if (value === this._muted)
        {
            return;
        }

        if (value)
        {
            this._muted = true;
            this._muteVolume = this._tempVolume;

            if (this.usingWebAudio)
            {
                this.gainNode.gain.value = 0;
            }
            else if (this.usingAudioTag && this._sound)
            {
                this._sound.volume = 0;
            }
        }
        else
        {
            this._muted = false;

            if (this.usingWebAudio)
            {
                this.gainNode.gain.value = this._muteVolume;
            }
            else if (this.usingAudioTag && this._sound)
            {
                this._sound.volume = this._muteVolume;
            }
        }

        this.onMute.dispatch(this);

    }

});

/**
* @name Phaser.Sound#volume
* @property {number} volume - Gets or sets the volume of this sound, a value between 0 and 1. The value given is clamped to the range 0 to 1.
*/
Object.defineProperty(Phaser.Sound.prototype, "volume", {

    get: function () {
        return this._volume;
    },

    set: function (value) {

        //  Causes an Index size error in Firefox if you don't clamp the value
        if (this.game.device.firefox && this.usingAudioTag)
        {
            value = this.game.math.clamp(value, 0, 1);
        }

        if (this._muted)
        {
            this._muteVolume = value;
            return;
        }

        this._tempVolume = value;
        this._volume = value;

        if (this.usingWebAudio)
        {
            this.gainNode.gain.value = value;
        }
        else if (this.usingAudioTag && this._sound)
        {
            this._sound.volume = value;
        }
    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Sound Manager is responsible for playing back audio via either the Legacy HTML Audio tag or via Web Audio if the browser supports it.
* Note: On Firefox 25+ on Linux if you have media.gstreamer disabled in about:config then it cannot play back mp3 or m4a files.
* The audio file type and the encoding of those files are extremely important. Not all browsers can play all audio formats.
* There is a good guide to what's supported here: http://hpr.dogphilosophy.net/test/
*
* If you are reloading a Phaser Game on a page that never properly refreshes (such as in an AngularJS project) then you will quickly run out
* of AudioContext nodes. If this is the case create a global var called PhaserGlobal on the window object before creating the game. The active
* AudioContext will then be saved to window.PhaserGlobal.audioContext when the Phaser game is destroyed, and re-used when it starts again.
*
* Mobile warning: There are some mobile devices (certain iPad 2 and iPad Mini revisions) that cannot play 48000 Hz audio.
* When they try to play the audio becomes extremely distorted and buzzes, eventually crashing the sound system.
* The solution is to use a lower encoding rate such as 44100 Hz. Sometimes the audio context will
* be created with a sampleRate of 48000. If this happens and audio distorts you should re-create the context.
*
* @class Phaser.SoundManager
* @constructor
* @param {Phaser.Game} game - Reference to the current game instance.
*/
Phaser.SoundManager = function (game) {

    /**
    * @property {Phaser.Game} game - Local reference to game.
    */
    this.game = game;

    /**
    * @property {Phaser.Signal} onSoundDecode - The event dispatched when a sound decodes (typically only for mp3 files)
    */
    this.onSoundDecode = new Phaser.Signal();

    /**
    * This signal is dispatched whenever the global volume changes. The new volume is passed as the only parameter to your callback.
    * @property {Phaser.Signal} onVolumeChange
    */
    this.onVolumeChange = new Phaser.Signal();

    /**
    * This signal is dispatched when the SoundManager is globally muted, either directly via game code or as a result of the game pausing.
    * @property {Phaser.Signal} onMute
    */
    this.onMute = new Phaser.Signal();

    /**
    * This signal is dispatched when the SoundManager is globally un-muted, either directly via game code or as a result of the game resuming from a pause.
    * @property {Phaser.Signal} onUnMute
    */
    this.onUnMute = new Phaser.Signal();

    /**
    * @property {AudioContext} context - The AudioContext being used for playback.
    * @default
    */
    this.context = null;

    /**
    * @property {boolean} usingWebAudio - True the SoundManager and device are both using Web Audio.
    * @readonly
    */
    this.usingWebAudio = false;

    /**
    * @property {boolean} usingAudioTag - True the SoundManager and device are both using the Audio tag instead of Web Audio.
    * @readonly
    */
    this.usingAudioTag = false;

    /**
    * @property {boolean} noAudio - True if audio been disabled via the PhaserGlobal (useful if you need to use a 3rd party audio library) or the device doesn't support any audio.
    * @default
    */
    this.noAudio = false;

    /**
    * @property {boolean} connectToMaster - Used in conjunction with Sound.externalNode this allows you to stop a Sound node being connected to the SoundManager master gain node.
    * @default
    */
    this.connectToMaster = true;

    /**
    * @property {boolean} touchLocked - true if the audio system is currently locked awaiting a touch event.
    * @default
    */
    this.touchLocked = false;

    /**
    * @property {number} channels - The number of audio channels to use in playback.
    * @default
    */
    this.channels = 32;

    /**
    * Set to true to have all sound muted when the Phaser game pauses (such as on loss of focus),
    * or set to false to keep audio playing, regardless of the game pause state. You may need to
    * do this should you wish to control audio muting via external DOM buttons or similar.
    * @property {boolean} muteOnPause 
    * @default
    */
    this.muteOnPause = true;

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
    * @property {AudioContext} _unlockSource - Internal unlock tracking var.
    * @private
    * @default
    */
    this._unlockSource = null;

    /**
    * @property {number} _volume - The global audio volume. A value between 0 (silence) and 1 (full volume).
    * @private
    * @default
    */
    this._volume = 1;

    /**
    * @property {array} _sounds - An array containing all the sounds
    * @private
    */
    this._sounds = [];

    /**
    * @property {Phaser.ArraySet} _watchList - An array set containing all the sounds being monitored for decoding status.
    * @private
    */
    this._watchList = new Phaser.ArraySet();

    /**
    * @property {boolean} _watching - Is the SoundManager monitoring the watchList?
    * @private
    */
    this._watching = false;

    /**
    * @property {function} _watchCallback - The callback to invoke once the watchlist is clear.
    * @private
    */
    this._watchCallback = null;

    /**
    * @property {object} _watchContext - The context in which to call the watchlist callback.
    * @private
    */
    this._watchContext = null;

};

Phaser.SoundManager.prototype = {

    /**
    * Initialises the sound manager.
    * @method Phaser.SoundManager#boot
    * @protected
    */
    boot: function () {

        if (this.game.device.iOS && this.game.device.webAudio === false)
        {
            this.channels = 1;
        }

        //  PhaserGlobal overrides
        if (window['PhaserGlobal'])
        {
            //  Check to see if all audio playback is disabled (i.e. handled by a 3rd party class)
            if (window['PhaserGlobal'].disableAudio === true)
            {
                this.noAudio = true;
                this.touchLocked = false;
                return;
            }

            //  Check if the Web Audio API is disabled (for testing Audio Tag playback during development)
            if (window['PhaserGlobal'].disableWebAudio === true)
            {
                this.usingAudioTag = true;
                this.touchLocked = false;
                return;
            }
        }

        if (window['PhaserGlobal'] && window['PhaserGlobal'].audioContext)
        {
            this.context = window['PhaserGlobal'].audioContext;
        }
        else
        {
            if (!!window['AudioContext'])
            {
                try {
                    this.context = new window['AudioContext']();
                } catch (error) {
                    this.context = null;
                    this.usingWebAudio = false;
                    this.touchLocked = false;
                }
            }
            else if (!!window['webkitAudioContext'])
            {
                try {
                    this.context = new window['webkitAudioContext']();
                } catch (error) {
                    this.context = null;
                    this.usingWebAudio = false;
                    this.touchLocked = false;
                }
            }
        }

        if (this.context === null)
        {
            //  No Web Audio support - how about legacy Audio?
            if (window['Audio'] === undefined)
            {
                this.noAudio = true;
                return;
            }
            else
            {
                this.usingAudioTag = true;
            }
        }
        else
        {
            this.usingWebAudio = true;

            if (this.context.createGain === undefined)
            {
                this.masterGain = this.context.createGainNode();
            }
            else
            {
                this.masterGain = this.context.createGain();
            }

            this.masterGain.gain.value = 1;
            this.masterGain.connect(this.context.destination);
        }

        if (!this.noAudio)
        {
            //  On mobile we need a native touch event before we can play anything, so capture it here
            if (!this.game.device.cocoonJS && this.game.device.iOS || (window['PhaserGlobal'] && window['PhaserGlobal'].fakeiOSTouchLock))
            {
                this.setTouchLock();
            }
        }

    },

    /**
    * Sets the Input Manager touch callback to be SoundManager.unlock.
    * Required for iOS audio device unlocking. Mostly just used internally.
    *
    * @method Phaser.SoundManager#setTouchLock
    */
    setTouchLock: function () {

        if (this.noAudio || (window['PhaserGlobal'] && window['PhaserGlobal'].disableAudio === true))
        {
            return;
        }

        if (this.game.device.iOSVersion > 8)
        {
            this.game.input.touch.addTouchLockCallback(this.unlock, this, true);
        }
        else
        {
            this.game.input.touch.addTouchLockCallback(this.unlock, this);
        }

        this.touchLocked = true;

    },

    /**
    * Enables the audio, usually after the first touch.
    *
    * @method Phaser.SoundManager#unlock
    * @return {boolean} True if the callback should be removed, otherwise false.
    */
    unlock: function () {

        if (this.noAudio || !this.touchLocked || this._unlockSource !== null)
        {
            return true;
        }

        //  Global override (mostly for Audio Tag testing)
        if (this.usingAudioTag)
        {
            this.touchLocked = false;
            this._unlockSource = null;
        }
        else if (this.usingWebAudio)
        {
            // Create empty buffer and play it
            // The SoundManager.update loop captures the state of it and then resets touchLocked to false

            var buffer = this.context.createBuffer(1, 1, 22050);
            this._unlockSource = this.context.createBufferSource();
            this._unlockSource.buffer = buffer;
            this._unlockSource.connect(this.context.destination);

            if (this._unlockSource.start === undefined)
            {
                this._unlockSource.noteOn(0);
            }
            else
            {
                this._unlockSource.start(0);
            }
        }

        //  We can remove the event because we've done what we needed (started the unlock sound playing)
        return true;

    },

    /**
    * Stops all the sounds in the game.
    *
    * @method Phaser.SoundManager#stopAll
    */
    stopAll: function () {

        if (this.noAudio)
        {
            return;
        }

        for (var i = 0; i < this._sounds.length; i++)
        {
            if (this._sounds[i])
            {
                this._sounds[i].stop();
            }
        }

    },

    /**
    * Pauses all the sounds in the game.
    *
    * @method Phaser.SoundManager#pauseAll
    */
    pauseAll: function () {

        if (this.noAudio)
        {
            return;
        }

        for (var i = 0; i < this._sounds.length; i++)
        {
            if (this._sounds[i])
            {
                this._sounds[i].pause();
            }
        }

    },

    /**
    * Resumes every sound in the game.
    *
    * @method Phaser.SoundManager#resumeAll
    */
    resumeAll: function () {

        if (this.noAudio)
        {
            return;
        }

        for (var i = 0; i < this._sounds.length; i++)
        {
            if (this._sounds[i])
            {
                this._sounds[i].resume();
            }
        }

    },

    /**
    * Decode a sound by its asset key.
    *
    * @method Phaser.SoundManager#decode
    * @param {string} key - Assets key of the sound to be decoded.
    * @param {Phaser.Sound} [sound] - Its buffer will be set to decoded data.
    */
    decode: function (key, sound) {

        sound = sound || null;

        var soundData = this.game.cache.getSoundData(key);

        if (soundData)
        {
            if (this.game.cache.isSoundDecoded(key) === false)
            {
                this.game.cache.updateSound(key, 'isDecoding', true);

                var _this = this;

                try {
                    this.context.decodeAudioData(soundData, function (buffer) {

                        if (buffer)
                        {
                            _this.game.cache.decodedSound(key, buffer);
                            _this.onSoundDecode.dispatch(key, sound);
                        }
                    });
                }
                catch (e) {}
            }
        }

    },

    /**
     * This method allows you to give the SoundManager a list of Sound files, or keys, and a callback.
     * Once all of the Sound files have finished decoding the callback will be invoked.
     * The amount of time spent decoding depends on the codec used and file size.
     * If all of the files given have already decoded the callback is triggered immediately.
     *
     * @method Phaser.SoundManager#setDecodedCallback
     * @param {string|array} files - An array containing either Phaser.Sound objects or their key strings as found in the Phaser.Cache.
     * @param {Function} callback - The callback which will be invoked once all files have finished decoding.
     * @param {Object} callbackContext - The context in which the callback will run.
     */
    setDecodedCallback: function (files, callback, callbackContext) {

        if (typeof files === 'string')
        {
            files = [ files ];
        }

        this._watchList.reset();

        for (var i = 0; i < files.length; i++)
        {
            if (files[i] instanceof Phaser.Sound)
            {
                if (!this.game.cache.isSoundDecoded(files[i].key))
                {
                    this._watchList.add(files[i].key);
                }
            }
            else if (!this.game.cache.isSoundDecoded(files[i]))
            {
                this._watchList.add(files[i]);
            }
        }

        //  All decoded already?
        if (this._watchList.total === 0)
        {
            this._watching = false;
            callback.call(callbackContext);
        }
        else
        {
            this._watching = true;
            this._watchCallback = callback;
            this._watchContext = callbackContext;
        }

    },

    /**
    * Updates every sound in the game, checks for audio unlock on mobile and monitors the decoding watch list.
    *
    * @method Phaser.SoundManager#update
    * @protected
    */
    update: function () {

        if (this.noAudio)
        {
            return;
        }

        if (this.touchLocked && this._unlockSource !== null && (this._unlockSource.playbackState === this._unlockSource.PLAYING_STATE || this._unlockSource.playbackState === this._unlockSource.FINISHED_STATE))
        {
            this.touchLocked = false;
            this._unlockSource = null;
        }

        for (var i = 0; i < this._sounds.length; i++)
        {
            this._sounds[i].update();
        }

        if (this._watching)
        {
            var key = this._watchList.first;

            while (key)
            {
                if (this.game.cache.isSoundDecoded(key))
                {
                    this._watchList.remove(key);
                }

                key = this._watchList.next;
            }

            if (this._watchList.total === 0)
            {
                this._watching = false;
                this._watchCallback.call(this._watchContext);
            }
        }

    },

    /**
    * Adds a new Sound into the SoundManager.
    *
    * @method Phaser.SoundManager#add
    * @param {string} key - Asset key for the sound.
    * @param {number} [volume=1] - Default value for the volume.
    * @param {boolean} [loop=false] - Whether or not the sound will loop.
    * @param {boolean} [connect=true] - Controls if the created Sound object will connect to the master gainNode of the SoundManager when running under WebAudio.
    * @return {Phaser.Sound} The new sound instance.
    */
    add: function (key, volume, loop, connect) {

        if (volume === undefined) { volume = 1; }
        if (loop === undefined) { loop = false; }
        if (connect === undefined) { connect = this.connectToMaster; }

        var sound = new Phaser.Sound(this.game, key, volume, loop, connect);

        this._sounds.push(sound);

        return sound;

    },

    /**
     * Adds a new AudioSprite into the SoundManager.
     *
     * @method Phaser.SoundManager#addSprite
     * @param {string} key - Asset key for the sound.
     * @return {Phaser.AudioSprite} The new AudioSprite instance.
     */
    addSprite: function(key) {

        var audioSprite = new Phaser.AudioSprite(this.game, key);

        return audioSprite;

    },

    /**
    * Removes a Sound from the SoundManager. The removed Sound is destroyed before removal.
    *
    * @method Phaser.SoundManager#remove
    * @param {Phaser.Sound} sound - The sound object to remove.
    * @return {boolean} True if the sound was removed successfully, otherwise false.
    */
    remove: function (sound) {

        var i = this._sounds.length;

        while (i--)
        {
            if (this._sounds[i] === sound)
            {
                this._sounds[i].destroy(false);
                this._sounds.splice(i, 1);
                return true;
            }
        }

        return false;

    },

    /**
    * Removes all Sounds from the SoundManager that have an asset key matching the given value.
    * The removed Sounds are destroyed before removal.
    *
    * @method Phaser.SoundManager#removeByKey
    * @param {string} key - The key to match when removing sound objects.
    * @return {number} The number of matching sound objects that were removed.
    */
    removeByKey: function (key) {

        var i = this._sounds.length;
        var removed = 0;

        while (i--)
        {
            if (this._sounds[i].key === key)
            {
                this._sounds[i].destroy(false);
                this._sounds.splice(i, 1);
                removed++;
            }
        }

        return removed;

    },

    /**
    * Adds a new Sound into the SoundManager and starts it playing.
    *
    * @method Phaser.SoundManager#play
    * @param {string} key - Asset key for the sound.
    * @param {number} [volume=1] - Default value for the volume.
    * @param {boolean} [loop=false] - Whether or not the sound will loop.
    * @return {Phaser.Sound} The new sound instance.
    */
    play: function (key, volume, loop) {

        if (this.noAudio)
        {
            return;
        }

        var sound = this.add(key, volume, loop);

        sound.play();

        return sound;

    },

    /**
    * Internal mute handler called automatically by the SoundManager.mute setter.
    *
    * @method Phaser.SoundManager#setMute
    * @private
    */
    setMute: function () {

        if (this._muted)
        {
            return;
        }

        this._muted = true;

        if (this.usingWebAudio)
        {
            this._muteVolume = this.masterGain.gain.value;
            this.masterGain.gain.value = 0;
        }

        //  Loop through sounds
        for (var i = 0; i < this._sounds.length; i++)
        {
            if (this._sounds[i].usingAudioTag)
            {
                this._sounds[i].mute = true;
            }
        }

        this.onMute.dispatch();

    },

    /**
    * Internal mute handler called automatically by the SoundManager.mute setter.
    *
    * @method Phaser.SoundManager#unsetMute
    * @private
    */
    unsetMute: function () {

        if (!this._muted || this._codeMuted)
        {
            return;
        }

        this._muted = false;

        if (this.usingWebAudio)
        {
            this.masterGain.gain.value = this._muteVolume;
        }

        //  Loop through sounds
        for (var i = 0; i < this._sounds.length; i++)
        {
            if (this._sounds[i].usingAudioTag)
            {
                this._sounds[i].mute = false;
            }
        }

        this.onUnMute.dispatch();

    },

    /**
    * Stops all the sounds in the game, then destroys them and finally clears up any callbacks.
    *
    * @method Phaser.SoundManager#destroy
    */
    destroy: function () {

        this.stopAll();

        for (var i = 0; i < this._sounds.length; i++)
        {
            if (this._sounds[i])
            {
                this._sounds[i].destroy();
            }
        }

        this._sounds = [];

        this.onSoundDecode.dispose();

        if (this.context)
        {
            if (window['PhaserGlobal'])
            {
                //  Store this in the PhaserGlobal window var, if set, to allow for re-use if the game is created again without the page refreshing
                window['PhaserGlobal'].audioContext = this.context;
            }
            else
            {
                if (this.context.close)
                {
                    this.context.close();
                }
            }
        }

    }

};

Phaser.SoundManager.prototype.constructor = Phaser.SoundManager;

/**
* @name Phaser.SoundManager#mute
* @property {boolean} mute - Gets or sets the muted state of the SoundManager. This effects all sounds in the game.
*/
Object.defineProperty(Phaser.SoundManager.prototype, "mute", {

    get: function () {

        return this._muted;

    },

    set: function (value) {

        value = value || false;

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
* @name Phaser.SoundManager#volume
* @property {number} volume - Gets or sets the global volume of the SoundManager, a value between 0 and 1. The value given is clamped to the range 0 to 1.
*/
Object.defineProperty(Phaser.SoundManager.prototype, "volume", {

    get: function () {

        return this._volume;

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

        if (this._volume !== value)
        {
            this._volume = value;

            if (this.usingWebAudio)
            {
                this.masterGain.gain.value = value;
            }
            else
            {
                //  Loop through the sound cache and change the volume of all html audio tags
                for (var i = 0; i < this._sounds.length; i++)
                {
                    if (this._sounds[i].usingAudioTag)
                    {
                        this._sounds[i].updateGlobalVolume(value);
                    }
                }
            }

            this.onVolumeChange.dispatch(value);
        }

    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* @classdesc
* The ScaleManager object handles the the scaling, resizing, and alignment of the
* Game size and the game Display canvas.
*
* The Game size is the logical size of the game; the Display canvas has size as an HTML element.
*
* The calculations of these are heavily influenced by the bounding Parent size which is the computed
* dimensions of the Display canvas's Parent container/element - the _effective CSS rules of the
* canvas's Parent element play an important role_ in the operation of the ScaleManager. 
*
* The Display canvas - or Game size, depending {@link #scaleMode} - is updated to best utilize the Parent size.
* When in Fullscreen mode or with {@link #parentIsWindow} the Parent size is that of the visual viewport (see {@link Phaser.ScaleManager#getParentBounds getParentBounds}).
*
* Parent and Display canvas containment guidelines:
*
* - Style the Parent element (of the game canvas) to control the Parent size and
*   thus the Display canvas's size and layout.
*
* - The Parent element's CSS styles should _effectively_ apply maximum (and minimum) bounding behavior.
*
* - The Parent element should _not_ apply a padding as this is not accounted for.
*   If a padding is required apply it to the Parent's parent or apply a margin to the Parent.
*   If you need to add a border, margin or any other CSS around your game container, then use a parent element and
*   apply the CSS to this instead, otherwise you'll be constantly resizing the shape of the game container.
*
* - The Display canvas layout CSS styles (i.e. margins, size) should not be altered/specified as
*   they may be updated by the ScaleManager.
*
* @description
* Create a new ScaleManager object - this is done automatically by {@link Phaser.Game}
*
* The `width` and `height` constructor parameters can either be a number which represents pixels or a string that represents a percentage: e.g. `800` (for 800 pixels) or `"80%"` for 80%.
*
* @class
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number|string} width - The width of the game. See above.
* @param {number|string} height - The height of the game. See above.
*/
Phaser.ScaleManager = function (game, width, height) {

    /**
    * A reference to the currently running game.
    * @property {Phaser.Game} game
    * @protected
    * @readonly
    */
    this.game = game;

    /**
    * Provides access to some cross-device DOM functions.
    * @property {Phaser.DOM} dom
    * @protected
    * @readonly
    */
    this.dom = Phaser.DOM;

    /**
    * _EXPERIMENTAL:_ A responsive grid on which you can align game objects.
    * @property {Phaser.FlexGrid} grid
    * @public
    */
    this.grid = null;

    /**
    * Target width (in pixels) of the Display canvas.
    * @property {number} width
    * @readonly
    */
    this.width = 0;

    /**
    * Target height (in pixels) of the Display canvas.
    * @property {number} height
    * @readonly
    */
    this.height = 0;

    /**
    * Minimum width the canvas should be scaled to (in pixels).
    * Change with {@link #setMinMax}.
    * @property {?number} minWidth
    * @readonly
    * @protected
    */
    this.minWidth = null;

    /**
    * Maximum width the canvas should be scaled to (in pixels).
    * If null it will scale to whatever width the browser can handle.
    * Change with {@link #setMinMax}.
    * @property {?number} maxWidth
    * @readonly
    * @protected
    */
    this.maxWidth = null;

    /**
    * Minimum height the canvas should be scaled to (in pixels).
    * Change with {@link #setMinMax}.
    * @property {?number} minHeight
    * @readonly
    * @protected
    */
    this.minHeight = null;

    /**
    * Maximum height the canvas should be scaled to (in pixels).
    * If null it will scale to whatever height the browser can handle.
    * Change with {@link #setMinMax}.
    * @property {?number} maxHeight
    * @readonly
    * @protected
    */
    this.maxHeight = null;

    /**
    * The offset coordinates of the Display canvas from the top-left of the browser window.
    * The is used internally by Phaser.Pointer (for Input) and possibly other types.
    * @property {Phaser.Point} offset
    * @readonly
    * @protected
    */
    this.offset = new Phaser.Point();

    /**
    * If true, the game should only run in a landscape orientation.
    * Change with {@link #forceOrientation}.
    * @property {boolean} forceLandscape
    * @readonly
    * @default
    * @protected
    */
    this.forceLandscape = false;

    /**
    * If true, the game should only run in a portrait 
    * Change with {@link #forceOrientation}.
    * @property {boolean} forcePortrait
    * @readonly
    * @default
    * @protected
    */
    this.forcePortrait = false;

    /**
    * True if {@link #forceLandscape} or {@link #forcePortrait} are set and do not agree with the browser orientation.
    *
    * This value is not updated immediately.
    *
    * @property {boolean} incorrectOrientation    
    * @readonly
    * @protected
    */
    this.incorrectOrientation = false;

    /**
    * See {@link #pageAlignHorizontally}.
    * @property {boolean} _pageAlignHorizontally
    * @private
    */
    this._pageAlignHorizontally = false;

    /**
    * See {@link #pageAlignVertically}.
    * @property {boolean} _pageAlignVertically
    * @private
    */
    this._pageAlignVertically = false;

    /**
    * This signal is dispatched when the orientation changes _or_ the validity of the current orientation changes.
    * 
    * The signal is supplied with the following arguments:
    * - `scale` - the ScaleManager object
    * - `prevOrientation`, a string - The previous orientation as per {@link Phaser.ScaleManager#screenOrientation screenOrientation}.
    * - `wasIncorrect`, a boolean - True if the previous orientation was last determined to be incorrect.
    *
    * Access the current orientation and validity with `scale.screenOrientation` and `scale.incorrectOrientation`.
    * Thus the following tests can be done:
    *
    *     // The orientation itself changed:
    *     scale.screenOrientation !== prevOrientation
    *     // The orientation just became incorrect:
    *     scale.incorrectOrientation && !wasIncorrect
    *
    * It is possible that this signal is triggered after {@link #forceOrientation} so the orientation
    * correctness changes even if the orientation itself does not change.
    *
    * This is signaled from `preUpdate` (or `pauseUpdate`) _even when_ the game is paused.
    *
    * @property {Phaser.Signal} onOrientationChange
    * @public
    */
    this.onOrientationChange = new Phaser.Signal();

    /**
    * This signal is dispatched when the browser enters an incorrect orientation, as defined by {@link #forceOrientation}.
    *
    * This is signaled from `preUpdate` (or `pauseUpdate`) _even when_ the game is paused.
    *
    * @property {Phaser.Signal} enterIncorrectOrientation
    * @public
    */
    this.enterIncorrectOrientation = new Phaser.Signal();

    /**
    * This signal is dispatched when the browser leaves an incorrect orientation, as defined by {@link #forceOrientation}.
    *
    * This is signaled from `preUpdate` (or `pauseUpdate`) _even when_ the game is paused.
    *
    * @property {Phaser.Signal} leaveIncorrectOrientation
    * @public
    */
    this.leaveIncorrectOrientation = new Phaser.Signal();

    /**
    * This boolean provides you with a way to determine if the browser is in Full Screen
    * mode (via the Full Screen API), and Phaser was the one responsible for activating it.
    *
    * It's possible that ScaleManager.isFullScreen returns `true` even if Phaser wasn't the
    * one that made the browser go full-screen, so this flag lets you determine that.
    * 
    * @property {boolean} hasPhaserSetFullScreen
    * @default
    */
    this.hasPhaserSetFullScreen = false;

    /**
    * If specified, this is the DOM element on which the Fullscreen API enter request will be invoked.
    * The target element must have the correct CSS styling and contain the Display canvas.
    *
    * The elements style will be modified (ie. the width and height might be set to 100%)
    * but it will not be added to, removed from, or repositioned within the DOM.
    * An attempt is made to restore relevant style changes when fullscreen mode is left.
    *
    * For pre-2.2.0 behavior set `game.scale.fullScreenTarget = game.canvas`.
    *
    * @property {?DOMElement} fullScreenTarget
    * @default
    */
    this.fullScreenTarget = null;

    /**
    * The fullscreen target, as created by {@link #createFullScreenTarget}.
    * This is not set if {@link #fullScreenTarget} is used and is cleared when fullscreen mode ends.
    * @property {?DOMElement} _createdFullScreenTarget
    * @private
    */
    this._createdFullScreenTarget = null;

    /**
    * This signal is dispatched when fullscreen mode is ready to be initialized but
    * before the fullscreen request.
    *
    * The signal is passed two arguments: `scale` (the ScaleManager), and an object in the form `{targetElement: DOMElement}`.
    *
    * The `targetElement` is the {@link #fullScreenTarget} element,
    * if such is assigned, or a new element created by {@link #createFullScreenTarget}.
    *
    * Custom CSS styling or resets can be applied to `targetElement` as required.
    *
    * If `targetElement` is _not_ the same element as {@link #fullScreenTarget}:
    * - After initialization the Display canvas is moved onto the `targetElement` for
    *   the duration of the fullscreen mode, and restored to it's original DOM location when fullscreen is exited.
    * - The `targetElement` is moved/re-parented within the DOM and may have its CSS styles updated.
    *
    * The behavior of a pre-assigned target element is covered in {@link Phaser.ScaleManager#fullScreenTarget fullScreenTarget}.
    *
    * @property {Phaser.Signal} onFullScreenInit
    * @public
    */
    this.onFullScreenInit = new Phaser.Signal();

    /**
    * This signal is dispatched when the browser enters or leaves fullscreen mode, if supported.
    *
    * The signal is supplied with a single argument: `scale` (the ScaleManager). Use `scale.isFullScreen` to determine
    * if currently running in Fullscreen mode.
    *
    * @property {Phaser.Signal} onFullScreenChange
    * @public    
    */
    this.onFullScreenChange = new Phaser.Signal();

    /**
    * This signal is dispatched when the browser fails to enter fullscreen mode;
    * or if the device does not support fullscreen mode and `startFullScreen` is invoked.
    *
    * The signal is supplied with a single argument: `scale` (the ScaleManager).
    *
    * @property {Phaser.Signal} onFullScreenError
    * @public
    */
    this.onFullScreenError = new Phaser.Signal();

    /**
    * The _last known_ orientation of the screen, as defined in the Window Screen Web API.
    * See {@link Phaser.DOM.getScreenOrientation} for possible values.
    *
    * @property {string} screenOrientation
    * @readonly
    * @public
    */
    this.screenOrientation = this.dom.getScreenOrientation();

    /**
    * The _current_ scale factor based on the game dimensions vs. the scaled dimensions.
    * @property {Phaser.Point} scaleFactor
    * @readonly
    */
    this.scaleFactor = new Phaser.Point(1, 1);

    /**
    * The _current_ inversed scale factor. The displayed dimensions divided by the game dimensions.
    * @property {Phaser.Point} scaleFactorInversed
    * @readonly
    * @protected
    */
    this.scaleFactorInversed = new Phaser.Point(1, 1);

    /**
    * The Display canvas is aligned by adjusting the margins; the last margins are stored here.
    *
    * @property {Bounds-like} margin
    * @readonly
    * @protected
    */
    this.margin = {left: 0, top: 0, right: 0, bottom: 0, x: 0, y: 0};

    /**
    * The bounds of the scaled game. The x/y will match the offset of the canvas element and the width/height the scaled width and height.
    * @property {Phaser.Rectangle} bounds
    * @readonly
    */
    this.bounds = new Phaser.Rectangle();

    /**
    * The aspect ratio of the scaled Display canvas.
    * @property {number} aspectRatio
    * @readonly
    */
    this.aspectRatio = 0;

    /**
    * The aspect ratio of the original game dimensions.
    * @property {number} sourceAspectRatio
    * @readonly
    */
    this.sourceAspectRatio = 0;

    /**
    * The native browser events from Fullscreen API changes.
    * @property {any} event
    * @readonly
    * @private
    */
    this.event = null;

    /**
    * The edges on which to constrain the game Display/canvas in _addition_ to the restrictions of the parent container.
    *
    * The properties are strings and can be '', 'visual', 'layout', or 'layout-soft'.
    * - If 'visual', the edge will be constrained to the Window / displayed screen area
    * - If 'layout', the edge will be constrained to the CSS Layout bounds
    * - An invalid value is treated as 'visual'
    *
    * @member
    * @property {string} bottom
    * @property {string} right
    * @default
    */
    this.windowConstraints = {
        right: 'layout',
        bottom: ''
    };

    /**
    * Various compatibility settings.
    * A value of "(auto)" indicates the setting is configured based on device and runtime information.
    *
    * A {@link #refresh} may need to be performed after making changes.
    *
    * @protected
    * 
    * @property {boolean} [supportsFullScreen=(auto)] - True only if fullscreen support will be used. (Changing to fullscreen still might not work.)
    *
    * @property {boolean} [orientationFallback=(auto)] - See {@link Phaser.DOM.getScreenOrientation}.
    *
    * @property {boolean} [noMargins=false] - If true then the Display canvas's margins will not be updated anymore: existing margins must be manually cleared. Disabling margins prevents automatic canvas alignment/centering, possibly in fullscreen.
    *
    * @property {?Phaser.Point} [scrollTo=(auto)] - If specified the window will be scrolled to this position on every refresh.
    *
    * @property {boolean} [forceMinimumDocumentHeight=false] - If enabled the document elements minimum height is explicitly set on updates.
    *    The height set varies by device and may either be the height of the window or the viewport.
    *
    * @property {boolean} [canExpandParent=true] - If enabled then SHOW_ALL and USER_SCALE modes can try and expand the parent element. It may be necessary for the parent element to impose CSS width/height restrictions.
    *
    * @property {string} [clickTrampoline=(auto)] - On certain browsers (eg. IE) FullScreen events need to be triggered via 'click' events.
    *     A value of 'when-not-mouse' uses a click trampoline when a pointer that is not the primary mouse is used.
    *     Any other string value (including the empty string) prevents using click trampolines.
    *     For more details on click trampolines see {@link Phaser.Pointer#addClickTrampoline}.
    */
    this.compatibility = {
        supportsFullScreen: false,
        orientationFallback: null,
        noMargins: false,
        scrollTo: null,
        forceMinimumDocumentHeight: false,
        canExpandParent: true,
        clickTrampoline: ''
    };

    /**
    * Scale mode to be used when not in fullscreen.
    * @property {number} _scaleMode
    * @private
    */
    this._scaleMode = Phaser.ScaleManager.NO_SCALE;

    /*
    * Scale mode to be used in fullscreen.
    * @property {number} _fullScreenScaleMode
    * @private
    */
    this._fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;

    /**
    * If the parent container of the Game canvas is the browser window itself (i.e. document.body),
    * rather than another div, this should set to `true`.
    *
    * The {@link #parentNode} property is generally ignored while this is in effect.
    *
    * @property {boolean} parentIsWindow
    */
    this.parentIsWindow = false;

    /**
    * The _original_ DOM element for the parent of the Display canvas.
    * This may be different in fullscreen - see {@link #createFullScreenTarget}.
    *
    * This should only be changed after moving the Game canvas to a different DOM parent.
    *
    * @property {?DOMElement} parentNode
    */
    this.parentNode = null;

    /**
    * The scale of the game in relation to its parent container.
    * @property {Phaser.Point} parentScaleFactor
    * @readonly
    */
    this.parentScaleFactor = new Phaser.Point(1, 1);

    /**
    * The maximum time (in ms) between dimension update checks for the Canvas's parent element (or window).
    * Update checks normally happen quicker in response to other events.
    *
    * @property {integer} trackParentInterval
    * @default
    * @protected
    * @see {@link Phaser.ScaleManager#refresh refresh}
    */
    this.trackParentInterval = 2000;

    /**
    * This signal is dispatched when the size of the Display canvas changes _or_ the size of the Game changes. 
    * When invoked this is done _after_ the Canvas size/position have been updated.
    *
    * This signal is _only_ called when a change occurs and a reflow may be required.
    * For example, if the canvas does not change sizes because of CSS settings (such as min-width)
    * then this signal will _not_ be triggered.
    *
    * Use this to handle responsive game layout options.
    *
    * This is signaled from `preUpdate` (or `pauseUpdate`) _even when_ the game is paused.
    *
    * @property {Phaser.Signal} onSizeChange
    * @todo Formalize the arguments, if any, supplied to this signal.
    */
    this.onSizeChange = new Phaser.Signal();

    /**
    * The callback that will be called each the parent container resizes.
    * @property {function} onResize
    * @private
    */
    this.onResize = null;

    /**
    * The context in which the {@link #onResize} callback will be called.
    * @property {object} onResizeContext
    * @private
    */
    this.onResizeContext = null;

    /**
    * @property {integer} _pendingScaleMode - Used to retain the scale mode if set from config before Boot.
    * @private
    */
    this._pendingScaleMode = null;

    /**
    * Information saved when fullscreen mode is started.
    * @property {?object} _fullScreenRestore
    * @private
    */
    this._fullScreenRestore = null;

    /**
    * The _actual_ game dimensions, as initially set or set by {@link #setGameSize}.
    * @property {Phaser.Rectangle} _gameSize
    * @private
    */
    this._gameSize = new Phaser.Rectangle();

    /**
    * The user-supplied scale factor, used with the USER_SCALE scaling mode.
    * @property {Phaser.Point} _userScaleFactor
    * @private
    */
    this._userScaleFactor = new Phaser.Point(1, 1);

    /**
    * The user-supplied scale trim, used with the USER_SCALE scaling mode.
    * @property {Phaser.Point} _userScaleTrim
    * @private
    */
    this._userScaleTrim = new Phaser.Point(0, 0);

    /**
    * The last time the bounds were checked in `preUpdate`.
    * @property {number} _lastUpdate
    * @private
    */
    this._lastUpdate = 0;

    /**
    * Size checks updates are delayed according to the throttle.
    * The throttle increases to `trackParentInterval` over time and is used to more
    * rapidly detect changes in certain browsers (eg. IE) while providing back-off safety.
    * @property {integer} _updateThrottle
    * @private
    */
    this._updateThrottle = 0;

    /**
    * The minimum throttle allowed until it has slowed down sufficiently.
    * @property {integer} _updateThrottleReset   
    * @private
    */
    this._updateThrottleReset = 100;

    /**
    * The cached result of the parent (possibly window) bounds; used to invalidate sizing.
    * @property {Phaser.Rectangle} _parentBounds
    * @private
    */
    this._parentBounds = new Phaser.Rectangle();

    /**
    * Temporary bounds used for internal work to cut down on new objects created.
    * @property {Phaser.Rectangle} _parentBounds
    * @private
    */
    this._tempBounds = new Phaser.Rectangle();

    /**
    * The Canvas size at which the last onSizeChange signal was triggered.
    * @property {Phaser.Rectangle} _lastReportedCanvasSize
    * @private
    */
    this._lastReportedCanvasSize = new Phaser.Rectangle();

    /**
    * The Game size at which the last onSizeChange signal was triggered.
    * @property {Phaser.Rectangle} _lastReportedGameSize
    * @private
    */
    this._lastReportedGameSize = new Phaser.Rectangle();

    /**
    * @property {boolean} _booted - ScaleManager booted state.
    * @private
    */
    this._booted = false;

    if (game.config)
    {
        this.parseConfig(game.config);
    }

    this.setupScale(width, height);

};

/**
* A scale mode that stretches content to fill all available space - see {@link Phaser.ScaleManager#scaleMode scaleMode}.
*
* @constant
* @type {integer}
*/
Phaser.ScaleManager.EXACT_FIT = 0;

/**
* A scale mode that prevents any scaling - see {@link Phaser.ScaleManager#scaleMode scaleMode}.
*
* @constant
* @type {integer}
*/
Phaser.ScaleManager.NO_SCALE = 1;

/**
* A scale mode that shows the entire game while maintaining proportions - see {@link Phaser.ScaleManager#scaleMode scaleMode}.
*
* @constant
* @type {integer}
*/
Phaser.ScaleManager.SHOW_ALL = 2;

/**
* A scale mode that causes the Game size to change - see {@link Phaser.ScaleManager#scaleMode scaleMode}.
*
* @constant
* @type {integer}
*/
Phaser.ScaleManager.RESIZE = 3;

/**
* A scale mode that allows a custom scale factor - see {@link Phaser.ScaleManager#scaleMode scaleMode}.
*
* @constant
* @type {integer}
*/
Phaser.ScaleManager.USER_SCALE = 4;

Phaser.ScaleManager.prototype = {

    /**
    * Start the ScaleManager.
    * 
    * @method Phaser.ScaleManager#boot
    * @protected
    */
    boot: function () {

        // Configure device-dependent compatibility

        var compat = this.compatibility;
        
        compat.supportsFullScreen = this.game.device.fullscreen && !this.game.device.cocoonJS;

        //  We can't do anything about the status bars in iPads, web apps or desktops
        if (!this.game.device.iPad && !this.game.device.webApp && !this.game.device.desktop)
        {
            if (this.game.device.android && !this.game.device.chrome)
            {
                compat.scrollTo = new Phaser.Point(0, 1);
            }
            else
            {
                compat.scrollTo = new Phaser.Point(0, 0);
            }
        }

        if (this.game.device.desktop)
        {
            compat.orientationFallback = 'screen';
            compat.clickTrampoline = 'when-not-mouse';
        }
        else
        {
            compat.orientationFallback = '';
            compat.clickTrampoline = '';
        }

        // Configure event listeners

        var _this = this;

        this._orientationChange = function(event) {
            return _this.orientationChange(event);
        };

        this._windowResize = function(event) {
            return _this.windowResize(event);
        };

        // This does not appear to be on the standards track
        window.addEventListener('orientationchange', this._orientationChange, false);
        window.addEventListener('resize', this._windowResize, false);

        if (this.compatibility.supportsFullScreen)
        {
            this._fullScreenChange = function(event) {
                return _this.fullScreenChange(event);
            };

            this._fullScreenError = function(event) {
                return _this.fullScreenError(event);
            };

            document.addEventListener('webkitfullscreenchange', this._fullScreenChange, false);
            document.addEventListener('mozfullscreenchange', this._fullScreenChange, false);
            document.addEventListener('MSFullscreenChange', this._fullScreenChange, false);
            document.addEventListener('fullscreenchange', this._fullScreenChange, false);

            document.addEventListener('webkitfullscreenerror', this._fullScreenError, false);
            document.addEventListener('mozfullscreenerror', this._fullScreenError, false);
            document.addEventListener('MSFullscreenError', this._fullScreenError, false);
            document.addEventListener('fullscreenerror', this._fullScreenError, false);
        }

        this.game.onResume.add(this._gameResumed, this);

        // Initialize core bounds

        this.dom.getOffset(this.game.canvas, this.offset);

        this.bounds.setTo(this.offset.x, this.offset.y, this.width, this.height);

        this.setGameSize(this.game.width, this.game.height);

        // Don't use updateOrientationState so events are not fired
        this.screenOrientation = this.dom.getScreenOrientation(this.compatibility.orientationFallback);

        if (Phaser.FlexGrid)
        {
            this.grid = new Phaser.FlexGrid(this, this.width, this.height);
        }

        this._booted = true;

        if (this._pendingScaleMode !== null)
        {
            this.scaleMode = this._pendingScaleMode;
            this._pendingScaleMode = null;
        }

    },

    /**
    * Load configuration settings.
    * 
    * @method Phaser.ScaleManager#parseConfig
    * @protected
    * @param {object} config - The game configuration object.
    */
    parseConfig: function (config) {

        if (config['scaleMode'] !== undefined)
        {
            if (this._booted)
            {
                this.scaleMode = config['scaleMode'];
            }
            else
            {
                this._pendingScaleMode = config['scaleMode'];
            }
        }

        if (config['fullScreenScaleMode'] !== undefined)
        {
            this.fullScreenScaleMode = config['fullScreenScaleMode'];
        }

        if (config['fullScreenTarget'])
        {
            this.fullScreenTarget = config['fullScreenTarget'];
        }

    },

    /**
    * Calculates and sets the game dimensions based on the given width and height.
    *
    * This should _not_ be called when in fullscreen mode.
    * 
    * @method Phaser.ScaleManager#setupScale
    * @protected
    * @param {number|string} width - The width of the game.
    * @param {number|string} height - The height of the game.
    */
    setupScale: function (width, height) {

        var target;
        var rect = new Phaser.Rectangle();

        if (this.game.parent !== '')
        {
            if (typeof this.game.parent === 'string')
            {
                // hopefully an element ID
                target = document.getElementById(this.game.parent);
            }
            else if (this.game.parent && this.game.parent.nodeType === 1)
            {
                // quick test for a HTMLelement
                target = this.game.parent;
            }
        }

        // Fallback, covers an invalid ID and a non HTMLelement object
        if (!target)
        {
            //  Use the full window
            this.parentNode = null;
            this.parentIsWindow = true;

            rect.width = this.dom.visualBounds.width;
            rect.height = this.dom.visualBounds.height;

            this.offset.set(0, 0);
        }
        else
        {
            this.parentNode = target;
            this.parentIsWindow = false;

            this.getParentBounds(this._parentBounds);

            rect.width = this._parentBounds.width;
            rect.height = this._parentBounds.height;

            this.offset.set(this._parentBounds.x, this._parentBounds.y);
        }

        var newWidth = 0;
        var newHeight = 0;

        if (typeof width === 'number')
        {
            newWidth = width;
        }
        else
        {
            //  Percentage based
            this.parentScaleFactor.x = parseInt(width, 10) / 100;
            newWidth = rect.width * this.parentScaleFactor.x;
        }

        if (typeof height === 'number')
        {
            newHeight = height;
        }
        else
        {
            //  Percentage based
            this.parentScaleFactor.y = parseInt(height, 10) / 100;
            newHeight = rect.height * this.parentScaleFactor.y;
        }

        newWidth = Math.floor(newWidth);
        newHeight = Math.floor(newHeight);

        this._gameSize.setTo(0, 0, newWidth, newHeight);

        this.updateDimensions(newWidth, newHeight, false);

    },

    /**
    * Invoked when the game is resumed.
    * 
    * @method Phaser.ScaleManager#_gameResumed
    * @private
    */
    _gameResumed: function () {

        this.queueUpdate(true);

    },

    /**
    * Set the actual Game size.
    * Use this instead of directly changing `game.width` or `game.height`.
    *
    * The actual physical display (Canvas element size) depends on various settings including
    * - Scale mode
    * - Scaling factor
    * - Size of Canvas's parent element or CSS rules such as min-height/max-height;
    * - The size of the Window
    *
    * @method Phaser.ScaleManager#setGameSize
    * @public
    * @param {integer} width - _Game width_, in pixels.
    * @param {integer} height - _Game height_, in pixels.
    */
    setGameSize: function (width, height) {

        this._gameSize.setTo(0, 0, width, height);
        
        if (this.currentScaleMode !== Phaser.ScaleManager.RESIZE)
        {
            this.updateDimensions(width, height, true);
        }

        this.queueUpdate(true);

    },

    /**
    * Set a User scaling factor used in the USER_SCALE scaling mode.
    *
    * The target canvas size is computed by:
    *
    *     canvas.width = (game.width * hScale) - hTrim
    *     canvas.height = (game.height * vScale) - vTrim
    *
    * This method can be used in the {@link Phaser.ScaleManager#setResizeCallback resize callback}.
    *
    * @method Phaser.ScaleManager#setUserScale
    * @param {number} hScale - Horizontal scaling factor.
    * @param {numer} vScale - Vertical scaling factor.
    * @param {integer} [hTrim=0] - Horizontal trim, applied after scaling.
    * @param {integer} [vTrim=0] - Vertical trim, applied after scaling.
    */
    setUserScale: function (hScale, vScale, hTrim, vTrim) {

        this._userScaleFactor.setTo(hScale, vScale);
        this._userScaleTrim.setTo(hTrim | 0, vTrim | 0);
        this.queueUpdate(true);

    },

    /**
    * Sets the callback that will be invoked before sizing calculations.
    *
    * This is the appropriate place to call {@link #setUserScale} if needing custom dynamic scaling.
    *
    * The callback is supplied with two arguments `scale` and `parentBounds` where `scale` is the ScaleManager
    * and `parentBounds`, a Phaser.Rectangle, is the size of the Parent element.
    *
    * This callback
    * - May be invoked even though the parent container or canvas sizes have not changed
    * - Unlike {@link #onSizeChange}, it runs _before_ the canvas is guaranteed to be updated
    * - Will be invoked from `preUpdate`, _even when_ the game is paused    
    *
    * See {@link #onSizeChange} for a better way of reacting to layout updates.
    * 
    * @method Phaser.ScaleManager#setResizeCallback
    * @public
    * @param {function} callback - The callback that will be called each time a window.resize event happens or if set, the parent container resizes.
    * @param {object} context - The context in which the callback will be called.
    */
    setResizeCallback: function (callback, context) {

        this.onResize = callback;
        this.onResizeContext = context;

    },

    /**
    * Signals a resize - IF the canvas or Game size differs from the last signal.
    *
    * This also triggers updates on {@link #grid} (FlexGrid) and, if in a RESIZE mode, `game.state` (StateManager).
    *
    * @method Phaser.ScaleManager#signalSizeChange
    * @private
    */
    signalSizeChange: function () {

        if (!Phaser.Rectangle.sameDimensions(this, this._lastReportedCanvasSize) ||
            !Phaser.Rectangle.sameDimensions(this.game, this._lastReportedGameSize))
        {
            var width = this.width;
            var height = this.height;

            this._lastReportedCanvasSize.setTo(0, 0, width, height);
            this._lastReportedGameSize.setTo(0, 0, this.game.width, this.game.height);

            if (this.grid)
            {
                this.grid.onResize(width, height);
            }

            this.onSizeChange.dispatch(this, width, height);

            // Per StateManager#onResizeCallback, it only occurs when in RESIZE mode.
            if (this.currentScaleMode === Phaser.ScaleManager.RESIZE)
            {
                this.game.state.resize(width, height);
                this.game.load.resize(width, height);
            }
        }

    },

    /**
    * Set the min and max dimensions for the Display canvas.
    * 
    * _Note:_ The min/max dimensions are only applied in some cases
    * - When the device is not in an incorrect orientation; or
    * - The scale mode is EXACT_FIT when not in fullscreen
    *
    * @method Phaser.ScaleManager#setMinMax
    * @public
    * @param {number} minWidth - The minimum width the game is allowed to scale down to.
    * @param {number} minHeight - The minimum height the game is allowed to scale down to.
    * @param {number} [maxWidth] - The maximum width the game is allowed to scale up to; only changed if specified.
    * @param {number} [maxHeight] - The maximum height the game is allowed to scale up to; only changed if specified.
    * @todo These values are only sometimes honored.
    */
    setMinMax: function (minWidth, minHeight, maxWidth, maxHeight) {

        this.minWidth = minWidth;
        this.minHeight = minHeight;

        if (typeof maxWidth !== 'undefined')
        {
            this.maxWidth = maxWidth;
        }

        if (typeof maxHeight !== 'undefined')
        {
            this.maxHeight = maxHeight;
        }

    },

    /**
    * The ScaleManager.preUpdate is called automatically by the core Game loop.
    * 
    * @method Phaser.ScaleManager#preUpdate
    * @protected
    */
    preUpdate: function () {

        if (this.game.time.time < (this._lastUpdate + this._updateThrottle))
        {
            return;
        }

        var prevThrottle = this._updateThrottle;
        this._updateThrottleReset = prevThrottle >= 400 ? 0 : 100;

        this.dom.getOffset(this.game.canvas, this.offset);

        var prevWidth = this._parentBounds.width;
        var prevHeight = this._parentBounds.height;
        var bounds = this.getParentBounds(this._parentBounds);

        var boundsChanged = bounds.width !== prevWidth || bounds.height !== prevHeight;

        // Always invalidate on a newly detected orientation change
        var orientationChanged = this.updateOrientationState();

        if (boundsChanged || orientationChanged)
        {
            if (this.onResize)
            {
                this.onResize.call(this.onResizeContext, this, bounds);
            }

            this.updateLayout();

            this.signalSizeChange();
        }

        // Next throttle, eg. 25, 50, 100, 200..
        var throttle = this._updateThrottle * 2;

        // Don't let an update be too eager about resetting the throttle.
        if (this._updateThrottle < prevThrottle)
        {
            throttle = Math.min(prevThrottle, this._updateThrottleReset);
        }

        this._updateThrottle = Phaser.Math.clamp(throttle, 25, this.trackParentInterval);
        this._lastUpdate = this.game.time.time;

    },

    /**
    * Update method while paused.
    *
    * @method Phaser.ScaleManager#pauseUpdate
    * @private
    */
    pauseUpdate: function () {

        this.preUpdate();

        // Updates at slowest.
        this._updateThrottle = this.trackParentInterval;
        
    },

    /**
    * Update the dimensions taking the parent scaling factor into account.
    *
    * @method Phaser.ScaleManager#updateDimensions
    * @private
    * @param {number} width - The new width of the parent container.
    * @param {number} height - The new height of the parent container.
    * @param {boolean} resize - True if the renderer should be resized, otherwise false to just update the internal vars.
    */
    updateDimensions: function (width, height, resize) {

        this.width = width * this.parentScaleFactor.x;
        this.height = height * this.parentScaleFactor.y;

        this.game.width = this.width;
        this.game.height = this.height;

        this.sourceAspectRatio = this.width / this.height;
        this.updateScalingAndBounds();

        if (resize)
        {
            //  Resize the renderer (which in turn resizes the Display canvas!)
            this.game.renderer.resize(this.width, this.height);

            //  The Camera can never be smaller than the Game size
            this.game.camera.setSize(this.width, this.height);

            //  This should only happen if the world is smaller than the new canvas size
            this.game.world.resize(this.width, this.height);
        }

    },

    /**
    * Update relevant scaling values based on the ScaleManager dimension and game dimensions,
    * which should already be set. This does not change {@link #sourceAspectRatio}.
    * 
    * @method Phaser.ScaleManager#updateScalingAndBounds
    * @private
    */
    updateScalingAndBounds: function () {

        this.scaleFactor.x = this.game.width / this.width;
        this.scaleFactor.y = this.game.height / this.height;

        this.scaleFactorInversed.x = this.width / this.game.width;
        this.scaleFactorInversed.y = this.height / this.game.height;

        this.aspectRatio = this.width / this.height;

        // This can be invoked in boot pre-canvas
        if (this.game.canvas)
        {
            this.dom.getOffset(this.game.canvas, this.offset);
        }

        this.bounds.setTo(this.offset.x, this.offset.y, this.width, this.height);

        // Can be invoked in boot pre-input
        if (this.game.input && this.game.input.scale)
        {
            this.game.input.scale.setTo(this.scaleFactor.x, this.scaleFactor.y);
        }

    },

    /**
    * Force the game to run in only one orientation.
    *
    * This enables generation of incorrect orientation signals and affects resizing but does not otherwise rotate or lock the orientation.
    *
    * Orientation checks are performed via the Screen Orientation API, if available in browser. This means it will check your monitor
    * orientation on desktop, or your device orientation on mobile, rather than comparing actual game dimensions. If you need to check the 
    * viewport dimensions instead and bypass the Screen Orientation API then set: `ScaleManager.compatibility.orientationFallback = 'viewport'`
    * 
    * @method Phaser.ScaleManager#forceOrientation
    * @public
    * @param {boolean} forceLandscape - true if the game should run in landscape mode only.
    * @param {boolean} [forcePortrait=false] - true if the game should run in portrait mode only.
    */
    forceOrientation: function (forceLandscape, forcePortrait) {

        if (forcePortrait === undefined) { forcePortrait = false; }

        this.forceLandscape = forceLandscape;
        this.forcePortrait = forcePortrait;

        this.queueUpdate(true);

    },

    /**
    * Classify the orientation, per `getScreenOrientation`.
    * 
    * @method Phaser.ScaleManager#classifyOrientation
    * @private
    * @param {string} orientation - The orientation string, e.g. 'portrait-primary'.
    * @return {?string} The classified orientation: 'portrait', 'landscape`, or null.
    */
    classifyOrientation: function (orientation) {

        if (orientation === 'portrait-primary' || orientation === 'portrait-secondary')
        {
            return 'portrait';
        }
        else if (orientation === 'landscape-primary' || orientation === 'landscape-secondary')
        {
            return 'landscape';
        }
        else
        {
            return null;
        }

    },

    /**
    * Updates the current orientation and dispatches orientation change events.
    * 
    * @method Phaser.ScaleManager#updateOrientationState
    * @private
    * @return {boolean} True if the orientation state changed which means a forced update is likely required.
    */
    updateOrientationState: function () {

        var previousOrientation = this.screenOrientation;
        var previouslyIncorrect = this.incorrectOrientation;
        
        this.screenOrientation = this.dom.getScreenOrientation(this.compatibility.orientationFallback);

        this.incorrectOrientation = (this.forceLandscape && !this.isLandscape) ||
            (this.forcePortrait && !this.isPortrait);

        var changed = previousOrientation !== this.screenOrientation;
        var correctnessChanged = previouslyIncorrect !== this.incorrectOrientation;

        if (correctnessChanged)
        {
            if (this.incorrectOrientation)
            {
                this.enterIncorrectOrientation.dispatch();
            }
            else
            {
                this.leaveIncorrectOrientation.dispatch();
            }
        }

        if (changed || correctnessChanged)
        {
            this.onOrientationChange.dispatch(this, previousOrientation, previouslyIncorrect);
        }

        return changed || correctnessChanged;

    },

    /**
    * window.orientationchange event handler.
    * 
    * @method Phaser.ScaleManager#orientationChange
    * @private
    * @param {Event} event - The orientationchange event data.
    */
    orientationChange: function (event) {

        this.event = event;

        this.queueUpdate(true);

    },

    /**
    * window.resize event handler.
    * 
    * @method Phaser.ScaleManager#windowResize
    * @private
    * @param {Event} event - The resize event data.
    */
    windowResize: function (event) {

        this.event = event;

        this.queueUpdate(true);

    },

    /**
    * Scroll to the top - in some environments. See `compatibility.scrollTo`.
    * 
    * @method Phaser.ScaleManager#scrollTop
    * @private
    */
    scrollTop: function () {

        var scrollTo = this.compatibility.scrollTo;

        if (scrollTo)
        {
            // window.scrollTo(scrollTo.x, scrollTo.y);
            console.warn("window.scrollTo not available in wxgame");
        }

    },

    /**
    * The "refresh" methods informs the ScaleManager that a layout refresh is required.
    *
    * The ScaleManager automatically queues a layout refresh (eg. updates the Game size or Display canvas layout)
    * when the browser is resized, the orientation changes, or when there is a detected change
    * of the Parent size. Refreshing is also done automatically when public properties,
    * such as {@link #scaleMode}, are updated or state-changing methods are invoked.
    *
    * The "refresh" method _may_ need to be used in a few (rare) situtations when
    *
    * - a device change event is not correctly detected; or
    * - the Parent size changes (and an immediate reflow is desired); or
    * - the ScaleManager state is updated by non-standard means; or
    * - certain {@link #compatibility} properties are manually changed.
    *
    * The queued layout refresh is not immediate but will run promptly in an upcoming `preRender`.
    * 
    * @method Phaser.ScaleManager#refresh
    * @public
    */
    refresh: function () {

        this.scrollTop();
        this.queueUpdate(true);

    },

    /**
    * Updates the game / canvas position and size.
    *
    * @method Phaser.ScaleManager#updateLayout
    * @private
    */
    updateLayout: function () {

        var scaleMode = this.currentScaleMode;

        if (scaleMode === Phaser.ScaleManager.RESIZE)
        {
            this.reflowGame();
            return;
        }

        this.scrollTop();

        if (this.compatibility.forceMinimumDocumentHeight)
        {
            // (This came from older code, by why is it here?)
            // Set minimum height of content to new window height
            document.documentElement.style.minHeight = window.innerHeight + 'px';
        }
        
        if (this.incorrectOrientation)
        {
            this.setMaximum();
        }
        else
        {
            if (scaleMode === Phaser.ScaleManager.EXACT_FIT)
            {
                this.setExactFit();
            }
            else if (scaleMode === Phaser.ScaleManager.SHOW_ALL)
            {
                if (!this.isFullScreen && this.boundingParent &&
                    this.compatibility.canExpandParent)
                {
                    // Try to expand parent out, but choosing maximizing dimensions.                    
                    // Then select minimize dimensions which should then honor parent
                    // maximum bound applications.
                    this.setShowAll(true);
                    this.resetCanvas();
                    this.setShowAll();
                }
                else
                {
                    this.setShowAll();
                }
            }
            else if (scaleMode === Phaser.ScaleManager.NO_SCALE)
            {
                this.width = this.game.width;
                this.height = this.game.height;
            }
            else if (scaleMode === Phaser.ScaleManager.USER_SCALE)
            {
                this.width = (this.game.width * this._userScaleFactor.x) - this._userScaleTrim.x;
                this.height = (this.game.height * this._userScaleFactor.y) - this._userScaleTrim.y;
            }
        }

        if (!this.compatibility.canExpandParent &&
            (scaleMode === Phaser.ScaleManager.SHOW_ALL || scaleMode === Phaser.ScaleManager.USER_SCALE))
        {
            var bounds = this.getParentBounds(this._tempBounds);
            this.width = Math.min(this.width, bounds.width);
            this.height = Math.min(this.height, bounds.height);
        }

        // Always truncate / force to integer
        this.width = this.width | 0;
        this.height = this.height | 0;

        this.reflowCanvas();

    },

    /**
    * Returns the computed Parent size/bounds that the Display canvas is allowed/expected to fill.
    *
    * If in fullscreen mode or without parent (see {@link #parentIsWindow}),
    * this will be the bounds of the visual viewport itself.
    *
    * This function takes the {@link #windowConstraints} into consideration - if the parent is partially outside
    * the viewport then this function may return a smaller than expected size.
    *
    * Values are rounded to the nearest pixel.
    *
    * @method Phaser.ScaleManager#getParentBounds
    * @protected
    * @param {Phaser.Rectangle} [target=(new Rectangle)] - The rectangle to update; a new one is created as needed.
    * @return {Phaser.Rectangle} The established parent bounds.
    */
    getParentBounds: function (target) {

        var bounds = target || new Phaser.Rectangle();
        var parentNode = this.boundingParent;
        var visualBounds = this.dom.visualBounds;
        var layoutBounds = this.dom.layoutBounds;

        if (!parentNode)
        {
            bounds.setTo(0, 0, visualBounds.width, visualBounds.height);
        }
        else
        {
            // Ref. http://msdn.microsoft.com/en-us/library/hh781509(v=vs.85).aspx for getBoundingClientRect
            var clientRect = parentNode.getBoundingClientRect();
            var parentRect = (parentNode.offsetParent) ? parentNode.offsetParent.getBoundingClientRect() : parentNode.getBoundingClientRect();

            bounds.setTo(clientRect.left - parentRect.left, clientRect.top - parentRect.top, clientRect.width, clientRect.height);

            var wc = this.windowConstraints;

            if (wc.right)
            {
                var windowBounds = wc.right === 'layout' ? layoutBounds : visualBounds;
                bounds.right = Math.min(bounds.right, windowBounds.width);
            }

            if (wc.bottom)
            {
                var windowBounds = wc.bottom === 'layout' ? layoutBounds : visualBounds;
                bounds.bottom = Math.min(bounds.bottom, windowBounds.height);
            }
        }

        bounds.setTo(
            Math.round(bounds.x), Math.round(bounds.y),
            Math.round(bounds.width), Math.round(bounds.height));

        return bounds;

    },

    /**
    * Update the canvas position/margins - for alignment within the parent container.
    *
    * The canvas margins _must_ be reset/cleared prior to invoking this.
    *
    * @method Phaser.ScaleManager#alignCanvas
    * @private
    * @param {boolean} horizontal - Align horizontally?
    * @param {boolean} vertical - Align vertically?
    */
    alignCanvas: function (horizontal, vertical) {

        var parentBounds = this.getParentBounds(this._tempBounds);
        var canvas = this.game.canvas;
        var margin = this.margin;

        if (horizontal)
        {
            margin.left = margin.right = 0;

            var canvasBounds = canvas.getBoundingClientRect();

            if (this.width < parentBounds.width && !this.incorrectOrientation)
            {
                var currentEdge = canvasBounds.left - parentBounds.x;
                var targetEdge = (parentBounds.width / 2) - (this.width / 2);

                targetEdge = Math.max(targetEdge, 0);

                var offset = targetEdge - currentEdge;

                margin.left = Math.round(offset);
            }

            canvas.style.marginLeft = margin.left + 'px';

            if (margin.left !== 0)
            {
                margin.right = -(parentBounds.width - canvasBounds.width - margin.left);
                canvas.style.marginRight = margin.right + 'px';
            }
        }

        if (vertical)
        {
            margin.top = margin.bottom = 0;

            var canvasBounds = canvas.getBoundingClientRect();
            
            if (this.height < parentBounds.height && !this.incorrectOrientation)
            {
                var currentEdge = canvasBounds.top - parentBounds.y;
                var targetEdge = (parentBounds.height / 2) - (this.height / 2);

                targetEdge = Math.max(targetEdge, 0);
                
                var offset = targetEdge - currentEdge;
                margin.top = Math.round(offset);
            }

            canvas.style.marginTop = margin.top + 'px';

            if (margin.top !== 0)
            {
                margin.bottom = -(parentBounds.height - canvasBounds.height - margin.top);
                canvas.style.marginBottom = margin.bottom + 'px';
            }
        }

        // Silly backwards compatibility..
        margin.x = margin.left;
        margin.y = margin.top;

    },

    /**
    * Updates the Game state / size.
    *
    * The canvas margins may always be adjusted, even if alignment is not in effect.
    * 
    * @method Phaser.ScaleManager#reflowGame
    * @private
    */
    reflowGame: function () {

        this.resetCanvas('', '');

        var bounds = this.getParentBounds(this._tempBounds);
        this.updateDimensions(bounds.width, bounds.height, true);

    },

    /**
    * Updates the Display canvas size.
    *
    * The canvas margins may always be adjusted, even alignment is not in effect.
    * 
    * @method Phaser.ScaleManager#reflowCanvas
    * @private
    */
    reflowCanvas: function () {

        if (!this.incorrectOrientation)
        {
            this.width = Phaser.Math.clamp(this.width, this.minWidth || 0, this.maxWidth || this.width);
            this.height = Phaser.Math.clamp(this.height, this.minHeight || 0, this.maxHeight || this.height);
        }

        this.resetCanvas();

        if (!this.compatibility.noMargins)
        {
            if (this.isFullScreen && this._createdFullScreenTarget)
            {
                this.alignCanvas(true, true);
            }
            else
            {
                this.alignCanvas(this.pageAlignHorizontally, this.pageAlignVertically);
            }
        }

        this.updateScalingAndBounds();

    },

    /**
    * "Reset" the Display canvas and set the specified width/height.
    *
    * @method Phaser.ScaleManager#resetCanvas
    * @private
    * @param {string} [cssWidth=(current width)] - The css width to set.
    * @param {string} [cssHeight=(current height)] - The css height to set.
    */
    resetCanvas: function (cssWidth, cssHeight) {

        if (cssWidth === undefined) { cssWidth = this.width + 'px'; }
        if (cssHeight === undefined) { cssHeight = this.height + 'px'; }

        var canvas = this.game.canvas;

        if (!this.compatibility.noMargins)
        {
            canvas.style.marginLeft = '';
            canvas.style.marginTop = '';
            canvas.style.marginRight = '';
            canvas.style.marginBottom = '';
        }

        canvas.style.width = cssWidth;
        canvas.style.height = cssHeight;

    },

    /**
    * Queues/marks a size/bounds check as needing to occur (from `preUpdate`).
    *
    * @method Phaser.ScaleManager#queueUpdate
    * @private
    * @param {boolean} force - If true resets the parent bounds to ensure the check is dirty.
    */
    queueUpdate: function (force) {

        if (force)
        {
            this._parentBounds.width = 0;
            this._parentBounds.height = 0;
        }

        this._updateThrottle = this._updateThrottleReset;

    },

    /**
    * Reset internal data/state.
    *
    * @method Phaser.ScaleManager#reset
    * @private
    */
    reset: function (clearWorld) {

        if (clearWorld && this.grid)
        {
            this.grid.reset();
        }

    },

    /**
    * Updates the width/height to that of the window.
    * 
    * @method Phaser.ScaleManager#setMaximum
    * @private
    */
    setMaximum: function () {

        this.width = this.dom.visualBounds.width;
        this.height = this.dom.visualBounds.height;

    },

    /**
    * Updates the width/height such that the game is scaled proportionally.
    * 
    * @method Phaser.ScaleManager#setShowAll
    * @private
    * @param {boolean} expanding - If true then the maximizing dimension is chosen.
    */
    setShowAll: function (expanding) {

        var bounds = this.getParentBounds(this._tempBounds);
        var width = bounds.width;
        var height = bounds.height;

        var multiplier;

        if (expanding)
        {
            multiplier = Math.max((height / this.game.height), (width / this.game.width));
        }
        else
        {
            multiplier = Math.min((height / this.game.height), (width / this.game.width));
        }

        this.width = Math.round(this.game.width * multiplier);
        this.height = Math.round(this.game.height * multiplier);

    },

    /**
    * Updates the width/height such that the game is stretched to the available size.
    * Honors {@link #maxWidth} and {@link #maxHeight} when _not_ in fullscreen.
    *
    * @method Phaser.ScaleManager#setExactFit
    * @private
    */
    setExactFit: function () {

        var bounds = this.getParentBounds(this._tempBounds);

        this.width = bounds.width;
        this.height = bounds.height;

        if (this.isFullScreen)
        {
            // Max/min not honored fullscreen
            return;
        }

        if (this.maxWidth)
        {
            this.width = Math.min(this.width, this.maxWidth);
        }

        if (this.maxHeight)
        {
            this.height = Math.min(this.height, this.maxHeight);
        }

    },

    /**
    * Creates a fullscreen target. This is called automatically as as needed when entering
    * fullscreen mode and the resulting element is supplied to {@link #onFullScreenInit}.
    *
    * Use {@link #onFullScreenInit} to customize the created object.
    *
    * @method Phaser.ScaleManager#createFullScreenTarget
    * @protected
    */
    createFullScreenTarget: function () {

        var fsTarget = document.createElement('div');

        fsTarget.style.margin = '0';
        fsTarget.style.padding = '0';
        fsTarget.style.background = '#000';

        return fsTarget;

    },

    /**
    * Start the browsers fullscreen mode - this _must_ be called from a user input Pointer or Mouse event.
    *
    * The Fullscreen API must be supported by the browser for this to work - it is not the same as setting
    * the game size to fill the browser window. See {@link Phaser.ScaleManager#compatibility compatibility.supportsFullScreen} to check if the current
    * device is reported to support fullscreen mode.
    *
    * The {@link #fullScreenFailed} signal will be dispatched if the fullscreen change request failed or the game does not support the Fullscreen API.
    *
    * @method Phaser.ScaleManager#startFullScreen
    * @public
    * @param {boolean} [antialias] - Changes the anti-alias feature of the canvas before jumping in to fullscreen (false = retain pixel art, true = smooth art). If not specified then no change is made. Only works in CANVAS mode.
    * @param {boolean} [allowTrampoline=undefined] - Internal argument. If `false` click trampolining is suppressed.
    * @return {boolean} Returns true if the device supports fullscreen mode and fullscreen mode was attempted to be started. (It might not actually start, wait for the signals.)
    */
    startFullScreen: function (antialias, allowTrampoline) {

        if (this.isFullScreen)
        {
            return false;
        }

        if (!this.compatibility.supportsFullScreen)
        {
            // Error is called in timeout to emulate the real fullscreenerror event better
            var _this = this;

            setTimeout(function () {
                _this.fullScreenError();
            }, 10);

            return;
        }

        if (this.compatibility.clickTrampoline === 'when-not-mouse')
        {
            var input = this.game.input;

            if (input.activePointer &&
                input.activePointer !== input.mousePointer &&
                (allowTrampoline || allowTrampoline !== false))
            {
                input.activePointer.addClickTrampoline("startFullScreen", this.startFullScreen, this, [antialias, false]);
                return;
            }
        }

        if (antialias !== undefined && this.game.renderType === Phaser.CANVAS)
        {
            this.game.stage.smoothed = antialias;
        }

        var fsTarget = this.fullScreenTarget;
        
        if (!fsTarget)
        {
            this.cleanupCreatedTarget();

            this._createdFullScreenTarget = this.createFullScreenTarget();
            fsTarget = this._createdFullScreenTarget;
        }

        var initData = {
            targetElement: fsTarget
        };

        this.hasPhaserSetFullScreen = true;

        this.onFullScreenInit.dispatch(this, initData);

        if (this._createdFullScreenTarget)
        {
            // Move the Display canvas inside of the target and add the target to the DOM
            // (The target has to be added for the Fullscreen API to work.)
            var canvas = this.game.canvas;
            var parent = canvas.parentNode;
            parent.insertBefore(fsTarget, canvas);
            fsTarget.appendChild(canvas);
        }

        if (this.game.device.fullscreenKeyboard)
        {
            fsTarget[this.game.device.requestFullscreen](Element.ALLOW_KEYBOARD_INPUT);
        }
        else
        {
            fsTarget[this.game.device.requestFullscreen]();
        }

        return true;

    },

    /**
    * Stops / exits fullscreen mode, if active.
    *
    * @method Phaser.ScaleManager#stopFullScreen
    * @public
    * @return {boolean} Returns true if the browser supports fullscreen mode and fullscreen mode will be exited.
    */
    stopFullScreen: function () {

        if (!this.isFullScreen || !this.compatibility.supportsFullScreen)
        {
            return false;
        }

        this.hasPhaserSetFullScreen = false;

        document[this.game.device.cancelFullscreen]();

        return true;

    },

    /**
    * Cleans up the previous fullscreen target, if such was automatically created.
    * This ensures the canvas is restored to its former parent, assuming the target didn't move.
    *
    * @method Phaser.ScaleManager#cleanupCreatedTarget
    * @private
    */
    cleanupCreatedTarget: function () {

        var fsTarget = this._createdFullScreenTarget;

        if (fsTarget && fsTarget.parentNode)
        {
            // Make sure to cleanup synthetic target for sure;
            // swap the canvas back to the parent.
            var parent = fsTarget.parentNode;
            parent.insertBefore(this.game.canvas, fsTarget);
            parent.removeChild(fsTarget);
        }

        this._createdFullScreenTarget = null;

    },

    /**
    * Used to prepare/restore extra fullscreen mode settings.
    * (This does move any elements within the DOM tree.)
    *
    * @method Phaser.ScaleManager#prepScreenMode
    * @private
    * @param {boolean} enteringFullscreen - True if _entering_ fullscreen, false if _leaving_.
    */
    prepScreenMode: function (enteringFullscreen) {

        var createdTarget = !!this._createdFullScreenTarget;
        var fsTarget = this._createdFullScreenTarget || this.fullScreenTarget;

        if (enteringFullscreen)
        {
            if (createdTarget || this.fullScreenScaleMode === Phaser.ScaleManager.EXACT_FIT)
            {
                // Resize target, as long as it's not the canvas
                if (fsTarget !== this.game.canvas)
                {
                    this._fullScreenRestore = {
                        targetWidth: fsTarget.style.width,
                        targetHeight: fsTarget.style.height
                    };

                    fsTarget.style.width = '100%';
                    fsTarget.style.height = '100%';
                }
            }
        }
        else
        {
            // Have restore information
            if (this._fullScreenRestore)
            {
                fsTarget.style.width = this._fullScreenRestore.targetWidth;
                fsTarget.style.height = this._fullScreenRestore.targetHeight;

                this._fullScreenRestore = null;
            }

            // Always reset to game size
            this.updateDimensions(this._gameSize.width, this._gameSize.height, true);
            this.resetCanvas();
        }

    },

    /**
    * Called automatically when the browser enters of leaves fullscreen mode.
    *
    * @method Phaser.ScaleManager#fullScreenChange
    * @private
    * @param {Event} [event=undefined] - The fullscreenchange event
    */
    fullScreenChange: function (event) {

        this.event = event;

        if (this.isFullScreen)
        {
            this.prepScreenMode(true);

            this.updateLayout();
            this.queueUpdate(true);
        }
        else
        {
            this.prepScreenMode(false);

            this.cleanupCreatedTarget();

            this.updateLayout();
            this.queueUpdate(true);
        }

        this.onFullScreenChange.dispatch(this, this.width, this.height);

    },

    /**
    * Called automatically when the browser fullscreen request fails;
    * or called when a fullscreen request is made on a device for which it is not supported.
    *
    * @method Phaser.ScaleManager#fullScreenError
    * @private
    * @param {Event} [event=undefined] - The fullscreenerror event; undefined if invoked on a device that does not support the Fullscreen API.
    */
    fullScreenError: function (event) {

        this.event = event;

        this.cleanupCreatedTarget();

        console.warn('Phaser.ScaleManager: requestFullscreen failed or device does not support the Fullscreen API');

        this.onFullScreenError.dispatch(this);

    },

    /**
    * Takes a Sprite or Image object and scales it to fit the given dimensions.
    * Scaling happens proportionally without distortion to the sprites texture.
    * The letterBox parameter controls if scaling will produce a letter-box effect or zoom the
    * sprite until it fills the given values. Note that with letterBox set to false the scaled sprite may spill out over either
    * the horizontal or vertical sides of the target dimensions. If you wish to stop this you can crop the Sprite.
    *
    * @method Phaser.ScaleManager#scaleSprite
    * @protected
    * @param {Phaser.Sprite|Phaser.Image} sprite - The sprite we want to scale.
    * @param {integer} [width] - The target width that we want to fit the sprite in to. If not given it defaults to ScaleManager.width.
    * @param {integer} [height] - The target height that we want to fit the sprite in to. If not given it defaults to ScaleManager.height.
    * @param {boolean} [letterBox=false] - True if we want the `fitted` mode. Otherwise, the function uses the `zoom` mode.
    * @return {Phaser.Sprite|Phaser.Image} The scaled sprite.
    */
    scaleSprite: function (sprite, width, height, letterBox) {

        if (width === undefined) { width = this.width; }
        if (height === undefined) { height = this.height; }
        if (letterBox === undefined) { letterBox = false; }

        if (!sprite || !sprite['scale'])
        {
            return sprite;
        }

        sprite.scale.x = 1;
        sprite.scale.y = 1;

        if ((sprite.width <= 0) || (sprite.height <= 0) || (width <= 0) || (height <= 0))
        {
            return sprite;
        }

        var scaleX1 = width;
        var scaleY1 = (sprite.height * width) / sprite.width;

        var scaleX2 = (sprite.width * height) / sprite.height;
        var scaleY2 = height;

        var scaleOnWidth = (scaleX2 > width);

        if (scaleOnWidth)
        {
            scaleOnWidth = letterBox;
        }
        else
        {
            scaleOnWidth = !letterBox;
        }

        if (scaleOnWidth)
        {
            sprite.width = Math.floor(scaleX1);
            sprite.height = Math.floor(scaleY1);
        }
        else
        {
            sprite.width = Math.floor(scaleX2);
            sprite.height = Math.floor(scaleY2);
        }

        //  Enable at some point?
        // sprite.x = Math.floor((width - sprite.width) / 2);
        // sprite.y = Math.floor((height - sprite.height) / 2);

        return sprite;

    },

    /**
    * Destroys the ScaleManager and removes any event listeners.
    * This should probably only be called when the game is destroyed.
    *
    * @method Phaser.ScaleManager#destroy
    * @protected
    */
    destroy: function () {

        this.game.onResume.remove(this._gameResumed, this);

        window.removeEventListener('orientationchange', this._orientationChange, false);
        window.removeEventListener('resize', this._windowResize, false);

        if (this.compatibility.supportsFullScreen)
        {
            document.removeEventListener('webkitfullscreenchange', this._fullScreenChange, false);
            document.removeEventListener('mozfullscreenchange', this._fullScreenChange, false);
            document.removeEventListener('MSFullscreenChange', this._fullScreenChange, false);
            document.removeEventListener('fullscreenchange', this._fullScreenChange, false);

            document.removeEventListener('webkitfullscreenerror', this._fullScreenError, false);
            document.removeEventListener('mozfullscreenerror', this._fullScreenError, false);
            document.removeEventListener('MSFullscreenError', this._fullScreenError, false);
            document.removeEventListener('fullscreenerror', this._fullScreenError, false);
        }

    }

};

Phaser.ScaleManager.prototype.constructor = Phaser.ScaleManager;

/**
* The DOM element that is considered the Parent bounding element, if any.
*
* This `null` if {@link #parentIsWindow} is true or if fullscreen mode is entered and {@link #fullScreenTarget} is specified.
* It will also be null if there is no game canvas or if the game canvas has no parent.
*
* @name Phaser.ScaleManager#boundingParent
* @property {?DOMElement} boundingParent
* @readonly
*/
Object.defineProperty(Phaser.ScaleManager.prototype, "boundingParent", {

    get: function () {

        if (this.parentIsWindow ||
            (this.isFullScreen && this.hasPhaserSetFullScreen && !this._createdFullScreenTarget))
        {
            return null;
        }

        var parentNode = this.game.canvas && this.game.canvas.parentNode;

        return parentNode || null;

    }

});

/**
* The scaling method used by the ScaleManager when not in fullscreen.
* 
* <dl>
*   <dt>{@link Phaser.ScaleManager.NO_SCALE}</dt>
*   <dd>
*       The Game display area will not be scaled - even if it is too large for the canvas/screen.
*       This mode _ignores_ any applied scaling factor and displays the canvas at the Game size.
*   </dd>
*   <dt>{@link Phaser.ScaleManager.EXACT_FIT}</dt>
*   <dd>
*       The Game display area will be _stretched_ to fill the entire size of the canvas's parent element and/or screen.
*       Proportions are not maintained.
*   </dd>
*   <dt>{@link Phaser.ScaleManager.SHOW_ALL}</dt>
*   <dd>
*       Show the entire game display area while _maintaining_ the original aspect ratio.
*   </dd>
*   <dt>{@link Phaser.ScaleManager.RESIZE}</dt>
*   <dd>
*       The dimensions of the game display area are changed to match the size of the parent container.
*       That is, this mode _changes the Game size_ to match the display size.
*       <p>
*       Any manually set Game size (see {@link #setGameSize}) is ignored while in effect.
*   </dd>
*   <dt>{@link Phaser.ScaleManager.USER_SCALE}</dt>
*   <dd>
*       The game Display is scaled according to the user-specified scale set by {@link Phaser.ScaleManager#setUserScale setUserScale}.
*       <p>
*       This scale can be adjusted in the {@link Phaser.ScaleManager#setResizeCallback resize callback}
*       for flexible custom-sizing needs.
*   </dd>
* </dl>
*
* @name Phaser.ScaleManager#scaleMode
* @property {integer} scaleMode
*/
Object.defineProperty(Phaser.ScaleManager.prototype, "scaleMode", {

    get: function () {

        return this._scaleMode;

    },

    set: function (value) {

        if (value !== this._scaleMode)
        {
            if (!this.isFullScreen)
            {
                this.updateDimensions(this._gameSize.width, this._gameSize.height, true);
                this.queueUpdate(true);
            }

            this._scaleMode = value;
        }

        return this._scaleMode;

    }

});

/**
* The scaling method used by the ScaleManager when in fullscreen.
*
* See {@link Phaser.ScaleManager#scaleMode scaleMode} for the different modes allowed.
*
* @name Phaser.ScaleManager#fullScreenScaleMode
* @property {integer} fullScreenScaleMode
*/
Object.defineProperty(Phaser.ScaleManager.prototype, "fullScreenScaleMode", {

    get: function () {

        return this._fullScreenScaleMode;

    },

    set: function (value) {

        if (value !== this._fullScreenScaleMode)
        {
            // If in fullscreen then need a wee bit more work
            if (this.isFullScreen)
            {
                this.prepScreenMode(false);
                this._fullScreenScaleMode = value;
                this.prepScreenMode(true);

                this.queueUpdate(true);
            }
            else
            {
                this._fullScreenScaleMode = value;
            }
        }

        return this._fullScreenScaleMode;

    }

});

/**
* Returns the current scale mode - for normal or fullscreen operation.
*
* See {@link Phaser.ScaleManager#scaleMode scaleMode} for the different modes allowed.
*
* @name Phaser.ScaleManager#currentScaleMode
* @property {number} currentScaleMode
* @protected
* @readonly
*/
Object.defineProperty(Phaser.ScaleManager.prototype, "currentScaleMode", {

    get: function () {

        return this.isFullScreen ? this._fullScreenScaleMode : this._scaleMode;

    }

});

/**
* When enabled the Display canvas will be horizontally-aligned _in the Parent container_ (or {@link Phaser.ScaleManager#parentIsWindow window}).
*
* To align horizontally across the page the Display canvas should be added directly to page;
* or the parent container should itself be horizontally aligned.
*
* Horizontal alignment is not applicable with the {@link .RESIZE} scaling mode.
*
* @name Phaser.ScaleManager#pageAlignHorizontally
* @property {boolean} pageAlignHorizontally
* @default false
*/
Object.defineProperty(Phaser.ScaleManager.prototype, "pageAlignHorizontally", {

    get: function () {

        return this._pageAlignHorizontally;

    },

    set: function (value) {

        if (value !== this._pageAlignHorizontally)
        {
            this._pageAlignHorizontally = value;
            this.queueUpdate(true);
        }

    }

});

/**
* When enabled the Display canvas will be vertically-aligned _in the Parent container_ (or {@link Phaser.ScaleManager#parentIsWindow window}).
*
* To align vertically the Parent element should have a _non-collapsible_ height, such that it will maintain
* a height _larger_ than the height of the contained Game canvas - the game canvas will then be scaled vertically
* _within_ the remaining available height dictated by the Parent element.
*
* One way to prevent the parent from collapsing is to add an absolute "min-height" CSS property to the parent element.
* If specifying a relative "min-height/height" or adjusting margins, the Parent height must still be non-collapsible (see note).
*
* _Note_: In version 2.2 the minimum document height is _not_ automatically set to the viewport/window height.
* To automatically update the minimum document height set {@link Phaser.ScaleManager#compatibility compatibility.forceMinimumDocumentHeight} to true.
*
* Vertical alignment is not applicable with the {@link .RESIZE} scaling mode.
*
* @name Phaser.ScaleManager#pageAlignVertically
* @property {boolean} pageAlignVertically
* @default false
*/
Object.defineProperty(Phaser.ScaleManager.prototype, "pageAlignVertically", {

    get: function () {

        return this._pageAlignVertically;

    },

    set: function (value) {

        if (value !== this._pageAlignVertically)
        {
            this._pageAlignVertically = value;
            this.queueUpdate(true);
        }

    }

});

/**
* Returns true if the browser is in fullscreen mode, otherwise false.
* @name Phaser.ScaleManager#isFullScreen
* @property {boolean} isFullScreen
* @readonly
*/
Object.defineProperty(Phaser.ScaleManager.prototype, "isFullScreen", {

    get: function () {
        return !!(document['fullscreenElement'] ||
            document['webkitFullscreenElement'] ||
            document['mozFullScreenElement'] ||
            document['msFullscreenElement']);
    }

});

/**
* Returns true if the screen orientation is in portrait mode.
*
* @name Phaser.ScaleManager#isPortrait
* @property {boolean} isPortrait
* @readonly
*/
Object.defineProperty(Phaser.ScaleManager.prototype, "isPortrait", {

    get: function () {
        return this.classifyOrientation(this.screenOrientation) === 'portrait';
    }

});

/**
* Returns true if the screen orientation is in landscape mode.
*
* @name Phaser.ScaleManager#isLandscape
* @property {boolean} isLandscape
* @readonly
*/
Object.defineProperty(Phaser.ScaleManager.prototype, "isLandscape", {

    get: function () {
        return this.classifyOrientation(this.screenOrientation) === 'landscape';
    }

});

/**
* Returns true if the game dimensions are portrait (height > width).
* This is especially useful to check when using the RESIZE scale mode 
* but wanting to maintain game orientation on desktop browsers, 
* where typically the screen orientation will always be landscape regardless of the browser viewport.
*
* @name Phaser.ScaleManager#isGamePortrait
* @property {boolean} isGamePortrait
* @readonly
*/
Object.defineProperty(Phaser.ScaleManager.prototype, "isGamePortrait", {

    get: function () {
        return (this.height > this.width);
    }

});

/**
* Returns true if the game dimensions are landscape (width > height).
* This is especially useful to check when using the RESIZE scale mode 
* but wanting to maintain game orientation on desktop browsers, 
* where typically the screen orientation will always be landscape regardless of the browser viewport.
*
* @name Phaser.ScaleManager#isGameLandscape
* @property {boolean} isGameLandscape
* @readonly
*/
Object.defineProperty(Phaser.ScaleManager.prototype, "isGameLandscape", {

    get: function () {
        return (this.width > this.height);
    }

});

