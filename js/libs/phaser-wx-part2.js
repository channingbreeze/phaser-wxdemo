import PIXI from './pixi-wx.js';
import Phaser from './phaser-wx-main.js';
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Group is a container for {@link DisplayObject display objects} including {@link Phaser.Sprite Sprites} and {@link Phaser.Image Images}.
*
* Groups form the logical tree structure of the display/scene graph where local transformations are applied to children.
* For instance, all children are also moved/rotated/scaled when the group is moved/rotated/scaled.
*
* In addition, Groups provides support for fast pooling and object recycling.
*
* Groups are also display objects and can be nested as children within other Groups.
*
* @class Phaser.Group
* @extends PIXI.DisplayObjectContainer
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {DisplayObject|null} [parent=(game world)] - The parent Group (or other {@link DisplayObject}) that this group will be added to.
*     If undefined/unspecified the Group will be added to the {@link Phaser.Game#world Game World}; if null the Group will not be added to any parent.
* @param {string} [name='group'] - A name for this group. Not used internally but useful for debugging.
* @param {boolean} [addToStage=false] - If true this group will be added directly to the Game.Stage instead of Game.World.
* @param {boolean} [enableBody=false] - If true all Sprites created with {@link #create} or {@link #createMulitple} will have a physics body created on them. Change the body type with {@link #physicsBodyType}.
* @param {integer} [physicsBodyType=0] - The physics body type to use when physics bodies are automatically added. See {@link #physicsBodyType} for values.
*/
Phaser.Group = function (game, parent, name, addToStage, enableBody, physicsBodyType) {

    if (addToStage === undefined) { addToStage = false; }
    if (enableBody === undefined) { enableBody = false; }
    if (physicsBodyType === undefined) { physicsBodyType = Phaser.Physics.ARCADE; }

    /**
    * A reference to the currently running Game.
    * @property {Phaser.Game} game
    * @protected
    */
    this.game = game;

    if (parent === undefined)
    {
        parent = game.world;
    }

    /**
    * A name for this group. Not used internally but useful for debugging.
    * @property {string} name
    */
    this.name = name || 'group';

    /**
    * The z-depth value of this object within its parent container/Group - the World is a Group as well.
    * This value must be unique for each child in a Group.
    * @property {integer} z
    * @readOnly
    */
    this.z = 0;

    PIXI.DisplayObjectContainer.call(this);

    if (addToStage)
    {
        this.game.stage.addChild(this);
        this.z = this.game.stage.children.length;
    }
    else
    {
        if (parent)
        {
            parent.addChild(this);
            this.z = parent.children.length;
        }
    }

    /**
    * Internal Phaser Type value.
    * @property {integer} type
    * @protected
    */
    this.type = Phaser.GROUP;

    /**
    * @property {number} physicsType - The const physics body type of this object.
    * @readonly
    */
    this.physicsType = Phaser.GROUP;

    /**
    * The alive property is useful for Groups that are children of other Groups and need to be included/excluded in checks like forEachAlive.
    * @property {boolean} alive
    * @default
    */
    this.alive = true;

    /**
    * If exists is true the group is updated, otherwise it is skipped.
    * @property {boolean} exists
    * @default
    */
    this.exists = true;

    /**
    * A group with `ignoreDestroy` set to `true` ignores all calls to its `destroy` method.
    * @property {boolean} ignoreDestroy
    * @default
    */
    this.ignoreDestroy = false;

    /**
    * A Group is that has `pendingDestroy` set to `true` is flagged to have its destroy method
    * called on the next logic update.
    * You can set it directly to flag the Group to be destroyed on its next update.
    *
    * This is extremely useful if you wish to destroy a Group from within one of its own callbacks
    * or a callback of one of its children.
    *
    * @property {boolean} pendingDestroy
    */
    this.pendingDestroy = false;

    /**
    * The type of objects that will be created when using {@link #create} or {@link #createMultiple}.
    *
    * Any object may be used but it should extend either Sprite or Image and accept the same constructor arguments:
    * when a new object is created it is passed the following parameters to its constructor: `(game, x, y, key, frame)`.
    *
    * @property {object} classType
    * @default {@link Phaser.Sprite}
    */
    this.classType = Phaser.Sprite;

    /**
    * The current display object that the group cursor is pointing to, if any. (Can be set manually.)
    *
    * The cursor is a way to iterate through the children in a Group using {@link #next} and {@link #previous}.
    * @property {?DisplayObject} cursor
    */
    this.cursor = null;

    /**
    * A Group with `inputEnableChildren` set to `true` will automatically call `inputEnabled = true`
    * on any children _added_ to, or _created by_, this Group.
    *
    * If there are children already in the Group at the time you set this property, they are not changed.
    *
    * @property {boolean} inputEnableChildren
    * @default
    */
    this.inputEnableChildren = false;

    /**
    * This Signal is dispatched whenever a child of this Group emits an onInputDown signal as a result
    * of having been interacted with by a Pointer. You can bind functions to this Signal instead of to
    * every child Sprite.
    *
    * This Signal is sent 2 arguments: A reference to the Sprite that triggered the signal, and
    * a reference to the Pointer that caused it.
    *
    * @property {Phaser.Signal} onChildInputDown
    */
    this.onChildInputDown = new Phaser.Signal();

    /**
    * This Signal is dispatched whenever a child of this Group emits an onInputUp signal as a result
    * of having been interacted with by a Pointer. You can bind functions to this Signal instead of to
    * every child Sprite.
    *
    * This Signal is sent 3 arguments: A reference to the Sprite that triggered the signal,
    * a reference to the Pointer that caused it, and a boolean value `isOver` that tells you if the Pointer
    * is still over the Sprite or not.
    *
    * @property {Phaser.Signal} onChildInputUp
    */
    this.onChildInputUp = new Phaser.Signal();

    /**
    * This Signal is dispatched whenever a child of this Group emits an onInputOver signal as a result
    * of having been interacted with by a Pointer. You can bind functions to this Signal instead of to
    * every child Sprite.
    *
    * This Signal is sent 2 arguments: A reference to the Sprite that triggered the signal, and
    * a reference to the Pointer that caused it.
    *
    * @property {Phaser.Signal} onChildInputOver
    */
    this.onChildInputOver = new Phaser.Signal();

    /**
    * This Signal is dispatched whenever a child of this Group emits an onInputOut signal as a result
    * of having been interacted with by a Pointer. You can bind functions to this Signal instead of to
    * every child Sprite.
    *
    * This Signal is sent 2 arguments: A reference to the Sprite that triggered the signal, and
    * a reference to the Pointer that caused it.
    *
    * @property {Phaser.Signal} onChildInputOut
    */
    this.onChildInputOut = new Phaser.Signal();

    /**
    * If true all Sprites created by, or added to this group, will have a physics body enabled on them.
    *
    * If there are children already in the Group at the time you set this property, they are not changed.
    *
    * The default body type is controlled with {@link #physicsBodyType}.
    * @property {boolean} enableBody
    */
    this.enableBody = enableBody;

    /**
    * If true when a physics body is created (via {@link #enableBody}) it will create a physics debug object as well.
    *
    * This only works for P2 bodies.
    * @property {boolean} enableBodyDebug
    * @default
    */
    this.enableBodyDebug = false;

    /**
    * If {@link #enableBody} is true this is the type of physics body that is created on new Sprites.
    *
    * The valid values are {@link Phaser.Physics.ARCADE}, {@link Phaser.Physics.P2JS}, {@link Phaser.Physics.NINJA}, etc.
    * @property {integer} physicsBodyType
    */
    this.physicsBodyType = physicsBodyType;

    /**
    * If this Group contains Arcade Physics Sprites you can set a custom sort direction via this property.
    *
    * It should be set to one of the Phaser.Physics.Arcade sort direction constants:
    *
    * Phaser.Physics.Arcade.SORT_NONE
    * Phaser.Physics.Arcade.LEFT_RIGHT
    * Phaser.Physics.Arcade.RIGHT_LEFT
    * Phaser.Physics.Arcade.TOP_BOTTOM
    * Phaser.Physics.Arcade.BOTTOM_TOP
    *
    * If set to `null` the Group will use whatever Phaser.Physics.Arcade.sortDirection is set to. This is the default behavior.
    *
    * @property {integer} physicsSortDirection
    * @default
    */
    this.physicsSortDirection = null;

    /**
    * This signal is dispatched when the group is destroyed.
    * @property {Phaser.Signal} onDestroy
    */
    this.onDestroy = new Phaser.Signal();

    /**
    * @property {integer} cursorIndex - The current index of the Group cursor. Advance it with Group.next.
    * @readOnly
    */
    this.cursorIndex = 0;

    /**
    * A Group that is fixed to the camera uses its x/y coordinates as offsets from the top left of the camera. These are stored in Group.cameraOffset.
    *
    * Note that the cameraOffset values are in addition to any parent in the display list.
    * So if this Group was in a Group that has x: 200, then this will be added to the cameraOffset.x
    *
    * @property {boolean} fixedToCamera
    */
    this.fixedToCamera = false;

    /**
    * If this object is {@link #fixedToCamera} then this stores the x/y position offset relative to the top-left of the camera view.
    * If the parent of this Group is also `fixedToCamera` then the offset here is in addition to that and should typically be disabled.
    * @property {Phaser.Point} cameraOffset
    */
    this.cameraOffset = new Phaser.Point();

    /**
    * The hash array is an array belonging to this Group into which you can add any of its children via Group.addToHash and Group.removeFromHash.
    *
    * Only children of this Group can be added to and removed from the hash.
    *
    * This hash is used automatically by Phaser Arcade Physics in order to perform non z-index based destructive sorting.
    * However if you don't use Arcade Physics, or this isn't a physics enabled Group, then you can use the hash to perform your own
    * sorting and filtering of Group children without touching their z-index (and therefore display draw order)
    *
    * @property {array} hash
    */
    this.hash = [];

    /**
    * The property on which children are sorted.
    * @property {string} _sortProperty
    * @private
    */
    this._sortProperty = 'z';

};

Phaser.Group.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Phaser.Group.prototype.constructor = Phaser.Group;

/**
* A returnType value, as specified in {@link #iterate} eg.
* @constant
* @type {integer}
*/
Phaser.Group.RETURN_NONE = 0;

/**
* A returnType value, as specified in {@link #iterate} eg.
* @constant
* @type {integer}
*/
Phaser.Group.RETURN_TOTAL = 1;

/**
* A returnType value, as specified in {@link #iterate} eg.
* @constant
* @type {integer}
*/
Phaser.Group.RETURN_CHILD = 2;

/**
* A returnType value, as specified in {@link #iterate} eg.
* @constant
* @type {integer}
*/
Phaser.Group.RETURN_ALL = 3;

/**
* A sort ordering value, as specified in {@link #sort} eg.
* @constant
* @type {integer}
*/
Phaser.Group.SORT_ASCENDING = -1;

/**
* A sort ordering value, as specified in {@link #sort} eg.
* @constant
* @type {integer}
*/
Phaser.Group.SORT_DESCENDING = 1;

/**
* Adds an existing object as the top child in this group.
*
* The child is automatically added to the top of the group, and is displayed above every previous child.
*
* Or if the _optional_ index is specified, the child is added at the location specified by the index value,
* this allows you to control child ordering.
*
* If the child was already in this Group, it is simply returned, and nothing else happens to it.
*
* If `Group.enableBody` is set, then a physics body will be created on the object, so long as one does not already exist.
*
* If `Group.inputEnableChildren` is set, then an Input Handler will be created on the object, so long as one does not already exist.
*
* Use {@link #addAt} to control where a child is added. Use {@link #create} to create and add a new child.
*
* @method Phaser.Group#add
* @param {DisplayObject} child - The display object to add as a child.
* @param {boolean} [silent=false] - If true the child will not dispatch the `onAddedToGroup` event.
* @param {integer} [index] - The index within the group to insert the child to. Where 0 is the bottom of the Group.
* @return {DisplayObject} The child that was added to the group.
*/
Phaser.Group.prototype.add = function (child, silent, index) {

    if (silent === undefined) { silent = false; }

    if (child.parent === this)
    {
        return child;
    }

    if (child.body && child.parent && child.parent.hash)
    {
        child.parent.removeFromHash(child);
    }

    if (index === undefined)
    {
        child.z = this.children.length;

        this.addChild(child);
    }
    else
    {
        this.addChildAt(child, index);

        this.updateZ();
    }

    if (this.enableBody && child.hasOwnProperty('body') && child.body === null)
    {
        this.game.physics.enable(child, this.physicsBodyType);
    }
    else if (child.body)
    {
        this.addToHash(child);
    }

    if (this.inputEnableChildren && (!child.input || child.inputEnabled))
    {
        child.inputEnabled = true;
    }

    if (!silent && child.events)
    {
        child.events.onAddedToGroup$dispatch(child, this);
    }

    if (this.cursor === null)
    {
        this.cursor = child;
    }

    return child;

};

/**
* Adds an existing object to this group.
*
* The child is added to the group at the location specified by the index value, this allows you to control child ordering.
*
* If `Group.enableBody` is set, then a physics body will be created on the object, so long as one does not already exist.
*
* If `Group.inputEnableChildren` is set, then an Input Handler will be created on the object, so long as one does not already exist.
*
* @method Phaser.Group#addAt
* @param {DisplayObject} child - The display object to add as a child.
* @param {integer} [index=0] - The index within the group to insert the child to.
* @param {boolean} [silent=false] - If true the child will not dispatch the `onAddedToGroup` event.
* @return {DisplayObject} The child that was added to the group.
*/
Phaser.Group.prototype.addAt = function (child, index, silent) {

    this.add(child, silent, index);

};

/**
* Adds a child of this Group into the hash array.
* This call will return false if the child is not a child of this Group, or is already in the hash.
*
* @method Phaser.Group#addToHash
* @param {DisplayObject} child - The display object to add to this Groups hash. Must be a member of this Group already and not present in the hash.
* @return {boolean} True if the child was successfully added to the hash, otherwise false.
*/
Phaser.Group.prototype.addToHash = function (child) {

    if (child.parent === this)
    {
        var index = this.hash.indexOf(child);

        if (index === -1)
        {
            this.hash.push(child);
            return true;
        }
    }

    return false;

};

/**
* Removes a child of this Group from the hash array.
* This call will return false if the child is not in the hash.
*
* @method Phaser.Group#removeFromHash
* @param {DisplayObject} child - The display object to remove from this Groups hash. Must be a member of this Group and in the hash.
* @return {boolean} True if the child was successfully removed from the hash, otherwise false.
*/
Phaser.Group.prototype.removeFromHash = function (child) {

    if (child)
    {
        var index = this.hash.indexOf(child);

        if (index !== -1)
        {
            this.hash.splice(index, 1);
            return true;
        }
    }

    return false;

};

/**
* Adds an array of existing Display Objects to this Group.
*
* The Display Objects are automatically added to the top of this Group, and will render on-top of everything already in this Group.
*
* As well as an array you can also pass another Group as the first argument. In this case all of the children from that
* Group will be removed from it and added into this Group.
*
* If `Group.enableBody` is set, then a physics body will be created on the objects, so long as one does not already exist.
*
* If `Group.inputEnableChildren` is set, then an Input Handler will be created on the objects, so long as one does not already exist.
*
* @method Phaser.Group#addMultiple
* @param {DisplayObject[]|Phaser.Group} children - An array of display objects or a Phaser.Group. If a Group is given then *all* children will be moved from it.
* @param {boolean} [silent=false] - If true the children will not dispatch the `onAddedToGroup` event.
* @return {DisplayObject[]|Phaser.Group} The array of children or Group of children that were added to this Group.
*/
Phaser.Group.prototype.addMultiple = function (children, silent) {

    if (children instanceof Phaser.Group)
    {
        children.moveAll(this, silent);
    }
    else if (Array.isArray(children))
    {
        for (var i = 0; i < children.length; i++)
        {
            this.add(children[i], silent);
        }
    }

    return children;

};

/**
* Returns the child found at the given index within this group.
*
* @method Phaser.Group#getAt
* @param {integer} index - The index to return the child from.
* @return {DisplayObject|integer} The child that was found at the given index, or -1 for an invalid index.
*/
Phaser.Group.prototype.getAt = function (index) {

    if (index < 0 || index >= this.children.length)
    {
        return -1;
    }
    else
    {
        return this.getChildAt(index);
    }

};

/**
* Creates a new Phaser.Sprite object and adds it to the top of this group.
*
* Use {@link #classType} to change the type of object created.
*
* The child is automatically added to the top of the group, and is displayed above every previous child.
*
* Or if the _optional_ index is specified, the child is added at the location specified by the index value,
* this allows you to control child ordering.
*
* If `Group.enableBody` is set, then a physics body will be created on the object, so long as one does not already exist.
*
* If `Group.inputEnableChildren` is set, then an Input Handler will be created on the object, so long as one does not already exist.
*
* @method Phaser.Group#create
* @param {number} x - The x coordinate to display the newly created Sprite at. The value is in relation to the group.x point.
* @param {number} y - The y coordinate to display the newly created Sprite at. The value is in relation to the group.y point.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} [key] - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache Image entry, or an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
* @param {string|number} [frame] - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
* @param {boolean} [exists=true] - The default exists state of the Sprite.
* @param {integer} [index] - The index within the group to insert the child to. Where 0 is the bottom of the Group.
* @return {DisplayObject} The child that was created: will be a {@link Phaser.Sprite} unless {@link #classType} has been changed.
*/
Phaser.Group.prototype.create = function (x, y, key, frame, exists, index) {

    if (exists === undefined) { exists = true; }

    var child = new this.classType(this.game, x, y, key, frame);

    child.exists = exists;
    child.visible = exists;
    child.alive = exists;

    return this.add(child, false, index);

};

/**
* Creates multiple Phaser.Sprite objects and adds them to the top of this Group.
*
* This method is useful if you need to quickly generate a pool of sprites, such as bullets.
*
* Use {@link #classType} to change the type of object created.
*
* You can provide an array as the `key` and / or `frame` arguments. When you do this
* it will create `quantity` Sprites for every key (and frame) in the arrays.
*
* For example:
*
* `createMultiple(25, ['ball', 'carrot'])`
*
* In the above code there are 2 keys (ball and carrot) which means that 50 sprites will be
* created in total, 25 of each. You can also have the `frame` as an array:
*
* `createMultiple(5, 'bricks', [0, 1, 2, 3])`
*
* In the above there is one key (bricks), which is a sprite sheet. The frames array tells
* this method to use frames 0, 1, 2 and 3. So in total it will create 20 sprites, because
* the quantity was set to 5, so that is 5 brick sprites of frame 0, 5 brick sprites with
* frame 1, and so on.
*
* If you set both the key and frame arguments to be arrays then understand it will create
* a total quantity of sprites equal to the size of both arrays times each other. I.e.:
*
* `createMultiple(20, ['diamonds', 'balls'], [0, 1, 2])`
*
* The above will create 20 'diamonds' of frame 0, 20 with frame 1 and 20 with frame 2.
* It will then create 20 'balls' of frame 0, 20 with frame 1 and 20 with frame 2.
* In total it will have created 120 sprites.
*
* By default the Sprites will have their `exists` property set to `false`, and they will be
* positioned at 0x0, relative to the `Group.x / y` values.
*
* If `Group.enableBody` is set, then a physics body will be created on the objects, so long as one does not already exist.
*
* If `Group.inputEnableChildren` is set, then an Input Handler will be created on the objects, so long as one does not already exist.
*
* @method Phaser.Group#createMultiple
* @param {integer} quantity - The number of Sprites to create.
* @param {string|array} key - The Cache key of the image that the Sprites will use. Or an Array of keys. See the description for details on how the quantity applies when arrays are used.
* @param {integer|string|array} [frame=0] - If the Sprite image contains multiple frames you can specify which one to use here. Or an Array of frames. See the description for details on how the quantity applies when arrays are used.
* @param {boolean} [exists=false] - The default exists state of the Sprite.
* @return {array} An array containing all of the Sprites that were created.
*/
Phaser.Group.prototype.createMultiple = function (quantity, key, frame, exists) {

    if (frame === undefined) { frame = 0; }
    if (exists === undefined) { exists = false; }

    if (!Array.isArray(key))
    {
        key = [ key ];
    }

    if (!Array.isArray(frame))
    {
        frame = [ frame ];
    }

    var _this = this;
    var children = [];

    key.forEach(function(singleKey) {

        frame.forEach(function(singleFrame) {

            for (var i = 0; i < quantity; i++)
            {
                children.push(_this.create(0, 0, singleKey, singleFrame, exists));
            }

        });

    });

    return children;

};

/**
* Internal method that re-applies all of the children's Z values.
*
* This must be called whenever children ordering is altered so that their `z` indices are correctly updated.
*
* @method Phaser.Group#updateZ
* @protected
*/
Phaser.Group.prototype.updateZ = function () {

    var i = this.children.length;

    while (i--)
    {
        this.children[i].z = i;
    }

};

/**
* This method iterates through all children in the Group (regardless if they are visible or exist)
* and then changes their position so they are arranged in a Grid formation. Children must have
* the `alignTo` method in order to be positioned by this call. All default Phaser Game Objects have
* this.
*
* The grid dimensions are determined by the first four arguments. The `width` and `height` arguments
* relate to the width and height of the grid respectively.
*
* For example if the Group had 100 children in it:
*
* `Group.align(10, 10, 32, 32)`
*
* This will align all of the children into a grid formation of 10x10, using 32 pixels per
* grid cell. If you want a wider grid, you could do:
*
* `Group.align(25, 4, 32, 32)`
*
* This will align the children into a grid of 25x4, again using 32 pixels per grid cell.
*
* You can choose to set _either_ the `width` or `height` value to -1. Doing so tells the method
* to keep on aligning children until there are no children left. For example if this Group had
* 48 children in it, the following:
*
* `Group.align(-1, 8, 32, 32)`
*
* ... will align the children so that there are 8 children vertically (the second argument),
* and each row will contain 6 sprites, except the last one, which will contain 5 (totaling 48)
*
* You can also do:
*
* `Group.align(10, -1, 32, 32)`
*
* In this case it will create a grid 10 wide, and as tall as it needs to be in order to fit
* all of the children in.
*
* The `position` property allows you to control where in each grid cell the child is positioned.
* This is a constant and can be one of `Phaser.TOP_LEFT` (default), `Phaser.TOP_CENTER`,
* `Phaser.TOP_RIGHT`, `Phaser.LEFT_CENTER`, `Phaser.CENTER`, `Phaser.RIGHT_CENTER`,
* `Phaser.BOTTOM_LEFT`, `Phaser.BOTTOM_CENTER` or `Phaser.BOTTOM_RIGHT`.
*
* The final argument; `offset` lets you start the alignment from a specific child index.
*
* @method Phaser.Group#align
* @param {integer} width - The width of the grid in items (not pixels). Set to -1 for a dynamic width. If -1 then you must set an explicit height value.
* @param {integer} height - The height of the grid in items (not pixels). Set to -1 for a dynamic height. If -1 then you must set an explicit width value.
* @param {integer} cellWidth - The width of each grid cell, in pixels.
* @param {integer} cellHeight - The height of each grid cell, in pixels.
* @param {integer} [position] - The position constant. One of `Phaser.TOP_LEFT` (default), `Phaser.TOP_CENTER`, `Phaser.TOP_RIGHT`, `Phaser.LEFT_CENTER`, `Phaser.CENTER`, `Phaser.RIGHT_CENTER`, `Phaser.BOTTOM_LEFT`, `Phaser.BOTTOM_CENTER` or `Phaser.BOTTOM_RIGHT`.
* @param {integer} [offset=0] - Optional index to start the alignment from. Defaults to zero, the first child in the Group, but can be set to any valid child index value.
* @return {boolean} True if the Group children were aligned, otherwise false.
*/
Phaser.Group.prototype.align = function (width, height, cellWidth, cellHeight, position, offset) {

    if (position === undefined) { position = Phaser.TOP_LEFT; }
    if (offset === undefined) { offset = 0; }

    if (this.children.length === 0 || offset > this.children.length || (width === -1 && height === -1))
    {
        return false;
    }

    var r = new Phaser.Rectangle(0, 0, cellWidth, cellHeight);
    var w = (width * cellWidth);
    var h = (height * cellHeight);

    for (var i = offset; i < this.children.length; i++)
    {
        var child = this.children[i];

        if (child['alignIn'])
        {
            child.alignIn(r, position);
        }
        else
        {
            continue;
        }

        if (width === -1)
        {
            //  We keep laying them out horizontally until we've done them all
            r.y += cellHeight;

            if (r.y === h)
            {
                r.x += cellWidth;
                r.y = 0;
            }
        }
        else if (height === -1)
        {
            //  We keep laying them out vertically until we've done them all
            r.x += cellWidth;

            if (r.x === w)
            {
                r.x = 0;
                r.y += cellHeight;
            }
        }
        else
        {
            //  We keep laying them out until we hit the column limit
            r.x += cellWidth;

            if (r.x === w)
            {
                r.x = 0;
                r.y += cellHeight;

                if (r.y === h)
                {
                    //  We've hit the column limit, so return, even if there are children left
                    return true;
                }
            }
        }
    }

    return true;

};

/**
* Sets the group cursor to the first child in the group.
*
* If the optional index parameter is given it sets the cursor to the object at that index instead.
*
* @method Phaser.Group#resetCursor
* @param {integer} [index=0] - Set the cursor to point to a specific index.
* @return {any} The child the cursor now points to.
*/
Phaser.Group.prototype.resetCursor = function (index) {

    if (index === undefined) { index = 0; }

    if (index > this.children.length - 1)
    {
        index = 0;
    }

    if (this.cursor)
    {
        this.cursorIndex = index;
        this.cursor = this.children[this.cursorIndex];
        return this.cursor;
    }

};

/**
* Advances the group cursor to the next (higher) object in the group.
*
* If the cursor is at the end of the group (top child) it is moved the start of the group (bottom child).
*
* @method Phaser.Group#next
* @return {any} The child the cursor now points to.
*/
Phaser.Group.prototype.next = function () {

    if (this.cursor)
    {
        //  Wrap the cursor?
        if (this.cursorIndex >= this.children.length - 1)
        {
            this.cursorIndex = 0;
        }
        else
        {
            this.cursorIndex++;
        }

        this.cursor = this.children[this.cursorIndex];

        return this.cursor;
    }

};

/**
* Moves the group cursor to the previous (lower) child in the group.
*
* If the cursor is at the start of the group (bottom child) it is moved to the end (top child).
*
* @method Phaser.Group#previous
* @return {any} The child the cursor now points to.
*/
Phaser.Group.prototype.previous = function () {

    if (this.cursor)
    {
        //  Wrap the cursor?
        if (this.cursorIndex === 0)
        {
            this.cursorIndex = this.children.length - 1;
        }
        else
        {
            this.cursorIndex--;
        }

        this.cursor = this.children[this.cursorIndex];

        return this.cursor;
    }

};

/**
* Swaps the position of two children in this group.
*
* Both children must be in this group, a child cannot be swapped with itself, and unparented children cannot be swapped.
*
* @method Phaser.Group#swap
* @param {any} child1 - The first child to swap.
* @param {any} child2 - The second child to swap.
*/
Phaser.Group.prototype.swap = function (child1, child2) {

    this.swapChildren(child1, child2);
    this.updateZ();

};

/**
* Brings the given child to the top of this group so it renders above all other children.
*
* @method Phaser.Group#bringToTop
* @param {any} child - The child to bring to the top of this group.
* @return {any} The child that was moved.
*/
Phaser.Group.prototype.bringToTop = function (child) {

    if (child.parent === this && this.getIndex(child) < this.children.length)
    {
        this.remove(child, false, true);
        this.add(child, true);
    }

    return child;

};

/**
* Sends the given child to the bottom of this group so it renders below all other children.
*
* @method Phaser.Group#sendToBack
* @param {any} child - The child to send to the bottom of this group.
* @return {any} The child that was moved.
*/
Phaser.Group.prototype.sendToBack = function (child) {

    if (child.parent === this && this.getIndex(child) > 0)
    {
        this.remove(child, false, true);
        this.addAt(child, 0, true);
    }

    return child;

};

/**
* Moves the given child up one place in this group unless it's already at the top.
*
* @method Phaser.Group#moveUp
* @param {any} child - The child to move up in the group.
* @return {any} The child that was moved.
*/
Phaser.Group.prototype.moveUp = function (child) {

    if (child.parent === this && this.getIndex(child) < this.children.length - 1)
    {
        var a = this.getIndex(child);
        var b = this.getAt(a + 1);

        if (b)
        {
            this.swap(child, b);
        }
    }

    return child;

};

/**
* Moves the given child down one place in this group unless it's already at the bottom.
*
* @method Phaser.Group#moveDown
* @param {any} child - The child to move down in the group.
* @return {any} The child that was moved.
*/
Phaser.Group.prototype.moveDown = function (child) {

    if (child.parent === this && this.getIndex(child) > 0)
    {
        var a = this.getIndex(child);
        var b = this.getAt(a - 1);

        if (b)
        {
            this.swap(child, b);
        }
    }

    return child;

};

/**
* Positions the child found at the given index within this group to the given x and y coordinates.
*
* @method Phaser.Group#xy
* @param {integer} index - The index of the child in the group to set the position of.
* @param {number} x - The new x position of the child.
* @param {number} y - The new y position of the child.
*/
Phaser.Group.prototype.xy = function (index, x, y) {

    if (index < 0 || index > this.children.length)
    {
        return -1;
    }
    else
    {
        this.getChildAt(index).x = x;
        this.getChildAt(index).y = y;
    }

};

/**
* Reverses all children in this group.
*
* This operation applies only to immediate children and does not propagate to subgroups.
*
* @method Phaser.Group#reverse
*/
Phaser.Group.prototype.reverse = function () {

    this.children.reverse();
    this.updateZ();

};

/**
* Get the index position of the given child in this group, which should match the child's `z` property.
*
* @method Phaser.Group#getIndex
* @param {any} child - The child to get the index for.
* @return {integer} The index of the child or -1 if it's not a member of this group.
*/
Phaser.Group.prototype.getIndex = function (child) {

    return this.children.indexOf(child);

};

/**
* Searches the Group for the first instance of a child with the `name`
* property matching the given argument. Should more than one child have
* the same name only the first instance is returned.
*
* @method Phaser.Group#getByName
* @param {string} name - The name to search for.
* @return {any} The first child with a matching name, or null if none were found.
*/
Phaser.Group.prototype.getByName = function (name) {

    for (var i = 0; i < this.children.length; i++)
    {
        if (this.children[i].name === name)
        {
            return this.children[i];
        }
    }

    return null;

};

/**
* Replaces a child of this Group with the given newChild. The newChild cannot be a member of this Group.
*
* If `Group.enableBody` is set, then a physics body will be created on the object, so long as one does not already exist.
*
* If `Group.inputEnableChildren` is set, then an Input Handler will be created on the object, so long as one does not already exist.
*
* @method Phaser.Group#replace
* @param {any} oldChild - The child in this group that will be replaced.
* @param {any} newChild - The child to be inserted into this group.
* @return {any} Returns the oldChild that was replaced within this group.
*/
Phaser.Group.prototype.replace = function (oldChild, newChild) {

    var index = this.getIndex(oldChild);

    if (index !== -1)
    {
        if (newChild.parent)
        {
            if (newChild.parent instanceof Phaser.Group)
            {
                newChild.parent.remove(newChild);
            }
            else
            {
                newChild.parent.removeChild(newChild);
            }
        }

        this.remove(oldChild);

        this.addAt(newChild, index);

        return oldChild;
    }

};

/**
* Checks if the child has the given property.
*
* Will scan up to 4 levels deep only.
*
* @method Phaser.Group#hasProperty
* @param {any} child - The child to check for the existence of the property on.
* @param {string[]} key - An array of strings that make up the property.
* @return {boolean} True if the child has the property, otherwise false.
*/
Phaser.Group.prototype.hasProperty = function (child, key) {

    var len = key.length;

    if (len === 1 && key[0] in child)
    {
        return true;
    }
    else if (len === 2 && key[0] in child && key[1] in child[key[0]])
    {
        return true;
    }
    else if (len === 3 && key[0] in child && key[1] in child[key[0]] && key[2] in child[key[0]][key[1]])
    {
        return true;
    }
    else if (len === 4 && key[0] in child && key[1] in child[key[0]] && key[2] in child[key[0]][key[1]] && key[3] in child[key[0]][key[1]][key[2]])
    {
        return true;
    }

    return false;

};

/**
* Sets a property to the given value on the child. The operation parameter controls how the value is set.
*
* The operations are:
* - 0: set the existing value to the given value; if force is `true` a new property will be created if needed
* - 1: will add the given value to the value already present.
* - 2: will subtract the given value from the value already present.
* - 3: will multiply the value already present by the given value.
* - 4: will divide the value already present by the given value.
*
* @method Phaser.Group#setProperty
* @param {any} child - The child to set the property value on.
* @param {array} key - An array of strings that make up the property that will be set.
* @param {any} value - The value that will be set.
* @param {integer} [operation=0] - Controls how the value is assigned. A value of 0 replaces the value with the new one. A value of 1 adds it, 2 subtracts it, 3 multiplies it and 4 divides it.
* @param {boolean} [force=false] - If `force` is true then the property will be set on the child regardless if it already exists or not. If false and the property doesn't exist, nothing will be set.
* @return {boolean} True if the property was set, false if not.
*/
Phaser.Group.prototype.setProperty = function (child, key, value, operation, force) {

    if (force === undefined) { force = false; }

    operation = operation || 0;

    //  As ugly as this approach looks, and although it's limited to a depth of only 4, it's much faster than a for loop or object iteration.

    //  0 = Equals
    //  1 = Add
    //  2 = Subtract
    //  3 = Multiply
    //  4 = Divide

    //  We can't force a property in and the child doesn't have it, so abort.
    //  Equally we can't add, subtract, multiply or divide a property value if it doesn't exist, so abort in those cases too.
    if (!this.hasProperty(child, key) && (!force || operation > 0))
    {
        return false;
    }

    var len = key.length;

    if (len === 1)
    {
        if (operation === 0) { child[key[0]] = value; }
        else if (operation === 1) { child[key[0]] += value; }
        else if (operation === 2) { child[key[0]] -= value; }
        else if (operation === 3) { child[key[0]] *= value; }
        else if (operation === 4) { child[key[0]] /= value; }
    }
    else if (len === 2)
    {
        if (operation === 0) { child[key[0]][key[1]] = value; }
        else if (operation === 1) { child[key[0]][key[1]] += value; }
        else if (operation === 2) { child[key[0]][key[1]] -= value; }
        else if (operation === 3) { child[key[0]][key[1]] *= value; }
        else if (operation === 4) { child[key[0]][key[1]] /= value; }
    }
    else if (len === 3)
    {
        if (operation === 0) { child[key[0]][key[1]][key[2]] = value; }
        else if (operation === 1) { child[key[0]][key[1]][key[2]] += value; }
        else if (operation === 2) { child[key[0]][key[1]][key[2]] -= value; }
        else if (operation === 3) { child[key[0]][key[1]][key[2]] *= value; }
        else if (operation === 4) { child[key[0]][key[1]][key[2]] /= value; }
    }
    else if (len === 4)
    {
        if (operation === 0) { child[key[0]][key[1]][key[2]][key[3]] = value; }
        else if (operation === 1) { child[key[0]][key[1]][key[2]][key[3]] += value; }
        else if (operation === 2) { child[key[0]][key[1]][key[2]][key[3]] -= value; }
        else if (operation === 3) { child[key[0]][key[1]][key[2]][key[3]] *= value; }
        else if (operation === 4) { child[key[0]][key[1]][key[2]][key[3]] /= value; }
    }

    return true;

};

/**
* Checks a property for the given value on the child.
*
* @method Phaser.Group#checkProperty
* @param {any} child - The child to check the property value on.
* @param {array} key - An array of strings that make up the property that will be set.
* @param {any} value - The value that will be checked.
* @param {boolean} [force=false] - If `force` is true then the property will be checked on the child regardless if it already exists or not. If true and the property doesn't exist, false will be returned.
* @return {boolean} True if the property was was equal to value, false if not.
*/
Phaser.Group.prototype.checkProperty = function (child, key, value, force) {

    if (force === undefined) { force = false; }

    //  We can't force a property in and the child doesn't have it, so abort.
    if (!Phaser.Utils.getProperty(child, key) && force)
    {
        return false;
    }

    if (Phaser.Utils.getProperty(child, key) !== value)
    {
        return false;
    }

    return true;

};

/**
* Quickly set a property on a single child of this group to a new value.
*
* The operation parameter controls how the new value is assigned to the property, from simple replacement to addition and multiplication.
*
* @method Phaser.Group#set
* @param {Phaser.Sprite} child - The child to set the property on.
* @param {string} key - The property, as a string, to be set. For example: 'body.velocity.x'
* @param {any} value - The value that will be set.
* @param {boolean} [checkAlive=false] - If set then the child will only be updated if alive=true.
* @param {boolean} [checkVisible=false] - If set then the child will only be updated if visible=true.
* @param {integer} [operation=0] - Controls how the value is assigned. A value of 0 replaces the value with the new one. A value of 1 adds it, 2 subtracts it, 3 multiplies it and 4 divides it.
* @param {boolean} [force=false] - If `force` is true then the property will be set on the child regardless if it already exists or not. If false and the property doesn't exist, nothing will be set.
* @return {boolean} True if the property was set, false if not.
*/
Phaser.Group.prototype.set = function (child, key, value, checkAlive, checkVisible, operation, force) {

    if (force === undefined) { force = false; }

    key = key.split('.');

    if (checkAlive === undefined) { checkAlive = false; }
    if (checkVisible === undefined) { checkVisible = false; }

    if ((checkAlive === false || (checkAlive && child.alive)) && (checkVisible === false || (checkVisible && child.visible)))
    {
        return this.setProperty(child, key, value, operation, force);
    }

};

/**
* Quickly set the same property across all children of this group to a new value.
*
* This call doesn't descend down children, so if you have a Group inside of this group, the property will be set on the group but not its children.
* If you need that ability please see `Group.setAllChildren`.
*
* The operation parameter controls how the new value is assigned to the property, from simple replacement to addition and multiplication.
*
* @method Phaser.Group#setAll
* @param {string} key - The property, as a string, to be set. For example: 'body.velocity.x'
* @param {any} value - The value that will be set.
* @param {boolean} [checkAlive=false] - If set then only children with alive=true will be updated. This includes any Groups that are children.
* @param {boolean} [checkVisible=false] - If set then only children with visible=true will be updated. This includes any Groups that are children.
* @param {integer} [operation=0] - Controls how the value is assigned. A value of 0 replaces the value with the new one. A value of 1 adds it, 2 subtracts it, 3 multiplies it and 4 divides it.
* @param {boolean} [force=false] - If `force` is true then the property will be set on the child regardless if it already exists or not. If false and the property doesn't exist, nothing will be set.
*/
Phaser.Group.prototype.setAll = function (key, value, checkAlive, checkVisible, operation, force) {

    if (checkAlive === undefined) { checkAlive = false; }
    if (checkVisible === undefined) { checkVisible = false; }
    if (force === undefined) { force = false; }

    key = key.split('.');
    operation = operation || 0;

    for (var i = 0; i < this.children.length; i++)
    {
        if ((!checkAlive || (checkAlive && this.children[i].alive)) && (!checkVisible || (checkVisible && this.children[i].visible)))
        {
            this.setProperty(this.children[i], key, value, operation, force);
        }
    }

};

/**
* Quickly set the same property across all children of this group, and any child Groups, to a new value.
*
* If this group contains other Groups then the same property is set across their children as well, iterating down until it reaches the bottom.
* Unlike with `setAll` the property is NOT set on child Groups itself.
*
* The operation parameter controls how the new value is assigned to the property, from simple replacement to addition and multiplication.
*
* @method Phaser.Group#setAllChildren
* @param {string} key - The property, as a string, to be set. For example: 'body.velocity.x'
* @param {any} value - The value that will be set.
* @param {boolean} [checkAlive=false] - If set then only children with alive=true will be updated. This includes any Groups that are children.
* @param {boolean} [checkVisible=false] - If set then only children with visible=true will be updated. This includes any Groups that are children.
* @param {integer} [operation=0] - Controls how the value is assigned. A value of 0 replaces the value with the new one. A value of 1 adds it, 2 subtracts it, 3 multiplies it and 4 divides it.
* @param {boolean} [force=false] - If `force` is true then the property will be set on the child regardless if it already exists or not. If false and the property doesn't exist, nothing will be set.
*/
Phaser.Group.prototype.setAllChildren = function (key, value, checkAlive, checkVisible, operation, force) {

    if (checkAlive === undefined) { checkAlive = false; }
    if (checkVisible === undefined) { checkVisible = false; }
    if (force === undefined) { force = false; }

    operation = operation || 0;

    for (var i = 0; i < this.children.length; i++)
    {
        if ((!checkAlive || (checkAlive && this.children[i].alive)) && (!checkVisible || (checkVisible && this.children[i].visible)))
        {
            if (this.children[i] instanceof Phaser.Group)
            {
                this.children[i].setAllChildren(key, value, checkAlive, checkVisible, operation, force);
            }
            else
            {
                this.setProperty(this.children[i], key.split('.'), value, operation, force);
            }
        }
    }

};

/**
* Quickly check that the same property across all children of this group is equal to the given value.
*
* This call doesn't descend down children, so if you have a Group inside of this group, the property will be checked on the group but not its children.
*
* @method Phaser.Group#checkAll
* @param {string} key - The property, as a string, to be set. For example: 'body.velocity.x'
* @param {any} value - The value that will be checked.
* @param {boolean} [checkAlive=false] - If set then only children with alive=true will be checked. This includes any Groups that are children.
* @param {boolean} [checkVisible=false] - If set then only children with visible=true will be checked. This includes any Groups that are children.
* @param {boolean} [force=false] - If `force` is true then the property will be checked on the child regardless if it already exists or not. If true and the property doesn't exist, false will be returned.
*/
Phaser.Group.prototype.checkAll = function (key, value, checkAlive, checkVisible, force) {

    if (checkAlive === undefined) { checkAlive = false; }
    if (checkVisible === undefined) { checkVisible = false; }
    if (force === undefined) { force = false; }

    for (var i = 0; i < this.children.length; i++)
    {
        if ((!checkAlive || (checkAlive && this.children[i].alive)) && (!checkVisible || (checkVisible && this.children[i].visible)))
        {
            if (!this.checkProperty(this.children[i], key, value, force))
            {
                return false;
            }
        }
    }

    return true;

};

/**
* Adds the amount to the given property on all children in this group.
*
* `Group.addAll('x', 10)` will add 10 to the child.x value for each child.
*
* @method Phaser.Group#addAll
* @param {string} property - The property to increment, for example 'body.velocity.x' or 'angle'.
* @param {number} amount - The amount to increment the property by. If child.x = 10 then addAll('x', 40) would make child.x = 50.
* @param {boolean} checkAlive - If true the property will only be changed if the child is alive.
* @param {boolean} checkVisible - If true the property will only be changed if the child is visible.
*/
Phaser.Group.prototype.addAll = function (property, amount, checkAlive, checkVisible) {

    this.setAll(property, amount, checkAlive, checkVisible, 1);

};

/**
* Subtracts the amount from the given property on all children in this group.
*
* `Group.subAll('x', 10)` will minus 10 from the child.x value for each child.
*
* @method Phaser.Group#subAll
* @param {string} property - The property to decrement, for example 'body.velocity.x' or 'angle'.
* @param {number} amount - The amount to subtract from the property. If child.x = 50 then subAll('x', 40) would make child.x = 10.
* @param {boolean} checkAlive - If true the property will only be changed if the child is alive.
* @param {boolean} checkVisible - If true the property will only be changed if the child is visible.
*/
Phaser.Group.prototype.subAll = function (property, amount, checkAlive, checkVisible) {

    this.setAll(property, amount, checkAlive, checkVisible, 2);

};

/**
* Multiplies the given property by the amount on all children in this group.
*
* `Group.multiplyAll('x', 2)` will x2 the child.x value for each child.
*
* @method Phaser.Group#multiplyAll
* @param {string} property - The property to multiply, for example 'body.velocity.x' or 'angle'.
* @param {number} amount - The amount to multiply the property by. If child.x = 10 then multiplyAll('x', 2) would make child.x = 20.
* @param {boolean} checkAlive - If true the property will only be changed if the child is alive.
* @param {boolean} checkVisible - If true the property will only be changed if the child is visible.
*/
Phaser.Group.prototype.multiplyAll = function (property, amount, checkAlive, checkVisible) {

    this.setAll(property, amount, checkAlive, checkVisible, 3);

};

/**
* Divides the given property by the amount on all children in this group.
*
* `Group.divideAll('x', 2)` will half the child.x value for each child.
*
* @method Phaser.Group#divideAll
* @param {string} property - The property to divide, for example 'body.velocity.x' or 'angle'.
* @param {number} amount - The amount to divide the property by. If child.x = 100 then divideAll('x', 2) would make child.x = 50.
* @param {boolean} checkAlive - If true the property will only be changed if the child is alive.
* @param {boolean} checkVisible - If true the property will only be changed if the child is visible.
*/
Phaser.Group.prototype.divideAll = function (property, amount, checkAlive, checkVisible) {

    this.setAll(property, amount, checkAlive, checkVisible, 4);

};

/**
* Calls a function, specified by name, on all children in the group who exist (or do not exist).
*
* After the existsValue parameter you can add as many parameters as you like, which will all be passed to the child callback.
*
* @method Phaser.Group#callAllExists
* @param {string} callback - Name of the function on the children to call.
* @param {boolean} existsValue - Only children with exists=existsValue will be called.
* @param {...any} parameter - Additional parameters that will be passed to the callback.
*/
Phaser.Group.prototype.callAllExists = function (callback, existsValue) {

    var args;

    if (arguments.length > 2)
    {
        args = [];

        for (var i = 2; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }
    }

    for (var i = 0; i < this.children.length; i++)
    {
        if (this.children[i].exists === existsValue && this.children[i][callback])
        {
            this.children[i][callback].apply(this.children[i], args);
        }
    }

};

/**
* Returns a reference to a function that exists on a child of the group based on the given callback array.
*
* @method Phaser.Group#callbackFromArray
* @param {object} child - The object to inspect.
* @param {array} callback - The array of function names.
* @param {integer} length - The size of the array (pre-calculated in callAll).
* @protected
*/
Phaser.Group.prototype.callbackFromArray = function (child, callback, length) {

    //  Kinda looks like a Christmas tree

    if (length === 1)
    {
        if (child[callback[0]])
        {
            return child[callback[0]];
        }
    }
    else if (length === 2)
    {
        if (child[callback[0]][callback[1]])
        {
            return child[callback[0]][callback[1]];
        }
    }
    else if (length === 3)
    {
        if (child[callback[0]][callback[1]][callback[2]])
        {
            return child[callback[0]][callback[1]][callback[2]];
        }
    }
    else if (length === 4)
    {
        if (child[callback[0]][callback[1]][callback[2]][callback[3]])
        {
            return child[callback[0]][callback[1]][callback[2]][callback[3]];
        }
    }
    else if (child[callback])
    {
        return child[callback];
    }

    return false;

};

/**
* Calls a function, specified by name, on all on children.
*
* The function is called for all children regardless if they are dead or alive (see callAllExists for different options).
* After the method parameter and context you can add as many extra parameters as you like, which will all be passed to the child.
*
* @method Phaser.Group#callAll
* @param {string} method - Name of the function on the child to call. Deep property lookup is supported.
* @param {string} [context=null] - A string containing the context under which the method will be executed. Set to null to default to the child.
* @param {...any} args - Additional parameters that will be passed to the method.
*/
Phaser.Group.prototype.callAll = function (method, context) {

    if (method === undefined)
    {
        return;
    }

    //  Extract the method into an array
    method = method.split('.');

    var methodLength = method.length;

    if (context === undefined || context === null || context === '')
    {
        context = null;
    }
    else
    {
        //  Extract the context into an array
        if (typeof context === 'string')
        {
            context = context.split('.');
            var contextLength = context.length;
        }
    }

    var args;

    if (arguments.length > 2)
    {
        args = [];

        for (var i = 2; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }
    }

    var callback = null;
    var callbackContext = null;

    for (var i = 0; i < this.children.length; i++)
    {
        callback = this.callbackFromArray(this.children[i], method, methodLength);

        if (context && callback)
        {
            callbackContext = this.callbackFromArray(this.children[i], context, contextLength);

            if (callback)
            {
                callback.apply(callbackContext, args);
            }
        }
        else if (callback)
        {
            callback.apply(this.children[i], args);
        }
    }

};

/**
* The core preUpdate - as called by World.
* @method Phaser.Group#preUpdate
* @protected
*/
Phaser.Group.prototype.preUpdate = function () {

    if (this.pendingDestroy)
    {
        this.destroy();
        return false;
    }

    if (!this.exists || !this.parent.exists)
    {
        this.renderOrderID = -1;
        return false;
    }

    for (var i = 0; i < this.children.length; i++)
    {
        this.children[i].preUpdate();
    }

    return true;

};

/**
* The core update - as called by World.
* @method Phaser.Group#update
* @protected
*/
Phaser.Group.prototype.update = function () {

    //  Goes in reverse, because it's highly likely the child will destroy itself in `update`
    var i = this.children.length;

    while (i--)
    {
        this.children[i].update();
    }

};

/**
* The core postUpdate - as called by World.
* @method Phaser.Group#postUpdate
* @protected
*/
Phaser.Group.prototype.postUpdate = function () {

    //  Fixed to Camera?
    if (this.fixedToCamera)
    {
        this.x = this.game.camera.view.x + this.cameraOffset.x;
        this.y = this.game.camera.view.y + this.cameraOffset.y;
    }

    for (var i = 0; i < this.children.length; i++)
    {
        this.children[i].postUpdate();
    }

};

/**
* Find children matching a certain predicate.
*
* For example:
*
*     var healthyList = Group.filter(function(child, index, children) {
*         return child.health > 10 ? true : false;
*     }, true);
*     healthyList.callAll('attack');
*
* Note: Currently this will skip any children which are Groups themselves.
*
* @method Phaser.Group#filter
* @param {function} predicate - The function that each child will be evaluated against. Each child of the group will be passed to it as its first parameter, the index as the second, and the entire child array as the third
* @param {boolean} [checkExists=false] - If true, only existing can be selected; otherwise all children can be selected and will be passed to the predicate.
* @return {Phaser.ArraySet} Returns an array list containing all the children that the predicate returned true for
*/
Phaser.Group.prototype.filter = function (predicate, checkExists) {

    var index = -1;
    var length = this.children.length;
    var results = [];

    while (++index < length)
    {
        var child = this.children[index];

        if (!checkExists || (checkExists && child.exists))
        {
            if (predicate(child, index, this.children))
            {
                results.push(child);
            }
        }
    }

    return new Phaser.ArraySet(results);

};

/**
* Call a function on each child in this group.
*
* Additional arguments for the callback can be specified after the `checkExists` parameter. For example,
*
*     Group.forEach(awardBonusGold, this, true, 100, 500)
*
* would invoke `awardBonusGold` function with the parameters `(child, 100, 500)`.
*
* Note: This check will skip any children which are Groups themselves.
*
* @method Phaser.Group#forEach
* @param {function} callback - The function that will be called for each applicable child. The child will be passed as the first argument and the index of that child as the second argument.
* @param {object} callbackContext - The context in which the function should be called (usually 'this').
* @param {boolean} [checkExists=false] - If set only children matching for which `exists` is true will be passed to the callback, otherwise all children will be passed.
* @param {...any} [args=(none)] - Additional arguments to pass to the callback function, after the other parameters.
*/
Phaser.Group.prototype.forEach = function (callback, callbackContext, checkExists) {

    if (checkExists === undefined) { checkExists = false; }

    if (arguments.length <= 3)
    {
        for (var i = 0; i < this.children.length; i++)
        {
            if (!checkExists || (checkExists && this.children[i].exists))
            {
                callback.call(callbackContext, this.children[i], i);
            }
        }
    }
    else
    {
        // Assigning to arguments properties causes Extreme Deoptimization in Chrome, FF, and IE.
        // Using an array and pushing each element (not a slice!) is _significantly_ faster.
        var args = [null];

        for (var i = 3; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }

        for (var i = 0; i < this.children.length; i++)
        {
            if (!checkExists || (checkExists && this.children[i].exists))
            {
                args[0] = this.children[i];
                callback.apply(callbackContext, args.concat([i]));
            }
        }
    }

};

/**
* Call a function on each existing child in this group.
*
* See {@link Phaser.Group#forEach forEach} for details.
*
* @method Phaser.Group#forEachExists
* @param {function} callback - The function that will be called for each applicable child. The child will be passed as the first argument.
* @param {object} callbackContext - The context in which the function should be called (usually 'this').
* @param {...any} [args=(none)] - Additional arguments to pass to the callback function, after the child item.
*/
Phaser.Group.prototype.forEachExists = function (callback, callbackContext) {

    var args;

    if (arguments.length > 2)
    {
        args = [null];

        for (var i = 2; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }
    }

    this.iterate('exists', true, Phaser.Group.RETURN_TOTAL, callback, callbackContext, args);

};

/**
* Call a function on each alive child in this group.
*
* See {@link Phaser.Group#forEach forEach} for details.
*
* @method Phaser.Group#forEachAlive
* @param {function} callback - The function that will be called for each applicable child. The child will be passed as the first argument.
* @param {object} callbackContext - The context in which the function should be called (usually 'this').
* @param {...any} [args=(none)] - Additional arguments to pass to the callback function, after the child item.
*/
Phaser.Group.prototype.forEachAlive = function (callback, callbackContext) {

    var args;

    if (arguments.length > 2)
    {
        args = [null];

        for (var i = 2; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }
    }

    this.iterate('alive', true, Phaser.Group.RETURN_TOTAL, callback, callbackContext, args);

};

/**
* Call a function on each dead child in this group.
*
* See {@link Phaser.Group#forEach forEach} for details.
*
* @method Phaser.Group#forEachDead
* @param {function} callback - The function that will be called for each applicable child. The child will be passed as the first argument.
* @param {object} callbackContext - The context in which the function should be called (usually 'this').
* @param {...any} [args=(none)] - Additional arguments to pass to the callback function, after the child item.
*/
Phaser.Group.prototype.forEachDead = function (callback, callbackContext) {

    var args;

    if (arguments.length > 2)
    {
        args = [null];

        for (var i = 2; i < arguments.length; i++)
        {
            args.push(arguments[i]);
        }
    }

    this.iterate('alive', false, Phaser.Group.RETURN_TOTAL, callback, callbackContext, args);

};

/**
* Sort the children in the group according to a particular key and ordering.
*
* Call this function to sort the group according to a particular key value and order.
*
* For example to depth sort Sprites for Zelda-style game you might call `group.sort('y', Phaser.Group.SORT_ASCENDING)` at the bottom of your `State.update()`.
*
* Internally this uses a standard JavaScript Array sort, so everything that applies there also applies here, including
* alphabetical sorting, mixing strings and numbers, and Unicode sorting. See MDN for more details.
*
* @method Phaser.Group#sort
* @param {string} [key='z'] - The name of the property to sort on. Defaults to the objects z-depth value.
* @param {integer} [order=Phaser.Group.SORT_ASCENDING] - Order ascending ({@link Phaser.Group.SORT_ASCENDING SORT_ASCENDING}) or descending ({@link Phaser.Group.SORT_DESCENDING SORT_DESCENDING}).
*/
Phaser.Group.prototype.sort = function (key, order) {

    if (this.children.length < 2)
    {
        //  Nothing to swap
        return;
    }

    if (key === undefined) { key = 'z'; }
    if (order === undefined) { order = Phaser.Group.SORT_ASCENDING; }

    this._sortProperty = key;

    if (order === Phaser.Group.SORT_ASCENDING)
    {
        this.children.sort(this.ascendingSortHandler.bind(this));
    }
    else
    {
        this.children.sort(this.descendingSortHandler.bind(this));
    }

    this.updateZ();

};

/**
* Sort the children in the group according to custom sort function.
*
* The `sortHandler` is provided the two parameters: the two children involved in the comparison (a and b).
* It should return -1 if `a > b`, 1 if `a < b` or 0 if `a === b`.
*
* @method Phaser.Group#customSort
* @param {function} sortHandler - The custom sort function.
* @param {object} [context=undefined] - The context in which the sortHandler is called.
*/
Phaser.Group.prototype.customSort = function (sortHandler, context) {

    if (this.children.length < 2)
    {
        //  Nothing to swap
        return;
    }

    this.children.sort(sortHandler.bind(context));

    this.updateZ();

};

/**
* An internal helper function for the sort process.
*
* @method Phaser.Group#ascendingSortHandler
* @protected
* @param {object} a - The first object being sorted.
* @param {object} b - The second object being sorted.
*/
Phaser.Group.prototype.ascendingSortHandler = function (a, b) {

    if (a[this._sortProperty] < b[this._sortProperty])
    {
        return -1;
    }
    else if (a[this._sortProperty] > b[this._sortProperty])
    {
        return 1;
    }
    else
    {
        if (a.z < b.z)
        {
            return -1;
        }
        else
        {
            return 1;
        }
    }

};

/**
* An internal helper function for the sort process.
*
* @method Phaser.Group#descendingSortHandler
* @protected
* @param {object} a - The first object being sorted.
* @param {object} b - The second object being sorted.
*/
Phaser.Group.prototype.descendingSortHandler = function (a, b) {

    if (a[this._sortProperty] < b[this._sortProperty])
    {
        return 1;
    }
    else if (a[this._sortProperty] > b[this._sortProperty])
    {
        return -1;
    }
    else
    {
        return 0;
    }

};

/**
* Iterates over the children of the group performing one of several actions for matched children.
*
* A child is considered a match when it has a property, named `key`, whose value is equal to `value`
* according to a strict equality comparison.
*
* The result depends on the `returnType`:
*
* - {@link Phaser.Group.RETURN_TOTAL RETURN_TOTAL}:
*     The callback, if any, is applied to all matching children. The number of matched children is returned.
* - {@link Phaser.Group.RETURN_NONE RETURN_NONE}:
*     The callback, if any, is applied to all matching children. No value is returned.
* - {@link Phaser.Group.RETURN_CHILD RETURN_CHILD}:
*     The callback, if any, is applied to the *first* matching child and the *first* matched child is returned.
*     If there is no matching child then null is returned.
*
* If `args` is specified it must be an array. The matched child will be assigned to the first
* element and the entire array will be applied to the callback function.
*
* @method Phaser.Group#iterate
* @param {string} key - The child property to check, i.e. 'exists', 'alive', 'health'
* @param {any} value - A child matches if `child[key] === value` is true.
* @param {integer} returnType - How to iterate the children and what to return.
* @param {function} [callback=null] - Optional function that will be called on each matching child. The matched child is supplied as the first argument.
* @param {object} [callbackContext] - The context in which the function should be called (usually 'this').
* @param {any[]} [args=(none)] - The arguments supplied to to the callback; the first array index (argument) will be replaced with the matched child.
* @return {any} Returns either an integer (for RETURN_TOTAL), the first matched child (for RETURN_CHILD), or null.
*/
Phaser.Group.prototype.iterate = function (key, value, returnType, callback, callbackContext, args) {

    if (this.children.length === 0)
    {
        if (returnType === Phaser.Group.RETURN_TOTAL)
        {
            return 0;
        }
        else if (returnType === Phaser.Group.RETURN_ALL)
        {
            return [];
        }
    }

    var total = 0;

    if (returnType === Phaser.Group.RETURN_ALL)
    {
        var output = [];
    }

    for (var i = 0; i < this.children.length; i++)
    {
        if (this.children[i][key] === value)
        {
            total++;

            if (callback)
            {
                if (args)
                {
                    args[0] = this.children[i];
                    callback.apply(callbackContext, args);
                }
                else
                {
                    callback.call(callbackContext, this.children[i]);
                }
            }

            if (returnType === Phaser.Group.RETURN_CHILD)
            {
                return this.children[i];
            }
            else if (returnType === Phaser.Group.RETURN_ALL)
            {
                output.push(this.children[i]);
            }
        }
    }

    if (returnType === Phaser.Group.RETURN_TOTAL)
    {
        return total;
    }
    else if (returnType === Phaser.Group.RETURN_ALL)
    {
        return output;
    }
    else
    {
        //  RETURN_CHILD or RETURN_NONE
        return null;
    }

};

/**
* Get the first display object that exists, or doesn't exist.
*
* You can use the optional argument `createIfNull` to create a new Game Object if none matching your exists argument were found in this Group.
*
* It works by calling `Group.create` passing it the parameters given to this method, and returning the new child.
*
* If a child *was* found , `createIfNull` is `false` and you provided the additional arguments then the child
* will be reset and/or have a new texture loaded on it. This is handled by `Group.resetChild`.
*
* @method Phaser.Group#getFirstExists
* @param {boolean} [exists=true] - If true, find the first existing child; otherwise find the first non-existing child.
* @param {boolean} [createIfNull=false] - If `true` and no alive children are found a new one is created.
* @param {number} [x] - The x coordinate to reset the child to. The value is in relation to the group.x point.
* @param {number} [y] - The y coordinate to reset the child to. The value is in relation to the group.y point.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} [key] - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache Image entry, or an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
* @param {string|number} [frame] - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
* @return {DisplayObject} The first child, or `null` if none found and `createIfNull` was false.
*/
Phaser.Group.prototype.getFirstExists = function (exists, createIfNull, x, y, key, frame) {

    if (createIfNull === undefined) { createIfNull = false; }

    if (typeof exists !== 'boolean')
    {
        exists = true;
    }

    var child = this.iterate('exists', exists, Phaser.Group.RETURN_CHILD);

    return (child === null && createIfNull) ? this.create(x, y, key, frame) : this.resetChild(child, x, y, key, frame);

};

/**
* Get the first child that is alive (`child.alive === true`).
*
* This is handy for choosing a squad leader, etc.
*
* You can use the optional argument `createIfNull` to create a new Game Object if no alive ones were found in this Group.
*
* It works by calling `Group.create` passing it the parameters given to this method, and returning the new child.
*
* If a child *was* found , `createIfNull` is `false` and you provided the additional arguments then the child
* will be reset and/or have a new texture loaded on it. This is handled by `Group.resetChild`.
*
* @method Phaser.Group#getFirstAlive
* @param {boolean} [createIfNull=false] - If `true` and no alive children are found a new one is created.
* @param {number} [x] - The x coordinate to reset the child to. The value is in relation to the group.x point.
* @param {number} [y] - The y coordinate to reset the child to. The value is in relation to the group.y point.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} [key] - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache Image entry, or an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
* @param {string|number} [frame] - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
* @return {DisplayObject} The alive dead child, or `null` if none found and `createIfNull` was false.
*/
Phaser.Group.prototype.getFirstAlive = function (createIfNull, x, y, key, frame) {

    if (createIfNull === undefined) { createIfNull = false; }

    var child = this.iterate('alive', true, Phaser.Group.RETURN_CHILD);

    return (child === null && createIfNull) ? this.create(x, y, key, frame) : this.resetChild(child, x, y, key, frame);

};

/**
* Get the first child that is dead (`child.alive === false`).
*
* This is handy for checking if everything has been wiped out and adding to the pool as needed.
*
* You can use the optional argument `createIfNull` to create a new Game Object if no dead ones were found in this Group.
*
* It works by calling `Group.create` passing it the parameters given to this method, and returning the new child.
*
* If a child *was* found , `createIfNull` is `false` and you provided the additional arguments then the child
* will be reset and/or have a new texture loaded on it. This is handled by `Group.resetChild`.
*
* @method Phaser.Group#getFirstDead
* @param {boolean} [createIfNull=false] - If `true` and no dead children are found a new one is created.
* @param {number} [x] - The x coordinate to reset the child to. The value is in relation to the group.x point.
* @param {number} [y] - The y coordinate to reset the child to. The value is in relation to the group.y point.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} [key] - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache Image entry, or an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
* @param {string|number} [frame] - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
* @return {DisplayObject} The first dead child, or `null` if none found and `createIfNull` was false.
*/
Phaser.Group.prototype.getFirstDead = function (createIfNull, x, y, key, frame) {

    if (createIfNull === undefined) { createIfNull = false; }

    var child = this.iterate('alive', false, Phaser.Group.RETURN_CHILD);

    return (child === null && createIfNull) ? this.create(x, y, key, frame) : this.resetChild(child, x, y, key, frame);

};

/**
* Takes a child and if the `x` and `y` arguments are given it calls `child.reset(x, y)` on it.
*
* If the `key` and optionally the `frame` arguments are given, it calls `child.loadTexture(key, frame)` on it.
*
* The two operations are separate. For example if you just wish to load a new texture then pass `null` as the x and y values.
*
* @method Phaser.Group#resetChild
* @param {DisplayObject} child - The child to reset and/or load the texture on.
* @param {number} [x] - The x coordinate to reset the child to. The value is in relation to the group.x point.
* @param {number} [y] - The y coordinate to reset the child to. The value is in relation to the group.y point.
* @param {string|Phaser.RenderTexture|Phaser.BitmapData|Phaser.Video|PIXI.Texture} [key] - This is the image or texture used by the Sprite during rendering. It can be a string which is a reference to the Cache Image entry, or an instance of a RenderTexture, BitmapData, Video or PIXI.Texture.
* @param {string|number} [frame] - If this Sprite is using part of a sprite sheet or texture atlas you can specify the exact frame to use by giving a string or numeric index.
* @return {DisplayObject} The child that was reset: usually a {@link Phaser.Sprite}.
*/
Phaser.Group.prototype.resetChild = function (child, x, y, key, frame) {

    if (child === null)
    {
        return null;
    }

    if (x === undefined) { x = null; }
    if (y === undefined) { y = null; }

    if (x !== null && y !== null)
    {
        child.reset(x, y);
    }

    if (key !== undefined)
    {
        child.loadTexture(key, frame);
    }

    return child;

};

/**
* Return the child at the top of this group.
*
* The top child is the child displayed (rendered) above every other child.
*
* @method Phaser.Group#getTop
* @return {any} The child at the top of the Group.
*/
Phaser.Group.prototype.getTop = function () {

    if (this.children.length > 0)
    {
        return this.children[this.children.length - 1];
    }

};

/**
* Returns the child at the bottom of this group.
*
* The bottom child the child being displayed (rendered) below every other child.
*
* @method Phaser.Group#getBottom
* @return {any} The child at the bottom of the Group.
*/
Phaser.Group.prototype.getBottom = function () {

    if (this.children.length > 0)
    {
        return this.children[0];
    }

};

/**
* Get the closest child to given Object, with optional callback to filter children.
*
* This can be a Sprite, Group, Image or any object with public x and y properties.
*
* 'close' is determined by the distance from the objects `x` and `y` properties compared to the childs `x` and `y` properties.
*
* You can use the optional `callback` argument to apply your own filter to the distance checks.
* If the child is closer then the previous child, it will be sent to `callback` as the first argument,
* with the distance as the second. The callback should return `true` if it passes your
* filtering criteria, otherwise it should return `false`.
*
* @method Phaser.Group#getClosestTo
* @param {any} object - The object used to determine the distance. This can be a Sprite, Group, Image or any object with public x and y properties.
* @param {function} [callback] - The function that each child will be evaluated against. Each child of the group will be passed to it as its first parameter, with the distance as the second. It should return `true` if the child passes the matching criteria.
* @param {object} [callbackContext] - The context in which the function should be called (usually 'this').
* @return {any} The child closest to given object, or `null` if no child was found.
*/
Phaser.Group.prototype.getClosestTo = function (object, callback, callbackContext) {

    var distance = Number.MAX_VALUE;
    var tempDistance = 0;
    var result = null;

    for (var i = 0; i < this.children.length; i++)
    {
        var child = this.children[i];

        if (child.exists)
        {
            tempDistance = Math.abs(Phaser.Point.distance(object, child));

            if (tempDistance < distance && (!callback || callback.call(callbackContext, child, tempDistance)))
            {
                distance = tempDistance;
                result = child;
            }
        }
    }

    return result;

};

/**
* Get the child furthest away from the given Object, with optional callback to filter children.
*
* This can be a Sprite, Group, Image or any object with public x and y properties.
*
* 'furthest away' is determined by the distance from the objects `x` and `y` properties compared to the childs `x` and `y` properties.
*
* You can use the optional `callback` argument to apply your own filter to the distance checks.
* If the child is closer then the previous child, it will be sent to `callback` as the first argument,
* with the distance as the second. The callback should return `true` if it passes your
* filtering criteria, otherwise it should return `false`.
*
* @method Phaser.Group#getFurthestFrom
* @param {any} object - The object used to determine the distance. This can be a Sprite, Group, Image or any object with public x and y properties.
* @param {function} [callback] - The function that each child will be evaluated against. Each child of the group will be passed to it as its first parameter, with the distance as the second. It should return `true` if the child passes the matching criteria.
* @param {object} [callbackContext] - The context in which the function should be called (usually 'this').
* @return {any} The child furthest from the given object, or `null` if no child was found.
*/
Phaser.Group.prototype.getFurthestFrom = function (object, callback, callbackContext) {

    var distance = 0;
    var tempDistance = 0;
    var result = null;

    for (var i = 0; i < this.children.length; i++)
    {
        var child = this.children[i];

        if (child.exists)
        {
            tempDistance = Math.abs(Phaser.Point.distance(object, child));

            if (tempDistance > distance && (!callback || callback.call(callbackContext, child, tempDistance)))
            {
                distance = tempDistance;
                result = child;
            }
        }
    }

    return result;

};

/**
* Get the number of living children in this group.
*
* @method Phaser.Group#countLiving
* @return {integer} The number of children flagged as alive.
*/
Phaser.Group.prototype.countLiving = function () {

    return this.iterate('alive', true, Phaser.Group.RETURN_TOTAL);

};

/**
* Get the number of dead children in this group.
*
* @method Phaser.Group#countDead
* @return {integer} The number of children flagged as dead.
*/
Phaser.Group.prototype.countDead = function () {

    return this.iterate('alive', false, Phaser.Group.RETURN_TOTAL);

};

/**
* Returns a random child from the group.
*
* @method Phaser.Group#getRandom
* @param {integer} [startIndex=0] - Offset from the front of the group (lowest child).
* @param {integer} [length=(to top)] - Restriction on the number of values you want to randomly select from.
* @return {any} A random child of this Group.
*/
Phaser.Group.prototype.getRandom = function (startIndex, length) {

    if (startIndex === undefined) { startIndex = 0; }
    if (length === undefined) { length = this.children.length; }

    if (length === 0)
    {
        return null;
    }

    return Phaser.ArrayUtils.getRandomItem(this.children, startIndex, length);

};

/**
* Returns a random child from the Group that has `exists` set to `true`.
*
* Optionally you can specify a start and end index. For example if this Group had 100 children,
* and you set `startIndex` to 0 and `endIndex` to 50, it would return a random child from only
* the first 50 children in the Group.
*
* @method Phaser.Group#getRandomExists
* @param {integer} [startIndex=0] - The first child index to start the search from.
* @param {integer} [endIndex] - The last child index to search up to.
* @return {any} A random child of this Group that exists.
*/
Phaser.Group.prototype.getRandomExists = function (startIndex, endIndex) {

    var list = this.getAll('exists', true, startIndex, endIndex);

    return this.game.rnd.pick(list);

};

/**
* Returns all children in this Group.
*
* You can optionally specify a matching criteria using the `property` and `value` arguments.
*
* For example: `getAll('exists', true)` would return only children that have their exists property set.
*
* Optionally you can specify a start and end index. For example if this Group had 100 children,
* and you set `startIndex` to 0 and `endIndex` to 50, it would return a random child from only
* the first 50 children in the Group.
*
* @method Phaser.Group#getAll
* @param {string} [property] - An optional property to test against the value argument.
* @param {any} [value] - If property is set then Child.property must strictly equal this value to be included in the results.
* @param {integer} [startIndex=0] - The first child index to start the search from.
* @param {integer} [endIndex] - The last child index to search up until.
* @return {any} A random existing child of this Group.
*/
Phaser.Group.prototype.getAll = function (property, value, startIndex, endIndex) {

    if (startIndex === undefined) { startIndex = 0; }
    if (endIndex === undefined) { endIndex = this.children.length; }

    var output = [];

    for (var i = startIndex; i < endIndex; i++)
    {
        var child = this.children[i];

        if (property && child[property] === value)
        {
            output.push(child);
        }
    }

    return output;

};

/**
* Removes the given child from this group.
*
* This will dispatch an `onRemovedFromGroup` event from the child (if it has one), and optionally destroy the child.
*
* If the group cursor was referring to the removed child it is updated to refer to the next child.
*
* @method Phaser.Group#remove
* @param {any} child - The child to remove.
* @param {boolean} [destroy=false] - If true `destroy` will be invoked on the removed child.
* @param {boolean} [silent=false] - If true the the child will not dispatch the `onRemovedFromGroup` event.
* @return {boolean} true if the child was removed from this group, otherwise false.
*/
Phaser.Group.prototype.remove = function (child, destroy, silent) {

    if (destroy === undefined) { destroy = false; }
    if (silent === undefined) { silent = false; }

    if (this.children.length === 0 || this.children.indexOf(child) === -1)
    {
        return false;
    }

    if (!silent && child.events && !child.destroyPhase)
    {
        child.events.onRemovedFromGroup$dispatch(child, this);
    }

    var removed = this.removeChild(child);

    this.removeFromHash(child);

    this.updateZ();

    if (this.cursor === child)
    {
        this.next();
    }

    if (destroy && removed)
    {
        removed.destroy(true);
    }

    return true;

};

/**
* Moves all children from this Group to the Group given.
*
* @method Phaser.Group#moveAll
* @param {Phaser.Group} group - The new Group to which the children will be moved to.
* @param {boolean} [silent=false] - If true the children will not dispatch the `onAddedToGroup` event for the new Group.
* @return {Phaser.Group} The Group to which all the children were moved.
*/
Phaser.Group.prototype.moveAll = function (group, silent) {

    if (silent === undefined) { silent = false; }

    if (this.children.length > 0 && group instanceof Phaser.Group)
    {
        do
        {
            group.add(this.children[0], silent);
        }
        while (this.children.length > 0);

        this.hash = [];

        this.cursor = null;
    }

    return group;

};

/**
* Removes all children from this Group, but does not remove the group from its parent.
*
* The children can be optionally destroyed as they are removed.
*
* You can also optionally also destroy the BaseTexture the Child is using. Be careful if you've
* more than one Game Object sharing the same BaseTexture.
*
* @method Phaser.Group#removeAll
* @param {boolean} [destroy=false] - If true `destroy` will be invoked on each removed child.
* @param {boolean} [silent=false] - If true the children will not dispatch their `onRemovedFromGroup` events.
* @param {boolean} [destroyTexture=false] - If true, and if the `destroy` argument is also true, the BaseTexture belonging to the Child is also destroyed. Note that if another Game Object is sharing the same BaseTexture it will invalidate it.
*/
Phaser.Group.prototype.removeAll = function (destroy, silent, destroyTexture) {

    if (destroy === undefined) { destroy = false; }
    if (silent === undefined) { silent = false; }
    if (destroyTexture === undefined) { destroyTexture = false; }

    if (this.children.length === 0)
    {
        return;
    }

    do
    {
        if (!silent && this.children[0].events)
        {
            this.children[0].events.onRemovedFromGroup$dispatch(this.children[0], this);
        }

        var removed = this.removeChild(this.children[0]);

        this.removeFromHash(removed);

        if (destroy && removed)
        {
            removed.destroy(true, destroyTexture);
        }
    }
    while (this.children.length > 0);

    this.hash = [];

    this.cursor = null;

};

/**
* Removes all children from this group whose index falls beteen the given startIndex and endIndex values.
*
* @method Phaser.Group#removeBetween
* @param {integer} startIndex - The index to start removing children from.
* @param {integer} [endIndex] - The index to stop removing children at. Must be higher than startIndex. If undefined this method will remove all children between startIndex and the end of the group.
* @param {boolean} [destroy=false] - If true `destroy` will be invoked on each removed child.
* @param {boolean} [silent=false] - If true the children will not dispatch their `onRemovedFromGroup` events.
*/
Phaser.Group.prototype.removeBetween = function (startIndex, endIndex, destroy, silent) {

    if (endIndex === undefined) { endIndex = this.children.length - 1; }
    if (destroy === undefined) { destroy = false; }
    if (silent === undefined) { silent = false; }

    if (this.children.length === 0)
    {
        return;
    }

    if (startIndex > endIndex || startIndex < 0 || endIndex > this.children.length)
    {
        return false;
    }

    var i = endIndex;

    while (i >= startIndex)
    {
        if (!silent && this.children[i].events)
        {
            this.children[i].events.onRemovedFromGroup$dispatch(this.children[i], this);
        }

        var removed = this.removeChild(this.children[i]);

        this.removeFromHash(removed);

        if (destroy && removed)
        {
            removed.destroy(true);
        }

        if (this.cursor === this.children[i])
        {
            this.cursor = null;
        }

        i--;
    }

    this.updateZ();

};

/**
* Destroys this group.
*
* Removes all children, then removes this group from its parent and nulls references.
*
* @method Phaser.Group#destroy
* @param {boolean} [destroyChildren=true] - If true `destroy` will be invoked on each removed child.
* @param {boolean} [soft=false] - A 'soft destroy' (set to true) doesn't remove this group from its parent or null the game reference. Set to false and it does.
*/
Phaser.Group.prototype.destroy = function (destroyChildren, soft) {

    if (this.game === null || this.ignoreDestroy) { return; }

    if (destroyChildren === undefined) { destroyChildren = true; }
    if (soft === undefined) { soft = false; }

    this.onDestroy.dispatch(this, destroyChildren, soft);

    this.removeAll(destroyChildren);

    this.cursor = null;
    this.filters = null;
    this.pendingDestroy = false;

    if (!soft)
    {
        if (this.parent)
        {
            this.parent.removeChild(this);
        }

        this.game = null;
        this.exists = false;
    }

};

/**
* Total number of existing children in the group.
*
* @name Phaser.Group#total
* @property {integer} total
* @readonly
*/
Object.defineProperty(Phaser.Group.prototype, "total", {

    get: function () {

        return this.iterate('exists', true, Phaser.Group.RETURN_TOTAL);

    }

});

/**
* Total number of children in this group, regardless of exists/alive status.
*
* @name Phaser.Group#length
* @property {integer} length
* @readonly
*/
Object.defineProperty(Phaser.Group.prototype, "length", {

    get: function () {

        return this.children.length;

    }

});

/**
* The angle of rotation of the group container, in degrees.
*
* This adjusts the group itself by modifying its local rotation transform.
*
* This has no impact on the rotation/angle properties of the children, but it will update their worldTransform
* and on-screen orientation and position.
*
* @name Phaser.Group#angle
* @property {number} angle
*/
Object.defineProperty(Phaser.Group.prototype, "angle", {

    get: function() {
        return Phaser.Math.radToDeg(this.rotation);
    },

    set: function(value) {
        this.rotation = Phaser.Math.degToRad(value);
    }

});

/**
* The center x coordinate of this Group.
*
* It is derived by calling `getBounds`, calculating the Groups dimensions based on its
* visible children.
*
* @name Phaser.Group#centerX
* @property {number} centerX
*/
Object.defineProperty(Phaser.Group.prototype, "centerX", {

    get: function () {

        return this.getBounds(this.parent).centerX;

    },

    set: function (value) {

        var r = this.getBounds(this.parent);
        var offset = this.x - r.x;

        this.x = (value + offset) - r.halfWidth;

    }

});

/**
* The center y coordinate of this Group.
*
* It is derived by calling `getBounds`, calculating the Groups dimensions based on its
* visible children.
*
* @name Phaser.Group#centerY
* @property {number} centerY
*/
Object.defineProperty(Phaser.Group.prototype, "centerY", {

    get: function () {

        return this.getBounds(this.parent).centerY;

    },

    set: function (value) {

        var r = this.getBounds(this.parent);
        var offset = this.y - r.y;

        this.y = (value + offset) - r.halfHeight;

    }

});

/**
* The left coordinate of this Group.
*
* It is derived by calling `getBounds`, calculating the Groups dimensions based on its
* visible children.
*
* @name Phaser.Group#left
* @property {number} left
*/
Object.defineProperty(Phaser.Group.prototype, "left", {

    get: function () {

        return this.getBounds(this.parent).left;

    },

    set: function (value) {

        var r = this.getBounds(this.parent);
        var offset = this.x - r.x;

        this.x = value + offset;

    }

});

/**
* The right coordinate of this Group.
*
* It is derived by calling `getBounds`, calculating the Groups dimensions based on its
* visible children.
*
* @name Phaser.Group#right
* @property {number} right
*/
Object.defineProperty(Phaser.Group.prototype, "right", {

    get: function () {

        return this.getBounds(this.parent).right;

    },

    set: function (value) {

        var r = this.getBounds(this.parent);
        var offset = this.x - r.x;

        this.x = (value + offset) - r.width;

    }

});

/**
* The top coordinate of this Group.
*
* It is derived by calling `getBounds`, calculating the Groups dimensions based on its
* visible children.
*
* @name Phaser.Group#top
* @property {number} top
*/
Object.defineProperty(Phaser.Group.prototype, "top", {

    get: function () {

        return this.getBounds(this.parent).top;

    },

    set: function (value) {

        var r = this.getBounds(this.parent);
        var offset = this.y - r.y;

        this.y = (value + offset);

    }

});

/**
* The bottom coordinate of this Group.
*
* It is derived by calling `getBounds`, calculating the Groups dimensions based on its
* visible children.
*
* @name Phaser.Group#bottom
* @property {number} bottom
*/
Object.defineProperty(Phaser.Group.prototype, "bottom", {

    get: function () {

        return this.getBounds(this.parent).bottom;

    },

    set: function (value) {

        var r = this.getBounds(this.parent);
        var offset = this.y - r.y;

        this.y = (value + offset) - r.height;

    }

});

/**
* Aligns this Group within another Game Object, or Rectangle, known as the
* 'container', to one of 9 possible positions.
*
* The container must be a Game Object, or Phaser.Rectangle object. This can include properties
* such as `World.bounds` or `Camera.view`, for aligning Groups within the world
* and camera bounds. Or it can include other Sprites, Images, Text objects, BitmapText,
* TileSprites or Buttons.
*
* Please note that aligning a Group to another Game Object does **not** make it a child of
* the container. It simply modifies its position coordinates so it aligns with it.
*
* The position constants you can use are:
*
* `Phaser.TOP_LEFT`, `Phaser.TOP_CENTER`, `Phaser.TOP_RIGHT`, `Phaser.LEFT_CENTER`,
* `Phaser.CENTER`, `Phaser.RIGHT_CENTER`, `Phaser.BOTTOM_LEFT`,
* `Phaser.BOTTOM_CENTER` and `Phaser.BOTTOM_RIGHT`.
*
* Groups are placed in such a way that their _bounds_ align with the
* container, taking into consideration rotation and scale of its children.
* This allows you to neatly align Groups, irrespective of their position value.
*
* The optional `offsetX` and `offsetY` arguments allow you to apply extra spacing to the final
* aligned position of the Group. For example:
*
* `group.alignIn(background, Phaser.BOTTOM_RIGHT, -20, -20)`
*
* Would align the `group` to the bottom-right, but moved 20 pixels in from the corner.
* Think of the offsets as applying an adjustment to the containers bounds before the alignment takes place.
* So providing a negative offset will 'shrink' the container bounds by that amount, and providing a positive
* one expands it.
*
* @method Phaser.Group#alignIn
* @param {Phaser.Rectangle|Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapText|Phaser.Button|Phaser.Graphics|Phaser.TileSprite} container - The Game Object or Rectangle with which to align this Group to. Can also include properties such as `World.bounds` or `Camera.view`.
* @param {integer} [position] - The position constant. One of `Phaser.TOP_LEFT` (default), `Phaser.TOP_CENTER`, `Phaser.TOP_RIGHT`, `Phaser.LEFT_CENTER`, `Phaser.CENTER`, `Phaser.RIGHT_CENTER`, `Phaser.BOTTOM_LEFT`, `Phaser.BOTTOM_CENTER` or `Phaser.BOTTOM_RIGHT`.
* @param {integer} [offsetX=0] - A horizontal adjustment of the Containers bounds, applied to the aligned position of the Game Object. Use a negative value to shrink the bounds, positive to increase it.
* @param {integer} [offsetY=0] - A vertical adjustment of the Containers bounds, applied to the aligned position of the Game Object. Use a negative value to shrink the bounds, positive to increase it.
* @return {Phaser.Group} This Group.
*/

//  This function is set at the bottom of src/gameobjects/components/Bounds.js

/**
* Aligns this Group to the side of another Game Object, or Rectangle, known as the
* 'parent', in one of 11 possible positions.
*
* The parent must be a Game Object, or Phaser.Rectangle object. This can include properties
* such as `World.bounds` or `Camera.view`, for aligning Groups within the world
* and camera bounds. Or it can include other Sprites, Images, Text objects, BitmapText,
* TileSprites or Buttons.
*
* Please note that aligning a Group to another Game Object does **not** make it a child of
* the parent. It simply modifies its position coordinates so it aligns with it.
*
* The position constants you can use are:
*
* `Phaser.TOP_LEFT` (default), `Phaser.TOP_CENTER`, `Phaser.TOP_RIGHT`, `Phaser.LEFT_TOP`,
* `Phaser.LEFT_CENTER`, `Phaser.LEFT_BOTTOM`, `Phaser.RIGHT_TOP`, `Phaser.RIGHT_CENTER`,
* `Phaser.RIGHT_BOTTOM`, `Phaser.BOTTOM_LEFT`, `Phaser.BOTTOM_CENTER`
* and `Phaser.BOTTOM_RIGHT`.
*
* Groups are placed in such a way that their _bounds_ align with the
* parent, taking into consideration rotation and scale of the children.
* This allows you to neatly align Groups, irrespective of their position value.
*
* The optional `offsetX` and `offsetY` arguments allow you to apply extra spacing to the final
* aligned position of the Group. For example:
*
* `group.alignTo(background, Phaser.BOTTOM_RIGHT, -20, -20)`
*
* Would align the `group` to the bottom-right, but moved 20 pixels in from the corner.
* Think of the offsets as applying an adjustment to the parents bounds before the alignment takes place.
* So providing a negative offset will 'shrink' the parent bounds by that amount, and providing a positive
* one expands it.
*
* @method Phaser.Group#alignTo
* @param {Phaser.Rectangle|Phaser.Sprite|Phaser.Image|Phaser.Text|Phaser.BitmapText|Phaser.Button|Phaser.Graphics|Phaser.TileSprite} parent - The Game Object or Rectangle with which to align this Group to. Can also include properties such as `World.bounds` or `Camera.view`.
* @param {integer} [position] - The position constant. One of `Phaser.TOP_LEFT`, `Phaser.TOP_CENTER`, `Phaser.TOP_RIGHT`, `Phaser.LEFT_TOP`, `Phaser.LEFT_CENTER`, `Phaser.LEFT_BOTTOM`, `Phaser.RIGHT_TOP`, `Phaser.RIGHT_CENTER`, `Phaser.RIGHT_BOTTOM`, `Phaser.BOTTOM_LEFT`, `Phaser.BOTTOM_CENTER` or `Phaser.BOTTOM_RIGHT`.
* @param {integer} [offsetX=0] - A horizontal adjustment of the Containers bounds, applied to the aligned position of the Game Object. Use a negative value to shrink the bounds, positive to increase it.
* @param {integer} [offsetY=0] - A vertical adjustment of the Containers bounds, applied to the aligned position of the Game Object. Use a negative value to shrink the bounds, positive to increase it.
* @return {Phaser.Group} This Group.
*/

//  This function is set at the bottom of src/gameobjects/components/Bounds.js

/**
* A display object is any object that can be rendered in the Phaser/pixi.js scene graph.
*
* This includes {@link Phaser.Group} (groups are display objects!),
* {@link Phaser.Sprite}, {@link Phaser.Button}, {@link Phaser.Text}
* as well as {@link PIXI.DisplayObject} and all derived types.
*
* @typedef {object} DisplayObject
*/
// Documentation stub for linking.

/**
* The x coordinate of the group container.
*
* You can adjust the group container itself by modifying its coordinates.
* This will have no impact on the x/y coordinates of its children, but it will update their worldTransform and on-screen position.
* @name Phaser.Group#x
* @property {number} x
*/

/**
* The y coordinate of the group container.
*
* You can adjust the group container itself by modifying its coordinates.
* This will have no impact on the x/y coordinates of its children, but it will update their worldTransform and on-screen position.
* @name Phaser.Group#y
* @property {number} y
*/

/**
* The angle of rotation of the group container, in radians.
*
* This will adjust the group container itself by modifying its rotation.
* This will have no impact on the rotation value of its children, but it will update their worldTransform and on-screen position.
* @name Phaser.Group#rotation
* @property {number} rotation
*/

/**
* The visible state of the group. Non-visible Groups and all of their children are not rendered.
*
* @name Phaser.Group#visible
* @property {boolean} visible
*/

/**
* The alpha value of the group container.
*
* @name Phaser.Group#alpha
* @property {number} alpha
*/

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* "This world is but a canvas to our imagination." - Henry David Thoreau
*
* A game has only one world. The world is an abstract place in which all game objects live. It is not bound
* by stage limits and can be any size. You look into the world via cameras. All game objects live within
* the world at world-based coordinates. By default a world is created the same size as your Stage.
*
* @class Phaser.World
* @extends Phaser.Group
* @constructor
* @param {Phaser.Game} game - Reference to the current game instance.
*/
Phaser.World = function (game) {

    Phaser.Group.call(this, game, null, '__world', false);

    /**
    * The World has no fixed size, but it does have a bounds outside of which objects are no longer considered as being "in world" and you should use this to clean-up the display list and purge dead objects.
    * By default we set the Bounds to be from 0,0 to Game.width,Game.height. I.e. it will match the size given to the game constructor with 0,0 representing the top-left of the display.
    * However 0,0 is actually the center of the world, and if you rotate or scale the world all of that will happen from 0,0.
    * So if you want to make a game in which the world itself will rotate you should adjust the bounds so that 0,0 is the center point, i.e. set them to -1000,-1000,2000,2000 for a 2000x2000 sized world centered around 0,0.
    * @property {Phaser.Rectangle} bounds - Bound of this world that objects can not escape from.
    */
    this.bounds = new Phaser.Rectangle(0, 0, game.width, game.height);

    /**
    * @property {Phaser.Camera} camera - Camera instance.
    */
    this.camera = null;

    /**
    * @property {boolean} _definedSize - True if the World has been given a specifically defined size (i.e. from a Tilemap or direct in code) or false if it's just matched to the Game dimensions.
    * @readonly
    */
    this._definedSize = false;

    /**
    * @property {number} width - The defined width of the World. Sometimes the bounds needs to grow larger than this (if you resize the game) but this retains the original requested dimension.
    */
    this._width = game.width;

    /**
    * @property {number} height - The defined height of the World. Sometimes the bounds needs to grow larger than this (if you resize the game) but this retains the original requested dimension.
    */
    this._height = game.height;

    this.game.state.onStateChange.add(this.stateChange, this);

};

Phaser.World.prototype = Object.create(Phaser.Group.prototype);
Phaser.World.prototype.constructor = Phaser.World;

/**
* Initialises the game world.
*
* @method Phaser.World#boot
* @protected
*/
Phaser.World.prototype.boot = function () {

    this.camera = new Phaser.Camera(this.game, 0, 0, 0, this.game.width, this.game.height);

    this.game.stage.addChild(this);

    this.camera.boot();

};

/**
* Called whenever the State changes or resets.
* 
* It resets the world.x and world.y coordinates back to zero,
* then resets the Camera.
*
* @method Phaser.World#stateChange
* @protected
*/
Phaser.World.prototype.stateChange = function () {

    this.x = 0;
    this.y = 0;

    this.camera.reset();

};

/**
* Updates the size of this world and sets World.x/y to the given values
* The Camera bounds and Physics bounds (if set) are also updated to match the new World bounds.
*
* @method Phaser.World#setBounds
* @param {number} x - Top left most corner of the world.
* @param {number} y - Top left most corner of the world.
* @param {number} width - New width of the game world in pixels.
* @param {number} height - New height of the game world in pixels.
*/
Phaser.World.prototype.setBounds = function (x, y, width, height) {

    this._definedSize = true;
    this._width = width;
    this._height = height;

    this.bounds.setTo(x, y, width, height);

    this.x = x;
    this.y = y;

    if (this.camera.bounds)
    {
        //  The Camera can never be smaller than the game size
        this.camera.bounds.setTo(x, y, Math.max(width, this.game.width), Math.max(height, this.game.height));
    }

    this.game.physics.setBoundsToWorld();

};

/**
* Updates the size of this world. Note that this doesn't modify the world x/y coordinates, just the width and height.
*
* @method Phaser.World#resize
* @param {number} width - New width of the game world in pixels.
* @param {number} height - New height of the game world in pixels.
*/
Phaser.World.prototype.resize = function (width, height) {

    //  Don't ever scale the World bounds lower than the original requested dimensions if it's a defined world size

    if (this._definedSize)
    {
        if (width < this._width)
        {
            width = this._width;
        }

        if (height < this._height)
        {
            height = this._height;
        }
    }

    this.bounds.width = width;
    this.bounds.height = height;

    this.game.camera.setBoundsToWorld();

    this.game.physics.setBoundsToWorld();

};

/**
* Destroyer of worlds.
*
* @method Phaser.World#shutdown
*/
Phaser.World.prototype.shutdown = function () {

    //  World is a Group, so run a soft destruction on this and all children.
    this.destroy(true, true);

};

/**
* This will take the given game object and check if its x/y coordinates fall outside of the world bounds.
* If they do it will reposition the object to the opposite side of the world, creating a wrap-around effect.
* If sprite has a P2 body then the body (sprite.body) should be passed as first parameter to the function.
*
* Please understand there are limitations to this method. For example if you have scaled the World
* then objects won't always be re-positioned correctly, and you'll need to employ your own wrapping function.
*
* @method Phaser.World#wrap
* @param {Phaser.Sprite|Phaser.Image|Phaser.TileSprite|Phaser.Text} sprite - The object you wish to wrap around the world bounds.
* @param {number} [padding=0] - Extra padding added equally to the sprite.x and y coordinates before checking if within the world bounds. Ignored if useBounds is true.
* @param {boolean} [useBounds=false] - If useBounds is false wrap checks the object.x/y coordinates. If true it does a more accurate bounds check, which is more expensive.
* @param {boolean} [horizontal=true] - If horizontal is false, wrap will not wrap the object.x coordinates horizontally.
* @param {boolean} [vertical=true] - If vertical is false, wrap will not wrap the object.y coordinates vertically.
*/
Phaser.World.prototype.wrap = function (sprite, padding, useBounds, horizontal, vertical) {

    if (padding === undefined) { padding = 0; }
    if (useBounds === undefined) { useBounds = false; }
    if (horizontal === undefined) { horizontal = true; }
    if (vertical === undefined) { vertical = true; }

    if (!useBounds)
    {
        if (horizontal && sprite.x + padding < this.bounds.x)
        {
            sprite.x = this.bounds.right + padding;
        }
        else if (horizontal && sprite.x - padding > this.bounds.right)
        {
            sprite.x = this.bounds.left - padding;
        }

        if (vertical && sprite.y + padding < this.bounds.top)
        {
            sprite.y = this.bounds.bottom + padding;
        }
        else if (vertical && sprite.y - padding > this.bounds.bottom)
        {
            sprite.y = this.bounds.top - padding;
        }
    }
    else
    {
        sprite.getBounds();

        if (horizontal)
        {
            if ((sprite.x + sprite._currentBounds.width) < this.bounds.x)
            {
                sprite.x = this.bounds.right;
            }
            else if (sprite.x > this.bounds.right)
            {
                sprite.x = this.bounds.left;
            }
        }

        if (vertical)
        {
            if ((sprite.y + sprite._currentBounds.height) < this.bounds.top)
            {
                sprite.y = this.bounds.bottom;
            }
            else if (sprite.y > this.bounds.bottom)
            {
                sprite.y = this.bounds.top;
            }
        }
    }

};

/**
* @name Phaser.World#width
* @property {number} width - Gets or sets the current width of the game world. The world can never be smaller than the game (canvas) dimensions.
*/
Object.defineProperty(Phaser.World.prototype, "width", {

    get: function () {
        return this.bounds.width;
    },

    set: function (value) {

        if (value < this.game.width)
        {
            value = this.game.width;
        }

        this.bounds.width = value;
        this._width = value;
        this._definedSize = true;

    }

});

/**
* @name Phaser.World#height
* @property {number} height - Gets or sets the current height of the game world. The world can never be smaller than the game (canvas) dimensions.
*/
Object.defineProperty(Phaser.World.prototype, "height", {

    get: function () {
        return this.bounds.height;
    },

    set: function (value) {

        if (value < this.game.height)
        {
            value = this.game.height;
        }

        this.bounds.height = value;
        this._height = value;
        this._definedSize = true;

    }

});

/**
* @name Phaser.World#centerX
* @property {number} centerX - Gets the X position corresponding to the center point of the world.
* @readonly
*/
Object.defineProperty(Phaser.World.prototype, "centerX", {

    get: function () {
        return this.bounds.halfWidth + this.bounds.x;
    }

});

/**
* @name Phaser.World#centerY
* @property {number} centerY - Gets the Y position corresponding to the center point of the world.
* @readonly
*/
Object.defineProperty(Phaser.World.prototype, "centerY", {

    get: function () {
        return this.bounds.halfHeight + this.bounds.y;
    }

});

/**
* @name Phaser.World#randomX
* @property {number} randomX - Gets a random integer which is lesser than or equal to the current width of the game world.
* @readonly
*/
Object.defineProperty(Phaser.World.prototype, "randomX", {

    get: function () {

        if (this.bounds.x < 0)
        {
            return this.game.rnd.between(this.bounds.x, (this.bounds.width - Math.abs(this.bounds.x)));
        }
        else
        {
            return this.game.rnd.between(this.bounds.x, this.bounds.width);
        }

    }

});

/**
* @name Phaser.World#randomY
* @property {number} randomY - Gets a random integer which is lesser than or equal to the current height of the game world.
* @readonly
*/
Object.defineProperty(Phaser.World.prototype, "randomY", {

    get: function () {

        if (this.bounds.y < 0)
        {
            return this.game.rnd.between(this.bounds.y, (this.bounds.height - Math.abs(this.bounds.y)));
        }
        else
        {
            return this.game.rnd.between(this.bounds.y, this.bounds.height);
        }

    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* This is where the magic happens. The Game object is the heart of your game,
* providing quick access to common functions and handling the boot process.
* 
* "Hell, there are no rules here - we're trying to accomplish something."
*                                                       Thomas A. Edison
*
* @class Phaser.Game
* @constructor
* @param {number|string} [width=800] - The width of your game in game pixels. If given as a string the value must be between 0 and 100 and will be used as the percentage width of the parent container, or the browser window if no parent is given.
* @param {number|string} [height=600] - The height of your game in game pixels. If given as a string the value must be between 0 and 100 and will be used as the percentage height of the parent container, or the browser window if no parent is given.
* @param {number} [renderer=Phaser.AUTO] - Which renderer to use: Phaser.AUTO will auto-detect, Phaser.WEBGL, Phaser.CANVAS or Phaser.HEADLESS (no rendering at all).
* @param {string|HTMLElement} [parent=''] - The DOM element into which this games canvas will be injected. Either a DOM ID (string) or the element itself.
* @param {object} [state=null] - The default state object. A object consisting of Phaser.State functions (preload, create, update, render) or null.
* @param {boolean} [transparent=false] - Use a transparent canvas background or not.
* @param {boolean} [antialias=true] - Draw all image textures anti-aliased or not. The default is for smooth textures, but disable if your game features pixel art.
* @param {object} [physicsConfig=null] - A physics configuration object to pass to the Physics world on creation.
*/
Phaser.Game = function (width, height, renderer, parent, state, transparent, antialias, physicsConfig) {

    /**
    * @property {number} id - Phaser Game ID (for when Pixi supports multiple instances).
    * @readonly
    */
    this.id = Phaser.GAMES.push(this) - 1;

    /**
    * @property {object} config - The Phaser.Game configuration object.
    */
    this.config = null;

    /**
    * @property {object} physicsConfig - The Phaser.Physics.World configuration object.
    */
    this.physicsConfig = physicsConfig;

    /**
    * @property {string|HTMLElement} parent - The Games DOM parent.
    * @default
    */
    this.parent = '';

    /**
    * The current Game Width in pixels.
    *
    * _Do not modify this property directly:_ use {@link Phaser.ScaleManager#setGameSize} - eg. `game.scale.setGameSize(width, height)` - instead.
    *
    * @property {integer} width
    * @readonly
    * @default
    */
    this.width = 800;

    /**
    * The current Game Height in pixels.
    *
    * _Do not modify this property directly:_ use {@link Phaser.ScaleManager#setGameSize} - eg. `game.scale.setGameSize(width, height)` - instead.
    *
    * @property {integer} height
    * @readonly
    * @default
    */
    this.height = 600;

    /**
    * The resolution of your game. This value is read only, but can be changed at start time it via a game configuration object.
    *
    * @property {integer} resolution
    * @readonly
    * @default
    */
    this.resolution = 1;

    /**
    * @property {integer} _width - Private internal var.
    * @private
    */
    this._width = 800;

    /**
    * @property {integer} _height - Private internal var.
    * @private
    */
    this._height = 600;

    /**
    * @property {boolean} transparent - Use a transparent canvas background or not.
    * @default
    */
    this.transparent = false;

    /**
    * @property {boolean} antialias - Anti-alias graphics. By default scaled images are smoothed in Canvas and WebGL, set anti-alias to false to disable this globally.
    * @default
    */
    this.antialias = true;

    /**
    * @property {boolean} preserveDrawingBuffer - The value of the preserveDrawingBuffer flag affects whether or not the contents of the stencil buffer is retained after rendering.
    * @default
    */
    this.preserveDrawingBuffer = false;

    /**
    * Clear the Canvas each frame before rendering the display list.
    * You can set this to `false` to gain some performance if your game always contains a background that completely fills the display.
    * @property {boolean} clearBeforeRender
    * @default
    */
    this.clearBeforeRender = true;

    /**
    * @property {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer - The Pixi Renderer.
    * @protected
    */
    this.renderer = null;

    /**
    * @property {number} renderType - The Renderer this game will use. Either Phaser.AUTO, Phaser.CANVAS, Phaser.WEBGL, or Phaser.HEADLESS.
    * @readonly
    */
    this.renderType = Phaser.AUTO;

    /**
    * @property {Phaser.StateManager} state - The StateManager.
    */
    this.state = null;

    /**
    * @property {boolean} isBooted - Whether the game engine is booted, aka available.
    * @readonly
    */
    this.isBooted = false;

    /**
    * @property {boolean} isRunning - Is game running or paused?
    * @readonly
    */
    this.isRunning = false;

    /**
    * @property {Phaser.RequestAnimationFrame} raf - Automatically handles the core game loop via requestAnimationFrame or setTimeout
    * @protected
    */
    this.raf = null;

    /**
    * @property {Phaser.GameObjectFactory} add - Reference to the Phaser.GameObjectFactory.
    */
    this.add = null;

    /**
    * @property {Phaser.GameObjectCreator} make - Reference to the GameObject Creator.
    */
    this.make = null;

    /**
    * @property {Phaser.Cache} cache - Reference to the assets cache.
    */
    this.cache = null;

    /**
    * @property {Phaser.Input} input - Reference to the input manager
    */
    this.input = null;

    /**
    * @property {Phaser.Loader} load - Reference to the assets loader.
    */
    this.load = null;

    /**
    * @property {Phaser.Math} math - Reference to the math helper.
    */
    this.math = null;

    /**
    * @property {Phaser.Net} net - Reference to the network class.
    */
    this.net = null;

    /**
    * @property {Phaser.ScaleManager} scale - The game scale manager.
    */
    this.scale = null;

    /**
    * @property {Phaser.SoundManager} sound - Reference to the sound manager.
    */
    this.sound = null;

    /**
    * @property {Phaser.Stage} stage - Reference to the stage.
    */
    this.stage = null;

    /**
    * @property {Phaser.Time} time - Reference to the core game clock.
    */
    this.time = null;

    /**
    * @property {Phaser.TweenManager} tweens - Reference to the tween manager.
    */
    this.tweens = null;

    /**
    * @property {Phaser.World} world - Reference to the world.
    */
    this.world = null;

    /**
    * @property {Phaser.Physics} physics - Reference to the physics manager.
    */
    this.physics = null;
    
    /**
    * @property {Phaser.PluginManager} plugins - Reference to the plugin manager.
    */
    this.plugins = null;

    /**
    * @property {Phaser.RandomDataGenerator} rnd - Instance of repeatable random data generator helper.
    */
    this.rnd = null;

    /**
    * @property {Phaser.Device} device - Contains device information and capabilities.
    */
    this.device = Phaser.Device;

    /**
    * @property {Phaser.Camera} camera - A handy reference to world.camera.
    */
    this.camera = null;

    /**
    * @property {HTMLCanvasElement} canvas - A handy reference to renderer.view, the canvas that the game is being rendered in to.
    */
    this.canvas = null;

    /**
    * @property {CanvasRenderingContext2D} context - A handy reference to renderer.context (only set for CANVAS games, not WebGL)
    */
    this.context = null;

    /**
    * @property {Phaser.Utils.Debug} debug - A set of useful debug utilities.
    */
    this.debug = null;

    /**
    * @property {Phaser.Particles} particles - The Particle Manager.
    */
    this.particles = null;

    /**
    * @property {Phaser.Create} create - The Asset Generator.
    */
    this.create = null;

    /**
    * If `false` Phaser will automatically render the display list every update. If `true` the render loop will be skipped.
    * You can toggle this value at run-time to gain exact control over when Phaser renders. This can be useful in certain types of game or application.
    * Please note that if you don't render the display list then none of the game object transforms will be updated, so use this value carefully.
    * @property {boolean} lockRender
    * @default
    */
    this.lockRender = false;

    /**
    * @property {boolean} stepping - Enable core loop stepping with Game.enableStep().
    * @default
    * @readonly
    */
    this.stepping = false;

    /**
    * @property {boolean} pendingStep - An internal property used by enableStep, but also useful to query from your own game objects.
    * @default
    * @readonly
    */
    this.pendingStep = false;

    /**
    * @property {number} stepCount - When stepping is enabled this contains the current step cycle.
    * @default
    * @readonly
    */
    this.stepCount = 0;

    /**
    * @property {Phaser.Signal} onPause - This event is fired when the game pauses.
    */
    this.onPause = null;

    /**
    * @property {Phaser.Signal} onResume - This event is fired when the game resumes from a paused state.
    */
    this.onResume = null;

    /**
    * @property {Phaser.Signal} onBlur - This event is fired when the game no longer has focus (typically on page hide).
    */
    this.onBlur = null;

    /**
    * @property {Phaser.Signal} onFocus - This event is fired when the game has focus (typically on page show).
    */
    this.onFocus = null;

    /**
    * @property {boolean} _paused - Is game paused?
    * @private
    */
    this._paused = false;

    /**
    * @property {boolean} _codePaused - Was the game paused via code or a visibility change?
    * @private
    */
    this._codePaused = false;

    /**
    * The ID of the current/last logic update applied this render frame, starting from 0.
    * The first update is `currentUpdateID === 0` and the last update is `currentUpdateID === updatesThisFrame.`
    * @property {integer} currentUpdateID
    * @protected
    */
    this.currentUpdateID = 0;

    /**
    * Number of logic updates expected to occur this render frame; will be 1 unless there are catch-ups required (and allowed).
    * @property {integer} updatesThisFrame
    * @protected
    */
    this.updatesThisFrame = 1;

    /**
    * @property {number} _deltaTime - Accumulate elapsed time until a logic update is due.
    * @private
    */
    this._deltaTime = 0;

    /**
    * @property {number} _lastCount - Remember how many 'catch-up' iterations were used on the logicUpdate last frame.
    * @private
    */
    this._lastCount = 0;

    /**
    * @property {number} _spiraling - If the 'catch-up' iterations are spiraling out of control, this counter is incremented.
    * @private
    */
    this._spiraling = 0;

    /**
    * @property {boolean} _kickstart - Force a logic update + render by default (always set on Boot and State swap)
    * @private
    */
    this._kickstart = true;

    /**
    * If the game is struggling to maintain the desired FPS, this signal will be dispatched.
    * The desired/chosen FPS should probably be closer to the {@link Phaser.Time#suggestedFps} value.
    * @property {Phaser.Signal} fpsProblemNotifier
    * @public
    */
    this.fpsProblemNotifier = new Phaser.Signal();

    /**
    * @property {boolean} forceSingleUpdate - Should the game loop force a logic update, regardless of the delta timer? Set to true if you know you need this. You can toggle it on the fly.
    */
    this.forceSingleUpdate = true;

    /**
    * @property {number} _nextNotification - The soonest game.time.time value that the next fpsProblemNotifier can be dispatched.
    * @private
    */
    this._nextFpsNotification = 0;

    //  Parse the configuration object (if any)
    if (arguments.length === 1 && typeof arguments[0] === 'object')
    {
        this.parseConfig(arguments[0]);
    }
    else
    {
        this.config = { enableDebug: true };

        if (typeof width !== 'undefined')
        {
            this._width = width;
        }

        if (typeof height !== 'undefined')
        {
            this._height = height;
        }

        if (typeof renderer !== 'undefined')
        {
            this.renderType = renderer;
        }

        if (typeof parent !== 'undefined')
        {
            this.parent = parent;
        }

        if (typeof transparent !== 'undefined')
        {
            this.transparent = transparent;
        }

        if (typeof antialias !== 'undefined')
        {
            this.antialias = antialias;
        }

        this.rnd = new Phaser.RandomDataGenerator([(Date.now() * Math.random()).toString()]);

        this.state = new Phaser.StateManager(this, state);
    }

    this.device.whenReady(this.boot, this);

    return this;

};

Phaser.Game.prototype = {

    /**
    * Parses a Game configuration object.
    *
    * @method Phaser.Game#parseConfig
    * @protected
    */
    parseConfig: function (config) {

        this.config = config;

        if (config['enableDebug'] === undefined)
        {
            this.config.enableDebug = true;
        }

        if (config['width'])
        {
            this._width = config['width'];
        }

        if (config['height'])
        {
            this._height = config['height'];
        }

        if (config['renderer'])
        {
            this.renderType = config['renderer'];
        }

        if (config['parent'])
        {
            this.parent = config['parent'];
        }

        if (config['transparent'] !== undefined)
        {
            this.transparent = config['transparent'];
        }

        if (config['antialias'] !== undefined)
        {
            this.antialias = config['antialias'];
        }

        if (config['resolution'])
        {
            this.resolution = config['resolution'];
        }

        if (config['preserveDrawingBuffer'] !== undefined)
        {
            this.preserveDrawingBuffer = config['preserveDrawingBuffer'];
        }

        if (config['physicsConfig'])
        {
            this.physicsConfig = config['physicsConfig'];
        }

        var seed = [(Date.now() * Math.random()).toString()];

        if (config['seed'])
        {
            seed = config['seed'];
        }

        this.rnd = new Phaser.RandomDataGenerator(seed);

        var state = null;

        if (config['state'])
        {
            state = config['state'];
        }

        this.state = new Phaser.StateManager(this, state);

    },

    /**
    * Initialize engine sub modules and start the game.
    *
    * @method Phaser.Game#boot
    * @protected
    */
    boot: function () {

        if (this.isBooted)
        {
            return;
        }

        this.onPause = new Phaser.Signal();
        this.onResume = new Phaser.Signal();
        this.onBlur = new Phaser.Signal();
        this.onFocus = new Phaser.Signal();

        this.isBooted = true;

        PIXI.game = this;

        this.math = Phaser.Math;

        this.scale = new Phaser.ScaleManager(this, this._width, this._height);
        this.stage = new Phaser.Stage(this);

        this.setUpRenderer();

        this.world = new Phaser.World(this);
        this.add = new Phaser.GameObjectFactory(this);
        this.make = new Phaser.GameObjectCreator(this);
        this.cache = new Phaser.Cache(this);
        this.load = new Phaser.Loader(this);
        this.time = new Phaser.Time(this);
        this.tweens = new Phaser.TweenManager(this);
        this.input = new Phaser.Input(this);
        this.sound = new Phaser.SoundManager(this);
        this.physics = new Phaser.Physics(this, this.physicsConfig);
        this.particles = new Phaser.Particles(this);
        this.create = new Phaser.Create(this);
        this.plugins = new Phaser.PluginManager(this);
        this.net = new Phaser.Net(this);

        this.time.boot();
        this.stage.boot();
        this.world.boot();
        this.scale.boot();
        this.input.boot();
        this.sound.boot();
        this.state.boot();

        if (this.config['enableDebug'])
        {
            this.debug = new Phaser.Utils.Debug(this);
            this.debug.boot();
        }
        else
        {
            this.debug = { preUpdate: function () {}, update: function () {}, reset: function () {} };
        }

        this.showDebugHeader();

        this.isRunning = true;

        if (this.config && this.config['forceSetTimeOut'])
        {
            this.raf = new Phaser.RequestAnimationFrame(this, this.config['forceSetTimeOut']);
        }
        else
        {
            this.raf = new Phaser.RequestAnimationFrame(this, false);
        }

        this._kickstart = true;

        if (window['focus'])
        {
            if (!window['PhaserGlobal'] || (window['PhaserGlobal'] && !window['PhaserGlobal'].stopFocus))
            {
                window.focus();
            }
        }

        this.raf.start();

    },

    /**
    * Displays a Phaser version debug header in the console.
    *
    * @method Phaser.Game#showDebugHeader
    * @protected
    */
    showDebugHeader: function () {

        if (window['PhaserGlobal'] && window['PhaserGlobal'].hideBanner)
        {
            return;
        }

        var v = Phaser.VERSION;
        var r = 'Canvas';
        var a = 'HTML Audio';
        var c = 1;

        if (this.renderType === Phaser.WEBGL)
        {
            r = 'WebGL';
            c++;
        }
        else if (this.renderType === Phaser.HEADLESS)
        {
            r = 'Headless';
        }

        if (this.device.webAudio)
        {
            a = 'WebAudio';
            c++;
        }

        if (this.device.chrome)
        {
            var args = [
                '%c %c %c Phaser v' + v + ' | Pixi.js | ' + r + ' | ' + a + '  %c %c ' + '%c http://phaser.io %c\u2665%c\u2665%c\u2665',
                'background: #fb8cb3',
                'background: #d44a52',
                'color: #ffffff; background: #871905;',
                'background: #d44a52',
                'background: #fb8cb3',
                'background: #ffffff'
            ];

            for (var i = 0; i < 3; i++)
            {
                if (i < c)
                {
                    args.push('color: #ff2424; background: #fff');
                }
                else
                {
                    args.push('color: #959595; background: #fff');
                }
            }

            console.log.apply(console, args);
        }
        else if (window['console'])
        {
            console.log('Phaser v' + v + ' | Pixi.js ' + PIXI.VERSION + ' | ' + r + ' | ' + a + ' | https://www.phaser-china.com/');
            // add some advertise
            console.log('亲爱的微信小游戏开发者，您好！');
            console.log('phaser-wx.js是由Phaser小站维护的一个兼容微信小游戏的Phaser版本，我们在原生 Phaser 2.6.2 的基础上进行了一些修改，让您更加方便地集成进微信小游戏。');
            console.log('更多信息，请关注Phaser小站，https://www.phaser-china.com/');
        }

    },

    /**
    * Checks if the device is capable of using the requested renderer and sets it up or an alternative if not.
    *
    * @method Phaser.Game#setUpRenderer
    * @protected
    */
    setUpRenderer: function () {

        if (this.config['canvas'])
        {
            this.canvas = this.config['canvas'];
        }
        else
        {
            this.canvas = Phaser.Canvas.create(this, this.width, this.height, this.config['canvasID'], true);
        }

        if (this.config['canvasStyle'])
        {
            this.canvas.style = this.config['canvasStyle'];
        }
        else
        {
            this.canvas.style['-webkit-full-screen'] = 'width: 100%; height: 100%';
        }

        if (this.renderType === Phaser.HEADLESS || this.renderType === Phaser.CANVAS || (this.renderType === Phaser.AUTO && !this.device.webGL))
        {
            // always true for wxgame
            if (this.device.canvas = true)
            {
                //  They requested Canvas and their browser supports it
                this.renderType = Phaser.CANVAS;

                this.renderer = new PIXI.CanvasRenderer(this);

                this.context = this.renderer.context;
            }
            else
            {
                throw new Error('Phaser.Game - Cannot create Canvas or WebGL context, aborting.');
            }
        }
        else
        {
            //  They requested WebGL and their browser supports it
            this.renderType = Phaser.WEBGL;

            this.renderer = new PIXI.WebGLRenderer(this);

            this.context = null;

            this.canvas.addEventListener('webglcontextlost', this.contextLost.bind(this), false);
            this.canvas.addEventListener('webglcontextrestored', this.contextRestored.bind(this), false);
        }

        if (this.device.cocoonJS)
        {
            this.canvas.screencanvas = (this.renderType === Phaser.CANVAS) ? true : false;
        }

        if (this.renderType !== Phaser.HEADLESS)
        {
            this.stage.smoothed = this.antialias;
            
            Phaser.Canvas.addToDOM(this.canvas, this.parent, false);
            Phaser.Canvas.setTouchAction(this.canvas);
        }

    },

    /**
    * Handles WebGL context loss.
    *
    * @method Phaser.Game#contextLost
    * @private
    * @param {Event} event - The webglcontextlost event.
    */
    contextLost: function (event) {

        event.preventDefault();

        this.renderer.contextLost = true;

    },

    /**
    * Handles WebGL context restoration.
    *
    * @method Phaser.Game#contextRestored
    * @private
    */
    contextRestored: function () {

        this.renderer.initContext();

        this.cache.clearGLTextures();

        this.renderer.contextLost = false;

    },

    /**
    * The core game loop.
    *
    * @method Phaser.Game#update
    * @protected
    * @param {number} time - The current time as provided by RequestAnimationFrame.
    */
    update: function (time) {

        this.time.update(time);

        if (this._kickstart)
        {
            this.updateLogic(this.time.desiredFpsMult);

            // call the game render update exactly once every frame
            this.updateRender(this.time.slowMotion * this.time.desiredFps);

            this._kickstart = false;

            return;
        }

        // if the logic time is spiraling upwards, skip a frame entirely
        if (this._spiraling > 1 && !this.forceSingleUpdate)
        {
            // cause an event to warn the program that this CPU can't keep up with the current desiredFps rate
            if (this.time.time > this._nextFpsNotification)
            {
                // only permit one fps notification per 10 seconds
                this._nextFpsNotification = this.time.time + 10000;

                // dispatch the notification signal
                this.fpsProblemNotifier.dispatch();
            }

            // reset the _deltaTime accumulator which will cause all pending dropped frames to be permanently skipped
            this._deltaTime = 0;
            this._spiraling = 0;

            // call the game render update exactly once every frame
            this.updateRender(this.time.slowMotion * this.time.desiredFps);
        }
        else
        {
            // step size taking into account the slow motion speed
            var slowStep = this.time.slowMotion * 1000.0 / this.time.desiredFps;

            // accumulate time until the slowStep threshold is met or exceeded... up to a limit of 3 catch-up frames at slowStep intervals
            this._deltaTime += Math.max(Math.min(slowStep * 3, this.time.elapsed), 0);

            // call the game update logic multiple times if necessary to "catch up" with dropped frames
            // unless forceSingleUpdate is true
            var count = 0;

            this.updatesThisFrame = Math.floor(this._deltaTime / slowStep);

            if (this.forceSingleUpdate)
            {
                this.updatesThisFrame = Math.min(1, this.updatesThisFrame);
            }

            while (this._deltaTime >= slowStep)
            {
                this._deltaTime -= slowStep;
                this.currentUpdateID = count;

                this.updateLogic(this.time.desiredFpsMult);

                count++;

                if (this.forceSingleUpdate && count === 1)
                {
                    break;
                }
                else
                {
                    this.time.refresh();
                }
            }

            // detect spiraling (if the catch-up loop isn't fast enough, the number of iterations will increase constantly)
            if (count > this._lastCount)
            {
                this._spiraling++;
            }
            else if (count < this._lastCount)
            {
                // looks like it caught up successfully, reset the spiral alert counter
                this._spiraling = 0;
            }

            this._lastCount = count;

            // call the game render update exactly once every frame unless we're playing catch-up from a spiral condition
            this.updateRender(this._deltaTime / slowStep);
        }

    },

    /**
    * Updates all logic subsystems in Phaser. Called automatically by Game.update.
    *
    * @method Phaser.Game#updateLogic
    * @protected
    * @param {number} timeStep - The current timeStep value as determined by Game.update.
    */
    updateLogic: function (timeStep) {

        if (!this._paused && !this.pendingStep)
        {
            if (this.stepping)
            {
                this.pendingStep = true;
            }

            this.scale.preUpdate();
            this.debug.preUpdate();
            this.camera.preUpdate();
            this.physics.preUpdate();
            this.state.preUpdate(timeStep);
            this.plugins.preUpdate(timeStep);
            this.stage.preUpdate();

            this.state.update();
            this.stage.update();
            this.tweens.update();
            this.sound.update();
            this.input.update();
            this.physics.update();
            this.particles.update();
            this.plugins.update();

            this.stage.postUpdate();
            this.plugins.postUpdate();
        }
        else
        {
            // Scaling and device orientation changes are still reflected when paused.
            this.scale.pauseUpdate();
            this.state.pauseUpdate();
            this.debug.preUpdate();
        }

        this.stage.updateTransform();

    },

    /**
    * Runs the Render cycle.
    * It starts by calling State.preRender. In here you can do any last minute adjustments of display objects as required.
    * It then calls the renderer, which renders the entire display list, starting from the Stage object and working down.
    * It then calls plugin.render on any loaded plugins, in the order in which they were enabled.
    * After this State.render is called. Any rendering that happens here will take place on-top of the display list.
    * Finally plugin.postRender is called on any loaded plugins, in the order in which they were enabled.
    * This method is called automatically by Game.update, you don't need to call it directly.
    * Should you wish to have fine-grained control over when Phaser renders then use the `Game.lockRender` boolean.
    * Phaser will only render when this boolean is `false`.
    *
    * @method Phaser.Game#updateRender
    * @protected
    * @param {number} elapsedTime - The time elapsed since the last update.
    */
    updateRender: function (elapsedTime) {

        if (this.lockRender)
        {
            return;
        }

        this.state.preRender(elapsedTime);

        if (this.renderType !== Phaser.HEADLESS)
        {
            this.renderer.render(this.stage);

            this.plugins.render(elapsedTime);

            this.state.render(elapsedTime);
        }

        this.plugins.postRender(elapsedTime);

    },

    /**
    * Enable core game loop stepping. When enabled you must call game.step() directly (perhaps via a DOM button?)
    * Calling step will advance the game loop by one frame. This is extremely useful for hard to track down errors!
    *
    * @method Phaser.Game#enableStep
    */
    enableStep: function () {

        this.stepping = true;
        this.pendingStep = false;
        this.stepCount = 0;

    },

    /**
    * Disables core game loop stepping.
    *
    * @method Phaser.Game#disableStep
    */
    disableStep: function () {

        this.stepping = false;
        this.pendingStep = false;

    },

    /**
    * When stepping is enabled you must call this function directly (perhaps via a DOM button?) to advance the game loop by one frame.
    * This is extremely useful to hard to track down errors! Use the internal stepCount property to monitor progress.
    *
    * @method Phaser.Game#step
    */
    step: function () {

        this.pendingStep = false;
        this.stepCount++;

    },

    /**
    * Nukes the entire game from orbit.
    *
    * Calls destroy on Game.state, Game.sound, Game.scale, Game.stage, Game.input, Game.physics and Game.plugins.
    *
    * Then sets all of those local handlers to null, destroys the renderer, removes the canvas from the DOM
    * and resets the PIXI default renderer.
    *
    * @method Phaser.Game#destroy
    */
    destroy: function () {

        this.raf.stop();

        this.state.destroy();
        this.sound.destroy();
        this.scale.destroy();
        this.stage.destroy();
        this.input.destroy();
        this.physics.destroy();
        this.plugins.destroy();

        this.state = null;
        this.sound = null;
        this.scale = null;
        this.stage = null;
        this.input = null;
        this.physics = null;
        this.plugins = null;

        this.cache = null;
        this.load = null;
        this.time = null;
        this.world = null;

        this.isBooted = false;

        this.renderer.destroy(false);

        Phaser.Canvas.removeFromDOM(this.canvas);

        PIXI.defaultRenderer = null;

        Phaser.GAMES[this.id] = null;

    },

    /**
    * Called by the Stage visibility handler.
    *
    * @method Phaser.Game#gamePaused
    * @param {object} event - The DOM event that caused the game to pause, if any.
    * @protected
    */
    gamePaused: function (event) {

        //   If the game is already paused it was done via game code, so don't re-pause it
        if (!this._paused)
        {
            this._paused = true;

            this.time.gamePaused();

            if (this.sound.muteOnPause)
            {
                this.sound.setMute();
            }

            this.onPause.dispatch(event);

            //  Avoids Cordova iOS crash event: https://github.com/photonstorm/phaser/issues/1800
            if (this.device.cordova && this.device.iOS)
            {
                this.lockRender = true;
            }
        }

    },

    /**
    * Called by the Stage visibility handler.
    *
    * @method Phaser.Game#gameResumed
    * @param {object} event - The DOM event that caused the game to pause, if any.
    * @protected
    */
    gameResumed: function (event) {

        //  Game is paused, but wasn't paused via code, so resume it
        if (this._paused && !this._codePaused)
        {
            this._paused = false;

            this.time.gameResumed();

            this.input.reset();

            if (this.sound.muteOnPause)
            {
                this.sound.unsetMute();
            }

            this.onResume.dispatch(event);

            //  Avoids Cordova iOS crash event: https://github.com/photonstorm/phaser/issues/1800
            if (this.device.cordova && this.device.iOS)
            {
                this.lockRender = false;
            }
        }

    },

    /**
    * Called by the Stage visibility handler.
    *
    * @method Phaser.Game#focusLoss
    * @param {object} event - The DOM event that caused the game to pause, if any.
    * @protected
    */
    focusLoss: function (event) {

        this.onBlur.dispatch(event);

        if (!this.stage.disableVisibilityChange)
        {
            this.gamePaused(event);
        }

    },

    /**
    * Called by the Stage visibility handler.
    *
    * @method Phaser.Game#focusGain
    * @param {object} event - The DOM event that caused the game to pause, if any.
    * @protected
    */
    focusGain: function (event) {

        this.onFocus.dispatch(event);

        if (!this.stage.disableVisibilityChange)
        {
            this.gameResumed(event);
        }

    }

};

Phaser.Game.prototype.constructor = Phaser.Game;

/**
* The paused state of the Game. A paused game doesn't update any of its subsystems.
* When a game is paused the onPause event is dispatched. When it is resumed the onResume event is dispatched.
* @name Phaser.Game#paused
* @property {boolean} paused - Gets and sets the paused state of the Game.
*/
Object.defineProperty(Phaser.Game.prototype, "paused", {

    get: function () {
        return this._paused;
    },

    set: function (value) {

        if (value === true)
        {
            if (this._paused === false)
            {
                this._paused = true;
                this.sound.setMute();
                this.time.gamePaused();
                this.onPause.dispatch(this);
            }
            this._codePaused = true;
        }
        else
        {
            if (this._paused)
            {
                this._paused = false;
                this.input.reset();
                this.sound.unsetMute();
                this.time.gameResumed();
                this.onResume.dispatch(this);
            }
            this._codePaused = false;
        }

    }

});

/**
 * 
 * "Deleted code is debugged code." - Jeff Sickel
 *
 * ヽ(〃＾▽＾〃)ﾉ
 * 
*/

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Phaser.Input is the Input Manager for all types of Input across Phaser, including mouse, keyboard, touch and MSPointer.
* The Input manager is updated automatically by the core game loop.
*
* @class Phaser.Input
* @constructor
* @param {Phaser.Game} game - Current game instance.
*/
Phaser.Input = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * @property {HTMLCanvasElement} hitCanvas - The canvas to which single pixels are drawn in order to perform pixel-perfect hit detection.
    * @default
    */
    this.hitCanvas = null;

    /**
    * @property {CanvasRenderingContext2D} hitContext - The context of the pixel perfect hit canvas.
    * @default
    */
    this.hitContext = null;

    /**
    * An array of callbacks that will be fired every time the activePointer receives a move event from the DOM.
    * To add a callback to this array please use `Input.addMoveCallback`.
    * @property {array} moveCallbacks
    * @protected
    */
    this.moveCallbacks = [];

    /**
    * @property {function} customCandidateHandler - See Input.setInteractiveCandidateHandler.
    * @private
    */
    this.customCandidateHandler = null;

    /**
    * @property {object} customCandidateHandlerContext - See Input.setInteractiveCandidateHandler.
    * @private
    */
    this.customCandidateHandlerContext = null;

    /**
    * @property {number} pollRate - How often should the input pointers be checked for updates? A value of 0 means every single frame (60fps); a value of 1 means every other frame (30fps) and so on.
    * @default
    */
    this.pollRate = 0;

    /**
    * When enabled, input (eg. Keyboard, Mouse, Touch) will be processed - as long as the individual sources are enabled themselves.
    *
    * When not enabled, _all_ input sources are ignored. To disable just one type of input; for example, the Mouse, use `input.mouse.enabled = false`.
    * @property {boolean} enabled
    * @default
    */
    this.enabled = true;

    /**
    * @property {number} multiInputOverride - Controls the expected behavior when using a mouse and touch together on a multi-input device.
    * @default
    */
    this.multiInputOverride = Phaser.Input.MOUSE_TOUCH_COMBINE;

    /**
    * @property {Phaser.Point} position - A point object representing the current position of the Pointer.
    * @default
    */
    this.position = null;

    /**
    * @property {Phaser.Point} speed - A point object representing the speed of the Pointer. Only really useful in single Pointer games; otherwise see the Pointer objects directly.
    */
    this.speed = null;

    /**
    * A Circle object centered on the x/y screen coordinates of the Input.
    * Default size of 44px (Apples recommended "finger tip" size) but can be changed to anything.
    * @property {Phaser.Circle} circle
    */
    this.circle = null;

    /**
    * @property {Phaser.Point} scale - The scale by which all input coordinates are multiplied; calculated by the ScaleManager. In an un-scaled game the values will be x = 1 and y = 1.
    */
    this.scale = null;

    /**
    * @property {integer} maxPointers - The maximum number of Pointers allowed to be active at any one time. A value of -1 is only limited by the total number of pointers. For lots of games it's useful to set this to 1.
    * @default -1 (Limited by total pointers.)
    */
    this.maxPointers = -1;

    /**
    * @property {number} tapRate - The number of milliseconds that the Pointer has to be pressed down and then released to be considered a tap or click.
    * @default
    */
    this.tapRate = 200;

    /**
    * @property {number} doubleTapRate - The number of milliseconds between taps of the same Pointer for it to be considered a double tap / click.
    * @default
    */
    this.doubleTapRate = 300;

    /**
    * @property {number} holdRate - The number of milliseconds that the Pointer has to be pressed down for it to fire a onHold event.
    * @default
    */
    this.holdRate = 2000;

    /**
    * @property {number} justPressedRate - The number of milliseconds below which the Pointer is considered justPressed.
    * @default
    */
    this.justPressedRate = 200;

    /**
    * @property {number} justReleasedRate - The number of milliseconds below which the Pointer is considered justReleased .
    * @default
    */
    this.justReleasedRate = 200;

    /**
    * Sets if the Pointer objects should record a history of x/y coordinates they have passed through.
    * The history is cleared each time the Pointer is pressed down.
    * The history is updated at the rate specified in Input.pollRate
    * @property {boolean} recordPointerHistory
    * @default
    */
    this.recordPointerHistory = false;

    /**
    * @property {number} recordRate - The rate in milliseconds at which the Pointer objects should update their tracking history.
    * @default
    */
    this.recordRate = 100;

    /**
    * The total number of entries that can be recorded into the Pointer objects tracking history.
    * If the Pointer is tracking one event every 100ms; then a trackLimit of 100 would store the last 10 seconds worth of history.
    * @property {number} recordLimit
    * @default
    */
    this.recordLimit = 100;

    /**
    * @property {Phaser.Pointer} pointer1 - A Pointer object.
    */
    this.pointer1 = null;

    /**
    * @property {Phaser.Pointer} pointer2 - A Pointer object.
    */
    this.pointer2 = null;

    /**
    * @property {Phaser.Pointer} pointer3 - A Pointer object.
    */
    this.pointer3 = null;

    /**
    * @property {Phaser.Pointer} pointer4 - A Pointer object.
    */
    this.pointer4 = null;

    /**
    * @property {Phaser.Pointer} pointer5 - A Pointer object.
    */
    this.pointer5 = null;

    /**
    * @property {Phaser.Pointer} pointer6 - A Pointer object.
    */
    this.pointer6 = null;

    /**
    * @property {Phaser.Pointer} pointer7 - A Pointer object.
    */
    this.pointer7 = null;

    /**
    * @property {Phaser.Pointer} pointer8 - A Pointer object.
    */
    this.pointer8 = null;

    /**
    * @property {Phaser.Pointer} pointer9 - A Pointer object.
    */
    this.pointer9 = null;

    /**
    * @property {Phaser.Pointer} pointer10 - A Pointer object.
    */
    this.pointer10 = null;

    /**
    * An array of non-mouse pointers that have been added to the game.
    * The properties `pointer1..N` are aliases for `pointers[0..N-1]`.
    * @property {Phaser.Pointer[]} pointers
    * @public
    * @readonly
    */
    this.pointers = [];

    /**
    * The most recently active Pointer object.
    * 
    * When you've limited max pointers to 1 this will accurately be either the first finger touched or mouse.
    * 
    * @property {Phaser.Pointer} activePointer
    */
    this.activePointer = null;

    /**
    * The mouse has its own unique Phaser.Pointer object which you can use if making a desktop specific game.
    * 
    * @property {Pointer} mousePointer
    */
    this.mousePointer = null;

    /**
    * The Mouse Input manager.
    * 
    * You should not usually access this manager directly, but instead use Input.mousePointer or Input.activePointer 
    * which normalizes all the input values for you, regardless of browser.
    * 
    * @property {Phaser.Mouse} mouse
    */
    this.mouse = null;

    /**
    * The Keyboard Input manager.
    * 
    * @property {Phaser.Keyboard} keyboard
    */
    this.keyboard = null;

    /**
    * The Touch Input manager.
    * 
    * You should not usually access this manager directly, but instead use Input.activePointer 
    * which normalizes all the input values for you, regardless of browser.
    * 
    * @property {Phaser.Touch} touch
    */
    this.touch = null;

    /**
    * The MSPointer Input manager.
    * 
    * You should not usually access this manager directly, but instead use Input.activePointer 
    * which normalizes all the input values for you, regardless of browser.
    * 
    * @property {Phaser.MSPointer} mspointer
    */
    this.mspointer = null;

    /**
    * The Gamepad Input manager.
    * 
    * @property {Phaser.Gamepad} gamepad
    */
    this.gamepad = null;

    /**
    * If the Input Manager has been reset locked then all calls made to InputManager.reset, 
    * such as from a State change, are ignored.
    * @property {boolean} resetLocked
    * @default
    */
    this.resetLocked = false;

    /**
    * A Signal that is dispatched each time a pointer is pressed down.
    * @property {Phaser.Signal} onDown
    */
    this.onDown = null;

    /**
    * A Signal that is dispatched each time a pointer is released.
    * @property {Phaser.Signal} onUp
    */
    this.onUp = null;

    /**
    * A Signal that is dispatched each time a pointer is tapped.
    * @property {Phaser.Signal} onTap
    */
    this.onTap = null;

    /**
    * A Signal that is dispatched each time a pointer is held down.
    * @property {Phaser.Signal} onHold
    */
    this.onHold = null;

    /**
    * You can tell all Pointers to ignore any Game Object with a `priorityID` lower than this value.
    * This is useful when stacking UI layers. Set to zero to disable.
    * @property {number} minPriorityID
    * @default
    */
    this.minPriorityID = 0;

    /**
    * A list of interactive objects. The InputHandler components add and remove themselves from this list.
    * @property {Phaser.ArraySet} interactiveItems
    */
    this.interactiveItems = new Phaser.ArraySet();

    /**
    * @property {Phaser.Point} _localPoint - Internal cache var.
    * @private
    */
    this._localPoint = new Phaser.Point();

    /**
    * @property {number} _pollCounter - Internal var holding the current poll counter.
    * @private
    */
    this._pollCounter = 0;

    /**
    * @property {Phaser.Point} _oldPosition - A point object representing the previous position of the Pointer.
    * @private
    */
    this._oldPosition = null;

    /**
    * @property {number} _x - x coordinate of the most recent Pointer event
    * @private
    */
    this._x = 0;

    /**
    * @property {number} _y - Y coordinate of the most recent Pointer event
    * @private
    */
    this._y = 0;

};

/**
* @constant
* @type {number}
*/
Phaser.Input.MOUSE_OVERRIDES_TOUCH = 0;

/**
* @constant
* @type {number}
*/
Phaser.Input.TOUCH_OVERRIDES_MOUSE = 1;

/**
* @constant
* @type {number}
*/
Phaser.Input.MOUSE_TOUCH_COMBINE = 2;

/**
* The maximum number of pointers that can be added. This excludes the mouse pointer.
* @constant
* @type {integer}
*/
Phaser.Input.MAX_POINTERS = 10;

Phaser.Input.prototype = {

    /**
    * Starts the Input Manager running.
    *
    * @method Phaser.Input#boot
    * @protected
    */
    boot: function () {

        this.mousePointer = new Phaser.Pointer(this.game, 0, Phaser.PointerMode.CURSOR);
        this.addPointer();
        this.addPointer();

        this.mouse = new Phaser.Mouse(this.game);
        this.touch = new Phaser.Touch(this.game);
        this.mspointer = new Phaser.MSPointer(this.game);

        if (Phaser.Keyboard)
        {
            this.keyboard = new Phaser.Keyboard(this.game);
        }

        if (Phaser.Gamepad)
        {
            this.gamepad = new Phaser.Gamepad(this.game);
        }

        this.onDown = new Phaser.Signal();
        this.onUp = new Phaser.Signal();
        this.onTap = new Phaser.Signal();
        this.onHold = new Phaser.Signal();

        this.scale = new Phaser.Point(1, 1);
        this.speed = new Phaser.Point();
        this.position = new Phaser.Point();
        this._oldPosition = new Phaser.Point();

        this.circle = new Phaser.Circle(0, 0, 44);

        this.activePointer = this.mousePointer;

        this.hitCanvas = PIXI.CanvasPool.create(this, 1, 1);
        this.hitContext = this.hitCanvas.getContext('2d');

        this.mouse.start();
        this.touch.start();
        this.mspointer.start();
        this.mousePointer.active = true;

        if (this.keyboard)
        {
            this.keyboard.start();
        }

        var _this = this;

        this._onClickTrampoline = function (event) {
            _this.onClickTrampoline(event);
        };

        this.game.canvas.addEventListener('click', this._onClickTrampoline, false);

    },

    /**
    * Stops all of the Input Managers from running.
    *
    * @method Phaser.Input#destroy
    */
    destroy: function () {

        this.mouse.stop();
        this.touch.stop();
        this.mspointer.stop();

        if (this.keyboard)
        {
            this.keyboard.stop();
        }

        if (this.gamepad)
        {
            this.gamepad.stop();
        }

        this.moveCallbacks = [];

        PIXI.CanvasPool.remove(this);

        this.game.canvas.removeEventListener('click', this._onClickTrampoline);

    },

    /**
    * Adds a callback that is fired every time `Pointer.processInteractiveObjects` is called.
    * The purpose of `processInteractiveObjects` is to work out which Game Object the Pointer is going to
    * interact with. It works by polling all of the valid game objects, and then slowly discounting those
    * that don't meet the criteria (i.e. they aren't under the Pointer, are disabled, invisible, etc).
    *
    * Eventually a short-list of 'candidates' is created. These are all of the Game Objects which are valid
    * for input and overlap with the Pointer. If you need fine-grained control over which of the items is
    * selected then you can use this callback to do so.
    *
    * The callback will be sent 3 parameters:
    * 
    * 1) A reference to the Phaser.Pointer object that is processing the Items.
    * 2) An array containing all potential interactive candidates. This is an array of `InputHandler` objects, not Sprites.
    * 3) The current 'favorite' candidate, based on its priorityID and position in the display list.
    *
    * Your callback MUST return one of the candidates sent to it.
    * 
    * @method Phaser.Input#setInteractiveCandidateHandler
    * @param {function} callback - The callback that will be called each time `Pointer.processInteractiveObjects` is called. Set to `null` to disable.
    * @param {object} context - The context in which the callback will be called.
    */
    setInteractiveCandidateHandler: function (callback, context) {

        this.customCandidateHandler = callback;
        this.customCandidateHandlerContext = context;

    },

    /**
    * Adds a callback that is fired every time the activePointer receives a DOM move event such as a mousemove or touchmove.
    *
    * The callback will be sent 4 parameters:
    * 
    * A reference to the Phaser.Pointer object that moved,
    * The x position of the pointer,
    * The y position,
    * A boolean indicating if the movement was the result of a 'click' event (such as a mouse click or touch down).
    * 
    * It will be called every time the activePointer moves, which in a multi-touch game can be a lot of times, so this is best
    * to only use if you've limited input to a single pointer (i.e. mouse or touch).
    * 
    * The callback is added to the Phaser.Input.moveCallbacks array and should be removed with Phaser.Input.deleteMoveCallback.
    * 
    * @method Phaser.Input#addMoveCallback
    * @param {function} callback - The callback that will be called each time the activePointer receives a DOM move event.
    * @param {object} context - The context in which the callback will be called.
    */
    addMoveCallback: function (callback, context) {

        this.moveCallbacks.push({ callback: callback, context: context });

    },

    /**
    * Removes the callback from the Phaser.Input.moveCallbacks array.
    * 
    * @method Phaser.Input#deleteMoveCallback
    * @param {function} callback - The callback to be removed.
    * @param {object} context - The context in which the callback exists.
    */
    deleteMoveCallback: function (callback, context) {

        var i = this.moveCallbacks.length;

        while (i--)
        {
            if (this.moveCallbacks[i].callback === callback && this.moveCallbacks[i].context === context)
            {
                this.moveCallbacks.splice(i, 1);
                return;
            }
        }

    },

    /**
    * Add a new Pointer object to the Input Manager.
    * By default Input creates 3 pointer objects: `mousePointer` (not include in part of general pointer pool), `pointer1` and `pointer2`.
    * This method adds an additional pointer, up to a maximum of Phaser.Input.MAX_POINTERS (default of 10).
    *
    * @method Phaser.Input#addPointer
    * @return {Phaser.Pointer|null} The new Pointer object that was created; null if a new pointer could not be added.
    */
    addPointer: function () {

        if (this.pointers.length >= Phaser.Input.MAX_POINTERS)
        {
            console.warn("Phaser.Input.addPointer: Maximum limit of " + Phaser.Input.MAX_POINTERS + " pointers reached.");
            return null;
        }

        var id = this.pointers.length + 1;
        var pointer = new Phaser.Pointer(this.game, id, Phaser.PointerMode.TOUCH);

        this.pointers.push(pointer);
        this['pointer' + id] = pointer;

        return pointer;

    },

    /**
    * Updates the Input Manager. Called by the core Game loop.
    * 
    * @method Phaser.Input#update
    * @protected
    */
    update: function () {

        if (this.keyboard)
        {
            this.keyboard.update();
        }

        if (this.pollRate > 0 && this._pollCounter < this.pollRate)
        {
            this._pollCounter++;
            return;
        }

        this.speed.x = this.position.x - this._oldPosition.x;
        this.speed.y = this.position.y - this._oldPosition.y;

        this._oldPosition.copyFrom(this.position);
        this.mousePointer.update();

        if (this.gamepad && this.gamepad.active)
        {
            this.gamepad.update();
        }

        for (var i = 0; i < this.pointers.length; i++)
        {
            this.pointers[i].update();
        }

        this._pollCounter = 0;

    },

    /**
    * Reset all of the Pointers and Input states.
    *
    * The optional `hard` parameter will reset any events or callbacks that may be bound.
    * Input.reset is called automatically during a State change or if a game loses focus / visibility.
    * To control control the reset manually set {@link Phaser.InputManager.resetLocked} to `true`.
    *
    * @method Phaser.Input#reset
    * @public
    * @param {boolean} [hard=false] - A soft reset won't reset any events or callbacks that are bound. A hard reset will.
    */
    reset: function (hard) {

        if (!this.game.isBooted || this.resetLocked)
        {
            return;
        }

        if (hard === undefined) { hard = false; }

        this.mousePointer.reset();

        if (this.keyboard)
        {
            this.keyboard.reset(hard);
        }

        if (this.gamepad)
        {
            this.gamepad.reset();
        }

        for (var i = 0; i < this.pointers.length; i++)
        {
            this.pointers[i].reset();
        }

        if (this.game.canvas.style.cursor !== 'none')
        {
            this.game.canvas.style.cursor = 'inherit';
        }

        if (hard)
        {
            this.onDown.dispose();
            this.onUp.dispose();
            this.onTap.dispose();
            this.onHold.dispose();
            this.onDown = new Phaser.Signal();
            this.onUp = new Phaser.Signal();
            this.onTap = new Phaser.Signal();
            this.onHold = new Phaser.Signal();
            this.moveCallbacks = [];
        }

        this._pollCounter = 0;

    },

    /**
    * Resets the speed and old position properties.
    *
    * @method Phaser.Input#resetSpeed
    * @param {number} x - Sets the oldPosition.x value.
    * @param {number} y - Sets the oldPosition.y value.
    */
    resetSpeed: function (x, y) {

        this._oldPosition.setTo(x, y);
        this.speed.setTo(0, 0);

    },

    /**
    * Find the first free Pointer object and start it, passing in the event data.
    * This is called automatically by Phaser.Touch and Phaser.MSPointer.
    *
    * @method Phaser.Input#startPointer
    * @protected
    * @param {any} event - The event data from the Touch event.
    * @return {Phaser.Pointer} The Pointer object that was started or null if no Pointer object is available.
    */
    startPointer: function (event) {

        if (this.maxPointers >= 0 && this.countActivePointers(this.maxPointers) >= this.maxPointers)
        {
            return null;
        }

        if (!this.pointer1.active)
        {
            return this.pointer1.start(event);
        }

        if (!this.pointer2.active)
        {
            return this.pointer2.start(event);
        }

        for (var i = 2; i < this.pointers.length; i++)
        {
            var pointer = this.pointers[i];

            if (!pointer.active)
            {
                return pointer.start(event);
            }
        }

        return null;

    },

    /**
    * Updates the matching Pointer object, passing in the event data.
    * This is called automatically and should not normally need to be invoked.
    *
    * @method Phaser.Input#updatePointer
    * @protected
    * @param {any} event - The event data from the Touch event.
    * @return {Phaser.Pointer} The Pointer object that was updated; null if no pointer was updated.
    */
    updatePointer: function (event) {

        if (this.pointer1.active && this.pointer1.identifier === event.identifier)
        {
            return this.pointer1.move(event);
        }

        if (this.pointer2.active && this.pointer2.identifier === event.identifier)
        {
            return this.pointer2.move(event);
        }

        for (var i = 2; i < this.pointers.length; i++)
        {
            var pointer = this.pointers[i];

            if (pointer.active && pointer.identifier === event.identifier)
            {
                return pointer.move(event);
            }
        }

        return null;

    },

    /**
    * Stops the matching Pointer object, passing in the event data.
    *
    * @method Phaser.Input#stopPointer
    * @protected
    * @param {any} event - The event data from the Touch event.
    * @return {Phaser.Pointer} The Pointer object that was stopped or null if no Pointer object is available.
    */
    stopPointer: function (event) {

        if (this.pointer1.active && this.pointer1.identifier === event.identifier)
        {
            return this.pointer1.stop(event);
        }

        if (this.pointer2.active && this.pointer2.identifier === event.identifier)
        {
            return this.pointer2.stop(event);
        }

        for (var i = 2; i < this.pointers.length; i++)
        {
            var pointer = this.pointers[i];

            if (pointer.active && pointer.identifier === event.identifier)
            {
                return pointer.stop(event);
            }
        }

        return null;

    },

    /**
    * Returns the total number of active pointers, not exceeding the specified limit
    *
    * @name Phaser.Input#countActivePointers
    * @private
    * @property {integer} [limit=(max pointers)] - Stop counting after this.
    * @return {integer} The number of active pointers, or limit - whichever is less.
    */
    countActivePointers: function (limit) {

        if (limit === undefined) { limit = this.pointers.length; }

        var count = limit;

        for (var i = 0; i < this.pointers.length && count > 0; i++)
        {
            var pointer = this.pointers[i];

            if (pointer.active)
            {
                count--;
            }
        }

        return (limit - count);

    },

    /**
    * Get the first Pointer with the given active state.
    *
    * @method Phaser.Input#getPointer
    * @param {boolean} [isActive=false] - The state the Pointer should be in - active or inactive?
    * @return {Phaser.Pointer} A Pointer object or null if no Pointer object matches the requested state.
    */
    getPointer: function (isActive) {

        if (isActive === undefined) { isActive = false; }

        for (var i = 0; i < this.pointers.length; i++)
        {
            var pointer = this.pointers[i];

            if (pointer.active === isActive)
            {
                return pointer;
            }
        }

        return null;

    },

    /**
    * Get the Pointer object whos `identifier` property matches the given identifier value.
    *
    * The identifier property is not set until the Pointer has been used at least once, as its populated by the DOM event.
    * Also it can change every time you press the pointer down, and is not fixed once set.
    * Note: Not all browsers set the identifier property and it's not part of the W3C spec, so you may need getPointerFromId instead.
    *
    * @method Phaser.Input#getPointerFromIdentifier
    * @param {number} identifier - The Pointer.identifier value to search for.
    * @return {Phaser.Pointer} A Pointer object or null if no Pointer object matches the requested identifier.
    */
    getPointerFromIdentifier: function (identifier) {

        for (var i = 0; i < this.pointers.length; i++)
        {
            var pointer = this.pointers[i];

            if (pointer.identifier === identifier)
            {
                return pointer;
            }
        }

        return null;

    },

    /**
    * Get the Pointer object whos `pointerId` property matches the given value.
    *
    * The pointerId property is not set until the Pointer has been used at least once, as its populated by the DOM event.
    * Also it can change every time you press the pointer down if the browser recycles it.
    *
    * @method Phaser.Input#getPointerFromId
    * @param {number} pointerId - The `pointerId` (not 'id') value to search for.
    * @return {Phaser.Pointer} A Pointer object or null if no Pointer object matches the requested identifier.
    */
    getPointerFromId: function (pointerId) {

        for (var i = 0; i < this.pointers.length; i++)
        {
            var pointer = this.pointers[i];

            if (pointer.pointerId === pointerId)
            {
                return pointer;
            }
        }

        return null;

    },

    /**
    * This will return the local coordinates of the specified displayObject based on the given Pointer.
    *
    * @method Phaser.Input#getLocalPosition
    * @param {Phaser.Sprite|Phaser.Image} displayObject - The DisplayObject to get the local coordinates for.
    * @param {Phaser.Pointer} pointer - The Pointer to use in the check against the displayObject.
    * @return {Phaser.Point} A point containing the coordinates of the Pointer position relative to the DisplayObject.
    */
    getLocalPosition: function (displayObject, pointer, output) {

        if (output === undefined) { output = new Phaser.Point(); }

        var wt = displayObject.worldTransform;
        var id = 1 / (wt.a * wt.d + wt.c * -wt.b);

        return output.setTo(
            wt.d * id * pointer.x + -wt.c * id * pointer.y + (wt.ty * wt.c - wt.tx * wt.d) * id,
            wt.a * id * pointer.y + -wt.b * id * pointer.x + (-wt.ty * wt.a + wt.tx * wt.b) * id
        );

    },

    /**
    * Tests if the pointer hits the given object.
    *
    * @method Phaser.Input#hitTest
    * @param {DisplayObject} displayObject - The displayObject to test for a hit.
    * @param {Phaser.Pointer} pointer - The pointer to use for the test.
    * @param {Phaser.Point} localPoint - The local translated point.
    */
    hitTest: function (displayObject, pointer, localPoint) {

        if (!displayObject.worldVisible)
        {
            return false;
        }

        this.getLocalPosition(displayObject, pointer, this._localPoint);

        localPoint.copyFrom(this._localPoint);

        if (displayObject.hitArea && displayObject.hitArea.contains)
        {
            return (displayObject.hitArea.contains(this._localPoint.x, this._localPoint.y));
        }
        else if (displayObject instanceof Phaser.TileSprite)
        {
            var width = displayObject.width;
            var height = displayObject.height;
            var x1 = -width * displayObject.anchor.x;

            if (this._localPoint.x >= x1 && this._localPoint.x < x1 + width)
            {
                var y1 = -height * displayObject.anchor.y;

                if (this._localPoint.y >= y1 && this._localPoint.y < y1 + height)
                {
                    return true;
                }
            }
        }
        else if (displayObject instanceof PIXI.Sprite)
        {
            var width = displayObject.texture.frame.width;
            var height = displayObject.texture.frame.height;
            var x1 = -width * displayObject.anchor.x;

            if (this._localPoint.x >= x1 && this._localPoint.x < x1 + width)
            {
                var y1 = -height * displayObject.anchor.y;

                if (this._localPoint.y >= y1 && this._localPoint.y < y1 + height)
                {
                    return true;
                }
            }
        }
        else if (displayObject instanceof Phaser.Graphics)
        {
            for (var i = 0; i < displayObject.graphicsData.length; i++)
            {
                var data = displayObject.graphicsData[i];

                if (!data.fill)
                {
                    continue;
                }

                //  Only deal with fills..
                if (data.shape && data.shape.contains(this._localPoint.x, this._localPoint.y))
                {
                    return true;
                }
            }
        }

        //  Didn't hit the parent, does it have any children?

        for (var i = 0; i < displayObject.children.length; i++)
        {
            if (this.hitTest(displayObject.children[i], pointer, localPoint))
            {
                return true;
            }
        }

        return false;
    },

    /**
    * Used for click trampolines. See {@link Phaser.Pointer.addClickTrampoline}.
    *
    * @method Phaser.Input#onClickTrampoline
    * @private
    */
    onClickTrampoline: function () {

        // It might not always be the active pointer, but this does work on
        // Desktop browsers (read: IE) with Mouse or MSPointer input.
        this.activePointer.processClickTrampolines();

    }

};

Phaser.Input.prototype.constructor = Phaser.Input;

/**
* The X coordinate of the most recently active pointer.
* This value takes game scaling into account automatically. See Pointer.screenX/clientX for source values.
* @name Phaser.Input#x
* @property {number} x
*/
Object.defineProperty(Phaser.Input.prototype, "x", {

    get: function () {
        return this._x;
    },

    set: function (value) {
        this._x = Math.floor(value);
    }

});

/**
* The Y coordinate of the most recently active pointer.
* This value takes game scaling into account automatically. See Pointer.screenY/clientY for source values.
* @name Phaser.Input#y
* @property {number} y
*/
Object.defineProperty(Phaser.Input.prototype, "y", {

    get: function () {
        return this._y;
    },

    set: function (value) {
        this._y = Math.floor(value);
    }

});

/**
* True if the Input is currently poll rate locked.
* @name Phaser.Input#pollLocked
* @property {boolean} pollLocked
* @readonly
*/
Object.defineProperty(Phaser.Input.prototype, "pollLocked", {

    get: function () {
        return (this.pollRate > 0 && this._pollCounter < this.pollRate);
    }

});

/**
* The total number of inactive Pointers.
* @name Phaser.Input#totalInactivePointers
* @property {number} totalInactivePointers
* @readonly
*/
Object.defineProperty(Phaser.Input.prototype, "totalInactivePointers", {

    get: function () {
        return this.pointers.length - this.countActivePointers();
    }

});

/**
* The total number of active Pointers, not counting the mouse pointer.
* @name Phaser.Input#totalActivePointers
* @property {integers} totalActivePointers
* @readonly
*/
Object.defineProperty(Phaser.Input.prototype, "totalActivePointers", {

    get: function () {
        return this.countActivePointers();
    }

});

/**
* The world X coordinate of the most recently active pointer.
* @name Phaser.Input#worldX
* @property {number} worldX - The world X coordinate of the most recently active pointer.
* @readonly
*/
Object.defineProperty(Phaser.Input.prototype, "worldX", {

    get: function () {
        return this.game.camera.view.x + this.x;
    }

});

/**
* The world Y coordinate of the most recently active pointer.
* @name Phaser.Input#worldY
* @property {number} worldY - The world Y coordinate of the most recently active pointer.
* @readonly
*/
Object.defineProperty(Phaser.Input.prototype, "worldY", {

    get: function () {
        return this.game.camera.view.y + this.y;
    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Mouse class is responsible for handling all aspects of mouse interaction with the browser.
*
* It captures and processes mouse events that happen on the game canvas object.
* It also adds a single `mouseup` listener to `window` which is used to capture the mouse being released
* when not over the game.
*
* You should not normally access this class directly, but instead use a Phaser.Pointer object
* which normalises all game input for you, including accurate button handling.
*
* @class Phaser.Mouse
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.Mouse = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * @property {Phaser.Input} input - A reference to the Phaser Input Manager.
    * @protected
    */
    this.input = game.input;

    /**
    * @property {object} callbackContext - The context under which callbacks are called.
    */
    this.callbackContext = this.game;

    /**
    * @property {function} mouseDownCallback - A callback that can be fired when the mouse is pressed down.
    */
    this.mouseDownCallback = null;

    /**
    * @property {function} mouseUpCallback - A callback that can be fired when the mouse is released from a pressed down state.
    */
    this.mouseUpCallback = null;

    /**
    * @property {function} mouseOutCallback - A callback that can be fired when the mouse is no longer over the game canvas.
    */
    this.mouseOutCallback = null;

    /**
    * @property {function} mouseOverCallback - A callback that can be fired when the mouse enters the game canvas (usually after a mouseout).
    */
    this.mouseOverCallback = null;

    /**
     * @property {function} mouseWheelCallback - A callback that can be fired when the mousewheel is used.
     */
    this.mouseWheelCallback = null;

    /**
    * @property {boolean} capture - If true the DOM mouse events will have event.preventDefault applied to them, if false they will propagate fully.
    */
    this.capture = false;

    /**
    * This property was removed in Phaser 2.4 and should no longer be used.
    * Instead please see the Pointer button properties such as `Pointer.leftButton`, `Pointer.rightButton` and so on.
    * Or Pointer.button holds the DOM event button value if you require that.
    * @property {number} button
    * @default
    */
    this.button = -1;

    /**
     * The direction of the _last_ mousewheel usage 1 for up -1 for down.
     * @property {number} wheelDelta
     */
    this.wheelDelta = 0;

    /**
    * Mouse input will only be processed if enabled.
    * @property {boolean} enabled
    * @default
    */
    this.enabled = true;

    /**
    * @property {boolean} locked - If the mouse has been Pointer Locked successfully this will be set to true.
    * @default
    */
    this.locked = false;

    /**
    * @property {boolean} stopOnGameOut - If true Pointer.stop will be called if the mouse leaves the game canvas.
    * @default
    */
    this.stopOnGameOut = false;

    /**
    * @property {Phaser.Signal} pointerLock - This event is dispatched when the browser enters or leaves pointer lock state.
    * @default
    */
    this.pointerLock = new Phaser.Signal();

    /**
    * The browser mouse DOM event. Will be null if no mouse event has ever been received.
    * Access this property only inside a Mouse event handler and do not keep references to it.
    * @property {MouseEvent|null} event
    * @default
    */
    this.event = null;

    /**
    * @property {function} _onMouseDown - Internal event handler reference.
    * @private
    */
    this._onMouseDown = null;

    /**
    * @property {function} _onMouseMove - Internal event handler reference.
    * @private
    */
    this._onMouseMove = null;

    /**
    * @property {function} _onMouseUp - Internal event handler reference.
    * @private
    */
    this._onMouseUp = null;

    /**
    * @property {function} _onMouseOut - Internal event handler reference.
    * @private
    */
    this._onMouseOut = null;

    /**
    * @property {function} _onMouseOver - Internal event handler reference.
    * @private
    */
    this._onMouseOver = null;

    /**
    * @property {function} _onMouseWheel - Internal event handler reference.
    * @private
    */
    this._onMouseWheel = null;

    /**
    * Wheel proxy event object, if required. Shared for all wheel events for this mouse.
    * @property {Phaser.Mouse~WheelEventProxy} _wheelEvent
    * @private
    */
    this._wheelEvent = null;

};

/**
* @constant
* @type {number}
*/
Phaser.Mouse.NO_BUTTON = -1;

/**
* @constant
* @type {number}
*/
Phaser.Mouse.LEFT_BUTTON = 0;

/**
* @constant
* @type {number}
*/
Phaser.Mouse.MIDDLE_BUTTON = 1;

/**
* @constant
* @type {number}
*/
Phaser.Mouse.RIGHT_BUTTON = 2;

/**
* @constant
* @type {number}
*/
Phaser.Mouse.BACK_BUTTON = 3;

/**
* @constant
* @type {number}
*/
Phaser.Mouse.FORWARD_BUTTON = 4;

/**
 * @constant
 * @type {number}
 */
Phaser.Mouse.WHEEL_UP = 1;

/**
 * @constant
 * @type {number}
 */
Phaser.Mouse.WHEEL_DOWN = -1;

Phaser.Mouse.prototype = {

    /**
    * Starts the event listeners running.
    * @method Phaser.Mouse#start
    */
    start: function () {

        if (this.game.device.android && this.game.device.chrome === false)
        {
            //  Android stock browser fires mouse events even if you preventDefault on the touchStart, so ...
            return;
        }

        if (this._onMouseDown !== null)
        {
            //  Avoid setting multiple listeners
            return;
        }

        var _this = this;

        this._onMouseDown = function (event) {
            return _this.onMouseDown(event);
        };

        this._onMouseMove = function (event) {
            return _this.onMouseMove(event);
        };

        this._onMouseUp = function (event) {
            return _this.onMouseUp(event);
        };

        this._onMouseUpGlobal = function (event) {
            return _this.onMouseUpGlobal(event);
        };

        this._onMouseOutGlobal = function (event) {
            return _this.onMouseOutGlobal(event);
        };

        this._onMouseOut = function (event) {
            return _this.onMouseOut(event);
        };

        this._onMouseOver = function (event) {
            return _this.onMouseOver(event);
        };

        this._onMouseWheel = function (event) {
            return _this.onMouseWheel(event);
        };

        var canvas = this.game.canvas;

        canvas.addEventListener('mousedown', this._onMouseDown, true);
        canvas.addEventListener('mousemove', this._onMouseMove, true);
        canvas.addEventListener('mouseup', this._onMouseUp, true);

        if (!this.game.device.cocoonJS)
        {
            window.addEventListener('mouseup', this._onMouseUpGlobal, true);
            window.addEventListener('mouseout', this._onMouseOutGlobal, true);
            canvas.addEventListener('mouseover', this._onMouseOver, true);
            canvas.addEventListener('mouseout', this._onMouseOut, true);
        }

        var wheelEvent = this.game.device.wheelEvent;

        if (wheelEvent)
        {
            canvas.addEventListener(wheelEvent, this._onMouseWheel, true);

            if (wheelEvent === 'mousewheel')
            {
                this._wheelEvent = new WheelEventProxy(-1/40, 1);
            }
            else if (wheelEvent === 'DOMMouseScroll')
            {
                this._wheelEvent = new WheelEventProxy(1, 1);
            }
        }

    },

    /**
    * The internal method that handles the mouse down event from the browser.
    * @method Phaser.Mouse#onMouseDown
    * @param {MouseEvent} event - The native event from the browser. This gets stored in Mouse.event.
    */
    onMouseDown: function (event) {

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        if (this.mouseDownCallback)
        {
            this.mouseDownCallback.call(this.callbackContext, event);
        }

        if (!this.input.enabled || !this.enabled)
        {
            return;
        }

        event['identifier'] = 0;

        this.input.mousePointer.start(event);

    },

    /**
    * The internal method that handles the mouse move event from the browser.
    * @method Phaser.Mouse#onMouseMove
    * @param {MouseEvent} event - The native event from the browser. This gets stored in Mouse.event.
    */
    onMouseMove: function (event) {

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        if (this.mouseMoveCallback)
        {
            this.mouseMoveCallback.call(this.callbackContext, event);
        }

        if (!this.input.enabled || !this.enabled)
        {
            return;
        }

        event['identifier'] = 0;

        this.input.mousePointer.move(event);

    },

    /**
    * The internal method that handles the mouse up event from the browser.
    * @method Phaser.Mouse#onMouseUp
    * @param {MouseEvent} event - The native event from the browser. This gets stored in Mouse.event.
    */
    onMouseUp: function (event) {

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        if (this.mouseUpCallback)
        {
            this.mouseUpCallback.call(this.callbackContext, event);
        }

        if (!this.input.enabled || !this.enabled)
        {
            return;
        }

        event['identifier'] = 0;

        this.input.mousePointer.stop(event);

    },

    /**
    * The internal method that handles the mouse up event from the window.
    *
    * @method Phaser.Mouse#onMouseUpGlobal
    * @param {MouseEvent} event - The native event from the browser. This gets stored in Mouse.event.
    */
    onMouseUpGlobal: function (event) {

        if (!this.input.mousePointer.withinGame)
        {
            if (this.mouseUpCallback)
            {
                this.mouseUpCallback.call(this.callbackContext, event);
            }

            event['identifier'] = 0;

            this.input.mousePointer.stop(event);
        }

    },

    /**
    * The internal method that handles the mouse out event from the window.
    *
    * @method Phaser.Mouse#onMouseOutGlobal
    * @param {MouseEvent} event - The native event from the browser. This gets stored in Mouse.event.
    */
    onMouseOutGlobal: function (event) {

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        this.input.mousePointer.withinGame = false;

        if (!this.input.enabled || !this.enabled)
        {
            return;
        }

        //  If we get a mouseout event from the window then basically
        //  something serious has gone down, usually along the lines of
        //  the browser opening a context-menu or similar.
        //  On OS X Chrome especially this is bad news, as it blocks
        //  us then getting a mouseup event, so we need to force that through.
        //
        //  No matter what, we must cancel the left and right buttons

        this.input.mousePointer.stop(event);
        this.input.mousePointer.leftButton.stop(event);
        this.input.mousePointer.rightButton.stop(event);

    },

    /**
    * The internal method that handles the mouse out event from the browser.
    *
    * @method Phaser.Mouse#onMouseOut
    * @param {MouseEvent} event - The native event from the browser. This gets stored in Mouse.event.
    */
    onMouseOut: function (event) {

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        this.input.mousePointer.withinGame = false;

        if (this.mouseOutCallback)
        {
            this.mouseOutCallback.call(this.callbackContext, event);
        }

        if (!this.input.enabled || !this.enabled)
        {
            return;
        }

        if (this.stopOnGameOut)
        {
            event['identifier'] = 0;

            this.input.mousePointer.stop(event);
        }

    },

    /**
    * The internal method that handles the mouse over event from the browser.
    *
    * @method Phaser.Mouse#onMouseOver
    * @param {MouseEvent} event - The native event from the browser. This gets stored in Mouse.event.
    */
    onMouseOver: function (event) {

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        this.input.mousePointer.withinGame = true;

        if (this.mouseOverCallback)
        {
            this.mouseOverCallback.call(this.callbackContext, event);
        }

    },

    /**
     * The internal method that handles the mouse wheel event from the browser.
     *
     * @method Phaser.Mouse#onMouseWheel
     * @param {MouseEvent} event - The native event from the browser.
     */
    onMouseWheel: function (event) {

        if (this._wheelEvent) {
            event = this._wheelEvent.bindEvent(event);
        }

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        // reverse detail for firefox
        this.wheelDelta = Phaser.Math.clamp(-event.deltaY, -1, 1);

        if (this.mouseWheelCallback)
        {
            this.mouseWheelCallback.call(this.callbackContext, event);
        }

    },

    /**
    * If the browser supports it you can request that the pointer be locked to the browser window.
    * This is classically known as 'FPS controls', where the pointer can't leave the browser until the user presses an exit key.
    * If the browser successfully enters a locked state the event Phaser.Mouse.pointerLock will be dispatched and the first parameter will be 'true'.
    * @method Phaser.Mouse#requestPointerLock
    */
    requestPointerLock: function () {

        if (this.game.device.pointerLock)
        {
            var element = this.game.canvas;

            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            element.requestPointerLock();

            var _this = this;

            this._pointerLockChange = function (event) {
                return _this.pointerLockChange(event);
            };

            document.addEventListener('pointerlockchange', this._pointerLockChange, true);
            document.addEventListener('mozpointerlockchange', this._pointerLockChange, true);
            document.addEventListener('webkitpointerlockchange', this._pointerLockChange, true);
        }

    },

    /**
    * Internal pointerLockChange handler.
    *
    * @method Phaser.Mouse#pointerLockChange
    * @param {Event} event - The native event from the browser. This gets stored in Mouse.event.
    */
    pointerLockChange: function (event) {

        var element = this.game.canvas;

        if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element)
        {
            //  Pointer was successfully locked
            this.locked = true;
            this.pointerLock.dispatch(true, event);
        }
        else
        {
            //  Pointer was unlocked
            this.locked = false;
            this.pointerLock.dispatch(false, event);
        }

    },

    /**
    * Internal release pointer lock handler.
    * @method Phaser.Mouse#releasePointerLock
    */
    releasePointerLock: function () {

        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

        document.exitPointerLock();

        document.removeEventListener('pointerlockchange', this._pointerLockChange, true);
        document.removeEventListener('mozpointerlockchange', this._pointerLockChange, true);
        document.removeEventListener('webkitpointerlockchange', this._pointerLockChange, true);

    },

    /**
    * Stop the event listeners.
    * @method Phaser.Mouse#stop
    */
    stop: function () {

        var canvas = this.game.canvas;

        canvas.removeEventListener('mousedown', this._onMouseDown, true);
        canvas.removeEventListener('mousemove', this._onMouseMove, true);
        canvas.removeEventListener('mouseup', this._onMouseUp, true);
        canvas.removeEventListener('mouseover', this._onMouseOver, true);
        canvas.removeEventListener('mouseout', this._onMouseOut, true);

        var wheelEvent = this.game.device.wheelEvent;

        if (wheelEvent)
        {
            canvas.removeEventListener(wheelEvent, this._onMouseWheel, true);
        }

        window.removeEventListener('mouseup', this._onMouseUpGlobal, true);
        window.removeEventListener('mouseout', this._onMouseOutGlobal, true);

        document.removeEventListener('pointerlockchange', this._pointerLockChange, true);
        document.removeEventListener('mozpointerlockchange', this._pointerLockChange, true);
        document.removeEventListener('webkitpointerlockchange', this._pointerLockChange, true);

    }

};

Phaser.Mouse.prototype.constructor = Phaser.Mouse;

/* jshint latedef:nofunc */
/**
* A purely internal event support class to proxy 'wheelscroll' and 'DOMMouseWheel'
* events to 'wheel'-like events.
*
* See https://developer.mozilla.org/en-US/docs/Web/Events/mousewheel for choosing a scale and delta mode.
*
* @method Phaser.Mouse#WheelEventProxy
* @private
* @param {number} scaleFactor - Scale factor as applied to wheelDelta/wheelDeltaX or details.
* @param {integer} deltaMode - The reported delta mode.
*/
function WheelEventProxy (scaleFactor, deltaMode) {

    /**
    * @property {number} _scaleFactor - Scale factor as applied to wheelDelta/wheelDeltaX or details.
    * @private
    */
    this._scaleFactor = scaleFactor;

    /**
    * @property {number} _deltaMode - The reported delta mode.
    * @private
    */
    this._deltaMode = deltaMode;

    /**
    * @property {any} originalEvent - The original event _currently_ being proxied; the getters will follow suit.
    * @private
    */
    this.originalEvent = null;

}

WheelEventProxy.prototype = {};
WheelEventProxy.prototype.constructor = WheelEventProxy;

WheelEventProxy.prototype.bindEvent = function (event) {

    // Generate stubs automatically
    if (!WheelEventProxy._stubsGenerated && event)
    {
        var makeBinder = function (name) {

            return function () {
                var v = this.originalEvent[name];
                return typeof v !== 'function' ? v : v.bind(this.originalEvent);
            };

        };

        for (var prop in event)
        {
            if (!(prop in WheelEventProxy.prototype))
            {
                Object.defineProperty(WheelEventProxy.prototype, prop, {
                    get: makeBinder(prop)
                });
            }
        }
        WheelEventProxy._stubsGenerated = true;
    }

    this.originalEvent = event;
    return this;

};

Object.defineProperties(WheelEventProxy.prototype, {
    "type": { value: "wheel" },
    "deltaMode": { get: function () { return this._deltaMode; } },
    "deltaY": {
        get: function () {
            return (this._scaleFactor * (this.originalEvent.wheelDelta || this.originalEvent.detail)) || 0;
        }
    },
    "deltaX": {
        get: function () {
            return (this._scaleFactor * this.originalEvent.wheelDeltaX) || 0;
        }
    },
    "deltaZ": { value: 0 }
});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The MSPointer class handles Microsoft touch interactions with the game and the resulting Pointer objects.
*
* It will work only in Internet Explorer 10+ and Windows Store or Windows Phone 8 apps using JavaScript.
* http://msdn.microsoft.com/en-us/library/ie/hh673557(v=vs.85).aspx
*
* You should not normally access this class directly, but instead use a Phaser.Pointer object which 
* normalises all game input for you including accurate button handling.
*
* Please note that at the current time of writing Phaser does not yet support chorded button interactions:
* http://www.w3.org/TR/pointerevents/#chorded-button-interactions
*
* @class Phaser.MSPointer
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.MSPointer = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * @property {Phaser.Input} input - A reference to the Phaser Input Manager.
    * @protected
    */
    this.input = game.input;

    /**
    * @property {object} callbackContext - The context under which callbacks are called (defaults to game).
    */
    this.callbackContext = this.game;

    /**
    * @property {function} pointerDownCallback - A callback that can be fired on a MSPointerDown event.
    */
    this.pointerDownCallback = null;

    /**
    * @property {function} pointerMoveCallback - A callback that can be fired on a MSPointerMove event.
    */
    this.pointerMoveCallback = null;

    /**
    * @property {function} pointerUpCallback - A callback that can be fired on a MSPointerUp event.
    */
    this.pointerUpCallback = null;

    /**
    * @property {boolean} capture - If true the Pointer events will have event.preventDefault applied to them, if false they will propagate fully.
    */
    this.capture = true;

    /**
    * This property was removed in Phaser 2.4 and should no longer be used.
    * Instead please see the Pointer button properties such as `Pointer.leftButton`, `Pointer.rightButton` and so on.
    * Or Pointer.button holds the DOM event button value if you require that.
    * @property {number} button
    */
    this.button = -1;

    /**
    * The browser MSPointer DOM event. Will be null if no event has ever been received.
    * Access this property only inside a Pointer event handler and do not keep references to it.
    * @property {MSPointerEvent|null} event
    * @default
    */
    this.event = null;

    /**
    * MSPointer input will only be processed if enabled.
    * @property {boolean} enabled
    * @default
    */
    this.enabled = true;

    /**
    * @property {function} _onMSPointerDown - Internal function to handle MSPointer events.
    * @private
    */
    this._onMSPointerDown = null;

    /**
    * @property {function} _onMSPointerMove - Internal function to handle MSPointer events.
    * @private
    */
    this._onMSPointerMove = null;

    /**
    * @property {function} _onMSPointerUp - Internal function to handle MSPointer events.
    * @private
    */
    this._onMSPointerUp = null;

    /**
    * @property {function} _onMSPointerUpGlobal - Internal function to handle MSPointer events.
    * @private
    */
    this._onMSPointerUpGlobal = null;

    /**
    * @property {function} _onMSPointerOut - Internal function to handle MSPointer events.
    * @private
    */
    this._onMSPointerOut = null;

    /**
    * @property {function} _onMSPointerOver - Internal function to handle MSPointer events.
    * @private
    */
    this._onMSPointerOver = null;

};

Phaser.MSPointer.prototype = {

    /**
    * Starts the event listeners running.
    * @method Phaser.MSPointer#start
    */
    start: function () {

        if (this._onMSPointerDown !== null)
        {
            //  Avoid setting multiple listeners
            return;
        }

        var _this = this;

        if (this.game.device.mspointer)
        {
            this._onMSPointerDown = function (event) {
                return _this.onPointerDown(event);
            };

            this._onMSPointerMove = function (event) {
                return _this.onPointerMove(event);
            };

            this._onMSPointerUp = function (event) {
                return _this.onPointerUp(event);
            };

            this._onMSPointerUpGlobal = function (event) {
                return _this.onPointerUpGlobal(event);
            };

            this._onMSPointerOut = function (event) {
                return _this.onPointerOut(event);
            };

            this._onMSPointerOver = function (event) {
                return _this.onPointerOver(event);
            };

            var canvas = this.game.canvas;

            canvas.addEventListener('MSPointerDown', this._onMSPointerDown, false);
            canvas.addEventListener('MSPointerMove', this._onMSPointerMove, false);
            canvas.addEventListener('MSPointerUp', this._onMSPointerUp, false);

            //  IE11+ uses non-prefix events
            canvas.addEventListener('pointerdown', this._onMSPointerDown, false);
            canvas.addEventListener('pointermove', this._onMSPointerMove, false);
            canvas.addEventListener('pointerup', this._onMSPointerUp, false);

            canvas.style['-ms-content-zooming'] = 'none';
            canvas.style['-ms-touch-action'] = 'none';

            if (!this.game.device.cocoonJS)
            {
                window.addEventListener('MSPointerUp', this._onMSPointerUpGlobal, true);
                canvas.addEventListener('MSPointerOver', this._onMSPointerOver, true);
                canvas.addEventListener('MSPointerOut', this._onMSPointerOut, true);

                //  IE11+ uses non-prefix events
                window.addEventListener('pointerup', this._onMSPointerUpGlobal, true);
                canvas.addEventListener('pointerover', this._onMSPointerOver, true);
                canvas.addEventListener('pointerout', this._onMSPointerOut, true);
            }
        }

    },

    /**
    * The function that handles the PointerDown event.
    * 
    * @method Phaser.MSPointer#onPointerDown
    * @param {PointerEvent} event - The native DOM event.
    */
    onPointerDown: function (event) {

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        if (this.pointerDownCallback)
        {
            this.pointerDownCallback.call(this.callbackContext, event);
        }

        if (!this.input.enabled || !this.enabled)
        {
            return;
        }

        event.identifier = event.pointerId;

        if (event.pointerType === 'mouse' || event.pointerType === 0x00000004)
        {
            this.input.mousePointer.start(event);
        }
        else
        {
            this.input.startPointer(event);
        }

    },

    /**
    * The function that handles the PointerMove event.
    * @method Phaser.MSPointer#onPointerMove
    * @param {PointerEvent} event - The native DOM event.
    */
    onPointerMove: function (event) {

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        if (this.pointerMoveCallback)
        {
            this.pointerMoveCallback.call(this.callbackContext, event);
        }

        if (!this.input.enabled || !this.enabled)
        {
            return;
        }

        event.identifier = event.pointerId;

        if (event.pointerType === 'mouse' || event.pointerType === 0x00000004)
        {
            this.input.mousePointer.move(event);
        }
        else
        {
            this.input.updatePointer(event);
        }

    },

    /**
    * The function that handles the PointerUp event.
    * @method Phaser.MSPointer#onPointerUp
    * @param {PointerEvent} event - The native DOM event.
    */
    onPointerUp: function (event) {

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        if (this.pointerUpCallback)
        {
            this.pointerUpCallback.call(this.callbackContext, event);
        }

        if (!this.input.enabled || !this.enabled)
        {
            return;
        }

        event.identifier = event.pointerId;

        if (event.pointerType === 'mouse' || event.pointerType === 0x00000004)
        {
            this.input.mousePointer.stop(event);
        }
        else
        {
            this.input.stopPointer(event);
        }

    },

    /**
    * The internal method that handles the mouse up event from the window.
    * 
    * @method Phaser.MSPointer#onPointerUpGlobal
    * @param {PointerEvent} event - The native event from the browser. This gets stored in MSPointer.event.
    */
    onPointerUpGlobal: function (event) {

        if ((event.pointerType === 'mouse' || event.pointerType === 0x00000004) && !this.input.mousePointer.withinGame)
        {
            this.onPointerUp(event);
        }
        else
        {
            var pointer = this.input.getPointerFromIdentifier(event.identifier);

            if (pointer && pointer.withinGame)
            {
                this.onPointerUp(event);
            }
        }

    },

    /**
    * The internal method that handles the pointer out event from the browser.
    *
    * @method Phaser.MSPointer#onPointerOut
    * @param {PointerEvent} event - The native event from the browser. This gets stored in MSPointer.event.
    */
    onPointerOut: function (event) {

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        if (event.pointerType === 'mouse' || event.pointerType === 0x00000004)
        {
            this.input.mousePointer.withinGame = false;
        }
        else
        {
            var pointer = this.input.getPointerFromIdentifier(event.identifier);

            if (pointer)
            {
                pointer.withinGame = false;
            }
        }

        if (this.input.mouse.mouseOutCallback)
        {
            this.input.mouse.mouseOutCallback.call(this.input.mouse.callbackContext, event);
        }

        if (!this.input.enabled || !this.enabled)
        {
            return;
        }

        if (this.input.mouse.stopOnGameOut)
        {
            event['identifier'] = 0;

            if (pointer)
            {
                pointer.stop(event);
            }
            else
            {
                this.input.mousePointer.stop(event);
            }
        }

    },

    /**
    * The internal method that handles the pointer out event from the browser.
    *
    * @method Phaser.MSPointer#onPointerOut
    * @param {PointerEvent} event - The native event from the browser. This gets stored in MSPointer.event.
    */
    onPointerOver: function (event) {

        this.event = event;

        if (this.capture)
        {
            event.preventDefault();
        }

        if (event.pointerType === 'mouse' || event.pointerType === 0x00000004)
        {
            this.input.mousePointer.withinGame = true;
        }
        else
        {
            var pointer = this.input.getPointerFromIdentifier(event.identifier);

            if (pointer)
            {
                pointer.withinGame = true;
            }
        }

        if (this.input.mouse.mouseOverCallback)
        {
            this.input.mouse.mouseOverCallback.call(this.input.mouse.callbackContext, event);
        }

    },

    /**
    * Stop the event listeners.
    * @method Phaser.MSPointer#stop
    */
    stop: function () {

        var canvas = this.game.canvas;

        canvas.removeEventListener('MSPointerDown', this._onMSPointerDown, false);
        canvas.removeEventListener('MSPointerMove', this._onMSPointerMove, false);
        canvas.removeEventListener('MSPointerUp', this._onMSPointerUp, false);

        //  IE11+ uses non-prefix events
        canvas.removeEventListener('pointerdown', this._onMSPointerDown, false);
        canvas.removeEventListener('pointermove', this._onMSPointerMove, false);
        canvas.removeEventListener('pointerup', this._onMSPointerUp, false);

        window.removeEventListener('MSPointerUp', this._onMSPointerUpGlobal, true);
        canvas.removeEventListener('MSPointerOver', this._onMSPointerOver, true);
        canvas.removeEventListener('MSPointerOut', this._onMSPointerOut, true);

        //  IE11+ uses non-prefix events
        window.removeEventListener('pointerup', this._onMSPointerUpGlobal, true);
        canvas.removeEventListener('pointerover', this._onMSPointerOver, true);
        canvas.removeEventListener('pointerout', this._onMSPointerOut, true);

    }

};

Phaser.MSPointer.prototype.constructor = Phaser.MSPointer;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @author       @karlmacklin <tacklemcclean@gmail.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* DeviceButtons belong to both `Phaser.Pointer` and `Phaser.SinglePad` (Gamepad) instances.
*
* For Pointers they represent the various buttons that can exist on mice and pens, such as the left button, right button,
* middle button and advanced buttons like back and forward.
*
* Access them via `Pointer.leftbutton`, `Pointer.rightButton` and so on.
*
* On Gamepads they represent all buttons on the pad: from shoulder buttons to action buttons.
*
* At the time of writing this there are device limitations you should be aware of:
*
* - On Windows, if you install a mouse driver, and its utility software allows you to customize button actions 
*   (e.g., IntelliPoint and SetPoint), the middle (wheel) button, the 4th button, and the 5th button might not be set, 
*   even when they are pressed.
* - On Linux (GTK), the 4th button and the 5th button are not supported.
* - On Mac OS X 10.5 there is no platform API for implementing any advanced buttons.
* 
* @class Phaser.DeviceButton
* @constructor
* @param {Phaser.Pointer|Phaser.SinglePad} parent - A reference to the parent of this button. Either a Pointer or a Gamepad.
* @param {number} buttonCode - The button code this DeviceButton is responsible for.
*/
Phaser.DeviceButton = function (parent, buttonCode) {

    /**
    * @property {Phaser.Pointer|Phaser.SinglePad} parent - A reference to the Pointer or Gamepad that owns this button.
    */
    this.parent = parent;

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = parent.game;

    /**
    * @property {object} event - The DOM event that caused the change in button state.
    * @default
    */
    this.event = null;

    /**
    * @property {boolean} isDown - The "down" state of the button.
    * @default
    */
    this.isDown = false;

    /**
    * @property {boolean} isUp - The "up" state of the button.
    * @default
    */
    this.isUp = true;

    /**
    * @property {number} timeDown - The timestamp when the button was last pressed down.
    * @default
    */
    this.timeDown = 0;

    /**
    * @property {number} timeUp - The timestamp when the button was last released.
    * @default
    */
    this.timeUp = 0;

    /**
    * Gamepad only.
    * If a button is held down this holds down the number of times the button has 'repeated'.
    * @property {number} repeats
    * @default
    */
    this.repeats = 0;

    /**
    * True if the alt key was held down when this button was last pressed or released.
    * Not supported on Gamepads.
    * @property {boolean} altKey
    * @default
    */
    this.altKey = false;

    /**
    * True if the shift key was held down when this button was last pressed or released.
    * Not supported on Gamepads.
    * @property {boolean} shiftKey
    * @default
    */
    this.shiftKey = false;

    /**
    * True if the control key was held down when this button was last pressed or released.
    * Not supported on Gamepads.
    * @property {boolean} ctrlKey
    * @default
    */
    this.ctrlKey = false;

    /**
    * @property {number} value - Button value. Mainly useful for checking analog buttons (like shoulder triggers) on Gamepads.
    * @default
    */
    this.value = 0;

    /**
    * @property {number} buttonCode - The buttoncode of this button if a Gamepad, or the DOM button event value if a Pointer.
    */
    this.buttonCode = buttonCode;

    /**
    * This Signal is dispatched every time this DeviceButton is pressed down.
    * It is only dispatched once (until the button is released again).
    * When dispatched it sends 2 arguments: A reference to this DeviceButton and the value of the button.
    * @property {Phaser.Signal} onDown
    */
    this.onDown = new Phaser.Signal();

    /**
    * This Signal is dispatched every time this DeviceButton is released from a down state.
    * It is only dispatched once (until the button is pressed again).
    * When dispatched it sends 2 arguments: A reference to this DeviceButton and the value of the button.
    * @property {Phaser.Signal} onUp
    */
    this.onUp = new Phaser.Signal();

    /**
    * Gamepad only.
    * This Signal is dispatched every time this DeviceButton changes floating value (between, but not exactly, 0 and 1).
    * When dispatched it sends 2 arguments: A reference to this DeviceButton and the value of the button.
    * @property {Phaser.Signal} onFloat
    */
    this.onFloat = new Phaser.Signal();

};

Phaser.DeviceButton.prototype = {

    /**
    * Called automatically by Phaser.Pointer and Phaser.SinglePad.
    * Handles the button down state.
    * 
    * @method Phaser.DeviceButton#start
    * @protected
    * @param {object} [event] - The DOM event that triggered the button change.
    * @param {number} [value] - The button value. Only get for Gamepads.
    */
    start: function (event, value) {

        if (this.isDown)
        {
            return;
        }

        this.isDown = true;
        this.isUp = false;
        this.timeDown = this.game.time.time;
        this.repeats = 0;

        this.event = event;
        this.value = value;

        if (event)
        {
            this.altKey = event.altKey;
            this.shiftKey = event.shiftKey;
            this.ctrlKey = event.ctrlKey;
        }

        this.onDown.dispatch(this, value);

    },

    /**
    * Called automatically by Phaser.Pointer and Phaser.SinglePad.
    * Handles the button up state.
    * 
    * @method Phaser.DeviceButton#stop
    * @protected
    * @param {object} [event] - The DOM event that triggered the button change.
    * @param {number} [value] - The button value. Only get for Gamepads.
    */
    stop: function (event, value) {

        if (this.isUp)
        {
            return;
        }

        this.isDown = false;
        this.isUp = true;
        this.timeUp = this.game.time.time;

        this.event = event;
        this.value = value;

        if (event)
        {
            this.altKey = event.altKey;
            this.shiftKey = event.shiftKey;
            this.ctrlKey = event.ctrlKey;
        }

        this.onUp.dispatch(this, value);

    },

    /**
    * Called automatically by Phaser.SinglePad.
    * 
    * @method Phaser.DeviceButton#padFloat
    * @protected
    * @param {number} value - Button value
    */
    padFloat: function (value) {

        this.value = value;

        this.onFloat.dispatch(this, value);

    },

    /**
    * Returns the "just pressed" state of this button.
    * Just pressed is considered true if the button was pressed down within the duration given (default 250ms).
    * 
    * @method Phaser.DeviceButton#justPressed
    * @param {number} [duration=250] - The duration in ms below which the button is considered as being just pressed.
    * @return {boolean} True if the button is just pressed otherwise false.
    */
    justPressed: function (duration) {

        duration = duration || 250;

        return (this.isDown && (this.timeDown + duration) > this.game.time.time);

    },

    /**
    * Returns the "just released" state of this button.
    * Just released is considered as being true if the button was released within the duration given (default 250ms).
    * 
    * @method Phaser.DeviceButton#justReleased
    * @param {number} [duration=250] - The duration in ms below which the button is considered as being just released.
    * @return {boolean} True if the button is just released otherwise false.
    */
    justReleased: function (duration) {

        duration = duration || 250;

        return (this.isUp && (this.timeUp + duration) > this.game.time.time);

    },

    /**
    * Resets this DeviceButton, changing it to an isUp state and resetting the duration and repeats counters.
    * 
    * @method Phaser.DeviceButton#reset
    */
    reset: function () {

        this.isDown = false;
        this.isUp = true;

        this.timeDown = this.game.time.time;
        this.repeats = 0;

        this.altKey = false;
        this.shiftKey = false;
        this.ctrlKey = false;

    },

    /**
    * Destroys this DeviceButton, this disposes of the onDown, onUp and onFloat signals 
    * and clears the parent and game references.
    * 
    * @method Phaser.DeviceButton#destroy
    */
    destroy: function () {

        this.onDown.dispose();
        this.onUp.dispose();
        this.onFloat.dispose();

        this.parent = null;
        this.game = null;

    }

};

Phaser.DeviceButton.prototype.constructor = Phaser.DeviceButton;

/**
* How long the button has been held down for in milliseconds.
* If not currently down it returns -1.
* 
* @name Phaser.DeviceButton#duration
* @property {number} duration
* @readonly
*/
Object.defineProperty(Phaser.DeviceButton.prototype, "duration", {

    get: function () {

        if (this.isUp)
        {
            return -1;
        }

        return this.game.time.time - this.timeDown;

    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Pointer object is used by the Mouse, Touch and MSPoint managers and represents a single finger on the touch screen.
*
* @class Phaser.Pointer
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {number} id - The ID of the Pointer object within the game. Each game can have up to 10 active pointers.
* @param {Phaser.PointerMode} pointerMode=(CURSOR|CONTACT) - The operational mode of this pointer, eg. CURSOR or TOUCH.
*/
Phaser.Pointer = function (game, id, pointerMode) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * @property {number} id - The ID of the Pointer object within the game. Each game can have up to 10 active pointers.
    */
    this.id = id;

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.POINTER;

    /**
    * @property {boolean} exists - A Pointer object that exists is allowed to be checked for physics collisions and overlaps.
    * @default
    */
    this.exists = true;

    /**
    * @property {number} identifier - The identifier property of the Pointer as set by the DOM event when this Pointer is started.
    * @default
    */
    this.identifier = 0;

    /**
    * @property {number} pointerId - The pointerId property of the Pointer as set by the DOM event when this Pointer is started. The browser can and will recycle this value.
    * @default
    */
    this.pointerId = null;

    /**
    * @property {Phaser.PointerMode} pointerMode - The operational mode of this pointer.
    */
    this.pointerMode = pointerMode || (Phaser.PointerMode.CURSOR | Phaser.PointerMode.CONTACT);

    /**
    * @property {any} target - The target property of the Pointer as set by the DOM event when this Pointer is started.
    * @default
    */
    this.target = null;

    /**
    * The button property of the most recent DOM event when this Pointer is started.
    * You should not rely on this value for accurate button detection, instead use the Pointer properties
    * `leftButton`, `rightButton`, `middleButton` and so on.
    * @property {any} button
    * @default
    */
    this.button = null;

    /**
    * If this Pointer is a Mouse or Pen / Stylus then you can access its left button directly through this property.
    * 
    * The DeviceButton has its own properties such as `isDown`, `duration` and methods like `justReleased` for more fine-grained
    * button control.
    * 
    * @property {Phaser.DeviceButton} leftButton
    * @default
    */
    this.leftButton = new Phaser.DeviceButton(this, Phaser.Pointer.LEFT_BUTTON);

    /**
    * If this Pointer is a Mouse or Pen / Stylus then you can access its middle button directly through this property.
    * 
    * The DeviceButton has its own properties such as `isDown`, `duration` and methods like `justReleased` for more fine-grained
    * button control.
    *
    * Please see the DeviceButton docs for details on browser button limitations.
    * 
    * @property {Phaser.DeviceButton} middleButton
    * @default
    */
    this.middleButton = new Phaser.DeviceButton(this, Phaser.Pointer.MIDDLE_BUTTON);

    /**
    * If this Pointer is a Mouse or Pen / Stylus then you can access its right button directly through this property.
    * 
    * The DeviceButton has its own properties such as `isDown`, `duration` and methods like `justReleased` for more fine-grained
    * button control.
    *
    * Please see the DeviceButton docs for details on browser button limitations.
    * 
    * @property {Phaser.DeviceButton} rightButton
    * @default
    */
    this.rightButton = new Phaser.DeviceButton(this, Phaser.Pointer.RIGHT_BUTTON);

    /**
    * If this Pointer is a Mouse or Pen / Stylus then you can access its X1 (back) button directly through this property.
    * 
    * The DeviceButton has its own properties such as `isDown`, `duration` and methods like `justReleased` for more fine-grained
    * button control.
    *
    * Please see the DeviceButton docs for details on browser button limitations.
    * 
    * @property {Phaser.DeviceButton} backButton
    * @default
    */
    this.backButton = new Phaser.DeviceButton(this, Phaser.Pointer.BACK_BUTTON);

    /**
    * If this Pointer is a Mouse or Pen / Stylus then you can access its X2 (forward) button directly through this property.
    * 
    * The DeviceButton has its own properties such as `isDown`, `duration` and methods like `justReleased` for more fine-grained
    * button control.
    *
    * Please see the DeviceButton docs for details on browser button limitations.
    * 
    * @property {Phaser.DeviceButton} forwardButton
    * @default
    */
    this.forwardButton = new Phaser.DeviceButton(this, Phaser.Pointer.FORWARD_BUTTON);

    /**
    * If this Pointer is a Pen / Stylus then you can access its eraser button directly through this property.
    * 
    * The DeviceButton has its own properties such as `isDown`, `duration` and methods like `justReleased` for more fine-grained
    * button control.
    *
    * Please see the DeviceButton docs for details on browser button limitations.
    * 
    * @property {Phaser.DeviceButton} eraserButton
    * @default
    */
    this.eraserButton = new Phaser.DeviceButton(this, Phaser.Pointer.ERASER_BUTTON);

    /**
    * @property {boolean} _holdSent - Local private variable to store the status of dispatching a hold event.
    * @private
    * @default
    */
    this._holdSent = false;

    /**
    * @property {array} _history - Local private variable storing the short-term history of pointer movements.
    * @private
    */
    this._history = [];

    /**
    * @property {number} _nextDrop - Local private variable storing the time at which the next history drop should occur.
    * @private
    */
    this._nextDrop = 0;

    /**
    * @property {boolean} _stateReset - Monitor events outside of a state reset loop.
    * @private
    */
    this._stateReset = false;

    /**
    * @property {boolean} withinGame - true if the Pointer is over the game canvas, otherwise false.
    */
    this.withinGame = false;

    /**
    * @property {number} clientX - The horizontal coordinate of the Pointer within the application's client area at which the event occurred (as opposed to the coordinates within the page).
    */
    this.clientX = -1;

    /**
    * @property {number} clientY - The vertical coordinate of the Pointer within the application's client area at which the event occurred (as opposed to the coordinates within the page).
    */
    this.clientY = -1;

    /**
    * @property {number} pageX - The horizontal coordinate of the Pointer relative to whole document.
    */
    this.pageX = -1;

    /**
    * @property {number} pageY - The vertical coordinate of the Pointer relative to whole document.
    */
    this.pageY = -1;

    /**
    * @property {number} screenX - The horizontal coordinate of the Pointer relative to the screen.
    */
    this.screenX = -1;

    /**
    * @property {number} screenY - The vertical coordinate of the Pointer relative to the screen.
    */
    this.screenY = -1;

    /**
    * @property {number} rawMovementX - The horizontal raw relative movement of the Pointer in pixels since last event.
    * @default
    */
    this.rawMovementX = 0;

    /**
    * @property {number} rawMovementY - The vertical raw relative movement of the Pointer in pixels since last event.
    * @default
    */
    this.rawMovementY = 0;

    /**
    * @property {number} movementX - The horizontal processed relative movement of the Pointer in pixels since last event.
    * @default
    */
    this.movementX = 0;

    /**
    * @property {number} movementY - The vertical processed relative movement of the Pointer in pixels since last event.
    * @default
    */
    this.movementY = 0;

    /**
    * @property {number} x - The horizontal coordinate of the Pointer. This value is automatically scaled based on the game scale.
    * @default
    */
    this.x = -1;

    /**
    * @property {number} y - The vertical coordinate of the Pointer. This value is automatically scaled based on the game scale.
    * @default
    */
    this.y = -1;

    /**
    * @property {boolean} isMouse - If the Pointer is a mouse or pen / stylus this is true, otherwise false.
    */
    this.isMouse = (id === 0);

    /**
    * If the Pointer is touching the touchscreen, or *any* mouse or pen button is held down, isDown is set to true.
    * If you need to check a specific mouse or pen button then use the button properties, i.e. Pointer.rightButton.isDown.
    * @property {boolean} isDown
    * @default
    */
    this.isDown = false;

    /**
    * If the Pointer is not touching the touchscreen, or *all* mouse or pen buttons are up, isUp is set to true.
    * If you need to check a specific mouse or pen button then use the button properties, i.e. Pointer.rightButton.isUp.
    * @property {boolean} isUp
    * @default
    */
    this.isUp = true;

    /**
    * @property {number} timeDown - A timestamp representing when the Pointer first touched the touchscreen.
    * @default
    */
    this.timeDown = 0;

    /**
    * @property {number} timeUp - A timestamp representing when the Pointer left the touchscreen.
    * @default
    */
    this.timeUp = 0;

    /**
    * @property {number} previousTapTime - A timestamp representing when the Pointer was last tapped or clicked.
    * @default
    */
    this.previousTapTime = 0;

    /**
    * @property {number} totalTouches - The total number of times this Pointer has been touched to the touchscreen.
    * @default
    */
    this.totalTouches = 0;

    /**
    * @property {number} msSinceLastClick - The number of milliseconds since the last click or touch event.
    * @default
    */
    this.msSinceLastClick = Number.MAX_VALUE;

    /**
    * @property {any} targetObject - The Game Object this Pointer is currently over / touching / dragging.
    * @default
    */
    this.targetObject = null;

    /**
    * This array is erased and re-populated every time this Pointer is updated. It contains references to all
    * of the Game Objects that were considered as being valid for processing by this Pointer, this frame. To be
    * valid they must have suitable a `priorityID`, be Input enabled, visible and actually have the Pointer over
    * them. You can check the contents of this array in events such as `onInputDown`, but beware it is reset
    * every frame.
    * @property {array} interactiveCandidates
    * @default
    */
    this.interactiveCandidates = [];

    /**
    * @property {boolean} active - An active pointer is one that is currently pressed down on the display. A Mouse is always active.
    * @default
    */
    this.active = false;

    /**
    * @property {boolean} dirty - A dirty pointer needs to re-poll any interactive objects it may have been over, regardless if it has moved or not.
    * @default
    */
    this.dirty = false;

    /**
    * @property {Phaser.Point} position - A Phaser.Point object containing the current x/y values of the pointer on the display.
    */
    this.position = new Phaser.Point();

    /**
    * @property {Phaser.Point} positionDown - A Phaser.Point object containing the x/y values of the pointer when it was last in a down state on the display.
    */
    this.positionDown = new Phaser.Point();
    
    /**
    * @property {Phaser.Point} positionUp - A Phaser.Point object containing the x/y values of the pointer when it was last released.
    */
    this.positionUp = new Phaser.Point();

    /**
    * A Phaser.Circle that is centered on the x/y coordinates of this pointer, useful for hit detection.
    * The Circle size is 44px (Apples recommended "finger tip" size).
    * @property {Phaser.Circle} circle
    */
    this.circle = new Phaser.Circle(0, 0, 44);

    /**
    * Click trampolines associated with this pointer. See `addClickTrampoline`.
    * @property {object[]|null} _clickTrampolines
    * @private
    */
    this._clickTrampolines = null;

    /**
    * When the Pointer has click trampolines the last target object is stored here
    * so it can be used to check for validity of the trampoline in a post-Up/'stop'.
    * @property {object} _trampolineTargetObject
    * @private
    */
    this._trampolineTargetObject = null;

};

/**
* No buttons at all.
* @constant
* @type {number}
*/
Phaser.Pointer.NO_BUTTON = 0;

/**
* The Left Mouse button, or in PointerEvent devices a Touch contact or Pen contact.
* @constant
* @type {number}
*/
Phaser.Pointer.LEFT_BUTTON = 1;

/**
* The Right Mouse button, or in PointerEvent devices a Pen contact with a barrel button.
* @constant
* @type {number}
*/
Phaser.Pointer.RIGHT_BUTTON = 2;

/**
* The Middle Mouse button.
* @constant
* @type {number}
*/
Phaser.Pointer.MIDDLE_BUTTON = 4;

/**
* The X1 button. This is typically the mouse Back button, but is often reconfigured.
* On Linux (GTK) this is unsupported. On Windows if advanced pointer software (such as IntelliPoint) is installed this doesn't register.
* @constant
* @type {number}
*/
Phaser.Pointer.BACK_BUTTON = 8;

/**
* The X2 button. This is typically the mouse Forward button, but is often reconfigured.
* On Linux (GTK) this is unsupported. On Windows if advanced pointer software (such as IntelliPoint) is installed this doesn't register.
* @constant
* @type {number}
*/
Phaser.Pointer.FORWARD_BUTTON = 16;

/**
* The Eraser pen button on PointerEvent supported devices only.
* @constant
* @type {number}
*/
Phaser.Pointer.ERASER_BUTTON = 32;

Phaser.Pointer.prototype = {

    /**
    * Resets the states of all the button booleans.
    * 
    * @method Phaser.Pointer#resetButtons
    * @protected
    */
    resetButtons: function () {

        this.isDown = false;
        this.isUp = true;

        if (this.isMouse)
        {
            this.leftButton.reset();
            this.middleButton.reset();
            this.rightButton.reset();
            this.backButton.reset();
            this.forwardButton.reset();
            this.eraserButton.reset();
        }

    },

    /**
    * Called by updateButtons.
    * 
    * @method Phaser.Pointer#processButtonsDown
    * @private
    * @param {integer} buttons - The DOM event.buttons property.
    * @param {MouseEvent} event - The DOM event.
    */
    processButtonsDown: function (buttons, event) {

        //  Note: These are bitwise checks, not booleans

        if (Phaser.Pointer.LEFT_BUTTON & buttons)
        {
            this.leftButton.start(event);
        }

        if (Phaser.Pointer.RIGHT_BUTTON & buttons)
        {
            this.rightButton.start(event);
        }
                
        if (Phaser.Pointer.MIDDLE_BUTTON & buttons)
        {
            this.middleButton.start(event);
        }

        if (Phaser.Pointer.BACK_BUTTON & buttons)
        {
            this.backButton.start(event);
        }

        if (Phaser.Pointer.FORWARD_BUTTON & buttons)
        {
            this.forwardButton.start(event);
        }

        if (Phaser.Pointer.ERASER_BUTTON & buttons)
        {
            this.eraserButton.start(event);
        }

    },

    /**
    * Called by updateButtons.
    * 
    * @method Phaser.Pointer#processButtonsUp
    * @private
    * @param {integer} buttons - The DOM event.buttons property.
    * @param {MouseEvent} event - The DOM event.
    */
    processButtonsUp: function (button, event) {

        //  Note: These are bitwise checks, not booleans

        if (button === Phaser.Mouse.LEFT_BUTTON)
        {
            this.leftButton.stop(event);
        }

        if (button === Phaser.Mouse.RIGHT_BUTTON)
        {
            this.rightButton.stop(event);
        }
                
        if (button === Phaser.Mouse.MIDDLE_BUTTON)
        {
            this.middleButton.stop(event);
        }

        if (button === Phaser.Mouse.BACK_BUTTON)
        {
            this.backButton.stop(event);
        }

        if (button === Phaser.Mouse.FORWARD_BUTTON)
        {
            this.forwardButton.stop(event);
        }

        if (button === 5)
        {
            this.eraserButton.stop(event);
        }

    },

    /**
    * Called when the event.buttons property changes from zero.
    * Contains a button bitmask.
    * 
    * @method Phaser.Pointer#updateButtons
    * @protected
    * @param {MouseEvent} event - The DOM event.
    */
    updateButtons: function (event) {

        this.button = event.button;

        var down = (event.type.toLowerCase().substr(-4) === 'down');

        if (event.buttons !== undefined)
        {
            if (down)
            {
                this.processButtonsDown(event.buttons, event);
            }
            else
            {
                this.processButtonsUp(event.button, event);
            }
        }
        else
        {
            //  No buttons property (like Safari on OSX when using a trackpad)
            if (down)
            {
                this.leftButton.start(event);
            }
            else
            {
                this.leftButton.stop(event);
                this.rightButton.stop(event);
            }
        }

        //  On OS X (and other devices with trackpads) you have to press CTRL + the pad
        //  to initiate a right-click event, so we'll check for that here ONLY if
        //  event.buttons = 1 (i.e. they only have a 1 button mouse or trackpad)

        if (event.buttons === 1 && event.ctrlKey && this.leftButton.isDown)
        {
            this.leftButton.stop(event);
            this.rightButton.start(event);
        }

        this.isUp = true;
        this.isDown = false;

        if (this.leftButton.isDown || this.rightButton.isDown || this.middleButton.isDown || this.backButton.isDown || this.forwardButton.isDown || this.eraserButton.isDown)
        {
            this.isUp = false;
            this.isDown = true;
        }

    },

    /**
    * Called when the Pointer is pressed onto the touchscreen.
    * @method Phaser.Pointer#start
    * @param {any} event - The DOM event from the browser.
    */
    start: function (event) {

        var input = this.game.input;

        if (event['pointerId'])
        {
            this.pointerId = event.pointerId;
        }

        this.identifier = event.identifier;
        this.target = event.target;

        if (this.isMouse)
        {
            this.updateButtons(event);
        }
        else
        {
            this.isDown = true;
            this.isUp = false;
        }

        this.active = true;
        this.withinGame = true;
        this.dirty = false;

        this._history = [];
        this._clickTrampolines = null;
        this._trampolineTargetObject = null;

        //  Work out how long it has been since the last click
        this.msSinceLastClick = this.game.time.time - this.timeDown;
        this.timeDown = this.game.time.time;
        this._holdSent = false;

        //  This sets the x/y and other local values
        this.move(event, true);

        // x and y are the old values here?
        this.positionDown.setTo(this.x, this.y);

        if (input.multiInputOverride === Phaser.Input.MOUSE_OVERRIDES_TOUCH ||
            input.multiInputOverride === Phaser.Input.MOUSE_TOUCH_COMBINE ||
            (input.multiInputOverride === Phaser.Input.TOUCH_OVERRIDES_MOUSE && input.totalActivePointers === 0))
        {
            input.x = this.x;
            input.y = this.y;
            input.position.setTo(this.x, this.y);
            input.onDown.dispatch(this, event);
            input.resetSpeed(this.x, this.y);
        }

        this._stateReset = false;

        this.totalTouches++;

        if (this.targetObject !== null)
        {
            this.targetObject._touchedHandler(this);
        }

        return this;

    },

    /**
    * Called by the Input Manager.
    * @method Phaser.Pointer#update
    */
    update: function () {

        var input = this.game.input;

        if (this.active)
        {
            //  Force a check?
            if (this.dirty)
            {
                if (input.interactiveItems.total > 0)
                {
                    this.processInteractiveObjects(false);
                }

                this.dirty = false;
            }

            if (this._holdSent === false && this.duration >= input.holdRate)
            {
                if (input.multiInputOverride === Phaser.Input.MOUSE_OVERRIDES_TOUCH ||
                    input.multiInputOverride === Phaser.Input.MOUSE_TOUCH_COMBINE ||
                    (input.multiInputOverride === Phaser.Input.TOUCH_OVERRIDES_MOUSE && input.totalActivePointers === 0))
                {
                    input.onHold.dispatch(this);
                }

                this._holdSent = true;
            }

            //  Update the droppings history
            if (input.recordPointerHistory && this.game.time.time >= this._nextDrop)
            {
                this._nextDrop = this.game.time.time + input.recordRate;

                this._history.push({
                    x: this.position.x,
                    y: this.position.y
                });

                if (this._history.length > input.recordLimit)
                {
                    this._history.shift();
                }
            }
        }

    },

    /**
    * Called when the Pointer is moved.
    * 
    * @method Phaser.Pointer#move
    * @param {MouseEvent|PointerEvent|TouchEvent} event - The event passed up from the input handler.
    * @param {boolean} [fromClick=false] - Was this called from the click event?
    */
    move: function (event, fromClick) {

        var input = this.game.input;

        if (input.pollLocked)
        {
            return;
        }

        if (fromClick === undefined) { fromClick = false; }

        if (event.button !== undefined)
        {
            this.button = event.button;
        }

        if (fromClick && this.isMouse)
        {
            this.updateButtons(event);
        }

        this.clientX = event.clientX;
        this.clientY = event.clientY;

        this.pageX = event.pageX;
        this.pageY = event.pageY;

        this.screenX = event.screenX;
        this.screenY = event.screenY;

        if (this.isMouse && input.mouse.locked && !fromClick)
        {
            this.rawMovementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            this.rawMovementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            this.movementX += this.rawMovementX;
            this.movementY += this.rawMovementY;
        }

        this.x = (this.pageX - this.game.scale.offset.x) * input.scale.x;
        this.y = (this.pageY - this.game.scale.offset.y) * input.scale.y;

        this.position.setTo(this.x, this.y);
        this.circle.x = this.x;
        this.circle.y = this.y;

        if (input.multiInputOverride === Phaser.Input.MOUSE_OVERRIDES_TOUCH ||
            input.multiInputOverride === Phaser.Input.MOUSE_TOUCH_COMBINE ||
            (input.multiInputOverride === Phaser.Input.TOUCH_OVERRIDES_MOUSE && input.totalActivePointers === 0))
        {
            input.activePointer = this;
            input.x = this.x;
            input.y = this.y;
            input.position.setTo(input.x, input.y);
            input.circle.x = input.x;
            input.circle.y = input.y;
        }

        this.withinGame = this.game.scale.bounds.contains(this.pageX, this.pageY);

        //  If the game is paused we don't process any target objects or callbacks
        if (this.game.paused)
        {
            return this;
        }

        var i = input.moveCallbacks.length;

        while (i--)
        {
            input.moveCallbacks[i].callback.call(input.moveCallbacks[i].context, this, this.x, this.y, fromClick);
        }

        //  Easy out if we're dragging something and it still exists
        if (this.targetObject !== null && this.targetObject.isDragged === true)
        {
            if (this.targetObject.update(this) === false)
            {
                this.targetObject = null;
            }
        }
        else if (input.interactiveItems.total > 0)
        {
            this.processInteractiveObjects(fromClick);
        }

        return this;

    },

    /**
    * Process all interactive objects to find out which ones were updated in the recent Pointer move.
    * 
    * @method Phaser.Pointer#processInteractiveObjects
    * @protected
    * @param {boolean} [fromClick=false] - Was this called from the click event?
    * @return {boolean} True if this method processes an object (i.e. a Sprite becomes the Pointers currentTarget), otherwise false.
    */
    processInteractiveObjects: function (fromClick) {

        //  Work out which object is on the top
        var highestRenderOrderID = 0;
        var highestInputPriorityID = -1;
        var candidateTarget = null;

        //  First pass gets all objects that the pointer is over that DON'T use pixelPerfect checks and get the highest ID
        //  We know they'll be valid for input detection but not which is the top just yet

        var currentNode = this.game.input.interactiveItems.first;

        this.interactiveCandidates = [];

        while (currentNode)
        {
            //  Reset checked status
            currentNode.checked = false;

            if (currentNode.validForInput(highestInputPriorityID, highestRenderOrderID, false))
            {
                //  Flag it as checked so we don't re-scan it on the next phase
                currentNode.checked = true;

                if ((fromClick && currentNode.checkPointerDown(this, true)) ||
                    (!fromClick && currentNode.checkPointerOver(this, true)))
                {
                    highestRenderOrderID = currentNode.sprite.renderOrderID;
                    highestInputPriorityID = currentNode.priorityID;
                    candidateTarget = currentNode;
                    this.interactiveCandidates.push(currentNode);
                }
            }

            currentNode = this.game.input.interactiveItems.next;
        }

        //  Then in the second sweep we process ONLY the pixel perfect ones that are checked and who have a higher ID
        //  because if their ID is lower anyway then we can just automatically discount them
        //  (A node that was previously checked did not request a pixel-perfect check.)

        currentNode = this.game.input.interactiveItems.first;

        while (currentNode)
        {
            if (!currentNode.checked &&
                currentNode.validForInput(highestInputPriorityID, highestRenderOrderID, true))
            {
                if ((fromClick && currentNode.checkPointerDown(this, false)) ||
                    (!fromClick && currentNode.checkPointerOver(this, false)))
                {
                    highestRenderOrderID = currentNode.sprite.renderOrderID;
                    highestInputPriorityID = currentNode.priorityID;
                    candidateTarget = currentNode;
                    this.interactiveCandidates.push(currentNode);
                }
            }

            currentNode = this.game.input.interactiveItems.next;
        }

        if (this.game.input.customCandidateHandler)
        {
            candidateTarget = this.game.input.customCandidateHandler.call(this.game.input.customCandidateHandlerContext, this, this.interactiveCandidates, candidateTarget);
        }

        this.swapTarget(candidateTarget, false);

        return (this.targetObject !== null);

    },

    /**
    * This will change the `Pointer.targetObject` object to be the one provided.
    * 
    * This allows you to have fine-grained control over which object the Pointer is targeting.
    *
    * Note that even if you set a new Target here, it is still able to be replaced by any other valid
    * target during the next Pointer update.
    *
    * @method Phaser.Pointer#swapTarget
    * @param {Phaser.InputHandler} newTarget - The new target for this Pointer. Note this is an `InputHandler`, so don't pass a Sprite, instead pass `sprite.input` to it.
    * @param {boolean} [silent=false] - If true the new target AND the old one will NOT dispatch their `onInputOver` or `onInputOut` events.
    */
    swapTarget: function (newTarget, silent) {

        if (silent === undefined) { silent = false; }

        //  Now we know the top-most item (if any) we can process it
        if (newTarget === null)
        {
            //  The pointer isn't currently over anything, check if we've got a lingering previous target
            if (this.targetObject)
            {
                this.targetObject._pointerOutHandler(this, silent);
                this.targetObject = null;
            }
        }
        else
        {
            if (this.targetObject === null)
            {
                //  And now set the new one
                this.targetObject = newTarget;
                newTarget._pointerOverHandler(this, silent);
            }
            else
            {
                //  We've got a target from the last update
                if (this.targetObject === newTarget)
                {
                    //  Same target as before, so update it
                    if (newTarget.update(this) === false)
                    {
                        this.targetObject = null;
                    }
                }
                else
                {
                    //  The target has changed, so tell the old one we've left it
                    this.targetObject._pointerOutHandler(this, silent);

                    //  And now set the new one
                    this.targetObject = newTarget;
                    this.targetObject._pointerOverHandler(this, silent);
                }
            }
        }

    },

    /**
    * Called when the Pointer leaves the target area.
    *
    * @method Phaser.Pointer#leave
    * @param {MouseEvent|PointerEvent|TouchEvent} event - The event passed up from the input handler.
    */
    leave: function (event) {

        this.withinGame = false;
        this.move(event, false);

    },

    /**
    * Called when the Pointer leaves the touchscreen.
    *
    * @method Phaser.Pointer#stop
    * @param {MouseEvent|PointerEvent|TouchEvent} event - The event passed up from the input handler.
    */
    stop: function (event) {

        var input = this.game.input;

        if (this._stateReset && this.withinGame)
        {
            event.preventDefault();
            return;
        }

        this.timeUp = this.game.time.time;

        if (input.multiInputOverride === Phaser.Input.MOUSE_OVERRIDES_TOUCH ||
            input.multiInputOverride === Phaser.Input.MOUSE_TOUCH_COMBINE ||
            (input.multiInputOverride === Phaser.Input.TOUCH_OVERRIDES_MOUSE && input.totalActivePointers === 0))
        {
            input.onUp.dispatch(this, event);

            //  Was it a tap?
            if (this.duration >= 0 && this.duration <= input.tapRate)
            {
                //  Was it a double-tap?
                if (this.timeUp - this.previousTapTime < input.doubleTapRate)
                {
                    //  Yes, let's dispatch the signal then with the 2nd parameter set to true
                    input.onTap.dispatch(this, true);
                }
                else
                {
                    //  Wasn't a double-tap, so dispatch a single tap signal
                    input.onTap.dispatch(this, false);
                }

                this.previousTapTime = this.timeUp;
            }
        }

        if (this.isMouse)
        {
            this.updateButtons(event);
        }
        else
        {
            this.isDown = false;
            this.isUp = true;
        }

        //  Mouse is always active
        if (this.id > 0)
        {
            this.active = false;
        }

        this.withinGame = this.game.scale.bounds.contains(event.pageX, event.pageY);
        this.pointerId = null;
        this.identifier = null;
        
        this.positionUp.setTo(this.x, this.y);
        
        if (this.isMouse === false)
        {
            input.currentPointers--;
        }

        input.interactiveItems.callAll('_releasedHandler', this);

        if (this._clickTrampolines)
        {
            this._trampolineTargetObject = this.targetObject;
        }

        this.targetObject = null;

        return this;

    },

    /**
    * The Pointer is considered justPressed if the time it was pressed onto the touchscreen or clicked is less than justPressedRate.
    * Note that calling justPressed doesn't reset the pressed status of the Pointer, it will return `true` for as long as the duration is valid.
    * If you wish to check if the Pointer was pressed down just once then see the Sprite.events.onInputDown event.
    * @method Phaser.Pointer#justPressed
    * @param {number} [duration] - The time to check against. If none given it will use InputManager.justPressedRate.
    * @return {boolean} true if the Pointer was pressed down within the duration given.
    */
    justPressed: function (duration) {

        duration = duration || this.game.input.justPressedRate;

        return (this.isDown === true && (this.timeDown + duration) > this.game.time.time);

    },

    /**
    * The Pointer is considered justReleased if the time it left the touchscreen is less than justReleasedRate.
    * Note that calling justReleased doesn't reset the pressed status of the Pointer, it will return `true` for as long as the duration is valid.
    * If you wish to check if the Pointer was released just once then see the Sprite.events.onInputUp event.
    * @method Phaser.Pointer#justReleased
    * @param {number} [duration] - The time to check against. If none given it will use InputManager.justReleasedRate.
    * @return {boolean} true if the Pointer was released within the duration given.
    */
    justReleased: function (duration) {

        duration = duration || this.game.input.justReleasedRate;

        return (this.isUp && (this.timeUp + duration) > this.game.time.time);

    },

    /**
    * Add a click trampoline to this pointer.
    *
    * A click trampoline is a callback that is run on the DOM 'click' event; this is primarily
    * needed with certain browsers (ie. IE11) which restrict some actions like requestFullscreen
    * to the DOM 'click' event and rejects it for 'pointer*' and 'mouse*' events.
    *
    * This is used internally by the ScaleManager; click trampoline usage is uncommon.
    * Click trampolines can only be added to pointers that are currently down.
    *
    * @method Phaser.Pointer#addClickTrampoline
    * @protected
    * @param {string} name - The name of the trampoline; must be unique among active trampolines in this pointer.
    * @param {function} callback - Callback to run/trampoline.
    * @param {object} callbackContext - Context of the callback.
    * @param {object[]|null} callbackArgs - Additional callback args, if any. Supplied as an array.
    */
    addClickTrampoline: function (name, callback, callbackContext, callbackArgs) {

        if (!this.isDown)
        {
            return;
        }

        var trampolines = (this._clickTrampolines = this._clickTrampolines || []);

        for (var i = 0; i < trampolines.length; i++)
        {
            if (trampolines[i].name === name)
            {
                trampolines.splice(i, 1);
                break;
            }
        }

        trampolines.push({
            name: name,
            targetObject: this.targetObject,
            callback: callback,
            callbackContext: callbackContext,
            callbackArgs: callbackArgs
        });

    },

    /**
    * Fire all click trampolines for which the pointers are still referring to the registered object.
    * @method Phaser.Pointer#processClickTrampolines
    * @private
    */
    processClickTrampolines: function () {

        var trampolines = this._clickTrampolines;

        if (!trampolines)
        {
            return;
        }

        for (var i = 0; i < trampolines.length; i++)
        {
            var trampoline = trampolines[i];

            if (trampoline.targetObject === this._trampolineTargetObject)
            {
                trampoline.callback.apply(trampoline.callbackContext, trampoline.callbackArgs);
            }
        }

        this._clickTrampolines = null;
        this._trampolineTargetObject = null;

    },

    /**
    * Resets the Pointer properties. Called by InputManager.reset when you perform a State change.
    * @method Phaser.Pointer#reset
    */
    reset: function () {

        if (this.isMouse === false)
        {
            this.active = false;
        }

        this.pointerId = null;
        this.identifier = null;
        this.dirty = false;
        this.totalTouches = 0;
        this._holdSent = false;
        this._history.length = 0;
        this._stateReset = true;

        this.resetButtons();

        if (this.targetObject)
        {
            this.targetObject._releasedHandler(this);
        }

        this.targetObject = null;

    },

    /**
     * Resets the movementX and movementY properties. Use in your update handler after retrieving the values.
     * @method Phaser.Pointer#resetMovement
     */
    resetMovement: function() {

        this.movementX = 0;
        this.movementY = 0;

    }

};

Phaser.Pointer.prototype.constructor = Phaser.Pointer;

/**
* How long the Pointer has been depressed on the touchscreen or *any* of the mouse buttons have been held down.
* If not currently down it returns -1.
* If you need to test a specific mouse or pen button then access the buttons directly, i.e. `Pointer.rightButton.duration`.
* 
* @name Phaser.Pointer#duration
* @property {number} duration
* @readonly
*/
Object.defineProperty(Phaser.Pointer.prototype, "duration", {

    get: function () {

        if (this.isUp)
        {
            return -1;
        }

        return this.game.time.time - this.timeDown;

    }

});

/**
* Gets the X value of this Pointer in world coordinates based on the world camera.
* @name Phaser.Pointer#worldX
* @property {number} worldX - The X value of this Pointer in world coordinates based on the world camera.
* @readonly
*/
Object.defineProperty(Phaser.Pointer.prototype, "worldX", {

    get: function () {

        return this.game.world.camera.x + this.x;

    }

});

/**
* Gets the Y value of this Pointer in world coordinates based on the world camera.
* @name Phaser.Pointer#worldY
* @property {number} worldY - The Y value of this Pointer in world coordinates based on the world camera.
* @readonly
*/
Object.defineProperty(Phaser.Pointer.prototype, "worldY", {

    get: function () {

        return this.game.world.camera.y + this.y;

    }

});

/**
* Enumeration categorizing operational modes of pointers.
*
* PointerType values represent valid bitmasks.
* For example, a value representing both Mouse and Touch devices
* can be expressed as `PointerMode.CURSOR | PointerMode.CONTACT`.
*
* Values may be added for future mode categorizations.
* @class Phaser.PointerMode
*/
Phaser.PointerMode = {

    /**
    * A 'CURSOR' is a pointer with a *passive cursor* such as a mouse, touchpad, watcom stylus, or even TV-control arrow-pad.
    *
    * It has the property that a cursor is passively moved without activating the input.
    * This currently corresponds with {@link Phaser.Pointer#isMouse} property.
    * @constant
    */
    CURSOR: 1 << 0,

    /**
    * A 'CONTACT' pointer has an *active cursor* that only tracks movement when actived; notably this is a touch-style input.
    * @constant
    */
    CONTACT: 1 << 1

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Phaser.Touch handles touch events with your game. Note: Android 2.x only supports 1 touch event at once, no multi-touch.
*
* You should not normally access this class directly, but instead use a Phaser.Pointer object which normalises all game input for you.
*
* @class Phaser.Touch
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.Touch = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * Touch events will only be processed if enabled.
    * @property {boolean} enabled
    * @default
    */
    this.enabled = true;

    /**
    * An array of callbacks that will be fired every time a native touch start or touch end event is received from the browser.
    * This is used internally to handle audio and video unlocking on mobile devices.
    * To add a callback to this array please use `Touch.addTouchLockCallback`.
    * @property {array} touchLockCallbacks
    * @protected
    */
    this.touchLockCallbacks = [];

    /**
    * @property {object} callbackContext - The context under which callbacks are called.
    */
    this.callbackContext = this.game;

    /**
    * @property {function} touchStartCallback - A callback that can be fired on a touchStart event.
    */
    this.touchStartCallback = null;

    /**
    * @property {function} touchMoveCallback - A callback that can be fired on a touchMove event.
    */
    this.touchMoveCallback = null;

    /**
    * @property {function} touchEndCallback - A callback that can be fired on a touchEnd event.
    */
    this.touchEndCallback = null;

    /**
    * @property {function} touchEnterCallback - A callback that can be fired on a touchEnter event.
    */
    this.touchEnterCallback = null;

    /**
    * @property {function} touchLeaveCallback - A callback that can be fired on a touchLeave event.
    */
    this.touchLeaveCallback = null;

    /**
    * @property {function} touchCancelCallback - A callback that can be fired on a touchCancel event.
    */
    this.touchCancelCallback = null;

    /**
    * @property {boolean} preventDefault - If true the TouchEvent will have prevent.default called on it.
    * @default
    */
    this.preventDefault = true;

    /**
    * @property {TouchEvent} event - The browser touch DOM event. Will be set to null if no touch event has ever been received.
    * @default
    */
    this.event = null;

    /**
    * @property {function} _onTouchStart - Internal event handler reference.
    * @private
    */
    this._onTouchStart = null;

    /**
    * @property {function} _onTouchMove - Internal event handler reference.
    * @private
    */
    this._onTouchMove = null;

    /**
    * @property {function} _onTouchEnd - Internal event handler reference.
    * @private
    */
    this._onTouchEnd = null;

    /**
    * @property {function} _onTouchEnter - Internal event handler reference.
    * @private
    */
    this._onTouchEnter = null;

    /**
    * @property {function} _onTouchLeave - Internal event handler reference.
    * @private
    */
    this._onTouchLeave = null;

    /**
    * @property {function} _onTouchCancel - Internal event handler reference.
    * @private
    */
    this._onTouchCancel = null;

    /**
    * @property {function} _onTouchMove - Internal event handler reference.
    * @private
    */
    this._onTouchMove = null;

};

Phaser.Touch.prototype = {

    /**
    * Starts the event listeners running.
    * @method Phaser.Touch#start
    */
    start: function () {

        if (this._onTouchStart !== null)
        {
            //  Avoid setting multiple listeners
            return;
        }

        var _this = this;

        if (this.game.device.touch)
        {
            this._onTouchStart = function (event) {
                return _this.onTouchStart(event);
            };

            this._onTouchMove = function (event) {
                return _this.onTouchMove(event);
            };

            this._onTouchEnd = function (event) {
                return _this.onTouchEnd(event);
            };

            this._onTouchEnter = function (event) {
                return _this.onTouchEnter(event);
            };

            this._onTouchLeave = function (event) {
                return _this.onTouchLeave(event);
            };

            this._onTouchCancel = function (event) {
                return _this.onTouchCancel(event);
            };

            this.game.canvas.addEventListener('touchstart', this._onTouchStart, false);
            this.game.canvas.addEventListener('touchmove', this._onTouchMove, false);
            this.game.canvas.addEventListener('touchend', this._onTouchEnd, false);
            this.game.canvas.addEventListener('touchcancel', this._onTouchCancel, false);

            if (!this.game.device.cocoonJS)
            {
                this.game.canvas.addEventListener('touchenter', this._onTouchEnter, false);
                this.game.canvas.addEventListener('touchleave', this._onTouchLeave, false);
            }
        }

    },

    /**
    * Consumes all touchmove events on the document (only enable this if you know you need it!).
    * @method Phaser.Touch#consumeTouchMove
    */
    consumeDocumentTouches: function () {

        this._documentTouchMove = function (event) {
            event.preventDefault();
        };

        document.addEventListener('touchmove', this._documentTouchMove, false);

    },

    /**
    * Adds a callback that is fired when a browser touchstart or touchend event is received.
    *
    * This is used internally to handle audio and video unlocking on mobile devices.
    *
    * If the callback returns 'true' then the callback is automatically deleted once invoked.
    *
    * The callback is added to the Phaser.Touch.touchLockCallbacks array and should be removed with Phaser.Touch.removeTouchLockCallback.
    * 
    * @method Phaser.Touch#addTouchLockCallback
    * @param {function} callback - The callback that will be called when a touchstart event is received.
    * @param {object} context - The context in which the callback will be called.
    * @param {boolean} [onEnd=false] - Will the callback fire on a touchstart (default) or touchend event?
    */
    addTouchLockCallback: function (callback, context, onEnd) {

        if (onEnd === undefined) { onEnd = false; }

        this.touchLockCallbacks.push({ callback: callback, context: context, onEnd: onEnd });

    },

    /**
    * Removes the callback at the defined index from the Phaser.Touch.touchLockCallbacks array
    * 
    * @method Phaser.Touch#removeTouchLockCallback
    * @param {function} callback - The callback to be removed.
    * @param {object} context - The context in which the callback exists.
    * @return {boolean} True if the callback was deleted, otherwise false.
    */
    removeTouchLockCallback: function (callback, context) {

        var i = this.touchLockCallbacks.length;

        while (i--)
        {
            if (this.touchLockCallbacks[i].callback === callback && this.touchLockCallbacks[i].context === context)
            {
                this.touchLockCallbacks.splice(i, 1);
                return true;
            }
        }

        return false;

    },

    /**
    * The internal method that handles the touchstart event from the browser.
    * @method Phaser.Touch#onTouchStart
    * @param {TouchEvent} event - The native event from the browser. This gets stored in Touch.event.
    */
    onTouchStart: function (event) {

        var i = this.touchLockCallbacks.length;

        while (i--)
        {
            var cb = this.touchLockCallbacks[i];

            if (!cb.onEnd && cb.callback.call(cb.context, this, event))
            {
                this.touchLockCallbacks.splice(i, 1);
            }
        }

        this.event = event;

        if (!this.game.input.enabled || !this.enabled)
        {
            return;
        }

        if (this.touchStartCallback)
        {
            this.touchStartCallback.call(this.callbackContext, event);
        }

        if (this.preventDefault)
        {
            event.preventDefault();
        }

        //  event.targetTouches = list of all touches on the TARGET ELEMENT (i.e. game dom element)
        //  event.touches = list of all touches on the ENTIRE DOCUMENT, not just the target element
        //  event.changedTouches = the touches that CHANGED in this event, not the total number of them
        for (var i = 0; i < event.changedTouches.length; i++)
        {
            this.game.input.startPointer(event.changedTouches[i]);
        }

    },

    /**
    * Touch cancel - touches that were disrupted (perhaps by moving into a plugin or browser chrome).
    * Occurs for example on iOS when you put down 4 fingers and the app selector UI appears.
    * @method Phaser.Touch#onTouchCancel
    * @param {TouchEvent} event - The native event from the browser. This gets stored in Touch.event.
    */
    onTouchCancel: function (event) {

        this.event = event;

        if (this.touchCancelCallback)
        {
            this.touchCancelCallback.call(this.callbackContext, event);
        }

        if (!this.game.input.enabled || !this.enabled)
        {
            return;
        }

        if (this.preventDefault)
        {
            event.preventDefault();
        }

        //  Touch cancel - touches that were disrupted (perhaps by moving into a plugin or browser chrome)
        //  http://www.w3.org/TR/touch-events/#dfn-touchcancel
        for (var i = 0; i < event.changedTouches.length; i++)
        {
            this.game.input.stopPointer(event.changedTouches[i]);
        }

    },

    /**
    * For touch enter and leave its a list of the touch points that have entered or left the target.
    * Doesn't appear to be supported by most browsers on a canvas element yet.
    * @method Phaser.Touch#onTouchEnter
    * @param {TouchEvent} event - The native event from the browser. This gets stored in Touch.event.
    */
    onTouchEnter: function (event) {

        this.event = event;

        if (this.touchEnterCallback)
        {
            this.touchEnterCallback.call(this.callbackContext, event);
        }

        if (!this.game.input.enabled || !this.enabled)
        {
            return;
        }

        if (this.preventDefault)
        {
            event.preventDefault();
        }

    },

    /**
    * For touch enter and leave its a list of the touch points that have entered or left the target.
    * Doesn't appear to be supported by most browsers on a canvas element yet.
    * @method Phaser.Touch#onTouchLeave
    * @param {TouchEvent} event - The native event from the browser. This gets stored in Touch.event.
    */
    onTouchLeave: function (event) {

        this.event = event;

        if (this.touchLeaveCallback)
        {
            this.touchLeaveCallback.call(this.callbackContext, event);
        }

        if (this.preventDefault)
        {
            event.preventDefault();
        }

    },

    /**
    * The handler for the touchmove events.
    * @method Phaser.Touch#onTouchMove
    * @param {TouchEvent} event - The native event from the browser. This gets stored in Touch.event.
    */
    onTouchMove: function (event) {

        this.event = event;

        if (this.touchMoveCallback)
        {
            this.touchMoveCallback.call(this.callbackContext, event);
        }

        if (this.preventDefault)
        {
            event.preventDefault();
        }

        for (var i = 0; i < event.changedTouches.length; i++)
        {
            this.game.input.updatePointer(event.changedTouches[i]);
        }

    },

    /**
    * The handler for the touchend events.
    * @method Phaser.Touch#onTouchEnd
    * @param {TouchEvent} event - The native event from the browser. This gets stored in Touch.event.
    */
    onTouchEnd: function (event) {

        var i = this.touchLockCallbacks.length;

        while (i--)
        {
            var cb = this.touchLockCallbacks[i];

            if (cb.onEnd && cb.callback.call(cb.context, this, event))
            {
                this.touchLockCallbacks.splice(i, 1);
            }
        }

        this.event = event;

        if (this.touchEndCallback)
        {
            this.touchEndCallback.call(this.callbackContext, event);
        }

        if (this.preventDefault)
        {
            event.preventDefault();
        }

        //  For touch end its a list of the touch points that have been removed from the surface
        //  https://developer.mozilla.org/en-US/docs/DOM/TouchList
        //  event.changedTouches = the touches that CHANGED in this event, not the total number of them
        for (var i = 0; i < event.changedTouches.length; i++)
        {
            this.game.input.stopPointer(event.changedTouches[i]);
        }

    },

    /**
    * Stop the event listeners.
    * @method Phaser.Touch#stop
    */
    stop: function () {

        if (this.game.device.touch)
        {
            this.game.canvas.removeEventListener('touchstart', this._onTouchStart);
            this.game.canvas.removeEventListener('touchmove', this._onTouchMove);
            this.game.canvas.removeEventListener('touchend', this._onTouchEnd);
            this.game.canvas.removeEventListener('touchenter', this._onTouchEnter);
            this.game.canvas.removeEventListener('touchleave', this._onTouchLeave);
            this.game.canvas.removeEventListener('touchcancel', this._onTouchCancel);
        }

    }

};

Phaser.Touch.prototype.constructor = Phaser.Touch;

