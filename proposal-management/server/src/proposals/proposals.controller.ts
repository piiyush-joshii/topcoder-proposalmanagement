import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';
import { Proposal, Question } from './types';

@ApiTags('proposals')
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all proposals' })
  findAll(): Promise<Proposal[]> {
    return this.proposalsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new proposal' })
  create(@Body() createDto: Partial<Proposal>): Promise<Proposal> {
    return this.proposalsService.create(createDto);
  }

  @Post(':id/assess')
  @ApiOperation({ summary: 'Submit RFP summary and generate questions' })
  assess(@Param('id') id: string, @Body('summary') summary: string): Promise<{ questions: Question[]; timerStartedAt: Date }> {
    return this.proposalsService.assess(id, summary);
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Submit answers and generate final proposal' })
  answer(@Param('id') id: string, @Body('answers') answers: Record<string, string>): Promise<any> {
    return this.proposalsService.answer(id, answers);
  }
}
