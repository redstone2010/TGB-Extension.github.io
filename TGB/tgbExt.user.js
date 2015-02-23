// ==UserScript==
// @name         TGB's Extensions
// @version      1.3
// @author       TheGameBuilder on Scratch
// @description  Make good use of them! :D
// @namespace    http://felizolinha.github.io
// @icon         http://tgb-extension.github.io/Icon.png
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        unsafeWindow
// @resource     version http://tgbsproxy.x10.bz/?version=TGB
// @resource     TGBox http://tgb-extension.github.io/TGB/Plugins/TGBox.css
// @resource     sweet-alert http://tgb-extension.github.io/TGB/Plugins/sweet-alert.css
// @resource     toastr http://tgb-extension.github.io/TGB/Plugins/toastr.min.css
// @require      http://tgb-extension.github.io/TGB/Plugins/sweet-alert.min.js
// @require      http://tgb-extension.github.io/TGB/Plugins/math.min.js
// @require      http://tgb-extension.github.io/TGB/Plugins/php-get.js
// @require      http://tgb-extension.github.io/TGB/Plugins/toastr.js
// @require      https://cdn.rawgit.com/TheDistantSea/8021359/raw/version_compare.js
//               jQuery Color crashes the script. There will be some cool new Color blocks when I fix it!
//               http://code.jquery.com/color/jquery.color-2.1.2.min.js
//               https://cdn.rawgit.com/AndreasSoiron/Color_mixer/master/color_mixer.js
//               http://www.youtube.com/player_api
// @match        *://scratch.mit.edu/projects/*
// @exclude      *://scratch.mit.edu/projects/embed/*
// A huge thanks to the creators of ScratchExt, some block ideas came from their extension! I found out about Javascript extensions through GrannyCookies, without him this wouldn't be possible :)
// If you want to check out ScratchExt too: http://www.stefanbates.com/bookmarklet.html
// ==/UserScript==
//CSS ////////////////////////////////////////////////////////////////////////////////////////

GM_addStyle(GM_getResourceText("TGBox"));
GM_addStyle(GM_getResourceText("sweet-alert"));
GM_addStyle(GM_getResourceText("toastr"));

//Extension Loader////////////////////////////////////////////////////////////////////////////
function Extension(name /* String */, _descriptor /* Object */, _functions /* Object */, _msg /* String */, _status /* Number */) {
    this.functions = _functions || {};
    this.functions._shutdown = function() {};
    this.functions._getStatus = function() {
        // Status reporting code
        // Use this to report missing hardware, plugin or unsupported browser
        return {
            status: _status || 2,
            msg: _msg || "Installed"
        };
    };

    this.install = function() {
        //Execute a function when the extension is installed
        try {
            this.onInstall();
        } catch (e) {}
        //Install Extension
        ScratchExtensions.register(name, _descriptor /* Objects: blocks, menus, url */, this.functions);
    };
}

//Welcome easter egg!/////////////////////////////////////////////////////////////////////////

console.log("                                                                                      \n                                                                                      \n.---.--..--. .       .-.           .     .      .---.     .                           \n  |:    |   \)|      \(   \)         _|_    |      |        _|_               o          \n  || --.|--:  .--.   `-. .-.--.-.  |  .-.|--.   |--- -. ,-|  .-..--. .--.  .  .-..--. \n  |:   ||   \) `--.  \(   |  | \(   \) | \(   |  |   |      :  | \(.-'|  | `--.  | \(   \)  | \n  ' `--''--'  `--'   `-' `-'  `-'`-`-'`-''  `-  '---'-' `-`-'`--'  `-`--'-' `-`-''  `-\n                                                                                      \n                                                                                      ");

//Wait for a condition to be true/////////////////////////////////////////////////////////////

function waitfor(test, expectedValue, msec, callback) {
    while (test() !== expectedValue) {
        setTimeout(function() {
            waitfor(test, expectedValue, msec, callback);
        }, msec);
        return;
    }
    callback();
}

//waitfor helper functions////////////////////////////////////////////////////////////////////

function isDataDefined() {
    try {
        return data !== undefined;
    } catch(e) {
        return false;
    }
}

function isScratchDefined() {
    try {
        return Scratch !== undefined;
    } catch(e) {
        return false;
    }
}

function isPageVisible() {
    return document.visibilityState === "visible";
}

//Variables///////////////////////////////////////////////////////////////////////////////////
var TGB = {},
    wait = 2.5;

var scratcher,
    userLanguage = window.navigator.language; //Check for the userLanguage prop. also in case IE needs support.
    //online; Activate for Firefox version

var keysPressed = [],
    keyDetection = false,
    last_h_value = false;

var lang = "Google US English";

var counters = {Help: Tips},
    Tips = [
        "You can use counters as local variables!",
        "To open Project and Discussion pages you have to use their respective ID's.",
        "You can use the # of word [] in [] block among with the list reporter to find the index of an item (the items of the list can't have spaces)!",
        "Scratch deletes extra hashes when you switch your viewing mode (e.g. Switching to editor mode)."
    ],
    storage;

/*var inIframe;
try {
    inIframe = window.self !== window.top;
} catch (e) {
    inIframe = true;
}*/

waitfor(isDataDefined, true, 100, function() {
    is_creator = data.user.username == data.project.creator;
    shared = !data.project.isPrivate;
    project_id = data.project.id;
    remixed = data.project.parentId !== null;
});

waitfor(isScratchDefined, true, 100, function() {
    admin = Scratch.INIT_DATA.ADMIN;
    notes = Scratch.INIT_DATA.PROJECT.model.notes;

    // Semi-fix for sharing projects with extensions!
    Scratch.Project.ShareBar.prototype.shareProject = function() {
        this.model.share();
    };
});

commentAddition = [
    "Please read the instructions before commenting! Thanks :)",
    "Please use the forum to post your scores!",
    "Feel free to make your requests here!",
    "Please use my profile to make requests! Thanks :)",
    "Thanks for commenting! :)"
];

//Toastr Configuration////////////////////////////////////////////////////////////////////////

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "10000",
    "hideDuration": "10000",
    "timeOut": "20000",
    "extendedTimeOut": "10000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

//Checking if user is a New Scratcher/////////////////////////////////////////////////////////

$.get( "http://scratch.mit.edu/internalapi/swf-settings/", function(data) {
    scratcher = JSON.parse(data);
    scratcher = scratcher.user_groups.indexOf('Scratchers') > -1;
});

//iFrame Shim with Pepperflash Detection//////////////////////////////////////////////////////
//Pepperflash detection according to Igor Shastin's answer at http://stackoverflow.com/questions/12866060/detecting-pepper-ppapi-flash-with-javascript
var isPPAPI = false,
    flashStr = 'application/x-shockwave-flash',
    mimeTypes = navigator.mimeTypes;

if(mimeTypes && mimeTypes[flashStr] && mimeTypes[flashStr].enabledPlugin &&
  (mimeTypes[flashStr].enabledPlugin.filename.match(/pepflashplayer|Pepper/gi))) isPPAPI = true;

if(!isPPAPI) {
    $('param:eq(2)').attr('value', 'transparent');
    $('.sweet-alert').append('<iframe class="iframeshim" frameBorder="0" scrolling="no" style="width:100%; height:100%; opacity: 0; z-index: 0; left: 50%; margin-left:-256px; pointer-events:none;"></iframe>');
}

//Local Storage Check///////////////////////////////////////////////////////////////////////
//By Mathias Bynens

try {
    var fail,
        uid;

    uid = new Date;
    (storage = window.localStorage).setItem(uid, uid);
    fail = storage.getItem(uid) != uid;
    storage.removeItem(uid);
    fail && (storage = false);
    storage['!Cookie'] = 1; //Just a little Easter Egg, there's no need to set it to 1 again after resetting :p
} catch (exception) {}

//List Voices/////////////////////////////////////////////////////////////////////////////////

function _get_voices() {
    var ret = [];
    var voices = speechSynthesis.getVoices();

    for(var i = 0; i < voices.length; i++ ) {
         ret.push(voices[i].name);
    }

    return ret;
}

//Key Checks//////////////////////////////////////////////////////////////////////////////////

function isKeyPressed(code) {
  return keysPressed[code];
}

function menuCheck(key) {
  switch(key) {
    case 'shift':
      return isKeyPressed(16);
    case 'ctrl':
      return isKeyPressed(17);
    case 'enter':
      return isKeyPressed(13);
    case 'backspace':
      return isKeyPressed(8);
    case 'alt':
      return isKeyPressed(18);
    case 'tab':
      return isKeyPressed(9);
    case 'caps':
      return isKeyPressed(20);
    case 'esc':
      return isKeyPressed(27);
    case 'any':
      return keysPressed.indexOf(true) > -1;
    default:
      return isKeyPressed(key_code.charCodeAt(0));
  }
}

//Signed Decimal Fix//Thanks for explaining it to me, DadOfMrLog!///////////////////////////
//Based on: http://stackoverflow.com/questions/6146177/convert-a-signed-decimal-to-hex-encoded-with-twos-complement

function dec_fix(num) {
    return parseInt(Number('0x' + (num < 0 ? (0xFFFFFFFF + num + 1).toString(16).slice(2) : num.toString(16))), 10);
}

//Esrever/////////////////////////////////////////////////////////////////////////////////////
//By Mathias Bynens

var regexSymbolWithCombiningMarks = /([\0-\u02FF\u0370-\u1DBF\u1E00-\u20CF\u2100-\uD7FF\uDC00-\uFE1F\uFE30-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF])([\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]+)/g,
    regexSurrogatePair = /([\uD800-\uDBFF])([\uDC00-\uDFFF])/g;

var reverse = function(string) {
    // Step 1: deal with combining marks and astral symbols (surrogate pairs)
    string = string
    // Swap symbols with their combining marks so the combining marks go first
    .replace(regexSymbolWithCombiningMarks, function($0, $1, $2) {
        // Reverse the combining marks so they will end up in the same order
        // later on (after another round of reversing)
        return reverse($2) + $1;
    })
    // Swap high and low surrogates so the low surrogates go first
    .replace(regexSurrogatePair, '$2$1');
    // Step 2: reverse the code units in the string
    var result = '';
    var index = string.length;
    while (index--) {
        result += string.charAt(index);
    }
    return result;
};

//String Manipulation Functions///////////////////////////////////////////////////////////////

function capitalizeFirstLetter(string) {
    var n = string.search(/\w/);
    var a = string.charAt(n).toUpperCase();
    var b = string.slice(n + 1);
    return (n > 0) ? string.substr(0, n) + a + b: a + b;
}

function contains(a, str){
    return a.indexOf(str) > -1;
}

function startsWith(a, str){
    return a.slice(0, str.length) == str;
}

function endsWith(a, str) {
    return a.slice(-str.length) == str;
}

function capitalize(str) {
    return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
}

function shuffle(str) {
    var a = str.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

function zeroPad(num) {
    return "00000000".slice(String(num).length) + num;
}

//TGBox///////////////////////////////////////////////////////////////////////////////////////

create_TGBox = function(title, description) {
    var src = $('.user-icon').attr('src').replace("32x32","50x50");
    ca = (title.length > 16) ? title.substring(0,15) + "..." : title;
    ca = capitalizeFirstLetter(ca);
    cb = (description.length > 45) ? description.substring(0,44) + "..." : description;
    cb = capitalizeFirstLetter(cb);
    $("body").append('<div id="TGBox"><div id="TGB_bg2"></div><div id="TGB_bg"></div><img id="profile_pic" src="' + src + '"/><b><p id="TitleGB">' + ca + '</p></b><p id="TextGB">' + cb + '</p></div>');
};

TGBox_out = function() {
    $("#TGBox").animate(
    {
        opacity: 0,
        left:-247,
    }, 1500);
};

TGBox_in_helper = function(a, b) {
    ca = (a.length > 16) ? a.substring(0,15) + "..." : a;
    ca = capitalizeFirstLetter(ca);
    $("#TitleGB").html(ca);
    cb = (b.length > 45) ? b.substring(0,44) + "..." : b;
    cb = capitalizeFirstLetter(cb);
    $("#TextGB").html(cb);
    $("#TGBox").animate(
    {
        opacity: 1,
        left:0,
    }, 1500);
};

//Youtube/////////////////////////////////////////////////////////////////////////////////////
//Block is not working, so I'll leave this disabled for now.
/*window.YT_style = function(x, y){
    if(isNaN(x)) {
        x = 0;
    }
    if(isNaN) {
        y = 0;
    }
    $("#YTplayer").css(
    {
        'position': 'absolute',
        'bottom': 14 + y + 'px',
        'left': 15 + x + 'px'
    });
};
// Autoplay video
function onPlayerReady(event) {
    event.target.playVideo();
}
// When video ends
function onPlayerStateChange(event) {
    if(event.data === 0) {
        $("#YTplayer").remove();
    }
}*/

//Net Checker/////////////////////////////////////////////////////////////////////////////////
//Disabled until a Firefox compatible version is launched
/*if(contains(navigator.userAgent, "Firefox")) {
    function serverReachable() {
        // Thanks to Louis-Rémi!
        var x = new ( window.ActiveXObject || XMLHttpRequest )( "Microsoft.XMLHTTP" ),
            s;
        x.open(
            // append a random string to the current hostname,
            // to make sure we're not hitting the cache
            "//" + window.location.hostname + "/?rand=" + Math.random(),
            // make a synchronous request
            false
        );
        try {
            x.send();
            s = x.status;
            // Make sure the server is reachable
            return ( s >= 200 && s < 300 || s === 304 );
            // catch network & other problems
        } catch (e) {
            return false;
        }

        setInterval(function() {online = serverReachable();}, 3000);
    }
}*/

//Reports the wait to user////////////////////////////////////////////////////////////////////

console.log('Waiting ' + wait + ' secs...');

//Extensions//////////////////////////////////////////////////////////////////////////////////
//TODO: Include pages to explain each Extension.

TGB = {
    Color: new Extension(
    "Color",
    {
        blocks: [
            ['r', '%c', 'color', math.pickRandom([255, 65280, 16711680])],
            ['-'],
            //['r', 'mix %c and %c', 'mix'],
            ['r', 'Hex%s to color', 'hex2color', '#ffffff'],
            ['r', 'R:%s G:%s B:%s', 'rgb2color', 255, 255, 255],
            ['-'],
            ['r', '%m.rgb of %c', 'color2rgb', 'Red'],
        ],

        menus: {
            rgb: ["Red", "Green", "Blue"],
        },
    },
    {
        color: function(integer) {return integer;},

        hex2color: function(s) {
            if(s.charAt(0) != '#') {
                s = '#' + s;
            }
            if(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(s)) {
                var patt = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})$/;
                var matches = patt.exec(s);
                return 65536*parseInt(matches[1], 16) + 256*parseInt(matches[2], 16) + parseInt(matches[3], 16);
            } else {
                console.log('Invalid hex color:' + s);
            }
        },

        //256^2*r + 256*g + b = RGB Integer
        rgb2color: function(r, g ,b) {
            r = Number(r);
            g = Number(g);
            b = Number(b);
            if(r < 256 && g < 256 && b < 256) {
                return 65536*r + 256*g + b;
            } else {
                console.log('Invalid rgb color: rgb(' + r + ', ' + g + ', ' + b + ').');
            }
        },

        color2rgb: function(rgb,  integer) {
            integer = dec_fix(integer);
            switch(rgb) {
                case "Blue":
                    return integer % 256;
                case "Green":
                    return Math.floor(integer / 256) % 256;
                case "Red":
                    return Math.floor(integer / 65536);

            }
        }

        /*mix: function(color1, color2) {
            //color_1 = $.Color(color2hex(color1));
            //color_2 = $.Color(color2hex(color2));
            //return hex2color(Color_mixer.mix(color_1, color_2));
            return;
        },*/
    }),

    Data: new Extension(
    "Data",
    {
        blocks: [
            ['r', 'Counter %s', 'counter', 'Help'],
            ['r', 'Cookie %s', 'cookie', '!Cookie'],
            ['-'],
            [' ', 'Set counter %s to %s', 's_counter', 'Score', 10],
            [' ', 'Increase counter %s by %s', 'i_counter', 'Score', 1],
            [' ', 'Reset counter %s', 'r_counter', 'Score'],
            [' ', 'Reset all counters', 'r_all_counters'],
            ['-'],
            [' ', 'Set cookie %s to %s', 's_cookie', 'Level', 1],
            [' ', 'Increase cookie %s by %s', 'i_cookie', 'Level', 1],
            [' ', 'Delete cookie %s', 'd_cookie', 'Level'],
            [' ', 'Delete all cookies', 'd_all_cookies']
        ]
    },
    {
        counter: function(name) {
            if(name != 'Help' || counters.Help != Tips) {
                return counters[name];
            } else {
                return math.pickRandom(counters.Help);
            }
        },

        cookie: function(name) {
            if (storage) {
                return storage[name];
            }
        },

        s_counter: function(name, val) {
            if(Object.keys(counters).length <= 50001) {
                /*if(typeof is_creator !== "undefined" && is_creator) {
                    console.log("Counter '" + name + "' set to '" + val + "'.");
                }*/
                counters[name] = val;
            } else {
                if(typeof is_creator !== "undefined" && is_creator) {
                    console.log("Too many counters.");
                }
            }
        },

        i_counter: function(name, val) {
            if(Object.keys(counters).length <= 50001) {
                /*if(typeof is_creator !== "undefined" && is_creator) {
                    console.log("Counter '" + name + "' increased by '" + val + "'.");
                }*/
                if(typeof counters[name] != "undefined") {
                    counters[name] += val;
                } else {
                    counters[name] = val;
                }
            }
            else if(typeof is_creator !== "undefined" && is_creator) {
                console.log("Too many counters.");
            }
        },

        r_counter: function(name) {
            /*if(typeof is_creator !== "undefined" && is_creator) {
                console.log("Counter '" + name + "' was reseted.");
            }*/
            delete counters[name];
        },

        r_all_counters: function() {
            /*if(typeof is_creator !== "undefined" && is_creator) {
                console.log("All counters were reseted.");
            }*/
            counters = {Help: Tips};
        },

        s_cookie: function(name, val) {
            if(storage) {
                if(storage.length <= 500) {
                    /*if(typeof is_creator !== "undefined" && is_creator) {
                        console.log("Cookie '" + name + "' set to '" + val + "'.");
                    }*/
                    storage.setItem(name, val);
                } else {
                    if(typeof is_creator !== "undefined" && is_creator) {
                        console.log("Too many cookies.");
                    }
                }
            }
        },

        i_cookie: function(name, val) {
            if(storage) {
                if(storage.length <= 500) {
                    /*if(typeof is_creator !== "undefined" && is_creator) {
                        console.log("Cookie '" + name + "' increased by '" + val + "'.");
                    }*/
                    if(typeof storage[name] != "undefined") {
                        if(isNaN(val) || isNaN(storage[name])) {
                            storage[name] += val;
                        } else {
                            storage[name] = Number(storage[name]) + Number(val);
                        }
                    } else {
                        storage.setItem(name, val);
                    }
                }
                else if(typeof is_creator !== "undefined" && is_creator) {
                    console.log("Too many cookies.");
                }
            }
        },

        d_cookie: function(name) {
            if(storage) {
                /*if(typeof is_creator !== "undefined" && is_creator) {
                    console.log("Cookie '" + name + "' was deleted.");
                }*/
                storage.removeItem(name);
            }
        },

        d_all_cookies: function() {
            if(storage) {
                /*if(typeof is_creator !== "undefined" && is_creator) {
                    console.log("All cookies were deleted.");
                }*/
                storage.clear();
            }
        }
    }),

    "Date": new Extension(
    "Date",
    {
        blocks: [
            ['r', 'UTC %m.types', 'UTC', 'Hours'],
            ['r', 'User GMT Timezone Offset', 'timezone'],
        ],

        menus: {
            types: ["Hours", "Minutes", "Seconds", "Day of the Week", "Date", "Month", "Year"],
        }
    },
    {
        UTC: function(type) {
        var d = new Date;
        switch(type) {
            case "Milliseconds":
                return d.getUTCMilliseconds();
            case "Seconds":
                return d.getUTCSeconds();
            case "Minutes":
                return d.getUTCMinutes();
            case "Hours":
                return d.getUTCHours();
            case "Date":
                return d.getUTCDate();
            case "Month":
                return d.getUTCMonth();
            case "Year":
                return d.getUTCFullYear();
            case "Day of the Week":
                switch (d.getDay()) {
                    case 0:
                        day = "Sunday";
                        break;
                    case 1:
                        day = "Monday";
                        break;
                    case 2:
                        day = "Tuesday";
                        break;
                    case 3:
                        day = "Wednesday";
                        break;
                    case 4:
                        day = "Thursday";
                        break;
                    case 5:
                        day = "Friday";
                        break;
                    case 6:
                        day = "Saturday";
                        break;
                }
                return day;
            }
                },
        timezone: function() {
            var d = new Date();
            return d.getTimezoneOffset();
        }
    }),

    Operators: new Extension(
    "Operators",
    {
        blocks: [
            ['r', '%n ^ %n', 'power', '', ''],
            ['r', '%n \u221a%n', 'nth_root', '', ''],
            ['-'],
            ['r', 'atan2 of y:%n x:%n', 'atan2', 1, 1],
            ['r', 'evaluate %s', 'evaluate', '5.08 cm to inch'],
            ['-'],
            ['b', '%s %m.compare %s', 'compare', 1, '\u2260', 1],
            ['b', 'Case sense %s = %s', 'equals_to', 'A', 'a'],
            ['b', '%b xor %b', 'xor'],
            ['-'],
            ['b', 'true', 'b_true'],
            ['b', 'false', ''],
            ['b', '%n % chance of true', 'random_bool', 50],
            ['b', '%s as a boolean', 'as_bool', Math.round(Math.random())],
            ['b', 'is %s a %m.data_types ?', 'type_of', 10, 'number'],
            ['r', 'if%b then %s else %s', 'reporter_if', '', 'hello', 'world'],
            ['-'],
            ['r', '%m.constants', 'constants', 'Pi'],
            ['r', 'round %n to %n decimal places', 'round_places', 1.23, 1],
            ['-'],
            ['r', '%n within %n and %n', 'within', 11, 1, 10],
            ['-'],
            ['r', '%n %m.radgrees to %m.radgrees', 'radgrees', 180, 'Degrees', 'Radians'],
            ['r', '%n %m.degrees to %m.degrees', 'degrees', 0, 'K', '°C']
        ],

        menus: {
            compare: ["\u2264", "\u2265", "\u2260"],
            constants: ["Pi", "Phi"],
            data_types: ["number", "string", "boolean"],
            radgrees: ["Degrees", "Radians"],
            degrees: ["°C", "°F", "K"],
        }
    },
    {
        power: function(base, exponent) {
            return Math.pow(base, exponent);
        },

        nth_root: function(n, x) {
            if(!(isNaN(n) || isNaN(x))) {
                if(n === Infinity || x === Infinity) {
                    return Infinity;
                } else if(n === -Infinity || x === -Infinity) {
                    return -Infinity;
                } else {
                    try {
                        var negate = n % 2 == 1 && x < 0;
                        if(negate) {
                            x = -x;
                        }
                        var possible = Math.pow(x, 1 / n);
                        n = Math.pow(possible, n);
                        if(Math.abs(x - n) < 1 && (x > 0 == n > 0))
                            return negate ? -possible : possible;
                    } catch(e){return NaN;}
                }
            } else {
                return NaN;
            }
        },

        evaluate: function(s) {
          return math.format(math.eval(s), 16);
        },

        atan2: function(y, x) {
          return Math.atan2(y, x) * 180 / Math.PI;
        },

        compare: function(a, type, b) {

          switch(type) {
            case "\u2260":
              return a != b;
            case "\u2264":
              return a <= b;
            case "\u2265":
              return a >= b;
          }
        },

        equals_to: function(a, b) {
            var c = Number(a);
            var d = Number(b);
            if (isNaN(c) || isNaN(d)) {
                return (a === b) ? true : false;
            } else {
                return (c === d) ? true : false;
            }
        },

        xor: function(a,b){
          return Boolean(a ^ b);
        },

        b_true: function() {
          return true;
        },

        as_bool: function(b) {
            return isNaN(b) ? !!b : !!Number(b);
        },

        random_bool: function(n) {
            return math.random(0, 100) < n;
        },

        type_of: function(a, b) {
            switch(b) {
                case "number":
                    if(!isNaN(a)) {
                        if((a == Infinity && !(a === Infinity)) || (a == -Infinity && !(a === -Infinity))) {
                            return false;
                        }
                        return true;
                    } else {return false;}
                            break;
                case "string":
                    return (isNaN(a) || a == "Infinity") ? true : false;
                case "boolean":
                    return (typeof(a) == "boolean") ? true : false;
            }
        },

        reporter_if: function(b, opt1, opt2) {
            return b ? opt1 : opt2;
        },

        constants: function(p) {
            return (p=="Pi") ? Math.PI : (1 + Math.sqrt(5))/2;
        },

        round_places: function(n, places) {
          places = Math.round(places);
          n = Number(n);
            return math.round(n, places);
        },

        within: function(n, a, b) {
          if(isNaN(n) || isNaN(a) || isNaN(b)) {
            return "NaN";
          } else {
            if (a === b) {
              return a;
            }
            var max = (a > b) ? a : b;
            var min = (a < b) ? a : b;
            if (n >= max) {
              return max;
            }
            else if (n <= min) {
              return min;
            } else {
              return n;
            }
          }
        },

        radgrees: function(n, type1, type2) {
          if(type1 == "Degrees") {
            return (type2 == "Radians") ? n * Math.PI / 180 : n;
          } else {
            return (type2 == "Degrees") ? n * 180 / Math.PI : n;
          }
        },

        degrees: function(n, degrees_from, degrees_to) {
          //C / 5 = (F - 32) / 9 = (K - 273.15) / 5
          switch(degrees_from) {
            case "K":
              switch(degrees_to) {
                case "°C":
                  return n - 273.15;
                case "°F":
                  return ((n - 273.15) * 9 / 5) + 32;
                case "K":
                  return n;
              }
              break;
            case "°C":
              switch(degrees_to) {
                case "K":
                  return n + 273.15;
                case "°F":
                  return (n * 9 / 5) + 32;
                case "°C":
                  return n;
              }
              break;
            case "°F":
              switch(degrees_to) {
                case "°C":
                  return (n - 32) * 5 / 9;
                case "K":
                  return ((n - 32) * 5 / 9) + 273.15;
                case "°F":
                  return n;
              }
              break;
          }
        }
    }),

    "Program & Web": new Extension(
    "Program & Web",
    {
        blocks: [
            ['r', 'Project Title', 'proj_title'],
            ['r', 'Project ID', 'proj_id'],
            ['r', 'Instructions', 'info'],
            ['r', 'Notes and Credits', 'notes'],
            //['r', 'Days since last update', 'lst_upd', ''],
            ['-'],
            ['b', 'Shared?', 'shared'],
            ['b', 'Remix?', 'remixed'],
            ['-'],
            ['r', 'Amount of Sprites', 'sprites'],
            ['r', 'Amount of Scripts', 'scripts'],
            ['r', 'Amount of Comments', 'comments', ''],
            ['-'],
            ['r', 'View Mode', 'mode'],
            [' ', 'Switch to %m.views mode', 'switch_to', 'Player'],
            [' ', 'Fullscreen Switch', 'fullscreen'],
            ['-'],
            ['w', 'Set clipboard to %s', 's_clip', 'Support!'],
            //['r', 'Clipboard Data', 'r_clip'], Possibly impossible feature, make a pull request if you have any idea on how to do it!
            ['-'],
            ['r', 'Tab Title', 'title'],
            [' ', 'Set Tab Title to %s', 'set_tab', document.title],
            ['b', 'Is this tab visible?', 'tab_visible'],
            ['-'],
            ['r', 'Custom Hash %n', 'hash', '1'],
            ['r', 'Query Parameter %s', 'php_get', 'allowfullscreen'],
            ['-'],
            ['w', 'Open %m.open %s', 'TGB_open', 'user profile of', (typeof data !== "undefined") ? data.project.creator : "TheGameBuilder"],
            //[' ', 'Open Youtube video with ID:%s at x:%s y:%s', 'youtube', '0Bmhjf0rKe8', 0, 0], Disabled due to some strange bug that makes it not show the player.
            ['-'],
            ['h', 'when %b is true', 'whentrue'],
            [' ', '%s', '', 'Comment'],
            ['l', '%s', '', 'Comment'],
            [' ', 'Log %s', 'log', 'to the console.']
        ],

        menus: {
            open: ["user profile of", "Project", "Discussion"],
            views: ["Fullscreen", "Player", "Editor"],
        },
    },
    {
        proj_title: function() {
            if(typeof is_creator !== "undefined") {
                return (is_creator) ? document.getElementsByName("title")[0].value : document.getElementById("title").innerHTML;
            } else {
                return false;
            }
        },

        proj_id: function() {
            return project_id;
        },

        info: function() {
            return Scratch.INIT_DATA.PROJECT.model.credits;
        },

        notes: function() {
            return notes;
        },

        /*lst_upd: function() {

        },*/

        shared: function() {
            return shared;
        },

        remixed: function() {
            return remixed;
        },

        sprites: function() {
            return $("#sprite-count").html();
        },

        scripts: function() {
            return $("#script-count").html();
        },

        comments: function() {
            n = $("h4:contains('Comments')").html();
            return n.substring(n.lastIndexOf("(")+1,n.lastIndexOf(")"));
        },

        mode: function() {
            var a = document.URL;
            var b = a.substr((a.length - 7), (a.length - 1));
            switch(b) {
                case "lscreen":
                    return "Fullscreen";
                case "#editor":
                    return "Editor";
                default:
                    return "Player";
            }
        },

        switch_to: function(mode) {
            var url = document.URL;
            var hash = window.location.hash.toLowerCase();
            mode = mode.toLowerCase();

            if(mode == "fullscreen" || mode == "player" || mode == "editor") {
                if(hash !== "") {
                    window.location = url.replace(hash, '#' + mode);
                } else {
                    window.location = url + '#' + mode;
                }
            }
        },

        fullscreen: function() {
            var url = document.URL;
            var hash = window.location.hash.toLowerCase();

            if(hash == "#player") {
                window.location = url.replace(hash, '#fullscreen');
            }
            else if(hash == "#fullscreen") {
                window.location = url.replace(hash, "#player");
            }
            else if (hash !== "#editor"){
                window.location = url + "#fullscreen";
            }
        },

        s_clip: function(str, callback) {
            swal({
                  title: "Clipboard",
                  text: "Do you want to copy '" + str + "' to your clipboard?",
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "Yes, copy it!"
            }, function(isConfirm){
                if (isConfirm) {
                    GM_setClipboard(str);
                    callback();
                } else {
                    callback();
                }
            });
        },

        // I couldn't find a solution to read the clipboard without a paste event in Chrome, so I'll leave it disabled.
        /*r_clip: function() {
            console.log(unsafeWindow.clipboardData.getData("Text"));
            return unsafeWindow.clipboardData.getData("Text");
        },*/

        title: function() {
            return document.title;
        },

        set_tab: function(str) {
            document.title = str;
        },

        tab_visible: function() {
            return document.visibilityState === "visible";
        },

        hash: function(index) {
            if (window.location.hash.indexOf('%23') > -1) {
                return window.location.hash.replace(/(#editor)|(#player)|(#fullscreen)/g, '').split('#').join('').split('%23').slice(1)[index - 1];
            } else {
                return window.location.hash.replace(/(#editor)|(#player)|(#fullscreen)/g, '').split('#').slice(1)[index - 1];
            }
        },
        
        php_get: function(param) {
            return $_GET[param];
        },

        TGB_open: function(type, src, callback) {
            switch(type) {
                case "user profile of":
                    var new_type = "users";
                    break;
                case "Project":
                    if(isNaN(src)) {
                        callback();
                        return;
                    }
                    new_type = "projects";
                    break;
                case "Discussion":
                    if(isNaN(src)) {
                        callback();
                        return;
                    }
                    new_type = "discuss/topic";
                    break;
            }
            swal({
                  title: "Open" + (type == 'user profile of') ? 'User Profile' : type,
                  text: "Do you want to open the profile of '" + src + "' in a new tab?",
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "Yes, open it!"
            }, function(isConfirm){
                if (isConfirm) {
                    window.open('http://scratch.mit.edu/' + new_type + '/' + src);
                    callback();
                } else {
                    callback();
                }
            });
        },

        log: function(msg) {
            console.log(msg);
        },

        /*YTplayer;
        youtube: function(videoID, x, y) {
            $("#YTplayer").remove();
            $(".stage").append('<div id="YTplayer"></div>');
            YT_style(x, y);
            YTplayer = new YT.Player('YTplayer', {
                height: '360',
                width: '480',
                videoId: videoID,
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        },*/

      when_true: function(bool) {return bool;}
    }),

    Sensing: new Extension(
    "Sensing",
    {
        blocks: [
            ['h', 'when key %m.keys is pressed', 'h_check_key', 'shift'],
            ['-'],
            ['b', '%m.keys key pressed?', 'check_key', 'shift'],
            ['b', '%n key pressed?', 'check_key', 17],
            ['-'],
            ['r', 'Which key is pressed?', 'which_key']
        ],

        menus: {
            keys: ['shift', 'ctrl', 'enter', 'backspace', 'alt', 'tab', 'caps', 'esc', 'any'],
        }
    },
    {
        h_check_key: function(key) {
            if(document.activeElement === $('object#scratch')[0]) { //Check if Flash is focused. (Security Measure)
                if(!last_h_value && menuCheck(key) === true) {
                    last_h_value = true;
                    return true;
                } else {
                    last_h_value = false;
                    return false;
                }
            } //else isn't necessary here!
        },

        check_key: function(key_code) {
            if(document.activeElement === $('object#scratch')[0]) {
                if (isNaN(Number((key_code)))) {
                    return menuCheck(key_code);
                } else {
                    return isKeyPressed(key_code);
                }
            } else {
                return false;
            }
        },

        which_key: function() {
            if(document.activeElement === $('object#scratch')[0]) {
                key = keysPressed.indexOf(true);
                return key;
            } else {
                return -1;
            }
        }
    }, "Pro Tip: Try to use these as less as you can, they can be very laggy!", 1),

    Speech: new Extension(
    "Speech",
    {
        blocks: [
            ['r', 'Voice', 'voice_lang'],
            ['-'],
            [' ', 'Set voice to %m.voices', 'set_voice', 'Google US English'],
            [' ', 'Set voice to %n', 'set_voice'],
            ['-'],
            [' ', 'Speak %s', 'speak_text', 'You are ' + ((typeof data !== "undefined") ? data.user.username : "a visitor")],
            ['w', 'Speak %s and wait', 'speak_wait', 'You are a ' + (scratcher ? 'Scratcher' : 'New Scratcher')],
            ['-'],
            [' ', 'Pause speech', 'pause_voice'],
            [' ', 'Resume speech', 'resume_voice'],
            [' ', 'Cancel speech', 'cancel_voice'],
            ['-'],
            ['b', 'Speaking?', 'check_speech']
        ],

        menus: {
            voices: _get_voices(),
        }
    },
    {
        //This script was started by Sayamindu, I finished and improved it!
        voice_lang: function() {
            return lang;
        },

        speak_text: function (text) {
            var say = new SpeechSynthesisUtterance(text.toString()),
                voices = window.speechSynthesis.getVoices();
            say.voice = voices.filter(function(voice) { return voice.name == lang; })[0];
            speechSynthesis.speak(say);
        },

        set_voice: function(gname) {
            var g = parseInt(gname, 10),
                voices = speechSynthesis.getVoices();
            lang = (isNaN(g) === false) ? ((0 < g <= voices.length) ? voices[g - 1].name : console.log("Voice #" + g + " not found.")) : lang = gname;
        },

        pause_voice: function () {
            speechSynthesis.pause();
        },

        resume_voice: function () {
            speechSynthesis.resume();
        },

        cancel_voice: function () {
            speechSynthesis.cancel();
        },

        check_speech: function() {
            return speechSynthesis.speaking;
        },

        speak_wait: function (text, callback) {
            this.speak_text(text);
            waitfor(this.check_speech, false, 100, function() {
                callback();
            });
        }
    }),

    Strings: new Extension(
    "Strings",
    {
        blocks: [
            ['r', 'Substring of %s starting at %n to %n', 'sub_string', 'Constructor', 1, 9],
            ['-'],
            ['b', '%s %m.str_checks %s', 'string_checks', 'Car Jack', 'contains', 'Jack'],
            ['b', 'Is %s %m.uplow ?', 'up_low', 'STRING', 'uppercase'],
            ['r', '%m.str_functions %s', 'string_functions', 'Capitalize', 'scratch'],
            ['-'],
            //['r', 'Place %n that %s is in %s', 'nth_occurence', '2', 'can', 'Can a can can a can?'], "ToDo" block.
            ['r', 'Times %s is in %s', 'times_is_in', 'can', 'Can a can can a can?'],
            ['r', '%s find %s starting at position %n', 'find_starting_at', 'Apple', 'p', 3],
            ['-'],
            ['r', 'Replace letters %n to %n of %s with %s', 'replace_substr', 1, 5, "Hello World", "Hi"],
            ['r', 'Replace every %s with %s in %s', 'replace_every', 'u', 'a', 'cut'],
            ['r', 'Repeat %s %n times separated by %s', 'repeat', 'Scratch', 2],
            ['r', 'Pad %s with %s until it has length %n', 'pad', 1, 0, 2],
            ['-'],
            ['r', 'Word %n of %s', 'word', 2, 'Good Morning!'],
            ['r', 'Words in %s', 'word_amount', 'Scratch Day'],
            ['r', '# of word %s in %s', 'word_pos', 'year!', 'Happy new year!'],
            ['-'],
            ['r', 'Unicode of letter %n of %s', 'to_unicode', 1, 'Unicode'],
            ['r', 'Unicode %s as letter', 'from_unicode', 49],
            ['r', 'Binary of %s', 'toBinary', 'Scratch'],
            ['r', 'ASCII of %s', 'toAscii', '01000001']
        ],

        menus: {
            str_checks: ["contains", "starts with", "ends with"],
            uplow: ["uppercase", "lowercase", "alphanumeric", "mixed Lower & Upper cases"],
            str_functions: ["Capitalize", "Capitalize All Of", "Uppercase", "Lowercase", "Reverse", "Shuffle", "Trim blanks of"],
        }
    },
    {
        sub_string: function(a, b, c) {
            a = String(a);
            return a.substring((b - 1), c);
        },

        string_checks: function(str1, type, str2) {
            switch(type) {
                case "contains":
                    return contains(str1, str2);
                case "starts with":
                    return startsWith(str1, str2);
                case "ends with":
                    return endsWith(str1, str2);
            }
        },

        up_low: function(str, cases) {
            str = String(str);
            switch(cases) {
                case "uppercase":
                    return str === str.toUpperCase();
                case "lowercase":
                    return str === str.toLowerCase();
                case "mixed Lower & Upper cases":
                    return str !== str.toUpperCase() && str !== str.toLowerCase();
                case "alphanumeric":
                    return /^[\w\d]*$/.test(str);
            }
        },

        string_functions: function(type, str) {
           str = String(str);
           switch(type) {
               case "Capitalize":
                   return capitalizeFirstLetter(str);
               case "Capitalize All Of":
                   return capitalize(str);
               case "Uppercase":
                   return str.toUpperCase();
               case "Lowercase":
                   return str.toLowerCase();
               case "Reverse":
                   return reverse(str);
               case "Shuffle":
                   return shuffle(str);
               case "Trim blanks of":
                   return str.trim();
            }
        },

        times_is_in: function(a, b) {
            return b.match(new RegExp(a, "g")).length;
        },

        find_starting_at: function (a, b, c) {
            return a.indexOf(b, parseInt(c) - 1) + 1;
        },

        replace_substr: function(a, b, str, sub_string) {
            return str.substr(0, a - 1) + sub_string + str.substr(b);
        },

        replace_every: function(a, b, str) {
            return str.split(a).join(b);
        },

        repeat: function (str, times, sep) {
            if(times > 0) {
                times = Math.round(times);
                var result = str;
                for(i = 1; i < times; i++) {
                    result += sep + str;
                }
                return result;
            } else {
                return "";
            }
        },

        //Chance.js Function
        pad: function (number, pad, width) {
            // Default pad to 0 if none provided
            pad = pad || '0';
            // Convert number to a string
            number = number + "";
            return number.length >= width ? number : new Array(width - number.length + 1).join(pad) + number;
         },

        word: function(n, str) {
            if(!isNaN(n)) {
                n = Math.round(n);
                var words = str.split(" ");
                return words[n - 1];
            } else {
                return "";
            }
        },

        word_amount: function(str) {
            return str.split(" ").length;
        },

        word_pos: function(word, str) {
            console.log(str.split(" "));
            return str.split(" ").indexOf(word) + 1;
        },

        to_unicode: function(n, str) {
          return str.charCodeAt(n-1);
        },

        from_unicode: function(u) {
          if(u < 1) {
              return 'undefined';
          }
          return String.fromCharCode(Number(u));
        },

        toAscii: function(bin) {
            return bin.replace(/\s*[01]{8}\s*/g, function(bin) {
                return String.fromCharCode(parseInt(bin, 2));
            });
        },

        toBinary: function(str, spaceSeparatedOctets) {
            return str.replace(/[\s\S]/g, function(str) {
                str = zeroPad(str.charCodeAt().toString(2));
                return (!1 == spaceSeparatedOctets) ? str : str + " ";
            });
        }
    }, "Pro Tip: All String blocks are case sensitive!"),

    UI: new Extension(
    "UI",
    {
        blocks: [
            ['w', 'TGBox Title:%s Description:%s', 'TGBox_in', 'Coolness +1!', 'Installed TGB\'s extensions!'],
            ['-'],
            ['w', 'Alert Title:%s Description:%s %m.alerts', 'SweetAlert', 'Congratulations!', 'You leveled up your programming skills!', 'success'],
            //['R', 'Prompt ᴛɪᴛʟᴇ:%s ᴅᴇsᴄʀɪᴘᴛɪᴏɴ:%s ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ:%s ᴅᴇғᴀᴜʟᴛ:%s', 'SweetPrompt', 'Hi!', 'How are you?', 'Write your mood here!', 'I\'m feeling AWESOME!'], Disabled for now. Prompt version of SweetAlert needs a redo.
            ['R', 'Confirm Title:%s Description:%s Yes:%s No:%s %m.confirm', 'SweetConfirm', 'Attention!', 'Do you really want to do this?', 'Yes', 'No', 'warning'],
            ['-'],
            [' ', 'Alert %s', 'alert', 'Imagine, Create, Share!'],
            ['r', 'Prompt %s', 'prompt', 'How are you?'],
            ['b', 'Confirm %s', 'confirm', 'Are you sure?']
        ],
        menus: {
            alerts: ['', 'success', 'error', 'warning', 'info'],
            confirm: ['warning', 'info', '']
        }
    },
    {
        TGBox_in: function(title, description, callback) {
            if($("#TGBox").length) {
                if ($("#TGBox").css("left") !== "-247px") {
                    TGBox_out();
                }
                if ($("#TGBox").css("left") == "0px") {
                    setTimeout(function() {
                        TGBox_in_helper(title, description);
                    }, 1500);
                } else {
                    TGBox_in_helper(title, description);
                }
            } else {
                create_TGBox(title, description);
                TGBox_in_helper(title, description);
            }
            callback();
            $("#TGBox").click(function() {
                TGBox_out();
            });
        },

        SweetAlert: function(title, description, type, callback) {
            swal({
                title: title,
                text: description,
                type: type,
                confirmButtonText: "Ok",
                confirmButtonColor: "#DD6B55"
            },
            function() {
                callback();
            });
        },

        /*SweetPrompt: function(title, description, placeholder, dflt, callback) {
            swal({
                type: "prompt",
                title: title,
                text: description,
                promptPlaceholder: placeholder,
                confirmButtonColor: "#DD6B55",
                promptDefaultValue: dflt
            }, function(value){
                callback(value);
            });
        },*/

        SweetConfirm: function(title, description, yes, no, type, callback) {
            swal({
                title: title,
                text: description,
                type: type,
                showCancelButton: true,
                confirmButtonText: yes,
                cancelButtonText: no,
                confirmButtonColor: "#DD6B55"
            }, function(isConfirm){
                  if (isConfirm) {
                      callback(true);
                  } else {
                      callback(false);
                  }
            });
        },

        alert: function(str) {
            alert(str);
        },

        prompt: function(str) {
            return prompt(str);
        },

        confirm: function(str) {
            return confirm(str);
        }
    }, "Prompt and Confirm shouldn't be used inside other UI blocks and Clipboard blocks. A workaround for this is to use variables(or counters) to store their values.", 1),

    User: new Extension(
    "User",
    {
        blocks: [
            ['r', 'User Language', 'get_lang', ''],
            ['r', 'Browser Language', 'get_browser_lang', ''],
            ['r', 'Unread Notifications', 'get_notifications'],
            ['-'],
            ['b', 'New Scratcher?', 'new_scratcher'],
            ['b', 'Creator?', 'creator'],
            ['b', 'Admin?', 'admin'],
            ['-'],
            ['b', 'Online?', 'online']
        ],
    },
    {
        get_lang: function() {
            return getCookie("scratchlanguage");
        },

        get_browser_lang: function() {
            return userLanguage;
        },

        get_notifications: function() {
            return $(".notificationsCount").html();
            // Old way. It was able to return if the user had a new message even before he knew it through the Scratch website,
            // but I don't think the potential extra load on Scratch Servers is not even close to be worth it.
            /*$.get( "http://scratch.mit.edu/messages/ajax/get-message-count/", function(data) {
                notifications = data.msg_count;
                callback(notifications);
            });*/
        },

        new_scratcher: function() {
            return !scratcher;
        },

        creator: function() {
            return (typeof is_creator !== "undefined") ? is_creator : "Unknown Author";
        },

        admin: function() {
            return admin;
        },

        online: function() {
            //"if" and "else" disabled until Firefox version comes out.
            /*if(contains(navigator.userAgent, "Firefox")) {
                return online;
            } else {*/
            return window.navigator.onLine;
            //}
        }
    })
};

TGB.Sensing.onInstall = function() {
    if(keyDetection === false) {
        $(document).on("keyup keydown", function(e) {
            switch(e.type) {
                case "keydown" :
                    keysPressed[e.keyCode] = true;
                    break;
                case "keyup" :
                    keysPressed[e.keyCode] = false;
                    break;
            }
        });

        keyDetection = true;
    }
};

//Run the extensions//////////////////////////////////////////////////////////////////////////
waitfor(SWFready.isResolved, true, 100, function() {
    extensions = Object.getOwnPropertyNames(TGB).sort();
    if(typeof is_creator !== "undefined" && !is_creator) {
        OWstr = $('.overview').html();
        extensionSpecified = OWstr.search(/\[\u262f((\w|\&| |,){1,})\]/) > -1;
    }

    try {
        if(extensionSpecified) {
            chosenExtensions = OWstr.replace(/.(?!(\[?\u262f?((\w|\&| |,){1,})?\]))/g ,'');
            chosenExtensions = chosenExtensions.slice(chosenExtensions.indexOf('\u262f') + 1).split(',');
            for(var a in chosenExtensions) {
                if (chosenExtensions.hasOwnProperty(a)) {
                  chosenExtensions[a] = chosenExtensions[a].trim();
                  if(extensions.indexOf(chosenExtensions[a]) === -1) {
                      extensionSpecified = false;
                      break;
                  }
                }
            }
        }
    } catch(e) {}

    if(versionCompare(GM_info.script.version, GM_getResourceText("version"), {zeroExtend: true}) < 0) {
        toastr["info"]("A new version is available!<br>    <a href='https://monkeyguts.com/696.user.js'>Click here to update!</a>", "  TGB's Extension " + Number(GM_getResourceText("version")) + "!");
    }
    
    setTimeout(function() {
        swal({
            title: "Load TGB's Extension?",
            text: "If so, wait until the project finishes loading\n and then click on the \"Yes!\" button.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!",
            cancelButtonText: 'No! :(',
            closeOnConfirm: false
        }, function(isConfirmed) {
            if(isConfirmed) {
                swal({
                    title: "Loading...",
                    text: "Loading TGB's Extensions",
                    type: "info",
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Ok!",
                    closeOnConfirm: false
                });
                setTimeout(function() {
                    console.log('Loading Extensions...');
                    try {
                        if(extensionSpecified) {
                            for(var i in chosenExtensions) {
                                if (chosenExtensions.hasOwnProperty(i)) {
                                    console.log('Installing extension ' + chosenExtensions[i]);
                                    TGB[chosenExtensions[i]].install();
                                }
                            }
                        } else {
                            for(var ext in extensions) {
                                if (extensions.hasOwnProperty(ext)) {
                                    console.log('Installing extension ' + extensions[ext]);
                                    TGB[extensions[ext]].install();
                                }
                            }
                        }
                    } catch(e) {
                        for(var i in extensions) {
                            if (extensions.hasOwnProperty(i)) {
                                console.log('Installing extension ' + extensions[i]);
                                TGB[extensions[i]].install();
                            }
                        }
                    }
                    console.log('Extensions loaded!');
                    swal({title: "Yay!", text: "The extension was successfully installed!", timer: 3000, type: "success"});
                }, 50);
            }
        });
    }, wait);

    if(Scratch.FlashApp.model.attributes.isPublished === false) {
        JSsetProjectBanner((Scratch.FlashApp.isEditMode) ? 'To share projects using this extension you have to click the "Share" button found on the <a href="' + 'http://scratch.mit.edu/projects/' + Scratch.FlashApp.model.id + '">Project Page</a>.' : 'To share projects using this extension you have to click the "Share" button found on this page.');
    }

    if(typeof is_creator !== "undefined") {
        overviewHtml = ($('#info textarea').html() === null) ? $('.overview::lt(1)').html() : $('#info textarea').html();
        searchAddition = (overviewHtml.search(/&lt;\u262f\d{1}|\d{2}&gt;/) < 0) ? false : (overviewHtml.search(/&lt;\u262f\d{1}&gt;/) > -1) ? overviewHtml.search(/&lt;\u262f\d{1}&gt;/) : overviewHtml.search(/&lt;\u262f\d{2}&gt;/);
        numberAddition = (overviewHtml.search(/&lt;\u262f\d{1}&gt;/) > -1) ? Number(overviewHtml.charAt(searchAddition + 5)) : Number(overviewHtml.substr(searchAddition + 5, searchAddition + 6));

        if(searchAddition !== false) {
            if(overviewHtml.search(/&lt;\u262f\d{1}&gt;/ > -1)) {
                $('.overview::lt(1)').html(overviewHtml.replace(overviewHtml.slice(searchAddition).slice(0, 10), ''));
            } else {
                $('.overview::lt(1)').html(overviewHtml.replace(overviewHtml.slice(searchAddition).slice(0, 11), ''));
            }
            $('textarea[name=content]').focus( function(){
                JSsetProjectBanner(commentAddition[numberAddition - 1]);
            });
        }
    }
});
