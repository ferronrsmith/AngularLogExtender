        // Creates an injector function that can be used for retrieving services as well as for dependency injection
        var $injector = angular.injector([ 'ng' ]);

        // Used the $injector defined to retrieve the $filterProvider
        var $filter = $injector.get( '$filter' );

        // used to enable logging globally
        var enableGlobally = false;

        // current browser user agent
        var userAgent = navigator.userAgent;

        // default log methods available
        var defaultLogMethods = ['log', 'info', 'warn', 'debug', 'error', 'getInstance'];

        // list of browsers that support colorify
        var colorifySupportedBrowsers = ['chrome', 'firefox'];

        // flag to activate/deactivate default log method colors
        var useDefaultColors = true;

        // default colours for each log method
        var defaultLogMethodColors = {
            log: 'color: green;',
            info: 'color: blue',
            warn: 'color: #CC9933;',
            debug: 'color: brown;',
            error: 'color: red;'
        };

        /**
         * publicly allowed methods for the extended $log object.
         * this give the developer the option of using special features
         * such as setting a className and overriding log messages.
         * More Options to come.
         * @type {string[]}
         */
        var allowedMethods = defaultLogMethods;

        /**
         * Trims whitespace at the beginning and/or end of a string
         * @param value - string to be trimmed
         * @returns {String} - returns an empty string if the value passed is not of type {String}
         */
        var trimString = function (value) {
            if (itypeof(value) === 'string')
                return value.replace(/^\s*/, '').replace(/\s*$/, '');
            return "";
        };

        /**
        * The itypeof operator returns a string indicating the type of the unevaluated operand.
        * @param val {*}
        **/
        var itypeof = function (val) {
            return Object.prototype.toString.call(val).replace(/(\[|object|\s|\])/g,"").toLowerCase();
        };

        /**
         * checks if a variable is of @type {boolean}
         * @param value
         * @returns {boolean}
         */
        var isBoolean = function (value) {
            return itypeof(value) === 'boolean';
        };
        /**
         * This method checks if a variable is of type {string}
         * and if the string is not an empty string
         * @param value
         * @returns {*|Boolean|boolean}
         */
        var isValidString = function (value) {
            return (itypeof(value) === 'string' && trimString(value) !== "");
        };


        /**
         * checks if @param1 is a substring of @param2
         * @param sub
         * @param full
         * @returns {boolean}
         */
        var isSubString = function(sub, full){
           if(itypeof(sub) === 'string' && itypeof(full) === 'string'){
              if(full.toLowerCase().indexOf(sub.toLowerCase()) != -1){
                  return true;
              }
           }
           return false;
        };


        /**
         * this method checks if useTemplate is truthy and
         * if the log arguments array is equal to 2
         * @param useTemplate
         * @param args
         */
       var validateTemplateInputs = function(useTemplate, args){
            return isBoolean(useTemplate) && useTemplate && args.length == 2;
       };
        /**
       * supplant is a string templating engine that replaces patterns
       * in a string with values from a template object
       * @param template
       * @param values
       * @param {RegExp=} pattern
       **/
        var supplant =  function( template, values, /*{RegExp=}*/pattern ) {
            var criteria1 = itypeof(template) !== 'string' && itypeof(values) !== 'object';
            var criteria2 = itypeof(template) !== 'string' || itypeof(values) !== 'object';
            if(criteria1 || criteria2) {
                return  Array.prototype.slice.call(arguments);
            }

            pattern = itypeof(pattern) === 'regexp' ? pattern : /\{([^\{\}]*)\}/g;

            return template.replace(pattern, function(a, b) {
                var p = b.split('.'),
                    r = values;

                try {
                    for (var s in p) {
                        r = r[p[s]];
                    }
                } catch(e){
                    r = a;
                }

                return (typeof r === 'string' || typeof r === 'number') ? r : a;
            });
        };

        /**
         * checks if the browser is a part of the supported browser list
         * @returns {boolean}
         */
        var isColorifySupported = function(){
           for (var i=0; i < colorifySupportedBrowsers.length; i++){
               if(isSubString(colorifySupportedBrowsers[i], userAgent)){
                  return true;
               }
            }
           return false;
        };

        // stores flag to know if current browser is colorify supported
        var isColorifySupportedBrowser = isColorifySupported();


        /**
         * checks if the log arguments array is of length 1 and the element is a string
         * @param args
         * @returns {boolean}
         */
        var validateColorizeInputs = function(args){
            return (args.length == 1 &&
                        itypeof(args[0]) === 'string');
        };

        /**
         * does minor validation to ensure css string is valid
         * @param value
         * @returns {boolean}
         */
        var validateColorCssString = function(value){
            return (itypeof(value) === 'string' && isSubString(':', value)) ;
        };


        /**
         * takes a string a returns an array as parameters
         * if browser is supported
         * expected outcome $log.log('%c Oh my heavens! ', 'background: #222; color: #bada55');
         * @param message
         * @param colorCSS
         * @param prefix
         * @returns {*[]}
         */
        var colorify  = function( message, colorCSS, prefix ){
            prefix = (itypeof(prefix) === 'string' ? prefix : '') ;
            var canProcess = isColorifySupportedBrowser && validateColorCssString(colorCSS) && itypeof(message) === 'string';
            var output = canProcess ? ('' + prefix + message) : message;
            return canProcess ? ( ["%c" + output, colorCSS] ) :  [output] ;
        };

        /**
         * This method is responsible for generating the prefix of all extended $log messages pushed to the console
         * @param {string=} className - $controller name
         * @returns {string} - formatted string
         */
        var getLogPrefix = function (/**{String=}*/className) {
            var separator = " >> ",
                format = "MMM-dd-yyyy-h:mm:ssa",
                now = $filter('date')(new Date(), format);
            return "" + now + ( (itypeof(className) !== 'string') ? "" : "::" + className) + separator;
        };

