// YouTube Live PIP with Chat - Background Script

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openPipWindow') {
    openPipWindow(request.videoId, request.chatUrl);
  }
  if (request.action === 'openChatWindow') {
    openChatWindow(request.chatUrl);
  }
});

// チャットウィンドウを開く（直接YouTubeのチャットURLを開く）
async function openChatWindow(chatUrl) {
  // ウィンドウサイズ設定（チャット用に縦長）
  const width = 400;
  const height = 700;

  // 画面の右端に配置
  const screenWidth = await getScreenWidth();
  const left = screenWidth - width - 20;
  const top = 50;

  // YouTubeのチャットURLを直接開く（iframeではなく直接）
  chrome.windows.create({
    url: chatUrl,
    type: 'popup',
    width: width,
    height: height,
    left: left,
    top: top,
    focused: false  // PIPにフォーカスを残す
  }, (window) => {
    console.log('Chat window created:', window.id);
  });
}

// PIPウィンドウを開く（旧方式・フォールバック用）
async function openPipWindow(videoId, chatUrl) {
  const pipUrl = chrome.runtime.getURL('pip.html') +
    `?videoId=${encodeURIComponent(videoId)}&chatUrl=${encodeURIComponent(chatUrl)}`;

  // ウィンドウサイズ設定
  const width = 800;
  const height = 600;

  // 画面の右下に配置
  const screenWidth = await getScreenWidth();
  const screenHeight = await getScreenHeight();
  const left = screenWidth - width - 20;
  const top = screenHeight - height - 80;

  // 新しいウィンドウを作成
  chrome.windows.create({
    url: pipUrl,
    type: 'popup',
    width: width,
    height: height,
    left: left,
    top: top,
    focused: true
  }, (window) => {
    console.log('PIP window created:', window.id);
  });
}

// 画面サイズを取得するヘルパー関数
async function getScreenWidth() {
  return new Promise((resolve) => {
    chrome.system?.display?.getInfo((displays) => {
      if (displays && displays.length > 0) {
        resolve(displays[0].bounds.width);
      } else {
        resolve(1920); // デフォルト値
      }
    }) || resolve(1920);
  });
}

async function getScreenHeight() {
  return new Promise((resolve) => {
    chrome.system?.display?.getInfo((displays) => {
      if (displays && displays.length > 0) {
        resolve(displays[0].bounds.height);
      } else {
        resolve(1080); // デフォルト値
      }
    }) || resolve(1080);
  });
}
