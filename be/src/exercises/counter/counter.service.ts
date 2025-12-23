import { Injectable } from '@nestjs/common';

/**
 * Service quản lý số lượng users đang online
 * Lưu trữ state của counter trong memory (sẽ reset khi server restart)
 */
@Injectable()
export class CounterService {
  // Biến lưu số lượng clients đang connected
  private onlineCount: number = 0;

  /**
   * Tăng counter khi có client mới connect
   * @returns Số lượng clients sau khi tăng
   */
  incrementCount(): number {
    this.onlineCount++;
    return this.onlineCount;
  }

  /**
   * Giảm counter khi có client disconnect
   * Có check để đảm bảo không bao giờ < 0
   * @returns Số lượng clients sau khi giảm
   */
  decrementCount(): number {
    if (this.onlineCount > 0) {
      this.onlineCount--;
    }
    return this.onlineCount;
  }

  /**
   * Lấy số lượng clients hiện tại
   */
  getCount(): number {
    return this.onlineCount;
  }
}
