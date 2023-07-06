# How to run

## Initial setip

### Install dependencies

```bash
npm install
```

### Add environment variables to .env file

```bash
DATABASE_URL=<database-url>
JWT_SECRET=<jwt-secret>
```


### Run migrations if needed

```bash
npx prisma migrate dev --name init
```

### Run seed if needed

```bash
node seed.js
```

### Generate prisma client
```bash
npx prisma generate
```

## Run the development server
```bash
npm run dev
```
