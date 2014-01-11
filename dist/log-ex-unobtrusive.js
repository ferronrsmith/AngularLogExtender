/**
 * Log Unobtrusive Extension v0.0.4-sha.d4c9720
 *
 * Used within AngularJS to enhance functionality within the AngularJS $log service.
 *
 * @original-author  Thomas Burleson
 * @contributor Layton Whiteley
 * @contributor A confused individual <ferronrsmith@gmail.com>
 * @website http://www.theSolutionOptimist.com
 * (c) 2013 https://github.com/lwhiteley/AngularLogExtender
 * License: MIT
 *
 * Modifications made by @contributor Layton Whiteley:
 * - Modified to be a full stand-alone Angular Application for reuse
 * - Has global and feature level activation/disabling for $log
 * - Created and tested with AngularJS v.1.2.3
 */
angular.module("log.ex.uo", []).provider('logEx', ['$provide',
    function($provide) {

        // Creates an injector function that can be used for retrieving services as well as for dependency injection
        var $injector = angular.injector(['ng']);

        // Used the $injector defined to retrieve the $filterProvider
        var $filter = $injector.get('$filter');

        var enableGlobally = false;

        // methods as object [constant]
        var lm = {
            log: 'log',
            info: 'info',
            warn: 'warn',
            error: 'error',
            debug: 'debug'
        };
        // default log methods available
        var defaultLogMethods = [lm.log, lm.info, lm.warn, lm.debug, lm.error, 'getInstance'];

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
        var trimString = function(value) {
            if (angular.isString(value))
                return value.replace(/^\s*/, '').replace(/\s*$/, '');
            return "";
        };
        /**
         * checks if a variable is of @type {boolean}
         * @param value
         * @returns {boolean}
         */
        var isBoolean = function(value) {
            return typeof value == 'boolean';
        };
        /**
         * This method checks if a variable is of type {string}
         * and if the string is not an empty string
         * @param value
         * @returns {*|Boolean|boolean}
         */
        var isValidString = function(value) {
            return (angular.isString(value) && trimString(value) !== "");
        };

        /**
         * This method is responsible for generating the prefix of all extended $log messages pushed to the console
         * @param {string=} className - $controller name
         * @returns {string} - formatted string
         */
        var getLogPrefix = function( /**{String=}*/ className) {
            var formatMessage = "";
            var separator = " >> ";
            var format = "MMM-dd-yyyy-h:mm:ssa";
            var now = $filter('date')(new Date(), format);
            if (!isValidString(className)) {
                formatMessage = "" + now + separator;
            } else {
                formatMessage = "" + now + "::" + className + separator;
            }
            return formatMessage;
        };


        // Register our $log decorator with AngularJS $provider
        //scroll down to the Configuration section to set the log settings
        $provide.decorator('$log', ["$delegate",
            function($delegate) {
                /** 
                 * Encapsulates functionality to extends $log and expose additional functionality
                 **/
                var logEnhancerObj = function() {
                    /**
                     * processUseOverride returns true if the override flag is set.
                     * this is used to activate the override functionality.
                     * @param override
                     * @returns {}
                     */
                    var processUseOverride = function(override) {
                        return isBoolean(override);
                    };

                    /**
                     * processOverride only takes true or false as valid input.
                     * any other input will resolve as true.
                     * this function is used to override the global flag for displaying logs
                     * */
                    var processOverride = function(override) {
                        return override !== false;
                    };

                    /**
                     * This method checks if the global enabled flag and the override flag are set as type {boolean}
                     * variables. If both are set it returns the value of the override flag to control $log outputs
                     * @param {boolean} enabled
                     * @param {boolean} override
                     * @returns {boolean}
                     */
                    var activateLogs = function(enabled, override) {
                        if (isBoolean(enabled) && isBoolean(override)) {
                            return override;
                        }
                        return false;
                    };

                    /**
                     * This method handles printing out a message to indicate if a $log instance is using an override
                     * if logging is disabled globally & an override of true is set,
                     *  then a message will be displayed for the specific $log instance
                     * if logging is enabled globally & an override of false is set,
                     *  then a message will be displayed for the specific $log instance
                     * @param _$log
                     * @param useOverride
                     * @param _override
                     * @param className
                     * @param enabled
                     */
                    var printOverrideLogs = function(_$log, useOverride, _override, className, enabled) {
                        var instance = (isValidString(className)) ? className : "this instance";
                        if (!enabled && useOverride && _override) {
                            _$log.log(getLogPrefix() + "[OVERRIDE] LOGGING ENABLED - $log enabled for " + instance);
                        } else if (enabled && useOverride && !_override) {
                            _$log.log(getLogPrefix() + "[OVERRIDE] LOGGING DISABLED - $log disabled for " + instance);
                        }
                    };

                    /**
                     * Converts an array to a object literal
                     * @param arr
                     * @returns {{getInstance: (exports.packets.noop|*|container.noop|noop|)}}
                     */
                    var arrToObject = function(arr) {
                        var result = {};
                        if (angular.isArray(arr)) {
                            result = {
                                getInstance: angular.noop
                            };
                            angular.forEach(arr, function(value) {
                                result[value] = angular.noop;
                            });
                        }
                        return result;
                    };

                    /**
                     * This generic method builds $log objects for different uses around the module
                     * and AngularJS app. It gives the capability to specify which methods to expose
                     * when using the $log object in different sections of the app.
                     * @param {Object} oSrc
                     * @param {Array=} aMethods
                     * @param {Function=} func
                     * @param {Array=} aParams
                     * @returns {{}}
                     */
                    var createLogObj = function(oSrc, aMethods, /**{Function=}*/ func, /**{*Array=}*/ aParams) {
                        var resultSet = {},
                            oMethods = arrToObject(aMethods);
                        angular.forEach(defaultLogMethods, function(value) {
                            var res;
                            if (angular.isDefined(aParams)) {
                                var params = [];
                                angular.copy(aParams, params);
                                params.unshift(oSrc[value]);
                                res = func.apply(null, params);
                            } else {
                                res = oSrc[value];
                            }
                            //        console.log(angular.isUndefined(oMethods[value]), oMethods);
                            resultSet[value] = angular.isUndefined(oMethods[value]) ? angular.noop : res;
                        });
                        //    console.log(resultSet);
                        return resultSet;
                    };
                    /**
                     * Contains functionality for transforming the AngularJS $log
                     * returns extended $log object
                     * @param $log {Object}
                     **/
                    var enhanceLogger = function($log) {

                        /**
                         * Partial application to pre-capture a logger function
                         * @param logFn     - $log instance
                         * @param className - name of the $controller class
                         * @param override
                         * @param useOverride
                         * @returns {Function}
                         */
                        var prepareLogFn = function(logFn, className, override, useOverride) {
                            var enhancedLogFn = function() {
                                var activate = (useOverride) ? activateLogs(enabled, override) : enabled;
                                if (activate) {
                                    var args = Array.prototype.slice.call(arguments);
                                    var formatMessage = getLogPrefix(className);
                                    args.unshift(formatMessage);
                                    if (logFn) logFn.apply(null, args);
                                }
                            };

                            // Only needed to support angular-mocks expectations
                            enhancedLogFn.logs = [];
                            return enhancedLogFn;
                        };

                        /**
                         * Capture the original $log functions; for use in enhancedLogFn()
                         * @type {*}
                         * @private
                         */
                        var _$log = createLogObj($log, allowedMethods);


                        /**
                         * Support to generate class-specific logger instance with/without className or override
                         * @param {string=} className - Name of object in which $log.<function> calls is invoked.
                         * @param {boolean=} override - activates/deactivates component level logging
                         * @returns {*} $log instance
                         */
                        var getInstance = function( /*{string=}**/ className, /**{boolean=}*/ override) {
                            if (isBoolean(className)) {
                                override = className;
                                className = null;
                            } else if (angular.isString(className)) {
                                className = trimString(className);
                            } else {
                                className = null;
                            }
                            var useOverride = processUseOverride(override);
                            override = processOverride(override);
                            printOverrideLogs(_$log, useOverride, override, className, enabled);
                            return createLogObj(_$log, allowedMethods, prepareLogFn, [className, override, useOverride]);
                        };


                        //declarations and functions , extensions
                        var enabled = false;

                        /** 
                         * Extends the $log object with the transformed native methods
                         * @param $log
                         * @param function (with transformation rules)
                         **/
                        angular.extend($log, createLogObj($log, allowedMethods, prepareLogFn, [null, false, false]));

                        /**
                         * Extend the $log with the {@see getInstance} method
                         * @type {getInstance}
                         */
                        $log.getInstance = getInstance;

                        /**
                         * The following method enable/disable logging globally
                         * @param flag {boolean} - boolean flag specifying if log should be enabled/disabled
                         */
                        $log.enableLog = function(flag) {
                            enabled = flag;
                        };

                        /**
                         * The following returns the status of the {@see enabled}
                         * @returns {boolean}
                         */
                        $log.logEnabled = function() {
                            return enabled;
                        };
                        return $log;
                    };
                    //---------------------------------------//

                    /**
                     * The following function exposes the $decorated logger to allow the defaults to be overridden
                     * @param $log
                     * @returns {*}
                     */
                    var exposeSafeLog = function($log) {
                        return createLogObj($log, allowedMethods);
                    };
                    // add public methods to logEnhancerObj
                    this.enhanceLogger = enhanceLogger;
                    this.exposeSafeLog = exposeSafeLog;
                };
                //=======================================================================//
                // Configuration Section
                //=======================================================================//
                var logEnhancer = new logEnhancerObj();
                logEnhancer.enhanceLogger($delegate);

                // ensure false is being passed for production deployments
                // set to true for local development
                $delegate.enableLog(enableGlobally);

                if ($delegate.logEnabled()) {
                    $delegate.log("CONFIG: LOGGING ENABLED GLOBALLY");
                }
                return logEnhancer.exposeSafeLog($delegate);
            }
        ]);


        // Provider functions that will be exposed to allow overriding of default $logProvider functionality

        /**
         * Enables/disables global logging
         * @param flag
         */
        var enableLogging = function(flag) {
            enableGlobally = isBoolean(flag) ? flag : false;
        };

        var restrictLogMethods = function(arrMethods) {
            if (angular.isArray(arrMethods)) {
                // TODO: should do validation on this to ensure valid properties are passed in
                allowedMethods = arrMethods;
            }
        };

        var overrideLogPrefix = function(logPrefix) {
            if (angular.isFunction(logPrefix)) {
                // TODO : Validation of the function to ensure it's of the correct format etc
                // TODO : Might want to allow memoization of the default functionality and allow easy toggling of custom vs default
                getLogPrefix = logPrefix;
            }
        };
        /**
         * default $get method necessary for provider to work
         * not sure what to do with this yet
         **/
        this.$get = function() {
            return {
                name: 'Log Unobtrusive Extension',
                version: '0.0.4-sha.d4c9720',
                enableLogging: enableLogging,
                restrictLogMethods: restrictLogMethods,
                overrideLogPrefix: overrideLogPrefix
            };
        };

        /**
         * used externally to enable/disable logging globally
         * @param flag {boolean}
         **/
        this.enableLogging = enableLogging;

        /**
         * Modify the default log prefix
         **/
        this.overrideLogPrefix = overrideLogPrefix;

        /**
         * Configure which log functions can be exposed at runtime
         */
        this.restrictLogMethods = restrictLogMethods;

    }
]);
