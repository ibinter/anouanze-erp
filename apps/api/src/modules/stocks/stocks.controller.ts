import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { MouvementStockDto } from './dto/mouvement-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('stocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des stocks' })
  @ApiQuery({ name: 'categorie', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Request() req,
    @Query('categorie') categorie?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stocksService.findAll(req.user.organisationId, {
      categorie,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('alertes')
  @ApiOperation({ summary: 'Stocks sous le niveau minimum' })
  getAlertes(@Request() req) {
    return this.stocksService.getAlertes(req.user.organisationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un stock' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.stocksService.findOne(id, req.user.organisationId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un article en stock' })
  create(@Request() req, @Body() dto: CreateStockDto) {
    return this.stocksService.create(req.user.organisationId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un article en stock' })
  update(@Param('id') id: string, @Request() req, @Body() dto: Partial<CreateStockDto>) {
    return this.stocksService.update(id, req.user.organisationId, dto);
  }

  @Post(':id/entree')
  @ApiOperation({ summary: 'Enregistrer une entrée de stock' })
  entree(@Param('id') id: string, @Body() dto: MouvementStockDto) {
    return this.stocksService.entree(id, dto);
  }

  @Post(':id/sortie')
  @ApiOperation({ summary: 'Enregistrer une sortie de stock' })
  sortie(@Param('id') id: string, @Body() dto: MouvementStockDto) {
    return this.stocksService.sortie(id, dto);
  }

  @Get(':id/mouvements')
  @ApiOperation({ summary: 'Historique des mouvements d\'un stock' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMouvements(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stocksService.getMouvements(id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
