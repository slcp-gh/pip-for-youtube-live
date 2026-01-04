#!/bin/bash

# シンプルなアイコン生成スクリプト
# ImageMagickが必要です: sudo apt-get install imagemagick

echo "アイコンを生成しています..."

# ImageMagickがインストールされているか確認
if ! command -v convert &> /dev/null; then
    echo "エラー: ImageMagickがインストールされていません"
    echo "以下のコマンドでインストールしてください:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    exit 1
fi

# iconsディレクトリを作成
mkdir -p icons

# 16x16アイコン
convert -size 16x16 xc:red \
    -fill white -draw "rectangle 2,2 14,14" \
    -fill red -draw "rectangle 9,6 14,10" \
    icons/icon16.png

# 48x48アイコン
convert -size 48x48 xc:red \
    -fill white -draw "roundrectangle 6,6 42,42 3,3" \
    -fill red -draw "roundrectangle 26,18 42,30 1,1" \
    -font Arial -pointsize 16 -fill red -draw "text 10,30 'YT'" \
    -font Arial -pointsize 8 -fill white -draw "text 29,27 'C'" \
    icons/icon48.png

# 128x128アイコン
convert -size 128x128 xc:red \
    -fill white -draw "roundrectangle 16,16 112,112 8,8" \
    -fill red -draw "roundrectangle 70,42 108,70 2,2" \
    -font Arial -pointsize 42 -fill red -draw "text 26,75 'YT'" \
    -font Arial -pointsize 18 -fill white -draw "text 78,68 'C'" \
    icons/icon128.png

echo "✓ アイコンが生成されました!"
echo "  - icons/icon16.png"
echo "  - icons/icon48.png"
echo "  - icons/icon128.png"
