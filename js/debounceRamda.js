/**
 * https://gist.github.com/tommmyy/daf61103d6022cd23d74c71b0e8adc0d
 * 
 * Debounce
 *
 * @param {Boolean} immediate If true run `fn` at the start of the timeout
 * @param  timeMs {Number} Debounce timeout
 * @param  fn {Function} Function to debounce
 *
 * @return {Number} timeout
 * @example
 *
 *		const say = (x) => console.log(x)
 *		const debouncedSay = debounce_(false, 1000, say)();
 *
 *		debouncedSay("1")
 *		debouncedSay("2")
 *		debouncedSay("3")
 *
 */
const debounce_ = R.curry((immediate, timeMs, fn) => () => {
	let timeout;

	return (...args) => {
		const later = () => {
			timeout = null;

			if (!immediate) {
				R.apply(fn, args);
			}
		};

		const callNow = immediate && !timeout;
    console.info('hello', callNow)
		clearTimeout(timeout);
		timeout = setTimeout(later, timeMs);

		if (callNow) {
			R.apply(fn, args);
		}

		return timeout;
	};
});

const debounceImmediate = debounce_(true);

const debounce = debounce_(false);