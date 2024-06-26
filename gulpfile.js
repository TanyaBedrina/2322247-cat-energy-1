import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import {deleteAsync} from 'del';
import squoosh from 'gulp-libsquoosh';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//html
const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

//Scripts
const scripts = () => {
  return gulp.src('source/js/*js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'));
}
//Images
const optimizeImages = () => {
  return gulp.src('source/img/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'));
}

const copyImages = () => {
  return gulp.src('source/img/*.{jpg,png}')
    .pipe(gulp.dest('build/img'));
}

//WebP
const createWebp = () => {
  return gulp.src('source/img/*.{jpg,png}')
    .pipe(squoosh({ webp: {} }))
    .pipe(gulp.dest('build/img'));
}

//svg
const svg = () => {
  return gulp.src(['source/img/*.svg', '!source/img/sprite/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));
}

const sprite = () => {
  return gulp.src('source/img/sprite/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

const copy = (done) => {
  gulp.src([
    'source/fonts/*/*{woff2,woff}',
    'source/*ico',
    'source/img/favicon/*'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'));
  done();
}

//clean
const clean = () => {
  return deleteAsync('build')
};
// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}
//reload
export const reload = (done) => {
  browser.reload();
  done;
}
// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('sourse/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

//Build
export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
);

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
