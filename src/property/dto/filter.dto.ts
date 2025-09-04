import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class FilterPropertyDto {
  // Mode 1: Location-based
  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsString()
  address?: string;

  // Mode 2: Property specs
  @IsOptional() @IsString()
  propertyType?: string;

  @IsOptional() @IsNumberString()
  bedrooms?: number;


  @IsOptional() @IsNumberString()
  price?: number;

  @IsOptional() @IsNumberString()
  area?: number;
}
