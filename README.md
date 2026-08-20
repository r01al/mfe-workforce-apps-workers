# Workforce Workers Remote

Independent worker-directory micro-frontend. It exposes `./Workers` from `workersMfe` and owns the nested details, skills, and schedule routes.

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm start
```

`npm run dev` renders Workers and its nested routes independently at
`http://localhost:3005/workers` with browser-only development data. The shell
and other remotes are not required.
