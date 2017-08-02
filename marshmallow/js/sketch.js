// KNOWN BUGS
// 1. Hitting the marshmallow against the side of the cup triggers a cup + marshmallow collision even though they are not touching, incrementing
//    colorLayer, causing the colors to get darker without actually dipping.
// 2. If the marshmallow enters the cup upside down the colors don't get applied.
// 3.

// Module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Events = Matter.Events,
    Vertices = Matter.Vertices;

var engine = Engine.create();
    engine.constraintIterations = 2.5;
var world = engine.world;

var floor;
var cup;
var cupLeft;
var cupRight;
var topOfCup;

var chain;
var chainArray = [];

var colorLayer = 0;
var colorLayers = ['#e8d2d2', '#d1a5a5', '#bb7878', '#a44b4b', '#8d1e1e'];

var distanceFromCup = {
  size: 500,
  towards: true
};

var firstAnimation = {
  max: 241,
  min: 171,
  percent: 1
};

var secondAnimation = {
  max: 170,
  min: 100,
  percent: 0
};

var thirdAnimation = {
  max: 241,
  min: 100,
  percent: 0
};

var distanceToCup = 10000;



// -----
// Clear
// -----

var btnClear = document.querySelector('.btn-clear');

btnClear.addEventListener('click', function() {
  shapes = [];
  colorLayer = 0;
});



// ------
// Resize
// ------

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



// -----
// Setup
// -----

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);



  // ----------
  // Boundaries
  // ----------

  floor = new Box(width/2, height - 31.75, 320, 3.5, {
    isStatic: true,
    collisionFilter: {
      category: 0x0002
    }
  });

  floorImg = loadImage('img/ground.png');

  cup = new Box(width/2, height - 93, 259, 125.5, {
    isStatic: true,
    isSensor: true,
    label: 'cup',
    collisionFilter: {
      category: 0x0002
    }
  });

  cupImg = loadImage('img/cup.png');

  cupLeft = new Box(width/2 - 134.5, height - 93, 10, 125.5, {
    isStatic: true,
    label: 'cupLeft',
    collisionFilter: {
      category: 0x0002
    }
  });

  cupRight = new Box(width/2 + 134.5, height - 93, 10, 125.5, {
    isStatic: true,
    label: 'cupRight',
    collisionFilter: {
      category: 0x0002
    }
  });

  cupHandle = new Box(width/2 + 153, height - 114, 31, 60.5, {
    isStatic: true,
    label: 'cupHandle',
    collisionFilter: {
      category: 0x0002
    }
  });

  cupHandleImg = loadImage('img/cupHandle.png');

  topOfCup = cup.body.position.y - cup.h / 2;

  World.add(world, cup.body, cupHandle.body);



  // -----------------
  // Marshmallow chain
  // -----------------

  marshmallow = new Box(width/2, 300, 80, 100, {
    density: 0.00001,
    label: 'marshmallow',
    collisionFilter: {
      category: 0x0001,
      mask: 0x0002
    }
  });

  marshmallowBody = loadImage('img/body.png');
  marshmallowBodyMask = loadImage('img/bodyMask.png');

  (function createChain() {
    var chainLinks = 6;
    var linkLength = 10;
    var hinges = [];

    // Create hinges
    for(var i = 0; i < chainLinks; i++) {
      var static = (i === 0) ? true : false ;

      var anchor = new Box(width/2, 100 + (linkLength * i), 5, 5, {
        isStatic: static,
        collisionFilter: {
          category: 0x0001
        }
      });

      hinges.push(anchor);
    }

    // Create links between hinges
    for(var i = 0; i < hinges.length; i++) {
      var constraint;

      if(i === chainLinks - 1) {
        constraint = Constraint.create({
          bodyA: hinges[i].body,
          bodyB: marshmallow.body,
          pointB: { x: 0, y: (marshmallow.h/2 * -1) + 12 },
          length: linkLength,
          damping: 0.5,
          stiffness: 0.1,
          label: 'marshmallowAttachment'
        });
      } else {
        constraint = Constraint.create({
          bodyA: hinges[i].body,
          bodyB: hinges[i + 1].body,
          length: linkLength,
          damping: 0.5,
          stiffness: 0.1
        });
      }

      World.add(world, constraint);
    }
  })();

  armLeft = Bodies.circle(width/2 - 40, 300, 5, {
    collisionFilter: {
      category: 0x0001
    },
    density: 0.00001
  });

  armRight = Bodies.circle(width/2 + 40, 300, 5, {
    collisionFilter: {
      category: 0x0001
    },
    density: 0.00001
  });

  var legRight = Bodies.circle(width/2 + 20, 300 + 50, 0.1, {
    collisionFilter: {
      category: 0x0001
    },
    density: 0.00001
  });

  var legLeft = Bodies.circle(width/2 - 20, 300 + 50, 0.1, {
    collisionFilter: {
      category: 0x0001
    },
    density: 0.00001
  });

  constraintArmLeft = Constraint.create({
    bodyA: marshmallow.body,
    bodyB: armLeft,
    pointA: { x: -39, y: -20 },
    length: 40,
    damping: 0.5,
    stiffness: 1,
    label: 'limb'
  });

  constraintArmRight = Constraint.create({
    bodyA: marshmallow.body,
    bodyB: armRight,
    pointA: { x: 39, y: -20 },
    length: 40,
    damping: 0.5,
    stiffness: 1,
    label: 'limb'
  });

  constraintLegRight = Constraint.create({
    bodyA: marshmallow.body,
    bodyB: legRight,
    pointA: { x: 20, y: 49 },
    length: 30,
    damping: 0.5,
    stiffness: 1,
    label: 'limb'
  });

  constraintLegLeft = Constraint.create({
    bodyA: marshmallow.body,
    bodyB: legLeft,
    pointA: { x: -20, y: 49 },
    length: 30,
    damping: 0.5,
    stiffness: 1,
    label: 'limb'
  });

  World.add(world, [
    armLeft,
    armRight,
    legRight,
    legLeft,
    constraintArmLeft,
    constraintArmRight,
    constraintLegRight,
    constraintLegLeft
  ]);



  // ------------
  // Mouse events
  // ------------

  var mouse = Mouse.create(canvas.elt);
      mouse.pixelRatio = pixelDensity();

  var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2
    }
  });

  mouseConstraint.collisionFilter.category = 0x0002;

  World.add(world, mouseConstraint);



  // ---------
  // Collision
  // ---------

  var interval;

  Events.on(engine, 'collisionStart', function(event) {
    if(event.pairs[0].bodyA.label === 'cup' && event.pairs[0].bodyB.label === 'marshmallow') {

    }
  });

  Events.on(engine, 'collisionEnd', function(event) {
    if(event.pairs[0].bodyA.label === 'cup' && event.pairs[0].bodyB.label === 'marshmallow') {

    }
  });

  Events.on(engine, 'collisionActive', function(event) {
    for(var i = 0; i < event.pairs.length; i++) {

    }
  });

  Engine.run(engine);
}



// ----
// Draw
// ----

function draw() {
  clear();



  // ----------------------
  // Outline matter objects
  // ----------------------

  // push();
  // var bodies = Composite.allBodies(engine.world);
  //
  // drawingContext.beginPath();
  // for (var i = 0; i < bodies.length; i += 1) {
  //   var vertices = bodies[i].vertices;
  //   drawingContext.moveTo(vertices[0].x, vertices[0].y);
  //   for (var j = 1; j < vertices.length; j += 1) {
  //     drawingContext.lineTo(vertices[j].x, vertices[j].y);
  //   }
  //   drawingContext.lineTo(vertices[0].x, vertices[0].y);
  // }
  //
  // drawingContext.lineWidth = 1;
  // drawingContext.strokeStyle = '#9e9e9e';
  // drawingContext.stroke();
  // pop();



  // --------------------
  // Draw the marshmallow
  // --------------------

  push();
  translate(marshmallow.body.position.x, marshmallow.body.position.y);
  rotate(marshmallow.body.angle);
  image(marshmallowBody, marshmallow.w/2 * -1, marshmallow.h/2 * -1, marshmallow.w, marshmallow.h);
  pop();



  // --------------
  // Draw the chain
  // --------------

  var allConstraints = Composite.allConstraints(engine.world);
  var marshmallowAttachment;

  push();
  noStroke();
  fill('black');
  ellipse(allConstraints[0].bodyA.position.x, allConstraints[0].bodyA.position.y, 25, 6);
  pop();

  for(var i = 0; i < allConstraints.length; i++) {
    if(allConstraints[i].label === 'marshmallowAttachment') {
      marshmallowAttachment = allConstraints[i];
    }

    if(allConstraints[i].label !== 'Mouse Constraint') {
      push();
      strokeWeight(2.5);

      line(
        allConstraints[i].bodyA.position.x + allConstraints[i].pointA.x,
        allConstraints[i].bodyA.position.y + allConstraints[i].pointA.y,
        allConstraints[i].bodyB.position.x + allConstraints[i].pointB.x,
        allConstraints[i].bodyB.position.y + allConstraints[i].pointB.y
      );
      pop();
    }
  }

  // Rope attachment on top of head
  push();
  noStroke();
  fill('black');
  translate(marshmallowAttachment.bodyB.position.x + marshmallowAttachment.pointB.x, marshmallowAttachment.bodyB.position.y + marshmallowAttachment.pointB.y);
  rotate(marshmallow.body.angle);
  ellipse(0, 0, 10, 3);
  pop();

  // Draw arms
  push();
  strokeWeight(2.5);
  ellipse(armLeft.position.x, armLeft.position.y, 10);
  ellipse(armRight.position.x, armRight.position.y, 10);
  pop();

  if(marshmallow.body.position.y / height > 0.75) {
    Matter.Body.setVelocity(armLeft, { x: 0, y: -3 })
    Matter.Body.setVelocity(armRight, { x: 0, y: -3 })
  }



  // -----------------------------
  // Facial expression experiments
  // -----------------------------

  distanceToCup = Math.sqrt(Math.pow(marshmallow.body.position.x - cup.body.position.x, 2) + Math.pow(marshmallow.body.position.y - cup.body.position.y, 2));

  if(distanceToCup <= firstAnimation.max && distanceToCup >= firstAnimation.min) {
    firstAnimation.percent = (distanceToCup - firstAnimation.min) / (firstAnimation.max - firstAnimation.min);
  }

  if(distanceToCup < secondAnimation.max && distanceToCup >= secondAnimation.min) {
    secondAnimation.percent = ((distanceToCup - secondAnimation.min) / (secondAnimation.max - secondAnimation.min) - 1) * -1;
  }

  if(distanceToCup < thirdAnimation.max && distanceToCup >= thirdAnimation.min) {
    thirdAnimation.percent = ((distanceToCup - thirdAnimation.min) / (thirdAnimation.max - thirdAnimation.min) - 1) * -1;
  }

  if(distanceToCup < secondAnimation.max) {
    firstAnimation.percent = 0;
  }

  if(distanceToCup > firstAnimation.max) {
    firstAnimation.percent = 1;
    secondAnimation.percent = 0;
  }

  // Marshmallow eye left
  push();
  translate(marshmallow.body.position.x, marshmallow.body.position.y);
  strokeWeight(3);
  noFill();
  rotate(marshmallow.body.angle);
  bezier(
    -20, -5 + (secondAnimation.percent * 5)  + (secondAnimation.percent * -4),
    -20, -5 + (firstAnimation.percent * -7) + (secondAnimation.percent * 5) + (secondAnimation.percent * -4),
    -10, -5 + (firstAnimation.percent * -7) + (secondAnimation.percent * -4),
    -10, -5 + (secondAnimation.percent * -4)
  );
  pop();

  // Marshmallow eye right
  // The second parameter (secondAnimation.percent * -4) is to move the item up when the animation happens
  push();
  translate(marshmallow.body.position.x, marshmallow.body.position.y);
  strokeWeight(3);
  noFill();
  rotate(marshmallow.body.angle);
  bezier(
    20, -5 + (secondAnimation.percent * 5) + (secondAnimation.percent * -4),
    20, -5 + (firstAnimation.percent * -7) + (secondAnimation.percent * 5) + (secondAnimation.percent * -4),
    10, -5 + (firstAnimation.percent * -7) + (secondAnimation.percent * -4),
    10, -5 + (secondAnimation.percent * -4)
  );
  pop();

  // Marshmallow mouth
  push();
  stroke('#000');
  strokeJoin(ROUND);
  strokeWeight(2);
  fill('black');
  translate(marshmallow.body.position.x, marshmallow.body.position.y);
  rotate(marshmallow.body.angle);
  arc(0, 12 + (thirdAnimation.percent * 5), 16, firstAnimation.percent * 14, 0, 3.14, CHORD);
  arc(0, 12 + (thirdAnimation.percent * 5), 16, thirdAnimation.percent * 14, 3.14, 0, CHORD);
  pop();



  // ---
  // Cup
  // ---

  push();
  noStroke();
  fill('#fee096');
  translate(cup.body.position.x, cup.body.position.y);
  rect(0, 60, cup.w + 20, cup.h + 100);
  pop();

  push();
  translate(floor.body.position.x, floor.body.position.y);
  image(floorImg, floor.w/2 * -1, floor.h/2 * -1, floor.w, floor.h);
  pop();

  push();
  translate(cup.body.position.x, cup.body.position.y);
  image(cupImg, (cup.w/2 * -1) - 10, cup.h/2 * -1, cup.w + 20, cup.h);
  pop();

  push();
  noFill();
  noStroke();
  translate(cupHandle.body.position.x, cupHandle.body.position.y);
  image(cupHandleImg, cupHandle.w/2 * -1, cupHandle.h/2 * -1, cupHandle.w, cupHandle.h);
  pop();

  // Outer eye Left
  push();
  noStroke();
  fill('white');
  translate(cup.body.position.x - 76.5, cup.body.position.y - 5.5);
  ellipse(0, 0, 34);
  rotate(thirdAnimation.percent * 1.3);
  stroke('#812d29');
  strokeWeight(3.5);
  line(-24, 2, 2, -24);
  pop();

  // Outer eye right
  push();
  noStroke();
  fill('white');
  translate(cup.body.position.x + 76.5, cup.body.position.y - 5.5);
  ellipse(0, 0, 34);
  rotate(thirdAnimation.percent * -1.3);
  stroke('#812d29');
  strokeWeight(3.5);
  line(24, -2, -2, -24);
  pop();

  // Cheek right
  push();
  noStroke();
  fill('#f6554f');
  translate(cup.body.position.x + 76.5, cup.body.position.y);
  ellipse(0, 10 + thirdAnimation.percent * 3, 34, 10);
  pop();

  // Cheek left
  push();
  noStroke();
  fill('#ff635b');
  translate(cup.body.position.x - 76.5, cup.body.position.y);
  ellipse(0, 10 + thirdAnimation.percent * 3, 34, 10);
  pop();

  // Blush left
  push();
  noStroke();
  fill('#ff847e');
  translate(cup.body.position.x - 76.5, cup.body.position.y);
  ellipse(-20, 18.5, 18.5, 11);
  pop();

  // Blush right
  push();
  noStroke();
  fill('#ff635b');
  translate(cup.body.position.x + 76.5, cup.body.position.y);
  ellipse(20, 18.5, 18.5, 11);
  pop();

  // Inner eyes
  push();
  noStroke();
  fill('black');
  translate(cup.body.position.x, cup.body.position.y);
  ellipse(
    -76.5 + (marshmallow.body.position.x / width - 0.5) * 10,
    -7 + (marshmallow.body.position.y / height - 0.5) * 10,
    9.5
  );
  ellipse(
    76.5 + (marshmallow.body.position.x / width - 0.5) * 10,
    -7 + (marshmallow.body.position.y / height - 0.5) * 10,
    9.5
  );
  pop();

  // Cup mouth
  push();
  stroke('#812d29');
  strokeJoin(ROUND);
  strokeWeight(2);
  fill('#812d29');
  translate(cup.body.position.x, cup.body.position.y);
  rotate(cup.body.angle);
  arc(0, -10 + (thirdAnimation.percent * 18), 46, firstAnimation.percent * 44, 0, 3.14, CHORD);
  arc(0, -10 + (thirdAnimation.percent * 18), 46, thirdAnimation.percent * 44, 3.14, 0, CHORD);
  pop();
}
