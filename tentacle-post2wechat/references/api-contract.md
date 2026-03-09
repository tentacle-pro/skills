# API Contract (Client → api.tentacle.pro)

All endpoints require:

- `Authorization: Bearer <APP_SECRET>`
- `X-App-ID: <APP_ID>` (optional, but recommended for defense-in-depth)

Server maps `APP_ID + sha256(APP_SECRET)` → client record → WeChat account binding.

## 1) Upload Cover (Permanent Material)

`POST /post2wechat/upload/permanent-image`

Request: `multipart/form-data`
- `media`: file (optional when `image_url` provided)
- `image_url`: remote image url (optional when `media` provided)

Response:
```json
{
  "ok": true,
  "request_id": "...",
  "data": {
    "media_id": "MEDIA_ID",
    "url": "https://mmbiz.qpic.cn/..."
  }
}
```

## 2) Upload Inline Image (Article Image)

`POST /post2wechat/upload/article-image`

Request: `multipart/form-data`
- `media`: file (optional when `image_url` provided)
- `image_url`: remote image url (optional when `media` provided)

Response:
```json
{
  "ok": true,
  "request_id": "...",
  "data": {
    "url": "https://mmbiz.qpic.cn/..."
  }
}
```

## 3) Save Draft

`POST /post2wechat/draft/add`

Request:
```json
{
  "title": "...",
  "author": "...",
  "digest": "...",
  "content": "<html-fragment>",
  "thumb_media_id": "MEDIA_ID",
  "need_open_comment": 1,
  "only_fans_can_comment": 0
}
```

Response:
```json
{
  "ok": true,
  "request_id": "...",
  "data": {
    "media_id": "DRAFT_MEDIA_ID"
  }
}
```

## Notes

- Service resolves AppID/AppSecret from API_KEY on server side.
- Service should cache and refresh WeChat access_token internally.
- Client only sends publishing payload and media.
