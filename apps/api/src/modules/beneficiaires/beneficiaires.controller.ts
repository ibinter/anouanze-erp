import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BeneficiairesService } from './beneficiaires.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('beneficiaires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/beneficiaires')
export class BeneficiairesController {
  constructor(private readonly beneficiairesService: BeneficiairesService) {}

  @ApiOperation({ summary: 'Liste des bénéficiaires' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.beneficiairesService.findAll(req.user.organisationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
  }

  @ApiOperation({ summary: 'Détail d\'un bénéficiaire' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beneficiairesService.findOne(id);
  }
}
