// canvas variables
var canvas = document.getElementById("canvas");
var score_show = document.getElementById("score");
var level_show = document.getElementById("level");
const spanElement = document.getElementById("lvltxt");
const spanElement1 = document.getElementById("scoretxt");
const start = document.getElementById("start");
const title = document.getElementById("title");
const title_sp = document.getElementById("title_sp");
const boss_sp = document.getElementById("boss_txt");
const hp = document.getElementById("hp");
var c = canvas.getContext("2d");

hp.innerHTML = 100;

canvas.width = 1100;
canvas.height = 700;

let times_hit = 0;
let k = 1;
let DMG = 0;

var shoot = new Audio("./sfx/shoot.mp3");
var theme = new Audio("./sfx/theme.mp3");
var hit = new Audio("./sfx/hit.mp3");
var victory = new Audio("./sfx/victory.mp3");
var lose = new Audio("./sfx/gameover.mp3");

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.rotation = 0;
    this.opacity = 1;
    const image = new Image();
    image.src = "./img/spaceship.png";
    image.onload = () => {
      const scale = 0.2;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20,
      };
    };
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.translate(
      player.position.x + player.width / 2,
      player.position.y + player.height / 2
    );

    c.rotate(this.rotation);

    c.translate(
      -player.position.x - player.width / 2,
      -player.position.y - player.height / 2
    );

    if (this.image)
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );

    c.restore();
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

class Bullet {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = 3;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "blue";
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class sparkle {
  constructor({ position, velocity, radius, color, fades }) {
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.opacity = 1;
    this.radius = radius;
    this.fades = fades;
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.fades) this.opacity -= 0.01;
  }
}
class FinalBoss {
  constructor() {
    this.velocity = {
      x: 1,
      y: 0,
    };
    const image = new Image();
    image.src = "./img/boss.png";
    image.onload = () => {
      const scale = 0.5;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: 0,
        y: 0,
      };
    };
  }

  draw() {
    if (this.image)
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      this.velocity.y = 0;
      if (
        this.position.x + this.width >= canvas.width ||
        this.position.x <= 0
      ) {
        this.velocity.x = -this.velocity.x;
        this.velocity.y = 20;
      }
    }
  }

  shoot(bossBullets) {
    bossBullets.push(
      new BossBullet({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 2,
        },
      })
    );
  }
}

class Alien {
  constructor({ position }) {
    this.velocity = {
      x: 0,
      y: 0,
    };
    const image = new Image();
    image.src = "./img/invader.png";
    image.onload = () => {
      const scale = 0.1;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    if (this.image)
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
  }

  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(AlienBullets) {
    AlienBullets.push(
      new AlienBullet({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: {
          x: 0,
          y: 5,
        },
      })
    );
  }
}

class Obstacle {
  constructor({ position }) {
    this.width = 300;
    this.height = 50;

    this.position = {
      x: position.x,
      y: position.y,
    };
  }

  draw() {
    c.fillStyle = "blue";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class wave {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };

    this.velocity = {
      x: 2,
      y: 0,
    };

    this.Aliens = [];
    const rows = Math.floor(Math.random() * 3 + 2);
    const columns = Math.floor(Math.random() * 8 + 5);

    this.width = columns * 40;
    this.height = rows * 40;
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        this.Aliens.push(
          new Alien({
            position: {
              x: i * 40,
              y: j * 40,
            },
          })
        );
      }
    }
    console.log(this.Aliens);
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
  }
}

class AlienBullet {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.width = 3;
    this.height = 10;
  }

  draw() {
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class BossBullet {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.width = 3;
    this.height = 10;
  }

  draw() {
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
const player = new Player();
const boss = new FinalBoss();
const Bullets = [];
const waves = [];
const AlienBullets = [];
const bossBullets = [];
const sparkles = [];
const lives = [];
const obstacle = new Obstacle({
  position: {
    x: 100,
    y: 450,
  },
});
const obstacle2 = new Obstacle({
  position: {
    x: 650,
    y: 450,
  },
});

const gifImage = new Image();
gifImage.src = "./img/bg.gif";

const keys = {
  Left: { pressed: false },
  Right: { pressed: false },
  space: { pressed: false },
};

for (let i = 0; i < 100; i++) {
  sparkles.push(
    new sparkle({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      velocity: {
        x: 0,
        y: 0.4,
      },
      radius: Math.random() * 2,
      color: "white",
      fades: false,
    })
  );
}

class heart {
  constructor({ position }) {
    const image = new Image();
    image.src = "./img/heart.png";
    image.onload = () => {
      const scale = 0.03;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }
  draw() {
    if (this.image)
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
  }
}

function circleRectCollision(
  circleX,
  circleY,
  circleRadius,
  rectX,
  rectY,
  rectWidth,
  rectHeight
) {
  // Find the center point of the circle
  const circleCenterX = circleX + circleRadius;
  const circleCenterY = circleY + circleRadius;

  // Find the closest point on the rectangle to the center of the circle
  const closestX = Math.max(rectX, Math.min(circleCenterX, rectX + rectWidth));
  const closestY = Math.max(rectY, Math.min(circleCenterY, rectY + rectHeight));

  // Calculate the distance between the center of the circle and the closest point on the rectangle
  const distanceX = circleCenterX - closestX;
  const distanceY = circleCenterY - closestY;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  // Check if the distance is less than the radius of the circle
  return distance < circleRadius;
}

function rectRectCollision(
  rect1X,
  rect1Y,
  rect1Width,
  rect1Height,
  rect2X,
  rect2Y,
  rect2Width,
  rect2Height
) {
  // Find the edges of both rectangles
  const rect1Left = rect1X;
  const rect1Right = rect1X + rect1Width;
  const rect1Top = rect1Y;
  const rect1Bottom = rect1Y + rect1Height;
  const rect2Left = rect2X;
  const rect2Right = rect2X + rect2Width;
  const rect2Top = rect2Y;
  const rect2Bottom = rect2Y + rect2Height;

  // Check if the x and y coordinates of one rectangle are within the range of the other rectangle
  return (
    rect1Left < rect2Right &&
    rect1Right > rect2Left &&
    rect1Top < rect2Bottom &&
    rect1Bottom > rect2Top
  );
}

let game = {
  start: false,
  over: false,
  active: true,
  lvl1_complete: false,
  lvl2_complete: false,
  final_boss_complete: false,
};

let frames = 0;
let level = 1;
let score = 0;
let interval = Math.floor(Math.random() * 500 + 500);

function animate() {
  if (!game.active) return;
  requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  if (!game.start) {
    spanElement.style.display = "none";
    spanElement1.style.display = "none";
    level_show.style.display = "none";
    score_show.style.display = "none";
    boss_sp.style.display = "none";
    return;
  }

  player.update();

  for (let y = 0; y < lives.length; y++) {
    lives[y].draw();
  }
  //console.log(lives);

  sparkles.forEach((sparkle, i) => {
    if (sparkle.position.y - sparkle.radius >= canvas.height) {
      sparkle.position.x = Math.random() * canvas.width;
      sparkle.position.y = -sparkle.radius;
    }
    if (sparkle.opacity <= 0) {
      setTimeout(() => {
        sparkles.splice(i, 1);
      }, 0);
    } else {
      sparkle.update();
    }
  });
  AlienBullets.forEach((AlienBullet, index) => {
    if (AlienBullet.position.y + AlienBullet.height >= canvas.height) {
      setTimeout(() => {
        AlienBullets.splice(index, 1);
      }, 0);
    } else AlienBullet.update();

    if (
      level >= 2 &&
      (rectRectCollision(
        AlienBullet.position.x,
        AlienBullet.position.y,
        AlienBullet.width,
        AlienBullet.height,
        obstacle.position.x,
        obstacle.position.y,
        obstacle.width,
        obstacle.height
      ) ||
        rectRectCollision(
          AlienBullet.position.x,
          AlienBullet.position.y,
          AlienBullet.width,
          AlienBullet.height,
          obstacle2.position.x,
          obstacle2.position.y,
          obstacle2.width,
          obstacle2.height
        ))
    ) {
      AlienBullets.splice(index, 1);
    }
    if (
      AlienBullet.position.y + AlienBullet.height >= player.position.y &&
      AlienBullet.position.x + AlienBullet.width >= player.position.x &&
      AlienBullet.position.x <= player.position.x + player.width
    ) {
      console.log("hit");
      times_hit++;
      hit.volume = 0.05;
      hit.play();
      lives.pop();
      for (let i = 0; i < 10; i++) {
        sparkles.push(
          new sparkle({
            position: {
              x: player.position.x + player.width / 2,
              y: player.position.y + player.height / 2,
            },
            velocity: {
              x: (Math.random() - 0.5) * 3,
              y: (Math.random() - 0.5) * 3,
            },
            radius: Math.random() * 3,
            color: "white",
            fades: true,
          })
        );
      }

      setTimeout(() => {
        AlienBullets.splice(index, 1);

        if (times_hit >= 3) {
          player.opacity = 0;
          game.over = true;
        }
      }, 0);
      if (times_hit >= 3) {
        setTimeout(() => {
          game.active = false;
        }, 1000);
        theme.pause();
        lose.volume = 0.01;
        lose.play();
        title.style.display = "inline";
        title_sp.innerHTML = "Game Over";

        title_sp.style.color = "red";
        start.innerHTML = "please reload to restart";
        start.style.color = "yellow";
      }
    }
  });

  Bullets.forEach((Bullet, index) => {
    if (Bullet.position.y + Bullet.radius <= 0) {
      setTimeout(() => {
        Bullets.splice(index, 1);
      }, 0);
    } else if (
      level >= 2 &&
      (circleRectCollision(
        Bullet.position.x,
        Bullet.position.y,
        Bullet.radius,
        obstacle.position.x,
        obstacle.position.y,
        obstacle.width,
        obstacle.height
      ) ||
        circleRectCollision(
          Bullet.position.x,
          Bullet.position.y,
          Bullet.radius,
          obstacle2.position.x,
          obstacle2.position.y,
          obstacle2.width,
          obstacle2.height
        ))
    ) {
      Bullets.splice(index, 1);
    } else {
      Bullet.update();
    }
  });

  waves.forEach((wave, waveIndex) => {
    wave.update();
    if (frames % 200 === 0 && wave.Aliens.length > 0) {
      wave.Aliens[Math.floor(Math.random() * wave.Aliens.length)].shoot(
        AlienBullets
      );
    }
    if (wave.position.y + wave.height > canvas.height) {
      game.over = true;
      game.active = false;
      title.style.display = "inline";
      title_sp.innerHTML = "Game Over";
      theme.pause();
      lose.volume = 0.03;
      lose.play();
      title_sp.style.color = "red";
      start.innerHTML = "please reload to restart";
      start.style.color = "yellow";
    }
    wave.Aliens.forEach((Alien, i) => {
      Alien.update({ velocity: wave.velocity });

      // attacking enemy
      Bullets.forEach((Bullet, j) => {
        if (
          Bullet.position.y - Bullet.radius <=
            Alien.position.y + Alien.height &&
          Bullet.position.x + Bullet.radius >= Alien.position.x &&
          Bullet.position.x - Bullet.radius <= Alien.position.x + Alien.width &&
          Bullet.position.y + Bullet.radius >= Alien.position.y
        ) {
          setTimeout(() => {
            const AlienFound = wave.Aliens.find((Alientemp) => {
              return Alientemp === Alien;
            });
            const BulletFound = Bullets.find((Bullettemp) => {
              return Bullettemp === Bullet;
            });
            if (AlienFound && BulletFound) {
              score += 10;
              score_show.innerHTML = score;
              wave.Aliens.splice(i, 1);
              Bullets.splice(j, 1);

              for (let i = 0; i < 15; i++) {
                sparkles.push(
                  new sparkle({
                    position: {
                      x: Alien.position.x + Alien.width / 2,
                      y: Alien.position.y + Alien.height / 2,
                    },
                    velocity: {
                      x: (Math.random() - 0.5) * 3,
                      y: (Math.random() - 0.5) * 3,
                    },
                    radius: Math.random() * 3,
                    color: "yellow",
                    fades: true,
                  })
                );
              }

              if (wave.Aliens.length > 0) {
                const firstAlien = wave.Aliens[0];
                const lastAlien = wave.Aliens[wave.Aliens.length - 1];
                wave.width = lastAlien.position.x - firstAlien.position.x + 40;
                wave.position.x = firstAlien.position.x;
              } else {
                waves.splice(waveIndex, 1);
              }
            }
          }, 0);
        }
      });
    });
  });

  // key pressed control
  if (keys.Left.pressed && player.position.x >= 0) {
    player.velocity.x = -6;
    player.rotation = -0.12;
  } else if (
    keys.Right.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = 6;
    player.rotation = 0.12;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  //console.log(frames);
  if (frames % interval === 0) {
    if (level == 1 && k < 6) {
      waves.push(new wave());
      interval = Math.floor(Math.random() * 500 + 700);
      k++;
      if (k == 5) {
        lvl1_complete = true;
      }
    } else if (level == 2 && k < 12) {
      let g = new wave();
      g.velocity.x = 2.5;
      waves.push(g);
      interval = Math.floor(Math.random() * 500 + 650);
      k++;
    } else if (level == 3 && k < 17) {
      let g = new wave();
      g.velocity.x = 3;
      waves.push(g);
      interval = Math.floor(Math.random() * 500 + 500);
      k++;
    } else if (level == 1 && k >= 6 && waves.length == 0) {
      setTimeout(() => {
        title.style.display = "inline";
        title_sp.innerHTML = "Moving to level 2";
        start.innerHTML = "the Aliens are becoming faster !";
      }, 0);
      obstacle.draw();
      obstacle2.draw();
      level = 2;
      level_show.innerHTML = level;
    } else if (level == 2 && k >= 12 && waves.length == 0) {
      setTimeout(() => {
        title.style.display = "inline";
        title_sp.innerHTML = "Moving to level 3";
        start.innerHTML = "the final boss is here!";
      }, 0);
      obstacle.width = 100;
      obstacle.position.x += 150;
      obstacle2.width = 100;
      obstacle2.position.x += 150;
      obstacle.draw();
      obstacle2.draw();
      level = 3;
      level_show.innerHTML = level;
    }
    title.style.display = "none";
    frames = 0;
  }
  frames++;
  //if (lvl1_complete && level == 2) {
  if (level >= 2) {
    obstacle.draw();
    obstacle2.draw();
  }
  if (level == 3) {
    boss_sp.style.display = "inline";
    boss.update();
    if (frames % 200 === 0) {
      boss.shoot(bossBullets);
    }

    bossBullets.forEach((bossBullet, index) => {
      if (bossBullet.position.y + bossBullet.height >= canvas.height) {
        setTimeout(() => {
          bossBullets.splice(index, 1);
        }, 0);
      } else bossBullet.update();
      if (
        level == 3 &&
        (rectRectCollision(
          bossBullet.position.x,
          bossBullet.position.y,
          bossBullet.width,
          bossBullet.height,
          obstacle.position.x,
          obstacle.position.y,
          obstacle.width,
          obstacle.height
        ) ||
          rectRectCollision(
            bossBullet.position.x,
            bossBullet.position.y,
            bossBullet.width,
            bossBullet.height,
            obstacle2.position.x,
            obstacle2.position.y,
            obstacle2.width,
            obstacle2.height
          ))
      ) {
        bossBullets.splice(index, 1);
      }
      if (
        bossBullet.position.y + bossBullet.height >= player.position.y &&
        bossBullet.position.x + bossBullet.width >= player.position.x &&
        bossBullet.position.x <= player.position.x + player.width
      ) {
        console.log("hit");
        times_hit++;
        hit.volume = 0.05;
        hit.play();
        lives.pop();
        for (let i = 0; i < 10; i++) {
          sparkles.push(
            new sparkle({
              position: {
                x: player.position.x + player.width / 2,
                y: player.position.y + player.height / 2,
              },
              velocity: {
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 3,
              },
              radius: Math.random() * 3,
              color: "white",
              fades: true,
            })
          );
        }

        setTimeout(() => {
          bossBullets.splice(index, 1);

          if (times_hit >= 3) {
            player.opacity = 0;
            game.over = true;
          }
        }, 0);
        if (times_hit >= 3) {
          setTimeout(() => {
            game.active = false;
          }, 1000);
          title.style.display = "inline";
          title_sp.innerHTML = "Game Over";
          theme.pause();
          lose.volume = 0.03;
          lose.play();
          title_sp.style.color = "red";
          start.innerHTML = "please reload to restart";
          start.style.color = "yellow";
        }
      }
    });
    //console.log(waves.length);

    Bullets.forEach((Bullet, j) => {
      if (
        Bullet.position.y - Bullet.radius <= boss.position.y + boss.height &&
        Bullet.position.x + Bullet.radius >= boss.position.x &&
        Bullet.position.x - Bullet.radius <= boss.position.x + boss.width &&
        Bullet.position.y + Bullet.radius >= boss.position.y
      ) {
        DMG++;
        console.log(DMG);
        score += 50;
        score_show.innerHTML = score;
        Bullets.splice(j, 1);

        for (let i = 0; i < 15; i++) {
          sparkles.push(
            new sparkle({
              position: {
                x: boss.position.x + boss.width / 2,
                y: boss.position.y + boss.height / 2,
              },
              velocity: {
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 3,
              },
              radius: Math.random() * 3,
              color: "red",
              fades: true,
            })
          );
        }

        if (DMG >= 100) {
          hp.innerHTML = 0;
          game.active = false;
          title.style.display = "inline";
          title_sp.innerHTML = "You Win";
          theme.pause();
          victory.volume = 0.03;
          victory.play();
          title_sp.style.color = "yellow";
          start.innerHTML = "you saved the galaxy !";
          start.style.color = "yellow";
        } else {
          hp.innerHTML = 100 - DMG;
        }
      }
    });
  }
}
animate();

addEventListener("keydown", ({ key }) => {
  if (game.over) return;
  switch (key) {
    case "ArrowLeft":
      //console.log("left");
      keys.Left.pressed = true;
      break;
    case "ArrowRight":
      //console.log("right");
      keys.Right.pressed = true;
      break;
    case " ":
      if (!game.start) {
        theme.volume = 0.05;
        theme.loop = true;
        theme.play();

        game.start = true;
        spanElement.style.display = "inline";
        spanElement1.style.display = "inline";
        level_show.style.display = "inline";
        score_show.style.display = "inline";
        title.style.display = "none";
        for (let i = 1; i < 4; i++) {
          lives.push(
            new heart({
              position: {
                x: i * 40,
                y: 660,
              },
            })
          );
        }
        return;
      }

      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "ArrowLeft":
      console.log("left");
      keys.Left.pressed = false;
      break;
    case "ArrowRight":
      console.log("right");
      keys.Right.pressed = false;
      break;
    case " ":
      console.log("shoot");
      //console.log("shoot");
      if (game.active) {
        Bullets.push(
          new Bullet({
            position: {
              x: player.position.x + player.width / 2,
              y: player.position.y,
            },
            velocity: {
              x: 0,
              y: -12,
            },
          })
        );
        shoot.volume = 0.01;
        shoot.play();
      }
      //console.log(Bullets);
      break;
  }
});
