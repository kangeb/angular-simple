'use strict';

/* Controllers */

var app =angular.module('app')
        .controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$window', '$state','$http', 
          function(              $scope,   $translate,   $localStorage,   $window ,$state,$http) {
            // add 'ie' classes to html
            var isIE = !!navigator.userAgent.match(/MSIE/i);
            isIE && angular.element($window.document.body).addClass('ie');
            isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');

            // config
            $scope.app = {
          host: "http://127.0.0.1:8080",
              name: 'Angulr',
              version: '1.3.3',
              // for chart colors
              color: {
                primary: '#7266ba',
                info:    '#23b7e5',
                success: '#27c24c',
                warning: '#fad733',
                danger:  '#f05050',
                light:   '#e8eff0',
                dark:    '#3a3f51',
                black:   '#1c2b36'
              },
              settings: {
                themeID: 1,
                navbarHeaderColor: 'bg-black',
                navbarCollapseColor: 'bg-white-only',
                asideColor: 'bg-black',
                headerFixed: true,
                asideFixed: false,
                asideFolded: false,
                asideDock: false,
                container: false
              }
            }

            // save settings to local storage
            if ( angular.isDefined($localStorage.settings) ) {
              $scope.app.settings = $localStorage.settings;
            } else {
              $localStorage.settings = $scope.app.settings;
            }
            $scope.$watch('app.settings', function(){
              if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
                // aside dock and fixed must set the header fixed.
                $scope.app.settings.headerFixed = true;
              }
              // save to local storage
              $localStorage.settings = $scope.app.settings;
            }, true);

            // angular translate
            $scope.lang = { isopen: false };
            $scope.langs = {en:'English', de_DE:'German', it_IT:'Italian'};
            $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
            $scope.setLang = function(langKey, $event) {
              // set the current lang
              $scope.selectLang = $scope.langs[langKey];
              // You can change the language during runtime
              $translate.use(langKey);
              $scope.lang.isopen = !$scope.lang.isopen;
            };
          $scope.session_user = $localStorage.user;
          $scope.logout = function(){
            $localStorage.auth = null;
            $http.defaults.headers.common['Authorization'] = "Basic";
            $state.go("auth.login");
          }
            function isSmartDevice( $window )
            {
                // Adapted from http://www.detectmobilebrowsers.com
                var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
            }

        }]);
        app.directive('myPagination', function () {
            return {
              restrict: 'EA',
              replace: true,
              scope: {
                option: '=pageOption'
              },
              template: '<ul class="pagination">' +
              '<li ng-click="pageClick(p)" ng-repeat="p in page" class="{{option.curr==p?\'active\':\'\'}}">' +
              '<a href="javascript:;" rel="external nofollow" >{{p}}</a>' +
              '</li>' +
              '</ul>',
              link: function ($scope) {
                //容错处理
                if (!$scope.option.curr || isNaN($scope.option.curr) || $scope.option.curr < 1) $scope.option.curr = 1;
                if (!$scope.option.all || isNaN($scope.option.all) || $scope.option.all < 1) $scope.option.all = 1;
                if ($scope.option.curr > $scope.option.all) $scope.option.curr = $scope.option.all;
                if (!$scope.option.count || isNaN($scope.option.count) || $scope.option.count < 1) $scope.option.count = 10;
          
          
                //得到显示页数的数组
                $scope.page = getRange($scope.option.curr, $scope.option.all, $scope.option.count);
          
                //绑定点击事件
                $scope.pageClick = function (page) {
                  if (page == '«') {
                    page = parseInt($scope.option.curr) - 1;
                  } else if (page == '»') {
                    page = parseInt($scope.option.curr) + 1;
                  }
                  if (page < 1) page = 1;
                  else if (page > $scope.option.all) page = $scope.option.all;
                  //点击相同的页数 不执行点击事件
                  if (page == $scope.option.curr) return;
                  if ($scope.option.click && typeof $scope.option.click === 'function') {
                    $scope.option.click(page);
                    $scope.option.curr = page;
                    $scope.page = getRange($scope.option.curr, $scope.option.all, $scope.option.count);
                  }
                };
          
                //返回页数范围（用来遍历）
                function getRange(curr, all, count) {
                  //计算显示的页数
                  curr = parseInt(curr);
                  all = parseInt(all);
                  count = parseInt(count);
                  var from = curr - parseInt(count / 2);
                  var to = curr + parseInt(count / 2) + (count % 2) - 1;
                  //显示的页数容处理
                  if (from <= 0) {
                    from = 1;
                    to = from + count - 1;
                    if (to > all) {
                      to = all;
                    }
                  }
                  if (to > all) {
                    to = all;
                    from = to - count + 1;
                    if (from <= 0) {
                      from = 1;
                    }
                  }
                  var range = [];
                  for (var i = from; i <= to; i++) {
                    range.push(i);
                  }
                  range.push('»');
                  range.unshift('«');
                  return range;
                }
          
              }
            }
          });
        