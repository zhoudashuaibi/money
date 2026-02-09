// 统一 API 响应格式
export class ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;

  static ok<T>(data: T, message = 'success'): ApiResponse<T> {
    const res = new ApiResponse<T>();
    res.code = 0;
    res.message = message;
    res.data = data;
    res.timestamp = new Date().toISOString();
    return res;
  }

  static fail(message: string, code = -1): ApiResponse<null> {
    const res = new ApiResponse<null>();
    res.code = code;
    res.message = message;
    res.data = null;
    res.timestamp = new Date().toISOString();
    return res;
  }
}
