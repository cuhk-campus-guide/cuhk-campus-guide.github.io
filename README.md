# CUHK Campus Guide

[校园地图](https://cuhk-campus-guide.github.io/) · [贡献轨迹](https://cuhk-campus-guide.github.io/web-gps/) · [MIT 许可证](LICENSE)

独立维护的中大校园指南，提供校巴、到站估算、校园设施、餐饮及线路图。
本项目非香港中文大学官方服务；交通安排和开放时间以相关部门最新公告为准。

## 网页轨迹采集

从左上角菜单进入「贡献轨迹」。同意采集并允许浏览器定位后开始，
下车后上传到独立私有集合。切出页面停止并保存本机，失败记录可重试或导出。
需要保持网页在前台；网页数据不直接计入小程序积分或自动用于 ETA 模型。

原始 GPS、上传凭证和云端部署密钥不包含在本仓库中。

## 语言

地图菜单、线路图顶部和采集页菜单可切换「简体中文／繁體中文／English」，
浏览器会记住选择，也可直接使用 [繁體中文](https://cuhk-campus-guide.github.io/?lang=zh-Hant)
或 [English](https://cuhk-campus-guide.github.io/?lang=en) 链接。
英文地名复用现有中英资料与 OSM 英文名称；未确认英文名时保留中文。
切换只影响显示，不修改站点编号、路线、ETA 参数或上传数据。
采集或上传 GPS 时禁用语言切换，以免刷新页面中断保存。

2026-11-14：同步小程序的组合站名英文修复与简短到站状态；
手机到站列表为站名和预计时间保留独立空间，LCD 继续显示完整英文站名。
小程序页面拆分属于客户端实现，不包含在这个公开网页版仓库中。

## 本地预览

```sh
python3 -m http.server 8766
```

打开 http://127.0.0.1:8766/ 。仅已配置的 HTTPS 发布域名和本机预览来源可上传。

网页源代码采用 MIT 许可，保留原作者版权声明。
地图、校方资料和第三方资源的使用条件见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 搜索与分享

正式收录入口为首页和校巴总线路图，列在 [sitemap.xml](sitemap.xml) 中。
采集页、旧地图和实验样品带 HTML `noindex` 标记；它不是数据访问权限。
已配置规范网址、网站结构化资料、分享摘要、地图预览图和紫金色站点图标。
未声称已提交或通过 Google Search Console、Bing Webmaster Tools 的所有权验证。

```sh
python3 scripts/check_seo.py
```
