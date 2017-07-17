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
var balloon;



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

  balloon = new Circle(400, 300, 50, {friction: 1, restitution: 0.8});
  World.add(world, balloon);

  var prevItem;
  for(var i = 220; i <= 800; i += 20) {
    var shape = new Circle(i, 100, 8, {friction: 0.5, restitution: 0.8});
    shapes.push(shape);

    if(prevItem) {
      var constraint = Constraint.create({
        bodyA: shape.body,
        bodyB: prevItem.body,
        length: 14,
        stifness: 1,
        dampint: 0.1
      });

      World.add(world, constraint);
    }

    prevItem = shape;
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

  // shapes[0].body.force = {x: 0, y: -0.04};

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

  var prevShape;
  for(var i = 0; i < shapes.length; i++) {
    if(prevShape) {
      line(shapes[i].body.position.x, shapes[i].body.position.y, prevShape.body.position.x, prevShape.body.position.y);
    }

    prevShape = shapes[i];
  }

  balloon.render();
}
