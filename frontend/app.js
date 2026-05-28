const $ = (id) => document.getElementById(id);
let currentPackage = null;
const refs = { product: [], face: [], outfit: [], style: [] };

const scenePresets = [
  "เคาน์เตอร์ห้องน้ำสะอาด", "ซิงก์ล้างหน้าแสงเช้า", "โต๊ะเครื่องแป้งแสงเช้า",
  "โรงงานกำลังแพ็กสินค้า", "สายพานการผลิต", "สินค้าวางบนไลน์ผลิตที่เสร็จแล้ว", "โกดังคลังสินค้า",
  "พื้นที่แพ็กออเดอร์", "ฉากหลังพนักงานเดินไปมา", "มุมถือสินค้าจากโรงงานแบบไม่เห็นหน้า",
  "ฟิตเนส", "สวนสาธารณะ", "ห้องทำงานมินิมอล", "ห้องครัวสะอาด", "คาเฟ่พรีเมียม", "สตูดิโอสินค้าแสงสะอาด"
];

const categoryRules = [
  { category: "ช่องปาก / ยาสีฟัน", words: ["ยาสีฟัน", "ฟัน", "ช่องปาก", "ปาก", "ลมหายใจ", "เหงือก", "สมุนไพร", "เสียวฟัน", "แปรงฟัน", "ฟันขาว"], proof: "เนื้อยาสีฟัน สี กลิ่นสมุนไพร ความสะอาดหลังแปรง ลมหายใจสดชื่น และแพ็กเกจที่ดูน่าเชื่อถือ", scenes: ["เคาน์เตอร์ห้องน้ำสะอาด", "ซิงก์ล้างหน้าแสงเช้า", "สตูดิโอสินค้าแสงสะอาด"], action: "ให้เห็นหลอดยาสีฟัน แปรงสีฟัน เนื้อยาสีฟัน และบรรยากาศช่องปากสะอาดสดชื่น" },
  { category: "แฟชั่น / เสื้อผ้า", words: ["เสื้อ", "กางเกง", "เดรส", "ผ้า", "ชุด", "แฟชั่น", "ใส่", "ไซซ์"], proof: "ทรงผ้า เนื้อผ้า สีจริง การทิ้งตัว รอยเย็บ ฟิตบนตัวนางแบบ", scenes: ["คาเฟ่พรีเมียม", "ห้องทำงานมินิมอล", "สตูดิโอสินค้าแสงสะอาด"], action: "ให้นางแบบสวมใส่สินค้าหรือถือชุดให้เห็นทรงชัด" },
  { category: "บิวตี้ / สกินแคร์", words: ["ครีม", "เซรั่ม", "ผิว", "หน้า", "กันแดด", "โกลว์", "สิว", "บำรุง"], proof: "เนื้อสัมผัส ความโกลว์ การซึม ผิวหลังใช้ และแพ็กเกจ", scenes: ["โต๊ะเครื่องแป้งแสงเช้า", "สตูดิโอสินค้าแสงสะอาด"], action: "ให้เห็นมือแตะเนื้อผลิตภัณฑ์หรือถือสินค้าใกล้ใบหน้า" },
  { category: "สุขภาพ / ฟิตเนส", words: ["สุขภาพ", "ฟิต", "ออกกำลัง", "โปรตีน", "หุ่น", "กล้าม", "โยคะ"], proof: "การใช้งานจริง ความคล่องตัว พลังงาน ความสะดวกใน routine", scenes: ["ฟิตเนส", "สวนสาธารณะ"], action: "ให้เห็นสถานการณ์ใช้งานจริงในกิจกรรมสุขภาพ" },
  { category: "อาหาร / เครื่องดื่ม", words: ["อาหาร", "ขนม", "กาแฟ", "ชา", "น้ำ", "เครื่องดื่ม", "รส", "อร่อย"], proof: "เนื้อสัมผัส การเสิร์ฟ แพ็กเกจ สี กลิ่น และปฏิกิริยาหลังชิม", scenes: ["ห้องครัวสะอาด", "คาเฟ่พรีเมียม"], action: "ให้เห็นการหยิบ เสิร์ฟ หรือชิมอย่างเป็นธรรมชาติ" },
  { category: "ของใช้ในบ้าน", words: ["บ้าน", "ครัว", "ห้อง", "จัดเก็บ", "ทำความสะอาด", "เครื่องใช้"], proof: "ก่อน-หลังใช้ ความเป็นระเบียบ ประหยัดพื้นที่ และการใช้งานจริง", scenes: ["ห้องครัวสะอาด", "ห้องทำงานมินิมอล"], action: "ให้เห็นการใช้งานจริงและผลลัพธ์ในบ้าน" },
  { category: "แกดเจ็ต / อุปกรณ์ไอที", words: ["ชาร์จ", "มือถือ", "ไฟ", "จอ", "กล้อง", "ลำโพง", "แกดเจ็ต", "USB"], proof: "พอร์ต ปุ่ม หน้าจอ วิธีใช้ ความสะดวก และก่อน-หลังใช้งาน", scenes: ["ห้องทำงานมินิมอล", "สตูดิโอสินค้าแสงสะอาด"], action: "ให้เห็นมือสาธิตการใช้งานแบบเข้าใจใน 1 วินาที" },
  { category: "คอร์ส / บริการ / ดิจิทัลโปรดักต์", words: ["คอร์ส", "เรียน", "บริการ", "ระบบ", "โปรแกรม", "AI", "ไฟล์", "ดิจิทัล"], proof: "หน้าจอตัวอย่าง workflow ผลลัพธ์ก่อน-หลัง และความง่ายในการใช้งาน", scenes: ["ห้องทำงานมินิมอล", "โรงงานกำลังแพ็กสินค้า"], action: "ให้เห็นหน้าจอหรือ workflow ที่สื่อว่าทำงานง่ายขึ้น" },
  { category: "กำหนดเอง", words: [], proof: "รายละเอียดสินค้า จุดขายจริง แพ็กเกจ และองค์ประกอบที่ช่วยให้ลูกค้าตัดสินใจง่าย", scenes: ["สตูดิโอสินค้าแสงสะอาด"], action: "ให้สินค้าเป็นพระเอกของภาพ และจัดวางให้เห็นรายละเอียดสำคัญชัดเจน" },
];

const shotBlueprints = [
  { id: "SHOT_01", title: "เปิดปัญหาให้หยุดดู", purpose: "ทำให้คนรู้สึกว่าใช่ปัญหาของเขา", camera: "close-up หรือ medium close-up, มือถือแนวตั้ง, slow push-in", motion: "กล้องค่อย ๆ push-in และมี movement เล็กน้อยที่สินค้า/มือ/แสง" },
  { id: "SHOT_02", title: "โชว์สินค้าแบบ Hero", purpose: "ให้เห็นสินค้าและจุดขายชัดที่สุด", camera: "product hero shot, clean framing, soft commercial lighting", motion: "หมุนหรือเลื่อนกล้องรอบสินค้าเบา ๆ ให้เห็นแพ็กเกจ/ทรง/สี" },
  { id: "SHOT_03", title: "สาธิตการใช้จริง", purpose: "ทำให้ลูกค้าเห็นภาพการใช้งาน", camera: "natural UGC handheld, medium shot, เห็นมือหรือนางแบบ", motion: "ให้คนในภาพหยิบ ใช้ ใส่ ถือ หรือสาธิตสินค้าอย่างเป็นธรรมชาติ" },
  { id: "SHOT_04", title: "Proof Detail / ปิดการขาย", purpose: "โชว์หลักฐานสำคัญและปิดด้วยภาพน่าเชื่อถือ", camera: "macro detail + stable packshot", motion: "เริ่มจาก detail แล้วค่อยจบที่ภาพสินค้าชัดเจน" },
  { id: "SHOT_05", title: "Factory Presenter", purpose: "โชว์สินค้าจากแหล่งผลิตจริง ให้ดูน่าเชื่อถือ", camera: "hand-held product presenter, factory background, medium close-up", motion: "มือยื่นสินค้าเข้ากล้อง พนักงานหรือสายพานด้านหลังเคลื่อนไหวเบา ๆ" },
  { id: "SHOT_06", title: "Conveyor Proof", purpose: "เห็นสินค้าที่ผลิตเสร็จแล้วบนไลน์หรือโต๊ะแพ็ก", camera: "wide-to-medium factory conveyor shot, clean industrial framing", motion: "กล้อง pan ช้า ๆ ผ่านสินค้าในไลน์ผลิตหรือพื้นที่แพ็ก" },
  { id: "SHOT_07", title: "Warehouse Routine", purpose: "วางสินค้าในบริบทโกดังหรือการจัดส่งจริง", camera: "warehouse lifestyle shot, realistic UGC/commercial blend", motion: "พนักงานเดินผ่านเบา ๆ หรือหยิบสินค้าจากชั้น/กล่อง" },
  { id: "SHOT_08", title: "CTA Packshot", purpose: "ปิดด้วยภาพสินค้าที่จำง่าย", camera: "stable packshot, centered composition", motion: "ค่อย ๆ push-in จบที่สินค้าเด่นชัด" },
];

function lines(value){ return String(value || "").split(/\r?\n/).map(v=>v.trim()).filter(Boolean); }
function clean(value){ return String(value || "").trim(); }
function selectedOptionText(id){ const el=$(id); return el?.options?.[el.selectedIndex]?.text || el?.value || ""; }
function detectCategory(detail, selected){
  if (selected === "custom") {
    const custom = clean($("customCategory").value) || "กำหนดเอง";
    return { ...categoryRules[categoryRules.length - 1], category: custom };
  }
  if (selected && selected !== "auto") return categoryRules.find(r=>r.category===selected) || categoryRules[categoryRules.length - 1];
  const hay = detail.toLowerCase();
  let best = categoryRules[0], score = -1;
  categoryRules.filter(r=>r.category!=="กำหนดเอง").forEach(rule => {
    const s = rule.words.reduce((n,w)=> n + (hay.includes(w.toLowerCase()) ? 1 : 0), 0);
    if (s > score){ score=s; best=rule; }
  });
  return best;
}
function sceneIsFactory(scene){ return /โรงงาน|สายพาน|ไลน์ผลิต|โกดัง|คลังสินค้า|แพ็ก|พนักงาน/.test(scene || ""); }
function buildAnalysis(){
  const productName = clean($("productName").value) || "สินค้า";
  const detail = clean($("productDetail").value);
  const rule = detectCategory(`${productName} ${detail}`, $("category").value);
  const sceneValue = $("scenePreset").value;
  const scene = sceneValue === "custom" ? (clean($("customScene").value) || "ฉากตามที่ผู้ใช้กำหนด") : (sceneValue === "auto" ? rule.scenes[0] : sceneValue);
  const benefits = inferBenefits(detail, rule.category);
  const pain = inferPain(detail, rule.category);
  return {
    productName, detail, category: rule.category, proof: rule.proof, scene,
    action: sceneIsFactory(scene) ? factoryAction() : rule.action,
    benefits, pain,
    style: $("stylePreset").value,
    presenterMode: $("presenterMode").value,
    aspectRatio: $("aspectRatio").value,
    profileStill: $("profileStill").value,
    profileMotion: $("profileMotion").value,
    shotCount: Number($("shotCount").value),
    isFactory: sceneIsFactory(scene) || $("stylePreset").value.includes("Factory")
  };
}
function factoryAction(){
  return "ให้เห็นสินค้าชัดเจนในมือหรือบนสายพาน ฉากหลังเป็นโรงงาน/โกดัง/พื้นที่แพ็ก มีสินค้าในไลน์ผลิตหรือพนักงานเคลื่อนไหวอย่างเป็นธรรมชาติ";
}
function inferBenefits(detail, category){
  const d = detail || "ใช้งานง่าย เห็นผลลัพธ์ชัด และเหมาะกับการใช้งานจริง";
  if (category.includes("แฟชั่น")) return `ใส่แล้วดูดีขึ้น เห็นทรงและเนื้อผ้าชัด: ${d}`;
  if (category.includes("บิวตี้")) return `ช่วยให้เห็น texture และความรู้สึกหลังใช้: ${d}`;
  if (category.includes("ช่องปาก") || category.includes("ยาสีฟัน")) return `สื่อความสะอาด ความสดชื่น และความน่าเชื่อถือของผลิตภัณฑ์: ${d}`;
  if (category.includes("สุขภาพ")) return `สื่อความคล่องตัวและ routine ที่ทำตามได้จริง: ${d}`;
  return d;
}
function inferPain(detail, category){
  if (category.includes("แฟชั่น")) return "ลูกค้ากังวลเรื่องใส่แล้วไม่ตรงปก ทรงไม่สวย สีเพี้ยน หรือเนื้อผ้าไม่เหมือนภาพ";
  if (category.includes("บิวตี้")) return "ลูกค้ากังวลเรื่องเนื้อสัมผัส ใช้จริงแล้วดูไม่ต่าง หรือแพ็กเกจไม่น่าเชื่อถือ";
  if (category.includes("ช่องปาก") || category.includes("ยาสีฟัน")) return "ลูกค้ากังวลว่ายาสีฟันจะไม่สดชื่นจริง รสแรงเกินไป ไม่เห็นเนื้อผลิตภัณฑ์ หรือแพ็กเกจดูไม่น่าเชื่อถือ";
  if (category.includes("อาหาร")) return "ลูกค้ากังวลเรื่องรสชาติ ความสดใหม่ ขนาดจริง และความน่ากิน";
  return "ลูกค้ากังวลว่าสินค้าจะไม่ตรงปก ใช้งานยาก หรือไม่เห็นประโยชน์จริง";
}
function attachmentsForStill(){ return []; }
function refNames(kind){ return refs[kind].map(x=>x.name).join("|"); }
function refSummary(){ return Object.entries(refs).map(([k,v])=> v.length ? `${k}:${v.map(x=>x.name).join("|")}` : "").filter(Boolean).join(", ") || "ไม่มีไฟล์ preview"; }
function corePromptKeywords(){ return "realistic commercial review, high detail, sharp focus, natural skin texture, clean composition, premium product detail, soft natural light, cinematic but believable, no text, no subtitle, no watermark"; }
function presenterRule(analysis){
  if (!analysis.isFactory) return "";
  if (analysis.presenterMode === "เห็นหน้าเมื่อมี REF คน") return "กรณีมีภาพอ้างอิงคน ให้ใช้ใบหน้าและบุคลิกตามภาพอ้างอิง กรณีไม่มีภาพคนให้เห็นเฉพาะมือหรือครึ่งตัวไม่เห็นหน้า";
  if (analysis.presenterMode === "ไม่เห็นหน้า / เห็นแค่มือ") return "เน้นมือถือสินค้า ไม่ต้องเห็นหน้า ให้ดูเหมือนพรีเซนต์จากโรงงานจริง";
  return "บางช็อตเห็นคนหรือพนักงานในฉากได้ แต่ต้องไม่แย่งความเด่นจากสินค้า";
}
function firstFramePrompt(shot, analysis){
  const factoryLines = analysis.isFactory ? [
    `โทนฉากโรงงาน/โกดัง: clean industrial environment, realistic factory presenter, สินค้าอยู่เด่นด้านหน้า`,
    `รายละเอียดโรงงาน: อาจเห็นสายพาน ไลน์ผลิต โต๊ะแพ็ก กล่องสินค้า หรือพนักงานเดินไปมาแบบ soft background`,
    presenterRule(analysis),
  ] : [];
  return [
    `สร้างภาพนิ่ง first frame สำหรับคลิปรีวิวสินค้า อัตราส่วน ${analysis.aspectRatio}`,
    `สินค้า: ${analysis.productName}`,
    `หมวดสินค้า: ${analysis.category}`,
    `รายละเอียด/สรรพคุณ: ${analysis.detail}`,
    `เป้าหมายของช็อต: ${shot.title} — ${shot.purpose}`,
    `ฉากหลัง: ${analysis.scene}`,
    `การจัดวาง/แอ็กชัน: ${analysis.action}`,
    `มุมกล้อง: ${shot.camera}`,
    `สไตล์ภาพ: ${analysis.style}`,
    ...factoryLines,
    `จุดขายที่ต้องสื่อ: ${analysis.benefits}`,
    `หลักฐานที่ควรเห็นในภาพ: ${analysis.proof}`,
    `ใช้ภาพอ้างอิงสินค้า/คน/ชุดที่แนบมาเพื่อรักษาทรง สี โลโก้ สัดส่วน ใบหน้า บุคลิก และรายละเอียดชุดให้ใกล้เคียงที่สุด`,
    `คีย์เวิร์ดคุณภาพภาพ: ${corePromptKeywords()}`,
    `ข้อห้าม: ห้ามมีตัวหนังสือในภาพ ห้าม subtitle ห้าม watermark ห้ามป้ายราคา ห้ามสร้างโลโก้ใหม่ ห้ามเปลี่ยนสี/ทรงสินค้า ห้ามนิ้วมือผิดรูป ห้ามหน้าเพี้ยน ห้ามชุดเปลี่ยนจากภาพอ้างอิง`,
  ].filter(Boolean).join("\n");
}
function motionPrompt(shot, analysis){
  const factoryMove = analysis.isFactory ? " มี movement เบา ๆ ของพนักงานด้านหลัง สินค้าบนสายพาน หรือกล่องแพ็กสินค้า โดยสินค้าหลักด้านหน้าต้องคงเดิม" : "";
  return [
    `เปลี่ยนภาพนิ่ง first frame นี้ให้เป็นวิดีโอรีวิวสินค้าแนวตั้ง ${analysis.aspectRatio}`,
    `ความยาวแนะนำ: 4-6 วินาที`,
    `สินค้า: ${analysis.productName}`,
    `เป้าหมายของ motion: ${shot.title}`,
    `การเคลื่อนไหวกล้อง: ${shot.motion}`,
    `ให้สินค้า ใบหน้า ชุด สี โลโก้ ฉาก และองค์ประกอบหลักคงเดิมจากภาพนิ่ง ห้ามเปลี่ยนเป็นคนละคนหรือคนละสินค้า`,
    `เพิ่ม movement แบบสมจริง เช่น แสงขยับเบา ๆ มือขยับเล็กน้อย ผ้าไหวเบา ๆ หรือ parallax ตามฉาก โดยไม่ทำให้ภาพบิดเบี้ยว${factoryMove}`,
    `อารมณ์วิดีโอ: รีวิวสินค้าน่าเชื่อถือ ดูขายได้จริง ไม่แฟนตาซีเกินไป`,
    `ข้อห้าม: ไม่มีตัวหนังสือ ไม่มี subtitle ไม่มี watermark ไม่มี transition รุนแรง ห้ามสินค้า/หน้า/ชุดเพี้ยน ห้ามเพิ่มวัตถุแปลกปลอม`,
  ].join("\n");
}
function buildPackage(){
  const analysis = buildAnalysis();
  const shots = shotBlueprints.slice(0, analysis.shotCount).map((shot, idx)=>({
    ...shot,
    stillPrompt: firstFramePrompt(shot, analysis),
    motionPrompt: motionPrompt(shot, analysis),
    stillAttachments: attachmentsForStill(),
    firstFramePath: "",
    delayStill: 150,
    delayMotion: analysis.profileMotion === "FLOW" ? 420 : 300,
  }));
  const caption = `${analysis.productName}\n${analysis.pain}\nจุดที่ควรดูคือ ${analysis.benefits}\nเหมาะกับคนที่อยากเห็นสินค้าจริงก่อนตัดสินใจ`;
  const hashtags = Array.from(new Set(["#รีวิวสินค้า", "#ของดีบอกต่อ", `#${analysis.productName.replace(/\s+/g,"")}`, "#TikTokShop", "#AIContent"])).join(" ");
  return { analysis, shots, caption, hashtags, refs: refSummary(), createdAt: new Date().toISOString() };
}
function renderAnalysis(a){
  $("analysisBox").innerHTML = [
    ["หมวดสินค้า", a.category], ["ฉากที่แนะนำ", a.scene], ["Pain Point", a.pain], ["จุดขายหลัก", a.benefits], ["Proof ที่ควรโชว์", a.proof], ["Action", a.action], ["Still Profile", a.profileStill], ["Motion Profile", a.profileMotion], ["REF Preview", refSummary()]
  ].map(([h,p])=>`<div class="chipbox"><h3>${escapeHtml(h)}</h3><p>${escapeHtml(p)}</p></div>`).join("");
}
function renderPackage(pkg){
  currentPackage = pkg; renderAnalysis(pkg.analysis); $("captionOutput").value = pkg.caption; $("hashtagsOutput").value = pkg.hashtags; $("statusPill").textContent = `${pkg.shots.length} ช็อตพร้อม export`;
  $("shotList").innerHTML = pkg.shots.map((shot, i)=>`<article class="shot-card"><div class="shot-head"><div><h3>${shot.id}: ${escapeHtml(shot.title)}</h3><p>${escapeHtml(shot.purpose)}</p></div><div class="mini-actions"><button data-copy="still" data-index="${i}">คัดลอกภาพนิ่ง</button><button data-copy="motion" data-index="${i}">คัดลอก Motion</button></div></div><div class="shot-body"><div class="fieldbox"><h4>First Frame Prompt</h4><textarea data-field="stillPrompt" data-index="${i}">${escapeHtml(shot.stillPrompt)}</textarea></div><div class="fieldbox"><h4>Motion Prompt</h4><textarea data-field="motionPrompt" data-index="${i}">${escapeHtml(shot.motionPrompt)}</textarea></div></div></article>`).join("");
}
function projectRows(pkg){ return pkg.shots.map((s, idx)=>({
  enabled:"yes", shot_order:idx+1, shot_id:s.id, shot_type:s.title, category_th:pkg.analysis.category,
  scene_preset:pkg.analysis.scene, scene_custom:"", style_preset:pkg.analysis.style, aspect_ratio:pkg.analysis.aspectRatio,
  profile_still:pkg.analysis.profileStill, profile_motion:pkg.analysis.profileMotion,
  still_prompt:s.stillPrompt, motion_prompt:s.motionPrompt,
  attachments:s.stillAttachments.join("|"), product_ref_names:refNames("product"), face_ref_names:refNames("face"), outfit_ref_names:refNames("outfit"), style_ref_names:refNames("style"),
  still_delay_sec:s.delayStill, motion_delay_sec:s.delayMotion,
  still_output_name:`${s.id}_FIRST.png`, first_frame_path:"", motion_output_name:`${s.id}_MOTION.mp4`,
  still_status:"pending", motion_status:"pending", notes:""
})); }
function stillRows(pkg){ return projectRows(pkg).map(r=>({profile:r.profile_still, job_type:"first_frame", shot_id:`${r.shot_id}_FIRST`, prompt:r.still_prompt, attachments:r.attachments, delay_sec:r.still_delay_sec, status:"pending", output_name:r.still_output_name})); }
function motionRows(pkg){ return projectRows(pkg).map(r=>({profile:r.profile_motion, job_type:"motion", shot_id:`${r.shot_id}_MOTION`, prompt:r.motion_prompt, attachments:r.first_frame_path || `C:\\outputs\\${r.still_output_name}`, delay_sec:r.motion_delay_sec, status:"pending", output_name:r.motion_output_name})); }
function csv(rows, fields){ const fs=fields || Object.keys(rows[0] || {}); return [fs.join(","),...rows.map(r=>fs.map(f=>csvEsc(r[f])).join(","))].join("\n"); }
function csvEsc(v){ const t=String(v??""); return /[",\n\r]/.test(t) ? `"${t.replace(/"/g,'""')}"` : t; }
function markdown(pkg){ return [`# Product Review Package: ${pkg.analysis.productName}`,``,`หมวดสินค้า: ${pkg.analysis.category}`,`ฉาก: ${pkg.analysis.scene}`,`REF Preview: ${pkg.refs}`,``,`## วิเคราะห์สินค้า`,pkg.analysis.pain,``,pkg.analysis.benefits,``,`## Shots`,...pkg.shots.map(s=>`### ${s.id}: ${s.title}\n\n#### First Frame\n${s.stillPrompt}\n\n#### Motion\n${s.motionPrompt}`),``,`## Caption`,pkg.caption,``,`## Hashtags`,pkg.hashtags].join("\n"); }
function download(name, content, type){ const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url); }
function ensure(){ if(!currentPackage) renderPackage(buildPackage()); return currentPackage; }
function escapeHtml(v){ return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function fileToUrl(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
async function handleFiles(kind, files){ const loaded = await Promise.all(Array.from(files||[]).map(async file=>({name:file.name, url: await fileToUrl(file)}))); refs[kind]=[...refs[kind],...loaded]; renderRefs(kind); renderPackage(buildPackage()); }
function renderRefs(kind){ const box=$(`${kind}Preview`); box.innerHTML = refs[kind].map(x=>`<span class="thumb"><img src="${x.url}" alt="${escapeHtml(x.name)}"><span>${escapeHtml(x.name)}</span></span>`).join(""); }
function syncCustomInputs(){
  $("customCategoryWrap").classList.toggle("is-hidden", $("category").value !== "custom");
  $("customSceneWrap").classList.toggle("is-hidden", $("scenePreset").value !== "custom");
}
["product","face","outfit","style"].forEach(k=>$( `${k}Refs`).addEventListener("change",e=>handleFiles(k,e.target.files)));
["category","scenePreset","stylePreset","presenterMode","profileStill","profileMotion","shotCount","aspectRatio"].forEach(id=>$(id).addEventListener("change",()=>{ syncCustomInputs(); renderPackage(buildPackage()); }));
["customCategory","customScene","productName","productDetail"].forEach(id=>$(id).addEventListener("input",()=>renderPackage(buildPackage())));
$("generateBtn").addEventListener("click",()=>renderPackage(buildPackage()));
$("downloadProjectCsvBtn").addEventListener("click",()=>download("project_queue.csv", csv(projectRows(ensure())), "text/csv;charset=utf-8"));
$("shotList").addEventListener("input", e=>{ if(!currentPackage || !e.target.matches("textarea[data-field]")) return; currentPackage.shots[Number(e.target.dataset.index)][e.target.dataset.field] = e.target.value; });
$("shotList").addEventListener("click", async e=>{ const b=e.target.closest("button[data-copy]"); if(!b) return; const s=ensure().shots[Number(b.dataset.index)]; await navigator.clipboard.writeText(b.dataset.copy==="still" ? s.stillPrompt : s.motionPrompt); $("statusPill").textContent="คัดลอกแล้ว"; setTimeout(()=>$("statusPill").textContent=`${ensure().shots.length} ช็อตพร้อม export`,900); });
syncCustomInputs();
renderPackage(buildPackage());
