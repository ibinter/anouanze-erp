import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { IaService } from './ia.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatMessageDto } from './dto/chat-message.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RapportNarratifDto {
  @ApiProperty({ enum: ['annuel', 'trimestriel', 'bailleur'] })
  @IsIn(['annuel', 'trimestriel', 'bailleur'])
  type: 'annuel' | 'trimestriel' | 'bailleur';

  @ApiPropertyOptional()
  @IsOptional()
  params?: Record<string, unknown>;
}

class ProposerBudgetDto {
  @ApiProperty()
  exercice: number;
}

class TraduireDto {
  @ApiProperty()
  @IsString()
  texte: string;

  @ApiProperty({ example: 'fr' })
  @IsString()
  langueSource: string;

  @ApiProperty({ example: 'en' })
  @IsString()
  langueCible: string;
}

@ApiTags('ia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('analyser-tableau-bord')
  @ApiOperation({ summary: 'Analyse IA du tableau de bord organisationnel' })
  analyserTableauBord(@Request() req) {
    return this.iaService.analyserTableauBord(req.user.organisationId);
  }

  @Post('rapport-narratif')
  @ApiOperation({ summary: 'Générer un rapport narratif assisté par IA' })
  genererRapportNarratif(@Request() req, @Body() dto: RapportNarratifDto) {
    return this.iaService.genererRapportNarratif(req.user.organisationId, dto.type, dto.params ?? {});
  }

  @Post('proposer-budget')
  @ApiOperation({ summary: 'Proposition de budget prévisionnel par IA' })
  proposerBudget(@Request() req, @Body() dto: ProposerBudgetDto) {
    return this.iaService.proposerBudget(req.user.organisationId, dto.exercice);
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Détection d\'anomalies comptables par IA' })
  detecterAnomalies(@Request() req) {
    return this.iaService.detecterAnomalies(req.user.organisationId);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat conversationnel avec l\'assistant IA contextuel' })
  chatAssistant(@Request() req, @Body() dto: ChatMessageDto) {
    return this.iaService.chatAssistant(
      req.user.organisationId,
      req.user.id,
      dto.message,
      dto.historique ?? [],
    );
  }

  @Post('traduire')
  @ApiOperation({ summary: 'Traduction de document via IA' })
  traduireDocument(@Body() dto: TraduireDto) {
    return this.iaService.traduireDocument(dto.texte, dto.langueSource, dto.langueCible);
  }
}
