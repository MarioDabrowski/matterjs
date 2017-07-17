// module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events;

var engine = Engine.create();
var world = engine.world;

var boundaries = [];
var anchor;
var marshmallows = [];
var elastic;
var ropeA;
var cracker;
var chain = [];



// -----
// Setup
// -----

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);

  boundaries.push(new Box(width/2, 5, width, 10, {isStatic: true}));
  boundaries.push(new Box(0, height/2, 15, height, {isStatic: true}));
  boundaries.push(new Box(width - 5, height/2, 10, height, {isStatic: true}));
  boundaries.push(new Box(width/2, height - 5, width, 10, {isStatic: true}));

  var marshmallowOptions = {
    friction: 0.4,
    restitution: 1
  };

  marshmallows.push(new Circle(400, height/2, random(20, 40), marshmallowOptions));

  // Marshmallow launcher
  anchor = {x: 400, y: height/2};
  elastic = Constraint.create({
    pointA: anchor,
    bodyB: marshmallows[marshmallows.length - 1].body,
    stiffness: 0.2
  });

  World.add(world, [elastic]);

  // Mouse events
  var mouse = Matter.Mouse.create(canvas.elt);
      mouse.pixelRatio = pixelDensity();
  var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.1,
      render: {
        visible: false
      }
    }
  });

  World.add(world, mouseConstraint);

  // After launch
  Events.on(engine, 'afterUpdate', function() {
    if (mouseConstraint.mouse.button === -1 && (marshmallows[marshmallows.length - 1].body.position.x > 400 + 20 || marshmallows[marshmallows.length - 1].body.position.y < height/2 - 20)) {
      console.log('release');
      marshmallows.push(new Circle(400, height/2, random(20, 40), marshmallowOptions));
      elastic.bodyB = marshmallows[marshmallows.length - 1].body;
    }
  });

  var group = Body.nextGroup(true);

  ropeA = Composites.stack(width - 500, 10, 5, 1, 0, 0, function(x, y) {
    var rope = new Rope(x, y, 20, 0.5, { collisionFilter: { group: group } });
        rope.height = 20;
    chain.push(rope);
    return rope.body;
  });

  Composites.chain(ropeA, 0.5, 0, -0.5, 0, { stiffness: 0.4, length: 1, render: { type: 'line' } });
  Composite.add(ropeA, Constraint.create({
    bodyB: ropeA.bodies[0],
    pointB: { x: -25, y: 0 },
    pointA: { x: ropeA.bodies[0].position.x, y: ropeA.bodies[0].position.y },
    stiffness: 0.5
  }));

  cracker = new Box(ropeA.bodies[ropeA.bodies.length - 1].position.x, ropeA.bodies[ropeA.bodies.length - 1].position.y + 100, 20, 100);

  console.log();

  var connectB = Constraint.create({
    bodyA: cracker.body,
    // pointA: { x: 0, y: -40 },
    bodyB: ropeA.bodies[ropeA.bodies.length - 1],
    stiffness: 0.8
  });

  World.add(world, [
    ropeA,
    connectB,
    Bodies.rectangle(400, 600, 1200, 50.5, { isStatic: true })
   ]);

  console.log(ropeA);

  Engine.run(engine);
}



// ----
// Draw
// ----

function draw() {
  clear();

  for (var i = 0; i < boundaries.length; i++) {
    boundaries[i].render();
  }

  ellipse(400, height/2, 20);
  line(400, height/2, marshmallows[marshmallows.length - 1].body.position.x, marshmallows[marshmallows.length - 1].body.position.y);

  for (var i = 0; i < marshmallows.length; i++) {
    marshmallows[i].render();
  }

  for (var i = 0; i < chain.length; i++) {
    chain[i].render();
  }

  cracker.render();
}
