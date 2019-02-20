import * as mysql from 'mysql';
import * as util from 'util';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootadmin123'
});

const query = util.promisify(connection.query).bind(connection);

class OlympicWinnersService {

    getData(request, resultsCallback) {

        if (this.isDoingPivot(request)) {
            this.getPivotData(request, resultsCallback);
        } else {
            const SQL = this.buildSql(request);
    
            connection.query(SQL, (error, results) => {
                const rowCount = this.getRowCount(request, results);
                const resultsForPage = this.cutResultsToPageSize(request, results);

                resultsCallback(resultsForPage, rowCount, SQL);
            });    
        }
        
    }

    async getUniqueValueMap(pivotCols) {
        /* create uniqueValues (via DISTINCT query) for each pivot column 
            eg: {
                'year': [2008, 2009, 2010],
                'sport': ["Swimming", "Gym", "Skating"],
                'age': [20, 21, 22]
            } 
        */
        const uniqueValues = {};
        for(let i = 0; i < pivotCols.length; i++) {
            const id = pivotCols[i].id;
            const sql = 'select DISTINCT ' + id + ' FROM sample_data.olympic_winners;';
            const res = await query(sql);
            uniqueValues[id] = res.map(r => r[id]);
        }
        return uniqueValues;
    }

    async getUniquePivotCombos(pivotCols) {
        const uniqueMap = await this.getUniqueValueMap(pivotCols);

        // START HERE
        let pivotCombinations = [];
        pivotCols.forEach((col, colIndex) => {
            if (pivotCombinations.length === 0) {
                // first set of values
                pivotCombinations = uniqueMap[col.id].map(v => v.toString());
            } else {
                uniqueMap[col.id].forEach(val => {
                    const temp = [];
                    pivotCombinations.forEach(com => {
                        temp.push(com + '|' + val);
                    });
                    pivotCombinations = temp;
                });
            }
        });
    }

    async getPivotData(request, resultsCallback) {
        const pivotCols = request.pivotCols;
        const valueCols = request.valueCols;

        const queryCombinations = await this.getUniquePivotCombos(pivotCols);
        
        console.log(queryCombinations);
        /* query for values (valueCols) by each combination of (pivotCols)
            example output: {
                '2008|Swimming|20|gold': 10, '2008|Swimming|21|gold': 10,
                '2008|Gymnastics|20|gold': 11, '2008|Gymnastics|21|gold': 11,
                ... and so on
            } 
        */
        // const query = 'select sum(gold) as "2008|swimming|gold" WHERE year = 2008 AND '
    }

    buildSql(request) {

        const selectSql = this.createSelectSql(request);
        const fromSql = ' FROM sample_data.olympic_winners ';
        const whereSql = this.createWhereSql(request);
        const limitSql = this.createLimitSql(request);

        const orderBySql = this.createOrderBySql(request);
        const groupBySql = this.createGroupBySql(request);

        const SQL = selectSql + fromSql + whereSql + groupBySql + orderBySql + limitSql;

        console.log(SQL);

        return SQL;
    }

    createSelectSql(request) {
        const rowGroupCols = request.rowGroupCols;
        const valueCols = request.valueCols;
        const groupKeys = request.groupKeys;

        if (this.isDoingGrouping(rowGroupCols, groupKeys)) {
            const colsToSelect = [];

            const rowGroupCol = rowGroupCols[groupKeys.length];
            colsToSelect.push(rowGroupCol.field);

            valueCols.forEach(function (valueCol) {
                colsToSelect.push(valueCol.aggFunc + '(' + valueCol.field + ') as ' + valueCol.field);
            });

            return ' select ' + colsToSelect.join(', ');
        }

        return ' select *';
    }

    createFilterSql(key, item) {
        switch (item.filterType) {
            case 'text':
                return this.createTextFilterSql(key, item);
            case 'number':
                return this.createNumberFilterSql(key, item);
            default:
                console.log('unkonwn filter type: ' + item.filterType);
        }
    }

    createNumberFilterSql(key, item) {
        switch (item.type) {
            case 'equals':
                return key + ' = ' + item.filter;
            case 'notEqual':
                return key + ' != ' + item.filter;
            case 'greaterThan':
                return key + ' > ' + item.filter;
            case 'greaterThanOrEqual':
                return key + ' >= ' + item.filter;
            case 'lessThan':
                return key + ' < ' + item.filter;
            case 'lessThanOrEqual':
                return key + ' <= ' + item.filter;
            case 'inRange':
                return '(' + key + ' >= ' + item.filter + ' and ' + key + ' <= ' + item.filterTo + ')';
            default:
                console.log('unknown number filter type: ' + item.type);
                return 'true';
        }
    }

    createTextFilterSql(key, item) {
        switch (item.type) {
            case 'equals':
                return key + ' = "' + item.filter + '"';
            case 'notEqual':
                return key + ' != "' + item.filter + '"';
            case 'contains':
                return key + ' like "%' + item.filter + '%"';
            case 'notContains':
                return key + ' not like "%' + item.filter + '%"';
            case 'startsWith':
                return key + ' like "' + item.filter + '%"';
            case 'endsWith':
                return key + ' like "%' + item.filter + '"';
            default:
                console.log('unknown text filter type: ' + item.type);
                return 'true';
        }
    }

    createWhereSql(request) {
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;
        const filterModel = request.filterModel;

        const that = this;
        const whereParts = [];

        if (groupKeys.length > 0) {
            groupKeys.forEach(function (key, index) {
                const colName = rowGroupCols[index].field;
                whereParts.push(colName + ' = "' + key + '"')
            });
        }

        if (filterModel) {
            const keySet = Object.keys(filterModel);
            keySet.forEach(function (key) {
                const item = filterModel[key];
                whereParts.push(that.createFilterSql(key, item));
            });
        }

        if (whereParts.length > 0) {
            return ' where ' + whereParts.join(' and ');
        } else {
            return '';
        }
    }

    createGroupBySql(request) {
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;

        if (this.isDoingGrouping(rowGroupCols, groupKeys)) {
            const colsToGroupBy = [];

            const rowGroupCol = rowGroupCols[groupKeys.length];
            colsToGroupBy.push(rowGroupCol.field);

            return ' group by ' + colsToGroupBy.join(', ');
        } else {
            // select all columns
            return '';
        }
    }

    createOrderBySql(request) {
        const rowGroupCols = request.rowGroupCols;
        const groupKeys = request.groupKeys;
        const sortModel = request.sortModel;

        const grouping = this.isDoingGrouping(rowGroupCols, groupKeys);

        const sortParts = [];
        if (sortModel) {

            const groupColIds =
                rowGroupCols.map(groupCol => groupCol.id)
                    .slice(0, groupKeys.length + 1);

            sortModel.forEach(function (item) {
                if (grouping && groupColIds.indexOf(item.colId) < 0) {
                    // ignore
                } else {
                    sortParts.push(item.colId + ' ' + item.sort);
                }
            });
        }

        if (sortParts.length > 0) {
            return ' order by ' + sortParts.join(', ');
        } else {
            return '';
        }
    }

    isDoingGrouping(rowGroupCols, groupKeys) {
        // we are not doing grouping if at the lowest level. we are at the lowest level
        // if we are grouping by more columns than we have keys for (that means the user
        // has not expanded a lowest level group, OR we are not grouping at all).
        return rowGroupCols.length > groupKeys.length;
    }

    isDoingPivot(request) {
        const valueCols = request.valueCols;
        const pivotCols = request.pivotCols;
        const pivotMode = request.pivotMode;
        return pivotMode && pivotCols.length > 0 && valueCols.length > 0;
    }

    createLimitSql(request) {
        const startRow = request.startRow;
        const endRow = request.endRow;
        const pageSize = endRow - startRow;
        return ' limit ' + (pageSize + 1) + ' offset ' + startRow;
    }

    getRowCount(request, results) {
        if (results === null || results === undefined || results.length === 0) {
            return null;
        }
        const currentLastRow = request.startRow + results.length;
        return currentLastRow <= request.endRow ? currentLastRow : -1;
    }

    cutResultsToPageSize(request, results) {
        const pageSize = request.endRow - request.startRow;
        if (results && results.length > pageSize) {
            return results.splice(0, pageSize);
        } else {
            return results;
        }
    }
}

export default new OlympicWinnersService();