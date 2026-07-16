import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHotelInfo(): {
        name: string;
        address: string;
        phone: string;
        email: string;
        description: string;
    };
}
