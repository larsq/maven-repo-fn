const app = require("./app/server");
const { onRequest } = require("./index");

const port = process.env.PORT || 8000;

app(onRequest).listen(port, () =>
  console.log(`start listening on port ${port}`)
);
