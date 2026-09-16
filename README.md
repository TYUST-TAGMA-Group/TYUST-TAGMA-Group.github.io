# TAGMA Group Website

TAGMA（Theory and Applications of Graph Machine leArning）课题组官网，王杰老师课题组。

线上地址：https://tyust-tagma-group.github.io/

## 目录结构

```
.
├── contents          # 网站文字/数据内容（改这里，不用碰 HTML/CSS/JS）
│   ├── config.yml       # 站点标题、导航文字等
│   ├── home.md          # 首页 About 段落
│   ├── people.yml        # 成员名单
│   ├── news.yml          # 新闻动态
│   └── achievements.yml  # 历年成果（论文/专利）
├── author             # 组内成员各自的个人主页子目录
│   └── zhang-yunshan/
├── static             # 框架代码 + 图片资源，一般不需要改
└── .github/workflows  # GitHub Pages 自动部署配置
```

## 日常维护

加成员、加新闻、加成果这类内容更新，只需要改 `contents/` 下对应的 YAML/Markdown 文件，push 到 `main` 分支即可自动部署，详见 [维护手册.md](./维护手册.md)。

## 致谢

本站基于 [Yixin Huang 的个人主页模板](https://github.com/Yixin0313/personal-homepage-template)（MIT License）二次开发，该模板又是基于 [Sen Li 的学术主页模板](https://github.com/senli1073/senli1073.github.io) 修改而来。
