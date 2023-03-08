import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'

import { CreateQuoteDto } from './dto/create-quote.dto'
import { UpdateQuoteDto } from './dto/update-quote.dto'
import { QuotesService } from './quotes.service'

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(createQuoteDto)
  }

  @Get()
  findAll() {
    return this.quotesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(+id)
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
    return this.quotesService.update(+id, updateQuoteDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(+id)
  }
}
