require('dotenv').config()
const express = require('express')
const adminRouter = require('./routes/admin.routes')
const PORT =  process.env.PORT;
console.log(PORT)


const app = express()

app.use(express.json())
//app.use('/api', customerRouter)
//app.use('/admin', adminRouter)
app.use('/api', adminRouter)





app.listen(PORT, '0.0.0.0', ()=>console.log(PORT, `Server started on port ${PORT}`))





// const express = require('express');
// const cors = require('cors');
// const app = express();

// app.use(cors());

// app.get('/api/number', (req, res) => {
//     const randomNumber = Math.floor(Math.random() * 100);
//     res.json({ number: randomNumber });
// });

// const PORT = 3001;
// app.listen(PORT, () => {
//     console.log(`Backend server running on port ${PORT}`);
// });