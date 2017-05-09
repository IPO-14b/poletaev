module.exports = function(grunt) {
    'use strict';

    grunt.loadNpmTasks('assemble-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-uglify');


    require('matchdep').filterDev('grunt-!(cli)').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        copy: {
            main: {
                files: [
                    {src: ["src/index.html"], dest: "build/index.html"}
                ]
            }
        },
        browserify: {
            dev: {
                options: {
                    browserifyOptions: {
                        debug: true
                    },
                    transform: [
                        ["babelify", {presets: ["es2015", "stage-0", "react"]}]
                    ]
                },
                dest: "build/main.js",
                src: "src/main.js"
            },
            production: {
                options: {
                    browserifyOptions: {
                        debug: false
                    },
                    transform: [
                        ["babelify", {presets: ["es2015", "stage-0", "react"]}],
                        "envify",
                        "uglifyify",
                    ]
                },
                dest: "build/main.js",
                src: "src/main.js"
            }
        },

        less: {
            dev: {
                files: {
                    'build/css/elements.css': 'src/less/elements.less',
                    'build/css/app.css': 'src/less/app.less'
                }
            },
            production: {
                files: {
                    'build/css/elements.css': 'src/less/elements.less',
                    'build/css/app.css': 'src/less/app.less'
                },
                options: {
                    compress: true,
                    optimization: 1024
                }
            }
        },

        watch: {
            scripts: {
                files: "src/*.js",
                tasks: ["browserify"]
            },
            less: {
                files: ['src/less/**/*.less'],
                tasks: ['less'],
            },
            html: {
                files: ["src/index.html"],
                tasks: ["copy"]
            }
        },

        uglify: {
            production: {
                files: { 'build/main.js': 'build/main.js' } 
            }
        }
    });

    grunt.registerTask('default', ['copy', 'less:dev', 'browserify:dev']);
    grunt.registerTask('dev', ['default', 'watch']);
    grunt.registerTask('production', ['copy', 'less:production', 'browserify:production', 'uglify']);
};
