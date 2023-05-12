/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.controller.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rmazurit <rmazurit@student.42heilbronn.de> +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/04/24 13:54:53 by rmazurit          #+#    #+#             */
/*   Updated: 2023/04/27 18:03:54 by rmazurit         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Body, Controller, Get, Post, Redirect, UploadedFile, UseInterceptors} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthService } from "./auth.service"
import { AuthDto } from "./dto";
import { AuthResponse } from "./dto/response.dto";

const CLIENT_ID = process.env.REACT_APP_ID;
const REDIRECT_URI = "http://localhost:5000/auth/authorize_callback";

@Controller("/auth")
export class AuthController {
	constructor( private authService: AuthService ) {}

	@Get('/authorize')
  @Redirect(`https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`, 302)
  authorize() {}

  @Get('/authorize_callback')
  async authorizeCallback(@Body("code") code: string): Promise<void> {
    try {
     await this.authService.authorizeCallback(code);
    } catch (error) {
      throw error;
    }
  }

	@Post("/signup")
	@UseInterceptors(FileInterceptor("file", { dest: "uploads" }))
	async signup(@Body() dto: AuthDto, @UploadedFile() file?: Express.Multer.File): Promise<AuthResponse> {
		try {
			return await this.authService.signup(dto, file);
		} catch(error) {
			throw error;
		}
	}

	@Post("/login")
	async signin(@Body() dto: AuthDto): Promise<AuthResponse> {
		try {
			return await this.authService.signin(dto);
		} catch(error) {
			throw error;
		}
	}

	@Post("/login_tfa")
	async signinWithTFA(@Body() dto: AuthDto): Promise<AuthResponse> {
		try {
			return await this.authService.signinWithTFA(dto);
		} catch (error) {
			return error;
		}
	}

	@Post("/update_profile")
	@UseInterceptors(FileInterceptor("file", { dest: "uploads" }))
	async updateProfile(@Body("cookie") cookie: string, @UploadedFile() file?: Express.Multer.File, @Body() dto?:AuthDto, @Body("email") email?: string): Promise<AuthResponse> {
		try {
			return await this.authService.updateProfile(cookie, file, dto, email);
		} catch (error) {
			throw error;
		}
	}
	
	@Post("/logout")
	async logout(@Body("cookie") cookie: string): Promise<AuthResponse> {
		try {
			return await this.authService.logout(cookie);
		} catch (error) {
			throw error;
		}
	}
}
