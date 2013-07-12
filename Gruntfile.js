module.exports = function(grunt) {
    grunt.initConfig({
        
    	pkg: grunt.file.readJSON('package.json'),
        
        meta : {
          banner :  "/**\n" +
                    "* <%= pkg.title %> - v<%= pkg.version %> - <%= grunt.template.today(\"m/d/yyyy\") %>\n" +
                    "* <%= pkg.homepage %>\n" +
                    "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.authors %>;\n" +

                    "*/",
          lastbuild : "<%= grunt.template.today(\"yyyy/mm/dd hh:ss\") %>"
        },
    
		concat: {
            /* options: { banner: "" }, */
			js: {
				dest: "dist/selectoid.js",
				src: ["src/*.js"]
			}, 
            css: {
                dest: "dist/selectoid.css", 
                src: ["src/selectoid.css"]     
            }
		},
        
		uglify: {
			options: {
                mangle: {
                    "except": ["_", "$", "Selectoid"]
                }
                /*banner: "",*/
            },
			js: {
				src: 'dist/selectoid.js',
				dest: 'dist/selectoid.min.js'
			}
		},
        cssmin: { 
            js: {
                src: 'src/selectoid.css', 
                dest: 'dist/selectoid.min.css' 
            } 
        },
        
        compress: {
            development: {
                options: {
                    mode: "zip",
                    archive: "dist/selectoid.dev.<%= pkg.version %>.zip"
                },
                files: [
                    {
                        cwd: "dist/development",
                        src: ["**"],
                        expand: true,
                        dest: "development"
                    }
                ]
            }
        },
        
        jasmine : {
            src: ["src/*.js"],
            options: {
                vendor: "libs/js/underscore.js",
                //helpers:"", styles:"" 
                specs: [
                    "tests/*.js"
                ]
            }
        },
        
        jshint: {
            options: {
              curly: false,
              eqeqeq: false,
              eqnull: true,
              browser: true,
              globals: {
                jQuery: true,
                _: true,
                $: true
              },
            },
            beforeconcat: ["src/*.js"] // afterconcat: ["dist/*.js"]
        },
        
        watch: {
          scripts: {
            files: ['src/*.js', 'tests/*_test.js'],
            tasks: [
                //'jasmine',
                'jshint:beforeconcat'
                //'livereload'
                ],
            options: {
              nospawn: true,
            },
          },
        },
	});


	//__Load npm tasks__
    
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-css');
    
    // Compressing (ZIP)
    grunt.loadNpmTasks("grunt-contrib-compress");
    
    // Tests
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    
    // Linting
    grunt.loadNpmTasks('grunt-contrib-jshint');
    
    // Live grunt task loader
    grunt.loadNpmTasks('grunt-contrib-watch');


	// basic default task.
	grunt.registerTask('default', ['concat', 'uglify', 'jshint', 'cssmin']);
    
}