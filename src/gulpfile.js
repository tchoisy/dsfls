
var gulp         = require('gulp');
var sass         = require('gulp-sass');

gulp.task('front-sass', function () {
    gulp.src("./sass/master.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest("../web/css/"));
});




gulp.task('dev', ['front-sass'],function(){
    gulp.watch(["./sass/**/**.scss"], ['front-sass']);
})
