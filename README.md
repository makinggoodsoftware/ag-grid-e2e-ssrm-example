
# ag-Grid end-to-end Server-Side Demo

  

This Demo uses **NodeJS + Express, mySQL and Typescript** to perform server-side operations. It implements many of ag-Grid's features, including:

- Row Grouping
- Aggregation
- Filter
- Sorting

## Prerequisites

You will need to have [mySQL](https://dev.mysql.com/downloads/shell/) installed on your machine.

For an easy set up, with walkthrough instructions here - you can use homebrew.

[https://brew.sh/](https://brew.sh/)

`brew install mysql`

Once this has complete, you will be prompted with some configuration options.

Run the following

`mysql_secure_installation`

You will now be prompted to set a password for the root user. The default configuration for this repo will try to connect with user 'root', and password 'password'. You can change these in the code later or use the same configuration.

A few more prompts will be made. The options you select are up to you, although you should select **YES** on the following: 

`Reload privilege tables now? (Press y|Y for Yes, any other key for No)`

## Usage

Once you have installed mySQL, you will need to create and populate the sample database on your local machine. In your terminal, run the following commands

```
mysql -u root -p
// You may be prompted for password here

CREATE DATABASE sample_data;
```
Now your database should be prepared, ready for population.
Navigate to the root of the project, and run

````
mysql -u root -p -D sample_data < ./data/olympic_winners.sql
````  

Your `sample_data` database will have an "olympic_winners" table created, and populated with the data provided by `~/data/olympic_winners.sql` .

To install dependencies, run 

`yarn install`

Now you should configure your mySQL credentials for the application to connect.

In `~/server/olympicWinnersService.ts`, input your mySQL username and password in the following (line: 3)

```
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'rootadmin123'
});
```

### Dev environment

`yarn dev`

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