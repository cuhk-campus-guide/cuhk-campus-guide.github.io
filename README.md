# CUHK Campus Guide

[校园地图](https://cuhk-campus-guide.github.io/) · [贡献轨迹](https://cuhk-campus-guide.github.io/web-gps/) · [MIT 许可证](LICENSE)

独立维护的中大校园指南，提供校巴、到站估算、校园设施、餐饮及线路图。
本项目非香港中文大学官方服务；交通安排和开放时间以相关部门最新公告为准。

## 网页轨迹采集

从左上角菜单进入「贡献轨迹」。同意采集并允许浏览器定位后开始，
下车后上传到独立私有集合。切出页面停止并保存本机，失败记录可重试或导出。
需要保持网页在前台；网页数据不直接计入小程序积分或自动用于 ETA 模型。

原始 GPS、上传凭证和云端部署密钥不包含在本仓库中。

## 本地预览

```sh
python3 -m http.server 8766
```

打开 http://127.0.0.1:8766/ 。仅已配置的 HTTPS 发布域名和本机预览来源可上传。

网页源代码采用 MIT 许可，保留原作者版权声明。
地图、校方资料和第三方资源的使用条件见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
