<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

[Nest](https://github.com/nestjs/nest) project for the FAN/OFM Hand-on

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## Tutorial

```bash
# Install NestJs globally
$ npm intall --global @nestjs/cli
# OR
$ npm i -g @nestjs/cli

# Create new project
$ nest new {project-name}

# Run project
$ cd {project-name}
$ npm run start:dev
```

### Database Config
```bash
$ yarn add @nestjs/typeorm typeorm@0.2 mysql2
# OR
$ npm install --save @nestjs/typeorm typeorm@0.2 mysql2
```

Alternatively, rather than passing a configuration object to `forRoot()`, we can create an `ormconfig.json` file in the project root directory.
```JSON
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "",
  "database": "hand-on",
  "entities": ["dist/**/*.entity{.ts,.js}"],
  "synchronize": true
}
```
Then, we can call `forRoot()` without any options:
```TypeScript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot()],
})
export class AppModule {}
```

### Repository pattern
Create file in `src/cats/entities/cat.entity.ts`
```TypeScript
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  breed: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at: Date;
}
```

### Create DTOS
#### Using the built-in ValidationPipe
To begin using it, we first install the required dependency.
```bash
$ yarn add class-validator class-transformer
# OR
$ npm i --save class-validator class-transformer
```

In `src/main.ts`
```TypeScript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

Create file `src/cats/dto/create-cat.dto.ts` and add:
```TypeScript
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCatDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsNotEmpty()
  @IsNumber()
  age: number;
  
  @IsNotEmpty()
  @IsString()
  breed: string;
}
```

Create file `src/cats/dto/update-cat.dto.ts` and add:
```TypeScript
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCatDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsString()
  breed?: string;
}
```

### Controller Cat
```bash
# Create controller
$ nest g controller cats
```
In `cats.controller.ts` add:
```TypeScript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    return await this.catsService.create(createCatDto);
  }

  @Get()
  async findAll() {
    return await this.catsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cat = await this.catsService.findOne(+id);
    if (!cat) {
      throw new NotFoundException('Cat not found');
    }

    return cat;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return await this.catsService.update(+id, updateCatDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.catsService.remove(+id);
  }
}
```

### Service cat
```bash
# Create service
$ nest g service cats
```

In `cats.service.ts` add:
```TypeScript
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

```

### Module Cat
To demonstrate this, we'll create the CatsModule.
```bash
$ nest g module cats
```

```typescript
import { Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CatsController } from './cats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cat } from './entities/cat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cat])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```
Above, we defined the CatsModule in the `cats.module.ts file, and moved everything related to this module into the cats directory. The last thing we need to do is import this module into the root module (the AppModule, defined in the app.module.ts file).
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CatsModule } from './cats/cats.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    CatsModule,
    TypeOrmModule.forRoot(),
  ],
  controllers: [AppController],
})
export class AppModule {}

```

## Auth
Authentication is an essential part of most applications. There are many different approaches and strategies to handle authentication. The approach taken for any project depends on its particular application requirements. This chapter presents several approaches to authentication that can be adapted to a variety of different requirements.
[View More](https://docs.nestjs.com/security/authentication)

## Swagger
The OpenAPI specification is a language-agnostic definition format used to describe RESTful APIs. Nest provides a dedicated module which allows generating such a specification by leveraging decorators.
[View More](https://docs.nestjs.com/openapi/introduction)

## Plus Script
Throughout the life span of a project, when we build new features, we often need to add new resources to our application. These resources typically require multiple, repetitive operations that we have to repeat each time we define a new resource.

Let's imagine a real-world scenario, where we need to expose CRUD endpoints for 2 entities, let's say User and Product entities. Following the best practices, for each entity we would have to perform several operations, as follows:

- Generate a module (nest g mo) to keep code organized and establish clear boundaries (grouping related components)
- Generate a controller (nest g co) to define CRUD routes (or queries/mutations for GraphQL applications)
- Generate a service (nest g s) to implement & isolate business logic
- Generate an entity class/interface to represent the resource data shape
- Generate Data Transfer Objects (or inputs for GraphQL applications) to define how the data will be sent over the network

That's a lot of steps!

To help speed up this repetitive process, Nest CLI provides a generator (schematic) that automatically generates all the boilerplate code to help us avoid doing all of this, and make the developer experience much simpler.
```bash
$ nest g res cats

? What transport layer do you use? REST API
? Would you like to generate CRUD entry points? Yes
CREATE src/cats/cats.controller.spec.ts (556 bytes)
CREATE src/cats/cats.controller.ts (873 bytes)
CREATE src/cats/cats.module.ts (240 bytes)
CREATE src/cats/cats.service.spec.ts (446 bytes)
CREATE src/cats/cats.service.ts (595 bytes)
CREATE src/cats/dto/create-cat.dto.ts (29 bytes)
CREATE src/cats/dto/update-cat.dto.ts (165 bytes)
CREATE src/cats/entities/cat.entity.ts (20 bytes)
UPDATE package.json (2029 bytes)
UPDATE src/app.module.ts (357 bytes)
√ Packages installed successfully.

```

## Support

[Luis Eduardo Altino da Silva Sobrinho](mailto:ads.luis.sobrinho@gmail.com)

## License

Nest is [MIT licensed](LICENSE).
