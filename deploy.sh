#!/bin/bash
# Deploy Panda Pinyin to GitHub Pages. Usage: ./deploy.sh "message"
set -e
cd /workspace/panda-pinyin
python3 tools/build_sw.py
git add -A
git -c user.name=jere8899-collab -c user.email=jere8899-collab@users.noreply.github.com commit -q -m "${1:-update}" || echo "nothing to commit"
git push -q origin main
git log --oneline -1
