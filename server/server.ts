import * as webpack from 'webpack';
import * as webpackMiddleware from 'webpack-dev-middleware';
import * as webpackConfig from '../webpack.config.js';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';

import OlympicWinnersService from './olympicWinnersService';

const app = express();

if(process.env.NODE_ENV === 'development') {
    app.use(webpackMiddleware(webpack(webpackConfig)));
} else {
    app.use(express.static(__dirname + '/public'));
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/olympicWinners', function (req: Request, res: Response) {
    OlympicWinnersService.getData(req.body, (rows: any[], lastRow: number, query: string) => {
        res.json({rows: rows, lastRow: lastRow, query: query});
    });
});

app.listen(4000, () => {
    console.log('Started on localhost:4000');
});