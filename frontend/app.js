'use strict';
var app = angular.module('PsiApp', []);

function formatDate(isoString) {
    return moment(isoString).format("LLLL");
}

function errorString(data) {
    return '"' + data.config.method + " " + data.config.url + '" nu a funcționat.';
}

app.controller(
    'PsiController',
    [
        '$scope',
        '$http',
        '$timeout',
        '$interval',
        function ($scope, $http, $timeout, $interval) {
            $scope.backend = "http://localhost:8000";
            $scope.questionsEndpoint = $scope.backend + "/questions";
            $scope.submitEndpoint = $scope.backend + "/submit";
            $scope.stateEndpoint = $scope.backend + "/state";

            $scope.showLoading = true;
            $scope.showTest = false;

            $scope.ownResults = [];
            $scope.recentResults = [];

            $scope.errorReason = "";

            $scope.questionData = {};
            $scope.statusPulled = false;

            $scope.responses = [];

            for (var i = 1; i <= 48; i++) {
                $scope.responses[i] = [25];
            }

            function determinePrev(id, questionID) {
                var prev;
                if (id === questionID * 4 + 1)
                    prev = questionID * 4 + 4;
                else
                    prev = id - 1;

                while ($scope.responses[prev][0] === "0" && prev !== id) {
                    if (prev === questionID * 4 + 1) {
                        prev = questionID * 4 + 4;
                        continue;
                    }
                    prev = prev - 1;
                }

                if (prev === id);
                if (id === questionID * 4 + 1)
                    prev = questionID * 4 + 4;
                else
                    prev = id - 1;

                return prev;
            }

            function determineNext(id, questionID) {
                var next;
                if (id === questionID * 4 + 4)
                    next = questionID * 4 + 1;
                else
                    next = id + 1;

                while ($scope.responses[next][0] <= 0 && next !== id) {
                    if (next === questionID * 4 + 4) {
                        next = questionID * 4 + 1;
                        continue;
                    }
                    next = next + 1;
                    console.log(next);
                }

                if (next === id)
                    if (id === questionID * 4 + 4)
                        next = questionID * 4 + 1;
                    else
                        next = id + 1;
                return next;
            }

	    var timer = null;
            $scope.makeAdjustments = function (id, delay) {
		if(timer){
			$timeout.cancel(timer);
			timer = null;
		}
		timer = $timeout(
			function(){				
				var questionID = Math.floor((id - 1) / 4);
				var sumOverChoices = 0;
					var next, prev;

					for (i = 1; i <= 4; i++) {
							sumOverChoices = sumOverChoices + parseInt($scope.responses[questionID * 4 + i][0]);
					}

					while(sumOverChoices > 100){
						next = determineNext(id, questionID);	
						if(parseInt($scope.responses[next][0]) >= (sumOverChoices - 100)){
							$scope.responses[next][0] = parseInt($scope.responses[next][0]) - (sumOverChoices - 100);
							sumOverChoices = 100;
						}
						else {
							sumOverChoices = sumOverChoices - parseInt($scope.responses[next][0]);
							$scope.responses[next][0] = 0;
							id = next;
						}
					}
					while(sumOverChoices < 100){
						prev = determinePrev(id, questionID);	
						if(parseInt(100 - parseInt($scope.responses[prev][0])) >= (100 - sumOverChoices)){
							$scope.responses[prev][0] = parseInt($scope.responses[prev][0]) + (100 - sumOverChoices);
							sumOverChoices = 100;
						}
						else {
							sumOverChoices = sumOverChoices + (100 - parseInt($scope.responses[prev][0]));
							$scope.responses[prev][0] = 100;
							id = next;
						}

					}

				}, 
				delay
			);
		};

            $scope.sendQuestionnaire = function () {
                $scope.showLoading = true;
                var submitData = [];
                for (var i = 1; i <= 48; i++) {
                    submitData.push({
                        value: $scope.responses[i][0],
                        id: i
                    });
                }

                $http.post(
                    $scope.submitEndpoint,
                    { responses: submitData }
                ).then(function(data) {
                    $scope.showTest = false;
                    $scope.pullStatus();
                    $scope.showLoading = false;
                }, function(msg){
                    $scope.errorReason = errorString(msg);
                    $scope.showLoading = false;
                });
            };

            $scope.pullStatus = function() {
                $http.get($scope.stateEndpoint)
                .then(function(data) {
                    $scope.recentResults = data.data.otherRecentTests;
                    $scope.ownResults = data.data.ownTestResults;

                    if(data.hasUnfinishedTest) {
                        $scope.showTest = true;
                    }
                    $scope.showLoading = false;
                    $scope.statusPulled = true;
                }, function(msg){
                    $scope.errorReason = errorString(msg);
                    $scope.showLoading = false;
                });
            };

            $scope.startTest = function() {
                $scope.showLoading = true;
                $http.get($scope.questionsEndpoint)
                .then(function (data) {
                    $scope.questionData = data.data;
                    $scope.showTest = true;
                    $scope.showLoading = false;
                }, function(msg){
                    $scope.errorReason = errorString(msg);
                    $scope.showLoading = false;
                });
            };

            $scope.pullStatus();
            $interval($scope.pullStatus, 32123); // 32s

        }
    ]
);
