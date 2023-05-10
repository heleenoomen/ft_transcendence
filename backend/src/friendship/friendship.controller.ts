/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friendship.controller.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rmazurit <rmazurit@student.42heilbronn.    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/05/03 13:10:20 by rmazurit          #+#    #+#             */
/*   Updated: 2023/05/10 16:18:57 by rmazurit         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Post, Body } from "@nestjs/common";
import { FriendshipDataResponse, FriendshipDto, FriendshipStatusResponse } from "./dto";
import { FriendshipService } from "./friendship.service";

@Controller("/friendship")
export class FriendshipController {
  constructor(
    private friendshipService: FriendshipService
    ) {}

  @Post("/add")
  async addFriend(@Body() dto: FriendshipDto): Promise<FriendshipStatusResponse> {
    try {
      return await this.friendshipService.addFriend(dto);
    } catch (error) {
      throw error;
    }
  }

  @Post("/accept")
  async acceptFriend(@Body() dto: FriendshipDto): Promise<FriendshipStatusResponse> {
    try {
      return await this.friendshipService.acceptFriend(dto);
    } catch (error) {
      throw error;
    }
  }

  @Post("/reject")
  async rejectFriend(@Body() dto: FriendshipDto): Promise<FriendshipStatusResponse> {
    try {
      return await this.friendshipService.rejectFriend(dto);
    } catch (error) {
      throw error;
    }
  }

  @Post("/delete")
  async deleteFriend(@Body() dto: FriendshipDto): Promise<FriendshipStatusResponse> {
    try {
      return await this.friendshipService.deleteFriend(dto);
    } catch (error) {
      throw error;
    }
  }

  @Get("/get_accepted")
  async getAcceptedFriends(@Body("cookie") cookie: string): Promise<FriendshipDataResponse[]> {
    try {
      return await this.friendshipService.getAcceptedFriends(cookie);
    } catch (error) {
      throw error;
    }
  }

//   @Get("/get_pending")
//   async getPendingFriendships(@Body("cookie") cookie: string): Promise<FriendshipDataResponse> {
//     try {
      
//     } catch (error) {
//       throw error;
//     }
//   }

//   @Get("/get_pending")
  // async getFriendshipsToAccept(@Body("cookie") cookie: string): Promise<Friend[]> {
//     try {
        
//     } catch (error) {
//       throw error;
//     }
//   }
}
