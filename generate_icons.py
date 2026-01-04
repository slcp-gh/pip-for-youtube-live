#!/usr/bin/env python3
"""
シンプルなアイコン生成スクリプト（PIL/Pillowを使用）
pip install Pillow が必要です
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("エラー: Pillowがインストールされていません")
    print("以下のコマンドでインストールしてください:")
    print("  pip install Pillow")
    exit(1)

def create_icon(size):
    """指定サイズのアイコンを生成"""
    # 背景色（YouTube赤）
    img = Image.new('RGB', (size, size), color='#FF0000')
    draw = ImageDraw.Draw(img)

    # 白い背景
    margin = size // 8
    draw.rounded_rectangle(
        [(margin, margin), (size - margin, size - margin)],
        radius=size // 16,
        fill='white'
    )

    # 赤い四角（動画を表現）
    video_x = size * 5 // 8
    video_y = size * 3 // 8
    video_w = size - margin - size // 16
    video_h = size * 5 // 8
    draw.rounded_rectangle(
        [(video_x, video_y), (video_w, video_h)],
        radius=size // 64,
        fill='#FF0000'
    )

    # テキスト "YT"（左側）
    try:
        font_size = size // 3
        # システムフォントを試す
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                font = ImageFont.load_default()

        draw.text((margin + size // 16, size // 2), "YT", fill='#FF0000', font=font, anchor='lm')

        # "C"（チャットを表現）
        small_font_size = size // 6
        try:
            small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", small_font_size)
        except:
            try:
                small_font = ImageFont.truetype("arial.ttf", small_font_size)
            except:
                small_font = ImageFont.load_default()

        draw.text((video_x + size // 16, size // 2), "C", fill='white', font=small_font, anchor='lm')
    except Exception as e:
        print(f"警告: テキスト描画エラー: {e}")

    return img

# iconsディレクトリを作成
os.makedirs('icons', exist_ok=True)

print("アイコンを生成しています...")

# 各サイズのアイコンを生成
sizes = [16, 48, 128]
for size in sizes:
    icon = create_icon(size)
    filename = f'icons/icon{size}.png'
    icon.save(filename)
    print(f"✓ {filename} を生成しました")

print("\n完了！拡張機能を読み込む準備ができました。")
