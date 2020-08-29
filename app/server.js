const Express = require("express");

function create(onRequest) {
  const app = Express();

  app.use(Express.text());
  app.use(Express.json());
  app.use(Express.raw());
  app.use(Express.urlencoded({ extended: true }));

  app.all(/.*/, onRequest);
  return app;
}

module.exports = create;
