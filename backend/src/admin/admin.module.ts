import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Module,
  Patch,
  Post,
  Query,
  Req,
  UnsupportedMediaTypeException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule, AuthService } from "../auth/auth.module";
import {
  CategoryEntity,
  OrderEntity,
  OrderItemEntity,
  ProductEntity,
  RestaurantEntity,
  RestaurantMemberEntity,
  UserEntity,
} from "../database/entities";
import { OBJECT_STORAGE } from "../storage/object-storage";
import type { ObjectStorage } from "../storage/object-storage";
import { StorageModule } from "../storage/storage.module";
import { AdminService } from "./admin.service";
import { imageExtension, readBody } from "./admin.utils";
import { permissionsFor, rolesWith } from "./rbac";

@Controller()
class AdminController {
  constructor(
    private auth: AuthService,
    private admin: AdminService,
    @Inject(OBJECT_STORAGE) private storage: ObjectStorage,
  ) {}

  @Get("admin")
  async dashboard(@Headers("authorization") authorization: string,@Query("restaurant") slug: string) {
    const { restaurant, member } = await this.auth.tenant(authorization, slug);
    return this.admin.dashboard(restaurant, member.role, permissionsFor(member.role));
  }

  @Patch("status")
  async status(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Body() body: any) {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith("orders.manage"));
    return this.admin.updateOrderStatus(restaurant.id, body);
  }

  @Post("product")
  async createProduct(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Body() body: any) {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith("catalog.manage"));
    return this.admin.createProduct(restaurant.id, body);
  }

  @Patch("product")
  async updateProduct(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Body() body: any) {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith("catalog.manage"));
    return this.admin.updateProduct(restaurant.id, body);
  }

  @Delete("product")
  async deleteProduct(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Query("id") id: string) {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith("catalog.manage"));
    return this.admin.deleteProduct(restaurant.id, id);
  }

  @Post("category")
  async createCategory(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Body() body: any) {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith("catalog.manage"));
    return this.admin.createCategory(restaurant.id, body);
  }

  @Patch("category")
  async updateCategory(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Body() body: any) {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith("catalog.manage"));
    return this.admin.updateCategory(restaurant.id, body);
  }

  @Delete("category")
  async deleteCategory(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Query("id") id: string) {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith("catalog.manage"));
    return this.admin.deleteCategory(restaurant.id, id);
  }

  @Post("product-image")
  async productImage(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Req() req: any) {
    return this.uploadImage(authorization, slug, req, "products", "catalog.manage");
  }

  @Post("logo-image")
  async logoImage(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Req() req: any) {
    return this.uploadImage(authorization, slug, req, "logos", "appearance.manage");
  }

  @Patch("settings")
  async settings(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Body() body: any) {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith("settings.manage"));
    return this.admin.updateSettings(restaurant, body);
  }

  @Patch("branding")
  async branding(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Body() body: any) {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith("appearance.manage"));
    return this.admin.updateBranding(restaurant, body);
  }

  @Get("team")
  async team(@Headers("authorization") authorization: string,@Query("restaurant") slug: string) {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith("team.manage"));
    return this.admin.listMembers(restaurant.id);
  }

  @Post("team")
  async addTeamMember(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Body() body: any) {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith("team.manage"));
    return this.admin.addMember(restaurant.id, body);
  }

  @Patch("team")
  async updateTeamMember(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Body() body: any) {
    const { restaurant, member } = await this.auth.tenant(authorization, slug, rolesWith("team.manage"));
    return this.admin.updateMember(restaurant.id, member.userId, body);
  }

  @Delete("team")
  async removeTeamMember(@Headers("authorization") authorization: string,@Query("restaurant") slug: string,@Query("id") id: string) {
    const { restaurant, member } = await this.auth.tenant(authorization, slug, rolesWith("team.manage"));
    return this.admin.removeMember(restaurant.id, member.userId, id);
  }

  private async uploadImage(authorization: string,slug: string,req: any,folder: "products" | "logos",permission: "catalog.manage" | "appearance.manage") {
    const { restaurant } = await this.auth.tenant(authorization, slug, rolesWith(permission));
    const mime = String(req.headers?.["content-type"] || "").split(";")[0].toLowerCase();
    const extension = imageExtension(mime);
    if (!extension) throw new UnsupportedMediaTypeException("Envie uma imagem JPEG, PNG, WebP ou GIF.");
    const body = await readBody(req, 4 * 1024 * 1024);
    if (!body.length) throw new BadRequestException("Imagem vazia.");
    return this.storage.uploadPublic(`${folder}/${restaurant.id}/${randomUUID()}.${extension}`,body,mime);
  }
}

@Module({
  imports: [AuthModule,StorageModule,TypeOrmModule.forFeature([RestaurantEntity,RestaurantMemberEntity,UserEntity,OrderEntity,OrderItemEntity,ProductEntity,CategoryEntity])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
