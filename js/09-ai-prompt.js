/* ==================== AI PROMPT BUILDER'LARI ==================== */

/* Türkçe veya İngilizce, Markdown formatında, başlangıç dostu, detaylı rehber ister.
   Mevcut currentLang'a göre prompt dili otomatik seçilir. */
function buildAIPromptTR(cat, f) {
  const title = stripHtml(tx(f.title));
  const desc = stripHtml(tx(f.desc));
  const catTitle = stripHtml(tx(cat.title));
  const catSub = stripHtml(tx(cat.sub || ""));
  const mvpRaw = resolveLevelText(f, "mvp");
  const releaseRaw = resolveLevelText(f, "release");
  const isPlaceholder = (s) => !s || (typeof s === "string" && s.trim() === "—");
  const mvpStripped = !isPlaceholder(mvpRaw) ? stripHtml(mvpRaw) : "";
  const releaseStripped = !isPlaceholder(releaseRaw) ? stripHtml(releaseRaw) : "";
  const mvp = mvpStripped || null;
  const release = releaseStripped || null;
  const fwName = (currentFramework && FRAMEWORK_META[currentFramework])
    ? FRAMEWORK_META[currentFramework].aiName
    : "Flutter / Dart";
  /* Backend bilgilerini bağlamı belirleyici biçimde derle. f.backendStep ise
     install örneği backend SDK'sından üretilir (örn. firebase + flutter →
     "flutterfire configure && flutter pub add firebase_*"); aksi halde framework
     için genel paket install örneği (eski davranış). */
  const beMeta = (currentBackend && BACKEND_META[currentBackend]) ? BACKEND_META[currentBackend] : null;
  const beName = beMeta ? beMeta.aiName : null;
  const isBackendStep = !!f.backendStep;
  const beInstallNode = (isBackendStep && currentBackend && BACKEND_INSTALL_EXAMPLES[currentBackend])
    ? BACKEND_INSTALL_EXAMPLES[currentBackend][currentFramework]
    : null;
  const installExample = tx(beInstallNode) || tx(INSTALL_EXAMPLES[currentFramework]) || tx(INSTALL_EXAMPLES.flutter);
  const isPwa = currentFramework === "pwa";

  let p = "";
  if (currentLang === "en") {
    p += `# Mobile App Quality Checklist Item Help\n\n`;
    p += isPwa
      ? `Hi! I'm building a Progressive Web App. I want to implement the quality-checklist item below in my app. I need a **practical and clear guide** that a beginner can follow.\n\n`
      : `Hi! I'm building a mobile app. I want to implement the quality-checklist item below in my app. I need a **practical and clear guide** that a beginner can follow.\n\n`;

    p += `## 📌 Item Information\n\n`;
    p += `- **Category:** ${catTitle}${catSub ? ` (${catSub})` : ""}\n`;
    p += `- **Item Title:** ${title}\n`;
    p += `- **General Description:** ${desc}\n\n`;

    if (mvp || release) {
      p += `## 🎯 Levels I'm Targeting\n\n`;
      if (mvp) {
        p += `### 🟢 MVP, Must-Have (My First Goal)\n${mvp}\n\n`;
      }
      if (release) {
        p += `### 🔵 Release, Store-Ready Professional Quality (My Second Goal)\n${release}\n\n`;
      }
    }

    p += `## 🛠️ What I Need From You\n\n`;
    p += `Please fill in the following sections **in this order** and **with this structure**:\n\n`;

    p += `### 1. Concept and Importance\n`;
    p += `- What exactly does this item solve, why is it important?\n`;
    p += `- What problems will I face if I skip it? In which real-world scenario is it critical?\n\n`;

    p += `### 2. Step-by-Step Implementation${mvp ? " (MVP Level)" : ""}\n`;
    p += `- Summarize each step in one sentence, then expand on the details.\n`;
    p += `- State which package / SDK / service I'll use.\n`;
    p += `- Share full install commands (e.g. \`${installExample}\`).\n`;
    p += `- Tell me which files to create and where.\n\n`;

    p += `### 3. Working Code Example\n`;
    p += `- Provide actual copy-paste runnable code.\n`;
    p += `- Add **English comments** in the code (explain each important line).\n`;
    p += `- If multiple files are needed, show each as a separate code block with the file name as the header.\n\n`;

    p += `### 4. Common Mistakes and Pitfalls\n`;
    p += `- The **2-3 typical mistakes** or pitfalls a beginner falls into.\n`;
    p += `- How to avoid each — what NOT to do.\n\n`;

    if (mvp && release) {
      p += `### 5. Upgrading to Release Level\n`;
      p += `- After finishing MVP, what should I **additionally** do to reach Release?\n`;
      p += `- Which configs, security checks, or UX improvements should be added?\n\n`;
    }

    p += `### ${mvp && release ? "6" : "5"}. Verification and Testing\n`;
    p += `- How do I test that this item is successfully complete?\n`;
    p += `- Which scenarios (e.g. "no internet", "missing API key") should I try?\n\n`;

    p += `### ${mvp && release ? "7" : "6"}. Additional Recommendations (Optional)\n`;
    p += `- Other quality items related to this one.\n`;
    p += `- Further reading (official docs, quality blog posts).\n`;
    p += `- More advanced alternative approaches.\n\n`;

    const targetPlatform = currentFramework === "swift" ? "iOS"
                          : currentFramework === "kotlin" ? "Android"
                          : currentFramework === "pwa" ? "Web (mobile browsers + desktop, installable PWA, optionally Play Store via TWA)"
                          : "Android + iOS";
    p += `## 📦 Project Information\n\n`;
    p += `- **Framework:** ${fwName}.\n`;
    if (beName) p += `- **Backend:** ${beName}.\n`;
    p += `- **IDE:** AI-assisted IDE (Antigravity / Cursor / VS Code Copilot / Xcode 16 Predictive Code Completion).\n`;
    p += `- **Target Platform:** ${targetPlatform}.\n`;
    p += `- **Response Language:** **English**.\n`;
    p += `- **Format:** Markdown, with code blocks.\n\n`;

    p += `## 🎓 Important Notes\n\n`;
    p += `- Keep your answer **clear, simple and practical**. Don't dive into unnecessary theory.\n`;
    p += `- Avoid heavy jargon; if used, briefly explain it in parentheses.\n`;
    p += `- Walk through the steps in order; pretend I know nothing.\n`;
    p += `- If there are **multiple approaches** to implement this item, start with the most common and simple one.\n\n`;
    p += `Let's begin so I can mark this item complete when I'm done!`;
    return p;
  }

  // Default: Turkish
  p += `# Mobil Uygulama Kalite Kontrol Maddesi Yardımı\n\n`;
  p += isPwa
    ? `Merhaba! Bir Progressive Web App geliştiriyorum. Aşağıdaki kalite kontrol maddesini uygulamamda hayata geçirmek istiyorum. Senden, yeni başlayan birinin takip edebileceği, **uygulanabilir ve net bir rehber** istiyorum.\n\n`
    : `Merhaba! Bir mobil uygulama geliştiriyorum. Aşağıdaki kalite kontrol maddesini uygulamamda hayata geçirmek istiyorum. Senden, yeni başlayan birinin takip edebileceği, **uygulanabilir ve net bir rehber** istiyorum.\n\n`;

  p += `## 📌 Madde Bilgileri\n\n`;
  p += `- **Kategori:** ${catTitle}${catSub ? ` (${catSub})` : ""}\n`;
  p += `- **Madde Başlığı:** ${title}\n`;
  p += `- **Genel Açıklama:** ${desc}\n\n`;

  if (mvp || release) {
    p += `## 🎯 Hedeflediğim Seviyeler\n\n`;
    if (mvp) {
      p += `### 🟢 MVP, Olmazsa Olmaz (İlk Hedefim)\n${mvp}\n\n`;
    }
    if (release) {
      p += `### 🔵 Release, Yayınlanabilir Profesyonel Kalite (İkinci Hedefim)\n${release}\n\n`;
    }
  }

  p += `## 🛠️ Senden İhtiyacım Olan Cevap\n\n`;
  p += `Lütfen aşağıdaki başlıkları **bu sırayla** ve **bu yapıda** doldur:\n\n`;

  p += `### 1. Konsept ve Önem\n`;
  p += `- Bu madde tam olarak ne işe yarıyor, neden önemli?\n`;
  p += `- Atlanırsa hangi sorunlarla karşılaşırım? Gerçek hayatta hangi senaryoda kritiktir?\n\n`;

  p += `### 2. Adım Adım Uygulama${mvp ? " (MVP Seviyesi)" : ""}\n`;
  p += `- Her adımı önce tek cümleyle özetle, sonra detayını ver.\n`;
  p += `- Hangi paket / SDK / servisi kullanacağımı belirt.\n`;
  p += `- Tam kurulum komutlarını paylaş (örn: \`${installExample}\`).\n`;
  p += `- Hangi dosyaları nerede oluşturacağımı söyle.\n\n`;

  p += `### 3. Çalışan Kod Örneği\n`;
  p += `- Kopyala-yapıştır olabilecek, gerçekten çalışan kod ver.\n`;
  p += `- Kod içine **Türkçe yorum satırları** ekle (her önemli satırı açıkla).\n`;
  p += `- Birden fazla dosya gerekirse her birini ayrı kod bloğu olarak göster ve dosya adını başlığında belirt.\n\n`;

  p += `### 4. Sık Yapılan Hatalar ve Tuzaklar\n`;
  p += `- Yeni başlayan birinin düşeceği **2-3 tipik hata** veya tuzak.\n`;
  p += `- Her birinden nasıl kaçınılır, ne yapılırsa olmaz?\n\n`;

  if (mvp && release) {
    p += `### 5. Release Seviyesine Yükseltme\n`;
    p += `- MVP'yi bitirdikten sonra Release seviyesine geçmek için **ek olarak** ne yapmalıyım?\n`;
    p += `- Hangi konfigürasyonlar, güvenlik kontrolleri veya UX iyileştirmeleri eklenmeli?\n\n`;
  }

  p += `### ${mvp && release ? "6" : "5"}. Doğrulama ve Test\n`;
  p += `- Bu maddenin başarıyla tamamlandığını nasıl test ederim?\n`;
  p += `- Hangi senaryoları (örn. "internet yokken", "API key boşken") denemeliyim?\n\n`;

  p += `### ${mvp && release ? "7" : "6"}. Ek Öneriler (Opsiyonel)\n`;
  p += `- Bu maddeyle bağlantılı diğer önemli kalite kontrolleri.\n`;
  p += `- İleri okuma kaynakları (resmi dokümantasyon, kaliteli blog yazıları).\n`;
  p += `- Daha gelişmiş alternatif yaklaşımlar.\n\n`;

  const targetPlatform = currentFramework === "swift" ? "iOS"
                        : currentFramework === "kotlin" ? "Android"
                        : currentFramework === "pwa" ? "Web (mobil tarayıcı + masaüstü, kurulabilir PWA, opsiyonel TWA ile Play Store)"
                        : "Android + iOS";
  p += `## 📦 Proje Bilgileri\n\n`;
  p += `- **Framework:** ${fwName}.\n`;
  if (beName) p += `- **Backend:** ${beName}.\n`;
  p += `- **IDE:** Yapay zekâ destekli IDE (Antigravity / Cursor / VS Code Copilot / Xcode 16 Predictive Code Completion).\n`;
  p += `- **Hedef Platform:** ${targetPlatform}.\n`;
  p += `- **Cevap Dili:** **Türkçe**.\n`;
  p += `- **Format:** Markdown, kod blokları içinde.\n\n`;

  p += `## 🎓 Önemli Notlar\n\n`;
  p += `- Cevabın **net, sade ve uygulanabilir** olsun. Gereksiz teorik detaya girme.\n`;
  p += `- Çok fazla teknik jargon kullanma; kullanırsan parantez içinde Türkçesini yaz.\n`;
  p += `- Adımları sırayla anlat, ben hiç tanımıyormuş gibi davran.\n`;
  p += `- Eğer bu maddeyi uygulamak için **birden fazla yaklaşım** varsa, en yaygın ve basit olanıyla başla.\n\n`;
  p += `Hadi başlayalım, bu maddeyi uygulamayı bitirdiğimde işaretleyebileyim!`;

  return p;
}

/* İngilizce, Yapılandırılmış JSON formatı, AI'ın tutarlı çıktı vermesi için */
function buildAIPromptJSON(cat, f) {
  const mvpRaw = resolveLevelText(f, "mvp");
  const releaseRaw = resolveLevelText(f, "release");
  const isPlaceholder = (s) => !s || (typeof s === "string" && s.trim() === "—");
  const mvpStripped = !isPlaceholder(mvpRaw) ? stripHtml(mvpRaw) : "";
  const releaseStripped = !isPlaceholder(releaseRaw) ? stripHtml(releaseRaw) : "";
  const mvp = mvpStripped || null;
  const release = releaseStripped || null;
  const fwName = (currentFramework && FRAMEWORK_META[currentFramework])
    ? FRAMEWORK_META[currentFramework].aiName
    : "Flutter / Dart";
  /* Backend-aware install command + setup assumption; backendStep değilse eski
     framework-only davranış. */
  const beMeta = (currentBackend && BACKEND_META[currentBackend]) ? BACKEND_META[currentBackend] : null;
  const beName = beMeta ? beMeta.aiName : null;
  const isBackendStep = !!f.backendStep;
  const beInstallNode = (isBackendStep && currentBackend && BACKEND_INSTALL_EXAMPLES[currentBackend])
    ? BACKEND_INSTALL_EXAMPLES[currentBackend][currentFramework]
    : null;
  const installExample = tx(beInstallNode) || tx(INSTALL_EXAMPLES[currentFramework]) || tx(INSTALL_EXAMPLES.flutter);
  const setupAssumption = SETUP_ASSUMPTIONS[currentFramework] || SETUP_ASSUMPTIONS.flutter;
  const backendAssumption = (currentBackend && BACKEND_SETUP_ASSUMPTIONS[currentBackend]) ? BACKEND_SETUP_ASSUMPTIONS[currentBackend] : null;
  const isEn = currentLang === "en";
  const isPwa = currentFramework === "pwa";
  const responseLanguage = isEn ? "English" : "Turkish";

  const item = {
    category: stripHtml(tx(cat.title)),
    title: stripHtml(tx(f.title)),
    description: stripHtml(tx(f.desc))
  };
  const sub = stripHtml(tx(cat.sub || ""));
  if (sub) item.category_subtitle = sub;
  if (mvp) {
    item.mvp_level = {
      label: "Minimum Viable Product",
      priority: "must_have",
      requirements: mvp
    };
  }
  if (release) {
    item.release_level = {
      label: "Release-quality, professional",
      priority: "should_have",
      description: isPwa
        ? "Required to deploy publicly to production with confidence (HTTPS host; optionally store-packaged via PWABuilder/Bubblewrap)"
        : "Required to publish to App Store / Play Store with confidence",
      requirements: release
    };
  }

  const payload = {
    role_and_tone: {
      assistant_role: "Expert mobile app development mentor for beginners",
      audience: isPwa
        ? "Web app developer building a mobile-friendly PWA (beginner level)"
        : "Mobile app developer (beginner level)",
      tone: "Practical, beginner-friendly, encouraging, no unnecessary jargon",
      response_language: responseLanguage,
      response_format: `Markdown with code blocks; ${isEn ? "English" : "Turkish"} comments inside code`
    },
    project_context: {
      framework: fwName,
      backend: beName || "Not selected (treat as framework-agnostic)",
      ide: "AI-assisted IDE (Antigravity / Cursor / VS Code with Copilot / Xcode 16 Predictive Code Completion)",
      target_platforms: currentFramework === "swift" ? ["iOS"]
                       : currentFramework === "kotlin" ? ["Android"]
                       : currentFramework === "pwa" ? ["Web (mobile + desktop browsers)", "Installable PWA", "Optionally store-packaged via TWA / PWABuilder"]
                       : ["Android", "iOS"],
      developer_level: "beginner"
    },
    quality_checklist_item: item,
    expected_response_structure: [
      {
        section: "1_concept_and_importance",
        title: isEn ? "Concept and Importance" : "Konsept ve Önem",
        instructions: "Explain WHY this item matters, what real-world problems it prevents, and what happens if skipped"
      },
      {
        section: "2_step_by_step_implementation",
        title: (isEn ? "Step-by-Step Implementation" : "Adım Adım Uygulama") + (mvp ? " (MVP)" : ""),
        instructions: `Numbered steps. Each step: one-sentence summary, then details. Include exact package/SDK names and install commands (e.g. \`${installExample}\`). Specify file locations.`
      },
      {
        section: "3_working_code_example",
        title: isEn ? "Working Code Example" : "Çalışan Kod Örneği",
        instructions: `Copy-paste-ready code with ${isEn ? "ENGLISH" : "TURKISH"} inline comments. If multiple files needed, separate code blocks with file name as header.`
      },
      {
        section: "4_common_pitfalls",
        title: isEn ? "Common Pitfalls" : "Sık Yapılan Hatalar",
        instructions: "List 2-3 typical beginner mistakes and how to avoid each"
      },
      (mvp && release) ? {
        section: "5_upgrade_to_release",
        title: isEn ? "Upgrading to Release Level" : "Release Seviyesine Yükseltme",
        instructions: "What additional steps move from MVP to Release: configs, security, UX polish"
      } : null,
      {
        section: (mvp && release) ? "6_verification" : "5_verification",
        title: isEn ? "Verification and Testing" : "Doğrulama ve Test",
        instructions: "How to verify the implementation works. Edge case scenarios to test (e.g. offline, missing API key, slow network)"
      },
      {
        section: (mvp && release) ? "7_additional_recommendations" : "6_additional_recommendations",
        title: isEn ? "Additional Recommendations" : "Ek Öneriler",
        instructions: "Related quality checklist items, official docs, alternative approaches (optional, brief)"
      }
    ].filter(Boolean),
    constraints: [
      `Respond entirely in ${responseLanguage}`,
      "Use Markdown H2 headings whose text matches each `expected_response_structure[].title`",
      "Provide working code that the developer can copy and run immediately",
      `Avoid unnecessary jargon; if a technical term must be used, give a brief ${responseLanguage} explanation in parentheses`,
      setupAssumption,
      /* Backend tabanlı maddelerde backend SDK varsayımını da ilet; backend
         olmayan maddelerde bunu eklemek konuyu dağıtır, atla. */
      ...(isBackendStep && backendAssumption ? [backendAssumption] : []),
      "Keep total response focused, quality over length",
      `Do not output the JSON back; respond as a structured ${responseLanguage} guide`
    ],
    final_instruction: `Now produce the implementation guide following the expected_response_structure exactly. Begin your response in ${responseLanguage}.`
  };

  return "```json\n" + JSON.stringify(payload, null, 2) + "\n```";
}

