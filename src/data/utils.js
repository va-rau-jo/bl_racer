/**
 * Helper method to check if the three numbers in the two given
 * arrays are the same. (Sets don't work)
 */
confirmNumbers = (a, b) => {
  a.sort();
  b.sort();
  sum1 = a[0] * 100 + a[1] * 10 + a[2];
  sum2 = b[0] * 100 + b[1] * 10 + b[2];
  console.log(sum1);
  console.log(sum2);
  return sum1 === sum2;
}

module.exports = {
  checkAnswer: function(answer, nums) {
    let result = 0;
    const n1 = parseInt(answer[0]);
    const n2 = parseInt(answer[2]);
    const n3 = parseInt(answer[4]);
    console.log("here2");
    if (!confirmNumbers([n1, n2, n3], nums))
      return false;
    console.log("here3");

    if (answer[1] === '+') {
      result = n1 + n2;
    } else if (answer[1] === '-') {
      result = n1 - n2;
    } else if (answer[1] === '*') {
      result = n1 * n2;
    } else if (answer[1] === '/') {
      if (n2 === 0) // divide by zero
        return false;
      result = n1 / n2;
    } else {
      return false; // not an operation
    }
    console.log("result 1: " + result);

    if (answer[3] === '+') {
      result += n3;
    } else if (answer[3] === '-') {
      result -= n3;
    } else if (answer[3] === '*') {
      result *= n3;
    } else if (answer[3] === '/') {
      if (n3 === 0) // divide by zero
        return false;
      result /= n3;
    } else {
      return false; // not an operation
    }
    console.log("answer: " + answer);
    console.log("result2 : " + result);
    return result % 10 === 0;
  }
}
