class Game {
  constructor(context) {
    this.context = context;
    this.intervalId = 0;
    this.entities = [];
    this.onKeyDownHandlers = {};
    this.keysDown = {};

    window.onkeydown = e => this.keysDown[e.keyCode] = true;
    window.onkeyup = e => delete this.keysDown[e.keyCode];
  }

  loop() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 500, 500);
    
    for(let i = 0; i < this.entities.length; i++) {
      this.entities[i].render();
    }

    console.log(JSON.stringify(this.keysDown));

    for(let id in this.onKeyDownHandlers) {
      console.log("checking");
      if(this.keysDown[this.onKeyDownHandlers[id].keyCode]) {
        console.log("!!");
        this.onKeyDownHandlers[id].handler();
      }
    }
  }

  start() {
    this.intervalId = setInterval(() => this.loop(), 1000/60);
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = 0;
  }

  addOnKeyDownHandler(id, keyCode, handler) {
    this.onKeyDownHandlers[id] = { keyCode, handler };
  }

  removeOnKeyDownHandler(id) {
    delete this.onKeyDownHandlers[id];
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
const player = new Entity(50, 50, 20, "#cecece", ctx);

game.addOnKeyDownHandler("playerLeft", 37, () => {
  player.x -= 3;
});
game.addOnKeyDownHandler("playerUp", 38, () => {
  player.y -= 3;
});
game.addOnKeyDownHandler("playerRight", 39, () => {
  player.x += 3;
});
game.addOnKeyDownHandler("playerDown", 40, () => {
  player.y += 3;
});

game.entities.push(player);

game.start();