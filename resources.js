const data = window.resourceData || [];
const list = document.querySelector("[data-resource-list]");
const filters = document.querySelector("[data-filters]");
const search = document.querySelector("[data-resource-search]");
const sort = document.querySelector("[data-resource-sort]");
const summary = document.querySelector("[data-result-summary]");
const quickFilters = document.querySelector("[data-quick-filters]");
const detailPanel = document.querySelector("[data-detail-panel]");
const detailContent = document.querySelector("[data-detail-content]");
const closeDetailButtons = document.querySelectorAll("[data-close-detail]");
const categories = ["全部", "教材资源", "课件资源", "游戏教学", "教具素材", "英语 IP", "综合资源", "听力视频", "阅读素材", "课堂互动", "语法词汇", "题库同步", "AI 工具", "素材工具"];
const params = new URLSearchParams(window.location.search);
let active = categories.includes(params.get("category")) ? params.get("category") : "全部";
const baseQuickOptions = [
  { id: "all", label: "全部结果" },
  { id: "recommended", label: "排行榜" },
  { id: "free", label: "免费" },
  { id: "stable", label: "国内常用" },
  { id: "international", label: "国际资源" }
];
const categoryQuickOptions = {
  "素材工具": [
    { id: "images", label: "图片素材" },
    { id: "slides", label: "PPT模板" },
    { id: "media", label: "视频音频" },
    { id: "convert", label: "格式转换" },
    { id: "imageTools", label: "图片处理" },
    { id: "voice", label: "配音字幕" }
  ],
  "AI 工具": [
    { id: "generalAi", label: "通用AI" },
    { id: "teacherAi", label: "教师AI" },
    { id: "englishAi", label: "英语AI" },
    { id: "docAi", label: "文档研究" },
    { id: "chinaAi", label: "国产AI" }
  ]
};
let quickOptions = [
  ...baseQuickOptions,
  ...(categoryQuickOptions[active] || [])
];
let quickActive = quickOptions.some(option => option.id === params.get("view")) ? params.get("view") : "all";

const featuredRatings = {
  "国家中小学智慧教育平台": 5.0,
  "学科网": 4.9,
  "人民教育出版社": 4.9,
  "21世纪教育网": 4.8,
  "教习网": 4.7,
  "组卷网": 4.7,
  "希沃白板": 4.7,
  "101教育PPT": 4.6,
  "剪映": 4.6,
  "菁优网": 4.6,
  "外研社基础教育": 4.5,
  "Canva for Education": 4.5,
  "NotebookLM": 4.5,
  "ChatGPT": 4.5,
  "Kimi": 4.5,
  "豆包": 4.5,
  "Wordwall": 4.5,
  "金太阳教育": 4.5,
  "中小学教育资源网": 4.4,
  "译林出版社": 4.4,
  "BBC Learning English": 4.3,
  "British Council TeachingEnglish": 4.3,
  "Cambridge Dictionary": 4.3,
  "Breaking News English": 4.2,
  "Oxford Learner's Dictionaries": 4.2,
  "Quizizz": 4.2,
  "iSLCollective": 4.1,
  "ReadWorks": 4.1
};

if (params.get("q")) {
  search.value = params.get("q");
}

function countFor(category) {
  if (category === "全部") return data.length;
  return data.filter(item => item.category === category).length;
}

function ratingFor(item) {
  if (featuredRatings[item.name]) return featuredRatings[item.name];
  let score = 4.1;
  if (item.tags.includes("免费")) score += 0.25;
  if (item.tags.includes("官方")) score += 0.35;
  if (item.tags.includes("公共版权")) score += 0.15;
  if (item.tags.includes("教材资源")) score += 0.12;
  if (item.tags.includes("课件")) score += 0.1;
  if (item.tags.includes("课堂游戏")) score += 0.08;
  if (item.tags.includes("可打印") || item.tags.includes("单词卡")) score += 0.06;
  if (item.tags.includes("PPT模板") || item.tags.includes("图片素材") || item.tags.includes("配音字幕")) score += 0.05;
  if (item.tags.includes("需注册")) score -= 0.12;
  if (item.tags.includes("付费")) score -= 0.25;
  if (item.access.includes("国内稳定") || item.access.includes("国内较稳定")) score += 0.42;
  if (item.tags.includes("国际资源")) score -= 0.32;
  if (item.access.includes("受限")) score -= 0.18;
  if (item.category === "教材资源" || item.category === "课件资源" || item.category === "题库同步") score += 0.18;
  if (item.category === "游戏教学" || item.category === "教具素材") score += 0.08;
  if (item.category === "综合资源" || item.category === "听力视频") score += 0.04;
  return Math.max(3.7, Math.min(4.8, Number(score.toFixed(1))));
}

function editorNote(item) {
  if (item.tags.includes("国际资源") && item.access.includes("受限")) {
    return "内容值得看，适合做拓展素材；访问前建议准备备用方案。";
  }
  if (item.category === "课堂互动") {
    return "适合课前热身、复习检测和公开课互动，建议提前建好活动并测试投屏。";
  }
  if (item.category === "题库同步") {
    return "适合查题、组卷和复习讲评，使用时注意区分免费内容和平台会员内容。";
  }
  if (item.category === "游戏教学") {
    return "适合热身、复习、词汇操练和小组竞赛，正式上课前建议提前测试投屏和账号权限。";
  }
  if (item.category === "教具素材") {
    return "适合制作单词卡、桌游、worksheet 和课堂展示材料，下载或打印前要查看授权说明。";
  }
  if (item.category === "英语 IP") {
    return "适合查找英语动画、儿歌、绘本和低龄内容 IP 的独立网站入口；课堂使用前要核对授权平台和播放条件。";
  }
  if (item.category === "教材资源") {
    return "适合按教材版本核对单元内容、配套音频和教师用书信息，优先查看官方入口。";
  }
  if (item.category === "课件资源") {
    return "适合找同步课件、教案和课堂活动灵感，正式使用前建议二次改写并核对授权。";
  }
  if (item.category === "素材工具") {
    return "适合处理课件、图片、音视频、格式转换和配音字幕，商用或公开发布前要看授权说明。";
  }
  if (item.category === "AI 工具") {
    return "适合快速生成草稿和活动灵感，最终内容仍需要老师审核和本地化改写。";
  }
  if (item.category === "语法词汇") {
    return "适合查例句、讲用法和做词汇支架，课堂讲解时建议二次筛选例句。";
  }
  if (item.category === "阅读素材") {
    return "适合阅读课选材和分层任务设计，使用前需要核对文本难度和版权规则。";
  }
  if (item.category === "听力视频") {
    return "适合导入、听说活动和真实语料补充，正式上课前要检查播放和字幕。";
  }
  return "适合备课前期找方向，建议结合教材目标筛选后再进入课件制作。";
}

function loginNote(item) {
  if (item.tags.includes("需注册")) return "需要注册账号后使用完整功能。";
  if (item.tags.includes("付费")) return "部分资源或高级功能需要付费账号。";
  if (item.tags.includes("部分免费")) return "可先试用免费内容，高级资源可能需要登录或会员。";
  return "通常可直接访问，具体以官网当前规则为准。";
}

function useSteps(item) {
  if (item.category === "教材资源") return ["先确认教材版本、年级和单元。", "进入官网查找教材目录、课例或配套资源。", "只引用公开入口，不搬运教材文件。"];
  if (item.category === "课件资源") return ["按年级、版本和单元搜索课件或教案。", "先看预览和授权说明，再决定是否下载或参考。", "下载后必须二次改写，避免直接套用。"];
  if (item.category === "游戏教学") return ["先确定复习目标，比如词汇、语法或听力。", "选择适合投屏或小组竞赛的模板。", "课前测试账号、网络、投屏和学生参与方式。"];
  if (item.category === "教具素材") return ["搜索关键词时同时尝试英文主题词。", "下载或打印前查看授权和使用条件。", "根据班级人数调整尺寸、份数和活动规则。"];
  if (item.category === "英语 IP") return ["先进入独立网站查看角色、主题、视频、歌曲或活动入口。", "再确认是否有授权播放平台、官方频道或课堂可用资源。", "课堂中只引用原始入口，不搬运视频、音频、绘本或截图。"];
  if (item.category === "AI 工具") return ["输入教材版本、学生水平和课堂目标。", "让 AI 先生成草稿，再由老师检查事实、难度和答案。", "把结果整理进课件、讲义或课堂活动流程。"];
  if (item.category === "素材工具") return ["先明确要处理图片、PPT、音频、视频还是 PDF。", "上传前注意隐私和版权，不上传敏感学生信息。", "导出后检查格式、清晰度和课堂设备兼容性。"];
  if (item.category === "听力视频") return ["先筛选主题和时长，优先选择 1 到 3 分钟片段。", "检查字幕、语速、画质和课堂网络。", "配套设计听前、听中和听后任务。"];
  if (item.category === "阅读素材") return ["先判断文本难度和主题是否贴合教材。", "提取关键词、句型和问题链。", "必要时改写长度和词汇难度。"];
  return ["先搜索目标主题或知识点。", "查看官网说明、授权和访问状态。", "把可用内容整理成自己的备课流程。"];
}

function bestScenario(item) {
  const scenarios = {
    "教材资源": "备课前核对版本、单元目标、配套音频和教师用书入口。",
    "课件资源": "需要快速参考同步课件、教案结构、课堂活动和单元练习时使用。",
    "游戏教学": "用于热身、复习、词汇操练、小组竞赛或公开课互动。",
    "教具素材": "制作单词卡、桌游、可打印 worksheet、课堂展示图和活动材料。",
    "英语 IP": "查找英语动画、儿歌、绘本和少儿内容 IP 的独立网站入口。",
    "综合资源": "备课早期找方向，先看目录和资源类型，再进入具体制作。",
    "听力视频": "做导入、听说训练、真实语料补充和听力任务设计。",
    "阅读素材": "寻找分级阅读、新闻改编、话题文本和读后任务素材。",
    "课堂互动": "投屏互动、课堂测验、即时反馈和小组参与。",
    "语法词汇": "查词义、例句、搭配、发音和语法讲解支架。",
    "题库同步": "组卷、查题、单元复习、错题讲评和期末复习。",
    "AI 工具": "生成草稿、改写文本、设计问题链、整理知识点和备课灵感。",
    "素材工具": "处理图片、视频、音频、PPT、PDF、配音、字幕和格式转换。"
  };
  return scenarios[item.category] || "作为备课资源入口，先筛选再整理到自己的课堂流程。";
}

function detailChecklist(item) {
  const list = [
    "先确认资源是否匹配当前年级、教材版本和课时目标。",
    "不要直接搬运第三方内容，建议只引用入口并进行二次整理。",
    "公开课或商用课件使用前，单独查看官网授权、版权和会员规则。"
  ];
  if (item.tags.includes("国际资源")) list.splice(1, 0, "国际资源更适合做拓展补充，课堂主线建议仍以国内教材要求为准。");
  if (item.access.includes("受限")) list.splice(1, 0, "访问可能不稳定，正式上课前准备本地备用材料或替代入口。");
  if (item.category === "AI 工具") list.splice(1, 0, "AI 结果必须由老师核对事实、答案依据、语言难度和课堂适配度。");
  if (item.category === "素材工具") list.splice(1, 0, "上传文件前避开学生隐私、未授权教材扫描件和敏感资料。");
  if (item.category === "英语 IP") list.splice(1, 0, "只链接独立网站或官方/授权平台入口，不收录搬运视频、网盘资源和未授权剪辑。");
  return list;
}

function starsFor(score) {
  const full = Math.floor(score);
  const half = score - full >= 0.5;
  return `${"★".repeat(full)}${half ? "★" : ""}${"☆".repeat(5 - full - (half ? 1 : 0))}`;
}

function renderFilters() {
  filters.innerHTML = categories.map(category => `
    <button class="filter ${category === active ? "active" : ""}" type="button" data-category="${category}">
      <span>${category}</span><span>${countFor(category)}</span>
    </button>
  `).join("");
}

function resetQuickOptions() {
  quickOptions = [
    ...baseQuickOptions,
    ...(categoryQuickOptions[active] || [])
  ];
  if (!quickOptions.some(option => option.id === quickActive)) {
    quickActive = "all";
  }
}

function renderQuickFilters() {
  resetQuickOptions();
  quickFilters.innerHTML = quickOptions.map(option => `
    <button class="quick-filter ${option.id === quickActive ? "active" : ""}" type="button" data-view="${option.id}">
      ${option.label}
    </button>
  `).join("");
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function searchTokens(term) {
  const normalized = normalizeText(term);
  if (!normalized) return [];
  const parts = normalized.split(/[\s,，、/|]+/).filter(Boolean);
  const chars = Array.from(normalized).filter(char => !/[\s,，、/|]/.test(char));
  return Array.from(new Set([...parts, ...chars])).filter(token => token.length > 0);
}

function searchableText(item) {
  return [
    item.name,
    item.category,
    item.access,
    item.desc,
    editorNote(item),
    bestScenario(item),
    loginNote(item),
    ...(item.tags || []),
    ...(item.keywords || []),
    ...useSteps(item)
  ].join(" ").toLowerCase();
}

function relevanceScore(item, term) {
  if (!term) return 0;
  const haystack = searchableText(item);
  const tokens = searchTokens(term);
  const name = normalizeText(item.name);
  const category = normalizeText(item.category);
  const access = normalizeText(item.access);
  const desc = normalizeText(item.desc);
  const tags = (item.tags || []).map(normalizeText);
  const keywords = (item.keywords || []).map(normalizeText);
  let score = 0;
  if (name === term) score += 120;
  if (name.startsWith(term)) score += 90;
  if (name.includes(term)) score += 70;
  if (category === term) score += 55;
  if (category.includes(term)) score += 40;
  if (tags.some(tag => tag === term)) score += 36;
  if (tags.some(tag => tag.includes(term))) score += 28;
  if (keywords.some(keyword => keyword === term)) score += 34;
  if (keywords.some(keyword => keyword.includes(term))) score += 26;
  if (access.includes(term)) score += 18;
  if (desc.includes(term)) score += 14;
  if (editorNote(item).toLowerCase().includes(term)) score += 10;
  if (bestScenario(item).toLowerCase().includes(term)) score += 8;
  if (useSteps(item).join(" ").toLowerCase().includes(term)) score += 6;
  const matchedTokens = tokens.filter(token => haystack.includes(token));
  score += matchedTokens.length * 3;
  if (tokens.length && matchedTokens.length / tokens.length >= 0.5) score += 12;
  return score;
}

function itemMatchesTerm(item, term) {
  if (!term) return true;
  const haystack = searchableText(item);
  if (haystack.includes(term)) return true;
  const tokens = searchTokens(term);
  if (!tokens.length) return true;
  const matched = tokens.filter(token => haystack.includes(token));
  if (term.length <= 3) return matched.length >= 1;
  return matched.length >= 2 && (matched.length / tokens.length >= 0.45 || matched.length >= 3);
}

let searchExpanded = false;

function visibleItems() {
  const term = normalizeText(search.value);
  searchExpanded = false;
  const matchesCurrentScope = item => {
    const inCategory = active === "全部" || item.category === active;
    const inQuickView = quickActive === "all"
      || quickActive === "recommended"
      || (quickActive === "free" && (item.tags.includes("免费") || item.tags.includes("官方")))
      || (quickActive === "stable" && (item.access.includes("国内稳定") || item.access.includes("国内较稳定")))
      || (quickActive === "international" && item.tags.includes("国际资源"))
      || (quickActive === "images" && item.tags.includes("图片素材"))
      || (quickActive === "slides" && item.tags.includes("PPT模板"))
      || (quickActive === "media" && item.tags.includes("视频音频"))
      || (quickActive === "convert" && item.tags.includes("格式转换"))
      || (quickActive === "imageTools" && item.tags.includes("图片处理"))
      || (quickActive === "voice" && item.tags.includes("配音字幕"))
      || (quickActive === "generalAi" && item.tags.includes("通用AI"))
      || (quickActive === "teacherAi" && item.tags.includes("教师AI"))
      || (quickActive === "englishAi" && item.tags.includes("英语AI"))
      || (quickActive === "docAi" && item.tags.includes("文档研究"))
      || (quickActive === "chinaAi" && item.tags.includes("国产AI"));
    return inCategory && inQuickView && itemMatchesTerm(item, term);
  };
  let filtered = data.filter(matchesCurrentScope);
  if (term && filtered.length === 0) {
    filtered = data.filter(item => itemMatchesTerm(item, term));
    searchExpanded = filtered.length > 0;
  }

  return filtered.sort((a, b) => {
    if (term) {
      return relevanceScore(b, term) - relevanceScore(a, term)
        || ratingFor(b) - ratingFor(a)
        || a.name.localeCompare(b.name);
    }
    if (sort.value === "name") return a.name.localeCompare(b.name);
    if (sort.value === "category") return a.category.localeCompare(b.category) || ratingFor(b) - ratingFor(a);
    return ratingFor(b) - ratingFor(a) || a.name.localeCompare(b.name);
  });
}

function tagClass(tag) {
  if (tag === "免费" || tag === "官方") return "good";
  if (tag.includes("国际") || tag.includes("付费")) return "warn";
  return "";
}

function renderSummary(items) {
  const term = (search.value || "").trim();
  const scope = active === "全部" ? "全部资源" : active;
  const view = quickOptions.find(option => option.id === quickActive)?.label || "全部结果";
  const query = term ? `，关键词“${term}”` : "";
  const ranking = quickActive === "recommended" ? "，按编辑推荐指数排序" : "";
  const expanded = searchExpanded ? "，已自动扩大到全部资源" : "";
  summary.textContent = `找到 ${items.length} 个结果，范围：${scope}，条件：${view}${query}${ranking}${expanded}。`;
}

function renderList() {
  const items = visibleItems();
  renderSummary(items);
  list.innerHTML = items.length ? items.map((item, index) => {
    const rating = ratingFor(item);
    const id = data.indexOf(item);
    return `
      <article class="resource result-card" role="button" tabindex="0" data-resource-id="${id}" aria-label="查看 ${item.name} 详情">
        <div class="rank">#${index + 1}</div>
        <div class="result-body">
          <div class="resource-title">
            <span>${item.name}</span>
          </div>
          <div class="rating-row">
            <span class="rating-label">编辑推荐</span>
            <span class="stars" aria-hidden="true">${starsFor(rating)}</span>
            <strong>${rating.toFixed(1)}</strong>
            <span>${item.category}</span>
          </div>
          <div class="editor-note"><b>站长点评</b><span>${editorNote(item)}</span></div>
        </div>
        <a class="visit" href="${item.url}" target="_blank" rel="noopener">访问官网</a>
      </article>
    `;
  }).join("") : `<div class="empty">暂时没有足够相关的资源。</div>`;
}

function openDetail(item) {
  const rating = ratingFor(item);
  detailContent.innerHTML = `
    <div class="detail-head">
      <div class="rank detail-rank">${item.initials}</div>
      <div>
        <h2>${item.name}</h2>
        <div class="rating-row">
          <span class="rating-label">编辑推荐</span>
          <strong>${rating.toFixed(1)}</strong>
          <span>${item.category}</span>
        </div>
      </div>
    </div>
    <div class="detail-hero-grid detail-hero-compact">
      <div class="detail-meta-card">
        <div><span>推荐指数</span><b>${starsFor(rating)} ${rating.toFixed(1)}</b></div>
        <div><span>适合场景</span><b>${bestScenario(item)}</b></div>
        <div><span>访问提醒</span><b>${item.access} · ${loginNote(item)}</b></div>
      </div>
    </div>
    <div class="detail-content-grid">
      <div class="detail-stack">
        <div class="detail-section"><b>站长点评</b><p>${editorNote(item)}</p></div>
        <div class="detail-section"><b>建议使用步骤</b><ol>${useSteps(item).map(step => `<li>${step}</li>`).join("")}</ol></div>
        <div class="detail-section"><b>使用前检查</b><ul class="detail-checklist">${detailChecklist(item).map(step => `<li>${step}</li>`).join("")}</ul></div>
      </div>
      <div>
        <div class="detail-section"><b>登录和费用</b><p>${loginNote(item)}</p></div>
        <div class="detail-note-strip">本站只做资源入口整理、分类、点评和跳转，不存储或分发第三方资源文件。</div>
        <a class="button detail-visit" href="${item.url}" target="_blank" rel="noopener">访问官网</a>
      </div>
    </div>
  `;
  detailPanel.hidden = false;
  document.body.classList.add("detail-open");
}

function closeDetail() {
  detailPanel.hidden = true;
  document.body.classList.remove("detail-open");
}

function syncUrl() {
  const next = new URLSearchParams();
  const term = (search.value || "").trim();
  if (term) next.set("q", term);
  if (active !== "全部") next.set("category", active);
  if (quickActive !== "all") next.set("view", quickActive);
  const query = next.toString();
  history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}

filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  active = button.dataset.category;
  renderFilters();
  renderList();
  syncUrl();
});

search.addEventListener("input", () => {
  renderList();
  syncUrl();
});

quickFilters.addEventListener("click", event => {
  const button = event.target.closest("[data-view]");
  if (!button) return;
  quickActive = button.dataset.view;
  if (quickActive === "recommended") {
    sort.value = "rating";
  }
  renderQuickFilters();
  renderList();
  syncUrl();
});

sort.addEventListener("change", renderList);
list.addEventListener("click", event => {
  if (event.target.closest("a")) return;
  const card = event.target.closest("[data-resource-id]");
  if (!card) return;
  openDetail(data[Number(card.dataset.resourceId)]);
});

list.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest("[data-resource-id]");
  if (!card) return;
  event.preventDefault();
  openDetail(data[Number(card.dataset.resourceId)]);
});

closeDetailButtons.forEach(button => button.addEventListener("click", closeDetail));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !detailPanel.hidden) closeDetail();
});
renderFilters();
renderQuickFilters();
renderList();
