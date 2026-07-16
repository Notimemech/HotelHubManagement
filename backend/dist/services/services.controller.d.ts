import { ServicesService } from './services.service';
import { RequestServiceDto } from './dto/request-service.dto';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findAll(): Promise<import("./entities/service.entity").Service[]>;
    requestService(req: any, dto: RequestServiceDto): Promise<{
        message: string;
        TotalPrice: number;
    }>;
}
