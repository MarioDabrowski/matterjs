// --------------
// Module aliases
// --------------

var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint;

var engine;
var world;
var ground;
var shapes = [];
var boundaries = [];
var mouse;
var mConstraint;



// -----
// Setup
// -----

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  engine = Engine.create();
  world = engine.world;

  boundaries.push(new Boundary(width/2, 10, width, 20, {isStatic: true}));
  boundaries.push(new Boundary(width/2, height - 10, width, 20, {isStatic: true}));
  boundaries.push(new Boundary(0, height/2, 20, height, {isStatic: true}));
  boundaries.push(new Boundary(width - 10, height/2, 20, height, {isStatic: true}));

  for(var i = 0; i < 5; i++) {
    if(i === 0) {
      shapes.push(new Circle(width/2 - 15, 300, 50, {friction: 0, restitution: 1}));
    } else {
      shapes.push(new Circle(width/2 - 15, 300 + (i * 70), 2, {friction: 0, restitution: 1}));

      var constraint = Constraint.create({
        bodyA: shapes[i].body,
        bodyB: shapes[i-1].body,
        length: 70,
        stifness: 0.1,
        dampint: 0.1
      });

      World.add(world, constraint);
    }
  }

  mouse = Matter.Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();
  mConstraint = MouseConstraint.create(engine, {
    mouse: mouse
  });

  World.add(world, mConstraint);

  Engine.run(engine);
}



// ----
// Draw
// ----

function draw() {
  clear();

  shapes[0].body.force = {x: 0, y: -0.04};

  for(var i = 0; i < shapes.length; i++) {
    shapes[i].render();

    // if(shapes[i].isOffScreen()) {
    //   shapes[i].removeFromWorld();
    //   shapes.splice(i, 1);
    //   i--;
    // }
  }

  for(var i = 0; i < boundaries.length; i++) {
    boundaries[i].render();
  }

  for(var i = 0; i < 5; i++) {
    if(i !== 0) {
      line(shapes[i].body.position.x, shapes[i].body.position.y, shapes[i - 1].body.position.x, shapes[i - 1].body.position.y);
    }
  }
}
