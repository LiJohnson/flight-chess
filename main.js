const COLORS = ["red", "green", "yellow", "blue"];
const OFFSET = [0, 13, 13 * 2, 13 * 3];
const CHESS_STATUS = {
  HOME: 0,
  AIRPORT: 1,
  FLIGHTING: 2,
};
const TURN_END_POSITION = 50
const ENDED_POSITION = 56
const CLASH_POSITION= 53

class Chess {
  color = "";
  offset = 0;
  position = 0;
  state = CHESS_STATUS.HOME;
  constructor(color, offset) {
    this.color = color;
    this.offset = offset;
  }

  getGlobalPosition() {
    return this.offset + this.position;
  }
}

class Player {
  chessA;
  chessB;
  chessC;
  chessD;
  constructor(index) {
    this.chessA = new Chess( COLORS[index],OFFSET[index]);
    this.chessB = new Chess( COLORS[index],OFFSET[index]);
    this.chessC = new Chess( COLORS[index],OFFSET[index]);
    this.chessD = new Chess( COLORS[index],OFFSET[index]);
  }
}

class FlightChess {
  constructor(playerNum) {}
}
