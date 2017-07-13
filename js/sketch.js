// module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

var engine;
var world;
var ground;
var boxes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  engine = Engine.create();
  world = engine.world;

  ground = new Box(windowWidth/2, windowHeight - 50, windowWidth, 50, {isStatic: true});
  World.add(world, ground);

  Engine.run(engine);
}

function draw() {
  clear();

  for(var i = 0; i < boxes.length; i++) {
    boxes[i].render();
  }

  ground.render();

  Engine.update(engine);
}

function mousePressed() {
  boxes.push(new Box(mouseX, mouseY, 50, 50, {}));
}
