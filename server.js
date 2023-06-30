import express from 'express';
import bodyParser from 'body-parser';
import config from './db/config.js';
import routes from './routes/routes.js';
import jsonwebtoken from 'jsonwebtoken';
import cors from 'cors';

const app = express()

app.use(bodyParser.json());
//setup cors
app.use(cors());

//JWT setup
app.use((req, res, next) => {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        console.log(req.user);
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], `${process.env.JWT_SECRET}`, (err, decode) => {
            if (err) req.user = undefined;
            req.user = decode;
            next();
        });
    } else {
        req.user = undefined;
        next();
    }
});

// my-routes
routes(app);

app.get('/', (req, res) => {
    res.send("Hello Welcome online learning platform!");
});

app.listen(config.port || 8080 , () => {
    console.log("Server is running");
});