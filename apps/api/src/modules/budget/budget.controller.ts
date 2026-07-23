import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ADMIN,
  ROLES_ECRITURE_FINANCE,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';

@ApiTags('budget')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : lecture ouverte à tous les rôles ; chaque écriture redéclare @Roles.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des budgets' })
  @ApiQuery({ name: 'exercice', required: false, type: Number })
  findAll(@Request() req, @Query('exercice') exercice?: string) {
    return this.budgetService.findAll(
      req.user.organisationId,
      exercice ? Number(exercice) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un budget' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.budgetService.findOne(id, req.user.organisationId);
  }

  @Post()
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Créer un budget avec ses lignes' })
  create(@Request() req, @Body() dto: CreateBudgetDto) {
    return this.budgetService.create(req.user.organisationId, dto);
  }

  @Patch(':id')
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Modifier un budget' })
  update(@Param('id') id: string, @Request() req, @Body() dto: Partial<CreateBudgetDto>) {
    return this.budgetService.update(id, req.user.organisationId, dto);
  }

  @Post(':id/approuver')
  @Roles(...ROLES_ADMIN)
  @ApiOperation({ summary: 'Approuver un budget' })
  approuver(@Param('id') id: string, @Request() req) {
    return this.budgetService.approuver(id, req.user.organisationId);
  }

  @Get(':id/taux-execution')
  @ApiOperation({ summary: 'Taux d\'exécution budgétaire' })
  getTauxExecution(@Param('id') id: string, @Request() req) {
    return this.budgetService.getTauxExecution(id, req.user.organisationId);
  }
}
