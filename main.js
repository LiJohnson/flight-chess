assert = (exp, message) => {
  if (exp) return
  throw new Error(message)
}

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
    this.position = -1
  }

  getGlobalPosition() {
    if(this.position <1 )return -1
    if(this.position > FlightChess.TURN_END_POSITION )return -2
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
      this.state = FlightChess.CHESS_STATUS.ENDED;
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
    if (this.position % 4 === 2) {
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
    this.position = -1
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
  static COLORS = ["red",  "yellow", "blue",  "green"];
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
  static FLY_POSITION = 18;
  static FLY_STEP = 12
  static JUMP_STEP = 4
  static AIRPORT_DICE_NUM = [6]
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
      for (let p of this.players) {
        {
          this.round.player = p;
          let rollTimes = 1;
          for (let i = 0; i < rollTimes; i++) {
            this.round.action = `${p.color} to roll dice`
            let step = await new Promise(reslove => {
              this.round.rollDice = num => reslove(num)
            })
            this.addRecord({
                player:p,
                type: 'roll dice',
                step:step
            })
            this.round.step = step
            delete this.round.rollDice

            let isStartupStepNum = FlightChess.AIRPORT_DICE_NUM.some(num => num === step)
            let hasStartupChess = p.listChess().some(c => c.state === FlightChess.CHESS_STATUS.AIRPORT || c.state === FlightChess.CHESS_STATUS.FLIGHTING)
            if (!isStartupStepNum && !hasStartupChess) {
              continue
            }
            if (step === 6) { rollTimes++ }
            if (rollTimes === 4) {
              rollTimes = 0
              p.listChess().filter(c => c.state === FlightChess.CHESS_STATUS.FLIGHTING).forEach(c => c.crash(c => this.addRecord(c)))
              continue
            }
            this.round.action = `to select ${p.color} chess , and move step ${step}`
            let chess = await new Promise(reslove => {
              this.round.selectChess = chess => reslove(chess)
            })
            delete this.round.selectChess
            if (chess.state === FlightChess.CHESS_STATUS.HOME && FlightChess.AIRPORT_DICE_NUM.find(num => num === this.round.step)) {
              chess.startup(a => this.addRecord(a))
            } else {
              chess.move(step, a => this.addRecord(a), (c, p) => this.checkAttak(c, p))
            }
            if (p.isWin()) {
              console.log("game over")
              return
            }
          }
        }
      }
    }
  }
  // s = [2, 6]
  rollDice() {
    assert(this.round && this.round.rollDice, "can not roll dice now")
    let step = Math.floor(Math.random() * 6 + 1)
    // let step = this.s.pop()
    this.round.rollDice(step)
    return step
  }
  selectChess(chess) {
    assert(this.round.player && this.round.selectChess, "cant not select chess now")
    assert(chess.color === this.round.player.color, "select chess color error")
    assert(chess.state !== FlightChess.CHESS_STATUS.ENDED, "chess is landed")
    if (chess.state === FlightChess.CHESS_STATUS.HOME) {
      assert(FlightChess.AIRPORT_DICE_NUM.some(num => this.round.step === num), "can not startup")
    }

    this.round.selectChess(chess)
  }
  checkAttak(chess, position) {
    if (position === FlightChess.CLASH_POSITION) {
      let index = (this.round.player.colorIndex + 2) % 4
      this.players.filter(p => p.colorIndex === index).flatMap(p => p.listChess()).filter(c => c.position === FlightChess.CLASH_POSITION).forEach(c => {
        c.crash(a => this.addRecord(a))
      })
      return
    }
    this.players.filter(p => p.color !== chess.color).flatMap(p => p.listChess())
      .filter(c => c.state === FlightChess.CHESS_STATUS.FLIGHTING)
      .filter(c => c.position <= FlightChess.TURN_END_POSITION)
      .forEach(beAttackedChess => {
        if (chess.getGlobalPosition() === beAttackedChess.getGlobalPosition()) {
          beAttackedChess.crash(c => this.addRecord(c))
        }
      })
  }
  isOver() {
    return this.players.find(p => p.isWin())
  }
  addRecord(action) {
    // recoads.push(action)
    this.recoads.push(action)
  }
}
