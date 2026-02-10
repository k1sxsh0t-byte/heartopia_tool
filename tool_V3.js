/* ===== 共通設定・モーダル ===== */
const starRates = [1, 1.5, 2, 4, 8];  // ☆1～5の倍率（玄人・ぴよぴよ共通）
const modal = document.getElementById("confirmModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalOkBtn = document.getElementById("modalOkBtn");
const modalNote = document.getElementById("modalNote");

function openModal({ title, body, okText, okClass, note, onOk }) {
  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modalOkBtn.textContent = okText;
  modalOkBtn.className = okClass;
  modalNote.textContent = note || "";
  modalOkBtn.onclick = () => { onOk(); closeModal(); };
  modal.style.display = "flex";
}

function closeModal() { modal.style.display = "none"; }

/* ===== モード切替 ===== */
const topPage = document.getElementById("topPage");
const expertPage = document.getElementById("expertPage");
const piyoPage = document.getElementById("piyoPage");

document.getElementById("btnExpertMode").onclick = showExpert;
document.getElementById("btnPiyoMode").onclick = showPiyo;
document.getElementById("toTopFromExpert").onclick = showTop;
document.getElementById("toTopFromPiyo").onclick = showTop;
document.getElementById("switchToPiyo").onclick = showPiyo;
document.getElementById("switchToExpert").onclick = showExpert;

function showTop() { topPage.style.display = "block"; expertPage.style.display = "none"; piyoPage.style.display = "none"; }
function showExpert() { topPage.style.display = "none"; expertPage.style.display = "block"; piyoPage.style.display = "none"; loadExpertSettings(); updateItemSelect_expert(); }
function showPiyo() { topPage.style.display = "none"; expertPage.style.display = "none"; piyoPage.style.display = "block"; loadPiyoSettings(); updateEventSelect_piyo(); updateItemSelect_piyo(); }

/* ===== 玄人モード（expert） ===== */
let items = JSON.parse(localStorage.getItem("eventItems")) || [];

const itemSelect_expert = document.getElementById("itemSelect_expert");
const itemPrice_expert = document.getElementById("itemPrice_expert");
const itemCost_expert = document.getElementById("itemCost_expert");
const targetCoin_expert = document.getElementById("targetCoin_expert");
const doublePrice_expert = document.getElementById("doublePrice_expert");
const resultArea_expert = document.getElementById("resultArea_expert");
const materialArea_expert = document.getElementById("materialArea_expert");
const addMaterialBtn_expert = document.getElementById("addMaterialBtn_expert");
const eventDays_expert = document.getElementById("eventDays_expert");
const eventName_expert = document.getElementById("eventName_expert");
const newItemName_expert = document.getElementById("newItemName_expert");
const newItemPrice_expert = document.getElementById("newItemPrice_expert");
const newItemCost_expert = document.getElementById("newItemCost_expert");

/* ===== 保存/復元（玄人） ===== */
function saveExpertSettings(){
  localStorage.setItem("expertSettings", JSON.stringify({
    eventName: eventName_expert.value,
    eventDays: eventDays_expert.value,
    targetCoin: targetCoin_expert.value,
    doublePrice: doublePrice_expert.checked
  }));
}
function loadExpertSettings(){
  const data = JSON.parse(localStorage.getItem("expertSettings"));
  if(!data) return;
  eventName_expert.value = data.eventName || "";
  eventDays_expert.value = data.eventDays || "";
  targetCoin_expert.value = data.targetCoin || "";
  doublePrice_expert.checked = data.doublePrice || false;
}

/* ===== 材料追加 ===== */
addMaterialBtn_expert.onclick = () => {
  const row = document.createElement("div");
  row.className = "material-row";
  row.innerHTML = `<input type="text" placeholder="材料名"><input type="number" placeholder="必要数">`;
  materialArea_expert.appendChild(row);
};

/* ===== アイテム登録・更新・削除 ===== */
document.getElementById("addItemBtn_expert").onclick = () => {
  const name = newItemName_expert.value;
  if(!name) return;

  const materials = [];
  document.querySelectorAll("#materialArea_expert .material-row").forEach(row=>{
    const n = row.children[0].value;
    const c = Number(row.children[1].value);
    if(n && c) materials.push({name:n,count:c});
  });

  items.push({name, price:Number(newItemPrice_expert.value), cost:Number(newItemCost_expert.value), materials});
  localStorage.setItem("eventItems", JSON.stringify(items));
  updateItemSelect_expert();

  openModal({title:"登録完了", body:`「${name}」を登録しました`, okText:"OK", okClass:"btn-update", onOk:()=>{} });
};

document.getElementById("updateItemBtn_expert").onclick = () => {
  const index = itemSelect_expert.value;
  if(!items[index]) return;
  const before = items[index];
  const materials = [];
  document.querySelectorAll("#materialArea_expert .material-row").forEach(row=>{
    const n = row.children[0].value;
    const c = Number(row.children[1].value);
    if(n && c) materials.push({name:n,count:c});
  });
  const after = {name:newItemName_expert.value, price:Number(newItemPrice_expert.value), cost:Number(newItemCost_expert.value), materials};

  const matText = m => m.map(x=>`${x.name} ${x.count}`).join(" / ");
  openModal({
    title:"更新の確認",
    body:`<b>変更前</b><pre>${before.name}\n価格：${before.price}\n原価：${before.cost}\n材料：${matText(before.materials)}</pre>
          <b>変更後</b><pre>${after.name}\n価格：${after.price}\n原価：${after.cost}\n材料：${matText(after.materials)}</pre>`,
    okText:"更新する", okClass:"btn-update",
    onOk:()=>{ items[index]=after; localStorage.setItem("eventItems",JSON.stringify(items)); updateItemSelect_expert(); }
  });
};

document.getElementById("deleteItemBtn_expert").onclick = () => {
  const index = itemSelect_expert.value;
  if(!items[index]) return;
  const name = items[index].name;
  openModal({
    title:"削除の確認",
    body:`「${name}」を削除しますが、よろしいですか？`,
    okText:"削除する", okClass:"btn-delete",
    note:"この操作は元に戻せません",
    onOk:()=>{ items.splice(index,1); localStorage.setItem("eventItems",JSON.stringify(items)); updateItemSelect_expert(); resultArea_expert.innerHTML=""; }
  });
};

/* ===== セレクト更新（玄人） ===== */
function updateItemSelect_expert(){
  itemSelect_expert.innerHTML="";
  items.forEach((item,i)=>{
    const opt=document.createElement("option");
    opt.value=i;
    opt.textContent=item.name;
    itemSelect_expert.appendChild(opt);
  });
  updateSelectedItem_expert();
}

function updateSelectedItem_expert(){
  const item = items[itemSelect_expert.value];
  if(!item) return;
  itemPrice_expert.value = item.price;
  itemCost_expert.value = item.cost;
  calculateExpert();
}

/* ===== 計算（玄人） ===== */
function calculateExpert(){
  const item = items[itemSelect_expert.value];
  const target = Number(targetCoin_expert.value);
  const days = Number(eventDays_expert.value) || 1;
  if(!item || !target) { resultArea_expert.innerHTML=""; return; }

  const isDouble = doublePrice_expert ? doublePrice_expert.checked : false;

  resultArea_expert.innerHTML = "";
  starRates.forEach((rate,i)=>{
    let sellPrice = item.price * rate;
    if(isDouble) sellPrice *= 2;

    const needCount = Math.ceil(target / sellPrice);
    const dailyCount = needCount / days;
    const totalCost = needCount * item.cost;
    const dailyCost = totalCost / days;

    const materialText = item.materials.map(m => `${m.name} ${m.count*needCount}`).join(" / ");
    const dailyMaterialText = item.materials.map(m => `${m.name} ${(m.count*needCount/days).toFixed(2)}`).join(" / ");

    const div = document.createElement("div");
    div.className = "result-row";
    div.innerHTML = `☆${i+1}：${needCount}個 / 原価 ${totalCost} / 材料：${materialText}<br>☆${i+1}（日割り）：${dailyCount.toFixed(2)}個 / 原価 ${dailyCost.toFixed(0)} / 材料：${dailyMaterialText}`;
    resultArea_expert.appendChild(div);
  });
}

/* ===== ぴよぴよモード ===== */
const piyoItemData = {
    "金策比較用": [
    { name:"焼きキノコ系", price:180, cost:0, materials:[{name:"キノコ類",count:4}] },
    { name:"トリュフパイ", price:830, cost:195, materials:[{name:"トリュフ",count:2},{name:"小麦",count:1},{name:"卵",count:1}] },
    { name:"スモークサーモンベーグル", price:520, cost:195, materials:[{name:"魚",count:1},{name:"小麦",count:1},{name:"チーズ",count:1},{name:"野菜",count:1}] },
    { name:"ミックスジャム", price:160, cost:0, materials:[{name:"果実類",count:4}] },
    { name:"ブルーベリージャム", price:170, cost:0, materials:[{name:"ブルーベリー",count:4}] },
    { name:"トマトジャム", price:180, cost:0, materials:[{name:"トマト",count:4}] },
    { name:"ラズベリージャム", price:250, cost:0, materials:[{name:"ラズベリー",count:4}] },
    { name:"リンゴジャム ", price:270, cost:0, materials:[{name:"リンゴ",count:4}] },
    { name:"オレンジジャム ", price:270, cost:0, materials:[{name:"オレンジ",count:4}] },
    { name:"パイナップルジャム ", price:280, cost:0, materials:[{name:"パイナップル",count:4}] }
  ],
  "スノーシーズンイベント": [
    { name:"アイスカップコーヒー", price:140, cost:200, materials:[{name:"シュガー",count:1},{name:"コーヒー豆",count:3}] },
    { name:"アイスカップカフェラテ", price:140, cost:200, materials:[{name:"シュガー",count:1},{name:"コーヒー豆",count:1},{name:"牛乳",count:2}] },
    { name:"大根おろし肉", price:300, cost:560, materials:[{name:"肉",count:2},{name:"バター",count:1},{name:"ダイコン",count:1}] },
    { name:"大根クリームポタージュ", price:160, cost:220, materials:[{name:"牛乳",count:1},{name:"バター",count:1},{name:"ダイコン",count:2}] },
    { name:"シュガーパンケーキ（プレーン）", price:160, cost:200, materials:[{name:"卵",count:1},{name:"牛乳",count:1},{name:"シュガー",count:1},{name:"果実類",count:1}] },
    { name:"シュガーパンケーキ（ブルーベリー）", price:160, cost:200, materials:[{name:"卵",count:1},{name:"牛乳",count:1},{name:"シュガー",count:1},{name:"ブルーベリー",count:1}] },
    { name:"シュガーパンケーキ（ラズベリー）", price:170, cost:200, materials:[{name:"卵",count:1},{name:"牛乳",count:1},{name:"シュガー",count:1},{name:"ラズベリー",count:1}] },
    { name:"シュガーパンケーキ（アップル）", price:170, cost:200, materials:[{name:"卵",count:1},{name:"牛乳",count:1},{name:"シュガー",count:1},{name:"アップル",count:1}] },
    { name:"シュガーパンケーキ（オレンジ）", price:170, cost:200, materials:[{name:"卵",count:1},{name:"牛乳",count:1},{name:"シュガー",count:1},{name:"オレンジ",count:1}] },
    { name:"オーロラディナー", price:770, cost:1120, materials:[{name:"大根おろし肉",count:1},{name:"大根のクリームポタージュ",count:1},{name:"アイスカップコーヒー",count:1},{name:"シュガーパンケーキ類",count:1}] }
  ]
};

const eventSelect_piyo = document.getElementById("eventSelect_piyo");
const itemSelect_piyo = document.getElementById("itemSelect_piyo");
const targetCoin_piyo = document.getElementById("targetCoin_piyo");
const eventDays_piyo = document.getElementById("eventDays_piyo");
const resultArea_piyo = document.getElementById("resultArea_piyo");
const itemPrice_piyo = document.getElementById("itemPrice_piyo");
const itemCost_piyo = document.getElementById("itemCost_piyo");
const doublePrice_piyo = document.getElementById("doublePrice_piyo");

/* ===== アイテム選択変更時 ===== */
function updateSelectedItem_piyo(){
  const evName = eventSelect_piyo.value;
  const item = (piyoItemData[evName]||[])[itemSelect_piyo.selectedIndex];
  if(!item) return;
  itemPrice_piyo.value = item.price;
  itemCost_piyo.value = item.cost;
  calculatePiyo();
}

/* ===== イベント/アイテム更新 ===== */
function updateEventSelect_piyo(){
  eventSelect_piyo.innerHTML = "";
  Object.keys(piyoItemData).forEach(ev => {
    const opt = document.createElement("option");
    opt.value = ev;
    opt.textContent = ev;
    eventSelect_piyo.appendChild(opt);
  });
  updateItemSelect_piyo();
  updateSelectedItem_piyo();
}

function updateItemSelect_piyo(){
  const ev = eventSelect_piyo.value;
  const items = piyoItemData[ev] || [];
  itemSelect_piyo.innerHTML = "";
  items.forEach(it => {
    const opt = document.createElement("option");
    opt.value = it.name;
    opt.textContent = it.name;
    itemSelect_piyo.appendChild(opt);
  });
  updateSelectedItem_piyo();
}

/* ===== 計算（ぴよぴよ） ===== */
function calculatePiyo(){
  const ev = eventSelect_piyo.value;
  const itemName = itemSelect_piyo.value;
  const target = Number(targetCoin_piyo.value);
  const days = Number(eventDays_piyo.value)||1;
  if(!ev || !itemName || !target){ resultArea_piyo.innerHTML=""; return; }

  const item = (piyoItemData[ev]||[]).find(x => x.name === itemName);
  if(!item) return;

  const isDouble = doublePrice_piyo ? doublePrice_piyo.checked : false;

  resultArea_piyo.innerHTML = "";
  starRates.forEach((rate,i) => {
    let sellPrice = item.price * rate;
    if(isDouble) sellPrice *= 2;

    const needCount = Math.ceil(target / sellPrice);
    const dailyCount = needCount / days;
    const totalCost = needCount * item.cost;
    const dailyCost = totalCost / days;

    const materialText = item.materials.map(m => `${m.name} ${m.count*needCount}`).join(" / ");
    const dailyMaterialText = item.materials.map(m => `${m.name} ${(m.count*needCount/days).toFixed(2)}`).join(" / ");

    const div = document.createElement("div");
    div.className = "result-row";
    div.innerHTML = `☆${i+1}：${needCount}個 / 原価 ${totalCost} / 材料：${materialText}<br>
                     ☆${i+1}（日割り）：${dailyCount.toFixed(2)}個 / 原価 ${dailyCost.toFixed(0)} / 材料：${dailyMaterialText}`;
    resultArea_piyo.appendChild(div);
  });

  savePiyoSettings();
}

/* ===== 保存/復元（ぴよぴよ） ===== */
function savePiyoSettings(){
  localStorage.setItem("piyoSettings", JSON.stringify({
    event: eventSelect_piyo.value,
    item: itemSelect_piyo.value,
    days: eventDays_piyo.value,
    target: targetCoin_piyo.value,
    double: doublePrice_piyo.checked
  }));
}

function loadPiyoSettings(){
  const data = JSON.parse(localStorage.getItem("piyoSettings"));
  if(!data) return;
  eventSelect_piyo.value = data.event||"";
  itemSelect_piyo.value = data.item||"";
  eventDays_piyo.value = data.days||"";
  targetCoin_piyo.value = data.target||"";
  if(doublePrice_piyo) doublePrice_piyo.checked = data.double||false;
  calculatePiyo();
}

/* ===== イベントリスナー ===== */
eventSelect_piyo.onchange = updateItemSelect_piyo;
itemSelect_piyo.onchange = updateSelectedItem_piyo;
targetCoin_expert.oninput = calculateExpert;
eventDays_expert.oninput = calculateExpert;
if(doublePrice_expert) doublePrice_expert.onchange = calculateExpert;

targetCoin_piyo.oninput = calculatePiyo;
eventDays_piyo.oninput = calculatePiyo;
if(doublePrice_piyo) doublePrice_piyo.onchange = calculatePiyo;

/* ===== 初期化 ===== */
loadExpertSettings();
loadPiyoSettings();
updateEventSelect_piyo();
showTop();
