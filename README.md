# amznwl2json

## Structure

### Product Type
Expressed in TypeScript, it looks like the following type.

```ts
type Product = {
  id: string
  name: string
}
```

## Usage
- GET: `https://amznwl2json.vercel.app/convert/:wishlistId`
    - ```json
      [
        {
            "id": "B00ST0FOO0",
            "name": "ヤマハ YAMAHA ウェブキャスティングミキサー オーディオインターフェース 3チャンネル AG03 インターネット配信に便利な機能付き 音楽制作アプリケーションCubasis LE対応"
        },
        .
        .
        .
      ]
      ```

## LICENCE
MIT Licence