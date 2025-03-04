/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friendship.service.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jtsizik <jtsizik@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/05/11 18:09:00 by rmazurit          #+#    #+#             */
/*   Updated: 2023/05/24 16:28:50 by jtsizik          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FriendshipDto, FriendshipStatusResponse, FriendshipDataResponse, UserListDataResponse } from './dto';
import { PrismaService } from "../prisma/prisma.service";
import { SecurityService } from 'src/security/security.service';
import { Friend, Session, User } from '@prisma/client';
import { GoogleDriveService } from 'src/auth/google_drive/google.drive.service';

@Injectable()
export class FriendshipService {
  constructor(
    private prisma: PrismaService,
		private securityService: SecurityService,
    private googleDriveService: GoogleDriveService,
  ) {}
  
  //CONTROLLER FUNCTIONS
  async addFriend(dto: FriendshipDto): Promise<FriendshipStatusResponse> {
    try {
      const session: Session = await this.securityService.verifyCookie(dto.cookie);
      const user: User = await this.prisma.user.findUnique({ where: { id: session.userId } });

      const friend: User = await this.validateFriendshipRequest(dto, user);
    
      await this.prisma.friend.create({ 
        data: {
          userId: user.id,
          friendId: friend.id,
          friendName: friend.username,
          status: "pending",
        }
       });

      return { status: HttpStatus.CREATED, message: `You have sent a friendship request to the user ${dto.friendName}! Please wait for the confirmation.` };
    } catch (error) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				throw new HttpException("Ooops...Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
  }

  async acceptFriend(dto: FriendshipDto): Promise<FriendshipStatusResponse> {
    try {
      const session = await this.securityService.verifyCookie(dto.cookie);
      
      const user: User = await this.prisma.user.findUnique({ where: { id: session.userId } });
      if (user.username === dto.friendName) {
				throw new HttpException("You can't accept friendship, requested from yourself!", HttpStatus.BAD_REQUEST);
      }

      const friend: User = await this.prisma.user.findUnique({ where: { username: dto.friendName } });
      if (!friend) {
        throw new HttpException(`The user ${dto.friendName} doesn't exist`, HttpStatus.BAD_REQUEST);
      }

      const friendshipEntry: Friend = await this.prisma.friend.findFirst({ where: { userId: friend.id, friendName: user.username } })
      if (!friendshipEntry) {
        throw new HttpException(`There is no friendship request between you and ${dto.friendName}.`, HttpStatus.BAD_REQUEST);
      }
      if (friendshipEntry.status === "accepted") {
          throw new HttpException(`You have already accepted the friendship with ${dto.friendName}`, HttpStatus.BAD_REQUEST);
      }

      await this.prisma.friend.update({ where: { id: friendshipEntry.id }, data: { status: "accepted" } });
      
      return { status: HttpStatus.OK, message: "Done" };
    } catch (error) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				throw new HttpException("Ooops...Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
  }

  async rejectFriend(dto: FriendshipDto): Promise<FriendshipStatusResponse> {
    try {
      const session = await this.securityService.verifyCookie(dto.cookie);
      
      const user: User = await this.prisma.user.findUnique({ where: { id: session.userId } });
      if (user.username === dto.friendName) {
				throw new HttpException("You can't reject friendship with yourself!", HttpStatus.BAD_REQUEST);
      }

      const friend: User = await this.prisma.user.findUnique({ where: { username: dto.friendName } });
      if (!friend) {
        throw new HttpException(`The user ${dto.friendName} doesn't exist`, HttpStatus.BAD_REQUEST);
      }

      const friendshipEntry: Friend = await this.prisma.friend.findFirst({ where: { userId: friend.id, friendName: user.username } })
      if (!friendshipEntry) {
        throw new HttpException(`There is no friendship request between you and ${dto.friendName}.`, HttpStatus.BAD_REQUEST);
      }
      if (friendshipEntry.status === "accepted") {
          throw new HttpException(`You have already accepted the friendship with ${dto.friendName}. Use Delete button to remove the user from your friendlist`, HttpStatus.BAD_REQUEST);
      }

      await this.prisma.friend.delete({ where: { id: friendshipEntry.id } });

      return { status: HttpStatus.OK, message: `You have rejected friendship request from ${dto.friendName}` };
    } catch (error) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				throw new HttpException("Ooops...Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
  }

  async deleteFriend(dto: FriendshipDto): Promise<FriendshipStatusResponse> {
    try {
      const session = await this.securityService.verifyCookie(dto.cookie);
      
      const user: User = await this.prisma.user.findUnique({ where: { id: session.userId } });
      if (user.username === dto.friendName) {
				throw new HttpException("Invalid input", HttpStatus.BAD_REQUEST);
      }

      const friend: User = await this.prisma.user.findUnique({ where: { username: dto.friendName } });
      if (!friend) {
        throw new HttpException(`The user ${dto.friendName} doesn't exist`, HttpStatus.BAD_REQUEST);
      }

      const friendInDatabase = await this.prisma.friend.findFirst({
        where: {
          OR: [
            { userId: friend.id, friendName: user.username },
            { userId: user.id, friendName: friend.username },
          ],
        },
      });

      await this.prisma.friend.delete({ where: { id: friendInDatabase.id } });

      return { status: HttpStatus.OK, message: `User ${dto.friendName} was removed from your friendlist` };
    } catch (error) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				throw new HttpException("Ooops...Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
  }

  //TODO: find out the better way to determine if user is online or not
  async getFriends(cookie: string): Promise<UserListDataResponse[]> {
    try {
      const status: string = "accepted";
      const accepted = await this.getFriendlist(cookie, status);

      const friends = await this.prisma.user.findMany({
        where: 
            { username: { in: accepted.map(friend => friend.friendName) } },
  
      });

      let friendList: UserListDataResponse[] = [];
      for (let i: number = 0; i < friends.length; i++) {
        const friend = friends[i];
        const pic = await this.googleDriveService.getProfilePicture(cookie, friend);
        const friendResponse = {username: friend.username, picture: pic};
        friendList.push(friendResponse);
      };
      
      return friendList;
    } catch (error) {
			if (error instanceof HttpException) {
				throw error;
			} else {
				throw new HttpException("Ooops...Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
  }

  async getFriendsToAccept(cookie: string): Promise<UserListDataResponse[]> {
    try {
      const session = await this.securityService.verifyCookie(cookie);
      const user: User = await this.prisma.user.findUnique({ where: { id: session.userId } });
      
      // const friends: Friend[] = await this.prisma.friend.findMany({ where: { friendName: user.username, status: "pending"} });
      // if (friends.length === 0) {
      //   throw new HttpException("It looks like you have no pending friendship requests yet.", HttpStatus.NO_CONTENT);
      // }
      const pending = await this.getFriendlist(cookie, "pending");

      const friends = await this.prisma.user.findMany({
        where: 
            { username: { in: pending.map(friend => friend.friendName) } },
  
      });

      let friendList: UserListDataResponse[] = [];
      for (let i: number = 0; i < friends.length; i++) {
        const friend = friends[i];
        const pic = await this.googleDriveService.getProfilePicture(cookie, friend);
        const friendResponse = {username: friend.username, picture: pic};
        friendList.push(friendResponse);
      };
      
      return friendList;
    } catch (error) {
		  if (error instanceof HttpException) {
			  throw error;
		  } else {
				throw new HttpException("Ooops...Something went wrong", HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
  }

  private async validateFriendshipRequest(dto: FriendshipDto, user: User): Promise<User> {
    try {
      if (dto.friendName === user.username) {
        throw new HttpException("Cmooooon... Are you trying to friend yourself? That's like giving yourself a high five... awkward and kinda sad.", HttpStatus.BAD_REQUEST);
      }
      
      const friend: User = await this.prisma.user.findUnique({ where: { username: dto.friendName } });
      if (!friend) {
				throw new HttpException(`The person ${dto.friendName} doesn't exist`, HttpStatus.BAD_REQUEST);
      }
      
      const friendInDatabase = await this.prisma.friend.findFirst({
        where: {
          OR: [
            { userId: friend.id, friendName: user.username },
            { userId: user.id, friendName: friend.username },
          ],
        },
      });

      if (friendInDatabase) {
        if (friendInDatabase.status === "pending") {
          if (friendInDatabase.friendName === user.username) {
            throw new HttpException(`The user ${dto.friendName} has already requested a friendship with you - accept him as a friend!`, HttpStatus.BAD_REQUEST);
          } else if (friendInDatabase.friendName === friend.username) {
            throw new HttpException(`You have already requested a friendship with ${dto.friendName}. Please wait for the confirmation.`, HttpStatus.BAD_REQUEST);
          }
        }
        if (friendInDatabase.status === "accepted") {
				  throw new HttpException(`You are already in friendship with ${dto.friendName}`, HttpStatus.BAD_REQUEST);
        }    
      }
      
      return friend;
    } catch (error) {
      throw error;
    }
  }

  private async getFriendlist(cookie: string, status: string): Promise<FriendshipDataResponse[]> {
    try {
      const session = await this.securityService.verifyCookie(cookie);
      const user: User = await this.prisma.user.findUnique({ where: { id: session.userId } });      
  
      const contactedFriends = await this.prisma.friend.findMany({
        where: { userId: session.userId, status } });
  
      const friendsContactedMe = await this.prisma.friend.findMany({
        where: { friendId: session.userId, status } });
  
      const friendList = contactedFriends.concat(friendsContactedMe);
      // if (friendList.length === 0) {
      //   throw new HttpException("Oh no! It looks like you don't have friends yet!", HttpStatus.NO_CONTENT);
      // }

      let friendListResponse: FriendshipDataResponse[] = [];
      for (let i: number = 0; i < friendList.length; i++) {
        const friend = friendList[i];
        const friendResponse = await this.getFriend(friend, user);
        friendListResponse.push(friendResponse);
      }

      friendListResponse.sort((a, b) => a.friendName.localeCompare(b.friendName));
  
      return friendListResponse;
    } catch (error) {
      throw error;
    }
  }
  
  private async getFriend(friend: Friend, user: User): Promise<FriendshipDataResponse> {
		try {
      let friendName: string;
      if (friend.friendName === user.username) {
        const friendInDatabase: User = await this.prisma.user.findUnique({ where: { id: friend.userId } });
        friendName = friendInDatabase.username;
      } else {
        friendName = friend.friendName;
      }
      
			const frienResponse: FriendshipDataResponse = {
				friendName: friendName,
			}

			return frienResponse;
		} catch (error) {
      throw error;
		}
	}

  async getUserList(cookie: string): Promise<UserListDataResponse[]> {
    try {
      const session = await this.securityService.verifyCookie(cookie);
      const user: User = await this.prisma.user.findUnique({ where: { id: session.userId } });      
  
      const friends = await this.getFriendlist(cookie, "accepted");
      const pending = await this.getFriendlist(cookie, "pending");

      const users = await this.prisma.user.findMany({
        where: {
          NOT: [
            { username: { in: friends.map(friend => friend.friendName) } },
            { username: { in: pending.map(pendingFriend => pendingFriend.friendName) } }
          ]
        }
      });


      let userListResponse: UserListDataResponse[] = [];
      for (let i: number = 0; i < users.length; i++) {
        const userTmp = users[i];
        if (userTmp.username != user.username)
        {
          const pic = await this.googleDriveService.getProfilePicture(cookie, userTmp);
          const userResponse = {username: userTmp.username, picture: pic};
          userListResponse.push(userResponse);
        }
      }

      userListResponse.sort((a, b) => a.username.localeCompare(b.username));
  
      return userListResponse;
    } catch (error) {
      throw error;
    }
  }
}

