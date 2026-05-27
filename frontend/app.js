const $ = (id) => document.getElementById(id);
let currentPackage = null;
const refs = { product: [], face: [], outfit: [], style: [] };

const categoryRules = [
  { category: "ช่องปาก / ยาสีฟัน", words: ["ยาสีฟัน", "ฟัน", "ช่องปาก", "ปาก", "ลมหายใจ", "เหงือก", "สมุนไพร", "เสียวฟัน", "แปรงฟัน", "ฟันขาว"], proof: "เนื้อยาสีฟัน สี กลิ่นสมุนไพร ความสะอาดหลังแปรง ลมหายใจสดชื่น และแพ็กเกจที่ดูน่าเชื่อถือ", scenes: ["เคาน์เตอร์ห้องน้ำสะอาด", "ซิงก์ล้างหน้าแสงเช้า", "สตูดิโอสินค้าแสงสะอาด"], action: "ให้เห็นหลอดยาสีฟัน แปรงสีฟัน เนื้อยาสีฟัน และบรรยากาศช่องปากสะอาดสดชื่น" },
  { category: "แฟชั่น / เสื้อผ้า", words: ["เสื้อ", "กางเกง", "เดรส", "ผ้า", "ชุด", "แฟชั่น", "ใส่", "ไซซ์"], proof: "ทรงผ้า เนื้อผ้า สีจริง การทิ้งตัว รอยเย็บ ฟิตบนตัวนางแบบ", scenes: ["คาเฟ่พรีเมียม", "ห้องทำงานมินิมอล", "สตูดิโอสินค้าแสงสะอาด"], action: "ให้นางแบบสวมใส่สินค้าหรือถือชุดให้เห็นทรงชัด" },
  { category: "บิวตี้ / สกินแคร์", words: ["ครีม", "เซรั่ม", "ผิว", "หน้า", "กันแดด", "โกลว์", "สิว", "บำรุง"], proof: "เนื้อสัมผัส ความโกลว์ การซึม ผิวหลังใช้ และแพ็กเกจ", scenes: ["โต๊ะเครื่องแป้งแสงเช้า", "สตูดิโอสินค้าแสงสะอาด"], action: "ให้เห็นมือแตะเนื้อผลิตภัณฑ์หรือถือสินค้าใกล้ใบหน้า" },
  { category: "สุขภาพ / ฟิตเนส", words: ["สุขภาพ", "ฟิต", "ออกกำลัง", "โปรตีน", "หุ่น", "กล้าม", "โยคะ"], proof: "การใช้งานจริง ความคล่องตัว พลังงาน ความสะดวกใน routine", scenes: ["ฟิตเนส", "สวนสาธารณะ"], action: "ให้เห็นสถานการณ์ใช้งานจริงในกิจกรรมสุขภาพ" },
  { category: "อาหาร / เครื่องดื่ม", words: ["อาหาร", "ขนม", "กาแฟ", "ชา", "น้ำ", "เครื่องดื่ม", "รส", "อร่อย"], proof: "เนื้อสัมผัส การเสิร์ฟ แพ็กเกจ สี กลิ่น และปฏิกิริยาหลังชิม", scenes: ["ห้องครัวสะอาด", "คาเฟ่พรีเมียม"], action: "ให้เห็นการหยิบ เสิร์ฟ หรือชิมอย่างเป็นธรรมชาติ" },
  { category: "ของใช้ในบ้าน", words: ["บ้าน", "ครัว", "ห้อง", "จัดเก็บ", "ทำความสะอาด", "เครื่องใช้"], proof: "ก่อน-หลังใช้ ความเป็นระเบียบ ประหยัดพื้นที่ และการใช้งานจริง", scenes: ["ห้องครัวสะอาด", "ห้องทำงานมินิมอล"], action: "ให้เห็นการใช้งานจริงและผลลัพธ์ในบ้าน" },
  { category: "แกดเจ็ต / อุปกรณ์ไอที", words: ["ชาร์จ", "มือถือ", "ไฟ", "จอ", "กล้อง", "ลำโพง", "แกดเจ็ต", "USB"], proof: "พอร์ต ปุ่ม หน้าจอ วิธีใช้ ความสะดวก และก่อน-หลังใช้งาน", scenes: ["ห้องทำงานมินิมอล", "สตูดิโอสินค้าแสงสะอาด"], action: "ให้เห็นมือสาธิตการใช้งานแบบเข้าใจใน 1 วินาที" },
  { category: "คอร์ส / บริการ / ดิจิทัลโปรดักต์", words: ["คอร์ส", "เรียน", "บริการ", "ระบบ", "โปรแกรม", "AI", "ไฟล์", "ดิจิทัล"], proof: "หน้าจอตัวอย่าง workflow ผลลัพธ์ก่อน-หลัง และความง่ายในการใช้งาน", scenes: ["ห้องทำงานมินิมอล", "โรงงานคนกำลังแพ็กของ"], action: "ให้เห็นหน้าจอหรือ workflow ที่สื่อว่าทำงานง่ายขึ้น" },
];

const shotBlueprints = [
  { id: "SHOT_01", title: "เปิดปัญหาให้หยุดดู", purpose: "ทำให้คนรู้สึกว่าใช่ปัญหาของเขา", camera: "close-up หรือ medium close-up, มือถือแนวตั้ง, slow push-in", motion: "กล้องค่อย ๆ push-in และมี movement เล็กน้อยที่สินค้า/มือ/แสง" },
  { id: "SHOT_02", title: "โชว์สินค้าแบบ Hero", purpose: "ให้เห็นสินค้าและจุดขายชัดที่สุด", camera: "product hero shot, clean framing, soft commercial lighting", motion: "หมุนหรือเลื่อนกล้องรอบสินค้าเบา ๆ ให้เห็นแพ็กเกจ/ทรง/สี" },
  { id: "SHOT_03", title: "สาธิตการใช้จริง", purpose: "ทำให้ลูกค้าเห็นภาพการใช้งาน", camera: "natural UGC handheld, medium shot, เห็นมือหรือนางแบบ", motion: "ให้คนในภาพหยิบ ใช้ ใส่ ถือ หรือสาธิตสินค้าอย่างเป็นธรรมชาติ" },
  { id: "SHOT_04", title: "Proof Detail / ปิดการขาย", purpose: "โชว์หลักฐานสำคัญและปิดด้วยภาพน่าเชื่อถือ", camera: "macro detail + stable packshot", motion: "เริ่มจาก detail แล้วค่อยจบที่ภาพสินค้าชัดเจน" },
  { id: "SHOT_05", title: "Lifestyle Routine", purpose: "วางสินค้าในชีวิตจริง", camera: "lifestyle medium shot, natural light", motion: "กล้องเคลื่อนตาม action สั้น ๆ ดูไม่โฆษณาเกินไป" },
  { id: "SHOT_06", title: "Objection Handling", purpose: "ตอบข้อกังวลก่อนซื้อ", camera: "clean comparison shot", motion: "pan ช้า ๆ ระหว่างรายละเอียดที่ควรตรวจสอบ" },
  { id: "SHOT_07", title: "Result Feeling", purpose: "สื่อผลลัพธ์หลังใช้โดยไม่เคลมเกินจริง", camera: "beauty/lifestyle result shot", motion: "hold shot พร้อมแสงนุ่มและ movement เล็กน้อย" },
  { id: "SHOT_08", title: "CTA Packshot", purpose: "ปิดด้วยภาพสินค้าที่จำง่าย", camera: "stable packshot, centered composition", motion: "ค่อย ๆ push-in จบที่สินค้าเด่นชัด" },
];

function lines(value){ return String(value || "").split(/\r?\n/).map(v=>v.trim()).filter(Boolean); }
function clean(value){ return String(value || "").trim(); }
function detectCategory(detail, selected){
  if (selected && selected !== "auto") return categoryRules.find(r=>r.category===selected) || categoryRules[0];
  const hay = detail.toLowerCase();
  let best = categoryRules[0], score = -1;
  categoryRules.forEach(rule => { const s = rule.words.reduce((n,w)=> n + (hay.includes(w.toLowerCase()) ? 1 : 0), 0); if (s > score){ score=s; best=rule; } });
  return best;
}
function buildAnalysis(){
  const productName = clean($("productName").value) || "สินค้า";
  const detail = clean($("productDetail").value);
  const rule = detectCategory(`${productName} ${detail}`, $("category").value);
  const sceneValue = $("scenePreset").value;
  const scene = sceneValue === "custom" ? (clean($("customScene").value) || "ฉากตามที่ผู้ใช้กำหนด") : (sceneValue === "auto" ? rule.scenes[0] : sceneValue);
  const benefits = inferBenefits(detail, rule.category);
  const pain = inferPain(detail, rule.category);
  return { productName, detail, category: rule.category, proof: rule.proof, scene, action: rule.action, benefits, pain, style: $("stylePreset").value, aspectRatio: $("aspectRatio").value, profile: $("profile").value, shotCount: Number($("shotCount").value) };
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
function attachmentsForStill(){ return [...lines($("productPaths").value), ...lines($("facePaths").value), ...lines($("outfitPaths").value), ...lines($("stylePaths").value)]; }
function refSummary(){ return Object.entries(refs).map(([k,v])=> v.length ? `${k}:${v.map(x=>x.name).join("|")}` : "").filter(Boolean).join(", ") || "ไม่มีไฟล์ preview"; }
function corePromptKeywords(){ return "realistic commercial review, high detail, sharp focus, natural skin texture, clean composition, premium product detail, soft natural light, cinematic but believable, no text, no subtitle, no watermark"; }
function firstFramePrompt(shot, analysis){
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
    `จุดขายที่ต้องสื่อ: ${analysis.benefits}`,
    `หลักฐานที่ควรเห็นในภาพ: ${analysis.proof}`,
    `ใช้ภาพอ้างอิงสินค้า/คน/ชุดที่แนบมาเพื่อรักษาทรง สี โลโก้ สัดส่วน ใบหน้า บุคลิก และรายละเอียดชุดให้ใกล้เคียงที่สุด`,
    `คีย์เวิร์ดคุณภาพภาพ: ${corePromptKeywords()}`,
    `ข้อห้าม: ห้ามมีตัวหนังสือในภาพ ห้าม subtitle ห้าม watermark ห้ามป้ายราคา ห้ามสร้างโลโก้ใหม่ ห้ามเปลี่ยนสี/ทรงสินค้า ห้ามนิ้วมือผิดรูป ห้ามหน้าเพี้ยน ห้ามชุดเปลี่ยนจากภาพอ้างอิง`,
  ].join("\n");
}
function motionPrompt(shot, analysis){
  return [
    `เปลี่ยนภาพนิ่ง first frame นี้ให้เป็นวิดีโอรีวิวสินค้าแนวตั้ง ${analysis.aspectRatio}`,
    `ความยาวแนะนำ: 4-6 วินาที`,
    `สินค้า: ${analysis.productName}`,
    `เป้าหมายของ motion: ${shot.title}`,
    `การเคลื่อนไหวกล้อง: ${shot.motion}`,
    `ให้สินค้า ใบหน้า ชุด สี โลโก้ ฉาก และองค์ประกอบหลักคงเดิมจากภาพนิ่ง ห้ามเปลี่ยนเป็นคนละคนหรือคนละสินค้า`,
    `เพิ่ม movement แบบสมจริง เช่น แสงขยับเบา ๆ มือขยับเล็กน้อย ผ้าไหวเบา ๆ หรือ parallax ตามฉาก โดยไม่ทำให้ภาพบิดเบี้ยว`,
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
    motionAttachmentPlaceholder: `C:\\outputs\\${shot.id}_FIRST.png`,
    delayStill: 150,
    delayMotion: analysis.profile === "FLOW" ? 420 : 300,
  }));
  const caption = `${analysis.productName}\n${analysis.pain}\nจุดที่ควรดูคือ ${analysis.benefits}\nเหมาะกับคนที่อยากเห็นสินค้าจริงก่อนตัดสินใจ`;
  const hashtags = Array.from(new Set(["#รีวิวสินค้า", "#ของดีบอกต่อ", `#${analysis.productName.replace(/\s+/g,"")}`, "#TikTokShop", "#AIContent"])).join(" ");
  return { analysis, shots, caption, hashtags, refs: refSummary(), createdAt: new Date().toISOString() };
}
function renderAnalysis(a){
  $("analysisBox").innerHTML = [
    ["หมวดสินค้า", a.category], ["ฉากที่แนะนำ", a.scene], ["Pain Point", a.pain], ["จุดขายหลัก", a.benefits], ["Proof ที่ควรโชว์", a.proof], ["Action", a.action], ["Platform Profile", a.profile], ["REF Preview", refSummary()]
  ].map(([h,p])=>`<div class="chipbox"><h3>${escapeHtml(h)}</h3><p>${escapeHtml(p)}</p></div>`).join("");
}
function renderPackage(pkg){
  currentPackage = pkg; renderAnalysis(pkg.analysis); $("captionOutput").value = pkg.caption; $("hashtagsOutput").value = pkg.hashtags; $("statusPill").textContent = `${pkg.shots.length} ช็อตพร้อม export`;
  $("shotList").innerHTML = pkg.shots.map((shot, i)=>`<article class="shot-card"><div class="shot-head"><div><h3>${shot.id}: ${escapeHtml(shot.title)}</h3><p>${escapeHtml(shot.purpose)}</p></div><div class="mini-actions"><button data-copy="still" data-index="${i}">คัดลอกภาพนิ่ง</button><button data-copy="motion" data-index="${i}">คัดลอก Motion</button></div></div><div class="shot-body"><div class="fieldbox"><h4>First Frame Prompt</h4><textarea data-field="stillPrompt" data-index="${i}">${escapeHtml(shot.stillPrompt)}</textarea></div><div class="fieldbox"><h4>Motion Prompt</h4><textarea data-field="motionPrompt" data-index="${i}">${escapeHtml(shot.motionPrompt)}</textarea></div></div></article>`).join("");
}
function stillRows(pkg){ return pkg.shots.map(s=>({ profile:"GPT Image", job_type:"first_frame", shot_id:`${s.id}_FIRST`, prompt:s.stillPrompt, attachments:s.stillAttachments.join("|"), delay_sec:s.delayStill, status:"pending", output_name:`${s.id}_FIRST.png` })); }
function motionRows(pkg){ return pkg.shots.map(s=>({ profile: pkg.analysis.profile === "GPT Image" ? "FLOW" : pkg.analysis.profile, job_type:"motion", shot_id:`${s.id}_MOTION`, prompt:s.motionPrompt, attachments:s.motionAttachmentPlaceholder, delay_sec:s.delayMotion, status:"pending", output_name:`${s.id}_MOTION.mp4` })); }
function csv(rows){ const fields=["profile","job_type","shot_id","prompt","attachments","delay_sec","status","output_name"]; return [fields.join(","),...rows.map(r=>fields.map(f=>csvEsc(r[f])).join(","))].join("\n"); }
function csvEsc(v){ const t=String(v??""); return /[",\n\r]/.test(t) ? `"${t.replace(/"/g,'""')}"` : t; }
function markdown(pkg){ return [`# Product Review Package: ${pkg.analysis.productName}`,``,`หมวดสินค้า: ${pkg.analysis.category}`,`ฉาก: ${pkg.analysis.scene}`,`REF Preview: ${pkg.refs}`,``,`## วิเคราะห์สินค้า`,pkg.analysis.pain,``,pkg.analysis.benefits,``,`## Shots`,...pkg.shots.map(s=>`### ${s.id}: ${s.title}\n\n#### First Frame\n${s.stillPrompt}\n\n#### Motion\n${s.motionPrompt}`),``,`## Caption`,pkg.caption,``,`## Hashtags`,pkg.hashtags].join("\n"); }
function download(name, content, type){ const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url); }
function ensure(){ if(!currentPackage) syncCustomInputs();
renderPackage(buildPackage()); return currentPackage; }
function escapeHtml(v){ return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function fileToUrl(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
async function handleFiles(kind, files){ const loaded = await Promise.all(Array.from(files||[]).map(async file=>({name:file.name, url: await fileToUrl(file)}))); refs[kind]=[...refs[kind],...loaded]; renderRefs(kind); syncCustomInputs();
renderPackage(buildPackage()); }
function renderRefs(kind){ const box=$(`${kind}Preview`); box.innerHTML = refs[kind].map(x=>`<span class="thumb"><img src="${x.url}" alt="${escapeHtml(x.name)}"><span>${escapeHtml(x.name)}</span></span>`).join(""); }
function syncCustomInputs(){
  $("customCategoryWrap").classList.toggle("is-hidden", $("category").value !== "custom");
  $("customSceneWrap").classList.toggle("is-hidden", $("scenePreset").value !== "custom");
}
["product","face","outfit","style"].forEach(k=>$(`${k}Refs`).addEventListener("change",e=>handleFiles(k,e.target.files)));
$("category").addEventListener("change",()=>{ syncCustomInputs(); syncCustomInputs();
renderPackage(buildPackage()); });
$("scenePreset").addEventListener("change",()=>{ syncCustomInputs(); syncCustomInputs();
renderPackage(buildPackage()); });
$("customCategory").addEventListener("input",()=>renderPackage(buildPackage()));
$("customScene").addEventListener("input",()=>renderPackage(buildPackage()));
$("generateBtn").addEventListener("click",()=>renderPackage(buildPackage()));
$("downloadFirstCsvBtn").addEventListener("click",()=>download("first_frame_queue.csv", csv(stillRows(ensure())), "text/csv;charset=utf-8"));
$("downloadMotionCsvBtn").addEventListener("click",()=>download("motion_queue.csv", csv(motionRows(ensure())), "text/csv;charset=utf-8"));
$("downloadAllJsonBtn").addEventListener("click",()=>download("product-review-project.json", JSON.stringify(ensure(), null, 2), "application/json;charset=utf-8"));
$("downloadMdBtn").addEventListener("click",()=>download("product-review-package.md", markdown(ensure()), "text/markdown;charset=utf-8"));
$("shotList").addEventListener("input", e=>{ if(!currentPackage || !e.target.matches("textarea[data-field]")) return; currentPackage.shots[Number(e.target.dataset.index)][e.target.dataset.field] = e.target.value; });
$("shotList").addEventListener("click", async e=>{ const b=e.target.closest("button[data-copy]"); if(!b) return; const s=ensure().shots[Number(b.dataset.index)]; await navigator.clipboard.writeText(b.dataset.copy==="still" ? s.stillPrompt : s.motionPrompt); $("statusPill").textContent="คัดลอกแล้ว"; setTimeout(()=>$("statusPill").textContent=`${ensure().shots.length} ช็อตพร้อม export`,900); });
syncCustomInputs();
renderPackage(buildPackage());
