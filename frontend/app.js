'use strict';
var app = angular.module('PsiApp', []);

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

            $scope.questionData = {
                success: false,
                reason: "loading"
            };
            $scope.responses = [];

            for (var i = 1; i <= 48; i++) {
                $scope.responses[i] = [25, 0];
            }

            $http.get($scope.questionsEndpoint)
                .success(function (data) {
                    $scope.questionData = data;
                });

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

            $scope.makeAdjustments = function (id) {
                var questionID = Math.floor((id - 1) / 4);
                console.log(questionID);
                var sumOverChoices = 0;

                $scope.responses[id][1] = "1";
                var next = determineNext(id, questionID);
                var prev = determinePrev(id, questionID);

                for (i = 1; i <= 4; i++) {
                    if ($scope.responses[questionID * 4 + i][0] !== "0") {
                        $scope.responses[questionID * 4 + i][1] = "1";
                    }
                    if ($scope.responses[questionID * 4 + i][1] === "1" && questionID * 4 + i !== next)
                        sumOverChoices = sumOverChoices + parseInt($scope.responses[questionID * 4 + i][0]);
                }
                if (sumOverChoices > 100) {
                    $scope.responses[prev][0] = parseInt($scope.responses[prev][0]) - (sumOverChoices - 100);
                }
                else {
                    $scope.responses[next][0] = 100 - sumOverChoices;
                }
            };

            $scope.sendQuestionnaire = function () {
                var submitData = [];
                for (var i = 1; i <= 48; i++) {
                    submitData.push({
                        value: $scope.responses[i][0],
                        id: i
                    });
                }

                $http.post(
                    $scope.submitEndpoint,
                    {
                        responses: submitData
                    }
                );
            }
        }
    ]
);
