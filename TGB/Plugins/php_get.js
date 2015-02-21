/*!
 * GET URL Parsing
 * September 24, 2009
 * Corey Hart @ http://www.codenothing.com
 */
;(function(window){
var
    // Storage of param keys to values
    $_GET = window.$_GET = {},
    // Storage of vanity slices
    $_VAN = window.$_VAN = {},
    // Faster Referencing
    location = window.location,
    // Query String of the URL
    search = location.search,
    // Href for Vanity URL's
    href = location.href,

    /* Parsing */
    // Remove the '?'
    index = search.indexOf('?') != -1 ? search.indexOf('?') + 1 : 0,
    // Separate by ampersand
    get = search.substr(index).split('&'),
    // For vanity URL's, remove the host and store in array form split on the href's slash
    vanity = href.replace(/^https?:\/\/(.*?)\//i, '').replace(/\?.*$/i, '').split('/');

    // Loop through each key/value pair
    for (var i in get){
        var split = get[i].split('=');
        // Store non-value as a null instead of undefined to
        // differentiate between key existing and value existing
        $_GET[split[0]] = split[1]||null;
    }

    // Loop through hashed url for splitting
    for (var i in vanity)
        // Again, store non-value as a null instead of undefined
        $_VAN[i] = vanity[i]||null;
})(window);
