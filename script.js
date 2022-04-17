const GAMEBOARD = 'gameboard';
//iezimējas pogas, kas tiek nospiesti, lai izvēlēties kurš no spēlētājiem vai dators vai spēlētājs sāks spēli pirmais.

var header = document.getElementById("move_choose");
var btns = header.getElementsByClassName("btn");
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
  var current = document.getElementsByClassName("active");
  if (current.length > 0) { 
    current[0].className = current[0].className.replace(" active", "");
  }
  this.className += " active";
  });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const players = {
    PLAYER_ONE: 0, //spēlētājs
    PLAYER_TWO: 1 //vai computer
};

class Board {
    constructor() {
        this.selectedRow = -1;  //nozīme, ka no spēlēs sākuma nav izvēlēta neviena rindiņa
        //Change array to change the matches on board
        this.matchesInEachRow = [1, 2, 3];  // rindiņu skaits pēc index 0 1 2  = 3 rindiņas. Viena rindiņa ir 1 serkociņš , otrāja - 2 un trešaja 3
    }

    removeMatch(row) { // tiek padots rindas numurs no kura noņemt serkociņas.
        const canRemoveMatch = this._canRemoveMatch(row); // mainīga tiek saglabāta vertība kas tiek atgriezta funkcijā
        if (canRemoveMatch) { //nosacījums pārbaud vai no izvēlētas rindas var vai nevar dzēst serkociņus
            this.selectedRow = row; // mainīga tiek saglabāts izvēlēta rinda
            this.matchesInEachRow[row]--; // no izvēlētas rindas tiek noņemti serkociņi
        }

        return canRemoveMatch;
    }

    _canRemoveMatch(row) { 
        return this.selectedRow === -1 || this.selectedRow === row; // pārbaud rindu no kurā var ņemt serkociņus
    }

    endMove() {
        this.selectedRow = -1;  // beidzas gājiens un var izvēlēties jebkuru rindu
    }

    isGameOver() {
        return this.matchesInEachRow.every(match => match <= 0);   // beidzas spēle, kad nepaliek rindiņas
    }
}

class Game {
    constructor() {
        //  this.currentPlayer = Math.floor(Math.random() * 2);
        this.board = new Board();  // spēlēs laukuma inicializācija
        this.scores = [0, 0];      // punktu pievienošana. No spēlēs sākuma abiem spēlētājiem ir 0 punkti.
    }

    async start(move) {
        this._setPlayerNames();      //Funkcijas izsaukums. Lietotājvārdu pievienošana diviem spēlētājiem (spēlētājs + dators)
        this._setPlayerButtons();    //Funkcijas izsaukums. Lietotājvārdu pievienošana diviem spēlētājiem
        console.log("player",this.currentPlayer=move);
        document.getElementById('end_turn').onclick = () => this._endMove(this.currentPlayer); // spiežot uz pogu "pabeigt gājienu" funkcija endmove tiek padots lietotāja ID 0 vai 1
        this._createBoard();        //Funkcijas izsaukums. Serkociņu pievienošana.

        if (this.aiEnabled && this.currentPlayer === players.PLAYER_TWO) {
            await sleep(1000);
            this._aiMove();
        }
    }
    start_one_vs_one() {
        this.board = new Board(); // atkartota spēlēs laukuma inicializācija
        this.scores = [0, 0];     // punkti tiek atiestatīti atpakaļ uz nullem.
        this.currentPlayer = Math.floor(Math.random() * 2); //šoreiz nolēmu, lai pirmo gajienu uzsāka spēlētājs nejaušā secība.
        this._setPlayerNames(); //Funkcijas izsaukums. Lietotājvārdu pievienošana diviem spēlētājiem (spēlētājs + dators)
        this._setPlayerButtons();
        this._createBoard();
        document.getElementById('end_turn').onclick = () => this._endMove(this.currentPlayer);
    }

    _createRow(matchesInRow, row) {
        const gameBoardElement = document.getElementById(GAMEBOARD); //paņem ID un ieraksta mainīga. 
        const rowContainer = document.createElement('div'); // izveido DIV 
        rowContainer.classList.add('mat');  // ieraksta klases 
        gameBoardElement.appendChild(rowContainer); // pievieno HTML klases iekš DIV. 

        for (let i = 0; i < matchesInRow; i++) {
            const element = this._createButton(row); // funkcija, kura veido serkociņus
            rowContainer.appendChild(element);
        }
    }

    _createBoard() {
        document.getElementById(GAMEBOARD).innerHTML = ''; //taisam tukšo laukumu
        for (let i=0; i < this.board.matchesInEachRow.length; i++){
            this._createRow(this.board.matchesInEachRow[i],i); // izsauc funkciju kas veido rindas un padod iekš parametrus rindas numuru un serkociņu skaitu rindā
        }
      
    }

    async reset() {
        this.board = new Board(); // atkartota spēlēs laukuma inicializācija
        this.scores = [0, 0];     // punkti tiek atiestatīti atpakaļ uz nullem.
        this.currentPlayer = (Math.random()>=0.5)? 1 : 0; //šoreiz nolēmu, lai pirmo gajienu uzsāka spēlētājs nejaušāja secība.
        this._setPlayerNames(); //Funkcijas izsaukums. Lietotājvārdu pievienošana diviem spēlētājiem (spēlētājs + dators)
        $('.matches').show("fast");  // paradas atpakaļ visi serkociņi
        $('.matches').attr('disabled', false); 
        this._setPlayerButtons();

        if (this.aiEnabled && this.currentPlayer === players.PLAYER_TWO) { // nosacījums pārbaud vai AI ir ieslēgts kā arī uz datora gajienu 
            await sleep(1000);
            this._aiMove(); // datora gajiena funkcijas izsaukums
        }
    }

    async _endMove(player) {  // funkcijā tiek padots parametrs vai tas ir spēlētājs vai dators 
        this.board.endMove(player); 
        this.playerButtons[player].style.fontWeight = 'normal'; //tiek izmaninīts fonts
        this._setEndTurnButtonEnabled(true); // tiek izsaukta funkcija un aktivizēta poga "pabeigt gājienu"

        if (this.board.isGameOver()) {
            alert(`Game Over! ${this.playerNames[player]} won!`); // izlec paziņojums par spēlēs nobeigumu ar uzvarētāju
            return;
        }

        this.currentPlayer = player ? players.PLAYER_ONE : players.PLAYER_TWO;
        this.playerButtons[this.currentPlayer].style.fontWeight = 'bolder'; //tiek izmaninīts fonts

        if (this.aiEnabled && this.currentPlayer === players.PLAYER_TWO) { // nosacījums pārbaud vai AI ir ieslēgts kā arī uz datora gajienu 
            await sleep(1000);
            this._aiMove(); // datora gajiena funkcijas izsaukums
        }
    }

    async _aiMove() { // datora gajiens // šī funkcija tieši šeit apskata tikai pirmo gajienu. 
        let bestScore = -Infinity;
        const bestMove = {};

        //Check all possible moves
        for (let i = 0; i < this.board.matchesInEachRow.length; i++) { // rinda 
            for (let j = 1; j <= this.board.matchesInEachRow[i]; j++) { //  serkociņi
                const board = [...this.board.matchesInEachRow]; //  masīva kopija tiek saglabāta mainīga
                console.log('--',JSON.stringify(board), i, j);
                board[i] -= j; //no konkrētas rindas,  tiek noņemti serkociņi  
                const score = this._minimax([...board], 1, false );  //tiek izsaukta minimax funkcija
                console.log(score);
                if (score > bestScore) {
                    bestScore = score;   
                    bestMove.row = i; // tiek piešķirts rindas numurs 
                    bestMove.matches = j; // tiek piešķirts serkociņu skaits
                }
            }
        }

        const aiElement = $('.mat').eq(bestMove.row);

        for (let i = bestMove.matches; i > 0; i--) {
            aiElement.children(":not([disabled])").first().click();
        }
        await sleep(1000);
        this._endMove(1);
    }

    _minimax(board, depth, maximizingPlayer) {
        if (board.every(match => match == 0)) {
            console.log (1/depth, depth)
            return maximizingPlayer ? -1 / depth : 1 / depth;

            //Score tiek aprēķināts attiecīgi pret dziļumu, 
            //jo vairāk gājieni, jo lielāks skaitlis. 
            //To var izdarīt aprēķinot dziļumu -1 pakāpē jeb 1 / depth. 
            //Ja dators uzvar vērtība ir negatīva, ja spēlētājs, tad pozitīva.
    
        }

        if (depth >= 100) {
            return 0;
        }

        if (maximizingPlayer) { // ja spēlē dators
            let bestScore = -Infinity; // no mīnus bezgalības uz augšu tā ir atrast labāko gajienu priekš datoram MAX vertību
            for (let i = 0; i < board.length; i++) {  //rindas numurs
                for (let j = 1; j <= board[i]; j++) { //serkociņi rindā
                    console.log('--','|'.repeat(depth),JSON.stringify(board), i, j);
                    board[i] -= j;  // atņem serkociņu
                    const score = this._minimax([...board], depth + 1, false); // funkcija minimax izsaucas rekursīvi, lai dziļāk un dziļāk iet kokā, taisot massīva kopiju, un katru reizi pievieno +1 dziļumam, lai atrastu labāko
                    bestScore = Math.max(score, bestScore);  // paņem maksimālo skaitli starp diviem. 
                }
            }
            return bestScore;
        } else { // ja spēlē lietotājs (spēlētājs)
            let bestScore = Infinity; // no plus bezgalības uz leju, lai atrast spēlētāja gajienus
            for (let i = 0; i < board.length; i++) { //rinda 
                for (let j = 1; j <= board[i]; j++) { //serkociņi rindā
                    console.log('++','|'.repeat(depth),JSON.stringify(board), i, j);
                    board[i] -= j; // atņem serkociņu
                    const score = this._minimax([...board], depth + 1, true); //funkcija izsaucas rekursīvi
                    bestScore = Math.min(score, bestScore);  // paņem minimālo skaitli starp diviem. 
                }
            }
            return bestScore;
        }
    }

    //funkcija uzliek spēlētāja lietotājvārdu, pogas utt.
    _setPlayerButtons() {
        const firstPlayerName = document.getElementById('first_player');
        firstPlayerName.innerText = `${this.playerNames[0]} (0)`;
        firstPlayerName.style.fontWeight = this.currentPlayer === players.PLAYER_ONE ? 'bolder' : 'normal';

        const secondPlayerName = document.getElementById('second_player');
        secondPlayerName.innerText = `${this.playerNames[1]} (0)`;
        secondPlayerName.style.fontWeight = this.currentPlayer === players.PLAYER_TWO ? 'bolder' : 'normal';
        return this.playerButtons = [firstPlayerName, secondPlayerName];

    }
 
    //funkcija uzliek spēlētāju lietotājvārdus, ja spēle notiek spēlētājs vs dators, kā arī spēlētājs vs spēlētājs
    _setPlayerNames() {
        if (this.aiEnabled) {
            const playerName = document.getElementById('player_name').value || "Player";
            return this.playerNames = [playerName, "Computer"];
        }

        const player1Name = document.getElementById('first_player_name').value || 'Player 1';
        const player2Name = document.getElementById('second_player_name').value || 'Player 2';
        return  this.playerNames = [player1Name, player2Name];
    }

    _updatePlayerScore(player) { //funkcija atjauno spēlētāju punktu skaitu
        this.scores[this.currentPlayer] += 1; // pēc katras nospiešanas uz serkociņu, kura tiek dzēsta spēlētājam pievienojas 1 punkts
        this.playerButtons[player].innerText=`${this.playerNames[this.currentPlayer]} (${this.scores[this.currentPlayer]})`;
    }

    _createButton(row) {
        const element = document.createElement('button'); //tiek izveidots bloks
        element.innerText = '|'; // veidojas serkociņi
        element.className = "matches"; //blokā tiek ierakstīta klase 
        element.onclick = () => {
            if (this.board.removeMatch(row)) {
                element.disabled = true;
                $(element).hide('fast'); // spiežot uz serkociņiem tie pazūd no rindas
                this._setEndTurnButtonEnabled(false); 
                this._updatePlayerScore(this.currentPlayer); // mainas punktu skaits 
            }
            
        }
        return element;
    }
    //funkcija maina pogas statusu. 
    _setEndTurnButtonEnabled(status) {
        document.getElementById('end_turn').disabled = status;
    }
}

jQuery(document).ready(function () {
    jQuery('.modal').modal({
        'opacity': 1
    });
    jQuery('.players_game').hide();
    jQuery('.players_computer').hide();
    jQuery(".game-mode").on("click", function () {
        if (jQuery(this).hasClass("two-player")) {
            jQuery('.players_computer').hide();
            jQuery(this).css("border", "2px solid red");
            jQuery(".computer").css("border", "none");
            jQuery('.players_game').toggle();
            
        } else {
            jQuery('.players_game').hide();
            jQuery('.players_computer').toggle();
            jQuery(this).css("border", "2px solid red");
            jQuery(".two-player").css("border", "none");
            jQuery('.move').show();
        }

    });

    $('.modal').modal('open');

    $('.tooltipped').tooltip();

    $('.sidenav').sidenav();
});

const game = new Game();

document.getElementsByClassName('two-player').onclick = () => game.aiEnabled = false; // ja tiek nospiests uz klasi "two-player" tad spēle notiek spēlētājs vs spēlētājs
document.getElementsByClassName('computer')[0].onclick = () => game.aiEnabled = true; // ja tiek nospiests uz klasi "computer" tad spēle notiek spēlētājs vs dators

document.getElementsByClassName('move_comp')[0].onclick = () => game.aiEnabled = true; // ja tiek nospiests uz klasi "move_comp" tad spēle pirmo gājienu veiks dators
document.getElementsByClassName('move_player')[0].onclick = () => game.aiEnabled = true; // ja tiek nospiests uz klasi "move_player" tad spēle pirmo gājienu veiks spēlētājs


var move_check_computer = document.getElementById("move_check_computer");
var move_check_player = document.getElementById("move_check_player");
move_check_computer.onclick = function(){ 
    this.currentPlayer=players.PLAYER_TWO; // mainīgā tiek padots cipars 1 t.i. spēlētājs vs spēlētāju vai datoru.
    document.getElementById('modal-close').onclick = () => game.start(this.currentPlayer); // tiek padots spēlētāju ID vai spēlēs dators vai spēlētājs. Šajā gadījuma dators
}
move_check_player.onclick = function(){
    this.currentPlayer=players.PLAYER_ONE;  // mainīgā tiek padots cipars 0 t.i. spēlētājs
    document.getElementById('modal-close').onclick = () => game.start(this.currentPlayer); // tiek padots spēlētāju ID vai spēlēs dators vai spēlētājs. Šajā gadījuma spēlētājs
}

document.getElementById('modal-close').onclick = () => game.start_one_vs_one();
document.getElementById('reset').onclick = () => game.reset();
