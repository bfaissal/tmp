/**
 * Created with IntelliJ IDEA.
 * User: faissalboutaounte
 * Date: 2014-03-15
 * Time: 17:34
 * To change this template use File | Settings | File Templates.
 */
var jmaghreb = angular.module('jmaghreb', ['ngAnimate', 'ngRoute']);

jmaghreb.controller('MainController', function ($scope, $route, $routeParams, $location) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
})
jmaghreb.controller('LoginCtrl', function ($scope, $http) {
    $scope.doLogin = function () {
        $http.post("/login/" + $scope.login._id + "/" + $scope.login.password).success(function () {
            window.location.href = "/cfp"
        })
    }
})


jmaghreb.controller('RegistrationCtrl', function ($scope, $http) {
    $scope.register = {};
    $scope.doRegister = function () {
        $http.post("/register", $scope.register).error(function (error) {
            alert("error=" + error)
        })
    }
})

jmaghreb.controller('ProfileCtrl', function ($scope, $http, $timeout) {
    $scope.saveSuccess = false;

    $scope.initProfile = function(){
        $http.get("/connectedUser").success(function (data) {
            $scope.register = data
        })
    }
    $scope.initProfile();
    $scope.editProfile = function () {
        $http.post("/saveProfile",$scope.register).success(function (data) {
            $scope.saveSuccess = true;
            $timeout(function(){$scope.saveSuccess = false;},3000)
        })
    }
})

jmaghreb.controller('talksCtrl', function ($scope, $http) {
    $scope.talks = {};
    $scope.selectedTalk = {};
    $scope.predicate = 'title'
    $scope.predicateList ='order'
    $scope.reverse = false;
    $http.get("/config").success(function (data) {
        $scope.config = data;
    })
    $http.get("/talks").success(function (data) {
        $scope.talks = data;
    })
    $scope.edit = function (talk) {
        $scope.selectedTalk = {}
        $scope.selectedTalk = talk;
        $scope.form = true;
        $scope.edition = true;
    }
    $scope.add = function () {
        $scope.selectedTalk = {}
        $scope.form = true;
        $scope.edition = false;
        $scope.selectedTalk.status = 1;
    }
    $scope.save = function () {
        $scope.selectedTalk.loading = true;
        $http.post("/editTalk", JSON.stringify($scope.selectedTalk)).error(function (error) {

            $scope.selectedTalk.error = true;
        }).success(function (data) {
                $scope.selectedTalk.loading = false;
                $scope.selectedTalk.error = false;
                if (data.data) {
                    $scope.talks.push(data.data)
                }
            })
        $scope.cancel();
    }
    $scope.changeStatus = function (talk, status) {
        var message = status == 2 ? 'Do you want to complete this talk ?' : 'Do you want to delete this talk ?'
        if (status == 1 || confirm(message)) {
            $scope.selectedTalk = talk;
            $scope.selectedTalk.status = status;
            $scope.save();
        }
    }

    $scope.cancel = function () {

        $scope.form = false;
        $scope.edition = false;
    }

    $scope.updateValue = function(item,type){
        function updateLabel(list){
            for(a in list){
                if(list[a].value == item.value){
                    item.label = list[a].label;
                    break;
                }
            }
        }
        switch (type) {
            case 'lang':
                updateLabel($scope.config.languages)
                break;
            case 'room':
                updateLabel($scope.config.rooms)
                break;
            case 'type':
                updateLabel($scope.config.sessionTypes)
                break;
            case 'track':
                updateLabel($scope.config.tracks)
                break;
            case 'exp':
                updateLabel($scope.config.audienceExperiences)
                break;
        }
    }
    $scope.deleteSpeaker = function(index){
        if(confirm("Are you sure you want to delete this speaker ?")){
            //delete $scope.selectedTalk.otherSpeakers[index]
            delete $scope.selectedTalk.otherSpeakers.splice(index,1)
        }
    }
    $scope.findSpeaker = function(speaker){
        console.log($scope.selectedTalk.otherSpeakers)
        $http.get("/speaker/"+speaker._id).success(function (data) {
            speaker.fname = data.fname
            speaker.lname = data.lname
            speaker.image = data.image
        })
    }
    $scope.addSpeaker = function(){
        var speaker = {};
        speaker.lname='';
        if(!$scope.selectedTalk.otherSpeakers){
            $scope.selectedTalk.otherSpeakers = [];
        }
        $scope.selectedTalk.otherSpeakers.push(speaker)
    }
    $scope.disabled = function(disabled){
        if(disabled)
            return "disabled";
        else
            return "";
    }
})

jmaghreb.controller('AdminCtrl', function ($scope, $http,$timeout) {
    $scope.config = {};
    $scope.predicate = 'order'
    saveSuccess = false;
    $scope.reverse = false;
    $http.get("/config").success(function (data) {
        $scope.config = data;
        $scope.initLists();
    })
    $scope.initLists = function () {
        if (!$scope.config.languages) $scope.config.languages = []
        if (!$scope.config.rooms) $scope.config.rooms = []
        if (!$scope.config.sessionTypes) $scope.config.sessionTypes = []
        if (!$scope.config.tracks) $scope.config.tracks = []
        if (!$scope.config.audienceExperiences) $scope.config.audienceExperiences = []
    }
    $scope.initLists();
    $scope.addLang = function (type) {
        switch (type) {
            case 'lang':
                $scope.config.languages.push({});
                break;
            case 'room':
                $scope.config.rooms.push({});
                break;
            case 'type':
                $scope.config.sessionTypes.push({});
                break;
            case 'track':
                $scope.config.tracks.push({});
                break;
            case 'exp':
                $scope.config.audienceExperiences.push({});
                break;
            default:
                $scope.selectedVar = 'bbbbxbxbxb';
        }
    }

    $scope.save = function (onSuccess) {
        $http.post("/saveConfig", JSON.stringify($scope.config)).error(function (error) {
        })
            .success(function (data) {
                $scope.config = data.data;
                if (onSuccess) {
                    onSuccess()
                }
                $scope.saveSuccess = true;
                $timeout(function(){$scope.saveSuccess = false;},3000)
            })
    }
    $scope.delete = function (list,item, index) {
        if (confirm("Are you sure you want to delete this line ?")) {
            for ( a in list){
                if(list[a].label == item.label){
                    index = a ;
                }
            }
            list.splice(index, 1);
            $scope.save()
        }
    }
})

jmaghreb.config(function ($routeProvider) {
    $routeProvider.when('p1', { templateUrl: 'partial1_.html', controller: 'talksCtrl' })
        .when('p2', { templateUrl: 'partial2_.html', controller: 'ProfileCtrl' });
})
