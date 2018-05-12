import PIXI from './pixi-wx.js';
import Phaser from './phaser-wx-main.js';
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A collection of methods for displaying debug information about game objects.
*
* If your game is running in Canvas mode, then you should invoke all of the Debug methods from
* your games `render` function. This is because they are drawn directly onto the game canvas
* itself, so if you call any debug methods outside of `render` they are likely to be overwritten
* by the game itself.
* 
* If your game is running in WebGL then Debug will create a Sprite that is placed at the top of the Stage display list and bind a canvas texture
* to it, which must be uploaded every frame. Be advised: this is very expensive, especially in browsers like Firefox. So please only enable Debug
* in WebGL mode if you really need it (or your desktop can cope with it well) and disable it for production!
*
* @class Phaser.Utils.Debug
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.Utils.Debug = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;

    /**
    * @property {Phaser.Image} sprite - If debugging in WebGL mode we need this.
    */
    this.sprite = null;

    /**
    * @property {Phaser.BitmapData} bmd - In WebGL mode this BitmapData contains a copy of the debug canvas.
    */
    this.bmd = null;

    /**
    * @property {HTMLCanvasElement} canvas - The canvas to which Debug calls draws.
    */
    this.canvas = null;

    /**
    * @property {CanvasRenderingContext2D} context - The 2d context of the canvas.
    */
    this.context = null;

    /**
    * @property {string} font - The font that the debug information is rendered in.
    * @default '14px Courier'
    */
    this.font = '14px Courier';

    /**
    * @property {number} columnWidth - The spacing between columns.
    */
    this.columnWidth = 100;

    /**
    * @property {number} lineHeight - The line height between the debug text.
    */
    this.lineHeight = 16;

    /**
    * @property {boolean} renderShadow - Should the text be rendered with a slight shadow? Makes it easier to read on different types of background.
    */
    this.renderShadow = true;

    /**
    * @property {number} currentX - The current X position the debug information will be rendered at.
    * @default
    */
    this.currentX = 0;

    /**
    * @property {number} currentY - The current Y position the debug information will be rendered at.
    * @default
    */
    this.currentY = 0;

    /**
    * @property {number} currentAlpha - The alpha of the Debug context, set before all debug information is rendered to it.
    * @default
    */
    this.currentAlpha = 1;

    /**
    * @property {boolean} dirty - Does the canvas need re-rendering?
    */
    this.dirty = false;

};

Phaser.Utils.Debug.prototype = {

    /**
    * Internal method that boots the debug displayer.
    *
    * @method Phaser.Utils.Debug#boot
    * @protected
    */
    boot: function () {

        if (this.game.renderType === Phaser.CANVAS)
        {
            this.context = this.game.context;
        }
        else
        {
            this.bmd = new Phaser.BitmapData(this.game, '__DEBUG', this.game.width, this.game.height, true);
            this.sprite = this.game.make.image(0, 0, this.bmd);
            this.game.stage.addChild(this.sprite);

            this.game.scale.onSizeChange.add(this.resize, this);

            this.canvas = PIXI.CanvasPool.create(this, this.game.width, this.game.height);
            this.context = this.canvas.getContext('2d');
        }

    },

    /**
    * Internal method that resizes the BitmapData and Canvas.
    * Called by ScaleManager.onSizeChange only in WebGL mode.
    *
    * @method Phaser.Utils.Debug#resize
    * @protected
    * @param {Phaser.ScaleManager} scaleManager - The Phaser ScaleManager.
    * @param {number} width - The new width of the game.
    * @param {number} height - The new height of the game.
    */
    resize: function (scaleManager, width, height) {

        this.bmd.resize(width, height);

        this.canvas.width = width;
        this.canvas.height = height;

    },

    /**
    * Internal method that clears the canvas (if a Sprite) ready for a new debug session.
    *
    * @method Phaser.Utils.Debug#preUpdate
    * @protected
    */
    preUpdate: function () {

        if (this.dirty && this.sprite)
        {
            this.bmd.clear();
            this.bmd.draw(this.canvas, 0, 0);

            this.context.clearRect(0, 0, this.game.width, this.game.height);
            this.dirty = false;
        }

    },

    /**
    * Clears the Debug canvas.
    *
    * @method Phaser.Utils.Debug#reset
    */
    reset: function () {

        if (this.context)
        {
            this.context.clearRect(0, 0, this.game.width, this.game.height);
        }

        if (this.sprite)
        {
            this.bmd.clear();
        }

    },

    /**
    * Internal method that resets and starts the debug output values.
    *
    * @method Phaser.Utils.Debug#start
    * @protected
    * @param {number} [x=0] - The X value the debug info will start from.
    * @param {number} [y=0] - The Y value the debug info will start from.
    * @param {string} [color='rgb(255,255,255)'] - The color the debug text will drawn in.
    * @param {number} [columnWidth=0] - The spacing between columns.
    */
    start: function (x, y, color, columnWidth) {

        if (typeof x !== 'number') { x = 0; }
        if (typeof y !== 'number') { y = 0; }
        color = color || 'rgb(255,255,255)';
        if (columnWidth === undefined) { columnWidth = 0; }

        this.currentX = x;
        this.currentY = y;
        this.currentColor = color;
        this.columnWidth = columnWidth;

        this.dirty = true;

        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.strokeStyle = color;
        this.context.fillStyle = color;
        this.context.font = this.font;
        this.context.globalAlpha = this.currentAlpha;

    },

    /**
    * Internal method that stops the debug output.
    *
    * @method Phaser.Utils.Debug#stop
    * @protected
    */
    stop: function () {

        this.context.restore();

    },

    /**
    * Internal method that outputs a single line of text split over as many columns as needed, one per parameter.
    *
    * @method Phaser.Utils.Debug#line
    * @protected
    */
    line: function () {

        var x = this.currentX;

        for (var i = 0; i < arguments.length; i++)
        {
            if (this.renderShadow)
            {
                this.context.fillStyle = 'rgb(0,0,0)';
                this.context.fillText(arguments[i], x + 1, this.currentY + 1);
                this.context.fillStyle = this.currentColor;
            }

            this.context.fillText(arguments[i], x, this.currentY);

            x += this.columnWidth;
        }

        this.currentY += this.lineHeight;

    },

    /**
    * Render Sound information, including decoded state, duration, volume and more.
    *
    * @method Phaser.Utils.Debug#soundInfo
    * @param {Phaser.Sound} sound - The sound object to debug.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    soundInfo: function (sound, x, y, color) {

        this.start(x, y, color);
        this.line('Sound: ' + sound.key + ' Locked: ' + sound.game.sound.touchLocked);
        this.line('Is Ready?: ' + this.game.cache.isSoundReady(sound.key) + ' Pending Playback: ' + sound.pendingPlayback);
        this.line('Decoded: ' + sound.isDecoded + ' Decoding: ' + sound.isDecoding);
        this.line('Total Duration: ' + sound.totalDuration + ' Playing: ' + sound.isPlaying);
        this.line('Time: ' + sound.currentTime);
        this.line('Volume: ' + sound.volume + ' Muted: ' + sound.mute);
        this.line('WebAudio: ' + sound.usingWebAudio + ' Audio: ' + sound.usingAudioTag);

        if (sound.currentMarker !== '')
        {
            this.line('Marker: ' + sound.currentMarker + ' Duration: ' + sound.duration + ' (ms: ' + sound.durationMS + ')');
            this.line('Start: ' + sound.markers[sound.currentMarker].start + ' Stop: ' + sound.markers[sound.currentMarker].stop);
            this.line('Position: ' + sound.position);
        }

        this.stop();

    },

    /**
    * Render camera information including dimensions and location.
    *
    * @method Phaser.Utils.Debug#cameraInfo
    * @param {Phaser.Camera} camera - The Phaser.Camera to show the debug information for.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    cameraInfo: function (camera, x, y, color) {

        this.start(x, y, color);
        this.line('Camera (' + camera.width + ' x ' + camera.height + ')');
        this.line('X: ' + camera.x + ' Y: ' + camera.y);

        if (camera.bounds)
        {
            this.line('Bounds x: ' + camera.bounds.x + ' Y: ' + camera.bounds.y + ' w: ' + camera.bounds.width + ' h: ' + camera.bounds.height);
        }

        this.line('View x: ' + camera.view.x + ' Y: ' + camera.view.y + ' w: ' + camera.view.width + ' h: ' + camera.view.height);
        // this.line('Screen View x: ' + camera.screenView.x + ' Y: ' + camera.screenView.y + ' w: ' + camera.screenView.width + ' h: ' + camera.screenView.height);
        this.line('Total in view: ' + camera.totalInView);
        this.stop();

    },

    /**
    * Render Timer information.
    *
    * @method Phaser.Utils.Debug#timer
    * @param {Phaser.Timer} timer - The Phaser.Timer to show the debug information for.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    timer: function (timer, x, y, color) {

        this.start(x, y, color);
        this.line('Timer (running: ' + timer.running + ' expired: ' + timer.expired + ')');
        this.line('Next Tick: ' + timer.next + ' Duration: ' + timer.duration);
        this.line('Paused: ' + timer.paused + ' Length: ' + timer.length);
        this.stop();

    },

    /**
    * Renders the Pointer.circle object onto the stage in green if down or red if up along with debug text.
    *
    * @method Phaser.Utils.Debug#pointer
    * @param {Phaser.Pointer} pointer - The Pointer you wish to display.
    * @param {boolean} [hideIfUp=false] - Doesn't render the circle if the pointer is up.
    * @param {string} [downColor='rgba(0,255,0,0.5)'] - The color the circle is rendered in if down.
    * @param {string} [upColor='rgba(255,0,0,0.5)'] - The color the circle is rendered in if up (and hideIfUp is false).
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    pointer: function (pointer, hideIfUp, downColor, upColor, color) {

        if (pointer == null)
        {
            return;
        }

        if (hideIfUp === undefined) { hideIfUp = false; }
        downColor = downColor || 'rgba(0,255,0,0.5)';
        upColor = upColor || 'rgba(255,0,0,0.5)';

        if (hideIfUp === true && pointer.isUp === true)
        {
            return;
        }

        this.start(pointer.x, pointer.y - 100, color);
        this.context.beginPath();
        this.context.arc(pointer.x, pointer.y, pointer.circle.radius, 0, Math.PI * 2);

        if (pointer.active)
        {
            this.context.fillStyle = downColor;
        }
        else
        {
            this.context.fillStyle = upColor;
        }

        this.context.fill();
        this.context.closePath();

        //  Render the points
        this.context.beginPath();
        this.context.moveTo(pointer.positionDown.x, pointer.positionDown.y);
        this.context.lineTo(pointer.position.x, pointer.position.y);
        this.context.lineWidth = 2;
        this.context.stroke();
        this.context.closePath();

        //  Render the text
        this.line('ID: ' + pointer.id + " Active: " + pointer.active);
        this.line('World X: ' + pointer.worldX + " World Y: " + pointer.worldY);
        this.line('Screen X: ' + pointer.x + " Screen Y: " + pointer.y + " In: " + pointer.withinGame);
        this.line('Duration: ' + pointer.duration + " ms");
        this.line('is Down: ' + pointer.isDown + " is Up: " + pointer.isUp);
        this.stop();

    },

    /**
    * Render Sprite Input Debug information.
    *
    * @method Phaser.Utils.Debug#spriteInputInfo
    * @param {Phaser.Sprite|Phaser.Image} sprite - The sprite to display the input data for.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    spriteInputInfo: function (sprite, x, y, color) {

        this.start(x, y, color);
        this.line('Sprite Input: (' + sprite.width + ' x ' + sprite.height + ')');
        this.line('x: ' + sprite.input.pointerX().toFixed(1) + ' y: ' + sprite.input.pointerY().toFixed(1));
        this.line('over: ' + sprite.input.pointerOver() + ' duration: ' + sprite.input.overDuration().toFixed(0));
        this.line('down: ' + sprite.input.pointerDown() + ' duration: ' + sprite.input.downDuration().toFixed(0));
        this.line('just over: ' + sprite.input.justOver() + ' just out: ' + sprite.input.justOut());
        this.stop();

    },

    /**
    * Renders Phaser.Key object information.
    *
    * @method Phaser.Utils.Debug#key
    * @param {Phaser.Key} key - The Key to render the information for.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    key: function (key, x, y, color) {

        this.start(x, y, color, 150);

        this.line('Key:', key.keyCode, 'isDown:', key.isDown);
        this.line('justDown:', key.justDown, 'justUp:', key.justUp);
        this.line('Time Down:', key.timeDown.toFixed(0), 'duration:', key.duration.toFixed(0));

        this.stop();

    },

    /**
    * Render debug information about the Input object.
    *
    * @method Phaser.Utils.Debug#inputInfo
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    inputInfo: function (x, y, color) {

        this.start(x, y, color);
        this.line('Input');
        this.line('X: ' + this.game.input.x + ' Y: ' + this.game.input.y);
        this.line('World X: ' + this.game.input.worldX + ' World Y: ' + this.game.input.worldY);
        this.line('Scale X: ' + this.game.input.scale.x.toFixed(1) + ' Scale Y: ' + this.game.input.scale.x.toFixed(1));
        this.line('Screen X: ' + this.game.input.activePointer.screenX + ' Screen Y: ' + this.game.input.activePointer.screenY);
        this.stop();

    },

    /**
    * Renders the Sprites bounds. Note: This is really expensive as it has to calculate the bounds every time you call it!
    *
    * @method Phaser.Utils.Debug#spriteBounds
    * @param {Phaser.Sprite|Phaser.Image} sprite - The sprite to display the bounds of.
    * @param {string} [color] - Color of the debug info to be rendered (format is css color string).
    * @param {boolean} [filled=true] - Render the rectangle as a fillRect (default, true) or a strokeRect (false)
    */
    spriteBounds: function (sprite, color, filled) {

        var bounds = sprite.getBounds();

        bounds.x += this.game.camera.x;
        bounds.y += this.game.camera.y;

        this.rectangle(bounds, color, filled);

    },

    /**
    * Renders the Rope's segments. Note: This is really expensive as it has to calculate new segments every time you call it
    *
    * @method Phaser.Utils.Debug#ropeSegments
    * @param {Phaser.Rope} rope - The rope to display the segments of.
    * @param {string} [color] - Color of the debug info to be rendered (format is css color string).
    * @param {boolean} [filled=true] - Render the rectangle as a fillRect (default, true) or a strokeRect (false)
    */
    ropeSegments: function (rope, color, filled) {

        var segments = rope.segments;

        var self = this;

        segments.forEach(function(segment) {
            self.rectangle(segment, color, filled);
        }, this);

    },

    /**
    * Render debug infos (including name, bounds info, position and some other properties) about the Sprite.
    *
    * @method Phaser.Utils.Debug#spriteInfo
    * @param {Phaser.Sprite} sprite - The Sprite to display the information of.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    spriteInfo: function (sprite, x, y, color) {

        this.start(x, y, color);

        this.line('Sprite: ' + ' (' + sprite.width + ' x ' + sprite.height + ') anchor: ' + sprite.anchor.x + ' x ' + sprite.anchor.y);
        this.line('x: ' + sprite.x.toFixed(1) + ' y: ' + sprite.y.toFixed(1));
        this.line('angle: ' + sprite.angle.toFixed(1) + ' rotation: ' + sprite.rotation.toFixed(1));
        this.line('visible: ' + sprite.visible + ' in camera: ' + sprite.inCamera);
        this.line('bounds x: ' + sprite._bounds.x.toFixed(1) + ' y: ' + sprite._bounds.y.toFixed(1) + ' w: ' + sprite._bounds.width.toFixed(1) + ' h: ' + sprite._bounds.height.toFixed(1));

        this.stop();

    },

    /**
    * Renders the sprite coordinates in local, positional and world space.
    *
    * @method Phaser.Utils.Debug#spriteCoords
    * @param {Phaser.Sprite|Phaser.Image} sprite - The sprite to display the coordinates for.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    spriteCoords: function (sprite, x, y, color) {

        this.start(x, y, color, 100);

        if (sprite.name)
        {
            this.line(sprite.name);
        }

        this.line('x:', sprite.x.toFixed(2), 'y:', sprite.y.toFixed(2));
        this.line('pos x:', sprite.position.x.toFixed(2), 'pos y:', sprite.position.y.toFixed(2));
        this.line('world x:', sprite.world.x.toFixed(2), 'world y:', sprite.world.y.toFixed(2));

        this.stop();

    },

    /**
    * Renders Line information in the given color.
    *
    * @method Phaser.Utils.Debug#lineInfo
    * @param {Phaser.Line} line - The Line to display the data for.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    lineInfo: function (line, x, y, color) {

        this.start(x, y, color, 80);
        this.line('start.x:', line.start.x.toFixed(2), 'start.y:', line.start.y.toFixed(2));
        this.line('end.x:', line.end.x.toFixed(2), 'end.y:', line.end.y.toFixed(2));
        this.line('length:', line.length.toFixed(2), 'angle:', line.angle);
        this.stop();

    },

    /**
    * Renders a single pixel at the given size.
    *
    * @method Phaser.Utils.Debug#pixel
    * @param {number} x - X position of the pixel to be rendered.
    * @param {number} y - Y position of the pixel to be rendered.
    * @param {string} [color] - Color of the pixel (format is css color string).
    * @param {number} [size=2] - The 'size' to render the pixel at.
    */
    pixel: function (x, y, color, size) {

        size = size || 2;

        this.start();
        this.context.fillStyle = color;
        this.context.fillRect(x, y, size, size);
        this.stop();

    },

    /**
    * Renders a Phaser geometry object including Rectangle, Circle, Point or Line.
    *
    * @method Phaser.Utils.Debug#geom
    * @param {Phaser.Rectangle|Phaser.Circle|Phaser.Point|Phaser.Line} object - The geometry object to render.
    * @param {string} [color] - Color of the debug info to be rendered (format is css color string).
    * @param {boolean} [filled=true] - Render the objected as a filled (default, true) or a stroked (false)
    * @param {number} [forceType=0] - Force rendering of a specific type. If 0 no type will be forced, otherwise 1 = Rectangle, 2 = Circle, 3 = Point and 4 = Line.
    */
    geom: function (object, color, filled, forceType) {

        if (filled === undefined) { filled = true; }
        if (forceType === undefined) { forceType = 0; }

        color = color || 'rgba(0,255,0,0.4)';

        this.start();

        this.context.fillStyle = color;
        this.context.strokeStyle = color;

        if (object instanceof Phaser.Rectangle || forceType === 1)
        {
            if (filled)
            {
                this.context.fillRect(object.x - this.game.camera.x, object.y - this.game.camera.y, object.width, object.height);
            }
            else
            {
                this.context.strokeRect(object.x - this.game.camera.x, object.y - this.game.camera.y, object.width, object.height);
            }
        }
        else if (object instanceof Phaser.Circle || forceType === 2)
        {
            this.context.beginPath();
            this.context.arc(object.x - this.game.camera.x, object.y - this.game.camera.y, object.radius, 0, Math.PI * 2, false);
            this.context.closePath();

            if (filled)
            {
                this.context.fill();
            }
            else
            {
                this.context.stroke();
            }
        }
        else if (object instanceof Phaser.Point || forceType === 3)
        {
            this.context.fillRect(object.x - this.game.camera.x, object.y - this.game.camera.y, 4, 4);
        }
        else if (object instanceof Phaser.Line || forceType === 4)
        {
            this.context.lineWidth = 1;
            this.context.beginPath();
            this.context.moveTo((object.start.x + 0.5) - this.game.camera.x, (object.start.y + 0.5) - this.game.camera.y);
            this.context.lineTo((object.end.x + 0.5) - this.game.camera.x, (object.end.y + 0.5) - this.game.camera.y);
            this.context.closePath();
            this.context.stroke();
        }

        this.stop();

    },

    /**
    * Renders a Rectangle.
    *
    * @method Phaser.Utils.Debug#geom
    * @param {Phaser.Rectangle|object} object - The geometry object to render.
    * @param {string} [color] - Color of the debug info to be rendered (format is css color string).
    * @param {boolean} [filled=true] - Render the objected as a filled (default, true) or a stroked (false)
    */
    rectangle: function (object, color, filled) {

        if (filled === undefined) { filled = true; }

        color = color || 'rgba(0, 255, 0, 0.4)';

        this.start();

        if (filled)
        {
            this.context.fillStyle = color;
            this.context.fillRect(object.x - this.game.camera.x, object.y - this.game.camera.y, object.width, object.height);
        }
        else
        {
            this.context.strokeStyle = color;
            this.context.strokeRect(object.x - this.game.camera.x, object.y - this.game.camera.y, object.width, object.height);
        }

        this.stop();

    },

    /**
    * Render a string of text.
    *
    * @method Phaser.Utils.Debug#text
    * @param {string} text - The line of text to draw.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color] - Color of the debug info to be rendered (format is css color string).
    * @param {string} [font] - The font of text to draw.
    */
    text: function (text, x, y, color, font) {

        color = color || 'rgb(255,255,255)';
        font = font || '16px Courier';

        this.start();
        this.context.font = font;

        if (this.renderShadow)
        {
            this.context.fillStyle = 'rgb(0,0,0)';
            this.context.fillText(text, x + 1, y + 1);
        }

        this.context.fillStyle = color;
        this.context.fillText(text, x, y);

        this.stop();

    },

    /**
    * Visually renders a QuadTree to the display.
    *
    * @method Phaser.Utils.Debug#quadTree
    * @param {Phaser.QuadTree} quadtree - The quadtree to render.
    * @param {string} color - The color of the lines in the quadtree.
    */
    quadTree: function (quadtree, color) {

        color = color || 'rgba(255,0,0,0.3)';

        this.start();

        var bounds = quadtree.bounds;

        if (quadtree.nodes.length === 0)
        {
            this.context.strokeStyle = color;
            this.context.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            this.text('size: ' + quadtree.objects.length, bounds.x + 4, bounds.y + 16, 'rgb(0,200,0)', '12px Courier');

            this.context.strokeStyle = 'rgb(0,255,0)';

            for (var i = 0; i < quadtree.objects.length; i++)
            {
                this.context.strokeRect(quadtree.objects[i].x, quadtree.objects[i].y, quadtree.objects[i].width, quadtree.objects[i].height);
            }
        }
        else
        {
            for (var i = 0; i < quadtree.nodes.length; i++)
            {
                this.quadTree(quadtree.nodes[i]);
            }
        }

        this.stop();

    },

    /**
    * Render a Sprites Physics body if it has one set. The body is rendered as a filled or stroked rectangle.
    * This only works for Arcade Physics, Ninja Physics (AABB and Circle only) and Box2D Physics bodies.
    * To display a P2 Physics body you should enable debug mode on the body when creating it.
    *
    * @method Phaser.Utils.Debug#body
    * @param {Phaser.Sprite} sprite - The Sprite who's body will be rendered.
    * @param {string} [color='rgba(0,255,0,0.4)'] - Color of the debug rectangle to be rendered. The format is a CSS color string such as '#ff0000' or 'rgba(255,0,0,0.5)'.
    * @param {boolean} [filled=true] - Render the body as a filled rectangle (true) or a stroked rectangle (false)
    */
    body: function (sprite, color, filled) {

        if (sprite.body)
        {
            this.start();

            if (sprite.body.type === Phaser.Physics.ARCADE)
            {
                Phaser.Physics.Arcade.Body.render(this.context, sprite.body, color, filled);
            }
            else if (sprite.body.type === Phaser.Physics.NINJA)
            {
                Phaser.Physics.Ninja.Body.render(this.context, sprite.body, color, filled);
            }
            else if (sprite.body.type === Phaser.Physics.BOX2D)
            {
                Phaser.Physics.Box2D.renderBody(this.context, sprite.body, color);
            }

            this.stop();
        }

    },

    /**
    * Render a Sprites Physic Body information.
    *
    * @method Phaser.Utils.Debug#bodyInfo
    * @param {Phaser.Sprite} sprite - The sprite to be rendered.
    * @param {number} x - X position of the debug info to be rendered.
    * @param {number} y - Y position of the debug info to be rendered.
    * @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
    */
    bodyInfo: function (sprite, x, y, color) {

        if (sprite.body)
        {
            this.start(x, y, color, 210);

            if (sprite.body.type === Phaser.Physics.ARCADE)
            {
                Phaser.Physics.Arcade.Body.renderBodyInfo(this, sprite.body);
            }
            else if (sprite.body.type === Phaser.Physics.BOX2D)
            {
                this.game.physics.box2d.renderBodyInfo(this, sprite.body);
            }

            this.stop();
        }

    },

    /**
    * Renders 'debug draw' data for the Box2D world if it exists.
    * This uses the standard debug drawing feature of Box2D, so colors will be decided by
    * the Box2D engine.
    *
    * @method Phaser.Utils.Debug#box2dWorld
    */
    box2dWorld: function () {
    
        this.start();
        
        this.context.translate(-this.game.camera.view.x, -this.game.camera.view.y, 0);
        this.game.physics.box2d.renderDebugDraw(this.context);
        
        this.stop();

    },

    /**
    * Renders 'debug draw' data for the given Box2D body.
    * This uses the standard debug drawing feature of Box2D, so colors will be decided by the Box2D engine.
    *
    * @method Phaser.Utils.Debug#box2dBody
    * @param {Phaser.Sprite} sprite - The sprite whos body will be rendered.
    * @param {string} [color='rgb(0,255,0)'] - color of the debug info to be rendered. (format is css color string).
    */
    box2dBody: function (body, color) {
    
        this.start();
        Phaser.Physics.Box2D.renderBody(this.context, body, color);
        this.stop();

    },

    /**
    * Call this function from the Dev Tools console.
    * 
    * It will scan the display list and output all of the Objects it finds, and their renderOrderIDs.
    *
    * **Note** Requires a browser that supports console.group and console.groupEnd (such as Chrome)
    *
    * @method displayList
    * @param {Object} [displayObject] - The displayObject level display object to start from. Defaults to the World.
    */
    displayList: function (displayObject) {

        if (displayObject === undefined) { displayObject = this.game.world; }

        if (displayObject.hasOwnProperty('renderOrderID'))
        {
            console.log('[' + displayObject.renderOrderID + ']', displayObject);
        }
        else
        {
            console.log('[]', displayObject);
        }

        if (displayObject.children && displayObject.children.length > 0)
        {
            for (var i = 0; i < displayObject.children.length; i++)
            {
                this.game.debug.displayList(displayObject.children[i]);
            }
        }

    },

    /**
    * Destroy this object.
    *
    * @method Phaser.Utils.Debug#destroy
    */
    destroy: function () {
    
        PIXI.CanvasPool.remove(this);

    }

};

Phaser.Utils.Debug.prototype.constructor = Phaser.Utils.Debug;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* DOM utility class.
*
* Provides a useful Window and Element functions as well as cross-browser compatibility buffer.
*
* Some code originally derived from {@link https://github.com/ryanve/verge verge}.
* Some parts were inspired by the research of Ryan Van Etten, released under MIT License 2013.
* 
* @class Phaser.DOM
* @static
*/
Phaser.DOM = {

    /**
    * Get the [absolute] position of the element relative to the Document.
    *
    * The value may vary slightly as the page is scrolled due to rounding errors.
    *
    * @method Phaser.DOM.getOffset
    * @param {DOMElement} element - The targeted element that we want to retrieve the offset.
    * @param {Phaser.Point} [point] - The point we want to take the x/y values of the offset.
    * @return {Phaser.Point} - A point objet with the offsetX and Y as its properties.
    */
    getOffset: function (element, point) {

        point = point || new Phaser.Point();

        var box = element.getBoundingClientRect();

        var scrollTop = Phaser.DOM.scrollY || 0;
        var scrollLeft = Phaser.DOM.scrollX || 0;
        var clientTop = document.documentElement.clientTop || 0;
        var clientLeft = document.documentElement.clientLeft || 0;

        point.x = box.left + scrollLeft - clientLeft;
        point.y = box.top + scrollTop - clientTop;

        return point;

    },

    /**
    * A cross-browser element.getBoundingClientRect method with optional cushion.
    * 
    * Returns a plain object containing the properties `top/bottom/left/right/width/height` with respect to the top-left corner of the current viewport.
    * Its properties match the native rectangle.
    * The cushion parameter is an amount of pixels (+/-) to cushion the element.
    * It adjusts the measurements such that it is possible to detect when an element is near the viewport.
    * 
    * @method Phaser.DOM.getBounds
    * @param {DOMElement|Object} element - The element or stack (uses first item) to get the bounds for.
    * @param {number} [cushion] - A +/- pixel adjustment amount.
    * @return {Object|boolean} A plain object containing the properties `top/bottom/left/right/width/height` or `false` if a non-valid element is given.
    */
    getBounds: function (element, cushion) {

        if (cushion === undefined) { cushion = 0; }

        element = element && !element.nodeType ? element[0] : element;

        if (!element || element.nodeType !== 1)
        {
            return false;
        }
        else
        {
            return this.calibrate(element.getBoundingClientRect(), cushion);
        }

    },

    /**
    * Calibrates element coordinates for `inLayoutViewport` checks.
    *
    * @method Phaser.DOM.calibrate
    * @private
    * @param {object} coords - An object containing the following properties: `{top: number, right: number, bottom: number, left: number}`
    * @param {number} [cushion] - A value to adjust the coordinates by.
    * @return {object} The calibrated element coordinates
    */
    calibrate: function (coords, cushion) {

        cushion = +cushion || 0;

        var output = { width: 0, height: 0, left: 0, right: 0, top: 0, bottom: 0 };

        output.width = (output.right = coords.right + cushion) - (output.left = coords.left - cushion);
        output.height = (output.bottom = coords.bottom + cushion) - (output.top = coords.top - cushion);

        return output;

    },

    /**
    * Get the Visual viewport aspect ratio (or the aspect ratio of an object or element)    
    * 
    * @method Phaser.DOM.getAspectRatio
    * @param {(DOMElement|Object)} [object=(visualViewport)] - The object to determine the aspect ratio for. Must have public `width` and `height` properties or methods.
    * @return {number} The aspect ratio.
    */
    getAspectRatio: function (object) {

        object = null == object ? this.visualBounds : 1 === object.nodeType ? this.getBounds(object) : object;

        var w = object['width'];
        var h = object['height'];

        if (typeof w === 'function')
        {
            w = w.call(object);
        }

        if (typeof h === 'function')
        {
            h = h.call(object);
        }

        return w / h;

    },

    /**
    * Tests if the given DOM element is within the Layout viewport.
    * 
    * The optional cushion parameter allows you to specify a distance.
    * 
    * inLayoutViewport(element, 100) is `true` if the element is in the viewport or 100px near it.
    * inLayoutViewport(element, -100) is `true` if the element is in the viewport or at least 100px near it.
    * 
    * @method Phaser.DOM.inLayoutViewport
    * @param {DOMElement|Object} element - The DOM element to check. If no element is given it defaults to the Phaser game canvas.
    * @param {number} [cushion] - The cushion allows you to specify a distance within which the element must be within the viewport.
    * @return {boolean} True if the element is within the viewport, or within `cushion` distance from it.
    */
    inLayoutViewport: function (element, cushion) {

        var r = this.getBounds(element, cushion);

        return !!r && r.bottom >= 0 && r.right >= 0 && r.top <= this.layoutBounds.width && r.left <= this.layoutBounds.height;

    },

    /**
    * Returns the device screen orientation.
    *
    * Orientation values: 'portrait-primary', 'landscape-primary', 'portrait-secondary', 'landscape-secondary'.
    *
    * Order of resolving:
    * - Screen Orientation API, or variation of - Future track. Most desktop and mobile browsers.
    * - Screen size ratio check - If fallback is 'screen', suited for desktops.
    * - Viewport size ratio check - If fallback is 'viewport', suited for mobile.
    * - window.orientation - If fallback is 'window.orientation', works iOS and probably most Android; non-recommended track.
    * - Media query
    * - Viewport size ratio check (probably only IE9 and legacy mobile gets here..)
    *
    * See
    * - https://w3c.github.io/screen-orientation/ (conflicts with mozOrientation/msOrientation)
    * - https://developer.mozilla.org/en-US/docs/Web/API/Screen.orientation (mozOrientation)
    * - http://msdn.microsoft.com/en-us/library/ie/dn342934(v=vs.85).aspx
    * - https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Testing_media_queries
    * - http://stackoverflow.com/questions/4917664/detect-viewport-orientation
    * - http://www.matthewgifford.com/blog/2011/12/22/a-misconception-about-window-orientation
    *
    * @method Phaser.DOM.getScreenOrientation
    * @protected
    * @param {string} [primaryFallback=(none)] - Specify 'screen', 'viewport', or 'window.orientation'.
    */
    getScreenOrientation: function (primaryFallback) {

        var screen = window.screen;
        var orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;

        if (orientation && typeof orientation.type === 'string')
        {
            // Screen Orientation API specification
            return orientation.type;
        }
        else if (typeof orientation === 'string')
        {
            // moz/ms-orientation are strings
            return orientation;
        }

        var PORTRAIT = 'portrait-primary';
        var LANDSCAPE = 'landscape-primary';
        
        if (primaryFallback === 'screen')
        {
            return (screen.height > screen.width) ? PORTRAIT : LANDSCAPE;
        }
        else if (primaryFallback === 'viewport')
        {
            return (this.visualBounds.height > this.visualBounds.width) ? PORTRAIT : LANDSCAPE;
        }
        else if (primaryFallback === 'window.orientation' && typeof window.orientation === 'number')
        {
            // This may change by device based on "natural" orientation.
            return (window.orientation === 0 || window.orientation === 180) ? PORTRAIT : LANDSCAPE;
        }
        else if (window.matchMedia)
        {
            if (window.matchMedia("(orientation: portrait)").matches)
            {
                return PORTRAIT;
            }
            else if (window.matchMedia("(orientation: landscape)").matches)
            {
                return LANDSCAPE;
            }
        }

        return (this.visualBounds.height > this.visualBounds.width) ? PORTRAIT : LANDSCAPE;

    },

    /**
    * The bounds of the Visual viewport, as discussed in 
    * {@link http://www.quirksmode.org/mobile/viewports.html A tale of two viewports — part one}
    * with one difference: the viewport size _excludes_ scrollbars, as found on some desktop browsers.   
    *
    * Supported mobile:
    *   iOS/Safari, Android 4, IE10, Firefox OS (maybe not Firefox Android), Opera Mobile 16
    *
    * The properties change dynamically.
    *
    * @type {Phaser.Rectangle}
    * @property {number} x - Scroll, left offset - eg. "scrollX"
    * @property {number} y - Scroll, top offset - eg. "scrollY"
    * @property {number} width - Viewport width in pixels.
    * @property {number} height - Viewport height in pixels.
    * @readonly
    */
    visualBounds: new Phaser.Rectangle(),

    /**
    * The bounds of the Layout viewport, as discussed in 
    * {@link http://www.quirksmode.org/mobile/viewports2.html A tale of two viewports — part two};
    * but honoring the constraints as specified applicable viewport meta-tag.
    *
    * The bounds returned are not guaranteed to be fully aligned with CSS media queries (see
    * {@link http://www.matanich.com/2013/01/07/viewport-size/ What size is my viewport?}).
    *
    * This is _not_ representative of the Visual bounds: in particular the non-primary axis will
    * generally be significantly larger than the screen height on mobile devices when running with a
    * constrained viewport.
    *
    * The properties change dynamically.
    *
    * @type {Phaser.Rectangle}
    * @property {number} width - Viewport width in pixels.
    * @property {number} height - Viewport height in pixels.
    * @readonly
    */
    layoutBounds: new Phaser.Rectangle(),

    /**
    * The size of the document / Layout viewport.
    *
    * This incorrectly reports the dimensions in IE.
    *
    * The properties change dynamically.
    *
    * @type {Phaser.Rectangle}
    * @property {number} width - Document width in pixels.
    * @property {number} height - Document height in pixels.
    * @readonly
    */
    documentBounds: new Phaser.Rectangle()

};

Phaser.Device.whenReady(function (device) {

    // All target browsers should support page[XY]Offset.
    var scrollX = window && ('pageXOffset' in window) ?
        function () { return window.pageXOffset; } :
        function () { return document.documentElement.scrollLeft; };

    var scrollY = window && ('pageYOffset' in window) ?
        function () { return window.pageYOffset; } :
        function () { return document.documentElement.scrollTop; };

    /**
    * A cross-browser window.scrollX.
    *
    * @name Phaser.DOM.scrollX
    * @property {number} scrollX
    * @readonly
    * @protected
    */
    Object.defineProperty(Phaser.DOM, "scrollX", {
        get: scrollX
    });

    /**
    * A cross-browser window.scrollY.
    *
    * @name Phaser.DOM.scrollY
    * @property {number} scrollY
    * @readonly
    * @protected
    */
    Object.defineProperty(Phaser.DOM, "scrollY", {
        get: scrollY
    });

    Object.defineProperty(Phaser.DOM.visualBounds, "x", {
        get: scrollX
    });

    Object.defineProperty(Phaser.DOM.visualBounds, "y", {
        get: scrollY
    });

    Object.defineProperty(Phaser.DOM.layoutBounds, "x", {
        value: 0
    });

    Object.defineProperty(Phaser.DOM.layoutBounds, "y", {
        value: 0
    });

    var treatAsDesktop = device.desktop &&
        (document.documentElement.clientWidth <= window.innerWidth) &&
        (document.documentElement.clientHeight <= window.innerHeight);

    // Desktop browsers align the layout viewport with the visual viewport.
    // This differs from mobile browsers with their zooming design.
    // Ref. http://quirksmode.org/mobile/tableViewport.html  
    if (treatAsDesktop)
    {

        // PST- When scrollbars are not included this causes upstream issues in ScaleManager.
        // So reverted to the old "include scrollbars."
        var clientWidth = function () {
            return Math.max(window.innerWidth, document.documentElement.clientWidth);
        };
        var clientHeight = function () {
            return Math.max(window.innerHeight, document.documentElement.clientHeight);
        };

        // Interested in area sans-scrollbar
        Object.defineProperty(Phaser.DOM.visualBounds, "width", {
            get: clientWidth
        });

        Object.defineProperty(Phaser.DOM.visualBounds, "height", {
            get: clientHeight
        });

        Object.defineProperty(Phaser.DOM.layoutBounds, "width", {
            get: clientWidth
        });

        Object.defineProperty(Phaser.DOM.layoutBounds, "height", {
            get: clientHeight
        });

    } else {

        Object.defineProperty(Phaser.DOM.visualBounds, "width", {
            get: function () {
                return window.innerWidth;
            }
        });

        Object.defineProperty(Phaser.DOM.visualBounds, "height", {
            get: function () {
                return window.innerHeight;
            }
        });

        Object.defineProperty(Phaser.DOM.layoutBounds, "width", {

            get: function () {
                var a = document.documentElement.clientWidth;
                var b = window.innerWidth;

                return a < b ? b : a; // max
            }

        });

        Object.defineProperty(Phaser.DOM.layoutBounds, "height", {

            get: function () {
                var a = document.documentElement.clientHeight;
                var b = window.innerHeight;

                return a < b ? b : a; // max
            }

        });

    }

    // For Phaser.DOM.documentBounds
    // Ref. http://www.quirksmode.org/mobile/tableViewport_desktop.html

    Object.defineProperty(Phaser.DOM.documentBounds, "x", {
        value: 0
    });

    Object.defineProperty(Phaser.DOM.documentBounds, "y", {
        value: 0
    });

    Object.defineProperty(Phaser.DOM.documentBounds, "width", {

        get: function () {
            var d = document.documentElement;
            return Math.max(d.clientWidth, d.offsetWidth, d.scrollWidth);
        }

    });

    Object.defineProperty(Phaser.DOM.documentBounds, "height", {

        get: function () {
            var d = document.documentElement;
            return Math.max(d.clientHeight, d.offsetHeight, d.scrollHeight);
        }

    });

}, null, true);

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* ArraySet is a Set data structure (items must be unique within the set) that also maintains order.
* This allows specific items to be easily added or removed from the Set.
*
* Item equality (and uniqueness) is determined by the behavior of `Array.indexOf`.
*
* This used primarily by the Input subsystem.
*
* @class Phaser.ArraySet
* @constructor
* @param {any[]} [list=(new array)] - The backing array: if specified the items in the list _must_ be unique, per `Array.indexOf`, and the ownership of the array _should_ be relinquished to the ArraySet.
*/
Phaser.ArraySet = function (list) {

    /**
    * Current cursor position as established by `first` and `next`.
    * @property {integer} position
    * @default
    */
    this.position = 0;

    /**
    * The backing array.
    * @property {any[]} list
    */
    this.list = list || [];

};

Phaser.ArraySet.prototype = {

    /**
    * Adds a new element to the end of the list.
    * If the item already exists in the list it is not moved.
    *
    * @method Phaser.ArraySet#add
    * @param {any} item - The element to add to this list.
    * @return {any} The item that was added.
    */
    add: function (item) {

        if (!this.exists(item))
        {
            this.list.push(item);
        }

        return item;

    },

    /**
    * Gets the index of the item in the list, or -1 if it isn't in the list.
    *
    * @method Phaser.ArraySet#getIndex
    * @param {any} item - The element to get the list index for.
    * @return {integer} The index of the item or -1 if not found.
    */
    getIndex: function (item) {

        return this.list.indexOf(item);

    },

    /**
    * Gets an item from the set based on the property strictly equaling the value given.
    * Returns null if not found.
    *
    * @method Phaser.ArraySet#getByKey
    * @param {string} property - The property to check against the value.
    * @param {any} value - The value to check if the property strictly equals.
    * @return {any} The item that was found, or null if nothing matched.
    */
    getByKey: function (property, value) {

        var i = this.list.length;

        while (i--)
        {
            if (this.list[i][property] === value)
            {
                return this.list[i];
            }
        }

        return null;

    },

    /**
    * Checks for the item within this list.
    *
    * @method Phaser.ArraySet#exists
    * @param {any} item - The element to get the list index for.
    * @return {boolean} True if the item is found in the list, otherwise false.
    */
    exists: function (item) {

        return (this.list.indexOf(item) > -1);

    },

    /**
    * Removes all the items.
    *
    * @method Phaser.ArraySet#reset
    */
    reset: function () {

        this.list.length = 0;

    },

    /**
    * Removes the given element from this list if it exists.
    *
    * @method Phaser.ArraySet#remove
    * @param {any} item - The item to be removed from the list.
    * @return {any} item - The item that was removed.
    */
    remove: function (item) {

        var idx = this.list.indexOf(item);

        if (idx > -1)
        {
            this.list.splice(idx, 1);
            return item;
        }

    },

    /**
    * Sets the property `key` to the given value on all members of this list.
    *
    * @method Phaser.ArraySet#setAll
    * @param {any} key - The property of the item to set.
    * @param {any} value - The value to set the property to.
    */
    setAll: function (key, value) {

        var i = this.list.length;

        while (i--)
        {
            if (this.list[i])
            {
                this.list[i][key] = value;
            }
        }

    },

    /**
    * Calls a function on all members of this list, using the member as the context for the callback.
    *
    * If the `key` property is present it must be a function.
    * The function is invoked using the item as the context.
    *
    * @method Phaser.ArraySet#callAll
    * @param {string} key - The name of the property with the function to call.
    * @param {...*} parameter - Additional parameters that will be passed to the callback.
    */
    callAll: function (key) {

        var args = Array.prototype.slice.call(arguments, 1);

        var i = this.list.length;

        while (i--)
        {
            if (this.list[i] && this.list[i][key])
            {
                this.list[i][key].apply(this.list[i], args);
            }
        }

    },

    /**
    * Removes every member from this ArraySet and optionally destroys it.
    *
    * @method Phaser.ArraySet#removeAll
    * @param {boolean} [destroy=false] - Call `destroy` on each member as it's removed from this set.
    */
    removeAll: function (destroy) {

        if (destroy === undefined) { destroy = false; }

        var i = this.list.length;

        while (i--)
        {
            if (this.list[i])
            {
                var item = this.remove(this.list[i]);

                if (destroy)
                {
                    item.destroy();
                }
            }
        }

        this.position = 0;
        this.list = [];

    }

};

/**
* Number of items in the ArraySet. Same as `list.length`.
*
* @name Phaser.ArraySet#total
* @property {integer} total
*/
Object.defineProperty(Phaser.ArraySet.prototype, "total", {

    get: function () {
        return this.list.length;
    }

});

/**
* Returns the first item and resets the cursor to the start.
*
* @name Phaser.ArraySet#first
* @property {any} first
*/
Object.defineProperty(Phaser.ArraySet.prototype, "first", {

    get: function () {

        this.position = 0;

        if (this.list.length > 0)
        {
            return this.list[0];
        }
        else
        {
            return null;
        }

    }

});

/**
* Returns the the next item (based on the cursor) and advances the cursor.
*
* @name Phaser.ArraySet#next
* @property {any} next
*/
Object.defineProperty(Phaser.ArraySet.prototype, "next", {

    get: function () {

        if (this.position < this.list.length)
        {
            this.position++;

            return this.list[this.position];
        }
        else
        {
            return null;
        }

    }

});

Phaser.ArraySet.prototype.constructor = Phaser.ArraySet;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Utility functions for dealing with Arrays.
*
* @class Phaser.ArrayUtils
* @static
*/
Phaser.ArrayUtils = {

    /**
    * Fetch a random entry from the given array.
    *
    * Will return null if there are no array items that fall within the specified range
    * or if there is no item for the randomly chosen index.
    *
    * @method
    * @param {any[]} objects - An array of objects.
    * @param {integer} startIndex - Optional offset off the front of the array. Default value is 0, or the beginning of the array.
    * @param {integer} length - Optional restriction on the number of values you want to randomly select from.
    * @return {object} The random object that was selected.
    */
    getRandomItem: function (objects, startIndex, length) {

        if (objects === null) { return null; }
        if (startIndex === undefined) { startIndex = 0; }
        if (length === undefined) { length = objects.length; }

        var randomIndex = startIndex + Math.floor(Math.random() * length);

        return objects[randomIndex] === undefined ? null : objects[randomIndex];

    },

    /**
    * Removes a random object from the given array and returns it.
    *
    * Will return null if there are no array items that fall within the specified range
    * or if there is no item for the randomly chosen index.
    *
    * @method
    * @param {any[]} objects - An array of objects.
    * @param {integer} startIndex - Optional offset off the front of the array. Default value is 0, or the beginning of the array.
    * @param {integer} length - Optional restriction on the number of values you want to randomly select from.
    * @return {object} The random object that was removed.
    */
    removeRandomItem: function (objects, startIndex, length) {

        if (objects == null) { // undefined or null
            return null;
        }

        if (startIndex === undefined) { startIndex = 0; }
        if (length === undefined) { length = objects.length; }

        var randomIndex = startIndex + Math.floor(Math.random() * length);
        if (randomIndex < objects.length)
        {
            var removed = objects.splice(randomIndex, 1);
            return removed[0] === undefined ? null : removed[0];
        }
        else
        {
            return null;
        }

    },

    /**
    * A standard Fisher-Yates Array shuffle implementation which modifies the array in place.
    *
    * @method
    * @param {any[]} array - The array to shuffle.
    * @return {any[]} The original array, now shuffled.
    */
    shuffle: function (array) {

        for (var i = array.length - 1; i > 0; i--)
        {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }

        return array;

    },

    /**
    * Transposes the elements of the given matrix (array of arrays).
    *
    * @method
    * @param {Array<any[]>} array - The matrix to transpose.
    * @return {Array<any[]>} A new transposed matrix
    */
    transposeMatrix: function (array) {

        var sourceRowCount = array.length;
        var sourceColCount = array[0].length;

        var result = new Array(sourceColCount);

        for (var i = 0; i < sourceColCount; i++)
        {
            result[i] = new Array(sourceRowCount);

            for (var j = sourceRowCount - 1; j > -1; j--)
            {
                result[i][j] = array[j][i];
            }
        }

        return result;

    },

    /**
    * Rotates the given matrix (array of arrays).
    *
    * Based on the routine from {@link http://jsfiddle.net/MrPolywhirl/NH42z/}.
    *
    * @method
    * @param {Array<any[]>} matrix - The array to rotate; this matrix _may_ be altered.
    * @param {number|string} direction - The amount to rotate: the rotation in degrees (90, -90, 270, -270, 180) or a string command ('rotateLeft', 'rotateRight' or 'rotate180').
    * @return {Array<any[]>} The rotated matrix. The source matrix should be discarded for the returned matrix.
    */
    rotateMatrix: function (matrix, direction) {

        if (typeof direction !== 'string')
        {
            direction = ((direction % 360) + 360) % 360;
        }

        if (direction === 90 || direction === -270 || direction === 'rotateLeft')
        {
            matrix = Phaser.ArrayUtils.transposeMatrix(matrix);
            matrix = matrix.reverse();
        }
        else if (direction === -90 || direction === 270 || direction === 'rotateRight')
        {
            matrix = matrix.reverse();
            matrix = Phaser.ArrayUtils.transposeMatrix(matrix);
        }
        else if (Math.abs(direction) === 180 || direction === 'rotate180')
        {
            for (var i = 0; i < matrix.length; i++)
            {
                matrix[i].reverse();
            }

            matrix = matrix.reverse();
        }

        return matrix;

    },

    /**
    * Snaps a value to the nearest value in an array.
    * The result will always be in the range `[first_value, last_value]`.
    *
    * @method
    * @param {number} value - The search value
    * @param {number[]} arr - The input array which _must_ be sorted.
    * @return {number} The nearest value found.
    */
    findClosest: function (value, arr) {

        if (!arr.length)
        {
            return NaN;
        }
        else if (arr.length === 1 || value < arr[0])
        {
            return arr[0];
        }

        var i = 1;
        while (arr[i] < value) {
            i++;
        }

        var low = arr[i - 1];
        var high = (i < arr.length) ? arr[i] : Number.POSITIVE_INFINITY;

        return ((high - value) <= (value - low)) ? high : low;

    },

    /**
    * Moves the element from the end of the array to the start, shifting all items in the process.
    * The "rotation" happens to the right.
    *
    * Before: `[ A, B, C, D, E, F ]`
    * After: `[ F, A, B, C, D, E ]`
    * 
    * See also Phaser.ArrayUtils.rotateLeft.
    *
    * @method Phaser.ArrayUtils.rotateRight
    * @param {any[]} array - The array to rotate. The array is modified.
    * @return {any} The shifted value.
    */
    rotateRight: function (array) {

        var s = array.pop();
        array.unshift(s);

        return s;

    },

    /**
    * Moves the element from the start of the array to the end, shifting all items in the process.
    * The "rotation" happens to the left.
    *
    * Before: `[ A, B, C, D, E, F ]`
    * After: `[ B, C, D, E, F, A ]`
    * 
    * See also Phaser.ArrayUtils.rotateRight
    *
    * @method Phaser.ArrayUtils.rotateLeft
    * @param {any[]} array - The array to rotate. The array is modified.
    * @return {any} The rotated value.
    */
    rotateLeft: function (array) {

        var s = array.shift();
        array.push(s);

        return s;

    },

    /**
    * Moves the element from the start of the array to the end, shifting all items in the process.
    * The "rotation" happens to the left.
    *
    * Before: `[ A, B, C, D, E, F ]`
    * After: `[ B, C, D, E, F, A ]`
    * 
    * See also Phaser.ArrayUtils.rotateRight
    *
    * @method Phaser.ArrayUtils.rotate
    * @deprecated Please use Phaser.ArrayUtils.rotate instead.
    * @param {any[]} array - The array to rotate. The array is modified.
    * @return {any} The rotated value.
    */
    rotate: function (array) {

        var s = array.shift();
        array.push(s);

        return s;

    },

    /**
    * Create an array representing the inclusive range of numbers (usually integers) in `[start, end]`.
    * This is equivalent to `numberArrayStep(start, end, 1)`.
    *
    * @method Phaser.ArrayUtils#numberArray
    * @param {number} start - The minimum value the array starts with.
    * @param {number} end - The maximum value the array contains.
    * @return {number[]} The array of number values.
    */
    numberArray: function (start, end) {

        var result = [];

        for (var i = start; i <= end; i++)
        {
            result.push(i);
        }

        return result;

    },

    /**
    * Create an array of numbers (positive and/or negative) progressing from `start`
    * up to but not including `end` by advancing by `step`.
    *
    * If `start` is less than `end` a zero-length range is created unless a negative `step` is specified.
    *
    * Certain values for `start` and `end` (eg. NaN/undefined/null) are currently coerced to 0;
    * for forward compatibility make sure to pass in actual numbers.
    *
    * @method Phaser.ArrayUtils#numberArrayStep
    * @param {number} start - The start of the range.
    * @param {number} [end] - The end of the range.
    * @param {number} [step=1] - The value to increment or decrement by.
    * @returns {Array} Returns the new array of numbers.
    * @example
    * Phaser.ArrayUtils.numberArrayStep(4);
    * // => [0, 1, 2, 3]
    *
    * Phaser.ArrayUtils.numberArrayStep(1, 5);
    * // => [1, 2, 3, 4]
    *
    * Phaser.ArrayUtils.numberArrayStep(0, 20, 5);
    * // => [0, 5, 10, 15]
    *
    * Phaser.ArrayUtils.numberArrayStep(0, -4, -1);
    * // => [0, -1, -2, -3]
    *
    * Phaser.ArrayUtils.numberArrayStep(1, 4, 0);
    * // => [1, 1, 1]
    *
    * Phaser.ArrayUtils.numberArrayStep(0);
    * // => []
    */
    numberArrayStep: function (start, end, step) {

        if (start === undefined || start === null) { start = 0; }

        if (end === undefined || end === null)
        {
            end = start;
            start = 0;
        }

        if (step === undefined) { step = 1; }

        var result = [];
        var total = Math.max(Phaser.Math.roundAwayFromZero((end - start) / (step || 1)), 0);

        for (var i = 0; i < total; i++)
        {
            result.push(start);
            start += step;
        }

        return result;

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A basic Linked List data structure.
*
* This implementation _modifies_ the `prev` and `next` properties of each item added:
* - The `prev` and `next` properties must be writable and should not be used for any other purpose.
* - Items _cannot_ be added to multiple LinkedLists at the same time.
* - Only objects can be added.
*
* @class Phaser.LinkedList
* @constructor
*/
Phaser.LinkedList = function () {

    /**
    * Next element in the list.
    * @property {object} next
    * @default
    */
    this.next = null;

    /**
    * Previous element in the list.
    * @property {object} prev
    * @default
    */
    this.prev = null;

    /**
    * First element in the list.
    * @property {object} first
    * @default
    */
    this.first = null;

    /**
    * Last element in the list.
    * @property {object} last
    * @default
    */
    this.last = null;

    /**
    * Number of elements in the list.
    * @property {integer} total
    * @default
    */
    this.total = 0;

};

Phaser.LinkedList.prototype = {

    /**
    * Adds a new element to this linked list.
    *
    * @method Phaser.LinkedList#add
    * @param {object} item - The element to add to this list. Can be a Phaser.Sprite or any other object you need to quickly iterate through.
    * @return {object} The item that was added.
    */
    add: function (item) {

        //  If the list is empty
        if (this.total === 0 && this.first === null && this.last === null)
        {
            this.first = item;
            this.last = item;
            this.next = item;
            item.prev = this;
            this.total++;
            return item;
        }

        //  Gets appended to the end of the list, regardless of anything, and it won't have any children of its own (non-nested list)
        this.last.next = item;

        item.prev = this.last;

        this.last = item;

        this.total++;

        return item;

    },

    /**
    * Resets the first, last, next and previous node pointers in this list.
    *
    * @method Phaser.LinkedList#reset
    */
    reset: function () {

        this.first = null;
        this.last = null;
        this.next = null;
        this.prev = null;
        this.total = 0;

    },

    /**
    * Removes the given element from this linked list if it exists.
    *
    * @method Phaser.LinkedList#remove
    * @param {object} item - The item to be removed from the list.
    */
    remove: function (item) {

        if (this.total === 1)
        {
            this.reset();
            item.next = item.prev = null;
            return;
        }

        if (item === this.first)
        {
            // It was 'first', make 'first' point to first.next
            this.first = this.first.next;
        }
        else if (item === this.last)
        {
            // It was 'last', make 'last' point to last.prev
            this.last = this.last.prev;
        }

        if (item.prev)
        {
            // make item.prev.next point to childs.next instead of item
            item.prev.next = item.next;
        }

        if (item.next)
        {
            // make item.next.prev point to item.prev instead of item
            item.next.prev = item.prev;
        }

        item.next = item.prev = null;

        if (this.first === null )
        {
            this.last = null;
        }

        this.total--;

    },

    /**
    * Calls a function on all members of this list, using the member as the context for the callback.
    * The function must exist on the member.
    *
    * @method Phaser.LinkedList#callAll
    * @param {function} callback - The function to call.
    */
    callAll: function (callback) {

        if (!this.first || !this.last)
        {
            return;
        }

        var entity = this.first;

        do
        {
            if (entity && entity[callback])
            {
                entity[callback].call(entity);
            }

            entity = entity.next;

        }
        while (entity !== this.last.next);

    }

};

Phaser.LinkedList.prototype.constructor = Phaser.LinkedList;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Phaser.Create class is a collection of smaller helper methods that allow you to generate game content
* quickly and easily, without the need for any external files. You can create textures for sprites and in
* coming releases we'll add dynamic sound effect generation support as well (like sfxr).
*
* Access this via `Game.create` (`this.game.create` from within a State object)
* 
* @class Phaser.Create
* @constructor
* @param {Phaser.Game} game - Game reference to the currently running game.
 */
Phaser.Create = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;

    /**
    * @property {Phaser.BitmapData} bmd - The internal BitmapData Create uses to generate textures from.
    */
    this.bmd = null;

    /**
    * @property {HTMLCanvasElement} canvas - The canvas the BitmapData uses.
    */
    this.canvas = null;

    /**
    * @property {CanvasRenderingContext2D} context - The 2d context of the canvas.
    */
    this.ctx = null;

    /**
    * @property {array} palettes - A range of 16 color palettes for use with sprite generation.
    */
    this.palettes = [
        { 0: '#000', 1: '#9D9D9D', 2: '#FFF', 3: '#BE2633', 4: '#E06F8B', 5: '#493C2B', 6: '#A46422', 7: '#EB8931', 8: '#F7E26B', 9: '#2F484E', A: '#44891A', B: '#A3CE27', C: '#1B2632', D: '#005784', E: '#31A2F2', F: '#B2DCEF' },
        { 0: '#000', 1: '#191028', 2: '#46af45', 3: '#a1d685', 4: '#453e78', 5: '#7664fe', 6: '#833129', 7: '#9ec2e8', 8: '#dc534b', 9: '#e18d79', A: '#d6b97b', B: '#e9d8a1', C: '#216c4b', D: '#d365c8', E: '#afaab9', F: '#f5f4eb' },
        { 0: '#000', 1: '#2234d1', 2: '#0c7e45', 3: '#44aacc', 4: '#8a3622', 5: '#5c2e78', 6: '#aa5c3d', 7: '#b5b5b5', 8: '#5e606e', 9: '#4c81fb', A: '#6cd947', B: '#7be2f9', C: '#eb8a60', D: '#e23d69', E: '#ffd93f', F: '#fff' },
        { 0: '#000', 1: '#fff', 2: '#8b4131', 3: '#7bbdc5', 4: '#8b41ac', 5: '#6aac41', 6: '#3931a4', 7: '#d5de73', 8: '#945a20', 9: '#5a4100', A: '#bd736a', B: '#525252', C: '#838383', D: '#acee8b', E: '#7b73de', F: '#acacac' },
        { 0: '#000', 1: '#191028', 2: '#46af45', 3: '#a1d685', 4: '#453e78', 5: '#7664fe', 6: '#833129', 7: '#9ec2e8', 8: '#dc534b', 9: '#e18d79', A: '#d6b97b', B: '#e9d8a1', C: '#216c4b', D: '#d365c8', E: '#afaab9', F: '#fff' }
    ];

};

/**
* A 16 color palette by [Arne](http://androidarts.com/palette/16pal.htm)
* @constant
* @type {number}
*/
Phaser.Create.PALETTE_ARNE = 0;

/**
* A 16 color JMP inspired palette.
* @constant
* @type {number}
*/
Phaser.Create.PALETTE_JMP = 1;

/**
* A 16 color CGA inspired palette.
* @constant
* @type {number}
*/
Phaser.Create.PALETTE_CGA = 2;

/**
* A 16 color C64 inspired palette.
* @constant
* @type {number}
*/
Phaser.Create.PALETTE_C64 = 3;

/**
* A 16 color palette inspired by Japanese computers like the MSX.
* @constant
* @type {number}
*/
Phaser.Create.PALETTE_JAPANESE_MACHINE = 4;

Phaser.Create.prototype = {

    /**
     * Generates a new PIXI.Texture from the given data, which can be applied to a Sprite.
     *
     * This allows you to create game graphics quickly and easily, with no external files but that use actual proper images
     * rather than Phaser.Graphics objects, which are expensive to render and limited in scope.
     *
     * Each element of the array is a string holding the pixel color values, as mapped to one of the Phaser.Create PALETTE consts.
     *
     * For example:
     *
     * `var data = [
     *   ' 333 ',
     *   ' 777 ',
     *   'E333E',
     *   ' 333 ',
     *   ' 3 3 '
     * ];`
     *
     * `game.create.texture('bob', data);`
     *
     * The above will create a new texture called `bob`, which will look like a little man wearing a hat. You can then use it
     * for sprites the same way you use any other texture: `game.add.sprite(0, 0, 'bob');`
     *
     * @method Phaser.Create#texture
     * @param {string} key - The key used to store this texture in the Phaser Cache.
     * @param {array} data - An array of pixel data.
     * @param {integer} [pixelWidth=8] - The width of each pixel.
     * @param {integer} [pixelHeight=8] - The height of each pixel.
     * @param {integer} [palette=0] - The palette to use when rendering the texture. One of the Phaser.Create.PALETTE consts.
     * @return {PIXI.Texture} The newly generated texture.
     */
    texture: function (key, data, pixelWidth, pixelHeight, palette) {

        if (pixelWidth === undefined) { pixelWidth = 8; }
        if (pixelHeight === undefined) { pixelHeight = pixelWidth; }
        if (palette === undefined) { palette = 0; }

        var w = data[0].length * pixelWidth;
        var h = data.length * pixelHeight;

        //  No bmd? Let's make one
        if (this.bmd === null)
        {
            this.bmd = this.game.make.bitmapData();
            this.canvas = this.bmd.canvas;
            this.ctx = this.bmd.context;
        }

        this.bmd.resize(w, h);
        this.bmd.clear();

        //  Draw it
        for (var y = 0; y < data.length; y++)
        {
            var row = data[y];

            for (var x = 0; x < row.length; x++)
            {
                var d = row[x];

                if (d !== '.' && d !== ' ')
                {
                    this.ctx.fillStyle = this.palettes[palette][d];
                    this.ctx.fillRect(x * pixelWidth, y * pixelHeight, pixelWidth, pixelHeight);
                }
            }
        }

        return this.bmd.generateTexture(key);

    },

    /**
     * Creates a grid texture based on the given dimensions.
     *
     * @method Phaser.Create#grid
     * @param {string} key - The key used to store this texture in the Phaser Cache.
     * @param {integer} width - The width of the grid in pixels.
     * @param {integer} height - The height of the grid in pixels.
     * @param {integer} cellWidth - The width of the grid cells in pixels.
     * @param {integer} cellHeight - The height of the grid cells in pixels.
     * @param {string} color - The color to draw the grid lines in. Should be a Canvas supported color string like `#ff5500` or `rgba(200,50,3,0.5)`.
     * @return {PIXI.Texture} The newly generated texture.
     */
    grid: function (key, width, height, cellWidth, cellHeight, color) {

        //  No bmd? Let's make one
        if (this.bmd === null)
        {
            this.bmd = this.game.make.bitmapData();
            this.canvas = this.bmd.canvas;
            this.ctx = this.bmd.context;
        }

        this.bmd.resize(width, height);

        this.ctx.fillStyle = color;

        for (var y = 0; y < height; y += cellHeight)
        {
            this.ctx.fillRect(0, y, width, 1);
        }

        for (var x = 0; x < width; x += cellWidth)
        {
            this.ctx.fillRect(x, 0, 1, height);
        }

        return this.bmd.generateTexture(key);

    }

};

Phaser.Create.prototype.constructor = Phaser.Create;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* WARNING: This is an EXPERIMENTAL class. The API will change significantly in the coming versions and is incomplete.
* Please try to avoid using in production games with a long time to build.
* This is also why the documentation is incomplete.
* 
* FlexGrid is a a responsive grid manager that works in conjunction with the ScaleManager RESIZE scaling mode and FlexLayers
* to provide for game object positioning in a responsive manner.
*
* @class Phaser.FlexGrid
* @constructor
* @param {Phaser.ScaleManager} manager - The ScaleManager.
* @param {number} width - The width of the game.
* @param {number} height - The height of the game.
*/
Phaser.FlexGrid = function (manager, width, height) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = manager.game;

    /**
    * @property {Phaser.ScaleManager} manager - A reference to the ScaleManager.
    */
    this.manager = manager;

    //  The perfect dimensions on which everything else is based
    this.width = width;
    this.height = height;

    this.boundsCustom = new Phaser.Rectangle(0, 0, width, height);
    this.boundsFluid = new Phaser.Rectangle(0, 0, width, height);
    this.boundsFull = new Phaser.Rectangle(0, 0, width, height);
    this.boundsNone = new Phaser.Rectangle(0, 0, width, height);

    /**
    * @property {Phaser.Point} position - 
    * @readonly
    */
    this.positionCustom = new Phaser.Point(0, 0);
    this.positionFluid = new Phaser.Point(0, 0);
    this.positionFull = new Phaser.Point(0, 0);
    this.positionNone = new Phaser.Point(0, 0);

    /**
    * @property {Phaser.Point} scaleFactor - The scale factor based on the game dimensions vs. the scaled dimensions.
    * @readonly
    */
    this.scaleCustom = new Phaser.Point(1, 1);
    this.scaleFluid = new Phaser.Point(1, 1);
    this.scaleFluidInversed = new Phaser.Point(1, 1);
    this.scaleFull = new Phaser.Point(1, 1);
    this.scaleNone = new Phaser.Point(1, 1);

    this.customWidth = 0;
    this.customHeight = 0;
    this.customOffsetX = 0;
    this.customOffsetY = 0;

    this.ratioH = width / height;
    this.ratioV = height / width;

    this.multiplier = 0;

    this.layers = [];

};

Phaser.FlexGrid.prototype = {

    /**
     * Sets the core game size. This resets the w/h parameters and bounds.
     *
     * @method Phaser.FlexGrid#setSize
     * @param {number} width - The new dimensions.
     * @param {number} height - The new dimensions.
     */
    setSize: function (width, height) {

        //  These are locked and don't change until setSize is called again
        this.width = width;
        this.height = height;

        this.ratioH = width / height;
        this.ratioV = height / width;

        this.scaleNone = new Phaser.Point(1, 1);

        this.boundsNone.width = this.width;
        this.boundsNone.height = this.height;

        this.refresh();

    },

    //  Need ability to create your own layers with custom scaling, etc.

    /**
     * A custom layer is centered on the game and maintains its aspect ratio as it scales up and down.
     *
     * @method Phaser.FlexGrid#createCustomLayer
     * @param {number} width - Width of this layer in pixels.
     * @param {number} height - Height of this layer in pixels.
     * @param {PIXI.DisplayObject[]} [children] - An array of children that are used to populate the FlexLayer.
     * @return {Phaser.FlexLayer} The Layer object.
     */
    createCustomLayer: function (width, height, children, addToWorld) {

        if (addToWorld === undefined) { addToWorld = true; }

        this.customWidth = width;
        this.customHeight = height;

        this.boundsCustom.width = width;
        this.boundsCustom.height = height;

        var layer = new Phaser.FlexLayer(this, this.positionCustom, this.boundsCustom, this.scaleCustom);

        if (addToWorld)
        {
            this.game.world.add(layer);
        }

        this.layers.push(layer);

        if (typeof children !== 'undefined' && typeof children !== null)
        {
            layer.addMultiple(children);
        }

        return layer;

    },

    /**
     * A fluid layer is centered on the game and maintains its aspect ratio as it scales up and down.
     *
     * @method Phaser.FlexGrid#createFluidLayer
     * @param {array} [children] - An array of children that are used to populate the FlexLayer.
     * @return {Phaser.FlexLayer} The Layer object.
     */
    createFluidLayer: function (children, addToWorld) {

        if (addToWorld === undefined) { addToWorld = true; }

        var layer = new Phaser.FlexLayer(this, this.positionFluid, this.boundsFluid, this.scaleFluid);

        if (addToWorld)
        {
            this.game.world.add(layer);
        }

        this.layers.push(layer);

        if (typeof children !== 'undefined' && typeof children !== null)
        {
            layer.addMultiple(children);
        }

        return layer;

    },

    /**
     * A full layer is placed at 0,0 and extends to the full size of the game. Children are scaled according to the fluid ratios.
     *
     * @method Phaser.FlexGrid#createFullLayer
     * @param {array} [children] - An array of children that are used to populate the FlexLayer.
     * @return {Phaser.FlexLayer} The Layer object.
     */
    createFullLayer: function (children) {

        var layer = new Phaser.FlexLayer(this, this.positionFull, this.boundsFull, this.scaleFluid);

        this.game.world.add(layer);

        this.layers.push(layer);

        if (typeof children !== 'undefined')
        {
            layer.addMultiple(children);
        }

        return layer;

    },

    /**
     * A fixed layer is centered on the game and is the size of the required dimensions and is never scaled.
     *
     * @method Phaser.FlexGrid#createFixedLayer
     * @param {PIXI.DisplayObject[]} [children] - An array of children that are used to populate the FlexLayer.
     * @return {Phaser.FlexLayer} The Layer object.
     */
    createFixedLayer: function (children) {

        var layer = new Phaser.FlexLayer(this, this.positionNone, this.boundsNone, this.scaleNone);

        this.game.world.add(layer);

        this.layers.push(layer);

        if (typeof children !== 'undefined')
        {
            layer.addMultiple(children);
        }

        return layer;

    },

    /**
     * Resets the layer children references
     *
     * @method Phaser.FlexGrid#reset
     */
    reset: function () {

        var i = this.layers.length;

        while (i--)
        {
            if (!this.layers[i].persist)
            {
                //  Remove references to this class
                this.layers[i].position = null;
                this.layers[i].scale = null;
                this.layers.slice(i, 1);
            }
        }

    },

    /**
     * Called when the game container changes dimensions.
     *
     * @method Phaser.FlexGrid#onResize
     * @param {number} width - The new width of the game container.
     * @param {number} height - The new height of the game container.
     */
    onResize: function (width, height) {

        this.ratioH = width / height;
        this.ratioV = height / width;

        this.refresh(width, height);

    },

    /**
     * Updates all internal vars such as the bounds and scale values.
     *
     * @method Phaser.FlexGrid#refresh
     */
    refresh: function () {

        this.multiplier = Math.min((this.manager.height / this.height), (this.manager.width / this.width));

        this.boundsFluid.width = Math.round(this.width * this.multiplier);
        this.boundsFluid.height = Math.round(this.height * this.multiplier);

        this.scaleFluid.set(this.boundsFluid.width / this.width, this.boundsFluid.height / this.height);
        this.scaleFluidInversed.set(this.width / this.boundsFluid.width, this.height / this.boundsFluid.height);

        this.scaleFull.set(this.boundsFull.width / this.width, this.boundsFull.height / this.height);

        this.boundsFull.width = Math.round(this.manager.width * this.scaleFluidInversed.x);
        this.boundsFull.height = Math.round(this.manager.height * this.scaleFluidInversed.y);

        this.boundsFluid.centerOn(this.manager.bounds.centerX, this.manager.bounds.centerY);
        this.boundsNone.centerOn(this.manager.bounds.centerX, this.manager.bounds.centerY);

        this.positionFluid.set(this.boundsFluid.x, this.boundsFluid.y);
        this.positionNone.set(this.boundsNone.x, this.boundsNone.y);

    },

    /**
     * Fits a sprites width to the bounds.
     *
     * @method Phaser.FlexGrid#fitSprite
     * @param {Phaser.Sprite} sprite - The Sprite to fit.
     */
    fitSprite: function (sprite) {

        this.manager.scaleSprite(sprite);

        sprite.x = this.manager.bounds.centerX;
        sprite.y = this.manager.bounds.centerY;

    },

    /**
     * Call in the render function to output the bounds rects.
     *
     * @method Phaser.FlexGrid#debug
     */
    debug: function () {

        // for (var i = 0; i < this.layers.length; i++)
        // {
        //     this.layers[i].debug();
        // }

        // this.game.debug.text(this.boundsFull.width + ' x ' + this.boundsFull.height, this.boundsFull.x + 4, this.boundsFull.y + 16);
        // this.game.debug.geom(this.boundsFull, 'rgba(0,0,255,0.9', false);

        this.game.debug.text(this.boundsFluid.width + ' x ' + this.boundsFluid.height, this.boundsFluid.x + 4, this.boundsFluid.y + 16);
        this.game.debug.geom(this.boundsFluid, 'rgba(255,0,0,0.9', false);

        // this.game.debug.text(this.boundsNone.width + ' x ' + this.boundsNone.height, this.boundsNone.x + 4, this.boundsNone.y + 16);
        // this.game.debug.geom(this.boundsNone, 'rgba(0,255,0,0.9', false);

        // this.game.debug.text(this.boundsCustom.width + ' x ' + this.boundsCustom.height, this.boundsCustom.x + 4, this.boundsCustom.y + 16);
        // this.game.debug.geom(this.boundsCustom, 'rgba(255,255,0,0.9', false);

    }

};

Phaser.FlexGrid.prototype.constructor = Phaser.FlexGrid;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* WARNING: This is an EXPERIMENTAL class. The API will change significantly in the coming versions and is incomplete.
* Please try to avoid using in production games with a long time to build.
* This is also why the documentation is incomplete.
* 
* A responsive grid layer.
*
* @class Phaser.FlexLayer
* @extends Phaser.Group
* @constructor
* @param {Phaser.FlexGrid} manager - The FlexGrid that owns this FlexLayer.
* @param {Phaser.Point} position - A reference to the Point object used for positioning.
* @param {Phaser.Rectangle} bounds - A reference to the Rectangle used for the layer bounds.
* @param {Phaser.Point} scale - A reference to the Point object used for layer scaling.
*/
Phaser.FlexLayer = function (manager, position, bounds, scale) {

    Phaser.Group.call(this, manager.game, null, '__flexLayer' + manager.game.rnd.uuid(), false);

    /**
    * @property {Phaser.ScaleManager} scale - A reference to the ScaleManager.
    */
    this.manager = manager.manager;

    /**
    * @property {Phaser.FlexGrid} grid - A reference to the FlexGrid that owns this layer.
    */
    this.grid = manager;

    /**
     * Should the FlexLayer remain through a State swap?
     *
     * @type {boolean}
     */
    this.persist = false;

    /**
    * @property {Phaser.Point} position
    */
    this.position = position;

    /**
    * @property {Phaser.Rectangle} bounds
    */
    this.bounds = bounds;

    /**
    * @property {Phaser.Point} scale
    */
    this.scale = scale;

    /**
    * @property {Phaser.Point} topLeft
    */
    this.topLeft = bounds.topLeft;

    /**
    * @property {Phaser.Point} topMiddle
    */
    this.topMiddle = new Phaser.Point(bounds.halfWidth, 0);

    /**
    * @property {Phaser.Point} topRight
    */
    this.topRight = bounds.topRight;

    /**
    * @property {Phaser.Point} bottomLeft
    */
    this.bottomLeft = bounds.bottomLeft;

    /**
    * @property {Phaser.Point} bottomMiddle
    */
    this.bottomMiddle = new Phaser.Point(bounds.halfWidth, bounds.bottom);

    /**
    * @property {Phaser.Point} bottomRight
    */
    this.bottomRight = bounds.bottomRight;

};

Phaser.FlexLayer.prototype = Object.create(Phaser.Group.prototype);
Phaser.FlexLayer.prototype.constructor = Phaser.FlexLayer;

/**
 * Resize.
 *
 * @method Phaser.FlexLayer#resize
 */
Phaser.FlexLayer.prototype.resize = function () {
};

/**
 * Debug.
 *
 * @method Phaser.FlexLayer#debug
 */
Phaser.FlexLayer.prototype.debug = function () {

    this.game.debug.text(this.bounds.width + ' x ' + this.bounds.height, this.bounds.x + 4, this.bounds.y + 16);
    this.game.debug.geom(this.bounds, 'rgba(0,0,255,0.9', false);

    this.game.debug.geom(this.topLeft, 'rgba(255,255,255,0.9');
    this.game.debug.geom(this.topMiddle, 'rgba(255,255,255,0.9');
    this.game.debug.geom(this.topRight, 'rgba(255,255,255,0.9');

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Phaser.Color class is a set of static methods that assist in color manipulation and conversion.
*
* @class Phaser.Color
*/
Phaser.Color = {

    /**
    * Packs the r, g, b, a components into a single integer, for use with Int32Array.
    * If device is little endian then ABGR order is used. Otherwise RGBA order is used.
    *
    * @author Matt DesLauriers (@mattdesl)
    * @method Phaser.Color.packPixel
    * @static
    * @param {number} r - The red color component, in the range 0 - 255.
    * @param {number} g - The green color component, in the range 0 - 255.
    * @param {number} b - The blue color component, in the range 0 - 255.
    * @param {number} a - The alpha color component, in the range 0 - 255.
    * @return {number} The packed color as uint32
    */
    packPixel: function (r, g, b, a) {

        if (Phaser.Device.LITTLE_ENDIAN)
        {
            return ( (a << 24) | (b << 16) | (g <<  8) | r ) >>> 0;
        }
        else
        {
            return ( (r << 24) | (g << 16) | (b <<  8) | a ) >>> 0;
        }

    },

    /**
    * Unpacks the r, g, b, a components into the specified color object, or a new
    * object, for use with Int32Array. If little endian, then ABGR order is used when
    * unpacking, otherwise, RGBA order is used. The resulting color object has the
    * `r, g, b, a` properties which are unrelated to endianness.
    *
    * Note that the integer is assumed to be packed in the correct endianness. On little-endian
    * the format is 0xAABBGGRR and on big-endian the format is 0xRRGGBBAA. If you want a
    * endian-independent method, use fromRGBA(rgba) and toRGBA(r, g, b, a).
    *
    * @author Matt DesLauriers (@mattdesl)
    * @method Phaser.Color.unpackPixel
    * @static
    * @param {number} rgba - The integer, packed in endian order by packPixel.
    * @param {object} [out] - An object into which 3 properties will be created: r, g and b. If not provided a new object will be created.
    * @param {boolean} [hsl=false] - Also convert the rgb values into hsl?
    * @param {boolean} [hsv=false] - Also convert the rgb values into hsv?
    * @return {object} An object with the red, green and blue values set in the r, g and b properties.
    */
    unpackPixel: function (rgba, out, hsl, hsv) {

        if (out === undefined || out === null) { out = Phaser.Color.createColor(); }
        if (hsl === undefined || hsl === null) { hsl = false; }
        if (hsv === undefined || hsv === null) { hsv = false; }

        if (Phaser.Device.LITTLE_ENDIAN)
        {
            out.a = ((rgba & 0xff000000) >>> 24);
            out.b = ((rgba & 0x00ff0000) >>> 16);
            out.g = ((rgba & 0x0000ff00) >>> 8);
            out.r = ((rgba & 0x000000ff));
        }
        else
        {
            out.r = ((rgba & 0xff000000) >>> 24);
            out.g = ((rgba & 0x00ff0000) >>> 16);
            out.b = ((rgba & 0x0000ff00) >>> 8);
            out.a = ((rgba & 0x000000ff));
        }

        out.color = rgba;
        out.rgba = 'rgba(' + out.r + ',' + out.g + ',' + out.b + ',' + (out.a / 255) + ')';

        if (hsl)
        {
            Phaser.Color.RGBtoHSL(out.r, out.g, out.b, out);
        }

        if (hsv)
        {
            Phaser.Color.RGBtoHSV(out.r, out.g, out.b, out);
        }

        return out;

    },

    /**
    * A utility to convert an integer in 0xRRGGBBAA format to a color object.
    * This does not rely on endianness.
    *
    * @author Matt DesLauriers (@mattdesl)
    * @method Phaser.Color.fromRGBA
    * @static
    * @param {number} rgba - An RGBA hex
    * @param {object} [out] - The object to use, optional.
    * @return {object} A color object.
    */
    fromRGBA: function (rgba, out) {

        if (!out)
        {
            out = Phaser.Color.createColor();
        }

        out.r = ((rgba & 0xff000000) >>> 24);
        out.g = ((rgba & 0x00ff0000) >>> 16);
        out.b = ((rgba & 0x0000ff00) >>> 8);
        out.a = ((rgba & 0x000000ff));

        out.rgba = 'rgba(' + out.r + ',' + out.g + ',' + out.b + ',' + out.a + ')';

        return out;

    },

    /**
    * A utility to convert RGBA components to a 32 bit integer in RRGGBBAA format.
    *
    * @author Matt DesLauriers (@mattdesl)
    * @method Phaser.Color.toRGBA
    * @static
    * @param {number} r - The red color component, in the range 0 - 255.
    * @param {number} g - The green color component, in the range 0 - 255.
    * @param {number} b - The blue color component, in the range 0 - 255.
    * @param {number} a - The alpha color component, in the range 0 - 255.
    * @return {number} A RGBA-packed 32 bit integer
    */
    toRGBA: function (r, g, b, a) {

        return (r << 24) | (g << 16) | (b <<  8) | a;

    },

    /**
    * Converts RGBA components to a 32 bit integer in AABBGGRR format.
    *
    * @method Phaser.Color.toABGR
    * @static
    * @param {number} r - The red color component, in the range 0 - 255.
    * @param {number} g - The green color component, in the range 0 - 255.
    * @param {number} b - The blue color component, in the range 0 - 255.
    * @param {number} a - The alpha color component, in the range 0 - 255.
    * @return {number} A RGBA-packed 32 bit integer
    */
    toABGR: function (r, g, b, a) {

        return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;

    },

    /**
    * Converts an RGB color value to HSL (hue, saturation and lightness).
    * Conversion forumla from http://en.wikipedia.org/wiki/HSL_color_space.
    * Assumes RGB values are contained in the set [0, 255] and returns h, s and l in the set [0, 1].
    * Based on code by Michael Jackson (https://github.com/mjijackson)
    *
    * @method Phaser.Color.RGBtoHSL
    * @static
    * @param {number} r - The red color component, in the range 0 - 255.
    * @param {number} g - The green color component, in the range 0 - 255.
    * @param {number} b - The blue color component, in the range 0 - 255.
    * @param {object} [out] - An object into which 3 properties will be created, h, s and l. If not provided a new object will be created.
    * @return {object} An object with the hue, saturation and lightness values set in the h, s and l properties.
    */
    RGBtoHSL: function (r, g, b, out) {

        if (!out)
        {
            out = Phaser.Color.createColor(r, g, b, 1);
        }

        r /= 255;
        g /= 255;
        b /= 255;

        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);

        // achromatic by default
        out.h = 0;
        out.s = 0;
        out.l = (max + min) / 2;

        if (max !== min)
        {
            var d = max - min;

            out.s = out.l > 0.5 ? d / (2 - max - min) : d / (max + min);

            if (max === r)
            {
                out.h = (g - b) / d + (g < b ? 6 : 0);
            }
            else if (max === g)
            {
                out.h = (b - r) / d + 2;
            }
            else if (max === b)
            {
                out.h = (r - g) / d + 4;
            }

            out.h /= 6;
        }

        return out;

    },

    /**
    * Converts an HSL (hue, saturation and lightness) color value to RGB.
    * Conversion forumla from http://en.wikipedia.org/wiki/HSL_color_space.
    * Assumes HSL values are contained in the set [0, 1] and returns r, g and b values in the set [0, 255].
    * Based on code by Michael Jackson (https://github.com/mjijackson)
    *
    * @method Phaser.Color.HSLtoRGB
    * @static
    * @param {number} h - The hue, in the range 0 - 1.
    * @param {number} s - The saturation, in the range 0 - 1.
    * @param {number} l - The lightness, in the range 0 - 1.
    * @param {object} [out] - An object into which 3 properties will be created: r, g and b. If not provided a new object will be created.
    * @return {object} An object with the red, green and blue values set in the r, g and b properties.
    */
    HSLtoRGB: function (h, s, l, out) {

        if (!out)
        {
            out = Phaser.Color.createColor(l, l, l);
        }
        else
        {
            // achromatic by default
            out.r = l;
            out.g = l;
            out.b = l;
        }

        if (s !== 0)
        {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            out.r = Phaser.Color.hueToColor(p, q, h + 1 / 3);
            out.g = Phaser.Color.hueToColor(p, q, h);
            out.b = Phaser.Color.hueToColor(p, q, h - 1 / 3);
        }

        // out.r = (out.r * 255 | 0);
        // out.g = (out.g * 255 | 0);
        // out.b = (out.b * 255 | 0);

        out.r = Math.floor((out.r * 255 | 0));
        out.g = Math.floor((out.g * 255 | 0));
        out.b = Math.floor((out.b * 255 | 0));

        Phaser.Color.updateColor(out);

        return out;

    },

    /**
    * Converts an RGB color value to HSV (hue, saturation and value).
    * Conversion forumla from http://en.wikipedia.org/wiki/HSL_color_space.
    * Assumes RGB values are contained in the set [0, 255] and returns h, s and v in the set [0, 1].
    * Based on code by Michael Jackson (https://github.com/mjijackson)
    *
    * @method Phaser.Color.RGBtoHSV
    * @static
    * @param {number} r - The red color component, in the range 0 - 255.
    * @param {number} g - The green color component, in the range 0 - 255.
    * @param {number} b - The blue color component, in the range 0 - 255.
    * @param {object} [out] - An object into which 3 properties will be created, h, s and v. If not provided a new object will be created.
    * @return {object} An object with the hue, saturation and value set in the h, s and v properties.
    */
    RGBtoHSV: function (r, g, b, out) {

        if (!out)
        {
            out = Phaser.Color.createColor(r, g, b, 255);
        }

        r /= 255;
        g /= 255;
        b /= 255;

        var min = Math.min(r, g, b);
        var max = Math.max(r, g, b);
        var d = max - min;

        // achromatic by default
        out.h = 0;
        out.s = max === 0 ? 0 : d / max;
        out.v = max;

        if (max !== min)
        {
            if (max === r)
            {
                out.h = (g - b) / d + (g < b ? 6 : 0);
            }
            else if (max === g)
            {
                out.h = (b - r) / d + 2;
            }
            else if (max === b)
            {
                out.h = (r - g) / d + 4;
            }

            out.h /= 6;
        }

        return out;

    },

    /**
    * Converts an HSV (hue, saturation and value) color value to RGB.
    * Conversion forumla from http://en.wikipedia.org/wiki/HSL_color_space.
    * Assumes HSV values are contained in the set [0, 1] and returns r, g and b values in the set [0, 255].
    * Based on code by Michael Jackson (https://github.com/mjijackson)
    *
    * @method Phaser.Color.HSVtoRGB
    * @static
    * @param {number} h - The hue, in the range 0 - 1.
    * @param {number} s - The saturation, in the range 0 - 1.
    * @param {number} v - The value, in the range 0 - 1.
    * @param {object} [out] - An object into which 3 properties will be created: r, g and b. If not provided a new object will be created.
    * @return {object} An object with the red, green and blue values set in the r, g and b properties.
    */
    HSVtoRGB: function (h, s, v, out) {

        if (out === undefined) { out = Phaser.Color.createColor(0, 0, 0, 1, h, s, 0, v); }

        var r, g, b;
        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch (i % 6)
        {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
        }

        out.r = Math.floor(r * 255);
        out.g = Math.floor(g * 255);
        out.b = Math.floor(b * 255);

        Phaser.Color.updateColor(out);

        return out;

    },

    /**
    * Converts a hue to an RGB color.
    * Based on code by Michael Jackson (https://github.com/mjijackson)
    *
    * @method Phaser.Color.hueToColor
    * @static
    * @param {number} p
    * @param {number} q
    * @param {number} t
    * @return {number} The color component value.
    */
    hueToColor: function (p, q, t) {

        if (t < 0)
        {
            t += 1;
        }

        if (t > 1)
        {
            t -= 1;
        }

        if (t < 1 / 6)
        {
            return p + (q - p) * 6 * t;
        }

        if (t < 1 / 2)
        {
            return q;
        }

        if (t < 2 / 3)
        {
            return p + (q - p) * (2 / 3 - t) * 6;
        }

        return p;

    },

    /**
    * A utility function to create a lightweight 'color' object with the default components.
    * Any components that are not specified will default to zero.
    *
    * This is useful when you want to use a shared color object for the getPixel and getPixelAt methods.
    *
    * @author Matt DesLauriers (@mattdesl)
    * @method Phaser.Color.createColor
    * @static
    * @param {number} [r=0] - The red color component, in the range 0 - 255.
    * @param {number} [g=0] - The green color component, in the range 0 - 255.
    * @param {number} [b=0] - The blue color component, in the range 0 - 255.
    * @param {number} [a=1] - The alpha color component, in the range 0 - 1.
    * @param {number} [h=0] - The hue, in the range 0 - 1.
    * @param {number} [s=0] - The saturation, in the range 0 - 1.
    * @param {number} [l=0] - The lightness, in the range 0 - 1.
    * @param {number} [v=0] - The value, in the range 0 - 1.
    * @return {object} The resulting object with r, g, b, a properties and h, s, l and v.
    */
    createColor: function (r, g, b, a, h, s, l, v) {

        var out = { r: r || 0, g: g || 0, b: b || 0, a: a || 1, h: h || 0, s: s || 0, l: l || 0, v: v || 0, color: 0, color32: 0, rgba: '' };

        return Phaser.Color.updateColor(out);

    },

    /**
    * Takes a color object and updates the rgba, color and color32 properties.
    *
    * @method Phaser.Color.updateColor
    * @static
    * @param {object} out - The color object to update.
    * @returns {number} A native color value integer (format: 0xAARRGGBB).
    */
    updateColor: function (out) {

        out.rgba = 'rgba(' + out.r.toString() + ',' + out.g.toString() + ',' + out.b.toString() + ',' + out.a.toString() + ')';
        out.color = Phaser.Color.getColor(out.r, out.g, out.b);
        out.color32 = Phaser.Color.getColor32(out.a * 255, out.r, out.g, out.b);

        return out;

    },

    /**
    * Given an alpha and 3 color values this will return an integer representation of it.
    *
    * @method Phaser.Color.getColor32
    * @static
    * @param {number} a - The alpha color component, in the range 0 - 255.
    * @param {number} r - The red color component, in the range 0 - 255.
    * @param {number} g - The green color component, in the range 0 - 255.
    * @param {number} b - The blue color component, in the range 0 - 255.
    * @returns {number} A native color value integer (format: 0xAARRGGBB).
    */
    getColor32: function (a, r, g, b) {

        return a << 24 | r << 16 | g << 8 | b;

    },

    /**
    * Given 3 color values this will return an integer representation of it.
    *
    * @method Phaser.Color.getColor
    * @static
    * @param {number} r - The red color component, in the range 0 - 255.
    * @param {number} g - The green color component, in the range 0 - 255.
    * @param {number} b - The blue color component, in the range 0 - 255.
    * @returns {number} A native color value integer (format: 0xRRGGBB).
    */
    getColor: function (r, g, b) {

        return r << 16 | g << 8 | b;

    },

    /**
    * Converts the given color values into a string.
    * If prefix was '#' it will be in the format `#RRGGBB` otherwise `0xAARRGGBB`.
    *
    * @method Phaser.Color.RGBtoString
    * @static
    * @param {number} r - The red color component, in the range 0 - 255.
    * @param {number} g - The green color component, in the range 0 - 255.
    * @param {number} b - The blue color component, in the range 0 - 255.
    * @param {number} [a=255] - The alpha color component, in the range 0 - 255.
    * @param {string} [prefix='#'] - The prefix used in the return string. If '#' it will return `#RRGGBB`, else `0xAARRGGBB`.
    * @return {string} A string containing the color values. If prefix was '#' it will be in the format `#RRGGBB` otherwise `0xAARRGGBB`.
    */
    RGBtoString: function (r, g, b, a, prefix) {

        if (a === undefined) { a = 255; }
        if (prefix === undefined) { prefix = '#'; }

        if (prefix === '#')
        {
            return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
        else
        {
            return '0x' + Phaser.Color.componentToHex(a) + Phaser.Color.componentToHex(r) + Phaser.Color.componentToHex(g) + Phaser.Color.componentToHex(b);
        }

    },

    /**
    * Converts a hex string into an integer color value.
    *
    * @method Phaser.Color.hexToRGB
    * @static
    * @param {string} hex - The hex string to convert. Can be in the short-hand format `#03f` or `#0033ff`.
    * @return {number} The rgb color value in the format 0xAARRGGBB.
    */
    hexToRGB: function (hex) {

        var rgb = Phaser.Color.hexToColor(hex);

        if (rgb)
        {
            return Phaser.Color.getColor32(rgb.a, rgb.r, rgb.g, rgb.b);
        }

    },

    /**
    * Converts a hex string into a Phaser Color object.
    *
    * The hex string can supplied as `'#0033ff'` or the short-hand format of `'#03f'`; it can begin with an optional "#" or "0x", or be unprefixed.    
    *
    * An alpha channel is _not_ supported.
    *
    * @method Phaser.Color.hexToColor
    * @static
    * @param {string} hex - The color string in a hex format.
    * @param {object} [out] - An object into which 3 properties will be created or set: r, g and b. If not provided a new object will be created.
    * @return {object} An object with the red, green and blue values set in the r, g and b properties.
    */
    hexToColor: function (hex, out) {

        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        hex = hex.replace(/^(?:#|0x)?([a-f\d])([a-f\d])([a-f\d])$/i, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^(?:#|0x)?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        if (result)
        {
            var r = parseInt(result[1], 16);
            var g = parseInt(result[2], 16);
            var b = parseInt(result[3], 16);

            if (!out)
            {
                out = Phaser.Color.createColor(r, g, b);
            }
            else
            {
                out.r = r;
                out.g = g;
                out.b = b;
            }
        }

        return out;

    },

    /**
    * Converts a CSS 'web' string into a Phaser Color object.
    *
    * The web string can be in the format `'rgb(r,g,b)'` or `'rgba(r,g,b,a)'` where r/g/b are in the range [0..255] and a is in the range [0..1].
    *
    * @method Phaser.Color.webToColor
    * @static
    * @param {string} web - The color string in CSS 'web' format.
    * @param {object} [out] - An object into which 4 properties will be created: r, g, b and a. If not provided a new object will be created.
    * @return {object} An object with the red, green, blue and alpha values set in the r, g, b and a properties.
    */
    webToColor: function (web, out) {

        if (!out)
        {
            out = Phaser.Color.createColor();
        }

        var result = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?))?\s*\)$/.exec(web);

        if (result)
        {
            out.r = parseInt(result[1], 10);
            out.g = parseInt(result[2], 10);
            out.b = parseInt(result[3], 10);
            out.a = result[4] !== undefined ? parseFloat(result[4]) : 1;
            Phaser.Color.updateColor(out);
        }

        return out;

    },

    /**
    * Converts a value - a "hex" string, a "CSS 'web' string", or a number - into red, green, blue, and alpha components.
    *
    * The value can be a string (see `hexToColor` and `webToColor` for the supported formats) or a packed integer (see `getRGB`).
    *
    * An alpha channel is _not_ supported when specifying a hex string.
    *
    * @method Phaser.Color.valueToColor
    * @static
    * @param {string|number} value - The color expressed as a recognized string format or a packed integer.
    * @param {object} [out] - The object to use for the output. If not provided a new object will be created.
    * @return {object} The (`out`) object with the red, green, blue, and alpha values set as the r/g/b/a properties.
    */
    valueToColor: function (value, out) {

        //  The behavior is not consistent between hexToColor/webToColor on invalid input.
        //  This unifies both by returning a new object, but returning null may be better.
        if (!out)
        {
            out = Phaser.Color.createColor();
        }

        if (typeof value === 'string')
        {
            if (value.indexOf('rgb') === 0)
            {
                return Phaser.Color.webToColor(value, out);
            }
            else
            {
                //  `hexToColor` does not support alpha; match `createColor`.
                out.a = 1;
                return Phaser.Color.hexToColor(value, out);
            }
        }
        else if (typeof value === 'number')
        {
            //  `getRGB` does not take optional object to modify;
            //  alpha is also adjusted to match `createColor`.
            var tempColor = Phaser.Color.getRGB(value);
            out.r = tempColor.r;
            out.g = tempColor.g;
            out.b = tempColor.b;
            out.a = tempColor.a / 255;
            return out;
        }
        else
        {
            return out;
        }

    },

    /**
    * Return a string containing a hex representation of the given color component.
    *
    * @method Phaser.Color.componentToHex
    * @static
    * @param {number} color - The color channel to get the hex value for, must be a value between 0 and 255.
    * @returns {string} A string of length 2 characters, i.e. 255 = ff, 100 = 64.
    */
    componentToHex: function (color) {

        var hex = color.toString(16);

        return (hex.length === 1) ? '0' + hex : hex;

    },

    /**
    * Get HSV color wheel values in an array which will be 360 elements in size.
    *
    * @method Phaser.Color.HSVColorWheel
    * @static
    * @param {number} [s=1] - The saturation, in the range 0 - 1.
    * @param {number} [v=1] - The value, in the range 0 - 1.
    * @return {array} An array containing 360 elements corresponding to the HSV color wheel.
    */
    HSVColorWheel: function (s, v) {

        if (s === undefined) { s = 1.0; }
        if (v === undefined) { v = 1.0; }

        var colors = [];

        for (var c = 0; c <= 359; c++)
        {
            colors.push(Phaser.Color.HSVtoRGB(c / 359, s, v));
        }

        return colors;

    },

    /**
    * Get HSL color wheel values in an array which will be 360 elements in size.
    *
    * @method Phaser.Color.HSLColorWheel
    * @static
    * @param {number} [s=0.5] - The saturation, in the range 0 - 1.
    * @param {number} [l=0.5] - The lightness, in the range 0 - 1.
    * @return {array} An array containing 360 elements corresponding to the HSL color wheel.
    */
    HSLColorWheel: function (s, l) {

        if (s === undefined) { s = 0.5; }
        if (l === undefined) { l = 0.5; }

        var colors = [];

        for (var c = 0; c <= 359; c++)
        {
            colors.push(Phaser.Color.HSLtoRGB(c / 359, s, l));
        }

        return colors;

    },

    /**
    * Interpolates the two given colours based on the supplied step and currentStep properties.
    *
    * @method Phaser.Color.interpolateColor
    * @static
    * @param {number} color1 - The first color value.
    * @param {number} color2 - The second color value.
    * @param {number} steps - The number of steps to run the interpolation over.
    * @param {number} currentStep - The currentStep value. If the interpolation will take 100 steps, a currentStep value of 50 would be half-way between the two.
    * @param {number} alpha - The alpha of the returned color.
    * @returns {number} The interpolated color value.
    */
    interpolateColor: function (color1, color2, steps, currentStep, alpha) {

        if (alpha === undefined) { alpha = 255; }

        var src1 = Phaser.Color.getRGB(color1);
        var src2 = Phaser.Color.getRGB(color2);
        var r = (((src2.red - src1.red) * currentStep) / steps) + src1.red;
        var g = (((src2.green - src1.green) * currentStep) / steps) + src1.green;
        var b = (((src2.blue - src1.blue) * currentStep) / steps) + src1.blue;

        return Phaser.Color.getColor32(alpha, r, g, b);

    },

    /**
    * Interpolates the two given colours based on the supplied step and currentStep properties.
    *
    * @method Phaser.Color.interpolateColorWithRGB
    * @static
    * @param {number} color - The first color value.
    * @param {number} r - The red color value, between 0 and 0xFF (255).
    * @param {number} g - The green color value, between 0 and 0xFF (255).
    * @param {number} b - The blue color value, between 0 and 0xFF (255).
    * @param {number} steps - The number of steps to run the interpolation over.
    * @param {number} currentStep - The currentStep value. If the interpolation will take 100 steps, a currentStep value of 50 would be half-way between the two.
    * @returns {number} The interpolated color value.
    */
    interpolateColorWithRGB: function (color, r, g, b, steps, currentStep) {

        var src = Phaser.Color.getRGB(color);
        var or = (((r - src.red) * currentStep) / steps) + src.red;
        var og = (((g - src.green) * currentStep) / steps) + src.green;
        var ob = (((b - src.blue) * currentStep) / steps) + src.blue;

        return Phaser.Color.getColor(or, og, ob);

    },

    /**
    * Interpolates the two given colours based on the supplied step and currentStep properties.
    * @method Phaser.Color.interpolateRGB
    * @static
    * @param {number} r1 - The red color value, between 0 and 0xFF (255).
    * @param {number} g1 - The green color value, between 0 and 0xFF (255).
    * @param {number} b1 - The blue color value, between 0 and 0xFF (255).
    * @param {number} r2 - The red color value, between 0 and 0xFF (255).
    * @param {number} g2 - The green color value, between 0 and 0xFF (255).
    * @param {number} b2 - The blue color value, between 0 and 0xFF (255).
    * @param {number} steps - The number of steps to run the interpolation over.
    * @param {number} currentStep - The currentStep value. If the interpolation will take 100 steps, a currentStep value of 50 would be half-way between the two.
    * @returns {number} The interpolated color value.
    */
    interpolateRGB: function (r1, g1, b1, r2, g2, b2, steps, currentStep) {

        var r = (((r2 - r1) * currentStep) / steps) + r1;
        var g = (((g2 - g1) * currentStep) / steps) + g1;
        var b = (((b2 - b1) * currentStep) / steps) + b1;

        return Phaser.Color.getColor(r, g, b);

    },

    /**
    * Returns a random color value between black and white
    * Set the min value to start each channel from the given offset.
    * Set the max value to restrict the maximum color used per channel.
    *
    * @method Phaser.Color.getRandomColor
    * @static
    * @param {number} [min=0] - The lowest value to use for the color.
    * @param {number} [max=255] - The highest value to use for the color.
    * @param {number} [alpha=255] - The alpha value of the returning color (default 255 = fully opaque).
    * @returns {number} 32-bit color value with alpha.
    */
    getRandomColor: function (min, max, alpha) {

        if (min === undefined) { min = 0; }
        if (max === undefined) { max = 255; }
        if (alpha === undefined) { alpha = 255; }

        //  Sanity checks
        if (max > 255 || min > max)
        {
            return Phaser.Color.getColor(255, 255, 255);
        }

        var red = min + Math.round(Math.random() * (max - min));
        var green = min + Math.round(Math.random() * (max - min));
        var blue = min + Math.round(Math.random() * (max - min));

        return Phaser.Color.getColor32(alpha, red, green, blue);

    },

    /**
    * Return the component parts of a color as an Object with the properties alpha, red, green, blue.
    *
    * Alpha will only be set if it exist in the given color (0xAARRGGBB)
    *
    * @method Phaser.Color.getRGB
    * @static
    * @param {number} color - Color in RGB (0xRRGGBB) or ARGB format (0xAARRGGBB).
    * @returns {object} An Object with properties: alpha, red, green, blue (also r, g, b and a). Alpha will only be present if a color value > 16777215 was given.
    */
    getRGB: function (color) {

        if (color > 16777215)
        {
            //  The color value has an alpha component
            return {
                alpha: color >>> 24,
                red: color >> 16 & 0xFF,
                green: color >> 8 & 0xFF,
                blue: color & 0xFF,
                a: color >>> 24,
                r: color >> 16 & 0xFF,
                g: color >> 8 & 0xFF,
                b: color & 0xFF
            };
        }
        else
        {
            return {
                alpha: 255,
                red: color >> 16 & 0xFF,
                green: color >> 8 & 0xFF,
                blue: color & 0xFF,
                a: 255,
                r: color >> 16 & 0xFF,
                g: color >> 8 & 0xFF,
                b: color & 0xFF
            };
        }

    },

    /**
    * Returns a CSS friendly string value from the given color.
    *
    * @method Phaser.Color.getWebRGB
    * @static
    * @param {number|Object} color - Color in RGB (0xRRGGBB), ARGB format (0xAARRGGBB) or an Object with r, g, b, a properties.
    * @returns {string} A string in the format: 'rgba(r,g,b,a)'
    */
    getWebRGB: function (color) {

        if (typeof color === 'object')
        {
            return 'rgba(' + color.r.toString() + ',' + color.g.toString() + ',' + color.b.toString() + ',' + (color.a / 255).toString() + ')';
        }
        else
        {
            var rgb = Phaser.Color.getRGB(color);
            return 'rgba(' + rgb.r.toString() + ',' + rgb.g.toString() + ',' + rgb.b.toString() + ',' + (rgb.a / 255).toString() + ')';
        }

    },

    /**
    * Given a native color value (in the format 0xAARRGGBB) this will return the Alpha component, as a value between 0 and 255.
    *
    * @method Phaser.Color.getAlpha
    * @static
    * @param {number} color - In the format 0xAARRGGBB.
    * @returns {number} The Alpha component of the color, will be between 0 and 1 (0 being no Alpha (opaque), 1 full Alpha (transparent)).
    */
    getAlpha: function (color) {
        return color >>> 24;
    },

    /**
    * Given a native color value (in the format 0xAARRGGBB) this will return the Alpha component as a value between 0 and 1.
    *
    * @method Phaser.Color.getAlphaFloat
    * @static
    * @param {number} color - In the format 0xAARRGGBB.
    * @returns {number} The Alpha component of the color, will be between 0 and 1 (0 being no Alpha (opaque), 1 full Alpha (transparent)).
    */
    getAlphaFloat: function (color) {
        return (color >>> 24) / 255;
    },

    /**
    * Given a native color value (in the format 0xAARRGGBB) this will return the Red component, as a value between 0 and 255.
    *
    * @method Phaser.Color.getRed
    * @static
    * @param {number} color In the format 0xAARRGGBB.
    * @returns {number} The Red component of the color, will be between 0 and 255 (0 being no color, 255 full Red).
    */
    getRed: function (color) {
        return color >> 16 & 0xFF;
    },

    /**
    * Given a native color value (in the format 0xAARRGGBB) this will return the Green component, as a value between 0 and 255.
    *
    * @method Phaser.Color.getGreen
    * @static
    * @param {number} color - In the format 0xAARRGGBB.
    * @returns {number} The Green component of the color, will be between 0 and 255 (0 being no color, 255 full Green).
    */
    getGreen: function (color) {
        return color >> 8 & 0xFF;
    },

    /**
    * Given a native color value (in the format 0xAARRGGBB) this will return the Blue component, as a value between 0 and 255.
    *
    * @method Phaser.Color.getBlue
    * @static
    * @param {number} color - In the format 0xAARRGGBB.
    * @returns {number} The Blue component of the color, will be between 0 and 255 (0 being no color, 255 full Blue).
    */
    getBlue: function (color) {
        return color & 0xFF;
    },

    /**
    * Blends the source color, ignoring the backdrop.
    *
    * @method Phaser.Color.blendNormal
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendNormal: function (a) {
        return a;
    },

    /**
    * Selects the lighter of the backdrop and source colors.
    *
    * @method Phaser.Color.blendLighten
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendLighten: function (a, b) {
        return (b > a) ? b : a;
    },

    /**
    * Selects the darker of the backdrop and source colors.
    *
    * @method Phaser.Color.blendDarken
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendDarken: function (a, b) {
        return (b > a) ? a : b;
    },

    /**
    * Multiplies the backdrop and source color values.
    * The result color is always at least as dark as either of the two constituent
    * colors. Multiplying any color with black produces black;
    * multiplying with white leaves the original color unchanged.
    *
    * @method Phaser.Color.blendMultiply
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendMultiply: function (a, b) {
        return (a * b) / 255;
    },

    /**
    * Takes the average of the source and backdrop colors.
    *
    * @method Phaser.Color.blendAverage
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendAverage: function (a, b) {
        return (a + b) / 2;
    },

    /**
    * Adds the source and backdrop colors together and returns the value, up to a maximum of 255.
    *
    * @method Phaser.Color.blendAdd
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendAdd: function (a, b) {
        return Math.min(255, a + b);
    },

    /**
    * Combines the source and backdrop colors and returns their value minus 255.
    *
    * @method Phaser.Color.blendSubtract
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendSubtract: function (a, b) {
        return Math.max(0, a + b - 255);
    },

    /**
    * Subtracts the darker of the two constituent colors from the lighter.
    * 
    * Painting with white inverts the backdrop color; painting with black produces no change. 
    *
    * @method Phaser.Color.blendDifference
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendDifference: function (a, b) {
        return Math.abs(a - b);
    },

    /**
    * Negation blend mode.
    *
    * @method Phaser.Color.blendNegation
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendNegation: function (a, b) {
        return 255 - Math.abs(255 - a - b);
    },

    /**
    * Multiplies the complements of the backdrop and source color values, then complements the result.
    * The result color is always at least as light as either of the two constituent colors. 
    * Screening any color with white produces white; screening with black leaves the original color unchanged. 
    *
    * @method Phaser.Color.blendScreen
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendScreen: function (a, b) {
        return 255 - (((255 - a) * (255 - b)) >> 8);
    },

    /**
    * Produces an effect similar to that of the Difference mode, but lower in contrast. 
    * Painting with white inverts the backdrop color; painting with black produces no change. 
    *
    * @method Phaser.Color.blendExclusion
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendExclusion: function (a, b) {
        return a + b - 2 * a * b / 255;
    },

    /**
    * Multiplies or screens the colors, depending on the backdrop color.
    * Source colors overlay the backdrop while preserving its highlights and shadows. 
    * The backdrop color is not replaced, but is mixed with the source color to reflect the lightness or darkness of the backdrop.
    *
    * @method Phaser.Color.blendOverlay
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendOverlay: function (a, b) {
        return b < 128 ? (2 * a * b / 255) : (255 - 2 * (255 - a) * (255 - b) / 255);
    },

    /**
    * Darkens or lightens the colors, depending on the source color value. 
    * 
    * If the source color is lighter than 0.5, the backdrop is lightened, as if it were dodged; 
    * this is useful for adding highlights to a scene. 
    * 
    * If the source color is darker than 0.5, the backdrop is darkened, as if it were burned in. 
    * The degree of lightening or darkening is proportional to the difference between the source color and 0.5; 
    * if it is equal to 0.5, the backdrop is unchanged.
    * 
    * Painting with pure black or white produces a distinctly darker or lighter area, but does not result in pure black or white. 
    * The effect is similar to shining a diffused spotlight on the backdrop. 
    *
    * @method Phaser.Color.blendSoftLight
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendSoftLight: function (a, b) {
        return b < 128 ? (2 * ((a >> 1) + 64)) * (b / 255) : 255 - (2 * (255 - ((a >> 1) + 64)) * (255 - b) / 255);
    },

    /**
    * Multiplies or screens the colors, depending on the source color value. 
    * 
    * If the source color is lighter than 0.5, the backdrop is lightened, as if it were screened; 
    * this is useful for adding highlights to a scene. 
    * 
    * If the source color is darker than 0.5, the backdrop is darkened, as if it were multiplied; 
    * this is useful for adding shadows to a scene. 
    * 
    * The degree of lightening or darkening is proportional to the difference between the source color and 0.5; 
    * if it is equal to 0.5, the backdrop is unchanged.
    * 
    * Painting with pure black or white produces pure black or white. The effect is similar to shining a harsh spotlight on the backdrop. 
    *
    * @method Phaser.Color.blendHardLight
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendHardLight: function (a, b) {
        return Phaser.Color.blendOverlay(b, a);
    },

    /**
    * Brightens the backdrop color to reflect the source color. 
    * Painting with black produces no change.
    *
    * @method Phaser.Color.blendColorDodge
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendColorDodge: function (a, b) {
        return b === 255 ? b : Math.min(255, ((a << 8) / (255 - b)));
    },

    /**
    * Darkens the backdrop color to reflect the source color.
    * Painting with white produces no change. 
    *
    * @method Phaser.Color.blendColorBurn
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendColorBurn: function (a, b) {
        return b === 0 ? b : Math.max(0, (255 - ((255 - a) << 8) / b));
    },

    /**
    * An alias for blendAdd, it simply sums the values of the two colors.
    *
    * @method Phaser.Color.blendLinearDodge
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendLinearDodge: function (a, b) {
        return Phaser.Color.blendAdd(a, b);
    },

    /**
    * An alias for blendSubtract, it simply sums the values of the two colors and subtracts 255.
    *
    * @method Phaser.Color.blendLinearBurn
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendLinearBurn: function (a, b) {
        return Phaser.Color.blendSubtract(a, b);
    },

    /**
    * This blend mode combines Linear Dodge and Linear Burn (rescaled so that neutral colors become middle gray).
    * Dodge applies to values of top layer lighter than middle gray, and burn to darker values.
    * The calculation simplifies to the sum of bottom layer and twice the top layer, subtract 128. The contrast decreases.
    *
    * @method Phaser.Color.blendLinearLight
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendLinearLight: function (a, b) {
        return b < 128 ? Phaser.Color.blendLinearBurn(a, 2 * b) : Phaser.Color.blendLinearDodge(a, (2 * (b - 128)));
    },

    /**
    * This blend mode combines Color Dodge and Color Burn (rescaled so that neutral colors become middle gray).
    * Dodge applies when values in the top layer are lighter than middle gray, and burn to darker values.
    * The middle gray is the neutral color. When color is lighter than this, this effectively moves the white point of the bottom 
    * layer down by twice the difference; when it is darker, the black point is moved up by twice the difference. The perceived contrast increases.
    *
    * @method Phaser.Color.blendVividLight
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendVividLight: function (a, b) {
        return b < 128 ? Phaser.Color.blendColorBurn(a, 2 * b) : Phaser.Color.blendColorDodge(a, (2 * (b - 128)));
    },

    /**
    * If the backdrop color (light source) is lighter than 50%, the blendDarken mode is used, and colors lighter than the backdrop color do not change.
    * If the backdrop color is darker than 50% gray, colors lighter than the blend color are replaced, and colors darker than the blend color do not change.
    *
    * @method Phaser.Color.blendPinLight
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendPinLight: function (a, b) {
        return b < 128 ? Phaser.Color.blendDarken(a, 2 * b) : Phaser.Color.blendLighten(a, (2 * (b - 128)));
    },

    /**
    * Runs blendVividLight on the source and backdrop colors.
    * If the resulting color is 128 or more, it receives a value of 255; if less than 128, a value of 0.
    * Therefore, all blended pixels have red, green, and blue channel values of either 0 or 255.
    * This changes all pixels to primary additive colors (red, green, or blue), white, or black.
    *
    * @method Phaser.Color.blendHardMix
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendHardMix: function (a, b) {
        return Phaser.Color.blendVividLight(a, b) < 128 ? 0 : 255;
    },

    /**
    * Reflect blend mode. This mode is useful when adding shining objects or light zones to images. 
    *
    * @method Phaser.Color.blendReflect
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendReflect: function (a, b) {
        return b === 255 ? b : Math.min(255, (a * a / (255 - b)));
    },

    /**
    * Glow blend mode. This mode is a variation of reflect mode with the source and backdrop colors swapped.
    *
    * @method Phaser.Color.blendGlow
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendGlow: function (a, b) {
        return Phaser.Color.blendReflect(b, a);
    },

    /**
    * Phoenix blend mode. This subtracts the lighter color from the darker color, and adds 255, giving a bright result.
    *
    * @method Phaser.Color.blendPhoenix
    * @static
    * @param {integer} a - The source color to blend, in the range 1 to 255.
    * @param {integer} b - The backdrop color to blend, in the range 1 to 255.
    * @returns {integer} The blended color value, in the range 1 to 255.
    */
    blendPhoenix: function (a, b) {
        return Math.min(a, b) - Math.max(a, b) + 255;
    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Physics Manager is responsible for looking after all of the running physics systems.
* Phaser supports 4 physics systems: Arcade Physics, P2, Ninja Physics and Box2D via a commercial plugin.
* 
* Game Objects (such as Sprites) can only belong to 1 physics system, but you can have multiple systems active in a single game.
*
* For example you could have P2 managing a polygon-built terrain landscape that an vehicle drives over, while it could be firing bullets that use the
* faster (due to being much simpler) Arcade Physics system.
*
* @class Phaser.Physics
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {object} [physicsConfig=null] - A physics configuration object to pass to the Physics world on creation.
*/
Phaser.Physics = function (game, config) {

    config = config || {};

    /**
    * @property {Phaser.Game} game - Local reference to game.
    */
    this.game = game;

    /**
    * @property {object} config - The physics configuration object as passed to the game on creation.
    */
    this.config = config;

    /**
    * @property {Phaser.Physics.Arcade} arcade - The Arcade Physics system.
    */
    this.arcade = null;

    /**
    * @property {Phaser.Physics.P2} p2 - The P2.JS Physics system.
    */
    this.p2 = null;

    /**
    * @property {Phaser.Physics.Ninja} ninja - The N+ Ninja Physics system.
    */
    this.ninja = null;

    /**
    * @property {Phaser.Physics.Box2D} box2d - The Box2D Physics system.
    */
    this.box2d = null;

    /**
    * @property {Phaser.Physics.Chipmunk} chipmunk - The Chipmunk Physics system (to be done).
    */
    this.chipmunk = null;

    /**
    * @property {Phaser.Physics.Matter} matter - The MatterJS Physics system (coming soon).
    */
    this.matter = null;

    this.parseConfig();

};

/**
* @const
* @type {number}
*/
Phaser.Physics.ARCADE = 0;

/**
* @const
* @type {number}
*/
Phaser.Physics.P2JS = 1;

/**
* @const
* @type {number}
*/
Phaser.Physics.NINJA = 2;

/**
* @const
* @type {number}
*/
Phaser.Physics.BOX2D = 3;

/**
* @const
* @type {number}
*/
Phaser.Physics.CHIPMUNK = 4;

/**
* @const
* @type {number}
*/
Phaser.Physics.MATTERJS = 5;

Phaser.Physics.prototype = {

    /**
    * Parses the Physics Configuration object passed to the Game constructor and starts any physics systems specified within.
    *
    * @method Phaser.Physics#parseConfig
    */
    parseConfig: function () {

        if ((!this.config.hasOwnProperty('arcade') || this.config['arcade'] === true) && Phaser.Physics.hasOwnProperty('Arcade'))
        {
            //  If Arcade isn't specified, we create it automatically if we can
            this.arcade = new Phaser.Physics.Arcade(this.game);
        }

        if (this.config.hasOwnProperty('ninja') && this.config['ninja'] === true && Phaser.Physics.hasOwnProperty('Ninja'))
        {
            this.ninja = new Phaser.Physics.Ninja(this.game);
        }

        if (this.config.hasOwnProperty('p2') && this.config['p2'] === true && Phaser.Physics.hasOwnProperty('P2'))
        {
            this.p2 = new Phaser.Physics.P2(this.game, this.config);
        }

        if (this.config.hasOwnProperty('box2d') && this.config['box2d'] === true && Phaser.Physics.hasOwnProperty('BOX2D'))
        {
            this.box2d = new Phaser.Physics.BOX2D(this.game, this.config);
        }

        if (this.config.hasOwnProperty('matter') && this.config['matter'] === true && Phaser.Physics.hasOwnProperty('Matter'))
        {
            this.matter = new Phaser.Physics.Matter(this.game, this.config);
        }

    },

    /**
    * This will create an instance of the requested physics simulation.
    * Phaser.Physics.Arcade is running by default, but all others need activating directly.
    * 
    * You can start the following physics systems:
    * 
    * Phaser.Physics.P2JS - A full-body advanced physics system by Stefan Hedman.
    * Phaser.Physics.NINJA - A port of Metanet Softwares N+ physics system.
    * Phaser.Physics.BOX2D - A commercial Phaser Plugin (see http://phaser.io)
    *
    * Both Ninja Physics and Box2D require their respective plugins to be loaded before you can start them.
    * They are not bundled into the core Phaser library.
    *
    * If the physics world has already been created (i.e. in another state in your game) then 
    * calling startSystem will reset the physics world, not re-create it. If you need to start them again from their constructors 
    * then set Phaser.Physics.p2 (or whichever system you want to recreate) to `null` before calling `startSystem`.
    *
    * @method Phaser.Physics#startSystem
    * @param {number} system - The physics system to start: Phaser.Physics.ARCADE, Phaser.Physics.P2JS, Phaser.Physics.NINJA or Phaser.Physics.BOX2D.
    */
    startSystem: function (system) {

        if (system === Phaser.Physics.ARCADE)
        {
            this.arcade = new Phaser.Physics.Arcade(this.game);
        }
        else if (system === Phaser.Physics.P2JS)
        {
            if (this.p2 === null)
            {
                this.p2 = new Phaser.Physics.P2(this.game, this.config);
            }
            else
            {
                this.p2.reset();
            }
        }
        else if (system === Phaser.Physics.NINJA)
        {
            this.ninja = new Phaser.Physics.Ninja(this.game);
        }
        else if (system === Phaser.Physics.BOX2D)
        {
            if (this.box2d === null)
            {
                this.box2d = new Phaser.Physics.Box2D(this.game, this.config);
            }
            else
            {
                this.box2d.reset();
            }
        }
        else if (system === Phaser.Physics.MATTERJS)
        {
            if (this.matter === null)
            {
                this.matter = new Phaser.Physics.Matter(this.game, this.config);
            }
            else
            {
                this.matter.reset();
            }
        }

    },

    /**
    * This will create a default physics body on the given game object or array of objects.
    * A game object can only have 1 physics body active at any one time, and it can't be changed until the object is destroyed.
    * It can be for any of the physics systems that have been started:
    *
    * Phaser.Physics.Arcade - A light weight AABB based collision system with basic separation.
    * Phaser.Physics.P2JS - A full-body advanced physics system supporting multiple object shapes, polygon loading, contact materials, springs and constraints.
    * Phaser.Physics.NINJA - A port of Metanet Softwares N+ physics system. Advanced AABB and Circle vs. Tile collision.
    * Phaser.Physics.BOX2D - A port of https://code.google.com/p/box2d-html5
    * Phaser.Physics.MATTER - A full-body and light-weight advanced physics system (still in development)
    * Phaser.Physics.CHIPMUNK is still in development.
    *
    * If you require more control over what type of body is created, for example to create a Ninja Physics Circle instead of the default AABB, then see the
    * individual physics systems `enable` methods instead of using this generic one.
    *
    * @method Phaser.Physics#enable
    * @param {object|array} object - The game object to create the physics body on. Can also be an array of objects, a body will be created on every object in the array.
    * @param {number} [system=Phaser.Physics.ARCADE] - The physics system that will be used to create the body. Defaults to Arcade Physics.
    * @param {boolean} [debug=false] - Enable the debug drawing for this body. Defaults to false.
    */
    enable: function (object, system, debug) {

        if (system === undefined) { system = Phaser.Physics.ARCADE; }
        if (debug === undefined) { debug = false; }

        if (system === Phaser.Physics.ARCADE)
        {
            this.arcade.enable(object);
        }
        else if (system === Phaser.Physics.P2JS && this.p2)
        {
            this.p2.enable(object, debug);
        }
        else if (system === Phaser.Physics.NINJA && this.ninja)
        {
            this.ninja.enableAABB(object);
        }
        else if (system === Phaser.Physics.BOX2D && this.box2d)
        {
            this.box2d.enable(object);
        }
        else if (system === Phaser.Physics.MATTERJS && this.matter)
        {
            this.matter.enable(object);
        }
        else
        {
            console.warn(object.key + ' is attempting to enable a physics body using an unknown physics system.');
        }

    },

    /**
    * preUpdate checks.
    *
    * @method Phaser.Physics#preUpdate
    * @protected
    */
    preUpdate: function () {

        //  ArcadePhysics / Ninja don't have a core to preUpdate

        if (this.p2)
        {
            this.p2.preUpdate();
        }

        if (this.box2d)
        {
            this.box2d.preUpdate();
        }

        if (this.matter)
        {
            this.matter.preUpdate();
        }

    },

    /**
    * Updates all running physics systems.
    *
    * @method Phaser.Physics#update
    * @protected
    */
    update: function () {

        //  ArcadePhysics / Ninja don't have a core to update

        if (this.p2)
        {
            this.p2.update();
        }

        if (this.box2d)
        {
            this.box2d.update();
        }

        if (this.matter)
        {
            this.matter.update();
        }

    },

    /**
    * Updates the physics bounds to match the world dimensions.
    *
    * @method Phaser.Physics#setBoundsToWorld
    * @protected
    */
    setBoundsToWorld: function () {

        if (this.arcade)
        {
            this.arcade.setBoundsToWorld();
        }

        if (this.ninja)
        {
            this.ninja.setBoundsToWorld();
        }

        if (this.p2)
        {
            this.p2.setBoundsToWorld();
        }

        if (this.box2d)
        {
            this.box2d.setBoundsToWorld();
        }

        if (this.matter)
        {
            this.matter.setBoundsToWorld();
        }

    },

    /**
    * Clears down all active physics systems. This doesn't destroy them, it just clears them of objects and is called when the State changes.
    *
    * @method Phaser.Physics#clear
    * @protected
    */
    clear: function () {

        if (this.p2)
        {
            this.p2.clear();
        }

        if (this.box2d)
        {
            this.box2d.clear();
        }

        if (this.matter)
        {
            this.matter.clear();
        }

    },

    /**
    * Resets the active physics system. Called automatically on a Phaser.State swap.
    *
    * @method Phaser.Physics#reset
    * @protected
    */
    reset: function () {

        if (this.p2)
        {
            this.p2.reset();
        }

        if (this.box2d)
        {
            this.box2d.reset();
        }

        if (this.matter)
        {
            this.matter.reset();
        }

    },

    /**
    * Destroys all active physics systems. Usually only called on a Game Shutdown, not on a State swap.
    *
    * @method Phaser.Physics#destroy
    */
    destroy: function () {

        if (this.p2)
        {
            this.p2.destroy();
        }

        if (this.box2d)
        {
            this.box2d.destroy();
        }

        if (this.matter)
        {
            this.matter.destroy();
        }

        this.arcade = null;
        this.ninja = null;
        this.p2 = null;
        this.box2d = null;
        this.matter = null;

    }

};

Phaser.Physics.prototype.constructor = Phaser.Physics;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Arcade Physics world. Contains Arcade Physics related collision, overlap and motion methods.
*
* @class Phaser.Physics.Arcade
* @constructor
* @param {Phaser.Game} game - reference to the current game instance.
*/
Phaser.Physics.Arcade = function (game) {

    /**
    * @property {Phaser.Game} game - Local reference to game.
    */
    this.game = game;

    /**
    * @property {Phaser.Point} gravity - The World gravity setting. Defaults to x: 0, y: 0, or no gravity.
    */
    this.gravity = new Phaser.Point();

    /**
    * @property {Phaser.Rectangle} bounds - The bounds inside of which the physics world exists. Defaults to match the world bounds.
    */
    this.bounds = new Phaser.Rectangle(0, 0, game.world.width, game.world.height);

    /**
    * Set the checkCollision properties to control for which bounds collision is processed.
    * For example checkCollision.down = false means Bodies cannot collide with the World.bounds.bottom.
    * @property {object} checkCollision - An object containing allowed collision flags.
    */
    this.checkCollision = { up: true, down: true, left: true, right: true };

    /**
    * @property {number} maxObjects - Used by the QuadTree to set the maximum number of objects per quad.
    */
    this.maxObjects = 10;

    /**
    * @property {number} maxLevels - Used by the QuadTree to set the maximum number of iteration levels.
    */
    this.maxLevels = 4;

    /**
    * @property {number} OVERLAP_BIAS - A value added to the delta values during collision checks.
    */
    this.OVERLAP_BIAS = 4;

    /**
    * @property {boolean} forceX - If true World.separate will always separate on the X axis before Y. Otherwise it will check gravity totals first.
    */
    this.forceX = false;

    /**
    * @property {number} sortDirection - Used when colliding a Sprite vs. a Group, or a Group vs. a Group, this defines the direction the sort is based on. Default is Phaser.Physics.Arcade.LEFT_RIGHT.
    * @default
    */
    this.sortDirection = Phaser.Physics.Arcade.LEFT_RIGHT;

    /**
    * @property {boolean} skipQuadTree - If true the QuadTree will not be used for any collision. QuadTrees are great if objects are well spread out in your game, otherwise they are a performance hit. If you enable this you can disable on a per body basis via `Body.skipQuadTree`.
    */
    this.skipQuadTree = true;

    /**
    * @property {boolean} isPaused - If `true` the `Body.preUpdate` method will be skipped, halting all motion for all bodies. Note that other methods such as `collide` will still work, so be careful not to call them on paused bodies.
    */
    this.isPaused = false;

    /**
    * @property {Phaser.QuadTree} quadTree - The world QuadTree.
    */
    this.quadTree = new Phaser.QuadTree(this.game.world.bounds.x, this.game.world.bounds.y, this.game.world.bounds.width, this.game.world.bounds.height, this.maxObjects, this.maxLevels);

    /**
    * @property {number} _total - Internal cache var.
    * @private
    */
    this._total = 0;

    // By default we want the bounds the same size as the world bounds
    this.setBoundsToWorld();

};

Phaser.Physics.Arcade.prototype.constructor = Phaser.Physics.Arcade;

/**
* A constant used for the sortDirection value.
* Use this if you don't wish to perform any pre-collision sorting at all, or will manually sort your Groups.
* @constant
* @type {number}
*/
Phaser.Physics.Arcade.SORT_NONE = 0;

/**
* A constant used for the sortDirection value.
* Use this if your game world is wide but short and scrolls from the left to the right (i.e. Mario)
* @constant
* @type {number}
*/
Phaser.Physics.Arcade.LEFT_RIGHT = 1;

/**
* A constant used for the sortDirection value.
* Use this if your game world is wide but short and scrolls from the right to the left (i.e. Mario backwards)
* @constant
* @type {number}
*/
Phaser.Physics.Arcade.RIGHT_LEFT = 2;

/**
* A constant used for the sortDirection value.
* Use this if your game world is narrow but tall and scrolls from the top to the bottom (i.e. Dig Dug)
* @constant
* @type {number}
*/
Phaser.Physics.Arcade.TOP_BOTTOM = 3;

/**
* A constant used for the sortDirection value.
* Use this if your game world is narrow but tall and scrolls from the bottom to the top (i.e. Commando or a vertically scrolling shoot-em-up)
* @constant
* @type {number}
*/
Phaser.Physics.Arcade.BOTTOM_TOP = 4;

Phaser.Physics.Arcade.prototype = {

    /**
    * Updates the size of this physics world.
    *
    * @method Phaser.Physics.Arcade#setBounds
    * @param {number} x - Top left most corner of the world.
    * @param {number} y - Top left most corner of the world.
    * @param {number} width - New width of the world. Can never be smaller than the Game.width.
    * @param {number} height - New height of the world. Can never be smaller than the Game.height.
    */
    setBounds: function (x, y, width, height) {

        this.bounds.setTo(x, y, width, height);

    },

    /**
    * Updates the size of this physics world to match the size of the game world.
    *
    * @method Phaser.Physics.Arcade#setBoundsToWorld
    */
    setBoundsToWorld: function () {

        this.bounds.copyFrom(this.game.world.bounds);

    },

    /**
    * This will create an Arcade Physics body on the given game object or array of game objects.
    * A game object can only have 1 physics body active at any one time, and it can't be changed until the object is destroyed.
    *
    * @method Phaser.Physics.Arcade#enable
    * @param {object|array|Phaser.Group} object - The game object to create the physics body on. Can also be an array or Group of objects, a body will be created on every child that has a `body` property.
    * @param {boolean} [children=true] - Should a body be created on all children of this object? If true it will recurse down the display list as far as it can go.
    */
    enable: function (object, children) {

        if (children === undefined) { children = true; }

        var i = 1;

        if (Array.isArray(object))
        {
            i = object.length;

            while (i--)
            {
                if (object[i] instanceof Phaser.Group)
                {
                    //  If it's a Group then we do it on the children regardless
                    this.enable(object[i].children, children);
                }
                else
                {
                    this.enableBody(object[i]);

                    if (children && object[i].hasOwnProperty('children') && object[i].children.length > 0)
                    {
                        this.enable(object[i], true);
                    }
                }
            }
        }
        else
        {
            if (object instanceof Phaser.Group)
            {
                //  If it's a Group then we do it on the children regardless
                this.enable(object.children, children);
            }
            else
            {
                this.enableBody(object);

                if (children && object.hasOwnProperty('children') && object.children.length > 0)
                {
                    this.enable(object.children, true);
                }
            }
        }

    },

    /**
    * Creates an Arcade Physics body on the given game object.
    * 
    * A game object can only have 1 physics body active at any one time, and it can't be changed until the body is nulled.
    *
    * When you add an Arcade Physics body to an object it will automatically add the object into its parent Groups hash array.
    *
    * @method Phaser.Physics.Arcade#enableBody
    * @param {object} object - The game object to create the physics body on. A body will only be created if this object has a null `body` property.
    */
    enableBody: function (object) {

        if (object.hasOwnProperty('body') && object.body === null)
        {
            object.body = new Phaser.Physics.Arcade.Body(object);

            if (object.parent && object.parent instanceof Phaser.Group)
            {
                object.parent.addToHash(object);
            }
        }

    },

    /**
    * Called automatically by a Physics body, it updates all motion related values on the Body unless `World.isPaused` is `true`.
    *
    * @method Phaser.Physics.Arcade#updateMotion
    * @param {Phaser.Physics.Arcade.Body} The Body object to be updated.
    */
    updateMotion: function (body) {

        var velocityDelta = this.computeVelocity(0, body, body.angularVelocity, body.angularAcceleration, body.angularDrag, body.maxAngular) - body.angularVelocity;
        body.angularVelocity += velocityDelta;
        body.rotation += (body.angularVelocity * this.game.time.physicsElapsed);

        body.velocity.x = this.computeVelocity(1, body, body.velocity.x, body.acceleration.x, body.drag.x, body.maxVelocity.x);
        body.velocity.y = this.computeVelocity(2, body, body.velocity.y, body.acceleration.y, body.drag.y, body.maxVelocity.y);

    },

    /**
    * A tween-like function that takes a starting velocity and some other factors and returns an altered velocity.
    * Based on a function in Flixel by @ADAMATOMIC
    *
    * @method Phaser.Physics.Arcade#computeVelocity
    * @param {number} axis - 0 for nothing, 1 for horizontal, 2 for vertical.
    * @param {Phaser.Physics.Arcade.Body} body - The Body object to be updated.
    * @param {number} velocity - Any component of velocity (e.g. 20).
    * @param {number} acceleration - Rate at which the velocity is changing.
    * @param {number} drag - Really kind of a deceleration, this is how much the velocity changes if Acceleration is not set.
    * @param {number} [max=10000] - An absolute value cap for the velocity.
    * @return {number} The altered Velocity value.
    */
    computeVelocity: function (axis, body, velocity, acceleration, drag, max) {

        if (max === undefined) { max = 10000; }

        if (axis === 1 && body.allowGravity)
        {
            velocity += (this.gravity.x + body.gravity.x) * this.game.time.physicsElapsed;
        }
        else if (axis === 2 && body.allowGravity)
        {
            velocity += (this.gravity.y + body.gravity.y) * this.game.time.physicsElapsed;
        }

        if (acceleration)
        {
            velocity += acceleration * this.game.time.physicsElapsed;
        }
        else if (drag)
        {
            drag *= this.game.time.physicsElapsed;

            if (velocity - drag > 0)
            {
                velocity -= drag;
            }
            else if (velocity + drag < 0)
            {
                velocity += drag;
            }
            else
            {
                velocity = 0;
            }
        }

        if (velocity > max)
        {
            velocity = max;
        }
        else if (velocity < -max)
        {
            velocity = -max;
        }

        return velocity;

    },

    /**
    * Checks for overlaps between two game objects. The objects can be Sprites, Groups or Emitters.
    * You can perform Sprite vs. Sprite, Sprite vs. Group and Group vs. Group overlap checks.
    * Unlike collide the objects are NOT automatically separated or have any physics applied, they merely test for overlap results.
    * Both the first and second parameter can be arrays of objects, of differing types.
    * If two arrays are passed, the contents of the first parameter will be tested against all contents of the 2nd parameter.
    * NOTE: This function is not recursive, and will not test against children of objects passed (i.e. Groups within Groups).
    *
    * @method Phaser.Physics.Arcade#overlap
    * @param {Phaser.Sprite|Phaser.Group|Phaser.Particles.Emitter|array} object1 - The first object or array of objects to check. Can be Phaser.Sprite, Phaser.Group or Phaser.Particles.Emitter.
    * @param {Phaser.Sprite|Phaser.Group|Phaser.Particles.Emitter|array} object2 - The second object or array of objects to check. Can be Phaser.Sprite, Phaser.Group or Phaser.Particles.Emitter.
    * @param {function} [overlapCallback=null] - An optional callback function that is called if the objects overlap. The two objects will be passed to this function in the same order in which you specified them, unless you are checking Group vs. Sprite, in which case Sprite will always be the first parameter.
    * @param {function} [processCallback=null] - A callback function that lets you perform additional checks against the two objects if they overlap. If this is set then `overlapCallback` will only be called if this callback returns `true`.
    * @param {object} [callbackContext] - The context in which to run the callbacks.
    * @return {boolean} True if an overlap occurred otherwise false.
    */
    overlap: function (object1, object2, overlapCallback, processCallback, callbackContext) {

        overlapCallback = overlapCallback || null;
        processCallback = processCallback || null;
        callbackContext = callbackContext || overlapCallback;

        this._total = 0;

        if (!Array.isArray(object1) && Array.isArray(object2))
        {
            for (var i = 0; i < object2.length; i++)
            {
                this.collideHandler(object1, object2[i], overlapCallback, processCallback, callbackContext, true);
            }
        }
        else if (Array.isArray(object1) && !Array.isArray(object2))
        {
            for (var i = 0; i < object1.length; i++)
            {
                this.collideHandler(object1[i], object2, overlapCallback, processCallback, callbackContext, true);
            }
        }
        else if (Array.isArray(object1) && Array.isArray(object2))
        {
            for (var i = 0; i < object1.length; i++)
            {
                for (var j = 0; j < object2.length; j++)
                {
                    this.collideHandler(object1[i], object2[j], overlapCallback, processCallback, callbackContext, true);
                }
            }
        }
        else
        {
            this.collideHandler(object1, object2, overlapCallback, processCallback, callbackContext, true);
        }

        return (this._total > 0);

    },

    /**
    * Checks for collision between two game objects. You can perform Sprite vs. Sprite, Sprite vs. Group, Group vs. Group, Sprite vs. Tilemap Layer or Group vs. Tilemap Layer collisions.
    * Both the first and second parameter can be arrays of objects, of differing types.
    * If two arrays are passed, the contents of the first parameter will be tested against all contents of the 2nd parameter.
    * The objects are also automatically separated. If you don't require separation then use ArcadePhysics.overlap instead.
    * An optional processCallback can be provided. If given this function will be called when two sprites are found to be colliding. It is called before any separation takes place,
    * giving you the chance to perform additional checks. If the function returns true then the collision and separation is carried out. If it returns false it is skipped.
    * The collideCallback is an optional function that is only called if two sprites collide. If a processCallback has been set then it needs to return true for collideCallback to be called.
    * NOTE: This function is not recursive, and will not test against children of objects passed (i.e. Groups or Tilemaps within other Groups).
    *
    * @method Phaser.Physics.Arcade#collide
    * @param {Phaser.Sprite|Phaser.Group|Phaser.Particles.Emitter|Phaser.TilemapLayer|array} object1 - The first object or array of objects to check. Can be Phaser.Sprite, Phaser.Group, Phaser.Particles.Emitter, or Phaser.TilemapLayer.
    * @param {Phaser.Sprite|Phaser.Group|Phaser.Particles.Emitter|Phaser.TilemapLayer|array} object2 - The second object or array of objects to check. Can be Phaser.Sprite, Phaser.Group, Phaser.Particles.Emitter or Phaser.TilemapLayer.
    * @param {function} [collideCallback=null] - An optional callback function that is called if the objects collide. The two objects will be passed to this function in the same order in which you specified them, unless you are colliding Group vs. Sprite, in which case Sprite will always be the first parameter.
    * @param {function} [processCallback=null] - A callback function that lets you perform additional checks against the two objects if they overlap. If this is set then collision will only happen if processCallback returns true. The two objects will be passed to this function in the same order in which you specified them, unless you are colliding Group vs. Sprite, in which case Sprite will always be the first parameter.
    * @param {object} [callbackContext] - The context in which to run the callbacks.
    * @return {boolean} True if a collision occurred otherwise false.
    */
    collide: function (object1, object2, collideCallback, processCallback, callbackContext) {

        collideCallback = collideCallback || null;
        processCallback = processCallback || null;
        callbackContext = callbackContext || collideCallback;

        this._total = 0;

        if (!Array.isArray(object1) && Array.isArray(object2))
        {
            for (var i = 0; i < object2.length; i++)
            {
                this.collideHandler(object1, object2[i], collideCallback, processCallback, callbackContext, false);
            }
        }
        else if (Array.isArray(object1) && !Array.isArray(object2))
        {
            for (var i = 0; i < object1.length; i++)
            {
                this.collideHandler(object1[i], object2, collideCallback, processCallback, callbackContext, false);
            }
        }
        else if (Array.isArray(object1) && Array.isArray(object2))
        {
            for (var i = 0; i < object1.length; i++)
            {
                for (var j = 0; j < object2.length; j++)
                {
                    this.collideHandler(object1[i], object2[j], collideCallback, processCallback, callbackContext, false);
                }
            }
        }
        else
        {
            this.collideHandler(object1, object2, collideCallback, processCallback, callbackContext, false);
        }

        return (this._total > 0);

    },

    /**
     * A Sort function for sorting two bodies based on a LEFT to RIGHT sort direction.
     *
     * This is called automatically by World.sort
     *
     * @method Phaser.Physics.Arcade#sortLeftRight
     * @param {Phaser.Sprite} a - The first Sprite to test. The Sprite must have an Arcade Physics Body.
     * @param {Phaser.Sprite} b - The second Sprite to test. The Sprite must have an Arcade Physics Body.
     * @return {integer} A negative value if `a > b`, a positive value if `a < b` or 0 if `a === b` or the bodies are invalid.
     */
    sortLeftRight: function (a, b) {

        if (!a.body || !b.body)
        {
            return 0;
        }

        return a.body.x - b.body.x;

    },

    /**
     * A Sort function for sorting two bodies based on a RIGHT to LEFT sort direction.
     *
     * This is called automatically by World.sort
     *
     * @method Phaser.Physics.Arcade#sortRightLeft
     * @param {Phaser.Sprite} a - The first Sprite to test. The Sprite must have an Arcade Physics Body.
     * @param {Phaser.Sprite} b - The second Sprite to test. The Sprite must have an Arcade Physics Body.
     * @return {integer} A negative value if `a > b`, a positive value if `a < b` or 0 if `a === b` or the bodies are invalid.
     */
    sortRightLeft: function (a, b) {

        if (!a.body || !b.body)
        {
            return 0;
        }

        return b.body.x - a.body.x;

    },

    /**
     * A Sort function for sorting two bodies based on a TOP to BOTTOM sort direction.
     *
     * This is called automatically by World.sort
     *
     * @method Phaser.Physics.Arcade#sortTopBottom
     * @param {Phaser.Sprite} a - The first Sprite to test. The Sprite must have an Arcade Physics Body.
     * @param {Phaser.Sprite} b - The second Sprite to test. The Sprite must have an Arcade Physics Body.
     * @return {integer} A negative value if `a > b`, a positive value if `a < b` or 0 if `a === b` or the bodies are invalid.
     */
    sortTopBottom: function (a, b) {

        if (!a.body || !b.body)
        {
            return 0;
        }

        return a.body.y - b.body.y;

    },

    /**
     * A Sort function for sorting two bodies based on a BOTTOM to TOP sort direction.
     *
     * This is called automatically by World.sort
     *
     * @method Phaser.Physics.Arcade#sortBottomTop
     * @param {Phaser.Sprite} a - The first Sprite to test. The Sprite must have an Arcade Physics Body.
     * @param {Phaser.Sprite} b - The second Sprite to test. The Sprite must have an Arcade Physics Body.
     * @return {integer} A negative value if `a > b`, a positive value if `a < b` or 0 if `a === b` or the bodies are invalid.
     */
    sortBottomTop: function (a, b) {

        if (!a.body || !b.body)
        {
            return 0;
        }

        return b.body.y - a.body.y;

    },

    /**
     * This method will sort a Groups hash array.
     *
     * If the Group has `physicsSortDirection` set it will use the sort direction defined.
     *
     * Otherwise if the sortDirection parameter is undefined, or Group.physicsSortDirection is null, it will use Phaser.Physics.Arcade.sortDirection.
     *
     * By changing Group.physicsSortDirection you can customise each Group to sort in a different order.
     *
     * @method Phaser.Physics.Arcade#sort
     * @param {Phaser.Group} group - The Group to sort.
     * @param {integer} [sortDirection] - The sort direction used to sort this Group.
     */
    sort: function (group, sortDirection) {

        if (group.physicsSortDirection !== null)
        {
            sortDirection = group.physicsSortDirection;
        }
        else
        {
            if (sortDirection === undefined) { sortDirection = this.sortDirection; }
        }

        if (sortDirection === Phaser.Physics.Arcade.LEFT_RIGHT)
        {
            //  Game world is say 2000x600 and you start at 0
            group.hash.sort(this.sortLeftRight);
        }
        else if (sortDirection === Phaser.Physics.Arcade.RIGHT_LEFT)
        {
            //  Game world is say 2000x600 and you start at 2000
            group.hash.sort(this.sortRightLeft);
        }
        else if (sortDirection === Phaser.Physics.Arcade.TOP_BOTTOM)
        {
            //  Game world is say 800x2000 and you start at 0
            group.hash.sort(this.sortTopBottom);
        }
        else if (sortDirection === Phaser.Physics.Arcade.BOTTOM_TOP)
        {
            //  Game world is say 800x2000 and you start at 2000
            group.hash.sort(this.sortBottomTop);
        }

    },

    /**
    * Internal collision handler.
    *
    * @method Phaser.Physics.Arcade#collideHandler
    * @private
    * @param {Phaser.Sprite|Phaser.Group|Phaser.Particles.Emitter|Phaser.TilemapLayer} object1 - The first object to check. Can be an instance of Phaser.Sprite, Phaser.Group, Phaser.Particles.Emitter, or Phaser.TilemapLayer.
    * @param {Phaser.Sprite|Phaser.Group|Phaser.Particles.Emitter|Phaser.TilemapLayer} object2 - The second object to check. Can be an instance of Phaser.Sprite, Phaser.Group, Phaser.Particles.Emitter or Phaser.TilemapLayer. Can also be an array of objects to check.
    * @param {function} collideCallback - An optional callback function that is called if the objects collide. The two objects will be passed to this function in the same order in which you specified them.
    * @param {function} processCallback - A callback function that lets you perform additional checks against the two objects if they overlap. If this is set then collision will only happen if processCallback returns true. The two objects will be passed to this function in the same order in which you specified them.
    * @param {object} callbackContext - The context in which to run the callbacks.
    * @param {boolean} overlapOnly - Just run an overlap or a full collision.
    */
    collideHandler: function (object1, object2, collideCallback, processCallback, callbackContext, overlapOnly) {

        //  Only collide valid objects
        if (object2 === undefined && object1.physicsType === Phaser.GROUP)
        {
            this.sort(object1);
            this.collideGroupVsSelf(object1, collideCallback, processCallback, callbackContext, overlapOnly);
            return;
        }

        //  If neither of the objects are set or exist then bail out
        if (!object1 || !object2 || !object1.exists || !object2.exists)
        {
            return;
        }

        //  Groups? Sort them
        if (this.sortDirection !== Phaser.Physics.Arcade.SORT_NONE)
        {
            if (object1.physicsType === Phaser.GROUP)
            {
                this.sort(object1);
            }

            if (object2.physicsType === Phaser.GROUP)
            {
                this.sort(object2);
            }
        }

        //  SPRITES
        if (object1.physicsType === Phaser.SPRITE)
        {
            if (object2.physicsType === Phaser.SPRITE)
            {
                this.collideSpriteVsSprite(object1, object2, collideCallback, processCallback, callbackContext, overlapOnly);
            }
            else if (object2.physicsType === Phaser.GROUP)
            {
                this.collideSpriteVsGroup(object1, object2, collideCallback, processCallback, callbackContext, overlapOnly);
            }
            else if (object2.physicsType === Phaser.TILEMAPLAYER)
            {
                this.collideSpriteVsTilemapLayer(object1, object2, collideCallback, processCallback, callbackContext, overlapOnly);
            }
        }
        //  GROUPS
        else if (object1.physicsType === Phaser.GROUP)
        {
            if (object2.physicsType === Phaser.SPRITE)
            {
                this.collideSpriteVsGroup(object2, object1, collideCallback, processCallback, callbackContext, overlapOnly);
            }
            else if (object2.physicsType === Phaser.GROUP)
            {
                this.collideGroupVsGroup(object1, object2, collideCallback, processCallback, callbackContext, overlapOnly);
            }
            else if (object2.physicsType === Phaser.TILEMAPLAYER)
            {
                this.collideGroupVsTilemapLayer(object1, object2, collideCallback, processCallback, callbackContext, overlapOnly);
            }
        }
        //  TILEMAP LAYERS
        else if (object1.physicsType === Phaser.TILEMAPLAYER)
        {
            if (object2.physicsType === Phaser.SPRITE)
            {
                this.collideSpriteVsTilemapLayer(object2, object1, collideCallback, processCallback, callbackContext, overlapOnly);
            }
            else if (object2.physicsType === Phaser.GROUP)
            {
                this.collideGroupVsTilemapLayer(object2, object1, collideCallback, processCallback, callbackContext, overlapOnly);
            }
        }

    },

    /**
    * An internal function. Use Phaser.Physics.Arcade.collide instead.
    *
    * @method Phaser.Physics.Arcade#collideSpriteVsSprite
    * @private
    * @param {Phaser.Sprite} sprite1 - The first sprite to check.
    * @param {Phaser.Sprite} sprite2 - The second sprite to check.
    * @param {function} collideCallback - An optional callback function that is called if the objects collide. The two objects will be passed to this function in the same order in which you specified them.
    * @param {function} processCallback - A callback function that lets you perform additional checks against the two objects if they overlap. If this is set then collision will only happen if processCallback returns true. The two objects will be passed to this function in the same order in which you specified them.
    * @param {object} callbackContext - The context in which to run the callbacks.
    * @param {boolean} overlapOnly - Just run an overlap or a full collision.
    * @return {boolean} True if there was a collision, otherwise false.
    */
    collideSpriteVsSprite: function (sprite1, sprite2, collideCallback, processCallback, callbackContext, overlapOnly) {

        if (!sprite1.body || !sprite2.body)
        {
            return false;
        }

        if (this.separate(sprite1.body, sprite2.body, processCallback, callbackContext, overlapOnly))
        {
            if (collideCallback)
            {
                collideCallback.call(callbackContext, sprite1, sprite2);
            }

            this._total++;
        }

        return true;

    },

    /**
    * An internal function. Use Phaser.Physics.Arcade.collide instead.
    *
    * @method Phaser.Physics.Arcade#collideSpriteVsGroup
    * @private
    * @param {Phaser.Sprite} sprite - The sprite to check.
    * @param {Phaser.Group} group - The Group to check.
    * @param {function} collideCallback - An optional callback function that is called if the objects collide. The two objects will be passed to this function in the same order in which you specified them.
    * @param {function} processCallback - A callback function that lets you perform additional checks against the two objects if they overlap. If this is set then collision will only happen if processCallback returns true. The two objects will be passed to this function in the same order in which you specified them.
    * @param {object} callbackContext - The context in which to run the callbacks.
    * @param {boolean} overlapOnly - Just run an overlap or a full collision.
    */
    collideSpriteVsGroup: function (sprite, group, collideCallback, processCallback, callbackContext, overlapOnly) {

        if (group.length === 0 || !sprite.body)
        {
            return;
        }

        if (this.skipQuadTree || sprite.body.skipQuadTree)
        {
            var bounds = {};

            for (var i = 0; i < group.hash.length; i++)
            {
                var object1 = group.hash[i];

                //  Skip duff entries - we can't check a non-existent sprite or one with no body
                if (!object1 || !object1.exists || !object1.body)
                {
                    continue;
                }

                //  Inject the Body bounds data into the bounds object
                bounds = object1.body.getBounds(bounds);

                //  Skip items either side of the sprite
                if (this.sortDirection === Phaser.Physics.Arcade.LEFT_RIGHT)
                {
                    if (sprite.body.right < bounds.x)
                    {
                        break;
                    }
                    else if (bounds.right < sprite.body.x)
                    {
                        continue;
                    }
                }
                else if (this.sortDirection === Phaser.Physics.Arcade.RIGHT_LEFT)
                {
                    if (sprite.body.x > bounds.right)
                    {
                        break;
                    }
                    else if (bounds.x > sprite.body.right)
                    {
                        continue;
                    }
                }
                else if (this.sortDirection === Phaser.Physics.Arcade.TOP_BOTTOM)
                {
                    if (sprite.body.bottom < bounds.y)
                    {
                        break;
                    }
                    else if (bounds.bottom < sprite.body.y)
                    {
                        continue;
                    }
                }
                else if (this.sortDirection === Phaser.Physics.Arcade.BOTTOM_TOP)
                {
                    if (sprite.body.y > bounds.bottom)
                    {
                        break;
                    }
                    else if (bounds.y > sprite.body.bottom)
                    {
                        continue;
                    }
                }
                
                this.collideSpriteVsSprite(sprite, object1, collideCallback, processCallback, callbackContext, overlapOnly);
            }
        }
        else
        {
            //  What is the sprite colliding with in the quadtree?
            this.quadTree.clear();

            this.quadTree.reset(this.game.world.bounds.x, this.game.world.bounds.y, this.game.world.bounds.width, this.game.world.bounds.height, this.maxObjects, this.maxLevels);

            this.quadTree.populate(group);

            var items = this.quadTree.retrieve(sprite);

            for (var i = 0; i < items.length; i++)
            {
                //  We have our potential suspects, are they in this group?
                if (this.separate(sprite.body, items[i], processCallback, callbackContext, overlapOnly))
                {
                    if (collideCallback)
                    {
                        collideCallback.call(callbackContext, sprite, items[i].sprite);
                    }

                    this._total++;
                }
            }
        }

    },

    /**
    * An internal function. Use Phaser.Physics.Arcade.collide instead.
    *
    * @method Phaser.Physics.Arcade#collideGroupVsSelf
    * @private
    * @param {Phaser.Group} group - The Group to check.
    * @param {function} collideCallback - An optional callback function that is called if the objects collide. The two objects will be passed to this function in the same order in which you specified them.
    * @param {function} processCallback - A callback function that lets you perform additional checks against the two objects if they overlap. If this is set then collision will only happen if processCallback returns true. The two objects will be passed to this function in the same order in which you specified them.
    * @param {object} callbackContext - The context in which to run the callbacks.
    * @param {boolean} overlapOnly - Just run an overlap or a full collision.
    * @return {boolean} True if there was a collision, otherwise false.
    */
    collideGroupVsSelf: function (group, collideCallback, processCallback, callbackContext, overlapOnly) {

        if (group.length === 0)
        {
            return;
        }

        for (var i = 0; i < group.hash.length; i++)
        {
            var bounds1 = {};
            var object1 = group.hash[i];

            //  Skip duff entries - we can't check a non-existent sprite or one with no body
            if (!object1 || !object1.exists || !object1.body)
            {
                continue;
            }

            //  Inject the Body bounds data into the bounds1 object
            bounds1 = object1.body.getBounds(bounds1);

            for (var j = i + 1; j < group.hash.length; j++)
            {
                var bounds2 = {};
                var object2 = group.hash[j];

                //  Skip duff entries - we can't check a non-existent sprite or one with no body
                if (!object2 || !object2.exists || !object2.body)
                {
                    continue;
                }

                //  Inject the Body bounds data into the bounds2 object
                bounds2 = object2.body.getBounds(bounds2);

                //  Skip items either side of the sprite
                if (this.sortDirection === Phaser.Physics.Arcade.LEFT_RIGHT)
                {
                    if (bounds1.right < bounds2.x)
                    {
                        break;
                    }
                    else if (bounds2.right < bounds1.x)
                    {
                        continue;
                    }
                }
                else if (this.sortDirection === Phaser.Physics.Arcade.RIGHT_LEFT)
                {
                    if (bounds1.x > bounds2.right)
                    {
                        continue;
                    }
                    else if (bounds2.x > bounds1.right)
                    {
                        break;
                    }
                }
                else if (this.sortDirection === Phaser.Physics.Arcade.TOP_BOTTOM)
                {
                    if (bounds1.bottom < bounds2.y)
                    {
                        continue;
                    }
                    else if (bounds2.bottom < bounds1.y)
                    {
                        break;
                    }
                }
                else if (this.sortDirection === Phaser.Physics.Arcade.BOTTOM_TOP)
                {
                    if (bounds1.y > bounds2.bottom)
                    {
                        continue;
                    }
                    else if (bounds2.y > object1.body.bottom)
                    {
                        break;
                    }
                }
                
                this.collideSpriteVsSprite(object1, object2, collideCallback, processCallback, callbackContext, overlapOnly);
            }
        }

    },

    /**
    * An internal function. Use Phaser.Physics.Arcade.collide instead.
    *
    * @method Phaser.Physics.Arcade#collideGroupVsGroup
    * @private
    * @param {Phaser.Group} group1 - The first Group to check.
    * @param {Phaser.Group} group2 - The second Group to check.
    * @param {function} collideCallback - An optional callback function that is called if the objects collide. The two objects will be passed to this function in the same order in which you specified them.
    * @param {function} processCallback - A callback function that lets you perform additional checks against the two objects if they overlap. If this is set then collision will only happen if processCallback returns true. The two objects will be passed to this function in the same order in which you specified them.
    * @param {object} callbackContext - The context in which to run the callbacks.
    * @param {boolean} overlapOnly - Just run an overlap or a full collision.
    */
    collideGroupVsGroup: function (group1, group2, collideCallback, processCallback, callbackContext, overlapOnly) {

        if (group1.length === 0 || group2.length === 0)
        {
            return;
        }

        for (var i = 0; i < group1.children.length; i++)
        {
            if (group1.children[i].exists)
            {
                if (group1.children[i].physicsType === Phaser.GROUP)
                {
                    this.collideGroupVsGroup(group1.children[i], group2, collideCallback, processCallback, callbackContext, overlapOnly);
                }
                else
                {
                    this.collideSpriteVsGroup(group1.children[i], group2, collideCallback, processCallback, callbackContext, overlapOnly);
                }
            }
        }

    },

    /**
    * The core separation function to separate two physics bodies.
    *
    * @private
    * @method Phaser.Physics.Arcade#separate
    * @param {Phaser.Physics.Arcade.Body} body1 - The first Body object to separate.
    * @param {Phaser.Physics.Arcade.Body} body2 - The second Body object to separate.
    * @param {function} [processCallback=null] - A callback function that lets you perform additional checks against the two objects if they overlap. If this function is set then the sprites will only be collided if it returns true.
    * @param {object} [callbackContext] - The context in which to run the process callback.
    * @param {boolean} overlapOnly - Just run an overlap or a full collision.
    * @return {boolean} Returns true if the bodies collided, otherwise false.
    */
    separate: function (body1, body2, processCallback, callbackContext, overlapOnly) {

        if (
            !body1.enable ||
            !body2.enable ||
            body1.checkCollision.none ||
            body2.checkCollision.none ||
            !this.intersects(body1, body2))
        {
            return false;
        }

        //  They overlap. Is there a custom process callback? If it returns true then we can carry on, otherwise we should abort.
        if (processCallback && processCallback.call(callbackContext, body1.sprite, body2.sprite) === false)
        {
            return false;
        }

        //  Circle vs. Circle quick bail out
        if (body1.isCircle && body2.isCircle)
        {
            return this.separateCircle(body1, body2, overlapOnly);
        }

        // We define the behavior of bodies in a collision circle and rectangle
        // If a collision occurs in the corner points of the rectangle, the body behave like circles

        //  Either body1 or body2 is a circle
        if (body1.isCircle !== body2.isCircle)
        {
            var bodyRect = (body1.isCircle) ? body2 : body1;
            var bodyCircle = (body1.isCircle) ? body1 : body2;

            var rect = {
                x: bodyRect.x,
                y: bodyRect.y,
                right: bodyRect.right,
                bottom: bodyRect.bottom
            };

            var circle = {
                x: bodyCircle.x + bodyCircle.radius,
                y: bodyCircle.y + bodyCircle.radius
            };

            if (circle.y < rect.y || circle.y > rect.bottom)
            {
                if (circle.x < rect.x || circle.x > rect.right)
                {
                    return this.separateCircle(body1, body2, overlapOnly);
                }
            }
        }

        var resultX = false;
        var resultY = false;

        //  Do we separate on x or y first?
        if (this.forceX || Math.abs(this.gravity.y + body1.gravity.y) < Math.abs(this.gravity.x + body1.gravity.x))
        {
            resultX = this.separateX(body1, body2, overlapOnly);

            //  Are they still intersecting? Let's do the other axis then
            if (this.intersects(body1, body2))
            {
                resultY = this.separateY(body1, body2, overlapOnly);
            }
        }
        else
        {
            resultY = this.separateY(body1, body2, overlapOnly);

            //  Are they still intersecting? Let's do the other axis then
            if (this.intersects(body1, body2))
            {
                resultX = this.separateX(body1, body2, overlapOnly);
            }
        }

        var result = (resultX || resultY);

        if (result)
        {
            if (overlapOnly)
            {
                if (body1.onOverlap)
                {
                    body1.onOverlap.dispatch(body1.sprite, body2.sprite);
                }

                if (body2.onOverlap)
                {
                    body2.onOverlap.dispatch(body2.sprite, body1.sprite);
                }
            }
            else
            {
                if (body1.onCollide)
                {
                    body1.onCollide.dispatch(body1.sprite, body2.sprite);
                }

                if (body2.onCollide)
                {
                    body2.onCollide.dispatch(body2.sprite, body1.sprite);
                }
            }
        }

        return result;

    },

    /**
    * Check for intersection against two bodies.
    *
    * @method Phaser.Physics.Arcade#intersects
    * @param {Phaser.Physics.Arcade.Body} body1 - The first Body object to check.
    * @param {Phaser.Physics.Arcade.Body} body2 - The second Body object to check.
    * @return {boolean} True if they intersect, otherwise false.
    */
    intersects: function (body1, body2) {

        if (body1 === body2)
        {
            return false;
        }

        if (body1.isCircle)
        {
            if (body2.isCircle)
            {
                //  Circle vs. Circle
                return Phaser.Math.distance(body1.center.x, body1.center.y, body2.center.x, body2.center.y) <= (body1.radius + body2.radius);
            }
            else
            {
                //  Circle vs. Rect
                return this.circleBodyIntersects(body1, body2);
            }
        }
        else
        {
            if (body2.isCircle)
            {
                //  Rect vs. Circle
                return this.circleBodyIntersects(body2, body1);
            }
            else
            {
                //  Rect vs. Rect
                if (body1.right <= body2.position.x)
                {
                    return false;
                }

                if (body1.bottom <= body2.position.y)
                {
                    return false;
                }

                if (body1.position.x >= body2.right)
                {
                    return false;
                }

                if (body1.position.y >= body2.bottom)
                {
                    return false;
                }

                return true;
            }
        }

    },

    /**
    * Checks to see if a circular Body intersects with a Rectangular Body.
    *
    * @method Phaser.Physics.Arcade#circleBodyIntersects
    * @param {Phaser.Physics.Arcade.Body} circle - The Body with `isCircle` set.
    * @param {Phaser.Physics.Arcade.Body} body - The Body with `isCircle` not set (i.e. uses Rectangle shape)
    * @return {boolean} Returns true if the bodies intersect, otherwise false.
    */
    circleBodyIntersects: function (circle, body) {

        var x = Phaser.Math.clamp(circle.center.x, body.left, body.right);
        var y = Phaser.Math.clamp(circle.center.y, body.top, body.bottom);

        var dx = (circle.center.x - x) * (circle.center.x - x);
        var dy = (circle.center.y - y) * (circle.center.y - y);

        return (dx + dy) <= (circle.radius * circle.radius);

    },

    /**
    * The core separation function to separate two circular physics bodies.
    *
    * @method Phaser.Physics.Arcade#separateCircle
    * @private
    * @param {Phaser.Physics.Arcade.Body} body1 - The first Body to separate. Must have `Body.isCircle` true and a positive `radius`.
    * @param {Phaser.Physics.Arcade.Body} body2 - The second Body to separate. Must have `Body.isCircle` true and a positive `radius`.
    * @param {boolean} overlapOnly - If true the bodies will only have their overlap data set, no separation or exchange of velocity will take place.
    * @return {boolean} Returns true if the bodies were separated or overlap, otherwise false.
    */
    separateCircle: function (body1, body2, overlapOnly) {

        //  Set the bounding box overlap values
        this.getOverlapX(body1, body2);
        this.getOverlapY(body1, body2);

        var dx = body2.center.x - body1.center.x;
        var dy = body2.center.y - body1.center.y;

        var angleCollision = Math.atan2(dy, dx);

        var overlap = 0;

        if (body1.isCircle !== body2.isCircle)
        {
            var rect = {
                x: (body2.isCircle) ? body1.position.x : body2.position.x,
                y: (body2.isCircle) ? body1.position.y : body2.position.y,
                right: (body2.isCircle) ? body1.right : body2.right,
                bottom: (body2.isCircle) ? body1.bottom : body2.bottom
            };

            var circle = {
                x: (body1.isCircle) ? (body1.position.x + body1.radius) : (body2.position.x + body2.radius),
                y: (body1.isCircle) ? (body1.position.y + body1.radius) : (body2.position.y + body2.radius),
                radius: (body1.isCircle) ? body1.radius : body2.radius
            };

            if (circle.y < rect.y)
            {
                if (circle.x < rect.x)
                {
                    overlap = Phaser.Math.distance(circle.x, circle.y, rect.x, rect.y) - circle.radius;
                }
                else if (circle.x > rect.right)
                {
                    overlap = Phaser.Math.distance(circle.x, circle.y, rect.right, rect.y) - circle.radius;
                }
            }
            else if (circle.y > rect.bottom)
            {
                if (circle.x < rect.x)
                {
                    overlap = Phaser.Math.distance(circle.x, circle.y, rect.x, rect.bottom) - circle.radius;
                }
                else if (circle.x > rect.right)
                {
                    overlap = Phaser.Math.distance(circle.x, circle.y, rect.right, rect.bottom) - circle.radius;
                }
            }

            overlap *= -1;
        }
        else
        {
            overlap = (body1.radius + body2.radius) - Phaser.Math.distance(body1.center.x, body1.center.y, body2.center.x, body2.center.y);
        }

        //  Can't separate two immovable bodies, or a body with its own custom separation logic
        if (overlapOnly || overlap === 0 || (body1.immovable && body2.immovable) || body1.customSeparateX || body2.customSeparateX)
        {
            if (overlap !== 0)
            {
                if (body1.onOverlap)
                {
                    body1.onOverlap.dispatch(body1.sprite, body2.sprite);
                }

                if (body2.onOverlap)
                {
                    body2.onOverlap.dispatch(body2.sprite, body1.sprite);
                }
            }

            //  return true if there was some overlap, otherwise false
            return (overlap !== 0);
        }

        // Transform the velocity vector to the coordinate system oriented along the direction of impact.
        // This is done to eliminate the vertical component of the velocity
        var v1 = {
            x: body1.velocity.x * Math.cos(angleCollision) + body1.velocity.y * Math.sin(angleCollision),
            y: body1.velocity.x * Math.sin(angleCollision) - body1.velocity.y * Math.cos(angleCollision)
        };

        var v2 = {
            x: body2.velocity.x * Math.cos(angleCollision) + body2.velocity.y * Math.sin(angleCollision),
            y: body2.velocity.x * Math.sin(angleCollision) - body2.velocity.y * Math.cos(angleCollision)
        };

        // We expect the new velocity after impact
        var tempVel1 = ((body1.mass - body2.mass) * v1.x + 2 * body2.mass * v2.x) / (body1.mass + body2.mass);
        var tempVel2 = (2 * body1.mass * v1.x + (body2.mass - body1.mass) * v2.x) / (body1.mass + body2.mass);

        // We convert the vector to the original coordinate system and multiplied by factor of rebound
        if (!body1.immovable)
        {
            body1.velocity.x = (tempVel1 * Math.cos(angleCollision) - v1.y * Math.sin(angleCollision)) * body1.bounce.x;
            body1.velocity.y = (v1.y * Math.cos(angleCollision) + tempVel1 * Math.sin(angleCollision)) * body1.bounce.y;
        }

        if (!body2.immovable)
        {
            body2.velocity.x = (tempVel2 * Math.cos(angleCollision) - v2.y * Math.sin(angleCollision)) * body2.bounce.x;
            body2.velocity.y = (v2.y * Math.cos(angleCollision) + tempVel2 * Math.sin(angleCollision)) * body2.bounce.y;
        }

        // When the collision angle is almost perpendicular to the total initial velocity vector
        // (collision on a tangent) vector direction can be determined incorrectly.
        // This code fixes the problem

        if (Math.abs(angleCollision) < Math.PI / 2)
        {
            if ((body1.velocity.x > 0) && !body1.immovable && (body2.velocity.x > body1.velocity.x))
            {
                body1.velocity.x *= -1;
            }
            else if ((body2.velocity.x < 0) && !body2.immovable && (body1.velocity.x < body2.velocity.x))
            {
                body2.velocity.x *= -1;
            }
            else if ((body1.velocity.y > 0) && !body1.immovable && (body2.velocity.y > body1.velocity.y))
            {
                body1.velocity.y *= -1;
            }
            else if ((body2.velocity.y < 0) && !body2.immovable && (body1.velocity.y < body2.velocity.y))
            {
                body2.velocity.y *= -1;
            }
        }
        else if (Math.abs(angleCollision) > Math.PI / 2)
        {
            if ((body1.velocity.x < 0) && !body1.immovable && (body2.velocity.x < body1.velocity.x))
            {
                body1.velocity.x *= -1;
            }
            else if ((body2.velocity.x > 0) && !body2.immovable && (body1.velocity.x > body2.velocity.x))
            {
                body2.velocity.x *= -1;
            }
            else if ((body1.velocity.y < 0) && !body1.immovable && (body2.velocity.y < body1.velocity.y))
            {
                body1.velocity.y *= -1;
            }
            else if ((body2.velocity.y > 0) && !body2.immovable && (body1.velocity.x > body2.velocity.y))
            {
                body2.velocity.y *= -1;
            }
        }

        if (!body1.immovable)
        {
            body1.x += (body1.velocity.x * this.game.time.physicsElapsed) - overlap * Math.cos(angleCollision);
            body1.y += (body1.velocity.y * this.game.time.physicsElapsed) - overlap * Math.sin(angleCollision);
        }

        if (!body2.immovable)
        {
            body2.x += (body2.velocity.x * this.game.time.physicsElapsed) + overlap * Math.cos(angleCollision);
            body2.y += (body2.velocity.y * this.game.time.physicsElapsed) + overlap * Math.sin(angleCollision);
        }

        if (body1.onCollide)
        {
            body1.onCollide.dispatch(body1.sprite, body2.sprite);
        }

        if (body2.onCollide)
        {
            body2.onCollide.dispatch(body2.sprite, body1.sprite);
        }

        return true;

    },

    /**
    * Calculates the horizontal overlap between two Bodies and sets their properties accordingly, including:
    * `touching.left`, `touching.right` and `overlapX`.
    *
    * @method Phaser.Physics.Arcade#getOverlapX
    * @param {Phaser.Physics.Arcade.Body} body1 - The first Body to separate.
    * @param {Phaser.Physics.Arcade.Body} body2 - The second Body to separate.
    * @param {boolean} overlapOnly - Is this an overlap only check, or part of separation?
    * @return {float} Returns the amount of horizontal overlap between the two bodies.
    */
    getOverlapX: function (body1, body2, overlapOnly) {

        var overlap = 0;
        var maxOverlap = body1.deltaAbsX() + body2.deltaAbsX() + this.OVERLAP_BIAS;

        if (body1.deltaX() === 0 && body2.deltaX() === 0)
        {
            //  They overlap but neither of them are moving
            body1.embedded = true;
            body2.embedded = true;
        }
        else if (body1.deltaX() > body2.deltaX())
        {
            //  Body1 is moving right and / or Body2 is moving left
            overlap = body1.right - body2.x;

            if ((overlap > maxOverlap && !overlapOnly) || body1.checkCollision.right === false || body2.checkCollision.left === false)
            {
                overlap = 0;
            }
            else
            {
                body1.touching.none = false;
                body1.touching.right = true;
                body2.touching.none = false;
                body2.touching.left = true;
            }
        }
        else if (body1.deltaX() < body2.deltaX())
        {
            //  Body1 is moving left and/or Body2 is moving right
            overlap = body1.x - body2.width - body2.x;

            if ((-overlap > maxOverlap && !overlapOnly) || body1.checkCollision.left === false || body2.checkCollision.right === false)
            {
                overlap = 0;
            }
            else
            {
                body1.touching.none = false;
                body1.touching.left = true;
                body2.touching.none = false;
                body2.touching.right = true;
            }
        }

        //  Resets the overlapX to zero if there is no overlap, or to the actual pixel value if there is
        body1.overlapX = overlap;
        body2.overlapX = overlap;

        return overlap;

    },

    /**
    * Calculates the vertical overlap between two Bodies and sets their properties accordingly, including:
    * `touching.up`, `touching.down` and `overlapY`.
    *
    * @method Phaser.Physics.Arcade#getOverlapY
    * @param {Phaser.Physics.Arcade.Body} body1 - The first Body to separate.
    * @param {Phaser.Physics.Arcade.Body} body2 - The second Body to separate.
    * @param {boolean} overlapOnly - Is this an overlap only check, or part of separation?
    * @return {float} Returns the amount of vertical overlap between the two bodies.
    */
    getOverlapY: function (body1, body2, overlapOnly) {

        var overlap = 0;
        var maxOverlap = body1.deltaAbsY() + body2.deltaAbsY() + this.OVERLAP_BIAS;

        if (body1.deltaY() === 0 && body2.deltaY() === 0)
        {
            //  They overlap but neither of them are moving
            body1.embedded = true;
            body2.embedded = true;
        }
        else if (body1.deltaY() > body2.deltaY())
        {
            //  Body1 is moving down and/or Body2 is moving up
            overlap = body1.bottom - body2.y;

            if ((overlap > maxOverlap && !overlapOnly) || body1.checkCollision.down === false || body2.checkCollision.up === false)
            {
                overlap = 0;
            }
            else
            {
                body1.touching.none = false;
                body1.touching.down = true;
                body2.touching.none = false;
                body2.touching.up = true;
            }
        }
        else if (body1.deltaY() < body2.deltaY())
        {
            //  Body1 is moving up and/or Body2 is moving down
            overlap = body1.y - body2.bottom;

            if ((-overlap > maxOverlap && !overlapOnly) || body1.checkCollision.up === false || body2.checkCollision.down === false)
            {
                overlap = 0;
            }
            else
            {
                body1.touching.none = false;
                body1.touching.up = true;
                body2.touching.none = false;
                body2.touching.down = true;
            }
        }

        //  Resets the overlapY to zero if there is no overlap, or to the actual pixel value if there is
        body1.overlapY = overlap;
        body2.overlapY = overlap;

        return overlap;

    },

    /**
    * The core separation function to separate two physics bodies on the x axis.
    *
    * @method Phaser.Physics.Arcade#separateX
    * @private
    * @param {Phaser.Physics.Arcade.Body} body1 - The first Body to separate.
    * @param {Phaser.Physics.Arcade.Body} body2 - The second Body to separate.
    * @param {boolean} overlapOnly - If true the bodies will only have their overlap data set, no separation or exchange of velocity will take place.
    * @return {boolean} Returns true if the bodies were separated or overlap, otherwise false.
    */
    separateX: function (body1, body2, overlapOnly) {

        var overlap = this.getOverlapX(body1, body2, overlapOnly);

        //  Can't separate two immovable bodies, or a body with its own custom separation logic
        if (overlapOnly || overlap === 0 || (body1.immovable && body2.immovable) || body1.customSeparateX || body2.customSeparateX)
        {
            //  return true if there was some overlap, otherwise false
            return (overlap !== 0) || (body1.embedded && body2.embedded);
        }

        //  Adjust their positions and velocities accordingly (if there was any overlap)
        var v1 = body1.velocity.x;
        var v2 = body2.velocity.x;

        if (!body1.immovable && !body2.immovable)
        {
            overlap *= 0.5;

            body1.x -= overlap;
            body2.x += overlap;

            var nv1 = Math.sqrt((v2 * v2 * body2.mass) / body1.mass) * ((v2 > 0) ? 1 : -1);
            var nv2 = Math.sqrt((v1 * v1 * body1.mass) / body2.mass) * ((v1 > 0) ? 1 : -1);
            var avg = (nv1 + nv2) * 0.5;

            nv1 -= avg;
            nv2 -= avg;

            body1.velocity.x = avg + nv1 * body1.bounce.x;
            body2.velocity.x = avg + nv2 * body2.bounce.x;
        }
        else if (!body1.immovable)
        {
            body1.x -= overlap;
            body1.velocity.x = v2 - v1 * body1.bounce.x;

            //  This is special case code that handles things like vertically moving platforms you can ride
            if (body2.moves)
            {
                body1.y += (body2.y - body2.prev.y) * body2.friction.y;
            }
        }
        else
        {
            body2.x += overlap;
            body2.velocity.x = v1 - v2 * body2.bounce.x;

            //  This is special case code that handles things like vertically moving platforms you can ride
            if (body1.moves)
            {
                body2.y += (body1.y - body1.prev.y) * body1.friction.y;
            }
        }

        //  If we got this far then there WAS overlap, and separation is complete, so return true
        return true;

    },

    /**
    * The core separation function to separate two physics bodies on the y axis.
    *
    * @private
    * @method Phaser.Physics.Arcade#separateY
    * @param {Phaser.Physics.Arcade.Body} body1 - The first Body to separate.
    * @param {Phaser.Physics.Arcade.Body} body2 - The second Body to separate.
    * @param {boolean} overlapOnly - If true the bodies will only have their overlap data set, no separation or exchange of velocity will take place.
    * @return {boolean} Returns true if the bodies were separated or overlap, otherwise false.
    */
    separateY: function (body1, body2, overlapOnly) {

        var overlap = this.getOverlapY(body1, body2, overlapOnly);

        //  Can't separate two immovable bodies, or a body with its own custom separation logic
        if (overlapOnly || overlap === 0 || (body1.immovable && body2.immovable) || body1.customSeparateY || body2.customSeparateY)
        {
            //  return true if there was some overlap, otherwise false
            return (overlap !== 0) || (body1.embedded && body2.embedded);
        }

        //  Adjust their positions and velocities accordingly (if there was any overlap)
        var v1 = body1.velocity.y;
        var v2 = body2.velocity.y;

        if (!body1.immovable && !body2.immovable)
        {
            overlap *= 0.5;

            body1.y -= overlap;
            body2.y += overlap;

            var nv1 = Math.sqrt((v2 * v2 * body2.mass) / body1.mass) * ((v2 > 0) ? 1 : -1);
            var nv2 = Math.sqrt((v1 * v1 * body1.mass) / body2.mass) * ((v1 > 0) ? 1 : -1);
            var avg = (nv1 + nv2) * 0.5;

            nv1 -= avg;
            nv2 -= avg;

            body1.velocity.y = avg + nv1 * body1.bounce.y;
            body2.velocity.y = avg + nv2 * body2.bounce.y;
        }
        else if (!body1.immovable)
        {
            body1.y -= overlap;
            body1.velocity.y = v2 - v1 * body1.bounce.y;

            //  This is special case code that handles things like horizontal moving platforms you can ride
            if (body2.moves)
            {
                body1.x += (body2.x - body2.prev.x) * body2.friction.x;
            }
        }
        else
        {
            body2.y += overlap;
            body2.velocity.y = v1 - v2 * body2.bounce.y;

            //  This is special case code that handles things like horizontal moving platforms you can ride
            if (body1.moves)
            {
                body2.x += (body1.x - body1.prev.x) * body1.friction.x;
            }
        }

        //  If we got this far then there WAS overlap, and separation is complete, so return true
        return true;

    },

    /**
    * Given a Group and a Pointer this will check to see which Group children overlap with the Pointer coordinates.
    * Each child will be sent to the given callback for further processing.
    * Note that the children are not checked for depth order, but simply if they overlap the Pointer or not.
    *
    * @method Phaser.Physics.Arcade#getObjectsUnderPointer
    * @param {Phaser.Pointer} pointer - The Pointer to check.
    * @param {Phaser.Group} group - The Group to check.
    * @param {function} [callback] - A callback function that is called if the object overlaps with the Pointer. The callback will be sent two parameters: the Pointer and the Object that overlapped with it.
    * @param {object} [callbackContext] - The context in which to run the callback.
    * @return {PIXI.DisplayObject[]} An array of the Sprites from the Group that overlapped the Pointer coordinates.
    */
    getObjectsUnderPointer: function (pointer, group, callback, callbackContext) {

        if (group.length === 0 || !pointer.exists)
        {
            return;
        }

        return this.getObjectsAtLocation(pointer.x, pointer.y, group, callback, callbackContext, pointer);

    },

    /**
    * Given a Group and a location this will check to see which Group children overlap with the coordinates.
    * Each child will be sent to the given callback for further processing.
    * Note that the children are not checked for depth order, but simply if they overlap the coordinate or not.
    *
    * @method Phaser.Physics.Arcade#getObjectsAtLocation
    * @param {number} x - The x coordinate to check.
    * @param {number} y - The y coordinate to check.
    * @param {Phaser.Group} group - The Group to check.
    * @param {function} [callback] - A callback function that is called if the object overlaps the coordinates. The callback will be sent two parameters: the callbackArg and the Object that overlapped the location.
    * @param {object} [callbackContext] - The context in which to run the callback.
    * @param {object} [callbackArg] - An argument to pass to the callback.
    * @return {PIXI.DisplayObject[]} An array of the Sprites from the Group that overlapped the coordinates.
    */
    getObjectsAtLocation: function (x, y, group, callback, callbackContext, callbackArg) {

        this.quadTree.clear();

        this.quadTree.reset(this.game.world.bounds.x, this.game.world.bounds.y, this.game.world.bounds.width, this.game.world.bounds.height, this.maxObjects, this.maxLevels);

        this.quadTree.populate(group);

        var rect = new Phaser.Rectangle(x, y, 1, 1);
        var output = [];

        var items = this.quadTree.retrieve(rect);

        for (var i = 0; i < items.length; i++)
        {
            if (items[i].hitTest(x, y))
            {
                if (callback)
                {
                    callback.call(callbackContext, callbackArg, items[i].sprite);
                }

                output.push(items[i].sprite);
            }
        }

        return output;
        
    },

    /**
    * Move the given display object towards the destination object at a steady velocity.
    * If you specify a maxTime then it will adjust the speed (overwriting what you set) so it arrives at the destination in that number of seconds.
    * Timings are approximate due to the way browser timers work. Allow for a variance of +- 50ms.
    * Note: The display object does not continuously track the target. If the target changes location during transit the display object will not modify its course.
    * Note: The display object doesn't stop moving once it reaches the destination coordinates.
    * Note: Doesn't take into account acceleration, maxVelocity or drag (if you've set drag or acceleration too high this object may not move at all)
    *
    * @method Phaser.Physics.Arcade#moveToObject
    * @param {any} displayObject - The display object to move.
    * @param {any} destination - The display object to move towards. Can be any object but must have visible x/y properties.
    * @param {number} [speed=60] - The speed it will move, in pixels per second (default is 60 pixels/sec)
    * @param {number} [maxTime=0] - Time given in milliseconds (1000 = 1 sec). If set the speed is adjusted so the object will arrive at destination in the given number of ms.
    * @return {number} The angle (in radians) that the object should be visually set to in order to match its new velocity.
    */
    moveToObject: function (displayObject, destination, speed, maxTime) {

        if (speed === undefined) { speed = 60; }
        if (maxTime === undefined) { maxTime = 0; }

        var angle = Math.atan2(destination.y - displayObject.y, destination.x - displayObject.x);

        if (maxTime > 0)
        {
            //  We know how many pixels we need to move, but how fast?
            speed = this.distanceBetween(displayObject, destination) / (maxTime / 1000);
        }

        displayObject.body.velocity.x = Math.cos(angle) * speed;
        displayObject.body.velocity.y = Math.sin(angle) * speed;

        return angle;

    },

    /**
    * Move the given display object towards the pointer at a steady velocity. If no pointer is given it will use Phaser.Input.activePointer.
    * If you specify a maxTime then it will adjust the speed (over-writing what you set) so it arrives at the destination in that number of seconds.
    * Timings are approximate due to the way browser timers work. Allow for a variance of +- 50ms.
    * Note: The display object does not continuously track the target. If the target changes location during transit the display object will not modify its course.
    * Note: The display object doesn't stop moving once it reaches the destination coordinates.
    *
    * @method Phaser.Physics.Arcade#moveToPointer
    * @param {any} displayObject - The display object to move.
    * @param {number} [speed=60] - The speed it will move, in pixels per second (default is 60 pixels/sec)
    * @param {Phaser.Pointer} [pointer] - The pointer to move towards. Defaults to Phaser.Input.activePointer.
    * @param {number} [maxTime=0] - Time given in milliseconds (1000 = 1 sec). If set the speed is adjusted so the object will arrive at destination in the given number of ms.
    * @return {number} The angle (in radians) that the object should be visually set to in order to match its new velocity.
    */
    moveToPointer: function (displayObject, speed, pointer, maxTime) {

        if (speed === undefined) { speed = 60; }
        pointer = pointer || this.game.input.activePointer;
        if (maxTime === undefined) { maxTime = 0; }

        var angle = this.angleToPointer(displayObject, pointer);

        if (maxTime > 0)
        {
            //  We know how many pixels we need to move, but how fast?
            speed = this.distanceToPointer(displayObject, pointer) / (maxTime / 1000);
        }

        displayObject.body.velocity.x = Math.cos(angle) * speed;
        displayObject.body.velocity.y = Math.sin(angle) * speed;

        return angle;

    },

    /**
    * Move the given display object towards the x/y coordinates at a steady velocity.
    * If you specify a maxTime then it will adjust the speed (over-writing what you set) so it arrives at the destination in that number of seconds.
    * Timings are approximate due to the way browser timers work. Allow for a variance of +- 50ms.
    * Note: The display object does not continuously track the target. If the target changes location during transit the display object will not modify its course.
    * Note: The display object doesn't stop moving once it reaches the destination coordinates.
    * Note: Doesn't take into account acceleration, maxVelocity or drag (if you've set drag or acceleration too high this object may not move at all)
    *
    * @method Phaser.Physics.Arcade#moveToXY
    * @param {any} displayObject - The display object to move.
    * @param {number} x - The x coordinate to move towards.
    * @param {number} y - The y coordinate to move towards.
    * @param {number} [speed=60] - The speed it will move, in pixels per second (default is 60 pixels/sec)
    * @param {number} [maxTime=0] - Time given in milliseconds (1000 = 1 sec). If set the speed is adjusted so the object will arrive at destination in the given number of ms.
    * @return {number} The angle (in radians) that the object should be visually set to in order to match its new velocity.
    */
    moveToXY: function (displayObject, x, y, speed, maxTime) {

        if (speed === undefined) { speed = 60; }
        if (maxTime === undefined) { maxTime = 0; }

        var angle = Math.atan2(y - displayObject.y, x - displayObject.x);

        if (maxTime > 0)
        {
            //  We know how many pixels we need to move, but how fast?
            speed = this.distanceToXY(displayObject, x, y) / (maxTime / 1000);
        }

        displayObject.body.velocity.x = Math.cos(angle) * speed;
        displayObject.body.velocity.y = Math.sin(angle) * speed;

        return angle;

    },

    /**
    * Given the angle (in degrees) and speed calculate the velocity and return it as a Point object, or set it to the given point object.
    * One way to use this is: velocityFromAngle(angle, 200, sprite.velocity) which will set the values directly to the sprites velocity and not create a new Point object.
    *
    * @method Phaser.Physics.Arcade#velocityFromAngle
    * @param {number} angle - The angle in degrees calculated in clockwise positive direction (down = 90 degrees positive, right = 0 degrees positive, up = 90 degrees negative)
    * @param {number} [speed=60] - The speed it will move, in pixels per second sq.
    * @param {Phaser.Point|object} [point] - The Point object in which the x and y properties will be set to the calculated velocity.
    * @return {Phaser.Point} - A Point where point.x contains the velocity x value and point.y contains the velocity y value.
    */
    velocityFromAngle: function (angle, speed, point) {

        if (speed === undefined) { speed = 60; }
        point = point || new Phaser.Point();

        return point.setTo((Math.cos(this.game.math.degToRad(angle)) * speed), (Math.sin(this.game.math.degToRad(angle)) * speed));

    },

    /**
    * Given the rotation (in radians) and speed calculate the velocity and return it as a Point object, or set it to the given point object.
    * One way to use this is: velocityFromRotation(rotation, 200, sprite.velocity) which will set the values directly to the sprites velocity and not create a new Point object.
    *
    * @method Phaser.Physics.Arcade#velocityFromRotation
    * @param {number} rotation - The angle in radians.
    * @param {number} [speed=60] - The speed it will move, in pixels per second sq.
    * @param {Phaser.Point|object} [point] - The Point object in which the x and y properties will be set to the calculated velocity.
    * @return {Phaser.Point} - A Point where point.x contains the velocity x value and point.y contains the velocity y value.
    */
    velocityFromRotation: function (rotation, speed, point) {

        if (speed === undefined) { speed = 60; }
        point = point || new Phaser.Point();

        return point.setTo((Math.cos(rotation) * speed), (Math.sin(rotation) * speed));

    },

    /**
    * Given the rotation (in radians) and speed calculate the acceleration and return it as a Point object, or set it to the given point object.
    * One way to use this is: accelerationFromRotation(rotation, 200, sprite.acceleration) which will set the values directly to the sprites acceleration and not create a new Point object.
    *
    * @method Phaser.Physics.Arcade#accelerationFromRotation
    * @param {number} rotation - The angle in radians.
    * @param {number} [speed=60] - The speed it will move, in pixels per second sq.
    * @param {Phaser.Point|object} [point] - The Point object in which the x and y properties will be set to the calculated acceleration.
    * @return {Phaser.Point} - A Point where point.x contains the acceleration x value and point.y contains the acceleration y value.
    */
    accelerationFromRotation: function (rotation, speed, point) {

        if (speed === undefined) { speed = 60; }
        point = point || new Phaser.Point();

        return point.setTo((Math.cos(rotation) * speed), (Math.sin(rotation) * speed));

    },

    /**
    * Sets the acceleration.x/y property on the display object so it will move towards the target at the given speed (in pixels per second sq.)
    * You must give a maximum speed value, beyond which the display object won't go any faster.
    * Note: The display object does not continuously track the target. If the target changes location during transit the display object will not modify its course.
    * Note: The display object doesn't stop moving once it reaches the destination coordinates.
    *
    * @method Phaser.Physics.Arcade#accelerateToObject
    * @param {any} displayObject - The display object to move.
    * @param {any} destination - The display object to move towards. Can be any object but must have visible x/y properties.
    * @param {number} [speed=60] - The speed it will accelerate in pixels per second.
    * @param {number} [xSpeedMax=500] - The maximum x velocity the display object can reach.
    * @param {number} [ySpeedMax=500] - The maximum y velocity the display object can reach.
    * @return {number} The angle (in radians) that the object should be visually set to in order to match its new trajectory.
    */
    accelerateToObject: function (displayObject, destination, speed, xSpeedMax, ySpeedMax) {

        if (speed === undefined) { speed = 60; }
        if (xSpeedMax === undefined) { xSpeedMax = 1000; }
        if (ySpeedMax === undefined) { ySpeedMax = 1000; }

        var angle = this.angleBetween(displayObject, destination);

        displayObject.body.acceleration.setTo(Math.cos(angle) * speed, Math.sin(angle) * speed);
        displayObject.body.maxVelocity.setTo(xSpeedMax, ySpeedMax);

        return angle;

    },

    /**
    * Sets the acceleration.x/y property on the display object so it will move towards the target at the given speed (in pixels per second sq.)
    * You must give a maximum speed value, beyond which the display object won't go any faster.
    * Note: The display object does not continuously track the target. If the target changes location during transit the display object will not modify its course.
    * Note: The display object doesn't stop moving once it reaches the destination coordinates.
    *
    * @method Phaser.Physics.Arcade#accelerateToPointer
    * @param {any} displayObject - The display object to move.
    * @param {Phaser.Pointer} [pointer] - The pointer to move towards. Defaults to Phaser.Input.activePointer.
    * @param {number} [speed=60] - The speed it will accelerate in pixels per second.
    * @param {number} [xSpeedMax=500] - The maximum x velocity the display object can reach.
    * @param {number} [ySpeedMax=500] - The maximum y velocity the display object can reach.
    * @return {number} The angle (in radians) that the object should be visually set to in order to match its new trajectory.
    */
    accelerateToPointer: function (displayObject, pointer, speed, xSpeedMax, ySpeedMax) {

        if (speed === undefined) { speed = 60; }
        if (pointer === undefined) { pointer = this.game.input.activePointer; }
        if (xSpeedMax === undefined) { xSpeedMax = 1000; }
        if (ySpeedMax === undefined) { ySpeedMax = 1000; }

        var angle = this.angleToPointer(displayObject, pointer);

        displayObject.body.acceleration.setTo(Math.cos(angle) * speed, Math.sin(angle) * speed);
        displayObject.body.maxVelocity.setTo(xSpeedMax, ySpeedMax);

        return angle;

    },

    /**
    * Sets the acceleration.x/y property on the display object so it will move towards the x/y coordinates at the given speed (in pixels per second sq.)
    * You must give a maximum speed value, beyond which the display object won't go any faster.
    * Note: The display object does not continuously track the target. If the target changes location during transit the display object will not modify its course.
    * Note: The display object doesn't stop moving once it reaches the destination coordinates.
    *
    * @method Phaser.Physics.Arcade#accelerateToXY
    * @param {any} displayObject - The display object to move.
    * @param {number} x - The x coordinate to accelerate towards.
    * @param {number} y - The y coordinate to accelerate towards.
    * @param {number} [speed=60] - The speed it will accelerate in pixels per second.
    * @param {number} [xSpeedMax=500] - The maximum x velocity the display object can reach.
    * @param {number} [ySpeedMax=500] - The maximum y velocity the display object can reach.
    * @return {number} The angle (in radians) that the object should be visually set to in order to match its new trajectory.
    */
    accelerateToXY: function (displayObject, x, y, speed, xSpeedMax, ySpeedMax) {

        if (speed === undefined) { speed = 60; }
        if (xSpeedMax === undefined) { xSpeedMax = 1000; }
        if (ySpeedMax === undefined) { ySpeedMax = 1000; }

        var angle = this.angleToXY(displayObject, x, y);

        displayObject.body.acceleration.setTo(Math.cos(angle) * speed, Math.sin(angle) * speed);
        displayObject.body.maxVelocity.setTo(xSpeedMax, ySpeedMax);

        return angle;

    },

    /**
    * Find the distance between two display objects (like Sprites).
    *
    * The optional `world` argument allows you to return the result based on the Game Objects `world` property,
    * instead of its `x` and `y` values. This is useful of the object has been nested inside an offset Group,
    * or parent Game Object.
    *
    * @method Phaser.Physics.Arcade#distanceBetween
    * @param {any} source - The Display Object to test from.
    * @param {any} target - The Display Object to test to.
    * @param {boolean} [world=false] - Calculate the distance using World coordinates (true), or Object coordinates (false, the default)
    * @return {number} The distance between the source and target objects.
    */
    distanceBetween: function (source, target, world) {

        if (world === undefined) { world = false; }

        var dx = (world) ? source.world.x - target.world.x : source.x - target.x;
        var dy = (world) ? source.world.y - target.world.y : source.y - target.y;

        return Math.sqrt(dx * dx + dy * dy);

    },

    /**
    * Find the distance between a display object (like a Sprite) and the given x/y coordinates.
    * The calculation is made from the display objects x/y coordinate. This may be the top-left if its anchor hasn't been changed.
    * If you need to calculate from the center of a display object instead use the method distanceBetweenCenters()
    *
    * The optional `world` argument allows you to return the result based on the Game Objects `world` property,
    * instead of its `x` and `y` values. This is useful of the object has been nested inside an offset Group,
    * or parent Game Object.
    *
    * @method Phaser.Physics.Arcade#distanceToXY
    * @param {any} displayObject - The Display Object to test from.
    * @param {number} x - The x coordinate to move towards.
    * @param {number} y - The y coordinate to move towards.
    * @param {boolean} [world=false] - Calculate the distance using World coordinates (true), or Object coordinates (false, the default)
    * @return {number} The distance between the object and the x/y coordinates.
    */
    distanceToXY: function (displayObject, x, y, world) {

        if (world === undefined) { world = false; }

        var dx = (world) ? displayObject.world.x - x : displayObject.x - x;
        var dy = (world) ? displayObject.world.y - y : displayObject.y - y;

        return Math.sqrt(dx * dx + dy * dy);

    },

    /**
    * Find the distance between a display object (like a Sprite) and a Pointer. If no Pointer is given the Input.activePointer is used.
    * The calculation is made from the display objects x/y coordinate. This may be the top-left if its anchor hasn't been changed.
    * If you need to calculate from the center of a display object instead use the method distanceBetweenCenters()
    *
    * The optional `world` argument allows you to return the result based on the Game Objects `world` property,
    * instead of its `x` and `y` values. This is useful of the object has been nested inside an offset Group,
    * or parent Game Object.
    *
    * @method Phaser.Physics.Arcade#distanceToPointer
    * @param {any} displayObject - The Display Object to test from.
    * @param {Phaser.Pointer} [pointer] - The Phaser.Pointer to test to. If none is given then Input.activePointer is used.
    * @param {boolean} [world=false] - Calculate the distance using World coordinates (true), or Object coordinates (false, the default)
    * @return {number} The distance between the object and the Pointer.
    */
    distanceToPointer: function (displayObject, pointer, world) {

        if (pointer === undefined) { pointer = this.game.input.activePointer; }
        if (world === undefined) { world = false; }

        var dx = (world) ? displayObject.world.x - pointer.worldX : displayObject.x - pointer.worldX;
        var dy = (world) ? displayObject.world.y - pointer.worldY : displayObject.y - pointer.worldY;

        return Math.sqrt(dx * dx + dy * dy);

    },

    /**
    * Find the angle in radians between two display objects (like Sprites).
    *
    * The optional `world` argument allows you to return the result based on the Game Objects `world` property,
    * instead of its `x` and `y` values. This is useful of the object has been nested inside an offset Group,
    * or parent Game Object.
    *
    * @method Phaser.Physics.Arcade#angleBetween
    * @param {any} source - The Display Object to test from.
    * @param {any} target - The Display Object to test to.
    * @param {boolean} [world=false] - Calculate the angle using World coordinates (true), or Object coordinates (false, the default)
    * @return {number} The angle in radians between the source and target display objects.
    */
    angleBetween: function (source, target, world) {

        if (world === undefined) { world = false; }

        if (world)
        {
            return Math.atan2(target.world.y - source.world.y, target.world.x - source.world.x);
        }
        else
        {
            return Math.atan2(target.y - source.y, target.x - source.x);
        }

    },

    /**
    * Find the angle in radians between centers of two display objects (like Sprites).
    *
    * @method Phaser.Physics.Arcade#angleBetweenCenters
    * @param {any} source - The Display Object to test from.
    * @param {any} target - The Display Object to test to.
    * @return {number} The angle in radians between the source and target display objects.
    */
    angleBetweenCenters: function (source, target) {

        var dx = target.centerX - source.centerX;
        var dy = target.centerY - source.centerY;

        return Math.atan2(dy, dx);

    },

    /**
    * Find the angle in radians between a display object (like a Sprite) and the given x/y coordinate.
    *
    * The optional `world` argument allows you to return the result based on the Game Objects `world` property,
    * instead of its `x` and `y` values. This is useful of the object has been nested inside an offset Group,
    * or parent Game Object.
    *
    * @method Phaser.Physics.Arcade#angleToXY
    * @param {any} displayObject - The Display Object to test from.
    * @param {number} x - The x coordinate to get the angle to.
    * @param {number} y - The y coordinate to get the angle to.
    * @param {boolean} [world=false] - Calculate the angle using World coordinates (true), or Object coordinates (false, the default)
    * @return {number} The angle in radians between displayObject.x/y to Pointer.x/y
    */
    angleToXY: function (displayObject, x, y, world) {

        if (world === undefined) { world = false; }

        if (world)
        {
            return Math.atan2(y - displayObject.world.y, x - displayObject.world.x);
        }
        else
        {
            return Math.atan2(y - displayObject.y, x - displayObject.x);
        }

    },

    /**
    * Find the angle in radians between a display object (like a Sprite) and a Pointer, taking their x/y and center into account.
    *
    * The optional `world` argument allows you to return the result based on the Game Objects `world` property,
    * instead of its `x` and `y` values. This is useful of the object has been nested inside an offset Group,
    * or parent Game Object.
    *
    * @method Phaser.Physics.Arcade#angleToPointer
    * @param {any} displayObject - The Display Object to test from.
    * @param {Phaser.Pointer} [pointer] - The Phaser.Pointer to test to. If none is given then Input.activePointer is used.
    * @param {boolean} [world=false] - Calculate the angle using World coordinates (true), or Object coordinates (false, the default)
    * @return {number} The angle in radians between displayObject.x/y to Pointer.x/y
    */
    angleToPointer: function (displayObject, pointer, world) {

        if (pointer === undefined) { pointer = this.game.input.activePointer; }
        if (world === undefined) { world = false; }

        if (world)
        {
            return Math.atan2(pointer.worldY - displayObject.world.y, pointer.worldX - displayObject.world.x);
        }
        else
        {
            return Math.atan2(pointer.worldY - displayObject.y, pointer.worldX - displayObject.x);
        }

    },

    /**
    * Find the angle in radians between a display object (like a Sprite) and a Pointer, 
    * taking their x/y and center into account relative to the world.
    *
    * @method Phaser.Physics.Arcade#worldAngleToPointer
    * @param {any} displayObject - The DisplayObjerct to test from.
    * @param {Phaser.Pointer} [pointer] - The Phaser.Pointer to test to. If none is given then Input.activePointer is used.
    * @return {number} The angle in radians between displayObject.world.x/y to Pointer.worldX / worldY
    */
    worldAngleToPointer: function (displayObject, pointer) {

        return this.angleToPointer(displayObject, pointer, true);

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Physics Body is linked to a single Sprite. All physics operations should be performed against the body rather than
* the Sprite itself. For example you can set the velocity, acceleration, bounce values etc all on the Body.
*
* @class Phaser.Physics.Arcade.Body
* @constructor
* @param {Phaser.Sprite} sprite - The Sprite object this physics body belongs to.
*/
Phaser.Physics.Arcade.Body = function (sprite) {

    /**
    * @property {Phaser.Sprite} sprite - Reference to the parent Sprite.
    */
    this.sprite = sprite;

    /**
    * @property {Phaser.Game} game - Local reference to game.
    */
    this.game = sprite.game;

    /**
    * @property {number} type - The type of physics system this body belongs to.
    */
    this.type = Phaser.Physics.ARCADE;

    /**
    * @property {boolean} enable - A disabled body won't be checked for any form of collision or overlap or have its pre/post updates run.
    * @default
    */
    this.enable = true;

    /**
    * If `true` this Body is using circular collision detection. If `false` it is using rectangular.
    * Use `Body.setCircle` to control the collision shape this Body uses.
    * @property {boolean} isCircle
    * @default
    * @readOnly
    */
    this.isCircle = false;

    /**
    * The radius of the circular collision shape this Body is using if Body.setCircle has been enabled.
    * If you wish to change the radius then call `setCircle` again with the new value.
    * If you wish to stop the Body using a circle then call `setCircle` with a radius of zero (or undefined).
    * @property {number} radius
    * @default
    * @readOnly
    */
    this.radius = 0;

    /**
    * @property {Phaser.Point} offset - The offset of the Physics Body from the Sprite x/y position.
    */
    this.offset = new Phaser.Point();

    /**
    * @property {Phaser.Point} position - The position of the physics body.
    * @readonly
    */
    this.position = new Phaser.Point(sprite.x, sprite.y);

    /**
    * @property {Phaser.Point} prev - The previous position of the physics body.
    * @readonly
    */
    this.prev = new Phaser.Point(this.position.x, this.position.y);

    /**
    * @property {boolean} allowRotation - Allow this Body to be rotated? (via angularVelocity, etc)
    * @default
    */
    this.allowRotation = true;

    /**
    * The Body's rotation in degrees, as calculated by its angularVelocity and angularAcceleration. Please understand that the collision Body
    * itself never rotates, it is always axis-aligned. However these values are passed up to the parent Sprite and updates its rotation.
    * @property {number} rotation
    */
    this.rotation = sprite.angle;

    /**
    * @property {number} preRotation - The previous rotation of the physics body.
    * @readonly
    */
    this.preRotation = sprite.angle;

    /**
    * @property {number} width - The calculated width of the physics body.
    * @readonly
    */
    this.width = sprite.width;

    /**
    * @property {number} height - The calculated height of the physics body.
    * @readonly
    */
    this.height = sprite.height;

    /**
    * @property {number} sourceWidth - The un-scaled original size.
    * @readonly
    */
    this.sourceWidth = sprite.width;

    /**
    * @property {number} sourceHeight - The un-scaled original size.
    * @readonly
    */
    this.sourceHeight = sprite.height;

    if (sprite.texture)
    {
        this.sourceWidth = sprite.texture.frame.width;
        this.sourceHeight = sprite.texture.frame.height;
    }

    /**
    * @property {number} halfWidth - The calculated width / 2 of the physics body.
    * @readonly
    */
    this.halfWidth = Math.abs(sprite.width / 2);

    /**
    * @property {number} halfHeight - The calculated height / 2 of the physics body.
    * @readonly
    */
    this.halfHeight = Math.abs(sprite.height / 2);

    /**
    * @property {Phaser.Point} center - The center coordinate of the Physics Body.
    * @readonly
    */
    this.center = new Phaser.Point(sprite.x + this.halfWidth, sprite.y + this.halfHeight);

    /**
    * @property {Phaser.Point} velocity - The velocity, or rate of change in speed of the Body. Measured in pixels per second.
    */
    this.velocity = new Phaser.Point();

    /**
    * @property {Phaser.Point} newVelocity - The new velocity. Calculated during the Body.preUpdate and applied to its position.
    * @readonly
    */
    this.newVelocity = new Phaser.Point();

    /**
    * @property {Phaser.Point} deltaMax - The Sprite position is updated based on the delta x/y values. You can set a cap on those (both +-) using deltaMax.
    */
    this.deltaMax = new Phaser.Point();

    /**
    * @property {Phaser.Point} acceleration - The acceleration is the rate of change of the velocity. Measured in pixels per second squared.
    */
    this.acceleration = new Phaser.Point();

    /**
    * @property {Phaser.Point} drag - The drag applied to the motion of the Body.
    */
    this.drag = new Phaser.Point();

    /**
    * @property {boolean} allowGravity - Allow this Body to be influenced by gravity? Either world or local.
    * @default
    */
    this.allowGravity = true;

    /**
    * @property {Phaser.Point} gravity - A local gravity applied to this Body. If non-zero this over rides any world gravity, unless Body.allowGravity is set to false.
    */
    this.gravity = new Phaser.Point();

    /**
    * @property {Phaser.Point} bounce - The elasticity of the Body when colliding. bounce.x/y = 1 means full rebound, bounce.x/y = 0.5 means 50% rebound velocity.
    */
    this.bounce = new Phaser.Point();

    /**
    * The elasticity of the Body when colliding with the World bounds.
    * By default this property is `null`, in which case `Body.bounce` is used instead. Set this property
    * to a Phaser.Point object in order to enable a World bounds specific bounce value.
    * @property {Phaser.Point} worldBounce
    */
    this.worldBounce = null;

    /**
    * A Signal that is dispatched when this Body collides with the world bounds.
    * Due to the potentially high volume of signals this could create it is disabled by default.
    * To use this feature set this property to a Phaser.Signal: `sprite.body.onWorldBounds = new Phaser.Signal()`
    * and it will be called when a collision happens, passing five arguments:
    * `onWorldBounds(sprite, up, down, left, right)`
    * where the Sprite is a reference to the Sprite that owns this Body, and the other arguments are booleans
    * indicating on which side of the world the Body collided.
    * @property {Phaser.Signal} onWorldBounds
    */
    this.onWorldBounds = null;

    /**
    * A Signal that is dispatched when this Body collides with another Body.
    * 
    * You still need to call `game.physics.arcade.collide` in your `update` method in order
    * for this signal to be dispatched.
    *
    * Usually you'd pass a callback to the `collide` method, but this signal provides for
    * a different level of notification.
    * 
    * Due to the potentially high volume of signals this could create it is disabled by default.
    * 
    * To use this feature set this property to a Phaser.Signal: `sprite.body.onCollide = new Phaser.Signal()`
    * and it will be called when a collision happens, passing two arguments: the sprites which collided.
    * The first sprite in the argument is always the owner of this Body.
    * 
    * If two Bodies with this Signal set collide, both will dispatch the Signal.
    * @property {Phaser.Signal} onCollide
    */
    this.onCollide = null;

    /**
    * A Signal that is dispatched when this Body overlaps with another Body.
    * 
    * You still need to call `game.physics.arcade.overlap` in your `update` method in order
    * for this signal to be dispatched.
    *
    * Usually you'd pass a callback to the `overlap` method, but this signal provides for
    * a different level of notification.
    * 
    * Due to the potentially high volume of signals this could create it is disabled by default.
    * 
    * To use this feature set this property to a Phaser.Signal: `sprite.body.onOverlap = new Phaser.Signal()`
    * and it will be called when a collision happens, passing two arguments: the sprites which collided.
    * The first sprite in the argument is always the owner of this Body.
    * 
    * If two Bodies with this Signal set collide, both will dispatch the Signal.
    * @property {Phaser.Signal} onOverlap
    */
    this.onOverlap = null;

    /**
    * @property {Phaser.Point} maxVelocity - The maximum velocity in pixels per second sq. that the Body can reach.
    * @default
    */
    this.maxVelocity = new Phaser.Point(10000, 10000);

    /**
    * @property {Phaser.Point} friction - The amount of movement that will occur if another object 'rides' this one.
    */
    this.friction = new Phaser.Point(1, 0);

    /**
    * @property {number} angularVelocity - The angular velocity controls the rotation speed of the Body. It is measured in degrees per second.
    * @default
    */
    this.angularVelocity = 0;

    /**
    * @property {number} angularAcceleration - The angular acceleration is the rate of change of the angular velocity. Measured in degrees per second squared.
    * @default
    */
    this.angularAcceleration = 0;

    /**
    * @property {number} angularDrag - The drag applied during the rotation of the Body. Measured in degrees per second squared.
    * @default
    */
    this.angularDrag = 0;

    /**
    * @property {number} maxAngular - The maximum angular velocity in degrees per second that the Body can reach.
    * @default
    */
    this.maxAngular = 1000;

    /**
    * @property {number} mass - The mass of the Body. When two bodies collide their mass is used in the calculation to determine the exchange of velocity.
    * @default
    */
    this.mass = 1;

    /**
    * @property {number} angle - The angle of the Body's velocity in radians.
    * @readonly
    */
    this.angle = 0;

    /**
    * @property {number} speed - The speed of the Body as calculated by its velocity.
    * @readonly
    */
    this.speed = 0;

    /**
    * @property {number} facing - A const reference to the direction the Body is traveling or facing.
    * @default
    */
    this.facing = Phaser.NONE;

    /**
    * @property {boolean} immovable - An immovable Body will not receive any impacts from other bodies.
    * @default
    */
    this.immovable = false;

    /**
    * If you have a Body that is being moved around the world via a tween or a Group motion, but its local x/y position never
    * actually changes, then you should set Body.moves = false. Otherwise it will most likely fly off the screen.
    * If you want the physics system to move the body around, then set moves to true.
    * @property {boolean} moves - Set to true to allow the Physics system to move this Body, otherwise false to move it manually.
    * @default
    */
    this.moves = true;

    /**
    * This flag allows you to disable the custom x separation that takes place by Physics.Arcade.separate.
    * Used in combination with your own collision processHandler you can create whatever type of collision response you need.
    * @property {boolean} customSeparateX - Use a custom separation system or the built-in one?
    * @default
    */
    this.customSeparateX = false;

    /**
    * This flag allows you to disable the custom y separation that takes place by Physics.Arcade.separate.
    * Used in combination with your own collision processHandler you can create whatever type of collision response you need.
    * @property {boolean} customSeparateY - Use a custom separation system or the built-in one?
    * @default
    */
    this.customSeparateY = false;

    /**
    * When this body collides with another, the amount of overlap is stored here.
    * @property {number} overlapX - The amount of horizontal overlap during the collision.
    */
    this.overlapX = 0;

    /**
    * When this body collides with another, the amount of overlap is stored here.
    * @property {number} overlapY - The amount of vertical overlap during the collision.
    */
    this.overlapY = 0;

    /**
    * If `Body.isCircle` is true, and this body collides with another circular body, the amount of overlap is stored here.
    * @property {number} overlapR - The amount of overlap during the collision.
    */
    this.overlapR = 0;

    /**
    * If a body is overlapping with another body, but neither of them are moving (maybe they spawned on-top of each other?) this is set to true.
    * @property {boolean} embedded - Body embed value.
    */
    this.embedded = false;

    /**
    * A Body can be set to collide against the World bounds automatically and rebound back into the World if this is set to true. Otherwise it will leave the World.
    * @property {boolean} collideWorldBounds - Should the Body collide with the World bounds?
    */
    this.collideWorldBounds = false;

    /**
    * Set the checkCollision properties to control which directions collision is processed for this Body.
    * For example checkCollision.up = false means it won't collide when the collision happened while moving up.
    * If you need to disable a Body entirely, use `body.enable = false`, this will also disable motion.
    * If you need to disable just collision and/or overlap checks, but retain motion, set `checkCollision.none = true`.
    * @property {object} checkCollision - An object containing allowed collision.
    */
    this.checkCollision = { none: false, any: true, up: true, down: true, left: true, right: true };

    /**
    * This object is populated with boolean values when the Body collides with another.
    * touching.up = true means the collision happened to the top of this Body for example.
    * @property {object} touching - An object containing touching results.
    */
    this.touching = { none: true, up: false, down: false, left: false, right: false };

    /**
    * This object is populated with previous touching values from the bodies previous collision.
    * @property {object} wasTouching - An object containing previous touching results.
    */
    this.wasTouching = { none: true, up: false, down: false, left: false, right: false };

    /**
    * This object is populated with boolean values when the Body collides with the World bounds or a Tile.
    * For example if blocked.up is true then the Body cannot move up.
    * @property {object} blocked - An object containing on which faces this Body is blocked from moving, if any.
    */
    this.blocked = { up: false, down: false, left: false, right: false };

    /**
    * If this is an especially small or fast moving object then it can sometimes skip over tilemap collisions if it moves through a tile in a step.
    * Set this padding value to add extra padding to its bounds. tilePadding.x applied to its width, y to its height.
    * @property {Phaser.Point} tilePadding - Extra padding to be added to this sprite's dimensions when checking for tile collision.
    */
    this.tilePadding = new Phaser.Point();

    /**
    * @property {boolean} dirty - If this Body in a preUpdate (true) or postUpdate (false) state?
    */
    this.dirty = false;

    /**
    * @property {boolean} skipQuadTree - If true and you collide this Sprite against a Group, it will disable the collision check from using a QuadTree.
    */
    this.skipQuadTree = false;

    /**
    * If true the Body will check itself against the Sprite.getBounds() dimensions and adjust its width and height accordingly.
    * If false it will compare its dimensions against the Sprite scale instead, and adjust its width height if the scale has changed.
    * Typically you would need to enable syncBounds if your sprite is the child of a responsive display object such as a FlexLayer, 
    * or in any situation where the Sprite scale doesn't change, but its parents scale is effecting the dimensions regardless.
    * @property {boolean} syncBounds
    * @default
    */
    this.syncBounds = false;

    /**
    * @property {boolean} isMoving - Set by the `moveTo` and `moveFrom` methods.
    */
    this.isMoving = false;

    /**
    * @property {boolean} stopVelocityOnCollide - Set by the `moveTo` and `moveFrom` methods.
    */
    this.stopVelocityOnCollide = true;

    /**
    * @property {integer} moveTimer - Internal time used by the `moveTo` and `moveFrom` methods.
    * @private
    */
    this.moveTimer = 0;

    /**
    * @property {integer} moveDistance - Internal distance value, used by the `moveTo` and `moveFrom` methods.
    * @private
    */
    this.moveDistance = 0;

    /**
    * @property {integer} moveDuration - Internal duration value, used by the `moveTo` and `moveFrom` methods.
    * @private
    */
    this.moveDuration = 0;

    /**
    * @property {Phaser.Line} moveTarget - Set by the `moveTo` method, and updated each frame.
    * @private
    */
    this.moveTarget = null;

    /**
    * @property {Phaser.Point} moveEnd - Set by the `moveTo` method, and updated each frame.
    * @private
    */
    this.moveEnd = null;

    /**
    * @property {Phaser.Signal} onMoveComplete - Listen for the completion of `moveTo` or `moveFrom` events.
    */
    this.onMoveComplete = new Phaser.Signal();

    /**
    * @property {function} movementCallback - Optional callback. If set, invoked during the running of `moveTo` or `moveFrom` events.
    */
    this.movementCallback = null;

    /**
    * @property {object} movementCallbackContext - Context in which to call the movementCallback.
    */
    this.movementCallbackContext = null;

    /**
    * @property {boolean} _reset - Internal cache var.
    * @private
    */
    this._reset = true;

    /**
    * @property {number} _sx - Internal cache var.
    * @private
    */
    this._sx = sprite.scale.x;

    /**
    * @property {number} _sy - Internal cache var.
    * @private
    */
    this._sy = sprite.scale.y;

    /**
    * @property {number} _dx - Internal cache var.
    * @private
    */
    this._dx = 0;

    /**
    * @property {number} _dy - Internal cache var.
    * @private
    */
    this._dy = 0;

};

Phaser.Physics.Arcade.Body.prototype = {

    /**
    * Internal method.
    *
    * @method Phaser.Physics.Arcade.Body#updateBounds
    * @protected
    */
    updateBounds: function () {

        if (this.syncBounds)
        {
            var b = this.sprite.getBounds();
            b.ceilAll();

            if (b.width !== this.width || b.height !== this.height)
            {
                this.width = b.width;
                this.height = b.height;
                this._reset = true;
            }
        }
        else
        {
            var asx = Math.abs(this.sprite.scale.x);
            var asy = Math.abs(this.sprite.scale.y);

            if (asx !== this._sx || asy !== this._sy)
            {
                this.width = this.sourceWidth * asx;
                this.height = this.sourceHeight * asy;
                this._sx = asx;
                this._sy = asy;
                this._reset = true;
            }
        }

        if (this._reset)
        {
            this.halfWidth = Math.floor(this.width / 2);
            this.halfHeight = Math.floor(this.height / 2);
            this.center.setTo(this.position.x + this.halfWidth, this.position.y + this.halfHeight);
        }

    },

    /**
    * Internal method.
    *
    * @method Phaser.Physics.Arcade.Body#preUpdate
    * @protected
    */
    preUpdate: function () {

        if (!this.enable || this.game.physics.arcade.isPaused)
        {
            return;
        }

        this.dirty = true;

        //  Store and reset collision flags
        this.wasTouching.none = this.touching.none;
        this.wasTouching.up = this.touching.up;
        this.wasTouching.down = this.touching.down;
        this.wasTouching.left = this.touching.left;
        this.wasTouching.right = this.touching.right;

        this.touching.none = true;
        this.touching.up = false;
        this.touching.down = false;
        this.touching.left = false;
        this.touching.right = false;

        this.blocked.up = false;
        this.blocked.down = false;
        this.blocked.left = false;
        this.blocked.right = false;

        this.embedded = false;

        this.updateBounds();

        this.position.x = (this.sprite.world.x - (this.sprite.anchor.x * this.sprite.width)) + this.sprite.scale.x * this.offset.x;
        this.position.x -= this.sprite.scale.x < 0 ? this.width : 0;

        this.position.y = (this.sprite.world.y - (this.sprite.anchor.y * this.sprite.height)) + this.sprite.scale.y * this.offset.y;
        this.position.y -= this.sprite.scale.y < 0 ? this.height : 0;

        this.rotation = this.sprite.angle;

        this.preRotation = this.rotation;

        if (this._reset || this.sprite.fresh)
        {
            this.prev.x = this.position.x;
            this.prev.y = this.position.y;
        }

        if (this.moves)
        {
            this.game.physics.arcade.updateMotion(this);

            this.newVelocity.set(this.velocity.x * this.game.time.physicsElapsed, this.velocity.y * this.game.time.physicsElapsed);

            this.position.x += this.newVelocity.x;
            this.position.y += this.newVelocity.y;

            if (this.position.x !== this.prev.x || this.position.y !== this.prev.y)
            {
                this.angle = Math.atan2(this.velocity.y, this.velocity.x);
            }

            this.speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

            //  Now the State update will throw collision checks at the Body
            //  And finally we'll integrate the new position back to the Sprite in postUpdate

            if (this.collideWorldBounds)
            {
                if (this.checkWorldBounds() && this.onWorldBounds)
                {
                    this.onWorldBounds.dispatch(this.sprite, this.blocked.up, this.blocked.down, this.blocked.left, this.blocked.right);
                }
            }
        }

        this._dx = this.deltaX();
        this._dy = this.deltaY();

        this._reset = false;

    },

    /**
    * Internal method.
    *
    * @method Phaser.Physics.Arcade.Body#updateMovement
    * @protected
    */
    updateMovement: function () {

        var percent = 0;
        var collided = (this.overlapX !== 0 || this.overlapY !== 0);

        //  Duration or Distance based?

        if (this.moveDuration > 0)
        {
            this.moveTimer += this.game.time.elapsedMS;

            percent = this.moveTimer / this.moveDuration;
        }
        else
        {
            this.moveTarget.end.set(this.position.x, this.position.y);

            percent = this.moveTarget.length / this.moveDistance;
        }

        if (this.movementCallback)
        {
            var result = this.movementCallback.call(this.movementCallbackContext, this, this.velocity, percent);
        }

        if (collided || percent >= 1 || (result !== undefined && result !== true))
        {
            this.stopMovement((percent >= 1) || (this.stopVelocityOnCollide && collided));
            return false;
        }

        return true;

    },

    /**
    * If this Body is moving as a result of a call to `moveTo` or `moveFrom` (i.e. it
    * has Body.isMoving true), then calling this method will stop the movement before
    * either the duration or distance counters expire.
    *
    * The `onMoveComplete` signal is dispatched.
    *
    * @method Phaser.Physics.Arcade.Body#stopMovement
    * @param {boolean} [stopVelocity] - Should the Body.velocity be set to zero?
    */
    stopMovement: function (stopVelocity) {

        if (this.isMoving)
        {
            this.isMoving = false;

            if (stopVelocity)
            {
                this.velocity.set(0);
            }

            //  Send the Sprite this Body belongs to
            //  and a boolean indicating if it stopped because of a collision or not
            this.onMoveComplete.dispatch(this.sprite, (this.overlapX !== 0 || this.overlapY !== 0));
        }

    },

    /**
    * Internal method.
    *
    * @method Phaser.Physics.Arcade.Body#postUpdate
    * @protected
    */
    postUpdate: function () {

        //  Only allow postUpdate to be called once per frame
        if (!this.enable || !this.dirty)
        {
            return;
        }

        //  Moving?
        if (this.isMoving)
        {
            this.updateMovement();
        }

        this.dirty = false;

        if (this.deltaX() < 0)
        {
            this.facing = Phaser.LEFT;
        }
        else if (this.deltaX() > 0)
        {
            this.facing = Phaser.RIGHT;
        }

        if (this.deltaY() < 0)
        {
            this.facing = Phaser.UP;
        }
        else if (this.deltaY() > 0)
        {
            this.facing = Phaser.DOWN;
        }

        if (this.moves)
        {
            this._dx = this.deltaX();
            this._dy = this.deltaY();

            if (this.deltaMax.x !== 0 && this._dx !== 0)
            {
                if (this._dx < 0 && this._dx < -this.deltaMax.x)
                {
                    this._dx = -this.deltaMax.x;
                }
                else if (this._dx > 0 && this._dx > this.deltaMax.x)
                {
                    this._dx = this.deltaMax.x;
                }
            }

            if (this.deltaMax.y !== 0 && this._dy !== 0)
            {
                if (this._dy < 0 && this._dy < -this.deltaMax.y)
                {
                    this._dy = -this.deltaMax.y;
                }
                else if (this._dy > 0 && this._dy > this.deltaMax.y)
                {
                    this._dy = this.deltaMax.y;
                }
            }

            this.sprite.position.x += this._dx;
            this.sprite.position.y += this._dy;
            this._reset = true;
        }

        this.center.setTo(this.position.x + this.halfWidth, this.position.y + this.halfHeight);

        if (this.allowRotation)
        {
            this.sprite.angle += this.deltaZ();
        }

        this.prev.x = this.position.x;
        this.prev.y = this.position.y;

    },

    /**
    * Internal method.
    *
    * @method Phaser.Physics.Arcade.Body#checkWorldBounds
    * @protected
    * @return {boolean} True if the Body collided with the world bounds, otherwise false.
    */
    checkWorldBounds: function () {

        var pos = this.position;
        var bounds = this.game.physics.arcade.bounds;
        var check = this.game.physics.arcade.checkCollision;

        var bx = (this.worldBounce) ? -this.worldBounce.x : -this.bounce.x;
        var by = (this.worldBounce) ? -this.worldBounce.y : -this.bounce.y;

        if (this.isCircle)
        {
            var bodyBounds = {
                x: this.center.x - this.radius,
                y: this.center.y - this.radius,
                right: this.center.x + this.radius,
                bottom: this.center.y + this.radius
            };

            if (bodyBounds.x < bounds.x && check.left)
            {
                pos.x = bounds.x - this.halfWidth + this.radius;
                this.velocity.x *= bx;
                this.blocked.left = true;
            }
            else if (bodyBounds.right > bounds.right && check.right)
            {
                pos.x = bounds.right - this.halfWidth - this.radius;
                this.velocity.x *= bx;
                this.blocked.right = true;
            }

            if (bodyBounds.y < bounds.y && check.up)
            {
                pos.y = bounds.y - this.halfHeight + this.radius;
                this.velocity.y *= by;
                this.blocked.up = true;
            }
            else if (bodyBounds.bottom > bounds.bottom && check.down)
            {
                pos.y = bounds.bottom  - this.halfHeight - this.radius;
                this.velocity.y *= by;
                this.blocked.down = true;
            }
        }
        else
        {
            if (pos.x < bounds.x && check.left)
            {
                pos.x = bounds.x;
                this.velocity.x *= bx;
                this.blocked.left = true;
            }
            else if (this.right > bounds.right && check.right)
            {
                pos.x = bounds.right - this.width;
                this.velocity.x *= bx;
                this.blocked.right = true;
            }

            if (pos.y < bounds.y && check.up)
            {
                pos.y = bounds.y;
                this.velocity.y *= by;
                this.blocked.up = true;
            }
            else if (this.bottom > bounds.bottom && check.down)
            {
                pos.y = bounds.bottom - this.height;
                this.velocity.y *= by;
                this.blocked.down = true;
            }
        }

        return (this.blocked.up || this.blocked.down || this.blocked.left || this.blocked.right);

    },

    /**
    * Note: This method is experimental, and may be changed or removed in a future release.
    * 
    * This method moves the Body in the given direction, for the duration specified.
    * It works by setting the velocity on the Body, and an internal timer, and then
    * monitoring the duration each frame. When the duration is up the movement is
    * stopped and the `Body.onMoveComplete` signal is dispatched.
    *
    * Movement also stops if the Body collides or overlaps with any other Body.
    * 
    * You can control if the velocity should be reset to zero on collision, by using
    * the property `Body.stopVelocityOnCollide`.
    *
    * Stop the movement at any time by calling `Body.stopMovement`.
    *
    * You can optionally set a speed in pixels per second. If not specified it
    * will use the current `Body.speed` value. If this is zero, the function will return false.
    *
    * Please note that due to browser timings you should allow for a variance in 
    * when the duration will actually expire. Depending on system it may be as much as
    * +- 50ms. Also this method doesn't take into consideration any other forces acting
    * on the Body, such as Gravity, drag or maxVelocity, all of which may impact the
    * movement.
    * 
    * @method Phaser.Physics.Arcade.Body#moveFrom
    * @param  {integer} duration  - The duration of the movement, in ms.
    * @param  {integer} [speed] - The speed of the movement, in pixels per second. If not provided `Body.speed` is used.
    * @param  {integer} [direction] - The angle of movement. If not provided `Body.angle` is used.
    * @return {boolean} True if the movement successfully started, otherwise false.
    */
    moveFrom: function (duration, speed, direction) {

        if (speed === undefined) { speed = this.speed; }

        if (speed === 0)
        {
            return false;
        }

        var angle;

        if (direction === undefined)
        {
            angle = this.angle;
            direction = this.game.math.radToDeg(angle);
        }
        else
        {
            angle = this.game.math.degToRad(direction);
        }

        this.moveTimer = 0;
        this.moveDuration = duration;

        //  Avoid sin/cos
        if (direction === 0 || direction === 180)
        {
            this.velocity.set(Math.cos(angle) * speed, 0);
        }
        else if (direction === 90 || direction === 270)
        {
            this.velocity.set(0, Math.sin(angle) * speed);
        }
        else
        {
            this.velocity.set(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }

        this.isMoving = true;

        return true;

    },

    /**
    * Note: This method is experimental, and may be changed or removed in a future release.
    * 
    * This method moves the Body in the given direction, for the duration specified.
    * It works by setting the velocity on the Body, and an internal distance counter.
    * The distance is monitored each frame. When the distance equals the distance
    * specified in this call, the movement is stopped, and the `Body.onMoveComplete` 
    * signal is dispatched.
    *
    * Movement also stops if the Body collides or overlaps with any other Body.
    * 
    * You can control if the velocity should be reset to zero on collision, by using
    * the property `Body.stopVelocityOnCollide`.
    *
    * Stop the movement at any time by calling `Body.stopMovement`.
    *
    * Please note that due to browser timings you should allow for a variance in 
    * when the distance will actually expire.
    * 
    * Note: This method doesn't take into consideration any other forces acting
    * on the Body, such as Gravity, drag or maxVelocity, all of which may impact the
    * movement.
    * 
    * @method Phaser.Physics.Arcade.Body#moveTo
    * @param  {integer} duration - The duration of the movement, in ms.
    * @param  {integer} distance - The distance, in pixels, the Body will move.
    * @param  {integer} [direction] - The angle of movement. If not provided `Body.angle` is used.
    * @return {boolean} True if the movement successfully started, otherwise false.
    */
    moveTo: function (duration, distance, direction) {

        var speed = distance / (duration / 1000);

        if (speed === 0)
        {
            return false;
        }

        var angle;

        if (direction === undefined)
        {
            angle = this.angle;
            direction = this.game.math.radToDeg(angle);
        }
        else
        {
            angle = this.game.math.degToRad(direction);
        }

        distance = Math.abs(distance);

        this.moveDuration = 0;
        this.moveDistance = distance;

        if (this.moveTarget === null)
        {
            this.moveTarget = new Phaser.Line();
            this.moveEnd = new Phaser.Point();
        }

        this.moveTarget.fromAngle(this.x, this.y, angle, distance);

        this.moveEnd.set(this.moveTarget.end.x, this.moveTarget.end.y);

        this.moveTarget.setTo(this.x, this.y, this.x, this.y);

        //  Avoid sin/cos
        if (direction === 0 || direction === 180)
        {
            this.velocity.set(Math.cos(angle) * speed, 0);
        }
        else if (direction === 90 || direction === 270)
        {
            this.velocity.set(0, Math.sin(angle) * speed);
        }
        else
        {
            this.velocity.set(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }

        this.isMoving = true;

        return true;

    },

    /**
    * You can modify the size of the physics Body to be any dimension you need.
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
    * Calling `setSize` on a Body that has already had `setCircle` will reset all of the Circle
    * properties, making this Body rectangular again.
    *
    * @method Phaser.Physics.Arcade.Body#setSize
    * @param {number} width - The width of the Body.
    * @param {number} height - The height of the Body.
    * @param {number} [offsetX] - The X offset of the Body from the top-left of the Sprites texture.
    * @param {number} [offsetY] - The Y offset of the Body from the top-left of the Sprites texture.
    */
    setSize: function (width, height, offsetX, offsetY) {

        if (offsetX === undefined) { offsetX = this.offset.x; }
        if (offsetY === undefined) { offsetY = this.offset.y; }

        this.sourceWidth = width;
        this.sourceHeight = height;
        this.width = this.sourceWidth * this._sx;
        this.height = this.sourceHeight * this._sy;
        this.halfWidth = Math.floor(this.width / 2);
        this.halfHeight = Math.floor(this.height / 2);
        this.offset.setTo(offsetX, offsetY);

        this.center.setTo(this.position.x + this.halfWidth, this.position.y + this.halfHeight);

        this.isCircle = false;
        this.radius = 0;

    },

    /**
    * Sets this Body as using a circle, of the given radius, for all collision detection instead of a rectangle.
    * The radius is given in pixels and is the distance from the center of the circle to the edge.
    *
    * You can also control the x and y offset, which is the position of the Body relative to the top-left of the Sprite.
    *
    * To change a Body back to being rectangular again call `Body.setSize`.
    *
    * Note: Circular collision only happens with other Arcade Physics bodies, it does not
    * work against tile maps, where rectangular collision is the only method supported.
    *
    * @method Phaser.Physics.Arcade.Body#setCircle
    * @param {number} [radius] - The radius of the Body in pixels. Pass a value of zero / undefined, to stop the Body using a circle for collision.
    * @param {number} [offsetX] - The X offset of the Body from the Sprite position.
    * @param {number} [offsetY] - The Y offset of the Body from the Sprite position.
    */
    setCircle: function (radius, offsetX, offsetY) {

        if (offsetX === undefined) { offsetX = this.offset.x; }
        if (offsetY === undefined) { offsetY = this.offset.y; }

        if (radius > 0)
        {
            this.isCircle = true;
            this.radius = radius;

            this.sourceWidth = radius * 2;
            this.sourceHeight = radius * 2;

            this.width = this.sourceWidth * this._sx;
            this.height = this.sourceHeight * this._sy;

            this.halfWidth = Math.floor(this.width / 2);
            this.halfHeight = Math.floor(this.height / 2);

            this.offset.setTo(offsetX, offsetY);

            this.center.setTo(this.position.x + this.halfWidth, this.position.y + this.halfHeight);
        }
        else
        {
            this.isCircle = false;
        }

    },

    /**
    * Resets all Body values (velocity, acceleration, rotation, etc)
    *
    * @method Phaser.Physics.Arcade.Body#reset
    * @param {number} x - The new x position of the Body.
    * @param {number} y - The new y position of the Body.
    */
    reset: function (x, y) {

        this.velocity.set(0);
        this.acceleration.set(0);

        this.speed = 0;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;

        this.position.x = (x - (this.sprite.anchor.x * this.sprite.width)) + this.sprite.scale.x * this.offset.x;
        this.position.x -= this.sprite.scale.x < 0 ? this.width : 0;

        this.position.y = (y - (this.sprite.anchor.y * this.sprite.height)) + this.sprite.scale.y * this.offset.y;
        this.position.y -= this.sprite.scale.y < 0 ? this.height : 0;

        this.prev.x = this.position.x;
        this.prev.y = this.position.y;

        this.rotation = this.sprite.angle;
        this.preRotation = this.rotation;

        this._sx = this.sprite.scale.x;
        this._sy = this.sprite.scale.y;

        this.center.setTo(this.position.x + this.halfWidth, this.position.y + this.halfHeight);

    },

    /**
    * Returns the bounds of this physics body.
    * 
    * Only used internally by the World collision methods.
    *
    * @method Phaser.Physics.Arcade.Body#getBounds
    * @param {object} obj - The object in which to set the bounds values.
    * @return {object} The object that was given to this method.
    */
    getBounds: function (obj) {

        if (this.isCircle)
        {
            obj.x = this.center.x - this.radius;
            obj.y = this.center.y - this.radius;
            obj.right = this.center.x + this.radius;
            obj.bottom = this.center.y + this.radius;
        }
        else
        {
            obj.x = this.x;
            obj.y = this.y;
            obj.right = this.right;
            obj.bottom = this.bottom;
        }

        return obj;

    },

    /**
    * Tests if a world point lies within this Body.
    *
    * @method Phaser.Physics.Arcade.Body#hitTest
    * @param {number} x - The world x coordinate to test.
    * @param {number} y - The world y coordinate to test.
    * @return {boolean} True if the given coordinates are inside this Body, otherwise false.
    */
    hitTest: function (x, y) {

        return (this.isCircle) ? Phaser.Circle.contains(this, x, y) : Phaser.Rectangle.contains(this, x, y);

    },

    /**
    * Returns true if the bottom of this Body is in contact with either the world bounds or a tile.
    *
    * @method Phaser.Physics.Arcade.Body#onFloor
    * @return {boolean} True if in contact with either the world bounds or a tile.
    */
    onFloor: function () {

        return this.blocked.down;

    },
    
    /**
    * Returns true if the top of this Body is in contact with either the world bounds or a tile.
    *
    * @method Phaser.Physics.Arcade.Body#onCeiling
    * @return {boolean} True if in contact with either the world bounds or a tile.
    */
    onCeiling: function(){

        return this.blocked.up;

    },

    /**
    * Returns true if either side of this Body is in contact with either the world bounds or a tile.
    *
    * @method Phaser.Physics.Arcade.Body#onWall
    * @return {boolean} True if in contact with either the world bounds or a tile.
    */
    onWall: function () {

        return (this.blocked.left || this.blocked.right);

    },

    /**
    * Returns the absolute delta x value.
    *
    * @method Phaser.Physics.Arcade.Body#deltaAbsX
    * @return {number} The absolute delta value.
    */
    deltaAbsX: function () {

        return (this.deltaX() > 0 ? this.deltaX() : -this.deltaX());

    },

    /**
    * Returns the absolute delta y value.
    *
    * @method Phaser.Physics.Arcade.Body#deltaAbsY
    * @return {number} The absolute delta value.
    */
    deltaAbsY: function () {

        return (this.deltaY() > 0 ? this.deltaY() : -this.deltaY());

    },

    /**
    * Returns the delta x value. The difference between Body.x now and in the previous step.
    *
    * @method Phaser.Physics.Arcade.Body#deltaX
    * @return {number} The delta value. Positive if the motion was to the right, negative if to the left.
    */
    deltaX: function () {

        return this.position.x - this.prev.x;

    },

    /**
    * Returns the delta y value. The difference between Body.y now and in the previous step.
    *
    * @method Phaser.Physics.Arcade.Body#deltaY
    * @return {number} The delta value. Positive if the motion was downwards, negative if upwards.
    */
    deltaY: function () {

        return this.position.y - this.prev.y;

    },

    /**
    * Returns the delta z value. The difference between Body.rotation now and in the previous step.
    *
    * @method Phaser.Physics.Arcade.Body#deltaZ
    * @return {number} The delta value. Positive if the motion was clockwise, negative if anti-clockwise.
    */
    deltaZ: function () {

        return this.rotation - this.preRotation;

    },

    /**
    * Destroys this Body.
    * 
    * First it calls Group.removeFromHash if the Game Object this Body belongs to is part of a Group.
    * Then it nulls the Game Objects body reference, and nulls this Body.sprite reference.
    *
    * @method Phaser.Physics.Arcade.Body#destroy
    */
    destroy: function () {

        if (this.sprite.parent && this.sprite.parent instanceof Phaser.Group)
        {
            this.sprite.parent.removeFromHash(this.sprite);
        }

        this.sprite.body = null;
        this.sprite = null;

    }

};

/**
* @name Phaser.Physics.Arcade.Body#left
* @property {number} left - The x position of the Body. The same as `Body.x`.
*/
Object.defineProperty(Phaser.Physics.Arcade.Body.prototype, "left", {

    get: function () {

        return this.position.x;

    }

});

/**
* @name Phaser.Physics.Arcade.Body#right
* @property {number} right - The right value of this Body (same as Body.x + Body.width)
* @readonly
*/
Object.defineProperty(Phaser.Physics.Arcade.Body.prototype, "right", {

    get: function () {

        return this.position.x + this.width;

    }

});

/**
* @name Phaser.Physics.Arcade.Body#top
* @property {number} top - The y position of the Body. The same as `Body.y`.
*/
Object.defineProperty(Phaser.Physics.Arcade.Body.prototype, "top", {

    get: function () {

        return this.position.y;

    }

});

/**
* @name Phaser.Physics.Arcade.Body#bottom
* @property {number} bottom - The bottom value of this Body (same as Body.y + Body.height)
* @readonly
*/
Object.defineProperty(Phaser.Physics.Arcade.Body.prototype, "bottom", {

    get: function () {

        return this.position.y + this.height;

    }

});

/**
* @name Phaser.Physics.Arcade.Body#x
* @property {number} x - The x position.
*/
Object.defineProperty(Phaser.Physics.Arcade.Body.prototype, "x", {

    get: function () {

        return this.position.x;

    },

    set: function (value) {

        this.position.x = value;
    }

});

/**
* @name Phaser.Physics.Arcade.Body#y
* @property {number} y - The y position.
*/
Object.defineProperty(Phaser.Physics.Arcade.Body.prototype, "y", {

    get: function () {

        return this.position.y;

    },

    set: function (value) {

        this.position.y = value;

    }

});

/**
* Render Sprite Body.
*
* @method Phaser.Physics.Arcade.Body#render
* @param {object} context - The context to render to.
* @param {Phaser.Physics.Arcade.Body} body - The Body to render the info of.
* @param {string} [color='rgba(0,255,0,0.4)'] - color of the debug info to be rendered. (format is css color string).
* @param {boolean} [filled=true] - Render the objected as a filled (default, true) or a stroked (false)
*/
Phaser.Physics.Arcade.Body.render = function (context, body, color, filled) {

    if (filled === undefined) { filled = true; }

    color = color || 'rgba(0,255,0,0.4)';

    context.fillStyle = color;
    context.strokeStyle = color;

    if (body.isCircle)
    {
        context.beginPath();
        context.arc(body.center.x - body.game.camera.x, body.center.y - body.game.camera.y, body.radius, 0, 2 * Math.PI);

        if (filled)
        {
            context.fill();
        }
        else
        {
            context.stroke();
        }
    }
    else
    {
        if (filled)
        {
            context.fillRect(body.position.x - body.game.camera.x, body.position.y - body.game.camera.y, body.width, body.height);
        }
        else
        {
            context.strokeRect(body.position.x - body.game.camera.x, body.position.y - body.game.camera.y, body.width, body.height);
        }
    }

};

/**
* Render Sprite Body Physics Data as text.
*
* @method Phaser.Physics.Arcade.Body#renderBodyInfo
* @param {Phaser.Physics.Arcade.Body} body - The Body to render the info of.
* @param {number} x - X position of the debug info to be rendered.
* @param {number} y - Y position of the debug info to be rendered.
* @param {string} [color='rgb(255,255,255)'] - color of the debug info to be rendered. (format is css color string).
*/
Phaser.Physics.Arcade.Body.renderBodyInfo = function (debug, body) {

    debug.line('x: ' + body.x.toFixed(2), 'y: ' + body.y.toFixed(2), 'width: ' + body.width, 'height: ' + body.height);
    debug.line('velocity x: ' + body.velocity.x.toFixed(2), 'y: ' + body.velocity.y.toFixed(2), 'deltaX: ' + body._dx.toFixed(2), 'deltaY: ' + body._dy.toFixed(2));
    debug.line('acceleration x: ' + body.acceleration.x.toFixed(2), 'y: ' + body.acceleration.y.toFixed(2), 'speed: ' + body.speed.toFixed(2), 'angle: ' + body.angle.toFixed(2));
    debug.line('gravity x: ' + body.gravity.x, 'y: ' + body.gravity.y, 'bounce x: ' + body.bounce.x.toFixed(2), 'y: ' + body.bounce.y.toFixed(2));
    debug.line('touching left: ' + body.touching.left, 'right: ' + body.touching.right, 'up: ' + body.touching.up, 'down: ' + body.touching.down);
    debug.line('blocked left: ' + body.blocked.left, 'right: ' + body.blocked.right, 'up: ' + body.blocked.up, 'down: ' + body.blocked.down);

};

Phaser.Physics.Arcade.Body.prototype.constructor = Phaser.Physics.Arcade.Body;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Arcade Physics Tile map collision methods.
*
* @class Phaser.Physics.Arcade.TilemapCollision
* @constructor
*/
Phaser.Physics.Arcade.TilemapCollision = function () {};

Phaser.Physics.Arcade.TilemapCollision.prototype = {

    /**
    * @property {number} TILE_BIAS - A value added to the delta values during collision with tiles. Adjust this if you get tunneling.
    */
    TILE_BIAS: 16,

    /**
    * An internal function. Use Phaser.Physics.Arcade.collide instead.
    *
    * @method Phaser.Physics.Arcade#collideSpriteVsTilemapLayer
    * @private
    * @param {Phaser.Sprite} sprite - The sprite to check.
    * @param {Phaser.TilemapLayer} tilemapLayer - The layer to check.
    * @param {function} collideCallback - An optional callback function that is called if the objects collide. The two objects will be passed to this function in the same order in which you specified them.
    * @param {function} processCallback - A callback function that lets you perform additional checks against the two objects if they overlap. If this is set then collision will only happen if processCallback returns true. The two objects will be passed to this function in the same order in which you specified them.
    * @param {object} callbackContext - The context in which to run the callbacks.
    * @param {boolean} overlapOnly - Just run an overlap or a full collision.
    */
    collideSpriteVsTilemapLayer: function (sprite, tilemapLayer, collideCallback, processCallback, callbackContext, overlapOnly) {

        if (!sprite.body)
        {
            return;
        }

        var mapData = tilemapLayer.getTiles(
            sprite.body.position.x - sprite.body.tilePadding.x,
            sprite.body.position.y - sprite.body.tilePadding.y,
            sprite.body.width + sprite.body.tilePadding.x,
            sprite.body.height + sprite.body.tilePadding.y,
            false, false);

        if (mapData.length === 0)
        {
            return;
        }

        for (var i = 0; i < mapData.length; i++)
        {
            if (processCallback)
            {
                if (processCallback.call(callbackContext, sprite, mapData[i]))
                {
                    if (this.separateTile(i, sprite.body, mapData[i], tilemapLayer, overlapOnly))
                    {
                        this._total++;

                        if (collideCallback)
                        {
                            collideCallback.call(callbackContext, sprite, mapData[i]);
                        }
                    }
                }
            }
            else
            {
                if (this.separateTile(i, sprite.body, mapData[i], tilemapLayer, overlapOnly))
                {
                    this._total++;

                    if (collideCallback)
                    {
                        collideCallback.call(callbackContext, sprite, mapData[i]);
                    }
                }
            }
        }

    },

    /**
    * An internal function. Use Phaser.Physics.Arcade.collide instead.
    *
    * @private
    * @method Phaser.Physics.Arcade#collideGroupVsTilemapLayer
    * @param {Phaser.Group} group - The Group to check.
    * @param {Phaser.TilemapLayer} tilemapLayer - The layer to check.
    * @param {function} collideCallback - An optional callback function that is called if the objects collide. The two objects will be passed to this function in the same order in which you specified them.
    * @param {function} processCallback - A callback function that lets you perform additional checks against the two objects if they overlap. If this is set then collision will only happen if processCallback returns true. The two objects will be passed to this function in the same order in which you specified them.
    * @param {object} callbackContext - The context in which to run the callbacks.
    * @param {boolean} overlapOnly - Just run an overlap or a full collision.
    */
    collideGroupVsTilemapLayer: function (group, tilemapLayer, collideCallback, processCallback, callbackContext, overlapOnly) {

        if (group.length === 0)
        {
            return;
        }

        for (var i = 0; i < group.children.length; i++)
        {
            if (group.children[i].exists)
            {
                this.collideSpriteVsTilemapLayer(group.children[i], tilemapLayer, collideCallback, processCallback, callbackContext, overlapOnly);
            }
        }

    },

    /**
    * The core separation function to separate a physics body and a tile.
    *
    * @private
    * @method Phaser.Physics.Arcade#separateTile
    * @param {Phaser.Physics.Arcade.Body} body - The Body object to separate.
    * @param {Phaser.Tile} tile - The tile to collide against.
    * @param {Phaser.TilemapLayer} tilemapLayer - The tilemapLayer to collide against.
    * @return {boolean} Returns true if the body was separated, otherwise false.
    */
    separateTile: function (i, body, tile, tilemapLayer, overlapOnly) {

        if (!body.enable)
        {
            return false;
        }
        
        var tilemapLayerOffsetX = (!tilemapLayer.fixedToCamera) ? tilemapLayer.position.x : 0;
        var tilemapLayerOffsetY = (!tilemapLayer.fixedToCamera) ? tilemapLayer.position.y : 0;

        //  We re-check for collision in case body was separated in a previous step
        if (!tile.intersects((body.position.x - tilemapLayerOffsetX), (body.position.y - tilemapLayerOffsetY), (body.right - tilemapLayerOffsetX), (body.bottom - tilemapLayerOffsetY)))
        {
            //  no collision so bail out (separated in a previous step)
            return false;
        }
        else if (overlapOnly)
        {
            //  There is an overlap, and we don't need to separate. Bail.
            return true;
        }

        //  They overlap. Any custom callbacks?

        //  A local callback always takes priority over a layer level callback
        if (tile.collisionCallback && !tile.collisionCallback.call(tile.collisionCallbackContext, body.sprite, tile))
        {
            //  If it returns true then we can carry on, otherwise we should abort.
            return false;
        }
        else if (typeof tile.layer.callbacks !== 'undefined' && tile.layer.callbacks[tile.index] && !tile.layer.callbacks[tile.index].callback.call(tile.layer.callbacks[tile.index].callbackContext, body.sprite, tile))
        {
            //  If it returns true then we can carry on, otherwise we should abort.
            return false;
        }

        //  We don't need to go any further if this tile doesn't actually separate
        if (!tile.faceLeft && !tile.faceRight && !tile.faceTop && !tile.faceBottom)
        {
            //   This could happen if the tile was meant to be collided with re: a callback, but otherwise isn't needed for separation
            return false;
        }

        var ox = 0;
        var oy = 0;
        var minX = 0;
        var minY = 1;

        if (body.deltaAbsX() > body.deltaAbsY())
        {
            //  Moving faster horizontally, check X axis first
            minX = -1;
        }
        else if (body.deltaAbsX() < body.deltaAbsY())
        {
            //  Moving faster vertically, check Y axis first
            minY = -1;
        }

        if (body.deltaX() !== 0 && body.deltaY() !== 0 && (tile.faceLeft || tile.faceRight) && (tile.faceTop || tile.faceBottom))
        {
            //  We only need do this if both axis have checking faces AND we're moving in both directions
            minX = Math.min(Math.abs((body.position.x - tilemapLayerOffsetX) - tile.right), Math.abs((body.right - tilemapLayerOffsetX) - tile.left));
            minY = Math.min(Math.abs((body.position.y - tilemapLayerOffsetY) - tile.bottom), Math.abs((body.bottom - tilemapLayerOffsetY) - tile.top));
        }

        if (minX < minY)
        {
            if (tile.faceLeft || tile.faceRight)
            {
                ox = this.tileCheckX(body, tile, tilemapLayer);

                //  That's horizontal done, check if we still intersects? If not then we can return now
                if (ox !== 0 && !tile.intersects((body.position.x - tilemapLayerOffsetX), (body.position.y - tilemapLayerOffsetY), (body.right - tilemapLayerOffsetX), (body.bottom - tilemapLayerOffsetY)))
                {
                    return true;
                }
            }

            if (tile.faceTop || tile.faceBottom)
            {
                oy = this.tileCheckY(body, tile, tilemapLayer);
            }
        }
        else
        {
            if (tile.faceTop || tile.faceBottom)
            {
                oy = this.tileCheckY(body, tile, tilemapLayer);

                //  That's vertical done, check if we still intersects? If not then we can return now
                if (oy !== 0 && !tile.intersects((body.position.x - tilemapLayerOffsetX), (body.position.y - tilemapLayerOffsetY), (body.right - tilemapLayerOffsetX), (body.bottom - tilemapLayerOffsetY)))
                {
                    return true;
                }
            }

            if (tile.faceLeft || tile.faceRight)
            {
                ox = this.tileCheckX(body, tile, tilemapLayer);
            }
        }

        return (ox !== 0 || oy !== 0);

    },

    /**
    * Check the body against the given tile on the X axis.
    *
    * @private
    * @method Phaser.Physics.Arcade#tileCheckX
    * @param {Phaser.Physics.Arcade.Body} body - The Body object to separate.
    * @param {Phaser.Tile} tile - The tile to check.
    * @param {Phaser.TilemapLayer} tilemapLayer - The tilemapLayer to collide against.
    * @return {number} The amount of separation that occurred.
    */
    tileCheckX: function (body, tile, tilemapLayer) {

        var ox = 0;
        var tilemapLayerOffsetX = (!tilemapLayer.fixedToCamera) ? tilemapLayer.position.x : 0;

        if (body.deltaX() < 0 && !body.blocked.left && tile.collideRight && body.checkCollision.left)
        {
            //  Body is moving LEFT
            if (tile.faceRight && (body.x - tilemapLayerOffsetX) < tile.right)
            {
                ox = (body.x - tilemapLayerOffsetX) - tile.right;

                if (ox < -this.TILE_BIAS)
                {
                    ox = 0;
                }
            }
        }
        else if (body.deltaX() > 0 && !body.blocked.right && tile.collideLeft && body.checkCollision.right)
        {
            //  Body is moving RIGHT
            if (tile.faceLeft && (body.right - tilemapLayerOffsetX) > tile.left)
            {
                ox = (body.right - tilemapLayerOffsetX) - tile.left;

                if (ox > this.TILE_BIAS)
                {
                    ox = 0;
                }
            }
        }

        if (ox !== 0)
        {
            if (body.customSeparateX)
            {
                body.overlapX = ox;
            }
            else
            {
                this.processTileSeparationX(body, ox);
            }
        }

        return ox;

    },

    /**
    * Check the body against the given tile on the Y axis.
    *
    * @private
    * @method Phaser.Physics.Arcade#tileCheckY
    * @param {Phaser.Physics.Arcade.Body} body - The Body object to separate.
    * @param {Phaser.Tile} tile - The tile to check.
    * @param {Phaser.TilemapLayer} tilemapLayer - The tilemapLayer to collide against.
    * @return {number} The amount of separation that occurred.
    */
    tileCheckY: function (body, tile, tilemapLayer) {

        var oy = 0;
        var tilemapLayerOffsetY = (!tilemapLayer.fixedToCamera) ? tilemapLayer.position.y : 0;

        if (body.deltaY() < 0 && !body.blocked.up && tile.collideDown && body.checkCollision.up)
        {
            //  Body is moving UP
            if (tile.faceBottom && (body.y - tilemapLayerOffsetY) < tile.bottom)
            {
                oy = (body.y - tilemapLayerOffsetY) - tile.bottom;

                if (oy < -this.TILE_BIAS)
                {
                    oy = 0;
                }
            }
        }
        else if (body.deltaY() > 0 && !body.blocked.down && tile.collideUp && body.checkCollision.down)
        {
            //  Body is moving DOWN
            if (tile.faceTop && (body.bottom - tilemapLayerOffsetY) > tile.top)
            {
                oy = (body.bottom - tilemapLayerOffsetY) - tile.top;

                if (oy > this.TILE_BIAS)
                {
                    oy = 0;
                }
            }
        }

        if (oy !== 0)
        {
            if (body.customSeparateY)
            {
                body.overlapY = oy;
            }
            else
            {
                this.processTileSeparationY(body, oy);
            }
        }

        return oy;

    },

    /**
    * Internal function to process the separation of a physics body from a tile.
    *
    * @private
    * @method Phaser.Physics.Arcade#processTileSeparationX
    * @param {Phaser.Physics.Arcade.Body} body - The Body object to separate.
    * @param {number} x - The x separation amount.
    */
    processTileSeparationX: function (body, x) {

        if (x < 0)
        {
            body.blocked.left = true;
        }
        else if (x > 0)
        {
            body.blocked.right = true;
        }

        body.position.x -= x;

        if (body.bounce.x === 0)
        {
            body.velocity.x = 0;
        }
        else
        {
            body.velocity.x = -body.velocity.x * body.bounce.x;
        }

    },

    /**
    * Internal function to process the separation of a physics body from a tile.
    *
    * @private
    * @method Phaser.Physics.Arcade#processTileSeparationY
    * @param {Phaser.Physics.Arcade.Body} body - The Body object to separate.
    * @param {number} y - The y separation amount.
    */
    processTileSeparationY: function (body, y) {

        if (y < 0)
        {
            body.blocked.up = true;
        }
        else if (y > 0)
        {
            body.blocked.down = true;
        }

        body.position.y -= y;

        if (body.bounce.y === 0)
        {
            body.velocity.y = 0;
        }
        else
        {
            body.velocity.y = -body.velocity.y * body.bounce.y;
        }

    }

};

//  Merge this with the Arcade Physics prototype
Phaser.Utils.mixinPrototype(Phaser.Physics.Arcade.prototype, Phaser.Physics.Arcade.TilemapCollision.prototype);

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* An Image Collection is a special tileset containing mulitple images, with no slicing into each image.
*
* Image Collections are normally created automatically when Tiled data is loaded.
*
* @class Phaser.ImageCollection
* @constructor
* @param {string} name - The name of the image collection in the map data.
* @param {integer} firstgid - The first image index this image collection contains.
* @param {integer} [width=32] - Width of widest image (in pixels).
* @param {integer} [height=32] - Height of tallest image (in pixels).
* @param {integer} [margin=0] - The margin around all images in the collection (in pixels).
* @param {integer} [spacing=0] - The spacing between each image in the collection (in pixels).
* @param {object} [properties={}] - Custom Image Collection properties.
*/
Phaser.ImageCollection = function (name, firstgid, width, height, margin, spacing, properties) {

    if (width === undefined || width <= 0) { width = 32; }
    if (height === undefined || height <= 0) { height = 32; }
    if (margin === undefined) { margin = 0; }
    if (spacing === undefined) { spacing = 0; }

    /**
    * The name of the Image Collection.
    * @property {string} name
    */
    this.name = name;

    /**
    * The Tiled firstgid value.
    * This is the starting index of the first image index this Image Collection contains.
    * @property {integer} firstgid
    */
    this.firstgid = firstgid | 0;

    /**
    * The width of the widest image (in pixels).
    * @property {integer} imageWidth
    * @readonly
    */
    this.imageWidth = width | 0;

    /**
    * The height of the tallest image (in pixels).
    * @property {integer} imageHeight
    * @readonly
    */
    this.imageHeight = height | 0;

    /**
    * The margin around the images in the collection (in pixels).
    * Use `setSpacing` to change.
    * @property {integer} imageMarge
    * @readonly
    */
    // Modified internally
    this.imageMargin = margin | 0;

    /**
    * The spacing between each image in the collection (in pixels).
    * Use `setSpacing` to change.
    * @property {integer} imageSpacing
    * @readonly
    */
    this.imageSpacing = spacing | 0;

    /**
    * Image Collection-specific properties that are typically defined in the Tiled editor.
    * @property {object} properties
    */
    this.properties = properties || {};

    /**
    * The cached images that are a part of this collection.
    * @property {array} images
    * @readonly
    */
    // Modified internally
    this.images = [];

    /**
    * The total number of images in the image collection.
    * @property {integer} total
    * @readonly
    */
    // Modified internally
    this.total = 0;
};

Phaser.ImageCollection.prototype = {

    /**
    * Returns true if and only if this image collection contains the given image index.
    *
    * @method Phaser.ImageCollection#containsImageIndex
    * @param {integer} imageIndex - The image index to search for.
    * @return {boolean} True if this Image Collection contains the given index.
    */
    containsImageIndex: function (imageIndex) {

        return (
            imageIndex >= this.firstgid &&
            imageIndex < (this.firstgid + this.total)
        );

    },

    /**
    * Add an image to this Image Collection.
    *
    * @method Phaser.ImageCollection#addImage
    * @param {integer} gid - The gid of the image in the Image Collection.
    * @param {string} image - The the key of the image in the Image Collection and in the cache.
    */
    addImage: function (gid, image) {

        this.images.push({ gid: gid, image: image });
        this.total++;

    }

};

Phaser.ImageCollection.prototype.constructor = Phaser.ImageCollection;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Tile is a representation of a single tile within the Tilemap.
*
* @class Phaser.Tile
* @constructor
* @param {object} layer - The layer in the Tilemap data that this tile belongs to.
* @param {number} index - The index of this tile type in the core map data.
* @param {number} x - The x coordinate of this tile.
* @param {number} y - The y coordinate of this tile.
* @param {number} width - Width of the tile.
* @param {number} height - Height of the tile.
*/
Phaser.Tile = function (layer, index, x, y, width, height) {

    /**
    * @property {object} layer - The layer in the Tilemap data that this tile belongs to.
    */
    this.layer = layer;

    /**
    * @property {number} index - The index of this tile within the map data corresponding to the tileset, or -1 if this represents a blank/null tile.
    */
    this.index = index;

    /**
    * @property {number} x - The x map coordinate of this tile.
    */
    this.x = x;

    /**
    * @property {number} y - The y map coordinate of this tile.
    */
    this.y = y;
    
    /**
    * @property {number} rotation - The rotation angle of this tile.
    */
    this.rotation = 0;

    /**
    * @property {boolean} flipped - Whether this tile is flipped (mirrored) or not.
    */
    this.flipped = false;
    
    /**
    * @property {number} x - The x map coordinate of this tile.
    */
    this.worldX = x * width;

    /**
    * @property {number} y - The y map coordinate of this tile.
    */
    this.worldY = y * height;

    /**
    * @property {number} width - The width of the tile in pixels.
    */
    this.width = width;

    /**
    * @property {number} height - The height of the tile in pixels.
    */
    this.height = height;

    /**
    * @property {number} width - The width of the tile in pixels.
    */
    this.centerX = Math.abs(width / 2);

    /**
    * @property {number} height - The height of the tile in pixels.
    */
    this.centerY = Math.abs(height / 2);

    /**
    * @property {number} alpha - The alpha value at which this tile is drawn to the canvas.
    */
    this.alpha = 1;

    /**
    * @property {object} properties - Tile specific properties.
    */
    this.properties = {};

    /**
    * @property {boolean} scanned - Has this tile been walked / turned into a poly?
    */
    this.scanned = false;

    /**
    * @property {boolean} faceTop - Is the top of this tile an interesting edge?
    */
    this.faceTop = false;

    /**
    * @property {boolean} faceBottom - Is the bottom of this tile an interesting edge?
    */
    this.faceBottom = false;

    /**
    * @property {boolean} faceLeft - Is the left of this tile an interesting edge?
    */
    this.faceLeft = false;

    /**
    * @property {boolean} faceRight - Is the right of this tile an interesting edge?
    */
    this.faceRight = false;

    /**
    * @property {boolean} collideLeft - Indicating collide with any object on the left.
    * @default
    */
    this.collideLeft = false;

    /**
    * @property {boolean} collideRight - Indicating collide with any object on the right.
    * @default
    */
    this.collideRight = false;

    /**
    * @property {boolean} collideUp - Indicating collide with any object on the top.
    * @default
    */
    this.collideUp = false;

    /**
    * @property {boolean} collideDown - Indicating collide with any object on the bottom.
    * @default
    */
    this.collideDown = false;

    /**
    * @property {function} collisionCallback - Tile collision callback.
    * @default
    */
    this.collisionCallback = null;

    /**
    * @property {object} collisionCallbackContext - The context in which the collision callback will be called.
    * @default
    */
    this.collisionCallbackContext = this;

};

Phaser.Tile.prototype = {

    /**
    * Check if the given x and y world coordinates are within this Tile.
    *
    * @method Phaser.Tile#containsPoint
    * @param {number} x - The x coordinate to test.
    * @param {number} y - The y coordinate to test.
    * @return {boolean} True if the coordinates are within this Tile, otherwise false.
    */
    containsPoint: function (x, y) {

        return !(x < this.worldX || y < this.worldY || x > this.right || y > this.bottom);

    },

    /**
    * Check for intersection with this tile.
    *
    * @method Phaser.Tile#intersects
    * @param {number} x - The x axis in pixels.
    * @param {number} y - The y axis in pixels.
    * @param {number} right - The right point.
    * @param {number} bottom - The bottom point.
    */
    intersects: function (x, y, right, bottom) {

        if (right <= this.worldX)
        {
            return false;
        }

        if (bottom <= this.worldY)
        {
            return false;
        }

        if (x >= this.worldX + this.width)
        {
            return false;
        }

        if (y >= this.worldY + this.height)
        {
            return false;
        }

        return true;

    },

    /**
    * Set a callback to be called when this tile is hit by an object.
    * The callback must true true for collision processing to take place.
    *
    * @method Phaser.Tile#setCollisionCallback
    * @param {function} callback - Callback function.
    * @param {object} context - Callback will be called within this context.
    */
    setCollisionCallback: function (callback, context) {

        this.collisionCallback = callback;
        this.collisionCallbackContext = context;

    },

    /**
    * Clean up memory.
    *
    * @method Phaser.Tile#destroy
    */
    destroy: function () {

        this.collisionCallback = null;
        this.collisionCallbackContext = null;
        this.properties = null;

    },

    /**
    * Sets the collision flags for each side of this tile and updates the interesting faces list.
    *
    * @method Phaser.Tile#setCollision
    * @param {boolean} left - Indicating collide with any object on the left.
    * @param {boolean} right - Indicating collide with any object on the right.
    * @param {boolean} up - Indicating collide with any object on the top.
    * @param {boolean} down - Indicating collide with any object on the bottom.
    */
    setCollision: function (left, right, up, down) {

        this.collideLeft = left;
        this.collideRight = right;
        this.collideUp = up;
        this.collideDown = down;

        this.faceLeft = left;
        this.faceRight = right;
        this.faceTop = up;
        this.faceBottom = down;

    },

    /**
    * Reset collision status flags.
    *
    * @method Phaser.Tile#resetCollision
    */
    resetCollision: function () {

        this.collideLeft = false;
        this.collideRight = false;
        this.collideUp = false;
        this.collideDown = false;

        this.faceTop = false;
        this.faceBottom = false;
        this.faceLeft = false;
        this.faceRight = false;

    },

    /**
    * Is this tile interesting?
    *
    * @method Phaser.Tile#isInteresting
    * @param {boolean} collides - If true will check any collides value.
    * @param {boolean} faces - If true will check any face value.
    * @return {boolean} True if the Tile is interesting, otherwise false.
    */
    isInteresting: function (collides, faces) {

        if (collides && faces)
        {
            //  Does this tile have any collide flags OR interesting face?
            return (this.collideLeft || this.collideRight || this.collideUp || this.collideDown || this.faceTop || this.faceBottom || this.faceLeft || this.faceRight || this.collisionCallback);
        }
        else if (collides)
        {
            //  Does this tile collide?
            return (this.collideLeft || this.collideRight || this.collideUp || this.collideDown);
        }
        else if (faces)
        {
            //  Does this tile have an interesting face?
            return (this.faceTop || this.faceBottom || this.faceLeft || this.faceRight);
        }

        return false;

    },

    /**
    * Copies the tile data and properties from the given tile to this tile.
    *
    * @method Phaser.Tile#copy
    * @param {Phaser.Tile} tile - The tile to copy from.
    */
    copy: function (tile) {

        this.index = tile.index;
        this.alpha = tile.alpha;
        this.properties = tile.properties;

        this.collideUp = tile.collideUp;
        this.collideDown = tile.collideDown;
        this.collideLeft = tile.collideLeft;
        this.collideRight = tile.collideRight;

        this.collisionCallback = tile.collisionCallback;
        this.collisionCallbackContext = tile.collisionCallbackContext;

    }

};

Phaser.Tile.prototype.constructor = Phaser.Tile;

/**
* @name Phaser.Tile#collides
* @property {boolean} collides - True if this tile can collide on any of its faces.
* @readonly
*/
Object.defineProperty(Phaser.Tile.prototype, "collides", {

    get: function () {
        return (this.collideLeft || this.collideRight || this.collideUp || this.collideDown);
    }

});

/**
* @name Phaser.Tile#canCollide
* @property {boolean} canCollide - True if this tile can collide on any of its faces or has a collision callback set.
* @readonly
*/
Object.defineProperty(Phaser.Tile.prototype, "canCollide", {

    get: function () {
        return (this.collideLeft || this.collideRight || this.collideUp || this.collideDown || this.collisionCallback);
    }

});

/**
* @name Phaser.Tile#left
* @property {number} left - The x value in pixels.
* @readonly
*/
Object.defineProperty(Phaser.Tile.prototype, "left", {

    get: function () {
        return this.worldX;
    }

});

/**
* @name Phaser.Tile#right
* @property {number} right - The sum of the x and width properties.
* @readonly
*/
Object.defineProperty(Phaser.Tile.prototype, "right", {

    get: function () {
        return this.worldX + this.width;
    }

});

/**
* @name Phaser.Tile#top
* @property {number} top - The y value.
* @readonly
*/
Object.defineProperty(Phaser.Tile.prototype, "top", {

    get: function () {
        return this.worldY;
    }

});

/**
* @name Phaser.Tile#bottom
* @property {number} bottom - The sum of the y and height properties.
* @readonly
*/
Object.defineProperty(Phaser.Tile.prototype, "bottom", {

    get: function () {
        return this.worldY + this.height;
    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Creates a new Phaser.Tilemap object. The map can either be populated with data from a Tiled JSON file or from a CSV file.
*
* Tiled is a free software package specifically for creating tile maps, and is available from http://www.mapeditor.org
* 
* To do this pass the Cache key as the first parameter. When using Tiled data you need only provide the key.
* When using CSV data you must provide the key and the tileWidth and tileHeight parameters.
* If creating a blank tilemap to be populated later, you can either specify no parameters at all and then use `Tilemap.create` or pass the map and tile dimensions here.
* Note that all Tilemaps use a base tile size to calculate dimensions from, but that a TilemapLayer may have its own unique tile size that overrides it.
* A Tile map is rendered to the display using a TilemapLayer. It is not added to the display list directly itself.
* A map may have multiple layers. You can perform operations on the map data such as copying, pasting, filling and shuffling the tiles around.
*
* @class Phaser.Tilemap
* @constructor
* @param {Phaser.Game} game - Game reference to the currently running game.
* @param {string} [key] - The key of the tilemap data as stored in the Cache. If you're creating a blank map either leave this parameter out or pass `null`.
* @param {number} [tileWidth=32] - The pixel width of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
* @param {number} [tileHeight=32] - The pixel height of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
* @param {number} [width=10] - The width of the map in tiles. If this map is created from Tiled or CSV data you don't need to specify this.
* @param {number} [height=10] - The height of the map in tiles. If this map is created from Tiled or CSV data you don't need to specify this.
*/
Phaser.Tilemap = function (game, key, tileWidth, tileHeight, width, height) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;

    /**
    * @property {string} key - The key of this map data in the Phaser.Cache.
    */
    this.key = key;

    var data = Phaser.TilemapParser.parse(this.game, key, tileWidth, tileHeight, width, height);

    if (data === null)
    {
        return;
    }

    /**
    * @property {number} width - The width of the map (in tiles).
    */
    this.width = data.width;

    /**
    * @property {number} height - The height of the map (in tiles).
    */
    this.height = data.height;

    /**
    * @property {number} tileWidth - The base width of the tiles in the map (in pixels).
    */
    this.tileWidth = data.tileWidth;

    /**
    * @property {number} tileHeight - The base height of the tiles in the map (in pixels).
    */
    this.tileHeight = data.tileHeight;

    /**
    * @property {string} orientation - The orientation of the map data (as specified in Tiled), usually 'orthogonal'.
    */
    this.orientation = data.orientation;

    /**
    * @property {number} format - The format of the map data, either Phaser.Tilemap.CSV or Phaser.Tilemap.TILED_JSON.
    */
    this.format = data.format;

    /**
    * @property {number} version - The version of the map data (as specified in Tiled, usually 1).
    */
    this.version = data.version;

    /**
    * @property {object} properties - Map specific properties as specified in Tiled.
    */
    this.properties = data.properties;

    /**
    * @property {number} widthInPixels - The width of the map in pixels based on width * tileWidth.
    */
    this.widthInPixels = data.widthInPixels;

    /**
    * @property {number} heightInPixels - The height of the map in pixels based on height * tileHeight.
    */
    this.heightInPixels = data.heightInPixels;

    /**
    * @property {array} layers - An array of Tilemap layer data.
    */
    this.layers = data.layers;

    /**
    * @property {array} tilesets - An array of Tilesets.
    */
    this.tilesets = data.tilesets;
    
    /**
    * @property {array} imagecollections - An array of Image Collections.
    */
    this.imagecollections = data.imagecollections;

    /**
    * @property {array} tiles - The super array of Tiles.
    */
    this.tiles = data.tiles;

    /**
    * @property {array} objects - An array of Tiled Object Layers.
    */
    this.objects = data.objects;

    /**
    * @property {array} collideIndexes - An array of tile indexes that collide.
    */
    this.collideIndexes = [];

    /**
    * @property {array} collision - An array of collision data (polylines, etc).
    */
    this.collision = data.collision;

    /**
    * @property {array} images - An array of Tiled Image Layers.
    */
    this.images = data.images;

    /**
    * @property {boolean} enableDebug - If set then console.log is used to dump out useful layer creation debug data.
    */
    this.enableDebug = false;

    /**
    * @property {number} currentLayer - The current layer.
    */
    this.currentLayer = 0;

    /**
    * @property {array} debugMap - Map data used for debug values only.
    */
    this.debugMap = [];

    /**
    * @property {array} _results - Internal var.
    * @private
    */
    this._results = [];

    /**
    * @property {number} _tempA - Internal var.
    * @private
    */
    this._tempA = 0;

    /**
    * @property {number} _tempB - Internal var.
    * @private
    */
    this._tempB = 0;

};

/**
* @constant
* @type {number}
*/
Phaser.Tilemap.CSV = 0;

/**
* @constant
* @type {number}
*/
Phaser.Tilemap.TILED_JSON = 1;

/**
* @constant
* @type {number}
*/
Phaser.Tilemap.NORTH = 0;

/**
* @constant
* @type {number}
*/
Phaser.Tilemap.EAST = 1;

/**
* @constant
* @type {number}
*/
Phaser.Tilemap.SOUTH = 2;

/**
* @constant
* @type {number}
*/
Phaser.Tilemap.WEST = 3;

Phaser.Tilemap.prototype = {

    /**
    * Creates an empty map of the given dimensions and one blank layer. If layers already exist they are erased.
    *
    * @method Phaser.Tilemap#create
    * @param {string} name - The name of the default layer of the map.
    * @param {number} width - The width of the map in tiles.
    * @param {number} height - The height of the map in tiles.
    * @param {number} tileWidth - The width of the tiles the map uses for calculations.
    * @param {number} tileHeight - The height of the tiles the map uses for calculations.
    * @param {Phaser.Group} [group] - Optional Group to add the layer to. If not specified it will be added to the World group.
    * @return {Phaser.TilemapLayer} The TilemapLayer object. This is an extension of Phaser.Image and can be moved around the display list accordingly.
    */
    create: function (name, width, height, tileWidth, tileHeight, group) {

        if (group === undefined) { group = this.game.world; }

        this.width = width;
        this.height = height;

        this.setTileSize(tileWidth, tileHeight);

        this.layers.length = 0;

        return this.createBlankLayer(name, width, height, tileWidth, tileHeight, group);

    },

    /**
    * Sets the base tile size for the map.
    *
    * @method Phaser.Tilemap#setTileSize
    * @param {number} tileWidth - The width of the tiles the map uses for calculations.
    * @param {number} tileHeight - The height of the tiles the map uses for calculations.
    */
    setTileSize: function (tileWidth, tileHeight) {

        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.widthInPixels = this.width * tileWidth;
        this.heightInPixels = this.height * tileHeight;

    },

    /**
    * Adds an image to the map to be used as a tileset. A single map may use multiple tilesets.
    * Note that the tileset name can be found in the JSON file exported from Tiled, or in the Tiled editor.
    *
    * @method Phaser.Tilemap#addTilesetImage
    * @param {string} tileset - The name of the tileset as specified in the map data.
    * @param {string|Phaser.BitmapData} [key] - The key of the Phaser.Cache image used for this tileset.
    *     If `undefined` or `null` it will look for an image with a key matching the tileset parameter.
    *     You can also pass in a BitmapData which can be used instead of an Image.
    * @param {number} [tileWidth=32] - The width of the tiles in the Tileset Image. If not given it will default to the map.tileWidth value, if that isn't set then 32.
    * @param {number} [tileHeight=32] - The height of the tiles in the Tileset Image. If not given it will default to the map.tileHeight value, if that isn't set then 32.
    * @param {number} [tileMargin=0] - The width of the tiles in the Tileset Image.
    * @param {number} [tileSpacing=0] - The height of the tiles in the Tileset Image.
    * @param {number} [gid=0] - If adding multiple tilesets to a blank/dynamic map, specify the starting GID the set will use here.
    * @return {Phaser.Tileset} Returns the Tileset object that was created or updated, or null if it failed.
    */
    addTilesetImage: function (tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) {

        if (tileset === undefined) { return null; }
        if (tileWidth === undefined) { tileWidth = this.tileWidth; }
        if (tileHeight === undefined) { tileHeight = this.tileHeight; }
        if (tileMargin === undefined) { tileMargin = 0; }
        if (tileSpacing === undefined) { tileSpacing = 0; }
        if (gid === undefined) { gid = 0; }

        //  In-case we're working from a blank map
        if (tileWidth === 0)
        {
            tileWidth = 32;
        }

        if (tileHeight === 0)
        {
            tileHeight = 32;
        }

        var img = null;

        if (key === undefined || key === null)
        {
            key = tileset;
        }

        if (key instanceof Phaser.BitmapData)
        {
            img = key.canvas;
        }
        else
        {
            if (!this.game.cache.checkImageKey(key))
            {
                console.warn('Phaser.Tilemap.addTilesetImage: Invalid image key given: "' + key + '"');
                return null;
            }

            img = this.game.cache.getImage(key);
        }

        var idx = this.getTilesetIndex(tileset);

        if (idx === null && this.format === Phaser.Tilemap.TILED_JSON)
        {
            console.warn('Phaser.Tilemap.addTilesetImage: No data found in the JSON matching the tileset name: "' + tileset + '"');
            return null;
        }

        if (this.tilesets[idx])
        {
            this.tilesets[idx].setImage(img);
            return this.tilesets[idx];
        }
        else
        {
            var newSet = new Phaser.Tileset(tileset, gid, tileWidth, tileHeight, tileMargin, tileSpacing, {});

            newSet.setImage(img);

            this.tilesets.push(newSet);

            var i = this.tilesets.length - 1;
            var x = tileMargin;
            var y = tileMargin;

            var count = 0;
            var countX = 0;
            var countY = 0;

            for (var t = gid; t < gid + newSet.total; t++)
            {
                this.tiles[t] = [x, y, i];

                x += tileWidth + tileSpacing;

                count++;

                if (count === newSet.total)
                {
                    break;
                }

                countX++;

                if (countX === newSet.columns)
                {
                    x = tileMargin;
                    y += tileHeight + tileSpacing;

                    countX = 0;
                    countY++;

                    if (countY === newSet.rows)
                    {
                        break;
                    }
                }
            }

            return newSet;

        }

        return null;

    },

    /**
    * Creates a Sprite for every object matching the given gid in the map data. You can optionally specify the group that the Sprite will be created in. If none is
    * given it will be created in the World. All properties from the map data objectgroup are copied across to the Sprite, so you can use this as an easy way to
    * configure Sprite properties from within the map editor. For example giving an object a property of alpha: 0.5 in the map editor will duplicate that when the
    * Sprite is created. You could also give it a value like: body.velocity.x: 100 to set it moving automatically.
    *
    * @method Phaser.Tilemap#createFromObjects
    * @param {string} name - The name of the Object Group to create Sprites from.
    * @param {number} gid - The layer array index value, or if a string is given the layer name within the map data.
    * @param {string} key - The Game.cache key of the image that this Sprite will use.
    * @param {number|string} [frame] - If the Sprite image contains multiple frames you can specify which one to use here.
    * @param {boolean} [exists=true] - The default exists state of the Sprite.
    * @param {boolean} [autoCull=false] - The default autoCull state of the Sprite. Sprites that are autoCulled are culled from the camera if out of its range.
    * @param {Phaser.Group} [group=Phaser.World] - Group to add the Sprite to. If not specified it will be added to the World group.
    * @param {object} [CustomClass=Phaser.Sprite] - If you wish to create your own class, rather than Phaser.Sprite, pass the class here. Your class must extend Phaser.Sprite and have the same constructor parameters.
    * @param {boolean} [adjustY=true] - By default the Tiled map editor uses a bottom-left coordinate system. Phaser uses top-left. So most objects will appear too low down. This parameter moves them up by their height.
    */
    createFromObjects: function (name, gid, key, frame, exists, autoCull, group, CustomClass, adjustY) {

        if (exists === undefined) { exists = true; }
        if (autoCull === undefined) { autoCull = false; }
        if (group === undefined) { group = this.game.world; }
        if (CustomClass === undefined) { CustomClass = Phaser.Sprite; }
        if (adjustY === undefined) { adjustY = true; }

        if (!this.objects[name])
        {
            console.warn('Tilemap.createFromObjects: Invalid objectgroup name given: ' + name);
            return;
        }

        for (var i = 0; i < this.objects[name].length; i++)
        {
            var found = false;
            var obj = this.objects[name][i];

            if (obj.gid !== undefined && typeof gid === 'number' && obj.gid === gid)
            {
                found = true;
            }
            else if (obj.id !== undefined && typeof gid === 'number' && obj.id === gid)
            {
                found = true;
            }
            else if (obj.name !== undefined && typeof gid === 'string' && obj.name === gid)
            {
                found = true;
            }

            if (found)
            {
                var sprite = new CustomClass(this.game, parseFloat(obj.x, 10), parseFloat(obj.y, 10), key, frame);

                sprite.name = obj.name;
                sprite.visible = obj.visible;
                sprite.autoCull = autoCull;
                sprite.exists = exists;

                if (obj.width)
                {
                    sprite.width = obj.width;
                }

                if (obj.height)
                {
                    sprite.height = obj.height;
                }

                if (obj.rotation)
                {
                    sprite.angle = obj.rotation;
                }

                if (adjustY)
                {
                    sprite.y -= sprite.height;
                }

                group.add(sprite);

                for (var property in obj.properties)
                {
                    group.set(sprite, property, obj.properties[property], false, false, 0, true);
                }
            }
        }

    },

    /**
    * Creates a Sprite for every object matching the given tile indexes in the map data.
    * You can specify the group that the Sprite will be created in. If none is given it will be created in the World.
    * You can optional specify if the tile will be replaced with another after the Sprite is created. This is useful if you want to lay down special 
    * tiles in a level that are converted to Sprites, but want to replace the tile itself with a floor tile or similar once converted.
    *
    * @method Phaser.Tilemap#createFromTiles
    * @param {integer|Array} tiles - The tile index, or array of indexes, to create Sprites from.
    * @param {integer|Array} replacements - The tile index, or array of indexes, to change a converted tile to. Set to `null` to not change.
    * @param {string} key - The Game.cache key of the image that this Sprite will use.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on.
    * @param {Phaser.Group} [group=Phaser.World] - Group to add the Sprite to. If not specified it will be added to the World group.
    * @param {object} [properties] - An object that contains the default properties for your newly created Sprite. This object will be iterated and any matching Sprite property will be set.
    * @return {integer} The number of Sprites that were created.
    */
    createFromTiles: function (tiles, replacements, key, layer, group, properties) {

        if (typeof tiles === 'number') { tiles = [tiles]; }

        if (replacements === undefined || replacements === null)
        {
            replacements = [];
        }
        else if (typeof replacements === 'number')
        {
            replacements = [replacements];
        }

        layer = this.getLayer(layer);

        if (group === undefined) { group = this.game.world; }
        if (properties === undefined) { properties = {}; }

        if (properties.customClass === undefined)
        {
            properties.customClass = Phaser.Sprite;
        }

        if (properties.adjustY === undefined)
        {
            properties.adjustY = true;
        }

        var lw = this.layers[layer].width;
        var lh = this.layers[layer].height;

        this.copy(0, 0, lw, lh, layer);

        if (this._results.length < 2)
        {
            return 0;
        }

        var total = 0;
        var sprite;

        for (var i = 1, len = this._results.length; i < len; i++)
        {
            if (tiles.indexOf(this._results[i].index) !== -1)
            {
                sprite = new properties.customClass(this.game, this._results[i].worldX, this._results[i].worldY, key);

                for (var property in properties)
                {
                    sprite[property] = properties[property];
                }

                group.add(sprite);
                total++;
            }

        }

        if (replacements.length === 1)
        {
            //  Assume 1 replacement for all types of tile given
            for (i = 0; i < tiles.length; i++)
            {
                this.replace(tiles[i], replacements[0], 0, 0, lw, lh, layer);
            }
        }
        else if (replacements.length > 1)
        {
            //  Assume 1 for 1 mapping
            for (i = 0; i < tiles.length; i++)
            {
                this.replace(tiles[i], replacements[i], 0, 0, lw, lh, layer);
            }
        }

        return total;

    },

    /**
    * Creates a new TilemapLayer object. By default TilemapLayers are fixed to the camera.
    * The `layer` parameter is important. If you've created your map in Tiled then you can get this by looking in Tiled and looking at the Layer name.
    * Or you can open the JSON file it exports and look at the layers[].name value. Either way it must match.
    * If you wish to create a blank layer to put your own tiles on then see Tilemap.createBlankLayer.
    *
    * @method Phaser.Tilemap#createLayer
    * @param {number|string} layer - The layer array index value, or if a string is given the layer name, within the map data that this TilemapLayer represents.
    * @param {number} [width] - The rendered width of the layer, should never be wider than Game.width. If not given it will be set to Game.width.
    * @param {number} [height] - The rendered height of the layer, should never be wider than Game.height. If not given it will be set to Game.height.
    * @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
    * @return {Phaser.TilemapLayer} The TilemapLayer object. This is an extension of Phaser.Sprite and can be moved around the display list accordingly.
    */
    createLayer: function (layer, width, height, group) {

        //  Add Buffer support for the left of the canvas

        if (width === undefined) { width = this.game.width; }
        if (height === undefined) { height = this.game.height; }
        if (group === undefined) { group = this.game.world; }

        var index = layer;

        if (typeof layer === 'string')
        {
            index = this.getLayerIndex(layer);
        }

        if (index === null || index > this.layers.length)
        {
            console.warn('Tilemap.createLayer: Invalid layer ID given: ' + index);
            return;
        }

        //  Sort out the display dimensions, so they never render too much, or too little.

        if (width === undefined || width <= 0)
        {
            width = Math.min(this.game.width, this.layers[index].widthInPixels);
        }
        else if (width > this.game.width)
        {
            width = this.game.width;
        }

        if (height === undefined || height <= 0)
        {
            height = Math.min(this.game.height, this.layers[index].heightInPixels);
        }
        else if (height > this.game.height)
        {
            height = this.game.height;
        }

        if (this.enableDebug)
        {
            console.group('Tilemap.createLayer');
            console.log('Name:', this.layers[index].name);
            console.log('Size:', width, 'x', height);
            console.log('Tileset:', this.tilesets[0].name, 'index:', index);
        }

        var rootLayer = group.add(new Phaser.TilemapLayer(this.game, this, index, width, height));

        if (this.enableDebug)
        {
            console.groupEnd();
        }

        return rootLayer;

    },


    /**
    * Creates a new and empty layer on this Tilemap. By default TilemapLayers are fixed to the camera.
    *
    * @method Phaser.Tilemap#createBlankLayer
    * @param {string} name - The name of this layer. Must be unique within the map.
    * @param {number} width - The width of the layer in tiles.
    * @param {number} height - The height of the layer in tiles.
    * @param {number} tileWidth - The width of the tiles the layer uses for calculations.
    * @param {number} tileHeight - The height of the tiles the layer uses for calculations.
    * @param {Phaser.Group} [group] - Optional Group to add the layer to. If not specified it will be added to the World group.
    * @return {Phaser.TilemapLayer} The TilemapLayer object. This is an extension of Phaser.Image and can be moved around the display list accordingly.
    */
    createBlankLayer: function (name, width, height, tileWidth, tileHeight, group) {

        if (group === undefined) { group = this.game.world; }

        if (this.getLayerIndex(name) !== null)
        {
            console.warn('Tilemap.createBlankLayer: Layer with matching name already exists: ' + name);
            return;
        }

        var layer = {

            name: name,
            x: 0,
            y: 0,
            width: width,
            height: height,
            widthInPixels: width * tileWidth,
            heightInPixels: height * tileHeight,
            alpha: 1,
            visible: true,
            properties: {},
            indexes: [],
            callbacks: [],
            bodies: [],
            data: null

        };

        var row;
        var output = [];

        for (var y = 0; y < height; y++)
        {
            row = [];

            for (var x = 0; x < width; x++)
            {
                row.push(new Phaser.Tile(layer, -1, x, y, tileWidth, tileHeight));
            }

            output.push(row);
        }

        layer.data = output;

        this.layers.push(layer);

        this.currentLayer = this.layers.length - 1;

        var w = layer.widthInPixels;
        var h = layer.heightInPixels;

        if (w > this.game.width)
        {
            w = this.game.width;
        }

        if (h > this.game.height)
        {
            h = this.game.height;
        }

        var output = new Phaser.TilemapLayer(this.game, this, this.layers.length - 1, w, h);
        output.name = name;

        return group.add(output);

    },

    /**
    * Gets the layer index based on the layers name.
    *
    * @method Phaser.Tilemap#getIndex
    * @protected
    * @param {array} location - The local array to search.
    * @param {string} name - The name of the array element to get.
    * @return {number} The index of the element in the array, or null if not found.
    */
    getIndex: function (location, name) {

        for (var i = 0; i < location.length; i++)
        {
            if (location[i].name === name)
            {
                return i;
            }
        }

        return null;

    },

    /**
    * Gets the layer index based on its name.
    *
    * @method Phaser.Tilemap#getLayerIndex
    * @param {string} name - The name of the layer to get.
    * @return {number} The index of the layer in this tilemap, or null if not found.
    */
    getLayerIndex: function (name) {

        return this.getIndex(this.layers, name);

    },

    /**
    * Gets the tileset index based on its name.
    *
    * @method Phaser.Tilemap#getTilesetIndex
    * @param {string} name - The name of the tileset to get.
    * @return {number} The index of the tileset in this tilemap, or null if not found.
    */
    getTilesetIndex: function (name) {

        return this.getIndex(this.tilesets, name);

    },

    /**
    * Gets the image index based on its name.
    *
    * @method Phaser.Tilemap#getImageIndex
    * @param {string} name - The name of the image to get.
    * @return {number} The index of the image in this tilemap, or null if not found.
    */
    getImageIndex: function (name) {

        return this.getIndex(this.images, name);

    },

    /**
    * Sets a global collision callback for the given tile index within the layer. This will affect all tiles on this layer that have the same index.
    * If a callback is already set for the tile index it will be replaced. Set the callback to null to remove it.
    * If you want to set a callback for a tile at a specific location on the map then see setTileLocationCallback.
    *
    * @method Phaser.Tilemap#setTileIndexCallback
    * @param {number|array} indexes - Either a single tile index, or an array of tile indexes to have a collision callback set for.
    * @param {function} callback - The callback that will be invoked when the tile is collided with.
    * @param {object} callbackContext - The context under which the callback is called.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on. If not given will default to this.currentLayer.
    */
    setTileIndexCallback: function (indexes, callback, callbackContext, layer) {

        layer = this.getLayer(layer);

        if (typeof indexes === 'number')
        {
            //  This may seem a bit wasteful, because it will cause empty array elements to be created, but the look-up cost is much
            //  less than having to iterate through the callbacks array hunting down tile indexes each frame, so I'll take the small memory hit.
            this.layers[layer].callbacks[indexes] = { callback: callback, callbackContext: callbackContext };
        }
        else
        {
            for (var i = 0, len = indexes.length; i < len; i++)
            {
                this.layers[layer].callbacks[indexes[i]] = { callback: callback, callbackContext: callbackContext };
            }
        }

    },

    /**
    * Sets a global collision callback for the given map location within the layer. This will affect all tiles on this layer found in the given area.
    * If a callback is already set for the tile index it will be replaced. Set the callback to null to remove it.
    * If you want to set a callback for a tile at a specific location on the map then see setTileLocationCallback.
    *
    * @method Phaser.Tilemap#setTileLocationCallback
    * @param {number} x - X position of the top left of the area to copy (given in tiles, not pixels)
    * @param {number} y - Y position of the top left of the area to copy (given in tiles, not pixels)
    * @param {number} width - The width of the area to copy (given in tiles, not pixels)
    * @param {number} height - The height of the area to copy (given in tiles, not pixels)
    * @param {function} callback - The callback that will be invoked when the tile is collided with.
    * @param {object} callbackContext - The context under which the callback is called.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on. If not given will default to this.currentLayer.
    */
    setTileLocationCallback: function (x, y, width, height, callback, callbackContext, layer) {

        layer = this.getLayer(layer);

        this.copy(x, y, width, height, layer);

        if (this._results.length < 2)
        {
            return;
        }

        for (var i = 1; i < this._results.length; i++)
        {
            this._results[i].setCollisionCallback(callback, callbackContext);
        }

    },

    /**
    * Sets collision the given tile or tiles. You can pass in either a single numeric index or an array of indexes: [ 2, 3, 15, 20].
    * The `collides` parameter controls if collision will be enabled (true) or disabled (false).
    *
    * @method Phaser.Tilemap#setCollision
    * @param {number|array} indexes - Either a single tile index, or an array of tile IDs to be checked for collision.
    * @param {boolean} [collides=true] - If true it will enable collision. If false it will clear collision.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on. If not given will default to this.currentLayer.
    * @param {boolean} [recalculate=true] - Recalculates the tile faces after the update.
    */
    setCollision: function (indexes, collides, layer, recalculate) {

        if (collides === undefined) { collides = true; }
        if (recalculate === undefined) { recalculate = true; }
        
        layer = this.getLayer(layer);

        if (typeof indexes === 'number')
        {
            return this.setCollisionByIndex(indexes, collides, layer, true);
        }
        else if (Array.isArray(indexes))
        {
            //  Collide all of the IDs given in the indexes array
            for (var i = 0; i < indexes.length; i++)
            {
                this.setCollisionByIndex(indexes[i], collides, layer, false);
            }

            if (recalculate)
            {
                //  Now re-calculate interesting faces
                this.calculateFaces(layer);
            }
        }

    },

    /**
    * Sets collision on a range of tiles where the tile IDs increment sequentially.
    * Calling this with a start value of 10 and a stop value of 14 would set collision for tiles 10, 11, 12, 13 and 14.
    * The `collides` parameter controls if collision will be enabled (true) or disabled (false).
    *
    * @method Phaser.Tilemap#setCollisionBetween
    * @param {number} start - The first index of the tile to be set for collision.
    * @param {number} stop - The last index of the tile to be set for collision.
    * @param {boolean} [collides=true] - If true it will enable collision. If false it will clear collision.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on. If not given will default to this.currentLayer.
    * @param {boolean} [recalculate=true] - Recalculates the tile faces after the update.
    */
    setCollisionBetween: function (start, stop, collides, layer, recalculate) {

        if (collides === undefined) { collides = true; }
        if (recalculate === undefined) { recalculate = true; }
        
        layer = this.getLayer(layer);

        if (start > stop)
        {
            return;
        }

        for (var index = start; index <= stop; index++)
        {
            this.setCollisionByIndex(index, collides, layer, false);
        }

        if (recalculate)
        {
            //  Now re-calculate interesting faces
            this.calculateFaces(layer);
        }

    },

    /**
    * Sets collision on all tiles in the given layer, except for the IDs of those in the given array.
    * The `collides` parameter controls if collision will be enabled (true) or disabled (false).
    *
    * @method Phaser.Tilemap#setCollisionByExclusion
    * @param {array} indexes - An array of the tile IDs to not be counted for collision.
    * @param {boolean} [collides=true] - If true it will enable collision. If false it will clear collision.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on. If not given will default to this.currentLayer.
    * @param {boolean} [recalculate=true] - Recalculates the tile faces after the update.
    */
    setCollisionByExclusion: function (indexes, collides, layer, recalculate) {

        if (collides === undefined) { collides = true; }
        if (recalculate === undefined) { recalculate = true; }
        
        layer = this.getLayer(layer);

        //  Collide everything, except the IDs given in the indexes array
        for (var i = 0, len = this.tiles.length; i < len; i++)
        {
            if (indexes.indexOf(i) === -1)
            {
                this.setCollisionByIndex(i, collides, layer, false);
            }
        }

        if (recalculate)
        {
            //  Now re-calculate interesting faces
            this.calculateFaces(layer);
        }

    },

    /**
    * Sets collision values on a tile in the set.
    * You shouldn't usually call this method directly, instead use setCollision, setCollisionBetween or setCollisionByExclusion.
    *
    * @method Phaser.Tilemap#setCollisionByIndex
    * @protected
    * @param {number} index - The index of the tile on the layer.
    * @param {boolean} [collides=true] - If true it will enable collision on the tile. If false it will clear collision values from the tile.
    * @param {number} [layer] - The layer to operate on. If not given will default to this.currentLayer.
    * @param {boolean} [recalculate=true] - Recalculates the tile faces after the update.
    */
    setCollisionByIndex: function (index, collides, layer, recalculate) {

        if (collides === undefined) { collides = true; }
        if (layer === undefined) { layer = this.currentLayer; }
        if (recalculate === undefined) { recalculate = true; }

        if (collides)
        {
            this.collideIndexes.push(index);
        }
        else
        {
            var i = this.collideIndexes.indexOf(index);

            if (i > -1)
            {
                this.collideIndexes.splice(i, 1);
            }
        }

        for (var y = 0; y < this.layers[layer].height; y++)
        {
            for (var x = 0; x < this.layers[layer].width; x++)
            {
                var tile = this.layers[layer].data[y][x];

                if (tile && tile.index === index)
                {
                    if (collides)
                    {
                        tile.setCollision(true, true, true, true);
                    }
                    else
                    {
                        tile.resetCollision();
                    }

                    tile.faceTop = collides;
                    tile.faceBottom = collides;
                    tile.faceLeft = collides;
                    tile.faceRight = collides;
                }
            }
        }

        if (recalculate)
        {
            //  Now re-calculate interesting faces
            this.calculateFaces(layer);
        }

        return layer;

    },

    /**
    * Gets the TilemapLayer index as used in the setCollision calls.
    *
    * @method Phaser.Tilemap#getLayer
    * @protected
    * @param {number|string|Phaser.TilemapLayer} layer - The layer to operate on. If not given will default to this.currentLayer.
    * @return {number} The TilemapLayer index.
    */
    getLayer: function (layer) {

        if (layer === undefined)
        {
            layer = this.currentLayer;
        }
        else if (typeof layer === 'string')
        {
            layer = this.getLayerIndex(layer);
        }
        else if (layer instanceof Phaser.TilemapLayer)
        {
            layer = layer.index;
        }

        return layer;

    },

    /**
    * Turn off/on the recalculation of faces for tile or collision updates. 
    * `setPreventRecalculate(true)` puts recalculation on hold while `setPreventRecalculate(false)` recalculates all the changed layers.
    *
    * @method Phaser.Tilemap#setPreventRecalculate
    * @param {boolean} value - If true it will put the recalculation on hold.
    */
    setPreventRecalculate: function (value) {

        if (value === true && this.preventingRecalculate !== true)
        {
            this.preventingRecalculate = true;
            this.needToRecalculate = {};
        }

        if (value === false && this.preventingRecalculate === true)
        {
            this.preventingRecalculate = false;

            for (var i in this.needToRecalculate)
            {
                this.calculateFaces(i);
            }

            this.needToRecalculate = false;
        }

    },

    /**
    * Internal function.
    *
    * @method Phaser.Tilemap#calculateFaces
    * @protected
    * @param {number} layer - The index of the TilemapLayer to operate on.
    */
    calculateFaces: function (layer) {

        if (this.preventingRecalculate)
        {
            this.needToRecalculate[layer] = true;
            return;
        }
        
        var above = null;
        var below = null;
        var left = null;
        var right = null;

        for (var y = 0, h = this.layers[layer].height; y < h; y++)
        {
            for (var x = 0, w = this.layers[layer].width; x < w; x++)
            {
                var tile = this.layers[layer].data[y][x];

                if (tile)
                {
                    above = this.getTileAbove(layer, x, y);
                    below = this.getTileBelow(layer, x, y);
                    left = this.getTileLeft(layer, x, y);
                    right = this.getTileRight(layer, x, y);

                    if (tile.collides)
                    {
                        tile.faceTop = true;
                        tile.faceBottom = true;
                        tile.faceLeft = true;
                        tile.faceRight = true;
                    }

                    if (above && above.collides)
                    {
                        //  There is a tile above this one that also collides, so the top of this tile is no longer interesting
                        tile.faceTop = false;
                    }

                    if (below && below.collides)
                    {
                        //  There is a tile below this one that also collides, so the bottom of this tile is no longer interesting
                        tile.faceBottom = false;
                    }

                    if (left && left.collides)
                    {
                        //  There is a tile left this one that also collides, so the left of this tile is no longer interesting
                        tile.faceLeft = false;
                    }

                    if (right && right.collides)
                    {
                        //  There is a tile right this one that also collides, so the right of this tile is no longer interesting
                        tile.faceRight = false;
                    }
                }
            }
        }

    },

    /**
    * Gets the tile above the tile coordinates given.
    * Mostly used as an internal function by calculateFaces.
    *
    * @method Phaser.Tilemap#getTileAbove
    * @param {number} layer - The local layer index to get the tile from. Can be determined by Tilemap.getLayer().
    * @param {number} x - The x coordinate to get the tile from. In tiles, not pixels.
    * @param {number} y - The y coordinate to get the tile from. In tiles, not pixels.
    */
    getTileAbove: function (layer, x, y) {

        if (y > 0)
        {
            return this.layers[layer].data[y - 1][x];
        }

        return null;

    },

    /**
    * Gets the tile below the tile coordinates given.
    * Mostly used as an internal function by calculateFaces.
    *
    * @method Phaser.Tilemap#getTileBelow
    * @param {number} layer - The local layer index to get the tile from. Can be determined by Tilemap.getLayer().
    * @param {number} x - The x coordinate to get the tile from. In tiles, not pixels.
    * @param {number} y - The y coordinate to get the tile from. In tiles, not pixels.
    */
    getTileBelow: function (layer, x, y) {

        if (y < this.layers[layer].height - 1)
        {
            return this.layers[layer].data[y + 1][x];
        }

        return null;

    },

    /**
    * Gets the tile to the left of the tile coordinates given.
    * Mostly used as an internal function by calculateFaces.
    *
    * @method Phaser.Tilemap#getTileLeft
    * @param {number} layer - The local layer index to get the tile from. Can be determined by Tilemap.getLayer().
    * @param {number} x - The x coordinate to get the tile from. In tiles, not pixels.
    * @param {number} y - The y coordinate to get the tile from. In tiles, not pixels.
    */
    getTileLeft: function (layer, x, y) {

        if (x > 0)
        {
            return this.layers[layer].data[y][x - 1];
        }

        return null;

    },

    /**
    * Gets the tile to the right of the tile coordinates given.
    * Mostly used as an internal function by calculateFaces.
    *
    * @method Phaser.Tilemap#getTileRight
    * @param {number} layer - The local layer index to get the tile from. Can be determined by Tilemap.getLayer().
    * @param {number} x - The x coordinate to get the tile from. In tiles, not pixels.
    * @param {number} y - The y coordinate to get the tile from. In tiles, not pixels.
    */
    getTileRight: function (layer, x, y) {

        if (x < this.layers[layer].width - 1)
        {
            return this.layers[layer].data[y][x + 1];
        }

        return null;

    },

    /**
    * Sets the current layer to the given index.
    *
    * @method Phaser.Tilemap#setLayer
    * @param {number|string|Phaser.TilemapLayer} layer - The layer to set as current.
    */
    setLayer: function (layer) {

        layer = this.getLayer(layer);

        if (this.layers[layer])
        {
            this.currentLayer = layer;
        }

    },

    /**
    * Checks if there is a tile at the given location.
    *
    * @method Phaser.Tilemap#hasTile
    * @param {number} x - X position to check if a tile exists at (given in tile units, not pixels)
    * @param {number} y - Y position to check if a tile exists at (given in tile units, not pixels)
    * @param {number|string|Phaser.TilemapLayer} layer - The layer to set as current.
    * @return {boolean} True if there is a tile at the given location, otherwise false.
    */
    hasTile: function (x, y, layer) {

        layer = this.getLayer(layer);

        if (this.layers[layer].data[y] === undefined || this.layers[layer].data[y][x] === undefined)
        {
            return false;
        }

        return (this.layers[layer].data[y][x].index > -1);

    },

    /**
    * Removes the tile located at the given coordinates and updates the collision data.
    *
    * @method Phaser.Tilemap#removeTile
    * @param {number} x - X position to place the tile (given in tile units, not pixels)
    * @param {number} y - Y position to place the tile (given in tile units, not pixels)
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to modify.
    * @return {Phaser.Tile} The Tile object that was removed from this map.
    */
    removeTile: function (x, y, layer) {

        layer = this.getLayer(layer);

        if (x >= 0 && x < this.layers[layer].width && y >= 0 && y < this.layers[layer].height)
        {
            if (this.hasTile(x, y, layer))
            {
                var tile = this.layers[layer].data[y][x];

                this.layers[layer].data[y][x] = new Phaser.Tile(this.layers[layer], -1, x, y, this.tileWidth, this.tileHeight);

                this.layers[layer].dirty = true;

                this.calculateFaces(layer);

                return tile;
            }
        }

    },

    /**
    * Removes the tile located at the given coordinates and updates the collision data. The coordinates are given in pixel values.
    *
    * @method Phaser.Tilemap#removeTileWorldXY
    * @param {number} x - X position to insert the tile (given in pixels)
    * @param {number} y - Y position to insert the tile (given in pixels)
    * @param {number} tileWidth - The width of the tile in pixels.
    * @param {number} tileHeight - The height of the tile in pixels.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to modify.
    * @return {Phaser.Tile} The Tile object that was removed from this map.
    */
    removeTileWorldXY: function (x, y, tileWidth, tileHeight, layer) {

        layer = this.getLayer(layer);

        x = this.game.math.snapToFloor(x, tileWidth) / tileWidth;
        y = this.game.math.snapToFloor(y, tileHeight) / tileHeight;

        return this.removeTile(x, y, layer);

    },

    /**
    * Puts a tile of the given index value at the coordinate specified.
    * If you pass `null` as the tile it will pass your call over to Tilemap.removeTile instead.
    *
    * @method Phaser.Tilemap#putTile
    * @param {Phaser.Tile|number|null} tile - The index of this tile to set or a Phaser.Tile object. If null the tile is removed from the map.
    * @param {number} x - X position to place the tile (given in tile units, not pixels)
    * @param {number} y - Y position to place the tile (given in tile units, not pixels)
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to modify.
    * @return {Phaser.Tile} The Tile object that was created or added to this map.
    */
    putTile: function (tile, x, y, layer) {

        if (tile === null)
        {
            return this.removeTile(x, y, layer);
        }

        layer = this.getLayer(layer);

        if (x >= 0 && x < this.layers[layer].width && y >= 0 && y < this.layers[layer].height)
        {
            var index;

            if (tile instanceof Phaser.Tile)
            {
                index = tile.index;

                if (this.hasTile(x, y, layer))
                {
                    this.layers[layer].data[y][x].copy(tile);
                }
                else
                {
                    this.layers[layer].data[y][x] = new Phaser.Tile(layer, index, x, y, tile.width, tile.height);
                }
            }
            else
            {
                index = tile;

                if (this.hasTile(x, y, layer))
                {
                    this.layers[layer].data[y][x].index = index;
                }
                else
                {
                    this.layers[layer].data[y][x] = new Phaser.Tile(this.layers[layer], index, x, y, this.tileWidth, this.tileHeight);
                }
            }

            if (this.collideIndexes.indexOf(index) > -1)
            {
                this.layers[layer].data[y][x].setCollision(true, true, true, true);
            }
            else
            {
                this.layers[layer].data[y][x].resetCollision();
            }

            this.layers[layer].dirty = true;

            this.calculateFaces(layer);

            return this.layers[layer].data[y][x];
        }

        return null;

    },

    /**
    * Puts a tile into the Tilemap layer. The coordinates are given in pixel values.
    *
    * @method Phaser.Tilemap#putTileWorldXY
    * @param {Phaser.Tile|number} tile - The index of this tile to set or a Phaser.Tile object.
    * @param {number} x - X position to insert the tile (given in pixels)
    * @param {number} y - Y position to insert the tile (given in pixels)
    * @param {number} tileWidth - The width of the tile in pixels.
    * @param {number} tileHeight - The height of the tile in pixels.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to modify.
    * @return {Phaser.Tile} The Tile object that was created or added to this map.
    */
    putTileWorldXY: function (tile, x, y, tileWidth, tileHeight, layer) {

        layer = this.getLayer(layer);

        x = this.game.math.snapToFloor(x, tileWidth) / tileWidth;
        y = this.game.math.snapToFloor(y, tileHeight) / tileHeight;

        return this.putTile(tile, x, y, layer);

    },

    /**
    * Searches the entire map layer for the first tile matching the given index, then returns that Phaser.Tile object.
    * If no match is found it returns null.
    * The search starts from the top-left tile and continues horizontally until it hits the end of the row, then it drops down to the next column.
    * If the reverse boolean is true, it scans starting from the bottom-right corner traveling up to the top-left.
    *
    * @method Phaser.Tilemap#searchTileIndex
    * @param {number} index - The tile index value to search for.
    * @param {number} [skip=0] - The number of times to skip a matching tile before returning.
    * @param {number} [reverse=false] - If true it will scan the layer in reverse, starting at the bottom-right. Otherwise it scans from the top-left.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to get the tile from.
    * @return {Phaser.Tile} The first (or n skipped) tile with the matching index.
    */
    searchTileIndex: function (index, skip, reverse, layer) {

        if (skip === undefined) { skip = 0; }
        if (reverse === undefined) { reverse = false; }

        layer = this.getLayer(layer);

        var c = 0;

        if (reverse)
        {
            for (var y = this.layers[layer].height - 1; y >= 0; y--)
            {
                for (var x = this.layers[layer].width - 1; x >= 0; x--)
                {
                    if (this.layers[layer].data[y][x].index === index)
                    {
                        if (c === skip)
                        {
                            return this.layers[layer].data[y][x];
                        }
                        else
                        {
                            c++;
                        }
                    }
                }
            }
        }
        else
        {
            for (var y = 0; y < this.layers[layer].height; y++)
            {
                for (var x = 0; x < this.layers[layer].width; x++)
                {
                    if (this.layers[layer].data[y][x].index === index)
                    {
                        if (c === skip)
                        {
                            return this.layers[layer].data[y][x];
                        }
                        else
                        {
                            c++;
                        }
                    }
                }
            }
        }

        return null;

    },

    /**
    * Gets a tile from the Tilemap Layer. The coordinates are given in tile values.
    *
    * @method Phaser.Tilemap#getTile
    * @param {number} x - X position to get the tile from (given in tile units, not pixels)
    * @param {number} y - Y position to get the tile from (given in tile units, not pixels)
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to get the tile from.
    * @param {boolean} [nonNull=false] - If true getTile won't return null for empty tiles, but a Tile object with an index of -1.
    * @return {Phaser.Tile} The tile at the given coordinates or null if no tile was found or the coordinates were invalid.
    */
    getTile: function (x, y, layer, nonNull) {

        if (nonNull === undefined) { nonNull = false; }

        layer = this.getLayer(layer);

        if (x >= 0 && x < this.layers[layer].width && y >= 0 && y < this.layers[layer].height)
        {
            if (this.layers[layer].data[y][x].index === -1)
            {
                if (nonNull)
                {
                    return this.layers[layer].data[y][x];
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return this.layers[layer].data[y][x];
            }
        }
        else
        {
            return null;
        }

    },

    /**
    * Gets a tile from the Tilemap layer. The coordinates are given in pixel values.
    *
    * @method Phaser.Tilemap#getTileWorldXY
    * @param {number} x - X position to get the tile from (given in pixels)
    * @param {number} y - Y position to get the tile from (given in pixels)
    * @param {number} [tileWidth] - The width of the tiles. If not given the map default is used.
    * @param {number} [tileHeight] - The height of the tiles. If not given the map default is used.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to get the tile from.
    * @param {boolean} [nonNull=false] - If true getTile won't return null for empty tiles, but a Tile object with an index of -1.
    * @return {Phaser.Tile} The tile at the given coordinates.
    */
    getTileWorldXY: function (x, y, tileWidth, tileHeight, layer, nonNull) {

        if (tileWidth === undefined) { tileWidth = this.tileWidth; }
        if (tileHeight === undefined) { tileHeight = this.tileHeight; }

        layer = this.getLayer(layer);

        x = this.game.math.snapToFloor(x, tileWidth) / tileWidth;
        y = this.game.math.snapToFloor(y, tileHeight) / tileHeight;

        return this.getTile(x, y, layer, nonNull);

    },

    /**
    * Copies all of the tiles in the given rectangular block into the tilemap data buffer.
    *
    * @method Phaser.Tilemap#copy
    * @param {integer} x - X position of the top left of the area to copy (given in tiles, not pixels)
    * @param {integer} y - Y position of the top left of the area to copy (given in tiles, not pixels)
    * @param {integer} width - The width of the area to copy (given in tiles, not pixels)
    * @param {integer} height - The height of the area to copy (given in tiles, not pixels)
    * @param {integer|string|Phaser.TilemapLayer} [layer] - The layer to copy the tiles from.
    * @return {array} An array of the tiles that were copied.
    */
    copy: function (x, y, width, height, layer) {

        layer = this.getLayer(layer);

        if (!this.layers[layer])
        {
            this._results.length = 0;
            return;
        }

        if (x === undefined) { x = 0; }
        if (y === undefined) { y = 0; }
        if (width === undefined) { width = this.layers[layer].width; }
        if (height === undefined) { height = this.layers[layer].height; }
        
        if (x < 0)
        {
            x = 0;
        }

        if (y < 0)
        {
            y = 0;
        }

        if (width > this.layers[layer].width)
        {
            width = this.layers[layer].width;
        }

        if (height > this.layers[layer].height)
        {
            height = this.layers[layer].height;
        }

        this._results.length = 0;

        this._results.push({ x: x, y: y, width: width, height: height, layer: layer });

        for (var ty = y; ty < y + height; ty++)
        {
            for (var tx = x; tx < x + width; tx++)
            {
                this._results.push(this.layers[layer].data[ty][tx]);
            }
        }

        return this._results;

    },

    /**
    * Pastes a previously copied block of tile data into the given x/y coordinates. Data should have been prepared with Tilemap.copy.
    *
    * @method Phaser.Tilemap#paste
    * @param {number} x - X position of the top left of the area to paste to (given in tiles, not pixels)
    * @param {number} y - Y position of the top left of the area to paste to (given in tiles, not pixels)
    * @param {array} tileblock - The block of tiles to paste.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to paste the tiles into.
    */
    paste: function (x, y, tileblock, layer) {

        if (x === undefined) { x = 0; }
        if (y === undefined) { y = 0; }

        layer = this.getLayer(layer);

        if (!tileblock || tileblock.length < 2)
        {
            return;
        }

        //  Find out the difference between tileblock[1].x/y and x/y and use it as an offset, as it's the top left of the block to paste
        var diffX = x - tileblock[1].x;
        var diffY = y - tileblock[1].y;

        for (var i = 1; i < tileblock.length; i++)
        {
            this.layers[layer].data[ diffY + tileblock[i].y ][ diffX + tileblock[i].x ].copy(tileblock[i]);
        }

		this.layers[layer].dirty = true;
        this.calculateFaces(layer);

    },

    /**
    * Scans the given area for tiles with an index matching tileA and swaps them with tileB.
    *
    * @method Phaser.Tilemap#swap
    * @param {number} tileA - First tile index.
    * @param {number} tileB - Second tile index.
    * @param {number} x - X position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} y - Y position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} width - The width in tiles of the area to operate on.
    * @param {number} height - The height in tiles of the area to operate on.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on.
    */
    swap: function (tileA, tileB, x, y, width, height, layer) {

        layer = this.getLayer(layer);

        this.copy(x, y, width, height, layer);

        if (this._results.length < 2)
        {
            return;
        }

        this._tempA = tileA;
        this._tempB = tileB;

        this._results.forEach(this.swapHandler, this);

        this.paste(x, y, this._results, layer);

    },

    /**
    * Internal function that handles the swapping of tiles.
    *
    * @method Phaser.Tilemap#swapHandler
    * @private
    * @param {number} value
    */
    swapHandler: function (value) {

        if (value.index === this._tempA)
        {
            //  Swap A with B
            value.index = this._tempB;
        }
        else if (value.index === this._tempB)
        {
            //  Swap B with A
            value.index = this._tempA;
        }

    },

    /**
    * For each tile in the given area defined by x/y and width/height run the given callback.
    *
    * @method Phaser.Tilemap#forEach
    * @param {number} callback - The callback. Each tile in the given area will be passed to this callback as the first and only parameter.
    * @param {number} context - The context under which the callback should be run.
    * @param {number} x - X position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} y - Y position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} width - The width in tiles of the area to operate on.
    * @param {number} height - The height in tiles of the area to operate on.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on.
    */
    forEach: function (callback, context, x, y, width, height, layer) {

        layer = this.getLayer(layer);

        this.copy(x, y, width, height, layer);

        if (this._results.length < 2)
        {
            return;
        }

        this._results.forEach(callback, context);

        this.paste(x, y, this._results, layer);

    },

    /**
    * Scans the given area for tiles with an index matching `source` and updates their index to match `dest`.
    *
    * @method Phaser.Tilemap#replace
    * @param {number} source - The tile index value to scan for.
    * @param {number} dest - The tile index value to replace found tiles with.
    * @param {number} x - X position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} y - Y position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} width - The width in tiles of the area to operate on.
    * @param {number} height - The height in tiles of the area to operate on.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on.
    */
    replace: function (source, dest, x, y, width, height, layer) {

        layer = this.getLayer(layer);

        this.copy(x, y, width, height, layer);

        if (this._results.length < 2)
        {
            return;
        }

        for (var i = 1; i < this._results.length; i++)
        {
            if (this._results[i].index === source)
            {
                this._results[i].index = dest;
            }
        }

        this.paste(x, y, this._results, layer);

    },

    /**
    * Randomises a set of tiles in a given area.
    *
    * @method Phaser.Tilemap#random
    * @param {number} x - X position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} y - Y position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} width - The width in tiles of the area to operate on.
    * @param {number} height - The height in tiles of the area to operate on.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on.
    */
    random: function (x, y, width, height, layer) {

        layer = this.getLayer(layer);

        this.copy(x, y, width, height, layer);

        if (this._results.length < 2)
        {
            return;
        }

        var indexes = [];

        for (var t = 1; t < this._results.length; t++)
        {
            if (this._results[t].index)
            {
                var idx = this._results[t].index;

                if (indexes.indexOf(idx) === -1)
                {
                    indexes.push(idx);
                }
            }
        }

        for (var i = 1; i < this._results.length; i++)
        {
            this._results[i].index = this.game.rnd.pick(indexes);
        }

        this.paste(x, y, this._results, layer);

    },

    /**
    * Shuffles a set of tiles in a given area. It will only randomise the tiles in that area, so if they're all the same nothing will appear to have changed!
    *
    * @method Phaser.Tilemap#shuffle
    * @param {number} x - X position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} y - Y position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} width - The width in tiles of the area to operate on.
    * @param {number} height - The height in tiles of the area to operate on.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on.
    */
    shuffle: function (x, y, width, height, layer) {

        layer = this.getLayer(layer);

        this.copy(x, y, width, height, layer);

        if (this._results.length < 2)
        {
            return;
        }

        var indexes = [];

        for (var t = 1; t < this._results.length; t++)
        {
            if (this._results[t].index)
            {
                indexes.push(this._results[t].index);
            }
        }

        Phaser.ArrayUtils.shuffle(indexes);

        for (var i = 1; i < this._results.length; i++)
        {
            this._results[i].index = indexes[i - 1];
        }

        this.paste(x, y, this._results, layer);

    },

    /**
    * Fills the given area with the specified tile.
    *
    * @method Phaser.Tilemap#fill
    * @param {number} index - The index of the tile that the area will be filled with.
    * @param {number} x - X position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} y - Y position of the top left of the area to operate one, given in tiles, not pixels.
    * @param {number} width - The width in tiles of the area to operate on.
    * @param {number} height - The height in tiles of the area to operate on.
    * @param {number|string|Phaser.TilemapLayer} [layer] - The layer to operate on.
    */
    fill: function (index, x, y, width, height, layer) {

        layer = this.getLayer(layer);

        this.copy(x, y, width, height, layer);

        if (this._results.length < 2)
        {
            return;
        }

        for (var i = 1; i < this._results.length; i++)
        {
            this._results[i].index = index;
        }

        this.paste(x, y, this._results, layer);

    },

    /**
    * Removes all layers from this tile map.
    *
    * @method Phaser.Tilemap#removeAllLayers
    */
    removeAllLayers: function () {

        this.layers.length = 0;
        this.currentLayer = 0;

    },

    /**
    * Dumps the tilemap data out to the console.
    *
    * @method Phaser.Tilemap#dump
    */
    dump: function () {

        var txt = '';
        var args = [''];

        for (var y = 0; y < this.layers[this.currentLayer].height; y++)
        {
            for (var x = 0; x < this.layers[this.currentLayer].width; x++)
            {
                txt += "%c  ";

                if (this.layers[this.currentLayer].data[y][x] > 1)
                {
                    if (this.debugMap[this.layers[this.currentLayer].data[y][x]])
                    {
                        args.push("background: " + this.debugMap[this.layers[this.currentLayer].data[y][x]]);
                    }
                    else
                    {
                        args.push("background: #ffffff");
                    }
                }
                else
                {
                    args.push("background: rgb(0, 0, 0)");
                }
            }

            txt += "\n";
        }

        args[0] = txt;
        console.log.apply(console, args);

    },

    /**
    * Removes all layer data from this tile map and nulls the game reference.
    * Note: You are responsible for destroying any TilemapLayer objects you generated yourself, as Tilemap doesn't keep a reference to them.
    *
    * @method Phaser.Tilemap#destroy
    */
    destroy: function () {

        this.removeAllLayers();
        this.data = [];
        this.game = null;

    }

};

Phaser.Tilemap.prototype.constructor = Phaser.Tilemap;

/**
* @name Phaser.Tilemap#layer
* @property {number|string|Phaser.TilemapLayer} layer - The current layer object.
*/
Object.defineProperty(Phaser.Tilemap.prototype, "layer", {

    get: function () {

        return this.layers[this.currentLayer];

    },

    set: function (value) {

        if (value !== this.currentLayer)
        {
            this.setLayer(value);
        }

    }

});
