let spriteSheetStay;
let spriteSheetWalk;
let spriteSheetJump;
let spriteSheetHit;
let spriteSheetWeapon;
let currentFrame = 0;
let frameCount = 0;
const frameDelayStay = 5;  // stay 動畫每5幀更新一次
const frameDelayWalk = 5;  // walk 動畫每5幀更新一次
const frameDelayJump = 5;  // jump 動畫每5幀更新一次
const frameDelayHit = 5;   // hit 動畫每5幀更新一次
const frameDelayWeapon = 3;  // weapon 動畫每3幀更新一次
const playerScale = 5.0;  // 玩家放大倍率 (原本2.5 * 2)
const npcScale = 3.75;    // NPC 放大倍率 (原本2.5 * 1.5)

let state = 'stay';  // 'stay' 或 'walk' 或 'jump' 或 'hit'
let direction = 1;  // 1 for right, -1 for left
let characterX;  // 角色的 x 位置
let characterY;  // 角色的 y 位置
let characterBaseY;  // 角色的基準 y 位置（站立位置）
let moveSpeed = 5;  // 移動速度 (原本3 * 1.5)
let keysPressed = {};  // 追蹤目前按下的鍵
let jumpVelocity = 0;  // 跳躍速度（垂直）
const gravity = 0.5;  // 重力加速度
const jumpPower = 15;  // 跳躍初速度
let isJumping = false;  // 是否正在跳躍
let isAttacking = false;  // 是否正在攻擊
let weapons = [];  // 武器陣列
let weaponSpeed = 8;  // 武器移動速度

// Cirno 變數：嘗試載入 cirno/cirno.png（若不存在使用程式產生的佔位圖）
let cirnoSprite = null;
let cirnoLoaded = false;
const cirnoTotalFrames = 6;
const cirnoSpriteW = 187;
const cirnoSpriteH = 43;
let cirnoX = 0;
let cirnoY = 0;
let cirnoPlaceholder = null;
let cirnoAsked = false;
let cirnoDialogActive = false;
let cirnoQuestion = {
  text: '1 + 1 = ？',
  choices: ['1','2','3'],
  correct: 1
};
let cirnoChosen = -1;
let cirnoFeedbackTimer = 0;
// Cirno 動畫控制
let cirnoFrame = 0;
let cirnoFrameCount = 0;
const cirnoFrameDelay = 8;
// Brian 變數：左側 NPC（3 格，157x84）
let brianSprite = null;
let brianLoaded = false;
const brianTotalFrames = 3;
const brianSpriteW = 157;
const brianSpriteH = 84;
let brianX = 0;
let brianY = 0;
let brianPlaceholder = null;
let brianAsked = false;
let brianDialogActive = false;
let brianQuestion = {}; // 將從 CSV 載入
let brianFeedbackTimer = 0;
let brianFrame = 0;
let brianFrameCount = 0;
const brianFrameDelay = 10;
// Chiyo 變數：background3 NPC (12 格, 499x95)
let chiyoSprite = null;
let chiyoLoaded = false;
const chiyoTotalFrames = 12;
const chiyoSpriteW = 499;
const chiyoSpriteH = 95;
let chiyoX = 0;
let chiyoY = 0;
let chiyoPlaceholder = null;
let chiyoAsked = false;
let chiyoDialogActive = false;
let chiyoQuestion = {};
let chiyoFeedbackTimer = 0;
let chiyoFrame = 0;
let chiyoFrameCount = 0;
const chiyoFrameDelay = 8;
// Rinne 變數：提示角色 (3 格, 217x74)
let rinneSprite = null;
let rinneLoaded = false;
const rinneTotalFrames = 3;
const rinneSpriteW = 217;
const rinneSpriteH = 74;
let rinneX = 0;
let rinneY = 0;
let rinneVisible = false;
let rinneFrame = 0;
let rinneFrameCount = 0;
const rinneFrameDelay = 10;
let questionStartTime = 0;

// 題庫相關變數
let questionTable;
let questions = [];
let answerInput;
let submitButton;
let currentNpc = null; // 記錄目前互動的 NPC
let bgImages = [];
let currentBgIndex = 0;

function preload() {
  spriteSheetStay = loadImage('Patrick/stay/stay.png');
  spriteSheetWalk = loadImage('Patrick/walk/walk.png');
  spriteSheetJump = loadImage('Patrick/jump/jump.png');
  spriteSheetHit = loadImage('Patrick/hit/hit.png');
  spriteSheetWeapon = loadImage('Patrick/hit/hit--.png');
  // 載入背景圖片
  bgImages[0] = loadImage('background/background1.png');
  bgImages[1] = loadImage('background/background2.png');
  bgImages[2] = loadImage('background/background3.png');
  // 載入 CSV 題庫
  questionTable = loadTable('questions.csv', 'csv', 'header');
  // 嘗試載入 cirno 精靈圖，如果不存在會使用程式產生的佔位圖
  cirnoSprite = loadImage('cirno/cirno.png', () => {
    cirnoLoaded = true;
  }, () => {
    cirnoLoaded = false;
  });
  // 載入 Brian 精靈圖（brian/brian.png），若不存在會使用程式產生的佔位圖
  brianSprite = loadImage('brian/brian.png', () => {
    brianLoaded = true;
  }, () => {
    brianLoaded = false;
  });
  // 載入 Chiyo 精靈圖
  chiyoSprite = loadImage('chiyo/chiyo.png', () => {
    chiyoLoaded = true;
  }, () => {
    chiyoLoaded = false;
  });
  // 載入 Rinne 精靈圖
  rinneSprite = loadImage('rinne/rinne.png', () => {
    rinneLoaded = true;
  }, () => {
    rinneLoaded = false;
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  characterX = width / 2;
  characterBaseY = height / 2 + 50;
  characterY = characterBaseY;
  // Cirno 位置（固定在場景右側，靠近角色右邊）
  cirnoX = min(width - 100, characterX + 200);
  cirnoY = characterBaseY ;
  // Brian 位置（固定在場景左側，靠近角色左邊）
  brianX = max(100, characterX - 250);
  brianY = characterBaseY;
  // Chiyo 位置（background3，設定在畫面中間偏右）
  chiyoX = width / 2 - 100;
  chiyoY = characterBaseY - 100;

  // 解析 CSV 資料
  for (let row of questionTable.getRows()) {
    questions.push({
      text: row.getString('question'),
      answer: row.getString('answer'),
      correct: row.getString('correct_feedback'),
      wrong: row.getString('incorrect_feedback'),
      hint: row.getString('hint'),
      answered: false, // 是否已回答
      feedback: '' // 回饋文字
    });
  }
  createAnswerInput();
}

function draw() {
  background(bgImages[currentBgIndex]);

  // 繪製 Cirno（固定站立，不動）
  if (currentBgIndex === 0) {
  // 使用 spritesheet 的第一幀作為靜止圖，如果沒有檔案則產生佔位圖
  // Cirno 動畫：每隔 cirnoFrameDelay 幀切換下一格（固定在原地，但會擺動幀）
  cirnoFrameCount++;
  if (cirnoFrameCount >= cirnoFrameDelay) {
    cirnoFrameCount = 0;
    cirnoFrame = (cirnoFrame + 1) % cirnoTotalFrames;
  }

  push();
  translate(cirnoX, cirnoY);
  let cfw = cirnoSpriteW / cirnoTotalFrames;
  let srcXc = cirnoFrame * cfw; // 目前顯示的格
  let ddw = (cfw) * npcScale;
  let ddh = cirnoSpriteH * npcScale;
  translate(-ddw / 2, -ddh / 2);
  if (cirnoLoaded && cirnoSprite && cirnoSprite.width === cirnoSpriteW && cirnoSprite.height === cirnoSpriteH) {
    image(cirnoSprite, 0, 0, ddw, ddh, srcXc, 0, cfw, cirnoSpriteH);
  } else {
    // 使用一次性生成的佔位 sprite（六格彩色條）
    if (!cirnoPlaceholder) {
      cirnoPlaceholder = createGraphics(cirnoSpriteW, cirnoSpriteH);
      for (let i = 0; i < cirnoTotalFrames; i++) {
        cirnoPlaceholder.noStroke();
        cirnoPlaceholder.fill((i * 40) % 255, 150, 200);
        cirnoPlaceholder.rect(i * (cirnoSpriteW / cirnoTotalFrames), 0, cirnoSpriteW / cirnoTotalFrames, cirnoSpriteH);
      }
    }
    // 取出當前幀的區塊並繪製
    let g = createGraphics(cfw, cirnoSpriteH);
    g.image(cirnoPlaceholder, 0, 0, cfw, cirnoSpriteH, cirnoFrame * cfw, 0, cfw, cirnoSpriteH);
    image(g, 0, 0, ddw, ddh);
  }
  pop();
  }

  // 繪製 Brian（左側，固定不動，播放 3 幀動畫）
  if (currentBgIndex === 1) {
  brianFrameCount++;
  if (brianFrameCount >= brianFrameDelay) {
    brianFrameCount = 0;
    brianFrame = (brianFrame + 1) % brianTotalFrames;
  }
  push();
  // 設為中心繪製，方便鏡像處理
  translate(brianX, brianY);
  let bfw = brianSpriteW / brianTotalFrames;
  let bsx = brianFrame * bfw;
  let bdw = bfw * npcScale;
  let bdh = brianSpriteH * npcScale;
  // 若玩家在 Brian 的左邊，對 Brian 產生鏡像（面向玩家）
  if (characterX < brianX) {
    scale(-1, 1);
  }
  imageMode(CENTER);
  if (brianLoaded && brianSprite && brianSprite.width === brianSpriteW && brianSprite.height === brianSpriteH) {
    image(brianSprite, 0, 0, bdw, bdh, bsx, 0, bfw, brianSpriteH);
  } else {
    if (!brianPlaceholder) {
      brianPlaceholder = createGraphics(brianSpriteW, brianSpriteH);
      for (let i = 0; i < brianTotalFrames; i++) {
        brianPlaceholder.noStroke();
        brianPlaceholder.fill(100 + i * 50, 180, 150);
        brianPlaceholder.rect(i * (brianSpriteW / brianTotalFrames), 0, brianSpriteW / brianTotalFrames, brianSpriteH);
      }
    }
    // 切出當前幀並以中心模式繪製
    let bg = createGraphics(bfw, makotoSpriteH);
    bg.image(brianPlaceholder, 0, 0, bfw, brianSpriteH, brianFrame * bfw, 0, bfw, brianSpriteH);
    image(bg, 0, 0, bdw, bdh);
  }
  pop();
  }

  // 繪製 Chiyo（background3）
  if (currentBgIndex === 2) {
    chiyoFrameCount++;
    if (chiyoFrameCount >= chiyoFrameDelay) {
      chiyoFrameCount = 0;
      chiyoFrame = (chiyoFrame + 1) % chiyoTotalFrames;
    }
    push();
    translate(chiyoX, chiyoY);
    let cfw = chiyoSpriteW / chiyoTotalFrames;
    let csx = chiyoFrame * cfw;
    let cdw = cfw * npcScale;
    let cdh = chiyoSpriteH * npcScale;
    
    // 若玩家在 Chiyo 左邊，讓 Chiyo 面向左邊（假設原始圖面向右）
    if (characterX < chiyoX) {
      scale(-1, 1);
    }
    
    translate(-cdw / 2, -cdh / 2);
    
    if (chiyoLoaded && chiyoSprite && chiyoSprite.width === chiyoSpriteW && chiyoSprite.height === chiyoSpriteH) {
      image(chiyoSprite, 0, 0, cdw, cdh, csx, 0, cfw, chiyoSpriteH);
    } else {
      if (!chiyoPlaceholder) {
        chiyoPlaceholder = createGraphics(chiyoSpriteW, chiyoSpriteH);
        for (let i = 0; i < chiyoTotalFrames; i++) {
          chiyoPlaceholder.noStroke();
          chiyoPlaceholder.fill(i * 20, 100, 255 - i * 10);
          chiyoPlaceholder.rect(i * (chiyoSpriteW / chiyoTotalFrames), 0, chiyoSpriteW / chiyoTotalFrames, chiyoSpriteH);
        }
      }
      let cg = createGraphics(cfw, chiyoSpriteH);
      cg.image(chiyoPlaceholder, 0, 0, cfw, chiyoSpriteH, chiyoFrame * cfw, 0, cfw, chiyoSpriteH);
      image(cg, 0, 0, cdw, cdh);
    }
    pop();
  }

  // 更新和繪製武器
  for (let i = weapons.length - 1; i >= 0; i--) {
    let weapon = weapons[i];
    weapon.x += weapon.vx;
    weapon.frameCount++;
    if (weapon.frameCount >= frameDelayWeapon) {
      weapon.frameCount = 0;
      weapon.currentFrame++;
    }

    // 如果武器超出視窗或動畫完成，移除
    if (weapon.x > width || weapon.x < 0 || weapon.currentFrame >= 15) {
      weapons.splice(i, 1);
      continue;
    }

    // 繪製武器
    drawWeapon(weapon);
  }

  // 處理跳躍的物理
  if (isJumping) {
    jumpVelocity += gravity;
    characterY += jumpVelocity;
    
    // 檢查是否落地
    if (characterY >= characterBaseY) {
      characterY = characterBaseY;
      isJumping = false;
      jumpVelocity = 0;
      if (state === 'jump') {
        state = 'stay';
        currentFrame = 0;
        frameCount = 0;
      }
    }
  }

  // 根據按下的鍵來決定移動和狀態
  let isMoving = false;
  if (keysPressed['d'] || keysPressed['D']) {
    if (state !== 'hit' && !isAttacking) {
      characterX += moveSpeed;
      direction = 1;
      if (state === 'stay' || state === 'walk') {
        state = 'walk';
      }
      isMoving = true;
    }
  }
  if (keysPressed['a'] || keysPressed['A']) {
    if (state !== 'hit' && !isAttacking) {
      characterX -= moveSpeed;
      direction = -1;
      if (state === 'stay' || state === 'walk') {
        state = 'walk';
      }
      isMoving = true;
    }
  }

  // 處理跳躍
  if ((keysPressed['w'] || keysPressed['W']) && !isJumping && state !== 'jump' && state !== 'hit' && !isAttacking) {
    isJumping = true;
    jumpVelocity = -jumpPower;
    state = 'jump';
    currentFrame = 0;
    frameCount = 0;
  }

  // 如果沒有移動，回到靜止狀態（但跳躍中除外）
  if (!isMoving && state === 'walk' && !isJumping) {
    state = 'stay';
    currentFrame = 0;
    frameCount = 0;
  }

  // 檢查是否到達右邊界並切換背景
  if (characterX > width - 50 && currentBgIndex < 2) {
    let canProceed = false;
    if (currentBgIndex === 0 && cirnoQuestion.answered) canProceed = true;
    if (currentBgIndex === 1 && brianQuestion.answered) canProceed = true;

    if (canProceed) {
      currentBgIndex++;
      characterX = 50;
      hideAnswerInput();
      cirnoDialogActive = false;
      brianDialogActive = false;
      chiyoDialogActive = false;
    }
  }
  // 限制角色在視窗範圍內
  characterX = constrain(characterX, 50, width - 50);

  // 根據狀態選擇精靈圖和幀數
  let spriteSheet, totalFrames, frameWidth, frameHeight, frameDelay;

  if (state === 'hit') {
    spriteSheet = spriteSheetHit;
    totalFrames = 5;
    frameWidth = 190 / 5;  // 38
    frameHeight = 48;
    frameDelay = frameDelayHit;
  } else if (state === 'jump') {
    spriteSheet = spriteSheetJump;
    totalFrames = 8;
    frameWidth = 347 / 8;  // 43.375
    frameHeight = 50;
    frameDelay = frameDelayJump;
  } else if (state === 'walk') {
    spriteSheet = spriteSheetWalk;
    totalFrames = 10;
    frameWidth = 395 / 10;  // 39.5
    frameHeight = 50;
    frameDelay = frameDelayWalk;
  } else {
    spriteSheet = spriteSheetStay;
    totalFrames = 5;
    frameWidth = 175 / 5;  // 35
    frameHeight = 49;
    frameDelay = frameDelayStay;
  }

  // 控制動畫撥放速度
  frameCount++;
  if (frameCount >= frameDelay) {
    frameCount = 0;
    currentFrame = (currentFrame + 1) % totalFrames;
    
    // 檢查攻擊動畫是否完成
    if (state === 'hit' && currentFrame === 0) {
      isAttacking = false;
      // 產生武器
      let weapon = {
        x: characterX,
        y: characterY,
        vx: direction * weaponSpeed,
        currentFrame: 0,
        frameCount: 0
      };
      weapons.push(weapon);
      state = 'stay';
    }
  }

  // 計算當前幀的來源 X 位置
  let srcX = currentFrame * frameWidth;

  // 放大後的目標尺寸
  let dw = frameWidth * playerScale;
  let dh = frameHeight * playerScale;

  // 繪製角色
  push();
  translate(characterX, characterY);
  if (direction === -1) {
    // 向左時翻轉
    scale(-1, 1);
  }
  translate(-dw / 2, -dh / 2);

  if (spriteSheet) {
    image(spriteSheet, 0, 0, dw, dh, srcX, 0, frameWidth, frameHeight);
  }
  pop();

  // 檢查玩家是否接近 Cirno，若接近則觸發問答（不會阻擋玩家移動）
  if (currentBgIndex === 0) {
  // 支援重複觸發：玩家離開到一定距離後可重置
  let d = dist(characterX, characterY, cirnoX, cirnoY);
  if (d < 120) {
    if (!cirnoDialogActive && !cirnoAsked && !cirnoQuestion.answered) {
      currentNpc = 'cirno';
      cirnoDialogActive = true;
      cirnoAsked = true;
      cirnoQuestion = random(questions); // 隨機抽題
      questionStartTime = millis();
      showAnswerInput();
    }
  } else if (d > 160) {
    // 玩家已離開一定距離，允許再次觸發問答，並關閉對話
    cirnoAsked = false;
    if (cirnoDialogActive) {
      cirnoDialogActive = false;
      hideAnswerInput();
      currentNpc = null;
    }
  }

  // 畫出問答 UI（若啟動） — 放在 Cirno 頭上方
  if (cirnoDialogActive) {
    // 計算 Cirno 顯示尺寸以便定位對話框
    let cfw = cirnoSpriteW / cirnoTotalFrames;
    let ddw = (cfw) * npcScale;
    let ddh = cirnoSpriteH * npcScale;
    
    let boxW = 300;
    let boxH = 100;
    let boxX = constrain(cirnoX - boxW / 2, 8, width - boxW - 8);
    let boxY = cirnoY - ddh / 2 - boxH - 12;

    push();
    rectMode(CORNER);
    fill(0, 0, 0, 180);
    rect(boxX, boxY, boxW, boxH, 10);
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    text(cirnoQuestion.text, boxX + 15, boxY + 15);

    // 顯示回饋文字
    if (cirnoQuestion.answered) {
      fill(cirnoQuestion.feedback === cirnoQuestion.correct ? 'lightgreen' : 'pink');
      textSize(16);
      textAlign(CENTER, CENTER);
      text(cirnoQuestion.feedback, boxX + boxW / 2, boxY + 65);
    }

    pop();

    // 關閉機制：若已選擇 兩秒後自動關閉
    if (cirnoQuestion.answered) {
      if (cirnoFeedbackTimer === 0) cirnoFeedbackTimer = millis();
      if (millis() - cirnoFeedbackTimer > 2000) {
        cirnoDialogActive = false;
        hideAnswerInput();
        currentNpc = null;
      }
    }
  }
  }

  // 檢查玩家是否接近 Brian，若接近則觸發問答（不會阻擋玩家移動），支援重複觸發
  if (currentBgIndex === 1) {
  let db = dist(characterX, characterY, brianX, brianY);
  if (db < 120) {
    if (!brianDialogActive && !brianAsked && !brianQuestion.answered) {
      currentNpc = 'brian';
      brianDialogActive = true;
      brianAsked = true;
      brianQuestion = random(questions); // 隨機抽題
      questionStartTime = millis();
      showAnswerInput();
    }
  } else if (db > 160) {
    brianAsked = false;
    if (brianDialogActive) {
      brianDialogActive = false;
      hideAnswerInput();
      currentNpc = null;
    }
  }

  // 畫出 Brian 的問答 UI（若啟動） — 放在 Brian 頭上方
  if (brianDialogActive) {
    let bfw = brianSpriteW / brianTotalFrames;
    let bdw = bfw * npcScale;
    let bdh = brianSpriteH * npcScale;

    let boxW = 280;
    let boxH = 110;
    let boxX = constrain(brianX - boxW / 2, 8, width - boxW - 8);
    let boxY = brianY - bdh / 2 - boxH - 12;
    
    push();
    rectMode(CORNER);
    fill(0, 0, 0, 180);
    rect(boxX, boxY, boxW, boxH, 10);
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    text(brianQuestion.text, boxX + 15, boxY + 15);

    // 顯示回饋文字
    if (brianQuestion.answered) {
      fill(brianQuestion.feedback === brianQuestion.correct ? 'lightgreen' : 'pink');
      textSize(16);
      textAlign(CENTER, CENTER);
      text(brianQuestion.feedback, boxX + boxW / 2, boxY + 75);
    }

    pop();

    // 關閉機制：若已選擇 兩秒後自動關閉
    if (brianQuestion.answered) {
      if (brianFeedbackTimer === 0) brianFeedbackTimer = millis();
      if (millis() - brianFeedbackTimer > 2000) {
        brianDialogActive = false;
        hideAnswerInput();
        currentNpc = null;
      }
    }
  }
  }

  // 檢查玩家是否接近 Chiyo (background3)
  if (currentBgIndex === 2) {
    let dc = dist(characterX, characterY, chiyoX, chiyoY);
    if (dc < 120) {
      if (!chiyoDialogActive && !chiyoAsked && !chiyoQuestion.answered) {
        currentNpc = 'chiyo';
        chiyoDialogActive = true;
        chiyoAsked = true;
        chiyoQuestion = random(questions);
        questionStartTime = millis();
        showAnswerInput();
      }
    } else if (dc > 160) {
      chiyoAsked = false;
      if (chiyoDialogActive) {
        chiyoDialogActive = false;
        hideAnswerInput();
        currentNpc = null;
      }
    }

    // 畫出 Chiyo 的問答 UI
    if (chiyoDialogActive) {
      let cfw = chiyoSpriteW / chiyoTotalFrames;
      let cdw = cfw * npcScale;
      let cdh = chiyoSpriteH * npcScale;

      let boxW = 300;
      let boxH = 110;
      let boxX = constrain(chiyoX - boxW / 2, 8, width - boxW - 8);
      let boxY = chiyoY - cdh / 2 - boxH - 12;

      push();
      rectMode(CORNER);
      fill(0, 0, 0, 180);
      rect(boxX, boxY, boxW, boxH, 10);
      fill(255);
      textSize(16);
      textAlign(LEFT, TOP);
      text(chiyoQuestion.text, boxX + 15, boxY + 15);

      if (chiyoQuestion.answered) {
        fill(chiyoQuestion.feedback === chiyoQuestion.correct ? 'lightgreen' : 'pink');
        textSize(16);
        textAlign(CENTER, CENTER);
        text(chiyoQuestion.feedback, boxX + boxW / 2, boxY + 75);
      }
      pop();

      if (chiyoQuestion.answered) {
        if (chiyoFeedbackTimer === 0) chiyoFeedbackTimer = millis();
        if (millis() - chiyoFeedbackTimer > 2000) {
          chiyoDialogActive = false;
          hideAnswerInput();
          currentNpc = null;
        }
      }
    }
  }

  // 處理 Rinne (提示角色)
  let isQuestionActive = false;
  let currentHint = '';
  
  if (currentNpc === 'cirno' && cirnoDialogActive && !cirnoQuestion.answered) {
    isQuestionActive = true;
    currentHint = cirnoQuestion.hint;
  } else if (currentNpc === 'brian' && brianDialogActive && !brianQuestion.answered) {
    isQuestionActive = true;
    currentHint = brianQuestion.hint;
  } else if (currentNpc === 'chiyo' && chiyoDialogActive && !chiyoQuestion.answered) {
    isQuestionActive = true;
    currentHint = chiyoQuestion.hint;
  }

  if (isQuestionActive && millis() - questionStartTime > 4000) {
    rinneVisible = true;
  } else {
    rinneVisible = false;
  }

  if (rinneVisible) {
    rinneFrameCount++;
    if (rinneFrameCount >= rinneFrameDelay) {
      rinneFrameCount = 0;
      rinneFrame = (rinneFrame + 1) % rinneTotalFrames;
    }
    
    // 設定 Rinne 位置 (在玩家左上方，若空間不足則移至右上方)
    rinneX = characterX - 450;
    if (rinneX < 50) rinneX = characterX + 150;
    rinneY = characterY - 200;

    let rfw = rinneSpriteW / rinneTotalFrames;
    let rdw = rfw * npcScale;
    let rdh = rinneSpriteH * npcScale;

    push();
    translate(rinneX, rinneY);
    if (rinneLoaded && rinneSprite) {
      image(rinneSprite, 0, 0, rdw, rdh, rinneFrame * rfw, 0, rfw, rinneSpriteH);
    }
    
    // 繪製提示對話框 (在 Rinne 頭上)
    let boxW = 200;
    let boxH = 60;
    fill(255, 255, 200, 230);
    rect(0, -boxH - 10, boxW, boxH, 10);
    fill(0);
    textSize(14);
    textAlign(LEFT, TOP);
    text("提示: " + currentHint, 10, -boxH, boxW - 20, boxH);
    pop();
  }

  // 當需要回答問題時，在玩家頭上繪製輸入UI
  if (answerInput && answerInput.elt.style.display !== 'none') {
    // 計算UI位置，使其在角色頭頂
    let dh = (state === 'jump' ? 50 : 49) * playerScale; // 角色高度
    let boxW = 280;
    let boxH = 40;
    let boxX = characterX - boxW / 2;
    let boxY = characterY - dh - boxH - 10 + 150;

    // 繪製淺色底板
    push();
    fill(240, 240, 240, 220); // 淺灰色半透明底板
    noStroke();
    rect(boxX, boxY, boxW, boxH, 8);
    fill(0);
    textSize(16);
    textAlign(LEFT, CENTER);
    text('請回答:', boxX + 10, boxY + boxH / 2);
    pop();

    // 更新輸入框和按鈕的位置
    answerInput.position(boxX + 80, boxY + (boxH - answerInput.height) / 2);
    submitButton.position(answerInput.x + answerInput.width + 10, boxY + (boxH - submitButton.height) / 2);
  }

  // 如果到了background3，並且回答問題，在中間偏上的位置寫"恭喜過關"
  if (currentBgIndex === 2 && chiyoQuestion.answered) {
    push();
    textSize(60);
    textAlign(CENTER, CENTER);
    fill(255, 215, 0);
    stroke(0);
    strokeWeight(5);
    text("恭喜過關", width / 2, height / 2 - 150);
    pop();
  }
}

function keyPressed() {
  // 當對話框開啟時，Enter 鍵用於提交答案
  if ((cirnoDialogActive || brianDialogActive || chiyoDialogActive) && keyCode === ENTER) {
    submitAnswer();
    return;
  }

  keysPressed[key] = true;
  
  // 處理空白鍵攻擊
  if (key === ' ' && !isAttacking && state !== 'hit') {
    isAttacking = true;
    state = 'hit';
    currentFrame = 0;
    frameCount = 0;
    return false;
  }
  
  // 防止 W 鍵在瀏覽器中觸發默認行為
  if (key === 'w' || key === 'W') {
    return false;
  }
}

function keyReleased() {
  keysPressed[key] = false;
  return false;
}

function drawWeapon(weapon) {
  let frameWidth = 310 / 15;  // 20.67
  let frameHeight = 16;
  let srcX = weapon.currentFrame * frameWidth;
  
  let dw = frameWidth * playerScale;
  let dh = frameHeight * playerScale;
  
  push();
  translate(weapon.x, weapon.y);
  if (weapon.vx < 0) {
    // 向左時翻轉
    scale(-1, 1);
  }
  translate(-dw / 2, -dh / 2);
  
  if (spriteSheetWeapon) {
    image(spriteSheetWeapon, 0, 0, dw, dh, srcX, 0, frameWidth, frameHeight);
  }
  pop();
}

function createAnswerInput() {
  answerInput = createInput();
  answerInput.size(120, 20);
  submitButton = createButton('送出答案');
  submitButton.mousePressed(submitAnswer);

  hideAnswerInput(); // 預設隱藏
}

function showAnswerInput() {
  answerInput.show();
  submitButton.show();
}

function hideAnswerInput() {
  answerInput.hide();
  submitButton.hide();
  answerInput.value(''); // 清空輸入框
}

function submitAnswer() {
  let playerAnswer = answerInput.value().trim();
  if (playerAnswer === '') return;

  if (currentNpc === 'cirno' && !cirnoQuestion.answered) {
    if (playerAnswer === cirnoQuestion.answer) {
      cirnoQuestion.feedback = cirnoQuestion.correct;
    } else {
      cirnoQuestion.feedback = cirnoQuestion.wrong;
    }
    cirnoQuestion.answered = true;
    cirnoFeedbackTimer = 0; // 重置計時器
    hideAnswerInput();
  } else if (currentNpc === 'brian' && !brianQuestion.answered) {
    if (playerAnswer === brianQuestion.answer) {
      brianQuestion.feedback = brianQuestion.correct;
    } else {
      brianQuestion.feedback = brianQuestion.wrong;
    }
    brianQuestion.answered = true;
    brianFeedbackTimer = 0; // 重置計時器
    hideAnswerInput();
  } else if (currentNpc === 'chiyo' && !chiyoQuestion.answered) {
    if (playerAnswer === chiyoQuestion.answer) {
      chiyoQuestion.feedback = chiyoQuestion.correct;
    } else {
      chiyoQuestion.feedback = chiyoQuestion.wrong;
    }
    chiyoQuestion.answered = true;
    chiyoFeedbackTimer = 0;
    hideAnswerInput();
  }
}



function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
