const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://punxyufuudvdqflubeww.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bnh5dWZ1dWR2ZHFmbHViZXd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMTAyOTcsImV4cCI6MjA5NzU4NjI5N30.FVdBvldHrPm4x5B43Y3H6PynOS5TVPm1dWvd_K6QYXA";

const APP_STORE_URL = "https://apps.apple.com/app/minder/id6796769214";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=university.minder.app&hl=tr";
const OG_IMAGE_URL =
  "https://minder.university/assets/store/google-play/feature-graphic-1024x500.png";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CATEGORY_LABELS = {
  general: "Genel",
  confession: "İtiraf",
  question: "Soru",
  event: "Etkinlik",
  lost_found: "Kayıp / Buluntu",
  meme: "Mizah",
};

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncateText(text, maxLen) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).trimEnd() + "...";
}

function parseContentRangeCount(headerValue) {
  if (!headerValue) return null;
  const slashIdx = headerValue.lastIndexOf("/");
  if (slashIdx === -1) return null;
  const count = Number.parseInt(headerValue.slice(slashIdx + 1), 10);
  return Number.isFinite(count) ? count : null;
}

async function fetchPostAndCommentCount(id) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Accept: "application/json",
  };

  const postUrl =
    `${SUPABASE_URL}/rest/v1/posts?id=eq.${encodeURIComponent(id)}` +
    `&select=id,title,content,category,avatar_display_name,upvotes,downvotes,score,location_tag,status,is_hidden&limit=1`;

  const commentUrl =
    `${SUPABASE_URL}/rest/v1/comments?post_id=eq.${encodeURIComponent(id)}` +
    `&status=eq.approved&is_hidden=eq.false&select=id`;

  const [postRes, commentRes] = await Promise.all([
    fetch(postUrl, { headers }),
    fetch(commentUrl, {
      headers: {
        ...headers,
        Prefer: "count=exact",
        Range: "0-0",
      },
    }),
  ]);

  let post = null;
  if (postRes.ok) {
    const rows = await postRes.json();
    if (Array.isArray(rows) && rows.length > 0) {
      const candidate = rows[0];
      if (candidate.status === "approved" && !candidate.is_hidden) {
        post = candidate;
      }
    }
  }

  let commentCount = 0;
  if (commentRes.ok) {
    const parsed = parseContentRangeCount(
      commentRes.headers.get("content-range")
    );
    if (parsed !== null) {
      commentCount = parsed;
    } else {
      const rows = await commentRes.json().catch(() => []);
      if (Array.isArray(rows)) commentCount = rows.length;
    }
  }

  return { post, commentCount };
}

module.exports = async function handler(req, res) {
  const rawId = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;
  const id = typeof rawId === "string" && UUID_RE.test(rawId.trim()) ? rawId.trim() : null;

  let post = null;
  let commentCount = 0;

  if (id) {
    try {
      const result = await fetchPostAndCommentCount(id);
      post = result.post;
      commentCount = result.commentCount;
    } catch (err) {
      console.error("[api/post] Supabase fetch error:", err?.message || err);
    }
  }

  const canonicalUrl = id
    ? `https://minder.university/post/${id}`
    : "https://minder.university";
  const deepLinkUrl = id ? `minder://post/${id}` : "minder://";

  let ogTitle = "◈ Minder — Sadece Kampüste Olanlar İçin";
  let ogDesc =
    "Üniversitene özel anonim kampüs ağı. Bu gönderiyi ve yorumları görmek için Minder uygulamasını aç.";
  let snippet = "";
  let authorLabel = "Minder Kampüs Ağı";
  let categoryLabel = "Kampüs";
  let score = 0;

  if (post) {
    authorLabel = post.avatar_display_name || "Anonim Öğrenci";
    categoryLabel = CATEGORY_LABELS[post.category] || "Kampüs";
    score = Number.isFinite(post.score) ? post.score : 0;
    snippet = truncateText(post.content, 120);

    ogTitle = post.title
      ? `◈ ${truncateText(post.title, 70)} — ${authorLabel}`
      : `◈ ${authorLabel} · Minder Kampüs Ağı`;

    ogDesc = `"${snippet}" — 💬 ${commentCount} yorum · ▲ ${score} puan · Okumak için Minder'da aç`;
  }

  const safeTitle = escapeHtml(ogTitle);
  const safeDesc = escapeHtml(ogDesc);
  const safeUrl = escapeHtml(canonicalUrl);
  const safeImage = escapeHtml(OG_IMAGE_URL);
  const safeDeepLink = escapeHtml(deepLinkUrl);
  const safeAuthor = escapeHtml(authorLabel);
  const safeCategory = escapeHtml(categoryLabel);
  const safeSnippet = escapeHtml(
    snippet || "Bu kampüs gönderisini ve yorumları görmek için Minder uygulamasını aç."
  );

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />
  <meta name="theme-color" content="#0a0e1a" />
  <link rel="canonical" href="${safeUrl}" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png" />

  <!-- Open Graph (WhatsApp / Discord / Telegram) -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Minder" />
  <meta property="og:locale" content="tr_TR" />
  <meta property="og:url" content="${safeUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:width" content="1024" />
  <meta property="og:image:height" content="500" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImage}" />

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: radial-gradient(circle at top, rgba(124, 92, 255, 0.18), transparent 55%), #0a0e1a;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
    }
    .card {
      width: 100%;
      max-width: 440px;
      background: rgba(18, 22, 38, 0.94);
      border: 1px solid rgba(154, 123, 255, 0.28);
      border-radius: 22px;
      padding: 26px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 18px;
      letter-spacing: -0.02em;
    }
    .brand-left img { width: 28px; height: 28px; border-radius: 7px; }
    .badge {
      font-size: 12px;
      font-weight: 600;
      color: #c4b5fd;
      background: rgba(124, 92, 255, 0.16);
      border: 1px solid rgba(124, 92, 255, 0.35);
      padding: 4px 10px;
      border-radius: 999px;
    }
    .author {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .author strong { color: #e2e8f0; }
    .teaser {
      font-size: 16px;
      line-height: 1.55;
      color: #f1f5f9;
      background: rgba(10, 14, 26, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .lock-note {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.45;
      margin-bottom: 20px;
    }
    .stats {
      display: flex;
      gap: 14px;
      font-size: 13px;
      color: #cbd5e1;
      margin-bottom: 16px;
    }
    .btn {
      display: block;
      width: 100%;
      text-align: center;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 13px 16px;
      border-radius: 12px;
      transition: opacity 0.15s ease;
    }
    .btn:hover { opacity: 0.92; }
    .btn-primary {
      background: linear-gradient(135deg, #7c5cff, #22d3ee);
      color: #080b14;
      margin-bottom: 10px;
    }
    .store-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #e2e8f0;
      font-size: 13px;
      padding: 11px 12px;
    }
    .hint {
      margin-top: 14px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="brand">
      <div class="brand-left">
        <img src="/assets/img/logo.png" alt="Minder" />
        <span>Minder</span>
      </div>
      <span class="badge">${safeCategory}</span>
    </div>

    <div class="author">Paylaşan: <strong>${safeAuthor}</strong></div>

    <div class="teaser">“${safeSnippet}”</div>

    ${
      post
        ? `<div class="stats"><span>▲ ${score} puan</span><span>💬 ${commentCount} yorum</span></div>`
        : ""
    }

    <p class="lock-note">
      🔒 Gönderinin devamı ve kampüs yorumları gizlilik nedeniyle web'de gösterilmez; yalnızca Minder uygulamasında açılır.
    </p>

    <a id="open-app-btn" class="btn btn-primary" href="${safeDeepLink}">
      Minder Uygulamasında Aç
    </a>

    <div class="store-row">
      <a class="btn btn-secondary" href="${APP_STORE_URL}">App Store</a>
      <a class="btn btn-secondary" href="${PLAY_STORE_URL}">Google Play</a>
    </div>

    <p id="redirect-hint" class="hint">Kampüste ol, konuş, unut.</p>
  </main>

  <script>
    (function () {
      var ua = navigator.userAgent || navigator.vendor || window.opera || "";
      var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      if (!isIOS && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
        isIOS = true;
      }
      var isAndroid = /Android/i.test(ua);
      if (!isIOS && !isAndroid) return;

      var storeUrl = isIOS ? ${JSON.stringify(APP_STORE_URL)} : ${JSON.stringify(PLAY_STORE_URL)};
      var deepLink = ${JSON.stringify(deepLinkUrl)};
      var hint = document.getElementById("redirect-hint");
      if (hint) {
        hint.textContent = "Uygulama açılıyor... Yüklü değilse mağazaya yönlendirileceksin.";
      }

      window.location.href = deepLink;
      window.setTimeout(function () {
        if (document.visibilityState === "visible") {
          window.location.href = storeUrl;
        }
      }, 1800);
    })();
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  return res.status(200).send(html);
};

