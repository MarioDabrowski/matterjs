function Box(x, y, w, h, options) {
  this.w = w;
  this.h = h;
  this.body = Bodies.rectangle(x, y, w, h, options);

  World.add(world, this.body);
}
