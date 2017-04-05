
const del = require('del');
const gulp = require('gulp');
const yargs = require("yargs").argv;
const wiredep = require('wiredep').stream;
const runSequence = require('run-sequence');
const browserSync = require('browser-sync');
const webpackConfig = require('./webpack.config.js');
const gulpLoadPlugins = require('gulp-load-plugins');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const PRODUCTION = yargs.production;


gulp.task('styles', () => {
	return gulp.src('site/styles/*.scss')
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.sass.sync({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.']
		}).on('error', $.sass.logError))
		.pipe($.if('base.css', $.rtlcss()))
		.pipe($.postcss([
			require('postcss-will-change'),
			require('postcss-cssnext')({
				browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
			}),
			require("css-mqpacker")({
				sort: true
			})
		]))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest('.tmp/styles'))
		.pipe(reload({stream: true}));
});

gulp.task('scripts', function() {
	return gulp.src('src/scripts/main.js')
		.pipe(require('webpack-stream')(webpackConfig))
		.pipe(gulp.dest('.tmp/scripts'))
		.pipe(reload({ stream: true }));
});

function lint(files, options) {
	return gulp.src(files)
		.pipe(reload({stream: true, once: true}))
		.pipe($.eslint(options))
		.pipe($.eslint.format())
		.pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
	return lint('site/scripts/**/*.js', {
		fix: true,
		useEslintrc: true
	})
		.pipe(gulp.dest('site/scripts'));
});
gulp.task('lint:test', () => {
	return lint('test/spec/**/*.js', {
		fix: true,
		env: {
			mocha: true
		}
	})
		.pipe(gulp.dest('test/spec'));
});


gulp.task('html', ['styles', 'scripts'], () => {
	return gulp.src('site/*.html')
		.pipe($.useref({
			searchPath: ['.tmp', 'site', '.']
		}))
		.pipe($.if('*.js', $.uglify()))
		.pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
		.pipe($.if('*.html',
							( $.if( PRODUCTION , $.htmlmin({collapseWhitespace: true})))))
		.pipe(gulp.dest('public'));
})


gulp.task('images', () => {
	return gulp.src('site/assets/images/**/*')
		.pipe($.cache($.imagemin()))
		.pipe(gulp.dest('public/assets/images'));
});

gulp.task('fonts', () => {
	return gulp.src(require('main-bower-files')('**/*.{eot,ttf,woff,woff2}', function (err) {})
		.concat('site/assets/fonts/**/*'))
		.pipe(gulp.dest('.tmp/assets/fonts'))
		.pipe(gulp.dest('public/assets/fonts'));
});

gulp.task('extras', () => {
	return gulp.src([
		'site/*',
		'!site/*.html',
	], {
		dot: true
	}).pipe(gulp.dest('public'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'public']));

const watch = () => {
	gulp.watch([
		'site/*.html',
		'site/assets/**/*'
	]).on('change', reload);

	gulp.watch('site/styles/**/*.scss', ['styles']);
	gulp.watch('site/scripts/**/*.js', ['scripts']);
	gulp.watch('site/assets/fonts/**/*', ['fonts']);
	gulp.watch('bower.json', ['wiredep', 'fonts']);
}

gulp.task('watch', () => {
	runSequence(['clean', 'wiredep'], ['styles', 'scripts', 'fonts'], () => {
			watch();
		});
});

gulp.task('serve', () => {
	runSequence(['clean', 'wiredep'], ['styles', 'scripts', 'fonts'], () => {
		browserSync({
			notify: false,
			port: 3000,
			server: {
				baseDir: ['.tmp', 'site'],
				routes: {
					'/bower_components': 'bower_components'
				}
			}
		});
		watch()
	});
});

gulp.task('serve:public', () => {
	browserSync({
		notify: false,
		port: 3000,
		server: {
			baseDir: ['public']
		}
	});
});

gulp.task('serve:test', ['scripts'], () => {
	browserSync({
		notify: false,
		port: 3000,
		ui: false,
		server: {
			baseDir: 'test',
			routes: {
				'/scripts': '.tmp/scripts',
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch('site/scripts/**/*.js', ['scripts']);
	gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
	gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
	gulp.src('site/styles/*.scss')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)+/
		}))
		.pipe(gulp.dest('site/styles'));

	gulp.src('site/*.html')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)*\.\./
		}))
		.pipe(gulp.dest('site'));
});

gulp.task('deploy', function() {
  return gulp.src('./public/**/*')
    .pipe($.ghPages());
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
	return gulp.src('public/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', () => {
	runSequence(['clean', 'wiredep'], 'build');
});
