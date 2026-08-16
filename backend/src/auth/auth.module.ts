import { BadRequestException, Body, Controller, ForbiddenException, Injectable, Module, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { DataSource, Repository } from 'typeorm';
import { CategoryEntity, RestaurantEntity, RestaurantMemberEntity, RestaurantRole, UserEntity } from '../database/entities';

@Injectable()
export class AuthService{
 constructor(private jwt:JwtService,private db:DataSource,@InjectRepository(UserEntity) private users:Repository<UserEntity>,@InjectRepository(RestaurantMemberEntity) private members:Repository<RestaurantMemberEntity>,@InjectRepository(RestaurantEntity) private restaurants:Repository<RestaurantEntity>){}
 async login(email:string,password:string){const user=await this.users.findOne({where:{email:String(email||'').trim().toLowerCase()}});if(!user||!await compare(password||'',user.passwordHash))throw new UnauthorizedException('E-mail ou senha incorretos.');return{access_token:await this.jwt.signAsync({sub:user.id,email:user.email})}}
 async onboarding(b:any){const email=String(b.email||'').trim().toLowerCase(),password=String(b.password||''),name=String(b.restaurant_name||'').trim(),slug=slugify(String(b.slug||name));if(!email.includes('@')||password.length<8)throw new BadRequestException('Informe um e-mail válido e uma senha com pelo menos 8 caracteres.');if(!name)throw new BadRequestException('Informe o nome do restaurante.');if(!b.accepts_delivery&&!b.accepts_pickup)throw new BadRequestException('Ative entrega ou retirada.');const methods=Array.isArray(b.payment_methods)?b.payment_methods.map(String):[];if(!methods.length)throw new BadRequestException('Selecione pelo menos um meio de pagamento.');return this.db.transaction(async m=>{if(await m.findOne(UserEntity,{where:{email}}))throw new BadRequestException('Já existe uma conta com este e-mail.');if(await m.findOne(RestaurantEntity,{where:{slug}}))throw new BadRequestException('Este endereço de loja já está em uso.');const user=await m.save(UserEntity,m.create(UserEntity,{email,passwordHash:await hash(password,12)}));const restaurant=await m.save(RestaurantEntity,m.create(RestaurantEntity,{name,slug,tagline:String(b.tagline||''),whatsapp:String(b.whatsapp||''),addressText:String(b.address||''),acceptsDelivery:Boolean(b.accepts_delivery),acceptsPickup:Boolean(b.accepts_pickup),deliveryFee:String(Number(b.delivery_fee||0)),minimumOrder:String(Number(b.minimum_order||0)),paymentMethods:methods}));await m.save(RestaurantMemberEntity,m.create(RestaurantMemberEntity,{userId:user.id,restaurantId:restaurant.id,role:'owner'}));await m.save(CategoryEntity,m.create(CategoryEntity,{restaurantId:restaurant.id,slug:'principais',name:'Principais',active:true,sortOrder:0}));return{ok:true,slug,access_token:await this.jwt.signAsync({sub:user.id,email:user.email})}})}
 async userFromHeader(header?:string){if(!header?.startsWith('Bearer '))throw new UnauthorizedException('Não autenticado');try{return await this.jwt.verifyAsync(header.slice(7))}catch{throw new UnauthorizedException('Sessão inválida ou expirada')}}
 async tenant(header:string|undefined,slug?:string,roles?:RestaurantRole[]){const token=await this.userFromHeader(header);const qb=this.members.createQueryBuilder('m').innerJoinAndMapOne('m.restaurant',RestaurantEntity,'r','r.id=m.restaurant_id').where('m.user_id=:uid',{uid:token.sub});if(slug)qb.andWhere('r.slug=:slug',{slug});const member:any=await qb.getOne();if(!member)throw new ForbiddenException('Sem acesso a este restaurante');if(roles&&!roles.includes(member.role))throw new ForbiddenException('Permissão insuficiente');return{user:token,member,restaurant:member.restaurant as RestaurantEntity}}
}

@Controller()
class AuthController{constructor(private auth:AuthService){} @Post('login') login(@Body() b:any){return this.auth.login(b.email,b.password)} @Post('onboarding') onboarding(@Body() b:any){return this.auth.onboarding(b)}}

@Module({imports:[TypeOrmModule.forFeature([UserEntity,RestaurantEntity,RestaurantMemberEntity,CategoryEntity]),JwtModule.registerAsync({inject:[ConfigService],useFactory:(c:ConfigService)=>({secret:c.getOrThrow('JWT_SECRET'),signOptions:{expiresIn:c.get('JWT_EXPIRES_IN','7d') as any}})})],providers:[AuthService],controllers:[AuthController],exports:[AuthService,JwtModule]})
export class AuthModule{}

function slugify(v:string){return String(v||'restaurante').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'restaurante'}
