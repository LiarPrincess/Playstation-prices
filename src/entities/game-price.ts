// todo: don't use number for prices
export default interface GamePrice {
  readonly current: number;
  readonly regular: number;
  readonly lowest: number | 'Free';
  readonly endDate?: Date;
}
