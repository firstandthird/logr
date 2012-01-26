#Logr

[logr](https://github.com/jgallen23/logr) is a lightweight, but extensible, logging and debugging library for node.js.	The main difference between logr and most of the other logging libraries is that you can pass in a module name and section name to easily view and filter your logs by module.

![logr](https://raw.github.com/jgallen23/logr/master/docs/assets/logr1.png)
(screenshot)

##Installation

Install via npm

	npm install logr

##Basic Usage

app.js

	var lg = require('logr')('app');

	lg.info('init');

model.js

	var lg = require('logr')('app', 'model');

	lg.info('init');

output:

![logr](https://raw.github.com/jgallen23/logr/master/docs/assets/logr1.png)

###Default Log Levels

	levels: [
		'EMERGENCY',
		'CRITICAL',
		'ERROR',
		'WARN',
		'NOTICE',
		'INFO',
		'DEBUG'
	]

Based on the log levels, you can call lg.notice or lg.warn, etc.

##Adaptors

###Console

By default the console adaptor is enabled, but if you want more control over the output you can do something like this:

	var lg = require('logr')('app', { console: false });

	//this will use the console adaptor for only INFO level logs
	lg.use(lg.adaptors.console({
		color: false,
		timestamp: false
	}, 'INFO');

###Future

Currently, only the console adaptor is build into the core library, but more adaptors are coming soon:

- Mail
- Boxcar
- MongoDB

##Advanced Usage

###Options

In your root app file you can pass some options on to logr.	Currently here are the options that you can pass when you first initialize logr

	var lg = require('logr')('app', {
		console: false, //disables console adaptor (global for all instances)
		filter: ['app', 'module1'], //will only log those modules (global for all instances)
		levels: [ //can define custom levels (specific to this instance of lg)
			'TEST1',
			'TEST2'
		]
	});

###Custom Adaptors

Creating a custom adaptor is very easy.	
	
	var lg = require('logr')('app');

	lg.use(function(module, section, level, message, data){}, {level filter}, {module filter}, {section filter});

Here's an example:

	lg.use(function(module, section, level, message, data) {
		console.error('FIX THIS NOW: ' + message);
	}, 'ERROR', 'app');

This will fire on all lg.error calls in the app module

![logr](https://raw.github.com/jgallen23/logr/master/docs/assets/logr2.png)

###Filtering

Logr lets you apply module filters across all instances, so that you can easily debug specific modules.	

	var lg = require('logr')('app');
	lg.filter(['app', 'module1']);

Now only app and module1 log calls will passed on to your adaptors.	This is great for debugging a specific module without distraction from other log calls.

###Filtering with enviornment variables 

In addition to the filter call, you can also use enviornment vars like so:

	$ LOGR=app node app.js

This is the same as doing lg.filter('app') in your code.

##Future
- More adaptors
- Colored levels 
- Easy way to pass options to default console adaptor
