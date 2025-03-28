export const initialCode = `console.log("hello world");`;

export const TestingCode = `
console.log("Starting execution");
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("Inside timeout");
      const success = true;
      if (success) {
        resolve("Data fetched successfully");
      } else {
        reject("Error fetching data");
      }
    }, 500);
  });
}

fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error));
console.log("After fetchData call");
`;