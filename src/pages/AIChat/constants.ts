// src/data/initialMessage.ts
export type Message = {
    role: 'user' | 'assistant';
    content: string;
    code?: string;
};

export const initialMessage: Message = {
    role: 'assistant',
    content: `Here's an explanation of JavaScript Promises with examples:
  
  1. Basic Promise usage with .then(), .catch(), and .finally()
  2. Promise.all for handling multiple promises concurrently
  3. Promise.race for getting the first resolved promise
  
  The code demonstrates asynchronous operations using setTimeout to simulate delays.`,
    code: `// Simulating an asynchronous operation using setTimeout
  function fetchData(success) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (success) {
          const data = { id: 1, name: "Example Data" };
          resolve(data); // Promise is fulfilled with the data
        } else {
          const error = new Error("Failed to fetch data");
          reject(error); // Promise is rejected with an error
        }
      }, 1500); // Simulate a 1.5 second delay
    });
  }
  
  // Using the fetchData function
  console.log("Fetching data...");
  
  fetchData(true) // Simulate a successful fetch
    .then(data => {
      console.log("Data fetched successfully:", data);
      return data.name; // Passing the data to the next .then()
    })
    .then(name => {
        console.log("Data name:", name);
        return "Processed " + name;
    })
    .then(processedName => {
        console.log("Processed Name:", processedName)
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    })
    .finally(() => {
      console.log("Fetch operation complete."); // Runs regardless of success or failure
    });
  
  fetchData(false) // Simulate a failed fetch
    .then(data => {
      console.log("This will not be printed because the promise will reject");
    })
    .catch(error => {
      console.error("Error fetching data (second attempt):", error);
    })
    .finally(() => {
      console.log("Second fetch operation complete."); // Runs regardless of success or failure
    });
  
  // Example using Promise.all
  function createPromise(value, delay) {
      return new Promise(resolve => {
          setTimeout(() => {
              resolve(value);
          }, delay);
      });
  }
  
  const promise1 = createPromise("Promise 1", 500);
  const promise2 = createPromise("Promise 2", 1000);
  const promise3 = createPromise("Promise 3", 250);
  
  Promise.all([promise1, promise2, promise3])
      .then(results => {
          console.log("All promises resolved:", results); // Results will be an array of the resolved values
      })
      .catch(error => {
          console.error("One or more promises rejected:", error);
      });
  
  // Example using Promise.race
  const promiseFast = new Promise(resolve => setTimeout(() => resolve("Fast!"), 100));
  const promiseSlow = new Promise(resolve => setTimeout(() => resolve("Slow!"), 500));
  
  Promise.race([promiseFast, promiseSlow])
    .then(result => {
      console.log("Race winner:", result); // Output will be "Fast!"
    });`
};