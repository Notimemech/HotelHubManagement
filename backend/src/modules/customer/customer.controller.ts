import { CustomerService } from './customer.service';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateCustomerDto } from './dto/createCustomer.dto';
import { UpdateCustomerDto } from './dto/updateCustomer.dto';

@Controller('customer')
export class CustomerController {
    constructor(
       private readonly customerService: CustomerService
    ){}

    @Get()
    findAll(){
        return this.customerService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id : number){
        return this.customerService.findById(id);
    }

    @Post()
    create(
        @Body() createCustomer : CreateCustomerDto
    ){
        return this.customerService.create(createCustomer);
    }

    @Put(':id')
    update(
        @Param('id') id: number,
        @Body() updateCustomer : UpdateCustomerDto
    ){
        return this.customerService.update(id, updateCustomer)
    }

    @Delete(':id')
    delete(
        @Param('id') id: number
    ){
        return this.customerService.delete(id);
    }

}
