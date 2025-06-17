// Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER

function sum_to_n_a(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

function sum_to_n_b(n) {
  return (n * (n + 1)) / 2;
}

function sum_to_n_c(n) {
  const numbers = Array.from({ length: n }, (_, index) => index + 1);
  return numbers.reduce((acc, number) => acc + number, 0);
}

const INTEGER = 5;
console.log(sum_to_n_a(INTEGER));
console.log(sum_to_n_b(INTEGER));
console.log(sum_to_n_c(INTEGER));
