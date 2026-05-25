const express = require("express");
const { nanoid } = require("nanoid");

const app = express();

// Render.com 프록시 환경에서 실제 IP를 가져오기 위한 설정
app.set('trust proxy', true);

app.use(express.json());
app.use(express.static("public"));

const links = {};
const visits = {};

// 메인 페이지
app.get("/", (req, res) => {
  res.send("Tracker 서버 실행중");
});

// 링크 생성 API
app.post("/create-link", (req, res) => {
  const url = req.body.url;
  if (!url) {
    return res.send("URL 필요");
  }

  const code = nanoid(6);
  links[code] = url;
  visits[code] = [];

  res.json({
    link: `https://tracker-gt1v.onrender.com/r/${code}`,
    dashboard: `https://tracker-gt1v.onrender.com/charles/${code}`
  });
});

// 링크 리다이렉트 및 IP 수집 (마스킹 제거됨)
app.get("/r/:code", (req, res) => {
  const code = req.params.code;
  const target = links[code];

  if (!target) {
    return res.send("링크 없음");
  }

  // trust proxy 설정 덕분에 req.ip로 실제 IP를 가져옵니다.
  const realIp = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  visits[code].push({
    time: new Date(),
    ip: realIp, // 이제 마스킹 없이 실제 IP가 저장됩니다.
    browser: req.headers["user-agent"],
    referrer: req.headers["referer"] || "직접접속"
  });

  console.log("링크 접속 발생: " + realIp);
  res.redirect(target);
});

// 통계 확인 API
app.get("/stats/:code", (req, res) => {
  const code = req.params.code;
  if (!visits[code]) {
    return res.send("없음");
  }

  res.json({
    totalClicks: visits[code].length,
    visits: visits[code]
  });
});

// 서버 실행
app.listen(3000, () => {
  console.log("서버 실행됨 (Port 3000)");
});
