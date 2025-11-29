/**
 * 날짜 포맷팅 유틸리티
 */

export function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (locale === "ko") {
    return `${year}년 ${month}월 ${day}일`;
  } else if (locale === "ja") {
    return `${year}年${month}月${day}日`;
  } else {
    // en
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

export function formatYear(dateString: string): number {
  return new Date(dateString).getFullYear();
}




