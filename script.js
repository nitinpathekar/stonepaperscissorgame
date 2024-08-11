// script.js

// Get references to the DOM elements
const choices = document.querySelectorAll('.choice');
const resultText = document.getElementById('resultText');
const playerScoreElement = document.getElementById('playerScore');
const computerScoreElement = document.getElementById('computerScore');

let playerScore = 0;
let computerScore = 0;

// Function to get the computer's choice
function getComputerChoice() {
    const choices = ['stone', 'paper', 'scissor'];
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

// Function to determine the winner
function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'draw';
    } else if (
        (playerChoice === 'stone' && computerChoice === 'scissor') ||
        (playerChoice === 'paper' && computerChoice === 'stone') ||
        (playerChoice === 'scissor' && computerChoice === 'paper')
    ) {
        return 'player';
    } else {
        return 'computer';
    }
}

// Function to update the scores and display the result
function playGame(playerChoice) {
    const computerChoice = getComputerChoice();
    const winner = determineWinner(playerChoice, computerChoice);

    if (winner === 'player') {
        playerScore++;
        resultText.textContent = `You win! ${playerChoice} beats ${computerChoice}.`;
    } else if (winner === 'computer') {
        computerScore++;
        resultText.textContent = `You lose! ${computerChoice} beats ${playerChoice}.`;
    } else {
        resultText.textContent = `It's a draw! You both chose ${playerChoice}.`;
    }

    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
}

// Add event listeners to each choice button
choices.forEach(choice => {
    choice.addEventListener('click', () => {
        playGame(choice.id);
    });
});

// script.js (add this inside playGame function after updating the scores)

// Data to send
const gameResult = {
    playerChoice: playerChoice,
    computerChoice: computerChoice,
    winner: winner
};

// Send data to the server
fetch('/save-result', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameResult),
})
.then(response => response.text())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
