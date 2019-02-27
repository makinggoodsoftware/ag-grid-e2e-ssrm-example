import * as webpack from 'webpack';
import * as webpackMiddleware from 'webpack-dev-middleware';
import * as webpackConfig from '../webpack.config.js';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';

import OlympicWinnersService from './services/olympicWinnersService';

const app = express();

if(process.env.NODE_ENV === 'development') {
    app.use(webpackMiddleware(webpack(webpackConfig)));
} else {
    app.use(express.static(__dirname + '/public'));
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/olympicWinners', function (req: Request, res: Response) {
    OlympicWinnersService.getRows(req.body, (rows: any[], lastRow: number, query: string) => {
        res.json({rows: rows, lastRow: lastRow, query: query});
    });
});

app.post('/olympicWinners/new', function (req: Request, res: Response) {
    OlympicWinnersService.addRow(req.body, () => {
        res.status(200).send();
    });
});

app.listen(process.env.PORT || 4000, () => {
    console.log('Started on localhost:4000');
});