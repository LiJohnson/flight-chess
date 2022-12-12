assert = console.assert;

class Chess {
  color = "";
  offset = 0;
  position = 0;
  state = FlightChess.CHESS_STATUS.HOME;
  moveTimes = 0;
  jumpTimes = 0;
  constructor(color, offset) {
    this.color = color;
    this.offset = offset;
  }

  getGlobalPosition() {
    return (this.offset + this.position) % FlightChess.TOTAL_STEP;
  }
  startup(callback = () => { }) {
    assert(this.state === FlightChess.CHESS_STATUS.HOME, "can not startup");
    this.state = FlightChess.CHESS_STATUS.AIRPORT;
    this.position = 0;
    callback({ chess: this, type: FlightChess.CHESS_ACTION.STARTUP });
  }

  move(step, callback = () => { }, checkAttak = () => { }) {
    if (this.state === FlightChess.CHESS_STATUS.AIRPORT) {
      this.state = FlightChess.CHESS_STATUS.FLIGHTING;
    }
    assert(this.state === FlightChess.CHESS_STATUS.FLIGHTING, "can not flight");

    let action = {
      chess: this,
      type: FlightChess.CHESS_ACTION.MOVE,
      step,
      from: this.position,
    };
    this.moveTimes++;
    this.position += step;
    action.to = this.position;

    if (this.position > FlightChess.ENDED_POSITION) {
      let over = this.position - FlightChess.ENDED_POSITION;
      this.position = FlightChess.ENDED_POSITION - over;

      action.to = FlightChess.ENDED_POSITION;
      action.step = FlightChess.ENDED_POSITION - (this.position - step);
      callback(action);
      action = {
        ...action,
        from: FlightChess.ENDED_POSITION,
        to: this.position,
        step: over,
      };
    }
    callback(action);

    if (this.position === FlightChess.ENDED_POSITION) {
      this.state = FLIGHTING.CHESS_STATUS.ENDED;
      callback({ chess: this, type: FlightChess.CHESS_ACTION.LAND });
      return;
    }
    if (this.position >= FlightChess.TURN_END_POSITION) {
      return;
    }
    if (checkAttak(this)) return;
    if (this.position === FlightChess.FLY_POSITION) {
      this.position += 12;
      this.jumpTimes += 1;
      if (checkAttak(this, FlightChess.CLASH_POSITION)) return;
    }
    if (checkAttak(this)) return;
    if (this.position % 4 === 1) {
      this.position += 4;
      this.jumpTimes += 1;
    }
    if (checkAttak(this)) return;
    if (this.position === FlightChess.FLY_POSITION) {
      this.position += 12;
      this.jumpTimes += 1;
      if (checkAttak(this, FlightChess.CLASH_POSITION)) return;
    }
    if (checkAttak(this)) return;
  }
  crash(callback) {
    assert(this.state === FlightChess.CHESS_STATUS.FLIGHTING, "is not flighting")
    this.state = FlightChess.CHESS_STATUS.HOME
    this.position = 0
    callback({ chess: this, type: FlightChess.CHESS_ACTION.CRASH });
  }
}

class Player {
  chessA;
  chessB;
  chessC;
  chessD;
  color;
  colorIndex;
  constructor(index) {
    index = index || 0;
    this.chessA = new Chess(
      FlightChess.COLORS[index],
      FlightChess.OFFSET[index]
    );
    this.chessB = new Chess(
      FlightChess.COLORS[index],
      FlightChess.OFFSET[index]
    );
    this.chessC = new Chess(
      FlightChess.COLORS[index],
      FlightChess.OFFSET[index]
    );
    this.chessD = new Chess(
      FlightChess.COLORS[index],
      FlightChess.OFFSET[index]
    );
    this.color = FlightChess.COLORS[index]
    this.colorIndex = index
  }

  listChess() {
    return [this.chessA, this.chessB, this.chessC, this.chessD];
  }

  isWin() {
    return this.listChess().map(c => c.state).every(state => state === FlightChess.CHESS_STATUS.ENDED);
  }
}

class FlightChess {
  static COLORS = ["red", "green", "yellow", "blue"];
  static OFFSET = [0, 13, 13 * 2, 13 * 3];
  static CHESS_STATUS = {
    HOME: 0,
    AIRPORT: 1,
    FLIGHTING: 2,
    ENDED: 3,
  };
  static CHESS_ACTION = {
    STARTUP: 0,
    MOVE: 1,
    JUMP: 2,
    FLY: 3,
    ATTACK: 4,
    CRASH: 5,
    LAND: 6,
  };

  static TOTAL_STEP = 52
  static TURN_END_POSITION = 50;
  static ENDED_POSITION = 56;
  static CLASH_POSITION = 53;
  static FIRST_POSITION_COLOR_INDEX = 3;
  static FLY_POSITION = 17;

  players;
  recoads;
  round = {};
  constructor(playerNum) {
    if (playerNum === 2) {
      this.players = [0, 2].map((i) => new Player(i));
    } else if (playerNum === 3) {
      this.players = [0, 1, 2].map((i) => new Player(i));
    } else if (playerNum === 4) {
      this.players = [0, 1, 2, 3].map((i) => new Player(i));
    } else {
      assert(false, `not enough players num error: ${playerNum}`);
    }
    this.recoads = [];
  }

  async play() {
    while (true) {
      this.players.forEach(async p => {
        this.round.play = p;
        let rollTimes = 1;
        for (let i = 0; i < rollTimes; i++) {
          let step = await new Promise(reslove => {
            this.round.rollDice = num => reslove(num)
          })
          let chess = await new Promise(reslove => {
            this.round.selectChess = chess => reslove(chess)
          })
          chess.move(step, this.addRecord, this.checkAttak)
          if( p.isWin() ){
            console.log("game over")
            return 
          }
          if (step === 6) { rollTimes++ }
          
          if (rollTimes === 3) {
            p.listChess().filter(c => c.state === FLIGHTING.CHESS_STATUS.FLIGHTING).forEach(c => c.crash(this.recoads))
          }
        }
      })
    }
  }
  rollDice() {
    this.round.rollDice(Math.floor(Math.random() * 6 + 1))
  }
  selectChess(chess) {
    if (chess.color === this.dice.player.color) {
      this.round.selectChess(chess)
    }
  }
  checkAttak(chess, position) {
    if (position === FLIGHTING.CLASH_POSITION) {
      let index = (this.round.player.colorIndex + 2) % 4
      this.players.filter(p => p.colorIndex === index).flatMap(p => p.listChess()).filter(c => c.position === FLIGHTING.CLASH_POSITION).forEach(c => {
        c.crash(this.addRecord)
      })
      return
    }
    this.players.filter(p => p.color !== chess.color).flatMap(p => p.listChess()).forEach(beAttackedChess => {
      if (chess.position === beAttackedChess.position) {
        beAttackedChess.crash(this.addRecord)
      }
    })
  }
  isOver() {
    return this.players.find(p => p.isWin())
  }


  addRecord(action) { this.recoads.push(action) }
}
