import { ApiProperty } from '@nestjs/swagger';

export class SuccessfulResponse<T> {
    @ApiProperty()
    status: number = 200;

    @ApiProperty()
    message: string = 'success';

    @ApiProperty()
    data: T;

    constructor(data: T) {
        this.data = data;
    }
}
