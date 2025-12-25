import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public } from '../auth/decorators/public.decorator';

class ContactDto {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  userRole?: string;
  organization?: string;
}

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Public()
  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async sendContactEmail(@Body() contactData: ContactDto) {
    try {
      await this.mailService.sendContactEmail(contactData);
      return { 
        success: true, 
        message: 'Email sent successfully' 
      };
    } catch (error) {
      console.error('Error sending contact email:', error);
      throw error;
    }
  }
}
