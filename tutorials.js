const tutorialData = window.tutorialData || [];
const tutorialList = document.querySelector("[data-tutorial-list]");
const tutorialFilters = document.querySelector("[data-tutorial-filters]");
const tutorialSearch = document.querySelector("[data-tutorial-search]");
const tutorialPanel = document.querySelector("[data-tutorial-panel]");
const tutorialDetail = document.querySelector("[data-tutorial-detail]");
const closeTutorialButtons = document.querySelectorAll("[data-close-tutorial]");
const tutorialCategories = ["全部", ...Array.from(new Set(tutorialData.map(item => item.category)))];
let tutorialActive = "全部";

function tutorialCount(category) {
  return category === "全部" ? tutorialData.length : tutorialData.filter(item => item.category === category).length;
}

function renderTutorialFilters() {
  tutorialFilters.innerHTML = tutorialCategories.map(category => `
    <button class="filter ${category === tutorialActive ? "active" : ""}" type="button" data-category="${category}">
      <span>${category}</span><span>${tutorialCount(category)}</span>
    </button>
  `).join("");
}

function visibleTutorials() {
  const term = (tutorialSearch.value || "").trim().toLowerCase();
  return tutorialData.filter(item => {
    const inCategory = tutorialActive === "全部" || item.category === tutorialActive;
    const haystack = [item.title, item.category, item.time, item.desc, ...(item.steps || [])].join(" ").toLowerCase();
    return inCategory && (!term || haystack.includes(term));
  });
}

function renderTutorialList() {
  const items = visibleTutorials();
  tutorialList.innerHTML = items.length ? items.map(item => {
    const id = tutorialData.indexOf(item);
    return `
    <article class="article" role="button" tabindex="0" data-tutorial-id="${id}" aria-label="查看教程 ${item.title}">
      <b>${item.title}</b>
      <span>${item.category} · ${item.time}</span>
      <p>${item.desc}</p>
    </article>
  `;
  }).join("") : `<div class="empty">没有匹配的教程，换一个关键词或专区试试。</div>`;
}

function tutorialMaterials(item) {
  if (item.category === "PPT 专区") return ["原始课件", "授课电脑", "备用 PDF", "需要用到的字体/视频/音频文件"];
  if (item.category === "视频专区") return ["原视频或公开视频链接", "剪辑工具", "字幕文本", "课堂播放设备"];
  if (item.category === "PDF 专区") return ["PDF 文件", "OCR 识别工具", "Word 模板", "人工校对时间"];
  if (item.category === "音频专区") return ["清理后的英文文本", "配音工具", "耳机试听", "MP3 播放测试"];
  if (item.category === "AI 专区") return ["教材版本与单元目标", "学生水平说明", "原始文本或任务", "老师审核清单"];
  if (item.category === "Word 专区") return ["Word 文档", "样式设置", "打印预览", "可复用模板"];
  if (item.category === "图片专区") return ["原图", "抠图/压缩工具", "透明 PNG", "PPT 投影预览"];
  return ["原始材料", "处理工具", "课堂设备", "备用方案"];
}

function tutorialPitfalls(item) {
  const base = ["不要把工具输出直接当最终稿，至少完整检查一遍。", "公开发布或售卖课件前，确认素材来源和授权。"];
  if (item.title.includes("字体")) return ["只在自己电脑装字体不够，换电脑仍可能跑版。", "商用字体不要随意打包传播。", ...base];
  if (item.title.includes("视频")) return ["不要选太长的视频，课堂导入通常 1 到 2 分钟足够。", "公开视频不等于可随意下载、二创或商用。", ...base];
  if (item.title.includes("PDF")) return ["OCR 对英文标点、换行和题号很容易识别错。", "扫描版资料可能涉及版权，尽量只处理自己有权使用的文件。", ...base];
  if (item.title.includes("配音") || item.title.includes("听力")) return ["语速过快会让训练目标偏离课堂重点。", "机器配音的重音和停顿需要人工试听。", ...base];
  if (item.category === "AI 专区") return ["AI 容易编造答案依据，必须让它标出原文出处。", "题目难度要按学生真实水平重新调整。", ...base];
  return base;
}

function tutorialOutcome(item) {
  if (item.category === "PPT 专区") return "得到一份更稳定的课堂课件，并准备好换电脑、离线播放和投影失败时的备用方案。";
  if (item.category === "视频专区") return "把视频处理成短、清楚、能直接放进课堂活动的片段。";
  if (item.category === "PDF 专区") return "把不可编辑材料整理成可修改、可排版、可二次加工的 Word 文档。";
  if (item.category === "音频专区") return "生成可试听、可导入 PPT、适合学生水平的课堂音频。";
  if (item.category === "AI 专区") return "得到可继续修改的备课草稿，而不是未经审核的成品。";
  if (item.category === "Word 专区") return "形成干净、统一、可复用的试卷或讲义格式。";
  return "完成一个能直接进入备课流程的可用版本。";
}

function tutorialVisual(item) {
  const labels = item.steps && item.steps.length >= 3 ? item.steps.slice(0, 3).map(step => step.replace(/[。，.].*$/, "").slice(0, 8)) : ["准备", "处理", "检查"];
  return `
    <div class="detail-visual" aria-label="版权安全的教程流程图示">
      <div class="visual-kicker">原创图示 · 无第三方版权图</div>
      <div class="visual-title">${item.category}操作流程</div>
      <div class="visual-flow">
        ${labels.map((label, index) => `<div class="visual-node"><span>Step ${index + 1}</span><b>${label}</b></div>`).join("")}
      </div>
    </div>
  `;
}

let tutorialLastFocused = null;

function tutorialTrapFocus(container, event) {
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

function openTutorial(item) {
  tutorialLastFocused = document.activeElement;
  tutorialDetail.innerHTML = `
    <div class="detail-head">
      <div class="rank detail-rank">教</div>
      <div>
        <h2>${item.title}</h2>
        <div class="rating-row"><span class="rating-label">${item.category}</span><strong>${item.time}</strong></div>
      </div>
    </div>
    <p class="detail-desc">${item.desc}</p>
    <div class="detail-hero-grid">
      ${tutorialVisual(item)}
      <div class="detail-meta-card">
        <div><span>完成后你会得到</span><b>${tutorialOutcome(item)}</b></div>
        <div><span>建议准备</span><b>${tutorialMaterials(item).slice(0, 3).join("、")}</b></div>
        <div><span>适合使用时机</span><b>备课制作、公开课检查、临时救场或整理个人资源库时。</b></div>
      </div>
    </div>
    <div class="detail-content-grid">
      <div class="detail-stack">
        <div class="detail-section"><b>操作步骤</b><ol>${(item.steps || []).map(step => `<li>${step}</li>`).join("")}</ol></div>
        <div class="detail-section"><b>课堂使用建议</b><p>先用小样本测试，再放进正式课件或讲义。涉及音视频时，务必在授课电脑上完整播放一次；涉及文字识别和 AI 生成时，务必人工核对英文、答案和格式。</p></div>
      </div>
      <div>
        <div class="detail-section"><b>材料清单</b><ul class="detail-checklist">${tutorialMaterials(item).map(step => `<li>${step}</li>`).join("")}</ul></div>
        <div class="detail-section"><b>常见坑</b><ul>${tutorialPitfalls(item).map(step => `<li>${step}</li>`).join("")}</ul></div>
      </div>
    </div>
  `;
  tutorialPanel.hidden = false;
  document.body.classList.add("detail-open");
  const closeButton = tutorialPanel.querySelector(".detail-close");
  if (closeButton) closeButton.focus();
}

function closeTutorial() {
  tutorialPanel.hidden = true;
  document.body.classList.remove("detail-open");
  if (tutorialLastFocused && tutorialLastFocused.focus) tutorialLastFocused.focus();
}

tutorialFilters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  tutorialActive = button.dataset.category;
  renderTutorialFilters();
  renderTutorialList();
});

tutorialSearch.addEventListener("input", renderTutorialList);
tutorialList.addEventListener("click", event => {
  const card = event.target.closest("[data-tutorial-id]");
  if (!card) return;
  openTutorial(tutorialData[Number(card.dataset.tutorialId)]);
});

tutorialList.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-tutorial-id]");
  if (!card) return;
  event.preventDefault();
  openTutorial(tutorialData[Number(card.dataset.tutorialId)]);
});

closeTutorialButtons.forEach(button => button.addEventListener("click", closeTutorial));
tutorialPanel.addEventListener("keydown", event => tutorialTrapFocus(tutorialPanel, event));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !tutorialPanel.hidden) closeTutorial();
});
renderTutorialFilters();
renderTutorialList();
