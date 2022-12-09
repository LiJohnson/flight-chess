assert = console.assert;

class Chess {
  color = "";
  offset = 0;
  position = 0;
  state = FlightChess.CHESS_STATUS.HOME;
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
   
  }
  crash() {}
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

  constructor(playerNum) {}
}
