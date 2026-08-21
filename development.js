const developmentData = window.developmentData || [];
const competitionData = window.competitionData || [];
const ipList = document.querySelector("[data-ip-list]");
const ipSearch = document.querySelector("[data-ip-search]");
const competitionList = document.querySelector("[data-competition-list]");
const competitionSearch = document.querySelector("[data-competition-search]");
const ipPanel = document.querySelector("[data-ip-panel]");
const ipDetail = document.querySelector("[data-ip-detail]");
const closeIpButtons = document.querySelectorAll("[data-close-ip]");

function ipText(item) {
  return [item.name, item.focus, item.desc, ...(item.keywords || []), ...(item.platforms || []).map(platform => platform.name)].join(" ").toLowerCase();
}

function visibleIps() {
  const term = (ipSearch.value || "").trim().toLowerCase();
  if (!term) return developmentData;
  return developmentData.filter(item => ipText(item).includes(term));
}

function renderIps() {
  const items = visibleIps();
  ipList.innerHTML = items.length ? items.map(item => {
    const id = developmentData.indexOf(item);
    return `
      <article class="ip-card" role="button" tabindex="0" data-ip-id="${id}" aria-label="查看 ${item.name} 详情">
        <span>${item.initials}</span>
        <div><b>${item.name}</b><p>${item.focus}</p></div>
      </article>
    `;
  }).join("") : `<div class="empty">暂时没有匹配的个人 IP，换个平台或关键词试试。</div>`;
}

function competitionText(item) {
  return [item.name, item.type, item.audience, item.desc, item.note, ...(item.keywords || []), ...(item.links || []).map(link => link.name)].join(" ").toLowerCase();
}

function visibleCompetitions() {
  const term = (competitionSearch.value || "").trim().toLowerCase();
  if (!term) return competitionData;
  return competitionData.filter(item => competitionText(item).includes(term));
}

function renderCompetitions() {
  const items = visibleCompetitions();
  competitionList.innerHTML = items.length ? items.map(item => {
    const id = competitionData.indexOf(item);
    return `
      <article class="ip-card" role="button" tabindex="0" data-competition-id="${id}" aria-label="查看 ${item.name} 详情">
        <span>${item.initials}</span>
        <div><b>${item.name}</b><p>${item.type} · ${item.audience}</p></div>
      </article>
    `;
  }).join("") : `<div class="empty">暂时没有匹配的比赛或考试，换一个关键词试试。</div>`;
}

let ipLastFocused = null;

function ipTrapFocus(container, event) {
  if (event.key !== "Tab") return;
  const focusables = container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function focusIpPanel() {
  ipLastFocused = document.activeElement;
  ipPanel.hidden = false;
  document.body.classList.add("detail-open");
  const closeButton = ipPanel.querySelector(".detail-close");
  if (closeButton) closeButton.focus();
}

function openIp(item) {
  ipDetail.innerHTML = `
    <div class="detail-head">
      <div class="rank detail-rank">${item.initials}</div>
      <div>
        <h2>${item.name}</h2>
        <div class="rating-row"><span class="rating-label">个人 IP</span><span>${item.focus}</span></div>
      </div>
    </div>
    <p class="detail-desc">${item.desc}</p>
    <div class="detail-content-grid">
      <div class="detail-stack">
        <div class="detail-section"><b>平台线索</b><ul>${item.platforms.map(platform => `<li><a href="${platform.url}" target="_blank" rel="noopener">${platform.name}</a></li>`).join("")}</ul></div>
        <div class="detail-section"><b>适合关注</b><p>${item.focus}</p></div>
      </div>
      <div>
        <div class="detail-section"><b>收录边界</b><p>这里只提供名称、方向和平台入口线索。请进入平台后核对是否为本人账号；不搬运课程、文章、视频、二维码、网盘资料和付费内容。</p></div>
        <div class="detail-note-strip">个人 IP 的平台账号可能变更，后续建议支持用户反馈失效链接和推荐新入口。</div>
      </div>
    </div>
  `;
  focusIpPanel();
}

function openCompetition(item) {
  ipDetail.innerHTML = `
    <div class="detail-head">
      <div class="rank detail-rank">${item.initials}</div>
      <div>
        <h2>${item.name}</h2>
        <div class="rating-row"><span class="rating-label">${item.type}</span><span>${item.audience}</span></div>
      </div>
    </div>
    <p class="detail-desc">${item.desc}</p>
    <div class="detail-content-grid">
      <div class="detail-stack">
        <div class="detail-section"><b>入口线索</b><ul>${item.links.map(link => `<li><a href="${link.url}" target="_blank" rel="noopener">${link.name}</a></li>`).join("")}</ul></div>
        <div class="detail-section"><b>适合对象</b><p>${item.audience}</p></div>
      </div>
      <div>
        <div class="detail-section"><b>报名提醒</b><p>${item.note}</p></div>
        <div class="detail-note-strip">比赛和考试信息每年可能变动，请以官方通知、学校通知或当地考试机构公布信息为准。</div>
      </div>
    </div>
  `;
  focusIpPanel();
}

function closeIp() {
  ipPanel.hidden = true;
  document.body.classList.remove("detail-open");
  if (ipLastFocused && ipLastFocused.focus) ipLastFocused.focus();
}

ipSearch.addEventListener("input", renderIps);
competitionSearch.addEventListener("input", renderCompetitions);
ipList.addEventListener("click", event => {
  const card = event.target.closest("[data-ip-id]");
  if (!card) return;
  openIp(developmentData[Number(card.dataset.ipId)]);
});
competitionList.addEventListener("click", event => {
  const card = event.target.closest("[data-competition-id]");
  if (!card) return;
  openCompetition(competitionData[Number(card.dataset.competitionId)]);
});
ipList.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-ip-id]");
  if (!card) return;
  event.preventDefault();
  openIp(developmentData[Number(card.dataset.ipId)]);
});
competitionList.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-competition-id]");
  if (!card) return;
  event.preventDefault();
  openCompetition(competitionData[Number(card.dataset.competitionId)]);
});
closeIpButtons.forEach(button => button.addEventListener("click", closeIp));
ipPanel.addEventListener("keydown", event => ipTrapFocus(ipPanel, event));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !ipPanel.hidden) closeIp();
});
renderIps();
renderCompetitions();
