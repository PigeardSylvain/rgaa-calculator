module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    inline: {
      dist: {
        options: {
          cssmin: true,
          tag: '',
          uglify: true
        },
        src: 'src/Calculateur RGAA.html',
        dest: 'dist/Calculateur RGAA.html'
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/Calculateur RGAA.html': 'dist/Calculateur RGAA.html'
        }
      }
    }
  })

  grunt.loadNpmTasks('grunt-inline');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

  // Default task(s).
  grunt.registerTask('default', ['inline', 'htmlmin']);
};
