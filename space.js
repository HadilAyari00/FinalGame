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
  // Initialize player properties and load image
  constructor() {
    // Initialize velocity and rotation
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    // Initialize image and scale
    const image = new Image();
    image.src = "./img/spaceship.png";
    const scale = 0.2;
    // Set image width and height based on scale
    image.onload = () => {
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      // Set initial position of player
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20,
      };
    };
  }

  // Draw player on canvas
  draw() {
    // Save current canvas state
    c.save();
    // Set player opacity
    c.globalAlpha = this.opacity;
    // Translate canvas to player position
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    );
    // Rotate canvas around player position
    c.rotate(this.rotation);
    // Translate canvas back to original position
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    );
    // Draw player image on canvas
    if (this.image)
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    // Restore canvas to previous state
    c.restore();
  }

  // Update player position and draw on canvas
  update() {
    // Only update if image has finished loading
    if (this.image) {
      this.draw();
      // Update player position based on velocity
      this.position.x += this.velocity.x;
    }
  }
}

class Bullet {
  // Initialize bullet properties
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    // Set bullet radius
    this.radius = 3;
  }

  // Draw bullet on canvas
  draw() {
    // Start new path
    c.beginPath();
    // Draw circle at bullet position with specified radius
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    // Set fill color
    c.fillStyle = "blue";
    // Fill circle
    c.fill();
    // Close path
    c.closePath();
  }

  // Update bullet position and draw on canvas
  update() {
    this.draw();
    // Update position based on velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Spark {
  // Initialize Spark properties
  constructor({ position, velocity, radius, color, fading }) {
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.radius = radius;
    this.opacity = 1;
    this.fading = fading;
  }

  // Draw Spark on canvas
  draw() {
    // Save current canvas state
    c.save();
    // Set Spark opacity
    c.globalAlpha = this.opacity;
    // Start new path
    c.beginPath();
    // Draw circle at Spark position with specified radius
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    // Set fill color
    c.fillStyle = this.color;
    // Fill circle
    c.fill();
    // Close path
    c.closePath();
    // Restore canvas to previous state
    c.restore();
  }

  // Update Spark position and draw on canvas
  update() {
    this.draw();
    // Update position based on velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    // Decrease opacity if Spark fading
    if (this.fading) this.opacity -= 0.01;
  }
}

class FinalBoss {
  // Initialize boss properties and load image
  constructor() {
    this.velocity = { x: 1, y: 0 };
    // Load boss image
    const image = new Image();
    image.src = "./img/boss.png";
    // Set image width and height based on scale
    const scale = 0.5;
    image.onload = () => {
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      // Set initial position of boss
      this.position = { x: 0, y: 0 };
    };
  }

  // Draw boss on canvas
  draw() {
    // Only draw if image has finished loading
    if (this.image)
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
  }

  // Update boss position and draw on canvas
  update() {
    // Only update if image has finished loading
    if (this.image) {
      this.draw();
      // Update position based on velocity
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      // Reset y velocity and change x velocity if boss hits edge of canvas
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

  // Add new boss bullet to array
  shoot(bossBullets) {
    bossBullets.push(
      new BossBullet({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: { x: 0, y: 2 },
      })
    );
  }
}

class Alien {
  // Initialize Alien properties and load image
  constructor({ position }) {
    this.velocity = { x: 0, y: 0 };
    // Load Alien image
    const image = new Image();
    image.src = "./img/invader.png";
    // Set image width and height based on scale
    const scale = 0.1;
    image.onload = () => {
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      // Set initial position of Alien
      this.position = { x: position.x, y: position.y };
    };
  }

  // Draw Alien on canvas
  draw() {
    // Only draw if image has finished loading
    if (this.image)
      c.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
  }

  // Update Alien position and draw on canvas
  update({ velocity }) {
    // Only update if image has finished loading
    if (this.image) {
      this.draw();
      // Update position based on velocity
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  // Add new Alien bullet to array
  shoot(AlienBullets) {
    AlienBullets.push(
      new AlienBullet({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height,
        },
        velocity: { x: 0, y: 5 },
      })
    );
  }
}

class Obstacle {
  // Initialize obstacle properties
  constructor({ position }) {
    this.width = 300;
    this.height = 50;
    // Set initial position of obstacle
    this.position = { x: position.x, y: position.y };
  }

  // Draw obstacle on canvas
  draw() {
    // Set fill color
    c.fillStyle = "blue";
    // Draw rectangle at position with specified width and height
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class Wave {
  // Initialize Wave properties and create array of Aliens
  constructor() {
    // Set initial position of Wave
    this.position = { x: 0, y: 0 };
    // Set initial velocity of Wave
    this.velocity = { x: 2, y: 0 };
    // Initialize array to store Aliens in Wave
    this.Aliens = [];
    // Generate random number of rows and columns for Aliens
    const rows = Math.floor(Math.random() * 3 + 2);
    const columns = Math.floor(Math.random() * 8 + 5);
    // Set width and height of Wave based on number of rows and columns
    this.width = columns * 40;
    this.height = rows * 40;
    // Create new Aliens and add them to the array
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
  }

  // Update Wave position and velocity
  update() {
    // Update position based on velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    // Reset y velocity to 0
    this.velocity.y = 0;
    // Reverse x velocity if Wave reaches edge of canvas
    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      // Set y velocity to move Wave down
      this.velocity.y = 30;
    }
  }
}

class AlienBullet {
  // Initialize bullet properties
  constructor({ position, velocity }) {
    // Set initial position of bullet
    this.position = position;
    // Set initial velocity of bullet
    this.velocity = velocity;
    // Set width and height of bullet
    this.width = 3;
    this.height = 10;
  }

  // Draw bullet on canvas
  draw() {
    // Set fill color
    c.fillStyle = "red";
    // Draw rectangle at position with specified width and height
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  // Update bullet position and velocity
  update() {
    // Draw bullet on canvas
    this.draw();
    // Update position based on velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class BossBullet {
  // Initialize bullet properties
  constructor({ position, velocity }) {
    // Set initial position of bullet
    this.position = position;
    // Set initial velocity of bullet
    this.velocity = velocity;
    // Set width and height of bullet
    this.width = 3;
    this.height = 10;
  }

  // Draw bullet on canvas
  draw() {
    // Set fill color
    c.fillStyle = "red";
    // Draw rectangle at position with specified width and height
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  // Update bullet position and velocity
  update() {
    // Draw bullet on canvas
    this.draw();
    // Update position based on velocity
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

// Initialize game objects
const player = new Player();
const boss = new FinalBoss();
const Bullets = [];
const Waves = [];
const AlienBullets = [];
const bossBullets = [];
const Sparks = [];
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

// Load background gif
const gifImage = new Image();
gifImage.src = "./img/bg.gif";

// Initialize key states
const keys = {
  Left: { pressed: false },
  Right: { pressed: false },
  space: { pressed: false },
};

// Create 100 spark objects
for (let i = 0; i < 100; i++) {
  Sparks.push(
    new Spark({
      // Set random position within canvas dimensions
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      // Set velocity
      velocity: {
        x: 0,
        y: 0.4,
      },
      // Set random radius
      radius: Math.random() * 2,
      // Set color
      color: "white",
      // Set fading status
      fading: false,
    })
  );
}

class Heart {
  constructor({ position }) {
    // Load Heart image
    const image = new Image();
    image.src = "./img/Heart.png";
    image.onload = () => {
      // Set scale
      const scale = 0.03;
      // Assign image to class property
      this.image = image;
      // Set width and height based on image dimensions and scale
      this.width = image.width * scale;
      this.height = image.height * scale;
      // Assign position based on provided position
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  // Draw Heart on canvas
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

// Initialize game object
let game = {
  start: false, // Flag to indicate if the game has started
  over: false, // Flag to indicate if the game is over
  active: true, // Flag to indicate if the game is active
  lvl1_complete: false, // Flag to indicate if level 1 is complete
  lvl2_complete: false, // Flag to indicate if level 2 is complete
  final_boss_complete: false, // Flag to indicate if the final boss is defeated
};

// Initialize frame counter
let frames = 0;
// Initialize level counter
let level = 1;
// Initialize score counter
let score = 0;
// Initialize interval for alien movement
let interval = Math.floor(Math.random() * 500 + 500);

function animate() {
  // Return if the game is not active
  if (!game.active) return;

  // Request the next animation frame
  requestAnimationFrame(animate);

  // Clear the canvas by filling it with black
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);

  // Return if the game has not started
  if (!game.start) {
    // Hide the span elements
    spanElement.style.display = "none";
    spanElement1.style.display = "none";
    level_show.style.display = "none";
    score_show.style.display = "none";
    boss_sp.style.display = "none";
    return;
  }

  // Update the player
  player.update();

  // Draw the lives
  for (let y = 0; y < lives.length; y++) {
    lives[y].draw();
  }

  // Update the sparks
  Sparks.forEach((Spark, i) => {
    // Reset the spark's position if it goes off the bottom of the canvas
    if (Spark.position.y - Spark.radius >= canvas.height) {
      Spark.position.x = Math.random() * canvas.width;
      Spark.position.y = -Spark.radius;
    }

    // If the spark's opacity is 0, remove it from the array
    if (Spark.opacity <= 0) {
      setTimeout(() => {
        Sparks.splice(i, 1);
      }, 0);
    }
    // Otherwise, update the spark
    else {
      Spark.update();
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
      // Check if there is collision with obstacles and delete bullet
      AlienBullets.splice(index, 1);
    }
    if (
      AlienBullet.position.y + AlienBullet.height >= player.position.y &&
      AlienBullet.position.x + AlienBullet.width >= player.position.x &&
      AlienBullet.position.x <= player.position.x + player.width
    )
      if (
        AlienBullet.position.y + AlienBullet.height >= player.position.y &&
        AlienBullet.position.x + AlienBullet.width >= player.position.x &&
        AlienBullet.position.x <= player.position.x + player.width
      ) {
        // Check if the player has been hit by the AlienBullet

        console.log("hit");
        times_hit++;
        hit.volume = 0.05;
        hit.play();
        lives.pop();

        // Remove one life from the player

        for (let i = 0; i < 10; i++) {
          Sparks.push(
            new Spark({
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
              fading: true,
            })
          );
        }
        // Create sparks at the position of the player when they are hit

        setTimeout(() => {
          AlienBullets.splice(index, 1);

          if (times_hit >= 3) {
            player.opacity = 0;
            game.over = true;
          }
        }, 0);
        // Remove the AlienBullet from the game

        if (times_hit >= 3) {
          // Check if the player has been hit 3 times

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

  // Loop through each bullet in the array
  Bullets.forEach((Bullet, index) => {
    // If the bullet's y position is off the screen, remove it from the array
    if (Bullet.position.y + Bullet.radius <= 0) {
      setTimeout(() => {
        Bullets.splice(index, 1);
      }, 0);
    }
    // If the level is 2 or higher, check for collision with either obstacle
    else if (
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
      // If there is a collision, remove the bullet from the array
      Bullets.splice(index, 1);
    }
    // If none of the above conditions are met, update the bullet's position
    else {
      Bullet.update();
    }
  });

  Waves.forEach((Wave, WaveIndex) => {
    // Update the wave's position
    Wave.update();

    // If it's been 200 frames and there are still aliens in the wave, have a random alien shoot a bullet
    if (frames % 200 === 0 && Wave.Aliens.length > 0) {
      Wave.Aliens[Math.floor(Math.random() * Wave.Aliens.length)].shoot(
        AlienBullets
      );
    }

    // If the wave's position has moved past the bottom of the canvas, end the game
    if (Wave.position.y + Wave.height > canvas.height) {
      game.over = true;
      game.active = false;
      // Display the game over message and change the text and background colors
      title.style.display = "inline";
      title_sp.innerHTML = "Game Over";
      theme.pause();
      lose.volume = 0.03;
      lose.play();
      title_sp.style.color = "red";
      start.innerHTML = "please reload to restart";
      start.style.color = "yellow";
    }

    Wave.Aliens.forEach((Alien, i) => {
      // Update the position of the current alien based on the wave's velocity
      Alien.update({ velocity: Wave.velocity });

      // Loop through each bullet to check for collisions with the alien
      Bullets.forEach((Bullet, j) => {
        // Check if the bullet's position intersects with the alien's position
        if (
          Bullet.position.y - Bullet.radius <=
            Alien.position.y + Alien.height &&
          Bullet.position.x + Bullet.radius >= Alien.position.x &&
          Bullet.position.x - Bullet.radius <= Alien.position.x + Alien.width &&
          Bullet.position.y + Bullet.radius >= Alien.position.y
        ) {
          setTimeout(() => {
            // Find the alien and bullet in their respective arrays
            const AlienFound = Wave.Aliens.find((Alientemp) => {
              return Alientemp === Alien;
            });
            const BulletFound = Bullets.find((Bullettemp) => {
              return Bullettemp === Bullet;
            });
            // If both the alien and bullet are found, remove them and create sparks
            if (AlienFound && BulletFound) {
              // Increase the score and update the score display
              score += 10;
              score_show.innerHTML = score;
              // Remove the alien and bullet from their arrays
              Wave.Aliens.splice(i, 1);
              Bullets.splice(j, 1);
              // Create 15 spark objects and add them to the Sparks array
              for (let i = 0; i < 15; i++) {
                Sparks.push(
                  new Spark({
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
                    fading: true,
                  })
                );
              }
              // If the wave still has aliens, update its width and position based on the positions of the remaining aliens
              // Otherwise, remove the wave from the Waves array
              if (Wave.Aliens.length > 0) {
                const firstAlien = Wave.Aliens[0];
                const lastAlien = Wave.Aliens[Wave.Aliens.length - 1];
                Wave.width = lastAlien.position.x - firstAlien.position.x + 40;
                Wave.position.x = firstAlien.position.x;
              } else {
                Waves.splice(WaveIndex, 1);
              }
            }
          }, 0);
        }
      });
    });
  });

  // Check if the left or right arrow keys are pressed
  if (keys.Left.pressed && player.position.x >= 0) {
    // If the left arrow key is pressed and the player's position is within the canvas, set the player's velocity to move left
    player.velocity.x = -6;
    // Set the player's rotation to show that it is tilting left
    player.rotation = -0.12;
  } else if (
    keys.Right.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    // If the right arrow key is pressed and the player's position is within the canvas, set the player's velocity to move right
    player.velocity.x = 6;
    // Set the player's rotation to show that it is tilting right
    player.rotation = 0.12;
  } else {
    // If neither arrow key is pressed, set the player's velocity to 0
    player.velocity.x = 0;
    // Set the player's rotation to 0 to show that it is not tilting
    player.rotation = 0;
  }

  //console.log(frames);
  // Every "interval" frames, create a new wave of enemies
  if (frames % interval === 0) {
    // If it's level 1 and there have been fewer than 6 waves, create a new wave and randomly set the next interval
    if (level == 1 && k < 6) {
      Waves.push(new Wave());
      interval = Math.floor(Math.random() * 500 + 700);
      k++;
      // If this is the fifth wave, set the lvl1_complete flag to true
      if (k == 5) {
        lvl1_complete = true;
      }
    }
    // If it's level 2 and there have been fewer than 12 waves, create a new wave with increased velocity and randomly set the next interval
    else if (level == 2 && k < 12) {
      let g = new Wave();
      g.velocity.x = 2.5;
      Waves.push(g);
      interval = Math.floor(Math.random() * 500 + 650);
      k++;
    }
    // If it's level 3 and there have been fewer than 17 waves, create a new wave with increased velocity and randomly set the next interval
    else if (level == 3 && k < 17) {
      let g = new Wave();
      g.velocity.x = 3;
      Waves.push(g);
      interval = Math.floor(Math.random() * 500 + 500);
      k++;
    } // If it's level 1 and all the waves have been created and there are no more waves in play, display a message and move on to level 2
    else if (level == 1 && k >= 6 && Waves.length == 0) {
      setTimeout(() => {
        // Display a message saying that the player is moving to level 2
        title.style.display = "inline";
        title_sp.innerHTML = "Moving to level 2";
        start.innerHTML = "the Aliens are becoming faster !";
      }, 0);
      // Draw the obstacles
      obstacle.draw();
      obstacle2.draw();
      // Increase the level
      level = 2;
      // Update the level display
      level_show.innerHTML = level;
    }
    // If it's level 2 and all the waves have been created and there are no more waves in play, display a message and move on to level 3
    else if (level == 2 && k >= 12 && Waves.length == 0) {
      setTimeout(() => {
        // Display a message saying that the player is moving to level 3
        title.style.display = "inline";
        title_sp.innerHTML = "Moving to level 3";
        start.innerHTML = "the final boss is here!";
      }, 0);
      // Increase the width of the obstacles and shift them to the right
      obstacle.width = 100;
      obstacle.position.x += 150;
      obstacle2.width = 100;
      obstacle2.position.x += 150;
      // Draw the obstacles
      obstacle.draw();
      obstacle2.draw();
      // Increase the level
      level = 3;
      // Update the level display
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
      // Check if the boss bullet has hit the player
      if (
        bossBullet.position.y + bossBullet.height >= player.position.y &&
        bossBullet.position.x + bossBullet.width >= player.position.x &&
        bossBullet.position.x <= player.position.x + player.width
      ) {
        console.log("hit");
        // Increase the times_hit counter
        times_hit++;
        // Play a sound effect
        hit.volume = 0.05;
        hit.play();
        // Remove a life
        lives.pop();
        // Create sparks
        for (let i = 0; i < 10; i++) {
          Sparks.push(
            new Spark({
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
              fading: true,
            })
          );
        }

        // Remove the boss bullet from the array
        setTimeout(() => {
          bossBullets.splice(index, 1);

          // If the player has been hit three times, end the game
          if (times_hit >= 3) {
            player.opacity = 0;
            game.over = true;
          }
        }, 0);

        // If the player has been hit three times, end the game
        if (times_hit >= 3) {
          // Pause the game after 1 second
          setTimeout(() => {
            game.active = false;
          }, 1000);
          // Display the game over screen
          title.style.display = "inline";
          title_sp.innerHTML = "Game Over";
          // Stop the theme music
          theme.pause();
          // Play the lose sound effect
          lose.volume = 0.03;
          lose.play();
          // Set the text color to red
          title_sp.style.color = "red";
          // Display instructions for restarting the game
          start.innerHTML = "please reload to restart";
          start.style.color = "yellow";
        }
      }
    });
    //console.log(Waves.length);

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

        // Create 15 sparks
        for (let i = 0; i < 15; i++) {
          // Create a new spark with random properties
          Sparks.push(
            new Spark({
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
              fading: true,
            })
          );
        }

        // Check if the boss's health is below 0
        if (DMG >= 100) {
          // Set the boss's health to 0
          hp.innerHTML = 0;
          // Pause the game
          game.active = false;
          // Display the win screen
          title.style.display = "inline";
          title_sp.innerHTML = "You Win";
          // Stop the theme music
          theme.pause();
          // Play the victory sound
          victory.volume = 0.03;
          victory.play();
          title_sp.style.color = "yellow";
          start.innerHTML = "you saved the galaxy !";
          start.style.color = "yellow";
        } else {
          // Display the boss's remaining health
          hp.innerHTML = 100 - DMG;
        }
      }
    });
  }
}
animate();

// Add an event listener for keydown events
addEventListener("keydown", ({ key }) => {
  // If the game is over, do nothing
  if (game.over) return;

  // Check which key was pressed and set the corresponding pressed property to true
  switch (key) {
    case "ArrowLeft":
      keys.Left.pressed = true;
      break;
    case "ArrowRight":
      keys.Right.pressed = true;
      break;
    case " ":
      // If the game has not started yet, start it
      if (!game.start) {
        // Play the theme music and set it to loop
        theme.volume = 0.05;
        theme.loop = true;
        theme.play();

        // Set the game as started and show the relevant elements on the screen
        game.start = true;
        spanElement.style.display = "inline";
        spanElement1.style.display = "inline";
        level_show.style.display = "inline";
        score_show.style.display = "inline";
        title.style.display = "none";

        // Create and push new Heart objects to the lives array
        for (let i = 1; i < 4; i++) {
          lives.push(
            new Heart({
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
      //shoot bullets every time, this prevents the player from being able to hold space and shooting continuously
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
