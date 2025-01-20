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