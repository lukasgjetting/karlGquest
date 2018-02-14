class Game {
  constructor(context, player) {
    this.context = context;
    this.intervalId = 0;
    this.entities = [];
    this.doors = [];
    this.onKeyDownHandlers = {};
    this.keysDown = {};
    this.player = player;
    this.headline = "";

    window.onkeydown = e => this.keysDown[e.keyCode] = true;
    window.onkeyup = e => delete this.keysDown[e.keyCode];
  }

  loop() {
    this.context.fillStyle = "#fff";
    this.context.fillRect(0, 0, 500, 500);
    
    this.context.font = "12px Verdana";

    this.player.update();
    this.player.render();

    for(let i = 0; i < this.entities.length; i++) {
      this.entities[i].update(this.player);
      this.entities[i].render();
    }

    for(let i = 0; i < this.doors.length; i++) {
      this.doors[i].update(this.player);
      this.doors[i].render(this.context);
    }    

    for(let id in this.onKeyDownHandlers) {
      if(this.keysDown[this.onKeyDownHandlers[id].keyCode]) {
        this.onKeyDownHandlers[id].handler();
      }
    }

    if(this.headline != "") {
      this.context.font = "30px Verdana";
      const gradient = this.context.createLinearGradient(0,0,c.width,0);
      gradient.addColorStop("0","magenta");
      gradient.addColorStop("0.5","blue");
      gradient.addColorStop("1.0","red");

      this.context.fillStyle = gradient;
      this.context.fillText(this.headline, 200, 90);
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

  setHeadline(headline) {
    this.headline = headline;
    setTimeout(() => {
      this.headline = "";
    }, 150*headline.length);
  }
}

class Door {
  /**
   * side:
   *  1: left
   *  2: top
   *  3: right
   *  4: bottom
   * offset:
   *  Between 0 and 1
   */
  constructor(side, offset, text, context, onEnter) {
    this.side = side;
    this.offset = offset;
    this.doorSize = [125, 15];
    this.text = text;
    this.onEnter = onEnter;
    this.playerIsEntered = false;

    /* Calculate things */
    switch(this.side) {
      case 1:
        this.width = this.doorSize[1];
        this.height = this.doorSize[0];
        this.x = 0;
        this.y = context.canvas.clientHeight * this.offset;
        break;
      case 2:
        this.width = this.doorSize[0];
        this.height = this.doorSize[1];
        this.y = 0;
        this.x = context.canvas.clientWidth * this.offset;
        break;
      case 3:
        this.width = this.doorSize[1];
        this.height = this.doorSize[0];
        this.x = context.canvas.clientWidth - this.width;
        this.y = context.canvas.clientHeight * this.offset;
        this.textOffsetY = this.height/2;
        this.textOffsetX = -context.measureText(this.text).width - this.width;
        break;
      case 4:
        this.width = this.doorSize[0];
        this.height = this.doorSize[1];
        this.x = context.canvas.clientWidth * this.offset;
        this.y = context.canvas.clientHeight - this.height;
        this.textOffsetY = -10;
        this.textOffsetX = this.width/2 - context.measureText(this.text).width/2;
        break;
    }
  }

  update(player) {
    const margin = 10;
    if(
      !this.playerIsEntered && (
        player.x + this.width > this.x &&
        player.x - this.width < this.x &&
        player.y + this.height > this.y &&
        player.y - this.height < this.y
      )
    ) {
      this.onEnter();
      this.playerIsEntered = true;
    } else if(
      this.playerIsEntered && (
        player.x + this.width < this.x ||
        player.x - this.width > this.x ||
        player.y + this.height < this.y ||
        player.y - this.height > this.y
      )
    ) {
      this.playerIsEntered = false;
    }
  }

  render(context) {
    context.fillStyle = "brown";
    context.fillRect(this.x, this.y, this.width, this.height);
    context.fillText(this.text, this.x+this.textOffsetX, this.y+this.textOffsetY);
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

const birgitte = new Enemy(250, 250, 25, "red", "Birgitte", ctx, 50,
  self => {
    self.textPlate = "Hej Karl!";
    let i = 0;
    const texts = [
      "Du skal skynde dig til time!",
      "Du har IT!",
    ];
    const intId = setInterval(() => {
      if(texts[i] === undefined || !self.playerInVicinity) {
        clearInterval(intId);
        return;
      }

      self.textPlate = texts[i];
      i++;
    }, 2000);
  },
  self => {
    self.textPlate = "Ses Karl!";
    setTimeout(() => {
      if(!self.playerInVicinity) {
        self.textPlate = "";
      }
    }, 750);
  }
);

game.doors.push(new Door(3, 0.3, "IT-lokalet", ctx, () => {
  game.setHeadline("Øv, time :(");
}));
game.doors.push(new Door(4, 0.6, "Lærerværelset (kaffe)", ctx, () => {
  game.setHeadline("Jubii, kaffe!");
}));

game.setHeadline("Snak med Birgitte!        ");
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

game.entities.push(birgitte);

game.start();