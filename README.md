# The Last of Guss

## Dev-mode

```sh
npm install
npm run dev
```

## Стек

- Vite + React + TypeScript
- React Router для навигации
- MobX / mobx-react-lite для состояния
- Ant Design для UI
- Генерируемый OpenAPI-клиент

### API клиент

- Генерируется с помощью `@openapitools/openapi-generator-cli` на основе `openapitools.json`.
- Сгенерированный слой лежит в `src/shared/api`.
