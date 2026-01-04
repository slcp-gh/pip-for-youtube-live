// YouTube Live PIP with Chat - Content Script

// YouTube Liveページかどうかを確認
function isLivePage() {
  const url = window.location.href;
  return url.includes('youtube.com/watch') || url.includes('youtube.com/live');
}

// チャットフレームを見つける
function getChatFrame() {
  return document.querySelector('#chat-container iframe, ytd-live-chat-frame iframe');
}

// 動画要素を取得
function getVideoElement() {
  return document.querySelector('video.html5-main-video, video');
}

// ビデオIDを取得
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v') || window.location.pathname.split('/').pop();
}

// チャットURLを取得
function getChatUrl() {
  const chatFrame = getChatFrame();
  if (chatFrame && chatFrame.src) {
    return chatFrame.src;
  }
  const videoId = getVideoId();
  return `https://www.youtube.com/live_chat?is_popout=1&v=${videoId}`;
}

// Document PiP ウィンドウを保持
let pipWindow = null;

// Document Picture-in-Picture で動画+チャットを表示
async function openDocumentPiP() {
  const video = getVideoElement();
  if (!video) {
    alert('動画が見つかりません');
    return;
  }

  // Document PiP API がサポートされているか確認
  if (!('documentPictureInPicture' in window)) {
    alert('このブラウザはDocument Picture-in-Picture APIをサポートしていません。Chrome 116以上が必要です。');
    // フォールバック: 従来の方式
    fallbackToPIP();
    return;
  }

  try {
    // 既存のPiPウィンドウがあれば閉じる
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
    }

    // Document PiP ウィンドウを作成
    pipWindow = await documentPictureInPicture.requestWindow({
      width: 800,
      height: 500,
    });

    // スタイルを追加
    const style = pipWindow.document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        background: #0f0f0f;
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100vh;
        overflow: hidden;
        font-family: 'Roboto', Arial, sans-serif;
      }
      #video-container {
        flex: 1;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
      }
      #video-container video {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      #chat-container {
        width: 350px;
        height: 100%;
        background: #0f0f0f;
        border-left: 1px solid #333;
        display: flex;
        flex-direction: column;
      }
      #chat-container.hidden {
        display: none;
      }
      #chat-container iframe {
        flex: 1;
        width: 100%;
        border: none;
      }
      #controls {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
        gap: 8px;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 1000;
      }
      body:hover #controls {
        opacity: 1;
      }
      #controls button {
        background: rgba(255,255,255,0.2);
        border: none;
        color: #fff;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
      }
      #controls button:hover {
        background: rgba(255,255,255,0.3);
      }
      #controls button.active {
        background: rgba(255,100,100,0.5);
      }
      .spacer {
        flex: 1;
      }
      /* 縦レイアウト */
      body.vertical {
        flex-direction: column;
      }
      body.vertical #chat-container {
        width: 100%;
        height: 250px;
        border-left: none;
        border-top: 1px solid #333;
      }
    `;
    pipWindow.document.head.appendChild(style);

    // コントロールバーを作成
    const controls = pipWindow.document.createElement('div');
    controls.id = 'controls';
    controls.innerHTML = `
      <button id="toggle-layout" title="レイアウト切替">⇄</button>
      <button id="toggle-chat" title="チャット表示/非表示">💬</button>
      <span class="spacer"></span>
      <button id="close-btn" title="閉じる">✕</button>
    `;
    pipWindow.document.body.appendChild(controls);

    // 動画コンテナを作成
    const videoContainer = pipWindow.document.createElement('div');
    videoContainer.id = 'video-container';
    pipWindow.document.body.appendChild(videoContainer);

    // 動画要素を移動（元のページから）
    const originalParent = video.parentElement;
    videoContainer.appendChild(video);

    // チャットコンテナを作成
    const chatContainer = pipWindow.document.createElement('div');
    chatContainer.id = 'chat-container';
    pipWindow.document.body.appendChild(chatContainer);

    // チャットiframeを作成
    const chatIframe = pipWindow.document.createElement('iframe');
    chatIframe.src = getChatUrl();
    chatIframe.allow = 'autoplay';
    chatContainer.appendChild(chatIframe);

    // イベントリスナー
    let isVertical = false;
    let isChatVisible = true;

    pipWindow.document.getElementById('toggle-layout').addEventListener('click', () => {
      isVertical = !isVertical;
      pipWindow.document.body.classList.toggle('vertical', isVertical);
    });

    pipWindow.document.getElementById('toggle-chat').addEventListener('click', () => {
      isChatVisible = !isChatVisible;
      chatContainer.classList.toggle('hidden', !isChatVisible);
    });

    pipWindow.document.getElementById('close-btn').addEventListener('click', () => {
      pipWindow.close();
    });

    // キーボードショートカット
    pipWindow.document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        pipWindow.document.getElementById('toggle-layout').click();
      }
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        pipWindow.document.getElementById('toggle-chat').click();
      }
      if (e.key === 'Escape') {
        pipWindow.close();
      }
    });

    // PiPウィンドウが閉じられたら動画を元に戻す
    pipWindow.addEventListener('pagehide', () => {
      if (originalParent && video.parentElement !== originalParent) {
        originalParent.appendChild(video);
      }
      pipWindow = null;
    });

    console.log('Document PiP opened with video and chat');

  } catch (err) {
    console.error('Document PiP failed:', err);
    alert('PIPを開けませんでした: ' + err.message);
  }
}

// フォールバック: 従来のネイティブPIP + チャットウィンドウ
async function fallbackToPIP() {
  const video = getVideoElement();
  if (video) {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }
      await video.requestPictureInPicture();
    } catch (err) {
      console.error('Native PIP failed:', err);
    }
  }
  
  // チャットウィンドウを開く
  chrome.runtime.sendMessage({
    action: 'openChatWindow',
    chatUrl: getChatUrl()
  });
}

// カスタムPIPボタンを作成
function createPipButton() {
  const button = document.createElement('button');
  button.id = 'youtube-live-pip-button';
  button.className = 'ytp-button youtube-live-pip-btn';
  button.title = 'チャット付きPIP';
  button.innerHTML = `
    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
      <path d="M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10 L7,10 L7,25 L29,25 L29,25 Z M29,8 C30.1,8 31,8.9 31,10 L31,25 C31,26.1 30.1,27 29,27 L7,27 C5.9,27 5,26.1 5,25 L5,10 C5,8.9 5.9,8 7,8 L29,8 L29,8 Z" fill="#fff"></path>
      <text x="20" y="20" font-size="8" fill="#fff" font-weight="bold">C</text>
    </svg>
  `;

  button.addEventListener('click', () => {
    openDocumentPiP();
  });

  return button;
}

// プレイヤーコントロールにボタンを追加
function addPipButtonToPlayer() {
  const rightControls = document.querySelector('.ytp-right-controls');

  if (rightControls && !document.getElementById('youtube-live-pip-button')) {
    const pipButton = createPipButton();
    rightControls.insertBefore(pipButton, rightControls.firstChild);
    console.log('YouTube Live PIP button added');
  }
}

// ページ読み込み完了後にボタンを追加
function init() {
  if (!isLivePage()) {
    return;
  }

  // プレイヤーが読み込まれるまで待機
  const observer = new MutationObserver(() => {
    const rightControls = document.querySelector('.ytp-right-controls');
    if (rightControls) {
      addPipButtonToPlayer();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 初回試行
  setTimeout(addPipButtonToPlayer, 2000);
}

// ページ遷移を監視（YouTube SPA対応）
let lastUrl = location.href;
new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    setTimeout(init, 1000);
  }
}).observe(document.body, { childList: true, subtree: true });

// 初期化
init();
