import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat } from './entities/cat.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private catRepository: Repository<Cat>,
  ) {}

  async create(createCatDto: CreateCatDto) {
    return this.catRepository.save(createCatDto);
  }

  async findAll() {
    return this.catRepository.find();
  }

  async findOne(id: number) {
    return this.catRepository.findOne({ id });
  }

  async update(id: number, updateCatDto: UpdateCatDto) {
    const cat = await this.findOne(id);

    if (!cat) {
      throw new NotFoundException('Cat not found');
    }

    return this.catRepository.update({ id }, updateCatDto);
  }

  async remove(id: number) {
    return this.catRepository.delete({ id });
  }
}
