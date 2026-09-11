# Backend — arquitetura em camadas

```text
backend/
├── config/
├── controllers/
├── database/
├── middlewares/
├── models/
├── repositories/
├── routes/
├── services/
├── utils/
└── server.js
```

Fluxo recomendado:

`Route -> Controller -> Service -> Repository -> Model -> SQLite`

O acesso administrativo é protegido por JWT e pelo middleware `adminOnly`.
