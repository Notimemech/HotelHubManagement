import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import {Customer} from './entity/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
    ){}

    findAll(): Promise<Customer[]> {
        return this.customerRepository.find();
    }

    findOne(id:number): Promise<Customer|null>{
        return this.customerRepository.findOneBy({id});
    }
}
