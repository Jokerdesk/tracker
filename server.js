const express = require("express")
const { nanoid } = require("nanoid")

const app = express()

app.use(express.json())

app.use(
 express.static("public")
)

const links = {}

const visits = {}

app.get("/", (req, res) => {

 res.send("Tracker 서버 실행중")

})

app.post("/create-link", (req, res) => {

 const url = req.body.url

 if (!url) {

  return res.send("URL 필요")

 }

 const code = nanoid(6)

 links[code] = url

 visits[code] = []

 res.json({

  link:
  `https://tracker-gt1v.onrender.com/r/${code}`,

  dashboard:
  `https://tracker-gt1v.onrender.com/stats/${code}`

 })

})

app.get("/r/:code", (req, res) => {

 const code = req.params.code

 const target = links[code]

 if (!target) {

  return res.send("링크 없음")

 }

 const forwarded =
 req.headers["x-forwarded-for"]

 const rawIp =
 forwarded
 ? forwarded.split(",")[0].trim()
 : req.socket.remoteAddress

 let maskedIp =
 rawIp || "알수없음"

 if (
  maskedIp.includes(".")
 ) {

  maskedIp =
  maskedIp.replace(
   /(\d+\.\d+)\.\d+\.\d+/,
   "$1.xxx.xxx"
  )

 }

 visits[code].push({

  time:
  new Date(),

  ip:
  maskedIp,

  browser:
  req.headers[
   "user-agent"
  ],

  referrer:
  req.headers[
   "referer"
  ]
  ||
  "직접접속"

 })

 console.log(
  "링크 접속 발생"
 )

 res.redirect(
  target
 )

})

app.get("/stats/:code",

(req, res) => {

 const code =
 req.params.code

 if (
  !visits[code]
 ) {

  return res.send(
   "없음"
  )

 }

 res.json({

  totalClicks:
  visits[code].length,

  visits:
  visits[code]

 })

})

app.listen(
3000,
() => {

 console.log(
 "서버 실행됨"
 )

})