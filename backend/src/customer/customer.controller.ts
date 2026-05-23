import { CustomerService } from './customer.service';
import { Controller, Get } from '@nestjs/common';

@Controller('customer')
export class CustomerController {
    constructor(
       private readonly customerService: CustomerService
    ){}

    @Get()
    findAll(){
        return this,this.customerService.findAll();
    }
}
