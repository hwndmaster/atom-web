export class ApiResponse<TResult> {
    status: number;
    headers: { [key: string]: unknown };
    data: TResult;

    constructor(status: number, headers: { [key: string]: unknown }, data: TResult) {
        this.status = status;
        this.headers = headers;
        this.data = data;
    }
}
