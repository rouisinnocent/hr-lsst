var source = './src/';
var dist = './dist/';
var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('./config/tsconfig.json');
var stylus = require('gulp-stylus');
var bsync = require('browser-sync').create();

gulp.task('bsync:init', (done) => {
    bsync.init({
        server: {
            baseDir: './dist',
            index: 'html/index.html'
        }
    });
    done();
});

gulp.task('reload', (done) => {
    bsync.reload();
    done();
})

gulp.task('compile:typescript', () => {
    return gulp
        .src(source + '/ts/**/*.ts')
        .pipe(tsProject())
        .js
        .pipe(
        gulp.dest(dist + 'js/')
        )
});

gulp.task('compile:stylus', () => {
    return gulp
        .src(source + 'stylus/**/*.styl')
        .pipe(stylus())
        .pipe(
        gulp.dest(dist + 'css/')
        )
});

gulp.task('copy:html', () => {
    return gulp
        .src(source + 'html/**/*.html')
        .pipe(
        gulp.dest(dist + 'html/')
        )
});

gulp.task('watch', (done) => {
    gulp.watch(
        source + 'ts/**/*.ts',
        gulp.series('compile:typescript', 'reload')
    );
    gulp.watch(
        source + 'stylus/**/*.styl',
        gulp.series('compile:stylus', 'reload')
    );
    gulp.watch(
        source + 'html/**/*.html',
        gulp.series('copy:html', 'reload')
    );
    done();
})

gulp.task(
    'default',
    gulp.series(
        'bsync:init',
        'watch',
        gulp.parallel('compile:typescript', 'compile:stylus', 'copy:html')
    )
);
