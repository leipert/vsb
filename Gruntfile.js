'use strict';
/* jshint camelcase: false, node: true */

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

/**
 * Explaining grunt dependencies
 *
 *
 *
 */

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        appRoot: 'app',
        distRoot: 'dist',

        pkg: grunt.file.readJSON('package.json'),
        bowerRC: grunt.file.readJSON('.bowerrc'),

        /**
         We do not need to write a dynamic config file for now.
         //configFile: grunt.file.readJSON('config.json'),
         **/
        writefile: {
            options: {
                data: {
                    version: '<%= pkg.version %>',
                    builtDate: '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>'
                }
            },
            configFile: {
                src: 'grunt_templates/template.hbs',
                dest: 'path/to/config/file.js'
            }
        },

        /** Parse CHANGELOG.md to a HTML file **/
        markdown: {
            changeLog: {
                files: [
                    {
                        expand: true,
                        src: 'CHANGELOG.md',
                        dest: 'app/',
                        ext: '.html'
                    }
                ]
            }
        },

        /* Watches files for changes and runs tasks based on the changed files */
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep', 'injector']
            },
            js: {
                files: [
                    '<%= appRoot %>/js/**/*.js'
                ],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: true
                }
            },
//      TODO: Implement as soon as we have tests running
//      jsTest: {
//        files: ['test/spec/{,*/}*.js'],
//        tasks: ['newer:jshint:test', 'karma']
//      },
            css: {
                files: ['<%= appRoot %>/css/**/*.css'],
                tasks: ['newer:copy:css', 'autoprefixer']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= appRoot %>/**/*.html',
                    '.tmp/css/**/*.css',
                    '<%= appRoot %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        /* Grunt Server Settings */
        connect: {
            options: {
                port: 9002,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    middleware: function (connect, options) {
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        // Setup the proxy
                        var middlewares = [require('grunt-connect-proxy/lib/utils').proxyRequest];

                        // Serve static files.
                        options.base.forEach(function (base) {
                            middlewares.push(connect.static(base));
                        });

                        // Make directory browse-able.
                        var directory = options.directory || options.base[options.base.length - 1];
                        middlewares.push(connect.directory(directory));

                        return middlewares;
                    },
                    open: true,
                    base: [
                        '.tmp',
                        '<%= appRoot %>'
                    ]
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '.tmp',
                        'test',
                        '<%= appRoot %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= distRoot %>'
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= appRoot %>/js/**/*.js'
            ]
            //], TODO: Deactivated camelCase for tests for now
            //test: {
            //    options: {
            //        jshintrc: 'test/.jshintrc'
            //    },
            //    src: ['test/spec/**/*.js']
            //}
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= distRoot %>/*',
                            '!<%= distRoot %>/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp'
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 3 version', 'ie > 9']
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/css/',
                        src: '**/*.css',
                        dest: '.tmp/css/'
                    }
                ]
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['<%= appRoot %>/index.html'],
                exclude: [
                    'es5-shim.js', //Deactivated as we do not want to support ie9
                    'jassa', //Deactivated as we will add it manually
                    'bootstrap.js' //Deactivated as we do not need it
                ],
                ignorePath: '<%= appRoot %>/'
            }
        },

        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= distRoot %>/js/**/*.js',
                        '<%= distRoot %>/css/**/*.css'
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= appRoot %>/index.html',
            options: {
                dest: '<%= distRoot %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ['<%= distRoot %>/{,*/}*.html'],
            css: ['<%= distRoot %>/css/{,*/}*.css'],
            options: {
                assetsDirs: ['<%= distRoot %>']
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        cssmin: {
            options: {
//                root: '<%= appRoot %>'
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeComments: true,
                    removeOptionalTags: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= distRoot %>',
                        src: ['*.html'],
                        dest: '<%= distRoot %>'
                    }
                ]
            }
        },

        // ngAnnotate tries to make the code safe for minification automatically by
        // using the Angular long form for dependency injection. It doesn't work on
        // things like resolve or inject so those have to be done manually.
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/concat/js',
                        src: '*.js',
                        dest: '.tmp/concat/js'
                    }
                ]
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            images: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= appRoot %>/images',
                        src: '**/*.{png,jpg,jpeg,gif}',
                        dest: '<%= distRoot %>/images'
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= appRoot %>',
                        dest: '<%= distRoot %>',
                        src: [
                            '*.{ico,png,txt}',
                            '.htaccess',
                            '*.html',
                            'locale.json',
                            'overwrite.js'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '.tmp/images',
                        dest: '<%= distRoot %>/images',
                        src: ['generated/*']
                    },
                    {
                        expand: true,
                        cwd: '<%= bowerRC.directory %>/jassa/',
                        src: ['*.min.js'],
                        dest: '<%= distRoot %>/js/'
                    }
                ]
            },
            css: {
                expand: true,
                cwd: '<%= appRoot %>/css',
                dest: '.tmp/css/',
                src: '**/*.css'
            }
        },

        injector: {
            options: {
                ignorePath: '<%= appRoot %>/',
                addRootSlash: false
            },
            local_dependencies: {
                files: {
                    'app/index.html': ['<%= appRoot %>/js/**/*.js', '<%= appRoot %>/css/**/*.css']
                }
            }
        },

        // TODO: Adjust karma settings
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },

        htmlrefs: {
            dist: {
                src: './dist/index.html',
                dest: './dist/index.html'
            }
        },

        // Find all templates used in angular and inject them into angularjs cache engine
        ngtemplates: {
            'cachedTemplates': {
                cwd: '<%= appRoot %>/',
                src: 'template/**/*.html',
                dest: '.tmp/template.js',
                options: {
                    module: '<%= pkg.name %>',
                    usemin: 'js/main.js',
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true, // Only if you don't use comment directive!
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    }
                }
            }
        }

    });

    grunt.registerTask('serve', function () {
        var target = grunt.option('target') || 'dev';
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }
        grunt.task.run([
            // 'writefile:configFile', At the moment we have a fixed config file
            // 'markdown:changeLog', At the moment we have no Changelog
            'clean:server',
            'injector',
            'wiredep',
            'copy:css',
            'autoprefixer',
            //'configureProxies:server',
            'connect:livereload',
            'watch'
        ]);
    });

    //TODO: Actually implement testing
    grunt.registerTask('test', [
        // 'writefile:configFile', // At the moment we have a fixed config file
        // 'markdown:changeLog', // At the moment we have no Changelog
        // 'clean:server',
        // 'copy:css',
        // 'autoprefixer',
        // 'configureProxies:server',
        // 'connect:test',
        // 'karma'
    ]);

    /**
     *
     * Grunt Build Task. This Task creates a directory dist which contains a deployable app
     *
     */
    grunt.registerTask('build', [
        // 'writefile:configFile', // At the moment we have a fixed config file
        // 'markdown:changeLog', // At the moment we have no Changelog
        'clean:dist',     // Clean Destination Folder
        'injector',       // Automatically at dependencies from bower path (bower.json)
        'wiredep',        // Automatically at dependencies from bower path (bower.json)
        'useminPrepare',  // Prepare minification
        'ngtemplates',    // Concat all templates (template/**/*.html) and put them into the angular template cache
        'copy:images',    // Copy images to Dist
        'copy:css',       // Copy stylesheets to Dist
        'autoprefixer',   // Adds prefixes to css properties (ie -webkit-property, -moz-property)
        'concat',         // Concat styles and scripts into one file
        'ngAnnotate',     // preminify Angular files (i.e. function ($scope) -> ['$scope', function($scope)])
        'copy:dist',      // Copy remaining files to Dist
        'cssmin',         // Minify CSS
        'uglify',         // Minify JS
        'htmlrefs',       // Change minfied Jassa import to revved version
        'rev',            // Create file revisions to force browser reload
        'usemin',         // Replace links to CSS and scripts with revisioned ones in index.html
        'htmlmin'         // Minify HTML
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        // 'test', TODO: Tests are not implemented yet
        'build'
    ]);
};
