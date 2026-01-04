// YouTube Live PIP Window Script

let isVerticalLayout = false;
let isChatVisible = true;
let isStayOnTop = false;

// URLパラメータから情報を取得
function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    videoId: params.get('videoId'),
    chatUrl: params.get('chatUrl')
  };
}

// iframeを設定
function setupIframes() {
  const { videoId, chatUrl } = getParams();

  if (!videoId) {
    console.error('Video ID not found');
    return;
  }

  const videoFrame = document.getElementById('video-frame');
  
  // 埋め込みURLのリスト（フォールバック順）
  const embedUrls = [
    `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`,
    `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&origin=${encodeURIComponent(window.location.origin)}`
  ];
  
  let currentUrlIndex = 0;
  
  // エラー時のフォールバック処理
  videoFrame.onerror = () => {
    currentUrlIndex++;
    if (currentUrlIndex < embedUrls.length) {
      videoFrame.src = embedUrls[currentUrlIndex];
    }
  };
  
  // 最初のURLを試す
  videoFrame.src = embedUrls[0];

  // チャットiframeのURL
  const chatFrame = document.getElementById('chat-frame');
  if (chatUrl) {
    chatFrame.src = chatUrl;
  } else {
    chatFrame.src = `https://www.youtube.com/live_chat?is_popout=1&v=${videoId}`;
  }
}

// レイアウト切替
function toggleLayout() {
  const container = document.getElementById('container');
  isVerticalLayout = !isVerticalLayout;

  if (isVerticalLayout) {
    container.classList.add('vertical');
  } else {
    container.classList.remove('vertical');
  }

  // レイアウトに応じてウィンドウサイズを調整
  if (isVerticalLayout) {
    // 縦レイアウト: 幅は狭く、高さは高く
    window.resizeTo(600, 800);
  } else {
    // 横レイアウト: 幅は広く、高さは低く
    window.resizeTo(800, 600);
  }
}

// チャット表示/非表示
function toggleChat() {
  const chatContainer = document.getElementById('chat-container');
  isChatVisible = !isChatVisible;

  if (isChatVisible) {
    chatContainer.classList.remove('hidden');
  } else {
    chatContainer.classList.add('hidden');
  }
}

// 常に手前に表示（制限あり）
function toggleStayOnTop() {
  isStayOnTop = !isStayOnTop;
  const btn = document.getElementById('stay-on-top');

  if (isStayOnTop) {
    btn.classList.add('active');
    // Chrome拡張では真の「常に手前」は実装できないため、
    // フォーカス時に最前面に持ってくる
    window.focus();
  } else {
    btn.classList.remove('active');
  }
}

// ウィンドウを閉じる
function closeWindow() {
  window.close();
}

// リサイズハンドル
function setupResizeHandle() {
  const resizeHandle = document.getElementById('resize-handle');
  const chatContainer = document.getElementById('chat-container');
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = chatContainer.offsetWidth;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const deltaX = startX - e.clientX;
    const newWidth = startWidth + deltaX;

    // 最小幅と最大幅を制限
    if (newWidth >= 200 && newWidth <= 600) {
      chatContainer.style.width = newWidth + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isResizing = false;
  });
}

// イベントリスナーを設定
function setupEventListeners() {
  document.getElementById('toggle-layout').addEventListener('click', toggleLayout);
  document.getElementById('toggle-chat').addEventListener('click', toggleChat);
  document.getElementById('stay-on-top').addEventListener('click', toggleStayOnTop);
  document.getElementById('close-btn').addEventListener('click', closeWindow);

  // キーボードショートカット
  document.addEventListener('keydown', (e) => {
    // Ctrl + L: レイアウト切替
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      toggleLayout();
    }
    // Ctrl + H: チャット表示/非表示
    if (e.ctrlKey && e.key === 'h') {
      e.preventDefault();
      toggleChat();
    }
    // Esc: ウィンドウを閉じる
    if (e.key === 'Escape') {
      closeWindow();
    }
  });

  // 常に手前に表示を維持（フォーカスが外れたら戻す）
  window.addEventListener('blur', () => {
    if (isStayOnTop) {
      setTimeout(() => {
        window.focus();
      }, 100);
    }
  });
}

// 初期化
function init() {
  setupIframes();
  setupEventListeners();
  setupResizeHandle();

  // タイトルを設定
  const { videoId } = getParams();
  document.title = `YouTube Live PIP - ${videoId}`;

  console.log('YouTube Live PIP initialized');
  console.log('Shortcuts:');
  console.log('- Ctrl + L: Toggle layout');
  console.log('- Ctrl + H: Toggle chat');
  console.log('- Esc: Close window');
}

// DOMContentLoaded後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
