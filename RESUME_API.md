# Resume API 文档

本文档面向 `Spring Boot 3` 后端实现，按当前前端编辑器与打印/导出链路整理。

命名约定：

- 请求体 DTO：`Create...RequestPost` / `Update...RequestPut`
- 响应体 VO：`...VO`

## 1. 创建简历

- Method: `POST`
- Path: `/api/resumes`
- 用途：创建一份新简历，并初始化当前版本 `version_no = 1`

### Request DTO

`CreateResumesRequestPost`

```json
{
  "templateId": 1,
  "title": "前端开发简历"
}
```

### Response VO

`ResumesVO`

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "resumeId": 123,
    "currentVersionId": 456,
    "versionNo": 1,
    "title": "前端开发简历",
    "templateId": 1,
    "status": "draft",
    "contentJson": {
      "modules": []
    },
    "layoutJson": {
      "moduleOrder": [],
      "hiddenModuleKeys": [],
      "theme": {
        "templateCode": "simple",
        "fontFamily": "Source Han Sans",
        "titleSize": 24,
        "bodySize": 13,
        "lineHeight": 1.6,
        "primaryColor": "#2563eb"
      },
      "page": {
        "size": "A4",
        "margin": "10mm"
      }
    }
  }
}
```

## 2. 获取简历详情

- Method: `GET`
- Path: `/api/resumes/{resumeId}`
- 用途：进入编辑页时获取当前简历和当前版本内容

### Response VO

`ResumesVO`

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "resumeId": 123,
    "currentVersionId": 456,
    "versionNo": 3,
    "title": "前端开发简历",
    "templateId": 1,
    "status": "draft",
    "contentJson": {
      "modules": [
        {
          "key": "personal",
          "type": "personal",
          "data": {
            "name": "张三",
            "title": "前端开发工程师",
            "phone": "13800000000",
            "email": "zhangsan@example.com",
            "address": "杭州",
            "photo": "https://example.com/avatar.png",
            "photoReverse": false
          }
        }
      ]
    },
    "layoutJson": {
      "moduleOrder": ["personal", "education", "project", "skills"],
      "hiddenModuleKeys": ["awards"],
      "theme": {
        "templateCode": "simple",
        "fontFamily": "Source Han Sans",
        "titleSize": 24,
        "bodySize": 13,
        "lineHeight": 1.6,
        "primaryColor": "#2563eb"
      },
      "page": {
        "size": "A4",
        "margin": "10mm"
      }
    }
  }
}
```

## 3. 自动保存草稿

- Method: `PUT`
- Path: `/api/resumes/{resumeId}/draft`
- 用途：前端防抖自动保存当前编辑内容
- 说明：该接口更新当前草稿，不新建版本号

### Request DTO

`UpdateResumesDraftRequestPut`

```json
{
  "title": "前端开发简历",
  "templateId": 1,
  "contentJson": {
    "modules": [
      {
        "key": "personal",
        "type": "personal",
        "data": {
          "name": "张三",
          "title": "前端开发工程师",
          "phone": "13800000000",
          "email": "zhangsan@example.com",
          "address": "杭州",
          "photo": "https://example.com/avatar.png",
          "photoReverse": false
        }
      },
      {
        "key": "project",
        "type": "section",
        "cardType": "project",
        "title": "项目经历",
        "items": [
          {
            "id": 1,
            "title": "智能简历平台",
            "role": "前端负责人",
            "location": "杭州",
            "projectLink": "https://resume.example.com",
            "content": "<p>负责编辑器与打印链路...</p>"
          }
        ]
      }
    ]
  },
  "layoutJson": {
    "moduleOrder": ["personal", "project", "skills"],
    "hiddenModuleKeys": [],
    "theme": {
      "templateCode": "simple",
      "fontFamily": "Source Han Sans",
      "titleSize": 24,
      "bodySize": 13,
      "lineHeight": 1.6,
      "primaryColor": "#2563eb"
    },
    "page": {
      "size": "A4",
      "margin": "10mm"
    }
  }
}
```

### Response VO

`ResumesVO`

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "resumeId": 123,
    "currentVersionId": 456,
    "versionNo": 3,
    "title": "前端开发简历",
    "templateId": 1,
    "status": "draft",
    "contentJson": {
      "modules": []
    },
    "layoutJson": {
      "moduleOrder": [],
      "hiddenModuleKeys": []
    }
  }
}
```

## 4. 创建新版本

- Method: `POST`
- Path: `/api/resumes/{resumeId}/versions`
- 用途：用户手动保存版本时，创建新的版本快照

### Request DTO

`CreateResumeVersionsRequestPost`

```json
{
  "changeNote": "优化项目经历与技能模块",
  "title": "前端开发简历",
  "templateId": 1,
  "contentJson": {
    "modules": []
  },
  "layoutJson": {
    "moduleOrder": [],
    "hiddenModuleKeys": []
  }
}
```

### Response VO

`ResumeVersionsVO`

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "versionId": 789,
    "resumeId": 123,
    "versionNo": 4,
    "changeNote": "优化项目经历与技能模块",
    "contentJson": {
      "modules": []
    },
    "layoutJson": {
      "moduleOrder": [],
      "hiddenModuleKeys": []
    },
    "createTime": "2026-04-08 21:35:00"
  }
}
```

## 5. 获取版本列表

- Method: `GET`
- Path: `/api/resumes/{resumeId}/versions`
- 用途：展示简历历史版本列表

### Response VO

`List<ResumeVersionsVO>`

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "versionId": 789,
      "resumeId": 123,
      "versionNo": 4,
      "changeNote": "优化项目经历与技能模块",
      "createTime": "2026-04-08 21:35:00"
    },
    {
      "versionId": 456,
      "resumeId": 123,
      "versionNo": 3,
      "changeNote": "初版",
      "createTime": "2026-04-08 20:10:00"
    }
  ]
}
```

## 6. 切换当前版本

- Method: `PUT`
- Path: `/api/resumes/{resumeId}/current-version/{versionId}`
- 用途：将某个历史版本切换为当前版本

### Response VO

`ResumesVO`

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "resumeId": 123,
    "currentVersionId": 789,
    "versionNo": 4,
    "title": "前端开发简历",
    "templateId": 1,
    "status": "draft"
  }
}
```

## 7. 获取模板列表

- Method: `GET`
- Path: `/api/templates`
- 用途：创建简历、切换模板时加载模板列表

### Response VO

`List<TemplatesVO>`

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "code": "simple",
      "name": "简洁模板",
      "description": "适合校招与社招",
      "previewImageUrl": "https://example.com/template-simple.png",
      "category": "classic"
    }
  ]
}
```

## 8. 获取模板详情

- Method: `GET`
- Path: `/api/templates/{templateId}`
- 用途：加载模板 schema 和默认样式

### Response VO

`TemplatesVO`

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "code": "simple",
    "name": "简洁模板",
    "description": "适合校招与社招",
    "previewImageUrl": "https://example.com/template-simple.png",
    "category": "classic",
    "schemaJson": {},
    "styleJson": {}
  }
}
```

## 9. 导出 PDF

- Method: `POST`
- Path: `/api/resumes/{resumeId}/export/pdf`
- 用途：后端无头浏览器导出 PDF
- 说明：后端读取当前版本或指定版本，打开打印页并直接返回 PDF 文件流

### Request DTO

`ExportResumePdfRequestPost`

```json
{
  "versionId": 789
}
```

### Response

- `Content-Type: application/pdf`
- 直接返回文件流

## 10. 导出 PNG

- Method: `POST`
- Path: `/api/resumes/{resumeId}/export/png`
- 用途：后端生成 PNG 预览图

### Request DTO

`ExportResumePngRequestPost`

```json
{
  "versionId": 789
}
```

### Response

- `Content-Type: image/png`
- 直接返回文件流

## 11. 前端需要的 contentJson 结构

```json
{
  "modules": [
    {
      "key": "personal",
      "type": "personal",
      "data": {
        "name": "",
        "title": "",
        "phone": "",
        "email": "",
        "address": "",
        "photo": "",
        "photoReverse": false
      }
    },
    {
      "key": "education",
      "type": "section",
      "cardType": "education",
      "title": "教育经历",
      "items": [
        {
          "id": 1,
          "title": "",
          "major": "",
          "degree": "",
          "date": "",
          "location": "",
          "learnMethod": "",
          "content": ""
        }
      ]
    },
    {
      "key": "project",
      "type": "section",
      "cardType": "project",
      "title": "项目经历",
      "items": [
        {
          "id": 2,
          "title": "",
          "role": "",
          "location": "",
          "projectLink": "",
          "content": ""
        }
      ]
    }
  ]
}
```

## 12. 前端需要的 layoutJson 结构

```json
{
  "moduleOrder": ["personal", "education", "project", "skills"],
  "hiddenModuleKeys": [],
  "theme": {
    "templateCode": "simple",
    "fontFamily": "Source Han Sans",
    "titleSize": 24,
    "bodySize": 13,
    "lineHeight": 1.6,
    "primaryColor": "#2563eb"
  },
  "page": {
    "size": "A4",
    "margin": "10mm"
  }
}
```

## 13. 字段职责约定

- `contentJson`
  - 存简历内容本身
  - 如姓名、电话、学校、项目描述、富文本内容、项目链接等

- `layoutJson`
  - 存展示控制和排版设置
  - 如模块顺序、隐藏模块、字体、颜色、字号、页边距等

- `snapshotHtml`
  - 建议作为版本快照缓存
  - 不作为主数据源

## 14. 前端联调建议

- 创建简历成功后，直接使用返回的 `contentJson` 和 `layoutJson` 初始化编辑器
- 自动保存使用 `/api/resumes/{resumeId}/draft`
- 用户手动保存历史版本使用 `/api/resumes/{resumeId}/versions`
- 导出 PDF / PNG 建议统一走后端文件流，不再依赖前端直接拼接打印页给用户操作
