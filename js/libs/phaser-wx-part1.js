import PIXI from './pixi-wx.js';
import Phaser from './phaser-wx-main.js';
/**
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

// ES6 Math.trunc - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
if (!Math.trunc) {
    Math.trunc = function trunc(x) {
        return x < 0 ? Math.ceil(x) : Math.floor(x);
    };
}

/**
* A polyfill for Function.prototype.bind
*/
if (!Function.prototype.bind) {

    /* jshint freeze: false */
    Function.prototype.bind = (function () {

        var slice = Array.prototype.slice;

        return function (thisArg) {

            var target = this, boundArgs = slice.call(arguments, 1);

            if (typeof target !== 'function')
            {
                throw new TypeError();
            }

            function bound() {
                var args = boundArgs.concat(slice.call(arguments));
                target.apply(this instanceof bound ? this : thisArg, args);
            }

            bound.prototype = (function F(proto) {
                if (proto)
                {
                    F.prototype = proto;
                }

                if (!(this instanceof F))
                {
                    /* jshint supernew: true */
                    return new F;
                }
            })(target.prototype);

            return bound;
        };
    })();
}

/**
* A polyfill for Array.isArray
*/
if (!Array.isArray)
{
    Array.isArray = function (arg)
    {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

/**
* A polyfill for Array.forEach
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
*/
if (!Array.prototype.forEach)
{
    Array.prototype.forEach = function(fun /*, thisArg */)
    {
        "use strict";

        if (this === void 0 || this === null)
        {
            throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;

        if (typeof fun !== "function")
        {
            throw new TypeError();
        }

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;

        for (var i = 0; i < len; i++)
        {
            if (i in t)
            {
                fun.call(thisArg, t[i], i, t);
            }
        }
    };
}

/**
* Low-budget Float32Array knock-off, suitable for use with P2.js in IE9
* Source: http://www.html5gamedevs.com/topic/5988-phaser-12-ie9/
* Cameron Foale (http://www.kibibu.com)
*/
if (typeof window.Uint32Array !== "function" && typeof window.Uint32Array !== "object")
{
    var CheapArray = function(type)
    {
        var proto = new Array(); // jshint ignore:line

        window[type] = function(arg) {

            if (typeof(arg) === "number")
            {
                Array.call(this, arg);
                this.length = arg;

                for (var i = 0; i < this.length; i++)
                {
                    this[i] = 0;
                }
            }
            else
            {
                Array.call(this, arg.length);

                this.length = arg.length;

                for (var i = 0; i < this.length; i++)
                {
                    this[i] = arg[i];
                }
            }
        };

        window[type].prototype = proto;
        window[type].constructor = window[type];
    };

    CheapArray('Uint32Array'); // jshint ignore:line
    CheapArray('Int16Array');  // jshint ignore:line
}

/**
 * Also fix for the absent console in IE9
 */
if (!window.console)
{
    window.console = {};
    window.console.log = window.console.assert = function(){};
    window.console.warn = window.console.assert = function(){};
}

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* @class Phaser.Utils
* @static
*/
Phaser.Utils = {

    /**
    * Takes the given string and reverses it, returning the reversed string.
    * For example if given the string `Atari 520ST` it would return `TS025 iratA`.
    *
    * @method Phaser.Utils.reverseString
    * @param {string} string - The string to be reversed.
    * @return {string} The reversed string.
    */
    reverseString: function (string) {

        return string.split('').reverse().join('');

    },

    /**
     * Gets an objects property by string.
     *
     * @method Phaser.Utils.getProperty
     * @param {object} obj - The object to traverse.
     * @param {string} prop - The property whose value will be returned.
     * @return {*} the value of the property or null if property isn't found .
     */
    getProperty: function(obj, prop) {

        var parts = prop.split('.'),
            last = parts.pop(),
            l = parts.length,
            i = 1,
            current = parts[0];

        while (i < l && (obj = obj[current]))
        {
            current = parts[i];
            i++;
        }

        if (obj)
        {
            return obj[last];
        }
        else
        {
            return null;
        }

    },

    /**
     * Sets an objects property by string.
     *
     * @method Phaser.Utils.setProperty
     * @param {object} obj - The object to traverse
     * @param {string} prop - The property whose value will be changed
     * @return {object} The object on which the property was set.
     */
    setProperty: function(obj, prop, value) {

        var parts = prop.split('.'),
            last = parts.pop(),
            l = parts.length,
            i = 1,
            current = parts[0];

        while (i < l && (obj = obj[current]))
        {
            current = parts[i];
            i++;
        }

        if (obj)
        {
            obj[last] = value;
        }

        return obj;

    },

    /**
    * Generate a random bool result based on the chance value.
    *
    * Returns true or false based on the chance value (default 50%). For example if you wanted a player to have a 30% chance
    * of getting a bonus, call chanceRoll(30) - true means the chance passed, false means it failed.
    *
    * @method Phaser.Utils#chanceRoll
    * @param {number} chance - The chance of receiving the value. A number between 0 and 100 (effectively 0% to 100%).
    * @return {boolean} True if the roll passed, or false otherwise.
    */
    chanceRoll: function (chance) {
        if (chance === undefined) { chance = 50; }
        return chance > 0 && (Math.random() * 100 <= chance);
    },

    /**
    * Choose between one of two values randomly.
    *
    * @method Phaser.Utils#randomChoice
    * @param {any} choice1
    * @param {any} choice2
    * @return {any} The randomly selected choice
    */
    randomChoice: function (choice1, choice2) {
        return (Math.random() < 0.5) ? choice1 : choice2;
    },

    /**
    * Get a unit dimension from a string.
    *
    * @method Phaser.Utils.parseDimension
    * @param {string|number} size - The size to parse.
    * @param {number} dimension - The window dimension to check.
    * @return {number} The parsed dimension.
    */
    parseDimension: function (size, dimension) {

        var f = 0;
        var px = 0;

        if (typeof size === 'string')
        {
            //  %?
            if (size.substr(-1) === '%')
            {
                f = parseInt(size, 10) / 100;

                if (dimension === 0)
                {
                    px = window.innerWidth * f;
                }
                else
                {
                    px = window.innerHeight * f;
                }
            }
            else
            {
                px = parseInt(size, 10);
            }
        }
        else
        {
            px = size;
        }

        return px;

    },

    /**
    * Takes the given string and pads it out, to the length required, using the character
    * specified. For example if you need a string to be 6 characters long, you can call:
    *
    * `pad('bob', 6, '-', 2)`
    *
    * This would return: `bob---` as it has padded it out to 6 characters, using the `-` on the right.
    *
    * You can also use it to pad numbers (they are always returned as strings):
    * 
    * `pad(512, 6, '0', 1)`
    *
    * Would return: `000512` with the string padded to the left.
    *
    * If you don't specify a direction it'll pad to both sides:
    * 
    * `pad('c64', 7, '*')`
    *
    * Would return: `**c64**`
    *
    * @method Phaser.Utils.pad
    * @param {string} str - The target string. `toString()` will be called on the string, which means you can also pass in common data types like numbers.
    * @param {integer} [len=0] - The number of characters to be added.
    * @param {string} [pad=" "] - The string to pad it out with (defaults to a space).
    * @param {integer} [dir=3] - The direction dir = 1 (left), 2 (right), 3 (both).
    * @return {string} The padded string.
    */
    pad: function (str, len, pad, dir) {

        if (len === undefined) { var len = 0; }
        if (pad === undefined) { var pad = ' '; }
        if (dir === undefined) { var dir = 3; }

        str = str.toString();

        var padlen = 0;

        if (len + 1 >= str.length)
        {
            switch (dir)
            {
                case 1:
                    str = new Array(len + 1 - str.length).join(pad) + str;
                    break;

                case 3:
                    var right = Math.ceil((padlen = len - str.length) / 2);
                    var left = padlen - right;
                    str = new Array(left+1).join(pad) + str + new Array(right+1).join(pad);
                    break;

                default:
                    str = str + new Array(len + 1 - str.length).join(pad);
                    break;
            }
        }

        return str;

    },

    /**
    * This is a slightly modified version of jQuery.isPlainObject.
    * A plain object is an object whose internal class property is [object Object].
    * @method Phaser.Utils.isPlainObject
    * @param {object} obj - The object to inspect.
    * @return {boolean} - true if the object is plain, otherwise false.
    */
    isPlainObject: function (obj) {

        // Not plain objects:
        // - Any object or value whose internal [[Class]] property is not "[object Object]"
        // - DOM nodes
        // - window
        if (typeof(obj) !== "object" || obj.nodeType || obj === obj.window)
        {
            return false;
        }

        // Support: Firefox <20
        // The try/catch suppresses exceptions thrown when attempting to access
        // the "constructor" property of certain host objects, ie. |window.location|
        // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
        try {
            if (obj.constructor && !({}).hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf"))
            {
                return false;
            }
        } catch (e) {
            return false;
        }

        // If the function hasn't returned already, we're confident that
        // |obj| is a plain object, created by {} or constructed with new Object
        return true;
    },

    /**
    * This is a slightly modified version of http://api.jquery.com/jQuery.extend/
    * 
    * @method Phaser.Utils.extend
    * @param {boolean} deep - Perform a deep copy?
    * @param {object} target - The target object to copy to.
    * @return {object} The extended object.
    */
    extend: function () {

        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean")
        {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // extend Phaser if only one argument is passed
        if (length === i)
        {
            target = this;
            --i;
        }

        for (; i < length; i++)
        {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null)
            {
                // Extend the base object
                for (name in options)
                {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy)
                    {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (Phaser.Utils.isPlainObject(copy) || (copyIsArray = Array.isArray(copy))))
                    {
                        if (copyIsArray)
                        {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];
                        }
                        else
                        {
                            clone = src && Phaser.Utils.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = Phaser.Utils.extend(deep, clone, copy);

                    // Don't bring in undefined values
                    }
                    else if (copy !== undefined)
                    {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;

    },

    /**
    * Mixes in an existing mixin object with the target.
    *
    * Values in the mixin that have either `get` or `set` functions are created as properties via `defineProperty`
    * _except_ if they also define a `clone` method - if a clone method is defined that is called instead and
    * the result is assigned directly.
    *
    * @method Phaser.Utils.mixinPrototype
    * @param {object} target - The target object to receive the new functions.
    * @param {object} mixin - The object to copy the functions from.
    * @param {boolean} [replace=false] - If the target object already has a matching function should it be overwritten or not?
    */
    mixinPrototype: function (target, mixin, replace) {
    
        if (replace === undefined) { replace = false; }

        var mixinKeys = Object.keys(mixin);

        for (var i = 0; i < mixinKeys.length; i++)
        {
            var key = mixinKeys[i];
            var value = mixin[key];

            if (!replace && (key in target))
            {
                //  Not overwriting existing property
                continue;
            }
            else
            {
                if (value &&
                    (typeof value.get === 'function' || typeof value.set === 'function'))
                {
                    //  Special case for classes like Phaser.Point which has a 'set' function!
                    if (typeof value.clone === 'function')
                    {
                        target[key] = value.clone();
                    }
                    else
                    {
                        Object.defineProperty(target, key, value);
                    }
                }
                else
                {
                    target[key] = value;
                }
            }
        }

    },

    /**
    * Mixes the source object into the destination object, returning the newly modified destination object.
    * Based on original code by @mudcube
    *
    * @method Phaser.Utils.mixin
    * @param {object} from - The object to copy (the source object).
    * @param {object} to - The object to copy to (the destination object).
    * @return {object} The modified destination object.
    */
    mixin: function (from, to) {

        if (!from || typeof (from) !== "object")
        {
            return to;
        }

        for (var key in from)
        {
            var o = from[key];

            if (o.childNodes || o.cloneNode)
            {
                continue;
            }

            var type = typeof (from[key]);

            if (!from[key] || type !== "object")
            {
                to[key] = from[key];
            }
            else
            {
                //  Clone sub-object
                if (typeof (to[key]) === type)
                {
                    to[key] = Phaser.Utils.mixin(from[key], to[key]);
                }
                else
                {
                    to[key] = Phaser.Utils.mixin(from[key], new o.constructor());
                }
            }
        }

        return to;

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Creates a new Circle object with the center coordinate specified by the x and y parameters and the diameter specified by the diameter parameter.
* If you call this function without parameters, a circle with x, y, diameter and radius properties set to 0 is created.
* 
* @class Phaser.Circle
* @constructor
* @param {number} [x=0] - The x coordinate of the center of the circle.
* @param {number} [y=0] - The y coordinate of the center of the circle.
* @param {number} [diameter=0] - The diameter of the circle.
*/
Phaser.Circle = function (x, y, diameter) {

    x = x || 0;
    y = y || 0;
    diameter = diameter || 0;

    /**
    * @property {number} x - The x coordinate of the center of the circle.
    */
    this.x = x;

    /**
    * @property {number} y - The y coordinate of the center of the circle.
    */
    this.y = y;

    /**
    * @property {number} _diameter - The diameter of the circle.
    * @private
    */
    this._diameter = diameter;

    /**
   * @property {number} _radius - The radius of the circle.
   * @private
   */
    this._radius = 0;

    if (diameter > 0)
    {
        this._radius = diameter * 0.5;
    }

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.CIRCLE;

};

Phaser.Circle.prototype = {

    /**
    * The circumference of the circle.
    * 
    * @method Phaser.Circle#circumference
    * @return {number} The circumference of the circle.
    */
    circumference: function () {

        return 2 * (Math.PI * this._radius);

    },

    /**
    * Returns a uniformly distributed random point from anywhere within this Circle.
    * 
    * @method Phaser.Circle#random
    * @param {Phaser.Point|object} [out] - A Phaser.Point, or any object with public x/y properties, that the values will be set in.
    *     If no object is provided a new Phaser.Point object will be created. In high performance areas avoid this by re-using an existing object.
    * @return {Phaser.Point} An object containing the random point in its `x` and `y` properties.
    */
    random: function (out) {

        if (out === undefined) { out = new Phaser.Point(); }

        var t = 2 * Math.PI * Math.random();
        var u = Math.random() + Math.random();
        var r = (u > 1) ? 2 - u : u;
        var x = r * Math.cos(t);
        var y = r * Math.sin(t);

        out.x = this.x + (x * this.radius);
        out.y = this.y + (y * this.radius);

        return out;

    },

    /**
    * Returns the framing rectangle of the circle as a Phaser.Rectangle object.
    * 
    * @method Phaser.Circle#getBounds
    * @return {Phaser.Rectangle} The bounds of the Circle.
    */
    getBounds: function () {

        return new Phaser.Rectangle(this.x - this.radius, this.y - this.radius, this.diameter, this.diameter);

    },

    /**
    * Sets the members of Circle to the specified values.
    * @method Phaser.Circle#setTo
    * @param {number} x - The x coordinate of the center of the circle.
    * @param {number} y - The y coordinate of the center of the circle.
    * @param {number} diameter - The diameter of the circle.
    * @return {Circle} This circle object.
    */
    setTo: function (x, y, diameter) {

        this.x = x;
        this.y = y;
        this._diameter = diameter;
        this._radius = diameter * 0.5;

        return this;

    },

    /**
    * Copies the x, y and diameter properties from any given object to this Circle.
    * @method Phaser.Circle#copyFrom
    * @param {any} source - The object to copy from.
    * @return {Circle} This Circle object.
    */
    copyFrom: function (source) {

        return this.setTo(source.x, source.y, source.diameter);

    },

    /**
    * Copies the x, y and diameter properties from this Circle to any given object.
    * @method Phaser.Circle#copyTo
    * @param {any} dest - The object to copy to.
    * @return {object} This dest object.
    */
    copyTo: function (dest) {

        dest.x = this.x;
        dest.y = this.y;
        dest.diameter = this._diameter;

        return dest;

    },

    /**
    * Returns the distance from the center of the Circle object to the given object
    * (can be Circle, Point or anything with x/y properties)
    * @method Phaser.Circle#distance
    * @param {object} dest - The target object. Must have visible x and y properties that represent the center of the object.
    * @param {boolean} [round=false] - Round the distance to the nearest integer.
    * @return {number} The distance between this Point object and the destination Point object.
    */
    distance: function (dest, round) {

        var distance = Phaser.Math.distance(this.x, this.y, dest.x, dest.y);
        return round ? Math.round(distance) : distance;

    },

    /**
    * Returns a new Circle object with the same values for the x, y, width, and height properties as this Circle object.
    * @method Phaser.Circle#clone
    * @param {Phaser.Circle} output - Optional Circle object. If given the values will be set into the object, otherwise a brand new Circle object will be created and returned.
    * @return {Phaser.Circle} The cloned Circle object.
    */
    clone: function (output) {

        if (output === undefined || output === null)
        {
            output = new Phaser.Circle(this.x, this.y, this.diameter);
        }
        else
        {
            output.setTo(this.x, this.y, this.diameter);
        }

        return output;

    },

    /**
    * Return true if the given x/y coordinates are within this Circle object.
    * @method Phaser.Circle#contains
    * @param {number} x - The X value of the coordinate to test.
    * @param {number} y - The Y value of the coordinate to test.
    * @return {boolean} True if the coordinates are within this circle, otherwise false.
    */
    contains: function (x, y) {

        return Phaser.Circle.contains(this, x, y);

    },

    /**
    * Returns a Point object containing the coordinates of a point on the circumference of the Circle based on the given angle.
    * @method Phaser.Circle#circumferencePoint
    * @param {number} angle - The angle in radians (unless asDegrees is true) to return the point from.
    * @param {boolean} [asDegrees=false] - Is the given angle in radians (false) or degrees (true)?
    * @param {Phaser.Point} [out] - An optional Point object to put the result in to. If none specified a new Point object will be created.
    * @return {Phaser.Point} The Point object holding the result.
    */
    circumferencePoint: function (angle, asDegrees, out) {

        return Phaser.Circle.circumferencePoint(this, angle, asDegrees, out);

    },

    /**
    * Adjusts the location of the Circle object, as determined by its center coordinate, by the specified amounts.
    * @method Phaser.Circle#offset
    * @param {number} dx - Moves the x value of the Circle object by this amount.
    * @param {number} dy - Moves the y value of the Circle object by this amount.
    * @return {Circle} This Circle object.
    */
    offset: function (dx, dy) {

        this.x += dx;
        this.y += dy;

        return this;

    },

    /**
    * Adjusts the location of the Circle object using a Point object as a parameter. This method is similar to the Circle.offset() method, except that it takes a Point object as a parameter.
    * @method Phaser.Circle#offsetPoint
    * @param {Point} point A Point object to use to offset this Circle object (or any valid object with exposed x and y properties).
    * @return {Circle} This Circle object.
    */
    offsetPoint: function (point) {
        return this.offset(point.x, point.y);
    },

    /**
    * Returns a string representation of this object.
    * @method Phaser.Circle#toString
    * @return {string} a string representation of the instance.
    */
    toString: function () {
        return "[{Phaser.Circle (x=" + this.x + " y=" + this.y + " diameter=" + this.diameter + " radius=" + this.radius + ")}]";
    }

};

Phaser.Circle.prototype.constructor = Phaser.Circle;

/**
* The largest distance between any two points on the circle. The same as the radius * 2.
* 
* @name Phaser.Circle#diameter
* @property {number} diameter - Gets or sets the diameter of the circle.
*/
Object.defineProperty(Phaser.Circle.prototype, "diameter", {

    get: function () {
        return this._diameter;
    },

    set: function (value) {

        if (value > 0)
        {
            this._diameter = value;
            this._radius = value * 0.5;
        }
    }

});

/**
* The length of a line extending from the center of the circle to any point on the circle itself. The same as half the diameter.
* @name Phaser.Circle#radius
* @property {number} radius - Gets or sets the radius of the circle.
*/
Object.defineProperty(Phaser.Circle.prototype, "radius", {

    get: function () {
        return this._radius;
    },

    set: function (value) {

        if (value > 0)
        {
            this._radius = value;
            this._diameter = value * 2;
        }

    }

});

/**
* The x coordinate of the leftmost point of the circle. Changing the left property of a Circle object has no effect on the x and y properties. However it does affect the diameter, whereas changing the x value does not affect the diameter property.
* @name Phaser.Circle#left
* @propety {number} left - Gets or sets the value of the leftmost point of the circle.
*/
Object.defineProperty(Phaser.Circle.prototype, "left", {

    get: function () {
        return this.x - this._radius;
    },

    set: function (value) {

        if (value > this.x)
        {
            this._radius = 0;
            this._diameter = 0;
        }
        else
        {
            this.radius = this.x - value;
        }

    }

});

/**
* The x coordinate of the rightmost point of the circle. Changing the right property of a Circle object has no effect on the x and y properties. However it does affect the diameter, whereas changing the x value does not affect the diameter property.
* @name Phaser.Circle#right
* @property {number} right - Gets or sets the value of the rightmost point of the circle.
*/
Object.defineProperty(Phaser.Circle.prototype, "right", {

    get: function () {
        return this.x + this._radius;
    },

    set: function (value) {

        if (value < this.x)
        {
            this._radius = 0;
            this._diameter = 0;
        }
        else
        {
            this.radius = value - this.x;
        }

    }

});

/**
* The sum of the y minus the radius property. Changing the top property of a Circle object has no effect on the x and y properties, but does change the diameter.
* @name Phaser.Circle#top
* @property {number} top - Gets or sets the top of the circle.
*/
Object.defineProperty(Phaser.Circle.prototype, "top", {

    get: function () {
        return this.y - this._radius;
    },

    set: function (value) {

        if (value > this.y)
        {
            this._radius = 0;
            this._diameter = 0;
        }
        else
        {
            this.radius = this.y - value;
        }

    }

});

/**
* The sum of the y and radius properties. Changing the bottom property of a Circle object has no effect on the x and y properties, but does change the diameter.
* @name Phaser.Circle#bottom
* @property {number} bottom - Gets or sets the bottom of the circle.
*/
Object.defineProperty(Phaser.Circle.prototype, "bottom", {

    get: function () {
        return this.y + this._radius;
    },

    set: function (value) {

        if (value < this.y)
        {
            this._radius = 0;
            this._diameter = 0;
        }
        else
        {
            this.radius = value - this.y;
        }

    }

});

/**
* The area of this Circle.
* @name Phaser.Circle#area
* @property {number} area - The area of this circle.
* @readonly
*/
Object.defineProperty(Phaser.Circle.prototype, "area", {

    get: function () {

        if (this._radius > 0)
        {
            return Math.PI * this._radius * this._radius;
        }
        else
        {
            return 0;
        }

    }

});

/**
* Determines whether or not this Circle object is empty. Will return a value of true if the Circle objects diameter is less than or equal to 0; otherwise false.
* If set to true it will reset all of the Circle objects properties to 0. A Circle object is empty if its diameter is less than or equal to 0.
* @name Phaser.Circle#empty
* @property {boolean} empty - Gets or sets the empty state of the circle.
*/
Object.defineProperty(Phaser.Circle.prototype, "empty", {

    get: function () {
        return (this._diameter === 0);
    },

    set: function (value) {

        if (value === true)
        {
            this.setTo(0, 0, 0);
        }

    }

});

/**
* Return true if the given x/y coordinates are within the Circle object.
* @method Phaser.Circle.contains
* @param {Phaser.Circle} a - The Circle to be checked.
* @param {number} x - The X value of the coordinate to test.
* @param {number} y - The Y value of the coordinate to test.
* @return {boolean} True if the coordinates are within this circle, otherwise false.
*/
Phaser.Circle.contains = function (a, x, y) {

    //  Check if x/y are within the bounds first
    if (a.radius > 0 && x >= a.left && x <= a.right && y >= a.top && y <= a.bottom)
    {
        var dx = (a.x - x) * (a.x - x);
        var dy = (a.y - y) * (a.y - y);

        return (dx + dy) <= (a.radius * a.radius);
    }
    else
    {
        return false;
    }

};

/**
* Determines whether the two Circle objects match. This method compares the x, y and diameter properties.
* @method Phaser.Circle.equals
* @param {Phaser.Circle} a - The first Circle object.
* @param {Phaser.Circle} b - The second Circle object.
* @return {boolean} A value of true if the object has exactly the same values for the x, y and diameter properties as this Circle object; otherwise false.
*/
Phaser.Circle.equals = function (a, b) {

    return (a.x === b.x && a.y === b.y && a.diameter === b.diameter);

};

/**
* Determines whether the two Circle objects intersect.
* This method checks the radius distances between the two Circle objects to see if they intersect.
* @method Phaser.Circle.intersects
* @param {Phaser.Circle} a - The first Circle object.
* @param {Phaser.Circle} b - The second Circle object.
* @return {boolean} A value of true if the specified object intersects with this Circle object; otherwise false.
*/
Phaser.Circle.intersects = function (a, b) {

    return (Phaser.Math.distance(a.x, a.y, b.x, b.y) <= (a.radius + b.radius));

};

/**
* Returns a Point object containing the coordinates of a point on the circumference of the Circle based on the given angle.
* @method Phaser.Circle.circumferencePoint
* @param {Phaser.Circle} a - The first Circle object.
* @param {number} angle - The angle in radians (unless asDegrees is true) to return the point from.
* @param {boolean} [asDegrees=false] - Is the given angle in radians (false) or degrees (true)?
* @param {Phaser.Point} [out] - An optional Point object to put the result in to. If none specified a new Point object will be created.
* @return {Phaser.Point} The Point object holding the result.
*/
Phaser.Circle.circumferencePoint = function (a, angle, asDegrees, out) {

    if (asDegrees === undefined) { asDegrees = false; }
    if (out === undefined) { out = new Phaser.Point(); }

    if (asDegrees === true)
    {
        angle = Phaser.Math.degToRad(angle);
    }

    out.x = a.x + a.radius * Math.cos(angle);
    out.y = a.y + a.radius * Math.sin(angle);

    return out;

};

/**
* Checks if the given Circle and Rectangle objects intersect.
* @method Phaser.Circle.intersectsRectangle
* @param {Phaser.Circle} c - The Circle object to test.
* @param {Phaser.Rectangle} r - The Rectangle object to test.
* @return {boolean} True if the two objects intersect, otherwise false.
*/
Phaser.Circle.intersectsRectangle = function (c, r) {

    var cx = Math.abs(c.x - r.x - r.halfWidth);
    var xDist = r.halfWidth + c.radius;

    if (cx > xDist)
    {
        return false;
    }

    var cy = Math.abs(c.y - r.y - r.halfHeight);
    var yDist = r.halfHeight + c.radius;

    if (cy > yDist)
    {
        return false;
    }

    if (cx <= r.halfWidth || cy <= r.halfHeight)
    {
        return true;
    }

    var xCornerDist = cx - r.halfWidth;
    var yCornerDist = cy - r.halfHeight;
    var xCornerDistSq = xCornerDist * xCornerDist;
    var yCornerDistSq = yCornerDist * yCornerDist;
    var maxCornerDistSq = c.radius * c.radius;

    return xCornerDistSq + yCornerDistSq <= maxCornerDistSq;

};

//   Because PIXI uses its own Circle, we'll replace it with ours to avoid duplicating code or confusion.
PIXI.Circle = Phaser.Circle;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @author       Chad Engler <chad@pantherdev.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Creates a Ellipse object. A curve on a plane surrounding two focal points.
* 
* @class Phaser.Ellipse
* @constructor
* @param {number} [x=0] - The X coordinate of the upper-left corner of the framing rectangle of this ellipse.
* @param {number} [y=0] - The Y coordinate of the upper-left corner of the framing rectangle of this ellipse.
* @param {number} [width=0] - The overall width of this ellipse.
* @param {number} [height=0] - The overall height of this ellipse.
*/
Phaser.Ellipse = function (x, y, width, height) {

    x = x || 0;
    y = y || 0;
    width = width || 0;
    height = height || 0;

    /**
    * @property {number} x - The X coordinate of the upper-left corner of the framing rectangle of this ellipse.
    */
    this.x = x;

    /**
    * @property {number} y - The Y coordinate of the upper-left corner of the framing rectangle of this ellipse.
    */
    this.y = y;

    /**
    * @property {number} width - The overall width of this ellipse.
    */
    this.width = width;

    /**
    * @property {number} height - The overall height of this ellipse.
    */
    this.height = height;

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.ELLIPSE;

};

Phaser.Ellipse.prototype = {

    /**
    * Sets the members of the Ellipse to the specified values.
    * @method Phaser.Ellipse#setTo
    * @param {number} x - The X coordinate of the upper-left corner of the framing rectangle of this ellipse.
    * @param {number} y - The Y coordinate of the upper-left corner of the framing rectangle of this ellipse.
    * @param {number} width - The overall width of this ellipse.
    * @param {number} height - The overall height of this ellipse.
    * @return {Phaser.Ellipse} This Ellipse object.
    */
    setTo: function (x, y, width, height) {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        return this;

    },

    /**
    * Returns the framing rectangle of the ellipse as a Phaser.Rectangle object.
    * 
    * @method Phaser.Ellipse#getBounds
    * @return {Phaser.Rectangle} The bounds of the Ellipse.
    */
    getBounds: function () {

        return new Phaser.Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);

    },

    /**
    * Copies the x, y, width and height properties from any given object to this Ellipse.
    * 
    * @method Phaser.Ellipse#copyFrom
    * @param {any} source - The object to copy from.
    * @return {Phaser.Ellipse} This Ellipse object.
    */
    copyFrom: function (source) {

        return this.setTo(source.x, source.y, source.width, source.height);

    },

    /**
    * Copies the x, y, width and height properties from this Ellipse to any given object.
    * @method Phaser.Ellipse#copyTo
    * @param {any} dest - The object to copy to.
    * @return {object} This dest object.
    */
    copyTo: function(dest) {

        dest.x = this.x;
        dest.y = this.y;
        dest.width = this.width;
        dest.height = this.height;

        return dest;

    },

    /**
    * Returns a new Ellipse object with the same values for the x, y, width, and height properties as this Ellipse object.
    * @method Phaser.Ellipse#clone
    * @param {Phaser.Ellipse} output - Optional Ellipse object. If given the values will be set into the object, otherwise a brand new Ellipse object will be created and returned.
    * @return {Phaser.Ellipse} The cloned Ellipse object.
    */
    clone: function(output) {

        if (output === undefined || output === null)
        {
            output = new Phaser.Ellipse(this.x, this.y, this.width, this.height);
        }
        else
        {
            output.setTo(this.x, this.y, this.width, this.height);
        }

        return output;

    },

    /**
    * Return true if the given x/y coordinates are within this Ellipse object.
    * 
    * @method Phaser.Ellipse#contains
    * @param {number} x - The X value of the coordinate to test.
    * @param {number} y - The Y value of the coordinate to test.
    * @return {boolean} True if the coordinates are within this ellipse, otherwise false.
    */
    contains: function (x, y) {

        return Phaser.Ellipse.contains(this, x, y);

    },

    /**
    * Returns a uniformly distributed random point from anywhere within this Ellipse.
    * 
    * @method Phaser.Ellipse#random
    * @param {Phaser.Point|object} [out] - A Phaser.Point, or any object with public x/y properties, that the values will be set in.
    *     If no object is provided a new Phaser.Point object will be created. In high performance areas avoid this by re-using an existing object.
    * @return {Phaser.Point} An object containing the random point in its `x` and `y` properties.
    */
    random: function (out) {

        if (out === undefined) { out = new Phaser.Point(); }

        var p = Math.random() * Math.PI * 2;
        var r = Math.random();

        out.x = Math.sqrt(r) * Math.cos(p);
        out.y = Math.sqrt(r) * Math.sin(p);

        out.x = this.x + (out.x * this.width / 2.0);
        out.y = this.y + (out.y * this.height / 2.0);

        return out;

    },

    /**
    * Returns a string representation of this object.
    * @method Phaser.Ellipse#toString
    * @return {string} A string representation of the instance.
    */
    toString: function () {
        return "[{Phaser.Ellipse (x=" + this.x + " y=" + this.y + " width=" + this.width + " height=" + this.height + ")}]";
    }

};

Phaser.Ellipse.prototype.constructor = Phaser.Ellipse;

/**
* The left coordinate of the Ellipse. The same as the X coordinate.
* @name Phaser.Ellipse#left
* @propety {number} left - Gets or sets the value of the leftmost point of the ellipse.
*/
Object.defineProperty(Phaser.Ellipse.prototype, "left", {

    get: function () {
        return this.x;
    },

    set: function (value) {

        this.x = value;

    }

});

/**
* The x coordinate of the rightmost point of the Ellipse. Changing the right property of an Ellipse object has no effect on the x property, but does adjust the width.
* @name Phaser.Ellipse#right
* @property {number} right - Gets or sets the value of the rightmost point of the ellipse.
*/
Object.defineProperty(Phaser.Ellipse.prototype, "right", {

    get: function () {
        return this.x + this.width;
    },

    set: function (value) {

        if (value < this.x)
        {
            this.width = 0;
        }
        else
        {
            this.width = value - this.x;
        }
    }

});

/**
* The top of the Ellipse. The same as its y property.
* @name Phaser.Ellipse#top
* @property {number} top - Gets or sets the top of the ellipse.
*/
Object.defineProperty(Phaser.Ellipse.prototype, "top", {

    get: function () {
        return this.y;
    },

    set: function (value) {
        this.y = value;
    }

});

/**
* The sum of the y and height properties. Changing the bottom property of an Ellipse doesn't adjust the y property, but does change the height.
* @name Phaser.Ellipse#bottom
* @property {number} bottom - Gets or sets the bottom of the ellipse.
*/
Object.defineProperty(Phaser.Ellipse.prototype, "bottom", {

    get: function () {
        return this.y + this.height;
    },

    set: function (value) {

        if (value < this.y)
        {
            this.height = 0;
        }
        else
        {
            this.height = value - this.y;
        }
    }

});

/**
* Determines whether or not this Ellipse object is empty. Will return a value of true if the Ellipse objects dimensions are less than or equal to 0; otherwise false.
* If set to true it will reset all of the Ellipse objects properties to 0. An Ellipse object is empty if its width or height is less than or equal to 0.
* @name Phaser.Ellipse#empty
* @property {boolean} empty - Gets or sets the empty state of the ellipse.
*/
Object.defineProperty(Phaser.Ellipse.prototype, "empty", {

    get: function () {
        return (this.width === 0 || this.height === 0);
    },

    set: function (value) {

        if (value === true)
        {
            this.setTo(0, 0, 0, 0);
        }

    }

});

/**
* Return true if the given x/y coordinates are within the Ellipse object.
* 
* @method Phaser.Ellipse.contains
* @param {Phaser.Ellipse} a - The Ellipse to be checked.
* @param {number} x - The X value of the coordinate to test.
* @param {number} y - The Y value of the coordinate to test.
* @return {boolean} True if the coordinates are within this ellipse, otherwise false.
*/
Phaser.Ellipse.contains = function (a, x, y) {
 
    if (a.width <= 0 || a.height <= 0) {
        return false;
    }
 
    //  Normalize the coords to an ellipse with center 0,0 and a radius of 0.5
    var normx = ((x - a.x) / a.width) - 0.5;
    var normy = ((y - a.y) / a.height) - 0.5;
 
    normx *= normx;
    normy *= normy;
 
    return (normx + normy < 0.25);
 
};

//   Because PIXI uses its own Ellipse, we'll replace it with ours to avoid duplicating code or confusion.
PIXI.Ellipse = Phaser.Ellipse;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Creates a new Line object with a start and an end point.
*
* @class Phaser.Line
* @constructor
* @param {number} [x1=0] - The x coordinate of the start of the line.
* @param {number} [y1=0] - The y coordinate of the start of the line.
* @param {number} [x2=0] - The x coordinate of the end of the line.
* @param {number} [y2=0] - The y coordinate of the end of the line.
*/
Phaser.Line = function (x1, y1, x2, y2) {

    x1 = x1 || 0;
    y1 = y1 || 0;
    x2 = x2 || 0;
    y2 = y2 || 0;

    /**
    * @property {Phaser.Point} start - The start point of the line.
    */
    this.start = new Phaser.Point(x1, y1);

    /**
    * @property {Phaser.Point} end - The end point of the line.
    */
    this.end = new Phaser.Point(x2, y2);

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.LINE;

};

Phaser.Line.prototype = {

    /**
    * Sets the components of the Line to the specified values.
    *
    * @method Phaser.Line#setTo
    * @param {number} [x1=0] - The x coordinate of the start of the line.
    * @param {number} [y1=0] - The y coordinate of the start of the line.
    * @param {number} [x2=0] - The x coordinate of the end of the line.
    * @param {number} [y2=0] - The y coordinate of the end of the line.
    * @return {Phaser.Line} This line object
    */
    setTo: function (x1, y1, x2, y2) {

        this.start.setTo(x1, y1);
        this.end.setTo(x2, y2);

        return this;

    },

    /**
    * Sets the line to match the x/y coordinates of the two given sprites.
    * Can optionally be calculated from their center coordinates.
    *
    * @method Phaser.Line#fromSprite
    * @param {Phaser.Sprite} startSprite - The coordinates of this Sprite will be set to the Line.start point.
    * @param {Phaser.Sprite} endSprite - The coordinates of this Sprite will be set to the Line.start point.
    * @param {boolean} [useCenter=false] - If true it will use startSprite.center.x, if false startSprite.x. Note that Sprites don't have a center property by default, so only enable if you've over-ridden your Sprite with a custom class.
    * @return {Phaser.Line} This line object
    */
    fromSprite: function (startSprite, endSprite, useCenter) {

        if (useCenter === undefined) { useCenter = false; }

        if (useCenter)
        {
            return this.setTo(startSprite.center.x, startSprite.center.y, endSprite.center.x, endSprite.center.y);
        }

        return this.setTo(startSprite.x, startSprite.y, endSprite.x, endSprite.y);

    },

    /**
    * Sets this line to start at the given `x` and `y` coordinates and for the segment to extend at `angle` for the given `length`.
    *
    * @method Phaser.Line#fromAngle
    * @param {number} x - The x coordinate of the start of the line.
    * @param {number} y - The y coordinate of the start of the line.
    * @param {number} angle - The angle of the line in radians.
    * @param {number} length - The length of the line in pixels.
    * @return {Phaser.Line} This line object
    */
    fromAngle: function (x, y, angle, length) {

        this.start.setTo(x, y);
        this.end.setTo(x + (Math.cos(angle) * length), y + (Math.sin(angle) * length));

        return this;

    },

    /**
    * Rotates the line by the amount specified in `angle`.
    *
    * Rotation takes place from the center of the line.
    * If you wish to rotate around a different point see Line.rotateAround.
    *
    * If you wish to rotate the ends of the Line then see Line.start.rotate or Line.end.rotate.
    *
    * @method Phaser.Line#rotate
    * @param {number} angle - The angle in radians (unless asDegrees is true) to rotate the line by.
    * @param {boolean} [asDegrees=false] - Is the given angle in radians (false) or degrees (true)?
    * @return {Phaser.Line} This line object
    */
    rotate: function (angle, asDegrees) {

        var cx = (this.start.x + this.end.x) / 2;
        var cy = (this.start.y + this.end.y) / 2;

        this.start.rotate(cx, cy, angle, asDegrees);
        this.end.rotate(cx, cy, angle, asDegrees);

        return this;

    },

    /**
    * Rotates the line by the amount specified in `angle`.
    *
    * Rotation takes place around the coordinates given.
    *
    * @method Phaser.Line#rotateAround
    * @param {number} x - The x coordinate to offset the rotation from.
    * @param {number} y - The y coordinate to offset the rotation from.
    * @param {number} angle - The angle in radians (unless asDegrees is true) to rotate the line by.
    * @param {boolean} [asDegrees=false] - Is the given angle in radians (false) or degrees (true)?
    * @return {Phaser.Line} This line object
    */
    rotateAround: function (x, y, angle, asDegrees) {

        this.start.rotate(x, y, angle, asDegrees);
        this.end.rotate(x, y, angle, asDegrees);

        return this;

    },

    /**
    * Checks for intersection between this line and another Line.
    * If asSegment is true it will check for segment intersection. If asSegment is false it will check for line intersection.
    * Returns the intersection segment of AB and EF as a Point, or null if there is no intersection.
    *
    * @method Phaser.Line#intersects
    * @param {Phaser.Line} line - The line to check against this one.
    * @param {boolean} [asSegment=true] - If true it will check for segment intersection, otherwise full line intersection.
    * @param {Phaser.Point} [result] - A Point object to store the result in, if not given a new one will be created.
    * @return {Phaser.Point} The intersection segment of the two lines as a Point, or null if there is no intersection.
    */
    intersects: function (line, asSegment, result) {

        return Phaser.Line.intersectsPoints(this.start, this.end, line.start, line.end, asSegment, result);

    },

    /**
    * Returns the reflected angle between two lines.
    * This is the outgoing angle based on the angle of this line and the normalAngle of the given line.
    *
    * @method Phaser.Line#reflect
    * @param {Phaser.Line} line - The line to reflect off this line.
    * @return {number} The reflected angle in radians.
    */
    reflect: function (line) {

        return Phaser.Line.reflect(this, line);

    },

    /**
    * Returns a Point object where the x and y values correspond to the center (or midpoint) of the Line segment.
    *
    * @method Phaser.Line#midPoint
    * @param {Phaser.Point} [out] - A Phaser.Point object into which the result will be populated. If not given a new Point object is created.
    * @return {Phaser.Point} A Phaser.Point object with the x and y values set to the center of the line segment.
    */
    midPoint: function (out) {

        if (out === undefined) { out = new Phaser.Point(); }

        out.x = (this.start.x + this.end.x) / 2;
        out.y = (this.start.y + this.end.y) / 2;

        return out;

    },

    /**
    * Centers this Line on the given coordinates.
    *
    * The line is centered by positioning the start and end points so that the lines midpoint matches
    * the coordinates given.
    *
    * @method Phaser.Line#centerOn
    * @param {number} x - The x position to center the line on.
    * @param {number} y - The y position to center the line on.
    * @return {Phaser.Line} This line object
    */
    centerOn: function (x, y) {

        var cx = (this.start.x + this.end.x) / 2;
        var cy = (this.start.y + this.end.y) / 2;

        var tx = x - cx;
        var ty = y - cy;

        this.start.add(tx, ty);
        this.end.add(tx, ty);

    },

    /**
    * Tests if the given coordinates fall on this line. See pointOnSegment to test against just the line segment.
    *
    * @method Phaser.Line#pointOnLine
    * @param {number} x - The line to check against this one.
    * @param {number} y - The line to check against this one.
    * @return {boolean} True if the point is on the line, false if not.
    */
    pointOnLine: function (x, y) {

        return ((x - this.start.x) * (this.end.y - this.start.y) === (this.end.x - this.start.x) * (y - this.start.y));

    },

    /**
    * Tests if the given coordinates fall on this line and within the segment. See pointOnLine to test against just the line.
    *
    * @method Phaser.Line#pointOnSegment
    * @param {number} x - The line to check against this one.
    * @param {number} y - The line to check against this one.
    * @return {boolean} True if the point is on the line and segment, false if not.
    */
    pointOnSegment: function (x, y) {

        var xMin = Math.min(this.start.x, this.end.x);
        var xMax = Math.max(this.start.x, this.end.x);
        var yMin = Math.min(this.start.y, this.end.y);
        var yMax = Math.max(this.start.y, this.end.y);

        return (this.pointOnLine(x, y) && (x >= xMin && x <= xMax) && (y >= yMin && y <= yMax));

    },

    /**
    * Picks a random point from anywhere on the Line segment and returns it.
    *
    * @method Phaser.Line#random
    * @param {Phaser.Point|object} [out] - A Phaser.Point, or any object with public x/y properties, that the values will be set in.
    *     If no object is provided a new Phaser.Point object will be created. In high performance areas avoid this by re-using an object.
    * @return {Phaser.Point} An object containing the random point in its `x` and `y` properties.
    */
    random: function (out) {

        if (out === undefined) { out = new Phaser.Point(); }

        var t = Math.random();

        out.x = this.start.x + t * (this.end.x - this.start.x);
        out.y = this.start.y + t * (this.end.y - this.start.y);

        return out;

    },

    /**
    * Using Bresenham's line algorithm this will return an array of all coordinates on this line.
    * The start and end points are rounded before this runs as the algorithm works on integers.
    *
    * @method Phaser.Line#coordinatesOnLine
    * @param {number} [stepRate=1] - How many steps will we return? 1 = every coordinate on the line, 2 = every other coordinate, etc.
    * @param {array} [results] - The array to store the results in. If not provided a new one will be generated.
    * @return {array} An array of coordinates.
    */
    coordinatesOnLine: function (stepRate, results) {

        if (stepRate === undefined) { stepRate = 1; }
        if (results === undefined) { results = []; }

        var x1 = Math.round(this.start.x);
        var y1 = Math.round(this.start.y);
        var x2 = Math.round(this.end.x);
        var y2 = Math.round(this.end.y);

        var dx = Math.abs(x2 - x1);
        var dy = Math.abs(y2 - y1);
        var sx = (x1 < x2) ? 1 : -1;
        var sy = (y1 < y2) ? 1 : -1;
        var err = dx - dy;

        results.push([x1, y1]);

        var i = 1;

        while (!((x1 === x2) && (y1 === y2)))
        {
            var e2 = err << 1;

            if (e2 > -dy)
            {
                err -= dy;
                x1 += sx;
            }

            if (e2 < dx)
            {
                err += dx;
                y1 += sy;
            }

            if (i % stepRate === 0)
            {
                results.push([x1, y1]);
            }

            i++;

        }

        return results;

    },

    /**
     * Returns a new Line object with the same values for the start and end properties as this Line object.
     * @method Phaser.Line#clone
     * @param {Phaser.Line} output - Optional Line object. If given the values will be set into the object, otherwise a brand new Line object will be created and returned.
     * @return {Phaser.Line} The cloned Line object.
     */
    clone: function (output) {

        if (output === undefined || output === null)
        {
            output = new Phaser.Line(this.start.x, this.start.y, this.end.x, this.end.y);
        }
        else
        {
            output.setTo(this.start.x, this.start.y, this.end.x, this.end.y);
        }

        return output;

    }

};

/**
* @name Phaser.Line#length
* @property {number} length - Gets the length of the line segment.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "length", {

    get: function () {
        return Math.sqrt((this.end.x - this.start.x) * (this.end.x - this.start.x) + (this.end.y - this.start.y) * (this.end.y - this.start.y));
    }

});

/**
* @name Phaser.Line#angle
* @property {number} angle - Gets the angle of the line in radians.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "angle", {

    get: function () {
        return Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
    }

});

/**
* @name Phaser.Line#slope
* @property {number} slope - Gets the slope of the line (y/x).
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "slope", {

    get: function () {
        return (this.end.y - this.start.y) / (this.end.x - this.start.x);
    }

});

/**
* @name Phaser.Line#perpSlope
* @property {number} perpSlope - Gets the perpendicular slope of the line (x/y).
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "perpSlope", {

    get: function () {
        return -((this.end.x - this.start.x) / (this.end.y - this.start.y));
    }

});

/**
* @name Phaser.Line#x
* @property {number} x - Gets the x coordinate of the top left of the bounds around this line.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "x", {

    get: function () {
        return Math.min(this.start.x, this.end.x);
    }

});

/**
* @name Phaser.Line#y
* @property {number} y - Gets the y coordinate of the top left of the bounds around this line.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "y", {

    get: function () {
        return Math.min(this.start.y, this.end.y);
    }

});

/**
* @name Phaser.Line#left
* @property {number} left - Gets the left-most point of this line.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "left", {

    get: function () {
        return Math.min(this.start.x, this.end.x);
    }

});

/**
* @name Phaser.Line#right
* @property {number} right - Gets the right-most point of this line.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "right", {

    get: function () {
        return Math.max(this.start.x, this.end.x);
    }

});

/**
* @name Phaser.Line#top
* @property {number} top - Gets the top-most point of this line.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "top", {

    get: function () {
        return Math.min(this.start.y, this.end.y);
    }

});

/**
* @name Phaser.Line#bottom
* @property {number} bottom - Gets the bottom-most point of this line.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "bottom", {

    get: function () {
        return Math.max(this.start.y, this.end.y);
    }

});

/**
* @name Phaser.Line#width
* @property {number} width - Gets the width of this bounds of this line.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "width", {

    get: function () {
        return Math.abs(this.start.x - this.end.x);
    }

});

/**
* @name Phaser.Line#height
* @property {number} height - Gets the height of this bounds of this line.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "height", {

    get: function () {
        return Math.abs(this.start.y - this.end.y);
    }

});

/**
* @name Phaser.Line#normalX
* @property {number} normalX - Gets the x component of the left-hand normal of this line.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "normalX", {

    get: function () {
        return Math.cos(this.angle - 1.5707963267948966);
    }

});

/**
* @name Phaser.Line#normalY
* @property {number} normalY - Gets the y component of the left-hand normal of this line.
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "normalY", {

    get: function () {
        return Math.sin(this.angle - 1.5707963267948966);
    }

});

/**
* @name Phaser.Line#normalAngle
* @property {number} normalAngle - Gets the angle in radians of the normal of this line (line.angle - 90 degrees.)
* @readonly
*/
Object.defineProperty(Phaser.Line.prototype, "normalAngle", {

    get: function () {
        return Phaser.Math.wrap(this.angle - 1.5707963267948966, -Math.PI, Math.PI);
    }

});

/**
* Checks for intersection between two lines as defined by the given start and end points.
* If asSegment is true it will check for line segment intersection. If asSegment is false it will check for line intersection.
* Returns the intersection segment of AB and EF as a Point, or null if there is no intersection.
* Adapted from code by Keith Hair
*
* @method Phaser.Line.intersectsPoints
* @param {Phaser.Point} a - The start of the first Line to be checked.
* @param {Phaser.Point} b - The end of the first line to be checked.
* @param {Phaser.Point} e - The start of the second Line to be checked.
* @param {Phaser.Point} f - The end of the second line to be checked.
* @param {boolean} [asSegment=true] - If true it will check for segment intersection, otherwise full line intersection.
* @param {Phaser.Point|object} [result] - A Point object to store the result in, if not given a new one will be created.
* @return {Phaser.Point} The intersection segment of the two lines as a Point, or null if there is no intersection.
*/
Phaser.Line.intersectsPoints = function (a, b, e, f, asSegment, result) {

    if (asSegment === undefined) { asSegment = true; }
    if (result === undefined) { result = new Phaser.Point(); }

    var a1 = b.y - a.y;
    var a2 = f.y - e.y;
    var b1 = a.x - b.x;
    var b2 = e.x - f.x;
    var c1 = (b.x * a.y) - (a.x * b.y);
    var c2 = (f.x * e.y) - (e.x * f.y);
    var denom = (a1 * b2) - (a2 * b1);

    if (denom === 0)
    {
        return null;
    }

    result.x = ((b1 * c2) - (b2 * c1)) / denom;
    result.y = ((a2 * c1) - (a1 * c2)) / denom;

    if (asSegment)
    {
        var uc = ((f.y - e.y) * (b.x - a.x) - (f.x - e.x) * (b.y - a.y));
        var ua = (((f.x - e.x) * (a.y - e.y)) - (f.y - e.y) * (a.x - e.x)) / uc;
        var ub = (((b.x - a.x) * (a.y - e.y)) - ((b.y - a.y) * (a.x - e.x))) / uc;

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1)
        {
            return result;
        }
        else
        {
            return null;
        }
    }

    return result;

};

/**
* Checks for intersection between two lines.
* If asSegment is true it will check for segment intersection.
* If asSegment is false it will check for line intersection.
* Returns the intersection segment of AB and EF as a Point, or null if there is no intersection.
* Adapted from code by Keith Hair
*
* @method Phaser.Line.intersects
* @param {Phaser.Line} a - The first Line to be checked.
* @param {Phaser.Line} b - The second Line to be checked.
* @param {boolean} [asSegment=true] - If true it will check for segment intersection, otherwise full line intersection.
* @param {Phaser.Point} [result] - A Point object to store the result in, if not given a new one will be created.
* @return {Phaser.Point} The intersection segment of the two lines as a Point, or null if there is no intersection.
*/
Phaser.Line.intersects = function (a, b, asSegment, result) {

    return Phaser.Line.intersectsPoints(a.start, a.end, b.start, b.end, asSegment, result);

};

/**
* Checks for intersection between the Line and a Rectangle shape, or a rectangle-like
* object, with public `x`, `y`, `right` and `bottom` properties, such as a Sprite or Body.
*
* An intersection is considered valid if:
*
* The line starts within, or ends within, the Rectangle.
* The line segment intersects one of the 4 rectangle edges.
*
* The for the purposes of this function rectangles are considered 'solid'.
*
* @method Phaser.Line.intersectsRectangle
* @param {Phaser.Line} line - The line to check for intersection with.
* @param {Phaser.Rectangle|object} rect - The rectangle, or rectangle-like object, to check for intersection with.
* @return {boolean} True if the line intersects with the rectangle edges, or starts or ends within the rectangle.
*/
Phaser.Line.intersectsRectangle = function (line, rect) {

    //  Quick bail out of the Line and Rect bounds don't intersect
    if (!Phaser.Rectangle.intersects(line, rect))
    {
        return false;
    }

    var x1 = line.start.x;
    var y1 = line.start.y;

    var x2 = line.end.x;
    var y2 = line.end.y;

    var bx1 = rect.x;
    var by1 = rect.y;
    var bx2 = rect.right;
    var by2 = rect.bottom;

    var t = 0;

    //  If the start or end of the line is inside the rect then we assume
    //  collision, as rects are solid for our use-case.

    if ((x1 >= bx1 && x1 <= bx2 && y1 >= by1 && y1 <= by2) ||
        (x2 >= bx1 && x2 <= bx2 && y2 >= by1 && y2 <= by2))
    {
        return true;
    }

    if (x1 < bx1 && x2 >= bx1)
    {
        //  Left edge
        t = y1 + (y2 - y1) * (bx1 - x1) / (x2 - x1);

        if (t > by1 && t <= by2)
        {
            return true;
        }
    }
    else if (x1 > bx2 && x2 <= bx2)
    {
        //  Right edge
        t = y1 + (y2 - y1) * (bx2 - x1) / (x2 - x1);

        if (t >= by1 && t <= by2)
        {
            return true;
        }
    }

    if (y1 < by1 && y2 >= by1)
    {
        //  Top edge
        t = x1 + (x2 - x1) * (by1 - y1) / (y2 - y1);

        if (t >= bx1 && t <= bx2)
        {
            return true;
        }
    }
    else if (y1 > by2 && y2 <= by2)
    {
        //  Bottom edge
        t = x1 + (x2 - x1) * (by2 - y1) / (y2 - y1);

        if (t >= bx1 && t <= bx2)
        {
            return true;
        }
    }

    return false;

};

/**
* Returns the reflected angle between two lines.
* This is the outgoing angle based on the angle of Line 1 and the normalAngle of Line 2.
*
* @method Phaser.Line.reflect
* @param {Phaser.Line} a - The base line.
* @param {Phaser.Line} b - The line to be reflected from the base line.
* @return {number} The reflected angle in radians.
*/
Phaser.Line.reflect = function (a, b) {

    return 2 * b.normalAngle - 3.141592653589793 - a.angle;

};

/**
* @author       Mat Groves http://matgroves.com/ @Doormat23
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Matrix is a 3x3 matrix mostly used for display transforms within the renderer.
* 
* It is represented like so:
* 
* | a | b | tx |
* | c | d | ty |
* | 0 | 0 | 1 |
*
* @class Phaser.Matrix
* @constructor
* @param {number} [a=1] - Horizontal scaling
* @param {number} [b=0] - Horizontal skewing
* @param {number} [c=0] - Vertical skewing
* @param {number} [d=1] - Vertical scaling
* @param {number} [tx=0] - Horizontal translation
* @param {number} [ty=0] - Vertical translation
*/
Phaser.Matrix = function (a, b, c, d, tx, ty) {

    if (a === undefined || a === null) { a = 1; }
    if (b === undefined || b === null) { b = 0; }
    if (c === undefined || c === null) { c = 0; }
    if (d === undefined || d === null) { d = 1; }
    if (tx === undefined || tx === null) { tx = 0; }
    if (ty === undefined || ty === null) { ty = 0; }

    /**
    * @property {number} a
    * @default 1
    */
    this.a = a;

    /**
    * @property {number} b
    * @default 0
    */
    this.b = b;

    /**
    * @property {number} c
    * @default 0
    */
    this.c = c;

    /**
    * @property {number} d
    * @default 1
    */
    this.d = d;

    /**
    * @property {number} tx
    * @default 0
    */
    this.tx = tx;

    /**
    * @property {number} ty
    * @default 0
    */
    this.ty = ty;

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.MATRIX;

};

Phaser.Matrix.prototype = {

    /**
    * Sets the values of this Matrix to the values in the given array.
    * 
    * The Array elements should be set as follows:
    *
    * a = array[0]
    * b = array[1]
    * c = array[3]
    * d = array[4]
    * tx = array[2]
    * ty = array[5]
    *
    * @method Phaser.Matrix#fromArray
    * @param {Array} array - The array to copy from.
    * @return {Phaser.Matrix} This Matrix object.
    */
    fromArray: function (array) {

        return this.setTo(array[0], array[1], array[3], array[4], array[2], array[5]);

    },

    /**
    * Sets the values of this Matrix to the given values.
    *
    * @method Phaser.Matrix#setTo
    * @param {number} a - Horizontal scaling
    * @param {number} b - Horizontal skewing
    * @param {number} c - Vertical skewing
    * @param {number} d - Vertical scaling
    * @param {number} tx - Horizontal translation
    * @param {number} ty - Vertical translation
    * @return {Phaser.Matrix} This Matrix object.
    */
    setTo: function (a, b, c, d, tx, ty) {

        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;

        return this;

    },

    /**
     * Creates a new Matrix object based on the values of this Matrix.
     * If you provide the output parameter the values of this Matrix will be copied over to it.
     * If the output parameter is blank a new Matrix object will be created.
     *
     * @method Phaser.Matrix#clone
     * @param {Phaser.Matrix} [output] - If provided the values of this Matrix will be copied to it, otherwise a new Matrix object is created.
     * @return {Phaser.Matrix} A clone of this Matrix.
     */
    clone: function (output) {

        if (output === undefined || output === null)
        {
            output = new Phaser.Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
        }
        else
        {
            output.a = this.a;
            output.b = this.b;
            output.c = this.c;
            output.d = this.d;
            output.tx = this.tx;
            output.ty = this.ty;
        }

        return output;

    },

    /**
    * Copies the properties from this Matrix to the given Matrix.
    *
    * @method Phaser.Matrix#copyTo
    * @param {Phaser.Matrix} matrix - The Matrix to copy from.
    * @return {Phaser.Matrix} The destination Matrix object.
    */
    copyTo: function (matrix) {

        matrix.copyFrom(this);

        return matrix;

    },

    /**
    * Copies the properties from the given Matrix into this Matrix.
    *
    * @method Phaser.Matrix#copyFrom
    * @param {Phaser.Matrix} matrix - The Matrix to copy from.
    * @return {Phaser.Matrix} This Matrix object.
    */
    copyFrom: function (matrix) {

        this.a = matrix.a;
        this.b = matrix.b;
        this.c = matrix.c;
        this.d = matrix.d;
        this.tx = matrix.tx;
        this.ty = matrix.ty;

        return this;

    },

    /**
    * Creates a Float32 Array with values populated from this Matrix object.
    *
    * @method Phaser.Matrix#toArray
    * @param {boolean} [transpose=false] - Whether the values in the array are transposed or not.
    * @param {PIXI.Float32Array} [array] - If provided the values will be set into this array, otherwise a new Float32Array is created.
    * @return {PIXI.Float32Array} The newly created array which contains the matrix.
    */
    toArray: function (transpose, array) {

        if (array === undefined) { array = new PIXI.Float32Array(9); }

        if (transpose)
        {
            array[0] = this.a;
            array[1] = this.b;
            array[2] = 0;
            array[3] = this.c;
            array[4] = this.d;
            array[5] = 0;
            array[6] = this.tx;
            array[7] = this.ty;
            array[8] = 1;
        }
        else
        {
            array[0] = this.a;
            array[1] = this.c;
            array[2] = this.tx;
            array[3] = this.b;
            array[4] = this.d;
            array[5] = this.ty;
            array[6] = 0;
            array[7] = 0;
            array[8] = 1;
        }

        return array;

    },

    /**
    * Get a new position with the current transformation applied.
    * 
    * Can be used to go from a childs coordinate space to the world coordinate space (e.g. rendering)
    *
    * @method Phaser.Matrix#apply
    * @param {Phaser.Point} pos - The origin Point.
    * @param {Phaser.Point} [newPos] - The point that the new position is assigned to. This can be same as input point.
    * @return {Phaser.Point} The new point, transformed through this matrix.
    */
    apply: function (pos, newPos) {

        if (newPos === undefined) { newPos = new Phaser.Point(); }

        newPos.x = this.a * pos.x + this.c * pos.y + this.tx;
        newPos.y = this.b * pos.x + this.d * pos.y + this.ty;

        return newPos;

    },

    /**
    * Get a new position with the inverse of the current transformation applied.
    * 
    * Can be used to go from the world coordinate space to a childs coordinate space. (e.g. input)
    *
    * @method Phaser.Matrix#applyInverse
    * @param {Phaser.Point} pos - The origin Point.
    * @param {Phaser.Point} [newPos] - The point that the new position is assigned to. This can be same as input point.
    * @return {Phaser.Point} The new point, inverse transformed through this matrix.
    */
    applyInverse: function (pos, newPos) {

        if (newPos === undefined) { newPos = new Phaser.Point(); }

        var id = 1 / (this.a * this.d + this.c * -this.b);
        var x = pos.x;
        var y = pos.y;

        newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id;
        newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id;

        return newPos;

    },

    /**
    * Translates the matrix on the x and y.
    * This is the same as Matrix.tx += x.
    * 
    * @method Phaser.Matrix#translate
    * @param {number} x - The x value to translate on.
    * @param {number} y - The y value to translate on.
    * @return {Phaser.Matrix} This Matrix object.
    */
    translate: function (x, y) {

        this.tx += x;
        this.ty += y;
        
        return this;

    },

    /**
    * Applies a scale transformation to this matrix.
    * 
    * @method Phaser.Matrix#scale
    * @param {number} x - The amount to scale horizontally.
    * @param {number} y - The amount to scale vertically.
    * @return {Phaser.Matrix} This Matrix object.
    */
    scale: function (x, y) {

        this.a *= x;
        this.d *= y;
        this.c *= x;
        this.b *= y;
        this.tx *= x;
        this.ty *= y;

        return this;

    },

    /**
    * Applies a rotation transformation to this matrix.
    * 
    * @method Phaser.Matrix#rotate
    * @param {number} angle - The angle to rotate by, given in radians.
    * @return {Phaser.Matrix} This Matrix object.
    */
    rotate: function (angle) {

        var cos = Math.cos(angle);
        var sin = Math.sin(angle);

        var a1 = this.a;
        var c1 = this.c;
        var tx1 = this.tx;

        this.a = a1 * cos-this.b * sin;
        this.b = a1 * sin+this.b * cos;
        this.c = c1 * cos-this.d * sin;
        this.d = c1 * sin+this.d * cos;
        this.tx = tx1 * cos - this.ty * sin;
        this.ty = tx1 * sin + this.ty * cos;
     
        return this;

    },

    /**
    * Appends the given Matrix to this Matrix.
    * 
    * @method Phaser.Matrix#append
    * @param {Phaser.Matrix} matrix - The matrix to append to this one.
    * @return {Phaser.Matrix} This Matrix object.
    */
    append: function (matrix) {

        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var d1 = this.d;

        this.a  = matrix.a * a1 + matrix.b * c1;
        this.b  = matrix.a * b1 + matrix.b * d1;
        this.c  = matrix.c * a1 + matrix.d * c1;
        this.d  = matrix.c * b1 + matrix.d * d1;

        this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
        this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;
        
        return this;

    },

    /**
    * Resets this Matrix to an identity (default) matrix.
    * 
    * @method Phaser.Matrix#identity
    * @return {Phaser.Matrix} This Matrix object.
    */
    identity: function () {

        return this.setTo(1, 0, 0, 1, 0, 0);

    }

};

Phaser.identityMatrix = new Phaser.Matrix();

//  Because PIXI uses its own type, we'll replace it with ours to avoid duplicating code or confusion.
PIXI.Matrix = Phaser.Matrix;
PIXI.identityMatrix = Phaser.identityMatrix;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Point object represents a location in a two-dimensional coordinate system, where x represents the horizontal axis and y represents the vertical axis.
* The following code creates a point at (0,0):
* `var myPoint = new Phaser.Point();`
* You can also use them as 2D Vectors and you'll find different vector related methods in this class.
* 
* @class Phaser.Point
* @constructor
* @param {number} [x=0] - The horizontal position of this Point.
* @param {number} [y=0] - The vertical position of this Point.
*/
Phaser.Point = function (x, y) {

    x = x || 0;
    y = y || 0;

    /**
    * @property {number} x - The x value of the point.
    */
    this.x = x;

    /**
    * @property {number} y - The y value of the point.
    */
    this.y = y;

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.POINT;

};

Phaser.Point.prototype = {

    /**
    * Copies the x and y properties from any given object to this Point.
    *
    * @method Phaser.Point#copyFrom
    * @param {any} source - The object to copy from.
    * @return {Phaser.Point} This Point object.
    */
    copyFrom: function (source) {

        return this.setTo(source.x, source.y);

    },

    /**
    * Inverts the x and y values of this Point
    *
    * @method Phaser.Point#invert
    * @return {Phaser.Point} This Point object.
    */
    invert: function () {

        return this.setTo(this.y, this.x);

    },

    /**
    * Sets the `x` and `y` values of this Point object to the given values.
    * If you omit the `y` value then the `x` value will be applied to both, for example:
    * `Point.setTo(2)` is the same as `Point.setTo(2, 2)`
    *
    * @method Phaser.Point#setTo
    * @param {number} x - The horizontal value of this point.
    * @param {number} [y] - The vertical value of this point. If not given the x value will be used in its place.
    * @return {Phaser.Point} This Point object. Useful for chaining method calls.
    */
    setTo: function (x, y) {

        this.x = x || 0;
        this.y = y || ( (y !== 0) ? this.x : 0 );

        return this;

    },

    /**
    * Sets the `x` and `y` values of this Point object to the given values.
    * If you omit the `y` value then the `x` value will be applied to both, for example:
    * `Point.set(2)` is the same as `Point.set(2, 2)`
    *
    * @method Phaser.Point#set
    * @param {number} x - The horizontal value of this point.
    * @param {number} [y] - The vertical value of this point. If not given the x value will be used in its place.
    * @return {Phaser.Point} This Point object. Useful for chaining method calls.
    */
    set: function (x, y) {

        this.x = x || 0;
        this.y = y || ( (y !== 0) ? this.x : 0 );

        return this;

    },

    /**
    * Adds the given x and y values to this Point.
    *
    * @method Phaser.Point#add
    * @param {number} x - The value to add to Point.x.
    * @param {number} y - The value to add to Point.y.
    * @return {Phaser.Point} This Point object. Useful for chaining method calls.
    */
    add: function (x, y) {

        this.x += x;
        this.y += y;
        return this;

    },

    /**
    * Subtracts the given x and y values from this Point.
    *
    * @method Phaser.Point#subtract
    * @param {number} x - The value to subtract from Point.x.
    * @param {number} y - The value to subtract from Point.y.
    * @return {Phaser.Point} This Point object. Useful for chaining method calls.
    */
    subtract: function (x, y) {

        this.x -= x;
        this.y -= y;
        return this;

    },

    /**
    * Multiplies Point.x and Point.y by the given x and y values. Sometimes known as `Scale`.
    *
    * @method Phaser.Point#multiply
    * @param {number} x - The value to multiply Point.x by.
    * @param {number} y - The value to multiply Point.x by.
    * @return {Phaser.Point} This Point object. Useful for chaining method calls.
    */
    multiply: function (x, y) {

        this.x *= x;
        this.y *= y;
        return this;

    },

    /**
    * Divides Point.x and Point.y by the given x and y values.
    *
    * @method Phaser.Point#divide
    * @param {number} x - The value to divide Point.x by.
    * @param {number} y - The value to divide Point.x by.
    * @return {Phaser.Point} This Point object. Useful for chaining method calls.
    */
    divide: function (x, y) {

        this.x /= x;
        this.y /= y;
        return this;

    },

    /**
    * Clamps the x value of this Point to be between the given min and max.
    *
    * @method Phaser.Point#clampX
    * @param {number} min - The minimum value to clamp this Point to.
    * @param {number} max - The maximum value to clamp this Point to.
    * @return {Phaser.Point} This Point object.
    */
    clampX: function (min, max) {

        this.x = Phaser.Math.clamp(this.x, min, max);
        return this;

    },

    /**
    * Clamps the y value of this Point to be between the given min and max
    *
    * @method Phaser.Point#clampY
    * @param {number} min - The minimum value to clamp this Point to.
    * @param {number} max - The maximum value to clamp this Point to.
    * @return {Phaser.Point} This Point object.
    */
    clampY: function (min, max) {

        this.y = Phaser.Math.clamp(this.y, min, max);
        return this;

    },

    /**
    * Clamps this Point object values to be between the given min and max.
    *
    * @method Phaser.Point#clamp
    * @param {number} min - The minimum value to clamp this Point to.
    * @param {number} max - The maximum value to clamp this Point to.
    * @return {Phaser.Point} This Point object.
    */
    clamp: function (min, max) {

        this.x = Phaser.Math.clamp(this.x, min, max);
        this.y = Phaser.Math.clamp(this.y, min, max);
        return this;

    },

    /**
    * Creates a copy of the given Point.
    *
    * @method Phaser.Point#clone
    * @param {Phaser.Point} [output] Optional Point object. If given the values will be set into this object, otherwise a brand new Point object will be created and returned.
    * @return {Phaser.Point} The new Point object.
    */
    clone: function (output) {

        if (output === undefined || output === null)
        {
            output = new Phaser.Point(this.x, this.y);
        }
        else
        {
            output.setTo(this.x, this.y);
        }

        return output;

    },

    /**
    * Copies the x and y properties from this Point to any given object.
    *
    * @method Phaser.Point#copyTo
    * @param {any} dest - The object to copy to.
    * @return {object} The dest object.
    */
    copyTo: function (dest) {

        dest.x = this.x;
        dest.y = this.y;

        return dest;

    },

    /**
    * Returns the distance of this Point object to the given object (can be a Circle, Point or anything with x/y properties)
    *
    * @method Phaser.Point#distance
    * @param {object} dest - The target object. Must have visible x and y properties that represent the center of the object.
    * @param {boolean} [round] - Round the distance to the nearest integer (default false).
    * @return {number} The distance between this Point object and the destination Point object.
    */
    distance: function (dest, round) {

        return Phaser.Point.distance(this, dest, round);

    },

    /**
    * Determines whether the given objects x/y values are equal to this Point object.
    *
    * @method Phaser.Point#equals
    * @param {Phaser.Point|any} a - The object to compare with this Point.
    * @return {boolean} A value of true if the x and y points are equal, otherwise false.
    */
    equals: function (a) {

        return (a.x === this.x && a.y === this.y);

    },

    /**
    * Returns the angle between this Point object and another object with public x and y properties.
    *
    * @method Phaser.Point#angle
    * @param {Phaser.Point|any} a - The object to get the angle from this Point to.
    * @param {boolean} [asDegrees=false] - Is the given angle in radians (false) or degrees (true)?
    * @return {number} The angle between the two objects.
    */
    angle: function (a, asDegrees) {

        if (asDegrees === undefined) { asDegrees = false; }

        if (asDegrees)
        {
            return Phaser.Math.radToDeg(Math.atan2(a.y - this.y, a.x - this.x));
        }
        else
        {
            return Math.atan2(a.y - this.y, a.x - this.x);
        }

    },

    /**
    * Rotates this Point around the x/y coordinates given to the desired angle.
    *
    * @method Phaser.Point#rotate
    * @param {number} x - The x coordinate of the anchor point.
    * @param {number} y - The y coordinate of the anchor point.
    * @param {number} angle - The angle in radians (unless asDegrees is true) to rotate the Point to.
    * @param {boolean} [asDegrees=false] - Is the given angle in radians (false) or degrees (true)?
    * @param {number} [distance] - An optional distance constraint between the Point and the anchor.
    * @return {Phaser.Point} The modified point object.
    */
    rotate: function (x, y, angle, asDegrees, distance) {

        return Phaser.Point.rotate(this, x, y, angle, asDegrees, distance);

    },

    /**
    * Calculates the length of the Point object.
    *
    * @method Phaser.Point#getMagnitude
    * @return {number} The length of the Point.
    */
    getMagnitude: function () {

        return Math.sqrt((this.x * this.x) + (this.y * this.y));

    },

    /**
    * Calculates the length squared of the Point object.
    *
    * @method Phaser.Point#getMagnitudeSq
    * @return {number} The length ^ 2 of the Point.
    */
    getMagnitudeSq: function () {

        return (this.x * this.x) + (this.y * this.y);

    },

    /**
    * Alters the length of the Point without changing the direction.
    *
    * @method Phaser.Point#setMagnitude
    * @param {number} magnitude - The desired magnitude of the resulting Point.
    * @return {Phaser.Point} This Point object.
    */
    setMagnitude: function (magnitude) {

        return this.normalize().multiply(magnitude, magnitude);

    },

    /**
    * Alters the Point object so that its length is 1, but it retains the same direction.
    *
    * @method Phaser.Point#normalize
    * @return {Phaser.Point} This Point object.
    */
    normalize: function () {

        if (!this.isZero())
        {
            var m = this.getMagnitude();
            this.x /= m;
            this.y /= m;
        }

        return this;

    },

    /**
    * Determine if this point is at 0,0.
    *
    * @method Phaser.Point#isZero
    * @return {boolean} True if this Point is 0,0, otherwise false.
    */
    isZero: function () {

        return (this.x === 0 && this.y === 0);

    },

    /**
    * The dot product of this and another Point object.
    * 
    * @method Phaser.Point#dot
    * @param {Phaser.Point} a - The Point object to get the dot product combined with this Point.
    * @return {number} The result.
    */
    dot: function (a) {

        return ((this.x * a.x) + (this.y * a.y));

    },

    /**
    * The cross product of this and another Point object.
    * 
    * @method Phaser.Point#cross
    * @param {Phaser.Point} a - The Point object to get the cross product combined with this Point.
    * @return {number} The result.
    */
    cross: function (a) {

        return ((this.x * a.y) - (this.y * a.x));

    },

    /**
    * Make this Point perpendicular (90 degrees rotation)
    * 
    * @method Phaser.Point#perp
    * @return {Phaser.Point} This Point object.
    */
    perp: function () {

        return this.setTo(-this.y, this.x);

    },

    /**
    * Make this Point perpendicular (-90 degrees rotation)
    * 
    * @method Phaser.Point#rperp
    * @return {Phaser.Point} This Point object.
    */
    rperp: function () {

        return this.setTo(this.y, -this.x);

    },

    /**
    * Right-hand normalize (make unit length) this Point.
    *
    * @method Phaser.Point#normalRightHand
    * @return {Phaser.Point} This Point object.
    */
    normalRightHand: function () {

        return this.setTo(this.y * -1, this.x);

    },

    /**
    * Math.floor() both the x and y properties of this Point.
    *
    * @method Phaser.Point#floor
    * @return {Phaser.Point} This Point object.
    */
    floor: function () {

        return this.setTo(Math.floor(this.x), Math.floor(this.y));

    },

    /**
    * Math.ceil() both the x and y properties of this Point.
    *
    * @method Phaser.Point#ceil
    * @return {Phaser.Point} This Point object.
    */
    ceil: function () {

        return this.setTo(Math.ceil(this.x), Math.ceil(this.y));

    },

    /**
    * Returns a string representation of this object.
    *
    * @method Phaser.Point#toString
    * @return {string} A string representation of the instance.
    */
    toString: function () {

        return '[{Point (x=' + this.x + ' y=' + this.y + ')}]';

    }

};

Phaser.Point.prototype.constructor = Phaser.Point;

/**
* Adds the coordinates of two points together to create a new point.
*
* @method Phaser.Point.add
* @param {Phaser.Point} a - The first Point object.
* @param {Phaser.Point} b - The second Point object.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.add = function (a, b, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    out.x = a.x + b.x;
    out.y = a.y + b.y;

    return out;

};

/**
* Subtracts the coordinates of two points to create a new point.
*
* @method Phaser.Point.subtract
* @param {Phaser.Point} a - The first Point object.
* @param {Phaser.Point} b - The second Point object.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.subtract = function (a, b, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    out.x = a.x - b.x;
    out.y = a.y - b.y;

    return out;

};

/**
* Multiplies the coordinates of two points to create a new point.
*
* @method Phaser.Point.multiply
* @param {Phaser.Point} a - The first Point object.
* @param {Phaser.Point} b - The second Point object.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.multiply = function (a, b, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    out.x = a.x * b.x;
    out.y = a.y * b.y;

    return out;

};

/**
* Divides the coordinates of two points to create a new point.
*
* @method Phaser.Point.divide
* @param {Phaser.Point} a - The first Point object.
* @param {Phaser.Point} b - The second Point object.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.divide = function (a, b, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    out.x = a.x / b.x;
    out.y = a.y / b.y;

    return out;

};

/**
* Determines whether the two given Point objects are equal. They are considered equal if they have the same x and y values.
*
* @method Phaser.Point.equals
* @param {Phaser.Point} a - The first Point object.
* @param {Phaser.Point} b - The second Point object.
* @return {boolean} A value of true if the Points are equal, otherwise false.
*/
Phaser.Point.equals = function (a, b) {

    return (a.x === b.x && a.y === b.y);

};

/**
* Returns the angle between two Point objects.
*
* @method Phaser.Point.angle
* @param {Phaser.Point} a - The first Point object.
* @param {Phaser.Point} b - The second Point object.
* @return {number} The angle between the two Points.
*/
Phaser.Point.angle = function (a, b) {

    // return Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);
    return Math.atan2(a.y - b.y, a.x - b.x);

};

/**
* Creates a negative Point.
*
* @method Phaser.Point.negative
* @param {Phaser.Point} a - The first Point object.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.negative = function (a, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    return out.setTo(-a.x, -a.y);

};

/**
* Adds two 2D Points together and multiplies the result by the given scalar.
* 
* @method Phaser.Point.multiplyAdd
* @param {Phaser.Point} a - The first Point object.
* @param {Phaser.Point} b - The second Point object.
* @param {number} s - The scaling value.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.multiplyAdd = function (a, b, s, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    return out.setTo(a.x + b.x * s, a.y + b.y * s);

};

/**
* Interpolates the two given Points, based on the `f` value (between 0 and 1) and returns a new Point.
* 
* @method Phaser.Point.interpolate
* @param {Phaser.Point} a - The first Point object.
* @param {Phaser.Point} b - The second Point object.
* @param {number} f - The level of interpolation between the two points. Indicates where the new point will be, along the line between pt1 and pt2. If f=1, pt1 is returned; if f=0, pt2 is returned.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.interpolate = function (a, b, f, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    return out.setTo(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f);

};

/**
* Return a perpendicular vector (90 degrees rotation)
*
* @method Phaser.Point.perp
* @param {Phaser.Point} a - The Point object.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.perp = function (a, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    return out.setTo(-a.y, a.x);

};

/**
* Return a perpendicular vector (-90 degrees rotation)
*
* @method Phaser.Point.rperp
* @param {Phaser.Point} a - The Point object.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.rperp = function (a, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    return out.setTo(a.y, -a.x);

};

/**
* Returns the euclidian distance of this Point object to the given object (can be a Circle, Point or anything with x/y properties).
*
* @method Phaser.Point.distance
* @param {object} a - The target object. Must have visible x and y properties that represent the center of the object.
* @param {object} b - The target object. Must have visible x and y properties that represent the center of the object.
* @param {boolean} [round=false] - Round the distance to the nearest integer.
* @return {number} The distance between this Point object and the destination Point object.
*/
Phaser.Point.distance = function (a, b, round) {

    var distance = Phaser.Math.distance(a.x, a.y, b.x, b.y);
    return round ? Math.round(distance) : distance;

};

/**
* Project two Points onto another Point.
* 
* @method Phaser.Point.project
* @param {Phaser.Point} a - The first Point object.
* @param {Phaser.Point} b - The second Point object.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.project = function (a, b, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    var amt = a.dot(b) / b.getMagnitudeSq();

    if (amt !== 0)
    {
        out.setTo(amt * b.x, amt * b.y);
    }

    return out;

};

/**
* Project two Points onto a Point of unit length.
* 
* @method Phaser.Point.projectUnit
* @param {Phaser.Point} a - The first Point object.
* @param {Phaser.Point} b - The second Point object.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.projectUnit = function (a, b, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    var amt = a.dot(b);

    if (amt !== 0)
    {
        out.setTo(amt * b.x, amt * b.y);
    }

    return out;

};

/**
* Right-hand normalize (make unit length) a Point.
*
* @method Phaser.Point.normalRightHand
* @param {Phaser.Point} a - The Point object.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.normalRightHand = function (a, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    return out.setTo(a.y * -1, a.x);

};

/**
* Normalize (make unit length) a Point.
*
* @method Phaser.Point.normalize
* @param {Phaser.Point} a - The Point object.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.normalize = function (a, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    var m = a.getMagnitude();

    if (m !== 0)
    {
        out.setTo(a.x / m, a.y / m);
    }

    return out;

};

/**
* Rotates a Point object, or any object with exposed x/y properties, around the given coordinates by
* the angle specified. If the angle between the point and coordinates was 45 deg and the angle argument
* is 45 deg then the resulting angle will be 90 deg, as the angle argument is added to the current angle.
*
* The distance allows you to specify a distance constraint for the rotation between the point and the 
* coordinates. If none is given the distance between the two is calculated and used.
*
* @method Phaser.Point.rotate
* @param {Phaser.Point} a - The Point object to rotate.
* @param {number} x - The x coordinate of the anchor point
* @param {number} y - The y coordinate of the anchor point
* @param {number} angle - The angle in radians (unless asDegrees is true) to rotate the Point by.
* @param {boolean} [asDegrees=false] - Is the given angle in radians (false) or degrees (true)?
* @param {number} [distance] - An optional distance constraint between the Point and the anchor.
* @return {Phaser.Point} The modified point object.
*/
Phaser.Point.rotate = function (a, x, y, angle, asDegrees, distance) {

    if (asDegrees) { angle = Phaser.Math.degToRad(angle); }

    if (distance === undefined)
    {
        a.subtract(x, y);

        var s = Math.sin(angle);
        var c = Math.cos(angle);

        var tx = c * a.x - s * a.y;
        var ty = s * a.x + c * a.y;

        a.x = tx + x;
        a.y = ty + y;
    }
    else
    {
        var t = angle + Math.atan2(a.y - y, a.x - x);
        a.x = x + distance * Math.cos(t);
        a.y = y + distance * Math.sin(t);
    }

    return a;

};

/**
* Calculates centroid (or midpoint) from an array of points. If only one point is provided, that point is returned.
*
* @method Phaser.Point.centroid
* @param {Phaser.Point[]} points - The array of one or more points.
* @param {Phaser.Point} [out] - Optional Point to store the value in, if not supplied a new Point object will be created.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.centroid = function (points, out) {

    if (out === undefined) { out = new Phaser.Point(); }

    if (Object.prototype.toString.call(points) !== '[object Array]')
    {
        throw new Error("Phaser.Point. Parameter 'points' must be an array");
    }

    var pointslength = points.length;

    if (pointslength < 1)
    {
        throw new Error("Phaser.Point. Parameter 'points' array must not be empty");
    }

    if (pointslength === 1)
    {
        out.copyFrom(points[0]);
        return out;
    }

    for (var i = 0; i < pointslength; i++)
    {
        Phaser.Point.add(out, points[i], out);
    }

    out.divide(pointslength, pointslength);

    return out;

};

/**
* Parses an object for x and/or y properties and returns a new Phaser.Point with matching values.
* If the object doesn't contain those properties a Point with x/y of zero will be returned.
*
* @method Phaser.Point.parse
* @static
* @param {object} obj - The object to parse.
* @param {string} [xProp='x'] - The property used to set the Point.x value.
* @param {string} [yProp='y'] - The property used to set the Point.y value.
* @return {Phaser.Point} The new Point object.
*/
Phaser.Point.parse = function(obj, xProp, yProp) {

    xProp = xProp || 'x';
    yProp = yProp || 'y';

    var point = new Phaser.Point();

    if (obj[xProp])
    {
        point.x = parseInt(obj[xProp], 10);
    }

    if (obj[yProp])
    {
        point.y = parseInt(obj[yProp], 10);
    }

    return point;

};

//   Because PIXI uses its own Point, we'll replace it with ours to avoid duplicating code or confusion.
PIXI.Point = Phaser.Point;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @author       Adrien Brault <adrien.brault@gmail.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Creates a new Polygon.
* 
* The points can be set from a variety of formats:
*
* - An array of Point objects: `[new Phaser.Point(x1, y1), ...]`
* - An array of objects with public x/y properties: `[obj1, obj2, ...]`
* - An array of paired numbers that represent point coordinates: `[x1,y1, x2,y2, ...]`
* - As separate Point arguments: `setTo(new Phaser.Point(x1, y1), ...)`
* - As separate objects with public x/y properties arguments: `setTo(obj1, obj2, ...)`
* - As separate arguments representing point coordinates: `setTo(x1,y1, x2,y2, ...)`
*
* @class Phaser.Polygon
* @constructor
* @param {Phaser.Point[]|number[]|...Phaser.Point|...number} points - The points to set.
*/
Phaser.Polygon = function () {

    /**
    * @property {number} area - The area of this Polygon.
    */
    this.area = 0;

    /**
    * @property {array} _points - An array of Points that make up this Polygon.
    * @private
    */
    this._points = [];

    if (arguments.length > 0)
    {
        this.setTo.apply(this, arguments);
    }

    /**
    * @property {boolean} closed - Is the Polygon closed or not?
    */
    this.closed = true;

    /**
    * @property {boolean} flattened - Has this Polygon been flattened by a call to `Polygon.flatten` ?
    */
    this.flattened = false;

    /**
     * @property {number} type - The base object type.
     */
    this.type = Phaser.POLYGON;

};

Phaser.Polygon.prototype = {

    /**
     * Export the points as an array of flat numbers, following the sequence [ x,y, x,y, x,y ]
     *
     * @method Phaser.Polygon#toNumberArray
     * @param {array} [output] - The array to append the points to. If not specified a new array will be created.
     * @return {array} The flattened array.
     */
    toNumberArray: function (output) {

        if (output === undefined) { output = []; }

        for (var i = 0; i < this._points.length; i++)
        {
            if (typeof this._points[i] === 'number')
            {
                output.push(this._points[i]);
                output.push(this._points[i + 1]);
                i++;
            }
            else
            {
                output.push(this._points[i].x);
                output.push(this._points[i].y);
            }
        }

        return output;

    },

    /**
     * Flattens this Polygon so the points are a sequence of numbers.
     * Any Point objects found are removed and replaced with two numbers.
     * Also sets the Polygon.flattened property to `true`.
     *
     * @method Phaser.Polygon#flatten
     * @return {Phaser.Polygon} This Polygon object
     */
    flatten: function () {

        this._points = this.toNumberArray();

        this.flattened = true;

        return this;

    },

    /**
     * Creates a copy of the given Polygon.
     * This is a deep clone, the resulting copy contains new Phaser.Point objects
     *
     * @method Phaser.Polygon#clone
     * @param {Phaser.Polygon} [output=(new Polygon)] - The polygon to update. If not specified a new polygon will be created.
     * @return {Phaser.Polygon} The cloned (`output`) polygon object.
     */
    clone: function (output) {

        var points = this._points.slice();

        if (output === undefined || output === null)
        {
            output = new Phaser.Polygon(points);
        }
        else
        {
            output.setTo(points);
        }

        return output;

    },

    /**
    * Checks whether the x and y coordinates are contained within this polygon.
    *
    * @method Phaser.Polygon#contains
    * @param {number} x - The X value of the coordinate to test.
    * @param {number} y - The Y value of the coordinate to test.
    * @return {boolean} True if the coordinates are within this polygon, otherwise false.
    */
    contains: function (x, y) {

        //  Adapted from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html by Jonas Raoni Soares Silva

        var inside = false;

        if (this.flattened)
        {
            for (var i = -2, j = this._points.length - 2; (i += 2) < this._points.length; j = i)
            {
                var ix = this._points[i];
                var iy = this._points[i + 1];

                var jx = this._points[j];
                var jy = this._points[j + 1];

                if (((iy <= y && y < jy) || (jy <= y && y < iy)) && (x < (jx - ix) * (y - iy) / (jy - iy) + ix))
                {
                    inside = !inside;
                }
            }

        }
        else
        {
            for (var i = -1, j = this._points.length - 1; ++i < this._points.length; j = i)
            {
                var ix = this._points[i].x;
                var iy = this._points[i].y;

                var jx = this._points[j].x;
                var jy = this._points[j].y;

                if (((iy <= y && y < jy) || (jy <= y && y < iy)) && (x < (jx - ix) * (y - iy) / (jy - iy) + ix))
                {
                    inside = !inside;
                }
            }
        }

        return inside;

    },

    /**
     * Sets this Polygon to the given points.
     *
     * The points can be set from a variety of formats:
     *
     * - An array of Point objects: `[new Phaser.Point(x1, y1), ...]`
     * - An array of objects with public x/y properties: `[obj1, obj2, ...]`
     * - An array of paired numbers that represent point coordinates: `[x1,y1, x2,y2, ...]`
     * - An array of arrays with two elements representing x/y coordinates: `[[x1, y1], [x2, y2], ...]`
     * - As separate Point arguments: `setTo(new Phaser.Point(x1, y1), ...)`
     * - As separate objects with public x/y properties arguments: `setTo(obj1, obj2, ...)`
     * - As separate arguments representing point coordinates: `setTo(x1,y1, x2,y2, ...)`
     *
     * `setTo` may also be called without any arguments to remove all points.
     *
     * @method Phaser.Polygon#setTo
     * @param {Phaser.Point[]|number[]|...Phaser.Point|...number} points - The points to set.
     * @return {Phaser.Polygon} This Polygon object
     */
    setTo: function (points) {

        this.area = 0;
        this._points = [];

        if (arguments.length > 0)
        {
            //  If points isn't an array, use arguments as the array
            if (!Array.isArray(points))
            {
                points = Array.prototype.slice.call(arguments);
            }

            var y0 = Number.MAX_VALUE;

            //  Allows for mixed-type arguments
            for (var i = 0, len = points.length; i < len; i++)
            {
                if (typeof points[i] === 'number')
                {
                    var p = new PIXI.Point(points[i], points[i + 1]);
                    i++;
                }
                else if (Array.isArray(points[i]))
                {
                    var p = new PIXI.Point(points[i][0], points[i][1]);
                }
                else
                {
                    var p = new PIXI.Point(points[i].x, points[i].y);
                }

                this._points.push(p);

                //  Lowest boundary
                if (p.y < y0)
                {
                    y0 = p.y;
                }
            }

            this.calculateArea(y0);
        }

        return this;

    },

    /**
     * Calcuates the area of the Polygon. This is available in the property Polygon.area
     *
     * @method Phaser.Polygon#calculateArea
     * @private
     * @param {number} y0 - The lowest boundary
     * @return {number} The area of the Polygon.
     */
    calculateArea: function (y0) {

        var p1;
        var p2;
        var avgHeight;
        var width;

        for (var i = 0, len = this._points.length; i < len; i++)
        {
            p1 = this._points[i];

            if (i === len - 1)
            {
                p2 = this._points[0];
            }
            else
            {
                p2 = this._points[i + 1];
            }

            avgHeight = ((p1.y - y0) + (p2.y - y0)) / 2;
            width = p1.x - p2.x;
            this.area += avgHeight * width;
        }

        return this.area;

    }

};

Phaser.Polygon.prototype.constructor = Phaser.Polygon;

/**
* Sets and modifies the points of this polygon.
*
* See {@link Phaser.Polygon#setTo setTo} for the different kinds of arrays formats that can be assigned.
*
* @name Phaser.Polygon#points
* @property {Phaser.Point[]} points - The array of vertex points.
* @deprecated Use `setTo`.
*/
Object.defineProperty(Phaser.Polygon.prototype, 'points', {

    get: function() {
        return this._points;
    },

    set: function(points) {

        if (points != null)
        {
            this.setTo(points);
        }
        else
        {
            //  Clear the points
            this.setTo();
        }

    }

});

//  Because PIXI uses its own type, we'll replace it with ours to avoid duplicating code or confusion.
PIXI.Polygon = Phaser.Polygon;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Creates a new Rectangle object with the top-left corner specified by the x and y parameters and with the specified width and height parameters.
* If you call this function without parameters, a Rectangle with x, y, width, and height properties set to 0 is created.
*
* @class Phaser.Rectangle
* @constructor
* @param {number} x - The x coordinate of the top-left corner of the Rectangle.
* @param {number} y - The y coordinate of the top-left corner of the Rectangle.
* @param {number} width - The width of the Rectangle. Should always be either zero or a positive value.
* @param {number} height - The height of the Rectangle. Should always be either zero or a positive value.
*/
Phaser.Rectangle = function (x, y, width, height) {

    x = x || 0;
    y = y || 0;
    width = width || 0;
    height = height || 0;

    /**
    * @property {number} x - The x coordinate of the top-left corner of the Rectangle.
    */
    this.x = x;

    /**
    * @property {number} y - The y coordinate of the top-left corner of the Rectangle.
    */
    this.y = y;

    /**
    * @property {number} width - The width of the Rectangle. This value should never be set to a negative.
    */
    this.width = width;

    /**
    * @property {number} height - The height of the Rectangle. This value should never be set to a negative.
    */
    this.height = height;

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.RECTANGLE;

};

Phaser.Rectangle.prototype = {

    /**
    * Adjusts the location of the Rectangle object, as determined by its top-left corner, by the specified amounts.
    * @method Phaser.Rectangle#offset
    * @param {number} dx - Moves the x value of the Rectangle object by this amount.
    * @param {number} dy - Moves the y value of the Rectangle object by this amount.
    * @return {Phaser.Rectangle} This Rectangle object.
    */
    offset: function (dx, dy) {

        this.x += dx;
        this.y += dy;

        return this;

    },

    /**
    * Adjusts the location of the Rectangle object using a Point object as a parameter. This method is similar to the Rectangle.offset() method, except that it takes a Point object as a parameter.
    * @method Phaser.Rectangle#offsetPoint
    * @param {Phaser.Point} point - A Point object to use to offset this Rectangle object.
    * @return {Phaser.Rectangle} This Rectangle object.
    */
    offsetPoint: function (point) {

        return this.offset(point.x, point.y);

    },

    /**
    * Sets the members of Rectangle to the specified values.
    * @method Phaser.Rectangle#setTo
    * @param {number} x - The x coordinate of the top-left corner of the Rectangle.
    * @param {number} y - The y coordinate of the top-left corner of the Rectangle.
    * @param {number} width - The width of the Rectangle. Should always be either zero or a positive value.
    * @param {number} height - The height of the Rectangle. Should always be either zero or a positive value.
    * @return {Phaser.Rectangle} This Rectangle object
    */
    setTo: function (x, y, width, height) {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        return this;

    },

    /**
    * Scales the width and height of this Rectangle by the given amounts.
    * 
    * @method Phaser.Rectangle#scale
    * @param {number} x - The amount to scale the width of the Rectangle by. A value of 0.5 would reduce by half, a value of 2 would double the width, etc.
    * @param {number} [y] - The amount to scale the height of the Rectangle by. A value of 0.5 would reduce by half, a value of 2 would double the height, etc.
    * @return {Phaser.Rectangle} This Rectangle object
    */
    scale: function (x, y) {

        if (y === undefined) { y = x; }

        this.width *= x;
        this.height *= y;

        return this;

    },

    /**
    * Centers this Rectangle so that the center coordinates match the given x and y values.
    *
    * @method Phaser.Rectangle#centerOn
    * @param {number} x - The x coordinate to place the center of the Rectangle at.
    * @param {number} y - The y coordinate to place the center of the Rectangle at.
    * @return {Phaser.Rectangle} This Rectangle object
    */
    centerOn: function (x, y) {

        this.centerX = x;
        this.centerY = y;

        return this;

    },

    /**
    * Runs Math.floor() on both the x and y values of this Rectangle.
    * @method Phaser.Rectangle#floor
    */
    floor: function () {

        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);

    },

    /**
    * Runs Math.floor() on the x, y, width and height values of this Rectangle.
    * @method Phaser.Rectangle#floorAll
    */
    floorAll: function () {

        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.width = Math.floor(this.width);
        this.height = Math.floor(this.height);

    },

    /**
    * Runs Math.ceil() on both the x and y values of this Rectangle.
    * @method Phaser.Rectangle#ceil
    */
    ceil: function () {

        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);

    },

    /**
    * Runs Math.ceil() on the x, y, width and height values of this Rectangle.
    * @method Phaser.Rectangle#ceilAll
    */
    ceilAll: function () {

        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.width = Math.ceil(this.width);
        this.height = Math.ceil(this.height);

    },

    /**
    * Copies the x, y, width and height properties from any given object to this Rectangle.
    * @method Phaser.Rectangle#copyFrom
    * @param {any} source - The object to copy from.
    * @return {Phaser.Rectangle} This Rectangle object.
    */
    copyFrom: function (source) {

        return this.setTo(source.x, source.y, source.width, source.height);

    },

    /**
    * Copies the x, y, width and height properties from this Rectangle to any given object.
    * @method Phaser.Rectangle#copyTo
    * @param {any} source - The object to copy to.
    * @return {object} This object.
    */
    copyTo: function (dest) {

        dest.x = this.x;
        dest.y = this.y;
        dest.width = this.width;
        dest.height = this.height;

        return dest;

    },

    /**
    * Increases the size of the Rectangle object by the specified amounts. The center point of the Rectangle object stays the same, and its size increases to the left and right by the dx value, and to the top and the bottom by the dy value.
    * @method Phaser.Rectangle#inflate
    * @param {number} dx - The amount to be added to the left side of the Rectangle.
    * @param {number} dy - The amount to be added to the bottom side of the Rectangle.
    * @return {Phaser.Rectangle} This Rectangle object.
    */
    inflate: function (dx, dy) {

        return Phaser.Rectangle.inflate(this, dx, dy);

    },

    /**
    * The size of the Rectangle object, expressed as a Point object with the values of the width and height properties.
    * @method Phaser.Rectangle#size
    * @param {Phaser.Point} [output] - Optional Point object. If given the values will be set into the object, otherwise a brand new Point object will be created and returned.
    * @return {Phaser.Point} The size of the Rectangle object.
    */
    size: function (output) {

        return Phaser.Rectangle.size(this, output);

    },

    /**
    * Resize the Rectangle by providing a new width and height.
    * The x and y positions remain unchanged.
    * 
    * @method Phaser.Rectangle#resize
    * @param {number} width - The width of the Rectangle. Should always be either zero or a positive value.
    * @param {number} height - The height of the Rectangle. Should always be either zero or a positive value.
    * @return {Phaser.Rectangle} This Rectangle object
    */
    resize: function (width, height) {

        this.width = width;
        this.height = height;

        return this;

    },

    /**
    * Returns a new Rectangle object with the same values for the x, y, width, and height properties as the original Rectangle object.
    * @method Phaser.Rectangle#clone
    * @param {Phaser.Rectangle} [output] - Optional Rectangle object. If given the values will be set into the object, otherwise a brand new Rectangle object will be created and returned.
    * @return {Phaser.Rectangle}
    */
    clone: function (output) {

        return Phaser.Rectangle.clone(this, output);

    },

    /**
    * Determines whether the specified coordinates are contained within the region defined by this Rectangle object.
    * @method Phaser.Rectangle#contains
    * @param {number} x - The x coordinate of the point to test.
    * @param {number} y - The y coordinate of the point to test.
    * @return {boolean} A value of true if the Rectangle object contains the specified point; otherwise false.
    */
    contains: function (x, y) {

        return Phaser.Rectangle.contains(this, x, y);

    },

    /**
    * Determines whether the first Rectangle object is fully contained within the second Rectangle object.
    * A Rectangle object is said to contain another if the second Rectangle object falls entirely within the boundaries of the first.
    * @method Phaser.Rectangle#containsRect
    * @param {Phaser.Rectangle} b - The second Rectangle object.
    * @return {boolean} A value of true if the Rectangle object contains the specified point; otherwise false.
    */
    containsRect: function (b) {

        return Phaser.Rectangle.containsRect(b, this);

    },

    /**
    * Determines whether the two Rectangles are equal.
    * This method compares the x, y, width and height properties of each Rectangle.
    * @method Phaser.Rectangle#equals
    * @param {Phaser.Rectangle} b - The second Rectangle object.
    * @return {boolean} A value of true if the two Rectangles have exactly the same values for the x, y, width and height properties; otherwise false.
    */
    equals: function (b) {

        return Phaser.Rectangle.equals(this, b);

    },

    /**
    * If the Rectangle object specified in the toIntersect parameter intersects with this Rectangle object, returns the area of intersection as a Rectangle object. If the Rectangles do not intersect, this method returns an empty Rectangle object with its properties set to 0.
    * @method Phaser.Rectangle#intersection
    * @param {Phaser.Rectangle} b - The second Rectangle object.
    * @param {Phaser.Rectangle} out - Optional Rectangle object. If given the intersection values will be set into this object, otherwise a brand new Rectangle object will be created and returned.
    * @return {Phaser.Rectangle} A Rectangle object that equals the area of intersection. If the Rectangles do not intersect, this method returns an empty Rectangle object; that is, a Rectangle with its x, y, width, and height properties set to 0.
    */
    intersection: function (b, out) {

        return Phaser.Rectangle.intersection(this, b, out);

    },

    /**
    * Determines whether this Rectangle and another given Rectangle intersect with each other.
    * This method checks the x, y, width, and height properties of the two Rectangles.
    * 
    * @method Phaser.Rectangle#intersects
    * @param {Phaser.Rectangle} b - The second Rectangle object.
    * @return {boolean} A value of true if the specified object intersects with this Rectangle object; otherwise false.
    */
    intersects: function (b) {

        return Phaser.Rectangle.intersects(this, b);

    },

    /**
    * Determines whether the coordinates given intersects (overlaps) with this Rectangle.
    *
    * @method Phaser.Rectangle#intersectsRaw
    * @param {number} left - The x coordinate of the left of the area.
    * @param {number} right - The right coordinate of the area.
    * @param {number} top - The y coordinate of the area.
    * @param {number} bottom - The bottom coordinate of the area.
    * @param {number} tolerance - A tolerance value to allow for an intersection test with padding, default to 0
    * @return {boolean} A value of true if the specified object intersects with the Rectangle; otherwise false.
    */
    intersectsRaw: function (left, right, top, bottom, tolerance) {

        return Phaser.Rectangle.intersectsRaw(this, left, right, top, bottom, tolerance);

    },

    /**
    * Adds two Rectangles together to create a new Rectangle object, by filling in the horizontal and vertical space between the two Rectangles.
    * @method Phaser.Rectangle#union
    * @param {Phaser.Rectangle} b - The second Rectangle object.
    * @param {Phaser.Rectangle} [out] - Optional Rectangle object. If given the new values will be set into this object, otherwise a brand new Rectangle object will be created and returned.
    * @return {Phaser.Rectangle} A Rectangle object that is the union of the two Rectangles.
    */
    union: function (b, out) {

        return Phaser.Rectangle.union(this, b, out);

    },

    /**
    * Returns a uniformly distributed random point from anywhere within this Rectangle.
    * 
    * @method Phaser.Rectangle#random
    * @param {Phaser.Point|object} [out] - A Phaser.Point, or any object with public x/y properties, that the values will be set in.
    *     If no object is provided a new Phaser.Point object will be created. In high performance areas avoid this by re-using an existing object.
    * @return {Phaser.Point} An object containing the random point in its `x` and `y` properties.
    */
    random: function (out) {

        if (out === undefined) { out = new Phaser.Point(); }

        out.x = this.randomX;
        out.y = this.randomY;

        return out;

    },

    /**
    * Returns a point based on the given position constant, which can be one of:
    * 
    * `Phaser.TOP_LEFT`, `Phaser.TOP_CENTER`, `Phaser.TOP_RIGHT`, `Phaser.LEFT_CENTER`,
    * `Phaser.CENTER`, `Phaser.RIGHT_CENTER`, `Phaser.BOTTOM_LEFT`, `Phaser.BOTTOM_CENTER` 
    * and `Phaser.BOTTOM_RIGHT`.
    *
    * This method returns the same values as calling Rectangle.bottomLeft, etc, but those
    * calls always create a new Point object, where-as this one allows you to use your own.
    * 
    * @method Phaser.Rectangle#getPoint
    * @param {integer} [position] - One of the Phaser position constants, such as `Phaser.TOP_RIGHT`.
    * @param {Phaser.Point} [out] - A Phaser.Point that the values will be set in.
    *     If no object is provided a new Phaser.Point object will be created. In high performance areas avoid this by re-using an existing object.
    * @return {Phaser.Point} An object containing the point in its `x` and `y` properties.
    */
    getPoint: function (position, out) {

        if (out === undefined) { out = new Phaser.Point(); }

        switch (position)
        {
            default:
            case Phaser.TOP_LEFT:
                return out.set(this.x, this.y);

            case Phaser.TOP_CENTER:
                return out.set(this.centerX, this.y);

            case Phaser.TOP_RIGHT:
                return out.set(this.right, this.y);

            case Phaser.LEFT_CENTER:
                return out.set(this.x, this.centerY);

            case Phaser.CENTER:
                return out.set(this.centerX, this.centerY);

            case Phaser.RIGHT_CENTER:
                return out.set(this.right, this.centerY);

            case Phaser.BOTTOM_LEFT:
                return out.set(this.x, this.bottom);

            case Phaser.BOTTOM_CENTER:
                return out.set(this.centerX, this.bottom);

            case Phaser.BOTTOM_RIGHT:
                return out.set(this.right, this.bottom);
        }

    },

    /**
    * Returns a string representation of this object.
    * @method Phaser.Rectangle#toString
    * @return {string} A string representation of the instance.
    */
    toString: function () {

        return "[{Rectangle (x=" + this.x + " y=" + this.y + " width=" + this.width + " height=" + this.height + " empty=" + this.empty + ")}]";

    }

};

/**
* @name Phaser.Rectangle#halfWidth
* @property {number} halfWidth - Half of the width of the Rectangle.
* @readonly
*/
Object.defineProperty(Phaser.Rectangle.prototype, "halfWidth", {

    get: function () {
        return Math.round(this.width / 2);
    }

});

/**
* @name Phaser.Rectangle#halfHeight
* @property {number} halfHeight - Half of the height of the Rectangle.
* @readonly
*/
Object.defineProperty(Phaser.Rectangle.prototype, "halfHeight", {

    get: function () {
        return Math.round(this.height / 2);
    }

});

/**
* The sum of the y and height properties. Changing the bottom property of a Rectangle object has no effect on the x, y and width properties, but does change the height property.
* @name Phaser.Rectangle#bottom
* @property {number} bottom - The sum of the y and height properties.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "bottom", {

    get: function () {
        return this.y + this.height;
    },

    set: function (value) {

        if (value <= this.y)
        {
            this.height = 0;
        }
        else
        {
            this.height = value - this.y;
        }

    }

});

/**
* The location of the Rectangles bottom left corner as a Point object.
* @name Phaser.Rectangle#bottomLeft
* @property {Phaser.Point} bottomLeft - Gets or sets the location of the Rectangles bottom left corner as a Point object.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "bottomLeft", {

    get: function () {
        return new Phaser.Point(this.x, this.bottom);
    },

    set: function (value) {
        this.x = value.x;
        this.bottom = value.y;
    }

});

/**
* The location of the Rectangles bottom right corner as a Point object.
* @name Phaser.Rectangle#bottomRight
* @property {Phaser.Point} bottomRight - Gets or sets the location of the Rectangles bottom right corner as a Point object.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "bottomRight", {

    get: function () {
        return new Phaser.Point(this.right, this.bottom);
    },

    set: function (value) {
        this.right = value.x;
        this.bottom = value.y;
    }

});

/**
* The x coordinate of the left of the Rectangle. Changing the left property of a Rectangle object has no effect on the y and height properties. However it does affect the width property, whereas changing the x value does not affect the width property.
* @name Phaser.Rectangle#left
* @property {number} left - The x coordinate of the left of the Rectangle.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "left", {

    get: function () {
        return this.x;
    },

    set: function (value) {
        if (value >= this.right) {
            this.width = 0;
        } else {
            this.width = this.right - value;
        }
        this.x = value;
    }

});

/**
* The sum of the x and width properties. Changing the right property of a Rectangle object has no effect on the x, y and height properties, however it does affect the width property.
* @name Phaser.Rectangle#right
* @property {number} right - The sum of the x and width properties.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "right", {

    get: function () {
        return this.x + this.width;
    },

    set: function (value) {
        if (value <= this.x) {
            this.width = 0;
        } else {
            this.width = value - this.x;
        }
    }

});

/**
* The volume of the Rectangle derived from width * height.
* @name Phaser.Rectangle#volume
* @property {number} volume - The volume of the Rectangle derived from width * height.
* @readonly
*/
Object.defineProperty(Phaser.Rectangle.prototype, "volume", {

    get: function () {
        return this.width * this.height;
    }

});

/**
* The perimeter size of the Rectangle. This is the sum of all 4 sides.
* @name Phaser.Rectangle#perimeter
* @property {number} perimeter - The perimeter size of the Rectangle. This is the sum of all 4 sides.
* @readonly
*/
Object.defineProperty(Phaser.Rectangle.prototype, "perimeter", {

    get: function () {
        return (this.width * 2) + (this.height * 2);
    }

});

/**
* The x coordinate of the center of the Rectangle.
* @name Phaser.Rectangle#centerX
* @property {number} centerX - The x coordinate of the center of the Rectangle.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "centerX", {

    get: function () {
        return this.x + this.halfWidth;
    },

    set: function (value) {
        this.x = value - this.halfWidth;
    }

});

/**
* The y coordinate of the center of the Rectangle.
* @name Phaser.Rectangle#centerY
* @property {number} centerY - The y coordinate of the center of the Rectangle.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "centerY", {

    get: function () {
        return this.y + this.halfHeight;
    },

    set: function (value) {
        this.y = value - this.halfHeight;
    }

});

/**
* A random value between the left and right values (inclusive) of the Rectangle.
*
* @name Phaser.Rectangle#randomX
* @property {number} randomX - A random value between the left and right values (inclusive) of the Rectangle.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "randomX", {

    get: function () {

        return this.x + (Math.random() * this.width);

    }

});

/**
* A random value between the top and bottom values (inclusive) of the Rectangle.
*
* @name Phaser.Rectangle#randomY
* @property {number} randomY - A random value between the top and bottom values (inclusive) of the Rectangle.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "randomY", {

    get: function () {

        return this.y + (Math.random() * this.height);

    }

});

/**
* The y coordinate of the top of the Rectangle. Changing the top property of a Rectangle object has no effect on the x and width properties.
* However it does affect the height property, whereas changing the y value does not affect the height property.
* @name Phaser.Rectangle#top
* @property {number} top - The y coordinate of the top of the Rectangle.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "top", {

    get: function () {
        return this.y;
    },

    set: function (value) {
        if (value >= this.bottom) {
            this.height = 0;
            this.y = value;
        } else {
            this.height = (this.bottom - value);
        }
    }

});

/**
* The location of the Rectangles top left corner as a Point object.
* @name Phaser.Rectangle#topLeft
* @property {Phaser.Point} topLeft - The location of the Rectangles top left corner as a Point object.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "topLeft", {

    get: function () {
        return new Phaser.Point(this.x, this.y);
    },

    set: function (value) {
        this.x = value.x;
        this.y = value.y;
    }

});

/**
* The location of the Rectangles top right corner as a Point object.
* @name Phaser.Rectangle#topRight
* @property {Phaser.Point} topRight - The location of the Rectangles top left corner as a Point object.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "topRight", {

    get: function () {
        return new Phaser.Point(this.x + this.width, this.y);
    },

    set: function (value) {
        this.right = value.x;
        this.y = value.y;
    }

});

/**
* Determines whether or not this Rectangle object is empty. A Rectangle object is empty if its width or height is less than or equal to 0.
* If set to true then all of the Rectangle properties are set to 0.
* @name Phaser.Rectangle#empty
* @property {boolean} empty - Gets or sets the Rectangles empty state.
*/
Object.defineProperty(Phaser.Rectangle.prototype, "empty", {

    get: function () {
        return (!this.width || !this.height);
    },

    set: function (value) {

        if (value === true)
        {
            this.setTo(0, 0, 0, 0);
        }

    }

});

Phaser.Rectangle.prototype.constructor = Phaser.Rectangle;

/**
* Increases the size of the Rectangle object by the specified amounts. The center point of the Rectangle object stays the same, and its size increases to the left and right by the dx value, and to the top and the bottom by the dy value.
* @method Phaser.Rectangle.inflate
* @param {Phaser.Rectangle} a - The Rectangle object.
* @param {number} dx - The amount to be added to the left side of the Rectangle.
* @param {number} dy - The amount to be added to the bottom side of the Rectangle.
* @return {Phaser.Rectangle} This Rectangle object.
*/
Phaser.Rectangle.inflate = function (a, dx, dy) {

    a.x -= dx;
    a.width += 2 * dx;
    a.y -= dy;
    a.height += 2 * dy;

    return a;

};

/**
* Increases the size of the Rectangle object. This method is similar to the Rectangle.inflate() method except it takes a Point object as a parameter.
* @method Phaser.Rectangle.inflatePoint
* @param {Phaser.Rectangle} a - The Rectangle object.
* @param {Phaser.Point} point - The x property of this Point object is used to increase the horizontal dimension of the Rectangle object. The y property is used to increase the vertical dimension of the Rectangle object.
* @return {Phaser.Rectangle} The Rectangle object.
*/
Phaser.Rectangle.inflatePoint = function (a, point) {

    return Phaser.Rectangle.inflate(a, point.x, point.y);

};

/**
* The size of the Rectangle object, expressed as a Point object with the values of the width and height properties.
* @method Phaser.Rectangle.size
* @param {Phaser.Rectangle} a - The Rectangle object.
* @param {Phaser.Point} [output] - Optional Point object. If given the values will be set into the object, otherwise a brand new Point object will be created and returned.
* @return {Phaser.Point} The size of the Rectangle object
*/
Phaser.Rectangle.size = function (a, output) {

    if (output === undefined || output === null)
    {
        output = new Phaser.Point(a.width, a.height);
    }
    else
    {
        output.setTo(a.width, a.height);
    }

    return output;

};

/**
* Returns a new Rectangle object with the same values for the x, y, width, and height properties as the original Rectangle object.
* @method Phaser.Rectangle.clone
* @param {Phaser.Rectangle} a - The Rectangle object.
* @param {Phaser.Rectangle} [output] - Optional Rectangle object. If given the values will be set into the object, otherwise a brand new Rectangle object will be created and returned.
* @return {Phaser.Rectangle}
*/
Phaser.Rectangle.clone = function (a, output) {

    if (output === undefined || output === null)
    {
        output = new Phaser.Rectangle(a.x, a.y, a.width, a.height);
    }
    else
    {
        output.setTo(a.x, a.y, a.width, a.height);
    }

    return output;

};

/**
* Determines whether the specified coordinates are contained within the region defined by this Rectangle object.
* @method Phaser.Rectangle.contains
* @param {Phaser.Rectangle} a - The Rectangle object.
* @param {number} x - The x coordinate of the point to test.
* @param {number} y - The y coordinate of the point to test.
* @return {boolean} A value of true if the Rectangle object contains the specified point; otherwise false.
*/
Phaser.Rectangle.contains = function (a, x, y) {

    if (a.width <= 0 || a.height <= 0)
    {
        return false;
    }

    return (x >= a.x && x < a.right && y >= a.y && y < a.bottom);

};

/**
* Determines whether the specified coordinates are contained within the region defined by the given raw values.
* @method Phaser.Rectangle.containsRaw
* @param {number} rx - The x coordinate of the top left of the area.
* @param {number} ry - The y coordinate of the top left of the area.
* @param {number} rw - The width of the area.
* @param {number} rh - The height of the area.
* @param {number} x - The x coordinate of the point to test.
* @param {number} y - The y coordinate of the point to test.
* @return {boolean} A value of true if the Rectangle object contains the specified point; otherwise false.
*/
Phaser.Rectangle.containsRaw = function (rx, ry, rw, rh, x, y) {

    return (x >= rx && x < (rx + rw) && y >= ry && y < (ry + rh));

};

/**
* Determines whether the specified point is contained within the rectangular region defined by this Rectangle object. This method is similar to the Rectangle.contains() method, except that it takes a Point object as a parameter.
* @method Phaser.Rectangle.containsPoint
* @param {Phaser.Rectangle} a - The Rectangle object.
* @param {Phaser.Point} point - The point object being checked. Can be Point or any object with .x and .y values.
* @return {boolean} A value of true if the Rectangle object contains the specified point; otherwise false.
*/
Phaser.Rectangle.containsPoint = function (a, point) {

    return Phaser.Rectangle.contains(a, point.x, point.y);

};

/**
* Determines whether the first Rectangle object is fully contained within the second Rectangle object.
* A Rectangle object is said to contain another if the second Rectangle object falls entirely within the boundaries of the first.
* @method Phaser.Rectangle.containsRect
* @param {Phaser.Rectangle} a - The first Rectangle object.
* @param {Phaser.Rectangle} b - The second Rectangle object.
* @return {boolean} A value of true if the Rectangle object contains the specified point; otherwise false.
*/
Phaser.Rectangle.containsRect = function (a, b) {

    //  If the given rect has a larger volume than this one then it can never contain it
    if (a.volume > b.volume)
    {
        return false;
    }

    return (a.x >= b.x && a.y >= b.y && a.right < b.right && a.bottom < b.bottom);

};

/**
* Determines whether the two Rectangles are equal.
* This method compares the x, y, width and height properties of each Rectangle.
* @method Phaser.Rectangle.equals
* @param {Phaser.Rectangle} a - The first Rectangle object.
* @param {Phaser.Rectangle} b - The second Rectangle object.
* @return {boolean} A value of true if the two Rectangles have exactly the same values for the x, y, width and height properties; otherwise false.
*/
Phaser.Rectangle.equals = function (a, b) {

    return (a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height);

};

/**
* Determines if the two objects (either Rectangles or Rectangle-like) have the same width and height values under strict equality.
* @method Phaser.Rectangle.sameDimensions
* @param {Rectangle-like} a - The first Rectangle object.
* @param {Rectangle-like} b - The second Rectangle object.
* @return {boolean} True if the object have equivalent values for the width and height properties.
*/
Phaser.Rectangle.sameDimensions = function (a, b) {

    return (a.width === b.width && a.height === b.height);

};

/**
* If the Rectangle object specified in the toIntersect parameter intersects with this Rectangle object, returns the area of intersection as a Rectangle object. If the Rectangles do not intersect, this method returns an empty Rectangle object with its properties set to 0.
* @method Phaser.Rectangle.intersection
* @param {Phaser.Rectangle} a - The first Rectangle object.
* @param {Phaser.Rectangle} b - The second Rectangle object.
* @param {Phaser.Rectangle} [output] - Optional Rectangle object. If given the intersection values will be set into this object, otherwise a brand new Rectangle object will be created and returned.
* @return {Phaser.Rectangle} A Rectangle object that equals the area of intersection. If the Rectangles do not intersect, this method returns an empty Rectangle object; that is, a Rectangle with its x, y, width, and height properties set to 0.
*/
Phaser.Rectangle.intersection = function (a, b, output) {

    if (output === undefined)
    {
        output = new Phaser.Rectangle();
    }

    if (Phaser.Rectangle.intersects(a, b))
    {
        output.x = Math.max(a.x, b.x);
        output.y = Math.max(a.y, b.y);
        output.width = Math.min(a.right, b.right) - output.x;
        output.height = Math.min(a.bottom, b.bottom) - output.y;
    }

    return output;

};

/**
* Determines whether the two Rectangles intersect with each other.
* This method checks the x, y, width, and height properties of the Rectangles.
* @method Phaser.Rectangle.intersects
* @param {Phaser.Rectangle} a - The first Rectangle object.
* @param {Phaser.Rectangle} b - The second Rectangle object.
* @return {boolean} A value of true if the specified object intersects with this Rectangle object; otherwise false.
*/
Phaser.Rectangle.intersects = function (a, b) {

    if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0)
    {
        return false;
    }

    return !(a.right < b.x || a.bottom < b.y || a.x > b.right || a.y > b.bottom);

};

/**
* Determines whether the object specified intersects (overlaps) with the given values.
* @method Phaser.Rectangle.intersectsRaw
* @param {number} left - The x coordinate of the left of the area.
* @param {number} right - The right coordinate of the area.
* @param {number} top - The y coordinate of the area.
* @param {number} bottom - The bottom coordinate of the area.
* @param {number} tolerance - A tolerance value to allow for an intersection test with padding, default to 0
* @return {boolean} A value of true if the specified object intersects with the Rectangle; otherwise false.
*/
Phaser.Rectangle.intersectsRaw = function (a, left, right, top, bottom, tolerance) {

    if (tolerance === undefined) { tolerance = 0; }

    return !(left > a.right + tolerance || right < a.left - tolerance || top > a.bottom + tolerance || bottom < a.top - tolerance);

};

/**
* Adds two Rectangles together to create a new Rectangle object, by filling in the horizontal and vertical space between the two Rectangles.
* @method Phaser.Rectangle.union
* @param {Phaser.Rectangle} a - The first Rectangle object.
* @param {Phaser.Rectangle} b - The second Rectangle object.
* @param {Phaser.Rectangle} [output] - Optional Rectangle object. If given the new values will be set into this object, otherwise a brand new Rectangle object will be created and returned.
* @return {Phaser.Rectangle} A Rectangle object that is the union of the two Rectangles.
*/
Phaser.Rectangle.union = function (a, b, output) {

    if (output === undefined)
    {
        output = new Phaser.Rectangle();
    }

    return output.setTo(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.max(a.right, b.right) - Math.min(a.left, b.left), Math.max(a.bottom, b.bottom) - Math.min(a.top, b.top));

};

/**
* Calculates the Axis Aligned Bounding Box (or aabb) from an array of points.
*
* @method Phaser.Rectangle#aabb
* @param {Phaser.Point[]} points - The array of one or more points.
* @param {Phaser.Rectangle} [out] - Optional Rectangle to store the value in, if not supplied a new Rectangle object will be created.
* @return {Phaser.Rectangle} The new Rectangle object.
* @static
*/
Phaser.Rectangle.aabb = function(points, out) {

    if (out === undefined) {
        out = new Phaser.Rectangle();
    }

    var xMax = Number.NEGATIVE_INFINITY,
        xMin = Number.POSITIVE_INFINITY,
        yMax = Number.NEGATIVE_INFINITY,
        yMin = Number.POSITIVE_INFINITY;

    points.forEach(function(point) {
        if (point.x > xMax) {
            xMax = point.x;
        }
        if (point.x < xMin) {
            xMin = point.x;
        }

        if (point.y > yMax) {
            yMax = point.y;
        }
        if (point.y < yMin) {
            yMin = point.y;
        }
    });

    out.setTo(xMin, yMin, xMax - xMin, yMax - yMin);

    return out;
};

//   Because PIXI uses its own Rectangle, we'll replace it with ours to avoid duplicating code or confusion.
PIXI.Rectangle = Phaser.Rectangle;
PIXI.EmptyRectangle = new Phaser.Rectangle(0, 0, 0, 0);

/**
* @author       Mat Groves http://matgroves.com/
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Rounded Rectangle object is an area defined by its position and has nice rounded corners, 
* as indicated by its top-left corner point (x, y) and by its width and its height.
*
* @class Phaser.RoundedRectangle
* @constructor
* @param {number} [x=0] - The x coordinate of the top-left corner of the Rectangle.
* @param {number} [y=0] - The y coordinate of the top-left corner of the Rectangle.
* @param {number} [width=0] - The width of the Rectangle. Should always be either zero or a positive value.
* @param {number} [height=0] - The height of the Rectangle. Should always be either zero or a positive value.
* @param {number} [radius=20] - Controls the radius of the rounded corners.
*/
Phaser.RoundedRectangle = function(x, y, width, height, radius)
{
    if (x === undefined) { x = 0; }
    if (y === undefined) { y = 0; }
    if (width === undefined) { width = 0; }
    if (height === undefined) { height = 0; }
    if (radius === undefined) { radius = 20; }

    /**
    * @property {number} x - The x coordinate of the top-left corner of the Rectangle.
    */
    this.x = x;

    /**
    * @property {number} y - The y coordinate of the top-left corner of the Rectangle.
    */
    this.y = y;

    /**
    * @property {number} width - The width of the Rectangle. This value should never be set to a negative.
    */
    this.width = width;

    /**
    * @property {number} height - The height of the Rectangle. This value should never be set to a negative.
    */
    this.height = height;

    /**
    * @property {number} radius - The radius of the rounded corners.
    */
    this.radius = radius || 20;

    /**
    * @property {number} type - The const type of this object.
    * @readonly
    */
    this.type = Phaser.ROUNDEDRECTANGLE;
};

Phaser.RoundedRectangle.prototype = {

    /**
    * Returns a new RoundedRectangle object with the same values for the x, y, width, height and
    * radius properties as this RoundedRectangle object.
    * 
    * @method Phaser.RoundedRectangle#clone
    * @return {Phaser.RoundedRectangle}
    */
    clone: function () {

        return new Phaser.RoundedRectangle(this.x, this.y, this.width, this.height, this.radius);

    },

    /**
    * Determines whether the specified coordinates are contained within the region defined by this Rounded Rectangle object.
    * 
    * @method Phaser.RoundedRectangle#contains
    * @param {number} x - The x coordinate of the point to test.
    * @param {number} y - The y coordinate of the point to test.
    * @return {boolean} A value of true if the RoundedRectangle Rectangle object contains the specified point; otherwise false.
    */
    contains: function (x, y) {

        if (this.width <= 0 || this.height <= 0)
        {
            return false;
        }

        var x1 = this.x;

        if (x >= x1 && x <= x1 + this.width)
        {
            var y1 = this.y;

            if (y >= y1 && y <= y1 + this.height)
            {
                return true;
            }
        }

        return false;

    }

};

Phaser.RoundedRectangle.prototype.constructor = Phaser.RoundedRectangle;

//  Because PIXI uses its own type, we'll replace it with ours to avoid duplicating code or confusion.
PIXI.RoundedRectangle = Phaser.RoundedRectangle;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Camera is your view into the game world. It has a position and size and renders only those objects within its field of view.
* The game automatically creates a single Stage sized camera on boot. Move the camera around the world with Phaser.Camera.x/y
*
* @class Phaser.Camera
* @constructor
* @param {Phaser.Game} game - Game reference to the currently running game.
* @param {number} id - Not being used at the moment, will be when Phaser supports multiple camera
* @param {number} x - Position of the camera on the X axis
* @param {number} y - Position of the camera on the Y axis
* @param {number} width - The width of the view rectangle
* @param {number} height - The height of the view rectangle
*/
Phaser.Camera = function (game, id, x, y, width, height) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;

    /**
    * @property {Phaser.World} world - A reference to the game world.
    */
    this.world = game.world;

    /**
    * @property {number} id - Reserved for future multiple camera set-ups.
    * @default
    */
    this.id = 0;

    /**
    * Camera view.
    * The view into the world we wish to render (by default the game dimensions).
    * The x/y values are in world coordinates, not screen coordinates, the width/height is how many pixels to render.
    * Sprites outside of this view are not rendered if Sprite.autoCull is set to `true`. Otherwise they are always rendered.
    * @property {Phaser.Rectangle} view
    */
    this.view = new Phaser.Rectangle(x, y, width, height);

    /**
    * The Camera is bound to this Rectangle and cannot move outside of it. By default it is enabled and set to the size of the World.
    * The Rectangle can be located anywhere in the world and updated as often as you like. If you don't wish the Camera to be bound
    * at all then set this to null. The values can be anything and are in World coordinates, with 0,0 being the top-left of the world.
    *
    * @property {Phaser.Rectangle} bounds - The Rectangle in which the Camera is bounded. Set to null to allow for movement anywhere.
    */
    this.bounds = new Phaser.Rectangle(x, y, width, height);

    /**
    * @property {Phaser.Rectangle} deadzone - Moving inside this Rectangle will not cause the camera to move.
    */
    this.deadzone = null;

    /**
    * @property {boolean} visible - Whether this camera is visible or not.
    * @default
    */
    this.visible = true;

    /**
    * @property {boolean} roundPx - If a Camera has roundPx set to `true` it will call `view.floor` as part of its update loop, keeping its boundary to integer values. Set this to `false` to disable this from happening.
    * @default
    */
    this.roundPx = true;

    /**
    * @property {boolean} atLimit - Whether this camera is flush with the World Bounds or not.
    */
    this.atLimit = { x: false, y: false };

    /**
    * @property {Phaser.Sprite} target - If the camera is tracking a Sprite, this is a reference to it, otherwise null.
    * @default
    */
    this.target = null;

    /**
    * @property {PIXI.DisplayObject} displayObject - The display object to which all game objects are added. Set by World.boot.
    */
    this.displayObject = null;

    /**
    * @property {Phaser.Point} scale - The scale of the display object to which all game objects are added. Set by World.boot.
    */
    this.scale = null;

    /**
    * @property {number} totalInView - The total number of Sprites with `autoCull` set to `true` that are visible by this Camera.
    * @readonly
    */
    this.totalInView = 0;

    /**
    * The linear interpolation value to use when following a target.
    * The default values of 1 means the camera will instantly snap to the target coordinates.
    * A lower value, such as 0.1 means the camera will more slowly track the target, giving
    * a smooth transition. You can set the horizontal and vertical values independently, and also
    * adjust this value in real-time during your game.
    * @property {Phaser.Point} lerp
    * @default
    */
    this.lerp = new Phaser.Point(1, 1);

    /**
    * @property {Phaser.Signal} onShakeComplete - This signal is dispatched when the camera shake effect completes.
    */
    this.onShakeComplete = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onFlashComplete - This signal is dispatched when the camera flash effect completes.
    */
    this.onFlashComplete = new Phaser.Signal();

    /**
    * This signal is dispatched when the camera fade effect completes.
    * When the fade effect completes you will be left with the screen black (or whatever
    * color you faded to). In order to reset this call `Camera.resetFX`. This is called
    * automatically when you change State.
    * @property {Phaser.Signal} onFadeComplete
    */
    this.onFadeComplete = new Phaser.Signal();

    /**
    * The Graphics object used to handle camera fx such as fade and flash.
    * @property {Phaser.Graphics} fx
    * @protected
    */
    this.fx = null;

    /**
    * @property {Phaser.Point} _targetPosition - Internal point used to calculate target position.
    * @private
    */
    this._targetPosition = new Phaser.Point();

    /**
    * @property {number} edge - Edge property.
    * @private
    * @default
    */
    this._edge = 0;

    /**
    * @property {Phaser.Point} position - Current position of the camera in world.
    * @private
    * @default
    */
    this._position = new Phaser.Point();

    /**
    * @property {Object} _shake - The shake effect container.
    * @private
    */
    this._shake = {
        intensity: 0,
        duration: 0,
        horizontal: false,
        vertical: false,
        shakeBounds: true,
        x: 0,
        y: 0
    };

    /**
    * @property {number} _fxDuration - FX duration timer.
    * @private
    */
    this._fxDuration = 0;

    /**
    * @property {number} _fxType - The FX type running.
    * @private
    */
    this._fxType = 0;

};

/**
* @constant
* @type {number}
*/
Phaser.Camera.FOLLOW_LOCKON = 0;

/**
* @constant
* @type {number}
*/
Phaser.Camera.FOLLOW_PLATFORMER = 1;

/**
* @constant
* @type {number}
*/
Phaser.Camera.FOLLOW_TOPDOWN = 2;

/**
* @constant
* @type {number}
*/
Phaser.Camera.FOLLOW_TOPDOWN_TIGHT = 3;

/**
* @constant
* @type {number}
*/
Phaser.Camera.SHAKE_BOTH = 4;

/**
* @constant
* @type {number}
*/
Phaser.Camera.SHAKE_HORIZONTAL = 5;

/**
* @constant
* @type {number}
*/
Phaser.Camera.SHAKE_VERTICAL = 6;

/**
* @constant
* @type {boolean}
*/
Phaser.Camera.ENABLE_FX = true;

Phaser.Camera.prototype = {

    /**
    * Called automatically by Phaser.World.
    *
    * @method Phaser.Camera#boot
    * @private
    */
    boot: function () {

        this.displayObject = this.game.world;

        this.scale = this.game.world.scale;

        this.game.camera = this;

        if (Phaser.Graphics && Phaser.Camera.ENABLE_FX)
        {
            this.fx = new Phaser.Graphics(this.game);

            this.game.stage.addChild(this.fx);
        }

    },

    /**
    * Camera preUpdate. Sets the total view counter to zero.
    *
    * @method Phaser.Camera#preUpdate
    */
    preUpdate: function () {

        this.totalInView = 0;

    },

    /**
    * Tell the camera which sprite to follow.
    *
    * You can set the follow type and a linear interpolation value.
    * Use low lerp values (such as 0.1) to automatically smooth the camera motion.
    *
    * If you find you're getting a slight "jitter" effect when following a Sprite it's probably to do with sub-pixel rendering of the Sprite position.
    * This can be disabled by setting `game.renderer.renderSession.roundPixels = true` to force full pixel rendering.
    *
    * @method Phaser.Camera#follow
    * @param {Phaser.Sprite|Phaser.Image|Phaser.Text} target - The object you want the camera to track. Set to null to not follow anything.
    * @param {number} [style] - Leverage one of the existing "deadzone" presets. If you use a custom deadzone, ignore this parameter and manually specify the deadzone after calling follow().
    * @param {float} [lerpX=1] - A value between 0 and 1. This value specifies the amount of linear interpolation to use when horizontally tracking the target. The closer the value to 1, the faster the camera will track.
    * @param {float} [lerpY=1] - A value between 0 and 1. This value specifies the amount of linear interpolation to use when vertically tracking the target. The closer the value to 1, the faster the camera will track.
    */
    follow: function (target, style, lerpX, lerpY) {

        if (style === undefined) { style = Phaser.Camera.FOLLOW_LOCKON; }
        if (lerpX === undefined) { lerpX = 1; }
        if (lerpY === undefined) { lerpY = 1; }

        this.target = target;
        this.lerp.set(lerpX, lerpY);

        var helper;

        switch (style) {

            case Phaser.Camera.FOLLOW_PLATFORMER:
                var w = this.width / 8;
                var h = this.height / 3;
                this.deadzone = new Phaser.Rectangle((this.width - w) / 2, (this.height - h) / 2 - h * 0.25, w, h);
                break;

            case Phaser.Camera.FOLLOW_TOPDOWN:
                helper = Math.max(this.width, this.height) / 4;
                this.deadzone = new Phaser.Rectangle((this.width - helper) / 2, (this.height - helper) / 2, helper, helper);
                break;

            case Phaser.Camera.FOLLOW_TOPDOWN_TIGHT:
                helper = Math.max(this.width, this.height) / 8;
                this.deadzone = new Phaser.Rectangle((this.width - helper) / 2, (this.height - helper) / 2, helper, helper);
                break;

            case Phaser.Camera.FOLLOW_LOCKON:
                this.deadzone = null;
                break;

            default:
                this.deadzone = null;
                break;
        }

    },

    /**
    * Sets the Camera follow target to null, stopping it from following an object if it's doing so.
    *
    * @method Phaser.Camera#unfollow
    */
    unfollow: function () {

        this.target = null;

    },

    /**
    * Move the camera focus on a display object instantly.
    * @method Phaser.Camera#focusOn
    * @param {any} displayObject - The display object to focus the camera on. Must have visible x/y properties.
    */
    focusOn: function (displayObject) {

        this.setPosition(Math.round(displayObject.x - this.view.halfWidth), Math.round(displayObject.y - this.view.halfHeight));

    },

    /**
    * Move the camera focus on a location instantly.
    * @method Phaser.Camera#focusOnXY
    * @param {number} x - X position.
    * @param {number} y - Y position.
    */
    focusOnXY: function (x, y) {

        this.setPosition(Math.round(x - this.view.halfWidth), Math.round(y - this.view.halfHeight));

    },

    /**
    * This creates a camera shake effect. It works by applying a random amount of additional
    * spacing on the x and y axis each frame. You can control the intensity and duration
    * of the effect, and if it should effect both axis or just one.
    *
    * When the shake effect ends the signal Camera.onShakeComplete is dispatched.
    *
    * @method Phaser.Camera#shake
    * @param {float} [intensity=0.05] - The intensity of the camera shake. Given as a percentage of the camera size representing the maximum distance that the camera can move while shaking.
    * @param {number} [duration=500] - The duration of the shake effect in milliseconds.
    * @param {boolean} [force=true] - If a camera shake effect is already running and force is true it will replace the previous effect, resetting the duration.
    * @param {number} [direction=Phaser.Camera.SHAKE_BOTH] - The directions in which the camera can shake. Either Phaser.Camera.SHAKE_BOTH, Phaser.Camera.SHAKE_HORIZONTAL or Phaser.Camera.SHAKE_VERTICAL.
    * @param {boolean} [shakeBounds=true] - Is the effect allowed to shake the camera beyond its bounds (if set?).
    * @return {boolean} True if the shake effect was started, otherwise false.
    */
    shake: function (intensity, duration, force, direction, shakeBounds) {

        if (intensity === undefined) { intensity = 0.05; }
        if (duration === undefined) { duration = 500; }
        if (force === undefined) { force = true; }
        if (direction === undefined) { direction = Phaser.Camera.SHAKE_BOTH; }
        if (shakeBounds === undefined) { shakeBounds = true; }

        if (!force && this._shake.duration > 0)
        {
            //  Can't reset an already running shake
            return false;
        }

        this._shake.intensity = intensity;
        this._shake.duration = duration;
        this._shake.shakeBounds = shakeBounds;

        this._shake.x = 0;
        this._shake.y = 0;

        this._shake.horizontal = (direction === Phaser.Camera.SHAKE_BOTH || direction === Phaser.Camera.SHAKE_HORIZONTAL);
        this._shake.vertical = (direction === Phaser.Camera.SHAKE_BOTH || direction === Phaser.Camera.SHAKE_VERTICAL);

        return true;

    },

    /**
    * This creates a camera flash effect. It works by filling the game with the solid fill
    * color specified, and then fading it away to alpha 0 over the duration given.
    *
    * You can use this for things such as hit feedback effects.
    *
    * When the effect ends the signal Camera.onFlashComplete is dispatched.
    *
    * @method Phaser.Camera#flash
    * @param {numer} [color=0xffffff] - The color of the flash effect. I.e. 0xffffff for white, 0xff0000 for red, etc.
    * @param {number} [duration=500] - The duration of the flash effect in milliseconds.
    * @param {boolean} [force=false] - If a camera flash or fade effect is already running and force is true it will replace the previous effect, resetting the duration.
    * @return {boolean} True if the effect was started, otherwise false.
    */
    flash: function (color, duration, force) {

        if (color === undefined) { color = 0xffffff; }
        if (duration === undefined) { duration = 500; }
        if (force === undefined) { force = false; }

        if (!this.fx || (!force && this._fxDuration > 0))
        {
            return false;
        }

        this.fx.clear();

        this.fx.beginFill(color);
        this.fx.drawRect(0, 0, this.width, this.height);
        this.fx.endFill();

        this.fx.alpha = 1;

        this._fxDuration = duration;
        this._fxType = 0;

        return true;

    },

    /**
    * This creates a camera fade effect. It works by filling the game with the
    * color specified, over the duration given, ending with a solid fill.
    *
    * You can use this for things such as transitioning to a new scene.
    *
    * The game will be left 'filled' at the end of this effect, likely obscuring
    * everything. In order to reset it you can call `Camera.resetFX` and it will clear the
    * fade. Or you can call `Camera.flash` with the same color as the fade, and it will
    * reverse the process, bringing the game back into view again.
    *
    * When the effect ends the signal Camera.onFadeComplete is dispatched.
    *
    * @method Phaser.Camera#fade
    * @param {numer} [color=0x000000] - The color the game will fade to. I.e. 0x000000 for black, 0xff0000 for red, etc.
    * @param {number} [duration=500] - The duration of the fade in milliseconds.
    * @param {boolean} [force=false] - If a camera flash or fade effect is already running and force is true it will replace the previous effect, resetting the duration.
    * @return {boolean} True if the effect was started, otherwise false.
    */
    fade: function (color, duration, force) {

        if (color === undefined) { color = 0x000000; }
        if (duration === undefined) { duration = 500; }
        if (force === undefined) { force = false; }

        if (!this.fx || (!force && this._fxDuration > 0))
        {
            return false;
        }

        this.fx.clear();

        this.fx.beginFill(color);
        this.fx.drawRect(0, 0, this.width, this.height);
        this.fx.endFill();

        this.fx.alpha = 0;

        this._fxDuration = duration;
        this._fxType = 1;

        return true;

    },

    /**
    * The camera update loop. This is called automatically by the core game loop.
    *
    * @method Phaser.Camera#update
    * @protected
    */
    update: function () {

        if (this._fxDuration > 0)
        {
            this.updateFX();
        }

        if (this._shake.duration > 0)
        {
            this.updateShake();
        }

        if (this.bounds)
        {
            this.checkBounds();
        }

        if (this.roundPx)
        {
            this.view.floor();
            this._shake.x = Math.floor(this._shake.x);
            this._shake.y = Math.floor(this._shake.y);
        }

        this.displayObject.position.x = -this.view.x;
        this.displayObject.position.y = -this.view.y;

    },

    /**
    * Update the camera flash and fade effects.
    *
    * @method Phaser.Camera#updateFX
    * @private
    */
    updateFX: function () {

        if (this._fxType === 0)
        {
            //  flash
            this.fx.alpha -= this.game.time.elapsedMS / this._fxDuration;

            if (this.fx.alpha <= 0)
            {
                this._fxDuration = 0;
                this.fx.alpha = 0;
                this.onFlashComplete.dispatch();
            }
        }
        else
        {
            //  fade
            this.fx.alpha += this.game.time.elapsedMS / this._fxDuration;

            if (this.fx.alpha >= 1)
            {
                this._fxDuration = 0;
                this.fx.alpha = 1;
                this.onFadeComplete.dispatch();
            }
        }

    },

    /**
    * Update the camera shake effect.
    *
    * @method Phaser.Camera#updateShake
    * @private
    */
    updateShake: function () {

        this._shake.duration -= this.game.time.elapsedMS;

        if (this._shake.duration <= 0)
        {
            this.onShakeComplete.dispatch();
            this._shake.x = 0;
            this._shake.y = 0;
        }
        else
        {
            if (this._shake.horizontal)
            {
                this._shake.x = this.game.rnd.frac() * this._shake.intensity * this.view.width * 2 - this._shake.intensity * this.view.width;
            }

            if (this._shake.vertical)
            {
                this._shake.y = this.game.rnd.frac() * this._shake.intensity * this.view.height * 2 - this._shake.intensity * this.view.height;
            }
        }

    },

    /**
    * Internal method that handles tracking a sprite.
    *
    * @method Phaser.Camera#updateTarget
    * @private
    */
    updateTarget: function () {

        this._targetPosition.x = this.view.x + this.target.worldPosition.x;
        this._targetPosition.y = this.view.y + this.target.worldPosition.y;

        if (this.deadzone)
        {
            this._edge = this._targetPosition.x - this.view.x;

            if (this._edge < this.deadzone.left)
            {
                this.view.x = this.game.math.linear(this.view.x, this._targetPosition.x - this.deadzone.left, this.lerp.x);
            }
            else if (this._edge > this.deadzone.right)
            {
                this.view.x = this.game.math.linear(this.view.x, this._targetPosition.x - this.deadzone.right, this.lerp.x);
            }

            this._edge = this._targetPosition.y - this.view.y;

            if (this._edge < this.deadzone.top)
            {
                this.view.y = this.game.math.linear(this.view.y, this._targetPosition.y - this.deadzone.top, this.lerp.y);
            }
            else if (this._edge > this.deadzone.bottom)
            {
                this.view.y = this.game.math.linear(this.view.y, this._targetPosition.y - this.deadzone.bottom, this.lerp.y);
            }
        }
        else
        {
            this.view.x = this.game.math.linear(this.view.x, this._targetPosition.x - this.view.halfWidth, this.lerp.x);
            this.view.y = this.game.math.linear(this.view.y, this._targetPosition.y - this.view.halfHeight, this.lerp.y);
        }

        if (this.bounds)
        {
            this.checkBounds();
        }

        if (this.roundPx)
        {
            this.view.floor();
        }

        this.displayObject.position.x = -this.view.x;
        this.displayObject.position.y = -this.view.y;

    },

    /**
    * Update the Camera bounds to match the game world.
    *
    * @method Phaser.Camera#setBoundsToWorld
    */
    setBoundsToWorld: function () {

        if (this.bounds)
        {
            this.bounds.copyFrom(this.game.world.bounds);
        }

    },

    /**
    * Method called to ensure the camera doesn't venture outside of the game world.
    * Called automatically by Camera.update.
    *
    * @method Phaser.Camera#checkBounds
    * @protected
    */
    checkBounds: function () {

        this.atLimit.x = false;
        this.atLimit.y = false;

        var vx = this.view.x + this._shake.x;
        var vw = this.view.right + this._shake.x;
        var vy = this.view.y + this._shake.y;
        var vh = this.view.bottom + this._shake.y;

        //  Make sure we didn't go outside the cameras bounds
        if (vx <= this.bounds.x * this.scale.x)
        {
            this.atLimit.x = true;
            this.view.x = this.bounds.x * this.scale.x;

            if (!this._shake.shakeBounds)
            {
                //  The camera is up against the bounds, so reset the shake
                this._shake.x = 0;
            }
        }

        if (vw >= this.bounds.right * this.scale.x)
        {
            this.atLimit.x = true;
            this.view.x = (this.bounds.right * this.scale.x) - this.width;

            if (!this._shake.shakeBounds)
            {
                //  The camera is up against the bounds, so reset the shake
                this._shake.x = 0;
            }
        }

        if (vy <= this.bounds.top * this.scale.y)
        {
            this.atLimit.y = true;
            this.view.y = this.bounds.top * this.scale.y;

            if (!this._shake.shakeBounds)
            {
                //  The camera is up against the bounds, so reset the shake
                this._shake.y = 0;
            }
        }

        if (vh >= this.bounds.bottom * this.scale.y)
        {
            this.atLimit.y = true;
            this.view.y = (this.bounds.bottom * this.scale.y) - this.height;

            if (!this._shake.shakeBounds)
            {
                //  The camera is up against the bounds, so reset the shake
                this._shake.y = 0;
            }
        }

    },

    /**
    * A helper function to set both the X and Y properties of the camera at once
    * without having to use game.camera.x and game.camera.y.
    *
    * @method Phaser.Camera#setPosition
    * @param {number} x - X position.
    * @param {number} y - Y position.
    */
    setPosition: function (x, y) {

        this.view.x = x;
        this.view.y = y;

        if (this.bounds)
        {
            this.checkBounds();
        }

    },

    /**
    * Sets the size of the view rectangle given the width and height in parameters.
    *
    * @method Phaser.Camera#setSize
    * @param {number} width - The desired width.
    * @param {number} height - The desired height.
    */
    setSize: function (width, height) {

        this.view.width = width;
        this.view.height = height;

    },

    /**
    * Resets the camera back to 0,0 and un-follows any object it may have been tracking.
    * Also immediately resets any camera effects that may have been running such as
    * shake, flash or fade.
    *
    * @method Phaser.Camera#reset
    */
    reset: function () {

        this.target = null;

        this.view.x = 0;
        this.view.y = 0;

        this._shake.duration = 0;

        this.resetFX();

    },

    /**
    * Resets any active FX, such as a fade or flash and immediately clears it.
    * Useful to calling after a fade in order to remove the fade from the Stage.
    *
    * @method Phaser.Camera#resetFX
    */
    resetFX: function () {

        this.fx.clear();

        this.fx.alpha = 0;

        this._fxDuration = 0;

    }

};

Phaser.Camera.prototype.constructor = Phaser.Camera;

/**
* The Cameras x coordinate. This value is automatically clamped if it falls outside of the World bounds.
* @name Phaser.Camera#x
* @property {number} x - Gets or sets the cameras x position.
*/
Object.defineProperty(Phaser.Camera.prototype, "x", {

    get: function () {

        return this.view.x;

    },

    set: function (value) {

        this.view.x = value;

        if (this.bounds)
        {
            this.checkBounds();
        }
    }

});

/**
* The Cameras y coordinate. This value is automatically clamped if it falls outside of the World bounds.
* @name Phaser.Camera#y
* @property {number} y - Gets or sets the cameras y position.
*/
Object.defineProperty(Phaser.Camera.prototype, "y", {

    get: function () {

        return this.view.y;

    },

    set: function (value) {

        this.view.y = value;

        if (this.bounds)
        {
            this.checkBounds();
        }
    }

});

/**
* The Cameras position. This value is automatically clamped if it falls outside of the World bounds.
* @name Phaser.Camera#position
* @property {Phaser.Point} position - Gets or sets the cameras xy position using Phaser.Point object.
*/
Object.defineProperty(Phaser.Camera.prototype, "position", {

    get: function () {

        this._position.set(this.view.x, this.view.y);

        return this._position;

    },

    set: function (value) {

        if (typeof value.x !== "undefined") { this.view.x = value.x; }
        if (typeof value.y !== "undefined") { this.view.y = value.y; }

        if (this.bounds)
        {
            this.checkBounds();
        }
    }

});

/**
* The Cameras width. By default this is the same as the Game size and should not be adjusted for now.
* @name Phaser.Camera#width
* @property {number} width - Gets or sets the cameras width.
*/
Object.defineProperty(Phaser.Camera.prototype, "width", {

    get: function () {

        return this.view.width;

    },

    set: function (value) {

        this.view.width = value;

    }

});

/**
* The Cameras height. By default this is the same as the Game size and should not be adjusted for now.
* @name Phaser.Camera#height
* @property {number} height - Gets or sets the cameras height.
*/
Object.defineProperty(Phaser.Camera.prototype, "height", {

    get: function () {

        return this.view.height;

    },

    set: function (value) {

        this.view.height = value;

    }

});


/**
* The Cameras shake intensity.
* @name Phaser.Camera#shakeIntensity
* @property {number} shakeIntensity - Gets or sets the cameras shake intensity.
*/
Object.defineProperty(Phaser.Camera.prototype, "shakeIntensity", {

    get: function () {

        return this._shake.intensity;

    },

    set: function (value) {

        this._shake.intensity = value;

    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* This is a base State class which can be extended if you are creating your own game.
* It provides quick access to common functions such as the camera, cache, input, match, sound and more.
*
* @class Phaser.State
* @constructor
*/
Phaser.State = function () {

    /**
    * @property {Phaser.Game} game - This is a reference to the currently running Game.
    */
    this.game = null;

    /**
    * @property {string} key - The string based identifier given to the State when added into the State Manager.
    */
    this.key = '';

    /**
    * @property {Phaser.GameObjectFactory} add - A reference to the GameObjectFactory which can be used to add new objects to the World.
    */
    this.add = null;

    /**
    * @property {Phaser.GameObjectCreator} make - A reference to the GameObjectCreator which can be used to make new objects.
    */
    this.make = null;

    /**
    * @property {Phaser.Camera} camera - A handy reference to World.camera.
    */
    this.camera = null;

    /**
    * @property {Phaser.Cache} cache - A reference to the game cache which contains any loaded or generated assets, such as images, sound and more.
    */
    this.cache = null;

    /**
    * @property {Phaser.Input} input - A reference to the Input Manager.
    */
    this.input = null;

    /**
    * @property {Phaser.Loader} load - A reference to the Loader, which you mostly use in the preload method of your state to load external assets.
    */
    this.load = null;

    /**
    * @property {Phaser.Math} math - A reference to Math class with lots of helpful functions.
    */
    this.math = null;

    /**
    * @property {Phaser.SoundManager} sound - A reference to the Sound Manager which can create, play and stop sounds, as well as adjust global volume.
    */
    this.sound = null;

    /**
    * @property {Phaser.ScaleManager} scale - A reference to the Scale Manager which controls the way the game scales on different displays.
    */
    this.scale = null;

    /**
    * @property {Phaser.Stage} stage - A reference to the Stage.
    */
    this.stage = null;

    /**
    * @property {Phaser.StateManager} stage - A reference to the State Manager, which controls state changes.
    */
    this.state = null;

    /**
    * @property {Phaser.Time} time - A reference to the game clock and timed events system.
    */
    this.time = null;

    /**
    * @property {Phaser.TweenManager} tweens - A reference to the tween manager.
    */
    this.tweens = null;

    /**
    * @property {Phaser.World} world - A reference to the game world. All objects live in the Game World and its size is not bound by the display resolution.
    */
    this.world = null;

    /**
    * @property {Phaser.Particles} particles - The Particle Manager. It is called during the core gameloop and updates any Particle Emitters it has created.
    */
    this.particles = null;

    /**
    * @property {Phaser.Physics} physics - A reference to the physics manager which looks after the different physics systems available within Phaser.
    */
    this.physics = null;

    /**
    * @property {Phaser.RandomDataGenerator} rnd - A reference to the seeded and repeatable random data generator.
    */
    this.rnd = null;

};

Phaser.State.prototype = {

    /**
    * init is the very first function called when your State starts up. It's called before preload, create or anything else.
    * If you need to route the game away to another State you could do so here, or if you need to prepare a set of variables
    * or objects before the preloading starts.
    *
    * @method Phaser.State#init
    */
    init: function () {
    },

    /**
    * preload is called first. Normally you'd use this to load your game assets (or those needed for the current State)
    * You shouldn't create any objects in this method that require assets that you're also loading in this method, as
    * they won't yet be available.
    *
    * @method Phaser.State#preload
    */
    preload: function () {
    },

    /**
    * loadUpdate is called during the Loader process. This only happens if you've set one or more assets to load in the preload method.
    *
    * @method Phaser.State#loadUpdate
    */
    loadUpdate: function () {
    },

    /**
    * loadRender is called during the Loader process. This only happens if you've set one or more assets to load in the preload method.
    * The difference between loadRender and render is that any objects you render in this method you must be sure their assets exist.
    *
    * @method Phaser.State#loadRender
    */
    loadRender: function () {
    },

    /**
    * create is called once preload has completed, this includes the loading of any assets from the Loader.
    * If you don't have a preload method then create is the first method called in your State.
    *
    * @method Phaser.State#create
    */
    create: function () {
    },

    /**
    * The update method is left empty for your own use.
    * It is called during the core game loop AFTER debug, physics, plugins and the Stage have had their preUpdate methods called.
    * It is called BEFORE Stage, Tweens, Sounds, Input, Physics, Particles and Plugins have had their postUpdate methods called.
    *
    * @method Phaser.State#update
    */
    update: function () {
    },

    /**
    * The preRender method is called after all Game Objects have been updated, but before any rendering takes place.
    *
    * @method Phaser.State#preRender
    */
    preRender: function () {
    },

    /**
    * Nearly all display objects in Phaser render automatically, you don't need to tell them to render.
    * However the render method is called AFTER the game renderer and plugins have rendered, so you're able to do any
    * final post-processing style effects here. Note that this happens before plugins postRender takes place.
    *
    * @method Phaser.State#render
    */
    render: function () {
    },

    /**
    * If your game is set to Scalemode RESIZE then each time the browser resizes it will call this function, passing in the new width and height.
    *
    * @method Phaser.State#resize
    */
    resize: function () {
    },

    /**
    * This method will be called if the core game loop is paused.
    *
    * @method Phaser.State#paused
    */
    paused: function () {
    },

    /**
    * This method will be called when the core game loop resumes from a paused state.
    *
    * @method Phaser.State#resumed
    */
    resumed: function () {
    },

    /**
    * pauseUpdate is called while the game is paused instead of preUpdate, update and postUpdate.
    *
    * @method Phaser.State#pauseUpdate
    */
    pauseUpdate: function () {
    },

    /**
    * This method will be called when the State is shutdown (i.e. you switch to another state from this one).
    *
    * @method Phaser.State#shutdown
    */
    shutdown: function () {
    }

};

Phaser.State.prototype.constructor = Phaser.State;

/* jshint newcap: false */

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The State Manager is responsible for loading, setting up and switching game states.
*
* @class Phaser.StateManager
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {Phaser.State|Object} [pendingState=null] - A State object to seed the manager with.
*/
Phaser.StateManager = function (game, pendingState) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * @property {object} states - The object containing Phaser.States.
    */
    this.states = {};

    /**
    * @property {Phaser.State} _pendingState - The state to be switched to in the next frame.
    * @private
    */
    this._pendingState = null;

    if (typeof pendingState !== 'undefined' && pendingState !== null)
    {
        this._pendingState = pendingState;
    }

    /**
    * @property {boolean} _clearWorld - Clear the world when we switch state?
    * @private
    */
    this._clearWorld = false;

    /**
    * @property {boolean} _clearCache - Clear the cache when we switch state?
    * @private
    */
    this._clearCache = false;

    /**
    * @property {boolean} _created - Flag that sets if the State has been created or not.
    * @private
    */
    this._created = false;

    /**
    * @property {any[]} _args - Temporary container when you pass vars from one State to another.
    * @private
    */
    this._args = [];

    /**
    * @property {string} current - The current active State object.
    * @default
    */
    this.current = '';

    /**
    * onStateChange is a Phaser.Signal that is dispatched whenever the game changes state.
    * 
    * It is dispatched only when the new state is started, which isn't usually at the same time as StateManager.start
    * is called because state swapping is done in sync with the game loop. It is dispatched *before* any of the new states
    * methods (such as preload and create) are called, and *after* the previous states shutdown method has been run.
    *
    * The callback you specify is sent two parameters: the string based key of the new state, 
    * and the second parameter is the string based key of the old / previous state.
    * 
    * @property {Phaser.Signal} onStateChange
    */
    this.onStateChange = new Phaser.Signal();

    /**
    * @property {function} onInitCallback - This is called when the state is set as the active state.
    * @default
    */
    this.onInitCallback = null;

    /**
    * @property {function} onPreloadCallback - This is called when the state starts to load assets.
    * @default
    */
    this.onPreloadCallback = null;

    /**
    * @property {function} onCreateCallback - This is called when the state preload has finished and creation begins.
    * @default
    */
    this.onCreateCallback = null;

    /**
    * @property {function} onUpdateCallback - This is called when the state is updated, every game loop. It doesn't happen during preload (@see onLoadUpdateCallback).
    * @default
    */
    this.onUpdateCallback = null;

    /**
    * @property {function} onRenderCallback - This is called post-render. It doesn't happen during preload (see onLoadRenderCallback).
    * @default
    */
    this.onRenderCallback = null;

    /**
    * @property {function} onResizeCallback - This is called if ScaleManager.scalemode is RESIZE and a resize event occurs. It's passed the new width and height.
    * @default
    */
    this.onResizeCallback = null;

    /**
    * @property {function} onPreRenderCallback - This is called before the state is rendered and before the stage is cleared but after all game objects have had their final properties adjusted.
    * @default
    */
    this.onPreRenderCallback = null;

    /**
    * @property {function} onLoadUpdateCallback - This is called when the State is updated during the preload phase.
    * @default
    */
    this.onLoadUpdateCallback = null;

    /**
    * @property {function} onLoadRenderCallback - This is called when the State is rendered during the preload phase.
    * @default
    */
    this.onLoadRenderCallback = null;

    /**
    * @property {function} onPausedCallback - This is called when the game is paused.
    * @default
    */
    this.onPausedCallback = null;

    /**
    * @property {function} onResumedCallback - This is called when the game is resumed from a paused state.
    * @default
    */
    this.onResumedCallback = null;

    /**
    * @property {function} onPauseUpdateCallback - This is called every frame while the game is paused.
    * @default
    */
    this.onPauseUpdateCallback = null;

    /**
    * @property {function} onShutDownCallback - This is called when the state is shut down (i.e. swapped to another state).
    * @default
    */
    this.onShutDownCallback = null;

};

Phaser.StateManager.prototype = {

    /**
    * The Boot handler is called by Phaser.Game when it first starts up.
    * @method Phaser.StateManager#boot
    * @private
    */
    boot: function () {

        this.game.onPause.add(this.pause, this);
        this.game.onResume.add(this.resume, this);

        if (this._pendingState !== null && typeof this._pendingState !== 'string')
        {
            this.add('default', this._pendingState, true);
        }

    },

    /**
    * Adds a new State into the StateManager. You must give each State a unique key by which you'll identify it.
    * The State can be either a Phaser.State object (or an object that extends it), a plain JavaScript object or a function.
    * If a function is given a new state object will be created by calling it.
    *
    * @method Phaser.StateManager#add
    * @param {string} key - A unique key you use to reference this state, i.e. "MainMenu", "Level1".
    * @param {Phaser.State|object|function} state  - The state you want to switch to.
    * @param {boolean} [autoStart=false]  - If true the State will be started immediately after adding it.
    */
    add: function (key, state, autoStart) {

        if (autoStart === undefined) { autoStart = false; }

        var newState;

        if (state instanceof Phaser.State)
        {
            newState = state;
        }
        else if (typeof state === 'object')
        {
            newState = state;
            newState.game = this.game;
        }
        else if (typeof state === 'function')
        {
            newState = new state(this.game);
        }

        this.states[key] = newState;

        if (autoStart)
        {
            if (this.game.isBooted)
            {
                this.start(key);
            }
            else
            {
                this._pendingState = key;
            }
        }

        return newState;

    },

    /**
    * Delete the given state.
    * @method Phaser.StateManager#remove
    * @param {string} key - A unique key you use to reference this state, i.e. "MainMenu", "Level1".
    */
    remove: function (key) {

        if (this.current === key)
        {
            this.callbackContext = null;

            this.onInitCallback = null;
            this.onShutDownCallback = null;

            this.onPreloadCallback = null;
            this.onLoadRenderCallback = null;
            this.onLoadUpdateCallback = null;
            this.onCreateCallback = null;
            this.onUpdateCallback = null;
            this.onPreRenderCallback = null;
            this.onRenderCallback = null;
            this.onResizeCallback = null;
            this.onPausedCallback = null;
            this.onResumedCallback = null;
            this.onPauseUpdateCallback = null;
        }

        delete this.states[key];

    },

    /**
    * Start the given State. If a State is already running then State.shutDown will be called (if it exists) before switching to the new State.
    *
    * @method Phaser.StateManager#start
    * @param {string} key - The key of the state you want to start.
    * @param {boolean} [clearWorld=true] - Clear everything in the world? This clears the World display list fully (but not the Stage, so if you've added your own objects to the Stage they will need managing directly)
    * @param {boolean} [clearCache=false] - Clear the Game.Cache? This purges out all loaded assets. The default is false and you must have clearWorld=true if you want to clearCache as well.
    * @param {...*} parameter - Additional parameters that will be passed to the State.init function (if it has one).
    */
    start: function (key, clearWorld, clearCache) {

        if (clearWorld === undefined) { clearWorld = true; }
        if (clearCache === undefined) { clearCache = false; }

        if (this.checkState(key))
        {
            //  Place the state in the queue. It will be started the next time the game loop begins.
            this._pendingState = key;
            this._clearWorld = clearWorld;
            this._clearCache = clearCache;

            if (arguments.length > 3)
            {
                this._args = Array.prototype.splice.call(arguments, 3);
            }
        }

    },

    /**
    * Restarts the current State. State.shutDown will be called (if it exists) before the State is restarted.
    *
    * @method Phaser.StateManager#restart
    * @param {boolean} [clearWorld=true] - Clear everything in the world? This clears the World display list fully (but not the Stage, so if you've added your own objects to the Stage they will need managing directly)
    * @param {boolean} [clearCache=false] - Clear the Game.Cache? This purges out all loaded assets. The default is false and you must have clearWorld=true if you want to clearCache as well.
    * @param {...*} parameter - Additional parameters that will be passed to the State.init function if it has one.
    */
    restart: function (clearWorld, clearCache) {

        if (clearWorld === undefined) { clearWorld = true; }
        if (clearCache === undefined) { clearCache = false; }

        //  Place the state in the queue. It will be started the next time the game loop starts.
        this._pendingState = this.current;
        this._clearWorld = clearWorld;
        this._clearCache = clearCache;

        if (arguments.length > 2)
        {
            this._args = Array.prototype.slice.call(arguments, 2);
        }

    },

    /**
    * Used by onInit and onShutdown when those functions don't exist on the state
    * @method Phaser.StateManager#dummy
    * @private
    */
    dummy: function () {
    },

    /**
    * preUpdate is called right at the start of the game loop. It is responsible for changing to a new state that was requested previously.
    *
    * @method Phaser.StateManager#preUpdate
    */
    preUpdate: function () {

        if (this._pendingState && this.game.isBooted)
        {
            var previousStateKey = this.current;

            //  Already got a state running?
            this.clearCurrentState();

            this.setCurrentState(this._pendingState);

            this.onStateChange.dispatch(this.current, previousStateKey);

            if (this.current !== this._pendingState)
            {
                return;
            }
            else
            {
                this._pendingState = null;
            }

            //  If StateManager.start has been called from the init of a State that ALSO has a preload, then
            //  onPreloadCallback will be set, but must be ignored
            if (this.onPreloadCallback)
            {
                this.game.load.reset(true);
                this.onPreloadCallback.call(this.callbackContext, this.game);

                //  Is the loader empty?
                if (this.game.load.totalQueuedFiles() === 0 && this.game.load.totalQueuedPacks() === 0)
                {
                    this.loadComplete();
                }
                else
                {
                    //  Start the loader going as we have something in the queue
                    this.game.load.start();
                }
            }
            else
            {
                //  No init? Then there was nothing to load either
                this.loadComplete();
            }
        }

    },

    /**
    * This method clears the current State, calling its shutdown callback. The process also removes any active tweens,
    * resets the camera, resets input, clears physics, removes timers and if set clears the world and cache too.
    *
    * @method Phaser.StateManager#clearCurrentState
    */
    clearCurrentState: function () {

        if (this.current)
        {
            if (this.onShutDownCallback)
            {
                this.onShutDownCallback.call(this.callbackContext, this.game);
            }

            this.game.tweens.removeAll();

            this.game.camera.reset();

            this.game.input.reset(true);

            this.game.physics.clear();

            this.game.time.removeAll();

            this.game.scale.reset(this._clearWorld);

            if (this.game.debug)
            {
                this.game.debug.reset();
            }

            if (this._clearWorld)
            {
                this.game.world.shutdown();

                if (this._clearCache)
                {
                    this.game.cache.destroy();
                }
            }
        }

    },

    /**
    * Checks if a given phaser state is valid. A State is considered valid if it has at least one of the core functions: preload, create, update or render.
    *
    * @method Phaser.StateManager#checkState
    * @param {string} key - The key of the state you want to check.
    * @return {boolean} true if the State has the required functions, otherwise false.
    */
    checkState: function (key) {

        if (this.states[key])
        {
            if (this.states[key]['preload'] || this.states[key]['create'] || this.states[key]['update'] || this.states[key]['render'])
            {
                return true;
            }
            else
            {
                console.warn("Invalid Phaser State object given. Must contain at least a one of the required functions: preload, create, update or render");
                return false;
            }
        }
        else
        {
            console.warn("Phaser.StateManager - No state found with the key: " + key);
            return false;
        }

    },

    /**
    * Links game properties to the State given by the key.
    *
    * @method Phaser.StateManager#link
    * @param {string} key - State key.
    * @protected
    */
    link: function (key) {

        this.states[key].game = this.game;
        this.states[key].add = this.game.add;
        this.states[key].make = this.game.make;
        this.states[key].camera = this.game.camera;
        this.states[key].cache = this.game.cache;
        this.states[key].input = this.game.input;
        this.states[key].load = this.game.load;
        this.states[key].math = this.game.math;
        this.states[key].sound = this.game.sound;
        this.states[key].scale = this.game.scale;
        this.states[key].state = this;
        this.states[key].stage = this.game.stage;
        this.states[key].time = this.game.time;
        this.states[key].tweens = this.game.tweens;
        this.states[key].world = this.game.world;
        this.states[key].particles = this.game.particles;
        this.states[key].rnd = this.game.rnd;
        this.states[key].physics = this.game.physics;
        this.states[key].key = key;

    },

    /**
    * Nulls all State level Phaser properties, including a reference to Game.
    *
    * @method Phaser.StateManager#unlink
    * @param {string} key - State key.
    * @protected
    */
    unlink: function (key) {

        if (this.states[key])
        {
            this.states[key].game = null;
            this.states[key].add = null;
            this.states[key].make = null;
            this.states[key].camera = null;
            this.states[key].cache = null;
            this.states[key].input = null;
            this.states[key].load = null;
            this.states[key].math = null;
            this.states[key].sound = null;
            this.states[key].scale = null;
            this.states[key].state = null;
            this.states[key].stage = null;
            this.states[key].time = null;
            this.states[key].tweens = null;
            this.states[key].world = null;
            this.states[key].particles = null;
            this.states[key].rnd = null;
            this.states[key].physics = null;
        }

    },

    /**
    * Sets the current State. Should not be called directly (use StateManager.start)
    *
    * @method Phaser.StateManager#setCurrentState
    * @param {string} key - State key.
    * @private
    */
    setCurrentState: function (key) {

        this.callbackContext = this.states[key];

        this.link(key);

        //  Used when the state is set as being the current active state
        this.onInitCallback = this.states[key]['init'] || this.dummy;

        this.onPreloadCallback = this.states[key]['preload'] || null;
        this.onLoadRenderCallback = this.states[key]['loadRender'] || null;
        this.onLoadUpdateCallback = this.states[key]['loadUpdate'] || null;
        this.onCreateCallback = this.states[key]['create'] || null;
        this.onUpdateCallback = this.states[key]['update'] || null;
        this.onPreRenderCallback = this.states[key]['preRender'] || null;
        this.onRenderCallback = this.states[key]['render'] || null;
        this.onResizeCallback = this.states[key]['resize'] || null;
        this.onPausedCallback = this.states[key]['paused'] || null;
        this.onResumedCallback = this.states[key]['resumed'] || null;
        this.onPauseUpdateCallback = this.states[key]['pauseUpdate'] || null;

        //  Used when the state is no longer the current active state
        this.onShutDownCallback = this.states[key]['shutdown'] || this.dummy;

        //  Reset the physics system, but not on the first state start
        if (this.current !== '')
        {
            this.game.physics.reset();
        }

        this.current = key;
        this._created = false;

        //  At this point key and pendingState should equal each other
        this.onInitCallback.apply(this.callbackContext, this._args);

        //  If they no longer do then the init callback hit StateManager.start
        if (key === this._pendingState)
        {
            this._args = [];
        }

        this.game._kickstart = true;

    },

    /**
     * Gets the current State.
     *
     * @method Phaser.StateManager#getCurrentState
     * @return {Phaser.State}
     * @public
     */
    getCurrentState: function() {
        return this.states[this.current];
    },

    /**
    * @method Phaser.StateManager#loadComplete
    * @protected
    */
    loadComplete: function () {

        //  Make sure to do load-update one last time before state is set to _created
        if (this._created === false && this.onLoadUpdateCallback)
        {
            this.onLoadUpdateCallback.call(this.callbackContext, this.game);
        }

        if (this._created === false && this.onCreateCallback)
        {
            this._created = true;
            this.onCreateCallback.call(this.callbackContext, this.game);
        }
        else
        {
            this._created = true;
        }

    },

    /**
    * @method Phaser.StateManager#pause
    * @protected
    */
    pause: function () {

        if (this._created && this.onPausedCallback)
        {
            this.onPausedCallback.call(this.callbackContext, this.game);
        }

    },

    /**
    * @method Phaser.StateManager#resume
    * @protected
    */
    resume: function () {

        if (this._created && this.onResumedCallback)
        {
            this.onResumedCallback.call(this.callbackContext, this.game);
        }

    },

    /**
    * @method Phaser.StateManager#update
    * @protected
    */
    update: function () {

        if (this._created)
        {
            if (this.onUpdateCallback)
            {
                this.onUpdateCallback.call(this.callbackContext, this.game);
            }
        }
        else
        {
            if (this.onLoadUpdateCallback)
            {
                this.onLoadUpdateCallback.call(this.callbackContext, this.game);
            }
        }

    },

    /**
    * @method Phaser.StateManager#pauseUpdate
    * @protected
    */
    pauseUpdate: function () {

        if (this._created)
        {
            if (this.onPauseUpdateCallback)
            {
                this.onPauseUpdateCallback.call(this.callbackContext, this.game);
            }
        }
        else
        {
            if (this.onLoadUpdateCallback)
            {
                this.onLoadUpdateCallback.call(this.callbackContext, this.game);
            }
        }

    },

    /**
    * @method Phaser.StateManager#preRender
    * @protected
    * @param {number} elapsedTime - The time elapsed since the last update.
    */
    preRender: function (elapsedTime) {

        if (this._created && this.onPreRenderCallback)
        {
            this.onPreRenderCallback.call(this.callbackContext, this.game, elapsedTime);
        }

    },

    /**
    * @method Phaser.StateManager#resize
    * @protected
    */
    resize: function (width, height) {

        if (this.onResizeCallback)
        {
            this.onResizeCallback.call(this.callbackContext, width, height);
        }

    },

    /**
    * @method Phaser.StateManager#render
    * @protected
    */
    render: function () {

        if (this._created)
        {
            if (this.onRenderCallback)
            {
                if (this.game.renderType === Phaser.CANVAS)
                {
                    this.game.context.save();
                    this.game.context.setTransform(1, 0, 0, 1, 0, 0);
                    this.onRenderCallback.call(this.callbackContext, this.game);
                    this.game.context.restore();
                }
                else
                {
                    this.onRenderCallback.call(this.callbackContext, this.game);
                }
            }
        }
        else
        {
            if (this.onLoadRenderCallback)
            {
                this.onLoadRenderCallback.call(this.callbackContext, this.game);
            }
        }

    },

    /**
    * Removes all StateManager callback references to the State object, nulls the game reference and clears the States object.
    * You don't recover from this without rebuilding the Phaser instance again.
    * @method Phaser.StateManager#destroy
    */
    destroy: function () {

        this._clearWorld = true;
        this._clearCache = true;

        this.clearCurrentState();

        this.callbackContext = null;

        this.onInitCallback = null;
        this.onShutDownCallback = null;

        this.onPreloadCallback = null;
        this.onLoadRenderCallback = null;
        this.onLoadUpdateCallback = null;
        this.onCreateCallback = null;
        this.onUpdateCallback = null;
        this.onRenderCallback = null;
        this.onPausedCallback = null;
        this.onResumedCallback = null;
        this.onPauseUpdateCallback = null;

        this.game = null;
        this.states = {};
        this._pendingState = null;
        this.current = '';

    }

};

Phaser.StateManager.prototype.constructor = Phaser.StateManager;

/**
* @name Phaser.StateManager#created
* @property {boolean} created - True if the current state has had its `create` method run (if it has one, if not this is true by default).
* @readOnly
*/
Object.defineProperty(Phaser.StateManager.prototype, "created", {

    get: function () {

        return this._created;

    }

});

/**
* "It's like nailing jelly to a kitten" - Gary Penn
*/

/**
* @author       Miller Medeiros http://millermedeiros.github.com/js-signals/
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Signals are what Phaser uses to handle events and event dispatching.
* You can listen for a Signal by binding a callback / function to it.
* This is done by using either `Signal.add` or `Signal.addOnce`.
*
* For example you can listen for a touch or click event from the Input Manager 
* by using its `onDown` Signal:
*
* `game.input.onDown.add(function() { ... });`
*
* Rather than inline your function, you can pass a reference:
*
* `game.input.onDown.add(clicked, this);`
* `function clicked () { ... }`
*
* In this case the second argument (`this`) is the context in which your function should be called.
*
* Now every time the InputManager dispatches the `onDown` signal (or event), your function
* will be called.
*
* Very often a Signal will send arguments to your function.
* This is specific to the Signal itself.
* If you're unsure then check the documentation, or failing that simply do:
*
* `Signal.add(function() { console.log(arguments); })`
*
* and it will log all of the arguments your function received from the Signal.
*
* Sprites have lots of default signals you can listen to in their Events class, such as:
*
* `sprite.events.onKilled`
* 
* Which is called automatically whenever the Sprite is killed.
* There are lots of other events, see the Events component for a list.
*
* As well as listening to pre-defined Signals you can also create your own:
*
* `var mySignal = new Phaser.Signal();`
*
* This creates a new Signal. You can bind a callback to it:
*
* `mySignal.add(myCallback, this);`
*
* and then finally when ready you can dispatch the Signal:
*
* `mySignal.dispatch(your arguments);`
*
* And your callback will be invoked. See the dispatch method for more details.
*
* @class Phaser.Signal
* @constructor
*/
Phaser.Signal = function () {};

Phaser.Signal.prototype = {

    /**
    * @property {?Array.<Phaser.SignalBinding>} _bindings - Internal variable.
    * @private
    */
    _bindings: null,

    /**
    * @property {any} _prevParams - Internal variable.
    * @private
    */
    _prevParams: null,

    /**
    * Memorize the previously dispatched event?
    *
    * If an event has been memorized it is automatically dispatched when a new listener is added with {@link #add} or {@link #addOnce}.
    * Use {@link #forget} to clear any currently memorized event.
    *
    * @property {boolean} memorize
    */
    memorize: false,

    /**
    * @property {boolean} _shouldPropagate
    * @private
    */
    _shouldPropagate: true,

    /**
    * Is the Signal active? Only active signals will broadcast dispatched events.
    *
    * Setting this property during a dispatch will only affect the next dispatch. To stop the propagation of a signal from a listener use {@link #halt}.
    *
    * @property {boolean} active
    * @default
    */
    active: true,

    /**
    * @property {function} _boundDispatch - The bound dispatch function, if any.
    * @private
    */
    _boundDispatch: false,

    /**
    * @method Phaser.Signal#validateListener
    * @param {function} listener - Signal handler function.
    * @param {string} fnName - Function name.
    * @private
    */
    validateListener: function (listener, fnName) {

        if (typeof listener !== 'function')
        {
            throw new Error('Phaser.Signal: listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName));
        }

    },

    /**
    * @method Phaser.Signal#_registerListener
    * @private
    * @param {function} listener - Signal handler function.
    * @param {boolean} isOnce - Should the listener only be called once?
    * @param {object} [listenerContext] - The context under which the listener is invoked.
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0).
    * @return {Phaser.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    _registerListener: function (listener, isOnce, listenerContext, priority, args) {

        var prevIndex = this._indexOfListener(listener, listenerContext);
        var binding;

        if (prevIndex !== -1)
        {
            binding = this._bindings[prevIndex];

            if (binding.isOnce() !== isOnce)
            {
                throw new Error('You cannot add' + (isOnce ? '' : 'Once') + '() then add' + (!isOnce ? '' : 'Once') + '() the same listener without removing the relationship first.');
            }
        }
        else
        {
            binding = new Phaser.SignalBinding(this, listener, isOnce, listenerContext, priority, args);
            this._addBinding(binding);
        }

        if (this.memorize && this._prevParams)
        {
            binding.execute(this._prevParams);
        }

        return binding;

    },

    /**
    * @method Phaser.Signal#_addBinding
    * @private
    * @param {Phaser.SignalBinding} binding - An Object representing the binding between the Signal and listener.
    */
    _addBinding: function (binding) {

        if (!this._bindings)
        {
            this._bindings = [];
        }

        //  Simplified insertion sort
        var n = this._bindings.length;

        do {
            n--;
        }
        while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);

        this._bindings.splice(n + 1, 0, binding);

    },

    /**
    * @method Phaser.Signal#_indexOfListener
    * @private
    * @param {function} listener - Signal handler function.
    * @param {object} [context=null] - Signal handler function.
    * @return {number} The index of the listener within the private bindings array.
    */
    _indexOfListener: function (listener, context) {

        if (!this._bindings)
        {
            return -1;
        }

        if (context === undefined) { context = null; }

        var n = this._bindings.length;
        var cur;

        while (n--)
        {
            cur = this._bindings[n];

            if (cur._listener === listener && cur.context === context)
            {
                return n;
            }
        }

        return -1;

    },

    /**
    * Check if a specific listener is attached.
    *
    * @method Phaser.Signal#has
    * @param {function} listener - Signal handler function.
    * @param {object} [context] - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
    * @return {boolean} If Signal has the specified listener.
    */
    has: function (listener, context) {

        return this._indexOfListener(listener, context) !== -1;

    },

    /**
    * Add an event listener for this signal.
    *
    * An event listener is a callback with a related context and priority.
    *
    * You can optionally provide extra arguments which will be passed to the callback after any internal parameters.
    *
    * For example: `Phaser.Key.onDown` when dispatched will send the Phaser.Key object that caused the signal as the first parameter.
    * Any arguments you've specified after `priority` will be sent as well:
    *
    * `fireButton.onDown.add(shoot, this, 0, 'lazer', 100);`
    *
    * When onDown dispatches it will call the `shoot` callback passing it: `Phaser.Key, 'lazer', 100`.
    *
    * Where the first parameter is the one that Key.onDown dispatches internally and 'lazer', 
    * and the value 100 were the custom arguments given in the call to 'add'.
    *
    * @method Phaser.Signal#add
    * @param {function} listener - The function to call when this Signal is dispatched.
    * @param {object} [listenerContext] - The context under which the listener will be executed (i.e. the object that should represent the `this` variable).
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added (default = 0)
    * @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
    * @return {Phaser.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    add: function (listener, listenerContext, priority) {

        this.validateListener(listener, 'add');

        var args = [];

        if (arguments.length > 3)
        {
            for (var i = 3; i < arguments.length; i++)
            {
                args.push(arguments[i]);
            }
        }

        return this._registerListener(listener, false, listenerContext, priority, args);

    },

    /**
    * Add a one-time listener - the listener is automatically removed after the first execution.
    *
    * If there is as {@link Phaser.Signal#memorize memorized} event then it will be dispatched and
    * the listener will be removed immediately.
    *
    * @method Phaser.Signal#addOnce
    * @param {function} listener - The function to call when this Signal is dispatched.
    * @param {object} [listenerContext] - The context under which the listener will be executed (i.e. the object that should represent the `this` variable).
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added (default = 0)
    * @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
    * @return {Phaser.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    addOnce: function (listener, listenerContext, priority) {

        this.validateListener(listener, 'addOnce');

        var args = [];

        if (arguments.length > 3)
        {
            for (var i = 3; i < arguments.length; i++)
            {
                args.push(arguments[i]);
            }
        }

        return this._registerListener(listener, true, listenerContext, priority, args);

    },

    /**
    * Remove a single event listener.
    *
    * @method Phaser.Signal#remove
    * @param {function} listener - Handler function that should be removed.
    * @param {object} [context=null] - Execution context (since you can add the same handler multiple times if executing in a different context).
    * @return {function} Listener handler function.
    */
    remove: function (listener, context) {

        this.validateListener(listener, 'remove');

        var i = this._indexOfListener(listener, context);

        if (i !== -1)
        {
            this._bindings[i]._destroy(); //no reason to a Phaser.SignalBinding exist if it isn't attached to a signal
            this._bindings.splice(i, 1);
        }

        return listener;

    },

    /**
    * Remove all event listeners.
    *
    * @method Phaser.Signal#removeAll
    * @param {object} [context=null] - If specified only listeners for the given context will be removed.
    */
    removeAll: function (context) {

        if (context === undefined) { context = null; }

        if (!this._bindings)
        {
            return;
        }

        var n = this._bindings.length;

        while (n--)
        {
            if (context)
            {
                if (this._bindings[n].context === context)
                {
                    this._bindings[n]._destroy();
                    this._bindings.splice(n, 1);
                }
            }
            else
            {
                this._bindings[n]._destroy();
            }
        }

        if (!context)
        {
            this._bindings.length = 0;
        }

    },

    /**
    * Gets the total number of listeners attached to this Signal.
    *
    * @method Phaser.Signal#getNumListeners
    * @return {integer} Number of listeners attached to the Signal.
    */
    getNumListeners: function () {

        return this._bindings ? this._bindings.length : 0;

    },

    /**
    * Stop propagation of the event, blocking the dispatch to next listener on the queue.
    *
    * This should be called only during event dispatch as calling it before/after dispatch won't affect another broadcast.
    * See {@link #active} to enable/disable the signal entirely.
    *
    * @method Phaser.Signal#halt
    */
    halt: function () {

        this._shouldPropagate = false;

    },

    /**
    * Dispatch / broadcast the event to all listeners.
    *
    * To create an instance-bound dispatch for this Signal, use {@link #boundDispatch}.
    *
    * @method Phaser.Signal#dispatch
    * @param {any} [params] - Parameters that should be passed to each handler.
    */
    dispatch: function () {

        if (!this.active || !this._bindings)
        {
            return;
        }

        var paramsArr = Array.prototype.slice.call(arguments);
        var n = this._bindings.length;
        var bindings;

        if (this.memorize)
        {
            this._prevParams = paramsArr;
        }

        if (!n)
        {
            //  Should come after memorize
            return;
        }

        bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
        this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

        //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
        //reverse loop since listeners with higher priority will be added at the end of the list
        do {
            n--;
        }
        while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);

    },

    /**
    * Forget the currently {@link Phaser.Signal#memorize memorized} event, if any.
    *
    * @method Phaser.Signal#forget
    */
    forget: function() {

        if (this._prevParams)
        {
            this._prevParams = null;
        }

    },

    /**
    * Dispose the signal - no more events can be dispatched.
    *
    * This removes all event listeners and clears references to external objects.
    * Calling methods on a disposed objects results in undefined behavior.
    *
    * @method Phaser.Signal#dispose
    */
    dispose: function () {

        this.removeAll();

        this._bindings = null;
        if (this._prevParams)
        {
            this._prevParams = null;
        }

    },

    /**
    * A string representation of the object.
    *
    * @method Phaser.Signal#toString
    * @return {string} String representation of the object.
    */
    toString: function () {

        return '[Phaser.Signal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';

    }

};

/**
* Create a `dispatch` function that maintains a binding to the original Signal context.
*
* Use the resulting value if the dispatch function needs to be passed somewhere
* or called independently of the Signal object.
*
* @memberof Phaser.Signal
* @property {function} boundDispatch
*/
Object.defineProperty(Phaser.Signal.prototype, "boundDispatch", {

    get: function () {
        var _this = this;
        return this._boundDispatch || (this._boundDispatch = function () {
            return _this.dispatch.apply(_this, arguments);
        });
    }

});

Phaser.Signal.prototype.constructor = Phaser.Signal;

/**
* @author       Miller Medeiros http://millermedeiros.github.com/js-signals/
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Object that represents a binding between a Signal and a listener function.
* This is an internal constructor and shouldn't be created directly.
* Inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
* 
* @class Phaser.SignalBinding
* @constructor
* @param {Phaser.Signal} signal - Reference to Signal object that listener is currently bound to.
* @param {function} listener - Handler function bound to the signal.
* @param {boolean} isOnce - If binding should be executed just once.
* @param {object} [listenerContext=null] - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
* @param {number} [priority] - The priority level of the event listener. (default = 0).
* @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
*/
Phaser.SignalBinding = function (signal, listener, isOnce, listenerContext, priority, args) {

    /**
    * @property {Phaser.Game} _listener - Handler function bound to the signal.
    * @private
    */
    this._listener = listener;

    if (isOnce)
    {
        this._isOnce = true;
    }

    if (listenerContext != null) /* not null/undefined */
    {
        this.context = listenerContext;
    }

    /**
    * @property {Phaser.Signal} _signal - Reference to Signal object that listener is currently bound to.
    * @private
    */
    this._signal = signal;

    if (priority)
    {
        this._priority = priority;
    }

    if (args && args.length)
    {
        this._args = args;
    }

};

Phaser.SignalBinding.prototype = {

    /**
    * @property {?object} context - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
    */
    context: null,

    /**
    * @property {boolean} _isOnce - If binding should be executed just once.
    * @private
    */
    _isOnce: false,

    /**
    * @property {number} _priority - Listener priority.
    * @private
    */
    _priority: 0,

    /**
    * @property {array} _args - Listener arguments.
    * @private
    */
    _args: null,

    /**
    * @property {number} callCount - The number of times the handler function has been called.
    */
    callCount: 0,

    /**
    * If binding is active and should be executed.
    * @property {boolean} active
    * @default
    */
    active: true,

    /**
    * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute` (curried parameters).
    * @property {array|null} params
    * @default
    */
    params: null,

    /**
    * Call listener passing arbitrary parameters.
    * If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.
    * @method Phaser.SignalBinding#execute
    * @param {any[]} [paramsArr] - Array of parameters that should be passed to the listener.
    * @return {any} Value returned by the listener.
    */
    execute: function(paramsArr) {

        var handlerReturn, params;

        if (this.active && !!this._listener)
        {
            params = this.params ? this.params.concat(paramsArr) : paramsArr;

            if (this._args)
            {
                params = params.concat(this._args);
            }

            handlerReturn = this._listener.apply(this.context, params);

            this.callCount++;

            if (this._isOnce)
            {
                this.detach();
            }
        }

        return handlerReturn;

    },

    /**
    * Detach binding from signal.
    * alias to: @see mySignal.remove(myBinding.getListener());
    * @method Phaser.SignalBinding#detach
    * @return {function|null} Handler function bound to the signal or `null` if binding was previously detached.
    */
    detach: function () {
        return this.isBound() ? this._signal.remove(this._listener, this.context) : null;
    },

    /**
    * @method Phaser.SignalBinding#isBound
    * @return {boolean} True if binding is still bound to the signal and has a listener.
    */
    isBound: function () {
        return (!!this._signal && !!this._listener);
    },

    /**
    * @method Phaser.SignalBinding#isOnce
    * @return {boolean} If SignalBinding will only be executed once.
    */
    isOnce: function () {
        return this._isOnce;
    },

    /**
    * @method Phaser.SignalBinding#getListener
    * @return {function} Handler function bound to the signal.
    */
    getListener: function () {
        return this._listener;
    },

    /**
    * @method Phaser.SignalBinding#getSignal
    * @return {Phaser.Signal} Signal that listener is currently bound to.
    */
    getSignal: function () {
        return this._signal;
    },

    /**
    * Delete instance properties
    * @method Phaser.SignalBinding#_destroy
    * @private
    */
    _destroy: function () {
        delete this._signal;
        delete this._listener;
        delete this.context;
    },

    /**
    * @method Phaser.SignalBinding#toString
    * @return {string} String representation of the object.
    */
    toString: function () {
        return '[Phaser.SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
    }

};

Phaser.SignalBinding.prototype.constructor = Phaser.SignalBinding;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* This is a base Filter class to use for any Phaser filter development.
*
* The vast majority of filters (including all of those that ship with Phaser) use fragment shaders, and
* therefore only work in WebGL and are not supported by Canvas at all.
*
* @class Phaser.Filter
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {object} uniforms - Uniform mappings object
* @param {Array|string} fragmentSrc - The fragment shader code. Either an array, one element per line of code, or a string.
*/
Phaser.Filter = function (game, uniforms, fragmentSrc) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * @property {number} type - The const type of this object, either Phaser.WEBGL_FILTER or Phaser.CANVAS_FILTER.
    * @default
    */
    this.type = Phaser.WEBGL_FILTER;

    /**
    * An array of passes - some filters contain a few steps this array simply stores the steps in a linear fashion.
    * For example the blur filter has two passes blurX and blurY.
    * @property {array} passes - An array of filter objects.
    * @private
    */
    this.passes = [this];

    /**
    * @property {array} shaders - Array an array of shaders.
    * @private
    */
    this.shaders = [];

    /**
    * @property {boolean} dirty - Internal PIXI var.
    * @default
    */
    this.dirty = true;

    /**
    * @property {number} padding - Internal PIXI var.
    * @default
    */
    this.padding = 0;

    /**
    * @property {Phaser.Point} prevPoint - The previous position of the pointer (we don't update the uniform if the same)
    */
    this.prevPoint = new Phaser.Point();

    /*
    * The supported types are: 1f, 1fv, 1i, 2f, 2fv, 2i, 2iv, 3f, 3fv, 3i, 3iv, 4f, 4fv, 4i, 4iv, mat2, mat3, mat4 and sampler2D.
    */

    var d = new Date();

    /**
    * @property {object} uniforms - Default uniform mappings. Compatible with ShaderToy and GLSLSandbox.
    */
    this.uniforms = {

        resolution: { type: '2f', value: { x: 256, y: 256 }},
        time: { type: '1f', value: 0 },
        mouse: { type: '2f', value: { x: 0.0, y: 0.0 } },
        date: { type: '4fv', value: [ d.getFullYear(),  d.getMonth(),  d.getDate(), d.getHours() *60 * 60 + d.getMinutes() * 60 + d.getSeconds() ] },
        sampleRate: { type: '1f', value: 44100.0 },
        iChannel0: { type: 'sampler2D', value: null, textureData: { repeat: true } },
        iChannel1: { type: 'sampler2D', value: null, textureData: { repeat: true } },
        iChannel2: { type: 'sampler2D', value: null, textureData: { repeat: true } },
        iChannel3: { type: 'sampler2D', value: null, textureData: { repeat: true } }

    };

    //  Copy over/replace any passed in the constructor
    if (uniforms)
    {
        for (var key in uniforms)
        {
            this.uniforms[key] = uniforms[key];
        }
    }

    /**
    * @property {array|string} fragmentSrc - The fragment shader code.
    */
    this.fragmentSrc = fragmentSrc || '';

};

Phaser.Filter.prototype = {

    /**
    * Should be over-ridden.
    * @method Phaser.Filter#init
    */
    init: function () {
        //  This should be over-ridden. Will receive a variable number of arguments.
    },

    /**
    * Set the resolution uniforms on the filter.
    * @method Phaser.Filter#setResolution
    * @param {number} width - The width of the display.
    * @param {number} height - The height of the display.
    */
    setResolution: function (width, height) {

        this.uniforms.resolution.value.x = width;
        this.uniforms.resolution.value.y = height;

    },

    /**
    * Updates the filter.
    * @method Phaser.Filter#update
    * @param {Phaser.Pointer} [pointer] - A Pointer object to use for the filter. The coordinates are mapped to the mouse uniform.
    */
    update: function (pointer) {

        if (typeof pointer !== 'undefined')
        {
            var x = pointer.x / this.game.width;
            var y = 1 - pointer.y / this.game.height;

            if (x !== this.prevPoint.x || y !== this.prevPoint.y)
            {
                this.uniforms.mouse.value.x = x.toFixed(2);
                this.uniforms.mouse.value.y = y.toFixed(2);
                this.prevPoint.set(x, y);
            }
        }

        this.uniforms.time.value = this.game.time.totalElapsedSeconds();

    },

    /**
    * Creates a new Phaser.Image object using a blank texture and assigns 
    * this Filter to it. The image is then added to the world.
    *
    * If you don't provide width and height values then Filter.width and Filter.height are used.
    *
    * If you do provide width and height values then this filter will be resized to match those
    * values.
    *
    * @method Phaser.Filter#addToWorld
    * @param {number} [x=0] - The x coordinate to place the Image at.
    * @param {number} [y=0] - The y coordinate to place the Image at.
    * @param {number} [width] - The width of the Image. If not specified (or null) it will use Filter.width. If specified Filter.width will be set to this value.
    * @param {number} [height] - The height of the Image. If not specified (or null) it will use Filter.height. If specified Filter.height will be set to this value.
    * @param {number} [anchorX=0] - Set the x anchor point of the Image. A value between 0 and 1, where 0 is the top-left and 1 is bottom-right.
    * @param {number} [anchorY=0] - Set the y anchor point of the Image. A value between 0 and 1, where 0 is the top-left and 1 is bottom-right.
    * @return {Phaser.Image} The newly added Image object.
    */
    addToWorld: function (x, y, width, height, anchorX, anchorY) {

        if (anchorX === undefined) { anchorX = 0; }
        if (anchorY === undefined) { anchorY = 0; }

        if (width !== undefined && width !== null)
        {
            this.width = width;
        }
        else
        {
            width = this.width;
        }

        if (height !== undefined && height !== null)
        {
            this.height = height;
        }
        else
        {
            height = this.height;
        }

        var image = this.game.add.image(x, y, '__default');

        image.width = width;
        image.height = height;

        image.anchor.set(anchorX, anchorY);

        image.filters = [ this ];

        return image;

    },

    /**
    * Clear down this Filter and null out references
    * @method Phaser.Filter#destroy
    */
    destroy: function () {

        this.game = null;

    }

};

Phaser.Filter.prototype.constructor = Phaser.Filter;

/**
* @name Phaser.Filter#width
* @property {number} width - The width (resolution uniform)
*/
Object.defineProperty(Phaser.Filter.prototype, 'width', {

    get: function() {
        return this.uniforms.resolution.value.x;
    },

    set: function(value) {
        this.uniforms.resolution.value.x = value;
    }

});

/**
* @name Phaser.Filter#height
* @property {number} height - The height (resolution uniform)
*/
Object.defineProperty(Phaser.Filter.prototype, 'height', {

    get: function() {
        return this.uniforms.resolution.value.y;
    },

    set: function(value) {
        this.uniforms.resolution.value.y = value;
    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* This is a base Plugin template to use for any Phaser plugin development.
*
* @class Phaser.Plugin
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {any} parent - The object that owns this plugin, usually Phaser.PluginManager.
*/
Phaser.Plugin = function (game, parent) {

    if (parent === undefined) { parent = null; }

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * @property {any} parent - The parent of this plugin. If added to the PluginManager the parent will be set to that, otherwise it will be null.
    */
    this.parent = parent;

    /**
    * @property {boolean} active - A Plugin with active=true has its preUpdate and update methods called by the parent, otherwise they are skipped.
    * @default
    */
    this.active = false;

    /**
    * @property {boolean} visible - A Plugin with visible=true has its render and postRender methods called by the parent, otherwise they are skipped.
    * @default
    */
    this.visible = false;

    /**
    * @property {boolean} hasPreUpdate - A flag to indicate if this plugin has a preUpdate method.
    * @default
    */
    this.hasPreUpdate = false;

    /**
    * @property {boolean} hasUpdate - A flag to indicate if this plugin has an update method.
    * @default
    */
    this.hasUpdate = false;

    /**
    * @property {boolean} hasPostUpdate - A flag to indicate if this plugin has a postUpdate method.
    * @default
    */
    this.hasPostUpdate = false;

    /**
    * @property {boolean} hasRender - A flag to indicate if this plugin has a render method.
    * @default
    */
    this.hasRender = false;

    /**
    * @property {boolean} hasPostRender - A flag to indicate if this plugin has a postRender method.
    * @default
    */
    this.hasPostRender = false;

};

Phaser.Plugin.prototype = {

    /**
    * Pre-update is called at the very start of the update cycle, before any other subsystems have been updated (including Physics).
    * It is only called if active is set to true.
    * @method Phaser.Plugin#preUpdate
    */
    preUpdate: function () {
    },

    /**
    * Update is called after all the core subsystems (Input, Tweens, Sound, etc) and the State have updated, but before the render.
    * It is only called if active is set to true.
    * @method Phaser.Plugin#update
    */
    update: function () {
    },

    /**
    * Render is called right after the Game Renderer completes, but before the State.render.
    * It is only called if visible is set to true.
    * @method Phaser.Plugin#render
    */
    render: function () {
    },

    /**
    * Post-render is called after the Game Renderer and State.render have run.
    * It is only called if visible is set to true.
    * @method Phaser.Plugin#postRender
    */
    postRender: function () {
    },

    /**
    * Clear down this Plugin and null out references
    * @method Phaser.Plugin#destroy
    */
    destroy: function () {

        this.game = null;
        this.parent = null;
        this.active = false;
        this.visible = false;

    }

};

Phaser.Plugin.prototype.constructor = Phaser.Plugin;

/* jshint newcap: false */

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Plugin Manager is responsible for the loading, running and unloading of Phaser Plugins.
*
* @class Phaser.PluginManager
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.PluginManager = function(game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running game.
    */
    this.game = game;

    /**
    * @property {Phaser.Plugin[]} plugins - An array of all the plugins being managed by this PluginManager.
    */
    this.plugins = [];

    /**
    * @property {number} _len - Internal cache var.
    * @private
    */
    this._len = 0;

    /**
    * @property {number} _i - Internal cache var.
    * @private
    */
    this._i = 0;

};

Phaser.PluginManager.prototype = {

    /**
    * Add a new Plugin into the PluginManager.
    * The Plugin must have 2 properties: game and parent. Plugin.game is set to the game reference the PluginManager uses, and parent is set to the PluginManager.
    *
    * @method Phaser.PluginManager#add
    * @param {object|Phaser.Plugin} plugin - The Plugin to add into the PluginManager. This can be a function or an existing object.
    * @param {...*} parameter - Additional arguments that will be passed to the Plugin.init method.
    * @return {Phaser.Plugin} The Plugin that was added to the manager.
    */
    add: function (plugin) {

        var args = Array.prototype.slice.call(arguments, 1);
        var result = false;

        //  Prototype?
        if (typeof plugin === 'function')
        {
            plugin = new plugin(this.game, this);
        }
        else
        {
            plugin.game = this.game;
            plugin.parent = this;
        }

        //  Check for methods now to avoid having to do this every loop
        if (typeof plugin['preUpdate'] === 'function')
        {
            plugin.hasPreUpdate = true;
            result = true;
        }

        if (typeof plugin['update'] === 'function')
        {
            plugin.hasUpdate = true;
            result = true;
        }

        if (typeof plugin['postUpdate'] === 'function')
        {
            plugin.hasPostUpdate = true;
            result = true;
        }

        if (typeof plugin['render'] === 'function')
        {
            plugin.hasRender = true;
            result = true;
        }

        if (typeof plugin['postRender'] === 'function')
        {
            plugin.hasPostRender = true;
            result = true;
        }

        //  The plugin must have at least one of the above functions to be added to the PluginManager.
        if (result)
        {
            if (plugin.hasPreUpdate || plugin.hasUpdate || plugin.hasPostUpdate)
            {
                plugin.active = true;
            }

            if (plugin.hasRender || plugin.hasPostRender)
            {
                plugin.visible = true;
            }

            this._len = this.plugins.push(plugin);

            // Allows plugins to run potentially destructive code outside of the constructor, and only if being added to the PluginManager
            if (typeof plugin['init'] === 'function')
            {
                plugin.init.apply(plugin, args);
            }

            return plugin;
        }
        else
        {
            return null;
        }
    },

    /**
    * Remove a Plugin from the PluginManager. It calls Plugin.destroy on the plugin before removing it from the manager.
    *
    * @method Phaser.PluginManager#remove
    * @param {Phaser.Plugin} plugin - The plugin to be removed.
    * @param {boolean} [destroy=true] - Call destroy on the plugin that is removed?
    */
    remove: function (plugin, destroy) {

        if (destroy === undefined) { destroy = true; }

        this._i = this._len;

        while (this._i--)
        {
            if (this.plugins[this._i] === plugin)
            {
                if (destroy)
                {
                    plugin.destroy();
                }

                this.plugins.splice(this._i, 1);
                this._len--;
                return;
            }
        }

    },

    /**
    * Remove all Plugins from the PluginManager. It calls Plugin.destroy on every plugin before removing it from the manager.
    *
    * @method Phaser.PluginManager#removeAll
    */
    removeAll: function() {

        this._i = this._len;

        while (this._i--)
        {
            this.plugins[this._i].destroy();
        }

        this.plugins.length = 0;
        this._len = 0;

    },

    /**
    * Pre-update is called at the very start of the update cycle, before any other subsystems have been updated (including Physics).
    * It only calls plugins who have active=true.
    *
    * @method Phaser.PluginManager#preUpdate
    */
    preUpdate: function () {

        this._i = this._len;

        while (this._i--)
        {
            if (this.plugins[this._i].active && this.plugins[this._i].hasPreUpdate)
            {
                this.plugins[this._i].preUpdate();
            }
        }

    },

    /**
    * Update is called after all the core subsystems (Input, Tweens, Sound, etc) and the State have updated, but before the render.
    * It only calls plugins who have active=true.
    *
    * @method Phaser.PluginManager#update
    */
    update: function () {

        this._i = this._len;

        while (this._i--)
        {
            if (this.plugins[this._i].active && this.plugins[this._i].hasUpdate)
            {
                this.plugins[this._i].update();
            }
        }

    },

    /**
    * PostUpdate is the last thing to be called before the world render.
    * In particular, it is called after the world postUpdate, which means the camera has been adjusted.
    * It only calls plugins who have active=true.
    *
    * @method Phaser.PluginManager#postUpdate
    */
    postUpdate: function () {

        this._i = this._len;

        while (this._i--)
        {
            if (this.plugins[this._i].active && this.plugins[this._i].hasPostUpdate)
            {
                this.plugins[this._i].postUpdate();
            }
        }

    },

    /**
    * Render is called right after the Game Renderer completes, but before the State.render.
    * It only calls plugins who have visible=true.
    *
    * @method Phaser.PluginManager#render
    */
    render: function () {

        this._i = this._len;

        while (this._i--)
        {
            if (this.plugins[this._i].visible && this.plugins[this._i].hasRender)
            {
                this.plugins[this._i].render();
            }
        }

    },

    /**
    * Post-render is called after the Game Renderer and State.render have run.
    * It only calls plugins who have visible=true.
    *
    * @method Phaser.PluginManager#postRender
    */
    postRender: function () {

        this._i = this._len;

        while (this._i--)
        {
            if (this.plugins[this._i].visible && this.plugins[this._i].hasPostRender)
            {
                this.plugins[this._i].postRender();
            }
        }

    },

    /**
    * Clear down this PluginManager, calls destroy on every plugin and nulls out references.
    *
    * @method Phaser.PluginManager#destroy
    */
    destroy: function () {

        this.removeAll();

        this.game = null;

    }

};

Phaser.PluginManager.prototype.constructor = Phaser.PluginManager;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Stage controls root level display objects upon which everything is displayed.
* It also handles browser visibility handling and the pausing due to loss of focus.
*
* @class Phaser.Stage
* @extends PIXI.DisplayObjectContainer
* @constructor
* @param {Phaser.Game} game - Game reference to the currently running game.
 */
Phaser.Stage = function (game) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;

    PIXI.DisplayObjectContainer.call(this);

    /**
    * @property {string} name - The name of this object.
    * @default
    */
    this.name = '_stage_root';

    /**
    * By default if the browser tab loses focus the game will pause.
    * You can stop that behavior by setting this property to true.
    * Note that the browser can still elect to pause your game if it wishes to do so,
    * for example swapping to another browser tab. This will cause the RAF callback to halt,
    * effectively pausing your game, even though no in-game pause event is triggered if you enable this property.
    * @property {boolean} disableVisibilityChange
    * @default
    */
    this.disableVisibilityChange = false;

    /**
    * @property {boolean} exists - If exists is true the Stage and all children are updated, otherwise it is skipped.
    * @default
    */
    this.exists = true;

    /**
    * @property {PIXI.Matrix} worldTransform - Current transform of the object based on world (parent) factors
    * @private
    * @readOnly
    */
    this.worldTransform = new PIXI.Matrix();

    /**
    * @property {Phaser.Stage} stage - The stage reference (the Stage is its own stage)
    * @private
    * @readOnly
    */
    this.stage = this;

    /**
    * @property {number} currentRenderOrderID - Reset each frame, keeps a count of the total number of objects updated.
    */
    this.currentRenderOrderID = 0;

    /**
    * @property {string} hiddenVar - The page visibility API event name.
    * @private
    */
    this._hiddenVar = 'hidden';

    /**
    * @property {function} _onChange - The blur/focus event handler.
    * @private
    */
    this._onChange = null;

    /**
    * @property {number} _bgColor - Stage background color object. Populated by setBackgroundColor.
    * @private
    */
    this._bgColor = { r: 0, g: 0, b: 0, a: 0, color: 0, rgba: '#000000' };

    if (!this.game.transparent)
    {
        //  transparent = 0,0,0,0 - otherwise r,g,b,1
        this._bgColor.a = 1;
    }

    if (game.config)
    {
        this.parseConfig(game.config);
    }

};

Phaser.Stage.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Phaser.Stage.prototype.constructor = Phaser.Stage;

/**
* Parses a Game configuration object.
*
* @method Phaser.Stage#parseConfig
* @protected
* @param {object} config -The configuration object to parse.
*/
Phaser.Stage.prototype.parseConfig = function (config) {

    if (config['disableVisibilityChange'])
    {
        this.disableVisibilityChange = config['disableVisibilityChange'];
    }

    if (config['backgroundColor'])
    {
        this.setBackgroundColor(config['backgroundColor']);
    }

};

/**
* Initialises the stage and adds the event listeners.
* @method Phaser.Stage#boot
* @private
*/
Phaser.Stage.prototype.boot = function () {

    Phaser.DOM.getOffset(this.game.canvas, this.offset);

    Phaser.Canvas.setUserSelect(this.game.canvas, 'none');
    Phaser.Canvas.setTouchAction(this.game.canvas, 'none');

    this.checkVisibility();

};

/**
* This is called automatically after the plugins preUpdate and before the State.update.
* Most objects have preUpdate methods and it's where initial movement and positioning is done.
*
* @method Phaser.Stage#preUpdate
*/
Phaser.Stage.prototype.preUpdate = function () {

    this.currentRenderOrderID = 0;

    //  This can't loop in reverse, we need the renderOrderID to be in sequence
    for (var i = 0; i < this.children.length; i++)
    {
        this.children[i].preUpdate();
    }

};

/**
* This is called automatically after the State.update, but before particles or plugins update.
*
* @method Phaser.Stage#update
*/
Phaser.Stage.prototype.update = function () {

    //  Goes in reverse, because it's highly likely the child will destroy itself in `update`
    var i = this.children.length;

    while (i--)
    {
        this.children[i].update();
    }

};

/**
* This is called automatically before the renderer runs and after the plugins have updated.
* In postUpdate this is where all the final physics calculations and object positioning happens.
* The objects are processed in the order of the display list.
*
* @method Phaser.Stage#postUpdate
*/
Phaser.Stage.prototype.postUpdate = function () {

    //  Apply the camera shake, fade, bounds, etc
    this.game.camera.update();

    //  Camera target first?
    if (this.game.camera.target)
    {
        this.game.camera.target.postUpdate();

        this.updateTransform();

        this.game.camera.updateTarget();
    }

    for (var i = 0; i < this.children.length; i++)
    {
        this.children[i].postUpdate();
    }

    this.updateTransform();

};

/**
* Updates the transforms for all objects on the display list.
* This overrides the Pixi default as we don't need the interactionManager, but do need the game property check.
* 
* @method Phaser.Stage#updateTransform
*/
Phaser.Stage.prototype.updateTransform = function () {

    this.worldAlpha = 1;

    for (var i = 0; i < this.children.length; i++)
    {
        this.children[i].updateTransform();
    }

};

/**
* Starts a page visibility event listener running, or window.onpagehide/onpageshow if not supported by the browser.
* Also listens for window.onblur and window.onfocus.
* 
* @method Phaser.Stage#checkVisibility
*/
Phaser.Stage.prototype.checkVisibility = function () {

    if (document.hidden !== undefined)
    {
        this._hiddenVar = 'visibilitychange';
    }
    else if (document.webkitHidden !== undefined)
    {
        this._hiddenVar = 'webkitvisibilitychange';
    }
    else if (document.mozHidden !== undefined)
    {
        this._hiddenVar = 'mozvisibilitychange';
    }
    else if (document.msHidden !== undefined)
    {
        this._hiddenVar = 'msvisibilitychange';
    }
    else
    {
        this._hiddenVar = null;
    }

    var _this = this;

    this._onChange = function (event) {
        return _this.visibilityChange(event);
    };

    //  Does browser support it? If not (like in IE9 or old Android) we need to fall back to blur/focus
    if (this._hiddenVar)
    {
        document.addEventListener(this._hiddenVar, this._onChange, false);
    }

    window.onblur = this._onChange;
    window.onfocus = this._onChange;

    window.onpagehide = this._onChange;
    window.onpageshow = this._onChange;
    
    if (this.game.device.cocoonJSApp)
    {
        CocoonJS.App.onSuspended.addEventListener(function () {
            Phaser.Stage.prototype.visibilityChange.call(_this, { type: "pause" });
        });

        CocoonJS.App.onActivated.addEventListener(function () {
            Phaser.Stage.prototype.visibilityChange.call(_this, { type: "resume" });
        });
    }

};

/**
* This method is called when the document visibility is changed.
* 
* @method Phaser.Stage#visibilityChange
* @param {Event} event - Its type will be used to decide whether the game should be paused or not.
*/
Phaser.Stage.prototype.visibilityChange = function (event) {

    if (event.type === 'pagehide' || event.type === 'blur' || event.type === 'pageshow' || event.type === 'focus')
    {
        if (event.type === 'pagehide' || event.type === 'blur')
        {
            this.game.focusLoss(event);
        }
        else if (event.type === 'pageshow' || event.type === 'focus')
        {
            this.game.focusGain(event);
        }

        return;
    }

    if (this.disableVisibilityChange)
    {
        return;
    }

    if (document.hidden || document.mozHidden || document.msHidden || document.webkitHidden || event.type === "pause")
    {
        this.game.gamePaused(event);
    }
    else
    {
        this.game.gameResumed(event);
    }

};

/**
* Sets the background color for the Stage.
*
* The color can be given as a hex string (`'#RRGGBB'`), a CSS color string (`'rgb(r,g,b)'`), or a numeric value (`0xRRGGBB`).
*
* An alpha channel is _not_ supported and will be ignored.
*
* If you've set your game to be transparent then calls to setBackgroundColor are ignored.
*
* @method Phaser.Stage#setBackgroundColor
* @param {number|string} color - The color of the background.
*/
Phaser.Stage.prototype.setBackgroundColor = function (color) {

    if (this.game.transparent) { return; }

    Phaser.Color.valueToColor(color, this._bgColor);
    Phaser.Color.updateColor(this._bgColor);

    //  For gl.clearColor (canvas uses _bgColor.rgba)
    this._bgColor.r /= 255;
    this._bgColor.g /= 255;
    this._bgColor.b /= 255;
    this._bgColor.a = 1;

};

/**
* Destroys the Stage and removes event listeners.
*
* @method Phaser.Stage#destroy
*/
Phaser.Stage.prototype.destroy = function () {

    if (this._hiddenVar)
    {
        document.removeEventListener(this._hiddenVar, this._onChange, false);
    }

    window.onpagehide = null;
    window.onpageshow = null;

    window.onblur = null;
    window.onfocus = null;

};

/**
* @name Phaser.Stage#backgroundColor
* @property {number|string} backgroundColor - Gets and sets the background color of the stage. The color can be given as a number: 0xff0000 or a hex string: '#ff0000'
*/
Object.defineProperty(Phaser.Stage.prototype, "backgroundColor", {

    get: function () {

        return this._bgColor.color;

    },

    set: function (color) {

        this.setBackgroundColor(color);

    }

});

/**
* Enable or disable texture smoothing for all objects on this Stage. Only works for bitmap/image textures. Smoothing is enabled by default.
*
* @name Phaser.Stage#smoothed
* @property {boolean} smoothed - Set to true to smooth all sprites rendered on this Stage, or false to disable smoothing (great for pixel art)
*/
Object.defineProperty(Phaser.Stage.prototype, "smoothed", {

    get: function () {

        return PIXI.scaleModes.DEFAULT === PIXI.scaleModes.LINEAR;

    },

    set: function (value) {

        if (value)
        {
            PIXI.scaleModes.DEFAULT = PIXI.scaleModes.LINEAR;
        }
        else
        {
            PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
        }
    }

});

