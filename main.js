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
    return this.offset + this.position;
  }
  startup() {
    assert(this.state === FlightChess.CHESS_STATUS.HOME, "can not startup");
    this.state = FlightChess.CHESS_STATUS.AIRPORT;
    this.position = 0;
  }
  move(step) {
    if (this.state === FlightChess.CHESS_STATUS.AIRPORT) {
      this.state = FlightChess.CHESS_STATUS.FLIGHTING;
    }
    assert(this.state === FlightChess.CHESS_STATUS.FLIGHTING, "can not flight");

    this.moveTimes++;
    this.position += step;
    if (this.position > FlightChess.ENDED_POSITION) {
      let over = this.position - FlightChess.ENDED_POSITION;
      this.position = FlightChess.ENDED_POSITION - over;
    }
    if (this.position === FlightChess.ENDED_POSITION) {
      this.state = FLIGHTING.CHESS_STATUS.ENDED;
      return;
    }
    if (this.position >= FlightChess.TURN_END_POSITION) {
      return;
    }
    //TODO check attack
    if (this.position === FlightChess.FLY_POSITION) {
      this.position += 12;
      this.jumpTimes += 1;
      //TODO check attack
    }
    //TODO check attack
    if (this.position % 4 === 1) {
      this.position += 4;
      this.jumpTimes += 1;
    }
    //TODO check attack
    if (this.position === FlightChess.FLY_POSITION) {
      this.position += 12;
      this.jumpTimes += 1;
      //TODO check attack
    }
    //TODO check attack
  }
  attack() {}
}

class Player {
  chessA;
  chessB;
  chessC;
  chessD;
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
  }

  isWin() {
    return [this.chessA, this.chessB, this.chessC, this.chessD]
      .map((c) => c.state)
      .every((state) => state === FlightChess.CHESS_STATUS.ENDED);
  }

  move(chess, step) {}
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
  static TURN_END_POSITION = 50;
  static ENDED_POSITION = 56;
  static CLASH_POSITION = 53;
  static FIRST_POSITION_COLOR_INDEX = 3;
  static FLY_POSITION = 17;

  constructor(playerNum) {}
}
