const express = require("express")
const expressWinston = require("express-winston")
const logging = require('../logging')

const app = express();
const router = express.Router();
const logger = logging.TimHttpLogger();

router.use((req, res) => {
  if (req.header('authorization') === process.env.TOKEN) {
    res.json({
      ok: true
    })
  } else {
    res.status(401).json({
      ok: false
    })
  }
})

const port = process.env.PORT || 8080

app.use(expressWinston.logger({
  winstonInstance: logger,
  level: logging.loggingLevel,
  colorize: false
}));

app.use(router);

app.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

app.listen(port, () => {
  console.log(`auth_svc listening on ${port}`)
})