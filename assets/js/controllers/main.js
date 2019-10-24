'use strict';
angular.module('odesiApp').controller('mainCtrl', function($scope, $http, $route, $location, $cookies, $timeout, $anchorScroll, anchorSmoothScroll, getEntitlement){
		//main controller

		//browser-tab's first visit from dataverse
		var dvLocale = getParameterByName("dvLocale");

		//fallback to browser lang setting
		if ((!dvLocale || dvLocale === '') && navigator.language != '') {
                    dvLocale = navigator.language.substr(0,2);
		}

		var initLocale = window.sessionStorage.getItem("initLocale");

		//first visit
		if (!initLocale) {
                    window.sessionStorage.setItem('initLocale', dvLocale);
                    window.sessionStorage.setItem('language', dvLocale);
		}

		var sessionLang = window.sessionStorage.getItem("language");
		$scope.lang = (!sessionLang || sessionLang === 'en') ? en : (!sessionLang || sessionLang === 'fr') ? fr : es;
		$scope.baseUrl = $location.host() + ":" + $location.port();
		//paths for templates
		$scope.headerTemplatePath = 'templates/header.html';
		$scope.footerTemplatePath = 'templates/footer.html';
		$scope.myListTemplatePath = 'templates/my-list.html';
		$scope.searchFormTemplatePath = 'templates/search-form.html';
		//model to store current page view
		$scope.selectedNav = {};
		//model to store current search params to store in URL hash
		$scope.searchStateObj = {};
		//model that stores selected items in My List feature
		//using sessionStorage
		$scope.myList = window.sessionStorage.getItem('myList') ? URLON.parse(window.sessionStorage.getItem('myList')) : [];
		//function that handles language toggle
		$scope.switchLanguage = function(language){
            window.sessionStorage.setItem('language', language);
			location.reload();
		}


		
});
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
