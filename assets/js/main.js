class Game {
  constructor(context, player) {
    this.context = context;
    this.intervalId = 0;
    this.entities = [];
    this.onKeyDownHandlers = {};
    this.keysDown = {};
    this.player = player;

    window.onkeydown = e => this.keysDown[e.keyCode] = true;
    window.onkeyup = e => delete this.keysDown[e.keyCode];
  }

  loop() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 500, 500);
    
    for(let i = 0; i < this.entities.length; i++) {
      this.entities[i].update(this.player);
      this.entities[i].render();
    }

    this.player.update();
    this.player.render();


    for(let id in this.onKeyDownHandlers) {
      if(this.keysDown[this.onKeyDownHandlers[id].keyCode]) {
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
  constructor(x, y, size, color, name, context) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.context = context;
    this.name = name;
    this.namePlateStyle
    this.textPlate = "";
    this.textPlateStyle = "";
  }
  render() {
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.arc(this.x, this.y, this.size, 0, 2*Math.PI);
    this.context.fill();

    if(this.textPlateStyle != "") {
      this.context.fillStyle = this.textPlateStyle;
    }

    if(this.textPlate != "") {
      this.context.fillText(this.textPlate, this.x, this.y - this.size * 2);
    }

    if(this.namePlateStyle != "") {
      this.context.fillStyle = this.namePlateStyle;
    }

    if(this.name != "") {
      this.context.fillText(this.name, this.x-this.context.measureText(this.name).width/2, this.y + this.size * 1.5);
    }
  }

  update(player) {
    // Do nothing
  }
}

class Enemy extends Entity {
  constructor(x, y, size, color, name, context, vicinityRange, onPlayerEnterVicinity, onPlayerExitVicinity) {
    super(x, y, size, color, name, context);
    this.playerInVicinity = false;
    this.vicinityRange = vicinityRange;
    this.onPlayerEnterVicinity = onPlayerEnterVicinity;
    this.onPlayerExitVicinity = onPlayerExitVicinity;
  }

  update(player) {
    const margin = player.size + this.size + this.vicinityRange;
    if(
      !this.playerInVicinity && (
        player.x + margin > this.x &&
        player.x - margin < this.x &&
        player.y + margin > this.y &&
        player.y - margin < this.y
      )
    ) {
      this.playerInVicinity = true;
      this.onPlayerEnterVicinity(this);
    } else if(
      this.playerInVicinity && (
        player.x + margin < this.x ||
        player.x - margin > this.x ||
        player.y + margin < this.y ||
        player.y - margin > this.y
      )
    ) {
      this.playerInVicinity = false;
      this.onPlayerExitVicinity(this);
    }
  }
}

const c = document.getElementById("game");
const ctx = c.getContext("2d");

const player = new Entity(50, 50, 20, "#cecece", "Karl", ctx);
player.namePlateStyle = "black";
const game = new Game(ctx, player);

const birgitteAppel = new Enemy(250, 250, 25, "red", "Birgitte Apel", ctx, 50,
  self => {
    self.textPlate = "Hej Karl!";
  },
  self => {
    self.textPlate = "Ses Karl!";
    setTimeout(() => {
      if(!self.playerInVicinity) {
        self.textPlate = "";
      }
    }, 750);
  });


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

game.entities.push(birgitteAppel);

game.start();