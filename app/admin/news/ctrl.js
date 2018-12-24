'use strict';

app.controller('ListController', function($scope, $resource,$stateParams,$modal,$state) {
    //初始化数据
    $scope.agenda={};
    //根据url参数（分页、搜索关键字）查询数据 
    $scope.option = {
                curr: 1,
                all: 5,
                count: 5
            };    
    //查询
    $scope.query = function(page,filter){
        //page:'@page',filter:'@filter' ?currentPage=:page&pageSize=5&search=:filter
        var $com = $resource($scope.app.host + "/ssmapi/api/agendaPage",{},{});
        //var $com = $resource($scope.app.host + "/ssmapi/api/saveAgenda",{},{});
        if(!page){
            page=1;
        }else{
            page=parseInt(page);
        };
        if(!filter){
            filter=null;
        };
        var parms={currentPage:page,pageSize:5,date:filter};
        //var parms={title:"lalal",details:"nihao",date:"2018-09-09",name:"康尔宝"};
        $com.save(parms,function(result){
           //alert(JSON.stringify(result.data.data));
            //扩展分页数据，显示页签，最终效果为  < 1 2 3 4 5 >
            //设置分页的参数
                var count;
                if(result.data.pages>5){
                    var count=5;
                }else{
                    var count=result.data.pages;
                };
                $scope.option = {
                    curr: page, //当前页数
                    all: result.data.pages, //总页数
                    count:count, //最多显示的页数，默认为10               
                    //点击页数的回调函数，参数page为点击的页数
                    click: function (page) {
                    //console.log(page);
                    //这里可以写跳转到某个页面等...
                    $scope.query(page,$scope.search_context);
                    }
                } 
            console.log($scope.option);   
            $scope.data = result;
            $scope.search_context = filter;
        });
    };   
    $scope.agenda.details=function(index){       
        var uuid=$scope.data.data.data[index].uuid;
        $state.go('app.news.detail',{uuid:uuid,flag:'false'});
    };
    $scope.agenda.delete=function(index){
        var uuid=$scope.data.data.data[index].uuid;
        if(window.confirm('确定删除此日程吗？')){
                 var $com = $resource($scope.app.host + "/ssmapi/api/removeAgenda",{},{});
                 $com.get({uuid:$stateParams.uuid},function(result){
                        if(result.meta.message=="success"){
                            $state.go('app.news.list',{search:$scope.search_context}); 
                        }else{
                            alert("删除失败");
                        };
                    });
              };
              
    };
    $scope.agenda.update=function(index){
        var uuid=$scope.data.data.data[index].uuid;
        $state.go('app.news.detail',{uuid:uuid,flag:'true'});
    };
    $scope.query($stateParams.page,$stateParams.search);

    //搜索跳转
    $scope.search = function(){
        $state.go('app.news.list',{search:$scope.search_context});
    }
    //全选
    var selected = false;
    $scope.selectAll = function(){
        selected = !selected;
        angular.forEach($scope.data.data.data,function(item){
            item.selected = selected;
        });
    }
    //自定义操作处理，其中1为删除所选记录
    $scope.exec = function(){
        //alert($scope.operate);
        console.log($scope.data.data.data);
        if($scope.operate=="1"){
            var ids = [];
            angular.forEach($scope.data.data.data,function(item){
                if(item.selected){
                    ids.push(item.uuid);
                }
            });
            if(ids.length>0){
                //弹出删除确认
                var modalInstance = $modal.open({
                    templateUrl: 'admin/confirm.html',
                    controller: 'ConfirmController',
                    size:'sm',
                });
                modalInstance.result.then(function () {
                      var $com = $resource($scope.app.host + "/ssmapi/api/removeMoreAgenda",{},{});
                      console.log(ids.join(','));
                      $com.get({ids:ids.join(',')},function(result){
                            //console.log(result);
                            if(result.meta.message=="success"){
                                $state.go('app.news.list',{search:$scope.search_context});
                            }else{
                                alert("删除失败");
                            }
                      });
                });
            }
        }
    }
    
});

app.controller('ConfirmController', ['$scope', '$modalInstance', function($scope, $modalInstance){
     $scope.ok = function () {
        $modalInstance.close();
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
  };
}]);

app.controller('DetailController', function($rootScope,$scope, $resource, $stateParams,$state) {
  $scope.agendaEdit={};  
  $scope.edit_mode = !!$stateParams.uuid;
  $scope.agendaEdit.flag=$stateParams.flag;
  alert($scope.agendaEdit.flag);
  if($scope.edit_mode){
      var $com = $resource($scope.app.host + "/ssmapi/api/queryAgenda",{},{});
      var resp = $com.get({uuid:$stateParams.uuid},function(result){
          $scope.data = result.data;
      });
  }
  else{
      $scope.data = {};
  }
  $scope.submit = function(){
      
      var $com = $resource($scope.app.host + "/ssmapi/api/modifyAgenda",{},{});
          $com.save($scope.data,function(result){
              if(result.meta.message=="success"){
                $state.go('app.news.list');
              }else{
                  alert("添加失败");
              }             
          });
    //   if($scope.edit_mode){
    //       var $com = $resource($scope.app.host + "/news/:id/?",{id:'@id'},{
    //           'update': { method:'PUT' },
    //       });
    //       $com.update({id:$stateParams.id},$scope.data,function(data){
    //           $state.go($rootScope.previousState,$rootScope.previousStateParams);
    //       });
    //   }
    //   else{
          
    //   }
  };
//   $scope.delete = function(){
//       var $com = $resource($scope.app.host + "/news/:id/?",{id:'@id'});
//       $com.delete({id:$stateParams.id},function(){
//           $state.go('app.news.list');
//       })
//   }
});