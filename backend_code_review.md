# Backend Code Review — chakri-bakri

Overall, for a learning project this is solid! The structure is clean, middleware is properly separated, and the auth flow makes sense. Below are the issues I found, split into **bugs/security problems** and **best practice suggestions**.

---

## 🔴 Bugs & Security Issues

### 1. No input validation on `/register` — will crash on missing fields
**File:** [authRoutes.js](file:///c:/Users/mmsay/Desktop/chakri-bakri/src/routes/authRoutes.js#L9-L11)

```js
const {username, password, email} = req.body
const hashedPassword = await bcrypt.hash(password, 8)
```

If a request comes in with no body, or with `password` missing, `bcrypt.hash(undefined, 8)` will throw an unhandled error. You should validate that `username`, `password`, and `email` are all present **before** doing anything with them:

```js
if (!username || !password || !email) {
    return res.status(400).json({ message: "username, password and email are required" })
}
```

Same problem exists on the `/login` route (line 31) — missing `username` or `password` will crash.

---

### 2. Hardcoded JWT secret fallback defeats the purpose of using env vars
**Files:** [authRoutes.js L21](file:///c:/Users/mmsay/Desktop/chakri-bakri/src/routes/authRoutes.js#L21), [authRoutes.js L48](file:///c:/Users/mmsay/Desktop/chakri-bakri/src/routes/authRoutes.js#L48), [authMiddleware.js L14](file:///c:/Users/mmsay/Desktop/chakri-bakri/src/middleware/authMiddleware.js#L14)

```js
process.env.JWT_SECRET || "your_jwt_secret_here"
```

This fallback is **the same string** in all three places AND it's also the actual value in your `.env` file. If someone reads your source code (e.g., on GitHub), they know your secret. In production, if `JWT_SECRET` isn't set, you silently fall back to a publicly known string — anyone can forge tokens.

**Better approach:** Fail loudly at startup if the secret isn't set:
```js
// in index.js at startup:
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "your_jwt_secret_here") {
    console.error("FATAL: Set a real JWT_SECRET in .env")
    process.exit(1)
}
```

---

### 3. `/register` doesn't check for duplicate users properly
**File:** [authRoutes.js L13-L27](file:///c:/Users/mmsay/Desktop/chakri-bakri/src/routes/authRoutes.js#L13-L27)

When `prisma.user.create()` fails because of a duplicate `username` or `email` (unique constraint violation), you catch it and return `503 Service Unavailable`. That's the wrong status code — `503` means "server is down". The user gets no useful information about what went wrong.

You should check for Prisma's unique constraint error specifically:
```js
catch (err) {
    if (err.code === 'P2002') {
        return res.status(409).json({ message: "Username or email already exists" })
    }
    console.log(err.message)
    res.sendStatus(500)  // 500 for actual server errors, not 503
}
```

---

### 4. `/login` leaks whether a username exists
**File:** [authRoutes.js L40-L44](file:///c:/Users/mmsay/Desktop/chakri-bakri/src/routes/authRoutes.js#L40-L44)

```js
if (!user) {return res.status(404).send({message: "user not found"})}
// ...
if(!passwordIsValid) {return res.status(401).send({message: "password not valid"})}
```

This tells an attacker exactly whether a username exists in your database (user enumeration). A common best practice is to return the **same generic message** for both cases:
```js
return res.status(401).json({ message: "Invalid credentials" })
```

> [!NOTE]
> This is a common security recommendation but depends on your app's needs. For a job tracker app it's less critical, but good to be aware of.

---

### 5. `/addJob` doesn't validate required fields
**File:** [jobRoutes.js L26-L49](file:///c:/Users/mmsay/Desktop/chakri-bakri/src/routes/jobRoutes.js#L26-L49)

Per your schema, `title` and `companyName` are required (non-nullable, no default). If a request comes in without them, Prisma will throw a cryptic error that you catch as a generic `500`. Validate upfront:

```js
if (!title || !companyName) {
    return res.status(400).json({ error: "title and companyName are required" })
}
```

---

### 6. `console.log(user)` left in the login route — logs the hashed password
**File:** [authRoutes.js L45](file:///c:/Users/mmsay/Desktop/chakri-bakri/src/routes/authRoutes.js#L45)

```js
console.log(user)
```

This prints the entire user object, **including the hashed password**, to your server logs every time someone logs in. Remove it or at least destructure out the password:
```js
const { password: _, ...userInfo } = user
console.log(userInfo)
```

---

## 🟡 Best Practice Suggestions

### 7. Bcrypt salt rounds are low
**File:** [authRoutes.js L11](file:///c:/Users/mmsay/Desktop/chakri-bakri/src/routes/authRoutes.js#L11)

```js
const hashedPassword = await bcrypt.hash(password, 8)
```

A salt round of `8` is fast but weak. The standard recommendation is **10-12**. It's a tradeoff between speed and security, but `8` is below the commonly accepted minimum:
```js
const hashedPassword = await bcrypt.hash(password, 10)
```

---

### 8. Prisma schema naming inconsistency
**File:** [schema.prisma](file:///c:/Users/mmsay/Desktop/chakri-bakri/prisma/schema.prisma#L25-L38)

Your schema mixes naming conventions:
- `companyName` — camelCase ✅
- `DateApplied` — PascalCase ❌
- `Url` — PascalCase ❌
- `Status` — PascalCase ❌

Prisma convention is **camelCase** for field names. The PascalCase fields will work, but they'll force you to use capital letters in your API requests (like `req.body.Status`), which is unusual for JSON APIs.

---

### 9. Model name `Jobs` should be singular `Job`
**File:** [schema.prisma L25](file:///c:/Users/mmsay/Desktop/chakri-bakri/prisma/schema.prisma#L25)

Prisma convention (and general ORM convention) is singular model names: `Job`, not `Jobs`. This affects your Prisma client calls too — `prisma.jobs` vs `prisma.job`.

---

### 10. No CORS configuration
**File:** [index.js](file:///c:/Users/mmsay/Desktop/chakri-bakri/src/index.js)

If your frontend is on a different port/origin (which it likely is during development), requests will be blocked by the browser. You'll need the `cors` middleware:
```bash
npm install cors
```
```js
import cors from 'cors'
app.use(cors())
```

---

### 11. `dotenv` is a devDependency but is required at runtime
**File:** [package.json L32](file:///c:/Users/mmsay/Desktop/chakri-bakri/package.json#L32)

```json
"devDependencies": {
    "dotenv": "^17.4.2",
```

`dotenv/config` is imported in `index.js` and `prismaClient.js`, which run in production. It should be in `dependencies`, not `devDependencies`. If you deploy and run `npm install --production`, dotenv won't be installed and your app will crash.

---

## Summary

| # | Issue | Severity | File |
|---|-------|----------|------|
| 1 | No input validation (crash on missing fields) | 🔴 Bug | authRoutes.js |
| 2 | Hardcoded JWT secret fallback | 🔴 Security | multiple |
| 3 | Wrong error code for duplicate users | 🔴 Bug | authRoutes.js |
| 4 | User enumeration on login | 🟠 Security | authRoutes.js |
| 5 | No validation on addJob | 🔴 Bug | jobRoutes.js |
| 6 | Logging hashed password | 🟠 Security | authRoutes.js |
| 7 | Low bcrypt salt rounds | 🟡 Best practice | authRoutes.js |
| 8 | Inconsistent schema naming | 🟡 Best practice | schema.prisma |
| 9 | Plural model name | 🟡 Best practice | schema.prisma |
| 10 | No CORS | 🟡 Best practice | index.js |
| 11 | dotenv in devDependencies | 🟡 Bug (deploy) | package.json |

The auth flow logic itself (hash → store → sign JWT → verify in middleware) is correct. The main areas to focus on are **input validation** and **proper error handling** — those are the things that will crash your server in real usage. Nice work overall for a learning project! 🚀
