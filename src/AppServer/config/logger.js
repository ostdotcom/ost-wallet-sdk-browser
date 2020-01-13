/**
 PLEASE,
 If you have opened this file by accident, close it now.
 Do not commit this file without proper code review.
 Make sure to include Akshay in code review.
 */

const CONSOLE_SCOPE = global;
const originalConsole = console;
const _console = Object.assign({}, originalConsole);

const buildCustomMethod = ( methodName ) => {
	return (...args) => {
		let _postfix = "\t\t\t|Ost-Pepo|" + methodName;
		let consoleArgs = [...args, _postfix];
		let method = _console[methodName]
		if ( typeof method !== 'function') {
			return;
		}
		_console[methodName](...consoleArgs);
	};
}

let allowedMethods = [];
if ( process.env.NODE_ENV === 'production'  ) {
	allowedMethods = [
		"warn",
		"info"
	];

} else {
	allowedMethods = [
		"debug",
		"log",
		"warn",
		"info",
		"time",
		"timeEnd"
	];
}

const emptyFn = () => {
	//Do nothing. Just Ignore it.
};

(() => {
	//1. Make the allowed methods
	let newConsole = {};
	let len = allowedMethods.length;
	let mName;
	while( len-- ) {
		mName = allowedMethods[len];
		newConsole[mName] = buildCustomMethod(mName);
	}

	//2. Supress all other console methods.
	for(mName in _console) {
		if ( typeof _console[ mName ] !== 'function') {
			continue;
		}
		if ( newConsole.hasOwnProperty( mName ) ) {
			continue;
		}
		newConsole[ mName ] = emptyFn;
	}

	CONSOLE_SCOPE.console = newConsole;
})();
