import PIXI from './pixi-wx.js';
import Phaser from './phaser-wx-main.js';
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Input Handler is bound to a specific Sprite and is responsible for managing all Input events on that Sprite.
*
* @class Phaser.InputHandler
* @constructor
* @param {Phaser.Sprite} sprite - The Sprite object to which this Input Handler belongs.
*/
Phaser.InputHandler = function (sprite) {

    /**
    * @property {Phaser.Sprite} sprite - The Sprite object to which this Input Handler belongs.
    */
    this.sprite = sprite;

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = sprite.game;

    /**
    * @property {boolean} enabled - If enabled the Input Handler will process input requests and monitor pointer activity.
    * @default
    */
    this.enabled = false;

    /**
    * @property {boolean} checked - A disposable flag used by the Pointer class when performing priority checks.
    * @protected
    */
    this.checked = false;

    /**
    * The priorityID is used to determine which game objects should get priority when input events occur. For example if you have
    * several Sprites that overlap, by default the one at the top of the display list is given priority for input events. You can
    * stop this from happening by controlling the priorityID value. The higher the value, the more important they are considered to the Input events.
    * @property {number} priorityID
    * @default
    */
    this.priorityID = 0;

    /**
    * @property {boolean} useHandCursor - On a desktop browser you can set the 'hand' cursor to appear when moving over the Sprite.
    * @default
    */
    this.useHandCursor = false;

    /**
    * @property {boolean} _setHandCursor - Did this Sprite trigger the hand cursor?
    * @private
    */
    this._setHandCursor = false;

    /**
    * @property {boolean} isDragged - true if the Sprite is being currently dragged.
    * @default
    */
    this.isDragged = false;

    /**
    * @property {boolean} allowHorizontalDrag - Controls if the Sprite is allowed to be dragged horizontally.
    * @default
    */
    this.allowHorizontalDrag = true;

    /**
    * @property {boolean} allowVerticalDrag - Controls if the Sprite is allowed to be dragged vertically.
    * @default
    */
    this.allowVerticalDrag = true;

    /**
    * @property {boolean} bringToTop - If true when this Sprite is clicked or dragged it will automatically be bought to the top of the Group it is within.
    * @default
    */
    this.bringToTop = false;

    /**
    * @property {Phaser.Point} snapOffset - A Point object that contains by how far the Sprite snap is offset.
    * @default
    */
    this.snapOffset = null;

    /**
    * @property {boolean} snapOnDrag - When the Sprite is dragged this controls if the center of the Sprite will snap to the pointer on drag or not.
    * @default
    */
    this.snapOnDrag = false;

    /**
    * @property {boolean} snapOnRelease - When the Sprite is dragged this controls if the Sprite will be snapped on release.
    * @default
    */
    this.snapOnRelease = false;

    /**
    * @property {number} snapX - When a Sprite has snapping enabled this holds the width of the snap grid.
    * @default
    */
    this.snapX = 0;

    /**
    * @property {number} snapY - When a Sprite has snapping enabled this holds the height of the snap grid.
    * @default
    */
    this.snapY = 0;

    /**
    * @property {number} snapOffsetX - This defines the top-left X coordinate of the snap grid.
    * @default
    */
    this.snapOffsetX = 0;

    /**
    * @property {number} snapOffsetY - This defines the top-left Y coordinate of the snap grid..
    * @default
    */
    this.snapOffsetY = 0;

    /**
    * Set to true to use pixel perfect hit detection when checking if the pointer is over this Sprite.
    * The x/y coordinates of the pointer are tested against the image in combination with the InputHandler.pixelPerfectAlpha value.
    * This feature only works for display objects with image based textures such as Sprites. It won't work on BitmapText or Rope.
    * Warning: This is expensive, especially on mobile (where it's not even needed!) so only enable if required. Also see the less-expensive InputHandler.pixelPerfectClick.
    * @property {boolean} pixelPerfectOver - Use a pixel perfect check when testing for pointer over.
    * @default
    */
    this.pixelPerfectOver = false;

    /**
    * Set to true to use pixel perfect hit detection when checking if the pointer is over this Sprite when it's clicked or touched.
    * The x/y coordinates of the pointer are tested against the image in combination with the InputHandler.pixelPerfectAlpha value.
    * This feature only works for display objects with image based textures such as Sprites. It won't work on BitmapText or Rope.
    * Warning: This is expensive so only enable if you really need it.
    * @property {boolean} pixelPerfectClick - Use a pixel perfect check when testing for clicks or touches on the Sprite.
    * @default
    */
    this.pixelPerfectClick = false;

    /**
    * @property {number} pixelPerfectAlpha - The alpha tolerance threshold. If the alpha value of the pixel matches or is above this value, it's considered a hit.
    * @default
    */
    this.pixelPerfectAlpha = 255;

    /**
    * @property {boolean} draggable - Is this sprite allowed to be dragged by the mouse? true = yes, false = no
    * @default
    */
    this.draggable = false;

    /**
    * @property {Phaser.Rectangle} boundsRect - A region of the game world within which the sprite is restricted during drag.
    * @default
    */
    this.boundsRect = null;

    /**
    * @property {Phaser.Sprite} boundsSprite - A Sprite the bounds of which this sprite is restricted during drag.
    * @default
    */
    this.boundsSprite = null;

    /**
    * @property {boolean} scaleLayer - EXPERIMENTAL: Please do not use this property unless you know what it does. Likely to change in the future.
    */
    this.scaleLayer = false;

    /**
    * @property {Phaser.Point} dragOffset - The offset from the Sprites position that dragging takes place from.
    */
    this.dragOffset = new Phaser.Point();

    /**
    * @property {boolean} dragFromCenter - Is the Sprite dragged from its center, or the point at which the Pointer was pressed down upon it?
    */
    this.dragFromCenter = false;

    /**
    * @property {boolean} dragStopBlocksInputUp - If enabled, when the Sprite stops being dragged, it will only dispatch the `onDragStop` event, and not the `onInputUp` event. If set to `false` it will dispatch both events.
    */
    this.dragStopBlocksInputUp = false;

    /**
    * @property {Phaser.Point} dragStartPoint - The Point from which the most recent drag started from. Useful if you need to return an object to its starting position.
    */
    this.dragStartPoint = new Phaser.Point();

    /**
    * @property {integer} dragDistanceThreshold - The distance, in pixels, the pointer has to move while being held down, before the Sprite thinks it is being dragged.
    */
    this.dragDistanceThreshold = 0;

    /**
    * @property {integer} dragTimeThreshold - The amount of time, in ms, the pointer has to be held down over the Sprite before it thinks it is being dragged.
    */
    this.dragTimeThreshold = 0;

    /**
    * @property {Phaser.Point} downPoint - A Point object containing the coordinates of the Pointer when it was first pressed down onto this Sprite.
    */
    this.downPoint = new Phaser.Point();

    /**
    * @property {Phaser.Point} snapPoint - If the sprite is set to snap while dragging this holds the point of the most recent 'snap' event.
    */
    this.snapPoint = new Phaser.Point();

    /**
    * @property {Phaser.Point} _dragPoint - Internal cache var.
    * @private
    */
    this._dragPoint = new Phaser.Point();

    /**
    * @property {boolean} _dragPhase - Internal cache var.
    * @private
    */
    this._dragPhase = false;

    /**
    * @property {boolean} _pendingDrag - Internal cache var.
    * @private
    */
    this._pendingDrag = false;

    /**
    * @property {boolean} _dragTimePass - Internal cache var.
    * @private
    */
    this._dragTimePass = false;

    /**
    * @property {boolean} _dragDistancePass - Internal cache var.
    * @private
    */
    this._dragDistancePass = false;

    /**
    * @property {boolean} _wasEnabled - Internal cache var.
    * @private
    */
    this._wasEnabled = false;

    /**
    * @property {Phaser.Point} _tempPoint - Internal cache var.
    * @private
    */
    this._tempPoint = new Phaser.Point();

    /**
    * @property {array} _pointerData - Internal cache var.
    * @private
    */
    this._pointerData = [];

    this._pointerData.push({
        id: 0,
        x: 0,
        y: 0,
        camX: 0,
        camY: 0,
        isDown: false,
        isUp: false,
        isOver: false,
        isOut: false,
        timeOver: 0,
        timeOut: 0,
        timeDown: 0,
        timeUp: 0,
        downDuration: 0,
        isDragged: false
    });

};

Phaser.InputHandler.prototype = {

    /**
    * Starts the Input Handler running. This is called automatically when you enable input on a Sprite, or can be called directly if you need to set a specific priority.
    * 
    * @method Phaser.InputHandler#start
    * @param {number} [priority=0] - Higher priority sprites take click priority over low-priority sprites when they are stacked on-top of each other.
    * @param {boolean} [useHandCursor=false] - If true the Sprite will show the hand cursor on mouse-over (doesn't apply to mobile browsers)
    * @return {Phaser.Sprite} The Sprite object to which the Input Handler is bound.
    */
    start: function (priority, useHandCursor) {

        priority = priority || 0;
        if (useHandCursor === undefined) { useHandCursor = false; }

        //  Turning on
        if (this.enabled === false)
        {
            //  Register, etc
            this.game.input.interactiveItems.add(this);
            this.useHandCursor = useHandCursor;
            this.priorityID = priority;

            for (var i = 0; i < 10; i++)
            {
                this._pointerData[i] = {
                    id: i,
                    x: 0,
                    y: 0,
                    isDown: false,
                    isUp: false,
                    isOver: false,
                    isOut: false,
                    timeOver: 0,
                    timeOut: 0,
                    timeDown: 0,
                    timeUp: 0,
                    downDuration: 0,
                    isDragged: false
                };
            }

            this.snapOffset = new Phaser.Point();
            this.enabled = true;
            this._wasEnabled = true;

        }

        this.sprite.events.onAddedToGroup.add(this.addedToGroup, this);
        this.sprite.events.onRemovedFromGroup.add(this.removedFromGroup, this);

        return this.sprite;

    },

    /**
    * Handles when the parent Sprite is added to a new Group.
    *
    * @method Phaser.InputHandler#addedToGroup
    * @private
    */
    addedToGroup: function () {

        if (this._dragPhase)
        {
            return;
        }

        if (this._wasEnabled && !this.enabled)
        {
            this.start();
        }

    },

    /**
    * Handles when the parent Sprite is removed from a Group.
    *
    * @method Phaser.InputHandler#removedFromGroup
    * @private
    */
    removedFromGroup: function () {

        if (this._dragPhase)
        {
            return;
        }

        if (this.enabled)
        {
            this._wasEnabled = true;
            this.stop();
        }
        else
        {
            this._wasEnabled = false;
        }

    },

    /**
    * Resets the Input Handler and disables it.
    * @method Phaser.InputHandler#reset
    */
    reset: function () {

        this.enabled = false;

        for (var i = 0; i < 10; i++)
        {
            this._pointerData[i] = {
                id: i,
                x: 0,
                y: 0,
                isDown: false,
                isUp: false,
                isOver: false,
                isOut: false,
                timeOver: 0,
                timeOut: 0,
                timeDown: 0,
                timeUp: 0,
                downDuration: 0,
                isDragged: false
            };
        }
    },

    /**
    * Stops the Input Handler from running.
    * @method Phaser.InputHandler#stop
    */
    stop: function () {

        //  Turning off
        if (this.enabled === false)
        {
            return;
        }
        else
        {
            //  De-register, etc
            this.enabled = false;
            this.game.input.interactiveItems.remove(this);
        }

    },

    /**
    * Clean up memory.
    * @method Phaser.InputHandler#destroy
    */
    destroy: function () {

        if (this.sprite)
        {
            if (this._setHandCursor)
            {
                this.game.canvas.style.cursor = "default";
                this._setHandCursor = false;
            }

            this.enabled = false;

            this.game.input.interactiveItems.remove(this);

            this._pointerData.length = 0;
            this.boundsRect = null;
            this.boundsSprite = null;
            this.sprite = null;
        }

    },

    /**
    * Checks if the object this InputHandler is bound to is valid for consideration in the Pointer move event.
    * This is called by Phaser.Pointer and shouldn't typically be called directly.
    *
    * @method Phaser.InputHandler#validForInput
    * @protected
    * @param {number} highestID - The highest ID currently processed by the Pointer.
    * @param {number} highestRenderID - The highest Render Order ID currently processed by the Pointer.
    * @param {boolean} [includePixelPerfect=true] - If this object has `pixelPerfectClick` or `pixelPerfectOver` set should it be considered as valid?
    * @return {boolean} True if the object this InputHandler is bound to should be considered as valid for input detection.
    */
    validForInput: function (highestID, highestRenderID, includePixelPerfect) {

        if (includePixelPerfect === undefined) { includePixelPerfect = true; }

        if (!this.enabled ||
            this.sprite.scale.x === 0 ||
            this.sprite.scale.y === 0 ||
            this.priorityID < this.game.input.minPriorityID ||
            (this.sprite.parent && this.sprite.parent.ignoreChildInput))
        {
            return false;
        }

        //   If we're trying to specifically IGNORE pixel perfect objects, then set includePixelPerfect to false and skip it
        if (!includePixelPerfect && (this.pixelPerfectClick || this.pixelPerfectOver))
        {
            return false;
        }

        if (this.priorityID > highestID || (this.priorityID === highestID && this.sprite.renderOrderID > highestRenderID))
        {
            return true;
        }

        return false;

    },

    /**
    * Is this object using pixel perfect checking?
    *
    * @method Phaser.InputHandler#isPixelPerfect
    * @return {boolean} True if the this InputHandler has either `pixelPerfectClick` or `pixelPerfectOver` set to `true`.
    */
    isPixelPerfect: function () {

        return (this.pixelPerfectClick || this.pixelPerfectOver);

    },

    /**
    * The x coordinate of the Input pointer, relative to the top-left of the parent Sprite.
    * This value is only set when the pointer is over this Sprite.
    *
    * @method Phaser.InputHandler#pointerX
    * @param {integer} [pointerId=0]
    * @return {number} The x coordinate of the Input pointer.
    */
    pointerX: function (pointerId) {

        pointerId = pointerId || 0;

        return this._pointerData[pointerId].x;

    },

    /**
    * The y coordinate of the Input pointer, relative to the top-left of the parent Sprite
    * This value is only set when the pointer is over this Sprite.
    *
    * @method Phaser.InputHandler#pointerY
    * @param {integer} [pointerId=0]
    * @return {number} The y coordinate of the Input pointer.
    */
    pointerY: function (pointerId) {

        pointerId = pointerId || 0;

        return this._pointerData[pointerId].y;

    },

    /**
    * If the Pointer is down this returns true.
    * This *only* checks if the Pointer is down, not if it's down over any specific Sprite.
    *
    * @method Phaser.InputHandler#pointerDown
    * @param {integer} [pointerId=0]
    * @return {boolean} - True if the given pointer is down, otherwise false.
    */
    pointerDown: function (pointerId) {

        pointerId = pointerId || 0;

        return this._pointerData[pointerId].isDown;

    },

    /**
    * If the Pointer is up this returns true.
    * This *only* checks if the Pointer is up, not if it's up over any specific Sprite.
    *
    * @method Phaser.InputHandler#pointerUp
    * @param {integer} [pointerId=0]
    * @return {boolean} - True if the given pointer is up, otherwise false.
    */
    pointerUp: function (pointerId) {

        pointerId = pointerId || 0;

        return this._pointerData[pointerId].isUp;

    },

    /**
    * A timestamp representing when the Pointer first touched the touchscreen.
    *
    * @method Phaser.InputHandler#pointerTimeDown
    * @param {integer} [pointerId=(check all)]
    * @return {number}
    */
    pointerTimeDown: function (pointerId) {

        pointerId = pointerId || 0;

        return this._pointerData[pointerId].timeDown;

    },

    /**
    * A timestamp representing when the Pointer left the touchscreen.
    *
    * @method Phaser.InputHandler#pointerTimeUp
    * @param {integer} [pointerId=0]
    * @return {number}
    */
    pointerTimeUp: function (pointerId) {

        pointerId = pointerId || 0;

        return this._pointerData[pointerId].timeUp;

    },

    /**
    * Is the Pointer over this Sprite?
    *
    * @method Phaser.InputHandler#pointerOver
    * @param {integer} [pointerId=(check all)] The ID number of a Pointer to check. If you don't provide a number it will check all Pointers.
    * @return {boolean} - True if the given pointer (if a index was given, or any pointer if not) is over this object.
    */
    pointerOver: function (pointerId) {

        if (!this.enabled)
        {
            return false;
        }

        if (pointerId === undefined)
        {
            for (var i = 0; i < 10; i++)
            {
                if (this._pointerData[i].isOver)
                {
                    return true;
                }
            }

            return false;
        }
        else
        {
            return this._pointerData[pointerId].isOver;
        }

    },

    /**
    * Is the Pointer outside of this Sprite?
    *
    * @method Phaser.InputHandler#pointerOut
    * @param {integer} [pointerId=(check all)] The ID number of a Pointer to check. If you don't provide a number it will check all Pointers.
    * @return {boolean} True if the given pointer (if a index was given, or any pointer if not) is out of this object.
    */
    pointerOut: function (pointerId) {

        if (!this.enabled)
        {
            return false;
        }

        if (pointerId === undefined)
        {
            for (var i = 0; i < 10; i++)
            {
                if (this._pointerData[i].isOut)
                {
                    return true;
                }
            }
        }
        else
        {
            return this._pointerData[pointerId].isOut;
        }

    },

    /**
    * A timestamp representing when the Pointer first touched the touchscreen.
    *
    * @method Phaser.InputHandler#pointerTimeOver
    * @param {integer} [pointerId=0]
    * @return {number}
    */
    pointerTimeOver: function (pointerId) {

        pointerId = pointerId || 0;

        return this._pointerData[pointerId].timeOver;

    },

    /**
    * A timestamp representing when the Pointer left the touchscreen.
    *
    * @method Phaser.InputHandler#pointerTimeOut
    * @param {integer} [pointerId=0]
    * @return {number}
    */
    pointerTimeOut: function (pointerId) {

        pointerId = pointerId || 0;

        return this._pointerData[pointerId].timeOut;

    },

    /**
    * Is this sprite being dragged by the mouse or not?
    *
    * @method Phaser.InputHandler#pointerDragged
    * @param {integer} [pointerId=0]
    * @return {boolean} True if the pointer is dragging an object, otherwise false.
    */
    pointerDragged: function (pointerId) {

        pointerId = pointerId || 0;

        return this._pointerData[pointerId].isDragged;

    },

    /**
    * Checks if the given pointer is both down and over the Sprite this InputHandler belongs to.
    * Use the `fastTest` flag is to quickly check just the bounding hit area even if `InputHandler.pixelPerfectOver` is `true`.
    *
    * @method Phaser.InputHandler#checkPointerDown
    * @param {Phaser.Pointer} pointer
    * @param {boolean} [fastTest=false] - Force a simple hit area check even if `pixelPerfectOver` is true for this object?
    * @return {boolean} True if the pointer is down, otherwise false.
    */
    checkPointerDown: function (pointer, fastTest) {

        if (!pointer.isDown ||
            !this.enabled ||
            !this.sprite ||
            !this.sprite.parent ||
            !this.sprite.visible ||
            !this.sprite.parent.visible ||
            this.sprite.worldScale.x === 0 ||
            this.sprite.worldScale.y === 0)
        {
            return false;
        }

        //  Need to pass it a temp point, in case we need it again for the pixel check
        if (this.game.input.hitTest(this.sprite, pointer, this._tempPoint))
        {
            if (fastTest === undefined)
            {
                fastTest = false;
            }

            if (!fastTest && this.pixelPerfectClick)
            {
                return this.checkPixel(this._tempPoint.x, this._tempPoint.y);
            }
            else
            {
                return true;
            }
        }

        return false;

    },

    /**
    * Checks if the given pointer is over the Sprite this InputHandler belongs to.
    * Use the `fastTest` flag is to quickly check just the bounding hit area even if `InputHandler.pixelPerfectOver` is `true`.
    *
    * @method Phaser.InputHandler#checkPointerOver
    * @param {Phaser.Pointer} pointer
    * @param {boolean} [fastTest=false] - Force a simple hit area check even if `pixelPerfectOver` is true for this object?
    * @return {boolean}
    */
    checkPointerOver: function (pointer, fastTest) {

        if (!this.enabled ||
            !this.sprite ||
            !this.sprite.parent ||
            !this.sprite.visible ||
            !this.sprite.parent.visible ||
            this.sprite.worldScale.x === 0 ||
            this.sprite.worldScale.y === 0)
        {
            return false;
        }

        //  Need to pass it a temp point, in case we need it again for the pixel check
        if (this.game.input.hitTest(this.sprite, pointer, this._tempPoint))
        {
            if (fastTest === undefined)
            {
                fastTest = false;
            }

            if (!fastTest && this.pixelPerfectOver)
            {
                return this.checkPixel(this._tempPoint.x, this._tempPoint.y);
            }
            else
            {
                return true;
            }
        }

        return false;

    },

    /**
    * Runs a pixel perfect check against the given x/y coordinates of the Sprite this InputHandler is bound to.
    * It compares the alpha value of the pixel and if >= InputHandler.pixelPerfectAlpha it returns true.
    *
    * @method Phaser.InputHandler#checkPixel
    * @param {number} x - The x coordinate to check.
    * @param {number} y - The y coordinate to check.
    * @param {Phaser.Pointer} [pointer] - The pointer to get the x/y coordinate from if not passed as the first two parameters.
    * @return {boolean} true if there is the alpha of the pixel is >= InputHandler.pixelPerfectAlpha
    */
    checkPixel: function (x, y, pointer) {

        //  Grab a pixel from our image into the hitCanvas and then test it
        if (this.sprite.texture.baseTexture.source)
        {
            if (x === null && y === null)
            {
                //  Use the pointer parameter
                this.game.input.getLocalPosition(this.sprite, pointer, this._tempPoint);

                var x = this._tempPoint.x;
                var y = this._tempPoint.y;
            }

            if (this.sprite.anchor.x !== 0)
            {
                x -= -this.sprite.texture.frame.width * this.sprite.anchor.x;
            }

            if (this.sprite.anchor.y !== 0)
            {
                y -= -this.sprite.texture.frame.height * this.sprite.anchor.y;
            }

            x += this.sprite.texture.frame.x;
            y += this.sprite.texture.frame.y;

            if (this.sprite.texture.trim)
            {
                x -= this.sprite.texture.trim.x;
                y -= this.sprite.texture.trim.y;

                //  If the coordinates are outside the trim area we return false immediately, to save doing a draw call
                if (x < this.sprite.texture.crop.x || x > this.sprite.texture.crop.right || y < this.sprite.texture.crop.y || y > this.sprite.texture.crop.bottom)
                {
                    this._dx = x;
                    this._dy = y;
                    return false;
                }
            }

            this._dx = x;
            this._dy = y;

            this.game.input.hitContext.clearRect(0, 0, 1, 1);
            this.game.input.hitContext.drawImage(this.sprite.texture.baseTexture.source, x, y, 1, 1, 0, 0, 1, 1);

            var rgb = this.game.input.hitContext.getImageData(0, 0, 1, 1);

            if (rgb.data[3] >= this.pixelPerfectAlpha)
            {
                return true;
            }
        }

        return false;

    },

    /**
    * Internal Update method. This is called automatically and handles the Pointer
    * and drag update loops.
    * 
    * @method Phaser.InputHandler#update
    * @protected
    * @param {Phaser.Pointer} pointer
    * @return {boolean} True if the pointer is still active, otherwise false.
    */
    update: function (pointer) {

        if (this.sprite === null || this.sprite.parent === undefined)
        {
            //  Abort. We've been destroyed.
            return;
        }

        if (!this.enabled || !this.sprite.visible || !this.sprite.parent.visible)
        {
            this._pointerOutHandler(pointer);
            return false;
        }

        if (this._pendingDrag)
        {
            if (!this._dragDistancePass)
            {
                this._dragDistancePass = (Phaser.Math.distance(pointer.x, pointer.y, this.downPoint.x, this.downPoint.y) >= this.dragDistanceThreshold);
            }

            if (this._dragDistancePass && this._dragTimePass)
            {
                this.startDrag(pointer);
            }

            return true;
        }
        else if (this.draggable && this._draggedPointerID === pointer.id)
        {
            return this.updateDrag(pointer, false);
        }
        else if (this._pointerData[pointer.id].isOver)
        {
            if (this.checkPointerOver(pointer))
            {
                this._pointerData[pointer.id].x = pointer.x - this.sprite.x;
                this._pointerData[pointer.id].y = pointer.y - this.sprite.y;
                return true;
            }
            else
            {
                this._pointerOutHandler(pointer);
                return false;
            }
        }
    },

    /**
    * Internal method handling the pointer over event.
    * 
    * @method Phaser.InputHandler#_pointerOverHandler
    * @private
    * @param {Phaser.Pointer} pointer - The pointer that triggered the event
    * @param {boolean} [silent=false] - If silent is `true` then this method will not dispatch any Signals from the parent Sprite.
    */
    _pointerOverHandler: function (pointer, silent) {

        if (this.sprite === null)
        {
            //  Abort. We've been destroyed.
            return;
        }

        var data = this._pointerData[pointer.id];

        if (data.isOver === false || pointer.dirty)
        {
            var sendEvent = (data.isOver === false);

            data.isOver = true;
            data.isOut = false;
            data.timeOver = this.game.time.time;
            data.x = pointer.x - this.sprite.x;
            data.y = pointer.y - this.sprite.y;

            if (this.useHandCursor && data.isDragged === false)
            {
                this.game.canvas.style.cursor = "pointer";
                this._setHandCursor = true;
            }

            if (!silent && sendEvent && this.sprite && this.sprite.events)
            {
                this.sprite.events.onInputOver$dispatch(this.sprite, pointer);
            }

            if (this.sprite.parent && this.sprite.parent.type === Phaser.GROUP)
            {
                this.sprite.parent.onChildInputOver.dispatch(this.sprite, pointer);
            }
        }

    },

    /**
    * Internal method handling the pointer out event.
    * 
    * @method Phaser.InputHandler#_pointerOutHandler
    * @private
    * @param {Phaser.Pointer} pointer - The pointer that triggered the event.
    * @param {boolean} [silent=false] - If silent is `true` then this method will not dispatch any Signals from the parent Sprite.
    */
    _pointerOutHandler: function (pointer, silent) {

        if (this.sprite === null)
        {
            //  Abort. We've been destroyed.
            return;
        }

        var data = this._pointerData[pointer.id];

        data.isOver = false;
        data.isOut = true;
        data.timeOut = this.game.time.time;

        if (this.useHandCursor && data.isDragged === false)
        {
            this.game.canvas.style.cursor = "default";
            this._setHandCursor = false;
        }

        if (!silent && this.sprite && this.sprite.events)
        {
            this.sprite.events.onInputOut$dispatch(this.sprite, pointer);

            if (this.sprite && this.sprite.parent && this.sprite.parent.type === Phaser.GROUP)
            {
                this.sprite.parent.onChildInputOut.dispatch(this.sprite, pointer);
            }
        }

    },

    /**
    * Internal method handling the touched / clicked event.
    * 
    * @method Phaser.InputHandler#_touchedHandler
    * @private
    * @param {Phaser.Pointer} pointer - The pointer that triggered the event.
    */
    _touchedHandler: function (pointer) {

        if (this.sprite === null)
        {
            //  Abort. We've been destroyed.
            return;
        }

        var data = this._pointerData[pointer.id];

        if (!data.isDown && data.isOver)
        {
            if (this.pixelPerfectClick && !this.checkPixel(null, null, pointer))
            {
                return;
            }

            data.isDown = true;
            data.isUp = false;
            data.timeDown = this.game.time.time;

            this.downPoint.set(pointer.x, pointer.y);

            //  It's possible the onInputDown event creates a new Sprite that is on-top of this one, so we ought to force a Pointer update
            pointer.dirty = true;

            if (this.sprite && this.sprite.events)
            {
                this.sprite.events.onInputDown$dispatch(this.sprite, pointer);

                //  The event above might have destroyed this sprite.
                if (this.sprite && this.sprite.parent && this.sprite.parent.type === Phaser.GROUP)
                {
                    this.sprite.parent.onChildInputDown.dispatch(this.sprite, pointer);
                }

                //  The events might have destroyed this sprite.
                if (this.sprite === null)
                {
                    return;
                }
            }

            //  Start drag
            if (this.draggable && this.isDragged === false)
            {
                if (this.dragTimeThreshold === 0 && this.dragDistanceThreshold === 0)
                {
                    this.startDrag(pointer);
                }
                else
                {
                    this._pendingDrag = true;

                    this._dragDistancePass = (this.dragDistanceThreshold === 0);

                    if (this.dragTimeThreshold > 0)
                    {
                        this._dragTimePass = false;
                        this.game.time.events.add(this.dragTimeThreshold, this.dragTimeElapsed, this, pointer);
                    }
                    else
                    {
                        this._dragTimePass = true;
                    }
                }
            }

            if (this.bringToTop)
            {
                this.sprite.bringToTop();
            }
        }

    },

    /**
    * Internal method handling the drag threshold timer.
    * 
    * @method Phaser.InputHandler#dragTimeElapsed
    * @private
    * @param {Phaser.Pointer} pointer
    */
    dragTimeElapsed: function (pointer) {

        this._dragTimePass = true;

        if (this._pendingDrag && this.sprite)
        {
            if (this._dragDistancePass)
            {
                this.startDrag(pointer);
            }
        }

    },

    /**
    * Internal method handling the pointer released event.
    * @method Phaser.InputHandler#_releasedHandler
    * @private
    * @param {Phaser.Pointer} pointer
    */
    _releasedHandler: function (pointer) {

        if (this.sprite === null)
        {
            //  Abort. We've been destroyed.
            return;
        }

        var data = this._pointerData[pointer.id];

        //  If was previously touched by this Pointer, check if still is AND still over this item
        if (data.isDown && pointer.isUp)
        {
            data.isDown = false;
            data.isUp = true;
            data.timeUp = this.game.time.time;
            data.downDuration = data.timeUp - data.timeDown;

            //  Only release the InputUp signal if the pointer is still over this sprite
            var isOver = this.checkPointerOver(pointer);

            if (this.sprite && this.sprite.events)
            {
                if (!this.dragStopBlocksInputUp ||
                    this.dragStopBlocksInputUp && !(this.draggable && this.isDragged && this._draggedPointerID === pointer.id))
                {
                    this.sprite.events.onInputUp$dispatch(this.sprite, pointer, isOver);
                }

                if (this.sprite && this.sprite.parent && this.sprite.parent.type === Phaser.GROUP)
                {
                    this.sprite.parent.onChildInputUp.dispatch(this.sprite, pointer, isOver);
                }

                //  The onInputUp event may have changed the sprite so that checkPointerOver is no longer true, so update it.
                if (isOver)
                {
                    isOver = this.checkPointerOver(pointer);
                }
            }
            
            data.isOver = isOver;

            if (!isOver && this.useHandCursor)
            {
                this.game.canvas.style.cursor = "default";
                this._setHandCursor = false;
            }

            //  It's possible the onInputUp event created a new Sprite that is on-top of this one, so force a Pointer update
            pointer.dirty = true;

            this._pendingDrag = false;

            //  Stop drag
            if (this.draggable && this.isDragged && this._draggedPointerID === pointer.id)
            {
                this.stopDrag(pointer);
            }
        }

    },

    /**
    * Called as a Pointer actively drags this Game Object.
    * 
    * @method Phaser.InputHandler#updateDrag
    * @private
    * @param {Phaser.Pointer} pointer - The Pointer causing the drag update.
    * @param {boolean} fromStart - True if this is the first update, immediately after the drag has started.
    * @return {boolean}
    */
    updateDrag: function (pointer, fromStart) {

        if (fromStart === undefined) { fromStart = false; }

        if (pointer.isUp)
        {
            this.stopDrag(pointer);
            return false;
        }

        var px = this.globalToLocalX(pointer.x) + this._dragPoint.x + this.dragOffset.x;
        var py = this.globalToLocalY(pointer.y) + this._dragPoint.y + this.dragOffset.y;

        if (this.sprite.fixedToCamera)
        {
            if (this.allowHorizontalDrag)
            {
                this.sprite.cameraOffset.x = px;
            }

            if (this.allowVerticalDrag)
            {
                this.sprite.cameraOffset.y = py;
            }

            if (this.boundsRect)
            {
                this.checkBoundsRect();
            }

            if (this.boundsSprite)
            {
                this.checkBoundsSprite();
            }

            if (this.snapOnDrag)
            {
                this.sprite.cameraOffset.x = Math.round((this.sprite.cameraOffset.x - (this.snapOffsetX % this.snapX)) / this.snapX) * this.snapX + (this.snapOffsetX % this.snapX);
                this.sprite.cameraOffset.y = Math.round((this.sprite.cameraOffset.y - (this.snapOffsetY % this.snapY)) / this.snapY) * this.snapY + (this.snapOffsetY % this.snapY);
                this.snapPoint.set(this.sprite.cameraOffset.x, this.sprite.cameraOffset.y);
            }
        }
        else
        {
            var cx = this.game.camera.x - this._pointerData[pointer.id].camX;
            var cy = this.game.camera.y - this._pointerData[pointer.id].camY;

            if (this.allowHorizontalDrag)
            {
                this.sprite.x = px + cx;
            }

            if (this.allowVerticalDrag)
            {
                this.sprite.y = py + cy;
            }

            if (this.boundsRect)
            {
                this.checkBoundsRect();
            }

            if (this.boundsSprite)
            {
                this.checkBoundsSprite();
            }

            if (this.snapOnDrag)
            {
                this.sprite.x = Math.round((this.sprite.x - (this.snapOffsetX % this.snapX)) / this.snapX) * this.snapX + (this.snapOffsetX % this.snapX);
                this.sprite.y = Math.round((this.sprite.y - (this.snapOffsetY % this.snapY)) / this.snapY) * this.snapY + (this.snapOffsetY % this.snapY);
                this.snapPoint.set(this.sprite.x, this.sprite.y);
            }
        }

        this.sprite.events.onDragUpdate.dispatch(this.sprite, pointer, px, py, this.snapPoint, fromStart);

        return true;

    },

    /**
    * Returns true if the pointer has entered the Sprite within the specified delay time (defaults to 500ms, half a second)
    *
    * @method Phaser.InputHandler#justOver
    * @param {integer} [pointerId=0]
    * @param {number} delay - The time below which the pointer is considered as just over.
    * @return {boolean}
    */
    justOver: function (pointerId, delay) {

        pointerId = pointerId || 0;
        delay = delay || 500;

        return (this._pointerData[pointerId].isOver && this.overDuration(pointerId) < delay);

    },

    /**
    * Returns true if the pointer has left the Sprite within the specified delay time (defaults to 500ms, half a second)
    *
    * @method Phaser.InputHandler#justOut
    * @param {integer} [pointerId=0]
    * @param {number} delay - The time below which the pointer is considered as just out.
    * @return {boolean}
    */
    justOut: function (pointerId, delay) {

        pointerId = pointerId || 0;
        delay = delay || 500;

        return (this._pointerData[pointerId].isOut && (this.game.time.time - this._pointerData[pointerId].timeOut < delay));

    },

    /**
    * Returns true if the pointer has touched or clicked on the Sprite within the specified delay time (defaults to 500ms, half a second)
    *
    * @method Phaser.InputHandler#justPressed
    * @param {integer} [pointerId=0]
    * @param {number} delay - The time below which the pointer is considered as just over.
    * @return {boolean}
    */
    justPressed: function (pointerId, delay) {

        pointerId = pointerId || 0;
        delay = delay || 500;

        return (this._pointerData[pointerId].isDown && this.downDuration(pointerId) < delay);

    },

    /**
    * Returns true if the pointer was touching this Sprite, but has been released within the specified delay time (defaults to 500ms, half a second)
    *
    * @method Phaser.InputHandler#justReleased
    * @param {integer} [pointerId=0]
    * @param {number} delay - The time below which the pointer is considered as just out.
    * @return {boolean}
    */
    justReleased: function (pointerId, delay) {

        pointerId = pointerId || 0;
        delay = delay || 500;

        return (this._pointerData[pointerId].isUp && (this.game.time.time - this._pointerData[pointerId].timeUp < delay));

    },

    /**
    * If the pointer is currently over this Sprite this returns how long it has been there for in milliseconds.
    *
    * @method Phaser.InputHandler#overDuration
    * @param {integer} [pointerId=0]
    * @return {number} The number of milliseconds the pointer has been over the Sprite, or -1 if not over.
    */
    overDuration: function (pointerId) {

        pointerId = pointerId || 0;

        if (this._pointerData[pointerId].isOver)
        {
            return this.game.time.time - this._pointerData[pointerId].timeOver;
        }

        return -1;

    },

    /**
    * If the pointer is currently over this Sprite this returns how long it has been there for in milliseconds.
    *
    * @method Phaser.InputHandler#downDuration
    * @param {integer} [pointerId=0]
    * @return {number} The number of milliseconds the pointer has been pressed down on the Sprite, or -1 if not over.
    */
    downDuration: function (pointerId) {

        pointerId = pointerId || 0;

        if (this._pointerData[pointerId].isDown)
        {
            return this.game.time.time - this._pointerData[pointerId].timeDown;
        }

        return -1;

    },

    /**
    * Allow this Sprite to be dragged by any valid pointer.
    *
    * When the drag begins the Sprite.events.onDragStart event will be dispatched.
    * 
    * When the drag completes by way of the user letting go of the pointer that was dragging the sprite, the Sprite.events.onDragStop event is dispatched.
    *
    * You can control the thresholds over when a drag starts via the properties:
    * 
    * `Pointer.dragDistanceThreshold` the distance, in pixels, that the pointer has to move
    * before the drag will start.
    *
    * `Pointer.dragTimeThreshold` the time, in ms, that the pointer must be held down on
    * the Sprite before the drag will start.
    *
    * You can set either (or both) of these properties after enabling a Sprite for drag.
    *
    * For the duration of the drag the Sprite.events.onDragUpdate event is dispatched. This event is only dispatched when the pointer actually
    * changes position and moves. The event sends 5 parameters: `sprite`, `pointer`, `dragX`, `dragY` and `snapPoint`.
    * 
    * @method Phaser.InputHandler#enableDrag
    * @param {boolean} [lockCenter=false] - If false the Sprite will drag from where you click it minus the dragOffset. If true it will center itself to the tip of the mouse pointer.
    * @param {boolean} [bringToTop=false] - If true the Sprite will be bought to the top of the rendering list in its current Group.
    * @param {boolean} [pixelPerfect=false] - If true it will use a pixel perfect test to see if you clicked the Sprite. False uses the bounding box.
    * @param {boolean} [alphaThreshold=255] - If using pixel perfect collision this specifies the alpha level from 0 to 255 above which a collision is processed.
    * @param {Phaser.Rectangle} [boundsRect=null] - If you want to restrict the drag of this sprite to a specific Rectangle, pass the Phaser.Rectangle here, otherwise it's free to drag anywhere.
    * @param {Phaser.Sprite} [boundsSprite=null] - If you want to restrict the drag of this sprite to within the bounding box of another sprite, pass it here.
    */
    enableDrag: function (lockCenter, bringToTop, pixelPerfect, alphaThreshold, boundsRect, boundsSprite) {

        if (lockCenter === undefined) { lockCenter = false; }
        if (bringToTop === undefined) { bringToTop = false; }
        if (pixelPerfect === undefined) { pixelPerfect = false; }
        if (alphaThreshold === undefined) { alphaThreshold = 255; }
        if (boundsRect === undefined) { boundsRect = null; }
        if (boundsSprite === undefined) { boundsSprite = null; }

        this._dragPoint = new Phaser.Point();
        this.draggable = true;
        this.bringToTop = bringToTop;
        this.dragOffset = new Phaser.Point();
        this.dragFromCenter = lockCenter;

        this.pixelPerfectClick = pixelPerfect;
        this.pixelPerfectAlpha = alphaThreshold;

        if (boundsRect)
        {
            this.boundsRect = boundsRect;
        }

        if (boundsSprite)
        {
            this.boundsSprite = boundsSprite;
        }

    },

    /**
    * Stops this sprite from being able to be dragged.
    * If it is currently the target of an active drag it will be stopped immediately; also disables any set callbacks.
    *
    * @method Phaser.InputHandler#disableDrag
    */
    disableDrag: function () {

        if (this._pointerData)
        {
            for (var i = 0; i < 10; i++)
            {
                this._pointerData[i].isDragged = false;
            }
        }

        this.draggable = false;
        this.isDragged = false;
        this._draggedPointerID = -1;
        this._pendingDrag = false;

    },

    /**
    * Called by Pointer when drag starts on this Sprite. Should not usually be called directly.
    *
    * @method Phaser.InputHandler#startDrag
    * @param {Phaser.Pointer} pointer
    */
    startDrag: function (pointer) {

        var x = this.sprite.x;
        var y = this.sprite.y;

        this.isDragged = true;
        this._draggedPointerID = pointer.id;

        this._pointerData[pointer.id].camX = this.game.camera.x;
        this._pointerData[pointer.id].camY = this.game.camera.y;

        this._pointerData[pointer.id].isDragged = true;

        if (this.sprite.fixedToCamera)
        {
            if (this.dragFromCenter)
            {
                var bounds = this.sprite.getBounds();

                this.sprite.cameraOffset.x = this.globalToLocalX(pointer.x) + (this.sprite.cameraOffset.x - bounds.centerX);
                this.sprite.cameraOffset.y = this.globalToLocalY(pointer.y) + (this.sprite.cameraOffset.y - bounds.centerY);
            }

            this._dragPoint.setTo(this.sprite.cameraOffset.x - pointer.x, this.sprite.cameraOffset.y - pointer.y);
        }
        else
        {
            if (this.dragFromCenter)
            {
                var bounds = this.sprite.getBounds();

                this.sprite.x = this.globalToLocalX(pointer.x) + (this.sprite.x - bounds.centerX);
                this.sprite.y = this.globalToLocalY(pointer.y) + (this.sprite.y - bounds.centerY);
            }

            this._dragPoint.setTo(this.sprite.x - this.globalToLocalX(pointer.x), this.sprite.y - this.globalToLocalY(pointer.y));
        }

        this.updateDrag(pointer, true);

        if (this.bringToTop)
        {
            this._dragPhase = true;
            this.sprite.bringToTop();
        }

        this.dragStartPoint.set(x, y);

        this.sprite.events.onDragStart$dispatch(this.sprite, pointer, x, y);

        this._pendingDrag = false;

    },

    /**
    * Warning: EXPERIMENTAL
    *
    * @method Phaser.InputHandler#globalToLocalX
    * @param {number} x
    */
    globalToLocalX: function (x) {

        if (this.scaleLayer)
        {
            x -= this.game.scale.grid.boundsFluid.x;
            x *= this.game.scale.grid.scaleFluidInversed.x;
        }

        return x;

    },

    /**
    * Warning: EXPERIMENTAL
    *
    * @method Phaser.InputHandler#globalToLocalY
    * @param {number} y
    */
    globalToLocalY: function (y) {

        if (this.scaleLayer)
        {
            y -= this.game.scale.grid.boundsFluid.y;
            y *= this.game.scale.grid.scaleFluidInversed.y;
        }

        return y;

    },

    /**
    * Called by Pointer when drag is stopped on this Sprite. Should not usually be called directly.
    *
    * @method Phaser.InputHandler#stopDrag
    * @param {Phaser.Pointer} pointer
    */
    stopDrag: function (pointer) {

        this.isDragged = false;
        this._draggedPointerID = -1;
        this._pointerData[pointer.id].isDragged = false;
        this._dragPhase = false;
        this._pendingDrag = false;

        if (this.snapOnRelease)
        {
            if (this.sprite.fixedToCamera)
            {
                this.sprite.cameraOffset.x = Math.round((this.sprite.cameraOffset.x - (this.snapOffsetX % this.snapX)) / this.snapX) * this.snapX + (this.snapOffsetX % this.snapX);
                this.sprite.cameraOffset.y = Math.round((this.sprite.cameraOffset.y - (this.snapOffsetY % this.snapY)) / this.snapY) * this.snapY + (this.snapOffsetY % this.snapY);
            }
            else
            {
                this.sprite.x = Math.round((this.sprite.x - (this.snapOffsetX % this.snapX)) / this.snapX) * this.snapX + (this.snapOffsetX % this.snapX);
                this.sprite.y = Math.round((this.sprite.y - (this.snapOffsetY % this.snapY)) / this.snapY) * this.snapY + (this.snapOffsetY % this.snapY);
            }
        }

        this.sprite.events.onDragStop$dispatch(this.sprite, pointer);

        if (this.checkPointerOver(pointer) === false)
        {
            this._pointerOutHandler(pointer);
        }

    },

    /**
    * Restricts this sprite to drag movement only on the given axis. Note: If both are set to false the sprite will never move!
    *
    * @method Phaser.InputHandler#setDragLock
    * @param {boolean} [allowHorizontal=true] - To enable the sprite to be dragged horizontally set to true, otherwise false.
    * @param {boolean} [allowVertical=true] - To enable the sprite to be dragged vertically set to true, otherwise false.
    */
    setDragLock: function (allowHorizontal, allowVertical) {

        if (allowHorizontal === undefined) { allowHorizontal = true; }
        if (allowVertical === undefined) { allowVertical = true; }

        this.allowHorizontalDrag = allowHorizontal;
        this.allowVerticalDrag = allowVertical;

    },

    /**
    * Make this Sprite snap to the given grid either during drag or when it's released.
    * For example 16x16 as the snapX and snapY would make the sprite snap to every 16 pixels.
    *
    * @method Phaser.InputHandler#enableSnap
    * @param {number} snapX - The width of the grid cell to snap to.
    * @param {number} snapY - The height of the grid cell to snap to.
    * @param {boolean} [onDrag=true] - If true the sprite will snap to the grid while being dragged.
    * @param {boolean} [onRelease=false] - If true the sprite will snap to the grid when released.
    * @param {number} [snapOffsetX=0] - Used to offset the top-left starting point of the snap grid.
    * @param {number} [snapOffsetY=0] - Used to offset the top-left starting point of the snap grid.
    */
    enableSnap: function (snapX, snapY, onDrag, onRelease, snapOffsetX, snapOffsetY) {

        if (onDrag === undefined) { onDrag = true; }
        if (onRelease === undefined) { onRelease = false; }
        if (snapOffsetX === undefined) { snapOffsetX = 0; }
        if (snapOffsetY === undefined) { snapOffsetY = 0; }

        this.snapX = snapX;
        this.snapY = snapY;
        this.snapOffsetX = snapOffsetX;
        this.snapOffsetY = snapOffsetY;
        this.snapOnDrag = onDrag;
        this.snapOnRelease = onRelease;

    },

    /**
    * Stops the sprite from snapping to a grid during drag or release.
    *
    * @method Phaser.InputHandler#disableSnap
    */
    disableSnap: function () {

        this.snapOnDrag = false;
        this.snapOnRelease = false;

    },

    /**
    * Bounds Rect check for the sprite drag
    *
    * @method Phaser.InputHandler#checkBoundsRect
    */
    checkBoundsRect: function () {

        if (this.sprite.fixedToCamera)
        {
            if (this.sprite.cameraOffset.x < this.boundsRect.left)
            {
                this.sprite.cameraOffset.x = this.boundsRect.left;
            }
            else if ((this.sprite.cameraOffset.x + this.sprite.width) > this.boundsRect.right)
            {
                this.sprite.cameraOffset.x = this.boundsRect.right - this.sprite.width;
            }

            if (this.sprite.cameraOffset.y < this.boundsRect.top)
            {
                this.sprite.cameraOffset.y = this.boundsRect.top;
            }
            else if ((this.sprite.cameraOffset.y + this.sprite.height) > this.boundsRect.bottom)
            {
                this.sprite.cameraOffset.y = this.boundsRect.bottom - this.sprite.height;
            }
        }
        else
        {
            if (this.sprite.left < this.boundsRect.left)
            {
                this.sprite.x = this.boundsRect.x + this.sprite.offsetX;
            }
            else if (this.sprite.right > this.boundsRect.right)
            {
                this.sprite.x = this.boundsRect.right - (this.sprite.width - this.sprite.offsetX);
            }

            if (this.sprite.top < this.boundsRect.top)
            {
                this.sprite.y = this.boundsRect.top + this.sprite.offsetY;
            }
            else if (this.sprite.bottom > this.boundsRect.bottom)
            {
                this.sprite.y = this.boundsRect.bottom - (this.sprite.height - this.sprite.offsetY);
            }
        }

    },

    /**
    * Parent Sprite Bounds check for the sprite drag.
    *
    * @method Phaser.InputHandler#checkBoundsSprite
    */
    checkBoundsSprite: function () {

        if (this.sprite.fixedToCamera && this.boundsSprite.fixedToCamera)
        {
            if (this.sprite.cameraOffset.x < this.boundsSprite.cameraOffset.x)
            {
                this.sprite.cameraOffset.x = this.boundsSprite.cameraOffset.x;
            }
            else if ((this.sprite.cameraOffset.x + this.sprite.width) > (this.boundsSprite.cameraOffset.x + this.boundsSprite.width))
            {
                this.sprite.cameraOffset.x = (this.boundsSprite.cameraOffset.x + this.boundsSprite.width) - this.sprite.width;
            }

            if (this.sprite.cameraOffset.y < this.boundsSprite.cameraOffset.y)
            {
                this.sprite.cameraOffset.y = this.boundsSprite.cameraOffset.y;
            }
            else if ((this.sprite.cameraOffset.y + this.sprite.height) > (this.boundsSprite.cameraOffset.y + this.boundsSprite.height))
            {
                this.sprite.cameraOffset.y = (this.boundsSprite.cameraOffset.y + this.boundsSprite.height) - this.sprite.height;
            }
        }
        else
        {
            if (this.sprite.left < this.boundsSprite.left)
            {
                this.sprite.x = this.boundsSprite.left + this.sprite.offsetX;
            }
            else if (this.sprite.right > this.boundsSprite.right)
            {
                this.sprite.x = this.boundsSprite.right - (this.sprite.width - this.sprite.offsetX);
            }

            if (this.sprite.top < this.boundsSprite.top)
            {
                this.sprite.y = this.boundsSprite.top + this.sprite.offsetY;
            }
            else if (this.sprite.bottom > this.boundsSprite.bottom)
            {
                this.sprite.y = this.boundsSprite.bottom - (this.sprite.height - this.sprite.offsetY);
            }
        }

    }

};

Phaser.InputHandler.prototype.constructor = Phaser.InputHandler;

/**
* @author       @karlmacklin <tacklemcclean@gmail.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Gamepad class handles gamepad input and dispatches gamepad events.
*
* Remember to call `gamepad.start()`.
*
* HTML5 GAMEPAD API SUPPORT IS AT AN EXPERIMENTAL STAGE!
* At moment of writing this (end of 2013) only Chrome supports parts of it out of the box. Firefox supports it
* via prefs flags (about:config, search gamepad). The browsers map the same controllers differently.
* This class has constants for Windows 7 Chrome mapping of XBOX 360 controller.
*
* @class Phaser.Gamepad
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.Gamepad = function (game) {

    /**
    * @property {Phaser.Game} game - Local reference to game.
    */
    this.game = game;

    /**
    * @property {object} _gamepadIndexMap - Maps the browsers gamepad indices to our Phaser Gamepads
    * @private
    */
    this._gamepadIndexMap = {};

    /**
    * @property {Array} _rawPads - The raw state of the gamepads from the browser
    * @private
    */
    this._rawPads = [];

    /**
    * @property {boolean} _active - Private flag for whether or not the API is polled
    * @private
    * @default
    */
    this._active = false;

    /**
    * Gamepad input will only be processed if enabled.
    * @property {boolean} enabled
    * @default
    */
    this.enabled = true;

    /**
    * Whether or not gamepads are supported in the current browser. Note that as of Dec. 2013 this check is actually not accurate at all due to poor implementation.
    * @property {boolean} _gamepadSupportAvailable - Are gamepads supported in this browser or not?
    * @private
    */
    this._gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads || (navigator.userAgent.indexOf('Firefox/') !== -1) || !!navigator.getGamepads;

    /**
    * Used to check for differences between earlier polls and current state of gamepads.
    * @property {Array} _prevRawGamepadTypes
    * @private
    * @default
    */
    this._prevRawGamepadTypes = [];

    /**
    * Used to check for differences between earlier polls and current state of gamepads.
    * @property {Array} _prevTimestamps
    * @private
    * @default
    */
    this._prevTimestamps = [];

    /**
    * @property {object} callbackContext - The context under which the callbacks are run.
    */
    this.callbackContext = this;

    /**
    * @property {function} onConnectCallback - This callback is invoked every time any gamepad is connected
    */
    this.onConnectCallback = null;

    /**
    * @property {function} onDisconnectCallback - This callback is invoked every time any gamepad is disconnected
    */
    this.onDisconnectCallback = null;

    /**
    * @property {function} onDownCallback - This callback is invoked every time any gamepad button is pressed down.
    */
    this.onDownCallback = null;

    /**
    * @property {function} onUpCallback - This callback is invoked every time any gamepad button is released.
    */
    this.onUpCallback = null;

    /**
    * @property {function} onAxisCallback - This callback is invoked every time any gamepad axis is changed.
    */
    this.onAxisCallback = null;

    /**
    * @property {function} onFloatCallback - This callback is invoked every time any gamepad button is changed to a value where value > 0 and value < 1.
    */
    this.onFloatCallback = null;

    /**
    * @property {function} _ongamepadconnected - Private callback for Firefox gamepad connection handling
    * @private
    */
    this._ongamepadconnected = null;

    /**
    * @property {function} _gamepaddisconnected - Private callback for Firefox gamepad connection handling
    * @private
    */
    this._gamepaddisconnected = null;

    /**
    * @property {Array<Phaser.SinglePad>} _gamepads - The four Phaser Gamepads.
    * @private
    */
    this._gamepads = [
        new Phaser.SinglePad(game, this),
        new Phaser.SinglePad(game, this),
        new Phaser.SinglePad(game, this),
        new Phaser.SinglePad(game, this)
    ];

};

Phaser.Gamepad.prototype = {

    /**
    * Add callbacks to the main Gamepad handler to handle connect/disconnect/button down/button up/axis change/float value buttons.
    * 
    * @method Phaser.Gamepad#addCallbacks
    * @param {object} context - The context under which the callbacks are run.
    * @param {object} callbacks - Object that takes six different callback methods:
    * onConnectCallback, onDisconnectCallback, onDownCallback, onUpCallback, onAxisCallback, onFloatCallback
    */
    addCallbacks: function (context, callbacks) {

        if (typeof callbacks !== 'undefined')
        {
            this.onConnectCallback = (typeof callbacks.onConnect === 'function') ? callbacks.onConnect : this.onConnectCallback;
            this.onDisconnectCallback = (typeof callbacks.onDisconnect === 'function') ? callbacks.onDisconnect : this.onDisconnectCallback;
            this.onDownCallback = (typeof callbacks.onDown === 'function') ? callbacks.onDown : this.onDownCallback;
            this.onUpCallback = (typeof callbacks.onUp === 'function') ? callbacks.onUp : this.onUpCallback;
            this.onAxisCallback = (typeof callbacks.onAxis === 'function') ? callbacks.onAxis : this.onAxisCallback;
            this.onFloatCallback = (typeof callbacks.onFloat === 'function') ? callbacks.onFloat : this.onFloatCallback;
            this.callbackContext = context;
        }

    },

    /**
    * Starts the Gamepad event handling.
    * This MUST be called manually before Phaser will start polling the Gamepad API.
    *
    * @method Phaser.Gamepad#start
    */
    start: function () {

        if (this._active)
        {
            //  Avoid setting multiple listeners
            return;
        }

        this._active = true;

        var _this = this;

        this._onGamepadConnected = function (event) {
            return _this.onGamepadConnected(event);
        };

        this._onGamepadDisconnected = function (event) {
            return _this.onGamepadDisconnected(event);
        };

        window.addEventListener('gamepadconnected', this._onGamepadConnected, false);
        window.addEventListener('gamepaddisconnected', this._onGamepadDisconnected, false);

    },

    /**
     * Handles the connection of a Gamepad.
     *
     * @method onGamepadConnected
     * @private
     * @param {object} event - The DOM event.
     */
    onGamepadConnected: function (event) {

        var newPad = event.gamepad;
        this._rawPads.push(newPad);
        this._gamepads[newPad.index].connect(newPad);

    },

    /**
     * Handles the disconnection of a Gamepad.
     *
     * @method onGamepadDisconnected
     * @private
     * @param {object} event - The DOM event.
     */
    onGamepadDisconnected: function (event) {

        var removedPad = event.gamepad;

        for (var i in this._rawPads)
        {
            if (this._rawPads[i].index === removedPad.index)
            {
                this._rawPads.splice(i,1);
            }
        }

        this._gamepads[removedPad.index].disconnect();

    },

    /**
    * Main gamepad update loop. Should not be called manually.
    * @method Phaser.Gamepad#update
    * @protected
    */
    update: function () {

        this._pollGamepads();

        this.pad1.pollStatus();
        this.pad2.pollStatus();
        this.pad3.pollStatus();
        this.pad4.pollStatus();

    },

    /**
    * Updating connected gamepads (for Google Chrome). Should not be called manually.
    * 
    * @method Phaser.Gamepad#_pollGamepads
    * @private
    */
    _pollGamepads: function () {

        if (!this._active)
        {
            return;
        }

        if (navigator['getGamepads'])
        {
            var rawGamepads = navigator.getGamepads();
        }
        else if (navigator['webkitGetGamepads'])
        {
            var rawGamepads = navigator.webkitGetGamepads();
        }
        else if (navigator['webkitGamepads'])
        {
            var rawGamepads = navigator.webkitGamepads();
        }

        if (rawGamepads)
        {
            this._rawPads = [];

            var gamepadsChanged = false;

            for (var i = 0; i < rawGamepads.length; i++)
            {
                if (typeof rawGamepads[i] !== this._prevRawGamepadTypes[i])
                {
                    gamepadsChanged = true;
                    this._prevRawGamepadTypes[i] = typeof rawGamepads[i];
                }

                if (rawGamepads[i])
                {
                    this._rawPads.push(rawGamepads[i]);
                }

                // Support max 4 pads at the moment
                if (i === 3)
                {
                    break;
                }
            }

            for (var g = 0; g < this._gamepads.length; g++)
            {
                this._gamepads[g]._rawPad = this._rawPads[g];
            }

            if (gamepadsChanged)
            {
                var validConnections = { rawIndices: {}, padIndices: {} };
                var singlePad;

                for (var j = 0; j < this._gamepads.length; j++)
                {
                    singlePad = this._gamepads[j];

                    if (singlePad.connected)
                    {
                        for (var k = 0; k < this._rawPads.length; k++)
                        {
                            if (this._rawPads[k].index === singlePad.index)
                            {
                                validConnections.rawIndices[singlePad.index] = true;
                                validConnections.padIndices[j] = true;
                            }
                        }
                    }
                }

                for (var l = 0; l < this._gamepads.length; l++)
                {
                    singlePad = this._gamepads[l];

                    if (validConnections.padIndices[l])
                    {
                        continue;
                    }

                    if (this._rawPads.length < 1)
                    {
                        singlePad.disconnect();
                    }

                    for (var m = 0; m < this._rawPads.length; m++)
                    {
                        if (validConnections.padIndices[l])
                        {
                            break;
                        }

                        var rawPad = this._rawPads[m];

                        if (rawPad)
                        {
                            if (validConnections.rawIndices[rawPad.index])
                            {
                                singlePad.disconnect();
                                continue;
                            }
                            else
                            {
                                singlePad.connect(rawPad);
                                validConnections.rawIndices[rawPad.index] = true;
                                validConnections.padIndices[l] = true;
                            }
                        }
                        else
                        {
                            singlePad.disconnect();
                        }
                    }
                }
            }
        }
    },

    /**
    * Sets the deadZone variable for all four gamepads
    * @method Phaser.Gamepad#setDeadZones
    */
    setDeadZones: function (value) {

        for (var i = 0; i < this._gamepads.length; i++)
        {
            this._gamepads[i].deadZone = value;
        }

    },

    /**
    * Stops the Gamepad event handling.
    *
    * @method Phaser.Gamepad#stop
    */
    stop: function () {

        this._active = false;

        window.removeEventListener('gamepadconnected', this._onGamepadConnected);
        window.removeEventListener('gamepaddisconnected', this._onGamepadDisconnected);

    },

    /**
    * Reset all buttons/axes of all gamepads
    * @method Phaser.Gamepad#reset
    */
    reset: function () {

        this.update();

        for (var i = 0; i < this._gamepads.length; i++)
        {
            this._gamepads[i].reset();
        }

    },

    /**
    * Returns the "just pressed" state of a button from ANY gamepad connected. Just pressed is considered true if the button was pressed down within the duration given (default 250ms).
    * @method Phaser.Gamepad#justPressed
    * @param {number} buttonCode - The buttonCode of the button to check for.
    * @param {number} [duration=250] - The duration below which the button is considered as being just pressed.
    * @return {boolean} True if the button is just pressed otherwise false.
    */
    justPressed: function (buttonCode, duration) {

        for (var i = 0; i < this._gamepads.length; i++)
        {
            if (this._gamepads[i].justPressed(buttonCode, duration) === true)
            {
                return true;
            }
        }

        return false;

    },

    /**
    * Returns the "just released" state of a button from ANY gamepad connected. Just released is considered as being true if the button was released within the duration given (default 250ms).
    * @method Phaser.Gamepad#justPressed
    * @param {number} buttonCode - The buttonCode of the button to check for.
    * @param {number} [duration=250] - The duration below which the button is considered as being just released.
    * @return {boolean} True if the button is just released otherwise false.
    */
    justReleased: function (buttonCode, duration) {

        for (var i = 0; i < this._gamepads.length; i++)
        {
            if (this._gamepads[i].justReleased(buttonCode, duration) === true)
            {
                return true;
            }
        }

        return false;

    },

    /**
    * Returns true if the button is currently pressed down, on ANY gamepad.
    * @method Phaser.Gamepad#isDown
    * @param {number} buttonCode - The buttonCode of the button to check for.
    * @return {boolean} True if a button is currently down.
    */
    isDown: function (buttonCode) {

        for (var i = 0; i < this._gamepads.length; i++)
        {
            if (this._gamepads[i].isDown(buttonCode) === true)
            {
                return true;
            }
        }

        return false;
    },

    /**
     * Destroys this object and the associated event listeners.
     *
     * @method Phaser.Gamepad#destroy
     */
    destroy: function () {

        this.stop();

        for (var i = 0; i < this._gamepads.length; i++)
        {
            this._gamepads[i].destroy();
        }

    }

};

Phaser.Gamepad.prototype.constructor = Phaser.Gamepad;

/**
* If the gamepad input is active or not - if not active it should not be updated from Input.js
* @name Phaser.Gamepad#active
* @property {boolean} active - If the gamepad input is active or not.
* @readonly
*/
Object.defineProperty(Phaser.Gamepad.prototype, "active", {

    get: function () {
        return this._active;
    }

});

/**
* Whether or not gamepads are supported in current browser.
* @name Phaser.Gamepad#supported
* @property {boolean} supported - Whether or not gamepads are supported in current browser.
* @readonly
*/
Object.defineProperty(Phaser.Gamepad.prototype, "supported", {

    get: function () {
        return this._gamepadSupportAvailable;
    }

});

/**
* How many live gamepads are currently connected.
* @name Phaser.Gamepad#padsConnected
* @property {number} padsConnected - How many live gamepads are currently connected.
* @readonly
*/
Object.defineProperty(Phaser.Gamepad.prototype, "padsConnected", {

    get: function () {
        return this._rawPads.length;
    }

});

/**
* Gamepad #1
* @name Phaser.Gamepad#pad1
* @property {Phaser.SinglePad} pad1 - Gamepad #1;
* @readonly
*/
Object.defineProperty(Phaser.Gamepad.prototype, "pad1", {

    get: function () {
        return this._gamepads[0];
    }

});

/**
* Gamepad #2
* @name Phaser.Gamepad#pad2
* @property {Phaser.SinglePad} pad2 - Gamepad #2
* @readonly
*/
Object.defineProperty(Phaser.Gamepad.prototype, "pad2", {

    get: function () {
        return this._gamepads[1];
    }

});

/**
* Gamepad #3
* @name Phaser.Gamepad#pad3
* @property {Phaser.SinglePad} pad3 - Gamepad #3
* @readonly
*/
Object.defineProperty(Phaser.Gamepad.prototype, "pad3", {

    get: function () {
        return this._gamepads[2];
    }

});

/**
* Gamepad #4
* @name Phaser.Gamepad#pad4
* @property {Phaser.SinglePad} pad4 - Gamepad #4
* @readonly
*/
Object.defineProperty(Phaser.Gamepad.prototype, "pad4", {

    get: function () {
        return this._gamepads[3];
    }

});

Phaser.Gamepad.BUTTON_0 = 0;
Phaser.Gamepad.BUTTON_1 = 1;
Phaser.Gamepad.BUTTON_2 = 2;
Phaser.Gamepad.BUTTON_3 = 3;
Phaser.Gamepad.BUTTON_4 = 4;
Phaser.Gamepad.BUTTON_5 = 5;
Phaser.Gamepad.BUTTON_6 = 6;
Phaser.Gamepad.BUTTON_7 = 7;
Phaser.Gamepad.BUTTON_8 = 8;
Phaser.Gamepad.BUTTON_9 = 9;
Phaser.Gamepad.BUTTON_10 = 10;
Phaser.Gamepad.BUTTON_11 = 11;
Phaser.Gamepad.BUTTON_12 = 12;
Phaser.Gamepad.BUTTON_13 = 13;
Phaser.Gamepad.BUTTON_14 = 14;
Phaser.Gamepad.BUTTON_15 = 15;

Phaser.Gamepad.AXIS_0 = 0;
Phaser.Gamepad.AXIS_1 = 1;
Phaser.Gamepad.AXIS_2 = 2;
Phaser.Gamepad.AXIS_3 = 3;
Phaser.Gamepad.AXIS_4 = 4;
Phaser.Gamepad.AXIS_5 = 5;
Phaser.Gamepad.AXIS_6 = 6;
Phaser.Gamepad.AXIS_7 = 7;
Phaser.Gamepad.AXIS_8 = 8;
Phaser.Gamepad.AXIS_9 = 9;

// Below mapping applies to XBOX 360 Wired and Wireless controller on Google Chrome (tested on Windows 7).
// - Firefox uses different map! Separate amount of buttons and axes. DPAD = axis and not a button.
// In other words - discrepancies when using gamepads.

Phaser.Gamepad.XBOX360_A = 0;
Phaser.Gamepad.XBOX360_B = 1;
Phaser.Gamepad.XBOX360_X = 2;
Phaser.Gamepad.XBOX360_Y = 3;
Phaser.Gamepad.XBOX360_LEFT_BUMPER = 4;
Phaser.Gamepad.XBOX360_RIGHT_BUMPER = 5;
Phaser.Gamepad.XBOX360_LEFT_TRIGGER = 6;
Phaser.Gamepad.XBOX360_RIGHT_TRIGGER = 7;
Phaser.Gamepad.XBOX360_BACK = 8;
Phaser.Gamepad.XBOX360_START = 9;
Phaser.Gamepad.XBOX360_STICK_LEFT_BUTTON = 10;
Phaser.Gamepad.XBOX360_STICK_RIGHT_BUTTON = 11;

Phaser.Gamepad.XBOX360_DPAD_LEFT = 14;
Phaser.Gamepad.XBOX360_DPAD_RIGHT = 15;
Phaser.Gamepad.XBOX360_DPAD_UP = 12;
Phaser.Gamepad.XBOX360_DPAD_DOWN = 13;

//  On FF 0 = Y, 1 = X, 2 = Y, 3 = X, 4 = left bumper, 5 = dpad left, 6 = dpad right
Phaser.Gamepad.XBOX360_STICK_LEFT_X = 0;
Phaser.Gamepad.XBOX360_STICK_LEFT_Y = 1;
Phaser.Gamepad.XBOX360_STICK_RIGHT_X = 2;
Phaser.Gamepad.XBOX360_STICK_RIGHT_Y = 3;

//  PlayStation 3 controller (masquerading as xbox360 controller) button mappings

Phaser.Gamepad.PS3XC_X = 0;
Phaser.Gamepad.PS3XC_CIRCLE = 1;
Phaser.Gamepad.PS3XC_SQUARE = 2;
Phaser.Gamepad.PS3XC_TRIANGLE = 3;
Phaser.Gamepad.PS3XC_L1 = 4;
Phaser.Gamepad.PS3XC_R1 = 5;
Phaser.Gamepad.PS3XC_L2 = 6; // analog trigger, range 0..1
Phaser.Gamepad.PS3XC_R2 = 7; // analog trigger, range 0..1
Phaser.Gamepad.PS3XC_SELECT = 8;
Phaser.Gamepad.PS3XC_START = 9;
Phaser.Gamepad.PS3XC_STICK_LEFT_BUTTON = 10;
Phaser.Gamepad.PS3XC_STICK_RIGHT_BUTTON = 11;
Phaser.Gamepad.PS3XC_DPAD_UP = 12;
Phaser.Gamepad.PS3XC_DPAD_DOWN = 13;
Phaser.Gamepad.PS3XC_DPAD_LEFT = 14;
Phaser.Gamepad.PS3XC_DPAD_RIGHT = 15;
Phaser.Gamepad.PS3XC_STICK_LEFT_X = 0; // analog stick, range -1..1
Phaser.Gamepad.PS3XC_STICK_LEFT_Y = 1; // analog stick, range -1..1
Phaser.Gamepad.PS3XC_STICK_RIGHT_X = 2; // analog stick, range -1..1
Phaser.Gamepad.PS3XC_STICK_RIGHT_Y = 3; // analog stick, range -1..1

/**
* @author       @karlmacklin <tacklemcclean@gmail.com>
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A single Phaser Gamepad
* 
* @class Phaser.SinglePad
* @constructor
* @param {Phaser.Game} game - Current game instance.
* @param {object} padParent - The parent Phaser.Gamepad object (all gamepads reside under this)
*/
Phaser.SinglePad = function (game, padParent) {

    /**
    * @property {Phaser.Game} game - Local reference to game.
    */
    this.game = game;

    /**
    * @property {number} index - The gamepad index as per browsers data
    * @readonly
    */
    this.index = null;

    /**
    * @property {boolean} connected - Whether or not this particular gamepad is connected or not.
    * @readonly
    */
    this.connected = false;

    /**
    * @property {object} callbackContext - The context under which the callbacks are run.
    */
    this.callbackContext = this;

    /**
    * @property {function} onConnectCallback - This callback is invoked every time this gamepad is connected
    */
    this.onConnectCallback = null;

    /**
    * @property {function} onDisconnectCallback - This callback is invoked every time this gamepad is disconnected
    */
    this.onDisconnectCallback = null;

    /**
    * @property {function} onDownCallback - This callback is invoked every time a button is pressed down.
    */
    this.onDownCallback = null;

    /**
    * @property {function} onUpCallback - This callback is invoked every time a gamepad button is released.
    */
    this.onUpCallback = null;

    /**
    * @property {function} onAxisCallback - This callback is invoked every time an axis is changed.
    */
    this.onAxisCallback = null;

    /**
    * @property {function} onFloatCallback - This callback is invoked every time a button is changed to a value where value > 0 and value < 1.
    */
    this.onFloatCallback = null;

    /**
    * @property {number} deadZone - Dead zone for axis feedback - within this value you won't trigger updates.
    */
    this.deadZone = 0.26;

    /**
    * @property {Phaser.Gamepad} padParent - Main Phaser Gamepad object
    * @private
    */
    this._padParent = padParent;

    /**
    * @property {object} _rawPad - The 'raw' gamepad data.
    * @private
    */
    this._rawPad = null;

    /**
    * @property {number} _prevTimestamp - Used to check for differences between earlier polls and current state of gamepads.
    * @private
    */
    this._prevTimestamp = null;

    /**
    * @property {Array} _buttons - Array of Phaser.DeviceButton objects. This array is populated when the gamepad is connected.
    * @private
    */
    this._buttons = [];

    /**
    * @property {number} _buttonsLen - Length of the _buttons array.
    * @private
    */
    this._buttonsLen = 0;

    /**
    * @property {Array} _axes - Current axes state.
    * @private
    */
    this._axes = [];

    /**
    * @property {number} _axesLen - Length of the _axes array.
    * @private
    */
    this._axesLen = 0;

};

Phaser.SinglePad.prototype = {

    /**
    * Add callbacks to this Gamepad to handle connect / disconnect / button down / button up / axis change / float value buttons.
    * 
    * @method Phaser.SinglePad#addCallbacks
    * @param {object} context - The context under which the callbacks are run.
    * @param {object} callbacks - Object that takes six different callbak methods:
    * onConnectCallback, onDisconnectCallback, onDownCallback, onUpCallback, onAxisCallback, onFloatCallback
    */
    addCallbacks: function (context, callbacks) {

        if (typeof callbacks !== 'undefined')
        {
            this.onConnectCallback = (typeof callbacks.onConnect === 'function') ? callbacks.onConnect : this.onConnectCallback;
            this.onDisconnectCallback = (typeof callbacks.onDisconnect === 'function') ? callbacks.onDisconnect : this.onDisconnectCallback;
            this.onDownCallback = (typeof callbacks.onDown === 'function') ? callbacks.onDown : this.onDownCallback;
            this.onUpCallback = (typeof callbacks.onUp === 'function') ? callbacks.onUp : this.onUpCallback;
            this.onAxisCallback = (typeof callbacks.onAxis === 'function') ? callbacks.onAxis : this.onAxisCallback;
            this.onFloatCallback = (typeof callbacks.onFloat === 'function') ? callbacks.onFloat : this.onFloatCallback;

            this.callbackContext = context;
        }
    },

    /**
    * Gets a DeviceButton object from this controller to be stored and referenced locally.
    * The DeviceButton object can then be polled, have events attached to it, etc.
    *
    * @method Phaser.SinglePad#getButton
    * @param {number} buttonCode - The buttonCode of the button, i.e. Phaser.Gamepad.BUTTON_0, Phaser.Gamepad.XBOX360_A, etc.
    * @return {Phaser.DeviceButton} The DeviceButton object which you can store locally and reference directly.
    */
    getButton: function (buttonCode) {

        if (this._buttons[buttonCode])
        {
            return this._buttons[buttonCode];
        }
        else
        {
            return null;
        }

    },

    /**
    * Main update function called by Phaser.Gamepad.
    * 
    * @method Phaser.SinglePad#pollStatus
    */
    pollStatus: function () {

        if (!this.connected || !this.game.input.enabled || !this.game.input.gamepad.enabled || (this._rawPad.timestamp && (this._rawPad.timestamp === this._prevTimestamp)))
        {
            return;
        }

        for (var i = 0; i < this._buttonsLen; i++)
        {
            var rawButtonVal = isNaN(this._rawPad.buttons[i]) ? this._rawPad.buttons[i].value : this._rawPad.buttons[i];

            if (rawButtonVal !== this._buttons[i].value)
            {
                if (rawButtonVal === 1)
                {
                    this.processButtonDown(i, rawButtonVal);
                }
                else if (rawButtonVal === 0)
                {
                    this.processButtonUp(i, rawButtonVal);
                }
                else
                {
                    this.processButtonFloat(i, rawButtonVal);
                }
            }
        }
        
        for (var index = 0; index < this._axesLen; index++)
        {
            var value = this._rawPad.axes[index];

            if ((value > 0 && value > this.deadZone) || (value < 0 && value < -this.deadZone))
            {
                this.processAxisChange(index, value);
            }
            else
            {
                this.processAxisChange(index, 0);
            }
        }

        this._prevTimestamp = this._rawPad.timestamp;

    },

    /**
    * Gamepad connect function, should be called by Phaser.Gamepad.
    * 
    * @method Phaser.SinglePad#connect
    * @param {object} rawPad - The raw gamepad object
    */
    connect: function (rawPad) {

        var triggerCallback = !this.connected;

        this.connected = true;
        this.index = rawPad.index;

        this._rawPad = rawPad;

        this._buttons = [];
        this._buttonsLen = rawPad.buttons.length;

        this._axes = [];
        this._axesLen = rawPad.axes.length;

        for (var a = 0; a < this._axesLen; a++)
        {
            this._axes[a] = rawPad.axes[a];
        }

        for (var buttonCode in rawPad.buttons)
        {
            buttonCode = parseInt(buttonCode, 10);
            this._buttons[buttonCode] = new Phaser.DeviceButton(this, buttonCode);
        }

        if (triggerCallback && this._padParent.onConnectCallback)
        {
            this._padParent.onConnectCallback.call(this._padParent.callbackContext, this.index);
        }

        if (triggerCallback && this.onConnectCallback)
        {
            this.onConnectCallback.call(this.callbackContext);
        }

    },

    /**
    * Gamepad disconnect function, should be called by Phaser.Gamepad.
    * 
    * @method Phaser.SinglePad#disconnect
    */
    disconnect: function () {

        var triggerCallback = this.connected;
        var disconnectingIndex = this.index;

        this.connected = false;
        this.index = null;

        this._rawPad = undefined;

        for (var i = 0; i < this._buttonsLen; i++)
        {
            this._buttons[i].destroy();
        }

        this._buttons = [];
        this._buttonsLen = 0;

        this._axes = [];
        this._axesLen = 0;

        if (triggerCallback && this._padParent.onDisconnectCallback)
        {
            this._padParent.onDisconnectCallback.call(this._padParent.callbackContext, disconnectingIndex);
        }

        if (triggerCallback && this.onDisconnectCallback)
        {
            this.onDisconnectCallback.call(this.callbackContext);
        }

    },

    /**
     * Destroys this object and associated callback references.
     *
     * @method Phaser.SinglePad#destroy
     */
    destroy: function () {

        this._rawPad = undefined;

        for (var i = 0; i < this._buttonsLen; i++)
        {
            this._buttons[i].destroy();
        }

        this._buttons = [];
        this._buttonsLen = 0;

        this._axes = [];
        this._axesLen = 0;

        this.onConnectCallback = null;
        this.onDisconnectCallback = null;
        this.onDownCallback = null;
        this.onUpCallback = null;
        this.onAxisCallback = null;
        this.onFloatCallback = null;

    },

    /**
    * Handles changes in axis.
    * 
    * @method Phaser.SinglePad#processAxisChange
    * @param {object} axisState - State of the relevant axis
    */
    processAxisChange: function (index, value) {

        if (this._axes[index] === value)
        {
            return;
        }

        this._axes[index] = value;

        if (this._padParent.onAxisCallback)
        {
            this._padParent.onAxisCallback.call(this._padParent.callbackContext, this, index, value);
        }

        if (this.onAxisCallback)
        {
            this.onAxisCallback.call(this.callbackContext, this, index, value);
        }

    },

    /**
    * Handles button down press.
    * 
    * @method Phaser.SinglePad#processButtonDown
    * @param {number} buttonCode - Which buttonCode of this button
    * @param {object} value - Button value
    */
    processButtonDown: function (buttonCode, value) {

        if (this._buttons[buttonCode])
        {
            this._buttons[buttonCode].start(null, value);
        }

        if (this._padParent.onDownCallback)
        {
            this._padParent.onDownCallback.call(this._padParent.callbackContext, buttonCode, value, this.index);
        }

        if (this.onDownCallback)
        {
            this.onDownCallback.call(this.callbackContext, buttonCode, value);
        }

    },

    /**
    * Handles button release.
    * 
    * @method Phaser.SinglePad#processButtonUp
    * @param {number} buttonCode - Which buttonCode of this button
    * @param {object} value - Button value
    */
    processButtonUp: function (buttonCode, value) {

        if (this._padParent.onUpCallback)
        {
            this._padParent.onUpCallback.call(this._padParent.callbackContext, buttonCode, value, this.index);
        }

        if (this.onUpCallback)
        {
            this.onUpCallback.call(this.callbackContext, buttonCode, value);
        }

        if (this._buttons[buttonCode])
        {
            this._buttons[buttonCode].stop(null, value);
        }

    },

    /**
    * Handles buttons with floating values (like analog buttons that acts almost like an axis but still registers like a button)
    * 
    * @method Phaser.SinglePad#processButtonFloat
    * @param {number} buttonCode - Which buttonCode of this button
    * @param {object} value - Button value (will range somewhere between 0 and 1, but not specifically 0 or 1.
    */
    processButtonFloat: function (buttonCode, value) {

        if (this._padParent.onFloatCallback)
        {
            this._padParent.onFloatCallback.call(this._padParent.callbackContext, buttonCode, value, this.index);
        }

        if (this.onFloatCallback)
        {
            this.onFloatCallback.call(this.callbackContext, buttonCode, value);
        }

        if (this._buttons[buttonCode])
        {
            this._buttons[buttonCode].padFloat(value);
        }

    },

    /**
    * Returns value of requested axis.
    * 
    * @method Phaser.SinglePad#axis
    * @param {number} axisCode - The index of the axis to check
    * @return {number} Axis value if available otherwise false
    */
    axis: function (axisCode) {

        if (this._axes[axisCode])
        {
            return this._axes[axisCode];
        }

        return false;

    },

    /**
    * Returns true if the button is pressed down.
    * 
    * @method Phaser.SinglePad#isDown
    * @param {number} buttonCode - The buttonCode of the button to check.
    * @return {boolean} True if the button is pressed down.
    */
    isDown: function (buttonCode) {

        if (this._buttons[buttonCode])
        {
            return this._buttons[buttonCode].isDown;
        }

        return false;

    },

    /**
    * Returns true if the button is not currently pressed.
    * 
    * @method Phaser.SinglePad#isUp
    * @param {number} buttonCode - The buttonCode of the button to check.
    * @return {boolean} True if the button is not currently pressed down.
    */
    isUp: function (buttonCode) {

        if (this._buttons[buttonCode])
        {
            return this._buttons[buttonCode].isUp;
        }

        return false;

    },

    /**
    * Returns the "just released" state of a button from this gamepad. Just released is considered as being true if the button was released within the duration given (default 250ms).
    * 
    * @method Phaser.SinglePad#justReleased
    * @param {number} buttonCode - The buttonCode of the button to check for.
    * @param {number} [duration=250] - The duration below which the button is considered as being just released.
    * @return {boolean} True if the button is just released otherwise false.
    */
    justReleased: function (buttonCode, duration) {

        if (this._buttons[buttonCode])
        {
            return this._buttons[buttonCode].justReleased(duration);
        }

    },

    /**
    * Returns the "just pressed" state of a button from this gamepad. Just pressed is considered true if the button was pressed down within the duration given (default 250ms).
    * 
    * @method Phaser.SinglePad#justPressed
    * @param {number} buttonCode - The buttonCode of the button to check for.
    * @param {number} [duration=250] - The duration below which the button is considered as being just pressed.
    * @return {boolean} True if the button is just pressed otherwise false.
    */
    justPressed: function (buttonCode, duration) {

        if (this._buttons[buttonCode])
        {
            return this._buttons[buttonCode].justPressed(duration);
        }

    },

    /**
    * Returns the value of a gamepad button. Intended mainly for cases when you have floating button values, for example
    * analog trigger buttons on the XBOX 360 controller.
    * 
    * @method Phaser.SinglePad#buttonValue
    * @param {number} buttonCode - The buttonCode of the button to check.
    * @return {number} Button value if available otherwise null. Be careful as this can incorrectly evaluate to 0.
    */
    buttonValue: function (buttonCode) {

        if (this._buttons[buttonCode])
        {
            return this._buttons[buttonCode].value;
        }

        return null;

    },

    /**
    * Reset all buttons/axes of this gamepad.
    * 
    * @method Phaser.SinglePad#reset
    */
    reset: function () {

        for (var j = 0; j < this._axes.length; j++)
        {
            this._axes[j] = 0;
        }

    }

};

Phaser.SinglePad.prototype.constructor = Phaser.SinglePad;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* If you need more fine-grained control over the handling of specific keys you can create and use Phaser.Key objects.
* 
* @class Phaser.Key
* @constructor
* @param {Phaser.Game} game - Current game instance.
* @param {integer} keycode - The key code this Key is responsible for. See {@link Phaser.KeyCode}.
*/
Phaser.Key = function (game, keycode) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * The enabled state of the key - see `enabled`.
    * @property {boolean} _enabled
    * @private
    */
    this._enabled = true;

    /**
    * @property {object} event - Stores the most recent DOM event.
    * @readonly
    */
    this.event = null;

    /**
    * @property {boolean} isDown - The "down" state of the key. This will remain `true` for as long as the keyboard thinks this key is held down.
    * @default
    */
    this.isDown = false;

    /**
    * @property {boolean} isUp - The "up" state of the key. This will remain `true` for as long as the keyboard thinks this key is up.
    * @default
    */
    this.isUp = true;

    /**
    * @property {boolean} altKey - The down state of the ALT key, if pressed at the same time as this key.
    * @default
    */
    this.altKey = false;

    /**
    * @property {boolean} ctrlKey - The down state of the CTRL key, if pressed at the same time as this key.
    * @default
    */
    this.ctrlKey = false;

    /**
    * @property {boolean} shiftKey - The down state of the SHIFT key, if pressed at the same time as this key.
    * @default
    */
    this.shiftKey = false;

    /**
    * @property {number} timeDown - The timestamp when the key was last pressed down. This is based on Game.time.now.
    */
    this.timeDown = 0;

    /**
    * If the key is down this value holds the duration of that key press and is constantly updated.
    * If the key is up it holds the duration of the previous down session.
    * @property {number} duration - The number of milliseconds this key has been held down for.
    * @default
    */
    this.duration = 0;

    /**
    * @property {number} timeUp - The timestamp when the key was last released. This is based on Game.time.now.
    * @default
    */
    this.timeUp = -2500;

    /**
    * @property {number} repeats - If a key is held down this holds down the number of times the key has 'repeated'.
    * @default
    */
    this.repeats = 0;

    /**
    * @property {number} keyCode - The keycode of this key.
    */
    this.keyCode = keycode;

    /**
    * @property {Phaser.Signal} onDown - This Signal is dispatched every time this Key is pressed down. It is only dispatched once (until the key is released again).
    */
    this.onDown = new Phaser.Signal();

    /**
    * @property {function} onHoldCallback - A callback that is called while this Key is held down. Warning: Depending on refresh rate that could be 60+ times per second.
    */
    this.onHoldCallback = null;

    /**
    * @property {object} onHoldContext - The context under which the onHoldCallback will be called.
    */
    this.onHoldContext = null;

    /**
    * @property {Phaser.Signal} onUp - This Signal is dispatched every time this Key is released. It is only dispatched once (until the key is pressed and released again).
    */
    this.onUp = new Phaser.Signal();

    /**
     * @property {boolean} _justDown - True if the key has just been pressed (NOTE: requires to be reset, see justDown getter)
     * @private
     */
    this._justDown = false;

    /**
     * @property {boolean} _justUp - True if the key has just been pressed (NOTE: requires to be reset, see justDown getter)
     * @private
     */
    this._justUp = false;

};

Phaser.Key.prototype = {

    /**
    * Called automatically by Phaser.Keyboard.
    * 
    * @method Phaser.Key#update
    * @protected
    */
    update: function () {

        if (!this._enabled) { return; }

        if (this.isDown)
        {
            this.duration = this.game.time.time - this.timeDown;
            this.repeats++;

            if (this.onHoldCallback)
            {
                this.onHoldCallback.call(this.onHoldContext, this);
            }
        }

    },

    /**
    * Called automatically by Phaser.Keyboard.
    * 
    * @method Phaser.Key#processKeyDown
    * @param {KeyboardEvent} event - The DOM event that triggered this.
    * @protected
    */
    processKeyDown: function (event) {

        if (!this._enabled) { return; }

        this.event = event;

        // exit if this key down is from auto-repeat
        if (this.isDown)
        {
            return;
        }

        this.altKey = event.altKey;
        this.ctrlKey = event.ctrlKey;
        this.shiftKey = event.shiftKey;

        this.isDown = true;
        this.isUp = false;
        this.timeDown = this.game.time.time;
        this.duration = 0;
        this.repeats = 0;

        // _justDown will remain true until it is read via the justDown Getter
        // this enables the game to poll for past presses, or reset it at the start of a new game state
        this._justDown = true;

        this.onDown.dispatch(this);

    },

    /**
    * Called automatically by Phaser.Keyboard.
    * 
    * @method Phaser.Key#processKeyUp
    * @param {KeyboardEvent} event - The DOM event that triggered this.
    * @protected
    */
    processKeyUp: function (event) {

        if (!this._enabled) { return; }

        this.event = event;

        if (this.isUp)
        {
            return;
        }

        this.isDown = false;
        this.isUp = true;
        this.timeUp = this.game.time.time;
        this.duration = this.game.time.time - this.timeDown;

        // _justUp will remain true until it is read via the justUp Getter
        // this enables the game to poll for past presses, or reset it at the start of a new game state
        this._justUp = true;

        this.onUp.dispatch(this);

    },

    /**
    * Resets the state of this Key.
    *
    * This sets isDown to false, isUp to true, resets the time to be the current time, and _enables_ the key.
    * In addition, if it is a "hard reset", it clears clears any callbacks associated with the onDown and onUp events and removes the onHoldCallback.
    *
    * @method Phaser.Key#reset
    * @param {boolean} [hard=true] - A soft reset won't reset any events or callbacks; a hard reset will.
    */
    reset: function (hard) {

        if (hard === undefined) { hard = true; }

        this.isDown = false;
        this.isUp = true;
        this.timeUp = this.game.time.time;
        this.duration = 0;
        this._enabled = true; // .enabled causes reset(false)
        this._justDown = false;
        this._justUp = false;

        if (hard)
        {
            this.onDown.removeAll();
            this.onUp.removeAll();
            this.onHoldCallback = null;
            this.onHoldContext = null;
        }

    },

    /**
    * Returns `true` if the Key was pressed down within the `duration` value given, or `false` if it either isn't down,
    * or was pressed down longer ago than then given duration.
    * 
    * @method Phaser.Key#downDuration
    * @param {number} [duration=50] - The duration within which the key is considered as being just pressed. Given in ms.
    * @return {boolean} True if the key was pressed down within the given duration.
    */
    downDuration: function (duration) {

        if (duration === undefined) { duration = 50; }

        return (this.isDown && this.duration < duration);

    },

    /**
    * Returns `true` if the Key was pressed down within the `duration` value given, or `false` if it either isn't down,
    * or was pressed down longer ago than then given duration.
    * 
    * @method Phaser.Key#upDuration
    * @param {number} [duration=50] - The duration within which the key is considered as being just released. Given in ms.
    * @return {boolean} True if the key was released within the given duration.
    */
    upDuration: function (duration) {

        if (duration === undefined) { duration = 50; }

        return (!this.isDown && ((this.game.time.time - this.timeUp) < duration));

    }

};

/**
* The justDown value allows you to test if this Key has just been pressed down or not.
* When you check this value it will return `true` if the Key is down, otherwise `false`.
* You can only call justDown once per key press. It will only return `true` once, until the Key is released and pressed down again.
* This allows you to use it in situations where you want to check if this key is down without using a Signal, such as in a core game loop.
* 
* @property {boolean} justDown
* @memberof Phaser.Key
* @default false
*/
Object.defineProperty(Phaser.Key.prototype, "justDown", {

    get: function () {

        var current = this._justDown;
        this._justDown = false;
        return current;

    }

});

/**
* The justUp value allows you to test if this Key has just been released or not.
* When you check this value it will return `true` if the Key is up, otherwise `false`.
* You can only call justUp once per key release. It will only return `true` once, until the Key is pressed down and released again.
* This allows you to use it in situations where you want to check if this key is up without using a Signal, such as in a core game loop.
* 
* @property {boolean} justUp
* @memberof Phaser.Key
* @default false
*/
Object.defineProperty(Phaser.Key.prototype, "justUp", {

    get: function () {

        var current = this._justUp;
        this._justUp = false;
        return current;

    }

});

/**
* An enabled key processes its update and dispatches events.
* A key can be disabled momentarily at runtime instead of deleting it.
* 
* @property {boolean} enabled
* @memberof Phaser.Key
* @default true
*/
Object.defineProperty(Phaser.Key.prototype, "enabled", {

    get: function () {

        return this._enabled;

    },

    set: function (value) {

        value = !!value;

        if (value !== this._enabled)
        {
            if (!value)
            {
                this.reset(false);
            }

            this._enabled = value;
        }
    }

});

Phaser.Key.prototype.constructor = Phaser.Key;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Keyboard class monitors keyboard input and dispatches keyboard events.
*
* _Note_: many keyboards are unable to process certain combinations of keys due to hardware limitations known as ghosting.
* See http://www.html5gamedevs.com/topic/4876-impossible-to-use-more-than-2-keyboard-input-buttons-at-the-same-time/ for more details.
*
* Also please be aware that certain browser extensions can disable or override Phaser keyboard handling.
* For example the Chrome extension vimium is known to disable Phaser from using the D key. And there are others.
* So please check your extensions before opening Phaser issues.
*
* @class Phaser.Keyboard
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.Keyboard = function (game) {

    /**
    * @property {Phaser.Game} game - Local reference to game.
    */
    this.game = game;

    /**
    * Keyboard input will only be processed if enabled.
    * @property {boolean} enabled
    * @default
    */
    this.enabled = true;

    /**
    * @property {object} event - The most recent DOM event from keydown or keyup. This is updated every time a new key is pressed or released.
    */
    this.event = null;

    /**
    * @property {object} pressEvent - The most recent DOM event from keypress.
    */
    this.pressEvent = null;

    /**
    * @property {object} callbackContext - The context under which the callbacks are run.
    */
    this.callbackContext = this;

    /**
    * @property {function} onDownCallback - This callback is invoked every time a key is pressed down, including key repeats when a key is held down.
    */
    this.onDownCallback = null;

    /**
    * @property {function} onPressCallback - This callback is invoked every time a DOM onkeypress event is raised, which is only for printable keys.
    */
    this.onPressCallback = null;

    /**
    * @property {function} onUpCallback - This callback is invoked every time a key is released.
    */
    this.onUpCallback = null;

    /**
    * @property {array<Phaser.Key>} _keys - The array the Phaser.Key objects are stored in.
    * @private
    */
    this._keys = [];

    /**
    * @property {array} _capture - The array the key capture values are stored in.
    * @private
    */
    this._capture = [];

    /**
    * @property {function} _onKeyDown
    * @private
    * @default
    */
    this._onKeyDown = null;

    /**
    * @property {function} _onKeyPress
    * @private
    * @default
    */
    this._onKeyPress = null;

    /**
    * @property {function} _onKeyUp
    * @private
    * @default
    */
    this._onKeyUp = null;

    /**
    * @property {number} _i - Internal cache var
    * @private
    */
    this._i = 0;

    /**
    * @property {number} _k - Internal cache var
    * @private
    */
    this._k = 0;

};

Phaser.Keyboard.prototype = {

    /**
    * Add callbacks to the Keyboard handler so that each time a key is pressed down or released the callbacks are activated.
    *
    * @method Phaser.Keyboard#addCallbacks
    * @param {object} context - The context under which the callbacks are run.
    * @param {function} [onDown=null] - This callback is invoked every time a key is pressed down.
    * @param {function} [onUp=null] - This callback is invoked every time a key is released.
    * @param {function} [onPress=null] - This callback is invoked every time the onkeypress event is raised.
    */
    addCallbacks: function (context, onDown, onUp, onPress) {

        this.callbackContext = context;

        if (onDown !== undefined && onDown !== null)
        {
            this.onDownCallback = onDown;
        }

        if (onUp !== undefined && onUp !== null)
        {
            this.onUpCallback = onUp;
        }

        if (onPress !== undefined && onPress !== null)
        {
            this.onPressCallback = onPress;
        }

    },

    /**
    * If you need more fine-grained control over a Key you can create a new Phaser.Key object via this method.
    * The Key object can then be polled, have events attached to it, etc.
    *
    * @method Phaser.Keyboard#addKey
    * @param {integer} keycode - The {@link Phaser.KeyCode keycode} of the key.
    * @return {Phaser.Key} The Key object which you can store locally and reference directly.
    */
    addKey: function (keycode) {

        if (!this._keys[keycode])
        {
            this._keys[keycode] = new Phaser.Key(this.game, keycode);

            this.addKeyCapture(keycode);
        }

        return this._keys[keycode];

    },

    /**
    * A practical way to create an object containing user selected hotkeys.
    *
    * For example,
    *
    *     addKeys( { 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S, 'left': Phaser.KeyCode.A, 'right': Phaser.KeyCode.D } );
    *
    * would return an object containing properties (`up`, `down`, `left` and `right`) referring to {@link Phaser.Key} object.
    *
    * @method Phaser.Keyboard#addKeys
    * @param {object} keys - A key mapping object, i.e. `{ 'up': Phaser.KeyCode.W, 'down': Phaser.KeyCode.S }` or `{ 'up': 52, 'down': 53 }`.
    * @return {object} An object containing the properties mapped to {@link Phaser.Key} values.
    */
    addKeys: function (keys) {

        var output = {};

        for (var key in keys)
        {
            output[key] = this.addKey(keys[key]);
        }

        return output;

    },

    /**
    * Removes a Key object from the Keyboard manager.
    *
    * @method Phaser.Keyboard#removeKey
    * @param {integer} keycode - The {@link Phaser.KeyCode keycode} of the key to remove.
    */
    removeKey: function (keycode) {

        if (this._keys[keycode])
        {
            this._keys[keycode] = null;

            this.removeKeyCapture(keycode);
        }

    },

    /**
    * Creates and returns an object containing 4 hotkeys for Up, Down, Left and Right.
    *
    * @method Phaser.Keyboard#createCursorKeys
    * @return {object} An object containing properties: `up`, `down`, `left` and `right` of {@link Phaser.Key} objects.
    */
    createCursorKeys: function () {

        return this.addKeys({ 'up': Phaser.KeyCode.UP, 'down': Phaser.KeyCode.DOWN, 'left': Phaser.KeyCode.LEFT, 'right': Phaser.KeyCode.RIGHT });

    },

    /**
    * Starts the Keyboard event listeners running (keydown and keyup). They are attached to the window.
    * This is called automatically by Phaser.Input and should not normally be invoked directly.
    *
    * @method Phaser.Keyboard#start
    * @protected
    */
    start: function () {

        if (this.game.device.cocoonJS)
        {
            return;
        }

        if (this._onKeyDown !== null)
        {
            //  Avoid setting multiple listeners
            return;
        }

        var _this = this;

        this._onKeyDown = function (event) {
            return _this.processKeyDown(event);
        };

        this._onKeyUp = function (event) {
            return _this.processKeyUp(event);
        };

        this._onKeyPress = function (event) {
            return _this.processKeyPress(event);
        };

        window.addEventListener('keydown', this._onKeyDown, false);
        window.addEventListener('keyup', this._onKeyUp, false);
        window.addEventListener('keypress', this._onKeyPress, false);

    },

    /**
    * Stops the Keyboard event listeners from running (keydown, keyup and keypress). They are removed from the window.
    *
    * @method Phaser.Keyboard#stop
    */
    stop: function () {

        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        window.removeEventListener('keypress', this._onKeyPress);

        this._onKeyDown = null;
        this._onKeyUp = null;
        this._onKeyPress = null;

    },

    /**
    * Stops the Keyboard event listeners from running (keydown and keyup). They are removed from the window.
    * Also clears all key captures and currently created Key objects.
    *
    * @method Phaser.Keyboard#destroy
    */
    destroy: function () {

        this.stop();

        this.clearCaptures();

        this._keys.length = 0;
        this._i = 0;

    },

    /**
    * By default when a key is pressed Phaser will not stop the event from propagating up to the browser.
    * There are some keys this can be annoying for, like the arrow keys or space bar, which make the browser window scroll.
    *
    * The `addKeyCapture` method enables consuming keyboard event for specific keys so it doesn't bubble up to the the browser
    * and cause the default browser behavior.
    *
    * Pass in either a single keycode or an array/hash of keycodes.
    *
    * @method Phaser.Keyboard#addKeyCapture
    * @param {integer|integer[]|object} keycode - Either a single {@link Phaser.KeyCode keycode} or an array/hash of keycodes such as `[65, 67, 68]`.
    */
    addKeyCapture: function (keycode) {

        if (typeof keycode === 'object')
        {
            for (var key in keycode)
            {
                this._capture[keycode[key]] = true;
            }
        }
        else
        {
            this._capture[keycode] = true;
        }
    },

    /**
    * Removes an existing key capture.
    *
    * @method Phaser.Keyboard#removeKeyCapture
    * @param {integer} keycode - The {@link Phaser.KeyCode keycode} to remove capturing of.
    */
    removeKeyCapture: function (keycode) {

        delete this._capture[keycode];

    },

    /**
    * Clear all set key captures.
    *
    * @method Phaser.Keyboard#clearCaptures
    */
    clearCaptures: function () {

        this._capture = {};

    },

    /**
    * Updates all currently defined keys.
    *
    * @method Phaser.Keyboard#update
    */
    update: function () {

        this._i = this._keys.length;

        while (this._i--)
        {
            if (this._keys[this._i])
            {
                this._keys[this._i].update();
            }
        }

    },

    /**
    * Process the keydown event.
    *
    * @method Phaser.Keyboard#processKeyDown
    * @param {KeyboardEvent} event
    * @protected
    */
    processKeyDown: function (event) {

        this.event = event;

        if (!this.game.input.enabled || !this.enabled)
        {
            return;
        }

        var key = event.keyCode;

        //   The event is being captured but another hotkey may need it
        if (this._capture[key])
        {
            event.preventDefault();
        }

        if (!this._keys[key])
        {
            this._keys[key] = new Phaser.Key(this.game, key);
        }

        this._keys[key].processKeyDown(event);

        this._k = key;

        if (this.onDownCallback)
        {
            this.onDownCallback.call(this.callbackContext, event);
        }

    },

    /**
    * Process the keypress event.
    *
    * @method Phaser.Keyboard#processKeyPress
    * @param {KeyboardEvent} event
    * @protected
    */
    processKeyPress: function (event) {

        this.pressEvent = event;

        if (!this.game.input.enabled || !this.enabled)
        {
            return;
        }

        if (this.onPressCallback)
        {
            this.onPressCallback.call(this.callbackContext, String.fromCharCode(event.charCode), event);
        }

    },

    /**
    * Process the keyup event.
    *
    * @method Phaser.Keyboard#processKeyUp
    * @param {KeyboardEvent} event
    * @protected
    */
    processKeyUp: function (event) {

        this.event = event;

        if (!this.game.input.enabled || !this.enabled)
        {
            return;
        }

        var key = event.keyCode;

        if (this._capture[key])
        {
            event.preventDefault();
        }

        if (!this._keys[key])
        {
            this._keys[key] = new Phaser.Key(this.game, key);
        }

        this._keys[key].processKeyUp(event);

        if (this.onUpCallback)
        {
            this.onUpCallback.call(this.callbackContext, event);
        }

    },

    /**
    * Resets all Keys.
    *
    * @method Phaser.Keyboard#reset
    * @param {boolean} [hard=true] - A soft reset won't reset any events or callbacks that are bound to the Keys. A hard reset will.
    */
    reset: function (hard) {

        if (hard === undefined) { hard = true; }

        this.event = null;

        var i = this._keys.length;

        while (i--)
        {
            if (this._keys[i])
            {
                this._keys[i].reset(hard);
            }
        }

    },

    /**
    * Returns `true` if the Key was pressed down within the `duration` value given, or `false` if it either isn't down,
    * or was pressed down longer ago than then given duration.
    * 
    * @method Phaser.Keyboard#downDuration
    * @param {integer} keycode - The {@link Phaser.KeyCode keycode} of the key to check: i.e. Phaser.KeyCode.UP or Phaser.KeyCode.SPACEBAR.
    * @param {number} [duration=50] - The duration within which the key is considered as being just pressed. Given in ms.
    * @return {boolean} True if the key was pressed down within the given duration, false if not or null if the Key wasn't found.
    */
    downDuration: function (keycode, duration) {

        if (this._keys[keycode])
        {
            return this._keys[keycode].downDuration(duration);
        }
        else
        {
            return null;
        }

    },

    /**
    * Returns `true` if the Key was pressed down within the `duration` value given, or `false` if it either isn't down,
    * or was pressed down longer ago than then given duration.
    * 
    * @method Phaser.Keyboard#upDuration
    * @param {Phaser.KeyCode|integer} keycode - The keycode of the key to check, i.e. Phaser.KeyCode.UP or Phaser.KeyCode.SPACEBAR.
    * @param {number} [duration=50] - The duration within which the key is considered as being just released. Given in ms.
    * @return {boolean} True if the key was released within the given duration, false if not or null if the Key wasn't found.
    */
    upDuration: function (keycode, duration) {

        if (this._keys[keycode])
        {
            return this._keys[keycode].upDuration(duration);
        }
        else
        {
            return null;
        }

    },

    /**
    * Returns true of the key is currently pressed down. Note that it can only detect key presses on the web browser.
    *
    * @method Phaser.Keyboard#isDown
    * @param {integer} keycode - The {@link Phaser.KeyCode keycode} of the key to check: i.e. Phaser.KeyCode.UP or Phaser.KeyCode.SPACEBAR.
    * @return {boolean} True if the key is currently down, false if not or null if the Key wasn't found.
    */
    isDown: function (keycode) {

        if (this._keys[keycode])
        {
            return this._keys[keycode].isDown;
        }
        else
        {
            return null;
        }

    }

};

/**
* Returns the string value of the most recently pressed key.
* @name Phaser.Keyboard#lastChar
* @property {string} lastChar - The string value of the most recently pressed key.
* @readonly
*/
Object.defineProperty(Phaser.Keyboard.prototype, "lastChar", {

    get: function () {

        if (this.event.charCode === 32)
        {
            return '';
        }
        else
        {
            return String.fromCharCode(this.pressEvent.charCode);
        }

    }

});

/**
* Returns the most recently pressed Key. This is a Phaser.Key object and it changes every time a key is pressed.
* @name Phaser.Keyboard#lastKey
* @property {Phaser.Key} lastKey - The most recently pressed Key.
* @readonly
*/
Object.defineProperty(Phaser.Keyboard.prototype, "lastKey", {

    get: function () {

        return this._keys[this._k];

    }

});

Phaser.Keyboard.prototype.constructor = Phaser.Keyboard;

/**
* A key code represents a physical key on a keyboard.
*
* The KeyCode class contains commonly supported keyboard key codes which can be used
* as keycode`-parameters in several {@link Phaser.Keyboard} and {@link Phaser.Key} methods.
*
* _Note_: These values should only be used indirectly, eg. as `Phaser.KeyCode.KEY`.
* Future versions may replace the actual values, such that they remain compatible with `keycode`-parameters.
* The current implementation maps to the {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode KeyboardEvent.keyCode} property.
*
* _Note_: Use `Phaser.KeyCode.KEY` instead of `Phaser.Keyboard.KEY` to refer to a key code;
* the latter approach is supported for compatibility.
*
* @class Phaser.KeyCode
*/
Phaser.KeyCode = {
    /** @static */
    A: "A".charCodeAt(0),
    /** @static */
    B: "B".charCodeAt(0),
    /** @static */
    C: "C".charCodeAt(0),
    /** @static */
    D: "D".charCodeAt(0),
    /** @static */
    E: "E".charCodeAt(0),
    /** @static */
    F: "F".charCodeAt(0),
    /** @static */
    G: "G".charCodeAt(0),
    /** @static */
    H: "H".charCodeAt(0),
    /** @static */
    I: "I".charCodeAt(0),
    /** @static */
    J: "J".charCodeAt(0),
    /** @static */
    K: "K".charCodeAt(0),
    /** @static */
    L: "L".charCodeAt(0),
    /** @static */
    M: "M".charCodeAt(0),
    /** @static */
    N: "N".charCodeAt(0),
    /** @static */
    O: "O".charCodeAt(0),
    /** @static */
    P: "P".charCodeAt(0),
    /** @static */
    Q: "Q".charCodeAt(0),
    /** @static */
    R: "R".charCodeAt(0),
    /** @static */
    S: "S".charCodeAt(0),
    /** @static */
    T: "T".charCodeAt(0),
    /** @static */
    U: "U".charCodeAt(0),
    /** @static */
    V: "V".charCodeAt(0),
    /** @static */
    W: "W".charCodeAt(0),
    /** @static */
    X: "X".charCodeAt(0),
    /** @static */
    Y: "Y".charCodeAt(0),
    /** @static */
    Z: "Z".charCodeAt(0),
    /** @static */
    ZERO: "0".charCodeAt(0),
    /** @static */
    ONE: "1".charCodeAt(0),
    /** @static */
    TWO: "2".charCodeAt(0),
    /** @static */
    THREE: "3".charCodeAt(0),
    /** @static */
    FOUR: "4".charCodeAt(0),
    /** @static */
    FIVE: "5".charCodeAt(0),
    /** @static */
    SIX: "6".charCodeAt(0),
    /** @static */
    SEVEN: "7".charCodeAt(0),
    /** @static */
    EIGHT: "8".charCodeAt(0),
    /** @static */
    NINE: "9".charCodeAt(0),
    /** @static */
    NUMPAD_0: 96,
    /** @static */
    NUMPAD_1: 97,
    /** @static */
    NUMPAD_2: 98,
    /** @static */
    NUMPAD_3: 99,
    /** @static */
    NUMPAD_4: 100,
    /** @static */
    NUMPAD_5: 101,
    /** @static */
    NUMPAD_6: 102,
    /** @static */
    NUMPAD_7: 103,
    /** @static */
    NUMPAD_8: 104,
    /** @static */
    NUMPAD_9: 105,
    /** @static */
    NUMPAD_MULTIPLY: 106,
    /** @static */
    NUMPAD_ADD: 107,
    /** @static */
    NUMPAD_ENTER: 108,
    /** @static */
    NUMPAD_SUBTRACT: 109,
    /** @static */
    NUMPAD_DECIMAL: 110,
    /** @static */
    NUMPAD_DIVIDE: 111,
    /** @static */
    F1: 112,
    /** @static */
    F2: 113,
    /** @static */
    F3: 114,
    /** @static */
    F4: 115,
    /** @static */
    F5: 116,
    /** @static */
    F6: 117,
    /** @static */
    F7: 118,
    /** @static */
    F8: 119,
    /** @static */
    F9: 120,
    /** @static */
    F10: 121,
    /** @static */
    F11: 122,
    /** @static */
    F12: 123,
    /** @static */
    F13: 124,
    /** @static */
    F14: 125,
    /** @static */
    F15: 126,
    /** @static */
    COLON: 186,
    /** @static */
    EQUALS: 187,
    /** @static */
    COMMA: 188,
    /** @static */
    UNDERSCORE: 189,
    /** @static */
    PERIOD: 190,
    /** @static */
    QUESTION_MARK: 191,
    /** @static */
    TILDE: 192,
    /** @static */
    OPEN_BRACKET: 219,
    /** @static */
    BACKWARD_SLASH: 220,
    /** @static */
    CLOSED_BRACKET: 221,
    /** @static */
    QUOTES: 222,
    /** @static */
    BACKSPACE: 8,
    /** @static */
    TAB: 9,
    /** @static */
    CLEAR: 12,
    /** @static */
    ENTER: 13,
    /** @static */
    SHIFT: 16,
    /** @static */
    CONTROL: 17,
    /** @static */
    ALT: 18,
    /** @static */
    CAPS_LOCK: 20,
    /** @static */
    ESC: 27,
    /** @static */
    SPACEBAR: 32,
    /** @static */
    PAGE_UP: 33,
    /** @static */
    PAGE_DOWN: 34,
    /** @static */
    END: 35,
    /** @static */
    HOME: 36,
    /** @static */
    LEFT: 37,
    /** @static */
    UP: 38,
    /** @static */
    RIGHT: 39,
    /** @static */
    DOWN: 40,
    /** @static */
    PLUS: 43,
    /** @static */
    MINUS: 44,
    /** @static */
    INSERT: 45,
    /** @static */
    DELETE: 46,
    /** @static */
    HELP: 47,
    /** @static */
    NUM_LOCK: 144
};

// Duplicate Phaser.KeyCode values in Phaser.Keyboard for compatibility
for (var key in Phaser.KeyCode)
{
    if (Phaser.KeyCode.hasOwnProperty(key) && !key.match(/[a-z]/))
    {
        Phaser.Keyboard[key] = Phaser.KeyCode[key];
    }
}

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

Phaser.Component = function () {};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Angle Component provides access to an `angle` property; the rotation of a Game Object in degrees.
*
* @class
*/
Phaser.Component.Angle = function () {};

Phaser.Component.Angle.prototype = {

    /**
    * The angle property is the rotation of the Game Object in *degrees* from its original orientation.
    * 
    * Values from 0 to 180 represent clockwise rotation; values from 0 to -180 represent counterclockwise rotation.
    * 
    * Values outside this range are added to or subtracted from 360 to obtain a value within the range. 
    * For example, the statement player.angle = 450 is the same as player.angle = 90.
    * 
    * If you wish to work in radians instead of degrees you can use the property `rotation` instead. 
    * Working in radians is slightly faster as it doesn't have to perform any calculations.
    *
    * @property {number} angle
    */
    angle: {

        get: function() {

            return Phaser.Math.wrapAngle(Phaser.Math.radToDeg(this.rotation));

        },

        set: function(value) {

            this.rotation = Phaser.Math.degToRad(Phaser.Math.wrapAngle(value));

        }

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Animation Component provides a `play` method, which is a proxy to the `AnimationManager.play` method.
*
* @class
*/
Phaser.Component.Animation = function () {};

Phaser.Component.Animation.prototype = {

    /**
    * Plays an Animation.
    * 
    * The animation should have previously been created via `animations.add`.
    * 
    * If the animation is already playing calling this again won't do anything.
    * If you need to reset an already running animation do so directly on the Animation object itself or via `AnimationManager.stop`.
    *
    * @method
    * @param {string} name - The name of the animation to be played, e.g. "fire", "walk", "jump". Must have been previously created via 'AnimationManager.add'.
    * @param {number} [frameRate=null] - The framerate to play the animation at. The speed is given in frames per second. If not provided the previously set frameRate of the Animation is used.
    * @param {boolean} [loop=false] - Should the animation be looped after playback. If not provided the previously set loop value of the Animation is used.
    * @param {boolean} [killOnComplete=false] - If set to true when the animation completes (only happens if loop=false) the parent Sprite will be killed.
    * @return {Phaser.Animation} A reference to playing Animation.
    */
    play: function (name, frameRate, loop, killOnComplete) {

        if (this.animations)
        {
            return this.animations.play(name, frameRate, loop, killOnComplete);
        }

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The AutoCull Component is responsible for providing methods that check if a Game Object is within the bounds of the World Camera.
* It is used by the InWorld component.
*
* @class
*/
Phaser.Component.AutoCull = function () {};

Phaser.Component.AutoCull.prototype = {

    /**
    * A Game Object with `autoCull` set to true will check its bounds against the World Camera every frame.
    * If it is not intersecting the Camera bounds at any point then it has its `renderable` property set to `false`.
    * This keeps the Game Object alive and still processing updates, but forces it to skip the render step entirely.
    * 
    * This is a relatively expensive operation, especially if enabled on hundreds of Game Objects. So enable it only if you know it's required,
    * or you have tested performance and find it acceptable.
    *
    * @property {boolean} autoCull
    * @default
    */
    autoCull: false,

    /**
    * Checks if the Game Objects bounds intersect with the Game Camera bounds.
    * Returns `true` if they do, otherwise `false` if fully outside of the Cameras bounds.
    *
    * @property {boolean} inCamera
    * @readonly
    */
    inCamera: {

        get: function() {

            if (!this.autoCull && !this.checkWorldBounds)
            {
                this._bounds.copyFrom(this.getBounds());
                this._bounds.x += this.game.camera.view.x;
                this._bounds.y += this.game.camera.view.y;
            }

            return this.game.world.camera.view.intersects(this._bounds);

        }

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Bounds component contains properties related to the bounds of the Game Object.
*
* @class
*/
Phaser.Component.Bounds = function () {};

Phaser.Component.Bounds.prototype = {

    /**
    * The amount the Game Object is visually offset from its x coordinate.
    * This is the same as `width * anchor.x`.
    * It will only be > 0 if anchor.x is not equal to zero.
    *
    * @property {number} offsetX
    * @readOnly
    */
    offsetX: {

        get: function () {

            return this.anchor.x * this.width;

        }

    },

    /**
    * The amount the Game Object is visually offset from its y coordinate.
    * This is the same as `height * anchor.y`.
    * It will only be > 0 if anchor.y is not equal to zero.
    *
    * @property {number} offsetY
    * @readOnly
    */
    offsetY: {

        get: function () {

            return this.anchor.y * this.height;

        }

    },

    /**
    * The center x coordinate of the Game Object.
    * This is the same as `(x - offsetX) + (width / 2)`.
    *
    * @property {number} centerX
    */
    centerX: {

        get: function () {

            return (this.x - this.offsetX) + (this.width * 0.5);

        },

        set: function (value) {

            this.x = (value + this.offsetX) - (this.width * 0.5);

        }

    },

    /**
    * The center y coordinate of the Game Object.
    * This is the same as `(y - offsetY) + (height / 2)`.
    *
    * @property {number} centerY
    */
    centerY: {

        get: function () {

            return (this.y - this.offsetY) + (this.height * 0.5);

        },

        set: function (value) {

            this.y = (value + this.offsetY) - (this.height * 0.5);

        }

    },

    /**
    * The left coordinate of the Game Object.
    * This is the same as `x - offsetX`.
    *
    * @property {number} left
    */
    left: {

        get: function () {

            return this.x - this.offsetX;

        },

        set: function (value) {

            this.x = value + this.offsetX;

        }

    },

    /**
    * The right coordinate of the Game Object.
    * This is the same as `x + width - offsetX`.
    *
    * @property {number} right
    */
    right: {

        get: function () {

            return (this.x + this.width) - this.offsetX;

        },

        set: function (value) {

            this.x = value - (this.width) + this.offsetX;

        }

    },

    /**
    * The y coordinate of the Game Object.
    * This is the same as `y - offsetY`.
    *
    * @property {number} top
    */
    top: {

        get: function () {

            return this.y - this.offsetY;

        },

        set: function (value) {

            this.y = value + this.offsetY;

        }

    },

    /**
    * The sum of the y and height properties.
    * This is the same as `y + height - offsetY`.
    *
    * @property {number} bottom
    */
    bottom: {

        get: function () {

            return (this.y + this.height) - this.offsetY;

        },

        set: function (value) {

            this.y = value - (this.height) + this.offsetY;

        }

    },

    /**
    * Aligns this Game Object within another Game Object, or Rectangle, known as the
    * 'container', to one of 9 possible positions.
    *
    * The container must be a Game Object, or Phaser.Rectangle object. This can include properties
    * such as `World.bounds` or `Camera.view`, for aligning Game Objects within the world 
    * and camera bounds. Or it can include other Sprites, Images, Text objects, BitmapText,
    * TileSprites or Buttons.
    *
    * Please note that aligning a Sprite to another Game Object does **not** make it a child of
    * the container. It simply modifies its position coordinates so it aligns with it.
    * 
    * The position constants you can use are:
    * 
    * `Phaser.TOP_LEFT`, `Phaser.TOP_CENTER`, `Phaser.TOP_RIGHT`, `Phaser.LEFT_CENTER`, 
    * `Phaser.CENTER`, `Phaser.RIGHT_CENTER`, `Phaser.BOTTOM_LEFT`, 
    * `Phaser.BOTTOM_CENTER` and `Phaser.BOTTOM_RIGHT`.
    *
    * The Game Objects are placed in such a way that their _bounds_ align with the
    * container, taking into consideration rotation, scale and the anchor property.
    * This allows you to neatly align Game Objects, irrespective of their position value.
    *
    * The optional `offsetX` and `offsetY` arguments allow you to apply extra spacing to the final
    * aligned position of the Game Object. For example:
    *
    * `sprite.alignIn(background, Phaser.BOTTOM_RIGHT, -20, -20)`
    *
    * Would align the `sprite` to the bottom-right, but moved 20 pixels in from the corner.
    * Think of the offsets as applying an adjustment to the containers bounds before the alignment takes place.
    * So providing a negative offset will 'shrink' the container bounds by that amount, and providing a positive
    * one expands it.
    *
    * @method
    * @param {Phaser.Rectangle|Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapText|Phaser.Button|Phaser.Graphics|Phaser.TileSprite} container - The Game Object or Rectangle with which to align this Game Object to. Can also include properties such as `World.bounds` or `Camera.view`.
    * @param {integer} [position] - The position constant. One of `Phaser.TOP_LEFT` (default), `Phaser.TOP_CENTER`, `Phaser.TOP_RIGHT`, `Phaser.LEFT_CENTER`, `Phaser.CENTER`, `Phaser.RIGHT_CENTER`, `Phaser.BOTTOM_LEFT`, `Phaser.BOTTOM_CENTER` or `Phaser.BOTTOM_RIGHT`.
    * @param {integer} [offsetX=0] - A horizontal adjustment of the Containers bounds, applied to the aligned position of the Game Object. Use a negative value to shrink the bounds, positive to increase it.
    * @param {integer} [offsetY=0] - A vertical adjustment of the Containers bounds, applied to the aligned position of the Game Object. Use a negative value to shrink the bounds, positive to increase it.
    * @return {Object} This Game Object.
    */
    alignIn: function (container, position, offsetX, offsetY) {

        if (offsetX === undefined) { offsetX = 0; }
        if (offsetY === undefined) { offsetY = 0; }

        switch (position)
        {
            default:
            case Phaser.TOP_LEFT:
                this.left = container.left - offsetX;
                this.top = container.top - offsetY;
                break;

            case Phaser.TOP_CENTER:
                this.centerX = container.centerX + offsetX;
                this.top = container.top - offsetY;
                break;

            case Phaser.TOP_RIGHT:
                this.right = container.right + offsetX;
                this.top = container.top - offsetY;
                break;

            case Phaser.LEFT_CENTER:
                this.left = container.left - offsetX;
                this.centerY = container.centerY + offsetY;
                break;

            case Phaser.CENTER:
                this.centerX = container.centerX + offsetX;
                this.centerY = container.centerY + offsetY;
                break;

            case Phaser.RIGHT_CENTER:
                this.right = container.right + offsetX;
                this.centerY = container.centerY + offsetY;
                break;

            case Phaser.BOTTOM_LEFT:
                this.left = container.left - offsetX;
                this.bottom = container.bottom + offsetY;
                break;

            case Phaser.BOTTOM_CENTER:
                this.centerX = container.centerX + offsetX;
                this.bottom = container.bottom + offsetY;
                break;

            case Phaser.BOTTOM_RIGHT:
                this.right = container.right + offsetX;
                this.bottom = container.bottom + offsetY;
                break;
        }

        return this;

    },

    /**
    * Aligns this Game Object to the side of another Game Object, or Rectangle, known as the
    * 'parent', in one of 11 possible positions.
    *
    * The parent must be a Game Object, or Phaser.Rectangle object. This can include properties
    * such as `World.bounds` or `Camera.view`, for aligning Game Objects within the world 
    * and camera bounds. Or it can include other Sprites, Images, Text objects, BitmapText,
    * TileSprites or Buttons.
    *
    * Please note that aligning a Sprite to another Game Object does **not** make it a child of
    * the parent. It simply modifies its position coordinates so it aligns with it.
    * 
    * The position constants you can use are:
    * 
    * `Phaser.TOP_LEFT` (default), `Phaser.TOP_CENTER`, `Phaser.TOP_RIGHT`, `Phaser.LEFT_TOP`, 
    * `Phaser.LEFT_CENTER`, `Phaser.LEFT_BOTTOM`, `Phaser.RIGHT_TOP`, `Phaser.RIGHT_CENTER`, 
    * `Phaser.RIGHT_BOTTOM`, `Phaser.BOTTOM_LEFT`, `Phaser.BOTTOM_CENTER` 
    * and `Phaser.BOTTOM_RIGHT`.
    *
    * The Game Objects are placed in such a way that their _bounds_ align with the
    * parent, taking into consideration rotation, scale and the anchor property.
    * This allows you to neatly align Game Objects, irrespective of their position value.
    *
    * The optional `offsetX` and `offsetY` arguments allow you to apply extra spacing to the final
    * aligned position of the Game Object. For example:
    *
    * `sprite.alignTo(background, Phaser.BOTTOM_RIGHT, -20, -20)`
    *
    * Would align the `sprite` to the bottom-right, but moved 20 pixels in from the corner.
    * Think of the offsets as applying an adjustment to the parents bounds before the alignment takes place.
    * So providing a negative offset will 'shrink' the parent bounds by that amount, and providing a positive
    * one expands it.
    *
    * @method
    * @param {Phaser.Rectangle|Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapText|Phaser.Button|Phaser.Graphics|Phaser.TileSprite} parent - The Game Object or Rectangle with which to align this Game Object to. Can also include properties such as `World.bounds` or `Camera.view`.
    * @param {integer} [position] - The position constant. One of `Phaser.TOP_LEFT`, `Phaser.TOP_CENTER`, `Phaser.TOP_RIGHT`, `Phaser.LEFT_TOP`, `Phaser.LEFT_CENTER`, `Phaser.LEFT_BOTTOM`, `Phaser.RIGHT_TOP`, `Phaser.RIGHT_CENTER`, `Phaser.RIGHT_BOTTOM`, `Phaser.BOTTOM_LEFT`, `Phaser.BOTTOM_CENTER` or `Phaser.BOTTOM_RIGHT`.
    * @param {integer} [offsetX=0] - A horizontal adjustment of the Containers bounds, applied to the aligned position of the Game Object. Use a negative value to shrink the bounds, positive to increase it.
    * @param {integer} [offsetY=0] - A vertical adjustment of the Containers bounds, applied to the aligned position of the Game Object. Use a negative value to shrink the bounds, positive to increase it.
    * @return {Object} This Game Object.
    */
    alignTo: function (parent, position, offsetX, offsetY) {

        if (offsetX === undefined) { offsetX = 0; }
        if (offsetY === undefined) { offsetY = 0; }

        switch (position)
        {
            default:
            case Phaser.TOP_LEFT:
                this.left = parent.left - offsetX;
                this.bottom = parent.top - offsetY;
                break;

            case Phaser.TOP_CENTER:
                this.centerX = parent.centerX + offsetX;
                this.bottom = parent.top - offsetY;
                break;

            case Phaser.TOP_RIGHT:
                this.right = parent.right + offsetX;
                this.bottom = parent.top - offsetY;
                break;

            case Phaser.LEFT_TOP:
                this.right = parent.left - offsetX;
                this.top = parent.top - offsetY;
                break;

            case Phaser.LEFT_CENTER:
                this.right = parent.left - offsetX;
                this.centerY = parent.centerY + offsetY;
                break;

            case Phaser.LEFT_BOTTOM:
                this.right = parent.left - offsetX;
                this.bottom = parent.bottom + offsetY;
                break;

            case Phaser.RIGHT_TOP:
                this.left = parent.right + offsetX;
                this.top = parent.top - offsetY;
                break;

            case Phaser.RIGHT_CENTER:
                this.left = parent.right + offsetX;
                this.centerY = parent.centerY + offsetY;
                break;

            case Phaser.RIGHT_BOTTOM:
                this.left = parent.right + offsetX;
                this.bottom = parent.bottom + offsetY;
                break;

            case Phaser.BOTTOM_LEFT:
                this.left = parent.left - offsetX;
                this.top = parent.bottom + offsetY;
                break;

            case Phaser.BOTTOM_CENTER:
                this.centerX = parent.centerX + offsetX;
                this.top = parent.bottom + offsetY;
                break;

            case Phaser.BOTTOM_RIGHT:
                this.right = parent.right + offsetX;
                this.top = parent.bottom + offsetY;
                break;
        }

        return this;

    }

};

//  Phaser.Group extensions

Phaser.Group.prototype.alignIn = Phaser.Component.Bounds.prototype.alignIn;
Phaser.Group.prototype.alignTo = Phaser.Component.Bounds.prototype.alignTo;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The BringToTop Component features quick access to Group sorting related methods.
*
* @class
*/
Phaser.Component.BringToTop = function () {};

/**
* Brings this Game Object to the top of its parents display list.
* Visually this means it will render over the top of any old child in the same Group.
* 
* If this Game Object hasn't been added to a custom Group then this method will bring it to the top of the Game World, 
* because the World is the root Group from which all Game Objects descend.
*
* @method
* @return {PIXI.DisplayObject} This instance.
*/
Phaser.Component.BringToTop.prototype.bringToTop = function() {

    if (this.parent)
    {
        this.parent.bringToTop(this);
    }

    return this;

};

/**
* Sends this Game Object to the bottom of its parents display list.
* Visually this means it will render below all other children in the same Group.
* 
* If this Game Object hasn't been added to a custom Group then this method will send it to the bottom of the Game World, 
* because the World is the root Group from which all Game Objects descend.
*
* @method
* @return {PIXI.DisplayObject} This instance.
*/
Phaser.Component.BringToTop.prototype.sendToBack = function() {

    if (this.parent)
    {
        this.parent.sendToBack(this);
    }

    return this;

};

/**
* Moves this Game Object up one place in its parents display list.
* This call has no effect if the Game Object is already at the top of the display list.
* 
* If this Game Object hasn't been added to a custom Group then this method will move it one object up within the Game World, 
* because the World is the root Group from which all Game Objects descend.
*
* @method
* @return {PIXI.DisplayObject} This instance.
*/
Phaser.Component.BringToTop.prototype.moveUp = function () {

    if (this.parent)
    {
        this.parent.moveUp(this);
    }

    return this;

};

/**
* Moves this Game Object down one place in its parents display list.
* This call has no effect if the Game Object is already at the bottom of the display list.
* 
* If this Game Object hasn't been added to a custom Group then this method will move it one object down within the Game World, 
* because the World is the root Group from which all Game Objects descend.
*
* @method
* @return {PIXI.DisplayObject} This instance.
*/
Phaser.Component.BringToTop.prototype.moveDown = function () {

    if (this.parent)
    {
        this.parent.moveDown(this);
    }

    return this;

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Core Component Features.
*
* @class
*/
Phaser.Component.Core = function () {};

/**
* Installs / registers mixin components.
*
* The `this` context should be that of the applicable object instance or prototype.
*
* @method
* @protected
*/
Phaser.Component.Core.install = function (components) {

    // Always install 'Core' first
    Phaser.Utils.mixinPrototype(this, Phaser.Component.Core.prototype);

    this.components = {};

    for (var i = 0; i < components.length; i++)
    {
        var id = components[i];
        var replace = false;

        if (id === 'Destroy')
        {
            replace = true;
        }

        Phaser.Utils.mixinPrototype(this, Phaser.Component[id].prototype, replace);

        this.components[id] = true;
    }

};

/**
* Initializes the mixin components.
*
* The `this` context should be an instance of the component mixin target.
*
* @method
* @protected
*/
Phaser.Component.Core.init = function (game, x, y, key, frame) {

    this.game = game;

    this.key = key;

    this.data = {};

    this.position.set(x, y);
    this.world = new Phaser.Point(x, y);
    this.previousPosition = new Phaser.Point(x, y);

    this.events = new Phaser.Events(this);

    this._bounds = new Phaser.Rectangle();

    if (this.components.PhysicsBody)
    {
        // Enable-body checks for hasOwnProperty; makes sure to lift property from prototype.
        this.body = this.body;
    }

    if (this.components.Animation)
    {
        this.animations = new Phaser.AnimationManager(this);
    }

    if (this.components.LoadTexture && key !== null)
    {
        this.loadTexture(key, frame);
    }

    if (this.components.FixedToCamera)
    {
        this.cameraOffset = new Phaser.Point(x, y);
    }

};

Phaser.Component.Core.preUpdate = function () {

    if (this.pendingDestroy)
    {
        this.destroy();
        return;
    }

    this.previousPosition.set(this.world.x, this.world.y);
    this.previousRotation = this.rotation;

    if (!this.exists || !this.parent.exists)
    {
        this.renderOrderID = -1;
        return false;
    }

    this.world.setTo(this.game.camera.x + this.worldTransform.tx, this.game.camera.y + this.worldTransform.ty);

    if (this.visible)
    {
        this.renderOrderID = this.game.stage.currentRenderOrderID++;
    }

    if (this.animations)
    {
        this.animations.update();
    }

    if (this.body)
    {
        this.body.preUpdate();
    }

    for (var i = 0; i < this.children.length; i++)
    {
        this.children[i].preUpdate();
    }

    return true;

};

Phaser.Component.Core.prototype = {

    /**
    * A reference to the currently running Game.
    * @property {Phaser.Game} game
    */
    game: null,

    /**
    * A user defined name given to this Game Object.
    * This value isn't ever used internally by Phaser, it is meant as a game level property.
    * @property {string} name
    * @default
    */
    name: '',

    /**
    * An empty Object that belongs to this Game Object.
    * This value isn't ever used internally by Phaser, but may be used by your own code, or
    * by Phaser Plugins, to store data that needs to be associated with the Game Object,
    * without polluting the Game Object directly.
    * @property {Object} data
    * @default
    */
    data: {},

    /**
    * The components this Game Object has installed.
    * @property {object} components
    * @protected
    */
    components: {},

    /**
    * The z depth of this Game Object within its parent Group.
    * No two objects in a Group can have the same z value.
    * This value is adjusted automatically whenever the Group hierarchy changes.
    * If you wish to re-order the layering of a Game Object then see methods like Group.moveUp or Group.bringToTop.
    * @property {number} z
    * @readOnly
    */
    z: 0,

    /**
    * All Phaser Game Objects have an Events class which contains all of the events that are dispatched when certain things happen to this
    * Game Object, or any of its components.
    * @see Phaser.Events
    * @property {Phaser.Events} events
    */
    events: undefined,

    /**
    * If the Game Object is enabled for animation (such as a Phaser.Sprite) this is a reference to its AnimationManager instance.
    * Through it you can create, play, pause and stop animations.
    * @see Phaser.AnimationManager
    * @property {Phaser.AnimationManager} animations
    */
    animations: undefined,

    /**
    * The key of the image or texture used by this Game Object during rendering.
    * If it is a string it's the string used to retrieve the texture from the Phaser Image Cache.
    * It can also be an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
    * If a Game Object is created without a key it is automatically assigned the key `__default` which is a 32x32 transparent PNG stored within the Cache.
    * If a Game Object is given a key which doesn't exist in the Image Cache it is re-assigned the key `__missing` which is a 32x32 PNG of a green box with a line through it.
    * @property {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} key
    */
    key: '',

    /**
    * The world coordinates of this Game Object in pixels.
    * Depending on where in the display list this Game Object is placed this value can differ from `position`, 
    * which contains the x/y coordinates relative to the Game Objects parent.
    * @property {Phaser.Point} world
    */
    world: null,

    /**
    * A debug flag designed for use with `Game.enableStep`.
    * @property {boolean} debug
    * @default
    */
    debug: false,

    /**
    * The position the Game Object was located in the previous frame.
    * @property {Phaser.Point} previousPosition
    * @readOnly
    */
    previousPosition: null,

    /**
    * The rotation the Game Object was in set to in the previous frame. Value is in radians.
    * @property {number} previousRotation
    * @readOnly
    */
    previousRotation: 0,

    /**
    * The render order ID is used internally by the renderer and Input Manager and should not be modified.
    * This property is mostly used internally by the renderers, but is exposed for the use of plugins.
    * @property {number} renderOrderID
    * @readOnly
    */
    renderOrderID: 0,

    /**
    * A Game Object is considered `fresh` if it has just been created or reset and is yet to receive a renderer transform update.
    * This property is mostly used internally by the physics systems, but is exposed for the use of plugins.
    * @property {boolean} fresh
    * @readOnly
    */
    fresh: true,

    /**
    * A Game Object is that is pendingDestroy is flagged to have its destroy method called on the next logic update.
    * You can set it directly to allow you to flag an object to be destroyed on its next update.
    * 
    * This is extremely useful if you wish to destroy an object from within one of its own callbacks 
    * such as with Buttons or other Input events.
    * 
    * @property {boolean} pendingDestroy
    */
    pendingDestroy: false,

    /**
    * @property {Phaser.Rectangle} _bounds - Internal cache var.
    * @private
    */
    _bounds: null,

    /**
    * @property {boolean} _exists - Internal cache var.
    * @private
    */
    _exists: true,

    /**
    * Controls if this Game Object is processed by the core game loop.
    * If this Game Object has a physics body it also controls if its physics body is updated or not.
    * When `exists` is set to `false` it will remove its physics body from the physics world if it has one.
    * It also toggles the `visible` property to false as well.
    *
    * Setting `exists` to true will add its physics body back in to the physics world, if it has one.
    * It will also set the `visible` property to `true`.
    *
    * @property {boolean} exists
    */
    exists: {

        get: function () {

            return this._exists;

        },

        set: function (value) {

            if (value)
            {
                this._exists = true;

                if (this.body && this.body.type === Phaser.Physics.P2JS)
                {
                    this.body.addToWorld();
                }

                this.visible = true;
            }
            else
            {
                this._exists = false;

                if (this.body && this.body.type === Phaser.Physics.P2JS)
                {
                    this.body.removeFromWorld();
                }

                this.visible = false;
            }

        }

    },

    /**
    * Override this method in your own custom objects to handle any update requirements.
    * It is called immediately after `preUpdate` and before `postUpdate`.
    * Remember if this Game Object has any children you should call update on those too.
    *
    * @method
    */
    update: function() {

    },

    /**
    * Internal method called by the World postUpdate cycle.
    *
    * @method
    * @protected
    */
    postUpdate: function() {

        if (this.customRender)
        {
            this.key.render();
        }

        if (this.components.PhysicsBody)
        {
            Phaser.Component.PhysicsBody.postUpdate.call(this);
        }

        if (this.components.FixedToCamera)
        {
            Phaser.Component.FixedToCamera.postUpdate.call(this);
        }

        for (var i = 0; i < this.children.length; i++)
        {
            this.children[i].postUpdate();
        }

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Crop component provides the ability to crop a texture based Game Object to a defined rectangle, 
* which can be updated in real-time.
*
* @class
*/
Phaser.Component.Crop = function () {};

Phaser.Component.Crop.prototype = {

    /**
    * The Rectangle used to crop the texture this Game Object uses.
    * Set this property via `crop`. 
    * If you modify this property directly you must call `updateCrop` in order to have the change take effect.
    * @property {Phaser.Rectangle} cropRect
    * @default
    */
    cropRect: null,

    /**
    * @property {Phaser.Rectangle} _crop - Internal cache var.
    * @private
    */
    _crop: null,

    /**
    * Crop allows you to crop the texture being used to display this Game Object.
    * Setting a crop rectangle modifies the core texture frame. The Game Object width and height properties will be adjusted accordingly.
    *
    * Cropping takes place from the top-left and can be modified in real-time either by providing an updated rectangle object to this method,
    * or by modifying `cropRect` property directly and then calling `updateCrop`.
    *
    * The rectangle object given to this method can be either a `Phaser.Rectangle` or any other object 
    * so long as it has public `x`, `y`, `width`, `height`, `right` and `bottom` properties.
    * 
    * A reference to the rectangle is stored in `cropRect` unless the `copy` parameter is `true`, 
    * in which case the values are duplicated to a local object.
    *
    * @method
    * @param {Phaser.Rectangle} rect - The Rectangle used during cropping. Pass null or no parameters to clear a previously set crop rectangle.
    * @param {boolean} [copy=false] - If false `cropRect` will be stored as a reference to the given rect. If true it will copy the rect values into a local Phaser Rectangle object stored in cropRect.
    */
    crop: function (rect, copy) {

        if (copy === undefined) { copy = false; }

        if (rect)
        {
            if (copy && this.cropRect !== null)
            {
                this.cropRect.setTo(rect.x, rect.y, rect.width, rect.height);
            }
            else if (copy && this.cropRect === null)
            {
                this.cropRect = new Phaser.Rectangle(rect.x, rect.y, rect.width, rect.height);
            }
            else
            {
                this.cropRect = rect;
            }

            this.updateCrop();
        }
        else
        {
            this._crop = null;
            this.cropRect = null;

            this.resetFrame();
        }

    },

    /**
    * If you have set a crop rectangle on this Game Object via `crop` and since modified the `cropRect` property,
    * or the rectangle it references, then you need to update the crop frame by calling this method.
    *
    * @method
    */
    updateCrop: function () {

        if (!this.cropRect)
        {
            return;
        }

        var oldX = this.texture.crop.x;
        var oldY = this.texture.crop.y;
        var oldW = this.texture.crop.width;
        var oldH = this.texture.crop.height;

        this._crop = Phaser.Rectangle.clone(this.cropRect, this._crop);
        this._crop.x += this._frame.x;
        this._crop.y += this._frame.y;

        var cx = Math.max(this._frame.x, this._crop.x);
        var cy = Math.max(this._frame.y, this._crop.y);
        var cw = Math.min(this._frame.right, this._crop.right) - cx;
        var ch = Math.min(this._frame.bottom, this._crop.bottom) - cy;

        this.texture.crop.x = cx;
        this.texture.crop.y = cy;
        this.texture.crop.width = cw;
        this.texture.crop.height = ch;

        this.texture.frame.width = Math.min(cw, this.cropRect.width);
        this.texture.frame.height = Math.min(ch, this.cropRect.height);

        this.texture.width = this.texture.frame.width;
        this.texture.height = this.texture.frame.height;

        this.texture._updateUvs();

        if (this.tint !== 0xffffff && (oldX !== cx || oldY !== cy || oldW !== cw || oldH !== ch))
        {
            this.texture.requiresReTint = true;
        }

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Delta component provides access to delta values between the Game Objects current and previous position.
*
* @class
*/
Phaser.Component.Delta = function () {};

Phaser.Component.Delta.prototype = {

    /**
    * Returns the delta x value. The difference between world.x now and in the previous frame.
    * 
    * The value will be positive if the Game Object has moved to the right or negative if to the left.
    *
    * @property {number} deltaX
    * @readonly
    */
    deltaX: {

        get: function() {

            return this.world.x - this.previousPosition.x;

        }

    },

    /**
    * Returns the delta y value. The difference between world.y now and in the previous frame.
    * 
    * The value will be positive if the Game Object has moved down or negative if up.
    *
    * @property {number} deltaY
    * @readonly
    */
    deltaY: {

        get: function() {

            return this.world.y - this.previousPosition.y;

        }

    },

    /**
    * Returns the delta z value. The difference between rotation now and in the previous frame.
    *
    * @property {number} deltaZ - The delta value.
    * @readonly
    */
    deltaZ: {

        get: function() {

            return this.rotation - this.previousRotation;

        }

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Destroy component is responsible for destroying a Game Object.
*
* @class
*/
Phaser.Component.Destroy = function () {};

Phaser.Component.Destroy.prototype = {

    /**
    * As a Game Object runs through its destroy method this flag is set to true, 
    * and can be checked in any sub-systems or plugins it is being destroyed from.
    * @property {boolean} destroyPhase
    * @readOnly
    */
    destroyPhase: false,

    /**
    * Destroys the Game Object. This removes it from its parent group, destroys the input, event and animation handlers if present
    * and nulls its reference to `game`, freeing it up for garbage collection.
    * 
    * If this Game Object has the Events component it will also dispatch the `onDestroy` event.
    *
    * You can optionally also destroy the BaseTexture this Game Object is using. Be careful if you've
    * more than one Game Object sharing the same BaseTexture.
    *
    * @method
    * @param {boolean} [destroyChildren=true] - Should every child of this object have its destroy method called as well?
    * @param {boolean} [destroyTexture=false] - Destroy the BaseTexture this Game Object is using? Note that if another Game Object is sharing the same BaseTexture it will invalidate it.
    */
    destroy: function (destroyChildren, destroyTexture) {

        if (this.game === null || this.destroyPhase) { return; }

        if (destroyChildren === undefined) { destroyChildren = true; }
        if (destroyTexture === undefined) { destroyTexture = false; }

        this.destroyPhase = true;

        if (this.events)
        {
            this.events.onDestroy$dispatch(this);
        }

        if (this.parent)
        {
            if (this.parent instanceof Phaser.Group)
            {
                this.parent.remove(this);
            }
            else
            {
                this.parent.removeChild(this);
            }
        }

        if (this.input)
        {
            this.input.destroy();
        }

        if (this.animations)
        {
            this.animations.destroy();
        }

        if (this.body)
        {
            this.body.destroy();
        }

        if (this.events)
        {
            this.events.destroy();
        }

        this.game.tweens.removeFrom(this);

        var i = this.children.length;

        if (destroyChildren)
        {
            while (i--)
            {
                this.children[i].destroy(destroyChildren);
            }
        }
        else
        {
            while (i--)
            {
                this.removeChild(this.children[i]);
            }
        }

        if (this._crop)
        {
            this._crop = null;
            this.cropRect = null;
        }

        if (this._frame)
        {
            this._frame = null;
        }

        if (Phaser.Video && this.key instanceof Phaser.Video)
        {
            this.key.onChangeSource.remove(this.resizeFrame, this);
        }

        if (Phaser.BitmapText && this._glyphs)
        {
            this._glyphs = [];
        }

        this.alive = false;
        this.exists = false;
        this.visible = false;

        this.filters = null;
        this.mask = null;
        this.game = null;

        this.data = {};

        //  In case Pixi is still going to try and render it even though destroyed
        this.renderable = false;

        if (this.transformCallback)
        {
            this.transformCallback = null;
            this.transformCallbackContext = null;
        }

        //  Pixi level DisplayObject destroy
        this.hitArea = null;
        this.parent = null;
        this.stage = null;
        this.worldTransform = null;
        this.filterArea = null;
        this._bounds = null;
        this._currentBounds = null;
        this._mask = null;

        this._destroyCachedSprite();

        //  Texture?
        if (destroyTexture)
        {
            this.texture.destroy(true);
        }

        this.destroyPhase = false;
        this.pendingDestroy = false;

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Events component is a collection of events fired by the parent Game Object.
* 
* Phaser uses what are known as 'Signals' for all event handling. All of the events in
* this class are signals you can subscribe to, much in the same way you'd "listen" for
* an event.
*
* For example to tell when a Sprite has been added to a new group, you can bind a function
* to the `onAddedToGroup` signal:
*
* `sprite.events.onAddedToGroup.add(yourFunction, this);`
*
* Where `yourFunction` is the function you want called when this event occurs.
* 
* For more details about how signals work please see the Phaser.Signal class.
*
* The Input-related events will only be dispatched if the Sprite has had `inputEnabled` set to `true`
* and the Animation-related events only apply to game objects with animations like {@link Phaser.Sprite}.
*
* @class Phaser.Events
* @constructor
* @param {Phaser.Sprite} sprite - A reference to the game object / Sprite that owns this Events object.
*/
Phaser.Events = function (sprite) {

    /**
    * @property {Phaser.Sprite} parent - The Sprite that owns these events.
    */
    this.parent = sprite;

    // The signals are automatically added by the corresponding proxy properties

};

Phaser.Events.prototype = {

    /**
     * Removes all events.
     *
     * @method Phaser.Events#destroy
     */
    destroy: function () {

        this._parent = null;

        if (this._onDestroy)           { this._onDestroy.dispose(); }
        if (this._onAddedToGroup)      { this._onAddedToGroup.dispose(); }
        if (this._onRemovedFromGroup)  { this._onRemovedFromGroup.dispose(); }
        if (this._onRemovedFromWorld)  { this._onRemovedFromWorld.dispose(); }
        if (this._onKilled)            { this._onKilled.dispose(); }
        if (this._onRevived)           { this._onRevived.dispose(); }
        if (this._onEnterBounds)       { this._onEnterBounds.dispose(); }
        if (this._onOutOfBounds)       { this._onOutOfBounds.dispose(); }

        if (this._onInputOver)         { this._onInputOver.dispose(); }
        if (this._onInputOut)          { this._onInputOut.dispose(); }
        if (this._onInputDown)         { this._onInputDown.dispose(); }
        if (this._onInputUp)           { this._onInputUp.dispose(); }
        if (this._onDragStart)         { this._onDragStart.dispose(); }
        if (this._onDragUpdate)        { this._onDragUpdate.dispose(); }
        if (this._onDragStop)          { this._onDragStop.dispose(); }

        if (this._onAnimationStart)    { this._onAnimationStart.dispose(); }
        if (this._onAnimationComplete) { this._onAnimationComplete.dispose(); }
        if (this._onAnimationLoop)     { this._onAnimationLoop.dispose(); }

    },

    // The following properties are sentinels that will be replaced with getters

    /**
    * This signal is dispatched when this Game Object is added to a new Group.
    * It is sent two arguments:
    * {any} The Game Object that was added to the Group.
    * {Phaser.Group} The Group it was added to.
    * @property {Phaser.Signal} onAddedToGroup
    */
    onAddedToGroup: null,

    /**
    * This signal is dispatched when the Game Object is removed from a Group.
    * It is sent two arguments:
    * {any} The Game Object that was removed from the Group.
    * {Phaser.Group} The Group it was removed from.
    * @property {Phaser.Signal} onRemovedFromGroup
    */
    onRemovedFromGroup: null,

    /**
    * This Signal is never used internally by Phaser and is now deprecated.
    * @deprecated
    * @property {Phaser.Signal} onRemovedFromWorld
    */
    onRemovedFromWorld: null,

    /**
    * This signal is dispatched when the Game Object is destroyed.
    * This happens when `Sprite.destroy()` is called, or `Group.destroy()` with `destroyChildren` set to true.
    * It is sent one argument:
    * {any} The Game Object that was destroyed.
    * @property {Phaser.Signal} onDestroy
    */
    onDestroy: null,

    /**
    * This signal is dispatched when the Game Object is killed.
    * This happens when `Sprite.kill()` is called.
    * Please understand the difference between `kill` and `destroy` by looking at their respective methods.
    * It is sent one argument:
    * {any} The Game Object that was killed.
    * @property {Phaser.Signal} onKilled
    */
    onKilled: null,

    /**
    * This signal is dispatched when the Game Object is revived from a previously killed state.
    * This happens when `Sprite.revive()` is called.
    * It is sent one argument:
    * {any} The Game Object that was revived.
    * @property {Phaser.Signal} onRevived
    */
    onRevived: null,

    /**
    * This signal is dispatched when the Game Object leaves the Phaser.World bounds.
    * This signal is only if `Sprite.checkWorldBounds` is set to `true`.
    * It is sent one argument:
    * {any} The Game Object that left the World bounds.
    * @property {Phaser.Signal} onOutOfBounds
    */
    onOutOfBounds: null,

    /**
    * This signal is dispatched when the Game Object returns within the Phaser.World bounds, having previously been outside of them.
    * This signal is only if `Sprite.checkWorldBounds` is set to `true`.
    * It is sent one argument:
    * {any} The Game Object that entered the World bounds.
    * @property {Phaser.Signal} onEnterBounds
    */
    onEnterBounds: null,

    /**
    * This signal is dispatched if the Game Object has `inputEnabled` set to `true`, 
    * and receives an over event from a Phaser.Pointer.
    * It is sent two arguments:
    * {any} The Game Object that received the event.
    * {Phaser.Pointer} The Phaser.Pointer object that caused the event.
    * @property {Phaser.Signal} onInputOver
    */
    onInputOver: null,

    /**
    * This signal is dispatched if the Game Object has `inputEnabled` set to `true`, 
    * and receives an out event from a Phaser.Pointer, which was previously over it.
    * It is sent two arguments:
    * {any} The Game Object that received the event.
    * {Phaser.Pointer} The Phaser.Pointer object that caused the event.
    * @property {Phaser.Signal} onInputOut
    */
    onInputOut: null,

    /**
    * This signal is dispatched if the Game Object has `inputEnabled` set to `true`, 
    * and receives a down event from a Phaser.Pointer. This effectively means the Pointer has been
    * pressed down (but not yet released) on the Game Object.
    * It is sent two arguments:
    * {any} The Game Object that received the event.
    * {Phaser.Pointer} The Phaser.Pointer object that caused the event.
    * @property {Phaser.Signal} onInputDown
    */
    onInputDown: null,

    /**
    * This signal is dispatched if the Game Object has `inputEnabled` set to `true`, 
    * and receives an up event from a Phaser.Pointer. This effectively means the Pointer had been
    * pressed down, and was then released on the Game Object.
    * It is sent three arguments:
    * {any} The Game Object that received the event.
    * {Phaser.Pointer} The Phaser.Pointer object that caused the event.
    * {boolean} isOver - Is the Pointer still over the Game Object?
    * @property {Phaser.Signal} onInputUp
    */
    onInputUp: null,

    /**
    * This signal is dispatched if the Game Object has been `inputEnabled` and `enableDrag` has been set.
    * It is sent when a Phaser.Pointer starts to drag the Game Object, taking into consideration the various
    * drag limitations that may be set.
    * It is sent four arguments:
    * {any} The Game Object that received the event.
    * {Phaser.Pointer} The Phaser.Pointer object that caused the event.
    * {number} The x coordinate that the drag started from.
    * {number} The y coordinate that the drag started from.
    * @property {Phaser.Signal} onDragStart
    */
    onDragStart: null,

    /**
    * This signal is dispatched if the Game Object has been `inputEnabled` and `enableDrag` has been set.
    * It is sent when a Phaser.Pointer is actively dragging the Game Object.
    * Be warned: This is a high volume Signal. Be careful what you bind to it.
    * It is sent six arguments:
    * {any} The Game Object that received the event.
    * {Phaser.Pointer} The Phaser.Pointer object that caused the event.
    * {number} The new x coordinate of the Game Object.
    * {number} The new y coordinate of the Game Object.
    * {Phaser.Point} A Point object that contains the point the Game Object was snapped to, if `snapOnDrag` has been enabled.
    * {boolean} The `fromStart` boolean, indicates if this is the first update immediately after the drag has started.
    * @property {Phaser.Signal} onDragUpdate
    */
    onDragUpdate: null,

    /**
    * This signal is dispatched if the Game Object has been `inputEnabled` and `enableDrag` has been set.
    * It is sent when a Phaser.Pointer stops dragging the Game Object.
    * It is sent two arguments:
    * {any} The Game Object that received the event.
    * {Phaser.Pointer} The Phaser.Pointer object that caused the event.
    * @property {Phaser.Signal} onDragStop
    */
    onDragStop: null,

    /**
    * This signal is dispatched if the Game Object has the AnimationManager component, 
    * and an Animation has been played.
    * You can also listen to `Animation.onStart` rather than via the Game Objects events.
    * It is sent two arguments:
    * {any} The Game Object that received the event.
    * {Phaser.Animation} The Phaser.Animation that was started.
    * @property {Phaser.Signal} onAnimationStart
    */
    onAnimationStart: null,

    /**
    * This signal is dispatched if the Game Object has the AnimationManager component, 
    * and an Animation has been stopped (via `animation.stop()` and the `dispatchComplete` argument has been set.
    * You can also listen to `Animation.onComplete` rather than via the Game Objects events.
    * It is sent two arguments:
    * {any} The Game Object that received the event.
    * {Phaser.Animation} The Phaser.Animation that was stopped.
    * @property {Phaser.Signal} onAnimationComplete
    */
    onAnimationComplete: null,

    /**
    * This signal is dispatched if the Game Object has the AnimationManager component, 
    * and an Animation has looped playback.
    * You can also listen to `Animation.onLoop` rather than via the Game Objects events.
    * It is sent two arguments:
    * {any} The Game Object that received the event.
    * {Phaser.Animation} The Phaser.Animation that looped.
    * @property {Phaser.Signal} onAnimationLoop
    */
    onAnimationLoop: null

};

Phaser.Events.prototype.constructor = Phaser.Events;

// Create an auto-create proxy getter and dispatch method for all events.
// The backing property is the same as the event name, prefixed with '_'
// and the dispatch method is the same as the event name postfixed with '$dispatch'.
for (var prop in Phaser.Events.prototype)
{
    if (!Phaser.Events.prototype.hasOwnProperty(prop) ||
        prop.indexOf('on') !== 0 ||
        Phaser.Events.prototype[prop] !== null)
    {
        continue;
    }

    (function (prop, backing) {
        'use strict';

        // The accessor creates a new Signal; and so it should only be used from user-code.
        Object.defineProperty(Phaser.Events.prototype, prop, {
            get: function () {
                return this[backing] || (this[backing] = new Phaser.Signal());
            }
        });

        // The dispatcher will only broadcast on an already-created signal; call this internally.
        Phaser.Events.prototype[prop + '$dispatch'] = function () {
            return this[backing] ? this[backing].dispatch.apply(this[backing], arguments) : null;
        };

    })(prop, '_' + prop);

}

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The FixedToCamera component enables a Game Object to be rendered relative to the game camera coordinates, regardless 
* of where in the world the camera is. This is used for things like sticking game UI to the camera that scrolls as it moves around the world.
*
* @class
*/
Phaser.Component.FixedToCamera = function () {};

/**
 * The FixedToCamera component postUpdate handler.
 * Called automatically by the Game Object.
 *
 * @method
 */
Phaser.Component.FixedToCamera.postUpdate = function () {

    if (this.fixedToCamera)
    {
        this.position.x = (this.game.camera.view.x + this.cameraOffset.x) / this.game.camera.scale.x;
        this.position.y = (this.game.camera.view.y + this.cameraOffset.y) / this.game.camera.scale.y;
    }

};

Phaser.Component.FixedToCamera.prototype = {

    /**
    * @property {boolean} _fixedToCamera
    * @private
    */
    _fixedToCamera: false,

    /**
    * A Game Object that is "fixed" to the camera uses its x/y coordinates as offsets from the top left of the camera during rendering.
    * 
    * The values are adjusted at the rendering stage, overriding the Game Objects actual world position.
    * 
    * The end result is that the Game Object will appear to be 'fixed' to the camera, regardless of where in the game world
    * the camera is viewing. This is useful if for example this Game Object is a UI item that you wish to be visible at all times 
    * regardless where in the world the camera is.
    * 
    * The offsets are stored in the `cameraOffset` property.
    * 
    * Note that the `cameraOffset` values are in addition to any parent of this Game Object on the display list.
    *
    * Be careful not to set `fixedToCamera` on Game Objects which are in Groups that already have `fixedToCamera` enabled on them.
    *
    * @property {boolean} fixedToCamera
    */
    fixedToCamera: {

        get: function () {

            return this._fixedToCamera;

        },

        set: function (value) {

            if (value)
            {
                this._fixedToCamera = true;
                this.cameraOffset.set(this.x, this.y);
            }
            else
            {
                this._fixedToCamera = false;
            }

        }

    },

    /**
    * The x/y coordinate offset applied to the top-left of the camera that this Game Object will be drawn at if `fixedToCamera` is true.
    * 
    * The values are relative to the top-left of the camera view and in addition to any parent of the Game Object on the display list.
    * @property {Phaser.Point} cameraOffset
    */
    cameraOffset: new Phaser.Point()

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Health component provides the ability for Game Objects to have a `health` property 
* that can be damaged and reset through game code.
* Requires the LifeSpan component.
*
* @class
*/
Phaser.Component.Health = function () {};

Phaser.Component.Health.prototype = {

    /**
    * The Game Objects health value. This is a handy property for setting and manipulating health on a Game Object.
    * 
    * It can be used in combination with the `damage` method or modified directly.
    * 
    * @property {number} health
    * @default
    */
    health: 1,

    /**
    * The Game Objects maximum health value. This works in combination with the `heal` method to ensure
    * the health value never exceeds the maximum.
    * 
    * @property {number} maxHealth
    * @default
    */
    maxHealth: 100,

    /**
    * Damages the Game Object. This removes the given amount of health from the `health` property.
    * 
    * If health is taken below or is equal to zero then the `kill` method is called.
    *
    * @member
    * @param {number} amount - The amount to subtract from the current `health` value.
    * @return {Phaser.Sprite} This instance.
    */
    damage: function (amount) {

        if (this.alive)
        {
            this.health -= amount;

            if (this.health <= 0)
            {
                this.kill();
            }
        }

        return this;

    },

    /**
    * Sets the health property of the Game Object to the given amount.
    * Will never exceed the `maxHealth` value.
    *
    * @member
    * @param {number} amount - The amount to set the `health` value to. The total will never exceed `maxHealth`.
    * @return {Phaser.Sprite} This instance.
    */
    setHealth: function (amount) {

        this.health = amount;

        if (this.health > this.maxHealth)
        {
            this.health = this.maxHealth;
        }

        return this;

    },

    /**
    * Heal the Game Object. This adds the given amount of health to the `health` property.
    *
    * @member
    * @param {number} amount - The amount to add to the current `health` value. The total will never exceed `maxHealth`.
    * @return {Phaser.Sprite} This instance.
    */
    heal: function (amount) {

        if (this.alive)
        {
            this.health += amount;

            if (this.health > this.maxHealth)
            {
                this.health = this.maxHealth;
            }
        }

        return this;

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The InCamera component checks if the Game Object intersects with the Game Camera.
*
* @class
*/
Phaser.Component.InCamera = function () {};

Phaser.Component.InCamera.prototype = {

    /**
    * Checks if this Game Objects bounds intersects with the Game Cameras bounds.
    * 
    * It will be `true` if they intersect, or `false` if the Game Object is fully outside of the Cameras bounds.
    * 
    * An object outside the bounds can be considered for camera culling if it has the AutoCull component.
    *
    * @property {boolean} inCamera
    * @readonly
    */
    inCamera: {

        get: function() {

            return this.game.world.camera.view.intersects(this._bounds);

        }

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The InputEnabled component allows a Game Object to have its own InputHandler and process input related events.
*
* @class
*/
Phaser.Component.InputEnabled = function () {};

Phaser.Component.InputEnabled.prototype = {

    /**
    * The Input Handler for this Game Object.
    * 
    * By default it is disabled. If you wish this Game Object to process input events you should enable it with: `inputEnabled = true`.
    * 
    * After you have done this, this property will be a reference to the Phaser InputHandler.
    * @property {Phaser.InputHandler|null} input 
    */
    input: null,

    /**
    * By default a Game Object won't process any input events. By setting `inputEnabled` to true a Phaser.InputHandler is created
    * for this Game Object and it will then start to process click / touch events and more.
    * 
    * You can then access the Input Handler via `this.input`.
    * 
    * Note that Input related events are dispatched from `this.events`, i.e.: `events.onInputDown`.
    * 
    * If you set this property to false it will stop the Input Handler from processing any more input events.
    * 
    * If you want to _temporarily_ disable input for a Game Object, then it's better to set
    * `input.enabled = false`, as it won't reset any of the Input Handlers internal properties.
    * You can then toggle this back on as needed.
    *
    * @property {boolean} inputEnabled
    */
    inputEnabled: {

        get: function () {

            return (this.input && this.input.enabled);

        },

        set: function (value) {

            if (value)
            {
                if (this.input === null)
                {
                    this.input = new Phaser.InputHandler(this);
                    this.input.start();
                }
                else if (this.input && !this.input.enabled)
                {
                    this.input.start();
                }
            }
            else
            {
                if (this.input && this.input.enabled)
                {
                    this.input.stop();
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
* The InWorld component checks if a Game Object is within the Game World Bounds.
* An object is considered as being "in bounds" so long as its own bounds intersects at any point with the World bounds.
* If the AutoCull component is enabled on the Game Object then it will check the Game Object against the Camera bounds as well.
*
* @class
*/
Phaser.Component.InWorld = function () {};

/**
 * The InWorld component preUpdate handler.
 * Called automatically by the Game Object.
 *
 * @method
 */
Phaser.Component.InWorld.preUpdate = function () {

    //  Cache the bounds if we need it
    if (this.autoCull || this.checkWorldBounds)
    {
        this._bounds.copyFrom(this.getBounds());

        this._bounds.x += this.game.camera.view.x;
        this._bounds.y += this.game.camera.view.y;

        if (this.autoCull)
        {
            //  Won't get rendered but will still get its transform updated
            if (this.game.world.camera.view.intersects(this._bounds))
            {
                this.renderable = true;
                this.game.world.camera.totalInView++;
            }
            else
            {
                this.renderable = false;

                if (this.outOfCameraBoundsKill)
                {
                    this.kill();
                    return false;
                }
            }
        }

        if (this.checkWorldBounds)
        {
            //  The Sprite is already out of the world bounds, so let's check to see if it has come back again
            if (this._outOfBoundsFired && this.game.world.bounds.intersects(this._bounds))
            {
                this._outOfBoundsFired = false;
                this.events.onEnterBounds$dispatch(this);
            }
            else if (!this._outOfBoundsFired && !this.game.world.bounds.intersects(this._bounds))
            {
                //  The Sprite WAS in the screen, but has now left.
                this._outOfBoundsFired = true;
                this.events.onOutOfBounds$dispatch(this);

                if (this.outOfBoundsKill)
                {
                    this.kill();
                    return false;
                }
            }
        }
    }

    return true;

};

Phaser.Component.InWorld.prototype = {

    /**
    * If this is set to `true` the Game Object checks if it is within the World bounds each frame. 
    * 
    * When it is no longer intersecting the world bounds it dispatches the `onOutOfBounds` event.
    * 
    * If it was *previously* out of bounds but is now intersecting the world bounds again it dispatches the `onEnterBounds` event.
    * 
    * It also optionally kills the Game Object if `outOfBoundsKill` is `true`.
    * 
    * When `checkWorldBounds` is enabled it forces the Game Object to calculate its full bounds every frame.
    * 
    * This is a relatively expensive operation, especially if enabled on hundreds of Game Objects. So enable it only if you know it's required,
    * or you have tested performance and find it acceptable.
    * 
    * @property {boolean} checkWorldBounds
    * @default
    */
    checkWorldBounds: false,

    /**
    * If this and the `checkWorldBounds` property are both set to `true` then the `kill` method is called as soon as `inWorld` returns false.
    * 
    * @property {boolean} outOfBoundsKill
    * @default
    */
    outOfBoundsKill: false,

    /**
     * If this and the `autoCull` property are both set to `true`, then the `kill` method
     * is called as soon as the Game Object leaves the camera bounds.
     *
     * @property {boolean} outOfCameraBoundsKill
     * @default
     */
    outOfCameraBoundsKill: false,

    /**
    * @property {boolean} _outOfBoundsFired - Internal state var.
    * @private
    */
    _outOfBoundsFired: false,

    /**
    * Checks if the Game Objects bounds are within, or intersect at any point with the Game World bounds.
    *
    * @property {boolean} inWorld
    * @readonly
    */
    inWorld: {

        get: function () {

            return this.game.world.bounds.intersects(this.getBounds());

        }

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* LifeSpan Component Features.
*
* @class
*/
Phaser.Component.LifeSpan = function () {};

/**
 * The LifeSpan component preUpdate handler.
 * Called automatically by the Game Object.
 *
 * @method
 */
Phaser.Component.LifeSpan.preUpdate = function () {

    if (this.lifespan > 0)
    {
        this.lifespan -= this.game.time.physicsElapsedMS;

        if (this.lifespan <= 0)
        {
            this.kill();
            return false;
        }
    }

    return true;

};

Phaser.Component.LifeSpan.prototype = {

    /**
    * A useful flag to control if the Game Object is alive or dead.
    *
    * This is set automatically by the Health components `damage` method should the object run out of health.
    * Or you can toggle it via your game code.
    *
    * This property is mostly just provided to be used by your game - it doesn't effect rendering or logic updates.
    * However you can use `Group.getFirstAlive` in conjunction with this property for fast object pooling and recycling.
    * @property {boolean} alive
    * @default
    */
    alive: true,

    /**
    * The lifespan allows you to give a Game Object a lifespan in milliseconds.
    *
    * Once the Game Object is 'born' you can set this to a positive value.
    *
    * It is automatically decremented by the millisecond equivalent of `game.time.physicsElapsed` each frame.
    * When it reaches zero it will call the `kill` method.
    *
    * Very handy for particles, bullets, collectibles, or any other short-lived entity.
    *
    * @property {number} lifespan
    * @default
    */
    lifespan: 0,

    /**
    * Brings a 'dead' Game Object back to life, optionally resetting its health value in the process.
    *
    * A resurrected Game Object has its `alive`, `exists` and `visible` properties all set to true.
    *
    * It will dispatch the `onRevived` event. Listen to `events.onRevived` for the signal.
    *
    * @method
    * @param {number} [health=100] - The health to give the Game Object. Only set if the GameObject has the Health component.
    * @return {PIXI.DisplayObject} This instance.
    */
    revive: function (health) {

        if (health === undefined) { health = 100; }

        this.alive = true;
        this.exists = true;
        this.visible = true;

        if (typeof this.setHealth === 'function')
        {
            this.setHealth(health);
        }

        if (this.events)
        {
            this.events.onRevived$dispatch(this);
        }

        return this;

    },

    /**
    * Kills a Game Object. A killed Game Object has its `alive`, `exists` and `visible` properties all set to false.
    *
    * It will dispatch the `onKilled` event. You can listen to `events.onKilled` for the signal.
    *
    * Note that killing a Game Object is a way for you to quickly recycle it in an object pool,
    * it doesn't destroy the object or free it up from memory.
    *
    * If you don't need this Game Object any more you should call `destroy` instead.
    *
    * @method
    * @return {PIXI.DisplayObject} This instance.
    */
    kill: function () {

        this.alive = false;
        this.exists = false;
        this.visible = false;

        if (this.events)
        {
            this.events.onKilled$dispatch(this);
        }

        return this;

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The LoadTexture component manages the loading of a texture into the Game Object and the changing of frames.
*
* @class
*/
Phaser.Component.LoadTexture = function () {};

Phaser.Component.LoadTexture.prototype = {

    /**
    * @property {boolean} customRender - Does this texture require a custom render call? (as set by BitmapData, Video, etc)
    * @private
    */
    customRender: false,

    /**
    * @property {Phaser.Rectangle} _frame - Internal cache var.
    * @private
    */
    _frame: null,

    /**
    * Changes the base texture the Game Object is using. The old texture is removed and the new one is referenced or fetched from the Cache.
    * 
    * If your Game Object is using a frame from a texture atlas and you just wish to change to another frame, then see the `frame` or `frameName` properties instead.
    * 
    * You should only use `loadTexture` if you want to replace the base texture entirely.
    * 
    * Calling this method causes a WebGL texture update, so use sparingly or in low-intensity portions of your game, or if you know the new texture is already on the GPU.
    *
    * You can use the new const `Phaser.PENDING_ATLAS` as the texture key for any sprite. 
    * Doing this then sets the key to be the `frame` argument (the frame is set to zero). 
    * 
    * This allows you to create sprites using `load.image` during development, and then change them 
    * to use a Texture Atlas later in development by simply searching your code for 'PENDING_ATLAS' 
    * and swapping it to be the key of the atlas data.
    *
    * Note: You cannot use a RenderTexture as a texture for a TileSprite.
    *
    * @method
    * @param {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache Image entry, or an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
    * @param {string|number} [frame] - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
    * @param {boolean} [stopAnimation=true] - If an animation is already playing on this Sprite you can choose to stop it or let it carry on playing.
    */
    loadTexture: function (key, frame, stopAnimation) {

        if (key === Phaser.PENDING_ATLAS)
        {
            key = frame;
            frame = 0;
        }
        else
        {
            frame = frame || 0;
        }

        if ((stopAnimation || stopAnimation === undefined) && this.animations)
        {
            this.animations.stop();
        }

        this.key = key;
        this.customRender = false;
        var cache = this.game.cache;

        var setFrame = true;
        var smoothed = !this.texture.baseTexture.scaleMode;

        if (Phaser.RenderTexture && key instanceof Phaser.RenderTexture)
        {
            this.key = key.key;
            this.setTexture(key);
        }
        else if (Phaser.BitmapData && key instanceof Phaser.BitmapData)
        {
            this.customRender = true;

            this.setTexture(key.texture);

            if (cache.hasFrameData(key.key, Phaser.Cache.BITMAPDATA))
            {
                setFrame = !this.animations.loadFrameData(cache.getFrameData(key.key, Phaser.Cache.BITMAPDATA), frame);
            }
            else
            {
                setFrame = !this.animations.loadFrameData(key.frameData, 0);
            }
        }
        else if (Phaser.Video && key instanceof Phaser.Video)
        {
            this.customRender = true;

            //  This works from a reference, which probably isn't what we need here
            var valid = key.texture.valid;
            this.setTexture(key.texture);
            this.setFrame(key.texture.frame.clone());
            key.onChangeSource.add(this.resizeFrame, this);
            this.texture.valid = valid;
        }
        else if (Phaser.Tilemap && key instanceof Phaser.TilemapLayer)
        {
            // this.customRender = true;

            this.setTexture(PIXI.Texture.fromCanvas(key.canvas));
        }
        else if (key instanceof PIXI.Texture)
        {
            this.setTexture(key);
        }
        else
        {
            var img = cache.getImage(key, true);

            this.key = img.key;
            this.setTexture(new PIXI.Texture(img.base));

            if (key === '__default')
            {
                this.texture.baseTexture.skipRender = true;
            }
            else
            {
                this.texture.baseTexture.skipRender = false;
            }

            setFrame = !this.animations.loadFrameData(img.frameData, frame);
        }
        
        if (setFrame)
        {
            this._frame = Phaser.Rectangle.clone(this.texture.frame);
        }

        if (!smoothed)
        {
            this.texture.baseTexture.scaleMode = 1;
        }

    },

    /**
    * Sets the texture frame the Game Object uses for rendering.
    * 
    * This is primarily an internal method used by `loadTexture`, but is exposed for the use of plugins and custom classes.
    *
    * @method
    * @param {Phaser.Frame} frame - The Frame to be used by the texture.
    */
    setFrame: function (frame) {

        this._frame = frame;

        this.texture.frame.x = frame.x;
        this.texture.frame.y = frame.y;
        this.texture.frame.width = frame.width;
        this.texture.frame.height = frame.height;

        this.texture.crop.x = frame.x;
        this.texture.crop.y = frame.y;
        this.texture.crop.width = frame.width;
        this.texture.crop.height = frame.height;

        if (frame.trimmed)
        {
            if (this.texture.trim)
            {
                this.texture.trim.x = frame.spriteSourceSizeX;
                this.texture.trim.y = frame.spriteSourceSizeY;
                this.texture.trim.width = frame.sourceSizeW;
                this.texture.trim.height = frame.sourceSizeH;
            }
            else
            {
                this.texture.trim = { x: frame.spriteSourceSizeX, y: frame.spriteSourceSizeY, width: frame.sourceSizeW, height: frame.sourceSizeH };
            }

            this.texture.width = frame.sourceSizeW;
            this.texture.height = frame.sourceSizeH;
            this.texture.frame.width = frame.sourceSizeW;
            this.texture.frame.height = frame.sourceSizeH;
        }
        else if (!frame.trimmed && this.texture.trim)
        {
            this.texture.trim = null;
        }

        if (this.cropRect)
        {
            this.updateCrop();
        }
        
        this.texture.requiresReTint = true;
        
        this.texture._updateUvs();

        if (this.tilingTexture)
        {
            this.refreshTexture = true;
        }

    },

    /**
    * Resizes the Frame dimensions that the Game Object uses for rendering.
    * 
    * You shouldn't normally need to ever call this, but in the case of special texture types such as Video or BitmapData
    * it can be useful to adjust the dimensions directly in this way.
    *
    * @method
    * @param {object} parent - The parent texture object that caused the resize, i.e. a Phaser.Video object.
    * @param {integer} width - The new width of the texture.
    * @param {integer} height - The new height of the texture.
    */
    resizeFrame: function (parent, width, height) {

        this.texture.frame.resize(width, height);
        this.texture.setFrame(this.texture.frame);

    },

    /**
    * Resets the texture frame dimensions that the Game Object uses for rendering.
    *
    * @method
    */
    resetFrame: function () {

        if (this._frame)
        {
            this.setFrame(this._frame);
        }

    },

    /**
    * Gets or sets the current frame index of the texture being used to render this Game Object.
    *
    * To change the frame set `frame` to the index of the new frame in the sprite sheet you wish this Game Object to use,
    * for example: `player.frame = 4`.
    * 
    * If the frame index given doesn't exist it will revert to the first frame found in the texture.
    * 
    * If you are using a texture atlas then you should use the `frameName` property instead.
    * 
    * If you wish to fully replace the texture being used see `loadTexture`.
    * @property {integer} frame
    */
    frame: {

        get: function () {
            return this.animations.frame;
        },

        set: function (value) {
            this.animations.frame = value;
        }

    },

    /**
    * Gets or sets the current frame name of the texture being used to render this Game Object.
    * 
    * To change the frame set `frameName` to the name of the new frame in the texture atlas you wish this Game Object to use, 
    * for example: `player.frameName = "idle"`.
    *
    * If the frame name given doesn't exist it will revert to the first frame found in the texture and throw a console warning.
    * 
    * If you are using a sprite sheet then you should use the `frame` property instead.
    * 
    * If you wish to fully replace the texture being used see `loadTexture`.
    * @property {string} frameName
    */
    frameName: {

        get: function () {
            return this.animations.frameName;
        },

        set: function (value) {
            this.animations.frameName = value;
        }

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Overlap component allows a Game Object to check if it overlaps with the bounds of another Game Object.
*
* @class
*/
Phaser.Component.Overlap = function () {};

Phaser.Component.Overlap.prototype = {

    /**
    * Checks to see if the bounds of this Game Object overlaps with the bounds of the given Display Object, 
    * which can be a Sprite, Image, TileSprite or anything that extends those such as Button or provides a `getBounds` method and result.
    * 
    * This check ignores the `hitArea` property if set and runs a `getBounds` comparison on both objects to determine the result.
    * 
    * Therefore it's relatively expensive to use in large quantities, i.e. with lots of Sprites at a high frequency.
    * It should be fine for low-volume testing where physics isn't required.
    *
    * @method
    * @param {Phaser.Sprite|Phaser.Image|Phaser.TileSprite|Phaser.Button|PIXI.DisplayObject} displayObject - The display object to check against.
    * @return {boolean} True if the bounds of this Game Object intersects at any point with the bounds of the given display object.
    */
    overlap: function (displayObject) {

        return Phaser.Rectangle.intersects(this.getBounds(), displayObject.getBounds());

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The PhysicsBody component manages the Game Objects physics body and physics enabling.
* It also overrides the x and y properties, ensuring that any manual adjustment of them is reflected in the physics body itself.
*
* @class
*/
Phaser.Component.PhysicsBody = function () {};

/**
 * The PhysicsBody component preUpdate handler.
 * Called automatically by the Game Object.
 *
 * @method
 */
Phaser.Component.PhysicsBody.preUpdate = function () {

    if (this.fresh && this.exists)
    {
        this.world.setTo(this.parent.position.x + this.position.x, this.parent.position.y + this.position.y);
        this.worldTransform.tx = this.world.x;
        this.worldTransform.ty = this.world.y;

        this.previousPosition.set(this.world.x, this.world.y);
        this.previousRotation = this.rotation;

        if (this.body)
        {
            this.body.preUpdate();
        }

        this.fresh = false;

        return false;
    }

    this.previousPosition.set(this.world.x, this.world.y);
    this.previousRotation = this.rotation;

    if (!this._exists || !this.parent.exists)
    {
        this.renderOrderID = -1;
        return false;
    }

    return true;

};

/**
 * The PhysicsBody component postUpdate handler.
 * Called automatically by the Game Object.
 *
 * @method
 */
Phaser.Component.PhysicsBody.postUpdate = function () {

    if (this.exists && this.body)
    {
        this.body.postUpdate();
    }

};

Phaser.Component.PhysicsBody.prototype = {

    /**
    * `body` is the Game Objects physics body. Once a Game Object is enabled for physics you access all associated 
    * properties and methods via it.
    * 
    * By default Game Objects won't add themselves to any physics system and their `body` property will be `null`.
    * 
    * To enable this Game Object for physics you need to call `game.physics.enable(object, system)` where `object` is this object
    * and `system` is the Physics system you are using. If none is given it defaults to `Phaser.Physics.Arcade`.
    * 
    * You can alternatively call `game.physics.arcade.enable(object)`, or add this Game Object to a physics enabled Group.
    *
    * Important: Enabling a Game Object for P2 or Ninja physics will automatically set its `anchor` property to 0.5, 
    * so the physics body is centered on the Game Object.
    * 
    * If you need a different result then adjust or re-create the Body shape offsets manually or reset the anchor after enabling physics.
    *
    * @property {Phaser.Physics.Arcade.Body|Phaser.Physics.P2.Body|Phaser.Physics.Ninja.Body|null} body
    * @default
    */
    body: null,

    /**
    * The position of the Game Object on the x axis relative to the local coordinates of the parent.
    *
    * @property {number} x
    */
    x: {

        get: function () {

            return this.position.x;

        },

        set: function (value) {

            this.position.x = value;

            if (this.body && !this.body.dirty)
            {
                this.body._reset = true;
            }

        }

    },

    /**
    * The position of the Game Object on the y axis relative to the local coordinates of the parent.
    *
    * @property {number} y
    */
    y: {

        get: function () {

            return this.position.y;

        },

        set: function (value) {

            this.position.y = value;

            if (this.body && !this.body.dirty)
            {
                this.body._reset = true;
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
* The Reset component allows a Game Object to be reset and repositioned to a new location.
*
* @class
*/
Phaser.Component.Reset = function () {};

/**
* Resets the Game Object.
* 
* This moves the Game Object to the given x/y world coordinates and sets `fresh`, `exists`, 
* `visible` and `renderable` to true.
*
* If this Game Object has the LifeSpan component it will also set `alive` to true and `health` to the given value.
*
* If this Game Object has a Physics Body it will reset the Body.
*
* @method
* @param {number} x - The x coordinate (in world space) to position the Game Object at.
* @param {number} y - The y coordinate (in world space) to position the Game Object at.
* @param {number} [health=1] - The health to give the Game Object if it has the Health component.
* @return {PIXI.DisplayObject} This instance.
*/
Phaser.Component.Reset.prototype.reset = function (x, y, health) {

    if (health === undefined) { health = 1; }

    this.world.set(x, y);
    this.position.set(x, y);

    this.fresh = true;
    this.exists = true;
    this.visible = true;
    this.renderable = true;

    if (this.components.InWorld)
    {
        this._outOfBoundsFired = false;
    }

    if (this.components.LifeSpan)
    {
        this.alive = true;
        this.health = health;
    }

    if (this.components.PhysicsBody)
    {
        if (this.body)
        {
            this.body.reset(x, y, false, false);
        }
    }

    return this;

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The ScaleMinMax component allows a Game Object to limit how far it can be scaled by its parent.
*
* @class
*/
Phaser.Component.ScaleMinMax = function () {};

Phaser.Component.ScaleMinMax.prototype = {

    /**
    * The callback that will apply any scale limiting to the worldTransform.
    * @property {function} transformCallback
    */
    transformCallback: null,

    /**
    * The context under which `transformCallback` is called.
    * @property {object} transformCallbackContext
    */
    transformCallbackContext: this,

    /**
    * The minimum scale this Game Object will scale down to.
    * 
    * It allows you to prevent a parent from scaling this Game Object lower than the given value.
    * 
    * Set it to `null` to remove the limit.
    * @property {Phaser.Point} scaleMin
    */
    scaleMin: null,

    /**
    * The maximum scale this Game Object will scale up to. 
    * 
    * It allows you to prevent a parent from scaling this Game Object higher than the given value.
    * 
    * Set it to `null` to remove the limit.
    * @property {Phaser.Point} scaleMax
    */
    scaleMax: null,

    /**
     * Adjust scaling limits, if set, to this Game Object.
     *
     * @method
     * @private
     * @param {PIXI.Matrix} wt - The updated worldTransform matrix.
     */
    checkTransform: function (wt) {

        if (this.scaleMin)
        {
            if (wt.a < this.scaleMin.x)
            {
                wt.a = this.scaleMin.x;
            }

            if (wt.d < this.scaleMin.y)
            {
                wt.d = this.scaleMin.y;
            }
        }

        if (this.scaleMax)
        {
            if (wt.a > this.scaleMax.x)
            {
                wt.a = this.scaleMax.x;
            }

            if (wt.d > this.scaleMax.y)
            {
                wt.d = this.scaleMax.y;
            }
        }

    },

    /**
     * Sets the scaleMin and scaleMax values. These values are used to limit how far this Game Object will scale based on its parent.
     * 
     * For example if this Game Object has a `minScale` value of 1 and its parent has a `scale` value of 0.5, the 0.5 will be ignored 
     * and the scale value of 1 will be used, as the parents scale is lower than the minimum scale this Game Object should adhere to.
     * 
     * By setting these values you can carefully control how Game Objects deal with responsive scaling.
     * 
     * If only one parameter is given then that value will be used for both scaleMin and scaleMax:
     * `setScaleMinMax(1)` = scaleMin.x, scaleMin.y, scaleMax.x and scaleMax.y all = 1
     *
     * If only two parameters are given the first is set as scaleMin.x and y and the second as scaleMax.x and y:
     * `setScaleMinMax(0.5, 2)` = scaleMin.x and y = 0.5 and scaleMax.x and y = 2
     *
     * If you wish to set `scaleMin` with different values for x and y then either modify Game Object.scaleMin directly, 
     * or pass `null` for the `maxX` and `maxY` parameters.
     * 
     * Call `setScaleMinMax(null)` to clear all previously set values.
     *
     * @method
     * @param {number|null} minX - The minimum horizontal scale value this Game Object can scale down to.
     * @param {number|null} minY - The minimum vertical scale value this Game Object can scale down to.
     * @param {number|null} maxX - The maximum horizontal scale value this Game Object can scale up to.
     * @param {number|null} maxY - The maximum vertical scale value this Game Object can scale up to.
     */
    setScaleMinMax: function (minX, minY, maxX, maxY) {

        if (minY === undefined)
        {
            //  1 parameter, set all to it
            minY = maxX = maxY = minX;
        }
        else if (maxX === undefined)
        {
            //  2 parameters, the first is min, the second max
            maxX = maxY = minY;
            minY = minX;
        }

        if (minX === null)
        {
            this.scaleMin = null;
        }
        else
        {
            if (this.scaleMin)
            {
                this.scaleMin.set(minX, minY);
            }
            else
            {
                this.scaleMin = new Phaser.Point(minX, minY);
            }
        }

        if (maxX === null)
        {
            this.scaleMax = null;
        }
        else
        {
            if (this.scaleMax)
            {
                this.scaleMax.set(maxX, maxY);
            }
            else
            {
                this.scaleMax = new Phaser.Point(maxX, maxY);
            }
        }

        if (this.scaleMin === null)
        {
            this.transformCallback = null;
        }
        else
        {
            this.transformCallback = this.checkTransform;
            this.transformCallbackContext = this;
        }

    }

};
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Smoothed component allows a Game Object to control anti-aliasing of an image based texture.
*
* @class
*/
Phaser.Component.Smoothed = function () {};

Phaser.Component.Smoothed.prototype = {

    /**
    * Enable or disable texture smoothing for this Game Object.
    * 
    * It only takes effect if the Game Object is using an image based texture.
    * 
    * Smoothing is enabled by default.
    *
    * @property {boolean} smoothed
    */
    smoothed: {

        get: function () {

            return !this.texture.baseTexture.scaleMode;

        },

        set: function (value) {

            if (value)
            {
                if (this.texture)
                {
                    this.texture.baseTexture.scaleMode = 0;
                }
            }
            else
            {
                if (this.texture)
                {
                    this.texture.baseTexture.scaleMode = 1;
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
* The GameObjectFactory is a quick way to create many common game objects
* using {@linkcode Phaser.Game#add `game.add`}.
*
* Created objects are _automatically added_ to the appropriate Manager, World, or manually specified parent Group.
*
* @class Phaser.GameObjectFactory
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.GameObjectFactory = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    * @protected
    */
    this.game = game;

    /**
    * @property {Phaser.World} world - A reference to the game world.
    * @protected
    */
    this.world = this.game.world;

};

Phaser.GameObjectFactory.prototype = {

    /**
    * Adds an existing display object to the game world.
    * 
    * @method Phaser.GameObjectFactory#existing
    * @param {any} object - An instance of Phaser.Sprite, Phaser.Button or any other display object.
    * @return {any} The child that was added to the World.
    */
    existing: function (object) {

        return this.world.add(object);

    },

    /**
    * Weapons provide the ability to easily create a bullet pool and manager.
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
    * @method Phaser.GameObjectFactory#weapon
    * @param {integer} [quantity=1] - The quantity of bullets to seed the Weapon with. If -1 it will set the pool to automatically expand.
    * @param {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} [key] - The image used as a texture by the bullets during rendering. If a string Phaser will get for an entry in the Image Cache. Or it can be an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
    * @param {string|number} [frame] - If a Texture Atlas or Sprite Sheet is used this allows you to specify the frame to be used by the bullets. Use either an integer for a Frame ID or a string for a frame name.
    * @param {Phaser.Group} [group] - Optional Group to add the Weapon to. If not specified it will be added to the World group.
    * @returns {Phaser.Weapon} A Weapon instance.
    */
    weapon: function (quantity, key, frame, group) {

        var weapon = this.game.plugins.add(Phaser.Weapon);

        weapon.createBullets(quantity, key, frame, group);

        return weapon;

    },

    /**
    * Create a new `Image` object.
    * 
    * An Image is a light-weight object you can use to display anything that doesn't need physics or animation.
    * 
    * It can still rotate, scale, crop and receive input events. 
    * This makes it perfect for logos, backgrounds, simple buttons and other non-Sprite graphics.
    *
    * @method Phaser.GameObjectFactory#image
    * @param {number} [x=0] - The x coordinate of the Image. The coordinate is relative to any parent container this Image may be in.
    * @param {number} [y=0] - The y coordinate of the Image. The coordinate is relative to any parent container this Image may be in.
    * @param {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} [key] - The image used as a texture by this display object during rendering. If a string Phaser will get for an entry in the Image Cache. Or it can be an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
    * @param {string|number} [frame] - If a Texture Atlas or Sprite Sheet is used this allows you to specify the frame to be used. Use either an integer for a Frame ID or a string for a frame name.
    * @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
    * @returns {Phaser.Image} The newly created Image object.
    */
    image: function (x, y, key, frame, group) {

        if (group === undefined) { group = this.world; }

        return group.add(new Phaser.Image(this.game, x, y, key, frame));

    },

    /**
    * Create a new Sprite with specific position and sprite sheet key.
    *
    * At its most basic a Sprite consists of a set of coordinates and a texture that is used when rendered.
    * They also contain additional properties allowing for physics motion (via Sprite.body), input handling (via Sprite.input),
    * events (via Sprite.events), animation (via Sprite.animations), camera culling and more. Please see the Examples for use cases.
    *
    * @method Phaser.GameObjectFactory#sprite
    * @param {number} [x=0] - The x coordinate of the sprite. The coordinate is relative to any parent container this sprite may be in.
    * @param {number} [y=0] - The y coordinate of the sprite. The coordinate is relative to any parent container this sprite may be in.
    * @param {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} [key] - The image used as a texture by this display object during rendering. If a string Phaser will get for an entry in the Image Cache. Or it can be an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
    * @param {string|number} [frame] - If a Texture Atlas or Sprite Sheet is used this allows you to specify the frame to be used. Use either an integer for a Frame ID or a string for a frame name.
    * @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
    * @returns {Phaser.Sprite} The newly created Sprite object.
    */
    sprite: function (x, y, key, frame, group) {

        if (group === undefined) { group = this.world; }

        return group.create(x, y, key, frame);

    },

    /**
    * Create a new Creature Animation object.
    *
    * Creature is a custom Game Object used in conjunction with the Creature Runtime libraries by Kestrel Moon Studios.
    * 
    * It allows you to display animated Game Objects that were created with the [Creature Automated Animation Tool](http://www.kestrelmoon.com/creature/).
    * 
    * Note 1: You can only use Phaser.Creature objects in WebGL enabled games. They do not work in Canvas mode games.
    *
    * Note 2: You must use a build of Phaser that includes the CreatureMeshBone.js runtime and gl-matrix.js, or have them
    * loaded before your Phaser game boots.
    * 
    * See the Phaser custom build process for more details.
    *
    * @method Phaser.GameObjectFactory#creature
    * @param {number} [x=0] - The x coordinate of the creature. The coordinate is relative to any parent container this creature may be in.
    * @param {number} [y=0] - The y coordinate of the creature. The coordinate is relative to any parent container this creature may be in.
    * @param {string|PIXI.Texture} [key] - The image used as a texture by this creature object during rendering. If a string Phaser will get for an entry in the Image Cache. Or it can be an instance of a PIXI.Texture.
    * @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
    * @returns {Phaser.Creature} The newly created Sprite object.
    */
    creature: function (x, y, key, mesh, group) {

        if (group === undefined) { group = this.world; }

        var obj = new Phaser.Creature(this.game, x, y, key, mesh);

        group.add(obj);

        return obj;

    },

    /**
    * Create a tween on a specific object.
    * 
    * The object can be any JavaScript object or Phaser object such as Sprite.
    *
    * @method Phaser.GameObjectFactory#tween
    * @param {object} object - Object the tween will be run on.
    * @return {Phaser.Tween} The newly created Phaser.Tween object.
    */
    tween: function (object) {

        return this.game.tweens.create(object);

    },

    /**
    * A Group is a container for display objects that allows for fast pooling, recycling and collision checks.
    *
    * @method Phaser.GameObjectFactory#group
    * @param {any} [parent] - The parent Group or DisplayObjectContainer that will hold this group, if any. If set to null the Group won't be added to the display list. If undefined it will be added to World by default.
    * @param {string} [name='group'] - A name for this Group. Not used internally but useful for debugging.
    * @param {boolean} [addToStage=false] - If set to true this Group will be added directly to the Game.Stage instead of Game.World.
    * @param {boolean} [enableBody=false] - If true all Sprites created with `Group.create` or `Group.createMulitple` will have a physics body created on them. Change the body type with physicsBodyType.
    * @param {number} [physicsBodyType=0] - If enableBody is true this is the type of physics body that is created on new Sprites. Phaser.Physics.ARCADE, Phaser.Physics.P2, Phaser.Physics.NINJA, etc.
    * @return {Phaser.Group} The newly created Group.
    */
    group: function (parent, name, addToStage, enableBody, physicsBodyType) {

        return new Phaser.Group(this.game, parent, name, addToStage, enableBody, physicsBodyType);

    },

    /**
    * A Group is a container for display objects that allows for fast pooling, recycling and collision checks.
    * 
    * A Physics Group is the same as an ordinary Group except that is has enableBody turned on by default, so any Sprites it creates
    * are automatically given a physics body.
    *
    * @method Phaser.GameObjectFactory#physicsGroup
    * @param {number} [physicsBodyType=Phaser.Physics.ARCADE] - If enableBody is true this is the type of physics body that is created on new Sprites. Phaser.Physics.ARCADE, Phaser.Physics.P2JS, Phaser.Physics.NINJA, etc.
    * @param {any} [parent] - The parent Group or DisplayObjectContainer that will hold this group, if any. If set to null the Group won't be added to the display list. If undefined it will be added to World by default.
    * @param {string} [name='group'] - A name for this Group. Not used internally but useful for debugging.
    * @param {boolean} [addToStage=false] - If set to true this Group will be added directly to the Game.Stage instead of Game.World.
    * @return {Phaser.Group} The newly created Group.
    */
    physicsGroup: function (physicsBodyType, parent, name, addToStage) {

        return new Phaser.Group(this.game, parent, name, addToStage, true, physicsBodyType);

    },

    /**
    * A SpriteBatch is a really fast version of a Phaser Group built solely for speed.
    * Use when you need a lot of sprites or particles all sharing the same texture.
    * The speed gains are specifically for WebGL. In Canvas mode you won't see any real difference.
    *
    * @method Phaser.GameObjectFactory#spriteBatch
    * @param {Phaser.Group|null} parent - The parent Group that will hold this Sprite Batch. Set to `undefined` or `null` to add directly to game.world.
    * @param {string} [name='group'] - A name for this Sprite Batch. Not used internally but useful for debugging.
    * @param {boolean} [addToStage=false] - If set to true this Sprite Batch will be added directly to the Game.Stage instead of the parent.
    * @return {Phaser.SpriteBatch} The newly created Sprite Batch.
    */
    spriteBatch: function (parent, name, addToStage) {

        if (parent === undefined) { parent = null; }
        if (name === undefined) { name = 'group'; }
        if (addToStage === undefined) { addToStage = false; }

        return new Phaser.SpriteBatch(this.game, parent, name, addToStage);

    },

    /**
    * Creates a new Sound object.
    *
    * @method Phaser.GameObjectFactory#audio
    * @param {string} key - The Game.cache key of the sound that this object will use.
    * @param {number} [volume=1] - The volume at which the sound will be played.
    * @param {boolean} [loop=false] - Whether or not the sound will loop.
    * @param {boolean} [connect=true] - Controls if the created Sound object will connect to the master gainNode of the SoundManager when running under WebAudio.
    * @return {Phaser.Sound} The newly created sound object.
    */
    audio: function (key, volume, loop, connect) {

        return this.game.sound.add(key, volume, loop, connect);

    },

    /**
    * Creates a new Sound object.
    *
    * @method Phaser.GameObjectFactory#sound
    * @param {string} key - The Game.cache key of the sound that this object will use.
    * @param {number} [volume=1] - The volume at which the sound will be played.
    * @param {boolean} [loop=false] - Whether or not the sound will loop.
    * @param {boolean} [connect=true] - Controls if the created Sound object will connect to the master gainNode of the SoundManager when running under WebAudio.
    * @return {Phaser.Sound} The newly created sound object.
    */
    sound: function (key, volume, loop, connect) {

        return this.game.sound.add(key, volume, loop, connect);

    },

    /**
     * Creates a new AudioSprite object.
     *
     * @method Phaser.GameObjectFactory#audioSprite
     * @param {string} key - The Game.cache key of the sound that this object will use.
     * @return {Phaser.AudioSprite} The newly created AudioSprite object.
     */
    audioSprite: function (key) {

        return this.game.sound.addSprite(key);

    },

    /**
    * Creates a new TileSprite object.
    *
    * @method Phaser.GameObjectFactory#tileSprite
    * @param {number} x - The x coordinate of the TileSprite. The coordinate is relative to any parent container this TileSprite may be in.
    * @param {number} y - The y coordinate of the TileSprite. The coordinate is relative to any parent container this TileSprite may be in.
    * @param {number} width - The width of the TileSprite.
    * @param {number} height - The height of the TileSprite.
    * @param {string|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the TileSprite during rendering. It can be a string which is a reference to the Phaser Image Cache entry, or an instance of a PIXI.Texture or BitmapData.
    * @param {string|number} [frame] - If a Texture Atlas or Sprite Sheet is used this allows you to specify the frame to be used. Use either an integer for a Frame ID or a string for a frame name.
    * @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
    * @return {Phaser.TileSprite} The newly created TileSprite object.
    */
    tileSprite: function (x, y, width, height, key, frame, group) {

        if (group === undefined) { group = this.world; }

        return group.add(new Phaser.TileSprite(this.game, x, y, width, height, key, frame));

    },

    /**
    * Creates a new Rope object.
    *
    * Example usage: https://github.com/codevinsky/phaser-rope-demo/blob/master/dist/demo.js
    *
    * @method Phaser.GameObjectFactory#rope
    * @param {number} [x=0] - The x coordinate of the Rope. The coordinate is relative to any parent container this rope may be in.
    * @param {number} [y=0] - The y coordinate of the Rope. The coordinate is relative to any parent container this rope may be in.
    * @param {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} [key] - The image used as a texture by this display object during rendering. If a string Phaser will get for an entry in the Image Cache. Or it can be an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
    * @param {string|number} [frame] - If a Texture Atlas or Sprite Sheet is used this allows you to specify the frame to be used. Use either an integer for a Frame ID or a string for a frame name.
    * @param {Array} points - An array of {Phaser.Point}.
    * @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
    * @return {Phaser.Rope} The newly created Rope object.
    */
    rope: function (x, y, key, frame, points, group) {

        if (group === undefined) { group = this.world; }

        return group.add(new Phaser.Rope(this.game, x, y, key, frame, points));

    },

    /**
    * Creates a new Text object.
    *
    * @method Phaser.GameObjectFactory#text
    * @param {number} [x=0] - The x coordinate of the Text. The coordinate is relative to any parent container this text may be in.
    * @param {number} [y=0] - The y coordinate of the Text. The coordinate is relative to any parent container this text may be in.
    * @param {string} [text=''] - The text string that will be displayed.
    * @param {object} [style] - The style object containing style attributes like font, font size , etc.
    * @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
    * @return {Phaser.Text} The newly created text object.
    */
    text: function (x, y, text, style, group) {

        if (group === undefined) { group = this.world; }

        return group.add(new Phaser.Text(this.game, x, y, text, style));

    },

    /**
    * Creates a new Button object.
    *
    * @method Phaser.GameObjectFactory#button
    * @param {number} [x=0] - The x coordinate of the Button. The coordinate is relative to any parent container this button may be in.
    * @param {number} [y=0] - The y coordinate of the Button. The coordinate is relative to any parent container this button may be in.
    * @param {string} [key] - The image key as defined in the Game.Cache to use as the texture for this button.
    * @param {function} [callback] - The function to call when this button is pressed
    * @param {object} [callbackContext] - The context in which the callback will be called (usually 'this')
    * @param {string|number} [overFrame] - This is the frame or frameName that will be set when this button is in an over state. Give either a number to use a frame ID or a string for a frame name.
    * @param {string|number} [outFrame] - This is the frame or frameName that will be set when this button is in an out state. Give either a number to use a frame ID or a string for a frame name.
    * @param {string|number} [downFrame] - This is the frame or frameName that will be set when this button is in a down state. Give either a number to use a frame ID or a string for a frame name.
    * @param {string|number} [upFrame] - This is the frame or frameName that will be set when this button is in an up state. Give either a number to use a frame ID or a string for a frame name.
    * @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
    * @return {Phaser.Button} The newly created Button object.
    */
    button: function (x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame, group) {

        if (group === undefined) { group = this.world; }

        return group.add(new Phaser.Button(this.game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame));

    },

    /**
    * Creates a new Graphics object.
    *
    * @method Phaser.GameObjectFactory#graphics
    * @param {number} [x=0] - The x coordinate of the Graphic. The coordinate is relative to any parent container this object may be in.
    * @param {number} [y=0] - The y coordinate of the Graphic. The coordinate is relative to any parent container this object may be in.
    * @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
    * @return {Phaser.Graphics} The newly created graphics object.
    */
    graphics: function (x, y, group) {

        if (group === undefined) { group = this.world; }

        return group.add(new Phaser.Graphics(this.game, x, y));

    },

    /**
    * Create a new Emitter.
    *
    * A particle emitter can be used for one-time explosions or for
    * continuous effects like rain and fire. All it really does is launch Particle objects out
    * at set intervals, and fixes their positions and velocities accordingly.
    *
    * @method Phaser.GameObjectFactory#emitter
    * @param {number} [x=0] - The x coordinate within the Emitter that the particles are emitted from.
    * @param {number} [y=0] - The y coordinate within the Emitter that the particles are emitted from.
    * @param {number} [maxParticles=50] - The total number of particles in this emitter.
    * @return {Phaser.Particles.Arcade.Emitter} The newly created emitter object.
    */
    emitter: function (x, y, maxParticles) {

        return this.game.particles.add(new Phaser.Particles.Arcade.Emitter(this.game, x, y, maxParticles));

    },

    /**
    * Create a new RetroFont object.
    *
    * A RetroFont can be used as a texture for an Image or Sprite and optionally add it to the Cache.
    * A RetroFont uses a bitmap which contains fixed with characters for the font set. You use character spacing to define the set.
    * If you need variable width character support then use a BitmapText object instead. The main difference between a RetroFont and a BitmapText
    * is that a RetroFont creates a single texture that you can apply to a game object, where-as a BitmapText creates one Sprite object per letter of text.
    * The texture can be asssigned or one or multiple images/sprites, but note that the text the RetroFont uses will be shared across them all,
    * i.e. if you need each Image to have different text in it, then you need to create multiple RetroFont objects.
    *
    * @method Phaser.GameObjectFactory#retroFont
    * @param {string} font - The key of the image in the Game.Cache that the RetroFont will use.
    * @param {number} characterWidth - The width of each character in the font set.
    * @param {number} characterHeight - The height of each character in the font set.
    * @param {string} chars - The characters used in the font set, in display order. You can use the TEXT_SET consts for common font set arrangements.
    * @param {number} charsPerRow - The number of characters per row in the font set.
    * @param {number} [xSpacing=0] - If the characters in the font set have horizontal spacing between them set the required amount here.
    * @param {number} [ySpacing=0] - If the characters in the font set have vertical spacing between them set the required amount here.
    * @param {number} [xOffset=0] - If the font set doesn't start at the top left of the given image, specify the X coordinate offset here.
    * @param {number} [yOffset=0] - If the font set doesn't start at the top left of the given image, specify the Y coordinate offset here.
    * @return {Phaser.RetroFont} The newly created RetroFont texture which can be applied to an Image or Sprite.
    */
    retroFont: function (font, characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset) {

        return new Phaser.RetroFont(this.game, font, characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset);

    },

    /**
    * Create a new BitmapText object.
    *
    * BitmapText objects work by taking a texture file and an XML file that describes the font structure.
    * It then generates a new Sprite object for each letter of the text, proportionally spaced out and aligned to 
    * match the font structure.
    * 
    * BitmapText objects are less flexible than Text objects, in that they have less features such as shadows, fills and the ability 
    * to use Web Fonts. However you trade this flexibility for pure rendering speed. You can also create visually compelling BitmapTexts by 
    * processing the font texture in an image editor first, applying fills and any other effects required.
    *
    * To create multi-line text insert \r, \n or \r\n escape codes into the text string.
    *
    * To create a BitmapText data files you can use:
    *
    * BMFont (Windows, free): http://www.angelcode.com/products/bmfont/
    * Glyph Designer (OS X, commercial): http://www.71squared.com/en/glyphdesigner
    * Littera (Web-based, free): http://kvazars.com/littera/
    *
    * @method Phaser.GameObjectFactory#bitmapText
    * @param {number} x - X coordinate to display the BitmapText object at.
    * @param {number} y - Y coordinate to display the BitmapText object at.
    * @param {string} font - The key of the BitmapText as stored in Phaser.Cache.
    * @param {string} [text=''] - The text that will be rendered. This can also be set later via BitmapText.text.
    * @param {number} [size=32] - The size the font will be rendered at in pixels.
    * @param {Phaser.Group} [group] - Optional Group to add the object to. If not specified it will be added to the World group.
    * @return {Phaser.BitmapText} The newly created bitmapText object.
    */
    bitmapText: function (x, y, font, text, size, group) {

        if (group === undefined) { group = this.world; }

        return group.add(new Phaser.BitmapText(this.game, x, y, font, text, size));

    },

    /**
    * Creates a new Phaser.Tilemap object.
    *
    * The map can either be populated with data from a Tiled JSON file or from a CSV file.
    * To do this pass the Cache key as the first parameter. When using Tiled data you need only provide the key.
    * When using CSV data you must provide the key and the tileWidth and tileHeight parameters.
    * If creating a blank tilemap to be populated later, you can either specify no parameters at all and then use `Tilemap.create` or pass the map and tile dimensions here.
    * Note that all Tilemaps use a base tile size to calculate dimensions from, but that a TilemapLayer may have its own unique tile size that overrides it.
    *
    * @method Phaser.GameObjectFactory#tilemap
    * @param {string} [key] - The key of the tilemap data as stored in the Cache. If you're creating a blank map either leave this parameter out or pass `null`.
    * @param {number} [tileWidth=32] - The pixel width of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
    * @param {number} [tileHeight=32] - The pixel height of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
    * @param {number} [width=10] - The width of the map in tiles. If this map is created from Tiled or CSV data you don't need to specify this.
    * @param {number} [height=10] - The height of the map in tiles. If this map is created from Tiled or CSV data you don't need to specify this.
    * @return {Phaser.Tilemap} The newly created tilemap object.
    */
    tilemap: function (key, tileWidth, tileHeight, width, height) {

        return new Phaser.Tilemap(this.game, key, tileWidth, tileHeight, width, height);

    },

    /**
    * A dynamic initially blank canvas to which images can be drawn.
    *
    * @method Phaser.GameObjectFactory#renderTexture
    * @param {number} [width=100] - the width of the RenderTexture.
    * @param {number} [height=100] - the height of the RenderTexture.
    * @param {string} [key=''] - Asset key for the RenderTexture when stored in the Cache (see addToCache parameter).
    * @param {boolean} [addToCache=false] - Should this RenderTexture be added to the Game.Cache? If so you can retrieve it with Cache.getTexture(key)
    * @return {Phaser.RenderTexture} The newly created RenderTexture object.
    */
    renderTexture: function (width, height, key, addToCache) {

        if (key === undefined || key === '') { key = this.game.rnd.uuid(); }
        if (addToCache === undefined) { addToCache = false; }

        var texture = new Phaser.RenderTexture(this.game, width, height, key);

        if (addToCache)
        {
            this.game.cache.addRenderTexture(key, texture);
        }

        return texture;

    },

    /**
    * Create a Video object.
    *
    * This will return a Phaser.Video object which you can pass to a Sprite to be used as a texture.
    *
    * @method Phaser.GameObjectFactory#video
    * @param {string|null} [key=null] - The key of the video file in the Phaser.Cache that this Video object will play. Set to `null` or leave undefined if you wish to use a webcam as the source. See `startMediaStream` to start webcam capture.
    * @param {string|null} [url=null] - If the video hasn't been loaded then you can provide a full URL to the file here (make sure to set key to null)
    * @return {Phaser.Video} The newly created Video object.
    */
    video: function (key, url) {

        return new Phaser.Video(this.game, key, url);

    },

    /**
    * Create a BitmapData object.
    *
    * A BitmapData object can be manipulated and drawn to like a traditional Canvas object and used to texture Sprites.
    *
    * @method Phaser.GameObjectFactory#bitmapData
    * @param {number} [width=256] - The width of the BitmapData in pixels.
    * @param {number} [height=256] - The height of the BitmapData in pixels.
    * @param {string} [key=''] - Asset key for the BitmapData when stored in the Cache (see addToCache parameter).
    * @param {boolean} [addToCache=false] - Should this BitmapData be added to the Game.Cache? If so you can retrieve it with Cache.getBitmapData(key)
    * @return {Phaser.BitmapData} The newly created BitmapData object.
    */
    bitmapData: function (width, height, key, addToCache) {

        if (addToCache === undefined) { addToCache = false; }
        if (key === undefined || key === '') { key = this.game.rnd.uuid(); }

        var texture = new Phaser.BitmapData(this.game, key, width, height);

        if (addToCache)
        {
            this.game.cache.addBitmapData(key, texture);
        }

        return texture;

    },

    /**
    * A WebGL shader/filter that can be applied to Sprites.
    *
    * @method Phaser.GameObjectFactory#filter
    * @param {string} filter - The name of the filter you wish to create, for example HueRotate or SineWave.
    * @param {any} - Whatever parameters are needed to be passed to the filter init function.
    * @return {Phaser.Filter} The newly created Phaser.Filter object.
    */
    filter: function (filter) {

        var args = Array.prototype.slice.call(arguments, 1);

        var filter = new Phaser.Filter[filter](this.game);

        filter.init.apply(filter, args);

        return filter;

    },

    /**
    * Add a new Plugin into the PluginManager.
    *
    * The Plugin must have 2 properties: `game` and `parent`. Plugin.game is set to the game reference the PluginManager uses, and parent is set to the PluginManager.
    *
    * @method Phaser.GameObjectFactory#plugin
    * @param {object|Phaser.Plugin} plugin - The Plugin to add into the PluginManager. This can be a function or an existing object.
    * @param {...*} parameter - Additional parameters that will be passed to the Plugin.init method.
    * @return {Phaser.Plugin} The Plugin that was added to the manager.
    */
    plugin: function (plugin) {

        return this.game.plugins.add(plugin);

    }

};

Phaser.GameObjectFactory.prototype.constructor = Phaser.GameObjectFactory;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The GameObjectCreator is a quick way to create common game objects _without_ adding them to the game world.
* The object creator can be accessed with {@linkcode Phaser.Game#make `game.make`}.
*
* @class Phaser.GameObjectCreator
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.GameObjectCreator = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    * @protected
    */
    this.game = game;

    /**
    * @property {Phaser.World} world - A reference to the game world.
    * @protected
    */
    this.world = this.game.world;

};

Phaser.GameObjectCreator.prototype = {

    /**
    * Create a new Image object.
    *
    * An Image is a light-weight object you can use to display anything that doesn't need physics or animation.
    * It can still rotate, scale, crop and receive input events. This makes it perfect for logos, backgrounds, simple buttons and other non-Sprite graphics.
    *
    * @method Phaser.GameObjectCreator#image
    * @param {number} x - X position of the image.
    * @param {number} y - Y position of the image.
    * @param {string|Phaser.RenderTexture|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
    * @param {string|number} [frame] - If the sprite uses an image from a texture atlas or sprite sheet you can pass the frame here. Either a number for a frame ID or a string for a frame name.
    * @returns {Phaser.Image} the newly created sprite object.
    */
    image: function (x, y, key, frame) {

        return new Phaser.Image(this.game, x, y, key, frame);

    },

    /**
    * Create a new Sprite with specific position and sprite sheet key.
    *
    * @method Phaser.GameObjectCreator#sprite
    * @param {number} x - X position of the new sprite.
    * @param {number} y - Y position of the new sprite.
    * @param {string|Phaser.RenderTexture|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
    * @param {string|number} [frame] - If the sprite uses an image from a texture atlas or sprite sheet you can pass the frame here. Either a number for a frame ID or a string for a frame name.
    * @returns {Phaser.Sprite} the newly created sprite object.
    */
    sprite: function (x, y, key, frame) {

        return new Phaser.Sprite(this.game, x, y, key, frame);

    },

    /**
    * Create a tween object for a specific object.
    *
    * The object can be any JavaScript object or Phaser object such as Sprite.
    *
    * @method Phaser.GameObjectCreator#tween
    * @param {object} obj - Object the tween will be run on.
    * @return {Phaser.Tween} The Tween object.
    */
    tween: function (obj) {

        return new Phaser.Tween(obj, this.game, this.game.tweens);

    },

    /**
    * A Group is a container for display objects that allows for fast pooling, recycling and collision checks.
    *
    * @method Phaser.GameObjectCreator#group
    * @param {any} parent - The parent Group or DisplayObjectContainer that will hold this group, if any.
    * @param {string} [name='group'] - A name for this Group. Not used internally but useful for debugging.
    * @param {boolean} [addToStage=false] - If set to true this Group will be added directly to the Game.Stage instead of Game.World.
    * @param {boolean} [enableBody=false] - If true all Sprites created with `Group.create` or `Group.createMulitple` will have a physics body created on them. Change the body type with physicsBodyType.
    * @param {number} [physicsBodyType=0] - If enableBody is true this is the type of physics body that is created on new Sprites. Phaser.Physics.ARCADE, Phaser.Physics.P2, Phaser.Physics.NINJA, etc.
    * @return {Phaser.Group} The newly created Group.
    */
    group: function (parent, name, addToStage, enableBody, physicsBodyType) {

        return new Phaser.Group(this.game, parent, name, addToStage, enableBody, physicsBodyType);

    },

    /**
    * Create a new SpriteBatch.
    *
    * @method Phaser.GameObjectCreator#spriteBatch
    * @param {any} parent - The parent Group or DisplayObjectContainer that will hold this group, if any.
    * @param {string} [name='group'] - A name for this Group. Not used internally but useful for debugging.
    * @param {boolean} [addToStage=false] - If set to true this Group will be added directly to the Game.Stage instead of Game.World.
    * @return {Phaser.SpriteBatch} The newly created group.
    */
    spriteBatch: function (parent, name, addToStage) {

        if (name === undefined) { name = 'group'; }
        if (addToStage === undefined) { addToStage = false; }

        return new Phaser.SpriteBatch(this.game, parent, name, addToStage);

    },

    /**
    * Creates a new Sound object.
    *
    * @method Phaser.GameObjectCreator#audio
    * @param {string} key - The Game.cache key of the sound that this object will use.
    * @param {number} [volume=1] - The volume at which the sound will be played.
    * @param {boolean} [loop=false] - Whether or not the sound will loop.
    * @param {boolean} [connect=true] - Controls if the created Sound object will connect to the master gainNode of the SoundManager when running under WebAudio.
    * @return {Phaser.Sound} The newly created text object.
    */
    audio: function (key, volume, loop, connect) {

        return this.game.sound.add(key, volume, loop, connect);

    },

    /**
     * Creates a new AudioSprite object.
     *
     * @method Phaser.GameObjectCreator#audioSprite
     * @param {string} key - The Game.cache key of the sound that this object will use.
     * @return {Phaser.AudioSprite} The newly created AudioSprite object.
     */
    audioSprite: function (key) {

        return this.game.sound.addSprite(key);

    },

    /**
    * Creates a new Sound object.
    *
    * @method Phaser.GameObjectCreator#sound
    * @param {string} key - The Game.cache key of the sound that this object will use.
    * @param {number} [volume=1] - The volume at which the sound will be played.
    * @param {boolean} [loop=false] - Whether or not the sound will loop.
    * @param {boolean} [connect=true] - Controls if the created Sound object will connect to the master gainNode of the SoundManager when running under WebAudio.
    * @return {Phaser.Sound} The newly created text object.
    */
    sound: function (key, volume, loop, connect) {

        return this.game.sound.add(key, volume, loop, connect);

    },

    /**
    * Creates a new TileSprite object.
    *
    * @method Phaser.GameObjectCreator#tileSprite
    * @param {number} x - The x coordinate (in world space) to position the TileSprite at.
    * @param {number} y - The y coordinate (in world space) to position the TileSprite at.
    * @param {number} width - The width of the TileSprite.
    * @param {number} height - The height of the TileSprite.
    * @param {string|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the TileSprite during rendering. It can be a string which is a reference to the Phaser Image Cache entry, or an instance of a PIXI.Texture or BitmapData.
    * @param {string|number} frame - If this TileSprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
    * @return {Phaser.TileSprite} The newly created tileSprite object.
    */
    tileSprite: function (x, y, width, height, key, frame) {

        return new Phaser.TileSprite(this.game, x, y, width, height, key, frame);

    },

    /**
    * Creates a new Rope object.
    *
    * @method Phaser.GameObjectCreator#rope
    * @param {number} x - The x coordinate (in world space) to position the Rope at.
    * @param {number} y - The y coordinate (in world space) to position the Rope at.
    * @param {number} width - The width of the Rope.
    * @param {number} height - The height of the Rope.
    * @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the TileSprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
    * @param {string|number} frame - If this Rope is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
    * @return {Phaser.Rope} The newly created rope object.
    */
    rope: function (x, y, key, frame, points) {

        return new Phaser.Rope(this.game, x, y, key, frame, points);

    },

    /**
    * Creates a new Text object.
    *
    * @method Phaser.GameObjectCreator#text
    * @param {number} x - X position of the new text object.
    * @param {number} y - Y position of the new text object.
    * @param {string} text - The actual text that will be written.
    * @param {object} style - The style object containing style attributes like font, font size , etc.
    * @return {Phaser.Text} The newly created text object.
    */
    text: function (x, y, text, style) {

        return new Phaser.Text(this.game, x, y, text, style);

    },

    /**
    * Creates a new Button object.
    *
    * @method Phaser.GameObjectCreator#button
    * @param {number} [x] X position of the new button object.
    * @param {number} [y] Y position of the new button object.
    * @param {string} [key] The image key as defined in the Game.Cache to use as the texture for this button.
    * @param {function} [callback] The function to call when this button is pressed
    * @param {object} [callbackContext] The context in which the callback will be called (usually 'this')
    * @param {string|number} [overFrame] This is the frame or frameName that will be set when this button is in an over state. Give either a number to use a frame ID or a string for a frame name.
    * @param {string|number} [outFrame] This is the frame or frameName that will be set when this button is in an out state. Give either a number to use a frame ID or a string for a frame name.
    * @param {string|number} [downFrame] This is the frame or frameName that will be set when this button is in a down state. Give either a number to use a frame ID or a string for a frame name.
    * @param {string|number} [upFrame] This is the frame or frameName that will be set when this button is in an up state. Give either a number to use a frame ID or a string for a frame name.
    * @return {Phaser.Button} The newly created button object.
    */
    button: function (x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame) {

        return new Phaser.Button(this.game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame);

    },

    /**
    * Creates a new Graphics object.
    *
    * @method Phaser.GameObjectCreator#graphics
    * @param {number} [x=0] - X position of the new graphics object.
    * @param {number} [y=0] - Y position of the new graphics object.
    * @return {Phaser.Graphics} The newly created graphics object.
    */
    graphics: function (x, y) {

        return new Phaser.Graphics(this.game, x, y);

    },

    /**
    * Creat a new Emitter.
    *
    * An Emitter is a lightweight particle emitter. It can be used for one-time explosions or for
    * continuous effects like rain and fire. All it really does is launch Particle objects out
    * at set intervals, and fixes their positions and velocities accorindgly.
    *
    * @method Phaser.GameObjectCreator#emitter
    * @param {number} [x=0] - The x coordinate within the Emitter that the particles are emitted from.
    * @param {number} [y=0] - The y coordinate within the Emitter that the particles are emitted from.
    * @param {number} [maxParticles=50] - The total number of particles in this emitter.
    * @return {Phaser.Emitter} The newly created emitter object.
    */
    emitter: function (x, y, maxParticles) {

        return new Phaser.Particles.Arcade.Emitter(this.game, x, y, maxParticles);

    },

    /**
    * Create a new RetroFont object.
    *
    * A RetroFont can be used as a texture for an Image or Sprite and optionally add it to the Cache.
    * A RetroFont uses a bitmap which contains fixed with characters for the font set. You use character spacing to define the set.
    * If you need variable width character support then use a BitmapText object instead. The main difference between a RetroFont and a BitmapText
    * is that a RetroFont creates a single texture that you can apply to a game object, where-as a BitmapText creates one Sprite object per letter of text.
    * The texture can be asssigned or one or multiple images/sprites, but note that the text the RetroFont uses will be shared across them all,
    * i.e. if you need each Image to have different text in it, then you need to create multiple RetroFont objects.
    *
    * @method Phaser.GameObjectCreator#retroFont
    * @param {string} font - The key of the image in the Game.Cache that the RetroFont will use.
    * @param {number} characterWidth - The width of each character in the font set.
    * @param {number} characterHeight - The height of each character in the font set.
    * @param {string} chars - The characters used in the font set, in display order. You can use the TEXT_SET consts for common font set arrangements.
    * @param {number} charsPerRow - The number of characters per row in the font set.
    * @param {number} [xSpacing=0] - If the characters in the font set have horizontal spacing between them set the required amount here.
    * @param {number} [ySpacing=0] - If the characters in the font set have vertical spacing between them set the required amount here.
    * @param {number} [xOffset=0] - If the font set doesn't start at the top left of the given image, specify the X coordinate offset here.
    * @param {number} [yOffset=0] - If the font set doesn't start at the top left of the given image, specify the Y coordinate offset here.
    * @return {Phaser.RetroFont} The newly created RetroFont texture which can be applied to an Image or Sprite.
    */
    retroFont: function (font, characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset) {

        return new Phaser.RetroFont(this.game, font, characterWidth, characterHeight, chars, charsPerRow, xSpacing, ySpacing, xOffset, yOffset);

    },

    /**
    * Create a new BitmapText object.
    *
    * BitmapText objects work by taking a texture file and an XML file that describes the font structure.
    * It then generates a new Sprite object for each letter of the text, proportionally spaced out and aligned to 
    * match the font structure.
    * 
    * BitmapText objects are less flexible than Text objects, in that they have less features such as shadows, fills and the ability 
    * to use Web Fonts. However you trade this flexibility for pure rendering speed. You can also create visually compelling BitmapTexts by 
    * processing the font texture in an image editor first, applying fills and any other effects required.
    *
    * To create multi-line text insert \r, \n or \r\n escape codes into the text string.
    *
    * To create a BitmapText data files you can use:
    *
    * BMFont (Windows, free): http://www.angelcode.com/products/bmfont/
    * Glyph Designer (OS X, commercial): http://www.71squared.com/en/glyphdesigner
    * Littera (Web-based, free): http://kvazars.com/littera/
    *
    * @method Phaser.GameObjectCreator#bitmapText
    * @param {number} x - X coordinate to display the BitmapText object at.
    * @param {number} y - Y coordinate to display the BitmapText object at.
    * @param {string} font - The key of the BitmapText as stored in Phaser.Cache.
    * @param {string} [text=''] - The text that will be rendered. This can also be set later via BitmapText.text.
    * @param {number} [size=32] - The size the font will be rendered at in pixels.
    * @param {string} [align='left'] - The alignment of multi-line text. Has no effect if there is only one line of text.
    * @return {Phaser.BitmapText} The newly created bitmapText object.
    */
    bitmapText: function (x, y, font, text, size, align) {

        return new Phaser.BitmapText(this.game, x, y, font, text, size, align);

    },

    /**
    * Creates a new Phaser.Tilemap object.
    *
    * The map can either be populated with data from a Tiled JSON file or from a CSV file.
    * To do this pass the Cache key as the first parameter. When using Tiled data you need only provide the key.
    * When using CSV data you must provide the key and the tileWidth and tileHeight parameters.
    * If creating a blank tilemap to be populated later, you can either specify no parameters at all and then use `Tilemap.create` or pass the map and tile dimensions here.
    * Note that all Tilemaps use a base tile size to calculate dimensions from, but that a TilemapLayer may have its own unique tile size that overrides it.
    *
    * @method Phaser.GameObjectCreator#tilemap
    * @param {string} [key] - The key of the tilemap data as stored in the Cache. If you're creating a blank map either leave this parameter out or pass `null`.
    * @param {number} [tileWidth=32] - The pixel width of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
    * @param {number} [tileHeight=32] - The pixel height of a single map tile. If using CSV data you must specify this. Not required if using Tiled map data.
    * @param {number} [width=10] - The width of the map in tiles. If this map is created from Tiled or CSV data you don't need to specify this.
    * @param {number} [height=10] - The height of the map in tiles. If this map is created from Tiled or CSV data you don't need to specify this.
    */
    tilemap: function (key, tileWidth, tileHeight, width, height) {

        return new Phaser.Tilemap(this.game, key, tileWidth, tileHeight, width, height);

    },

    /**
    * A dynamic initially blank canvas to which images can be drawn.
    *
    * @method Phaser.GameObjectCreator#renderTexture
    * @param {number} [width=100] - the width of the RenderTexture.
    * @param {number} [height=100] - the height of the RenderTexture.
    * @param {string} [key=''] - Asset key for the RenderTexture when stored in the Cache (see addToCache parameter).
    * @param {boolean} [addToCache=false] - Should this RenderTexture be added to the Game.Cache? If so you can retrieve it with Cache.getTexture(key)
    * @return {Phaser.RenderTexture} The newly created RenderTexture object.
    */
    renderTexture: function (width, height, key, addToCache) {

        if (key === undefined || key === '') { key = this.game.rnd.uuid(); }
        if (addToCache === undefined) { addToCache = false; }

        var texture = new Phaser.RenderTexture(this.game, width, height, key);

        if (addToCache)
        {
            this.game.cache.addRenderTexture(key, texture);
        }

        return texture;

    },

    /**
    * Create a BitmpaData object.
    *
    * A BitmapData object can be manipulated and drawn to like a traditional Canvas object and used to texture Sprites.
    *
    * @method Phaser.GameObjectCreator#bitmapData
    * @param {number} [width=256] - The width of the BitmapData in pixels.
    * @param {number} [height=256] - The height of the BitmapData in pixels.
    * @param {string} [key=''] - Asset key for the BitmapData when stored in the Cache (see addToCache parameter).
    * @param {boolean} [addToCache=false] - Should this BitmapData be added to the Game.Cache? If so you can retrieve it with Cache.getBitmapData(key)
    * @return {Phaser.BitmapData} The newly created BitmapData object.
    */
    bitmapData: function (width, height, key, addToCache) {

        if (addToCache === undefined) { addToCache = false; }
        if (key === undefined || key === '') { key = this.game.rnd.uuid(); }

        var texture = new Phaser.BitmapData(this.game, key, width, height);

        if (addToCache)
        {
            this.game.cache.addBitmapData(key, texture);
        }

        return texture;

    },

    /**
    * A WebGL shader/filter that can be applied to Sprites.
    *
    * @method Phaser.GameObjectCreator#filter
    * @param {string} filter - The name of the filter you wish to create, for example HueRotate or SineWave.
    * @param {any} - Whatever parameters are needed to be passed to the filter init function.
    * @return {Phaser.Filter} The newly created Phaser.Filter object.
    */
    filter: function (filter) {

        var args = Array.prototype.slice.call(arguments, 1);

        var filter = new Phaser.Filter[filter](this.game);

        filter.init.apply(filter, args);

        return filter;

    }

};

Phaser.GameObjectCreator.prototype.constructor = Phaser.GameObjectCreator;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Sprites are the lifeblood of your game, used for nearly everything visual.
*
* At its most basic a Sprite consists of a set of coordinates and a texture that is rendered to the canvas.
* They also contain additional properties allowing for physics motion (via Sprite.body), input handling (via Sprite.input),
* events (via Sprite.events), animation (via Sprite.animations), camera culling and more. Please see the Examples for use cases.
*
* @class Phaser.Sprite
* @constructor
* @extends PIXI.Sprite
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
* @extends Phaser.Component.Health
* @extends Phaser.Component.InCamera
* @extends Phaser.Component.InputEnabled
* @extends Phaser.Component.InWorld
* @extends Phaser.Component.LifeSpan
* @extends Phaser.Component.LoadTexture
* @extends Phaser.Component.Overlap
* @extends Phaser.Component.PhysicsBody
* @extends Phaser.Component.Reset
* @extends Phaser.Component.ScaleMinMax
* @extends Phaser.Component.Smoothed
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} x - The x coordinate (in world space) to position the Sprite at.
* @param {number} y - The y coordinate (in world space) to position the Sprite at.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} key - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture or PIXI.Texture.
* @param {string|number} frame - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
*/
Phaser.Sprite = function (game, x, y, key, frame) {

    x = x || 0;
    y = y || 0;
    key = key || null;
    frame = frame || null;

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.SPRITE;

    /**
    * @property {number} physicsType - The const physics body type of this object.
    * @readonly
    */
    this.physicsType = Phaser.SPRITE;

    PIXI.Sprite.call(this, Phaser.Cache.DEFAULT);

    Phaser.Component.Core.init.call(this, game, x, y, key, frame);

};

Phaser.Sprite.prototype = Object.create(PIXI.Sprite.prototype);
Phaser.Sprite.prototype.constructor = Phaser.Sprite;

Phaser.Component.Core.install.call(Phaser.Sprite.prototype, [
    'Angle',
    'Animation',
    'AutoCull',
    'Bounds',
    'BringToTop',
    'Crop',
    'Delta',
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
    'ScaleMinMax',
    'Smoothed'
]);

Phaser.Sprite.prototype.preUpdatePhysics = Phaser.Component.PhysicsBody.preUpdate;
Phaser.Sprite.prototype.preUpdateLifeSpan = Phaser.Component.LifeSpan.preUpdate;
Phaser.Sprite.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate;
Phaser.Sprite.prototype.preUpdateCore = Phaser.Component.Core.preUpdate;

/**
* Automatically called by World.preUpdate.
*
* @method
* @memberof Phaser.Sprite
* @return {boolean} True if the Sprite was rendered, otherwise false.
*/
Phaser.Sprite.prototype.preUpdate = function() {

    if (!this.preUpdatePhysics() || !this.preUpdateLifeSpan() || !this.preUpdateInWorld())
    {
        return false;
    }

    return this.preUpdateCore();

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* An Image is a light-weight object you can use to display anything that doesn't need physics or animation.
* It can still rotate, scale, crop and receive input events. This makes it perfect for logos, backgrounds, simple buttons and other non-Sprite graphics.
*
* @class Phaser.Image
* @extends PIXI.Sprite
* @extends Phaser.Component.Core
* @extends Phaser.Component.Angle
* @extends Phaser.Component.Animation
* @extends Phaser.Component.AutoCull
* @extends Phaser.Component.Bounds
* @extends Phaser.Component.BringToTop
* @extends Phaser.Component.Crop
* @extends Phaser.Component.Destroy
* @extends Phaser.Component.FixedToCamera
* @extends Phaser.Component.InputEnabled
* @extends Phaser.Component.LifeSpan
* @extends Phaser.Component.LoadTexture
* @extends Phaser.Component.Overlap
* @extends Phaser.Component.Reset
* @extends Phaser.Component.ScaleMinMax
* @extends Phaser.Component.Smoothed
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} [x=0] - The x coordinate of the Image. The coordinate is relative to any parent container this Image may be in.
* @param {number} [y=0] - The y coordinate of the Image. The coordinate is relative to any parent container this Image may be in.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture} [key] - The texture used by the Image during rendering. It can be a string which is a reference to the Cache entry, or an instance of a RenderTexture, BitmapData or PIXI.Texture.
* @param {string|number} [frame] - If this Image is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
*/
Phaser.Image = function (game, x, y, key, frame) {

    x = x || 0;
    y = y || 0;
    key = key || null;
    frame = frame || null;

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.IMAGE;

    PIXI.Sprite.call(this, Phaser.Cache.DEFAULT);

    Phaser.Component.Core.init.call(this, game, x, y, key, frame);

};

Phaser.Image.prototype = Object.create(PIXI.Sprite.prototype);
Phaser.Image.prototype.constructor = Phaser.Image;

Phaser.Component.Core.install.call(Phaser.Image.prototype, [
    'Angle',
    'Animation',
    'AutoCull',
    'Bounds',
    'BringToTop',
    'Crop',
    'Destroy',
    'FixedToCamera',
    'InputEnabled',
    'LifeSpan',
    'LoadTexture',
    'Overlap',
    'Reset',
    'ScaleMinMax',
    'Smoothed'
]);

Phaser.Image.prototype.preUpdateInWorld = Phaser.Component.InWorld.preUpdate;
Phaser.Image.prototype.preUpdateCore = Phaser.Component.Core.preUpdate;

/**
* Automatically called by World.preUpdate.
*
* @method Phaser.Image#preUpdate
* @memberof Phaser.Image
*/
Phaser.Image.prototype.preUpdate = function() {

    if (!this.preUpdateInWorld())
    {
        return false;
    }

    return this.preUpdateCore();

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Create a new `Button` object. A Button is a special type of Sprite that is set-up to handle Pointer events automatically.
*
* The four states a Button responds to are:
*
* * 'Over' - when the Pointer moves over the Button. This is also commonly known as 'hover'.
* * 'Out' - when the Pointer that was previously over the Button moves out of it.
* * 'Down' - when the Pointer is pressed down on the Button. I.e. touched on a touch enabled device or clicked with the mouse.
* * 'Up' - when the Pointer that was pressed down on the Button is released again.
*
* A different texture/frame and activation sound can be specified for any of the states.
*
* Frames can be specified as either an integer (the frame ID) or a string (the frame name); the same values that can be used with a Sprite constructor.
*
* @class Phaser.Button
* @constructor
* @extends Phaser.Image
* @param {Phaser.Game} game Current game instance.
* @param {number} [x=0] - X position of the Button.
* @param {number} [y=0] - Y position of the Button.
* @param {string} [key] - The image key (in the Game.Cache) to use as the texture for this Button.
* @param {function} [callback] - The function to call when this Button is pressed.
* @param {object} [callbackContext] - The context in which the callback will be called (usually 'this').
* @param {string|integer} [overFrame] - The frame / frameName when the button is in the Over state.
* @param {string|integer} [outFrame] - The frame / frameName when the button is in the Out state.
* @param {string|integer} [downFrame] - The frame / frameName when the button is in the Down state.
* @param {string|integer} [upFrame] - The frame / frameName when the button is in the Up state.
*/
Phaser.Button = function (game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame) {

    x = x || 0;
    y = y || 0;
    key = key || null;
    callback = callback || null;
    callbackContext = callbackContext || this;

    Phaser.Image.call(this, game, x, y, key, outFrame);

    /**
    * The Phaser Object Type.
    * @property {number} type
    * @readonly
    */
    this.type = Phaser.BUTTON;

    /**
    * @property {number} physicsType - The const physics body type of this object.
    * @readonly
    */
    this.physicsType = Phaser.SPRITE;

    /**
    * The name or ID of the Over state frame.
    * @property {string|integer} onOverFrame
    * @private
    */
    this._onOverFrame = null;

    /**
    * The name or ID of the Out state frame.
    * @property {string|integer} onOutFrame
    * @private
    */
    this._onOutFrame = null;

    /**
    * The name or ID of the Down state frame.
    * @property {string|integer} onDownFrame
    * @private
    */
    this._onDownFrame = null;

    /**
    * The name or ID of the Up state frame.
    * @property {string|integer} onUpFrame
    * @private
    */
    this._onUpFrame = null;

    /**
    * The Sound to be played when this Buttons Over state is activated.
    * @property {Phaser.Sound|Phaser.AudioSprite|null} onOverSound
    * @readonly
    */
    this.onOverSound = null;

    /**
    * The Sound to be played when this Buttons Out state is activated.
    * @property {Phaser.Sound|Phaser.AudioSprite|null} onOutSound
    * @readonly
    */
    this.onOutSound = null;

    /**
    * The Sound to be played when this Buttons Down state is activated.
    * @property {Phaser.Sound|Phaser.AudioSprite|null} onDownSound
    * @readonly
    */
    this.onDownSound = null;

    /**
    * The Sound to be played when this Buttons Up state is activated.
    * @property {Phaser.Sound|Phaser.AudioSprite|null} onUpSound
    * @readonly
    */
    this.onUpSound = null;

    /**
    * The Sound Marker used in conjunction with the onOverSound.
    * @property {string} onOverSoundMarker
    * @readonly
    */
    this.onOverSoundMarker = '';

    /**
    * The Sound Marker used in conjunction with the onOutSound.
    * @property {string} onOutSoundMarker
    * @readonly
    */
    this.onOutSoundMarker = '';

    /**
    * The Sound Marker used in conjunction with the onDownSound.
    * @property {string} onDownSoundMarker
    * @readonly
    */
    this.onDownSoundMarker = '';

    /**
    * The Sound Marker used in conjunction with the onUpSound.
    * @property {string} onUpSoundMarker
    * @readonly
    */
    this.onUpSoundMarker = '';

    /**
    * The Signal (or event) dispatched when this Button is in an Over state.
    * @property {Phaser.Signal} onInputOver
    */
    this.onInputOver = new Phaser.Signal();

    /**
    * The Signal (or event) dispatched when this Button is in an Out state.
    * @property {Phaser.Signal} onInputOut
    */
    this.onInputOut = new Phaser.Signal();

    /**
    * The Signal (or event) dispatched when this Button is in an Down state.
    * @property {Phaser.Signal} onInputDown
    */
    this.onInputDown = new Phaser.Signal();

    /**
    * The Signal (or event) dispatched when this Button is in an Up state.
    * @property {Phaser.Signal} onInputUp
    */
    this.onInputUp = new Phaser.Signal();

    /**
    * If true then onOver events (such as onOverSound) will only be triggered if the Pointer object causing them was the Mouse Pointer.
    * The frame will still be changed as applicable.
    *
    * @property {boolean} onOverMouseOnly
    * @default
    */
    this.onOverMouseOnly = true;

    /**
    * Suppress the over event if a pointer was just released and it matches the given {@link Phaser.PointerModer pointer mode bitmask}.
    *
    * This behavior was introduced in Phaser 2.3.1; this property is a soft-revert of the change.
    *
    * @property {Phaser.PointerMode?} justReleasedPreventsOver=ACTIVE_CURSOR
    */
    this.justReleasedPreventsOver = Phaser.PointerMode.TOUCH;
    
    /**
    * When true the the texture frame will not be automatically switched on up/down/over/out events.
    * @property {boolean} freezeFrames
    * @default
    */
    this.freezeFrames = false;

    /**
    * When the Button is touched / clicked and then released you can force it to enter a state of "out" instead of "up".
    *
    * This can also accept a {@link Phaser.PointerModer pointer mode bitmask} for more refined control.
    *
    * @property {boolean|Phaser.PointerMode} forceOut=false
    * @default
    */
    this.forceOut = false;

    this.inputEnabled = true;

    this.input.start(0, true);

    this.input.useHandCursor = true;

    this.setFrames(overFrame, outFrame, downFrame, upFrame);

    if (callback !== null)
    {
        this.onInputUp.add(callback, callbackContext);
    }

    //  Redirect the input events to here so we can handle animation updates, etc
    this.events.onInputOver.add(this.onInputOverHandler, this);
    this.events.onInputOut.add(this.onInputOutHandler, this);
    this.events.onInputDown.add(this.onInputDownHandler, this);
    this.events.onInputUp.add(this.onInputUpHandler, this);

    this.events.onRemovedFromWorld.add(this.removedFromWorld, this);

};

Phaser.Button.prototype = Object.create(Phaser.Image.prototype);
Phaser.Button.prototype.constructor = Phaser.Button;

//  State constants; local only. These are tied to property names in Phaser.Button.
var STATE_OVER = 'Over';
var STATE_OUT = 'Out';
var STATE_DOWN = 'Down';
var STATE_UP = 'Up';

/**
* Clears all of the frames set on this Button.
*
* @method Phaser.Button#clearFrames
*/
Phaser.Button.prototype.clearFrames = function () {

    this.setFrames(null, null, null, null);

};

/**
* Called when this Button is removed from the World.
*
* @method Phaser.Button#removedFromWorld
* @protected
*/
Phaser.Button.prototype.removedFromWorld = function () {

    this.inputEnabled = false;

};

/**
* Set the frame name/ID for the given state.
*
* @method Phaser.Button#setStateFrame
* @private
* @param {object} state - See `STATE_*`
* @param {number|string} frame - The number or string representing the frame.
* @param {boolean} switchImmediately - Immediately switch to the frame if it was set - and this is true.
*/
Phaser.Button.prototype.setStateFrame = function (state, frame, switchImmediately)
{
    var frameKey = '_on' + state + 'Frame';

    if (frame !== null) // not null or undefined
    {
        this[frameKey] = frame;

        if (switchImmediately)
        {
            this.changeStateFrame(state);
        }
    }
    else
    {
        this[frameKey] = null;
    }

};

/**
* Change the frame to that of the given state, _if_ the state has a frame assigned _and_ if the frames are not currently "frozen".
*
* @method Phaser.Button#changeStateFrame
* @private
* @param {object} state - See `STATE_*`
* @return {boolean} True only if the frame was assigned a value, possibly the same one it already had.
*/
Phaser.Button.prototype.changeStateFrame = function (state) {

    if (this.freezeFrames)
    {
        return false;
    }

    var frameKey = '_on' + state + 'Frame';
    var frame = this[frameKey];

    if (typeof frame === 'string')
    {
        this.frameName = frame;
        return true;
    }
    else if (typeof frame === 'number')
    {
        this.frame = frame;
        return true;
    }
    else
    {
        return false;
    }

};

/**
* Used to manually set the frames that will be used for the different states of the Button.
*
* Frames can be specified as either an integer (the frame ID) or a string (the frame name); these are the same values that can be used with a Sprite constructor.
*
* @method Phaser.Button#setFrames
* @public
* @param {string|integer} [overFrame] - The frame / frameName when the button is in the Over state.
* @param {string|integer} [outFrame] - The frame / frameName when the button is in the Out state.
* @param {string|integer} [downFrame] - The frame / frameName when the button is in the Down state.
* @param {string|integer} [upFrame] - The frame / frameName when the button is in the Up state.
*/
Phaser.Button.prototype.setFrames = function (overFrame, outFrame, downFrame, upFrame) {

    this.setStateFrame(STATE_OVER, overFrame, this.input.pointerOver());
    this.setStateFrame(STATE_OUT, outFrame, !this.input.pointerOver());
    this.setStateFrame(STATE_DOWN, downFrame, this.input.pointerDown());
    this.setStateFrame(STATE_UP, upFrame, this.input.pointerUp());

};

/**
* Set the sound/marker for the given state.
*
* @method Phaser.Button#setStateSound
* @private
* @param {object} state - See `STATE_*`
* @param {Phaser.Sound|Phaser.AudioSprite} [sound] - Sound.
* @param {string} [marker=''] - Sound marker.
*/
Phaser.Button.prototype.setStateSound = function (state, sound, marker) {

    var soundKey = 'on' + state + 'Sound';
    var markerKey = 'on' + state + 'SoundMarker';

    if (sound instanceof Phaser.Sound || sound instanceof Phaser.AudioSprite)
    {
        this[soundKey] = sound;
        this[markerKey] = typeof marker === 'string' ? marker : '';
    }
    else
    {
        this[soundKey] = null;
        this[markerKey] = '';
    }

};

/**
* Play the sound for the given state, _if_ the state has a sound assigned.
*
* @method Phaser.Button#playStateSound
* @private
* @param {object} state - See `STATE_*`
* @return {boolean} True only if a sound was played.
*/
Phaser.Button.prototype.playStateSound = function (state) {

    var soundKey = 'on' + state + 'Sound';
    var sound = this[soundKey];

    if (sound)
    {
        var markerKey = 'on' + state + 'SoundMarker';
        var marker = this[markerKey];

        sound.play(marker);
        return true;
    }
    else
    {
        return false;
    }

};

/**
* Sets the sounds to be played whenever this Button is interacted with. Sounds can be either full Sound objects, or markers pointing to a section of a Sound object.
* The most common forms of sounds are 'hover' effects and 'click' effects, which is why the order of the parameters is overSound then downSound.
*
* Call this function with no parameters to reset all sounds on this Button.
*
* @method Phaser.Button#setSounds
* @public
* @param {Phaser.Sound|Phaser.AudioSprite} [overSound] - Over Button Sound.
* @param {string} [overMarker] - Over Button Sound Marker.
* @param {Phaser.Sound|Phaser.AudioSprite} [downSound] - Down Button Sound.
* @param {string} [downMarker] - Down Button Sound Marker.
* @param {Phaser.Sound|Phaser.AudioSprite} [outSound] - Out Button Sound.
* @param {string} [outMarker] - Out Button Sound Marker.
* @param {Phaser.Sound|Phaser.AudioSprite} [upSound] - Up Button Sound.
* @param {string} [upMarker] - Up Button Sound Marker.
*/
Phaser.Button.prototype.setSounds = function (overSound, overMarker, downSound, downMarker, outSound, outMarker, upSound, upMarker) {

    this.setStateSound(STATE_OVER, overSound, overMarker);
    this.setStateSound(STATE_OUT, outSound, outMarker);
    this.setStateSound(STATE_DOWN, downSound, downMarker);
    this.setStateSound(STATE_UP, upSound, upMarker);

};

/**
* The Sound to be played when a Pointer moves over this Button.
*
* @method Phaser.Button#setOverSound
* @public
* @param {Phaser.Sound|Phaser.AudioSprite} sound - The Sound that will be played.
* @param {string} [marker] - A Sound Marker that will be used in the playback.
*/
Phaser.Button.prototype.setOverSound = function (sound, marker) {

    this.setStateSound(STATE_OVER, sound, marker);

};

/**
* The Sound to be played when a Pointer moves out of this Button.
*
* @method Phaser.Button#setOutSound
* @public
* @param {Phaser.Sound|Phaser.AudioSprite} sound - The Sound that will be played.
* @param {string} [marker] - A Sound Marker that will be used in the playback.
*/
Phaser.Button.prototype.setOutSound = function (sound, marker) {

    this.setStateSound(STATE_OUT, sound, marker);

};

/**
* The Sound to be played when a Pointer presses down on this Button.
*
* @method Phaser.Button#setDownSound
* @public
* @param {Phaser.Sound|Phaser.AudioSprite} sound - The Sound that will be played.
* @param {string} [marker] - A Sound Marker that will be used in the playback.
*/
Phaser.Button.prototype.setDownSound = function (sound, marker) {

    this.setStateSound(STATE_DOWN, sound, marker);

};

/**
* The Sound to be played when a Pointer has pressed down and is released from this Button.
*
* @method Phaser.Button#setUpSound
* @public
* @param {Phaser.Sound|Phaser.AudioSprite} sound - The Sound that will be played.
* @param {string} [marker] - A Sound Marker that will be used in the playback.
*/
Phaser.Button.prototype.setUpSound = function (sound, marker) {

    this.setStateSound(STATE_UP, sound, marker);

};

/**
* Internal function that handles input events.
*
* @method Phaser.Button#onInputOverHandler
* @protected
* @param {Phaser.Button} sprite - The Button that the event occurred on.
* @param {Phaser.Pointer} pointer - The Pointer that activated the Button.
*/
Phaser.Button.prototype.onInputOverHandler = function (sprite, pointer) {

    if (pointer.justReleased() &&
        (this.justReleasedPreventsOver & pointer.pointerMode) === pointer.pointerMode)
    {
        //  If the Pointer was only just released then we don't fire an over event
        return;
    }

    this.changeStateFrame(STATE_OVER);

    if (this.onOverMouseOnly && !pointer.isMouse)
    {
        return;
    }

    this.playStateSound(STATE_OVER);

    if (this.onInputOver)
    {
        this.onInputOver.dispatch(this, pointer);
    }

};

/**
* Internal function that handles input events.
*
* @method Phaser.Button#onInputOutHandler
* @protected
* @param {Phaser.Button} sprite - The Button that the event occurred on.
* @param {Phaser.Pointer} pointer - The Pointer that activated the Button.
*/
Phaser.Button.prototype.onInputOutHandler = function (sprite, pointer) {

    this.changeStateFrame(STATE_OUT);

    this.playStateSound(STATE_OUT);

    if (this.onInputOut)
    {
        this.onInputOut.dispatch(this, pointer);
    }
};

/**
* Internal function that handles input events.
*
* @method Phaser.Button#onInputDownHandler
* @protected
* @param {Phaser.Button} sprite - The Button that the event occurred on.
* @param {Phaser.Pointer} pointer - The Pointer that activated the Button.
*/
Phaser.Button.prototype.onInputDownHandler = function (sprite, pointer) {

    this.changeStateFrame(STATE_DOWN);

    this.playStateSound(STATE_DOWN);

    if (this.onInputDown)
    {
        this.onInputDown.dispatch(this, pointer);
    }
};

/**
* Internal function that handles input events.
*
* @method Phaser.Button#onInputUpHandler
* @protected
* @param {Phaser.Button} sprite - The Button that the event occurred on.
* @param {Phaser.Pointer} pointer - The Pointer that activated the Button.
*/
Phaser.Button.prototype.onInputUpHandler = function (sprite, pointer, isOver) {

    this.playStateSound(STATE_UP);

    //  Input dispatched early, before state change (but after sound)
    if (this.onInputUp)
    {
        this.onInputUp.dispatch(this, pointer, isOver);
    }

    if (this.freezeFrames)
    {
        return;
    }

    if (this.forceOut === true || (this.forceOut & pointer.pointerMode) === pointer.pointerMode)
    {
        this.changeStateFrame(STATE_OUT);
    }
    else
    {
        var changedUp = this.changeStateFrame(STATE_UP);
        if (!changedUp)
        {
            //  No Up frame to show..
            if (isOver)
            {
                this.changeStateFrame(STATE_OVER);
            }
            else
            {
                this.changeStateFrame(STATE_OUT);
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
* The SpriteBatch class is a really fast version of the DisplayObjectContainer built purely for speed, so use when you need a lot of sprites or particles.
* It's worth mentioning that by default sprite batches are used through-out the renderer, so you only really need to use a SpriteBatch if you have over
* 1000 sprites that all share the same texture (or texture atlas). It's also useful if running in Canvas mode and you have a lot of un-rotated or un-scaled
* Sprites as it skips all of the Canvas setTransform calls, which helps performance, especially on mobile devices.
*
* Please note that any Sprite that is part of a SpriteBatch will not have its bounds updated, so will fail checks such as outOfBounds.
*
* @class Phaser.SpriteBatch
* @extends Phaser.Group
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {Phaser.Group|Phaser.Sprite|null} parent - The parent Group, DisplayObject or DisplayObjectContainer that this Group will be added to. If `undefined` or `null` it will use game.world.
* @param {string} [name=group] - A name for this Group. Not used internally but useful for debugging.
* @param {boolean} [addToStage=false] - If set to true this Group will be added directly to the Game.Stage instead of Game.World.
*/
Phaser.SpriteBatch = function (game, parent, name, addToStage) {

    if (parent === undefined || parent === null) { parent = game.world; }

    PIXI.SpriteBatch.call(this);

    Phaser.Group.call(this, game, parent, name, addToStage);

    /**
    * @property {number} type - Internal Phaser Type value.
    * @protected
    */
    this.type = Phaser.SPRITEBATCH;

};

Phaser.SpriteBatch.prototype = Phaser.Utils.extend(true, Phaser.SpriteBatch.prototype, PIXI.SpriteBatch.prototype, Phaser.Group.prototype);

Phaser.SpriteBatch.prototype.constructor = Phaser.SpriteBatch;
