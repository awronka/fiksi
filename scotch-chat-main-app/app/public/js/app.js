'use strict';
//Load angular
var app = angular.module('Fiksi', ['ngMaterial', 'ngAnimate', 'ngMdIcons', 'btford.socket-io', 'ui.router'])

app.config(function($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});

    //Set our server url

//var serverBaseUrl = 'http://localhost:2015';
var serverBaseUrl = 'https://frozen-sea-6880.herokuapp.com';







