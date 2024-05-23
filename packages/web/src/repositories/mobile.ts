const mobileUaRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export class MobileRepository {
  static isMobile(): boolean {
    return window.navigator.userAgent.search(mobileUaRegex) !== -1;
  }
}
