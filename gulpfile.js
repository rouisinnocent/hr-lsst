var gulp = require('gulp');
var ts = require('gulp-typescript');
var ts_project = ts.createProject('config/tsconfig.json');
var styl = require('gulp-stylus');
var bsync = require('browser-sync').create();
var del = require('del');
var path = require('path');

var source = 'src/';
var dist = 'dist/';
var index = 'html/index.html';
var styl_files = source + 'styl/**/*.styl';
var ts_files = source + 'ts/**/*.ts';
var other_files = source + '**/!(*.styl|*.ts)';

var routing = {
    'styl': 'css',
    'ts': 'js'
}

function compiler_error(err){
    this.emit('end');
    console.log('#'.repeat(20));
    console.log(err);
    console.log('#'.repeat(20));    
}


gulp.task('bsync:init', (done) => {
    bsync.init({
        server: {
            baseDir: dist,
            index: index
        }
    });
    done();
});

gulp.task('compile:stylus', () => {
    return gulp
        .src(styl_files)
        .pipe(styl())
        .on('error',compiler_error)
        .pipe(
            gulp.dest(
                dist + '/css'
            )
        );
});

gulp.task('compile:typescript', () => {
    return gulp
        .src(ts_files)
        .pipe(ts_project())
        .js
        .on('error',compiler_error)
        .pipe(
            gulp.dest(
                dist + '/js'
            )
        );
 });

gulp.task('copy', () => {
    return gulp
        .src([
            source + '**/*',
            '!' + source + 'styl/**/*',
            '!' + source + 'styl',
            '!' + source + 'ts/**/*',
            '!' + source + 'ts',
        ])
        .pipe(
        gulp.dest(dist)
        )
});

gulp.task('reload', (done) => {
    bsync.reload();
    done();
});

gulp.task('watch', (done) => {
    var styl_watcher =
        gulp.watch(
            styl_files,
            gulp.series(
                'compile:stylus',
                'reload'
            )
        );
    var ts_watcher =
        gulp.watch(
            ts_files,
            gulp.series(
                'compile:typescript',
                'reload'
            )
        );
    var other_watcher =
        gulp.watch(
            other_files,
            gulp.series(
                'copy',
                'reload'
            )
        );
    styl_watcher.on('unlink', delete_file);
    ts_watcher.on('unlink', delete_file);
    other_watcher.on('unlink', delete_file);
    done();
});

function delete_file(file_path) {
    var dir = path.relative(source, file_path);
    dir = path.dirname(dir);
    var file_ext = path.extname(file_path);
    var file_name = path.basename(file_path, file_ext);
    for (let route in routing) {
        let routed = routing[route];
        file_ext = file_ext.replace(route, routed);
        dir = dir.replace(route, routed);
    }
    var file_base = file_name + file_ext;
    var dist_path = path.resolve(dist, dir, file_base);
    return del(dist_path);
}

gulp.task(
    'default',
    gulp.series(
        'bsync:init',
        'watch',
        gulp.parallel(
            'compile:stylus',
            'compile:typescript'
        ),
        'reload'
    )
)