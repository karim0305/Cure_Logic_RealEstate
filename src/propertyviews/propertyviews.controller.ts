import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PropertyviewsService } from './propertyviews.service';
import { CreatePropertyviewDto } from './dto/create-propertyview.dto';


@Controller('propertyviews')
export class PropertyviewsController {
  constructor(private readonly propertyviewsService: PropertyviewsService) {}
   @Post("/public-view")
  async createviews(@Body() dto: CreatePropertyviewDto, @Req() req: any) {
    const ipAddress =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.propertyviewsService.createView({
      ...dto,
      ipAddress,
      userAgent,
    });
  }
}
