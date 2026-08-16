import { Controller, Get, Module, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity, ProductAddonEntity, ProductEntity, RestaurantEntity } from '../database/entities';
import { categoryResponse, productResponse, restaurantResponse } from '../api-contract';

@Controller('catalog')
class CatalogController{
 constructor(@InjectRepository(RestaurantEntity) private restaurants:Repository<RestaurantEntity>,@InjectRepository(CategoryEntity) private categories:Repository<CategoryEntity>,@InjectRepository(ProductEntity) private products:Repository<ProductEntity>,@InjectRepository(ProductAddonEntity) private addons:Repository<ProductAddonEntity>){}
 @Get() async get(@Query('restaurant') slug='sabor-da-casa'){const restaurant=await this.restaurants.findOne({where:{slug,active:true}});if(!restaurant)throw new NotFoundException('Restaurante não encontrado');const [categories,products]=await Promise.all([this.categories.find({where:{restaurantId:restaurant.id,active:true},order:{sortOrder:'ASC'}}),this.products.find({where:{restaurantId:restaurant.id,active:true,available:true},order:{sortOrder:'ASC'}})]);const addonRows=products.length?await this.addons.createQueryBuilder('a').where('a.product_id IN (:...ids)',{ids:products.map(p=>p.id)}).andWhere('a.active=true').orderBy('a.sort_order','ASC').getMany():[];return{restaurant:{...restaurantResponse(restaurant),is_open:isOpen(restaurant.openingHours,restaurant.timezone)},categories:categories.map(categoryResponse),products:products.map(p=>productResponse(p,addonRows.filter(a=>a.productId===p.id)))}}
}
@Module({imports:[TypeOrmModule.forFeature([RestaurantEntity,CategoryEntity,ProductEntity,ProductAddonEntity])],controllers:[CatalogController]}) export class CatalogModule{}

function isOpen(hours:Record<string,any>,tz:string){if(!hours||!Object.keys(hours).length)return true;const now=new Date();const parts=new Intl.DateTimeFormat('en-US',{timeZone:tz,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(now);const day=(parts.find(p=>p.type==='weekday')?.value||'').toLowerCase().slice(0,3);const hh=parts.find(p=>p.type==='hour')?.value||'00',mm=parts.find(p=>p.type==='minute')?.value||'00';const current=Number(hh)*60+Number(mm);const slot=hours[day]||hours[{sun:'0',mon:'1',tue:'2',wed:'3',thu:'4',fri:'5',sat:'6'}[day]||''];if(!slot||slot.closed)return false;const toMin=(v:string)=>{const [h,m]=String(v||'00:00').split(':').map(Number);return h*60+m};return current>=toMin(slot.open||slot.from)&&current<=toMin(slot.close||slot.to)}
