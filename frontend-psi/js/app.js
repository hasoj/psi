'use strict';
var app = angular.module('PsiApp', []);

app.controller('PsiController', ['$scope', '$http', '$timeout', '$interval', function($scope, $http, $timeout, $interval){
	
	$scope.endpoint = ""; // Aici trebuie sa bagi endpointul care prelucreaza raspunsurile la intrebari. 

	$scope.questionjson = {};	
	$scope.parta = 0;
	$scope.partb = 0;
	$scope.partaQuestions = 0;
	$scope.partbQuestions = 0;
	$scope.responses = {};

	
	$http.get('questions.json')
 		.success(function(data){ 
			console.log(data);
			$scope.questionjson = data; 
			$scope.groups = $scope.questionjson['groups'];
			$scope.parta = $scope.groups[0];
			$scope.partb = $scope.groups[1];
			$scope.partaQuestions = $scope.parta['questions'];
			$scope.partbQuestions = $scope.partb['questions'];
		});
	
	for(var i = 1; i <= 48; i++){
		$scope.responses[i] = [25, 0];
	}



	function determinePrev(id, questionID){
		
		var prev;
		if(id === questionID*4 + 1)
			prev = questionID*4 + 4;
		else
			prev = id - 1;
	
		while($scope.responses[prev][0] === "0" && prev !== id){
			if(prev === questionID*4 + 1){
				prev = questionID*4 + 4;
				continue;
			}
			prev = prev - 1;
		}
		
		if(prev === id);
			if(id === questionID*4 + 1)
				prev = questionID*4 + 4;
			else
				prev = id - 1;
	
		
		
		return prev;
	}
	
	function determineNext(id, questionID){
		
		var next;
		if(id === questionID*4 + 4)
			next = questionID*4 + 1;
		else
			next = id + 1;
		
		while($scope.responses[next][0] <= 0  && next !== id){
			if(next === questionID*4 + 4){
				next = questionID*4 + 1;
				continue;
			}
			next = next + 1;
			console.log(next);
		}
		
		if(next === id)
			if(id === questionID*4 + 4)
				next = questionID*4 + 1;
			else
				next = id + 1;	
		return next;
	}	

	$scope.makeAdjustments = function(id){
		var questionID = Math.floor((id - 1)/4);
		console.log(questionID);
		var sumOverChoices = 0;
			
		$scope.responses[id][1] = "1";
		var next = determineNext(id, questionID);
		var prev = determinePrev(id, questionID);	
		
		for(i = 1; i <= 4; i++){
			if($scope.responses[questionID*4 + i][0] !== "0"){
				$scope.responses[questionID*4 + i][1] = "1";
			}
			if($scope.responses[questionID*4 + i][1] === "1" && questionID*4 + i !== next)
				sumOverChoices = sumOverChoices + parseInt($scope.responses[questionID*4 + i][0]);
		}
		if(sumOverChoices > 100){
			$scope.responses[prev][0] = parseInt($scope.responses[prev][0]) - (sumOverChoices - 100);
		}
		else{
			$scope.responses[next][0] = 100 - sumOverChoices;
		}			
	}
	
	$scope.sendQuestionnaire = function(){
		for(var i = 1; i <= 48; i++){
			delete $scope.responses[i][1];
		}
		$http.post($scope.endpoint, { "responses": $scope.responses });	
	}	
}]);
