"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack = require("webpack");
const webpackMiddleware = require("webpack-dev-middleware");
const webpackConfig = require("../webpack.config.js");
const express = require("express");
const bodyParser = require("body-parser");
const olympicWinnersService_1 = require("./services/olympicWinnersService");
const app = express();
if (process.env.NODE_ENV === 'development') {
    app.use(webpackMiddleware(webpack(webpackConfig)));
}
else {
    app.use(express.static(__dirname + '/public'));
}
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.post('/olympicWinners', function (req, res) {
    olympicWinnersService_1.default.getRows(req.body, (rows, lastRow, query) => {
        res.json({ rows: rows, lastRow: lastRow, query: query });
    });
});
app.post('/olympicWinners/new', function (req, res) {
    olympicWinnersService_1.default.addRow(req.body, () => {
        res.status(200).send();
    });
});
app.listen(4000, () => {
    console.log('Started on localhost:4000');
});
//# sourceMappingURL=server.js.map