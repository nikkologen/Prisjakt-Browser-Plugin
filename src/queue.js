(() => {
  globalThis.PJLow.createQueue = (limit = 4) => {
    let active = 0; const pending = [];
    function next() {
      while (active < limit && pending.length) {
        const {task,resolve,reject} = pending.shift(); active++;
        Promise.resolve().then(task).then(resolve,reject).finally(() => {active--; next();});
      }
    }
    return task => new Promise((resolve,reject) => {pending.push({task,resolve,reject}); next();});
  };
})();
