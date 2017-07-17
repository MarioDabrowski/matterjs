function Circle(x, y, r, options) {
  this.r = r;
  this.options = options;
  this.body = Bodies.circle(x, y, r, options);
  World.add(world, this.body);
}

Circle.prototype.render = function() {
  var position = this.body.position;
  var angle = this.body.angle;

  push();
  noStroke();
  fill(99,99,99);
  translate(position.x, position.y);
  rotate(angle);
  ellipse(0, 0, this.r * 2);
  pop();
};

Circle.prototype.isOffScreen = function() {
  var position = this.body.position;

  return (position.y > height);
};

Circle.prototype.removeFromWorld = function() {
  World.remove(world, this.body);
};
