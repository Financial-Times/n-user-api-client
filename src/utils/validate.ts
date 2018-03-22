export const validateOptions = (opts, dataOption, stringOpts = []) => {
	if (!opts)
			throw new Error('Options not supplied');
	let invalidOptions = [];
	stringOpts.forEach(stringOpt => {
			if (typeof opts[stringOpt] !== 'string')
					invalidOptions.push(stringOpt);
	});
	if (dataOption && typeof opts[dataOption] !== 'object')
			invalidOptions.push(dataOption);
	if (invalidOptions.length)
			throw new Error(`Invalid option(s): ${invalidOptions.join(', ')}`);
};
