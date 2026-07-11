import { Controller, Get } from '@nestjs/common';
import { BeneficiairesService } from './beneficiaires.service';

@Controller('api/v1/beneficiaires')
export class BeneficiairesController {
  constructor(private readonly beneficiairesService: BeneficiairesService) {}

  @Get()
  findAll() {
    return [];
  }
}
