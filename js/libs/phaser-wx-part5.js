import PIXI from './pixi-wx.js';
import Phaser from './phaser-wx-main.js';
/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* @classdesc
* Detects device support capabilities and is responsible for device initialization - see {@link Phaser.Device.whenReady whenReady}.
*
* This class represents a singleton object that can be accessed directly as `game.device`
* (or, as a fallback, `Phaser.Device` when a game instance is not available) without the need to instantiate it.
*
* Unless otherwise noted the device capabilities are only guaranteed after initialization. Initialization
* occurs automatically and is guaranteed complete before {@link Phaser.Game} begins its "boot" phase.
* Feature detection can be modified in the {@link Phaser.Device.onInitialized onInitialized} signal.
*
* When checking features using the exposed properties only the *truth-iness* of the value should be relied upon
* unless the documentation states otherwise: properties may return `false`, `''`, `null`, or even `undefined`
* when indicating the lack of a feature.
*
* Uses elements from System.js by MrDoob and Modernizr
*
* @description
* It is not possible to instantiate the Device class manually.
*
* @class
* @protected
*/
Phaser.Device = function () {

    /**
    * The time the device became ready.
    * @property {integer} deviceReadyAt
    * @protected
    */
    this.deviceReadyAt = 0;

    /**
    * The time as which initialization has completed.
    * @property {boolean} initialized
    * @protected
    */
    this.initialized = false;

    //  Browser / Host / Operating System

    /**
    * @property {boolean} desktop - Is running on a desktop?
    * @default
    */
    this.desktop = false;

    /**
    * @property {boolean} iOS - Is running on iOS?
    * @default
    */
    this.iOS = false;

    /**
    * @property {number} iOSVersion - If running in iOS this will contain the major version number.
    * @default
    */
    this.iOSVersion = 0;

    /**
    * @property {boolean} cocoonJS - Is the game running under CocoonJS?
    * @default
    */
    this.cocoonJS = false;
    
    /**
    * @property {boolean} cocoonJSApp - Is this game running with CocoonJS.App?
    * @default
    */
    this.cocoonJSApp = false;
    
    /**
    * @property {boolean} cordova - Is the game running under Apache Cordova?
    * @default
    */
    this.cordova = false;
    
    /**
    * @property {boolean} node - Is the game running under Node.js?
    * @default
    */
    this.node = false;
    
    /**
    * @property {boolean} nodeWebkit - Is the game running under Node-Webkit?
    * @default
    */
    this.nodeWebkit = false;
    
    /**
    * @property {boolean} electron - Is the game running under GitHub Electron?
    * @default
    */
    this.electron = false;
    
    /**
    * @property {boolean} ejecta - Is the game running under Ejecta?
    * @default
    */
    this.ejecta = false;

    /**
    * @property {boolean} crosswalk - Is the game running under the Intel Crosswalk XDK?
    * @default
    */
    this.crosswalk = false;

    /**
    * @property {boolean} android - Is running on android?
    * @default
    */
    this.android = false;

    /**
    * @property {boolean} chromeOS - Is running on chromeOS?
    * @default
    */
    this.chromeOS = false;

    /**
    * @property {boolean} linux - Is running on linux?
    * @default
    */
    this.linux = false;

    /**
    * @property {boolean} macOS - Is running on macOS?
    * @default
    */
    this.macOS = false;

    /**
    * @property {boolean} windows - Is running on windows?
    * @default
    */
    this.windows = false;

    /**
    * @property {boolean} windowsPhone - Is running on a Windows Phone?
    * @default
    */
    this.windowsPhone = false;

    //  Features

    /**
    * @property {boolean} canvas - Is canvas available?
    * @default
    */
    this.canvas = false;

    /**
    * @property {?boolean} canvasBitBltShift - True if canvas supports a 'copy' bitblt onto itself when the source and destination regions overlap.
    * @default
    */
    this.canvasBitBltShift = null;

    /**
    * @property {boolean} webGL - Is webGL available?
    * @default
    */
    this.webGL = false;

    /**
    * @property {boolean} file - Is file available?
    * @default
    */
    this.file = false;

    /**
    * @property {boolean} fileSystem - Is fileSystem available?
    * @default
    */
    this.fileSystem = false;

    /**
    * @property {boolean} localStorage - Is localStorage available?
    * @default
    */
    this.localStorage = false;

    /**
    * @property {boolean} worker - Is worker available?
    * @default
    */
    this.worker = false;

    /**
    * @property {boolean} css3D - Is css3D available?
    * @default
    */
    this.css3D = false;

    /**
    * @property {boolean} pointerLock - Is Pointer Lock available?
    * @default
    */
    this.pointerLock = false;

    /**
    * @property {boolean} typedArray - Does the browser support TypedArrays?
    * @default
    */
    this.typedArray = false;

    /**
    * @property {boolean} vibration - Does the device support the Vibration API?
    * @default
    */
    this.vibration = false;

    /**
    * @property {boolean} getUserMedia - Does the device support the getUserMedia API?
    * @default
    */
    this.getUserMedia = true;

    /**
    * @property {boolean} quirksMode - Is the browser running in strict mode (false) or quirks mode? (true)
    * @default
    */
    this.quirksMode = false;

    //  Input

    /**
    * @property {boolean} touch - Is touch available?
    * @default
    */
    this.touch = false;

    /**
    * @property {boolean} mspointer - Is mspointer available?
    * @default
    */
    this.mspointer = false;

    /**
    * @property {?string} wheelType - The newest type of Wheel/Scroll event supported: 'wheel', 'mousewheel', 'DOMMouseScroll'
    * @default
    * @protected
    */
    this.wheelEvent = null;

    //  Browser

    /**
    * @property {boolean} arora - Set to true if running in Arora.
    * @default
    */
    this.arora = false;

    /**
    * @property {boolean} chrome - Set to true if running in Chrome.
    * @default
    */
    this.chrome = false;

    /**
    * @property {number} chromeVersion - If running in Chrome this will contain the major version number.
    * @default
    */
    this.chromeVersion = 0;

    /**
    * @property {boolean} epiphany - Set to true if running in Epiphany.
    * @default
    */
    this.epiphany = false;

    /**
    * @property {boolean} firefox - Set to true if running in Firefox.
    * @default
    */
    this.firefox = false;

    /**
    * @property {number} firefoxVersion - If running in Firefox this will contain the major version number.
    * @default
    */
    this.firefoxVersion = 0;

    /**
    * @property {boolean} ie - Set to true if running in Internet Explorer.
    * @default
    */
    this.ie = false;

    /**
    * @property {number} ieVersion - If running in Internet Explorer this will contain the major version number. Beyond IE10 you should use Device.trident and Device.tridentVersion.
    * @default
    */
    this.ieVersion = 0;

    /**
    * @property {boolean} trident - Set to true if running a Trident version of Internet Explorer (IE11+)
    * @default
    */
    this.trident = false;

    /**
    * @property {number} tridentVersion - If running in Internet Explorer 11 this will contain the major version number. See {@link http://msdn.microsoft.com/en-us/library/ie/ms537503(v=vs.85).aspx}
    * @default
    */
    this.tridentVersion = 0;

    /**
    * @property {boolean} edge - Set to true if running in Microsoft Edge browser.
    * @default
    */
    this.edge = false;

    /**
    * @property {boolean} mobileSafari - Set to true if running in Mobile Safari.
    * @default
    */
    this.mobileSafari = false;

    /**
    * @property {boolean} midori - Set to true if running in Midori.
    * @default
    */
    this.midori = false;

    /**
    * @property {boolean} opera - Set to true if running in Opera.
    * @default
    */
    this.opera = false;

    /**
    * @property {boolean} safari - Set to true if running in Safari.
    * @default
    */
    this.safari = false;

    /**
    * @property {number} safariVersion - If running in Safari this will contain the major version number.
    * @default
    */
    this.safariVersion = 0;

    /**
    * @property {boolean} webApp - Set to true if running as a WebApp, i.e. within a WebView
    * @default
    */
    this.webApp = false;

    /**
    * @property {boolean} silk - Set to true if running in the Silk browser (as used on the Amazon Kindle)
    * @default
    */
    this.silk = false;

    //  Audio

    /**
    * @property {boolean} audioData - Are Audio tags available?
    * @default
    */
    this.audioData = false;

    /**
    * @property {boolean} webAudio - Is the WebAudio API available?
    * @default
    */
    this.webAudio = false;

    /**
    * @property {boolean} ogg - Can this device play ogg files?
    * @default
    */
    this.ogg = false;

    /**
    * @property {boolean} opus - Can this device play opus files?
    * @default
    */
    this.opus = false;

    /**
    * @property {boolean} mp3 - Can this device play mp3 files?
    * @default
    */
    this.mp3 = false;

    /**
    * @property {boolean} wav - Can this device play wav files?
    * @default
    */
    this.wav = false;

    /**
    * Can this device play m4a files?
    * @property {boolean} m4a - True if this device can play m4a files.
    * @default
    */
    this.m4a = false;

    /**
    * @property {boolean} webm - Can this device play webm files?
    * @default
    */
    this.webm = false;

    /**
    * @property {boolean} dolby - Can this device play EC-3 Dolby Digital Plus files?
    * @default
    */
    this.dolby = false;

    //  Video

    /**
    * @property {boolean} oggVideo - Can this device play ogg video files?
    * @default
    */
    this.oggVideo = false;

    /**
    * @property {boolean} h264Video - Can this device play h264 mp4 video files?
    * @default
    */
    this.h264Video = false;

    /**
    * @property {boolean} mp4Video - Can this device play h264 mp4 video files?
    * @default
    */
    this.mp4Video = false;

    /**
    * @property {boolean} webmVideo - Can this device play webm video files?
    * @default
    */
    this.webmVideo = false;

    /**
    * @property {boolean} vp9Video - Can this device play vp9 video files?
    * @default
    */
    this.vp9Video = false;

    /**
    * @property {boolean} hlsVideo - Can this device play hls video files?
    * @default
    */
    this.hlsVideo = false;

    //  Device

    /**
    * @property {boolean} iPhone - Is running on iPhone?
    * @default
    */
    this.iPhone = false;

    /**
    * @property {boolean} iPhone4 - Is running on iPhone4?
    * @default
    */
    this.iPhone4 = false;

    /**
    * @property {boolean} iPad - Is running on iPad?
    * @default
    */
    this.iPad = false;

    // Device features

    /**
    * @property {number} pixelRatio - PixelRatio of the host device?
    * @default
    */
    this.pixelRatio = 0;

    /**
    * @property {boolean} littleEndian - Is the device big or little endian? (only detected if the browser supports TypedArrays)
    * @default
    */
    this.littleEndian = false;

    /**
    * @property {boolean} LITTLE_ENDIAN - Same value as `littleEndian`.
    * @default
    */
    this.LITTLE_ENDIAN = false;

    /**
    * @property {boolean} support32bit - Does the device context support 32bit pixel manipulation using array buffer views?
    * @default
    */
    this.support32bit = false;

    /**
    * @property {boolean} fullscreen - Does the browser support the Full Screen API?
    * @default
    */
    this.fullscreen = false;

    /**
    * @property {string} requestFullscreen - If the browser supports the Full Screen API this holds the call you need to use to activate it.
    * @default
    */
    this.requestFullscreen = '';

    /**
    * @property {string} cancelFullscreen - If the browser supports the Full Screen API this holds the call you need to use to cancel it.
    * @default
    */
    this.cancelFullscreen = '';

    /**
    * @property {boolean} fullscreenKeyboard - Does the browser support access to the Keyboard during Full Screen mode?
    * @default
    */
    this.fullscreenKeyboard = false;

};

// Device is really a singleton/static entity; instantiate it
// and add new methods directly sans-prototype.
Phaser.Device = new Phaser.Device();

/**
* This signal is dispatched after device initialization occurs but before any of the ready
* callbacks (see {@link Phaser.Device.whenReady whenReady}) have been invoked.
*
* Local "patching" for a particular device can/should be done in this event.
*
* _Note_: This signal is removed after the device has been readied; if a handler has not been
* added _before_ `new Phaser.Game(..)` it is probably too late.
*
* @type {?Phaser.Signal}
* @static
*/
Phaser.Device.onInitialized = new Phaser.Signal();

/**
* Add a device-ready handler and ensure the device ready sequence is started.
*
* Phaser.Device will _not_ activate or initialize until at least one `whenReady` handler is added,
* which is normally done automatically be calling `new Phaser.Game(..)`.
*
* The handler is invoked when the device is considered "ready", which may be immediately
* if the device is already "ready". See {@link Phaser.Device#deviceReadyAt deviceReadyAt}.
*
* @method
* @param {function} handler - Callback to invoke when the device is ready. It is invoked with the given context the Phaser.Device object is supplied as the first argument.
* @param {object} [context] - Context in which to invoke the handler
* @param {boolean} [nonPrimer=false] - If true the device ready check will not be started.
*/
Phaser.Device.whenReady = function (callback, context, nonPrimer) {

    var readyCheck = this._readyCheck;

    if (this.deviceReadyAt || !readyCheck)
    {
        callback.call(context, this);
    }
    else if (readyCheck._monitor || nonPrimer)
    {
        readyCheck._queue = readyCheck._queue || [];
        readyCheck._queue.push([callback, context]);
    }
    else
    {
        readyCheck._monitor = readyCheck.bind(this);
        readyCheck._queue = readyCheck._queue || [];
        readyCheck._queue.push([callback, context]);
        
        var cordova = typeof window.cordova !== 'undefined';
        var cocoonJS = navigator['isCocoonJS'];

        if (document.readyState === 'complete' || document.readyState === 'interactive')
        {
            // Why is there an additional timeout here?
            window.setTimeout(readyCheck._monitor, 0);
        }
        else if (cordova && !cocoonJS)
        {
            // Ref. http://docs.phonegap.com/en/3.5.0/cordova_events_events.md.html#deviceready
            //  Cordova, but NOT Cocoon?
            document.addEventListener('deviceready', readyCheck._monitor, false);
        }
        else
        {
            document.addEventListener('DOMContentLoaded', readyCheck._monitor, false);
            window.addEventListener('load', readyCheck._monitor, false);
        }
    }

};

/**
* Internal method used for checking when the device is ready.
* This function is removed from Phaser.Device when the device becomes ready.
*
* @method
* @private
*/
Phaser.Device._readyCheck = function () {

    var readyCheck = this._readyCheck;

    if (!document.body)
    {
        window.setTimeout(readyCheck._monitor, 20);
    }
    else if (!this.deviceReadyAt)
    {
        this.deviceReadyAt = Date.now();

        document.removeEventListener('deviceready', readyCheck._monitor);
        document.removeEventListener('DOMContentLoaded', readyCheck._monitor);
        window.removeEventListener('load', readyCheck._monitor);

        this._initialize();
        this.initialized = true;

        this.onInitialized.dispatch(this);

        var item;
        while ((item = readyCheck._queue.shift()))
        {
            var callback = item[0];
            var context = item[1];
            callback.call(context, this);
        }

        // Remove no longer useful methods and properties.
        this._readyCheck = null;
        this._initialize = null;
        this.onInitialized = null;
    }

};

/**
* Internal method to initialize the capability checks.
* This function is removed from Phaser.Device once the device is initialized.
*
* @method
* @private
*/
Phaser.Device._initialize = function () {

    var device = this;

    /**
    * Check which OS is game running on.
    */
    function _checkOS () {

        var ua = navigator.userAgent;

        if (/Playstation Vita/.test(ua))
        {
            device.vita = true;
        }
        else if (/Kindle/.test(ua) || /\bKF[A-Z][A-Z]+/.test(ua) || /Silk.*Mobile Safari/.test(ua))
        {
            device.kindle = true;
            // This will NOT detect early generations of Kindle Fire, I think there is no reliable way...
            // E.g. "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.1.0-80) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true"
        }
        else if (/Android/.test(ua))
        {
            device.android = true;
        }
        else if (/CrOS/.test(ua))
        {
            device.chromeOS = true;
        }
        else if (/iP[ao]d|iPhone/i.test(ua))
        {
            device.iOS = true;
            (navigator.appVersion).match(/OS (\d+)/);
            device.iOSVersion = parseInt(RegExp.$1, 10);
        }
        else if (/Linux/.test(ua))
        {
            device.linux = true;
        }
        else if (/Mac OS/.test(ua))
        {
            device.macOS = true;
        }
        else if (/Windows/.test(ua))
        {
            device.windows = true;
        }

        if (/Windows Phone/i.test(ua) || /IEMobile/i.test(ua))
        {
            device.android = false;
            device.iOS = false;
            device.macOS = false;
            device.windows = true;
            device.windowsPhone = true;
        }

        var silk = /Silk/.test(ua); // detected in browsers

        if (device.windows || device.macOS || (device.linux && !silk) || device.chromeOS)
        {
            device.desktop = true;
        }

        //  Windows Phone / Table reset
        if (device.windowsPhone || ((/Windows NT/i.test(ua)) && (/Touch/i.test(ua))))
        {
            device.desktop = false;
        }

    }

    /**
    * Check HTML5 features of the host environment.
    */
    function _checkFeatures () {

        device.canvas = !!window['CanvasRenderingContext2D'] || device.cocoonJS;

        try {
            device.localStorage = !!localStorage.getItem;
        } catch (error) {
            device.localStorage = false;
        }

        device.file = !!window['File'] && !!window['FileReader'] && !!window['FileList'] && !!window['Blob'];
        device.fileSystem = !!window['requestFileSystem'];

        device.webGL = ( function () { try { var canvas = document.createElement( 'canvas' ); /*Force screencanvas to false*/ canvas.screencanvas = false; return !! window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ); } catch( e ) { return false; } } )();
        device.webGL = !!device.webGL;

        device.worker = !!window['Worker'];

        device.pointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

        device.quirksMode = (document.compatMode === 'CSS1Compat') ? false : true;

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

        device.getUserMedia = device.getUserMedia && !!navigator.getUserMedia && !!window.URL;

        // Older versions of firefox (< 21) apparently claim support but user media does not actually work
        if (device.firefox && device.firefoxVersion < 21)
        {
            device.getUserMedia = false;
        }

        // TODO: replace canvasBitBltShift detection with actual feature check

        // Excludes iOS versions as they generally wrap UIWebView (eg. Safari WebKit) and it
        // is safer to not try and use the fast copy-over method.
        if (!device.iOS && (device.ie || device.firefox || device.chrome))
        {
            device.canvasBitBltShift = true;
        }

        // Known not to work
        if (device.safari || device.mobileSafari)
        {
            device.canvasBitBltShift = false;
        }

    }

    /**
    * Checks/configures various input.
    */
    function _checkInput () {

        if ('ontouchstart' in document.documentElement || (window.navigator.maxTouchPoints && window.navigator.maxTouchPoints >= 1))
        {
            device.touch = true;
        }

        if (window.navigator.msPointerEnabled || window.navigator.pointerEnabled)
        {
            device.mspointer = true;
        }

        if (!device.cocoonJS)
        {
            // See https://developer.mozilla.org/en-US/docs/Web/Events/wheel
            if ('onwheel' in window || (device.ie && 'WheelEvent' in window))
            {
                // DOM3 Wheel Event: FF 17+, IE 9+, Chrome 31+, Safari 7+
                device.wheelEvent = 'wheel';
            }
            else if ('onmousewheel' in window)
            {
                // Non-FF legacy: IE 6-9, Chrome 1-31, Safari 5-7.
                device.wheelEvent = 'mousewheel';
            }
            else if (device.firefox && 'MouseScrollEvent' in window)
            {
                // FF prior to 17. This should probably be scrubbed.
                device.wheelEvent = 'DOMMouseScroll';
            }
        }

    }

    /**
    * Checks for support of the Full Screen API.
    */
    function _checkFullScreenSupport () {

        var fs = [
            'requestFullscreen',
            'requestFullScreen',
            'webkitRequestFullscreen',
            'webkitRequestFullScreen',
            'msRequestFullscreen',
            'msRequestFullScreen',
            'mozRequestFullScreen',
            'mozRequestFullscreen'
        ];

        var element = document.createElement('div');

        for (var i = 0; i < fs.length; i++)
        {
            if (element[fs[i]])
            {
                device.fullscreen = true;
                device.requestFullscreen = fs[i];
                break;
            }
        }

        var cfs = [
            'cancelFullScreen',
            'exitFullscreen',
            'webkitCancelFullScreen',
            'webkitExitFullscreen',
            'msCancelFullScreen',
            'msExitFullscreen',
            'mozCancelFullScreen',
            'mozExitFullscreen'
        ];

        if (device.fullscreen)
        {
            for (var i = 0; i < cfs.length; i++)
            {
                if (document[cfs[i]])
                {
                    device.cancelFullscreen = cfs[i];
                    break;
                }
            }
        }

        //  Keyboard Input?
        if (window['Element'] && Element['ALLOW_KEYBOARD_INPUT'])
        {
            device.fullscreenKeyboard = true;
        }

    }

    /**
    * Check what browser is game running in.
    */
    function _checkBrowser () {

        var ua = navigator.userAgent;

        if (/Arora/.test(ua))
        {
            device.arora = true;
        }
        else if (/Edge\/\d+/.test(ua))
        {
            device.edge = true;
        }
        else if (/Chrome\/(\d+)/.test(ua) && !device.windowsPhone)
        {
            device.chrome = true;
            device.chromeVersion = parseInt(RegExp.$1, 10);
        }
        else if (/Epiphany/.test(ua))
        {
            device.epiphany = true;
        }
        else if (/Firefox\D+(\d+)/.test(ua))
        {
            device.firefox = true;
            device.firefoxVersion = parseInt(RegExp.$1, 10);
        }
        else if (/AppleWebKit/.test(ua) && device.iOS)
        {
            device.mobileSafari = true;
        }
        else if (/MSIE (\d+\.\d+);/.test(ua))
        {
            device.ie = true;
            device.ieVersion = parseInt(RegExp.$1, 10);
        }
        else if (/Midori/.test(ua))
        {
            device.midori = true;
        }
        else if (/Opera/.test(ua))
        {
            device.opera = true;
        }
        else if (/Safari\/(\d+)/.test(ua) && !device.windowsPhone)
        {
            device.safari = true;

            if (/Version\/(\d+)\./.test(ua))
            {
                device.safariVersion = parseInt(RegExp.$1, 10);
            }
        }
        else if (/Trident\/(\d+\.\d+)(.*)rv:(\d+\.\d+)/.test(ua))
        {
            device.ie = true;
            device.trident = true;
            device.tridentVersion = parseInt(RegExp.$1, 10);
            device.ieVersion = parseInt(RegExp.$3, 10);
        }

        //  Silk gets its own if clause because its ua also contains 'Safari'
        if (/Silk/.test(ua))
        {
            device.silk = true;
        }

        //  WebApp mode in iOS
        if (navigator['standalone'])
        {
            device.webApp = true;
        }
        
        if (typeof window.cordova !== 'undefined')
        {
            device.cordova = true;
        }
        
        if (typeof process !== 'undefined' && typeof require !== 'undefined')
        {
            device.node = true;
        }
        
        if (device.node && typeof process.versions === 'object')
        {
            device.nodeWebkit = !!process.versions['node-webkit'];
            
            device.electron = !!process.versions.electron;
        }
        
        if (navigator['isCocoonJS'])
        {
            device.cocoonJS = true;
        }
        
        if (device.cocoonJS)
        {
            try {
                device.cocoonJSApp = (typeof CocoonJS !== 'undefined');
            }
            catch(error)
            {
                device.cocoonJSApp = false;
            }
        }

        if (typeof window.ejecta !== 'undefined')
        {
            device.ejecta = true;
        }

        if (/Crosswalk/.test(ua))
        {
            device.crosswalk = true;
        }

    }

    /**
    * Check video support.
    */
    function _checkVideo () {

        var videoElement = document.createElement("video");
        var result = false;

        try {
            if (result = !!videoElement.canPlayType)
            {
                if (videoElement.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ''))
                {
                    device.oggVideo = true;
                }

                if (videoElement.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ''))
                {
                    // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                    device.h264Video = true;
                    device.mp4Video = true;
                }

                if (videoElement.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, ''))
                {
                    device.webmVideo = true;
                }

                if (videoElement.canPlayType('video/webm; codecs="vp9"').replace(/^no$/, ''))
                {
                    device.vp9Video = true;
                }

                if (videoElement.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/, ''))
                {
                    device.hlsVideo = true;
                }
            }
        } catch (e) {}
    }

    /**
    * Check audio support.
    */
    function _checkAudio () {

        device.audioData = !!(window['Audio']);
        device.webAudio = !!(window['AudioContext'] || window['webkitAudioContext']);
        var audioElement = document.createElement('audio');
        var result = false;

        try {
            if (result = !!audioElement.canPlayType)
            {
                if (audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''))
                {
                    device.ogg = true;
                }

                if (audioElement.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '') || audioElement.canPlayType('audio/opus;').replace(/^no$/, ''))
                {
                    device.opus = true;
                }

                if (audioElement.canPlayType('audio/mpeg;').replace(/^no$/, ''))
                {
                    device.mp3 = true;
                }

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                if (audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''))
                {
                    device.wav = true;
                }

                if (audioElement.canPlayType('audio/x-m4a;') || audioElement.canPlayType('audio/aac;').replace(/^no$/, ''))
                {
                    device.m4a = true;
                }

                if (audioElement.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''))
                {
                    device.webm = true;
                }

                if (audioElement.canPlayType('audio/mp4;codecs="ec-3"') !== '')
                {
                    if (device.edge)
                    {
                        device.dolby = true;
                    }
                    else if (device.safari && device.safariVersion >= 9)
                    {
                        if (/Mac OS X (\d+)_(\d+)/.test(navigator.userAgent))
                        {
                            var major = parseInt(RegExp.$1, 10);
                            var minor = parseInt(RegExp.$2, 10);

                            if ((major === 10 && minor >= 11) || major > 10)
                            {
                                device.dolby = true;
                            }
                        }
                    }
                }
            }
        } catch (e) {
        }

    }

    /**
    * Check Little or Big Endian system.
    *
    * @author Matt DesLauriers (@mattdesl)
    */
    function _checkIsLittleEndian () {

        var a = new ArrayBuffer(4);
        var b = new Uint8Array(a);
        var c = new Uint32Array(a);

        b[0] = 0xa1;
        b[1] = 0xb2;
        b[2] = 0xc3;
        b[3] = 0xd4;

        if (c[0] === 0xd4c3b2a1)
        {
            return true;
        }

        if (c[0] === 0xa1b2c3d4)
        {
            return false;
        }
        else
        {
            //  Could not determine endianness
            return null;
        }

    }

    /**
    * Test to see if ImageData uses CanvasPixelArray or Uint8ClampedArray.
    *
    * @author Matt DesLauriers (@mattdesl)
    */
    function _checkIsUint8ClampedImageData () {

        if (Uint8ClampedArray === undefined)
        {
            return false;
        }

        var elem = PIXI.CanvasPool.create(this, 1, 1);
        var ctx = elem.getContext('2d');

        if (!ctx)
        {
            return false;
        }

        var image = ctx.createImageData(1, 1);

        PIXI.CanvasPool.remove(this);

        return image.data instanceof Uint8ClampedArray;

    }

    /**
    * Check PixelRatio, iOS device, Vibration API, ArrayBuffers and endianess.
    */
    function _checkDevice () {

        device.pixelRatio = window['devicePixelRatio'] || 1;
        device.iPhone = navigator.userAgent.toLowerCase().indexOf('iphone') !== -1;
        device.iPhone4 = (device.pixelRatio === 2 && device.iPhone);
        device.iPad = navigator.userAgent.toLowerCase().indexOf('ipad') !== -1;

        if (typeof Int8Array !== 'undefined')
        {
            device.typedArray = true;
        }
        else
        {
            device.typedArray = false;
        }

        if (typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined' && typeof Uint32Array !== 'undefined')
        {
            device.littleEndian = _checkIsLittleEndian();
            device.LITTLE_ENDIAN = device.littleEndian;
        }

        device.support32bit = (typeof ArrayBuffer !== 'undefined' && typeof Uint8ClampedArray !== 'undefined' && typeof Int32Array !== 'undefined' && device.littleEndian !== null && _checkIsUint8ClampedImageData());

        navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

        if (navigator.vibrate)
        {
            device.vibration = true;
        }

    }

    /**
    * Check whether the host environment support 3D CSS.
    */
    function _checkCSS3D () {

        var el = document.createElement('p');
        var has3d;
        var transforms = {
            'webkitTransform': '-webkit-transform',
            'OTransform': '-o-transform',
            'msTransform': '-ms-transform',
            'MozTransform': '-moz-transform',
            'transform': 'transform'
        };

        // Add it to the body to get the computed style.
        document.body.insertBefore(el, null);

        for (var t in transforms)
        {
            if (el.style[t] !== undefined)
            {
                el.style[t] = "translate3d(1px,1px,1px)";
                has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
            }
        }

        document.body.removeChild(el);
        device.css3D = (has3d !== undefined && has3d.length > 0 && has3d !== "none");

    }

    //  Run the checks
    _checkOS();
    _checkBrowser();
    _checkAudio();
    _checkVideo();
    _checkCSS3D();
    _checkDevice();
    _checkFeatures();
    _checkFullScreenSupport();
    _checkInput();

};

/**
* Check whether the host environment can play audio.
*
* @method canPlayAudio
* @memberof Phaser.Device.prototype
* @param {string} type - One of 'mp3, 'ogg', 'm4a', 'wav', 'webm' or 'opus'.
* @return {boolean} True if the given file type is supported by the browser, otherwise false.
*/
Phaser.Device.canPlayAudio = function (type) {

    if (type === 'mp3' && this.mp3)
    {
        return true;
    }
    else if (type === 'ogg' && (this.ogg || this.opus))
    {
        return true;
    }
    else if (type === 'm4a' && this.m4a)
    {
        return true;
    }
    else if (type === 'opus' && this.opus)
    {
        return true;
    }
    else if (type === 'wav' && this.wav)
    {
        return true;
    }
    else if (type === 'webm' && this.webm)
    {
        return true;
    }
    else if (type === 'mp4' && this.dolby)
    {
        return true;
    }

    return false;

};

/**
* Check whether the host environment can play video files.
*
* @method canPlayVideo
* @memberof Phaser.Device.prototype
* @param {string} type - One of 'mp4, 'ogg', 'webm' or 'mpeg'.
* @return {boolean} True if the given file type is supported by the browser, otherwise false.
*/
Phaser.Device.canPlayVideo = function (type) {

    if (type === 'webm' && (this.webmVideo || this.vp9Video))
    {
        return true;
    }
    else if (type === 'mp4' && (this.mp4Video || this.h264Video))
    {
        return true;
    }
    else if ((type === 'ogg' || type === 'ogv') && this.oggVideo)
    {
        return true;
    }
    else if (type === 'mpeg' && this.hlsVideo)
    {
        return true;
    }

    return false;

};

/**
* Check whether the console is open.
* Note that this only works in Firefox with Firebug and earlier versions of Chrome.
* It used to work in Chrome, but then they removed the ability: {@link http://src.chromium.org/viewvc/blink?view=revision&revision=151136}
*
* @method isConsoleOpen
* @memberof Phaser.Device.prototype
*/
Phaser.Device.isConsoleOpen = function () {

    if (window.console && window.console['firebug'])
    {
        return true;
    }

    if (window.console)
    {
        console.profile();
        console.profileEnd();

        if (console.clear)
        {
            console.clear();
        }

        if (console['profiles'])
        {
            return console['profiles'].length > 0;
        }
    }

    return false;

};

/**
* Detect if the host is a an Android Stock browser.
* This is available before the device "ready" event.
*
* Authors might want to scale down on effects and switch to the CANVAS rendering method on those devices.
*
* @example
* var defaultRenderingMode = Phaser.Device.isAndroidStockBrowser() ? Phaser.CANVAS : Phaser.AUTO;
* 
* @method isAndroidStockBrowser
* @memberof Phaser.Device.prototype
*/
Phaser.Device.isAndroidStockBrowser = function () {

    var matches = window.navigator.userAgent.match(/Android.*AppleWebKit\/([\d.]+)/);
    return matches && matches[1] < 537;

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Canvas class handles everything related to creating the `canvas` DOM tag that Phaser will use, 
* including styles, offset and aspect ratio.
*
* @class Phaser.Canvas
* @static
*/
Phaser.Canvas = {

    /**
    * Creates a `canvas` DOM element. The element is not automatically added to the document.
    *
    * @method Phaser.Canvas.create
    * @param {object} parent - The object that will own the canvas that is created.
    * @param {number} [width=256] - The width of the canvas element.
    * @param {number} [height=256] - The height of the canvas element..
    * @param {string} [id=(none)] - If specified, and not the empty string, this will be set as the ID of the canvas element. Otherwise no ID will be set.
    * @param {boolean} [skipPool=false] - If `true` the canvas will not be placed in the CanvasPool global.
    * @return {HTMLCanvasElement} The newly created canvas element.
    */
    create: function (parent, width, height, id, skipPool) {

        width = width || 256;
        height = height || 256;

        var canvas = (skipPool) ? document.createElement('canvas') : PIXI.CanvasPool.create(parent, width, height);

        if (typeof id === 'string' && id !== '')
        {
            canvas.id = id;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.style.display = 'block';

        return canvas;

    },

    /**
    * Sets the background color behind the canvas. This changes the canvas style property.
    *
    * @method Phaser.Canvas.setBackgroundColor
    * @param {HTMLCanvasElement} canvas - The canvas to set the background color on.
    * @param {string} [color='rgb(0,0,0)'] - The color to set. Can be in the format 'rgb(r,g,b)', or '#RRGGBB' or any valid CSS color.
    * @return {HTMLCanvasElement} Returns the source canvas.
    */
    setBackgroundColor: function (canvas, color) {

        color = color || 'rgb(0,0,0)';

        canvas.style.backgroundColor = color;

        return canvas;

    },

    /**
    * Sets the touch-action property on the canvas style. Can be used to disable default browser touch actions.
    *
    * @method Phaser.Canvas.setTouchAction
    * @param {HTMLCanvasElement} canvas - The canvas to set the touch action on.
    * @param {string} [value] - The touch action to set. Defaults to 'none'.
    * @return {HTMLCanvasElement} The source canvas.
    */
    setTouchAction: function (canvas, value) {

        value = value || 'none';

        canvas.style.msTouchAction = value;
        canvas.style['ms-touch-action'] = value;
        canvas.style['touch-action'] = value;

        return canvas;

    },

    /**
    * Sets the user-select property on the canvas style. Can be used to disable default browser selection actions.
    *
    * @method Phaser.Canvas.setUserSelect
    * @param {HTMLCanvasElement} canvas - The canvas to set the touch action on.
    * @param {string} [value] - The touch action to set. Defaults to 'none'.
    * @return {HTMLCanvasElement} The source canvas.
    */
    setUserSelect: function (canvas, value) {

        value = value || 'none';

        canvas.style['-webkit-touch-callout'] = value;
        canvas.style['-webkit-user-select'] = value;
        canvas.style['-khtml-user-select'] = value;
        canvas.style['-moz-user-select'] = value;
        canvas.style['-ms-user-select'] = value;
        canvas.style['user-select'] = value;
        canvas.style['-webkit-tap-highlight-color'] = 'rgba(0, 0, 0, 0)';

        return canvas;

    },

    /**
    * Adds the given canvas element to the DOM. The canvas will be added as a child of the given parent.
    * If no parent is given it will be added as a child of the document.body.
    *
    * @method Phaser.Canvas.addToDOM
    * @param {HTMLCanvasElement} canvas - The canvas to be added to the DOM.
    * @param {string|HTMLElement} parent - The DOM element to add the canvas to.
    * @param {boolean} [overflowHidden=true] - If set to true it will add the overflow='hidden' style to the parent DOM element.
    * @return {HTMLCanvasElement} Returns the source canvas.
    */
    addToDOM: function (canvas, parent, overflowHidden) {

        var target;

        if (overflowHidden === undefined) { overflowHidden = true; }

        if (parent)
        {
            if (typeof parent === 'string')
            {
                // hopefully an element ID
                target = document.getElementById(parent);
            }
            else if (typeof parent === 'object' && parent.nodeType === 1)
            {
                // quick test for a HTMLelement
                target = parent;
            }
        }

        // Fallback, covers an invalid ID and a non HTMLelement object
        if (!target)
        {
            target = document.body;
        }

        if (overflowHidden && target.style)
        {
            target.style.overflow = 'hidden';
        }

        target.appendChild(canvas);

        return canvas;

    },

    /**
    * Removes the given canvas element from the DOM.
    *
    * @method Phaser.Canvas.removeFromDOM
    * @param {HTMLCanvasElement} canvas - The canvas to be removed from the DOM.
    */
    removeFromDOM: function (canvas) {

        if (canvas.parentNode)
        {
            canvas.parentNode.removeChild(canvas);
        }

    },

    /**
    * Sets the transform of the given canvas to the matrix values provided.
    *
    * @method Phaser.Canvas.setTransform
    * @param {CanvasRenderingContext2D} context - The context to set the transform on.
    * @param {number} translateX - The value to translate horizontally by.
    * @param {number} translateY - The value to translate vertically by.
    * @param {number} scaleX - The value to scale horizontally by.
    * @param {number} scaleY - The value to scale vertically by.
    * @param {number} skewX - The value to skew horizontaly by.
    * @param {number} skewY - The value to skew vertically by.
    * @return {CanvasRenderingContext2D} Returns the source context.
    */
    setTransform: function (context, translateX, translateY, scaleX, scaleY, skewX, skewY) {

        context.setTransform(scaleX, skewX, skewY, scaleY, translateX, translateY);

        return context;

    },

    /**
    * Sets the Image Smoothing property on the given context. Set to false to disable image smoothing.
    * By default browsers have image smoothing enabled, which isn't always what you visually want, especially
    * when using pixel art in a game. Note that this sets the property on the context itself, so that any image
    * drawn to the context will be affected. This sets the property across all current browsers but support is
    * patchy on earlier browsers, especially on mobile.
    *
    * @method Phaser.Canvas.setSmoothingEnabled
    * @param {CanvasRenderingContext2D} context - The context to enable or disable the image smoothing on.
    * @param {boolean} value - If set to true it will enable image smoothing, false will disable it.
    * @return {CanvasRenderingContext2D} Returns the source context.
    */
    setSmoothingEnabled: function (context, value) {

        var s = Phaser.Canvas.getSmoothingPrefix(context);

        if (s)
        {
            context[s] = value;
        }

        return context;

    },

    /**
    * Gets the Smoothing Enabled vendor prefix being used on the given context, or null if not set.
    *
    * @method Phaser.Canvas.getSmoothingPrefix
    * @param {CanvasRenderingContext2D} context - The context to enable or disable the image smoothing on.
    * @return {string|null} Returns the smoothingEnabled vendor prefix, or null if not set on the context.
    */
    getSmoothingPrefix: function (context) {

        var vendor = [ 'i', 'webkitI', 'msI', 'mozI', 'oI' ];

        for (var prefix in vendor)
        {
            var s = vendor[prefix] + 'mageSmoothingEnabled';

            if (s in context)
            {
                return s;
            }
        }

        return null;

    },

    /**
     * Returns `true` if the given context has image smoothing enabled, otherwise returns `false`.
     *
     * @method Phaser.Canvas.getSmoothingEnabled
     * @param {CanvasRenderingContext2D} context - The context to check for smoothing on.
     * @return {boolean} True if the given context has image smoothing enabled, otherwise false.
     */
    getSmoothingEnabled: function (context) {

        var s = Phaser.Canvas.getSmoothingPrefix(context);

        if (s)
        {
            return context[s];
        }

    },

    /**
    * Sets the CSS image-rendering property on the given canvas to be 'crisp' (aka 'optimize contrast' on webkit).
    * Note that if this doesn't given the desired result then see the setSmoothingEnabled.
    *
    * @method Phaser.Canvas.setImageRenderingCrisp
    * @param {HTMLCanvasElement} canvas - The canvas to set image-rendering crisp on.
    * @return {HTMLCanvasElement} Returns the source canvas.
    */
    setImageRenderingCrisp: function (canvas) {

        var types = [ 'optimizeSpeed', 'crisp-edges', '-moz-crisp-edges', '-webkit-optimize-contrast', 'optimize-contrast', 'pixelated' ];

        for (var i = 0; i < types.length; i++)
        {
            canvas.style['image-rendering'] = types[i];
        }

        canvas.style.msInterpolationMode = 'nearest-neighbor';

        return canvas;

    },

    /**
    * Sets the CSS image-rendering property on the given canvas to be 'bicubic' (aka 'auto').
    * Note that if this doesn't given the desired result then see the CanvasUtils.setSmoothingEnabled method.
    *
    * @method Phaser.Canvas.setImageRenderingBicubic
    * @param {HTMLCanvasElement} canvas The canvas to set image-rendering bicubic on.
    * @return {HTMLCanvasElement} Returns the source canvas.
    */
    setImageRenderingBicubic: function (canvas) {

        canvas.style['image-rendering'] = 'auto';
        canvas.style.msInterpolationMode = 'bicubic';

        return canvas;

    }

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Abstracts away the use of RAF or setTimeOut for the core game update loop.
*
* @class Phaser.RequestAnimationFrame
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {boolean} [forceSetTimeOut=false] - Tell Phaser to use setTimeOut even if raf is available.
*/
Phaser.RequestAnimationFrame = function(game, forceSetTimeOut) {

    if (forceSetTimeOut === undefined) { forceSetTimeOut = false; }

    /**
    * @property {Phaser.Game} game - The currently running game.
    */
    this.game = game;

    /**
    * @property {boolean} isRunning - true if RequestAnimationFrame is running, otherwise false.
    * @default
    */
    this.isRunning = false;

    /**
    * @property {boolean} forceSetTimeOut - Tell Phaser to use setTimeOut even if raf is available.
    */
    this.forceSetTimeOut = forceSetTimeOut;

    var vendors = [
        'ms',
        'moz',
        'webkit',
        'o'
    ];

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; x++)
    {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'];
    }

    /**
    * @property {boolean} _isSetTimeOut  - true if the browser is using setTimeout instead of raf.
    * @private
    */
    this._isSetTimeOut = false;

    /**
    * @property {function} _onLoop - The function called by the update.
    * @private
    */
    this._onLoop = null;

    /**
    * @property {number} _timeOutID - The callback ID used when calling cancel.
    * @private
    */
    this._timeOutID = null;

};

Phaser.RequestAnimationFrame.prototype = {

    /**
    * Starts the requestAnimationFrame running or setTimeout if unavailable in browser
    * @method Phaser.RequestAnimationFrame#start
    */
    start: function () {

        this.isRunning = true;

        var _this = this;

        if (!window.requestAnimationFrame || this.forceSetTimeOut)
        {
            this._isSetTimeOut = true;

            this._onLoop = function () {
                return _this.updateSetTimeout();
            };

            this._timeOutID = window.setTimeout(this._onLoop, 0);
        }
        else
        {
            this._isSetTimeOut = false;

            this._onLoop = function (time) {
                return _this.updateRAF(time);
            };

            this._timeOutID = window.requestAnimationFrame(this._onLoop);
        }

    },

    /**
    * The update method for the requestAnimationFrame
    * @method Phaser.RequestAnimationFrame#updateRAF
    */
    updateRAF: function (rafTime) {

        if (this.isRunning)
        {
            // floor the rafTime to make it equivalent to the Date.now() provided by updateSetTimeout (just below)
            this.game.update(Math.floor(rafTime));

            this._timeOutID = window.requestAnimationFrame(this._onLoop);
        }

    },

    /**
    * The update method for the setTimeout.
    * @method Phaser.RequestAnimationFrame#updateSetTimeout
    */
    updateSetTimeout: function () {

        if (this.isRunning)
        {
            this.game.update(Date.now());

            this._timeOutID = window.setTimeout(this._onLoop, this.game.time.timeToCall);
        }

    },

    /**
    * Stops the requestAnimationFrame from running.
    * @method Phaser.RequestAnimationFrame#stop
    */
    stop: function () {

        if (this._isSetTimeOut)
        {
            clearTimeout(this._timeOutID);
        }
        else
        {
            window.cancelAnimationFrame(this._timeOutID);
        }

        this.isRunning = false;

    },

    /**
    * Is the browser using setTimeout?
    * @method Phaser.RequestAnimationFrame#isSetTimeOut
    * @return {boolean}
    */
    isSetTimeOut: function () {
        return this._isSetTimeOut;
    },

    /**
    * Is the browser using requestAnimationFrame?
    * @method Phaser.RequestAnimationFrame#isRAF
    * @return {boolean}
    */
    isRAF: function () {
        return (this._isSetTimeOut === false);
    }

};

Phaser.RequestAnimationFrame.prototype.constructor = Phaser.RequestAnimationFrame;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A collection of useful mathematical functions.
*
* These are normally accessed through `game.math`.
*
* @class Phaser.Math
* @static
* @see {@link Phaser.Utils}
* @see {@link Phaser.ArrayUtils}
*/
Phaser.Math = {

    /**
    * Twice PI.
    * @property {number} Phaser.Math#PI2
    * @default ~6.283
    */
    PI2: Math.PI * 2,

    /**
    * Returns a number between the `min` and `max` values.
    *
    * @method Phaser.Math#between
    * @param {number} min - The minimum value. Must be positive, and less than 'max'.
    * @param {number} max - The maximum value. Must be position, and greater than 'min'.
    * @return {number} A value between the range min to max.
    */
    between: function (min, max) {

        return Math.floor(Math.random() * (max - min + 1) + min);

    },

    /**
    * Two number are fuzzyEqual if their difference is less than epsilon.
    *
    * @method Phaser.Math#fuzzyEqual
    * @param {number} a - The first number to compare.
    * @param {number} b - The second number to compare.
    * @param {number} [epsilon=0.0001] - The epsilon (a small value used in the calculation)
    * @return {boolean} True if |a-b|<epsilon
    */
    fuzzyEqual: function (a, b, epsilon) {

        if (epsilon === undefined) { epsilon = 0.0001; }

        return Math.abs(a - b) < epsilon;

    },

    /**
    * `a` is fuzzyLessThan `b` if it is less than b + epsilon.
    *
    * @method Phaser.Math#fuzzyLessThan
    * @param {number} a - The first number to compare.
    * @param {number} b - The second number to compare.
    * @param {number} [epsilon=0.0001] - The epsilon (a small value used in the calculation)
    * @return {boolean} True if a<b+epsilon
    */
    fuzzyLessThan: function (a, b, epsilon) {

        if (epsilon === undefined) { epsilon = 0.0001; }

        return a < b + epsilon;

    },

    /**
    * `a` is fuzzyGreaterThan `b` if it is more than b - epsilon.
    *
    * @method Phaser.Math#fuzzyGreaterThan
    * @param {number} a - The first number to compare.
    * @param {number} b - The second number to compare.
    * @param {number} [epsilon=0.0001] - The epsilon (a small value used in the calculation)
    * @return {boolean} True if a>b+epsilon
    */
    fuzzyGreaterThan: function (a, b, epsilon) {

        if (epsilon === undefined) { epsilon = 0.0001; }

        return a > b - epsilon;

    },

    /**
    * Applies a fuzzy ceil to the given value.
    * 
    * @method Phaser.Math#fuzzyCeil
    * @param {number} val - The value to ceil.
    * @param {number} [epsilon=0.0001] - The epsilon (a small value used in the calculation)
    * @return {number} ceiling(val-epsilon)
    */
    fuzzyCeil: function (val, epsilon) {

        if (epsilon === undefined) { epsilon = 0.0001; }

        return Math.ceil(val - epsilon);

    },

    /**
    * Applies a fuzzy floor to the given value.
    * 
    * @method Phaser.Math#fuzzyFloor
    * @param {number} val - The value to floor.
    * @param {number} [epsilon=0.0001] - The epsilon (a small value used in the calculation)
    * @return {number} floor(val+epsilon)
    */
    fuzzyFloor: function (val, epsilon) {

        if (epsilon === undefined) { epsilon = 0.0001; }

        return Math.floor(val + epsilon);

    },

    /**
    * Averages all values passed to the function and returns the result.
    *
    * @method Phaser.Math#average
    * @params {...number} The numbers to average
    * @return {number} The average of all given values.
    */
    average: function () {

        var sum = 0;
        var len = arguments.length;

        for (var i = 0; i < len; i++)
        {
            sum += (+arguments[i]);
        }

        return sum / len;

    },

    /**
    * @method Phaser.Math#shear
    * @param {number} n
    * @return {number} n mod 1
    */
    shear: function (n) {

        return n % 1;

    },

    /**
    * Snap a value to nearest grid slice, using rounding.
    *
    * Example: if you have an interval gap of 5 and a position of 12... you will snap to 10 whereas 14 will snap to 15.
    *
    * @method Phaser.Math#snapTo
    * @param {number} input - The value to snap.
    * @param {number} gap - The interval gap of the grid.
    * @param {number} [start=0] - Optional starting offset for gap.
    * @return {number} The snapped value.
    */
    snapTo: function (input, gap, start) {

        if (start === undefined) { start = 0; }

        if (gap === 0) {
            return input;
        }

        input -= start;
        input = gap * Math.round(input / gap);

        return start + input;

    },

    /**
    * Snap a value to nearest grid slice, using floor.
    *
    * Example: if you have an interval gap of 5 and a position of 12... you will snap to 10.
    * As will 14 snap to 10... but 16 will snap to 15.
    *
    * @method Phaser.Math#snapToFloor
    * @param {number} input - The value to snap.
    * @param {number} gap - The interval gap of the grid.
    * @param {number} [start=0] - Optional starting offset for gap.
    * @return {number} The snapped value.
    */
    snapToFloor: function (input, gap, start) {

        if (start === undefined) { start = 0; }

        if (gap === 0) {
            return input;
        }

        input -= start;
        input = gap * Math.floor(input / gap);

        return start + input;

    },

    /**
    * Snap a value to nearest grid slice, using ceil.
    *
    * Example: if you have an interval gap of 5 and a position of 12... you will snap to 15.
    * As will 14 will snap to 15... but 16 will snap to 20.
    *
    * @method Phaser.Math#snapToCeil
    * @param {number} input - The value to snap.
    * @param {number} gap - The interval gap of the grid.
    * @param {number} [start=0] - Optional starting offset for gap.
    * @return {number} The snapped value.
    */
    snapToCeil: function (input, gap, start) {

        if (start === undefined) { start = 0; }

        if (gap === 0) {
            return input;
        }

        input -= start;
        input = gap * Math.ceil(input / gap);

        return start + input;

    },

    /**
    * Round to some place comparative to a `base`, default is 10 for decimal place.
    * The `place` is represented by the power applied to `base` to get that place.
    *
    *     e.g. 2000/7 ~= 285.714285714285714285714 ~= (bin)100011101.1011011011011011
    *
    *     roundTo(2000/7,3) === 0
    *     roundTo(2000/7,2) == 300
    *     roundTo(2000/7,1) == 290
    *     roundTo(2000/7,0) == 286
    *     roundTo(2000/7,-1) == 285.7
    *     roundTo(2000/7,-2) == 285.71
    *     roundTo(2000/7,-3) == 285.714
    *     roundTo(2000/7,-4) == 285.7143
    *     roundTo(2000/7,-5) == 285.71429
    *
    *     roundTo(2000/7,3,2)  == 288       -- 100100000
    *     roundTo(2000/7,2,2)  == 284       -- 100011100
    *     roundTo(2000/7,1,2)  == 286       -- 100011110
    *     roundTo(2000/7,0,2)  == 286       -- 100011110
    *     roundTo(2000/7,-1,2) == 285.5     -- 100011101.1
    *     roundTo(2000/7,-2,2) == 285.75    -- 100011101.11
    *     roundTo(2000/7,-3,2) == 285.75    -- 100011101.11
    *     roundTo(2000/7,-4,2) == 285.6875  -- 100011101.1011
    *     roundTo(2000/7,-5,2) == 285.71875 -- 100011101.10111
    *
    * Note what occurs when we round to the 3rd space (8ths place), 100100000, this is to be assumed
    * because we are rounding 100011.1011011011011011 which rounds up.
    *
    * @method Phaser.Math#roundTo
    * @param {number} value - The value to round.
    * @param {number} [place=0] - The place to round to.
    * @param {number} [base=10] - The base to round in. Default is 10 for decimal.
    * @return {number} The rounded value.
    */
    roundTo: function (value, place, base) {

        if (place === undefined) { place = 0; }
        if (base === undefined) { base = 10; }

        var p = Math.pow(base, -place);

        return Math.round(value * p) / p;

    },

    /**
    * Floors to some place comparative to a `base`, default is 10 for decimal place.
    * The `place` is represented by the power applied to `base` to get that place.
    * 
    * @method Phaser.Math#floorTo
    * @param {number} value - The value to round.
    * @param {number} [place=0] - The place to round to.
    * @param {number} [base=10] - The base to round in. Default is 10 for decimal.
    * @return {number} The rounded value.
    */
    floorTo: function (value, place, base) {

        if (place === undefined) { place = 0; }
        if (base === undefined) { base = 10; }

        var p = Math.pow(base, -place);

        return Math.floor(value * p) / p;

    },

    /**
    * Ceils to some place comparative to a `base`, default is 10 for decimal place.
    * The `place` is represented by the power applied to `base` to get that place.
    * 
    * @method Phaser.Math#ceilTo
    * @param {number} value - The value to round.
    * @param {number} [place=0] - The place to round to.
    * @param {number} [base=10] - The base to round in. Default is 10 for decimal.
    * @return {number} The rounded value.
    */
    ceilTo: function (value, place, base) {

        if (place === undefined) { place = 0; }
        if (base === undefined) { base = 10; }

        var p = Math.pow(base, -place);

        return Math.ceil(value * p) / p;

    },

    /**
    * Rotates currentAngle towards targetAngle, taking the shortest rotation distance.
    * The lerp argument is the amount to rotate by in this call.
    * 
    * @method Phaser.Math#rotateToAngle
    * @param {number} currentAngle - The current angle, in radians.
    * @param {number} targetAngle - The target angle to rotate to, in radians.
    * @param {number} [lerp=0.05] - The lerp value to add to the current angle.
    * @return {number} The adjusted angle.
    */
    rotateToAngle: function (currentAngle, targetAngle, lerp) {

        if (lerp === undefined) { lerp = 0.05; }

        if (currentAngle === targetAngle)
        {
            return currentAngle;
        }

        if (Math.abs(targetAngle - currentAngle) <= lerp || Math.abs(targetAngle - currentAngle) >= (Phaser.Math.PI2 - lerp))
        {
            currentAngle = targetAngle;
        }
        else
        {
            if (Math.abs(targetAngle - currentAngle) > Math.PI)
            {
                if (targetAngle < currentAngle)
                {
                    targetAngle += Phaser.Math.PI2;
                }
                else
                {
                    targetAngle -= Phaser.Math.PI2;
                }
            }

            if (targetAngle > currentAngle)
            {
                currentAngle += lerp;
            }
            else if (targetAngle < currentAngle)
            {
                currentAngle -= lerp;
            }
        }

        return currentAngle;

    },

    /**
    * Gets the shortest angle between `angle1` and `angle2`.
    * Both angles must be in the range -180 to 180, which is the same clamped
    * range that `sprite.angle` uses, so you can pass in two sprite angles to
    * this method, and get the shortest angle back between the two of them.
    *
    * The angle returned will be in the same range. If the returned angle is
    * greater than 0 then it's a counter-clockwise rotation, if < 0 then it's
    * a clockwise rotation.
    * 
    * @method Phaser.Math#getShortestAngle
    * @param {number} angle1 - The first angle. In the range -180 to 180.
    * @param {number} angle2 - The second angle. In the range -180 to 180.
    * @return {number} The shortest angle, in degrees. If greater than zero it's a counter-clockwise rotation.
    */
    getShortestAngle: function (angle1, angle2) {

        var difference = angle2 - angle1;

        if (difference === 0)
        {
            return 0;
        }

        var times = Math.floor((difference - (-180)) / 360);

        return difference - (times * 360);

    },

    /**
    * Find the angle of a segment from (x1, y1) -> (x2, y2).
    * 
    * @method Phaser.Math#angleBetween
    * @param {number} x1 - The x coordinate of the first value.
    * @param {number} y1 - The y coordinate of the first value.
    * @param {number} x2 - The x coordinate of the second value.
    * @param {number} y2 - The y coordinate of the second value.
    * @return {number} The angle, in radians.
    */
    angleBetween: function (x1, y1, x2, y2) {

        return Math.atan2(y2 - y1, x2 - x1);

    },

    /**
    * Find the angle of a segment from (x1, y1) -> (x2, y2).
    * 
    * The difference between this method and Math.angleBetween is that this assumes the y coordinate travels
    * down the screen.
    *
    * @method Phaser.Math#angleBetweenY
    * @param {number} x1 - The x coordinate of the first value.
    * @param {number} y1 - The y coordinate of the first value.
    * @param {number} x2 - The x coordinate of the second value.
    * @param {number} y2 - The y coordinate of the second value.
    * @return {number} The angle, in radians.
    */
    angleBetweenY: function (x1, y1, x2, y2) {

        return Math.atan2(x2 - x1, y2 - y1);

    },

    /**
    * Find the angle of a segment from (point1.x, point1.y) -> (point2.x, point2.y).
    * 
    * @method Phaser.Math#angleBetweenPoints
    * @param {Phaser.Point} point1 - The first point.
    * @param {Phaser.Point} point2 - The second point.
    * @return {number} The angle between the two points, in radians.
    */
    angleBetweenPoints: function (point1, point2) {

        return Math.atan2(point2.y - point1.y, point2.x - point1.x);

    },

    /**
    * Find the angle of a segment from (point1.x, point1.y) -> (point2.x, point2.y).
    * @method Phaser.Math#angleBetweenPointsY
    * @param {Phaser.Point} point1
    * @param {Phaser.Point} point2
    * @return {number} The angle, in radians.
    */
    angleBetweenPointsY: function (point1, point2) {

        return Math.atan2(point2.x - point1.x, point2.y - point1.y);

    },

    /**
    * Reverses an angle.
    * @method Phaser.Math#reverseAngle
    * @param {number} angleRad - The angle to reverse, in radians.
    * @return {number} The reverse angle, in radians.
    */
    reverseAngle: function (angleRad) {

        return this.normalizeAngle(angleRad + Math.PI, true);

    },

    /**
    * Normalizes an angle to the [0,2pi) range.
    * @method Phaser.Math#normalizeAngle
    * @param {number} angleRad - The angle to normalize, in radians.
    * @return {number} The angle, fit within the [0,2pi] range, in radians.
    */
    normalizeAngle: function (angleRad) {

        angleRad = angleRad % (2 * Math.PI);
        return angleRad >= 0 ? angleRad : angleRad + 2 * Math.PI;

    },

    /**
    * Adds the given amount to the value, but never lets the value go over the specified maximum.
    *
    * @method Phaser.Math#maxAdd
    * @param {number} value - The value to add the amount to.
    * @param {number} amount - The amount to add to the value.
    * @param {number} max - The maximum the value is allowed to be.
    * @return {number} The new value.
    */
    maxAdd: function (value, amount, max) {

        return Math.min(value + amount, max);

    },

    /**
    * Subtracts the given amount from the value, but never lets the value go below the specified minimum.
    *
    * @method Phaser.Math#minSub
    * @param {number} value - The base value.
    * @param {number} amount - The amount to subtract from the base value.
    * @param {number} min - The minimum the value is allowed to be.
    * @return {number} The new value.
    */
    minSub: function (value, amount, min) {

        return Math.max(value - amount, min);

    },

    /**
    * Ensures that the value always stays between min and max, by wrapping the value around.
    *
    * If `max` is not larger than `min` the result is 0.
    *
    * @method Phaser.Math#wrap
    * @param {number} value - The value to wrap.
    * @param {number} min - The minimum the value is allowed to be.
    * @param {number} max - The maximum the value is allowed to be, should be larger than `min`.
    * @return {number} The wrapped value.
    */
    wrap: function (value, min, max) {

        var range = max - min;

        if (range <= 0)
        {
            return 0;
        }

        var result = (value - min) % range;

        if (result < 0)
        {
            result += range;
        }

        return result + min;

    },

    /**
    * Adds value to amount and ensures that the result always stays between 0 and max, by wrapping the value around.
    *
    * Values _must_ be positive integers, and are passed through Math.abs. See {@link Phaser.Math#wrap} for an alternative.
    *
    * @method Phaser.Math#wrapValue
    * @param {number} value - The value to add the amount to.
    * @param {number} amount - The amount to add to the value.
    * @param {number} max - The maximum the value is allowed to be.
    * @return {number} The wrapped value.
    */
    wrapValue: function (value, amount, max) {

        var diff;
        value = Math.abs(value);
        amount = Math.abs(amount);
        max = Math.abs(max);
        diff = (value + amount) % max;

        return diff;

    },

    /**
    * Returns true if the number given is odd.
    *
    * @method Phaser.Math#isOdd
    * @param {integer} n - The number to check.
    * @return {boolean} True if the given number is odd. False if the given number is even.
    */
    isOdd: function (n) {

        // Does not work with extremely large values
        return !!(n & 1);

    },

    /**
    * Returns true if the number given is even.
    *
    * @method Phaser.Math#isEven
    * @param {integer} n - The number to check.
    * @return {boolean} True if the given number is even. False if the given number is odd.
    */
    isEven: function (n) {

        // Does not work with extremely large values
        return !(n & 1);

    },

    /**
    * Variation of Math.min that can be passed either an array of numbers or the numbers as parameters.
    *
    * Prefer the standard `Math.min` function when appropriate.
    *
    * @method Phaser.Math#min
    * @return {number} The lowest value from those given.
    * @see {@link http://jsperf.com/math-s-min-max-vs-homemade}
    */
    min: function () {

        if (arguments.length === 1 && typeof arguments[0] === 'object')
        {
            var data = arguments[0];
        }
        else
        {
            var data = arguments;
        }

        for (var i = 1, min = 0, len = data.length; i < len; i++)
        {
            if (data[i] < data[min])
            {
                min = i;
            }
        }

        return data[min];

    },

    /**
    * Variation of Math.max that can be passed either an array of numbers or the numbers as parameters.
    *
    * Prefer the standard `Math.max` function when appropriate.
    *
    * @method Phaser.Math#max
    * @return {number} The largest value from those given.
    * @see {@link http://jsperf.com/math-s-min-max-vs-homemade}
    */
    max: function () {

        if (arguments.length === 1 && typeof arguments[0] === 'object')
        {
            var data = arguments[0];
        }
        else
        {
            var data = arguments;
        }

        for (var i = 1, max = 0, len = data.length; i < len; i++)
        {
            if (data[i] > data[max])
            {
                max = i;
            }
        }

        return data[max];

    },

    /**
    * Variation of Math.min that can be passed a property and either an array of objects or the objects as parameters.
    * It will find the lowest matching property value from the given objects.
    *
    * @method Phaser.Math#minProperty
    * @return {number} The lowest value from those given.
    */
    minProperty: function (property) {

        if (arguments.length === 2 && typeof arguments[1] === 'object')
        {
            var data = arguments[1];
        }
        else
        {
            var data = arguments.slice(1);
        }

        for (var i = 1, min = 0, len = data.length; i < len; i++)
        {
            if (data[i][property] < data[min][property])
            {
                min = i;
            }
        }

        return data[min][property];

    },

    /**
    * Variation of Math.max that can be passed a property and either an array of objects or the objects as parameters.
    * It will find the largest matching property value from the given objects.
    *
    * @method Phaser.Math#maxProperty
    * @return {number} The largest value from those given.
    */
    maxProperty: function (property) {

        if (arguments.length === 2 && typeof arguments[1] === 'object')
        {
            var data = arguments[1];
        }
        else
        {
            var data = arguments.slice(1);
        }

        for (var i = 1, max = 0, len = data.length; i < len; i++)
        {
            if (data[i][property] > data[max][property])
            {
                max = i;
            }
        }

        return data[max][property];

    },

    /**
    * Keeps an angle value between -180 and +180; or -PI and PI if radians.
    *
    * @method Phaser.Math#wrapAngle
    * @param {number} angle - The angle value to wrap
    * @param {boolean} [radians=false] - Set to `true` if the angle is given in radians, otherwise degrees is expected.
    * @return {number} The new angle value; will be the same as the input angle if it was within bounds.
    */
    wrapAngle: function (angle, radians) {

        return radians ? this.wrap(angle, -Math.PI, Math.PI) : this.wrap(angle, -180, 180);

    },

    /**
    * A Linear Interpolation Method, mostly used by Phaser.Tween.
    *
    * @method Phaser.Math#linearInterpolation
    * @param {Array} v - The input array of values to interpolate between.
    * @param {number} k - The percentage of interpolation, between 0 and 1.
    * @return {number} The interpolated value
    */
    linearInterpolation: function (v, k) {

        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);

        if (k < 0)
        {
            return this.linear(v[0], v[1], f);
        }

        if (k > 1)
        {
            return this.linear(v[m], v[m - 1], m - f);
        }

        return this.linear(v[i], v[i + 1 > m ? m : i + 1], f - i);

    },

    /**
    * A Bezier Interpolation Method, mostly used by Phaser.Tween.
    *
    * @method Phaser.Math#bezierInterpolation
    * @param {Array} v - The input array of values to interpolate between.
    * @param {number} k - The percentage of interpolation, between 0 and 1.
    * @return {number} The interpolated value
    */
    bezierInterpolation: function (v, k) {

        var b = 0;
        var n = v.length - 1;

        for (var i = 0; i <= n; i++)
        {
            b += Math.pow(1 - k, n - i) * Math.pow(k, i) * v[i] * this.bernstein(n, i);
        }

        return b;

    },

    /**
    * A Catmull Rom Interpolation Method, mostly used by Phaser.Tween.
    *
    * @method Phaser.Math#catmullRomInterpolation
    * @param {Array} v - The input array of values to interpolate between.
    * @param {number} k - The percentage of interpolation, between 0 and 1.
    * @return {number} The interpolated value
    */
    catmullRomInterpolation: function (v, k) {

        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);

        if (v[0] === v[m])
        {
            if (k < 0)
            {
                i = Math.floor(f = m * (1 + k));
            }

            return this.catmullRom(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
        }
        else
        {
            if (k < 0)
            {
                return v[0] - (this.catmullRom(v[0], v[0], v[1], v[1], -f) - v[0]);
            }

            if (k > 1)
            {
                return v[m] - (this.catmullRom(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            }

            return this.catmullRom(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
        }

    },

    /**
    * Calculates a linear (interpolation) value over t.
    *
    * @method Phaser.Math#linear
    * @param {number} p0
    * @param {number} p1
    * @param {number} t - A value between 0 and 1.
    * @return {number}
    */
    linear: function (p0, p1, t) {

        return (p1 - p0) * t + p0;

    },

    /**
    * @method Phaser.Math#bernstein
    * @protected
    * @param {number} n
    * @param {number} i
    * @return {number}
    */
    bernstein: function (n, i) {

        return this.factorial(n) / this.factorial(i) / this.factorial(n - i);

    },

    /**
    * @method Phaser.Math#factorial
    * @param {number} value - the number you want to evaluate
    * @return {number}
    */
    factorial: function (value) {

        if (value === 0)
        {
            return 1;
        }

        var res = value;

        while(--value)
        {
            res *= value;
        }

        return res;

    },

    /**
    * Calculates a catmum rom value.
    *
    * @method Phaser.Math#catmullRom
    * @protected
    * @param {number} p0
    * @param {number} p1
    * @param {number} p2
    * @param {number} p3
    * @param {number} t
    * @return {number}
    */
    catmullRom: function (p0, p1, p2, p3, t) {

        var v0 = (p2 - p0) * 0.5, v1 = (p3 - p1) * 0.5, t2 = t * t, t3 = t * t2;

        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

    },

    /**
    * The absolute difference between two values.
    *
    * @method Phaser.Math#difference
    * @param {number} a - The first value to check.
    * @param {number} b - The second value to check.
    * @return {number} The absolute difference between the two values.
    */
    difference: function (a, b) {

        return Math.abs(a - b);

    },

    /**
    * Round to the next whole number _away_ from zero.
    *
    * @method Phaser.Math#roundAwayFromZero
    * @param {number} value - Any number.
    * @return {integer} The rounded value of that number.
    */
    roundAwayFromZero: function (value) {

        // "Opposite" of truncate.
        return (value > 0) ? Math.ceil(value) : Math.floor(value);

    },

    /**
    * Generate a sine and cosine table simultaneously and extremely quickly.
    * The parameters allow you to specify the length, amplitude and frequency of the wave.
    * This generator is fast enough to be used in real-time.
    * Code based on research by Franky of scene.at
    *
    * @method Phaser.Math#sinCosGenerator
    * @param {number} length - The length of the wave
    * @param {number} sinAmplitude - The amplitude to apply to the sine table (default 1.0) if you need values between say -+ 125 then give 125 as the value
    * @param {number} cosAmplitude - The amplitude to apply to the cosine table (default 1.0) if you need values between say -+ 125 then give 125 as the value
    * @param {number} frequency  - The frequency of the sine and cosine table data
    * @return {{sin:number[], cos:number[]}} Returns the table data.
    */
    sinCosGenerator: function (length, sinAmplitude, cosAmplitude, frequency) {

        if (sinAmplitude === undefined) { sinAmplitude = 1.0; }
        if (cosAmplitude === undefined) { cosAmplitude = 1.0; }
        if (frequency === undefined) { frequency = 1.0; }

        var sin = sinAmplitude;
        var cos = cosAmplitude;
        var frq = frequency * Math.PI / length;

        var cosTable = [];
        var sinTable = [];

        for (var c = 0; c < length; c++) {

            cos -= sin * frq;
            sin += cos * frq;

            cosTable[c] = cos;
            sinTable[c] = sin;

        }

        return { sin: sinTable, cos: cosTable, length: length };

    },

    /**
    * Returns the euclidian distance between the two given set of coordinates.
    *
    * @method Phaser.Math#distance
    * @param {number} x1
    * @param {number} y1
    * @param {number} x2
    * @param {number} y2
    * @return {number} The distance between the two sets of coordinates.
    */
    distance: function (x1, y1, x2, y2) {

        var dx = x1 - x2;
        var dy = y1 - y2;

        return Math.sqrt(dx * dx + dy * dy);

    },

    /**
    * Returns the euclidean distance squared between the two given set of
    * coordinates (cuts out a square root operation before returning).
    *
    * @method Phaser.Math#distanceSq
    * @param {number} x1
    * @param {number} y1
    * @param {number} x2
    * @param {number} y2
    * @return {number} The distance squared between the two sets of coordinates.
    */
    distanceSq: function (x1, y1, x2, y2) {

        var dx = x1 - x2;
        var dy = y1 - y2;

        return dx * dx + dy * dy;

    },

    /**
    * Returns the distance between the two given set of coordinates at the power given.
    *
    * @method Phaser.Math#distancePow
    * @param {number} x1
    * @param {number} y1
    * @param {number} x2
    * @param {number} y2
    * @param {number} [pow=2]
    * @return {number} The distance between the two sets of coordinates.
    */
    distancePow: function (x1, y1, x2, y2, pow) {

        if (pow === undefined) { pow = 2; }

        return Math.sqrt(Math.pow(x2 - x1, pow) + Math.pow(y2 - y1, pow));

    },

    /**
    * Force a value within the boundaries by clamping it to the range `min`, `max`.
    *
    * @method Phaser.Math#clamp
    * @param {float} v - The value to be clamped.
    * @param {float} min - The minimum bounds.
    * @param {float} max - The maximum bounds.
    * @return {number} The clamped value.
    */
    clamp: function (v, min, max) {

        if (v < min)
        {
            return min;
        }
        else if (max < v)
        {
            return max;
        }
        else
        {
            return v;
        }

    },

    /**
    * Clamp `x` to the range `[a, Infinity)`.
    * Roughly the same as `Math.max(x, a)`, except for NaN handling.
    *
    * @method Phaser.Math#clampBottom
    * @param {number} x
    * @param {number} a
    * @return {number}
    */
    clampBottom: function (x, a) {

        return x < a ? a : x;

    },

    /**
    * Checks if two values are within the given tolerance of each other.
    *
    * @method Phaser.Math#within
    * @param {number} a - The first number to check
    * @param {number} b - The second number to check
    * @param {number} tolerance - The tolerance. Anything equal to or less than this is considered within the range.
    * @return {boolean} True if a is <= tolerance of b.
    * @see {@link Phaser.Math.fuzzyEqual}
    */
    within: function (a, b, tolerance) {

        return (Math.abs(a - b) <= tolerance);

    },

    /**
    * Linear mapping from range <a1, a2> to range <b1, b2>
    *
    * @method Phaser.Math#mapLinear
    * @param {number} x - The value to map
    * @param {number} a1 - First endpoint of the range <a1, a2>
    * @param {number} a2 - Final endpoint of the range <a1, a2>
    * @param {number} b1 - First endpoint of the range <b1, b2>
    * @param {number} b2 - Final endpoint of the range  <b1, b2>
    * @return {number}
    */
    mapLinear: function (x, a1, a2, b1, b2) {

        return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );

    },

    /**
    * Smoothstep function as detailed at http://en.wikipedia.org/wiki/Smoothstep
    *
    * @method Phaser.Math#smoothstep
    * @param {float} x - The input value.
    * @param {float} min - The left edge. Should be smaller than the right edge.
    * @param {float} max - The right edge.
    * @return {float} A value between 0 and 1.
    */
    smoothstep: function (x, min, max) {

        // Scale, bias and saturate x to 0..1 range
        x = Math.max(0, Math.min(1, (x - min) / (max - min)));

        // Evaluate polynomial
        return x * x * (3 - 2 * x);

    },

    /**
    * Smootherstep function as detailed at http://en.wikipedia.org/wiki/Smoothstep
    *
    * @method Phaser.Math#smootherstep
    * @param {float} x - The input value.
    * @param {float} min - The left edge. Should be smaller than the right edge.
    * @param {float} max - The right edge.
    * @return {float} A value between 0 and 1.
    */
    smootherstep: function (x, min, max) {

        x = Math.max(0, Math.min(1, (x - min) / (max - min)));

        return x * x * x * (x * (x * 6 - 15) + 10);

    },

    /**
    * A value representing the sign of the value: -1 for negative, +1 for positive, 0 if value is 0.
    *
    * This works differently from `Math.sign` for values of NaN and -0, etc.
    *
    * @method Phaser.Math#sign
    * @param {number} x
    * @return {integer} An integer in {-1, 0, 1}
    */
    sign: function (x) {

        return ( x < 0 ) ? -1 : ( ( x > 0 ) ? 1 : 0 );

    },

    /**
    * Work out what percentage value `a` is of value `b` using the given base.
    *
    * @method Phaser.Math#percent
    * @param {number} a - The value to work out the percentage for.
    * @param {number} b - The value you wish to get the percentage of.
    * @param {number} [base=0] - The base value.
    * @return {number} The percentage a is of b, between 0 and 1.
    */
    percent: function (a, b, base) {

        if (base === undefined) { base = 0; }

        if (a > b || base > b)
        {
            return 1;
        }
        else if (a < base || base > a)
        {
            return 0;
        }
        else
        {
            return (a - base) / b;
        }

    }

};

var degreeToRadiansFactor = Math.PI / 180;
var radianToDegreesFactor = 180 / Math.PI;

/**
* Convert degrees to radians.
*
* @method Phaser.Math#degToRad
* @param {number} degrees - Angle in degrees.
* @return {number} Angle in radians.
*/
Phaser.Math.degToRad = function degToRad (degrees) {
    return degrees * degreeToRadiansFactor;
};

/**
* Convert radians to degrees.
*
* @method Phaser.Math#radToDeg
* @param {number} radians - Angle in radians.
* @return {number} Angle in degrees
*/
Phaser.Math.radToDeg = function radToDeg (radians) {
    return radians * radianToDegreesFactor;
};

/* jshint noempty: false */

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* An extremely useful repeatable random data generator.
*
* Based on Nonsense by Josh Faul https://github.com/jocafa/Nonsense.
*
* The random number genererator is based on the Alea PRNG, but is modified.
*  - https://github.com/coverslide/node-alea
*  - https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
*  - http://baagoe.org/en/wiki/Better_random_numbers_for_javascript (original, perm. 404)
*
* @class Phaser.RandomDataGenerator
* @constructor
* @param {any[]|string} [seeds] - An array of values to use as the seed, or a generator state (from {#state}).
*/
Phaser.RandomDataGenerator = function (seeds) {

    if (seeds === undefined) { seeds = []; }

    /**
    * @property {number} c - Internal var.
    * @private
    */
    this.c = 1;

    /**
    * @property {number} s0 - Internal var.
    * @private
    */
    this.s0 = 0;

    /**
    * @property {number} s1 - Internal var.
    * @private
    */
    this.s1 = 0;

    /**
    * @property {number} s2 - Internal var.
    * @private
    */
    this.s2 = 0;

    if (typeof seeds === 'string')
    {
        this.state(seeds);
    }
    else
    {
        this.sow(seeds);
    }

};

Phaser.RandomDataGenerator.prototype = {

    /**
    * Private random helper.
    *
    * @method Phaser.RandomDataGenerator#rnd
    * @private
    * @return {number}
    */
    rnd: function () {

        var t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32

        this.c = t | 0;
        this.s0 = this.s1;
        this.s1 = this.s2;
        this.s2 = t - this.c;

        return this.s2;
    },

    /**
    * Reset the seed of the random data generator.
    *
    * _Note_: the seed array is only processed up to the first `undefined` (or `null`) value, should such be present.
    *
    * @method Phaser.RandomDataGenerator#sow
    * @param {any[]} seeds - The array of seeds: the `toString()` of each value is used.
    */
    sow: function (seeds) {

        // Always reset to default seed
        this.s0 = this.hash(' ');
        this.s1 = this.hash(this.s0);
        this.s2 = this.hash(this.s1);
        this.c = 1;

        if (!seeds)
        {
            return;
        }

        // Apply any seeds
        for (var i = 0; i < seeds.length && (seeds[i] != null); i++)
        {
            var seed = seeds[i];

            this.s0 -= this.hash(seed);
            this.s0 += ~~(this.s0 < 0);
            this.s1 -= this.hash(seed);
            this.s1 += ~~(this.s1 < 0);
            this.s2 -= this.hash(seed);
            this.s2 += ~~(this.s2 < 0);
        }

    },

    /**
    * Internal method that creates a seed hash.
    *
    * @method Phaser.RandomDataGenerator#hash
    * @private
    * @param {any} data
    * @return {number} hashed value.
    */
    hash: function (data) {

        var h, i, n;
        n = 0xefc8249d;
        data = data.toString();

        for (i = 0; i < data.length; i++) {
            n += data.charCodeAt(i);
            h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000;// 2^32
        }

        return (n >>> 0) * 2.3283064365386963e-10;// 2^-32

    },

    /**
    * Returns a random integer between 0 and 2^32.
    *
    * @method Phaser.RandomDataGenerator#integer
    * @return {number} A random integer between 0 and 2^32.
    */
    integer: function() {

        return this.rnd.apply(this) * 0x100000000;// 2^32

    },

    /**
    * Returns a random real number between 0 and 1.
    *
    * @method Phaser.RandomDataGenerator#frac
    * @return {number} A random real number between 0 and 1.
    */
    frac: function() {

        return this.rnd.apply(this) + (this.rnd.apply(this) * 0x200000 | 0) * 1.1102230246251565e-16;   // 2^-53

    },

    /**
    * Returns a random real number between 0 and 2^32.
    *
    * @method Phaser.RandomDataGenerator#real
    * @return {number} A random real number between 0 and 2^32.
    */
    real: function() {

        return this.integer() + this.frac();

    },

    /**
    * Returns a random integer between and including min and max.
    *
    * @method Phaser.RandomDataGenerator#integerInRange
    * @param {number} min - The minimum value in the range.
    * @param {number} max - The maximum value in the range.
    * @return {number} A random number between min and max.
    */
    integerInRange: function (min, max) {

        return Math.floor(this.realInRange(0, max - min + 1) + min);

    },

    /**
    * Returns a random integer between and including min and max.
    * This method is an alias for RandomDataGenerator.integerInRange.
    *
    * @method Phaser.RandomDataGenerator#between
    * @param {number} min - The minimum value in the range.
    * @param {number} max - The maximum value in the range.
    * @return {number} A random number between min and max.
    */
    between: function (min, max) {

        return this.integerInRange(min, max);

    },

    /**
    * Returns a random real number between min and max.
    *
    * @method Phaser.RandomDataGenerator#realInRange
    * @param {number} min - The minimum value in the range.
    * @param {number} max - The maximum value in the range.
    * @return {number} A random number between min and max.
    */
    realInRange: function (min, max) {

        return this.frac() * (max - min) + min;

    },

    /**
    * Returns a random real number between -1 and 1.
    *
    * @method Phaser.RandomDataGenerator#normal
    * @return {number} A random real number between -1 and 1.
    */
    normal: function () {

        return 1 - 2 * this.frac();

    },

    /**
    * Returns a valid RFC4122 version4 ID hex string from https://gist.github.com/1308368
    *
    * @method Phaser.RandomDataGenerator#uuid
    * @return {string} A valid RFC4122 version4 ID hex string
    */
    uuid: function () {

        var a = '';
        var b = '';

        for (b = a = ''; a++ < 36; b +=~a % 5 | a * 3&4 ? (a^15 ? 8^this.frac() * (a^20 ? 16 : 4) : 4).toString(16) : '-')
        {
        }

        return b;

    },

    /**
    * Returns a random member of `array`.
    *
    * @method Phaser.RandomDataGenerator#pick
    * @param {Array} ary - An Array to pick a random member of.
    * @return {any} A random member of the array.
    */
    pick: function (ary) {

        return ary[this.integerInRange(0, ary.length - 1)];

    },

    /**
    * Returns a sign to be used with multiplication operator.
    *
    * @method Phaser.RandomDataGenerator#sign
    * @return {number} -1 or +1.
    */
    sign: function () {

        return this.pick([-1, 1]);

    },

    /**
    * Returns a random member of `array`, favoring the earlier entries.
    *
    * @method Phaser.RandomDataGenerator#weightedPick
    * @param {Array} ary - An Array to pick a random member of.
    * @return {any} A random member of the array.
    */
    weightedPick: function (ary) {

        return ary[~~(Math.pow(this.frac(), 2) * (ary.length - 1) + 0.5)];

    },

    /**
    * Returns a random timestamp between min and max, or between the beginning of 2000 and the end of 2020 if min and max aren't specified.
    *
    * @method Phaser.RandomDataGenerator#timestamp
    * @param {number} min - The minimum value in the range.
    * @param {number} max - The maximum value in the range.
    * @return {number} A random timestamp between min and max.
    */
    timestamp: function (min, max) {

        return this.realInRange(min || 946684800000, max || 1577862000000);

    },

    /**
    * Returns a random angle between -180 and 180.
    *
    * @method Phaser.RandomDataGenerator#angle
    * @return {number} A random number between -180 and 180.
    */
    angle: function() {

        return this.integerInRange(-180, 180);

    },

    /**
    * Gets or Sets the state of the generator. This allows you to retain the values
    * that the generator is using between games, i.e. in a game save file.
    * 
    * To seed this generator with a previously saved state you can pass it as the 
    * `seed` value in your game config, or call this method directly after Phaser has booted.
    *
    * Call this method with no parameters to return the current state.
    * 
    * If providing a state it should match the same format that this method
    * returns, which is a string with a header `!rnd` followed by the `c`,
    * `s0`, `s1` and `s2` values respectively, each comma-delimited. 
    *
    * @method Phaser.RandomDataGenerator#state
    * @param {string} [state] - Generator state to be set.
    * @return {string} The current state of the generator.
    */
    state: function (state) {

        if (typeof state === 'string' && state.match(/^!rnd/))
        {
            state = state.split(',');

            this.c = parseFloat(state[1]);
            this.s0 = parseFloat(state[2]);
            this.s1 = parseFloat(state[3]);
            this.s2 = parseFloat(state[4]);
        }

        return ['!rnd', this.c, this.s0, this.s1, this.s2].join(',');

    }

};

Phaser.RandomDataGenerator.prototype.constructor = Phaser.RandomDataGenerator;

/**
 * @author       Timo Hausmann
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2016 Photon Storm Ltd.
 * @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */

/**
* A QuadTree implementation. The original code was a conversion of the Java code posted to GameDevTuts.
* However I've tweaked it massively to add node indexing, removed lots of temp. var creation and significantly increased performance as a result.
* Original version at https://github.com/timohausmann/quadtree-js/
*
* @class Phaser.QuadTree
* @constructor
* @param {number} x - The top left coordinate of the quadtree.
* @param {number} y - The top left coordinate of the quadtree.
* @param {number} width - The width of the quadtree in pixels.
* @param {number} height - The height of the quadtree in pixels.
* @param {number} [maxObjects=10] - The maximum number of objects per node.
* @param {number} [maxLevels=4] - The maximum number of levels to iterate to.
* @param {number} [level=0] - Which level is this?
*/
Phaser.QuadTree = function(x, y, width, height, maxObjects, maxLevels, level) {

    /**
    * @property {number} maxObjects - The maximum number of objects per node.
    * @default
    */
    this.maxObjects = 10;

    /**
    * @property {number} maxLevels - The maximum number of levels to break down to.
    * @default
    */
    this.maxLevels = 4;

    /**
    * @property {number} level - The current level.
    */
    this.level = 0;

    /**
    * @property {object} bounds - Object that contains the quadtree bounds.
    */
    this.bounds = {};

    /**
    * @property {array} objects - Array of quadtree children.
    */
    this.objects = [];

    /**
    * @property {array} nodes - Array of associated child nodes.
    */
    this.nodes = [];

    /**
    * @property {array} _empty - Internal empty array.
    * @private
    */
    this._empty = [];

    this.reset(x, y, width, height, maxObjects, maxLevels, level);

};

Phaser.QuadTree.prototype = {

    /**
    * Resets the QuadTree.
    *
    * @method Phaser.QuadTree#reset
    * @param {number} x - The top left coordinate of the quadtree.
    * @param {number} y - The top left coordinate of the quadtree.
    * @param {number} width - The width of the quadtree in pixels.
    * @param {number} height - The height of the quadtree in pixels.
    * @param {number} [maxObjects=10] - The maximum number of objects per node.
    * @param {number} [maxLevels=4] - The maximum number of levels to iterate to.
    * @param {number} [level=0] - Which level is this?
    */
    reset: function (x, y, width, height, maxObjects, maxLevels, level) {

        this.maxObjects = maxObjects || 10;
        this.maxLevels = maxLevels || 4;
        this.level = level || 0;

        this.bounds = {
            x: Math.round(x),
            y: Math.round(y),
            width: width,
            height: height,
            subWidth: Math.floor(width / 2),
            subHeight: Math.floor(height / 2),
            right: Math.round(x) + Math.floor(width / 2),
            bottom: Math.round(y) + Math.floor(height / 2)
        };

        this.objects.length = 0;
        this.nodes.length = 0;

    },

    /**
    * Populates this quadtree with the children of the given Group. In order to be added the child must exist and have a body property.
    *
    * @method Phaser.QuadTree#populate
    * @param {Phaser.Group} group - The Group to add to the quadtree.
    */
    populate: function (group) {

        group.forEach(this.populateHandler, this, true);

    },

    /**
    * Handler for the populate method.
    *
    * @method Phaser.QuadTree#populateHandler
    * @param {Phaser.Sprite|object} sprite - The Sprite to check.
    */
    populateHandler: function (sprite) {

        if (sprite.body && sprite.exists)
        {
            this.insert(sprite.body);
        }

    },

    /**
    * Split the node into 4 subnodes
    *
    * @method Phaser.QuadTree#split
    */
    split: function () {

        //  top right node
        this.nodes[0] = new Phaser.QuadTree(this.bounds.right, this.bounds.y, this.bounds.subWidth, this.bounds.subHeight, this.maxObjects, this.maxLevels, (this.level + 1));

        //  top left node
        this.nodes[1] = new Phaser.QuadTree(this.bounds.x, this.bounds.y, this.bounds.subWidth, this.bounds.subHeight, this.maxObjects, this.maxLevels, (this.level + 1));

        //  bottom left node
        this.nodes[2] = new Phaser.QuadTree(this.bounds.x, this.bounds.bottom, this.bounds.subWidth, this.bounds.subHeight, this.maxObjects, this.maxLevels, (this.level + 1));

        //  bottom right node
        this.nodes[3] = new Phaser.QuadTree(this.bounds.right, this.bounds.bottom, this.bounds.subWidth, this.bounds.subHeight, this.maxObjects, this.maxLevels, (this.level + 1));

    },

    /**
    * Insert the object into the node. If the node exceeds the capacity, it will split and add all objects to their corresponding subnodes.
    *
    * @method Phaser.QuadTree#insert
    * @param {Phaser.Physics.Arcade.Body|object} body - The Body object to insert into the quadtree. Can be any object so long as it exposes x, y, right and bottom properties.
    */
    insert: function (body) {

        var i = 0;
        var index;

        //  if we have subnodes ...
        if (this.nodes[0] != null)
        {
            index = this.getIndex(body);

            if (index !== -1)
            {
                this.nodes[index].insert(body);
                return;
            }
        }

        this.objects.push(body);

        if (this.objects.length > this.maxObjects && this.level < this.maxLevels)
        {
            //  Split if we don't already have subnodes
            if (this.nodes[0] == null)
            {
                this.split();
            }

            //  Add objects to subnodes
            while (i < this.objects.length)
            {
                index = this.getIndex(this.objects[i]);

                if (index !== -1)
                {
                    //  this is expensive - see what we can do about it
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                }
                else
                {
                    i++;
                }
            }
        }

    },

    /**
    * Determine which node the object belongs to.
    *
    * @method Phaser.QuadTree#getIndex
    * @param {Phaser.Rectangle|object} rect - The bounds in which to check.
    * @return {number} index - Index of the subnode (0-3), or -1 if rect cannot completely fit within a subnode and is part of the parent node.
    */
    getIndex: function (rect) {

        //  default is that rect doesn't fit, i.e. it straddles the internal quadrants
        var index = -1;

        if (rect.x < this.bounds.right && rect.right < this.bounds.right)
        {
            if (rect.y < this.bounds.bottom && rect.bottom < this.bounds.bottom)
            {
                //  rect fits within the top-left quadrant of this quadtree
                index = 1;
            }
            else if (rect.y > this.bounds.bottom)
            {
                //  rect fits within the bottom-left quadrant of this quadtree
                index = 2;
            }
        }
        else if (rect.x > this.bounds.right)
        {
            //  rect can completely fit within the right quadrants
            if (rect.y < this.bounds.bottom && rect.bottom < this.bounds.bottom)
            {
                //  rect fits within the top-right quadrant of this quadtree
                index = 0;
            }
            else if (rect.y > this.bounds.bottom)
            {
                //  rect fits within the bottom-right quadrant of this quadtree
                index = 3;
            }
        }

        return index;

    },

    /**
    * Return all objects that could collide with the given Sprite or Rectangle.
    *
    * @method Phaser.QuadTree#retrieve
    * @param {Phaser.Sprite|Phaser.Rectangle} source - The source object to check the QuadTree against. Either a Sprite or Rectangle.
    * @return {array} - Array with all detected objects.
    */
    retrieve: function (source) {

        if (source instanceof Phaser.Rectangle)
        {
            var returnObjects = this.objects;

            var index = this.getIndex(source);
        }
        else
        {
            if (!source.body)
            {
                return this._empty;
            }

            var returnObjects = this.objects;

            var index = this.getIndex(source.body);
        }

        if (this.nodes[0])
        {
            //  If rect fits into a subnode ..
            if (index !== -1)
            {
                returnObjects = returnObjects.concat(this.nodes[index].retrieve(source));
            }
            else
            {
                //  If rect does not fit into a subnode, check it against all subnodes (unrolled for speed)
                returnObjects = returnObjects.concat(this.nodes[0].retrieve(source));
                returnObjects = returnObjects.concat(this.nodes[1].retrieve(source));
                returnObjects = returnObjects.concat(this.nodes[2].retrieve(source));
                returnObjects = returnObjects.concat(this.nodes[3].retrieve(source));
            }
        }

        return returnObjects;

    },

    /**
    * Clear the quadtree.
    * @method Phaser.QuadTree#clear
    */
    clear: function () {

        this.objects.length = 0;

        var i = this.nodes.length;

        while (i--)
        {
            this.nodes[i].clear();
            this.nodes.splice(i, 1);
        }

        this.nodes.length = 0;
    }

};

Phaser.QuadTree.prototype.constructor = Phaser.QuadTree;

/**
* Javascript QuadTree
* @version 1.0
*
* @version 1.3, March 11th 2014
* @author Richard Davey
* The original code was a conversion of the Java code posted to GameDevTuts. However I've tweaked
* it massively to add node indexing, removed lots of temp. var creation and significantly
* increased performance as a result.
*
* Original version at https://github.com/timohausmann/quadtree-js/
*/

/**
* @copyright © 2012 Timo Hausmann
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Phaser.Net handles browser URL related tasks such as checking host names, domain names and query string manipulation.
*
* @class Phaser.Net
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.Net = function (game) {

    this.game = game;

};

Phaser.Net.prototype = {

    /**
    * Returns the hostname given by the browser.
    *
    * @method Phaser.Net#getHostName
    * @return {string}
    */
    getHostName: function () {

        if (window.location && window.location.hostname) {
            return window.location.hostname;
        }

        return null;

    },

    /**
    * Compares the given domain name against the hostname of the browser containing the game.
    * If the domain name is found it returns true.
    * You can specify a part of a domain, for example 'google' would match 'google.com', 'google.co.uk', etc.
    * Do not include 'http://' at the start.
    *
    * @method Phaser.Net#checkDomainName
    * @param {string} domain
    * @return {boolean} true if the given domain fragment can be found in the window.location.hostname
    */
    checkDomainName: function (domain) {
        return window.location.hostname.indexOf(domain) !== -1;
    },

    /**
    * Updates a value on the Query String and returns it in full.
    * If the value doesn't already exist it is set.
    * If the value exists it is replaced with the new value given. If you don't provide a new value it is removed from the query string.
    * Optionally you can redirect to the new url, or just return it as a string.
    *
    * @method Phaser.Net#updateQueryString
    * @param {string} key - The querystring key to update.
    * @param {string} value - The new value to be set. If it already exists it will be replaced.
    * @param {boolean} redirect - If true the browser will issue a redirect to the url with the new querystring.
    * @param {string} url - The URL to modify. If none is given it uses window.location.href.
    * @return {string} If redirect is false then the modified url and query string is returned.
    */
    updateQueryString: function (key, value, redirect, url) {

        if (redirect === undefined) { redirect = false; }
        if (url === undefined || url === '') { url = window.location.href; }

        var output = '';
        var re = new RegExp("([?|&])" + key + "=.*?(&|#|$)(.*)", "gi");

        if (re.test(url))
        {
            if (typeof value !== 'undefined' && value !== null)
            {
                output = url.replace(re, '$1' + key + "=" + value + '$2$3');
            }
            else
            {
                output = url.replace(re, '$1$3').replace(/(&|\?)$/, '');
            }
        }
        else
        {
            if (typeof value !== 'undefined' && value !== null)
            {
                var separator = url.indexOf('?') !== -1 ? '&' : '?';
                var hash = url.split('#');
                url = hash[0] + separator + key + '=' + value;

                if (hash[1]) {
                    url += '#' + hash[1];
                }

                output = url;

            }
            else
            {
                output = url;
            }
        }

        if (redirect)
        {
            window.location.href = output;
        }
        else
        {
            return output;
        }

    },

    /**
    * Returns the Query String as an object.
    * If you specify a parameter it will return just the value of that parameter, should it exist.
    *
    * @method Phaser.Net#getQueryString
    * @param {string} [parameter=''] - If specified this will return just the value for that key.
    * @return {string|object} An object containing the key value pairs found in the query string or just the value if a parameter was given.
    */
    getQueryString: function (parameter) {

        if (parameter === undefined) { parameter = ''; }

        var output = {};
        var keyValues = location.search.substring(1).split('&');

        for (var i in keyValues)
        {
            var key = keyValues[i].split('=');

            if (key.length > 1)
            {
                if (parameter && parameter === this.decodeURI(key[0]))
                {
                    return this.decodeURI(key[1]);
                }
                else
                {
                    output[this.decodeURI(key[0])] = this.decodeURI(key[1]);
                }
            }
        }

        return output;

    },

    /**
    * Takes a Uniform Resource Identifier (URI) component (previously created by encodeURIComponent or by a similar routine) and
    * decodes it, replacing \ with spaces in the return. Used internally by the Net classes.
    *
    * @method Phaser.Net#decodeURI
    * @param {string} value - The URI component to be decoded.
    * @return {string} The decoded value.
    */
    decodeURI: function (value) {
        return decodeURIComponent(value.replace(/\+/g, " "));
    }

};

Phaser.Net.prototype.constructor = Phaser.Net;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Phaser.Game has a single instance of the TweenManager through which all Tween objects are created and updated.
* Tweens are hooked into the game clock and pause system, adjusting based on the game state.
*
* TweenManager is based heavily on tween.js by http://soledadpenades.com.
* The difference being that tweens belong to a games instance of TweenManager, rather than to a global TWEEN object.
* It also has callbacks swapped for Signals and a few issues patched with regard to properties and completion errors.
* Please see https://github.com/sole/tween.js for a full list of contributors.
* 
* @class Phaser.TweenManager
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
*/
Phaser.TweenManager = function (game) {

    /**
    * @property {Phaser.Game} game - Local reference to game.
    */
    this.game = game;

    /**
    * Are all newly created Tweens frame or time based? A frame based tween will use the physics elapsed timer when updating. This means
    * it will retain the same consistent frame rate, regardless of the speed of the device. The duration value given should
    * be given in frames.
    * 
    * If the Tween uses a time based update (which is the default) then the duration is given in milliseconds.
    * In this situation a 2000ms tween will last exactly 2 seconds, regardless of the device and how many visual updates the tween
    * has actually been through. For very short tweens you may wish to experiment with a frame based update instead.
    * @property {boolean} frameBased
    * @default
    */
    this.frameBased = false;

    /**
    * @property {array<Phaser.Tween>} _tweens - All of the currently running tweens.
    * @private
    */
    this._tweens = [];

    /**
    * @property {array<Phaser.Tween>} _add - All of the tweens queued to be added in the next update.
    * @private
    */
    this._add = [];

    this.easeMap = {

        "Power0": Phaser.Easing.Power0,
        "Power1": Phaser.Easing.Power1,
        "Power2": Phaser.Easing.Power2,
        "Power3": Phaser.Easing.Power3,
        "Power4": Phaser.Easing.Power4,

        "Linear": Phaser.Easing.Linear.None,
        "Quad": Phaser.Easing.Quadratic.Out,
        "Cubic": Phaser.Easing.Cubic.Out,
        "Quart": Phaser.Easing.Quartic.Out,
        "Quint": Phaser.Easing.Quintic.Out,
        "Sine": Phaser.Easing.Sinusoidal.Out,
        "Expo": Phaser.Easing.Exponential.Out,
        "Circ": Phaser.Easing.Circular.Out,
        "Elastic": Phaser.Easing.Elastic.Out,
        "Back": Phaser.Easing.Back.Out,
        "Bounce": Phaser.Easing.Bounce.Out,

        "Quad.easeIn": Phaser.Easing.Quadratic.In,
        "Cubic.easeIn": Phaser.Easing.Cubic.In,
        "Quart.easeIn": Phaser.Easing.Quartic.In,
        "Quint.easeIn": Phaser.Easing.Quintic.In,
        "Sine.easeIn": Phaser.Easing.Sinusoidal.In,
        "Expo.easeIn": Phaser.Easing.Exponential.In,
        "Circ.easeIn": Phaser.Easing.Circular.In,
        "Elastic.easeIn": Phaser.Easing.Elastic.In,
        "Back.easeIn": Phaser.Easing.Back.In,
        "Bounce.easeIn": Phaser.Easing.Bounce.In,

        "Quad.easeOut": Phaser.Easing.Quadratic.Out,
        "Cubic.easeOut": Phaser.Easing.Cubic.Out,
        "Quart.easeOut": Phaser.Easing.Quartic.Out,
        "Quint.easeOut": Phaser.Easing.Quintic.Out,
        "Sine.easeOut": Phaser.Easing.Sinusoidal.Out,
        "Expo.easeOut": Phaser.Easing.Exponential.Out,
        "Circ.easeOut": Phaser.Easing.Circular.Out,
        "Elastic.easeOut": Phaser.Easing.Elastic.Out,
        "Back.easeOut": Phaser.Easing.Back.Out,
        "Bounce.easeOut": Phaser.Easing.Bounce.Out,

        "Quad.easeInOut": Phaser.Easing.Quadratic.InOut,
        "Cubic.easeInOut": Phaser.Easing.Cubic.InOut,
        "Quart.easeInOut": Phaser.Easing.Quartic.InOut,
        "Quint.easeInOut": Phaser.Easing.Quintic.InOut,
        "Sine.easeInOut": Phaser.Easing.Sinusoidal.InOut,
        "Expo.easeInOut": Phaser.Easing.Exponential.InOut,
        "Circ.easeInOut": Phaser.Easing.Circular.InOut,
        "Elastic.easeInOut": Phaser.Easing.Elastic.InOut,
        "Back.easeInOut": Phaser.Easing.Back.InOut,
        "Bounce.easeInOut": Phaser.Easing.Bounce.InOut

    };

    this.game.onPause.add(this._pauseAll, this);
    this.game.onResume.add(this._resumeAll, this);

};

Phaser.TweenManager.prototype = {

    /**
    * Get all the tween objects in an array.
    * @method Phaser.TweenManager#getAll
    * @returns {Phaser.Tween[]} Array with all tween objects.
    */
    getAll: function () {

        return this._tweens;

    },

    /**
    * Remove all tweens running and in the queue. Doesn't call any of the tween onComplete events.
    * @method Phaser.TweenManager#removeAll
    */
    removeAll: function () {

        for (var i = 0; i < this._tweens.length; i++)
        {
            this._tweens[i].pendingDelete = true;
        }

        this._add = [];

    },
    
    /**
    * Remove all tweens from a specific object, array of objects or Group.
    * 
    * @method Phaser.TweenManager#removeFrom
    * @param {object|object[]|Phaser.Group} obj - The object you want to remove the tweens from.
    * @param {boolean} [children=true] - If passing a group, setting this to true will remove the tweens from all of its children instead of the group itself.
    */
    removeFrom: function (obj, children) {
        
        if (children === undefined) { children = true; }

        var i;
        var len;

        if (Array.isArray(obj))
        {
            for (i = 0, len = obj.length; i < len; i++)
            {
                this.removeFrom(obj[i]);
            }
        }
        else if (obj.type === Phaser.GROUP && children)
        {
            for (var i = 0, len = obj.children.length; i < len; i++)
            {
                this.removeFrom(obj.children[i]);
            }
        }
        else
        {
            for (i = 0, len = this._tweens.length; i < len; i++)
            {
                if (obj === this._tweens[i].target)
                {
                    this.remove(this._tweens[i]);
                }
            }

            for (i = 0, len = this._add.length; i < len; i++)
            {
                if (obj === this._add[i].target)
                {
                    this.remove(this._add[i]);
                }
            }
        }
        
    },

    /**
    * Add a new tween into the TweenManager.
    *
    * @method Phaser.TweenManager#add
    * @param {Phaser.Tween} tween - The tween object you want to add.
    * @returns {Phaser.Tween} The tween object you added to the manager.
    */
    add: function (tween) {

        tween._manager = this;
        this._add.push(tween);

    },

    /**
    * Create a tween object for a specific object. The object can be any JavaScript object or Phaser object such as Sprite.
    *
    * @method Phaser.TweenManager#create
    * @param {object} object - Object the tween will be run on.
    * @returns {Phaser.Tween} The newly created tween object.
    */
    create: function (object) {

        return new Phaser.Tween(object, this.game, this);

    },

    /**
    * Remove a tween from this manager.
    *
    * @method Phaser.TweenManager#remove
    * @param {Phaser.Tween} tween - The tween object you want to remove.
    */
    remove: function (tween) {

        var i = this._tweens.indexOf(tween);

        if (i !== -1)
        {
            this._tweens[i].pendingDelete = true;
        }
        else
        {
            i = this._add.indexOf(tween);

            if (i !== -1)
            {
                this._add[i].pendingDelete = true;
            }
        }

    },

    /**
    * Update all the tween objects you added to this manager.
    *
    * @method Phaser.TweenManager#update
    * @returns {boolean} Return false if there's no tween to update, otherwise return true.
    */
    update: function () {

        var addTweens = this._add.length;
        var numTweens = this._tweens.length;

        if (numTweens === 0 && addTweens === 0)
        {
            return false;
        }

        var i = 0;

        while (i < numTweens)
        {
            if (this._tweens[i].update(this.game.time.time))
            {
                i++;
            }
            else
            {
                this._tweens.splice(i, 1);

                numTweens--;
            }
        }

        //  If there are any new tweens to be added, do so now - otherwise they can be spliced out of the array before ever running
        if (addTweens > 0)
        {
            this._tweens = this._tweens.concat(this._add);
            this._add.length = 0;
        }

        return true;

    },

    /**
    * Checks to see if a particular Sprite is currently being tweened.
    *
    * @method Phaser.TweenManager#isTweening
    * @param {object} object - The object to check for tweens against.
    * @returns {boolean} Returns true if the object is currently being tweened, false if not.
    */
    isTweening: function(object) {

        return this._tweens.some(function(tween) {
            return tween.target === object;
        });

    },

    /**
    * Private. Called by game focus loss. Pauses all currently running tweens.
    *
    * @method Phaser.TweenManager#_pauseAll
    * @private
    */
    _pauseAll: function () {

        for (var i = this._tweens.length - 1; i >= 0; i--)
        {
            this._tweens[i]._pause();
        }

    },

    /**
    * Private. Called by game focus loss. Resumes all currently paused tweens.
    *
    * @method Phaser.TweenManager#_resumeAll
    * @private
    */
    _resumeAll: function () {

        for (var i = this._tweens.length - 1; i >= 0; i--)
        {
            this._tweens[i]._resume();
        }

    },

    /**
    * Pauses all currently running tweens.
    *
    * @method Phaser.TweenManager#pauseAll
    */
    pauseAll: function () {

        for (var i = this._tweens.length - 1; i >= 0; i--)
        {
            this._tweens[i].pause();
        }

    },

    /**
    * Resumes all currently paused tweens.
    *
    * @method Phaser.TweenManager#resumeAll
    */
    resumeAll: function () {

        for (var i = this._tweens.length - 1; i >= 0; i--)
        {
            this._tweens[i].resume(true);
        }

    }

};

Phaser.TweenManager.prototype.constructor = Phaser.TweenManager;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Tween allows you to alter one or more properties of a target object over a defined period of time.
* This can be used for things such as alpha fading Sprites, scaling them or motion.
* Use `Tween.to` or `Tween.from` to set-up the tween values. You can create multiple tweens on the same object
* by calling Tween.to multiple times on the same Tween. Additional tweens specified in this way become "child" tweens and
* are played through in sequence. You can use Tween.timeScale and Tween.reverse to control the playback of this Tween and all of its children.
*
* @class Phaser.Tween
* @constructor
* @param {object} target - The target object, such as a Phaser.Sprite or Phaser.Sprite.scale.
* @param {Phaser.Game} game - Current game instance.
* @param {Phaser.TweenManager} manager - The TweenManager responsible for looking after this Tween.
*/
Phaser.Tween = function (target, game, manager) {

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;

    /**
    * @property {object} target - The target object, such as a Phaser.Sprite or property like Phaser.Sprite.scale.
    */
    this.target = target;

    /**
    * @property {Phaser.TweenManager} manager - Reference to the TweenManager responsible for updating this Tween.
    */
    this.manager = manager;

    /**
    * @property {Array} timeline - An Array of TweenData objects that comprise the different parts of this Tween.
    */
    this.timeline = [];

    /**
    * If set to `true` the current tween will play in reverse.
    * If the tween hasn't yet started this has no effect.
    * If there are child tweens then all child tweens will play in reverse from the current point.
    * @property {boolean} reverse
    * @default
    */
    this.reverse = false;

    /**
    * The speed at which the tweens will run. A value of 1 means it will match the game frame rate. 0.5 will run at half the frame rate. 2 at double the frame rate, etc.
    * If a tweens duration is 1 second but timeScale is 0.5 then it will take 2 seconds to complete.
    *
    * @property {number} timeScale
    * @default
    */
    this.timeScale = 1;

    /**
    * @property {number} repeatCounter - If the Tween and any child tweens are set to repeat this contains the current repeat count.
    */
    this.repeatCounter = 0;

    /**
    * @property {boolean} pendingDelete - True if this Tween is ready to be deleted by the TweenManager.
    * @default
    * @readonly
    */
    this.pendingDelete = false;

    /**
    * The onStart event is fired when the Tween begins. If there is a delay before the tween starts then onStart fires after the delay is finished.
    * It will be sent 2 parameters: the target object and this tween.
    * @property {Phaser.Signal} onStart
    */
    this.onStart = new Phaser.Signal();

    /**
    * The onLoop event is fired if the Tween, or any child tweens loop.
    * It will be sent 2 parameters: the target object and this tween.
    * 
    * @property {Phaser.Signal} onLoop
    */
    this.onLoop = new Phaser.Signal();

    /**
    * The onRepeat event is fired if the Tween and all of its children repeats. If this tween has no children this will never be fired.
    * It will be sent 2 parameters: the target object and this tween.
    * @property {Phaser.Signal} onRepeat
    */
    this.onRepeat = new Phaser.Signal();

    /**
    * The onChildComplete event is fired when the Tween or any of its children completes.
    * Fires every time a child completes unless a child is set to repeat forever.
    * It will be sent 2 parameters: the target object and this tween.
    * @property {Phaser.Signal} onChildComplete
    */
    this.onChildComplete = new Phaser.Signal();

    /**
    * The onComplete event is fired when the Tween and all of its children completes. Does not fire if the Tween is set to loop or repeatAll(-1).
    * It will be sent 2 parameters: the target object and this tween.
    * @property {Phaser.Signal} onComplete
    */
    this.onComplete = new Phaser.Signal();

    /**
    * @property {boolean} isRunning - If the tween is running this is set to true, otherwise false. Tweens that are in a delayed state or waiting to start are considered as being running.
    * @default
    */
    this.isRunning = false;

    /**
    * @property {number} current - The current Tween child being run.
    * @default
    * @readonly
    */
    this.current = 0;

    /**
    * @property {object} properties - Target property cache used when building the child data values.
    */
    this.properties = {};

    /**
    * @property {Phaser.Tween} chainedTween - If this Tween is chained to another this holds a reference to it.
    */
    this.chainedTween = null;

    /**
    * @property {boolean} isPaused - Is this Tween paused or not?
    * @default
    */
    this.isPaused = false;

    /**
    * Is this Tween frame or time based? A frame based tween will use the physics elapsed timer when updating. This means
    * it will retain the same consistent frame rate, regardless of the speed of the device. The duration value given should
    * be given in frames.
    *
    * If the Tween uses a time based update (which is the default) then the duration is given in milliseconds.
    * In this situation a 2000ms tween will last exactly 2 seconds, regardless of the device and how many visual updates the tween
    * has actually been through. For very short tweens you may wish to experiment with a frame based update instead.
    *
    * The default value is whatever you've set in TweenManager.frameBased.
    *
    * @property {boolean} frameBased
    * @default
    */
    this.frameBased = manager.frameBased;

    /**
    * @property {function} _onUpdateCallback - An onUpdate callback.
    * @private
    * @default null
    */
    this._onUpdateCallback = null;

    /**
    * @property {object} _onUpdateCallbackContext - The context in which to call the onUpdate callback.
    * @private
    * @default null
    */
    this._onUpdateCallbackContext = null;

    /**
    * @property {number} _pausedTime - Private pause timer.
    * @private
    * @default
    */
    this._pausedTime = 0;

    /**
    * @property {boolean} _codePaused - Was the Tween paused by code or by Game focus loss?
    * @private
    */
    this._codePaused = false;

    /**
    * @property {boolean} _hasStarted - Internal var to track if the Tween has started yet or not.
    * @private
    */
    this._hasStarted = false;
};

Phaser.Tween.prototype = {

    /**
    * Sets this tween to be a `to` tween on the properties given. A `to` tween starts at the current value and tweens to the destination value given.
    * For example a Sprite with an `x` coordinate of 100 could be tweened to `x` 200 by giving a properties object of `{ x: 200 }`.
    * The ease function allows you define the rate of change. You can pass either a function such as Phaser.Easing.Circular.Out or a string such as "Circ".
    * ".easeIn", ".easeOut" and "easeInOut" variants are all supported for all ease types.
    *
    * @method Phaser.Tween#to
    * @param {object} properties - An object containing the properties you want to tween, such as `Sprite.x` or `Sound.volume`. Given as a JavaScript object.
    * @param {number} [duration=1000] - Duration of this tween in ms. Or if `Tween.frameBased` is true this represents the number of frames that should elapse.
    * @param {function|string} [ease=null] - Easing function. If not set it will default to Phaser.Easing.Default, which is Phaser.Easing.Linear.None by default but can be over-ridden.
    * @param {boolean} [autoStart=false] - Set to `true` to allow this tween to start automatically. Otherwise call Tween.start().
    * @param {number} [delay=0] - Delay before this tween will start in milliseconds. Defaults to 0, no delay.
    * @param {number} [repeat=0] - Should the tween automatically restart once complete? If you want it to run forever set as -1. This only effects this individual tween, not any chained tweens.
    * @param {boolean} [yoyo=false] - A tween that yoyos will reverse itself and play backwards automatically. A yoyo'd tween doesn't fire the Tween.onComplete event, so listen for Tween.onLoop instead.
    * @return {Phaser.Tween} This Tween object.
    */
    to: function (properties, duration, ease, autoStart, delay, repeat, yoyo) {

        if (duration === undefined || duration <= 0) { duration = 1000; }
        if (ease === undefined || ease === null) { ease = Phaser.Easing.Default; }
        if (autoStart === undefined) { autoStart = false; }
        if (delay === undefined) { delay = 0; }
        if (repeat === undefined) { repeat = 0; }
        if (yoyo === undefined) { yoyo = false; }

        if (typeof ease === 'string' && this.manager.easeMap[ease])
        {
            ease = this.manager.easeMap[ease];
        }

        if (this.isRunning)
        {
            console.warn('Phaser.Tween.to cannot be called after Tween.start');
            return this;
        }

        this.timeline.push(new Phaser.TweenData(this).to(properties, duration, ease, delay, repeat, yoyo));

        if (autoStart)
        {
            this.start();
        }

        return this;

    },

    /**
    * Sets this tween to be a `from` tween on the properties given. A `from` tween sets the target to the destination value and tweens to its current value.
    * For example a Sprite with an `x` coordinate of 100 tweened from `x` 500 would be set to `x` 500 and then tweened to `x` 100 by giving a properties object of `{ x: 500 }`.
    * The ease function allows you define the rate of change. You can pass either a function such as Phaser.Easing.Circular.Out or a string such as "Circ".
    * ".easeIn", ".easeOut" and "easeInOut" variants are all supported for all ease types.
    *
    * @method Phaser.Tween#from
    * @param {object} properties - An object containing the properties you want to tween., such as `Sprite.x` or `Sound.volume`. Given as a JavaScript object.
    * @param {number} [duration=1000] - Duration of this tween in ms. Or if `Tween.frameBased` is true this represents the number of frames that should elapse.
    * @param {function|string} [ease=null] - Easing function. If not set it will default to Phaser.Easing.Default, which is Phaser.Easing.Linear.None by default but can be over-ridden.
    * @param {boolean} [autoStart=false] - Set to `true` to allow this tween to start automatically. Otherwise call Tween.start().
    * @param {number} [delay=0] - Delay before this tween will start in milliseconds. Defaults to 0, no delay.
    * @param {number} [repeat=0] - Should the tween automatically restart once complete? If you want it to run forever set as -1. This only effects this individual tween, not any chained tweens.
    * @param {boolean} [yoyo=false] - A tween that yoyos will reverse itself and play backwards automatically. A yoyo'd tween doesn't fire the Tween.onComplete event, so listen for Tween.onLoop instead.
    * @return {Phaser.Tween} This Tween object.
    */
    from: function (properties, duration, ease, autoStart, delay, repeat, yoyo) {

        if (duration === undefined) { duration = 1000; }
        if (ease === undefined || ease === null) { ease = Phaser.Easing.Default; }
        if (autoStart === undefined) { autoStart = false; }
        if (delay === undefined) { delay = 0; }
        if (repeat === undefined) { repeat = 0; }
        if (yoyo === undefined) { yoyo = false; }

        if (typeof ease === 'string' && this.manager.easeMap[ease])
        {
            ease = this.manager.easeMap[ease];
        }

        if (this.isRunning)
        {
            console.warn('Phaser.Tween.from cannot be called after Tween.start');
            return this;
        }

        this.timeline.push(new Phaser.TweenData(this).from(properties, duration, ease, delay, repeat, yoyo));

        if (autoStart)
        {
            this.start();
        }

        return this;

    },

    /**
    * Starts the tween running. Can also be called by the autoStart parameter of `Tween.to` or `Tween.from`.
    * This sets the `Tween.isRunning` property to `true` and dispatches a `Tween.onStart` signal.
    * If the Tween has a delay set then nothing will start tweening until the delay has expired.
    *
    * @method Phaser.Tween#start
    * @param {number} [index=0] - If this Tween contains child tweens you can specify which one to start from. The default is zero, i.e. the first tween created.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    start: function (index) {

        if (index === undefined) { index = 0; }

        if (this.game === null || this.target === null || this.timeline.length === 0 || this.isRunning)
        {
            return this;
        }

        //  Populate the tween data
        for (var i = 0; i < this.timeline.length; i++)
        {
            //  Build our master property list with the starting values
            for (var property in this.timeline[i].vEnd)
            {
                this.properties[property] = this.target[property] || 0;

                if (!Array.isArray(this.properties[property]))
                {
                    //  Ensures we're using numbers, not strings
                    this.properties[property] *= 1.0;
                }
            }
        }

        for (var i = 0; i < this.timeline.length; i++)
        {
            this.timeline[i].loadValues();
        }

        this.manager.add(this);

        this.isRunning = true;

        if (index < 0 || index > this.timeline.length - 1)
        {
            index = 0;
        }

        this.current = index;

        this.timeline[this.current].start();

        return this;

    },

    /**
    * Stops the tween if running and flags it for deletion from the TweenManager.
    * If called directly the `Tween.onComplete` signal is not dispatched and no chained tweens are started unless the complete parameter is set to `true`.
    * If you just wish to pause a tween then use Tween.pause instead.
    *
    * @method Phaser.Tween#stop
    * @param {boolean} [complete=false] - Set to `true` to dispatch the Tween.onComplete signal.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    stop: function (complete) {

        if (complete === undefined) { complete = false; }

        this.isRunning = false;

        this._onUpdateCallback = null;
        this._onUpdateCallbackContext = null;

        if (complete)
        {
            this.onComplete.dispatch(this.target, this);
            this._hasStarted = false;

            if (this.chainedTween)
            {
                this.chainedTween.start();
            }
        }

        this.manager.remove(this);

        return this;

    },

    /**
    * Updates either a single TweenData or all TweenData objects properties to the given value.
    * Used internally by methods like Tween.delay, Tween.yoyo, etc. but can also be called directly if you know which property you want to tweak.
    * The property is not checked, so if you pass an invalid one you'll generate a run-time error.
    *
    * @method Phaser.Tween#updateTweenData
    * @param {string} property - The property to update.
    * @param {number|function} value - The value to set the property to.
    * @param {number} [index=0] - If this tween has more than one child this allows you to target a specific child. If set to -1 it will set the delay on all the children.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    updateTweenData: function (property, value, index) {

        if (this.timeline.length === 0) { return this; }

        if (index === undefined) { index = 0; }

        if (index === -1)
        {
            for (var i = 0; i < this.timeline.length; i++)
            {
                this.timeline[i][property] = value;
            }
        }
        else
        {
            this.timeline[index][property] = value;
        }

        return this;

    },

    /**
    * Sets the delay in milliseconds before this tween will start. If there are child tweens it sets the delay before the first child starts.
    * The delay is invoked as soon as you call `Tween.start`. If the tween is already running this method doesn't do anything for the current active tween.
    * If you have not yet called `Tween.to` or `Tween.from` at least once then this method will do nothing, as there are no tweens to delay.
    * If you have child tweens and pass -1 as the index value it sets the delay across all of them.
    *
    * @method Phaser.Tween#delay
    * @param {number} duration - The amount of time in ms that the Tween should wait until it begins once started is called. Set to zero to remove any active delay.
    * @param {number} [index=0] - If this tween has more than one child this allows you to target a specific child. If set to -1 it will set the delay on all the children.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    delay: function (duration, index) {

        return this.updateTweenData('delay', duration, index);

    },

    /**
    * Sets the number of times this tween will repeat.
    * If you have not yet called `Tween.to` or `Tween.from` at least once then this method will do nothing, as there are no tweens to repeat.
    * If you have child tweens and pass -1 as the index value it sets the number of times they'll repeat across all of them.
    * If you wish to define how many times this Tween and all children will repeat see Tween.repeatAll.
    *
    * @method Phaser.Tween#repeat
    * @param {number} total - How many times a tween should repeat before completing. Set to zero to remove an active repeat. Set to -1 to repeat forever.
    * @param {number} [repeat=0] - This is the amount of time to pause (in ms) before the repeat will start.
    * @param {number} [index=0] - If this tween has more than one child this allows you to target a specific child. If set to -1 it will set the repeat value on all the children.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    repeat: function (total, repeatDelay, index) {

        if (repeatDelay === undefined) { repeatDelay = 0; }

        this.updateTweenData('repeatCounter', total, index);

        return this.updateTweenData('repeatDelay', repeatDelay, index);

    },

    /**
    * Sets the delay in milliseconds before this tween will repeat itself.
    * The repeatDelay is invoked as soon as you call `Tween.start`. If the tween is already running this method doesn't do anything for the current active tween.
    * If you have not yet called `Tween.to` or `Tween.from` at least once then this method will do nothing, as there are no tweens to set repeatDelay on.
    * If you have child tweens and pass -1 as the index value it sets the repeatDelay across all of them.
    *
    * @method Phaser.Tween#repeatDelay
    * @param {number} duration - The amount of time in ms that the Tween should wait until it repeats or yoyos once start is called. Set to zero to remove any active repeatDelay.
    * @param {number} [index=0] - If this tween has more than one child this allows you to target a specific child. If set to -1 it will set the repeatDelay on all the children.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    repeatDelay: function (duration, index) {

        return this.updateTweenData('repeatDelay', duration, index);

    },

    /**
    * A Tween that has yoyo set to true will run through from its starting values to its end values and then play back in reverse from end to start.
    * Used in combination with repeat you can create endless loops.
    * If you have not yet called `Tween.to` or `Tween.from` at least once then this method will do nothing, as there are no tweens to yoyo.
    * If you have child tweens and pass -1 as the index value it sets the yoyo property across all of them.
    * If you wish to yoyo this Tween and all of its children then see Tween.yoyoAll.
    *
    * @method Phaser.Tween#yoyo
    * @param {boolean} enable - Set to true to yoyo this tween, or false to disable an already active yoyo.
    * @param {number} [yoyoDelay=0] - This is the amount of time to pause (in ms) before the yoyo will start.
    * @param {number} [index=0] - If this tween has more than one child this allows you to target a specific child. If set to -1 it will set yoyo on all the children.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    yoyo: function(enable, yoyoDelay, index) {

        if (yoyoDelay === undefined) { yoyoDelay = 0; }

        this.updateTweenData('yoyo', enable, index);

        return this.updateTweenData('yoyoDelay', yoyoDelay, index);

    },

    /**
    * Sets the delay in milliseconds before this tween will run a yoyo (only applies if yoyo is enabled).
    * The repeatDelay is invoked as soon as you call `Tween.start`. If the tween is already running this method doesn't do anything for the current active tween.
    * If you have not yet called `Tween.to` or `Tween.from` at least once then this method will do nothing, as there are no tweens to set repeatDelay on.
    * If you have child tweens and pass -1 as the index value it sets the repeatDelay across all of them.
    *
    * @method Phaser.Tween#yoyoDelay
    * @param {number} duration - The amount of time in ms that the Tween should wait until it repeats or yoyos once start is called. Set to zero to remove any active yoyoDelay.
    * @param {number} [index=0] - If this tween has more than one child this allows you to target a specific child. If set to -1 it will set the yoyoDelay on all the children.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    yoyoDelay: function (duration, index) {

        return this.updateTweenData('yoyoDelay', duration, index);

    },

    /**
    * Set easing function this tween will use, i.e. Phaser.Easing.Linear.None.
    * The ease function allows you define the rate of change. You can pass either a function such as Phaser.Easing.Circular.Out or a string such as "Circ".
    * ".easeIn", ".easeOut" and "easeInOut" variants are all supported for all ease types.
    * If you have child tweens and pass -1 as the index value it sets the easing function defined here across all of them.
    *
    * @method Phaser.Tween#easing
    * @param {function|string} ease - The easing function this tween will use, i.e. Phaser.Easing.Linear.None.
    * @param {number} [index=0] - If this tween has more than one child this allows you to target a specific child. If set to -1 it will set the easing function on all children.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    easing: function (ease, index) {

        if (typeof ease === 'string' && this.manager.easeMap[ease])
        {
            ease = this.manager.easeMap[ease];
        }

        return this.updateTweenData('easingFunction', ease, index);

    },

    /**
    * Sets the interpolation function the tween will use. By default it uses Phaser.Math.linearInterpolation.
    * Also available: Phaser.Math.bezierInterpolation and Phaser.Math.catmullRomInterpolation.
    * The interpolation function is only used if the target properties is an array.
    * If you have child tweens and pass -1 as the index value and it will set the interpolation function across all of them.
    *
    * @method Phaser.Tween#interpolation
    * @param {function} interpolation - The interpolation function to use (Phaser.Math.linearInterpolation by default)
    * @param {object} [context] - The context under which the interpolation function will be run.
    * @param {number} [index=0] - If this tween has more than one child this allows you to target a specific child. If set to -1 it will set the interpolation function on all children.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    interpolation: function (interpolation, context, index) {

        if (context === undefined) { context = Phaser.Math; }

        this.updateTweenData('interpolationFunction', interpolation, index);

        return this.updateTweenData('interpolationContext', context, index);

    },

    /**
    * Set how many times this tween and all of its children will repeat.
    * A tween (A) with 3 children (B,C,D) with a `repeatAll` value of 2 would play as: ABCDABCD before completing.
    *
    * @method Phaser.Tween#repeatAll
    * @param {number} [total=0] - How many times this tween and all children should repeat before completing. Set to zero to remove an active repeat. Set to -1 to repeat forever.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    repeatAll: function (total) {

        if (total === undefined) { total = 0; }

        this.repeatCounter = total;

        return this;

    },

    /**
    * This method allows you to chain tweens together. Any tween chained to this tween will have its `Tween.start` method called
    * as soon as this tween completes. If this tween never completes (i.e. repeatAll or loop is set) then the chain will never progress.
    * Note that `Tween.onComplete` will fire when *this* tween completes, not when the whole chain completes.
    * For that you should listen to `onComplete` on the final tween in your chain.
    *
    * If you pass multiple tweens to this method they will be joined into a single long chain.
    * For example if this is Tween A and you pass in B, C and D then B will be chained to A, C will be chained to B and D will be chained to C.
    * Any previously chained tweens that may have been set will be overwritten.
    *
    * @method Phaser.Tween#chain
    * @param {...Phaser.Tween} tweens - One or more tweens that will be chained to this one.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    chain: function () {

        var i = arguments.length;

        while (i--)
        {
            if (i > 0)
            {
                arguments[i - 1].chainedTween = arguments[i];
            }
            else
            {
                this.chainedTween = arguments[i];
            }
        }

        return this;

    },

    /**
    * Enables the looping of this tween. The tween will loop forever, and onComplete will never fire.
    *
    * If `value` is `true` then this is the same as setting `Tween.repeatAll(-1)`.
    * If `value` is `false` it is the same as setting `Tween.repeatAll(0)` and will reset the `repeatCounter` to zero.
    *
    * Usage:
    * game.add.tween(p).to({ x: 700 }, 1000, Phaser.Easing.Linear.None, true)
    * .to({ y: 300 }, 1000, Phaser.Easing.Linear.None)
    * .to({ x: 0 }, 1000, Phaser.Easing.Linear.None)
    * .to({ y: 0 }, 1000, Phaser.Easing.Linear.None)
    * .loop();
    * @method Phaser.Tween#loop
    * @param {boolean} [value=true] - If `true` this tween will loop once it reaches the end. Set to `false` to remove an active loop.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    loop: function (value) {

        if (value === undefined) { value = true; }

        this.repeatCounter = (value) ? -1 : 0;

        return this;

    },

    /**
    * Sets a callback to be fired each time this tween updates.
    *
    * @method Phaser.Tween#onUpdateCallback
    * @param {function} callback - The callback to invoke each time this tween is updated. Set to `null` to remove an already active callback.
    * @param {object} callbackContext - The context in which to call the onUpdate callback.
    * @return {Phaser.Tween} This tween. Useful for method chaining.
    */
    onUpdateCallback: function (callback, callbackContext) {

        this._onUpdateCallback = callback;
        this._onUpdateCallbackContext = callbackContext;

        return this;

    },

    /**
    * Pauses the tween. Resume playback with Tween.resume.
    *
    * @method Phaser.Tween#pause
    */
    pause: function () {

        this.isPaused = true;

        this._codePaused = true;

        this._pausedTime = this.game.time.time;

    },

    /**
    * This is called by the core Game loop. Do not call it directly, instead use Tween.pause.
    *
    * @private
    * @method Phaser.Tween#_pause
    */
    _pause: function () {

        if (!this._codePaused)
        {
            this.isPaused = true;

            this._pausedTime = this.game.time.time;
        }

    },

    /**
    * Resumes a paused tween.
    *
    * @method Phaser.Tween#resume
    */
    resume: function () {

        if (this.isPaused)
        {
            this.isPaused = false;

            this._codePaused = false;

            for (var i = 0; i < this.timeline.length; i++)
            {
                if (!this.timeline[i].isRunning)
                {
                    this.timeline[i].startTime += (this.game.time.time - this._pausedTime);
                }
            }
        }

    },

    /**
    * This is called by the core Game loop. Do not call it directly, instead use Tween.pause.
    * @method Phaser.Tween#_resume
    * @private
    */
    _resume: function () {

        if (this._codePaused)
        {
            return;
        }
        else
        {
            this.resume();
        }

    },

    /**
    * Core tween update function called by the TweenManager. Does not need to be invoked directly.
    *
    * @method Phaser.Tween#update
    * @param {number} time - A timestamp passed in by the TweenManager.
    * @return {boolean} false if the tween and all child tweens have completed and should be deleted from the manager, otherwise true (still active).
    */
    update: function (time) {

        if (this.pendingDelete || !this.target)
        {
            return false;
        }

        if (this.isPaused)
        {
            return true;
        }

        var status = this.timeline[this.current].update(time);

        if (status === Phaser.TweenData.PENDING)
        {
            return true;
        }
        else if (status === Phaser.TweenData.RUNNING)
        {
            if (!this._hasStarted)
            {
                this.onStart.dispatch(this.target, this);
                this._hasStarted = true;
            }

            if (this._onUpdateCallback !== null)
            {
                this._onUpdateCallback.call(this._onUpdateCallbackContext, this, this.timeline[this.current].value, this.timeline[this.current]);
            }

            //  In case the update callback modifies this tween
            return this.isRunning;
        }
        else if (status === Phaser.TweenData.LOOPED)
        {
            if (this.timeline[this.current].repeatCounter === -1)
            {
                this.onLoop.dispatch(this.target, this);
            }
            else
            {
                this.onRepeat.dispatch(this.target, this);
            }

            return true;
        }
        else if (status === Phaser.TweenData.COMPLETE)
        {
            var complete = false;

            //  What now?
            if (this.reverse)
            {
                this.current--;

                if (this.current < 0)
                {
                    this.current = this.timeline.length - 1;
                    complete = true;
                }
            }
            else
            {
                this.current++;

                if (this.current === this.timeline.length)
                {
                    this.current = 0;
                    complete = true;
                }
            }

            if (complete)
            {
                //  We've reached the start or end of the child tweens (depending on Tween.reverse), should we repeat it?
                if (this.repeatCounter === -1)
                {
                    this.timeline[this.current].start();
                    this.onLoop.dispatch(this.target, this);
                    return true;
                }
                else if (this.repeatCounter > 0)
                {
                    this.repeatCounter--;

                    this.timeline[this.current].start();
                    this.onRepeat.dispatch(this.target, this);
                    return true;
                }
                else
                {
                    //  No more repeats and no more children, so we're done
                    this.isRunning = false;
                    this.onComplete.dispatch(this.target, this);
                    this._hasStarted = false;

                    if (this.chainedTween)
                    {
                        this.chainedTween.start();
                    }

                    return false;
                }
            }
            else
            {
                //  We've still got some children to go
                this.onChildComplete.dispatch(this.target, this);
                this.timeline[this.current].start();
                return true;
            }
        }

    },

    /**
    * This will generate an array populated with the tweened object values from start to end.
    * It works by running the tween simulation at the given frame rate based on the values set-up in Tween.to and Tween.from.
    * It ignores delay and repeat counts and any chained tweens, but does include child tweens.
    * Just one play through of the tween data is returned, including yoyo if set.
    *
    * @method Phaser.Tween#generateData
    * @param {number} [frameRate=60] - The speed in frames per second that the data should be generated at. The higher the value, the larger the array it creates.
    * @param {array} [data] - If given the generated data will be appended to this array, otherwise a new array will be returned.
    * @return {array} An array of tweened values.
    */
    generateData: function (frameRate, data) {

        if (this.game === null || this.target === null)
        {
            return null;
        }

        if (frameRate === undefined) { frameRate = 60; }
        if (data === undefined) { data = []; }

        //  Populate the tween data
        for (var i = 0; i < this.timeline.length; i++)
        {
            //  Build our master property list with the starting values
            for (var property in this.timeline[i].vEnd)
            {
                this.properties[property] = this.target[property] || 0;

                if (!Array.isArray(this.properties[property]))
                {
                    //  Ensures we're using numbers, not strings
                    this.properties[property] *= 1.0;
                }
            }
        }

        for (var i = 0; i < this.timeline.length; i++)
        {
            this.timeline[i].loadValues();
        }

        for (var i = 0; i < this.timeline.length; i++)
        {
            data = data.concat(this.timeline[i].generateData(frameRate));
        }

        return data;

    }

};

/**
* @name Phaser.Tween#totalDuration
* @property {Phaser.TweenData} totalDuration - Gets the total duration of this Tween, including all child tweens, in milliseconds.
*/
Object.defineProperty(Phaser.Tween.prototype, 'totalDuration', {

    get: function () {

        var total = 0;

        for (var i = 0; i < this.timeline.length; i++)
        {
            total += this.timeline[i].duration;
        }

        return total;

    }

});

Phaser.Tween.prototype.constructor = Phaser.Tween;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Phaser.Tween contains at least one TweenData object. It contains all of the tween data values, such as the
* starting and ending values, the ease function, interpolation and duration. The Tween acts as a timeline manager for
* TweenData objects and can contain multiple TweenData objects.
*
* @class Phaser.TweenData
* @constructor
* @param {Phaser.Tween} parent - The Tween that owns this TweenData object.
*/
Phaser.TweenData = function (parent) {

    /**
    * @property {Phaser.Tween} parent - The Tween which owns this TweenData.
    */
    this.parent = parent;

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = parent.game;

    /**
    * @property {object} vStart - An object containing the values at the start of the tween.
    * @private
    */
    this.vStart = {};

    /**
    * @property {object} vStartCache - Cached starting values.
    * @private
    */
    this.vStartCache = {};

    /**
    * @property {object} vEnd - An object containing the values at the end of the tween.
    * @private
    */
    this.vEnd = {};

    /**
    * @property {object} vEndCache - Cached ending values.
    * @private
    */
    this.vEndCache = {};

    /**
    * @property {number} duration - The duration of the tween in ms.
    * @default
    */
    this.duration = 1000;

    /**
    * @property {number} percent - A value between 0 and 1 that represents how far through the duration this tween is.
    * @readonly
    */
    this.percent = 0;

    /**
    * @property {number} value - The current calculated value.
    * @readonly
    */
    this.value = 0;

    /**
    * @property {number} repeatCounter - If the Tween is set to repeat this contains the current repeat count.
    */
    this.repeatCounter = 0;

    /**
    * @property {number} repeatDelay - The amount of time in ms between repeats of this tween.
    */
    this.repeatDelay = 0;

    /**
    * @property {number} repeatTotal - The total number of times this Tween will repeat.
    * @readonly
    */
    this.repeatTotal = 0;

    /**
    * @property {boolean} interpolate - True if the Tween will use interpolation (i.e. is an Array to Array tween)
    * @default
    */
    this.interpolate = false;

    /**
    * @property {boolean} yoyo - True if the Tween is set to yoyo, otherwise false.
    * @default
    */
    this.yoyo = false;

    /**
    * @property {number} yoyoDelay - The amount of time in ms between yoyos of this tween.
    */
    this.yoyoDelay = 0;

    /**
    * @property {boolean} inReverse - When a Tween is yoyoing this value holds if it's currently playing forwards (false) or in reverse (true).
    * @default
    */
    this.inReverse = false;

    /**
    * @property {number} delay - The amount to delay by until the Tween starts (in ms). Only applies to the start, use repeatDelay to handle repeats.
    * @default
    */
    this.delay = 0;

    /**
    * @property {number} dt - Current time value.
    */
    this.dt = 0;

    /**
    * @property {number} startTime - The time the Tween started or null if it hasn't yet started.
    */
    this.startTime = null;

    /**
    * @property {function} easingFunction - The easing function used for the Tween.
    * @default Phaser.Easing.Default
    */
    this.easingFunction = Phaser.Easing.Default;

    /**
    * @property {function} interpolationFunction - The interpolation function used for the Tween.
    * @default Phaser.Math.linearInterpolation
    */
    this.interpolationFunction = Phaser.Math.linearInterpolation;

    /**
    * @property {object} interpolationContext - The interpolation function context used for the Tween.
    * @default Phaser.Math
    */
    this.interpolationContext = Phaser.Math;

    /**
    * @property {boolean} isRunning - If the tween is running this is set to `true`. Unless Phaser.Tween a TweenData that is waiting for a delay to expire is *not* considered as running.
    * @default
    */
    this.isRunning = false;

    /**
    * @property {boolean} isFrom - Is this a from tween or a to tween?
    * @default
    */
    this.isFrom = false;

};

/**
* @constant
* @type {number}
*/
Phaser.TweenData.PENDING = 0;

/**
* @constant
* @type {number}
*/
Phaser.TweenData.RUNNING = 1;

/**
* @constant
* @type {number}
*/
Phaser.TweenData.LOOPED = 2;

/**
* @constant
* @type {number}
*/
Phaser.TweenData.COMPLETE = 3;

Phaser.TweenData.prototype = {

    /**
    * Sets this tween to be a `to` tween on the properties given. A `to` tween starts at the current value and tweens to the destination value given.
    * For example a Sprite with an `x` coordinate of 100 could be tweened to `x` 200 by giving a properties object of `{ x: 200 }`.
    *
    * @method Phaser.TweenData#to
    * @param {object} properties - The properties you want to tween, such as `Sprite.x` or `Sound.volume`. Given as a JavaScript object.
    * @param {number} [duration=1000] - Duration of this tween in ms.
    * @param {function} [ease=null] - Easing function. If not set it will default to Phaser.Easing.Default, which is Phaser.Easing.Linear.None by default but can be over-ridden at will.
    * @param {number} [delay=0] - Delay before this tween will start, defaults to 0 (no delay). Value given is in ms.
    * @param {number} [repeat=0] - Should the tween automatically restart once complete? If you want it to run forever set as -1. This ignores any chained tweens.
    * @param {boolean} [yoyo=false] - A tween that yoyos will reverse itself and play backwards automatically. A yoyo'd tween doesn't fire the Tween.onComplete event, so listen for Tween.onLoop instead.
    * @return {Phaser.TweenData} This Tween object.
    */
    to: function (properties, duration, ease, delay, repeat, yoyo) {

        this.vEnd = properties;
        this.duration = duration;
        this.easingFunction = ease;
        this.delay = delay;
        this.repeatTotal = repeat;
        this.yoyo = yoyo;

        this.isFrom = false;

        return this;

    },

    /**
    * Sets this tween to be a `from` tween on the properties given. A `from` tween sets the target to the destination value and tweens to its current value.
    * For example a Sprite with an `x` coordinate of 100 tweened from `x` 500 would be set to `x` 500 and then tweened to `x` 100 by giving a properties object of `{ x: 500 }`.
    *
    * @method Phaser.TweenData#from
    * @param {object} properties - The properties you want to tween, such as `Sprite.x` or `Sound.volume`. Given as a JavaScript object.
    * @param {number} [duration=1000] - Duration of this tween in ms.
    * @param {function} [ease=null] - Easing function. If not set it will default to Phaser.Easing.Default, which is Phaser.Easing.Linear.None by default but can be over-ridden at will.
    * @param {number} [delay=0] - Delay before this tween will start, defaults to 0 (no delay). Value given is in ms.
    * @param {number} [repeat=0] - Should the tween automatically restart once complete? If you want it to run forever set as -1. This ignores any chained tweens.
    * @param {boolean} [yoyo=false] - A tween that yoyos will reverse itself and play backwards automatically. A yoyo'd tween doesn't fire the Tween.onComplete event, so listen for Tween.onLoop instead.
    * @return {Phaser.TweenData} This Tween object.
    */
    from: function (properties, duration, ease, delay, repeat, yoyo) {

        this.vEnd = properties;
        this.duration = duration;
        this.easingFunction = ease;
        this.delay = delay;
        this.repeatTotal = repeat;
        this.yoyo = yoyo;

        this.isFrom = true;

        return this;

    },

    /**
    * Starts the Tween running.
    *
    * @method Phaser.TweenData#start
    * @return {Phaser.TweenData} This Tween object.
    */
    start: function () {

        this.startTime = this.game.time.time + this.delay;

        if (this.parent.reverse)
        {
            this.dt = this.duration;
        }
        else
        {
            this.dt = 0;
        }

        if (this.delay > 0)
        {
            this.isRunning = false;
        }
        else
        {
            this.isRunning = true;
        }

        if (this.isFrom)
        {
            //  Reverse them all and instant set them
            for (var property in this.vStartCache)
            {
                this.vStart[property] = this.vEndCache[property];
                this.vEnd[property] = this.vStartCache[property];
                this.parent.target[property] = this.vStart[property];
            }
        }

        this.value = 0;
        this.yoyoCounter = 0;
        this.repeatCounter = this.repeatTotal;

        return this;

    },

    /**
    * Loads the values from the target object into this Tween.
    *
    * @private
    * @method Phaser.TweenData#loadValues
    * @return {Phaser.TweenData} This Tween object.
    */
    loadValues: function () {

        for (var property in this.parent.properties)
        {
            //  Load the property from the parent object
            this.vStart[property] = this.parent.properties[property];

            //  Check if an Array was provided as property value
            if (Array.isArray(this.vEnd[property]))
            {
                if (this.vEnd[property].length === 0)
                {
                    continue;
                }

                if (this.percent === 0)
                {
                    //  Put the start value at the beginning of the array
                    //  but we only want to do this once, if the Tween hasn't run before
                    this.vEnd[property] = [this.vStart[property]].concat(this.vEnd[property]);
                }
            }

            if (typeof this.vEnd[property] !== 'undefined')
            {
                if (typeof this.vEnd[property] === 'string')
                {
                    //  Parses relative end values with start as base (e.g.: +10, -3)
                    this.vEnd[property] = this.vStart[property] + parseFloat(this.vEnd[property], 10);
                }

                this.parent.properties[property] = this.vEnd[property];
            }
            else
            {
                //  Null tween
                this.vEnd[property] = this.vStart[property];
            }

            this.vStartCache[property] = this.vStart[property];
            this.vEndCache[property] = this.vEnd[property];
        }

        return this;

    },

    /**
    * Updates this Tween. This is called automatically by Phaser.Tween.
    *
    * @protected
    * @method Phaser.TweenData#update
    * @param {number} time - A timestamp passed in by the Tween parent.
    * @return {number} The current status of this Tween. One of the Phaser.TweenData constants: PENDING, RUNNING, LOOPED or COMPLETE.
    */
    update: function (time) {

        if (!this.isRunning)
        {
            if (time >= this.startTime)
            {
                this.isRunning = true;
            }
            else
            {
                return Phaser.TweenData.PENDING;
            }
        }
        else
        {
            //  Is Running, but is waiting to repeat
            if (time < this.startTime)
            {
                return Phaser.TweenData.RUNNING;
            }
        }

        var ms = (this.parent.frameBased) ? this.game.time.physicsElapsedMS : this.game.time.elapsedMS;

        if (this.parent.reverse)
        {
            this.dt -= ms * this.parent.timeScale;
            this.dt = Math.max(this.dt, 0);
        }
        else
        {
            this.dt += ms * this.parent.timeScale;
            this.dt = Math.min(this.dt, this.duration);
        }

        this.percent = this.dt / this.duration;

        this.value = this.easingFunction(this.percent);

        for (var property in this.vEnd)
        {
            var start = this.vStart[property];
            var end = this.vEnd[property];

            if (Array.isArray(end))
            {
                this.parent.target[property] = this.interpolationFunction.call(this.interpolationContext, end, this.value);
            }
            else
            {
                this.parent.target[property] = start + ((end - start) * this.value);
            }
        }

        if ((!this.parent.reverse && this.percent === 1) || (this.parent.reverse && this.percent === 0))
        {
            return this.repeat();
        }
        
        return Phaser.TweenData.RUNNING;

    },

    /**
    * This will generate an array populated with the tweened object values from start to end.
    * It works by running the tween simulation at the given frame rate based on the values set-up in Tween.to and Tween.from.
    * Just one play through of the tween data is returned, including yoyo if set.
    *
    * @method Phaser.TweenData#generateData
    * @param {number} [frameRate=60] - The speed in frames per second that the data should be generated at. The higher the value, the larger the array it creates.
    * @return {array} An array of tweened values.
    */
    generateData: function (frameRate) {

        if (this.parent.reverse)
        {
            this.dt = this.duration;
        }
        else
        {
            this.dt = 0;
        }

        var data = [];
        var complete = false;
        var fps = (1 / frameRate) * 1000;

        do
        {
            if (this.parent.reverse)
            {
                this.dt -= fps;
                this.dt = Math.max(this.dt, 0);
            }
            else
            {
                this.dt += fps;
                this.dt = Math.min(this.dt, this.duration);
            }

            this.percent = this.dt / this.duration;

            this.value = this.easingFunction(this.percent);

            var blob = {};

            for (var property in this.vEnd)
            {
                var start = this.vStart[property];
                var end = this.vEnd[property];

                if (Array.isArray(end))
                {
                    blob[property] = this.interpolationFunction(end, this.value);
                }
                else
                {
                    blob[property] = start + ((end - start) * this.value);
                }
            }

            data.push(blob);

            if ((!this.parent.reverse && this.percent === 1) || (this.parent.reverse && this.percent === 0))
            {
                complete = true;
            }

        } while (!complete);

        if (this.yoyo)
        {
            var reversed = data.slice();
            reversed.reverse();
            data = data.concat(reversed);
        }

        return data;

    },

    /**
    * Checks if this Tween is meant to repeat or yoyo and handles doing so.
    *
    * @private
    * @method Phaser.TweenData#repeat
    * @return {number} Either Phaser.TweenData.LOOPED or Phaser.TweenData.COMPLETE.
    */
    repeat: function () {

        //  If not a yoyo and repeatCounter = 0 then we're done
        if (this.yoyo)
        {
            //  We're already in reverse mode, which means the yoyo has finished and there's no repeats, so end
            if (this.inReverse && this.repeatCounter === 0)
            {
                //  Restore the properties
                for (var property in this.vStartCache)
                {
                    this.vStart[property] = this.vStartCache[property];
                    this.vEnd[property] = this.vEndCache[property];
                }

                this.inReverse = false;

                return Phaser.TweenData.COMPLETE;
            }

            this.inReverse = !this.inReverse;
        }
        else
        {
            if (this.repeatCounter === 0)
            {
                return Phaser.TweenData.COMPLETE;
            }
        }

        if (this.inReverse)
        {
            //  If inReverse we're going from vEnd to vStartCache
            for (var property in this.vStartCache)
            {
                this.vStart[property] = this.vEndCache[property];
                this.vEnd[property] = this.vStartCache[property];
            }
        }
        else
        {
            //  If not inReverse we're just repopulating the cache again
            for (var property in this.vStartCache)
            {
                this.vStart[property] = this.vStartCache[property];
                this.vEnd[property] = this.vEndCache[property];
            }

            //  -1 means repeat forever, otherwise decrement the repeatCounter
            //  We only decrement this counter if the tween isn't doing a yoyo, as that doesn't count towards the repeat total
            if (this.repeatCounter > 0)
            {
                this.repeatCounter--;
            }
        }

        this.startTime = this.game.time.time;

        if (this.yoyo && this.inReverse)
        {
            this.startTime += this.yoyoDelay;
        }
        else if (!this.inReverse)
        {
            this.startTime += this.repeatDelay;
        }

        if (this.parent.reverse)
        {
            this.dt = this.duration;
        }
        else
        {
            this.dt = 0;
        }

        return Phaser.TweenData.LOOPED;

    }

};

Phaser.TweenData.prototype.constructor = Phaser.TweenData;

/* jshint curly: false */

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A collection of easing methods defining ease-in and ease-out curves.
*
* @class Phaser.Easing
*/
Phaser.Easing = {

    /**
    * Linear easing.
    *
    * @class Phaser.Easing.Linear
    */
    Linear: {

        /**
        * Linear Easing (no variation).
        *
        * @method Phaser.Easing.Linear#None
        * @param {number} k - The value to be tweened.
        * @returns {number} k.
        */
        None: function ( k ) {

            return k;

        }

    },

    /**
    * Quadratic easing.
    *
    * @class Phaser.Easing.Quadratic
    */
    Quadratic: {

        /**
        * Ease-in.
        *
        * @method Phaser.Easing.Quadratic#In
        * @param {number} k - The value to be tweened.
        * @returns {number} k^2.
        */
        In: function ( k ) {

            return k * k;

        },

        /**
        * Ease-out.
        *
        * @method Phaser.Easing.Quadratic#Out
        * @param {number} k - The value to be tweened.
        * @returns {number} k* (2-k).
        */
        Out: function ( k ) {

            return k * ( 2 - k );

        },

        /**
        * Ease-in/out.
        *
        * @method Phaser.Easing.Quadratic#InOut
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        InOut: function ( k ) {

            if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
            return - 0.5 * ( --k * ( k - 2 ) - 1 );

        }

    },

    /**
    * Cubic easing.
    *
    * @class Phaser.Easing.Cubic
    */
    Cubic: {

        /**
        * Cubic ease-in.
        *
        * @method Phaser.Easing.Cubic#In
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        In: function ( k ) {

            return k * k * k;

        },

        /**
        * Cubic ease-out.
        *
        * @method Phaser.Easing.Cubic#Out
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        Out: function ( k ) {

            return --k * k * k + 1;

        },

        /**
        * Cubic ease-in/out.
        *
        * @method Phaser.Easing.Cubic#InOut
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        InOut: function ( k ) {

            if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
            return 0.5 * ( ( k -= 2 ) * k * k + 2 );

        }

    },

    /**
    * Quartic easing.
    *
    * @class Phaser.Easing.Quartic
    */
    Quartic: {

        /**
        * Quartic ease-in.
        *
        * @method Phaser.Easing.Quartic#In
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        In: function ( k ) {

            return k * k * k * k;

        },

        /**
        * Quartic ease-out.
        *
        * @method Phaser.Easing.Quartic#Out
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        Out: function ( k ) {

            return 1 - ( --k * k * k * k );

        },

        /**
        * Quartic ease-in/out.
        *
        * @method Phaser.Easing.Quartic#InOut
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        InOut: function ( k ) {

            if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
            return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

        }

    },

    /**
    * Quintic easing.
    *
    * @class Phaser.Easing.Quintic
    */
    Quintic: {

        /**
        * Quintic ease-in.
        *
        * @method Phaser.Easing.Quintic#In
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        In: function ( k ) {

            return k * k * k * k * k;

        },

        /**
        * Quintic ease-out.
        *
        * @method Phaser.Easing.Quintic#Out
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        Out: function ( k ) {

            return --k * k * k * k * k + 1;

        },

        /**
        * Quintic ease-in/out.
        *
        * @method Phaser.Easing.Quintic#InOut
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        InOut: function ( k ) {

            if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
            return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

        }

    },

    /**
    * Sinusoidal easing.
    *
    * @class Phaser.Easing.Sinusoidal
    */
    Sinusoidal: {

        /**
        * Sinusoidal ease-in.
        *
        * @method Phaser.Easing.Sinusoidal#In
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        In: function ( k ) {

            if (k === 0) return 0;
            if (k === 1) return 1;
            return 1 - Math.cos( k * Math.PI / 2 );

        },

        /**
        * Sinusoidal ease-out.
        *
        * @method Phaser.Easing.Sinusoidal#Out
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        Out: function ( k ) {

            if (k === 0) return 0;
            if (k === 1) return 1;
            return Math.sin( k * Math.PI / 2 );

        },

        /**
        * Sinusoidal ease-in/out.
        *
        * @method Phaser.Easing.Sinusoidal#InOut
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        InOut: function ( k ) {

            if (k === 0) return 0;
            if (k === 1) return 1;
            return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

        }

    },

    /**
    * Exponential easing.
    *
    * @class Phaser.Easing.Exponential
    */
    Exponential: {

        /**
        * Exponential ease-in.
        *
        * @method Phaser.Easing.Exponential#In
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        In: function ( k ) {

            return k === 0 ? 0 : Math.pow( 1024, k - 1 );

        },

        /**
        * Exponential ease-out.
        *
        * @method Phaser.Easing.Exponential#Out
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        Out: function ( k ) {

            return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

        },

        /**
        * Exponential ease-in/out.
        *
        * @method Phaser.Easing.Exponential#InOut
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        InOut: function ( k ) {

            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
            return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

        }

    },

    /**
    * Circular easing.
    *
    * @class Phaser.Easing.Circular
    */
    Circular: {

        /**
        * Circular ease-in.
        *
        * @method Phaser.Easing.Circular#In
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        In: function ( k ) {

            return 1 - Math.sqrt( 1 - k * k );

        },

        /**
        * Circular ease-out.
        *
        * @method Phaser.Easing.Circular#Out
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        Out: function ( k ) {

            return Math.sqrt( 1 - ( --k * k ) );

        },

        /**
        * Circular ease-in/out.
        *
        * @method Phaser.Easing.Circular#InOut
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        InOut: function ( k ) {

            if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
            return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

        }

    },

    /**
    * Elastic easing.
    *
    * @class Phaser.Easing.Elastic
    */
    Elastic: {

        /**
        * Elastic ease-in.
        *
        * @method Phaser.Easing.Elastic#In
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        In: function ( k ) {

            var s, a = 0.1, p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
            else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

        },

        /**
        * Elastic ease-out.
        *
        * @method Phaser.Easing.Elastic#Out
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        Out: function ( k ) {

            var s, a = 0.1, p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
            else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

        },

        /**
        * Elastic ease-in/out.
        *
        * @method Phaser.Easing.Elastic#InOut
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        InOut: function ( k ) {

            var s, a = 0.1, p = 0.4;
            if ( k === 0 ) return 0;
            if ( k === 1 ) return 1;
            if ( !a || a < 1 ) { a = 1; s = p / 4; }
            else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
            if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
            return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

        }

    },

    /**
    * Back easing.
    *
    * @class Phaser.Easing.Back
    */
    Back: {

        /**
        * Back ease-in.
        *
        * @method Phaser.Easing.Back#In
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        In: function ( k ) {

            var s = 1.70158;
            return k * k * ( ( s + 1 ) * k - s );

        },

        /**
        * Back ease-out.
        *
        * @method Phaser.Easing.Back#Out
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        Out: function ( k ) {

            var s = 1.70158;
            return --k * k * ( ( s + 1 ) * k + s ) + 1;

        },

        /**
        * Back ease-in/out.
        *
        * @method Phaser.Easing.Back#InOut
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        InOut: function ( k ) {

            var s = 1.70158 * 1.525;
            if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
            return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

        }

    },

    /**
    * Bounce easing.
    *
    * @class Phaser.Easing.Bounce
    */
    Bounce: {

        /**
        * Bounce ease-in.
        *
        * @method Phaser.Easing.Bounce#In
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        In: function ( k ) {

            return 1 - Phaser.Easing.Bounce.Out( 1 - k );

        },

        /**
        * Bounce ease-out.
        *
        * @method Phaser.Easing.Bounce#Out
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        Out: function ( k ) {

            if ( k < ( 1 / 2.75 ) ) {

                return 7.5625 * k * k;

            } else if ( k < ( 2 / 2.75 ) ) {

                return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

            } else if ( k < ( 2.5 / 2.75 ) ) {

                return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

            } else {

                return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

            }

        },

        /**
        * Bounce ease-in/out.
        *
        * @method Phaser.Easing.Bounce#InOut
        * @param {number} k - The value to be tweened.
        * @returns {number} The tweened value.
        */
        InOut: function ( k ) {

            if ( k < 0.5 ) return Phaser.Easing.Bounce.In( k * 2 ) * 0.5;
            return Phaser.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

        }

    }

};

Phaser.Easing.Default = Phaser.Easing.Linear.None;
Phaser.Easing.Power0 = Phaser.Easing.Linear.None;
Phaser.Easing.Power1 = Phaser.Easing.Quadratic.Out;
Phaser.Easing.Power2 = Phaser.Easing.Cubic.Out;
Phaser.Easing.Power3 = Phaser.Easing.Quartic.Out;
Phaser.Easing.Power4 = Phaser.Easing.Quintic.Out;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* This is the core internal game clock.
*
* It manages the elapsed time and calculation of elapsed values, used for game object motion and tweens,
* and also handles the standard Timer pool.
*
* To create a general timed event, use the master {@link Phaser.Timer} accessible through {@link Phaser.Time.events events}.
*
* There are different *types* of time in Phaser:
*
* - ***Game time*** always runs at the speed of time in real life.
*
*   Unlike wall-clock time, *game time stops when Phaser is paused*.
*
*   Game time is used for {@link Phaser.Timer timer events}.
*
* - ***Physics time*** represents the amount of time given to physics calculations.
*
*   *When {@link #slowMotion} is in effect physics time runs slower than game time.*
*   Like game time, physics time stops when Phaser is paused.
*
*   Physics time is used for physics calculations and {@link Phaser.Tween tweens}.
*
* - {@link https://en.wikipedia.org/wiki/Wall-clock_time ***Wall-clock time***} represents the duration between two events in real life time.
*
*   This time is independent of Phaser and always progresses, regardless of if Phaser is paused.
*
* @class Phaser.Time
* @constructor
* @param {Phaser.Game} game A reference to the currently running game.
*/
Phaser.Time = function (game) {

    /**
    * @property {Phaser.Game} game - Local reference to game.
    * @protected
    */
    this.game = game;

    /**
    * The `Date.now()` value when the time was last updated.
    * @property {integer} time
    * @protected
    */
    this.time = 0;

    /**
    * The `now` when the previous update occurred.
    * @property {number} prevTime
    * @protected
    */
    this.prevTime = 0;

    /**
    * An increasing value representing cumulative milliseconds since an undisclosed epoch.
    *
    * While this value is in milliseconds and can be used to compute time deltas,
    * it must must _not_ be used with `Date.now()` as it may not use the same epoch / starting reference.
    *
    * The source may either be from a high-res source (eg. if RAF is available) or the standard Date.now;
    * the value can only be relied upon within a particular game instance.
    *
    * @property {number} now
    * @protected
    */
    this.now = 0;

    /**
    * Elapsed time since the last time update, in milliseconds, based on `now`.
    *
    * This value _may_ include time that the game is paused/inactive.
    *
    * _Note:_ This is updated only once per game loop - even if multiple logic update steps are done.
    * Use {@link Phaser.Timer#physicsTime physicsTime} as a basis of game/logic calculations instead.
    *
    * @property {number} elapsed
    * @see Phaser.Time.time
    * @protected
    */
    this.elapsed = 0;

    /**
    * The time in ms since the last time update, in milliseconds, based on `time`.
    *
    * This value is corrected for game pauses and will be "about zero" after a game is resumed.
    *
    * _Note:_ This is updated once per game loop - even if multiple logic update steps are done.
    * Use {@link Phaser.Timer#physicsTime physicsTime} as a basis of game/logic calculations instead.
    *
    * @property {integer} elapsedMS
    * @protected
    */
    this.elapsedMS = 0;

    /**
    * The physics update delta, in fractional seconds.
    *
    * This should be used as an applicable multiplier by all logic update steps (eg. `preUpdate/postUpdate/update`)
    * to ensure consistent game timing. Game/logic timing can drift from real-world time if the system
    * is unable to consistently maintain the desired FPS.
    *
    * With fixed-step updates this is normally equivalent to `1.0 / desiredFps`.
    *
    * @property {number} physicsElapsed
    */
    this.physicsElapsed = 1 / 60;

    /**
    * The physics update delta, in milliseconds - equivalent to `physicsElapsed * 1000`.
    *
    * @property {number} physicsElapsedMS
    */
    this.physicsElapsedMS = (1 / 60) * 1000;

    /**
    * The desiredFps multiplier as used by Game.update.
    * @property {integer} desiredFpsMult
    * @protected
    */
    this.desiredFpsMult = 1.0 / 60;

    /**
    * The desired frame rate of the game.
    *
    * This is used is used to calculate the physic/logic multiplier and how to apply catch-up logic updates.
    *
    * @property {number} _desiredFps
    * @private
    * @default
    */
    this._desiredFps = 60;

    /**
    * The suggested frame rate for your game, based on an averaged real frame rate.
    * This value is only populated if `Time.advancedTiming` is enabled.
    *
    * _Note:_ This is not available until after a few frames have passed; until then
    * it's set to the same value as desiredFps.
    *
    * @property {number} suggestedFps
    * @default
    */
    this.suggestedFps = this.desiredFps;

    /**
    * Scaling factor to make the game move smoothly in slow motion
    * - 1.0 = normal speed
    * - 2.0 = half speed
    * @property {number} slowMotion
    * @default
    */
    this.slowMotion = 1.0;

    /**
    * If true then advanced profiling, including the fps rate, fps min/max, suggestedFps and msMin/msMax are updated.
    * @property {boolean} advancedTiming
    * @default
    */
    this.advancedTiming = false;

    /**
    * Advanced timing result: The number of render frames record in the last second.
    *
    * Only calculated if {@link Phaser.Time#advancedTiming advancedTiming} is enabled.
    * @property {integer} frames
    * @readonly
    */
    this.frames = 0;

    /**
    * Advanced timing result: Frames per second.
    *
    * Only calculated if {@link Phaser.Time#advancedTiming advancedTiming} is enabled.
    * @property {number} fps
    * @readonly
    */
    this.fps = 0;

    /**
    * Advanced timing result: The lowest rate the fps has dropped to.
    *
    * Only calculated if {@link Phaser.Time#advancedTiming advancedTiming} is enabled.
    * This value can be manually reset.
    * @property {number} fpsMin
    */
    this.fpsMin = 1000;

    /**
    * Advanced timing result: The highest rate the fps has reached (usually no higher than 60fps).
    *
    * Only calculated if {@link Phaser.Time#advancedTiming advancedTiming} is enabled.
    * This value can be manually reset.
    * @property {number} fpsMax
    */
    this.fpsMax = 0;

    /**
    * Advanced timing result: The minimum amount of time the game has taken between consecutive frames.
    *
    * Only calculated if {@link Phaser.Time#advancedTiming advancedTiming} is enabled.
    * This value can be manually reset.
    * @property {number} msMin
    * @default
    */
    this.msMin = 1000;

    /**
    * Advanced timing result: The maximum amount of time the game has taken between consecutive frames.
    *
    * Only calculated if {@link Phaser.Time#advancedTiming advancedTiming} is enabled.
    * This value can be manually reset.
    * @property {number} msMax
    */
    this.msMax = 0;

    /**
    * Records how long the game was last paused, in milliseconds.
    * (This is not updated until the game is resumed.)
    * @property {number} pauseDuration
    */
    this.pauseDuration = 0;

    /**
    * @property {number} timeToCall - The value that setTimeout needs to work out when to next update
    * @protected
    */
    this.timeToCall = 0;

    /**
    * @property {number} timeExpected - The time when the next call is expected when using setTimer to control the update loop
    * @protected
    */
    this.timeExpected = 0;

    /**
    * A {@link Phaser.Timer} object bound to the master clock (this Time object) which events can be added to.
    * @property {Phaser.Timer} events
    */
    this.events = new Phaser.Timer(this.game, false);

    /**
    * @property {number} _frameCount - count the number of calls to time.update since the last suggestedFps was calculated
    * @private
    */
    this._frameCount = 0;

    /**
    * @property {number} _elapsedAcumulator - sum of the elapsed time since the last suggestedFps was calculated
    * @private
    */
    this._elapsedAccumulator = 0;

    /**
    * @property {number} _started - The time at which the Game instance started.
    * @private
    */
    this._started = 0;

    /**
    * @property {number} _timeLastSecond - The time (in ms) that the last second counter ticked over.
    * @private
    */
    this._timeLastSecond = 0;

    /**
    * @property {number} _pauseStarted - The time the game started being paused.
    * @private
    */
    this._pauseStarted = 0;

    /**
    * @property {boolean} _justResumed - Internal value used to recover from the game pause state.
    * @private
    */
    this._justResumed = false;

    /**
    * @property {Phaser.Timer[]} _timers - Internal store of Phaser.Timer objects.
    * @private
    */
    this._timers = [];

};

Phaser.Time.prototype = {

    /**
    * Called automatically by Phaser.Game after boot. Should not be called directly.
    *
    * @method Phaser.Time#boot
    * @protected
    */
    boot: function () {

        this._started = Date.now();
        this.time = Date.now();
        this.events.start();
        this.timeExpected = this.time;

    },

    /**
    * Adds an existing Phaser.Timer object to the Timer pool.
    *
    * @method Phaser.Time#add
    * @param {Phaser.Timer} timer - An existing Phaser.Timer object.
    * @return {Phaser.Timer} The given Phaser.Timer object.
    */
    add: function (timer) {

        this._timers.push(timer);

        return timer;

    },

    /**
    * Creates a new stand-alone Phaser.Timer object.
    *
    * @method Phaser.Time#create
    * @param {boolean} [autoDestroy=true] - A Timer that is set to automatically destroy itself will do so after all of its events have been dispatched (assuming no looping events).
    * @return {Phaser.Timer} The Timer object that was created.
    */
    create: function (autoDestroy) {

        if (autoDestroy === undefined) { autoDestroy = true; }

        var timer = new Phaser.Timer(this.game, autoDestroy);

        this._timers.push(timer);

        return timer;

    },

    /**
    * Remove all Timer objects, regardless of their state and clears all Timers from the {@link Phaser.Time#events events} timer.
    *
    * @method Phaser.Time#removeAll
    */
    removeAll: function () {

        for (var i = 0; i < this._timers.length; i++)
        {
            this._timers[i].destroy();
        }

        this._timers = [];

        this.events.removeAll();

    },

    /**
    * Refreshes the Time.time and Time.elapsedMS properties from the system clock.
    *
    * @method Phaser.Time#refresh
    */
    refresh: function () {

        //  Set to the old Date.now value
        var previousDateNow = this.time;

        // this.time always holds a Date.now value
        this.time = Date.now();

        //  Adjust accordingly.
        this.elapsedMS = this.time - previousDateNow;

    },

    /**
    * Updates the game clock and if enabled the advanced timing data. This is called automatically by Phaser.Game.
    *
    * @method Phaser.Time#update
    * @protected
    * @param {number} time - The current relative timestamp; see {@link Phaser.Time#now now}.
    */
    update: function (time) {

        //  Set to the old Date.now value
        var previousDateNow = this.time;

        // this.time always holds a Date.now value
        this.time = Date.now();

        //  Adjust accordingly.
        this.elapsedMS = this.time - previousDateNow;

        // 'now' is currently still holding the time of the last call, move it into prevTime
        this.prevTime = this.now;

        // update 'now' to hold the current time
        // this.now may hold the RAF high resolution time value if RAF is available (otherwise it also holds Date.now)
        this.now = time;

        // elapsed time between previous call and now - this could be a high resolution value
        this.elapsed = this.now - this.prevTime;

        if (this.game.raf._isSetTimeOut)
        {
            // console.log('Time isSet', this._desiredFps, 'te', this.timeExpected, 'time', time);

            // time to call this function again in ms in case we're using timers instead of RequestAnimationFrame to update the game
            this.timeToCall = Math.floor(Math.max(0, (1000.0 / this._desiredFps) - (this.timeExpected - time)));

            // time when the next call is expected if using timers
            this.timeExpected = time + this.timeToCall;

            // console.log('Time expect', this.timeExpected);
        }

        if (this.advancedTiming)
        {
            this.updateAdvancedTiming();
        }

        //  Paused but still running?
        if (!this.game.paused)
        {
            //  Our internal Phaser.Timer
            this.events.update(this.time);

            if (this._timers.length)
            {
                this.updateTimers();
            }
        }

    },

    /**
    * Handles the updating of the Phaser.Timers (if any)
    * Called automatically by Time.update.
    *
    * @method Phaser.Time#updateTimers
    * @private
    */
    updateTimers: function () {

        //  Any game level timers
        var i = 0;
        var len = this._timers.length;

        while (i < len)
        {
            if (this._timers[i].update(this.time))
            {
                i++;
            }
            else
            {
                //  Timer requests to be removed
                this._timers.splice(i, 1);
                len--;
            }
        }

    },

    /**
    * Handles the updating of the advanced timing values (if enabled)
    * Called automatically by Time.update.
    *
    * @method Phaser.Time#updateAdvancedTiming
    * @private
    */
    updateAdvancedTiming: function () {

        // count the number of time.update calls
        this._frameCount++;
        this._elapsedAccumulator += this.elapsed;

        // occasionally recalculate the suggestedFps based on the accumulated elapsed time
        if (this._frameCount >= this._desiredFps * 2)
        {
            // this formula calculates suggestedFps in multiples of 5 fps
            this.suggestedFps = Math.floor(200 / (this._elapsedAccumulator / this._frameCount)) * 5;
            this._frameCount = 0;
            this._elapsedAccumulator = 0;
        }

        this.msMin = Math.min(this.msMin, this.elapsed);
        this.msMax = Math.max(this.msMax, this.elapsed);

        this.frames++;

        if (this.now > this._timeLastSecond + 1000)
        {
            this.fps = Math.round((this.frames * 1000) / (this.now - this._timeLastSecond));
            this.fpsMin = Math.min(this.fpsMin, this.fps);
            this.fpsMax = Math.max(this.fpsMax, this.fps);
            this._timeLastSecond = this.now;
            this.frames = 0;
        }

    },

    /**
    * Called when the game enters a paused state.
    *
    * @method Phaser.Time#gamePaused
    * @private
    */
    gamePaused: function () {

        this._pauseStarted = Date.now();

        this.events.pause();

        var i = this._timers.length;

        while (i--)
        {
            this._timers[i]._pause();
        }

    },

    /**
    * Called when the game resumes from a paused state.
    *
    * @method Phaser.Time#gameResumed
    * @private
    */
    gameResumed: function () {

        // Set the parameter which stores Date.now() to make sure it's correct on resume
        this.time = Date.now();

        this.pauseDuration = this.time - this._pauseStarted;

        this.events.resume();

        var i = this._timers.length;

        while (i--)
        {
            this._timers[i]._resume();
        }

    },

    /**
    * The number of seconds that have elapsed since the game was started.
    *
    * @method Phaser.Time#totalElapsedSeconds
    * @return {number} The number of seconds that have elapsed since the game was started.
    */
    totalElapsedSeconds: function() {
        return (this.time - this._started) * 0.001;
    },

    /**
    * How long has passed since the given time.
    *
    * @method Phaser.Time#elapsedSince
    * @param {number} since - The time you want to measure against.
    * @return {number} The difference between the given time and now.
    */
    elapsedSince: function (since) {
        return this.time - since;
    },

    /**
    * How long has passed since the given time (in seconds).
    *
    * @method Phaser.Time#elapsedSecondsSince
    * @param {number} since - The time you want to measure (in seconds).
    * @return {number} Duration between given time and now (in seconds).
    */
    elapsedSecondsSince: function (since) {
        return (this.time - since) * 0.001;
    },

    /**
    * Resets the private _started value to now and removes all currently running Timers.
    *
    * @method Phaser.Time#reset
    */
    reset: function () {

        this._started = this.time;
        this.removeAll();

    }

};

/**
* The desired frame rate of the game.
*
* This is used is used to calculate the physic / logic multiplier and how to apply catch-up logic updates.
* 
* @name Phaser.Time#desiredFps
* @property {integer} desiredFps - The desired frame rate of the game. Defaults to 60.
*/
Object.defineProperty(Phaser.Time.prototype, "desiredFps", {

    get: function () {

        return this._desiredFps;

    },

    set: function (value) {

        this._desiredFps = value;

        //  Set the physics elapsed time... this will always be 1 / this.desiredFps 
        //  because we're using fixed time steps in game.update
        this.physicsElapsed = 1 / value;

        this.physicsElapsedMS = this.physicsElapsed * 1000;

        this.desiredFpsMult = 1.0 / value;

    }

});

Phaser.Time.prototype.constructor = Phaser.Time;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Timer is a way to create and manage {@link Phaser.TimerEvent timer events} that wait for a specific duration and then run a callback.
* Many different timer events, with individual delays, can be added to the same Timer.
*
* All Timer delays are in milliseconds (there are 1000 ms in 1 second); so a delay value of 250 represents a quarter of a second.
*
* Timers are based on real life time, adjusted for game pause durations.
* That is, *timer events are based on elapsed {@link Phaser.Time game time}* and do *not* take physics time or slow motion into account.
*
* @class Phaser.Timer
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {boolean} [autoDestroy=true] - If true, the timer will automatically destroy itself after all the events have been dispatched (assuming no looping events).
*/
Phaser.Timer = function (game, autoDestroy) {

    if (autoDestroy === undefined) { autoDestroy = true; }

    /**
    * @property {Phaser.Game} game - Local reference to game.
    * @protected
    */
    this.game = game;

    /**
    * True if the Timer is actively running.
    *
    * Do not modify this boolean - use {@link Phaser.Timer#pause pause} (and {@link Phaser.Timer#resume resume}) to pause the timer.
    * @property {boolean} running
    * @default
    * @readonly
    */
    this.running = false;

    /**
    * If true, the timer will automatically destroy itself after all the events have been dispatched (assuming no looping events).
    * @property {boolean} autoDestroy
    */
    this.autoDestroy = autoDestroy;

    /**
    * @property {boolean} expired - An expired Timer is one in which all of its events have been dispatched and none are pending.
    * @readonly
    * @default
    */
    this.expired = false;

    /**
    * @property {number} elapsed - Elapsed time since the last frame (in ms).
    * @protected
    */
    this.elapsed = 0;

    /**
    * @property {Phaser.TimerEvent[]} events - An array holding all of this timers Phaser.TimerEvent objects. Use the methods add, repeat and loop to populate it.
    */
    this.events = [];

    /**
    * This signal will be dispatched when this Timer has completed which means that there are no more events in the queue.
    *
    * The signal is supplied with one argument, `timer`, which is this Timer object.
    *
    * @property {Phaser.Signal} onComplete
    */
    this.onComplete = new Phaser.Signal();

    /**
    * @property {number} nextTick - The time the next tick will occur.
    * @readonly
    * @protected
    */
    this.nextTick = 0;

    /**
    * @property {number} timeCap - If the difference in time between two frame updates exceeds this value, the event times are reset to avoid catch-up situations.
    */
    this.timeCap = 1000;

    /**
    * @property {boolean} paused - The paused state of the Timer. You can pause the timer by calling Timer.pause() and Timer.resume() or by the game pausing.
    * @readonly
    * @default
    */
    this.paused = false;

    /**
    * @property {boolean} _codePaused - Was the Timer paused by code or by Game focus loss?
    * @private
    */
    this._codePaused = false;

    /**
    * @property {number} _started - The time at which this Timer instance started running.
    * @private
    * @default
    */
    this._started = 0;

    /**
    * @property {number} _pauseStarted - The time the game started being paused.
    * @private
    */
    this._pauseStarted = 0;

    /**
    * @property {number} _pauseTotal - Total paused time.
    * @private
    */
    this._pauseTotal = 0;

    /**
    * @property {number} _now - The current start-time adjusted time.
    * @private
    */
    this._now = Date.now();

    /**
    * @property {number} _len - Temp. array length variable.
    * @private
    */
    this._len = 0;

    /**
    * @property {number} _marked - Temp. counter variable.
    * @private
    */
    this._marked = 0;

    /**
    * @property {number} _i - Temp. array counter variable.
    * @private
    */
    this._i = 0;

    /**
    * @property {number} _diff - Internal cache var.
    * @private
    */
    this._diff = 0;

    /**
    * @property {number} _newTick - Internal cache var.
    * @private
    */
    this._newTick = 0;

};

/**
* Number of milliseconds in a minute.
* @constant
* @type {integer}
*/
Phaser.Timer.MINUTE = 60000;

/**
* Number of milliseconds in a second.
* @constant
* @type {integer}
*/
Phaser.Timer.SECOND = 1000;

/**
* Number of milliseconds in half a second.
* @constant
* @type {integer}
*/
Phaser.Timer.HALF = 500;

/**
* Number of milliseconds in a quarter of a second.
* @constant
* @type {integer}
*/
Phaser.Timer.QUARTER = 250;

Phaser.Timer.prototype = {

    /**
    * Creates a new TimerEvent on this Timer.
    *
    * Use {@link Phaser.Timer#add}, {@link Phaser.Timer#repeat}, or {@link Phaser.Timer#loop} methods to create a new event.
    *
    * @method Phaser.Timer#create
    * @private
    * @param {integer} delay - The number of milliseconds, in {@link Phaser.Time game time}, before the timer event occurs.
    * @param {boolean} loop - Should the event loop or not?
    * @param {number} repeatCount - The number of times the event will repeat.
    * @param {function} callback - The callback that will be called when the timer event occurs.
    * @param {object} callbackContext - The context in which the callback will be called.
    * @param {any[]} arguments - The values to be sent to your callback function when it is called.
    * @return {Phaser.TimerEvent} The Phaser.TimerEvent object that was created.
    */
    create: function (delay, loop, repeatCount, callback, callbackContext, args) {

        delay = Math.round(delay);

        var tick = delay;

        if (this._now === 0)
        {
            tick += this.game.time.time;
        }
        else
        {
            tick += this._now;
        }

        var event = new Phaser.TimerEvent(this, delay, tick, repeatCount, loop, callback, callbackContext, args);

        this.events.push(event);

        this.order();

        this.expired = false;

        return event;

    },

    /**
    * Adds a new Event to this Timer.
    *
    * The event will fire after the given amount of `delay` in milliseconds has passed, once the Timer has started running.
    * The delay is in relation to when the Timer starts, not the time it was added. If the Timer is already running the delay will be calculated based on the timers current time.
    *
    * Make sure to call {@link Phaser.Timer#start start} after adding all of the Events you require for this Timer.
    *
    * @method Phaser.Timer#add
    * @param {integer} delay - The number of milliseconds, in {@link Phaser.Time game time}, before the timer event occurs.
    * @param {function} callback - The callback that will be called when the timer event occurs.
    * @param {object} callbackContext - The context in which the callback will be called.
    * @param {...*} arguments - Additional arguments that will be supplied to the callback.
    * @return {Phaser.TimerEvent} The Phaser.TimerEvent object that was created.
    */
    add: function (delay, callback, callbackContext) {

        return this.create(delay, false, 0, callback, callbackContext, Array.prototype.slice.call(arguments, 3));

    },

    /**
    * Adds a new TimerEvent that will always play through once and then repeat for the given number of iterations.
    *
    * The event will fire after the given amount of `delay` in milliseconds has passed, once the Timer has started running.
    * The delay is in relation to when the Timer starts, not the time it was added.
    * If the Timer is already running the delay will be calculated based on the timers current time.
    *
    * Make sure to call {@link Phaser.Timer#start start} after adding all of the Events you require for this Timer.
    *
    * @method Phaser.Timer#repeat
    * @param {integer} delay - The number of milliseconds, in {@link Phaser.Time game time}, before the timer event occurs.
    * @param {number} repeatCount - The number of times the event will repeat once is has finished playback. A repeatCount of 1 means it will repeat itself once, playing the event twice in total.
    * @param {function} callback - The callback that will be called when the timer event occurs.
    * @param {object} callbackContext - The context in which the callback will be called.
    * @param {...*} arguments - Additional arguments that will be supplied to the callback.
    * @return {Phaser.TimerEvent} The Phaser.TimerEvent object that was created.
    */
    repeat: function (delay, repeatCount, callback, callbackContext) {

        return this.create(delay, false, repeatCount, callback, callbackContext, Array.prototype.slice.call(arguments, 4));

    },

    /**
    * Adds a new looped Event to this Timer that will repeat forever or until the Timer is stopped.
    *
    * The event will fire after the given amount of `delay` in milliseconds has passed, once the Timer has started running.
    * The delay is in relation to when the Timer starts, not the time it was added. If the Timer is already running the delay will be calculated based on the timers current time.
    *
    * Make sure to call {@link Phaser.Timer#start start} after adding all of the Events you require for this Timer.
    *
    * @method Phaser.Timer#loop
    * @param {integer} delay - The number of milliseconds, in {@link Phaser.Time game time}, before the timer event occurs.
    * @param {function} callback - The callback that will be called when the timer event occurs.
    * @param {object} callbackContext - The context in which the callback will be called.
    * @param {...*} arguments - Additional arguments that will be supplied to the callback.
    * @return {Phaser.TimerEvent} The Phaser.TimerEvent object that was created.
    */
    loop: function (delay, callback, callbackContext) {

        return this.create(delay, true, 0, callback, callbackContext, Array.prototype.slice.call(arguments, 3));

    },

    /**
    * Starts this Timer running.
    * @method Phaser.Timer#start
    * @param {integer} [delay=0] - The number of milliseconds, in {@link Phaser.Time game time}, that should elapse before the Timer will start.
    */
    start: function (delay) {

        if (this.running)
        {
            return;
        }

        this._started = this.game.time.time + (delay || 0);

        this.running = true;

        for (var i = 0; i < this.events.length; i++)
        {
            this.events[i].tick = this.events[i].delay + this._started;
        }

    },

    /**
    * Stops this Timer from running. Does not cause it to be destroyed if autoDestroy is set to true.
    * @method Phaser.Timer#stop
    * @param {boolean} [clearEvents=true] - If true all the events in Timer will be cleared, otherwise they will remain.
    */
    stop: function (clearEvents) {

        this.running = false;

        if (clearEvents === undefined) { clearEvents = true; }

        if (clearEvents)
        {
            this.events.length = 0;
        }

    },

    /**
    * Removes a pending TimerEvent from the queue.
    * @param {Phaser.TimerEvent} event - The event to remove from the queue.
    * @method Phaser.Timer#remove
    */
    remove: function (event) {

        for (var i = 0; i < this.events.length; i++)
        {
            if (this.events[i] === event)
            {
                this.events[i].pendingDelete = true;
                return true;
            }
        }

        return false;

    },

    /**
    * Orders the events on this Timer so they are in tick order.
    * This is called automatically when new events are created.
    * @method Phaser.Timer#order
    * @protected
    */
    order: function () {

        if (this.events.length > 0)
        {
            //  Sort the events so the one with the lowest tick is first
            this.events.sort(this.sortHandler);

            this.nextTick = this.events[0].tick;
        }

    },

    /**
    * Sort handler used by Phaser.Timer.order.
    * @method Phaser.Timer#sortHandler
    * @private
    */
    sortHandler: function (a, b) {

        if (a.tick < b.tick)
        {
            return -1;
        }
        else if (a.tick > b.tick)
        {
            return 1;
        }

        return 0;

    },

    /**
    * Clears any events from the Timer which have pendingDelete set to true and then resets the private _len and _i values.
    *
    * @method Phaser.Timer#clearPendingEvents
    * @protected
    */
    clearPendingEvents: function () {

        this._i = this.events.length;

        while (this._i--)
        {
            if (this.events[this._i].pendingDelete)
            {
                this.events.splice(this._i, 1);
            }
        }

        this._len = this.events.length;
        this._i = 0;

    },

    /**
    * The main Timer update event, called automatically by Phaser.Time.update.
    *
    * @method Phaser.Timer#update
    * @protected
    * @param {number} time - The time from the core game clock.
    * @return {boolean} True if there are still events waiting to be dispatched, otherwise false if this Timer can be destroyed.
    */
    update: function (time) {

        if (this.paused)
        {
            return true;
        }

        this.elapsed = time - this._now;
        this._now = time;

        //  spike-dislike
        if (this.elapsed > this.timeCap)
        {
            //  For some reason the time between now and the last time the game was updated was larger than our timeCap.
            //  This can happen if the Stage.disableVisibilityChange is true and you swap tabs, which makes the raf pause.
            //  In this case we need to adjust the TimerEvents and nextTick.
            this.adjustEvents(time - this.elapsed);
        }

        this._marked = 0;

        //  Clears events marked for deletion and resets _len and _i to 0.
        this.clearPendingEvents();

        if (this.running && this._now >= this.nextTick && this._len > 0)
        {
            while (this._i < this._len && this.running)
            {
                if (this._now >= this.events[this._i].tick && !this.events[this._i].pendingDelete)
                {
                    //  (now + delay) - (time difference from last tick to now)
                    this._newTick = (this._now + this.events[this._i].delay) - (this._now - this.events[this._i].tick);

                    if (this._newTick < 0)
                    {
                        this._newTick = this._now + this.events[this._i].delay;
                    }

                    if (this.events[this._i].loop === true)
                    {
                        this.events[this._i].tick = this._newTick;
                        this.events[this._i].callback.apply(this.events[this._i].callbackContext, this.events[this._i].args);
                    }
                    else if (this.events[this._i].repeatCount > 0)
                    {
                        this.events[this._i].repeatCount--;
                        this.events[this._i].tick = this._newTick;
                        this.events[this._i].callback.apply(this.events[this._i].callbackContext, this.events[this._i].args);
                    }
                    else
                    {
                        this._marked++;
                        this.events[this._i].pendingDelete = true;
                        this.events[this._i].callback.apply(this.events[this._i].callbackContext, this.events[this._i].args);
                    }

                    this._i++;
                }
                else
                {
                    break;
                }
            }

            //  Are there any events left?
            if (this.events.length > this._marked)
            {
                this.order();
            }
            else
            {
                this.expired = true;
                this.onComplete.dispatch(this);
            }
        }

        if (this.expired && this.autoDestroy)
        {
            return false;
        }
        else
        {
            return true;
        }

    },

    /**
    * Pauses the Timer and all events in the queue.
    * @method Phaser.Timer#pause
    */
    pause: function () {

        if (!this.running)
        {
            return;
        }

        this._codePaused = true;

        if (this.paused)
        {
            return;
        }

        this._pauseStarted = this.game.time.time;

        this.paused = true;

    },

    /**
    * Internal pause/resume control - user code should use Timer.pause instead.
    * @method Phaser.Timer#_pause
    * @private
    */
    _pause: function () {

        if (this.paused || !this.running)
        {
            return;
        }

        this._pauseStarted = this.game.time.time;

        this.paused = true;

    },

    /**
    * Adjusts the time of all pending events and the nextTick by the given baseTime.
    *
    * @method Phaser.Timer#adjustEvents
    * @protected
    */
    adjustEvents: function (baseTime) {

        for (var i = 0; i < this.events.length; i++)
        {
            if (!this.events[i].pendingDelete)
            {
                //  Work out how long there would have been from when the game paused until the events next tick
                var t = this.events[i].tick - baseTime;

                if (t < 0)
                {
                    t = 0;
                }

                //  Add the difference on to the time now
                this.events[i].tick = this._now + t;
            }
        }

        var d = this.nextTick - baseTime;

        if (d < 0)
        {
            this.nextTick = this._now;
        }
        else
        {
            this.nextTick = this._now + d;
        }

    },

    /**
    * Resumes the Timer and updates all pending events.
    *
    * @method Phaser.Timer#resume
    */
    resume: function () {

        if (!this.paused)
        {
            return;
        }

        var now = this.game.time.time;
        this._pauseTotal += now - this._now;
        this._now = now;

        this.adjustEvents(this._pauseStarted);

        this.paused = false;
        this._codePaused = false;

    },

    /**
    * Internal pause/resume control - user code should use Timer.resume instead.
    * @method Phaser.Timer#_resume
    * @private
    */
    _resume: function () {

        if (this._codePaused)
        {
            return;
        }
        else
        {
            this.resume();
        }

    },

    /**
    * Removes all Events from this Timer and all callbacks linked to onComplete, but leaves the Timer running.    
    * The onComplete callbacks won't be called.
    *
    * @method Phaser.Timer#removeAll
    */
    removeAll: function () {

        this.onComplete.removeAll();
        this.events.length = 0;
        this._len = 0;
        this._i = 0;

    },

    /**
    * Destroys this Timer. Any pending Events are not dispatched.
    * The onComplete callbacks won't be called.
    *
    * @method Phaser.Timer#destroy
    */
    destroy: function () {

        this.onComplete.removeAll();
        this.running = false;
        this.events = [];
        this._len = 0;
        this._i = 0;

    }

};

/**
* @name Phaser.Timer#next
* @property {number} next - The time at which the next event will occur.
* @readonly
*/
Object.defineProperty(Phaser.Timer.prototype, "next", {

    get: function () {
        return this.nextTick;
    }

});

/**
* @name Phaser.Timer#duration
* @property {number} duration - The duration in ms remaining until the next event will occur.
* @readonly
*/
Object.defineProperty(Phaser.Timer.prototype, "duration", {

    get: function () {

        if (this.running && this.nextTick > this._now)
        {
            return this.nextTick - this._now;
        }
        else
        {
            return 0;
        }

    }

});

/**
* @name Phaser.Timer#length
* @property {number} length - The number of pending events in the queue.
* @readonly
*/
Object.defineProperty(Phaser.Timer.prototype, "length", {

    get: function () {
        return this.events.length;
    }

});

/**
* @name Phaser.Timer#ms
* @property {number} ms - The duration in milliseconds that this Timer has been running for.
* @readonly
*/
Object.defineProperty(Phaser.Timer.prototype, "ms", {

    get: function () {

        if (this.running)
        {
            return this._now - this._started - this._pauseTotal;
        }
        else
        {
            return 0;
        }

    }

});

/**
* @name Phaser.Timer#seconds
* @property {number} seconds - The duration in seconds that this Timer has been running for.
* @readonly
*/
Object.defineProperty(Phaser.Timer.prototype, "seconds", {

    get: function () {

        if (this.running)
        {
            return this.ms * 0.001;
        }
        else
        {
            return 0;
        }

    }

});

Phaser.Timer.prototype.constructor = Phaser.Timer;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A TimerEvent is a single event that is processed by a Phaser.Timer.
*
* It consists of a delay, which is a value in milliseconds after which the event will fire.
* When the event fires it calls a specific callback with the specified arguments.
* 
* TimerEvents are removed by their parent timer once finished firing or repeating.
* 
* Use {@link Phaser.Timer#add}, {@link Phaser.Timer#repeat}, or {@link Phaser.Timer#loop} methods to create a new event.
*
* @class Phaser.TimerEvent
* @constructor
* @param {Phaser.Timer} timer - The Timer object that this TimerEvent belongs to.
* @param {number} delay - The delay in ms at which this TimerEvent fires.
* @param {number} tick - The tick is the next game clock time that this event will fire at.
* @param {number} repeatCount - If this TimerEvent repeats it will do so this many times.
* @param {boolean} loop - True if this TimerEvent loops, otherwise false.
* @param {function} callback - The callback that will be called when the TimerEvent occurs.
* @param {object} callbackContext - The context in which the callback will be called.
* @param {any[]} arguments - Additional arguments to be passed to the callback.
*/
Phaser.TimerEvent = function (timer, delay, tick, repeatCount, loop, callback, callbackContext, args) {

    /**
    * @property {Phaser.Timer} timer - The Timer object that this TimerEvent belongs to.
    * @protected
    * @readonly
    */
    this.timer = timer;

    /**
    * @property {number} delay - The delay in ms at which this TimerEvent fires.
    */
    this.delay = delay;

    /**
    * @property {number} tick - The tick is the next game clock time that this event will fire at.
    */
    this.tick = tick;

    /**
    * @property {number} repeatCount - If this TimerEvent repeats it will do so this many times.
    */
    this.repeatCount = repeatCount - 1;

    /**
    * @property {boolean} loop - True if this TimerEvent loops, otherwise false.
    */
    this.loop = loop;

    /**
    * @property {function} callback - The callback that will be called when the TimerEvent occurs.
    */
    this.callback = callback;

    /**
    * @property {object} callbackContext - The context in which the callback will be called.
    */
    this.callbackContext = callbackContext;

    /**
    * @property {any[]} arguments - Additional arguments to be passed to the callback.
    */
    this.args = args;

    /**
    * @property {boolean} pendingDelete - A flag that controls if the TimerEvent is pending deletion.
    * @protected
    */
    this.pendingDelete = false;

};

Phaser.TimerEvent.prototype.constructor = Phaser.TimerEvent;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Animation Manager is used to add, play and update Phaser Animations.
* Any Game Object such as Phaser.Sprite that supports animation contains a single AnimationManager instance.
*
* @class Phaser.AnimationManager
* @constructor
* @param {Phaser.Sprite} sprite - A reference to the Game Object that owns this AnimationManager.
*/
Phaser.AnimationManager = function (sprite) {

    /**
    * @property {Phaser.Sprite} sprite - A reference to the parent Sprite that owns this AnimationManager.
    */
    this.sprite = sprite;

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = sprite.game;

    /**
    * The currently displayed Frame of animation, if any.
    * This property is only set once an Animation starts playing. Until that point it remains set as `null`.
    * 
    * @property {Phaser.Frame} currentFrame
    * @default
    */
    this.currentFrame = null;

    /**
    * @property {Phaser.Animation} currentAnim - The currently displayed animation, if any.
    * @default
    */
    this.currentAnim = null;

    /**
    * @property {boolean} updateIfVisible - Should the animation data continue to update even if the Sprite.visible is set to false.
    * @default
    */
    this.updateIfVisible = true;

    /**
    * @property {boolean} isLoaded - Set to true once animation data has been loaded.
    * @default
    */
    this.isLoaded = false;

    /**
    * @property {Phaser.FrameData} _frameData - A temp. var for holding the currently playing Animations FrameData.
    * @private
    * @default
    */
    this._frameData = null;

    /**
    * @property {object} _anims - An internal object that stores all of the Animation instances.
    * @private
    */
    this._anims = {};

    /**
    * @property {object} _outputFrames - An internal object to help avoid gc.
    * @private
    */
    this._outputFrames = [];

};

Phaser.AnimationManager.prototype = {

    /**
    * Loads FrameData into the internal temporary vars and resets the frame index to zero.
    * This is called automatically when a new Sprite is created.
    *
    * @method Phaser.AnimationManager#loadFrameData
    * @private
    * @param {Phaser.FrameData} frameData - The FrameData set to load.
    * @param {string|number} frame - The frame to default to.
    * @return {boolean} Returns `true` if the frame data was loaded successfully, otherwise `false`
    */
    loadFrameData: function (frameData, frame) {

        if (frameData === undefined)
        {
            return false;
        }

        if (this.isLoaded)
        {
            //   We need to update the frameData that the animations are using
            for (var anim in this._anims)
            {
                this._anims[anim].updateFrameData(frameData);
            }
        }

        this._frameData = frameData;

        if (frame === undefined || frame === null)
        {
            this.frame = 0;
        }
        else
        {
            if (typeof frame === 'string')
            {
                this.frameName = frame;
            }
            else
            {
                this.frame = frame;
            }
        }

        this.isLoaded = true;

        return true;
    },

    /**
    * Loads FrameData into the internal temporary vars and resets the frame index to zero.
    * This is called automatically when a new Sprite is created.
    *
    * @method Phaser.AnimationManager#copyFrameData
    * @private
    * @param {Phaser.FrameData} frameData - The FrameData set to load.
    * @param {string|number} frame - The frame to default to.
    * @return {boolean} Returns `true` if the frame data was loaded successfully, otherwise `false`
    */
    copyFrameData: function (frameData, frame) {

        this._frameData = frameData.clone();

        if (this.isLoaded)
        {
            //   We need to update the frameData that the animations are using
            for (var anim in this._anims)
            {
                this._anims[anim].updateFrameData(this._frameData);
            }
        }

        if (frame === undefined || frame === null)
        {
            this.frame = 0;
        }
        else
        {
            if (typeof frame === 'string')
            {
                this.frameName = frame;
            }
            else
            {
                this.frame = frame;
            }
        }

        this.isLoaded = true;

        return true;
    },

    /**
    * Adds a new animation under the given key. Optionally set the frames, frame rate and loop.
    * Animations added in this way are played back with the play function.
    *
    * @method Phaser.AnimationManager#add
    * @param {string} name - The unique (within this Sprite) name for the animation, i.e. "run", "fire", "walk".
    * @param {Array} [frames=null] - An array of numbers/strings that correspond to the frames to add to this animation and in which order. e.g. [1, 2, 3] or ['run0', 'run1', run2]). If null then all frames will be used.
    * @param {number} [frameRate=60] - The speed at which the animation should play. The speed is given in frames per second.
    * @param {boolean} [loop=false] - Whether or not the animation is looped or just plays once.
    * @param {boolean} [useNumericIndex=true] - Are the given frames using numeric indexes (default) or strings?
    * @return {Phaser.Animation} The Animation object that was created.
    */
    add: function (name, frames, frameRate, loop, useNumericIndex) {

        frames = frames || [];
        frameRate = frameRate || 60;

        if (loop === undefined) { loop = false; }

        //  If they didn't set the useNumericIndex then let's at least try and guess it
        if (useNumericIndex === undefined)
        {
            if (frames && typeof frames[0] === 'number')
            {
                useNumericIndex = true;
            }
            else
            {
                useNumericIndex = false;
            }
        }

        this._outputFrames = [];

        this._frameData.getFrameIndexes(frames, useNumericIndex, this._outputFrames);

        this._anims[name] = new Phaser.Animation(this.game, this.sprite, name, this._frameData, this._outputFrames, frameRate, loop);

        this.currentAnim = this._anims[name];

        if (this.sprite.tilingTexture)
        {
            this.sprite.refreshTexture = true;
        }

        return this._anims[name];

    },

    /**
    * Check whether the frames in the given array are valid and exist.
    *
    * @method Phaser.AnimationManager#validateFrames
    * @param {Array} frames - An array of frames to be validated.
    * @param {boolean} [useNumericIndex=true] - Validate the frames based on their numeric index (true) or string index (false)
    * @return {boolean} True if all given Frames are valid, otherwise false.
    */
    validateFrames: function (frames, useNumericIndex) {

        if (useNumericIndex === undefined) { useNumericIndex = true; }

        for (var i = 0; i < frames.length; i++)
        {
            if (useNumericIndex === true)
            {
                if (frames[i] > this._frameData.total)
                {
                    return false;
                }
            }
            else
            {
                if (this._frameData.checkFrameName(frames[i]) === false)
                {
                    return false;
                }
            }
        }

        return true;

    },

    /**
    * Play an animation based on the given key. The animation should previously have been added via `animations.add`
    * 
    * If the requested animation is already playing this request will be ignored. 
    * If you need to reset an already running animation do so directly on the Animation object itself.
    *
    * @method Phaser.AnimationManager#play
    * @param {string} name - The name of the animation to be played, e.g. "fire", "walk", "jump".
    * @param {number} [frameRate=null] - The framerate to play the animation at. The speed is given in frames per second. If not provided the previously set frameRate of the Animation is used.
    * @param {boolean} [loop=false] - Should the animation be looped after playback. If not provided the previously set loop value of the Animation is used.
    * @param {boolean} [killOnComplete=false] - If set to true when the animation completes (only happens if loop=false) the parent Sprite will be killed.
    * @return {Phaser.Animation} A reference to playing Animation instance.
    */
    play: function (name, frameRate, loop, killOnComplete) {

        if (this._anims[name])
        {
            if (this.currentAnim === this._anims[name])
            {
                if (this.currentAnim.isPlaying === false)
                {
                    this.currentAnim.paused = false;
                    return this.currentAnim.play(frameRate, loop, killOnComplete);
                }

                return this.currentAnim;
            }
            else
            {
                if (this.currentAnim && this.currentAnim.isPlaying)
                {
                    this.currentAnim.stop();
                }

                this.currentAnim = this._anims[name];
                this.currentAnim.paused = false;
                this.currentFrame = this.currentAnim.currentFrame;
                return this.currentAnim.play(frameRate, loop, killOnComplete);
            }
        }

    },

    /**
    * Stop playback of an animation. If a name is given that specific animation is stopped, otherwise the current animation is stopped.
    * The currentAnim property of the AnimationManager is automatically set to the animation given.
    *
    * @method Phaser.AnimationManager#stop
    * @param {string} [name=null] - The name of the animation to be stopped, e.g. "fire". If none is given the currently running animation is stopped.
    * @param {boolean} [resetFrame=false] - When the animation is stopped should the currentFrame be set to the first frame of the animation (true) or paused on the last frame displayed (false)
    */
    stop: function (name, resetFrame) {

        if (resetFrame === undefined) { resetFrame = false; }

        if (this.currentAnim && (typeof name !== 'string' || name === this.currentAnim.name))
        {
            this.currentAnim.stop(resetFrame);
        }

    },

    /**
    * The main update function is called by the Sprites update loop. It's responsible for updating animation frames and firing related events.
    *
    * @method Phaser.AnimationManager#update
    * @protected
    * @return {boolean} True if a new animation frame has been set, otherwise false.
    */
    update: function () {

        if (this.updateIfVisible && !this.sprite.visible)
        {
            return false;
        }

        if (this.currentAnim && this.currentAnim.update())
        {
            this.currentFrame = this.currentAnim.currentFrame;
            return true;
        }

        return false;

    },

    /**
    * Advances by the given number of frames in the current animation, taking the loop value into consideration.
    *
    * @method Phaser.AnimationManager#next
    * @param {number} [quantity=1] - The number of frames to advance.
    */
    next: function (quantity) {

        if (this.currentAnim)
        {
            this.currentAnim.next(quantity);
            this.currentFrame = this.currentAnim.currentFrame;
        }

    },

    /**
    * Moves backwards the given number of frames in the current animation, taking the loop value into consideration.
    *
    * @method Phaser.AnimationManager#previous
    * @param {number} [quantity=1] - The number of frames to move back.
    */
    previous: function (quantity) {

        if (this.currentAnim)
        {
            this.currentAnim.previous(quantity);
            this.currentFrame = this.currentAnim.currentFrame;
        }

    },

    /**
    * Returns an animation that was previously added by name.
    *
    * @method Phaser.AnimationManager#getAnimation
    * @param {string} name - The name of the animation to be returned, e.g. "fire".
    * @return {Phaser.Animation} The Animation instance, if found, otherwise null.
    */
    getAnimation: function (name) {

        if (typeof name === 'string')
        {
            if (this._anims[name])
            {
                return this._anims[name];
            }
        }

        return null;

    },

    /**
    * Refreshes the current frame data back to the parent Sprite and also resets the texture data.
    *
    * @method Phaser.AnimationManager#refreshFrame
    */
    refreshFrame: function () {

        //  TODO
        // this.sprite.setTexture(PIXI.TextureCache[this.currentFrame.uuid]);

    },

    /**
    * Destroys all references this AnimationManager contains.
    * Iterates through the list of animations stored in this manager and calls destroy on each of them.
    *
    * @method Phaser.AnimationManager#destroy
    */
    destroy: function () {

        var anim = null;

        for (var anim in this._anims)
        {
            if (this._anims.hasOwnProperty(anim))
            {
                this._anims[anim].destroy();
            }
        }

        this._anims = {};
        this._outputFrames = [];
        this._frameData = null;
        this.currentAnim = null;
        this.currentFrame = null;
        this.sprite = null;
        this.game = null;

    }

};

Phaser.AnimationManager.prototype.constructor = Phaser.AnimationManager;

/**
* @name Phaser.AnimationManager#frameData
* @property {Phaser.FrameData} frameData - The current animations FrameData.
* @readonly
*/
Object.defineProperty(Phaser.AnimationManager.prototype, 'frameData', {

    get: function () {
        return this._frameData;
    }

});

/**
* @name Phaser.AnimationManager#frameTotal
* @property {number} frameTotal - The total number of frames in the currently loaded FrameData, or -1 if no FrameData is loaded.
* @readonly
*/
Object.defineProperty(Phaser.AnimationManager.prototype, 'frameTotal', {

    get: function () {

        return this._frameData.total;
    }

});

/**
* @name Phaser.AnimationManager#paused
* @property {boolean} paused - Gets and sets the paused state of the current animation.
*/
Object.defineProperty(Phaser.AnimationManager.prototype, 'paused', {

    get: function () {

        return this.currentAnim.isPaused;

    },

    set: function (value) {

        this.currentAnim.paused = value;

    }

});

/**
* @name Phaser.AnimationManager#name
* @property {string} name - Gets the current animation name, if set.
*/
Object.defineProperty(Phaser.AnimationManager.prototype, 'name', {

    get: function () {

        if (this.currentAnim)
        {
            return this.currentAnim.name;
        }

    }

});

/**
* @name Phaser.AnimationManager#frame
* @property {number} frame - Gets or sets the current frame index and updates the Texture Cache for display.
*/
Object.defineProperty(Phaser.AnimationManager.prototype, 'frame', {

    get: function () {

        if (this.currentFrame)
        {
            return this.currentFrame.index;
        }

    },

    set: function (value) {

        if (typeof value === 'number' && this._frameData && this._frameData.getFrame(value) !== null)
        {
            this.currentFrame = this._frameData.getFrame(value);

            if (this.currentFrame)
            {
                this.sprite.setFrame(this.currentFrame);
            }
        }

    }

});

/**
* @name Phaser.AnimationManager#frameName
* @property {string} frameName - Gets or sets the current frame name and updates the Texture Cache for display.
*/
Object.defineProperty(Phaser.AnimationManager.prototype, 'frameName', {

    get: function () {

        if (this.currentFrame)
        {
            return this.currentFrame.name;
        }

    },

    set: function (value) {

        if (typeof value === 'string' && this._frameData && this._frameData.getFrameByName(value) !== null)
        {
            this.currentFrame = this._frameData.getFrameByName(value);

            if (this.currentFrame)
            {
                this._frameIndex = this.currentFrame.index;

                this.sprite.setFrame(this.currentFrame);
            }
        }
        else
        {
            console.warn('Cannot set frameName: ' + value);
        }
    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* An Animation instance contains a single animation and the controls to play it.
*
* It is created by the AnimationManager, consists of Animation.Frame objects and belongs to a single Game Object such as a Sprite.
*
* @class Phaser.Animation
* @constructor
* @param {Phaser.Game} game - A reference to the currently running game.
* @param {Phaser.Sprite} parent - A reference to the owner of this Animation.
* @param {string} name - The unique name for this animation, used in playback commands.
* @param {Phaser.FrameData} frameData - The FrameData object that contains all frames used by this Animation.
* @param {number[]|string[]} frames - An array of numbers or strings indicating which frames to play in which order.
* @param {number} [frameRate=60] - The speed at which the animation should play. The speed is given in frames per second.
* @param {boolean} [loop=false] - Whether or not the animation is looped or just plays once.
*/
Phaser.Animation = function (game, parent, name, frameData, frames, frameRate, loop) {

    if (loop === undefined) { loop = false; }

    /**
    * @property {Phaser.Game} game - A reference to the currently running Game.
    */
    this.game = game;

    /**
    * @property {Phaser.Sprite} _parent - A reference to the parent Sprite that owns this Animation.
    * @private
    */
    this._parent = parent;

    /**
    * @property {Phaser.FrameData} _frameData - The FrameData the Animation uses.
    * @private
    */
    this._frameData = frameData;

    /**
    * @property {string} name - The user defined name given to this Animation.
    */
    this.name = name;

    /**
    * @property {array} _frames
    * @private
    */
    this._frames = [];
    this._frames = this._frames.concat(frames);

    /**
    * @property {number} delay - The delay in ms between each frame of the Animation, based on the given frameRate.
    */
    this.delay = 1000 / frameRate;

    /**
    * @property {boolean} loop - The loop state of the Animation.
    */
    this.loop = loop;

    /**
    * @property {number} loopCount - The number of times the animation has looped since it was last started.
    */
    this.loopCount = 0;

    /**
    * @property {boolean} killOnComplete - Should the parent of this Animation be killed when the animation completes?
    * @default
    */
    this.killOnComplete = false;

    /**
    * @property {boolean} isFinished - The finished state of the Animation. Set to true once playback completes, false during playback.
    * @default
    */
    this.isFinished = false;

    /**
    * @property {boolean} isPlaying - The playing state of the Animation. Set to false once playback completes, true during playback.
    * @default
    */
    this.isPlaying = false;

    /**
    * @property {boolean} isPaused - The paused state of the Animation.
    * @default
    */
    this.isPaused = false;

    /**
    * @property {boolean} _pauseStartTime - The time the animation paused.
    * @private
    * @default
    */
    this._pauseStartTime = 0;

    /**
    * @property {number} _frameIndex
    * @private
    * @default
    */
    this._frameIndex = 0;

    /**
    * @property {number} _frameDiff
    * @private
    * @default
    */
    this._frameDiff = 0;

    /**
    * @property {number} _frameSkip
    * @private
    * @default
    */
    this._frameSkip = 1;

    /**
    * @property {Phaser.Frame} currentFrame - The currently displayed frame of the Animation.
    */
    this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

    /**
    * @property {Phaser.Signal} onStart - This event is dispatched when this Animation starts playback.
    */
    this.onStart = new Phaser.Signal();

    /**
    * This event is dispatched when the Animation changes frame.
    * By default this event is disabled due to its intensive nature. Enable it with: `Animation.enableUpdate = true`.
    * Note that the event is only dispatched with the current frame. In a low-FPS environment Animations
    * will automatically frame-skip to try and claw back time, so do not base your code on expecting to
    * receive a perfectly sequential set of frames from this event.
    * @property {Phaser.Signal|null} onUpdate
    * @default
    */
    this.onUpdate = null;

    /**
    * @property {Phaser.Signal} onComplete - This event is dispatched when this Animation completes playback. If the animation is set to loop this is never fired, listen for onLoop instead.
    */
    this.onComplete = new Phaser.Signal();

    /**
    * @property {Phaser.Signal} onLoop - This event is dispatched when this Animation loops.
    */
    this.onLoop = new Phaser.Signal();

    /**
     * @property {boolean} isReversed - Indicates if the animation will play backwards.
     * @default
     */
    this.isReversed = false;

    //  Set-up some event listeners
    this.game.onPause.add(this.onPause, this);
    this.game.onResume.add(this.onResume, this);

};

Phaser.Animation.prototype = {

    /**
    * Plays this animation.
    *
    * @method Phaser.Animation#play
    * @param {number} [frameRate=null] - The framerate to play the animation at. The speed is given in frames per second. If not provided the previously set frameRate of the Animation is used.
    * @param {boolean} [loop=false] - Should the animation be looped after playback. If not provided the previously set loop value of the Animation is used.
    * @param {boolean} [killOnComplete=false] - If set to true when the animation completes (only happens if loop=false) the parent Sprite will be killed.
    * @return {Phaser.Animation} - A reference to this Animation instance.
    */
    play: function (frameRate, loop, killOnComplete) {

        if (typeof frameRate === 'number')
        {
            //  If they set a new frame rate then use it, otherwise use the one set on creation
            this.delay = 1000 / frameRate;
        }

        if (typeof loop === 'boolean')
        {
            //  If they set a new loop value then use it, otherwise use the one set on creation
            this.loop = loop;
        }

        if (typeof killOnComplete !== 'undefined')
        {
            //  Remove the parent sprite once the animation has finished?
            this.killOnComplete = killOnComplete;
        }

        this.isPlaying = true;
        this.isFinished = false;
        this.paused = false;
        this.loopCount = 0;

        this._timeLastFrame = this.game.time.time;
        this._timeNextFrame = this.game.time.time + this.delay;

        this._frameIndex = this.isReversed ? this._frames.length - 1 : 0;
        this.updateCurrentFrame(false, true);

        this._parent.events.onAnimationStart$dispatch(this._parent, this);

        this.onStart.dispatch(this._parent, this);

        this._parent.animations.currentAnim = this;
        this._parent.animations.currentFrame = this.currentFrame;

        return this;

    },

    /**
    * Sets this animation back to the first frame and restarts the animation.
    *
    * @method Phaser.Animation#restart
    */
    restart: function () {

        this.isPlaying = true;
        this.isFinished = false;
        this.paused = false;
        this.loopCount = 0;

        this._timeLastFrame = this.game.time.time;
        this._timeNextFrame = this.game.time.time + this.delay;

        this._frameIndex = 0;

        this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

        this._parent.setFrame(this.currentFrame);

        this._parent.animations.currentAnim = this;
        this._parent.animations.currentFrame = this.currentFrame;

        this.onStart.dispatch(this._parent, this);

    },

    /**
    * Reverses the animation direction.
    *
    * @method Phaser.Animation#reverse
    * @return {Phaser.Animation} The animation instance.
    */
    reverse: function () {

        this.reversed = !this.reversed;

        return this;

    },

    /**
    * Reverses the animation direction for the current/next animation only
    * Once the onComplete event is called this method will be called again and revert
    * the reversed state.
    *
    * @method Phaser.Animation#reverseOnce
    * @return {Phaser.Animation} The animation instance.
    */
    reverseOnce: function () {

        this.onComplete.addOnce(this.reverse, this);

        return this.reverse();

    },

    /**
    * Sets this animations playback to a given frame with the given ID.
    *
    * @method Phaser.Animation#setFrame
    * @param {string|number} [frameId] - The identifier of the frame to set. Can be the name of the frame, the sprite index of the frame, or the animation-local frame index.
    * @param {boolean} [useLocalFrameIndex=false] - If you provide a number for frameId, should it use the numeric indexes of the frameData, or the 0-indexed frame index local to the animation.
    */
    setFrame: function(frameId, useLocalFrameIndex) {

        var frameIndex;

        if (useLocalFrameIndex === undefined)
        {
            useLocalFrameIndex = false;
        }

        //  Find the index to the desired frame.
        if (typeof frameId === "string")
        {
            for (var i = 0; i < this._frames.length; i++)
            {
                if (this._frameData.getFrame(this._frames[i]).name === frameId)
                {
                    frameIndex = i;
                }
            }
        }
        else if (typeof frameId === "number")
        {
            if (useLocalFrameIndex)
            {
                frameIndex = frameId;
            }
            else
            {
                for (var i = 0; i < this._frames.length; i++)
                {
                    if (this._frames[i] === frameId)
                    {
                        frameIndex = i;
                    }
                }
            }
        }

        if (frameIndex)
        {
            //  Set the current frame index to the found index. Subtract 1 so that it animates to the desired frame on update.
            this._frameIndex = frameIndex - 1;

            //  Make the animation update at next update
            this._timeNextFrame = this.game.time.time;

            this.update();
        }

    },

    /**
    * Stops playback of this animation and set it to a finished state. If a resetFrame is provided it will stop playback and set frame to the first in the animation.
    * If `dispatchComplete` is true it will dispatch the complete events, otherwise they'll be ignored.
    *
    * @method Phaser.Animation#stop
    * @param {boolean} [resetFrame=false] - If true after the animation stops the currentFrame value will be set to the first frame in this animation.
    * @param {boolean} [dispatchComplete=false] - Dispatch the Animation.onComplete and parent.onAnimationComplete events?
    */
    stop: function (resetFrame, dispatchComplete) {

        if (resetFrame === undefined) { resetFrame = false; }
        if (dispatchComplete === undefined) { dispatchComplete = false; }

        this.isPlaying = false;
        this.isFinished = true;
        this.paused = false;

        if (resetFrame)
        {
            this.currentFrame = this._frameData.getFrame(this._frames[0]);
            this._parent.setFrame(this.currentFrame);
        }

        if (dispatchComplete)
        {
            this._parent.events.onAnimationComplete$dispatch(this._parent, this);
            this.onComplete.dispatch(this._parent, this);
        }

    },

    /**
    * Called when the Game enters a paused state.
    *
    * @method Phaser.Animation#onPause
    */
    onPause: function () {

        if (this.isPlaying)
        {
            this._frameDiff = this._timeNextFrame - this.game.time.time;
        }

    },

    /**
    * Called when the Game resumes from a paused state.
    *
    * @method Phaser.Animation#onResume
    */
    onResume: function () {

        if (this.isPlaying)
        {
            this._timeNextFrame = this.game.time.time + this._frameDiff;
        }

    },

    /**
    * Updates this animation. Called automatically by the AnimationManager.
    *
    * @method Phaser.Animation#update
    */
    update: function () {

        if (this.isPaused)
        {
            return false;
        }

        if (this.isPlaying && this.game.time.time >= this._timeNextFrame)
        {
            this._frameSkip = 1;

            //  Lagging?
            this._frameDiff = this.game.time.time - this._timeNextFrame;

            this._timeLastFrame = this.game.time.time;

            if (this._frameDiff > this.delay)
            {
                //  We need to skip a frame, work out how many
                this._frameSkip = Math.floor(this._frameDiff / this.delay);
                this._frameDiff -= (this._frameSkip * this.delay);
            }

            //  And what's left now?
            this._timeNextFrame = this.game.time.time + (this.delay - this._frameDiff);

            if (this.isReversed)
            {
                this._frameIndex -= this._frameSkip;
            }
            else
            {
                this._frameIndex += this._frameSkip;
            }

            if (!this.isReversed && this._frameIndex >= this._frames.length || this.isReversed && this._frameIndex <= -1)
            {
                if (this.loop)
                {
                    // Update current state before event callback
                    this._frameIndex = Math.abs(this._frameIndex) % this._frames.length;

                    if (this.isReversed)
                    {
                        this._frameIndex = this._frames.length - 1 - this._frameIndex;
                    }

                    this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

                    //  Instead of calling updateCurrentFrame we do it here instead
                    if (this.currentFrame)
                    {
                        this._parent.setFrame(this.currentFrame);
                    }

                    this.loopCount++;
                    this._parent.events.onAnimationLoop$dispatch(this._parent, this);
                    this.onLoop.dispatch(this._parent, this);

                    if (this.onUpdate)
                    {
                        this.onUpdate.dispatch(this, this.currentFrame);

                        // False if the animation was destroyed from within a callback
                        return !!this._frameData;
                    }
                    else
                    {
                        return true;
                    }
                }
                else
                {
                    this.complete();
                    return false;
                }
            }
            else
            {
                return this.updateCurrentFrame(true);
            }
        }

        return false;

    },

    /**
    * Changes the currentFrame per the _frameIndex, updates the display state,
    * and triggers the update signal.
    *
    * Returns true if the current frame update was 'successful', false otherwise.
    *
    * @method Phaser.Animation#updateCurrentFrame
    * @private
    * @param {boolean} signalUpdate - If true the `Animation.onUpdate` signal will be dispatched.
    * @param {boolean} fromPlay - Was this call made from the playing of a new animation?
    * @return {boolean} True if the current frame was updated, otherwise false.
    */
    updateCurrentFrame: function (signalUpdate, fromPlay) {

        if (fromPlay === undefined) { fromPlay = false; }

        if (!this._frameData)
        {
            // The animation is already destroyed, probably from a callback
            return false;
        }

        //  Previous index
        var idx = this.currentFrame.index;

        this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

        if (this.currentFrame && (fromPlay || (!fromPlay && idx !== this.currentFrame.index)))
        {
            this._parent.setFrame(this.currentFrame);
        }

        if (this.onUpdate && signalUpdate)
        {
            this.onUpdate.dispatch(this, this.currentFrame);

            // False if the animation was destroyed from within a callback
            return !!this._frameData;
        }
        else
        {
            return true;
        }

    },

    /**
    * Advances by the given number of frames in the Animation, taking the loop value into consideration.
    *
    * @method Phaser.Animation#next
    * @param {number} [quantity=1] - The number of frames to advance.
    */
    next: function (quantity) {

        if (quantity === undefined) { quantity = 1; }

        var frame = this._frameIndex + quantity;

        if (frame >= this._frames.length)
        {
            if (this.loop)
            {
                frame %= this._frames.length;
            }
            else
            {
                frame = this._frames.length - 1;
            }
        }

        if (frame !== this._frameIndex)
        {
            this._frameIndex = frame;
            this.updateCurrentFrame(true);
        }

    },

    /**
    * Moves backwards the given number of frames in the Animation, taking the loop value into consideration.
    *
    * @method Phaser.Animation#previous
    * @param {number} [quantity=1] - The number of frames to move back.
    */
    previous: function (quantity) {

        if (quantity === undefined) { quantity = 1; }

        var frame = this._frameIndex - quantity;

        if (frame < 0)
        {
            if (this.loop)
            {
                frame = this._frames.length + frame;
            }
            else
            {
                frame++;
            }
        }

        if (frame !== this._frameIndex)
        {
            this._frameIndex = frame;
            this.updateCurrentFrame(true);
        }

    },

    /**
    * Changes the FrameData object this Animation is using.
    *
    * @method Phaser.Animation#updateFrameData
    * @param {Phaser.FrameData} frameData - The FrameData object that contains all frames used by this Animation.
    */
    updateFrameData: function (frameData) {

        this._frameData = frameData;
        this.currentFrame = this._frameData ? this._frameData.getFrame(this._frames[this._frameIndex % this._frames.length]) : null;

    },

    /**
    * Cleans up this animation ready for deletion. Nulls all values and references.
    *
    * @method Phaser.Animation#destroy
    */
    destroy: function () {

        if (!this._frameData)
        {
            // Already destroyed
            return;
        }

        this.game.onPause.remove(this.onPause, this);
        this.game.onResume.remove(this.onResume, this);

        this.game = null;
        this._parent = null;
        this._frames = null;
        this._frameData = null;
        this.currentFrame = null;
        this.isPlaying = false;

        this.onStart.dispose();
        this.onLoop.dispose();
        this.onComplete.dispose();

        if (this.onUpdate)
        {
            this.onUpdate.dispose();
        }

    },

    /**
    * Called internally when the animation finishes playback.
    * Sets the isPlaying and isFinished states and dispatches the onAnimationComplete event if it exists on the parent and local onComplete event.
    *
    * @method Phaser.Animation#complete
    */
    complete: function () {

        this._frameIndex = this._frames.length - 1;
        this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

        this.isPlaying = false;
        this.isFinished = true;
        this.paused = false;

        this._parent.events.onAnimationComplete$dispatch(this._parent, this);

        this.onComplete.dispatch(this._parent, this);

        if (this.killOnComplete)
        {
            this._parent.kill();
        }

    }

};

Phaser.Animation.prototype.constructor = Phaser.Animation;

/**
* @name Phaser.Animation#paused
* @property {boolean} paused - Gets and sets the paused state of this Animation.
*/
Object.defineProperty(Phaser.Animation.prototype, 'paused', {

    get: function () {

        return this.isPaused;

    },

    set: function (value) {

        this.isPaused = value;

        if (value)
        {
            //  Paused
            this._pauseStartTime = this.game.time.time;
        }
        else
        {
            //  Un-paused
            if (this.isPlaying)
            {
                this._timeNextFrame = this.game.time.time + this.delay;
            }
        }

    }

});

/**
* @name Phaser.Animation#reversed
* @property {boolean} reversed - Gets and sets the isReversed state of this Animation.
*/
Object.defineProperty(Phaser.Animation.prototype, 'reversed', {

    get: function () {

        return this.isReversed;

    },

    set: function (value) {

        this.isReversed = value;

    }

});

/**
* @name Phaser.Animation#frameTotal
* @property {number} frameTotal - The total number of frames in the currently loaded FrameData, or -1 if no FrameData is loaded.
* @readonly
*/
Object.defineProperty(Phaser.Animation.prototype, 'frameTotal', {

    get: function () {
        return this._frames.length;
    }

});

/**
* @name Phaser.Animation#frame
* @property {number} frame - Gets or sets the current frame index and updates the Texture Cache for display.
*/
Object.defineProperty(Phaser.Animation.prototype, 'frame', {

    get: function () {

        if (this.currentFrame !== null)
        {
            return this.currentFrame.index;
        }
        else
        {
            return this._frameIndex;
        }

    },

    set: function (value) {

        this.currentFrame = this._frameData.getFrame(this._frames[value]);

        if (this.currentFrame !== null)
        {
            this._frameIndex = value;
            this._parent.setFrame(this.currentFrame);

            if (this.onUpdate)
            {
                this.onUpdate.dispatch(this, this.currentFrame);
            }
        }

    }

});

/**
* @name Phaser.Animation#speed
* @property {number} speed - Gets or sets the current speed of the animation in frames per second. Changing this in a playing animation will take effect from the next frame. Value must be greater than 0.
*/
Object.defineProperty(Phaser.Animation.prototype, 'speed', {

    get: function () {

        return 1000 / this.delay;

    },

    set: function (value) {

        if (value > 0)
        {
            this.delay = 1000 / value;
        }

    }

});

/**
* @name Phaser.Animation#enableUpdate
* @property {boolean} enableUpdate - Gets or sets if this animation will dispatch the onUpdate events upon changing frame.
*/
Object.defineProperty(Phaser.Animation.prototype, 'enableUpdate', {

    get: function () {

        return (this.onUpdate !== null);

    },

    set: function (value) {

        if (value && this.onUpdate === null)
        {
            this.onUpdate = new Phaser.Signal();
        }
        else if (!value && this.onUpdate !== null)
        {
            this.onUpdate.dispose();
            this.onUpdate = null;
        }

    }

});

/**
* Really handy function for when you are creating arrays of animation data but it's using frame names and not numbers.
* For example imagine you've got 30 frames named: 'explosion_0001-large' to 'explosion_0030-large'
* You could use this function to generate those by doing: Phaser.Animation.generateFrameNames('explosion_', 1, 30, '-large', 4);
*
* @method Phaser.Animation.generateFrameNames
* @static
* @param {string} prefix - The start of the filename. If the filename was 'explosion_0001-large' the prefix would be 'explosion_'.
* @param {number} start - The number to start sequentially counting from. If your frames are named 'explosion_0001' to 'explosion_0034' the start is 1.
* @param {number} stop - The number to count to. If your frames are named 'explosion_0001' to 'explosion_0034' the stop value is 34.
* @param {string} [suffix=''] - The end of the filename. If the filename was 'explosion_0001-large' the prefix would be '-large'.
* @param {number} [zeroPad=0] - The number of zeros to pad the min and max values with. If your frames are named 'explosion_0001' to 'explosion_0034' then the zeroPad is 4.
* @return {string[]} An array of framenames.
*/
Phaser.Animation.generateFrameNames = function (prefix, start, stop, suffix, zeroPad) {

    if (suffix === undefined) { suffix = ''; }

    var output = [];
    var frame = '';

    if (start < stop)
    {
        for (var i = start; i <= stop; i++)
        {
            if (typeof zeroPad === 'number')
            {
                //  str, len, pad, dir
                frame = Phaser.Utils.pad(i.toString(), zeroPad, '0', 1);
            }
            else
            {
                frame = i.toString();
            }

            frame = prefix + frame + suffix;

            output.push(frame);
        }
    }
    else
    {
        for (var i = start; i >= stop; i--)
        {
            if (typeof zeroPad === 'number')
            {
                //  str, len, pad, dir
                frame = Phaser.Utils.pad(i.toString(), zeroPad, '0', 1);
            }
            else
            {
                frame = i.toString();
            }

            frame = prefix + frame + suffix;

            output.push(frame);
        }
    }

    return output;

};

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* A Frame is a single frame of an animation and is part of a FrameData collection.
*
* @class Phaser.Frame
* @constructor
* @param {number} index - The index of this Frame within the FrameData set it is being added to.
* @param {number} x - X position of the frame within the texture image.
* @param {number} y - Y position of the frame within the texture image.
* @param {number} width - Width of the frame within the texture image.
* @param {number} height - Height of the frame within the texture image.
* @param {string} name - The name of the frame. In Texture Atlas data this is usually set to the filename.
*/
Phaser.Frame = function (index, x, y, width, height, name) {

    /**
    * @property {number} index - The index of this Frame within the FrameData set it is being added to.
    */
    this.index = index;

    /**
    * @property {number} x - X position within the image to cut from.
    */
    this.x = x;

    /**
    * @property {number} y - Y position within the image to cut from.
    */
    this.y = y;

    /**
    * @property {number} width - Width of the frame.
    */
    this.width = width;

    /**
    * @property {number} height - Height of the frame.
    */
    this.height = height;

    /**
    * @property {string} name - Useful for Texture Atlas files (is set to the filename value).
    */
    this.name = name;

    /**
    * @property {number} centerX - Center X position within the image to cut from.
    */
    this.centerX = Math.floor(width / 2);

    /**
    * @property {number} centerY - Center Y position within the image to cut from.
    */
    this.centerY = Math.floor(height / 2);

    /**
    * @property {number} distance - The distance from the top left to the bottom-right of this Frame.
    */
    this.distance = Phaser.Math.distance(0, 0, width, height);

    /**
    * @property {boolean} rotated - Rotated? (not yet implemented)
    * @default
    */
    this.rotated = false;

    /**
    * @property {string} rotationDirection - Either 'cw' or 'ccw', rotation is always 90 degrees.
    * @default 'cw'
    */
    this.rotationDirection = 'cw';

    /**
    * @property {boolean} trimmed - Was it trimmed when packed?
    * @default
    */
    this.trimmed = false;

    /**
    * @property {number} sourceSizeW - Width of the original sprite before it was trimmed.
    */
    this.sourceSizeW = width;

    /**
    * @property {number} sourceSizeH - Height of the original sprite before it was trimmed.
    */
    this.sourceSizeH = height;

    /**
    * @property {number} spriteSourceSizeX - X position of the trimmed sprite inside original sprite.
    * @default
    */
    this.spriteSourceSizeX = 0;

    /**
    * @property {number} spriteSourceSizeY - Y position of the trimmed sprite inside original sprite.
    * @default
    */
    this.spriteSourceSizeY = 0;

    /**
    * @property {number} spriteSourceSizeW - Width of the trimmed sprite.
    * @default
    */
    this.spriteSourceSizeW = 0;

    /**
    * @property {number} spriteSourceSizeH - Height of the trimmed sprite.
    * @default
    */
    this.spriteSourceSizeH = 0;

    /**
    * @property {number} right - The right of the Frame (x + width).
    */
    this.right = this.x + this.width;

    /**
    * @property {number} bottom - The bottom of the frame (y + height).
    */
    this.bottom = this.y + this.height;

};

Phaser.Frame.prototype = {

    /**
    * Adjusts of all the Frame properties based on the given width and height values.
    *
    * @method Phaser.Frame#resize
    * @param {integer} width - The new width of the Frame.
    * @param {integer} height - The new height of the Frame.
    */
    resize: function (width, height) {

        this.width = width;
        this.height = height;
        this.centerX = Math.floor(width / 2);
        this.centerY = Math.floor(height / 2);
        this.distance = Phaser.Math.distance(0, 0, width, height);
        this.sourceSizeW = width;
        this.sourceSizeH = height;
        this.right = this.x + width;
        this.bottom = this.y + height;

    },

    /**
    * If the frame was trimmed when added to the Texture Atlas this records the trim and source data.
    *
    * @method Phaser.Frame#setTrim
    * @param {boolean} trimmed - If this frame was trimmed or not.
    * @param {number} actualWidth - The width of the frame before being trimmed.
    * @param {number} actualHeight - The height of the frame before being trimmed.
    * @param {number} destX - The destination X position of the trimmed frame for display.
    * @param {number} destY - The destination Y position of the trimmed frame for display.
    * @param {number} destWidth - The destination width of the trimmed frame for display.
    * @param {number} destHeight - The destination height of the trimmed frame for display.
    */
    setTrim: function (trimmed, actualWidth, actualHeight, destX, destY, destWidth, destHeight) {

        this.trimmed = trimmed;

        if (trimmed)
        {
            this.sourceSizeW = actualWidth;
            this.sourceSizeH = actualHeight;
            this.centerX = Math.floor(actualWidth / 2);
            this.centerY = Math.floor(actualHeight / 2);
            this.spriteSourceSizeX = destX;
            this.spriteSourceSizeY = destY;
            this.spriteSourceSizeW = destWidth;
            this.spriteSourceSizeH = destHeight;
        }

    },

    /**
     * Clones this Frame into a new Phaser.Frame object and returns it.
     * Note that all properties are cloned, including the name, index and UUID.
     *
     * @method Phaser.Frame#clone
     * @return {Phaser.Frame} An exact copy of this Frame object.
     */
    clone: function () {

        var output = new Phaser.Frame(this.index, this.x, this.y, this.width, this.height, this.name);

        for (var prop in this)
        {
            if (this.hasOwnProperty(prop))
            {
                output[prop] = this[prop];
            }
        }

        return output;

    },

    /**
    * Returns a Rectangle set to the dimensions of this Frame.
    *
    * @method Phaser.Frame#getRect
    * @param {Phaser.Rectangle} [out] - A rectangle to copy the frame dimensions to.
    * @return {Phaser.Rectangle} A rectangle.
    */
    getRect: function (out) {

        if (out === undefined)
        {
            out = new Phaser.Rectangle(this.x, this.y, this.width, this.height);
        }
        else
        {
            out.setTo(this.x, this.y, this.width, this.height);
        }

        return out;

    }

};

Phaser.Frame.prototype.constructor = Phaser.Frame;

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* FrameData is a container for Frame objects, which are the internal representation of animation data in Phaser.
*
* @class Phaser.FrameData
* @constructor
*/
Phaser.FrameData = function () {

    /**
    * @property {Array} _frames - Local array of frames.
    * @private
    */
    this._frames = [];

    /**
    * @property {Array} _frameNames - Local array of frame names for name to index conversions.
    * @private
    */
    this._frameNames = [];

};

Phaser.FrameData.prototype = {

    /**
    * Adds a new Frame to this FrameData collection. Typically called by the Animation.Parser and not directly.
    *
    * @method Phaser.FrameData#addFrame
    * @param {Phaser.Frame} frame - The frame to add to this FrameData set.
    * @return {Phaser.Frame} The frame that was just added.
    */
    addFrame: function (frame) {

        frame.index = this._frames.length;

        this._frames.push(frame);

        if (frame.name !== '')
        {
            this._frameNames[frame.name] = frame.index;
        }

        return frame;

    },

    /**
    * Get a Frame by its numerical index.
    *
    * @method Phaser.FrameData#getFrame
    * @param {number} index - The index of the frame you want to get.
    * @return {Phaser.Frame} The frame, if found.
    */
    getFrame: function (index) {

        if (index >= this._frames.length)
        {
            index = 0;
        }

        return this._frames[index];

    },

    /**
    * Get a Frame by its frame name.
    *
    * @method Phaser.FrameData#getFrameByName
    * @param {string} name - The name of the frame you want to get.
    * @return {Phaser.Frame} The frame, if found.
    */
    getFrameByName: function (name) {

        if (typeof this._frameNames[name] === 'number')
        {
            return this._frames[this._frameNames[name]];
        }

        return null;

    },

    /**
    * Check if there is a Frame with the given name.
    *
    * @method Phaser.FrameData#checkFrameName
    * @param {string} name - The name of the frame you want to check.
    * @return {boolean} True if the frame is found, otherwise false.
    */
    checkFrameName: function (name) {

        if (this._frameNames[name] == null)
        {
            return false;
        }

        return true;

    },

    /**
     * Makes a copy of this FrameData including copies (not references) to all of the Frames it contains.
     *
     * @method Phaser.FrameData#clone
     * @return {Phaser.FrameData} A clone of this object, including clones of the Frame objects it contains.
     */
    clone: function () {

        var output = new Phaser.FrameData();

        //  No input array, so we loop through all frames
        for (var i = 0; i < this._frames.length; i++)
        {
            output._frames.push(this._frames[i].clone());
        }

        for (var p in this._frameNames)
        {
            if (this._frameNames.hasOwnProperty(p))
            {
                output._frameNames.push(this._frameNames[p]);
            }
        }

        return output;

    },

    /**
    * Returns a range of frames based on the given start and end frame indexes and returns them in an Array.
    *
    * @method Phaser.FrameData#getFrameRange
    * @param {number} start - The starting frame index.
    * @param {number} end - The ending frame index.
    * @param {Array} [output] - If given the results will be appended to the end of this array otherwise a new array will be created.
    * @return {Array} An array of Frames between the start and end index values, or an empty array if none were found.
    */
    getFrameRange: function (start, end, output) {

        if (output === undefined) { output = []; }

        for (var i = start; i <= end; i++)
        {
            output.push(this._frames[i]);
        }

        return output;

    },

    /**
    * Returns all of the Frames in this FrameData set where the frame index is found in the input array.
    * The frames are returned in the output array, or if none is provided in a new Array object.
    *
    * @method Phaser.FrameData#getFrames
    * @param {Array} [frames] - An Array containing the indexes of the frames to retrieve. If the array is empty or undefined then all frames in the FrameData are returned.
    * @param {boolean} [useNumericIndex=true] - Are the given frames using numeric indexes (default) or strings? (false)
    * @param {Array} [output] - If given the results will be appended to the end of this array otherwise a new array will be created.
    * @return {Array} An array of all Frames in this FrameData set matching the given names or IDs.
    */
    getFrames: function (frames, useNumericIndex, output) {

        if (useNumericIndex === undefined) { useNumericIndex = true; }
        if (output === undefined) { output = []; }

        if (frames === undefined || frames.length === 0)
        {
            //  No input array, so we loop through all frames
            for (var i = 0; i < this._frames.length; i++)
            {
                //  We only need the indexes
                output.push(this._frames[i]);
            }
        }
        else
        {
            //  Input array given, loop through that instead
            for (var i = 0; i < frames.length; i++)
            {
                //  Does the input array contain names or indexes?
                if (useNumericIndex)
                {
                    //  The actual frame
                    output.push(this.getFrame(frames[i]));
                }
                else
                {
                    //  The actual frame
                    output.push(this.getFrameByName(frames[i]));
                }
            }
        }

        return output;

    },

    /**
    * Returns all of the Frame indexes in this FrameData set.
    * The frames indexes are returned in the output array, or if none is provided in a new Array object.
    *
    * @method Phaser.FrameData#getFrameIndexes
    * @param {Array} [frames] - An Array containing the indexes of the frames to retrieve. If undefined or the array is empty then all frames in the FrameData are returned.
    * @param {boolean} [useNumericIndex=true] - Are the given frames using numeric indexes (default) or strings? (false)
    * @param {Array} [output] - If given the results will be appended to the end of this array otherwise a new array will be created.
    * @return {Array} An array of all Frame indexes matching the given names or IDs.
    */
    getFrameIndexes: function (frames, useNumericIndex, output) {

        if (useNumericIndex === undefined) { useNumericIndex = true; }
        if (output === undefined) { output = []; }

        if (frames === undefined || frames.length === 0)
        {
            //  No frames array, so we loop through all frames
            for (var i = 0; i < this._frames.length; i++)
            {
                output.push(this._frames[i].index);
            }
        }
        else
        {
            //  Input array given, loop through that instead
            for (var i = 0; i < frames.length; i++)
            {
                //  Does the frames array contain names or indexes?
                if (useNumericIndex && this._frames[frames[i]])
                {
                    output.push(this._frames[frames[i]].index);
                }
                else
                {
                    if (this.getFrameByName(frames[i]))
                    {
                        output.push(this.getFrameByName(frames[i]).index);
                    }
                }
            }
        }

        return output;

    },

    /**
    * Destroys this FrameData collection by nulling the _frames and _frameNames arrays.
    *
    * @method Phaser.FrameData#destroy
    */
    destroy: function () {

        this._frames = null;
        this._frameNames = null;

    }

};

Phaser.FrameData.prototype.constructor = Phaser.FrameData;

/**
* @name Phaser.FrameData#total
* @property {number} total - The total number of frames in this FrameData set.
* @readonly
*/
Object.defineProperty(Phaser.FrameData.prototype, "total", {

    get: function () {
        return this._frames.length;
    }

});

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Responsible for parsing sprite sheet and JSON data into the internal FrameData format that Phaser uses for animations.
*
* @class Phaser.AnimationParser
* @static
*/
Phaser.AnimationParser = {

    /**
    * Parse a Sprite Sheet and extract the animation frame data from it.
    *
    * @method Phaser.AnimationParser.spriteSheet
    * @param {Phaser.Game} game - A reference to the currently running game.
    * @param {string|Image} key - The Game.Cache asset key of the Sprite Sheet image or an actual HTML Image element.
    * @param {number} frameWidth - The fixed width of each frame of the animation.
    * @param {number} frameHeight - The fixed height of each frame of the animation.
    * @param {number} [frameMax=-1] - The total number of animation frames to extract from the Sprite Sheet. The default value of -1 means "extract all frames".
    * @param {number} [margin=0] - If the frames have been drawn with a margin, specify the amount here.
    * @param {number} [spacing=0] - If the frames have been drawn with spacing between them, specify the amount here.
    * @return {Phaser.FrameData} A FrameData object containing the parsed frames.
    */
    spriteSheet: function (game, key, frameWidth, frameHeight, frameMax, margin, spacing) {

        var img = key;

        if (typeof key === 'string')
        {
            img = game.cache.getImage(key);
        }

        if (img === null)
        {
            return null;
        }

        var width = img.width;
        var height = img.height;

        if (frameWidth <= 0)
        {
            frameWidth = Math.floor(-width / Math.min(-1, frameWidth));
        }

        if (frameHeight <= 0)
        {
            frameHeight = Math.floor(-height / Math.min(-1, frameHeight));
        }

        var row = Math.floor((width - margin) / (frameWidth + spacing));
        var column = Math.floor((height - margin) / (frameHeight + spacing));
        var total = row * column;

        if (frameMax !== -1)
        {
            total = frameMax;
        }

        //  Zero or smaller than frame sizes?
        if (width === 0 || height === 0 || width < frameWidth || height < frameHeight || total === 0)
        {
            console.warn("Phaser.AnimationParser.spriteSheet: '" + key + "'s width/height zero or width/height < given frameWidth/frameHeight");
            return null;
        }

        //  Let's create some frames then
        var data = new Phaser.FrameData();
        var x = margin;
        var y = margin;

        for (var i = 0; i < total; i++)
        {
            data.addFrame(new Phaser.Frame(i, x, y, frameWidth, frameHeight, ''));

            x += frameWidth + spacing;

            if (x + frameWidth > width)
            {
                x = margin;
                y += frameHeight + spacing;
            }
        }

        return data;

    },

    /**
    * Parse the JSON data and extract the animation frame data from it.
    *
    * @method Phaser.AnimationParser.JSONData
    * @param {Phaser.Game} game - A reference to the currently running game.
    * @param {object} json - The JSON data from the Texture Atlas. Must be in Array format.
    * @return {Phaser.FrameData} A FrameData object containing the parsed frames.
    */
    JSONData: function (game, json) {

        //  Malformed?
        if (!json['frames'])
        {
            console.warn("Phaser.AnimationParser.JSONData: Invalid Texture Atlas JSON given, missing 'frames' array");
            console.log(json);
            return;
        }

        //  Let's create some frames then
        var data = new Phaser.FrameData();

        //  By this stage frames is a fully parsed array
        var frames = json['frames'];
        var newFrame;

        for (var i = 0; i < frames.length; i++)
        {
            newFrame = data.addFrame(new Phaser.Frame(
                i,
                frames[i].frame.x,
                frames[i].frame.y,
                frames[i].frame.w,
                frames[i].frame.h,
                frames[i].filename
            ));

            if (frames[i].trimmed)
            {
                newFrame.setTrim(
                    frames[i].trimmed,
                    frames[i].sourceSize.w,
                    frames[i].sourceSize.h,
                    frames[i].spriteSourceSize.x,
                    frames[i].spriteSourceSize.y,
                    frames[i].spriteSourceSize.w,
                    frames[i].spriteSourceSize.h
                );
            }
        }

        return data;

    },

    /**
    * Parse the JSON data and extract the animation frame data from it.
    *
    * @method Phaser.AnimationParser.JSONDataPyxel
    * @param {Phaser.Game} game - A reference to the currently running game.
    * @param {object} json - The JSON data from the Texture Atlas. Must be in Pyxel JSON format.
    * @return {Phaser.FrameData} A FrameData object containing the parsed frames.
    */
    JSONDataPyxel: function (game, json) {

        //  Malformed? There are a few keys to check here.
        var signature = ['layers', 'tilewidth','tileheight','tileswide', 'tileshigh'];

        signature.forEach( function(key) {
            if (!json[key])
            {
                console.warn('Phaser.AnimationParser.JSONDataPyxel: Invalid Pyxel Tilemap JSON given, missing "' + key + '" key.');
                console.log(json);
                return;
            }
        });

        // For this purpose, I only care about parsing tilemaps with a single layer.
        if (json['layers'].length !== 1)
        {
            console.warn('Phaser.AnimationParser.JSONDataPyxel: Too many layers, this parser only supports flat Tilemaps.');
            console.log(json);
            return;
        }

        var data = new Phaser.FrameData();

        var tileheight = json['tileheight'];
        var tilewidth = json['tilewidth'];

        var frames = json['layers'][0]['tiles'];
        var newFrame;

        for (var i = 0; i < frames.length; i++)
        {
            newFrame = data.addFrame(new Phaser.Frame(
                i,
                frames[i].x,
                frames[i].y,
                tilewidth,
                tileheight,
                "frame_" + i  // No names are included in pyxel tilemap data.
            ));

            // No trim data is included.
            newFrame.setTrim(false);
        }

        return data;

    },

    /**
    * Parse the JSON data and extract the animation frame data from it.
    *
    * @method Phaser.AnimationParser.JSONDataHash
    * @param {Phaser.Game} game - A reference to the currently running game.
    * @param {object} json - The JSON data from the Texture Atlas. Must be in JSON Hash format.
    * @return {Phaser.FrameData} A FrameData object containing the parsed frames.
    */
    JSONDataHash: function (game, json) {

        //  Malformed?
        if (!json['frames'])
        {
            console.warn("Phaser.AnimationParser.JSONDataHash: Invalid Texture Atlas JSON given, missing 'frames' object");
            console.log(json);
            return;
        }

        //  Let's create some frames then
        var data = new Phaser.FrameData();

        //  By this stage frames is a fully parsed array
        var frames = json['frames'];
        var newFrame;
        var i = 0;

        for (var key in frames)
        {
            newFrame = data.addFrame(new Phaser.Frame(
                i,
                frames[key].frame.x,
                frames[key].frame.y,
                frames[key].frame.w,
                frames[key].frame.h,
                key
            ));

            if (frames[key].trimmed)
            {
                newFrame.setTrim(
                    frames[key].trimmed,
                    frames[key].sourceSize.w,
                    frames[key].sourceSize.h,
                    frames[key].spriteSourceSize.x,
                    frames[key].spriteSourceSize.y,
                    frames[key].spriteSourceSize.w,
                    frames[key].spriteSourceSize.h
                );
            }

            i++;
        }

        return data;

    },

    /**
    * Parse the XML data and extract the animation frame data from it.
    *
    * @method Phaser.AnimationParser.XMLData
    * @param {Phaser.Game} game - A reference to the currently running game.
    * @param {object} xml - The XML data from the Texture Atlas. Must be in Starling XML format.
    * @return {Phaser.FrameData} A FrameData object containing the parsed frames.
    */
    XMLData: function (game, xml) {

        //  Malformed?
        if (!xml.getElementsByTagName('TextureAtlas'))
        {
            console.warn("Phaser.AnimationParser.XMLData: Invalid Texture Atlas XML given, missing <TextureAtlas> tag");
            return;
        }

        //  Let's create some frames then
        var data = new Phaser.FrameData();
        var frames = xml.getElementsByTagName('SubTexture');
        var newFrame;

        var name;
        var frame;
        var x;
        var y;
        var width;
        var height;
        var frameX;
        var frameY;
        var frameWidth;
        var frameHeight;

        for (var i = 0; i < frames.length; i++)
        {
            frame = frames[i].attributes;

            name = frame.name.value;
            x = parseInt(frame.x.value, 10);
            y = parseInt(frame.y.value, 10);
            width = parseInt(frame.width.value, 10);
            height = parseInt(frame.height.value, 10);

            frameX = null;
            frameY = null;

            if (frame.frameX)
            {
                frameX = Math.abs(parseInt(frame.frameX.value, 10));
                frameY = Math.abs(parseInt(frame.frameY.value, 10));
                frameWidth = parseInt(frame.frameWidth.value, 10);
                frameHeight = parseInt(frame.frameHeight.value, 10);
            }

            newFrame = data.addFrame(new Phaser.Frame(i, x, y, width, height, name));

            //  Trimmed?
            if (frameX !== null || frameY !== null)
            {
                newFrame.setTrim(true, width, height, frameX, frameY, frameWidth, frameHeight);
            }
        }

        return data;

    }

};
