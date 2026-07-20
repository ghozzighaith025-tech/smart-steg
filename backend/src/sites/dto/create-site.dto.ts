import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSiteDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ['factory', 'building', 'utility', 'hotel', 'hospital', 'other'] })
  @IsOptional()
  @IsEnum(['factory', 'building', 'utility', 'hotel', 'hospital', 'other'])
  type?: 'factory' | 'building' | 'utility' | 'hotel' | 'hospital' | 'other';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
