'use strict';

module.exports = function(grunt) {

	// 'watch' task를 지원하는 플러그인 로드.
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('watchFile', function() {
        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            watch: {
                scripts: {
                    files: ['js/**/*.js']
                }
            }
        });

        var ACTION_ADDED = "added";
        var ACTION_CHANGED = "changed";
        var ACTION_DELETED = "deleted";
        var FILE_SEPARATOR = "\\";
        var targetPath = "G:" + FILE_SEPARATOR + "dist" + FILE_SEPARATOR;

        var fs = require('fs');

        function copyDirectory(path) {
            if(path.length === 0) return;

            // [0] : 값있는 경우 무시
            var isRootPath = false;
            if(path[0].indexOf(":") !== -1) {
                path.splice(0, 1);
                isRootPath = true;
            }

            var dirPath = "";
            if(isRootPath) {
                dirPath += FILE_SEPARATOR;
            }

            // Array 만큼 폴더 존재 여부 검사하여 폴더 생성
            for(var idx=0; idx<path.length; idx++) {
                dirPath += path[idx];

                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath);
                }

                // 다음을 위해서 넣어줍니다.
                dirPath += FILE_SEPARATOR;
            }// ~for - idx
        }

        function copyFile(sourcePath) {
            console.log("copyFile:" + sourcePath);

            var targetFullPath = targetPath+sourcePath;
            var arrTargetFullPath = targetFullPath.split(FILE_SEPARATOR);

            var stats = fs.lstatSync(sourcePath);

            if(stats.isFile()) {
                var rd = fs.createReadStream(sourcePath);
                arrTargetFullPath.splice(arrTargetFullPath.length - 1, 1);
                copyDirectory(arrTargetFullPath);

                var wr = fs.createWriteStream(targetFullPath);

                rd.pipe(wr);
            }

            if(stats.isDirectory()) {
                console.log("isDirectory");
                copyDirectory(arrTargetFullPath);
            }
        }

        grunt.event.on('watch', function(action, filepath, target) {
            grunt.log.writeln(target + ': ' + filepath + ' has ' + action);

            if(action === ACTION_DELETED) return;
            var stats = fs.lstatSync(filepath);

            if(stats.isFile()) {
                copyFile(filepath);
            }

            if(stats.isDirectory()) {
                copyDirectory((targetPath+filepath).split(FILE_SEPARATOR));
            }

        });

        grunt.task.run('watch');
    });

};

// grunt watchFile