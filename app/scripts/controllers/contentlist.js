'use strict';

angular.module('bulbsCmsApp')
  .controller('ContentlistCtrl', function (
    $scope, $http, $timeout, $location,
    $routeParams, $window, $q, $, _, moment, ContentApi, LOADING_IMG_SRC)
  {
    $scope.LOADING_IMG_SRC = LOADING_IMG_SRC;
    //set title
    $window.document.title = 'AVCMS | Content';

    $scope.pageNumber = $location.search().page || '1';
    $scope.myStuff = false;
    $scope.queue = $routeParams.queue || 'all';
    $scope.search = $location.search().search;

    var getContentCallback = function (data) {
        $scope.articles = data;
        $scope.totalItems = data.metadata.count;
      };

    $scope.getContent = function () {
        var params = {
          page: $scope.pageNumber
        };
        if ($scope.queue !== 'all') {
          if($scope.queue === 'published'){
            params.before = moment().format('YYYY-MM-DDTHH:mmZ')
          }else if($scope.queue === 'waiting'){
            params.status = "Waiting for Editor"
          }else if($scope.queue === 'draft'){
            params.status = "Draft"
          }else if($scope.queue === 'scheduled'){
            params.after = moment().format('YYYY-MM-DDTHH:mmZ')
          };
        }
        var search = $location.search();
        for (var prop in search) {
          if (!search.hasOwnProperty(prop)) {
            continue;
          }
          var val = search[prop];
          if (!val || val === 'false') {
            continue;
          }
          params[prop] = val;
        }
        ContentApi.all('content').getList(params)
          .then(getContentCallback);
      };

    function updateIsMyStuff() {
        if (!$location.search().authors) {
          $scope.myStuff = false;
          return;
        }
        var authors = $location.search().authors;
        if (typeof(authors) === 'string') {
          authors = [authors];
        }
        if (authors.length === 1 && authors[0] === $window.current_user) {
          $scope.myStuff = true;
        } else {
          $scope.myStuff = false;
        }
      }
    updateIsMyStuff();
    $scope.getContent();

    $scope.$on('$routeUpdate', function () {
        updateIsMyStuff();
      });

    $scope.$watch('myStuff', function () {
        if ($scope.myStuff) {
          $('#meOnly').bootstrapSwitch('setState', true, true);
        } else {
          $('#meOnly').bootstrapSwitch('setState', false, true);
        }
      });

    $('#meOnly').on('switch-change', function (e, data) {
        var value = data.value;
        if (value === true) {
          $location.search().authors = [$window.current_user];
          $scope.getContent();
        } else if (value === false) {
          delete $location.search().authors;
          $scope.getContent();
        }
      });

    $scope.goToPage = function (page) {
        $location.search(_.extend($location.search(), {'page': page}));
        $scope.getContent();
      };

    $scope.sort = function (sort) {
        if ($location.search().ordering && $location.search().ordering.indexOf(sort) === 0) {
          sort = '-' + sort;
        }
        $location.search(_.extend($location.search(), {'ordering': sort}));
        $scope.getContent();
      };

    $scope.publishSuccessCbk = function (data) {
        var i;
        for (i = 0; i < $scope.articles.length; i++) {
          if ($scope.articles[i].id === data.article.id) {
            break;
          }
        }

        for (var field in data.response) {
          $scope.articles[i][field] = data.response[field];
        }

        return $q.when();
      };

    $scope.trashSuccessCbk = function () {
        $timeout(function () {
            $scope.getContent();
            $('#confirm-trash-modal').modal('hide');
          }, 1500);
      };

    $('.expcol').click(function (e) {
        e.preventDefault();
        var nS = $(this).attr('state') === '1' ? '0' : '1',
            i = nS ? 'minus' : 'plus',
            t = nS ? 'Collapse' : 'Expand',
            tP = $($(this).attr('href')).find('.panel-collapse');

        if ($(this).attr('state') === '0') { tP.collapse('show'); }
        else { tP.collapse('hide'); }
        $(this).html('<i class=\"fa fa-' + i + '-circle\"></i> ' + t + ' all');
        $(this).attr('state', nS);
        $window.picturefill();
      });

    $('body').on('shown.bs.collapse', 'table tr.panel', function(){ window.picturefill() });

    $('#meOnly').bootstrapSwitch();

  })
  .directive('ngConfirmClick', [ // Used on the unpublish button
    function () {
      return {
        link: function (scope, element, attr) {
          var msg = attr.ngConfirmClick || 'Are you sure?';
          var clickAction = attr.confirmedClick;
          element.bind('click', function () {
            if (window.confirm(msg)) {
              scope.$eval(clickAction);
            }
          });
        }
      };
    }
  ]);
