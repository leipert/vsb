'use strict';

var gulp = require('gulp');

var $ = require('gulp-stack').plugins(gulp);

$.imagemin = require('gulp-imagemin');
$.less = require('gulp-less');
$.yaml = require('gulp-yaml');

var buildPath = 'dist';

var staticFiles = [
    {
        name: 'locales',
        src: 'app/locales/**.yml',
        pipe: $.lazypipe()
            .pipe($.concat, 'locale.json')
            .pipe($.yaml)
    },
    {
        name: 'overwrite',
        src: 'app/overwrite.js'
    },
    {
        name: 'jassa',
        folder: '/scripts',
        rev: true,
        src: 'app/bower_components/jassa/*.min.js'
    },
    {
        name: 'fonts',
        folder: 'fonts',
        src: '$vendor',
        rev: true,
        filter: ['{f,F}ont*.{otf,eot,svg,ttf,woff,woff2}']
    },
    {
        name: 'images',
        folder: 'images',
        rev: true,
        src: 'app/images/*',
        pipe: $.lazypipe()
            .pipe($.imagemin)
    }
];

gulp = require('gulp-stack').gulp(gulp, [
        'app',
        'vendor',
        'static',
        'develop',
        'html',
        'rev'
    ],
    {
        files: {
            js: ['app/**/*.js', '!app/overwrite.js'],
            watch: '!app/styles/styles.css',
            static: staticFiles
        },
        injectInto: {
            css: gulp.src('app/styles/styles.less').pipe($.less())
        },
        paths: {
            build: buildPath
        },
        bower: 'app/bower_components/**', // String of bower directory path
        templateCacheOptions: {root: '/', module: 'VSB'},
        deps: {
            develop: ['watch.less', 'jassa', 'locale']
        },
        webserver: {
            ghostMode: false,
            notify: false
        }
    }
);


/**
 * Alias Tasks
 */

gulp.task('default', ['build', 'jshint']);

gulp.task('watch.less', ['less'], function () {
    $.watch('app/**/*.less', function () {
        gulp.start('less');
    });
});

gulp.task('less', function () {
    return gulp.src(['app/styles/styles.less', 'app/styles/develop.less'])
        .pipe($.plumber($.errorHandler))
        .pipe($.concat('styles.less'))
        .pipe($.less())
        .pipe($.cssMinify())
        .pipe(gulp.dest('app/styles/'))
        .pipe($.reload({stream: true}))

});

gulp.task('jassa', function () {
    return gulp.src('app/bower_components/jassa/*.min.js')
        .pipe(gulp.dest('.tmp/scripts/'))
});

gulp.task('locale', function () {
    return gulp.src('app/locales/**.yml')
        .pipe($.concat('locale.json'))
        .pipe($.yaml({space: 2}))
        .pipe(gulp.dest('.tmp'))
});

gulp.task('generateMockPersons', function () {
    var faker = require('faker');
    var _ = require('lodash');
    var moment = require('moment');
    var ptemplate = _.template(
        '<%= uri %> a :Person ;rdfs:label "<%= label %>"@de ;' +
        ':name "<%= name %>"; :birthDate "<%= birthDate.format("YYYY-MM-DD") %>>"^^xsd:date ;' +
        '<%= scion %>'+
        '<% _.forEach(parents, function(parent) { %>:ancestor <%- parent.uri %>;<% }); %>'+
        ':age <%= age %> .'
    );
    var persons = _.reduce(generatePeople(3, 3),reducePerson,'');

    console.warn(persons);


    function reducePerson(result,person){
        return result + '\n' + person.toString() + _.reduce(person.parents,reducePerson,'');
    }

    function generatePeople(amount, generations, scion) {
        generations -= 1;
        var people = [];
        for (var i = 0; i < amount; i++) {
            people.push(new Person(generations, scion));
        }
        return people;
    }

    function Person(generation, scion) {

        var birthDate = (scion) ?
            moment(scion.birthDate)
                .subtract(_.random(16,40),'years')
                .subtract(_.random(1,12), 'months')
                .subtract(_.random(0,30), 'days')
            :
            moment(faker.date.past()).subtract(1, 'year');
        var firstName = faker.name.firstName();
        var name = firstName + ' ' + faker.name.lastName();
        var p = {
            name: name,
            label: firstName,
            uri: ':' + _.kebabCase(_.deburr(name)),
            birthDate: birthDate,
            age: moment().diff(birthDate, 'years'),
            parents: [],
            scion: (scion) ? ':scion ' + scion.uri+';' : ''
        };

        if (generation > 0) {
            p.parents = generatePeople(2, generation, p);
        }

        p.toString = function () {
            return ptemplate(p);
        };

        return p;
    }

});

