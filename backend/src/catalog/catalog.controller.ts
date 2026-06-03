import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AccountRole } from '../domain/enums';
import type { CreateBookDto } from './dto/create-book.dto';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('books')
  async listBooks(
    @Query('search') search?: string,
    @Query('genre') genre?: string,
    @Query('author') author?: string,
    @Query('format') format?: string,
    @Query('condition') condition?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.catalogService.listBooks({ search, genre, author, format, condition, limit, offset });
  }

  @Get('books/:isbn')
  async getBook(@Param('isbn') isbn: string) {
    return this.catalogService.getBook(isbn);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Post('books')
  async createBook(@Body() body: CreateBookDto, @Req() request: { user: { role: string } }) {
    return this.catalogService.createBook(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Put('books/:isbn')
  async updateBook(@Param('isbn') isbn: string, @Body() body: Partial<CreateBookDto>) {
    return this.catalogService.updateBookDetails(isbn, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Patch('books/:isbn/stock')
  async updateStock(@Param('isbn') isbn: string, @Body() body: { quantity: number }) {
    return this.catalogService.updateBookStock(isbn, Number(body.quantity));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AccountRole.Staff, AccountRole.Manager)
  @Delete('books/:isbn')
  async deleteBook(@Param('isbn') isbn: string) {
    await this.catalogService.deleteBook(isbn);
    return { deleted: true, isbn };
  }
}
