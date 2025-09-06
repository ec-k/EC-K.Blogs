## リポジトリ概要

markdown で記述された記事をブログとして公開するもの．github pages でホストする．記事は別のリポジトリに存在し，これを github actions で公開時に fetch する．SSG でビルドする

- 技術スタック: React + Next.js + Typescript + Tailwind CSS

## 開発規約

- コンポーネントの props は分割代入を使用
- any 型の使用を避ける
- Google TypeScript Style Guide に倣う
- 各コンポーネントには単体テストが必要
- React Testing Library を使用
- テストカバレッジは 80%以上
