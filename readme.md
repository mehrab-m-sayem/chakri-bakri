

# 1. start the Postgres database in the background
docker-compose up -d


# 3. Prisma schema changes to the database and generate the Prisma Client
npx prisma generate
npx prisma db push

# 4. start the backend Node server 
node src/index.js

Frontend run
# root directory
node frontend/server.js


# db 
npx prisma studio

