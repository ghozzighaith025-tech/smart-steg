import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@griddna.ai' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'GridDNA2026!' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  organizationName: string;
}
