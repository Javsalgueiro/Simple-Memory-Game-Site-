// global constants
const baseClueHoldTime = 1000;
const cluePauseTime = 333; //how long to pause in between clues
const clueSpeedUp = 1.5; //speed-up rate
const levels = 8; //levels of the game
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
var clueHoldTime; //how long to hold each clue's light/sound
var gamePlaying = false;
var guessCounter = 0;
var maxLevelReached = 0;
var pattern; //stores array for the random pattern
var progress = 0; //keeps progress of the levels user is in.
var strikesCounter; //keeps track of user mistakes.
var tonePlaying = false;
var volume = 0.5;  //must be between 0.0 and 1.0

function randomArr(){
  var temp = Array(levels);
  for(let i=0;i<levels;i++){
    temp[i] = Math.floor(Math.random() * 5) + 1;
  }
  return temp;
}


function startGame() {
  //initialize game variables
  pattern = randomArr(); //sets a unique pattern each time the game initializes
  clueHoldTime = baseClueHoldTime; //sets the hold time to original value
  strikesCounter = 0;
  document.getElementById("strikes").innerHTML = strikesCounter; //updates user mistakes on html
  progress = 0;
  gamePlaying = true;
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("endBtn").classList.remove("hidden");
  playClueSequence();
}

function endGame() {
  gamePlaying = false;
  if (progress + 1 > maxLevelReached){
    maxLevelReached = progress + 1;
    document.getElementById("maxLevel").innerHTML = maxLevelReached; //updates maxLevelReached on html
  }
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("endBtn").classList.add("hidden");
}

// Sound Synthesis Functions
const freqMap = {
  1: 230.4,
  2: 300.9,
  3: 350.5,
  4: 433.2,
  5: 512.1
}
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}
function startTone(btn){
  if(!tonePlaying){
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    context.resume()
    tonePlaying = true
  }
}
function stopTone(){
  g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
  tonePlaying = false
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext 
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)

function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
}
function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
}

function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

function playClueSequence(){
  context.resume()
  guessCounter = 0;
  document.getElementById("counter").innerHTML = progress + 1; //updates level counter on html
  let delay = nextClueWaitTime; //set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
}

function loseGame(){
  endGame();
  alert("Game Over. You lost.");
}
function winGame(){
  endGame();
  alert("Game Over. You won!");
}

function guess(btn){
  console.log("user guessed: " + btn);
  
  if(!gamePlaying){
    return;
  }
  
  if(pattern[guessCounter] == btn){
    //Guess was correct!
    if(guessCounter == progress){
      if(progress == pattern.length - 1){
        //GAME OVER: WIN!
        winGame();
      }else{
        //Pattern correct. Add next segment
        progress++;
        clueHoldTime = clueHoldTime / clueSpeedUp; //Speeds up after each level completed succesfully
        playClueSequence();
      }
    }else{
      //so far so good... check the next guess
      guessCounter++;
    }
  }else{
    //Guess was incorrect
    //Updates user mistakes
    strikesCounter++;
    document.getElementById("strikes").innerHTML = strikesCounter;
    if (strikesCounter == 3){
      //GAME OVER: LOSE!
      loseGame();
    }
  }
}    