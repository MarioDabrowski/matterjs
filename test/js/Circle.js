function Circle(x, y, r, options) {
  this.r = r;
  this.body = Bodies.circle(x, y, r, options);

  World.add(world, this.body);
}

Circle.prototype.render = function() {
  var position = this.body.position;

  push();
  noStroke();
  fill('#000');
  translate(position.x, position.y);
  rotate(this.body.angle);
  ellipse(0, 0, this.r * 2);
  stroke('white');
  line(0, 0, 0, this.r);
  pop();
};
