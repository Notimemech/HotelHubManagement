import { UpdateCustomerDto } from './dto/updateCustomer.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {Customer} from './entity/customer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCustomerDto } from './dto/createCustomer.dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class CustomerService {
    constructor(
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
    ){}

    async findAll(): Promise<Customer[]> {
        return await this.customerRepository.find();
    }

    async findById(customer_id : number): Promise<Customer|null>{
        const customer = await this.customerRepository.findOneBy({customer_id});

        if(!customer){
            throw new NotFoundException("Not found id");
        }

        return customer;
    }

    async create(createCustomer: CreateCustomerDto): Promise<Customer>{
        const customer = this.customerRepository.create(createCustomer);

        return await this.customerRepository.save(customer);
    }

    async update(customerId: number, updateCustomer :UpdateCustomerDto) : Promise<Customer>{
        const customer = await this.findById(customerId);
        
        if(!customer){
            throw new NotFoundException("Not found id");
        }

        Object.assign(customer, updateCustomer);

        return await this.customerRepository.save(customer);
    }

    async delete(customerId: number): Promise<void>{
        const customer = await this.findById(customerId);
        
        if(!customer){
            throw new NotFoundException("Not found id");
        }

        await this.customerRepository.remove(customer);
    }
}
