/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   app.module.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rmazurit <rmazurit@student.42heilbronn.de> +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/04/24 13:56:24 by rmazurit          #+#    #+#             */
/*   Updated: 2023/05/04 10:47:38 by rmazurit         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { SecurityModule } from "./security/security.module";
import { GameModule } from "./game/game.module";
import { FriendshipModule } from "./friendship/friendship.module";
import { ChatModule } from './chat/chat.module';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, GameModule, PrismaModule, SecurityModule, FriendshipModule, ChatModule],
    controllers: [AppController],
    providers: [],
})

export class AppModule {}
