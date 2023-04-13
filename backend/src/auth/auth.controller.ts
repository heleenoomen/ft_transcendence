import { Body, Controller, HttpStatus, Post, HttpException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service'
import { AuthDto } from './dto';

@Controller('/auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		) {}

	@Post('/signup')
	async signup(@Body() dto: AuthDto, @UploadedFile() file?: Express.Multer.File): Promise<{ status: HttpStatus, message?: string }> {
		return this.authService.signup(dto);
	}

	@Post('/signin')
	signin(@Body() dto: AuthDto): Promise<{ status: HttpStatus, message?: string }> {
		return this.authService.signin(dto);
	}

	@Post('/logout')
	logout(@Body() dto: AuthDto): Promise<{ status: HttpStatus, message?: string }> {
		return this.authService.logout(dto);
	}

	@Post('/upload')
	@UseInterceptors(FileInterceptor('file', { dest: 'uploads' }))
	async upload(@Body() dto: AuthDto, @UploadedFile() file: Express.Multer.File): Promise<{ status: HttpStatus, message?: string }> {
		  return this.authService.uploadProfilePicture(dto, file);
	}

	@Post('/delete')
	@UseInterceptors(FileInterceptor('file', { dest: 'uploads' }))
	async delete(@Body() dto: AuthDto): Promise<{ status: HttpStatus, message?: string }> {
		  return this.authService.deleteProfilePicture(dto);
	}
}
