// module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Events = Matter.Events;

var engine = Engine.create();
    engine.constraintIterations = 2.5;
var world = engine.world;

var boundaries = [];
var chain;
var chainArray = [];



// -----
// Setup
// -----

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  console.log(canvas);



  // Draw items out from the center instead of the top left
  rectMode(CENTER);



  // Create the floor
  boundaries.push(new Box(width/2, height - height/10, 300, 10, {isStatic: true}));



  // Marshmallow chain
  var group = Body.nextGroup(true);

  chain = Composites.stack(width/2, 50, 8, 1, 10, 10, function(x, y) {
    return Bodies.rectangle(x, y, 25, 5, { collisionFilter: { group: group } });
  });

  marshmallow = new Box(width/2, 400, 100, 80, {density: 0.000001, collisionFilter: { group: group }});
  Composite.add(chain, marshmallow.body);

  Composites.chain(chain, 0.5, 0, -0.5, 0, { stiffness: 0.2, length: 2, render: { type: 'line' } });

  Composite.add(chain, Constraint.create({
    bodyB: chain.bodies[0],
    pointB: { x: -12, y: 0 },
    pointA: { x: chain.bodies[0].position.x, y: chain.bodies[0].position.y },
    stiffness: 0.5
  }));

  World.add(world, chain);



  // Mouse events
  var mouse = Mouse.create(canvas.elt);
      mouse.pixelRatio = pixelDensity();

  var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2
    }
  });

  World.add(world, mouseConstraint);


  // ---------------
  Engine.run(engine);
}



// ----
// Draw
// ----

function draw() {
  clear();

  var bodies = Composite.allBodies(engine.world);

  drawingContext.clearRect(0, 0, canvas.width, canvas.height);
  drawingContext.beginPath();

  for (var i = 0; i < bodies.length; i += 1) {
    var vertices = bodies[i].vertices;
    drawingContext.moveTo(vertices[0].x, vertices[0].y);
    for (var j = 1; j < vertices.length; j += 1) {
      drawingContext.lineTo(vertices[j].x, vertices[j].y);
    }
    drawingContext.lineTo(vertices[0].x, vertices[0].y);
  }

  drawingContext.lineWidth = 1;
  drawingContext.strokeStyle = '#808080';
  drawingContext.stroke();
}
