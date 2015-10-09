// Karma configuration
// Generated on Mon Jul 21 2014 11:48:34 GMT+0200 (CEST)
module.exports = function (config) {
    config.set({

        // base path used to resolve all patterns (e.g. files, exclude)
        basePath: '',

        // frameworks to use
        frameworks: ['mocha', 'chai-sinon'],

        // list of files / patterns to load in the browser

        files: [
            //start-vendor
            //end-vendor
            'app/bower_components/jassa/jassa.js',
            'app/bower_components/Blob.js/Blob.js',
            'app/**/angular-mocks.js',
            //start-app
            //end-app
            'node_modules/chai-string/chai-string.js',
            'app/**/*.spec.js',
            'app/**/fixtures/**/*.json'
        ],

        // list of files to exclude
        exclude: [
            'app/bower_components/**/*.spec.js'
        ],

        // preprocess matching files before serving them to the browser
        preprocessors: {
            'app/!(bower_components)/**/!(*spec).js': ['coverage'],
            'app/**/fixtures/**/*.json': ['json_fixtures']
        },

        jsonFixturesPreprocessor: {
            // strip this from the file path \ fixture name
            stripPrefix: '.+fixtures/',
            // strip this to the file path \ fixture name
            //prependPrefix: '',
            // change the global fixtures variable name
            variableName: 'fixtures'
        },

        coverageReporter: {
            type: 'html',
            dir: '.tmp/coverage/'
        },

        // test results reporter to use
        reporters: ['progress', 'coverage'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests on file changes
        autoWatch: true,

        // start these browsers
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false

    });
};