function limitConcurrency(items, worker, max = 6) {
  return new Promise((resolve) => {
    const results = new Array(items.length);
    let idx = 0,
      active = 0;
    function next() {
      while (active < max && idx < items.length) {
        const i = idx++,
          item = items[i];
        active++;
        Promise.resolve(worker(item, i))
          .then((r) => {
            results[i] = r;
          })
          .catch(() => {
            results[i] = null;
          })
          .finally(() => {
            active--;
            if (idx >= items.length && active === 0) resolve(results);
            else next();
          });
      }
    }
    next();
  });
}

export { limitConcurrency };
