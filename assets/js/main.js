class Game {
  constructor(context) {
    this.context = context;
    this.intervalId = 0;
    this.entities = [];
  }

  loop() {
    ctx.fillStyle = "#ddd";
    ctx.fillRect(0, 0, 500, 500);
    for(let i = 0; i < this.entities.length; i++) {
      this.entities[i].render();
    }

    this.checkInput();
  }

  start() {
    this.intervalId = setInterval(() => this.loop(), 1000/60);
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = 0;
  }
}

class Entity {
  constructor(x, y, size, color, context) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.context = context;
  }
  render() {
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.arc(this.x, this.y, this.size, 0, 2*Math.PI);
    this.context.fill();
  }
}

const c = document.getElementById("game");
const ctx = c.getContext("2d");

const game = new Game(ctx);
const player = new Entity(50, 50, 20, "red", ctx);

game.entities.push(player);

game.start();