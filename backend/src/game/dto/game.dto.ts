/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.dto.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rmazurit <rmazurit@student.42heilbronn.de> +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/04/24 13:57:26 by rmazurit          #+#    #+#             */
/*   Updated: 2023/05/02 15:36:09 by rmazurit         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { IsBoolean, IsNumber, IsString } from "class-validator";

export class GameDto {
  @IsNumber()
  userId: number
  
  @IsString()
	enemyName: string

  @IsString()
	score: string

  @IsBoolean()
	win: boolean
}