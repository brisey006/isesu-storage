import express, { Application, Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { ResponseError } from './interfaces';
import router from './routes';

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8082;

app.use(morgan('dev'));
app.use(cors());
app.use(fileUpload({
    createParentPath: true
}));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));
app.use((req: Request, res: Response, next: NextFunction) => {
    app.locals.publicDir = path.join(__dirname, '../public');
    next();
});

app.use('/', router);

app.use((req: Request, res: Response, next: NextFunction) => {
    const error: ResponseError = new Error(JSON.stringify(['Not Found.']));
    error.status = 404;
    next(error);
});

app.use((error: ResponseError, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status || 500);
    res.json({ errors: error.message });
});

app.listen(port, () => {
    console.log(`Server started at port ${port}.`);
});