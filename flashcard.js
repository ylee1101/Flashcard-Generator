var BasicCard = require('./BasicCard.js');
var ClozeCard = require('./ClozeCard.js');
var inquirer = require('inquirer');
var fs = require('fs');

// organize the list with adding card and showoing questions
inquirer.prompt([{
	name: 'command',
	message: 'Choose from the choices',
	type: 'list',
	choices: [{
		name: 'add-flashcard' 
	}, {
		name: 'show-all-cards'
	}]
}]).then(function(answer) {
	if (answer.command === 'add-flashcard') {
		addCard();
	} else if (answer.command === 'show-all-cards') {
		showCards();
	}
});

// make addcard function with basic and cloze flashcard
var addCard = function() {
	inquirer.prompt([{
		name: 'cardType',
		message: 'Which flashcard do you want to create?',
		type: 'list',
		choices: [{
			name: 'basic-flashcard'
		}, {
			name: 'cloze-flashcard'
		}]
	}]).then(function(answer) {
		if (answer.cardType === 'basic-flashcard') {
			inquirer.prompt ([{
				name: 'front',
				message: 'What is the question?',
				validate: function(input) {
					if (input === '') {
						console.log('Please provide a question');
						return false;
					} else {
						return true;
					}
				}
			}, {
				name: 'back',
				message: 'What is the answer?',
				validate: function(input) {
					if (input === '') {
						console.log('Please provide an answer');
						return false;
					} else {
						return true;
					}
				}
			}]).then(function(answer) {
				var newBasic = new BasicCard(answer.front, answer.back);
				newBasic.create();
				whatsNext();
			});
		} else if (answer.cardType === 'cloze-flashcard') {
			inquirer.prompt([{
				name: 'text',
				message: 'What is the full text?',
				validate: function(input) {
					if (input === '') {
						console.log('Please provide the full text');
						return false;
					} else {
						return true;
					}
				}
			}, {
				name: 'cloze',
				message: 'What is the cloze part?',
				validate: function(input) {
					if (input === '') {
						console.log('Please provide the cloze part');
						return false;
					} else {
						return true;
					}
				}
			}]).then(function(answer) {
				var text = answer.text;
				var cloze = answer.cloze;
				if (text.includes(cloze)) {
					var newCloze = new ClozeCard(text, cloze);
					newCloze.create();
					whatsNext();
				} else {
					console.log('The cloze protion you provided is not found. Try again.');
					addCard();
				}
			});
		}
	});
};

// once the questions are made, show the next steps with creating more questions or showing the flashcards
var whatsNext = function() {
    inquirer.prompt([{
        name: 'nextAction',
        message: 'What would you like to do next?',
        type: 'list',
        choices: [{
            name: 'create-new-card'
        }, {
            name: 'show-all-cards'
        }, {
            name: 'nothing'
        }]
    }]).then(function(answer) {
        if (answer.nextAction === 'create-new-card') {
            addCard();
        } else if (answer.nextAction === 'show-all-cards') {
            showCards();
        } else if (answer.nextAction === 'nothing') {
            return;
        }
    });
};

var showCards = function() {
    fs.readFile('./log.txt', 'utf8', function(error, data) {
        if (error) {
            console.log('Error occurred: ' + error);
        }
        var questions = data.split(';');
        var notBlank = function(value) {
            return value;
        };
        questions = questions.filter(notBlank);
        var count = 0;
        showQuestion(questions, count);
    });
};

var showQuestion = function(array, index) {
    question = array[index];
    var parsedQuestion = JSON.parse(question);
    var questionText;
    var correctReponse;
    if (parsedQuestion.type === 'basic') {
        questionText = parsedQuestion.front;
        correctReponse = parsedQuestion.back;
    } else if (parsedQuestion.type === 'cloze') {
        questionText = parsedQuestion.clozeDeleted;
        correctReponse = parsedQuestion.cloze;
    }
    inquirer.prompt([{
        name: 'response',
        message: questionText
    }]).then(function(answer) {
        if (answer.response === correctReponse) {
            console.log('Correct!');
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        } else {
            console.log('Wrong!');
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        }
    });
};
