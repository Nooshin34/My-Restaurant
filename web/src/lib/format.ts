const orderStatusLabels: Record<string, string> = {
  Pending: "در انتظار",
  Preparing: "در حال آماده‌سازی",
  Ready: "آماده",
  Completed: "تحویل شده",
  Cancelled: "لغو شده",
};

const reservationStatusLabels: Record<string, string> = {
  Pending: "در انتظار",
  Confirmed: "تأیید شده",
  Cancelled: "لغو شده",
};

export function formatPrice(value: number) {
  return `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function orderStatusLabel(status: string) {
  return orderStatusLabels[status] ?? status;
}

export function reservationStatusLabel(status: string) {
  return reservationStatusLabels[status] ?? status;
}

export const orderStatuses = Object.keys(orderStatusLabels);
export const reservationStatuses = Object.keys(reservationStatusLabels);
