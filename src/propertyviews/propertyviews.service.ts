// src/propertyviews/propertyviews.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePropertyviewDto } from './dto/create-propertyview.dto';
import { UpdatePropertyviewDto } from './dto/update-propertyview.dto';
import { Propertyview, PropertyviewDocument } from './schemas/publicview.schema';

@Injectable()
export class PropertyviewsService {
  constructor(
    @InjectModel(Propertyview.name)
    private readonly propertyViewModel: Model<PropertyviewDocument>, // yahan sahi model inject hoga
  ) {}

  // ✅ Create a new view
async createView(
    dto: CreatePropertyviewDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<Propertyview> {
    const view = new this.propertyViewModel({
      ...dto,          // propertyId, userId (from frontend)
      ipAddress,       // captured by backend
      userAgent,       // captured by backend
      viewedAt: new Date(), // backend sets timestamp
    });

    return view.save();
  }

  // ✅ Find all views for a property
  async findByProperty(propertyId: string): Promise<Propertyview[]> {
    return this.propertyViewModel
      .find({ propertyId })
      .populate('userId', 'fullName email')
      .sort({ viewedAt: -1 })
      .exec();
  }

  // ✅ Example: update (optional)

async getAllViews() {
    return this.propertyViewModel.find().exec();
  }

  async getViewsByProperty(propertyId: string) {
    return this.propertyViewModel.find({ propertyId }).exec();
  }
  

  
async getMonthlyViews() {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const results = await this.propertyViewModel.aggregate([
    {
      $group: {
        _id: { month: { $month: "$viewedAt" } },
        totalViews: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
    {
      $project: {
        _id: 0,              // 👈 remove _id completely
        month: "$_id.month", // temporarily keep number month
        totalViews: 1
      }
    }
  ]);

  return results.map(r => ({
    month: monthNames[r.month - 1], // convert number → name
    totalViews: r.totalViews,
  }));
}


  
}
