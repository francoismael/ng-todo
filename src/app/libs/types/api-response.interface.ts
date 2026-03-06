export interface ApiResponse<T> {
    data: T;
    meta: {
        timestamp: string;
    };
    error: {
        code: string;
        message: string;
        details: string[];
    } | null;
}
