import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const { email, password, empresa } = createUserDto;

    const existingUser = await this.usersRepository.findOneBy({ email: email });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = this.usersRepository.create({
      email: email,
      password: hashedPassword,
      empresa: empresa
    });

    await this.usersRepository.save(newUser);

    delete newUser.password;
    return newUser;
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: email })
      .addSelect('user.password')
      .getOne();
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
