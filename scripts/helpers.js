newId = (len = 4) => {
   const c='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   let o='';
   for (let i = 0; i < len; i++ )
      {
         const r = Math.floor(Math.random() * c.length);
         o += c[r];
      }
   return o;
}

getRandomNElements = (arr, n) => {
   let result = new Array(n),
       len = arr.length,
       taken = new Array(len);
   if (n > len) n = len;
   while (n--) {
      const x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
   }
   return result;
}