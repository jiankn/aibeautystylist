# Project Rules

## Git Push 代理设置
推送到 GitHub 时，必须强制走本地 10808 端口代理。使用以下方式：
```
git -c http.proxy=http://127.0.0.1:10808 -c https.proxy=http://127.0.0.1:10808 push
```
