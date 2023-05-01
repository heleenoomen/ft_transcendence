-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT NOT NULL,
    "hashedPasswd" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "TFAMode" BOOLEAN NOT NULL,
    "email" TEXT NOT NULL,
    "TFACode" TEXT NOT NULL,
    "TFAExpiresAt" TEXT NOT NULL,
    "profilePicture" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "jwtToken" TEXT NOT NULL,
    "serializedCookie" TEXT NOT NULL,
    "hashedCookie" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "enemyName" TEXT NOT NULL,
    "score" TEXT NOT NULL,
    "win" BOOLEAN NOT NULL,
    "gameTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "totalMatches" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_jwtToken_key" ON "sessions"("jwtToken");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_serializedCookie_key" ON "sessions"("serializedCookie");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_hashedCookie_key" ON "sessions"("hashedCookie");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_userId_key" ON "ratings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_username_key" ON "ratings"("username");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
