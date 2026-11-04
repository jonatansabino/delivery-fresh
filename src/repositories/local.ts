import type { AppState, Order, Customer } from "@/data/demo";
import type { Meal, Plan } from "@/lib/menu";
import type { Address, Coupon } from "@/types/models";
export interface Repository<T> {
  list(): T[];
  get(id: string): T | undefined;
  save(value: T): boolean;
  remove(id: string): boolean;
}
export interface ProductRepository extends Repository<Meal> {
  findActive(): Meal[];
}
export interface OrderRepository extends Repository<Order> {
  byStatus(status: Order["status"]): Order[];
}
export interface CustomerRepository extends Repository<Customer> {
  byPhone(phone: string): Customer | undefined;
}
export interface PlanRepository extends Repository<Plan> {
  findActive(): Plan[];
}
export interface AddressRepository extends Repository<Address> {
  primary(): Address | undefined;
}
export interface CouponRepository extends Repository<Coupon> {
  findActive(): Coupon[];
}
export type Commit = (change: (state: AppState) => AppState) => boolean;
function local<T>(
  read: () => T[],
  write: (items: T[]) => boolean,
  key: (value: T) => string,
): Repository<T> {
  return {
    list: read,
    get: (id) => read().find((x) => key(x) === id),
    save: (value) => write([...read().filter((x) => key(x) !== key(value)), value]),
    remove: (id) => write(read().filter((x) => key(x) !== id)),
  };
}
export function createLocalRepositories(read: () => AppState, commit: Commit) {
  return {
    products: {
      ...local(
        () => read().meals,
        (meals) => commit((s) => ({ ...s, meals })),
        (m) => m.id,
      ),
      findActive: () => read().meals.filter((m) => m.active !== false),
    } satisfies ProductRepository,
    orders: {
      ...local(
        () => read().orders,
        (orders) => commit((s) => ({ ...s, orders })),
        (o) => o.id,
      ),
      byStatus: (status: Order["status"]) => read().orders.filter((o) => o.status === status),
    } satisfies OrderRepository,
    customers: {
      ...local(
        () => read().customers,
        (customers) => commit((s) => ({ ...s, customers })),
        (c) => c.id,
      ),
      byPhone: (phone: string) =>
        read().customers.find((c) => c.phone.replace(/\D/g, "") === phone.replace(/\D/g, "")),
    } satisfies CustomerRepository,
    plans: {
      ...local(
        () => read().plans,
        (plans) => commit((s) => ({ ...s, plans })),
        (p) => p.id,
      ),
      findActive: () => read().plans.filter((p) => p.active !== false),
    } satisfies PlanRepository,
    addresses: {
      ...local(
        () => read().addressBook,
        (addressBook) => commit((s) => ({ ...s, addressBook })),
        (a) => a.id,
      ),
      primary: () => read().addressBook.find((a) => a.primary),
    } satisfies AddressRepository,
    coupons: {
      ...local(
        () => read().coupons,
        (coupons) => commit((s) => ({ ...s, coupons })),
        (c) => c.code,
      ),
      findActive: () => read().coupons.filter((c) => c.active),
    } satisfies CouponRepository,
  };
}
