
# ag-Grid end-to-end Server-Side Demo

  

This Demo uses **NodeJS + Express, mySQL and Typescript** to perform server-side operations. It implements many of ag-Grid's features, including:

- Row Grouping
- Aggregation
- Filter
- Sorting

## Prerequisites

You will need to have [mySQL](https://dev.mysql.com/downloads/shell/) installed on your machine.

For an easy set up on a mac, you can use homebrew.

[https://brew.sh/](https://brew.sh/)

`brew install mysql`

Once this is complete, you will need to turn on the mySQL service.

`brew services start mysql`

after this, run the following command:

`mysql_secure_installation`

You will now be prompted to set a password for the root user. The default configuration for this repo will try to connect with user 'root', and password 'password'. You can change these in the code later or use the same configuration.

A few more prompts will be made. The options you select are up to you, although you should select **YES** on the following: 

`Reload privilege tables now? (Press y|Y for Yes, any other key for No)`

## Usage

Once you have installed mySQL, you will need to create and populate the sample database on your local machine. In your terminal, run the following commands:

```
mysql -u root -p
// You will be prompted for your password here
```

Next, you will need to reconfigure the the authentication method used for the root (or any other) MySQL account with the following code: 

```
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
```
Note that if you used a different account to root, you can change the `'root'`, `'localhost'` & `'password'` accordingly. 

Following this, run:

```
FLUSH PRIVILEGES;
```
to complete the process. 

Next you will need to create a database to hold the data which will be used by our grid: 

```
CREATE DATABASE sample_data;
```

Now your database should be prepared, ready for population.
Exit MySQL (control+d) and go to the root directory of the project, then run:

```
mysql -u root -p -D sample_data < ./data/olympic_winners.sql
``` 

Your `sample_data` database will have an "olympic_winners" table created, and populated with the data provided by `~/data/olympic_winners.sql` .

In this tutorial we will assume that you do not have yarn installed globally, so we will install it locally and run it accordingly:

`npm i yarn`

then run 
`./node_modules/yarn/bin/yarn`

Now you should configure your mySQL credentials for the application to connect.

In `~/server/services/olympicWinnersService.ts`, input your mySQL username and password in the following (line: 4)

```
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'rootadmin123'
});
```

### Dev environment

`./node_modules/yarn/bin/yarn dev`

Navigate to http://localhost:4000 to view the project.

### Debugging in VSCode

The repository comes with a preconfigured debug configuration for VSCode. You can find this in `~/.vscode/launch.json`

The debugger will run `~/server/server.ts` using nodemon and ts-node.

On the event you change a file, the task will rebuild both server and client. The debugger should remain attached.

This will allow you to set breakpoints on the server-side Typescript in VSCode.

### Production environment

```
// Compiles server Typescript to ~/dist
// Webpack bundles front-end to ~/dist/public
yarn build

// Run ~/dist/server.js
yarn start
```
 Navigate to http://localhost:4000 to view the project.
