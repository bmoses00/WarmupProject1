const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(express.static('/root/App/'));
app.use(express.json());

app.get('/ttt', (req, res) => {
	res.set('X-CSE356', '63090543047a1139b66d8902');
	if (req.query.name === undefined)
		res.sendFile('/root/App/landing.html');
	else {
		const filename = '/root/App/game.html';
		const HTML = getHTML(req.query.name);
		
		fs.writeFileSync(filename, HTML);
		res.sendFile(filename);
	}
});

app.post('/ttt/play', (req, res) => {
	res.set('X-CSE356', '63090543047a1139b66d8902');
	let winner = getWinner(req.body.grid, 'X');
	if (winner == null) {
		tryToMove(req.body.grid);
		winner = getWinner(req.body.grid, 'O');
	}
	
	if (winner == null)
		winner = ' ';
	const result = {
		grid: req.body.grid,
		winner: winner
	};
	res.send(result);
	
});

app.listen(port, () => {
	console.log(`Listening on port ${port}...`);
});

function getWinner(board, team) {
	if (isTie(board))
		return 'T';

	let winner = null;
	winner ??= checkRows(board, team);
	winner ??= checkCols(board, team);
	winner ??= checkDiags(board, team);
	return winner;
}

function isTie(board) {
	for (let i = 0; i < board.length; i++)
		if (board[i] === ' ')
			return false;
	return true;
}

function checkRows(board, team) {
	for (let row = 0; row < 3; row++) {
		let teamWins = true;

		for (let col = 0; col < 3; col++) {
			const idx = 3*row + col;
			if (board[idx] !== team) 
				teamWins = false;
		}
		if (teamWins) 
			return team;
	}
}

function checkCols(board, team) {
	for (let col = 0; col < 3; col++) {
		let teamWins = true;

		for (let row = 0; row < 3; row++) {
			const idx = 3*row + col;
			if (board[idx] !== team)
				teamWins = false;
		}
		if (teamWins)
			return team;
	}
}

function checkDiags(board, team) {
	if ((board[0] === team && board[4] === team && board[8] === team)
	 || (board[2] === team && board[4] === team && board[6] === team))
		return team;
}

function tryToMove(board) {
	for (let i = 0; i < board.length; i++) {
		if (board[i] === ' ') {
			board[i] = 'O';
			break;
		}
	}
}

function getHTML(name) {
	return `
	<head>
		<link rel="stylesheet" type="text/css" href="style.css">
	</head>
	<body>
		Hello ${name}, ${new Date()}
		<table>
			<tr>
				<th id='0'></th>
				<th id='1'></th>
				<th id='2'></th>
			</tr>
			<tr>
				<th id='3'></th>
				<th id='4'></th>
				<th id='5'></th>
			</tr>
			<tr>
				<th id='6'></th>
				<th id='7'></th>
				<th id='8'></th>
			</tr>
		</table>

		<script>
			board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];
			
			for (let i = 0; i < 9; i++) {
				const th = document.getElementById(i.toString());
				th.onclick = async () => {
					if (board[i] !== ' ')
						return;
					
					board[i] = 'X';
					const res = await fetch('http://194.113.74.26/ttt/play', {
						method: 'POST',
						body: JSON.stringify({
							grid: board
						}),
						headers: {
							'Content-type': 'application/json; charset=UTF-8'
						}
					});
					const data = await res.json();
					board = data.grid;
					
					for (let i = 0; i < 9; i++) {
						const th = document.getElementById(i.toString());
						th.innerText = board[i];
					}
				}
			};
		</script>
	</body>`
	;
	
}