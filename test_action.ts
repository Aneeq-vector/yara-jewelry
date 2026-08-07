import { getAllOrdersAction } from './src/app/actions/orders';
async function test() {
  const res = await getAllOrdersAction();
  console.log(res);
}
test();
